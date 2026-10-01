#!/bin/bash
# Builds one contact sheet; each cell is scaled to 640 wide, side by side.
#   bash contact.sh video.mp4 check/contact-sheet.png [N]    from a video: frame 0 + N evenly spaced frames (default 5) + the last frame
#   bash contact.sh check/transitions/ check/transitions.png  joins the PNG stills in a folder, in file-name order (to check before the full render)
set -e
IN="$1"; OUT="$2"; N="${3:-5}"
[ -n "$IN" ] && [ -n "$OUT" ] || { echo "usage: see the comment at the top of this file"; exit 1; }
mkdir -p "$(dirname "$OUT")"
TMP=$(mktemp -d)
if [ -d "$IN" ]; then
  i=0; for f in "$IN"/*.png; do i=$((i+1)); ffmpeg -loglevel error -y -i "$f" -vf scale=640:-2 "$TMP/f$(printf %03d $i).png"; done
  COUNT=$i
else
  DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
  ffmpeg -loglevel error -y -ss 0 -i "$IN" -frames:v 1 -vf scale=640:-2 "$TMP/f000.png"
  for i in $(seq 1 "$N"); do
    T=$(awk -v d="$DUR" -v i="$i" -v n="$N" 'BEGIN { printf "%.3f", d * (i - 0.5) / n }')
    ffmpeg -loglevel error -y -ss "$T" -i "$IN" -frames:v 1 -vf scale=640:-2 "$TMP/f$(printf %03d $i).png"
  done
  ffmpeg -loglevel error -y -sseof -0.1 -i "$IN" -frames:v 1 -vf scale=640:-2 "$TMP/f999.png"
  COUNT=$((N+2))
fi
ffmpeg -loglevel error -y -pattern_type glob -i "$TMP/f*.png" -vf "tile=${COUNT}x1:padding=8:color=white" -frames:v 1 "$OUT"
rm -rf "$TMP"
echo "wrote ${OUT} (${COUNT} cells)"
