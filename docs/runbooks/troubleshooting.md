# Troubleshooting

macOS Secure Input (shortcuts stop working) is in the [README](../../README.md#troubleshooting), where the in-app help link points.

## Previous clipboard content is pasted instead of the transcription

The transcription is right in **History** but older clipboard text is inserted. With clipboard paste, TypeVocal restores your previous clipboard after a fixed delay, and a slow receiving app can read the clipboard after that.

1. Open Debug (`Cmd+Shift+D` on macOS, `Ctrl+Shift+D` on Windows and Linux).
2. On macOS and Windows, try **Reliable Paste (Beta)** with a clipboard paste method. It waits for the app to read the clipboard instead of using a fixed delay.
3. Otherwise raise **Paste Delay (After)**, the wait before the clipboard is restored. **Paste Delay (Before)** is the wait before the paste keystroke and fixes a different problem.

## Models: manual install behind a proxy

Models live in `models/` inside the app data directory (shown in **Settings > About**):

| OS      | App data directory                                        |
| ------- | --------------------------------------------------------- |
| macOS   | `~/Library/Application Support/com.masnunsiam.typevocal/` |
| Windows | `%APPDATA%\com.masnunsiam.typevocal\`                     |
| Linux   | `~/.local/share/com.masnunsiam.typevocal/`                |

Portable Windows installs keep their data next to the executable instead.

1. Download a model in a browser, keeping its file name:
   - Whisper Small `https://blob.handy.computer/ggml-small.bin`, Medium `https://blob.handy.computer/whisper-medium-q4_1.bin`, Turbo `https://blob.handy.computer/ggml-large-v3-turbo.bin`, Large `https://blob.handy.computer/ggml-large-v3-q5_0.bin`
   - Parakeet Unified EN 0.6B `https://huggingface.co/handy-computer/parakeet-unified-en-0.6b-gguf/resolve/main/parakeet-unified-en-0.6b-Q8_0.gguf`
2. Put the `.bin` or `.gguf` file directly in `models/` (create it if missing).
3. Restart TypeVocal; the model shows as downloaded in **Settings > Models**.

Models already in the shared Hugging Face cache (`~/.cache/huggingface/hub`) are found without copying.

## Models: custom Whisper models

A Whisper GGML `.bin` file placed in `models/` appears under **Custom Models** after a restart, named after the file (`my-custom-model.bin` becomes "My Custom Model"). Community models are not supported beyond loading.

## Linux

Try these in order when the app crashes at start, never shows a window, or reports a Wayland protocol error:

1. **Install or reinstall `gtk-layer-shell`** (`libgtk-layer-shell0` on Debian/Ubuntu). A missing or broken copy is the most common cause.
2. **Skip GTK layer shell:** `TYPEVOCAL_NO_GTK_LAYER_SHELL=1 typevocal`. The overlay becomes a normal always-on-top window; this helps on KDE Plasma Wayland.

The app already sets `WEBKIT_DISABLE_DMABUF_RENDERER=1` on Linux (`src-tauri/src/main.rs`), so that workaround needs no action. To make a variable permanent, export it in your shell profile or prefix the `.desktop` file: `Exec=env TYPEVOCAL_NO_GTK_LAYER_SHELL=1 typevocal`.

**Empty or bordered overlay on Hyprland / Omarchy:** quit fully and launch a [native install](../../BUILD.md#linux-install-from-source) with `env -u TYPEVOCAL_NO_GTK_LAYER_SHELL GDK_BACKEND=wayland typevocal`. If that works, set `GDK_BACKEND=wayland` in the launcher only. AppImages that force X11 cannot use this.

**Bluetooth headset microphones (macOS):** recording through a Bluetooth headset mic drops playback quality. Keep the headset as output and pick the built-in or another microphone in TypeVocal.

**`fn` / Globe shortcuts (macOS):** they only fire on Apple keyboards; third-party keyboards never send `fn` to the OS. Use standard modifiers on external keyboards.

## Windows: Vulkan overlays and capture tools

TypeVocal tells the Vulkan loader to skip implicit layers (overlay and capture hooks crash it); GPU acceleration stays on and nothing system-wide changes. To keep the layers, for example for GPU debugging tools, quit TypeVocal including the tray icon, then in one PowerShell window:

```powershell
$env:TYPEVOCAL_KEEP_VULKAN_IMPLICIT_LAYERS = "1"
& "$env:ProgramFiles\TypeVocal\typevocal.exe"
```

An existing `VK_LOADER_LAYERS_DISABLE` value is left as you set it.
