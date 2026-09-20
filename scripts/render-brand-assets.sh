#!/usr/bin/env bash
#
# Renders every raster this site serves from the vectors in brand/. Run it after
# re-syncing brand/ from core, and commit the output.
#
#   ./scripts/render-brand-assets.sh
#
# This is a port of oryjin-tech/core's scripts/render-favicons.sh and
# render-social-cards.sh, deliberately kept close to them: same renderer, same
# framings, same proportions, so the site's tab icon and unfurl card cannot
# drift from the app's. Read those two files for the full reasoning; the
# load-bearing parts are repeated below.
#
# Nothing here redraws anything. Each step sed's the *viewBox* of a file in
# brand/ and leaves the path data alone, because a transcription is a thing that
# can disagree and we already have exactly as many copies of this mark as we can
# defend.
set -euo pipefail

cd "$(dirname "$0")/.."

CHROME=${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}
if [[ ! -x $CHROME ]]; then
	echo "Chrome not found at: $CHROME" >&2
	echo "Set CHROME=/path/to/chrome and re-run." >&2
	exit 1
fi
command -v magick >/dev/null || { echo "ImageMagick (magick) not on PATH." >&2; exit 1; }

WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

# Headless Chrome rasterises, because it is the renderer that agrees with the
# browsers actually serving these files. ImageMagick only crops and strips
# metadata — -strip matters, or every re-run is a new blob in git for no pixel
# change.
shoot() { # $1 = svg path, $2 = px, $3 = out
	local svg=$1 px=$2 out=$3
	cat >"$WORK/icon.html" <<-HTML
		<!doctype html><meta charset="utf-8">
		<style>html,body{margin:0;padding:0;background:transparent}
		svg{display:block;width:${px}px;height:${px}px}</style>
		$(cat "$svg")
	HTML
	"$CHROME" --headless --disable-gpu --hide-scrollbars \
		--force-device-scale-factor=1 --default-background-color=00000000 \
		--window-size="${px},${px}" --screenshot="$WORK/shot.png" \
		"file://$WORK/icon.html" >/dev/null 2>&1
	magick "$WORK/shot.png" -crop "${px}x${px}+0+0" +repage -strip "$out"
}

# ─── FAVICONS ───────────────────────────────────────────────────────────────
#
# THE TAB ICON IS TRANSPARENT; THE PLATFORM ICONS ARE A TILE. Both were tried in
# core, and the split is the easy thing to get wrong:
#
#   - apple-touch-icon must be OPAQUE AND SQUARE. iOS composites transparency
#     onto black and then applies its own squircle, so a rounded tile ships with
#     four black corners peeking out from under the mask.
#   - the manifest's `any` icons sit on the user's wallpaper and are NOT masked
#     by Android, so those keep their own rounding.
#   - the `maskable` icon IS masked by Android, hence square again and inset
#     further so the platform's crop cannot reach the mark.
echo "favicons:"
for px in 16 32 48 64 128 256; do
	shoot brand/oryjin-favicon.svg "$px" "favicon-${px}x${px}.png"
	echo "  favicon-${px}x${px}.png  (transparent, bled)"
done

for px in 192 512; do
	shoot brand/oryjin-tile.svg "$px" "favicon-${px}x${px}.png"
	echo "  favicon-${px}x${px}.png  (rounded tile)"
done

shoot brand/oryjin-tile-square.svg 180 favicon-180x180.png
echo "  favicon-180x180.png       (SQUARE tile — apple-touch, see above)"

shoot brand/oryjin-maskable.svg 512 favicon-maskable-512x512.png
echo "  favicon-maskable-512x512.png (inset 70% for Android's mask)"

# Six frames, not one. Windows and some feed readers pick the frame they want
# out of the .ico, and a single 16px frame is what makes a pinned shortcut look
# like a thumbnail of a thumbnail.
magick favicon-16x16.png favicon-32x32.png favicon-48x48.png \
	favicon-64x64.png favicon-128x128.png favicon-256x256.png \
	-strip favicon.ico
echo "  favicon.ico               (16/32/48/64/128/256)"

# 128 and 256 exist only to be frames of the .ico; nothing links them.
rm -f favicon-128x128.png favicon-256x256.png

# ─── SOCIAL CARDS ───────────────────────────────────────────────────────────
#
# NO FONT. Both halves of the lockup are vectors — kit 1.0 ships the wordmark as
# outlined paths — so this draws the brand's own lettering rather than the
# site's body face pretending to be it.
W=1200
H=630

# Proportions off the kit's own lockup (brand/oryjin-lockup.svg), where the
# mark's ink is 218.8 wide, the wordmark's ink 232 tall and the gap 60.6:
#
#   wordmark height = 1.06 x mark        gap = 0.28 x mark
#
# Same numbers as core's cards, so the two unfurl identically.
MARK_H=214
WORDMARK_H=227
GAP=60

# Both cropped from their delivered canvas to their ink, so the flex gap is the
# gap you see rather than the gap plus whatever padding the file carried.
# Path data untouched; only the window moves.
MARK_SVG=$(sed 's|viewBox="0 0 512 512"|viewBox="56 56 400 400"|' brand/oryjin-symbol.svg)
WORDMARK_SVG=$(sed 's|viewBox="0 0 466 165"|viewBox="20 5 426 145"|' brand/oryjin-wordmark.svg)

# $1 = variant, $2 = body background CSS, $3 = mark fill, $4 = wordmark fill.
card() {
	local variant=$1 bg=$2 mark_fill=$3 word_fill=$4
	cat >"$WORK/card.html" <<-HTML
		<!doctype html>
		<meta charset="utf-8">
		<style>
		html,body{margin:0;padding:0}
		body{width:${W}px;height:${H}px;overflow:hidden;${bg}}
		.lockup{display:flex;align-items:center;justify-content:center;
		  gap:${GAP}px;width:100%;height:100%}
		.lockup span{display:flex}
		.lockup svg{display:block;width:auto}
		.mark svg{height:${MARK_H}px}
		.wordmark svg{height:${WORDMARK_H}px}
		.mark g{fill:${mark_fill}}
		.wordmark g{fill:${word_fill}}
		</style>
		<div class="lockup">
		  <span class="mark">${MARK_SVG}</span>
		  <span class="wordmark">${WORDMARK_SVG}</span>
		</div>
	HTML
	"$CHROME" --headless --disable-gpu --hide-scrollbars \
		--force-device-scale-factor=1 \
		--window-size="${W},${H}" --screenshot="$WORK/shot.png" \
		"file://$WORK/card.html" >/dev/null 2>&1
	magick "$WORK/shot.png" -crop "${W}x${H}+0+0" +repage -strip "og-${variant}.png"
	echo "  og-${variant}.png"
}

# The kit's rule for all three: white lockup on blue or dark, the two-colour
# primary lockup on light. Nothing knocked half-white or gradient-filled — the
# mark is one colour.
echo "social cards:"
card navy "background:#141C2E" "#FFFFFF" "#FFFFFF"
card gradient \
	"background:linear-gradient(135deg,#037E8F 0%,#1652D9 55%,#6302CC 100%)" \
	"#FFFFFF" "#FFFFFF"
card white "background:#FFFFFF" "#1652D9" "#141C2E"

echo
echo "Done. og-navy.png is the one the meta tags reference; the other two are"
echo "here so a change of mind is a one-line edit rather than a render."
