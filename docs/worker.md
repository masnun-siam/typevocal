# Inference worker process

Covers: src-tauri/src/engine_supervisor/\*\*, src-tauri/src/main.rs, src-tauri/src/managers/transcription.rs

## Why

All transcribe.cpp native code (backend init, device listing, model load, inference, streaming) runs in a child process: the TypeVocal executable re-launched with `--transcribe-worker`. A GPU driver fault, `GGML_ASSERT` abort or hang kills only the worker; the app survives and recovers. ONNX models (`transcribe-rs`: Parakeet, Moonshine, SenseVoice, ...) still run in-process in `TranscriptionManager` (`OnnxEngine`) and do not use the worker.

## Files

| File                              | Role                                                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `engine_supervisor/mod.rs`        | Constants `WORKER_FLAG` (`--transcribe-worker`), `CPU_ONLY_FLAG` (`--cpu-only`); `is_worker_invocation()`, `run_worker()`; re-exports |
| `engine_supervisor/supervisor.rs` | Parent side: `EngineSupervisor` (cheap to clone), `Owner` thread, `Worker` handle, deadlines, failure handling                        |
| `engine_supervisor/worker.rs`     | Child side: `run()` request loop, `load()`, `serve_stream()`, logger, fault injection                                                 |
| `engine_supervisor/protocol.rs`   | `Request`, `Response`, `DeviceSelector`, `DeviceInfo`, `LoadedInfo`, frame encode/decode                                              |

## How `main.rs` detects a worker

`main()` sets platform env first (Linux DMABUF, Windows Vulkan layers) so the worker inherits it, then checks `engine_supervisor::is_worker_invocation()` (first CLI arg == `--transcribe-worker`). If true it calls `run_worker()` and `process::exit`s: no clap parsing, Tauri or single-instance handling.

## Process model

- One owner thread (`transcribe-engine`) works a command queue (`Load`, `Unload`, `Transcribe`, `StreamBegin`, `Feed`, `Finalize`, `StreamReset`). It holds the only worker slot plus the `LoadSpec`, so at most one model worker exists. A second short-lived, model-less worker may run for device probes (`EngineSupervisor::devices()` runs on the caller's thread).
- The worker lives exactly as long as its model; unload closes its stdin, waits `SHUTDOWN_GRACE` (2 s), then kills it.
- The spec outlives the process: after a crash, hang or cancel, the next call starts a fresh worker and reloads the model (`ensure_worker`).
- Worker exe: `std::env::current_exe()` (Linux: `/proc/self/exe`). On unix the launched exe's dev/inode is recorded at startup; if the file was replaced, spawn fails with "restart TypeVocal".
- Worker side: stdout is dup'd for the protocol and fd 1 redirected to stderr (ggml prints to stdout). A reader thread exits the process via `_exit` on stdin EOF, even if the main loop is hung. SIGUSR1/SIGUSR2 are ignored; Linux process name is `TypeVocal-worker`.
- Worker stderr is drained by the parent; lines prefixed `\x01LEVEL\ttarget\tmessage` are re-logged under target `transcribe_worker`, the last 64 raw lines are kept for crash reports.

## Protocol

Strict request/response over the worker's stdin/stdout, one `Response` per `Request`. Frame: `[u32 json_len][json][u32 pcm_len][pcm f32 LE]`, lengths little-endian, each section capped at 1 GiB (about 1 hour of 16 kHz f32 audio). JSON, not bincode, so NaN confidences round-trip.

| Request                          | Response                               | Notes                                                                    |
| -------------------------------- | -------------------------------------- | ------------------------------------------------------------------------ |
| `Hello { list_devices }`         | `Hello { devices }`                    | First call to every worker; error if no compute device registered        |
| `Load { path, backend, device }` | `Loaded(LoadedInfo)`                   | Frees previous model first; `LoadedInfo.on_gpu` drives recovery policy   |
| `Run { options }` + PCM          | `Transcript`                           | Batch                                                                    |
| `StreamBegin`                    | `Ok`, then stream loop                 | While a stream is active only `Feed`/`Finalize`/`StreamReset` are served |
| `Feed` + PCM                     | `Fed { update, text? }`                | `text` only when committed/tentative text changed                        |
| `Finalize { want_language }`     | `Finalized { update, text, language }` | Ends the stream even on error                                            |
| `StreamReset`                    | `Ok`                                   |                                                                          |

`DeviceSelector`: `Auto`, `Key(String)` (persisted device identity from `device_key`, falls back to auto if gone), `Index(usize)` (`--device-index`, pinned). There is no cancel message: cancel kills the process.

## Lifecycle and recovery

```mermaid
sequenceDiagram
    participant TM as TranscriptionManager
    participant EO as EngineSupervisor owner thread
    participant W as worker process
    TM->>EO: load(LoadSpec)
    EO->>W: spawn (--transcribe-worker [--cpu-only])
    EO->>W: Hello (list devices if GPU worker)
    W-->>EO: Hello (devices)
    EO->>W: Load
    W-->>EO: Loaded(LoadedInfo)
    TM->>EO: transcribe(pcm) / start_stream
    EO->>W: Run + PCM  (or StreamBegin, Feed..., Finalize)
    alt worker crashed or hung on GPU
        EO->>EO: kill, mark GPU unavailable
        EO->>W: fresh CPU-only worker, Hello, Load, Run (retry once)
        W-->>EO: Transcript
    else cancel()
        TM->>EO: cancel() bypasses queue
        EO->>W: kill; next use respawns + reloads
        EO-->>TM: Err(Cancelled)
    end
    EO-->>TM: Transcript
    TM->>EO: unload()
    EO->>W: close stdin, exit within 2 s or kill
```

- **Deadlines** (`Deadlines`, `supervisor.rs`): hello 60 s, load 180 s (a slow load is not a hang), stream begin/reset 30 s. Decode work: `max(floor, audio_secs * factor)`. GPU: feed/finalize floor 30 s, run floor 60 s, factor 10. CPU: 120 s, 300 s, factor 20. Missing a deadline kills the worker (`Failure::Hung`).
- **Retry rules** (`Owner::transcribe`): one retry in a fresh worker after crash/hang. No retry after a hang on CPU, or for a pinned device (`DeviceSelector::Index`): those errors surface.
- **CPU-only fallback**: when a GPU worker is lost (init, listing, load or inference), `Shared::gpu_unavailable` is set; later workers get `LoadSpec::cpu()` and `--cpu-only` (registers only CPU backends via `init_backends_with(.., BackendMask::CPU)`, so no GPU driver code runs). Cleared by `retry_gpu()`, which `TranscriptionManager` calls when the accelerator or GPU device setting changes. A worker is also CPU-only when the spec asks for `Backend::Cpu` or the host forbids GPU (`gpu_allowed = false`: Windows x64 binary emulated on ARM64, `utils::is_windows_x64_emulated_on_arm64`).
- **Streams**: `start_stream(run, stream, on_progress)` returns a `StreamHandle`; feeds are queued, `on_progress` runs on the owner thread and must not call back into the supervisor. A lost stream is never respawned mid-way: `finalize()` returns `Ok(None)` and the caller falls back to batch. Dropping the handle resets the stream.
- **Cancel**: `cancel()` bumps `cancel_epoch`, takes the in-flight call and kills its worker. Work queued before the bump returns `EngineError::Cancelled`. Model loads are never cancelled. `TranscriptionManager::cancel_transcription` calls it.
- **Unload**: `unload()` marks the model unloaded at once and returns `Unloading`; `.wait()` blocks until exit (used before deleting model files).

## How `managers/transcription.rs` uses it

- `TranscriptionManager.engine: EngineSupervisor`, created in `new()` with `gpu_allowed = !transcribe_gpu_disabled_for_host()`.
- `load_model_with_device`: builds `LoadSpec` (device index -> `Index`; saved GPU device key -> `Key`; else `select_transcribe_backend(accelerator)` + `Auto`), calls `engine.load`, then `ModelManager::set_runtime_capabilities` from `LoadedInfo.capabilities`.
- `transcribe` -> `engine.transcribe`; on non-cancel failure `forget_model_if_engine_dropped`. Streaming uses `engine.loaded()` capabilities to decide stream vs batch; ONNX engines always batch.
- Device list for UI/CLI: `report_compute_devices`, `get_available_accelerators`, `describe_compute_devices` via `engine.devices()`; pre-warmed on a background thread in `lib.rs setup`.
- `request_unload`/`unload_model` call `engine.unload()` (idle timeout, tray unload); app quit does nothing special (worker exits on stdin EOF).

## Env vars

| Name                                         | Read by                     | Purpose                                                                       |
| -------------------------------------------- | --------------------------- | ----------------------------------------------------------------------------- |
| `TYPEVOCAL_TRANSCRIBE_WORKER_LOG`            | worker `init_logger`        | Log level; parent sets it to `log::max_level()` at spawn (default Info)       |
| `TYPEVOCAL_WORKER_FAULT`                     | worker, debug builds        | `<abort\|segv\|hang>@<init\|list\|load\|run\|feed\|finalize>` fault injection |
| `TYPEVOCAL_WORKER_FAULT_ONCE`                | worker, debug builds        | Marker file path: fire only in the first worker to reach the stage            |
| `TYPEVOCAL_WORKER_FAULT_GPU_ONLY`            | worker, debug builds        | Fire only when on GPU (init/list count as GPU unless `--cpu-only`)            |
| `TYPEVOCAL_TRANSCRIBE_WORKER_EXE`            | `Worker::spawn`, tests only | Path of built app binary (the test harness is not the worker)                 |
| `TYPEVOCAL_TEST_MODEL`, `TYPEVOCAL_TEST_WAV` | ignored tests               | GGUF model and 16 kHz mono WAV                                                |

`inject_fault` is compiled out of release builds. Other `TYPEVOCAL_*` rules: [guides/backend-conventions.md](guides/backend-conventions.md).

## Tests

- Always run (`cargo test --lib`): protocol round-trip/truncation/limit/`device_key` format (`protocol.rs`), `Deadlines` and `ms_to_samples` unit tests, rebrand guards (`mod.rs`, `supervisor.rs`).
- Real-worker tests in `supervisor.rs` `mod tests` are `#[ignore]` (crash, hang, cancel, unload, GPU-only fault, pinned device, one-worker-at-a-time). Need a debug build:
  `TYPEVOCAL_TRANSCRIBE_WORKER_EXE=target/debug/typevocal TYPEVOCAL_TEST_MODEL=<gguf> TYPEVOCAL_TEST_WAV=<wav> cargo test --lib engine_supervisor -- --ignored --nocapture --test-threads=1`
- Under `cfg(test)`, `Worker::spawn` panics unless `TYPEVOCAL_TRANSCRIBE_WORKER_EXE` is set.
