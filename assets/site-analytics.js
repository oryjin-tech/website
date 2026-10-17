/*
 * oryjin.com analytics, consent and the doors into the app.
 *
 * One script for every page (index, the guides, partners, privacy), read
 * after assets/site-config.js. It owns:
 *
 *   - the consent banner (hand-rolled, two categories, six-month cookie on
 *     THIS host only — the app on app.oryjin.com keeps its own stance);
 *   - PostHog, loaded only with a project key and capturing only once the
 *     visitor accepted analytics (opt-out by default);
 *   - the dataLayer shim: every `dataLayer.push({event, …})` the pages make
 *     stays on the bus (the ad tags read it) and is forwarded to PostHog;
 *   - the links into the app: inbound utm_*, click ids and `ref` are carried
 *     onto every `[data-app-link]` href, so a refused banner still yields an
 *     attributed lead;
 *   - the lead post to the app (`OryjinSite.postLead`), which index.html's
 *     form runs before web3forms;
 *   - the advertising tags (LinkedIn Insight, Google Ads), loaded only with
 *     advertising consent and only when their ids are set.
 *
 * Events captured in PostHog (counts and enums only — never the email, never
 * free text):
 *
 *   site_scroll_depth        { percent }               25/50/75/100
 *   site_tour_tab            { tab }                   the product tour
 *   site_form_started        {}                        first focus in the form
 *   site_lead_submitted      { volume, role }          the form landed
 *   site_newsletter_subscribed {}                      newsletter strip
 *   site_cta_clicked         { section, target }       any link into the app
 *                                                      (target "request-access"),
 *                                                      or a scroll-to-form CTA
 *                                                      (target "apply")
 *   site_faq_opened          { page }                  once per guide page load
 *   site_why_step            { step }                  the "why" stepper
 *
 * Public surface: window.OryjinSite — consent.get/open/set, attribution(),
 * landingPath(), distinctId(), capture(), postLead(), conversion().
 */
(function () {
  "use strict";

  var config = window.ORYJIN_SITE || {};
  var CONSENT_COOKIE = "oryjin_consent";
  var CONSENT_MAX_AGE = 15552000; // six months, the CNIL ceiling
  var ATTR_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "li_fat_id", "msclkid", "ref"];
  var ATTR_STORAGE = "ory_attr";
  var LANDING_STORAGE = "ory_landing";

  /* ------------------------------------------------------------ cookies */

  function readCookie(name) {
    var parts = document.cookie ? document.cookie.split("; ") : [];
    for (var i = 0; i < parts.length; i++) {
      var eq = parts[i].indexOf("=");
      if (parts[i].slice(0, eq) === name) {
        try { return decodeURIComponent(parts[i].slice(eq + 1)); } catch (e) { return null; }
      }
    }
    return null;
  }

  function writeCookie(name, value, maxAge) {
    // No `domain=`: the choice is this site's, never the app's.
    var secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = name + "=" + encodeURIComponent(value) + "; Max-Age=" + maxAge + "; Path=/; SameSite=Lax" + secure;
  }

  /* ------------------------------------------------------------ consent */

  var consent = null; // { version, analytics, advertising, at }

  function loadConsent() {
    var raw = readCookie(CONSENT_COOKIE);
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== config.consentVersion) return null;
      return { version: parsed.version, analytics: parsed.analytics === true, advertising: parsed.advertising === true, at: parsed.at || null };
    } catch (e) { return null; }
  }

  function saveConsent(choice) {
    consent = { version: config.consentVersion, analytics: !!choice.analytics, advertising: !!choice.advertising, at: new Date().toISOString() };
    writeCookie(CONSENT_COOKIE, JSON.stringify(consent), CONSENT_MAX_AGE);
    applyConsent();
  }

  function applyConsent() {
    if (consent && consent.analytics) enableAnalytics(); else disableAnalytics();
    if (consent && consent.advertising) loadAdTags();
  }

  /* ------------------------------------------------------------- banner */

  var banner = null;

  var BANNER_CSS = [
    ".ory-consent{position:fixed;left:24px;bottom:24px;z-index:9999;width:380px;max-width:calc(100vw - 48px);box-sizing:border-box;overflow:hidden;background:rgba(255,255,255,0.94);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:#141C2E;border:1px solid rgba(20,28,46,0.10);border-radius:18px;box-shadow:0 1px 2px rgba(20,28,46,0.06),0 16px 40px rgba(20,28,46,0.14);padding:22px 20px 18px;font-family:inherit;font-size:14px;line-height:1.55}",
    ".ory-consent *{box-sizing:border-box}",
    ".ory-consent::before{content:'';position:absolute;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,#037E8F 0%,#1652D9 55%,#6302CC 100%)}",
    ".ory-consent[hidden]{display:none}",
    ".ory-consent-head{display:flex;align-items:center;gap:10px;margin:0 0 8px}",
    ".ory-consent-icon{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:10px;background:rgba(22,82,217,0.08);color:#1652D9}",
    ".ory-consent h2{margin:0;font-size:16px;font-weight:700;letter-spacing:-0.2px;color:#141C2E}",
    ".ory-consent p{margin:0 0 16px;font-size:13.5px;color:#3B4660}",
    ".ory-consent a{color:#1142B0;text-decoration:underline;text-underline-offset:2px}",
    // The choices fold open with a grid-rows transition; visibility keeps the
    // folded switches out of the tab order.
    ".ory-consent-panel{display:grid;grid-template-rows:0fr;visibility:hidden;transition:grid-template-rows .28s ease,visibility 0s linear .28s}",
    ".ory-consent.is-choosing .ory-consent-panel{grid-template-rows:1fr;visibility:visible;transition:grid-template-rows .28s ease,visibility 0s}",
    ".ory-consent-choices{min-height:0;overflow:hidden;margin:0;padding:0;list-style:none}",
    ".ory-consent-choices li{margin:0 0 8px}",
    ".ory-consent-choices li:last-child{margin-bottom:16px}",
    ".ory-consent-choices label{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 12px;border:1px solid rgba(20,28,46,0.10);border-radius:12px;background:#fff;cursor:pointer}",
    ".ory-consent-choices b{display:block;font-weight:600}",
    ".ory-consent-choices small{display:block;font-size:12.5px;color:#3B4660}",
    ".ory-consent-choices input{-webkit-appearance:none;appearance:none;position:relative;flex:none;width:36px;height:20px;margin:0;border-radius:999px;background:#8E95A6;cursor:pointer;transition:background .2s}",
    ".ory-consent-choices input::before{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(20,28,46,0.25);transition:transform .2s}",
    ".ory-consent-choices input:checked{background:#1652D9}",
    ".ory-consent-choices input:checked::before{transform:translateX(16px)}",
    ".ory-consent-choices input:focus-visible{outline:3px solid #1652D9;outline-offset:2px}",
    // Accept and Refuse share size and weight: refusing is as easy as accepting.
    ".ory-consent-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}",
    ".ory-consent button{font:inherit;font-weight:600;font-size:14px;border:0;border-radius:12px;padding:11px 14px;cursor:pointer;color:#fff;transition:background .2s,border-color .2s,transform .2s,box-shadow .2s}",
    ".ory-consent button:active{transform:translateY(0) scale(0.985)}",
    ".ory-consent button:focus-visible{outline:3px solid #1652D9;outline-offset:2px}",
    ".ory-consent button.ory-primary{background:#1652D9}",
    ".ory-consent button.ory-primary:hover{background:#1142B0;transform:translateY(-1px);box-shadow:0 6px 18px rgba(22,82,217,0.35)}",
    ".ory-consent button.ory-dark{background:#141C2E}",
    ".ory-consent button.ory-dark:hover{background:#26304A;transform:translateY(-1px);box-shadow:0 6px 18px rgba(20,28,46,0.25)}",
    ".ory-consent button.ory-link{grid-column:1/-1;background:none;padding:6px;color:#1142B0;font-weight:500;text-decoration:underline;text-underline-offset:2px}",
    ".ory-consent-save{display:none}",
    ".ory-consent button.ory-consent-save{grid-column:1/-1;background:#fff;color:#141C2E;border:1px solid rgba(20,28,46,0.17)}",
    ".ory-consent button.ory-consent-save:hover{border-color:#1652D9;transform:translateY(-1px)}",
    ".ory-consent.is-choosing .ory-consent-save{display:block}",
    ".ory-consent.is-choosing .ory-consent-choose{display:none}",
    // The landing page's mobile sticky bar would sit under the banner.
    ".ory-consent-open .sticky-cta{visibility:hidden !important}",
    "@media (prefers-reduced-motion:no-preference){.ory-consent{animation:ory-consent-in .28s ease both}@keyframes ory-consent-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}}",
    "@media (prefers-reduced-motion:reduce){.ory-consent *,.ory-consent-panel{transition:none !important}}",
    "@media (max-width:480px){.ory-consent{left:0;right:0;bottom:0;width:auto;max-width:none;border-width:1px 0 0;border-radius:18px 18px 0 0;padding:20px 16px calc(16px + env(safe-area-inset-bottom))}.ory-consent-actions{grid-template-columns:1fr}}"
  ].join("\n");

  function buildBanner() {
    if (banner) return banner;
    var style = document.createElement("style");
    style.textContent = BANNER_CSS;
    document.head.appendChild(style);

    banner = document.createElement("div");
    banner.className = "ory-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-labelledby", "ory-consent-title");
    banner.setAttribute("aria-describedby", "ory-consent-desc");
    banner.hidden = true;
    banner.innerHTML =
      '<div class="ory-consent-head">' +
      '<span class="ory-consent-icon" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></svg></span>' +
      '<h2 id="ory-consent-title">Cookies</h2>' +
      "</div>" +
      '<p id="ory-consent-desc">We use cookies to measure how the site is used and how our campaigns perform. Nothing is set until you choose. <a href="/privacy.html">Privacy policy</a></p>' +
      '<div class="ory-consent-panel"><ul class="ory-consent-choices">' +
      '<li><label for="ory-consent-analytics"><span><b>Analytics</b><small>Audience measurement.</small></span><input type="checkbox" role="switch" id="ory-consent-analytics"></label></li>' +
      '<li><label for="ory-consent-advertising"><span><b>Advertising</b><small>Campaign measurement.</small></span><input type="checkbox" role="switch" id="ory-consent-advertising"></label></li>' +
      "</ul></div>" +
      '<div class="ory-consent-actions">' +
      '<button type="button" class="ory-primary" data-ory-consent="accept">Accept all</button>' +
      '<button type="button" class="ory-dark" data-ory-consent="refuse">Refuse all</button>' +
      '<button type="button" class="ory-link ory-consent-choose" data-ory-consent="choose">Customize</button>' +
      '<button type="button" class="ory-consent-save" data-ory-consent="save">Save my choices</button>' +
      "</div>";
    document.body.appendChild(banner);

    banner.addEventListener("click", function (event) {
      var button = event.target.closest("[data-ory-consent]");
      if (!button) return;
      var action = button.getAttribute("data-ory-consent");
      if (action === "accept") { saveConsent({ analytics: true, advertising: true }); hideBanner(); }
      else if (action === "refuse") { saveConsent({ analytics: false, advertising: false }); hideBanner(); }
      else if (action === "choose") { banner.classList.add("is-choosing"); banner.querySelector("#ory-consent-analytics").focus(); }
      else if (action === "save") {
        saveConsent({
          analytics: banner.querySelector("#ory-consent-analytics").checked,
          advertising: banner.querySelector("#ory-consent-advertising").checked
        });
        hideBanner();
      }
    });
    banner.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && consent) hideBanner();
    });
    return banner;
  }

  var lastFocus = null;

  function showBanner(choosing) {
    var el = buildBanner();
    lastFocus = document.activeElement;
    el.querySelector("#ory-consent-analytics").checked = !!(consent && consent.analytics);
    el.querySelector("#ory-consent-advertising").checked = !!(consent && consent.advertising);
    el.classList.toggle("is-choosing", !!choosing);
    el.hidden = false;
    document.documentElement.classList.add("ory-consent-open");
    el.querySelector("[data-ory-consent=accept]").focus();
  }

  function hideBanner() {
    if (!banner) return;
    banner.hidden = true;
    banner.classList.remove("is-choosing");
    document.documentElement.classList.remove("ory-consent-open");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function wireCookieLinks() {
    document.addEventListener("click", function (event) {
      var link = event.target.closest("[data-ory-cookies]");
      if (!link) return;
      event.preventDefault();
      showBanner(true);
    });
  }

  /* ---------------------------------------------------------- attribution */

  function storageGet(store, key) {
    try { return window[store].getItem(key); } catch (e) { return null; }
  }
  function storageSet(store, key, value) {
    try { window[store].setItem(key, value); } catch (e) { /* private mode */ }
  }

  function captureInbound() {
    var params;
    try { params = new URLSearchParams(location.search); } catch (e) { return; }
    var got = {};
    ATTR_KEYS.forEach(function (key) { var v = params.get(key); if (v) got[key] = v.slice(0, 200); });
    if (Object.keys(got).length > 0) {
      got.landing = location.pathname;
      got.referrer = document.referrer || "";
      storageSet("sessionStorage", ATTR_STORAGE, JSON.stringify(got));
    }
    if (!storageGet("sessionStorage", LANDING_STORAGE)) {
      storageSet("sessionStorage", LANDING_STORAGE, location.pathname);
    }
  }

  function attribution() {
    try { return JSON.parse(storageGet("sessionStorage", ATTR_STORAGE) || "{}"); } catch (e) { return {}; }
  }

  function landingPath() {
    return storageGet("sessionStorage", LANDING_STORAGE) || location.pathname;
  }

  /* Every link into the app carries the visitor's own inbound params: the
     inbound utm_* override the link's defaults, so a LinkedIn visitor reaches
     the app as utm_source=linkedin. Link-level, so it needs no cookie. */
  function decorateAppLinks() {
    var inbound = attribution();
    var links = document.querySelectorAll("[data-app-link]");
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var url;
      try { url = new URL(link.getAttribute("href"), location.href); } catch (e) { continue; }
      ATTR_KEYS.forEach(function (key) { if (inbound[key]) url.searchParams.set(key, inbound[key]); });
      link.setAttribute("href", url.toString());
      link.addEventListener("click", function (event) {
        var target = event.currentTarget;
        capture("site_cta_clicked", { section: target.getAttribute("data-app-link") || "page", target: "request-access" });
      });
    }
  }

  /* ------------------------------------------------------------- PostHog */

  var posthogLoaded = false;

  function loadPostHog() {
    if (posthogLoaded || !config.posthogKey) return;
    posthogLoaded = true;
    // The official snippet: a queueing stub, then array.js from the EU host.
    /* eslint-disable */
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    /* eslint-enable */
    window.posthog.init(config.posthogKey, {
      api_host: config.posthogHost || "https://eu.i.posthog.com",
      // Nothing is captured until the visitor accepts analytics.
      opt_out_capturing_by_default: true,
      person_profiles: "identified_only",
      // The default, stated on purpose: the cookie sits on .oryjin.com, so a
      // visitor who later signs in to app.oryjin.com is the same person.
      cross_subdomain_cookie: true,
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: true
    });
  }

  function analyticsOn() {
    return !!(consent && consent.analytics && window.posthog && posthogLoaded);
  }

  function enableAnalytics() {
    loadPostHog();
    if (window.posthog && posthogLoaded) {
      window.posthog.opt_in_capturing();
      flushQueue();
    }
  }

  function disableAnalytics() {
    if (window.posthog && posthogLoaded) window.posthog.opt_out_capturing();
  }

  var queue = [];

  function capture(name, props) {
    if (analyticsOn()) { window.posthog.capture(name, props || {}); return; }
    if (!consent) queue.push([name, props || {}]); // asked before answering: keep this page's events
  }

  function flushQueue() {
    var pending = queue; queue = [];
    pending.forEach(function (entry) { window.posthog.capture(entry[0], entry[1]); });
  }

  function distinctId() {
    if (!analyticsOn()) return null;
    try { return window.posthog.get_distinct_id() || null; } catch (e) { return null; }
  }

  /* ------------------------------------------------------- dataLayer shim */

  /* The pages push GTM-style objects; the ad tags will read them. Each is
     forwarded under a stable PostHog name. Properties pass through only when
     they are short primitives, so no free text can ride along by mistake. */
  var EVENT_NAMES = {
    scroll_depth: "site_scroll_depth",
    tour_tab: "site_tour_tab",
    form_start: "site_form_started",
    generate_lead: "site_lead_submitted",
    newsletter_subscribe: "site_newsletter_subscribed",
    cta_click: "site_cta_clicked",
    why_step: "site_why_step"
  };

  function forward(entry) {
    if (!entry || typeof entry !== "object" || typeof entry.event !== "string") return;
    var name = EVENT_NAMES[entry.event] || ("site_" + entry.event.replace(/[^a-z0-9_]/gi, "_"));
    var props = {};
    Object.keys(entry).forEach(function (key) {
      if (key === "event" || key === "form") return;
      var value = entry[key];
      if (typeof value === "number" || typeof value === "boolean") props[key] = value;
      else if (typeof value === "string" && value.length <= 80) props[key] = value;
    });
    if (entry.event === "cta_click") { props = { section: entry.placement || "page", target: "apply" }; }
    capture(name, props);
  }

  function installDataLayer() {
    var existing = window.dataLayer || [];
    var layer = [];
    layer.push = function () {
      for (var i = 0; i < arguments.length; i++) { Array.prototype.push.call(layer, arguments[i]); forward(arguments[i]); }
      return layer.length;
    };
    window.dataLayer = layer;
    for (var j = 0; j < existing.length; j++) layer.push(existing[j]);
  }

  /* ------------------------------------------------------------ ad tags */

  var adTagsLoaded = false;

  function loadAdTags() {
    if (adTagsLoaded) return;
    adTagsLoaded = true;
    if (config.linkedinPartnerId) {
      window._linkedin_partner_id = config.linkedinPartnerId;
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(config.linkedinPartnerId);
      var li = document.createElement("script");
      li.async = true;
      li.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
      document.head.appendChild(li);
    }
    if (config.googleAdsId) {
      window.dataLayer = window.dataLayer || [];
      var gtagLayer = window.dataLayer;
      window.gtag = window.gtag || function () { Array.prototype.push.call(gtagLayer, arguments); };
      var g = document.createElement("script");
      g.async = true;
      g.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(config.googleAdsId);
      document.head.appendChild(g);
      window.gtag("js", new Date());
      window.gtag("config", config.googleAdsId, { allow_ad_personalization_signals: false });
    }
  }

  /* The ad-platform conversions, fired by index.html's trackConversion once
     a lead landed. Each only when its tag loaded (advertising consent + id). */
  function conversion() {
    if (window.lintrk && config.linkedinConversionId) {
      try { window.lintrk("track", { conversion_id: config.linkedinConversionId }); } catch (e) { /* tag not ready */ }
    }
    if (window.gtag && config.googleAdsId && config.googleAdsLeadLabel) {
      try { window.gtag("event", "conversion", { send_to: config.googleAdsId + "/" + config.googleAdsLeadLabel }); } catch (e) { /* tag not ready */ }
    }
  }

  /* --------------------------------------------------- the lead to the app */

  /* POST the early-access form to the app's lead desk. Resolves `true` when
     the app answered 201, `false` otherwise — never throws, never blocks the
     user: index.html runs web3forms after it whatever it answered. */
  function postLead(lead, timeoutMs) {
    var base = (config.appUrl || "").replace(/\/+$/, "");
    if (!base || typeof fetch !== "function") return Promise.resolve(false);
    var controller = typeof AbortController === "function" ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, timeoutMs || 6000) : null;
    var attr = attribution();
    var payload = {};
    Object.keys(lead).forEach(function (key) { if (lead[key] !== undefined && lead[key] !== "") payload[key] = lead[key]; });
    payload.consent = true;
    payload.consentVersion = config.consentVersion;
    payload.locale = payload.locale || "en";
    var attribution_ = {
      utmSource: attr.utm_source, utmMedium: attr.utm_medium, utmCampaign: attr.utm_campaign,
      utmContent: attr.utm_content, utmTerm: attr.utm_term,
      referrer: attr.referrer || document.referrer || "",
      landingPath: landingPath(),
      analyticsDistinctId: distinctId() || ""
    };
    var clickIds = { gclid: attr.gclid, liFatId: attr.li_fat_id, msclkid: attr.msclkid };
    var cleanedClicks = {};
    Object.keys(clickIds).forEach(function (key) { if (clickIds[key]) cleanedClicks[key] = clickIds[key]; });
    var cleaned = {};
    Object.keys(attribution_).forEach(function (key) { if (attribution_[key]) cleaned[key] = String(attribution_[key]).slice(0, 500); });
    if (Object.keys(cleanedClicks).length > 0) cleaned.clickIds = cleanedClicks;
    if (Object.keys(cleaned).length > 0) payload.attribution = cleaned;

    return fetch(base + "/api/leads", {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      signal: controller ? controller.signal : undefined
    }).then(function (response) {
      if (timer) clearTimeout(timer);
      return response.status === 201;
    }).catch(function (error) {
      if (timer) clearTimeout(timer);
      if (window.console && console.warn) console.warn("lead post to the app failed:", error && error.message);
      return false;
    });
  }

  /* -------------------------------------------------------------- boot */

  function boot() {
    captureInbound();
    installDataLayer();
    consent = loadConsent();
    applyConsent();
    decorateAppLinks();
    wireCookieLinks();
    if (document.querySelector(".guide-cta")) capture("site_faq_opened", { page: location.pathname });
    if (!consent && config.posthogKey) showBanner(false);
    else if (!consent && (config.linkedinPartnerId || config.googleAdsId)) showBanner(false);
  }

  window.OryjinSite = {
    consent: {
      get: function () { return consent ? { analytics: consent.analytics, advertising: consent.advertising, version: consent.version } : null; },
      open: function () { showBanner(true); },
      set: function (choice) { saveConsent(choice || {}); hideBanner(); }
    },
    attribution: attribution,
    landingPath: landingPath,
    distinctId: distinctId,
    capture: capture,
    postLead: postLead,
    conversion: conversion
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
