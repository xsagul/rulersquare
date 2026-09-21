/* Header search and the mobile drawer.
 *
 * On a wide screen the search sits in the bar. On a phone it moves into a
 * drawer that slides over the page, the way the category leaders do it: the
 * page behind is frozen so a scroll gesture stays in the menu, and an explicit
 * close button sits where a thumb reaches.
 */
(function () {
  "use strict";

  var index = window.RS_INDEX || [];
  var header = document.querySelector(".site-header");
  if (!header) { return; }

  var toggle = document.getElementById("nav-toggle");
  var drawer = document.getElementById("nav-panel");
  var backdrop = document.getElementById("nav-backdrop");
  var closeBtn = document.getElementById("nav-close");

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
      // Force a frame so the transition runs from the closed position.
      void backdrop.offsetWidth;
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
      // Focus the close button, not the search field. Focusing an input here
      // is what makes a phone pan and zoom toward it as the drawer appears.
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
  // Coming back via the back button must not leave the page frozen.
  window.addEventListener("pageshow", function () {
    if (drawer && drawer.classList.contains("on")) setOpen(false);
  });
  window.matchMedia("(min-width: 861px)").addEventListener("change", function (e) {
    if (e.matches && drawer.classList.contains("on")) setOpen(false);
  });

  // ---------- search ----------
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function score(item, q) {
    var t = item.t.toLowerCase();
    if (t.indexOf(q) === 0) { return 3; }
    if (t.indexOf(q) > -1) { return 2; }
    if ((item.k + " " + item.d).toLowerCase().indexOf(q) > -1) { return 1; }
    return 0;
  }

  function wire(input, hits, limit) {
    if (!input || !hits || !index.length) { return; }
    function render() {
      var q = input.value.trim().toLowerCase();
      if (!q) { hits.hidden = true; hits.innerHTML = ""; return; }
      var found = index
        .map(function (it) { return { it: it, s: score(it, q) }; })
        .filter(function (r) { return r.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, limit);

      hits.innerHTML = found.length
        ? found.map(function (r) {
            return '<li><a href="' + r.it.u + '">' + esc(r.it.t) + "</a></li>";
          }).join("")
        : '<li class="empty">Nothing matches that yet.</li>';
      hits.hidden = false;
    }
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { input.value = ""; render(); }
      if (e.key === "Enter") {
        var first = hits.querySelector("a");
        if (first) { e.preventDefault(); window.location.href = first.getAttribute("href"); }
      }
    });
    document.addEventListener("click", function (e) {
      if (!hits.contains(e.target) && e.target !== input) { hits.hidden = true; }
    });
  }

  wire(document.getElementById("nav-q"), document.getElementById("nav-hits"), 6);
  wire(document.getElementById("drawer-q"), document.getElementById("drawer-hits"), 8);
})();
