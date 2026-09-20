#!/usr/bin/env python3
"""Fails if a retired brand colour is back in the served HTML.

Called by check-brand-sync.sh. A separate file rather than a heredoc inside it
because this needs to strip CSS and HTML comments before it scans, and the
stripping is the whole subtlety: the :root blocks deliberately document what
each new colour replaced ("kit teal - replaces the #22D3EE this block used to
carry"), so a check that cannot tell a hex from a note *about* a hex fails on
its own documentation, and a check that cries wolf is one people switch off.

Comment bodies are blanked rather than deleted so reported line numbers still
point at the real line.
"""

import pathlib
import re
import sys

PAGES = ("index.html", "partners/index.html")

RETIRED = {
    "#2563EB": "old blue (now --v, #1652D9)",
    "#1D4ED8": "old hover blue (now --vdk, #1142B0)",
    "#7C3AED": "old violet (now --violet, #6302CC)",
    "#22D3EE": "old cyan (now --teal, #037E8F)",
    "#0B1220": "old navy (now --ink, #141C2E)",
    "#4F46E5": "old indigo (never a kit colour)",
}

# The washes that used to be written out longhand 57 times across the two pages.
WASH = re.compile(r"rgba\(\s*(?:37,\s*99,\s*235|124,\s*58,\s*237)")


def strip_comments(src: str) -> str:
    def blank(m: re.Match) -> str:
        return re.sub(r"[^\n]", " ", m.group(0))

    src = re.sub(r"/\*.*?\*/", blank, src, flags=re.S)
    return re.sub(r"<!--.*?-->", blank, src, flags=re.S)


def main() -> int:
    ok = True
    for page in PAGES:
        src = strip_comments(pathlib.Path(page).read_text(encoding="utf-8"))
        for n, line in enumerate(src.splitlines(), 1):
            low = line.lower()
            for hexv, what in RETIRED.items():
                if hexv.lower() in low:
                    print(f"  FAIL  {page}:{n}  {hexv} — {what}")
                    ok = False
            if WASH.search(line):
                print(f"  FAIL  {page}:{n}  hardcoded wash; use rgb(var(--v-rgb) / a)")
                ok = False
    if ok:
        print("  ok    no retired colours outside comments")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
