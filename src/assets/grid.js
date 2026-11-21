/* Notebook system, the part CSS cannot do (rules in style.css, "Notebook system").
 * 1. Boxes whose content has any height (calculator, details, formula, embed box)
 *    are rounded up to 24n+1 px, so their bottom stroke lies on a grid line.
 * 2. Every block of text and every box starts on a grid line: text blocks get
 *    padding above them, boxes get margin (padding would move their stroke).
 * Re-runs whenever the page height changes (a result appears, a section opens). */
(function () {
  var G = 24;
  var BOX = "main .calc, main details:not(.g-row), main .formula, main .embed-box";
  var TEXT = "main h1, main h2, main h3, main p, main ul, main ol, main .crumbs, main .jump-links";
  var EDGE = "main .table-wrap, main .search, .site-footer";
  var INSIDE = ".calc, details, table, .formula, .embed-box, .live-visual, .search-hits, .g-row, .g-head, li";
  var busy = false;
  function docTop(el, cs) {
    var nudge = cs.position === "relative" ? (parseFloat(cs.top) || 0) : 0;
    return el.getBoundingClientRect().top + window.scrollY - nudge;
  }
  function run() {
    if (busy) return; busy = true;
    var boxes = Array.prototype.slice.call(document.querySelectorAll(BOX));
    var all = Array.prototype.slice.call(document.querySelectorAll(BOX + "," + TEXT + "," + EDGE));
    all.forEach(function (el) { el.style.paddingTop = ""; el.style.marginTop = ""; });
    boxes.forEach(function (el) { el.style.minHeight = ""; });
    // 1. round boxes up to 24n+1, innermost first
    for (var i = boxes.length - 1; i >= 0; i--) {
      if (boxes[i].offsetParent === null) continue;
      var h = boxes[i].getBoundingClientRect().height;
      var want = Math.ceil((h - 1) / G - 0.02) * G + 1;
      if (Math.abs(want - h) > 0.3) boxes[i].style.minHeight = want + "px";
    }
    // 2. put every top-level block on a line, top to bottom
    for (var j = 0; j < all.length; j++) {
      var el = all[j];
      if (el.parentElement && el.parentElement.closest(INSIDE)) continue;
      var cs = getComputedStyle(el);
      if (cs.display === "none" || cs.position === "absolute" || cs.position === "fixed") continue;
      var isBox = el.matches(BOX + "," + EDGE);
      var top = docTop(el, cs) + (isBox ? 0 : parseFloat(cs.borderTopWidth) + parseFloat(cs.paddingTop));
      var r = ((top % G) + G) % G;
      if (r < 0.3 || G - r < 0.3) continue;
      if (isBox) el.style.marginTop = (parseFloat(cs.marginTop) + G - r) + "px";
      else el.style.paddingTop = (parseFloat(cs.paddingTop) + G - r) + "px";
    }
    busy = false;
  }
  run();
  var queued = false;
  function later() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; run(); }); } }
  if (window.ResizeObserver) new ResizeObserver(later).observe(document.body);
  window.addEventListener("load", later);
})();
