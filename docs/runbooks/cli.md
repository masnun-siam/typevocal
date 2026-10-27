# CLI, signals and debug mode

Flags are defined in `src-tauri/src/cli.rs`; run `typevocal --help` for the full list. Flags are runtime-only and never change saved settings.

## Control a running instance

A second launch with one of these flags passes it to the running instance and exits.

```bash
typevocal --toggle-transcription    # start or stop recording
typevocal --toggle-post-process     # start or stop recording with post-processing
typevocal --cancel                  # cancel the current operation
```

On Linux and macOS, `pkill -USR2 -n typevocal` also toggles transcription; `pkill` only delivers the signal. Do not bind `SIGUSR1`: WebKitGTK uses it internally and TypeVocal ignores it.

## Startup flags

```bash
typevocal --start-hidden            # no main window, tray icon only
typevocal --no-tray                 # no tray icon; closing the window quits
typevocal --debug                   # verbose (trace) logging
typevocal --start-hidden --no-tray  # combine for autostart
```

On macOS call the binary inside the bundle, for example `/Applications/TypeVocal.app/Contents/MacOS/TypeVocal --toggle-transcription`.

## Headless transcription

```bash
typevocal --list-models                     # model ids (add --json for JSON)
typevocal --list-devices                    # compute devices with indices
typevocal -f clip.wav --model <id> --json   # transcribe a 16 kHz mono WAV and exit
```

`--device-index N` forces a compute device (whisper-family models only) and `--repeat N` reruns for timing. The model must already be installed.

## Debug mode

Press `Cmd+Shift+D` (macOS) or `Ctrl+Shift+D` (Windows, Linux) in the settings window to show the Debug section.
