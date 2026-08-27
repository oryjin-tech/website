# Domain migration checklist — oryjin.com → oryjin-tech/website

Current state: `oryjin.com` is served by GitHub Pages from the old repo (`fch1/Oryjin`).
This repo (`oryjin-tech/website`) holds a full copy of the code, but its Pages deployment
is **not enabled** — the `CNAME` file here is inert until it is.

Steps to move the live site to this repo, in order:

## 1. Verify the domain on the oryjin-tech org (do this first)

The domain is currently **unverified** on GitHub, which leaves it open to takeover
during the switch.

- GitHub → oryjin-tech org **Settings → Pages → Add verified domain** → `oryjin.com`
- Add the TXT record GitHub provides (`_github-pages-challenge-oryjin-tech.oryjin.com`)
  to the DNS zone, then confirm verification.

## 2. Release the domain from the old repo (requires fch1 access — Farah)

- `fch1/Oryjin` → **Settings → Pages** → remove the custom domain `oryjin.com`
  (or disable Pages entirely).
- Until this is done, GitHub refuses the domain on this repo with
  "CNAME already taken".

## 3. Enable Pages on this repo

- **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)`.
- Set custom domain `oryjin.com` (matches the `CNAME` file already in the repo).
- Wait for the TLS certificate to provision (minutes, up to ~1h), then tick
  **Enforce HTTPS**.
- Note: the repo must be **public**, or the org needs a paid plan for Pages on
  private repos.

## 4. Update DNS

- Apex `oryjin.com` A records: **no change** — they already point to GitHub's
  generic Pages IPs (185.199.108–111.153).
- `www.oryjin.com` CNAME: change `fch1.github.io` → `oryjin-tech.github.io`.

## 5. Verify

- `curl -sI https://oryjin.com` → `server: GitHub.com` with a fresh `last-modified`.
- `https://www.oryjin.com` resolves and redirects correctly after DNS propagation.
- Submit the site form once — Web3Forms/FormSubmit are bound to contact@oryjin.com,
  not to the repo or domain. The first submission to a new address triggers a
  one-time FormSubmit activation email to contact@oryjin.com; click its link,
  then resubmit to confirm delivery end-to-end.
- Padlock/certificate valid once Enforce HTTPS is on.

## Notes

- Expected downtime during the flip (between steps 2 and 3): a few minutes,
  up to ~1h worst case for certificate issuance. Doing step 1 fully beforehand
  minimizes the window.
- After the switch, consider archiving `fch1/Oryjin` to avoid confusion.
