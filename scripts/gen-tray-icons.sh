#!/usr/bin/env bash
#
# Regenerate the tray icon PNGs in src-tauri/resources/ from the TypeVocal glyph.
#
# Every icon is 64x64. Naming follows get_icon_path() in src-tauri/src/tray.rs:
#   tray_<state>.png          light glyph, used on a dark taskbar/menu bar
#   tray_<state>_dark.png     dark glyph, used on a light taskbar/menu bar
#   tray_idle_colored.png,
#   recording.png,
#   transcribing.png          full-colour glyph (Linux)
# <state> is idle, recording, transcribing or idle_warning. Recording,
# transcribing and warning are the glyph plus a badge in its bottom-right corner.
#
# Usage: gen-tray-icons.sh            (needs rsvg-convert, e.g. `brew install librsvg`)
set -euo pipefail

if ! command -v rsvg-convert >/dev/null 2>&1; then
  echo "ERROR: rsvg-convert not found (brew install librsvg / apt install librsvg2-bin)" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GLYPH="$ROOT/src-tauri/icons/typevocal-glyph.svg"
OUT="$ROOT/src-tauri/resources"
SIZE=64

# Badges, drawn in the glyph's 1024x1024 coordinate space.
BADGE_RECORDING='<circle cx="840" cy="840" r="130" fill="#EF4444"/>'
BADGE_TRANSCRIBING='<g fill="#3B82F6"><circle cx="680" cy="880" r="55"/><circle cx="840" cy="880" r="55"/><circle cx="1000" cy="880" r="55"/></g>'
BADGE_WARNING='<polygon points="840,690 990,960 690,960" fill="#F59E0B" stroke="#F59E0B" stroke-width="24" stroke-linejoin="round"/><g stroke="#1F2937" stroke-width="30" stroke-linecap="round"><line x1="840" y1="780" x2="840" y2="860"/><line x1="840" y1="910" x2="840" y2="911"/></g>'

# render <out-name> <fg-colour|colored> [badge]
# A mono fg recolours both strokes; "colored" keeps the glyph's own colours.
render() {
  local name="$1" fg="$2" badge="${3:-}" svg
  svg="$(cat "$GLYPH")"
  if [ "$fg" != "colored" ]; then
    svg="${svg//#FFFFFF/$fg}"
    svg="${svg//#FBBF24/$fg}"
  fi
  svg="${svg/<\/svg>/$badge</svg>}"
  printf '%s' "$svg" | rsvg-convert -w "$SIZE" -h "$SIZE" -o "$OUT/$name"
}

LIGHT='#FFFFFF'
DARK='#1F2937'

for state in idle recording transcribing idle_warning; do
  case "$state" in
    idle) badge='' ;;
    recording) badge="$BADGE_RECORDING" ;;
    transcribing) badge="$BADGE_TRANSCRIBING" ;;
    idle_warning) badge="$BADGE_WARNING" ;;
  esac
  render "tray_$state.png" "$LIGHT" "$badge"
  render "tray_${state}_dark.png" "$DARK" "$badge"
done

render tray_idle_colored.png colored
render recording.png colored "$BADGE_RECORDING"
render transcribing.png colored "$BADGE_TRANSCRIBING"
