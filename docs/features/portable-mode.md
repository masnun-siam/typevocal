# Portable Mode

Covers: src-tauri/src/portable.rs, src-tauri/nsis/installer.nsi, src-tauri/tauri.windows.conf.json

Conventions: [backend](../guides/backend-conventions.md). Settings storage: [settings.md](settings.md). Update behaviour for portable builds: [updates-and-release-notes.md](updates-and-release-notes.md). Build setup: [BUILD.md](../../BUILD.md).

## Activation (`portable.rs`)

`portable::init()` is the first thing `lib.rs::run` does after `memory::init_allocator()`, before logging or Tauri. It fills two `OnceLock`s.

| Condition (exe dir = directory of `current_exe`)                                          | Result                                                                                  |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `<exe dir>/portable` exists and its trimmed content starts with `TypeVocal Portable Mode` | Portable                                                                                |
| `portable` exists but is empty or other text, and `<exe dir>/Data/` exists                | Portable; marker rewritten with the magic string (legacy v0.8.0 empty marker migration) |
| `portable` empty or wrong, no `Data/`                                                     | Not portable (e.g. a stray empty file from scoop)                                       |
| Marker text from the upstream product                                                     | Not portable (covered by a test)                                                        |
| No marker                                                                                 | Not portable                                                                            |

When portable, `Data/` is created if missing and `HF_HOME` is set to `Data/huggingface`. The original `HF_HOME` is saved and exposed as `previous_hf_home()`; `managers/model.rs::hf_caches` adds its `hub` dir as a read-only second cache so models downloaded by portable releases before v0.9.6 are still recognised. New downloads go only to the active cache.

## Path helpers: always use these

Direct `app.path().app_data_dir()` / `app_log_dir()` calls bypass portable mode. At this commit the only direct calls are inside `portable.rs`.

| Helper                         | Portable value        | Normal value       | Callers                                                                                                                                        |
| ------------------------------ | --------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `app_data_dir(app)`            | `Data/`               | Tauri app data dir | `commands/mod.rs` (`get_app_dir_path` and others), `managers/history.rs` (`history.db`, `recordings/`), `managers/model.rs` (`models/`)        |
| `app_log_dir(app)`             | `Data/logs`           | Tauri log dir      | `commands/mod.rs` (`get_log_dir_path`, log folder actions)                                                                                     |
| `resolve_app_data(app, rel)`   | `Data/<rel>`          | app data + rel     | `audio_feedback.rs`, `commands/audio.rs` (custom sound files)                                                                                  |
| `store_path(rel)`              | absolute `Data/<rel>` | relative `rel`     | `settings.rs` (both `.store(...)` calls for the settings store)                                                                                |
| `data_dir()` / `is_portable()` | `Some` / true         | `None` / false     | `lib.rs` (log target `Data/logs`, file name `typevocal`; main window `data_directory`), `overlay.rs` (overlay window), `commands::is_portable` |

WebView data (cache, storage) goes to `Data/webview` for the main window (`lib.rs`) and for the overlay window on Windows/Linux (`overlay.rs`; the macOS NSPanel overlay does not set it). `commands::is_portable` is exposed to the frontend as `commands.isPortable()`; `UpdateChecker` uses it to disable in-place updates.

New code that persists files or opens a store must go through these helpers.

## Windows installer (`nsis/installer.nsi`)

Custom NSIS template (`bundle.windows.nsis.template` in `tauri.conf.json`), a fork of Tauri's template. Portable additions are fenced by `; --- PORTABLE MODE ---` comments: keep them when merging upstream template changes.

- Variable `$PortableMode`. Set by the "Choose Install Type" page (`PageInstallType`, skipped for silent, passive and update runs), or by the `/PORTABLE` command-line flag.
- Portable default dir is `$DESKTOP\TypeVocal` (replaces the per-user default; switching back restores `$LOCALAPPDATA\<product>`).
- Portable install writes `$INSTDIR\portable` containing exactly `TypeVocal Portable Mode` and creates `$INSTDIR\Data`. It skips the reinstall page, start menu page, file associations and deep links, uninstaller, registry entries and shortcuts, so there is no uninstaller for a portable install.
- Update runs (`$UpdateMode`) auto-detect portable: marker with the magic string, or an empty marker plus `Data\` present. Keep this in sync with `portable.rs::init` rules.
- Normal uninstall has a "delete app data" checkbox (`$DeleteAppDataCheckboxState`); when ticked and not an update, it removes `$APPDATA\<bundle id>` and `$LOCALAPPDATA\<bundle id>` (`com.masnunsiam.typevocal`). Portable data in `Data\` is untouched by this path since portable has no uninstaller.
- `tauri.windows.conf.json` only adds bundle resources (`resources`, `transcribe-libs`); it is unrelated to portable logic.

## Changing the marker

The magic string lives in two places that must match: `portable.rs` (`is_valid_portable_marker`, legacy upgrade write) and `installer.nsi` (marker write and update detection). Tests in `portable.rs` pin the accepted and rejected forms.
