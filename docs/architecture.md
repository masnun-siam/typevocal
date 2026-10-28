# Architecture

Covers: src/, src-tauri/, index.html, vite.config.ts

TypeVocal is one Tauri 2 desktop process (Rust backend + React webviews) plus a short-lived inference worker process. Everything runs on the user's machine; the network is used only for model downloads, update checks and optional LLM post-processing.

## Components

```mermaid
flowchart LR
  subgraph App["typevocal process"]
    UI["Main window<br/>React (src/)"]
    OV["Overlay window<br/>src/overlay/"]
    BE["Rust backend<br/>src-tauri/src/"]
    UI <-->|"commands (src/bindings.ts)<br/>events"| BE
    OV <-->|events| BE
  end
  W["Inference worker<br/>same binary, worker flag<br/>engine_supervisor/"]
  BE <-->|"framed protocol<br/>stdin/stdout"| W
  BE --> FS[("App data dir<br/>settings_store.json, history.db,<br/>recordings/, models/, logs")]
  BE --> HF[("Hugging Face cache")]
  BE -.->|HTTPS| NET["blob.handy.computer / Hugging Face<br/>GitHub releases (updater)<br/>LLM provider (optional)"]
  CLI["2nd launch with --toggle-* flags<br/>or SIGUSR2"] -->|single-instance plugin / signal| BE
```

| Component              | Where                                      | Doc                                              |
| ---------------------- | ------------------------------------------ | ------------------------------------------------ |
| Frontend (main window) | `src/`                                     | [frontend.md](frontend.md)                       |
| Overlay window         | `src/overlay/`, `src-tauri/src/overlay.rs` | [tray and overlay](features/tray-and-overlay.md) |
| Backend                | `src-tauri/src/`                           | [backend.md](backend.md)                         |
| Inference worker       | `src-tauri/src/engine_supervisor/`         | [worker.md](worker.md)                           |

## How the parts talk

- **Frontend → backend:** Tauri commands, called only through the generated `src/bindings.ts` (tauri-specta). Most return `Result<T, string>`.
- **Backend → frontend:** Tauri events. A few are typed in `bindings.ts`; most are raw `listen("name")` with payload types in `src/lib/types/events.ts`.
- **Backend → worker:** `EngineSupervisor` spawns the app binary in worker mode and exchanges framed messages; a worker crash or hang is recovered, with a CPU-only retry. Only transcribe-cpp (whisper-family) inference runs there.
- **Other instances:** `tauri_plugin_single_instance` forwards a second launch's CLI flags to the running app; Unix signals go through `signal_handle.rs`. See [CLI and remote control](features/cli-and-remote-control.md).

## Data

| Store    | Location                                                          | Owner                                                  |
| -------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| Settings | `settings_store.json` via `tauri-plugin-store`                    | `settings.rs` → [settings](features/settings.md)       |
| History  | `history.db` (SQLite, rusqlite) + `recordings/*.wav`              | `managers/history.rs` → [history](features/history.md) |
| Models   | `models/` in the app data dir, plus the shared Hugging Face cache | `managers/model.rs` → [models](features/models.md)     |
| Logs     | `typevocal.log` in the log dir (`tauri-plugin-log`)               | `lib.rs`                                               |

The app data dir is Tauri's `app_data_dir` for `com.masnunsiam.typevocal`, or a `Data/` folder next to the executable in [portable mode](features/portable-mode.md); always resolve it with `portable::app_data_dir`.

## Main flow: dictation

```mermaid
sequenceDiagram
  participant K as Shortcut / CLI / signal
  participant C as TranscriptionCoordinator + actions.rs
  participant A as AudioRecordingManager + VAD
  participant T as TranscriptionManager
  participant W as Worker or ONNX engine
  participant P as LLM post-processing (optional)
  participant O as Paste (clipboard / typing)
  K->>C: start / stop
  C->>A: record
  A-->>C: samples (16 kHz)
  C->>T: transcribe
  T->>W: inference
  W-->>T: text (streamed)
  T-->>C: text
  C->>P: post-process if enabled
  C->>O: output to focused app
  C->>C: save to history
```

Details: [recording and transcription](features/recording-and-transcription.md), [paste and text output](features/paste-and-text-output.md), [post-processing](features/post-processing.md).

## Other features

[Onboarding and permissions](features/onboarding-and-permissions.md) · [Updates and release notes](features/updates-and-release-notes.md) · [Tray and overlay](features/tray-and-overlay.md) · [Portable mode](features/portable-mode.md)
