# oryjin.com

The brand website and the payment economics knowledge hub, built with
[Astro](https://astro.build) and published to GitHub Pages by
`.github/workflows/deploy.yml` on every push to `main`. The plan behind the
hub is `docs/plans/payment-knowledge-hub.md` in `oryjin-tech/core`.

```bash
pnpm install
pnpm dev          # http://localhost:4321
pnpm build        # dist/
pnpm check:site   # the SEO gate over dist/, as CI runs it
```

## Layout

- **`public/`** — the hand-written pages, served exactly as written:
  `index.html` (the one-pager), `partners/` (a private page), `privacy.html`,
  the favicons and images, `assets/` (the analytics scripts) and `brand/`,
  vendored from `oryjin-tech/core` (`scripts/check-brand-sync.sh` holds it
  to the app's drawing).
- **`src/content/guides/<locale>/<slug>.md`** — one guide per file:
  frontmatter for the metadata, Markdown for the body. The file name is the
  English URL (`/scheme-fees-interchange`); a French guide sets its own
  `slug` and names the English file in `translationOf`, and the hreflang
  pairs follow from that. The schema is `src/content.config.ts`.
- **`src/components/GuidePage.astro`** — the guide page; **`src/layouts/Site.astro`**
  the head, nav and footer every generated page shares. Both were lifted from
  the hand-written guides on 2026-10-17 and render the same markup.
- **`src/pages/`** — `/learn` (the hub), `/methodology`, the guides, the
  per-guide social cards (`/og/<locale>/<slug>.png`, rendered at build time),
  `sitemap.xml`, `rss.xml` and `llms.txt` (its header is `src/llms-header.txt`;
  the guides list is generated).

## Writing a guide

1. Copy an existing file in `src/content/guides/en/`. The file name becomes
   the URL, and **a published URL never changes**: Pages has no redirects.
2. `seoTitle` puts the query first and stays near 60 characters with
   " | Oryjin"; `description` states the answer in under 160. The gate warns
   past both.
3. Link up to the hub's pillar and across to at least two related guides
   (`related`). The gate fails a guide with fewer than three internal links.
4. Every figure carries its source and date in the text, as `/methodology`
   promises. French follows the app's vocabulary
   (`src/integrations/i18n/GLOSSARY.md` in core, mirrored by hand).
5. Add the URL to `scripts/published-urls.txt` when it ships.

## The SEO gate

`scripts/check-site.mjs` runs after every build, on pull requests
(`site.yml`) and before every deploy. It fails when a URL in
`scripts/published-urls.txt` stops resolving, a sitemap entry or an internal
link points at nothing, JSON-LD does not parse, a page lacks one `<h1>`, a
title, a description or a self-canonical, or an hreflang pair does not link
back.

## Analytics, consent and the doors into the app

Every page loads two scripts at the end of its body:

- `assets/site-config.js` — the public ids: the PostHog project key, the app
  URL, the LinkedIn and Google Ads ids, the consent version. **Fill the
  PostHog key by hand** (the same project as the app, EU Cloud). An empty id
  means that tag never loads; with no key and no ad id the banner never shows,
  because there is nothing to consent to.
- `assets/site-analytics.js` — the consent banner, PostHog (opt-out by
  default, capturing only after the visitor accepted analytics), the
  `dataLayer` → PostHog shim, the request-access links, the lead post to the
  app, and the advertising tags behind the advertising category. The list of
  events it captures is at the top of the file.

### The links into the app

Every link marked `data-app-link="<section>"` points at
`https://app.oryjin.com/request-access?source=website&utm_source=website&utm_medium=cta&utm_content=<section>`.
On load the script appends the visitor's own inbound `utm_*`, `gclid`,
`li_fat_id`, `msclkid` and `ref` (kept for the session in `sessionStorage`),
and an inbound `utm_source` overrides the default — a LinkedIn visitor
reaches the app as `utm_source=linkedin`. This rides the link, not a cookie,
so a refused banner still yields an attributed lead on the app's desk.

### The early-access form

It posts twice: first `POST https://app.oryjin.com/api/leads` (JSON, 6 s
timeout, never blocks the visitor), then web3forms as before so the email
copy always arrives. The app body is:

```json
{
  "name": "Camille Durand", "email": "camille@acme.example", "company": "Acme",
  "role": "CFO", "volumeBand": "pro_25_50", "processors": ["adyen", "stripe"],
  "message": "Monthly card volume: €2M – €5M. Processors as typed: Adyen + Stripe",
  "consent": true, "consentVersion": "website-2026-10-16b", "locale": "en", "website": "",
  "attribution": {
    "utmSource": "linkedin", "utmMedium": "social", "utmCampaign": "202610-renewal",
    "utmContent": "post-3", "utmTerm": "", "referrer": "https://www.linkedin.com/",
    "landingPath": "/psp-fees-vs-contract", "analyticsDistinctId": "<posthog id, when opted in>",
    "clickIds": { "gclid": "…", "liFatId": "…", "msclkid": "…" }
  }
}
```

Empty attribution fields are omitted. `website` is the honeypot (a hidden
field no person sees). Monthly volume maps to the app's annual bands
(`VOLUME_BANDS` in index.html); the free-text PSP field maps to slugs by
keyword (`PSP_SLUGS`), unknown names staying in `message`.

### Consent

Two categories, analytics and advertising; the choice lives six months in
the cookie `oryjin_consent` on this host only (the app has its own stance).
The "Cookies" link in every footer reopens the banner. **Bump
`consentVersion`** in `assets/site-config.js` whenever the consent copy, the
privacy page or the list of tags changes meaning: a stored choice under an
older version is asked again, and the app records the version each lead was
given under.

### UTM convention

Every link we publish carries UTMs:

| Parameter      | Values                                                        |
| -------------- | ------------------------------------------------------------- |
| `utm_source`   | `linkedin`, `newsletter`, `partner-<name>`, `google`, `outbound`, `website` |
| `utm_medium`   | `social`, `email`, `referral`, `cpc`, `cta`, `sequence`       |
| `utm_campaign` | `<yyyymm>-<slug>`, e.g. `202610-renewal-season`               |
| `utm_content`  | the creative or the page section, e.g. `post-3`, `hero`       |

The five guides are the natural campaign landing pages.

## Checks

- `scripts/check-brand-sync.sh` — the brand has not drifted (runs in CI).
- `scripts/smoke-site.sh` — the live site answers (runs after a deploy).
- `node --check public/assets/*.js` — the shared scripts parse.
- `pnpm check:site` — the SEO gate over the build (runs in CI and before every deploy).
