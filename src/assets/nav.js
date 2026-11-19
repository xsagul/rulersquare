/* Header search (lazy-loaded JSON index) and accessible mobile drawer. */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  if (!header) { return; }

  var toggle = document.getElementById("nav-toggle");
  var drawer = document.getElementById("nav-panel");
  var backdrop = document.getElementById("nav-backdrop");
  var closeBtn = document.getElementById("nav-close");

  // ---------- shared lazy search index ----------
  window.RSGetIndex = function () {
    if (window.__rsIndex) { return Promise.resolve(window.__rsIndex); }
    if (window.RS_INDEX && window.RS_INDEX.length) {
      window.__rsIndex = window.RS_INDEX;
      return Promise.resolve(window.__rsIndex);
    }
    if (!window.__rsIndexPromise) {
      var url = window.RS_INDEX_URL || "/assets/search-index.json";
      window.__rsIndexPromise = fetch(url)
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (data) { window.__rsIndex = Array.isArray(data) ? data : []; return window.__rsIndex; })
        .catch(function () { return []; });
    }
    return window.__rsIndexPromise;
  };

  // ---------- drawer ----------
  var lastFocus = null;
  var closeTimer;

  function setOpen(open) {
    if (!drawer || !backdrop) { return; }
    window.clearTimeout(closeTimer);
    drawer.inert = !open;
    document.querySelector("main").inert = open;
    document.querySelector(".site-header").inert = open;
    document.querySelector(".site-footer").inert = open;
    if (open) {
      lastFocus = document.activeElement;
      backdrop.hidden = false;
      void backdrop.offsetWidth;
      window.RSGetIndex();
    }
    drawer.classList.toggle("on", open);
    backdrop.classList.toggle("on", open);
    document.body.classList.toggle("nav-open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    if (toggle) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    if (open) {
      if (closeBtn) { closeBtn.focus(); }
    } else {
      closeTimer = window.setTimeout(function () { backdrop.hidden = true; }, 240);
      if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
    }
  }

  if (toggle) { toggle.addEventListener("click", function () { setOpen(!drawer.classList.contains("on")); }); }
  if (closeBtn) { closeBtn.addEventListener("click", function () { setOpen(false); }); }
  if (backdrop) { backdrop.addEventListener("click", function () { setOpen(false); }); }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer && drawer.classList.contains("on")) { setOpen(false); }
    if (e.key === "Tab" && drawer && drawer.classList.contains("on")) {
      var items = Array.from(drawer.querySelectorAll("a,button,input")).filter(function (el) { return el.getClientRects().length > 0; });
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener("pageshow", function () {
    if (drawer && drawer.classList.contains("on")) setOpen(false);
  });
  window.matchMedia("(min-width: 961px)").addEventListener("change", function (e) {
    if (e.matches && drawer.classList.contains("on")) setOpen(false);
  });

  // ---------- search ----------
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  window.RSScoreItem = function (item, q) {
    var t = item.t.toLowerCase();
    var hay = t + " " + (item.k || "").toLowerCase() + " " + (item.d || "").toLowerCase();
    if (t.indexOf(q) === 0) { return 6; }
    if (t.indexOf(q) > -1) { return 4; }
    if (hay.indexOf(q) > -1) { return 2; }
    var tokens = q.split(/\s+/).filter(Boolean);
    if (tokens.length > 1) {
      var matched = 0;
      for (var i = 0; i < tokens.length; i++) {
        if (hay.indexOf(tokens[i]) > -1) { matched++; }
      }
      if (matched === tokens.length) { return 3; }
    }
    return 0;
  };

  function wire(input, hits, limit) {
    if (!input || !hits) { return; }
    function render(index) {
      var q = input.value.trim().toLowerCase();
      if (!q) { hits.hidden = true; hits.innerHTML = ""; return; }
      var found = index
        .map(function (it) { return { it: it, s: window.RSScoreItem(it, q) }; })
        .filter(function (r) { return r.s > 0; })
        .sort(function (a, b) { return b.s - a.s || a.it.t.localeCompare(b.it.t); })
        .slice(0, limit);

      hits.innerHTML = found.length
        ? found.map(function (r) {
            return '<li><a href="' + r.it.u + '">' + esc(r.it.t) + "</a></li>";
          }).join("")
        : '<li class="empty">No matching calculator found.</li>';
      hits.hidden = false;
    }
    input.addEventListener("focus", function () { window.RSGetIndex(); });
    input.addEventListener("input", function () { window.RSGetIndex().then(render); });
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; hits.hidden = true; hits.innerHTML = ""; }
      if (e.key === "Enter") {
        var first = hits.querySelector("a");
        if (first) { e.preventDefault(); window.location.href = first.getAttribute("href"); }
      }
    });
    document.addEventListener("click", function (e) {
      if (!hits.contains(e.target) && e.target !== input) { hits.hidden = true; }
    });
  }

  wire(document.getElementById("nav-q"), document.getElementById("nav-hits"), 7);
  wire(document.getElementById("drawer-q"), document.getElementById("drawer-hits"), 8);
})();
