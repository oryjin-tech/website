#!/usr/bin/env bash
#
# Fails if the brand has drifted. Run in CI on every push, and by hand after
# re-syncing brand/ from core.
#
#   ./scripts/check-brand-sync.sh            # check
#   ./scripts/check-brand-sync.sh --update   # re-copy brand/ from ../core first
#
# There are three ways this site can start lying about the brand, and this
# checks all three:
#
#   1. GEOMETRY. The mark is drawn ONCE and framed six ways (bled favicon,
#      rounded tile, square tile, maskable, the symbol itself, the lockup). If
#      those six ever stop being framings of one drawing, they are six drawings.
#      oryjin-tech/core has logo-geometry.test.ts for exactly this, and it
#      cannot see this repo — so the check is repeated here. It is standalone:
#      it needs nothing but brand/, which is why it is the part that runs in CI.
#
#      This rule is inherited, and core's README says it is written in blood:
#      in Aug 2026 the previous bundle turned out to disagree with itself about
#      how its own mark was drawn, and the tab, the sidebar, the auth pages and
#      the Slack unfurl were all confidently wrong together for months.
#
#   2. TOKENS. index.html and partners/index.html inline their CSS — no build
#      step, no render-blocking stylesheet — so the brand hexes are transcribed
#      into each. A transcription that nothing checks is a transcription that
#      drifts; the old palette survived in this file's own :root under a comment
#      claiming it came from core/brand/colors.css, which it did not.
#
#   3. VENDORING. brand/ is supposed to be byte-for-byte core's. Only checkable
#      when core is checked out alongside this repo, so it is a warning locally
#      and silent in CI rather than a failure.
set -euo pipefail

cd "$(dirname "$0")/.."

CORE=${CORE:-../core}
fail=0
note() { printf '  %s\n' "$*"; }
bad()  { printf '  FAIL  %s\n' "$*"; fail=1; }

if [[ ${1:-} == --update ]]; then
	[[ -d $CORE/brand/svg ]] || { echo "core not found at $CORE" >&2; exit 1; }
	for f in oryjin-symbol oryjin-favicon oryjin-tile oryjin-tile-square \
	         oryjin-maskable oryjin-wordmark oryjin-lockup; do
		cp "$CORE/brand/svg/$f.svg" "brand/$f.svg"
	done
	cp "$CORE/brand/colors.css" brand/colors.css
	echo "brand/ re-copied from $CORE. Re-render with ./scripts/render-brand-assets.sh."
	echo
fi

# ─── 1. GEOMETRY ────────────────────────────────────────────────────────────
echo "geometry:"
python3 - <<'PY' || fail=1
import re, sys, pathlib

def shapes(p):
    s = pathlib.Path(p).read_text(encoding="utf-8")
    d = re.findall(r'\sd="([^"]*)"', s)
    c = re.findall(r'<circle\b([^/>]*)', s)
    return d, [" ".join(a.split()) for a in c]

MARK   = ["brand/oryjin-symbol.svg", "brand/oryjin-favicon.svg",
          "brand/oryjin-tile.svg", "brand/oryjin-tile-square.svg",
          "brand/oryjin-maskable.svg"]
ok = True
ref_d, _ = shapes(MARK[0])
if len(ref_d) != 2:
    print(f"  FAIL  {MARK[0]} has {len(ref_d)} paths, expected the mark's 2"); ok = False

for p in MARK[1:]:
    d, _ = shapes(p)
    if d != ref_d:
        print(f"  FAIL  {p} is a DIFFERENT DRAWING from {MARK[0]}"); ok = False
    else:
        print(f"  ok    {p}")
print(f"  ok    {MARK[0]} (reference, {len(ref_d)} paths)")

wd, wc = shapes("brand/oryjin-wordmark.svg")
ld, lc = shapes("brand/oryjin-lockup.svg")
if ld[:2] != ref_d:
    print("  FAIL  lockup's mark is a different drawing from the symbol"); ok = False
elif ld[2:] != wd or lc != wc:
    print("  FAIL  lockup's wordmark is a different drawing from the wordmark"); ok = False
else:
    print(f"  ok    brand/oryjin-lockup.svg (mark + {len(wd)} wordmark paths)")

# The mark is one flat colour. A gradient in it is banding at 24px, not brand.
for p in MARK + ["brand/oryjin-lockup.svg", "brand/oryjin-wordmark.svg"]:
    if re.search(r"<(linear|radial)Gradient", pathlib.Path(p).read_text(encoding="utf-8")):
        print(f"  FAIL  {p} contains a gradient; the mark is one colour"); ok = False

sys.exit(0 if ok else 1)
PY

# ─── 2. TOKENS ──────────────────────────────────────────────────────────────
echo "tokens:"
kit() { grep -oE "^\s*--oryjin-$1:\s*#[0-9A-Fa-f]{6}" brand/colors.css | grep -oE '#[0-9A-Fa-f]{6}'; }
page() { grep -oE "^\s*--$2:\s+#[0-9A-Fa-f]{6}" "$1" | grep -oE '#[0-9A-Fa-f]{6}'; }

for page_file in index.html partners/index.html; do
	for pair in "blue:v" "teal:teal" "purple:violet" "dark:ink"; do
		k=${pair%%:*}; t=${pair##*:}
		want=$(kit "$k"); got=$(page "$page_file" "$t" || true)
		# tr, not ${x,,} — macOS still ships bash 3.2 and this runs locally too.
		if [[ -z $got ]]; then
			bad "$page_file has no --$t"
		elif [[ $(printf %s "$want" | tr 'A-F' 'a-f') != "$(printf %s "$got" | tr 'A-F' 'a-f')" ]]; then
			bad "$page_file --$t is $got, brand/colors.css --oryjin-$k is $want"
		else
			note "ok    $page_file --$t = $got"
		fi
	done
done

# The two inline blocks must agree with each other, not just with the kit.
for t in v violet teal vdk v-rgb violet-rgb; do
	a=$(grep -oE "^\s*--$t:.*" index.html | head -1 | sed 's/;.*//;s/^ *//')
	b=$(grep -oE "^\s*--$t:.*" partners/index.html | head -1 | sed 's/;.*//;s/^ *//')
	[[ -n $a && $a == "$b" ]] || bad "--$t differs between index.html and partners/index.html"
done

# Nothing may resurrect the old palette. Comments are stripped before the scan,
# which is why this one lives in its own file — see its docstring.
echo "old palette:"
python3 scripts/check-old-palette.py || fail=1

# ─── 3. VENDORING ───────────────────────────────────────────────────────────
echo "vendoring:"
if [[ -d $CORE/brand/svg ]]; then
	for f in brand/*.svg brand/colors.css; do
		n=$(basename "$f")
		src=$CORE/brand/svg/$n
		[[ $n == colors.css ]] && src=$CORE/brand/colors.css
		if [[ ! -f $src ]]; then
			note "warn  $n has no counterpart in $CORE"
		elif cmp -s "$f" "$src"; then
			note "ok    $n matches core"
		else
			bad "$n differs from $src — re-run with --update"
		fi
	done
else
	note "skip  core not checked out at $CORE (set CORE=… to check vendoring)"
fi

echo
if (( fail )); then echo "BRAND DRIFT. See above."; exit 1; fi
echo "Brand is in sync."
