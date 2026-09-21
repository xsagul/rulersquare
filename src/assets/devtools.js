/* Local-only helper. Shipped only by `node build.js --dev`, never by the build
 * that gets deployed, and it refuses to draw anything outside localhost even
 * if a dev bundle escapes by accident.
 *
 * Translation goes through Google's proxy of the live site rather than the
 * local file, because the proxy cannot reach localhost. That means it shows
 * the last deployed copy of the page, not unsaved local edits.
 */
(function () {
  "use strict";

  var LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (!LOCAL) { return; }

  var LIVE_HOST = "rulersquare-com.translate.goog";

  function translateUrl() {
    return "https://" + LIVE_HOST + location.pathname +
      "?_x_tr_sl=en&_x_tr_tl=ro&_x_tr_hl=ro";
  }

  var style = document.createElement("style");
  style.textContent =
    ".rs-dev{position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;" +
    "flex-direction:column;gap:8px;align-items:flex-end;font:500 14px/1 system-ui,sans-serif}" +
    ".rs-dev a,.rs-dev button{all:unset;box-sizing:border-box;cursor:pointer;" +
    "background:#1a1a1a;color:#fff;padding:10px 14px;border-radius:999px;" +
    "box-shadow:0 4px 14px rgb(0 0 0/.25);display:flex;gap:8px;align-items:center}" +
    ".rs-dev a:hover,.rs-dev button:hover{background:#333}" +
    ".rs-dev .tag{position:absolute;right:0;bottom:100%;margin-bottom:8px;" +
    "background:#c2410c;color:#fff;padding:3px 8px;border-radius:999px;font-size:11px}";
  document.head.appendChild(style);

  var box = document.createElement("div");
  box.className = "rs-dev";
  box.innerHTML =
    '<span class="tag">local only</span>' +
    '<a id="rs-tr" target="_blank" rel="noopener">\u{1F1EC}\u{1F1E7} → \u{1F1F7}\u{1F1F4} Traducere</a>';
  document.body.appendChild(box);

  var link = document.getElementById("rs-tr");
  link.href = translateUrl();
  link.title = "Deschide versiunea publicată a acestei pagini, tradusă în română";
})();
