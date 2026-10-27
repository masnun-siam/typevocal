# TypeVocal — Agent Constitution

This file is the constitution for every AI agent working in this repository.

- **Protected.** Never edit, rewrite, shorten or remove any part of this file unless a human explicitly asks for that change, and confirm with them before writing.
- **Wins conflicts.** If a doc, skill or prompt contradicts this file, this file wins.
- **Single source.** This is the only `CLAUDE.md` in the repo; never add another. `AGENTS.md` is a symlink to it.
- **Stays short.** Detail belongs in the references below, not here. Keep this file under about 60 lines.

## Project

TypeVocal is a cross-platform desktop speech-to-text app (macOS, Windows, Linux), a fork of Handy by CJ Pais. Audio is transcribed locally; models download from `blob.handy.computer`, updates come from this repo's GitHub releases, and optional LLM post-processing calls a user-configured provider.

## Architecture

| Component        | Path                               | Tech                                                     | Role                                                                   |
| ---------------- | ---------------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| Frontend         | `src/`                             | React 18, TypeScript, Vite, Tailwind 4, Zustand, i18next | Settings window, onboarding, recording overlay (`src/overlay/`)        |
| Backend          | `src-tauri/`                       | Rust, Tauri 2                                            | Recording, VAD, shortcuts, paste, settings, model management           |
| Inference worker | `src-tauri/src/engine_supervisor/` | transcribe-cpp, transcribe-rs                            | Runs inference in a child process so a GPU fault kills only the worker |
| History          | —                                  | SQLite (rusqlite)                                        | Transcription history                                                  |

## Principles

1. **Branching.** Never commit or push to `main`, the base branch. Work on a branch and open a PR into `main`.
2. **Gates.** Never bypass checks: no `--no-verify`, no lint or type suppressions, no weakening of pre-commit or CI.
3. **i18n.** Every user-facing string goes through i18next with its key in `src/i18n/locales/en/translation.json`; ESLint enforces it.
4. **Generated code.** Never hand-edit `src/bindings.ts`; debug builds regenerate it from the Rust commands (`src-tauri/src/lib.rs`).
5. **Secrets.** Never commit or log credentials, signing keys, API keys or user transcripts.
6. **Scope.** Change only what the task asks. No drive-by refactors, dependency upgrades or new patterns without a human agreeing.
7. **Releases.** Never run release or signing workflows, or publish builds.
8. **Docs.** PRDs live in `docs/prds/`. Do not commit other plans, specs or generated docs unless a human asks.
9. **Read first.** Before working in an area, open its reference below. Do not invent conventions that are not written down; follow the surrounding code.

## Commands

| Task                              | Command                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| Install                           | `bun install`                                                 |
| Run the app                       | `bun run tauri dev`                                           |
| Frontend lint, format, type check | `bun run lint`, `bun run format:check`, `bunx tsc --noEmit`   |
| Frontend tests                    | `bun run test:keyboard`, `bun run test:playwright`            |
| Translations and model catalog    | `bun run check:translations`, `bun run check:model-languages` |
| Backend tests                     | `cd src-tauri && cargo test`                                  |

## References

Open these on demand; only list files that exist.

| Need                         | Where                                             |
| ---------------------------- | ------------------------------------------------- |
| Workflow, gates, code review | the ai-workflow plugin's `guides/`                |
| Platform build setup         | `BUILD.md`                                        |
| Contributing, translations   | `CONTRIBUTING.md`, `CONTRIBUTING_TRANSLATIONS.md` |
| Scripts and test targets     | `package.json`                                    |
| CI checks                    | `.github/workflows/`                              |
| Commit gates                 | `.pre-commit-config.yaml`                         |
