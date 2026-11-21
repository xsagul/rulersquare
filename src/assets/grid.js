/* Notebook rhythm: start every block of text on a 24 px grid line.
 * CSS keeps line heights and spacing in whole squares; this only fixes the
 * blocks that follow a box whose height is not a whole number of squares
 * (calculator, drawing, embed box). It adds padding above the block, never
 * moves the box, and re-runs when the page height changes. */
(function () {
  var G = 24;
  var SEL = "main h1, main h2, main h3, main p, main ul, main ol, main .crumbs, main .jump-links, main .byline, main .g-all, main .g-sub, .site-footer .wrap";
  var SKIP = ".calc, table, details, .formula, .embed-box, .live-visual, .search-hits, .g-row, .g-head, .nav-drawer, .related-links li, .g-list, li";
  var busy = false;
  function snap() {
    if (busy) return; busy = true;
    var els = document.querySelectorAll(SEL);
    for (var i = 0; i < els.length; i++) els[i].style.paddingTop = "";
    for (var j = 0; j < els.length; j++) {
      var el = els[j];
      if (el.closest(SKIP) && !el.matches(".site-footer .wrap")) continue;
      var cs = getComputedStyle(el);
      if (cs.display === "none" || cs.position === "absolute" || cs.position === "fixed") continue;
      // rect includes the visual nudge of position:relative headings; take it out
      var nudge = cs.position === "relative" ? (parseFloat(cs.top) || 0) : 0;
      var top = el.getBoundingClientRect().top + window.scrollY - nudge + parseFloat(cs.borderTopWidth) + parseFloat(cs.paddingTop);
      var r = ((top % G) + G) % G;
      if (r > 0.5 && G - r > 0.5) el.style.paddingTop = (parseFloat(cs.paddingTop) + G - r) + "px";
    }
    busy = false;
  }
  snap();
  var queued = false;
  function later() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; snap(); }); } }
  if (window.ResizeObserver) new ResizeObserver(later).observe(document.body);
  window.addEventListener("load", later);
})();
