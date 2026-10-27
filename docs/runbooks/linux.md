# Linux setup

## Text input tools

TypeVocal types or pastes through an external tool when one is installed and falls back to enigo otherwise, which works poorly on Wayland.

| Display server | Tool      | Install                                                                         |
| -------------- | --------- | ------------------------------------------------------------------------------- |
| X11            | `xdotool` | `sudo apt install xdotool`                                                      |
| Wayland        | `wtype`   | `sudo apt install wtype`                                                        |
| Both           | `dotool`  | `sudo apt install dotool`, then `sudo usermod -aG input $USER` and log in again |

Ubuntu 26.04 GNOME Wayland needs `ydotool` instead; see [ubuntu-26-04-gnome-wayland.md](ubuntu-26-04-gnome-wayland.md).

## Runtime library

The app links `gtk-layer-shell`. If startup fails with `libgtk-layer-shell.so.0` missing, install `libgtk-layer-shell0` (Debian/Ubuntu) or `gtk-layer-shell` (Fedora, Arch).

## Recording overlay

The overlay is off by default on Linux (**Settings > Advanced > Overlay Position: None**) because some compositors give it focus, and the paste then lands in the wrong window. Turn on **Audio Feedback** for an audible recording cue instead.

## Global shortcuts on Wayland

Wayland apps cannot grab global keys, so bind a key in your desktop to a [CLI command](cli.md):

| Desktop    | Where                                                                  | Command or line                                              |
| ---------- | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| GNOME      | Settings > Keyboard > Keyboard Shortcuts > Custom Shortcuts            | `typevocal --toggle-transcription`                           |
| KDE Plasma | System Settings > Shortcuts > Custom Shortcuts > New > Global Shortcut | `typevocal --toggle-transcription`                           |
| Sway / i3  | `~/.config/sway/config` or `~/.config/i3/config`                       | `bindsym $mod+o exec pkill -USR2 -n typevocal`               |
| Hyprland   | `~/.config/hypr/hyprland.conf`                                         | `bind = $mainMod, O, exec, typevocal --toggle-transcription` |

For post-processing, bind `typevocal --toggle-post-process`. Remove any old `pkill -USR1` binding; that signal belongs to WebKitGTK and can crash the app.

Startup crashes and overlay problems are in [troubleshooting.md](troubleshooting.md#linux).
