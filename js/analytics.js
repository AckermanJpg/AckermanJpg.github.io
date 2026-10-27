(function () {
  "use strict";

  var GA_MEASUREMENT_ID = "G-MC5V2JL08S";
  var CONSENT_KEY = "kenny-consent";
  var enabled = /^G-[A-Z0-9]{6,}$/.test(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== "G-XXXXXXXXXX";

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500
  });
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", false);

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }
  function saveConsent(v) {
    try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {}
  }
  function applyConsent(v) {
    gtag("consent", "update", { analytics_storage: v === "granted" ? "granted" : "denied" });
  }

  var stored = readConsent();
  if (stored) applyConsent(stored);

  if (enabled) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", GA_MEASUREMENT_ID);
  }

  window.kTrack = function (name, params) {
    if (!enabled) return;
    gtag("event", name, params || {});
  };

  document.addEventListener("DOMContentLoaded", function () {
    var banner = document.querySelector(".consent");
    if (!banner) return;
    if (enabled && !stored) banner.hidden = false;

    banner.querySelectorAll("[data-consent]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-consent") === "granted" ? "granted" : "denied";
        saveConsent(v);
        applyConsent(v);
        banner.hidden = true;
      });
    });
    document.querySelectorAll("[data-open-consent]").forEach(function (b) {
      b.addEventListener("click", function () { banner.hidden = false; });
    });
  });

  if (!enabled || !("PerformanceObserver" in window)) return;

  function send(name, value) {
    gtag("event", name, { value: Math.round(name === "CLS" ? value * 1000 : value), metric_value: value, non_interaction: true });
  }

  try {
    var lcp = 0;
    new PerformanceObserver(function (l) {
      var e = l.getEntries(); if (e.length) lcp = e[e.length - 1].startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });

    var cls = 0;
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) { if (!e.hadRecentInput) cls += e.value; });
    }).observe({ type: "layout-shift", buffered: true });

    var inp = 0;
    new PerformanceObserver(function (l) {
      l.getEntries().forEach(function (e) { if (e.interactionId && e.duration > inp) inp = e.duration; });
    }).observe({ type: "event", buffered: true, durationThreshold: 40 });

    var sent = false;
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState !== "hidden" || sent) return;
      sent = true;
      if (lcp) send("LCP", lcp);
      send("CLS", cls);
      if (inp) send("INP", inp);
    });
  } catch (e) {}
})();
