# Oryjin brand kit 1.0 — vendored

**Do not edit anything in this directory.** It is an exact, byte-for-byte mirror
of `brand/svg/` and `brand/colors.css` in the `oryjin-tech/core` repo, which is
the source of truth for the mark, the wordmark and the three brand colours.

To change the brand: change it in `core`, then re-run
`./scripts/check-brand-sync.sh --update` here with `core` checked out alongside
this repo, and re-render the rasters with `./scripts/render-brand-assets.sh`.

## Why these files are served directly

This site is committed HTML published by GitHub Pages, with no build step. The
HTML therefore points at `brand/oryjin-symbol.svg` and `brand/oryjin-favicon.svg`
*directly*, rather than at copies sitting in the repo root. That is deliberate.
A copy is a thing that can drift, and drift in exactly these files is the
failure this whole arrangement exists to prevent — see "Rules that have teeth"
in `core`'s own `brand/README.md`, where four copies of the mark quietly became
four different drawings and shipped that way for months.

The rasters (`favicon-*.png`, `og-*.png`) cannot be served from vector and so are
rendered, never hand-drawn, by `scripts/render-brand-assets.sh`.

## Contents

| File | Used for |
|---|---|
| `oryjin-symbol.svg` | the mark alone, one colour — nav, footer, form success |
| `oryjin-wordmark.svg` | outlined lowercase "oryjin". Not a font. |
| `oryjin-lockup.svg` | mark + wordmark at the kit's spacing |
| `oryjin-favicon.svg` | the mark bled to the edge (`scale(1.22)`) — browser tab, `.ico` |
| `oryjin-tile.svg` | white mark on a rounded blue tile, `rx=112` — manifest `any` icons |
| `oryjin-tile-square.svg` | the same tile, `rx=0` — `apple-touch-icon` only |
| `oryjin-maskable.svg` | square, inset to the middle 70% — Android's own mask |
| `colors.css` | the three brand colours plus supporting neutrals |

`colors.css` is reference, not a runtime dependency: this site inlines all of
its CSS, so the token values are transcribed into the `:root` block of
`index.html` and `partners/index.html`. `check-brand-sync.sh` asserts that
transcription still matches.

## The rules, inherited

- **One drawing.** The five framings above differ only in their `<rect>` and
  their transform. The path data is identical in all of them, and
  `check-brand-sync.sh` fails if it ever is not.
- **The mark is one flat colour.** No gradient. The geometry is 2-unit arcs; a
  three-stop ramp across one of those is banding at 24px, not brand. The brand
  gradient (`--grad`) is for *surfaces* — rules, bars, washes — and the mark is
  not a surface.
- **White on blue or dark, blue on light.** Never an accent colour inside the mark.
