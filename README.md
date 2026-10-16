# oryjin.com

The brand website: static HTML on GitHub Pages, no build step. `index.html`
is the one-pager, `*.html` the guides, `partners/` a private page,
`privacy.html` the policy. `brand/` is vendored from `oryjin-tech/core`
(`scripts/check-brand-sync.sh` holds it to the app's drawing).

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
  "consent": true, "consentVersion": "website-2026-10-16", "locale": "en", "website": "",
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
- `node --check assets/*.js` — the shared scripts parse.
