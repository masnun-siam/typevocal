# Frontend conventions

Rules for changing `src/` (React 18, TypeScript, Vite, Tailwind 4, Zustand, i18next in a Tauri 2 webview), each confirmed in the code.

## Layout: where new things go

| Thing                                                                                    | Location                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A single setting control                                                                 | `src/components/settings/<Name>.tsx`, re-exported from `src/components/settings/index.ts`                                                                                                          |
| A settings page/section                                                                  | `src/components/settings/<section>/<Section>Settings.tsx` (`general`, `advanced`, `history`, `models`, `post-processing`, `about`, `debug`)                                                        |
| Reusable primitive (Dropdown, Slider, ToggleSwitch, `SettingContainer`, `SettingsGroup`) | `src/components/ui/`, re-exported from `ui/index.ts` (not complete: `Button`, `Input`, `Alert`, `Badge` are imported by path)                                                                      |
| Cross-feature widget                                                                     | `src/components/shared/`                                                                                                                                                                           |
| Feature folder (model-selector, onboarding, update-checker, whats-new, footer)           | `src/components/<feature>/` with an `index.ts` barrel                                                                                                                                              |
| Hook                                                                                     | `src/hooks/` (`useSettings.ts`, `useOsType.ts`)                                                                                                                                                    |
| Global state                                                                             | `src/stores/` (`settingsStore.ts`, `modelStore.ts`)                                                                                                                                                |
| Pure helpers                                                                             | `src/lib/utils/` (with sibling `*.test.ts`); event payload types in `src/lib/types/events.ts`. Stray `src/utils/dateFormat.ts` exists; prefer `lib/utils`                                          |
| Recording overlay                                                                        | Separate webview: `src/overlay/` (`index.html`, `main.tsx`, `RecordingOverlay.tsx`); second Vite entry in `vite.config.ts`. It must set its own theme and import `@/i18n` (`src/overlay/main.tsx`) |
| Styles / tokens                                                                          | `src/App.css` (Tailwind import, `@theme inline`), `src/styles/theme.css` (palette variables)                                                                                                       |

Sub-folder `PostProcessingSettingsApi/` shows the pattern for a complex setting: `index.tsx`, small field components, `types.ts`, and a `use...State.ts` hook.

## Components

- Typed as `export const Name: React.FC<NameProps> = ...` with a local `interface NameProps` above it: 103 of 114 `.tsx` files (e.g. `src/components/ui/ToggleSwitch.tsx`). Follow it.
- Named exports are the norm (88 files in `components/`). Default exports exist in about 24 files (`Footer`, `Badge`, `ProgressBar`, icons, `Onboarding`, `ModelSelector`, `UpdateChecker`, `RecordingOverlay`, `App`); barrels re-export them (`export { default } from "./Footer"`). For a new component use a named export.
- Setting components wrap in `React.memo` (34 files) and take `descriptionMode` / `grouped` props passed through to `SettingContainer` (`src/components/settings/AutoSubmit.tsx`).
- `interface` for props and object shapes (116 uses), `type` for unions/aliases (69). Both are used; no "prefer interface" rule exists.
- Imports: `@/` alias for `bindings`, `i18n`, `lib/*` (43 files); relative paths for sibling and `../ui`, `../../hooks` (105 files). Alias is set in `vite.config.ts` and `tsconfig.json`.
- Icons: `lucide-react` or `src/components/icons/`. Class strings are plain template literals; there is no `clsx`/`cn` helper.
- Errors: wrap risky subtrees in `src/components/ErrorBoundary.tsx` (`context` prop, used in `App.tsx`).

## State and backend calls

- `src/bindings.ts` is generated by tauri-specta ("Do not edit this file manually"). Change Rust commands/events/types, regenerate, never hand-edit. Import `commands`, `events` and types from `@/bindings`.
- Commands return `Result<T, string>`: check `result.status === "ok"` / `"error"` (see `src/stores/modelStore.ts`). Do not call `invoke` directly.
- Components read and write settings through `useSettings()` (`src/hooks/useSettings.ts`), a thin wrapper over `useSettingsStore` (`src/stores/settingsStore.ts`): `getSetting(key)`, `updateSetting(key, value)`, `isUpdating(key)`, `resetSetting`, `updateBinding`.
- Adding a setting: add the field and a `change_*_setting` command in Rust, regenerate bindings, then add an entry to the `settingUpdaters` map in `settingsStore.ts` (a missing entry only logs `No handler for setting`).
- `updateSetting` is optimistic: it writes local state, calls the updater, and on throw restores the original value (`finally` clears `isUpdating`). Updaters turn an `error` Result into a throw so the rollback runs (`vad_backend`, `selected_channel`). `updateBinding` has its own rollback and rethrows.
- Disable controls while `isUpdating(key)` is true.
- Defaults come from Rust (`commands.getDefaultSettings`), not from TS constants.
- Backend to frontend: typed `events.<name>.listen(...)` from bindings where generated (`HistorySettings.tsx`, `RecordingOverlay.tsx`); otherwise `listen<T>("event-name", ...)` from `@tauri-apps/api/event` (`App.tsx`, `modelStore.ts`). Payload types for these live in `src/lib/types/events.ts`. Always call the returned unlisten in the effect cleanup.

## i18n

- All visible text goes through `useTranslation()`; add the key to `src/i18n/locales/en/translation.json` (the reference) and the same key to every other locale.
- `eslint.config.js` enforces `i18next/no-literal-string` with `markupOnly: true`, so it flags JSX text only. Attributes `className, style, type, id, name, key, data-*, aria-*` are exempt. String props like `label=` or `title=` are not checked, so translate them by hand.
- Locales are auto-discovered from `src/i18n/locales/*/translation.json` (`src/i18n/index.ts`); a new language also needs an entry in `src/i18n/languages.ts`.
- Run `bun run check:translations` (`scripts/check-translations.ts`, compares each locale's keys to `en`) and `bun run check:model-languages`. Both run in CI.
- Brand name is TypeVocal; `Handy` remains only in legacy names (`HandyKeysShortcutInput`, `HandyHand`). Rebrand tests under `src/i18n/locales/rebrandLocales*.test.ts` fail on `Handy` in locale text.
- RTL: use logical Tailwind classes (`start-`, `rtl:`), as in `ToggleSwitch.tsx`; direction is set by `src/lib/utils/rtl.ts`.

## Styling

- Tailwind 4 utility classes inline (`@tailwindcss/vite`; there is no `tailwind.config`). No CSS modules; `RecordingOverlay.css` is the only component CSS file.
- Colors are tokens: `text`, `background`, `background-ui`, `logo-primary`, `logo-stroke`, `mid-gray`, `warning`, `error`. They are defined in `src/styles/theme.css` as light/dark pairs and registered as utilities in `src/App.css` (`@theme inline`). Use `bg-background-ui`, `text-mid-gray`; do not add new hex values or `dark:` variants (theme follows `data-theme` and `prefers-color-scheme`; `dark:` appears 7 times).
- Theme switching: `src/lib/utils/theme.ts`.

## Notifications

- `sonner`: `<Toaster>` is mounted once in `src/App.tsx`; call `toast.error(...)` / `toast(...)` from components and stores. Failures otherwise go to `console.error`.

## Tests, lint, format

| Style                                                                                                                                                       | Run                                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `node:assert/strict` script next to the code, no framework (`src/lib/utils/keyboard.test.ts`, `src/content/rebrand.test.ts`, `src/components/**/*.test.ts`) | `bun <file>`; only `bun run test:keyboard` and `bun run test:rebrand` have scripts, and CI runs only `test:keyboard` |
| Playwright smoke test (`tests/app.spec.ts`, `playwright.config.ts`, starts `vite dev` on 1420)                                                              | `bun run test:playwright`                                                                                            |
| `tests/*.check.ts` bun scripts (not matched by Playwright)                                                                                                  | `bun tests/<file>`                                                                                                   |

- No Vitest/Jest. Add a new test as a `*.test.ts` bun assert script and run it by path.
- Before committing: `bun run lint` (ESLint on `src`, i18n rule only), `bun run format:check` (Prettier with `.prettierrc` `endOfLine: lf`, plus `cargo fmt`), `bun run build` (`tsc` type check).
- `zod` is in `package.json` but unused in `src/`; do not introduce schema validation here, types come from `bindings.ts`.
