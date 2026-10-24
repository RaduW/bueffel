#!/bin/sh
# Generates the app icons in public/ from the SVG sources in this folder.
# Needs rsvg-convert (macOS: brew install librsvg).
#
#   icons/build.sh                  # from bison.svg (the current icon)
#   icons/build.sh bison-head.svg   # from another square source
#
# The rounded icons (favicon, PWA) get their corners here; apple-touch-icon
# stays square because iOS rounds it itself. The maskable icon has its own
# source, with the artwork shrunk into the safe zone.
set -e
cd "$(dirname "$0")"
src=${1:-bison.svg}
out=../public

# Rounded corners: wrap the source's content in a clip path
{
  echo '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
  echo '<clipPath id="corners"><rect width="512" height="512" rx="96"/></clipPath>'
  echo '<g clip-path="url(#corners)">'
  sed -e '1d' -e '$d' "$src"
  echo '</g>'
  echo '</svg>'
} > "$out/favicon.svg"

rsvg-convert -w 192 -h 192 "$out/favicon.svg" -o "$out/pwa-192x192.png"
rsvg-convert -w 512 -h 512 "$out/favicon.svg" -o "$out/pwa-512x512.png"
rsvg-convert -w 180 -h 180 "$src" -o "$out/apple-touch-icon.png"
if [ "$src" = bison.svg ]; then
  rsvg-convert -w 512 -h 512 bison-maskable.svg -o "$out/maskable-512x512.png"
else
  echo "Note: maskable-512x512.png not changed (it has its own source, see bison-maskable.svg)"
fi
echo "Icons written to public/"
