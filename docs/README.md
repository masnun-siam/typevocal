# Docs index

Covers: docs/

Synced to: 7430c88 (2026-10-28)

Written for agents and developers about to change the code. Start with architecture, then the doc for the area you touch. Rules live in the root `CLAUDE.md`.

## Code

| Doc                                | Read when                                                              |
| ---------------------------------- | ---------------------------------------------------------------------- |
| [architecture.md](architecture.md) | First: components, how they talk, where data lives, the dictation flow |
| [development.md](development.md)   | Running, testing, hooks, CI jobs and build gotchas                     |
| [backend.md](backend.md)           | Changing `src-tauri/`: module map, managers, startup, build script     |
| [worker.md](worker.md)             | Touching inference, the worker process or its protocol                 |
| [frontend.md](frontend.md)         | Changing `src/`: entry points, app shell, stores, component map        |

## Features

| Doc                                                                       | Read when                                                     |
| ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| [recording-and-transcription.md](features/recording-and-transcription.md) | Shortcuts, recording, VAD, transcription, Secure Input        |
| [paste-and-text-output.md](features/paste-and-text-output.md)             | How text reaches the focused app; paste methods per OS        |
| [models.md](features/models.md)                                           | Model catalog, download, discovery, loading                   |
| [history.md](features/history.md)                                         | History database, recordings, history UI                      |
| [post-processing.md](features/post-processing.md)                         | LLM providers, Apple Intelligence, prompts                    |
| [settings.md](features/settings.md)                                       | Adding or changing a setting end to end                       |
| [tray-and-overlay.md](features/tray-and-overlay.md)                       | Tray menu and icons, recording overlay, autostart             |
| [updates-and-release-notes.md](features/updates-and-release-notes.md)     | Updater, What's New, release and build workflows              |
| [cli-and-remote-control.md](features/cli-and-remote-control.md)           | CLI flags, single-instance forwarding, signals, headless mode |
| [onboarding-and-permissions.md](features/onboarding-and-permissions.md)   | First run, macOS permissions                                  |
| [portable-mode.md](features/portable-mode.md)                             | Windows portable install and data location                    |

## Written by people

| Folder                 | Holds                                                                                                                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [guides/](guides/)     | [Frontend](guides/frontend-conventions.md) and [backend](guides/backend-conventions.md) conventions                                                                                                                                          |
| [runbooks/](runbooks/) | User-facing how-tos: [CLI](runbooks/cli.md), [Linux](runbooks/linux.md), [troubleshooting](runbooks/troubleshooting.md), [Ubuntu 26.04](runbooks/ubuntu-26-04-gnome-wayland.md), [release signatures](runbooks/verify-release-signatures.md) |
| [prds/](prds/)         | Product requirements (`/create-prd`)                                                                                                                                                                                                         |
