/*
 * Site configuration for assets/site-analytics.js. Plain values, no secrets:
 * every id here is a PUBLIC identifier the browser sends anyway. An empty
 * string means "that tag never loads", which is how the site runs until the
 * accounts exist.
 *
 *   posthogKey          The PostHog project key (the same project as the app,
 *                       EU Cloud). Filled in by hand by Victor; empty = no
 *                       analytics at all, banner or not.
 *   posthogHost         EU ingestion host. Leave as is.
 *   appUrl              Where "Request access" and the lead post go.
 *   linkedinPartnerId   LinkedIn Insight Tag partner id (Campaign Manager →
 *                       Analyze → Insight Tag). Empty until LinkedIn Ads run.
 *   linkedinConversionId The lead conversion's id, from the same console.
 *   googleAdsId         "AW-XXXXXXXXX" (Google Ads → Tools → Conversions).
 *   googleAdsLeadLabel  The lead conversion's label (the part after the slash
 *                       in the send_to value). Empty until Google Ads run.
 *   consentVersion      Bump when the consent copy or the privacy page changes
 *                       meaning: a stored choice under an older version is
 *                       asked again, and the lead carries the version it was
 *                       given under. See README.md.
 */
window.ORYJIN_SITE = {
  posthogKey: "phc_ppgWZ8hwtRcY2cPZGkH4WaTtSrCfzqydzWtWtrZk5969",
  posthogHost: "https://eu.i.posthog.com",
  appUrl: "https://app.oryjin.com",
  linkedinPartnerId: "",
  linkedinConversionId: "",
  googleAdsId: "",
  googleAdsLeadLabel: "",
  consentVersion: "website-2026-10-16b"
};
