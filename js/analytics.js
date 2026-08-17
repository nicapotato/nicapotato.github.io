/**
 * GoatCounter pageviews + portfolio card clicks.
 *
 * Same site as Stuff: https://nicapotato.goatcounter.com
 * Paths are prefixed with location.host
 * (https://nicapotato.goatcounter.com/help/domains).
 *
 * Portfolio events:
 *   path  = {host}/portfolio-{item}
 *   title = item + href + session + ISO timestamp
 */
(function () {
  var ENDPOINT = "https://nicapotato.goatcounter.com/count";
  var SESSION_KEY = "np-gc-sid";
  var SESSION_TTL_MS = 30 * 60 * 1000;
  var queue = [];
  var ready = false;

  function randomId() {
    if (window.crypto && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    var bytes = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) {
      crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    var hex = [];
    for (var j = 0; j < 16; j++) {
      hex.push((bytes[j] + 256).toString(16).slice(1));
    }
    return (
      hex.slice(0, 4).join("") +
      "-" +
      hex.slice(4, 6).join("") +
      "-" +
      hex.slice(6, 8).join("") +
      "-" +
      hex.slice(8, 10).join("") +
      "-" +
      hex.slice(10, 16).join("")
    );
  }

  function persistSession(id) {
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ id: id, ts: Date.now() })
      );
    } catch (e) {}
  }

  function isSessionId(value) {
    return typeof value === "string" && /^[0-9a-f-]{8,36}$/i.test(value);
  }

  function sessionId() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (
          parsed &&
          isSessionId(parsed.id) &&
          typeof parsed.ts === "number" &&
          Date.now() - parsed.ts < SESSION_TTL_MS
        ) {
          persistSession(parsed.id);
          return parsed.id;
        }
      }
    } catch (e) {}
    var id = randomId();
    persistSession(id);
    return id;
  }

  function slug(s) {
    var out = String(s || "unknown")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    return out || "unknown";
  }

  function flush() {
    if (!ready || !window.goatcounter || typeof window.goatcounter.count !== "function") {
      return;
    }
    while (queue.length) {
      window.goatcounter.count(queue.shift());
    }
  }

  function trackPortfolio(item, href) {
    var name = slug(item);
    var sid = sessionId();
    var ts = new Date().toISOString();
    queue.push({
      path: location.host + "/portfolio-" + name,
      title:
        "portfolio item=" +
        (item || "unknown") +
        " href=" +
        (href || "") +
        " session=" +
        sid +
        " ts=" +
        ts,
      event: true,
      no_session: true,
    });
    flush();
  }

  window.goatcounter = window.goatcounter || {};
  window.goatcounter.endpoint = ENDPOINT;
  window.goatcounter.path = function (p) {
    return location.host + p;
  };
  if (/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) {
    window.goatcounter.allow_local = true;
  }

  var script = document.createElement("script");
  script.async = true;
  script.src = "https://gc.zgo.at/count.js";
  script.onload = function () {
    ready = true;
    flush();
  };
  document.head.appendChild(script);

  document.addEventListener("click", function (ev) {
    var card = ev.target.closest("a.nt-blog-card");
    if (!card) return;
    var item = card.getAttribute("data-portfolio-item");
    if (!item) {
      throw new Error("portfolio card missing data-portfolio-item");
    }
    trackPortfolio(item, card.getAttribute("href") || "");
  });
})();
