#!/usr/bin/env bash
#
# Copies the brand typeface into public/fonts/ so every page serves it from
# oryjin.com. Run after bumping @fontsource-variable/plus-jakarta-sans, and
# commit the output.
#
#   ./scripts/sync-fonts.sh
#
# Plus Jakarta Sans Variable is what the app loads (core's src/styles.css
# imports the same package), so the site and the app render one face from one
# file set. The pages used to fetch static weights from Google Fonts: a request
# to a third party on every visit, a different cut of the font from the app's,
# and a `@font-face` block nothing shared. Two subsets, the ones the site's
# languages need: latin, and latin-ext for the French guides' œ.
#
# The @font-face rules that point at these files are written out three times —
# src/styles/site.css for the generated pages, and inline in index.html and
# partners/index.html, which have no build step — and scripts/check-brand-sync.sh
# holds the three copies equal.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC=node_modules/@fontsource-variable/plus-jakarta-sans/files
[[ -d $SRC ]] || { echo "run pnpm install first: $SRC is missing" >&2; exit 1; }
mkdir -p public/fonts
for subset in latin latin-ext; do
	cp "$SRC/plus-jakarta-sans-$subset-wght-normal.woff2" public/fonts/
	echo "public/fonts/plus-jakarta-sans-$subset-wght-normal.woff2"
done
