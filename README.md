# TypeVocal

**A free, open source speech-to-text app that works offline.**

Press a shortcut, speak, and your words are typed into whatever app has focus. Audio is transcribed on your own computer with local Whisper and Parakeet models. TypeVocal runs on macOS, Windows and Linux.

TypeVocal is a fork of [Handy](https://github.com/cjpais/Handy) by CJ Pais, used under the MIT license (see [LICENSE](LICENSE)).

## Upgrading

If you used Handy before:

1. **It is a separate app.** Everyone needs a manual fresh install, including users of earlier TypeVocal builds, which cannot update into this one.
2. **No data carries over.** Settings, history and recordings start empty.
3. **Models are shared through the Hugging Face cache.** Models downloaded from Hugging Face live in the shared Hugging Face cache (`~/.cache/huggingface/hub`), so they are visible to Handy and other tools, and deleting one in either app removes it for all.
4. **macOS permissions must be re-granted.** Grant microphone and accessibility again. macOS builds are ad-hoc signed, so Gatekeeper warns on first launch and the permissions reset after every update.
5. **Both apps may react to the same shortcut.** If Handy is also running, quit Handy or change one app's shortcut.
6. **Remove the old login item by hand.** The Handy login item is not removed for you.
7. **Environment variables were renamed** from `HANDY_*` to `TYPEVOCAL_*`, and the old names are ignored. For example, `HANDY_DISABLE_UPDATER` no longer disables the updater; use `TYPEVOCAL_DISABLE_UPDATER`.

## Install

1. Download the latest build from the [releases page](https://github.com/masnun-siam/typevocal/releases).
   - **Debian/Ubuntu:** install the `.deb` with APT so its dependencies come with it: `sudo apt install ./TypeVocal_*.deb`.
2. Launch TypeVocal and grant microphone and accessibility permissions.
3. Pick a model and a shortcut in Settings, then hold or tap the shortcut and speak.

Usage beyond the basics (CLI flags, Linux setup, troubleshooting) is in the [docs index](#docs) below.

## Develop

Prerequisites: [Rust](https://rustup.rs/) (stable), [Bun](https://bun.sh/), and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for your OS. Platform packages (Vulkan SDK, CMake, Linux libraries) are listed in [BUILD.md](BUILD.md).

```bash
git clone https://github.com/masnun-siam/typevocal.git
cd typevocal
bun install
bun run tauri dev    # macOS with a CMake error: CMAKE_POLICY_VERSION_MINIMUM=3.5 bun run tauri dev
```

The first run compiles the Rust backend and takes several minutes. `bun run dev` starts only the Vite frontend, without the native backend.

Checks CI runs on pull requests (run them before pushing):

| Area     | Command                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------ |
| Frontend | `bun run lint`, `bun run format:check`, `bun run test:keyboard`, `bun run test:playwright`             |
| Content  | `bun run check:translations`, `bun run check:model-languages`                                          |
| Backend  | `cd src-tauri && cargo test` (formatting is part of `bun run format:check`)                            |
| Nix      | `.github/workflows/nix-check.yml` builds the flake package when `flake.nix`, `.nix/` or sources change |

## Troubleshooting

### Keyboard Shortcuts Stop Working on macOS (Secure Input)

If TypeVocal shows a Secure Input warning, or the shortcut recorder reports that it is blocked, macOS Secure Input is on and key events never reach TypeVocal. Common causes: a focused password field in any app, Terminal's **Secure Keyboard Entry**, or a `loginwindow` process stuck holding Secure Input after a lock screen.

1. If the warning names an app, switch to it, leave the password field, or quit it.
2. If Terminal is the culprit, turn off **Terminal > Secure Keyboard Entry**.
3. If no app is named, lock and unlock your Mac. If shortcuts still do not work, log out and back in.

Everything else is in [docs/runbooks/troubleshooting.md](docs/runbooks/troubleshooting.md).

## Docs

| Topic                                             | Where                                                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| CLI flags, signals, debug mode                    | [docs/runbooks/cli.md](docs/runbooks/cli.md)                                                     |
| Linux setup (text input tools, Wayland shortcuts) | [docs/runbooks/linux.md](docs/runbooks/linux.md)                                                 |
| Ubuntu 26.04 GNOME Wayland                        | [docs/runbooks/ubuntu-26-04-gnome-wayland.md](docs/runbooks/ubuntu-26-04-gnome-wayland.md)       |
| Troubleshooting, manual and custom model install  | [docs/runbooks/troubleshooting.md](docs/runbooks/troubleshooting.md)                             |
| Verify release signatures                         | [docs/runbooks/verify-release-signatures.md](docs/runbooks/verify-release-signatures.md)         |
| Building from source per platform                 | [BUILD.md](BUILD.md)                                                                             |
| Frontend and backend conventions                  | [docs/guides/](docs/guides/)                                                                     |
| Contributing, translations                        | [CONTRIBUTING.md](CONTRIBUTING.md), [CONTRIBUTING_TRANSLATIONS.md](CONTRIBUTING_TRANSLATIONS.md) |

## License

MIT, see [LICENSE](LICENSE). Speech recognition builds on OpenAI Whisper, ggml, Silero VAD and Tauri.
