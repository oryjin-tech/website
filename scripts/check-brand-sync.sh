#!/usr/bin/env bash
#
# Fails if the brand has drifted. Run in CI on every push, and by hand after
# re-syncing brand/ from core.
#
#   ./scripts/check-brand-sync.sh            # check
#   ./scripts/check-brand-sync.sh --update   # re-copy brand/ from ../core first
#
# There are four ways this site can start lying about the brand, and this
# checks all four:
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
#   2. TOKENS. brand/tokens.css is generated in core from the app's stylesheet:
#      the kit's colours with their channels, the gradient, the neutrals and
#      statuses resolved to hex, the chart palette, the type stacks. Three
#      stylesheets here transcribe it into their :root — src/styles/site.css
#      for the generated pages, and index.html and partners/index.html inline
#      theirs, no build step, no render-blocking stylesheet. A transcription
#      that nothing checks is a transcription that drifts; the old palette
#      survived in this file's own :root under a comment claiming it came from
#      core/brand/colors.css, which it did not. So every `--oryjin-*` line of
#      each :root must equal the file, in order, and the two inline pages'
#      aliases must equal each other.
#
#   3. VENDORING. brand/ is supposed to be byte-for-byte core's. Only checkable
#      when core is checked out alongside this repo, so it is a warning locally
#      and silent in CI rather than a failure.
#
#   4. FONTS. Plus Jakarta Sans Variable is served from fonts/ (copied from the
#      same package the app imports by scripts/sync-fonts.sh) and declared by
#      an @font-face block that four stylesheets carry. The copies must agree,
#      the files must exist, and no page may reach for Google Fonts again.
set -euo pipefail

# Every path below is relative to public/, which is what the site serves
# (the Astro build copies it as-is since 2026-10-17).
cd "$(dirname "$0")/../public"

CORE=${CORE:-../../core}
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
	cp "$CORE/brand/tokens.css" brand/tokens.css
	echo "brand/ re-copied from $CORE. Re-render with ./scripts/render-brand-assets.sh,"
	echo "and if tokens.css changed, paste its :root lines into the three :root blocks"
	echo "(src/styles/site.css, index.html, partners/index.html) — the check below says where."
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
python3 - <<'PY' || fail=1
import re, sys, pathlib

def strip(css):
    return re.sub(r"/\*.*?\*/", "", css, flags=re.S)

def declarations(body):
    out = []
    for chunk in strip(body).split(";"):
        chunk = chunk.strip()
        if not chunk.startswith("--"):
            continue
        name, _, value = chunk.partition(":")
        out.append((name.strip(), " ".join(value.split())))
    return out

def first_root(path):
    s = pathlib.Path(path).read_text(encoding="utf-8")
    m = re.search(r"^:root \{\n(.*?)^\}", s, re.S | re.M)
    if not m:
        print(f"  FAIL  {path} has no :root block"); sys.exit(1)
    return declarations(m.group(1))

ok = True
tokens = pathlib.Path("brand/tokens.css").read_text(encoding="utf-8")
want = declarations(re.search(r":root \{(.*?)\}", tokens, re.S).group(1))
if not want:
    print("  FAIL  brand/tokens.css has no declarations"); sys.exit(1)
if any(not n.startswith("--oryjin-") for n, _ in want):
    print("  FAIL  brand/tokens.css declares a name outside --oryjin-*"); ok = False

# The kit's three colours and the dark, as tokens.css restates them.
kit = dict(declarations(re.search(r":root \{(.*?)\}", pathlib.Path("brand/colors.css").read_text(encoding="utf-8"), re.S).group(1)))
have = dict(want)
for k in ("blue", "teal", "purple", "dark"):
    a, b = kit.get(f"--oryjin-{k}", "").lower(), have.get(f"--oryjin-{k}", "").lower()
    if a != b:
        print(f"  FAIL  --oryjin-{k} is {b or 'missing'} in tokens.css, {a or 'missing'} in colors.css"); ok = False

PAGES = ["../src/styles/site.css", "index.html", "partners/index.html"]
aliases = {}
for page in PAGES:
    decls = first_root(page)
    got = [d for d in decls if d[0].startswith("--oryjin-")]
    aliases[page] = [d for d in decls if not d[0].startswith("--oryjin-")]
    if got == want:
        print(f"  ok    {page} transcribes brand/tokens.css ({len(want)} tokens)")
        continue
    ok = False
    names_want = [n for n, _ in want]; names_got = [n for n, _ in got]
    for n in names_want:
        if n not in names_got:
            print(f"  FAIL  {page} is missing {n}")
    for n in names_got:
        if n not in names_want:
            print(f"  FAIL  {page} declares {n}, which brand/tokens.css does not")
    for (n, v) in got:
        if n in have and have[n] != v:
            print(f"  FAIL  {page} {n} is {v}, brand/tokens.css says {have[n]}")
    if names_got != names_want and set(names_got) == set(names_want):
        print(f"  FAIL  {page} declares the tokens in a different order from brand/tokens.css")

# The two inline pages' aliases must agree with each other, not just with the file.
if aliases["index.html"] != aliases["partners/index.html"]:
    ok = False
    a, b = dict(aliases["index.html"]), dict(aliases["partners/index.html"])
    for n in sorted(set(a) | set(b)):
        if a.get(n) != b.get(n):
            print(f"  FAIL  --{n[2:]} differs: index.html {a.get(n, '(absent)')} / partners {b.get(n, '(absent)')}")
else:
    print(f"  ok    index.html and partners/index.html alias the tokens identically ({len(aliases['index.html'])} aliases)")

sys.exit(0 if ok else 1)
PY

# Nothing may resurrect the old palette. Comments are stripped before the scan,
# which is why this one lives in its own file — see its docstring.
echo "old palette:"
python3 ../scripts/check-old-palette.py || fail=1

# ─── 3. VENDORING ───────────────────────────────────────────────────────────
echo "vendoring:"
if [[ -d $CORE/brand/svg ]]; then
	for f in brand/*.svg brand/colors.css brand/tokens.css; do
		n=$(basename "$f")
		src=$CORE/brand/svg/$n
		[[ $n == *.css ]] && src=$CORE/brand/$n
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

# ─── 4. FONTS ───────────────────────────────────────────────────────────────
echo "fonts:"
python3 - <<'PY' || fail=1
import re, sys, pathlib
ok = True
FILES = ["../src/styles/site.css", "index.html", "partners/index.html", "privacy.html"]
faces = {}
for f in FILES:
    s = pathlib.Path(f).read_text(encoding="utf-8")
    faces[f] = re.findall(r"@font-face\{font-family:'Plus Jakarta Sans Variable';[^}]*\}", s)
    if len(faces[f]) != 2:
        print(f"  FAIL  {f} declares {len(faces[f])} 'Plus Jakarta Sans Variable' faces, expected 2 (latin, latin-ext)"); ok = False
    if re.search(r"fonts\.(googleapis|gstatic)\.com", s):
        print(f"  FAIL  {f} still loads from Google Fonts"); ok = False
ref = faces[FILES[0]]
for f in FILES[1:]:
    if faces[f] != ref:
        print(f"  FAIL  {f}'s @font-face block differs from {FILES[0]}'s"); ok = False
for face in ref:
    url = re.search(r"url\(([^)]+)\)", face).group(1).lstrip("/")
    if pathlib.Path(url).is_file():
        print(f"  ok    {url}")
    else:
        print(f"  FAIL  {url} is not served — run scripts/sync-fonts.sh"); ok = False
if ok:
    print(f"  ok    {len(FILES)} stylesheets declare the same self-hosted face")
sys.exit(0 if ok else 1)
PY

echo
if (( fail )); then echo "BRAND DRIFT. See above."; exit 1; fi
echo "Brand is in sync."
