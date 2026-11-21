/* Notebook system, the part CSS cannot do (rules in style.css, "Notebook system").
 * 1. The vertical grid lines start at the left edge of the content.
 * 2. Boxes whose content has any height (calculator, details, formula, embed box)
 *    are rounded up to 24n+1 px, so their bottom stroke lies on a grid line.
 * 3. Every block of text and every box starts on a grid line: text blocks get
 *    padding above them, boxes get margin (padding would move their stroke).
 * 4. Each line of text is nudged so its baseline sits on a grid line, measured on
 *    the font this browser actually uses (fonts differ between Windows, Mac, iPhone).
 * Re-runs whenever the page size changes (a result appears, a section opens). */
(function () {
  var G = 24;
  var BOX = "main .calc, main details:not(.g-row), main .formula, main .embed-box";
  var TEXT = "main h1, main h2, main h3, main p, main ul, main ol, main .crumbs, main .jump-links";
  var EDGE = "main .table-wrap, main .search, .site-footer";
  var INSIDE = ".calc, details, table, .formula, .embed-box, .live-visual, .search-hits, .g-row, .g-head, li";
  var NUDGE = "main h1, main h2, main h3, main p, main li, main .crumbs, main .jump-links, main .g-name, .site-footer .wrap > *";
  var NO_NUDGE = ".calc, details:not(.g-row), table, .formula, .embed-box, .search-hits, .results-list";
  var busy = false;
  function nudgeOf(cs) { return cs.position === "relative" ? (parseFloat(cs.top) || 0) : 0; }
  function mod(x) { return ((x % G) + G) % G; }
  function baseline(el) {
    // an inline wrapper keeps the probe on the text's first line, even in flex containers
    var wrap = document.createElement("span"), probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;padding:0;margin:0;border:0";
    wrap.appendChild(probe); wrap.appendChild(document.createTextNode("​"));
    el.insertBefore(wrap, el.firstChild);
    var y = probe.getBoundingClientRect().top + window.scrollY;
    el.removeChild(wrap);
    return y;
  }
  function run() {
    if (busy) return; busy = true;
    var main = document.querySelector("main");
    if (main) document.documentElement.style.setProperty("--grid-x", mod(main.getBoundingClientRect().left) + "px");
    var boxes = Array.prototype.slice.call(document.querySelectorAll(BOX));
    var all = Array.prototype.slice.call(document.querySelectorAll(BOX + "," + TEXT + "," + EDGE));
    var texts = Array.prototype.slice.call(document.querySelectorAll(NUDGE));
    all.forEach(function (el) { el.style.paddingTop = ""; el.style.marginTop = ""; });
    boxes.forEach(function (el) { el.style.minHeight = ""; });
    texts.forEach(function (el) { el.style.top = ""; });
    // round boxes up to 24n+1, innermost first
    for (var i = boxes.length - 1; i >= 0; i--) {
      if (boxes[i].offsetParent === null) continue;
      var h = boxes[i].getBoundingClientRect().height;
      var want = Math.ceil((h - 1) / G - 0.02) * G + 1;
      if (Math.abs(want - h) > 0.3) boxes[i].style.minHeight = want + "px";
    }
    // put every top-level block on a line, top to bottom
    for (var j = 0; j < all.length; j++) {
      var el = all[j];
      if (el.parentElement && el.parentElement.closest(INSIDE)) continue;
      var cs = getComputedStyle(el);
      if (cs.display === "none" || cs.position === "absolute" || cs.position === "fixed") continue;
      var isBox = el.matches(BOX + "," + EDGE);
      var top = el.getBoundingClientRect().top + window.scrollY - nudgeOf(cs) + (isBox ? 0 : parseFloat(cs.borderTopWidth) + parseFloat(cs.paddingTop));
      var r = mod(top);
      if (r < 0.3 || G - r < 0.3) continue;
      if (isBox) el.style.marginTop = (parseFloat(cs.marginTop) + G - r) + "px";
      else el.style.paddingTop = (parseFloat(cs.paddingTop) + G - r) + "px";
    }
    // baselines onto the lines, measured
    for (var k = 0; k < texts.length; k++) {
      var t = texts[k];
      if (t.closest(NO_NUDGE) || (t.parentElement && t.parentElement.closest(NUDGE))) continue;
      if (t.offsetParent === null || !t.textContent.trim()) continue;
      var tcs = getComputedStyle(t);
      if (tcs.position !== "relative" && tcs.position !== "static") continue;
      var y = baseline(t) - nudgeOf(tcs);
      var d = mod(y);                       // how far the baseline sits below a line
      var shift = d > G / 2 ? G - d : -d;   // smallest move onto a line
      t.style.position = "relative";
      t.style.top = shift.toFixed(2) + "px";
    }
    busy = false;
  }
  run();
  var queued = false;
  function later() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; run(); }); } }
  if (window.ResizeObserver) new ResizeObserver(later).observe(document.body);
  window.addEventListener("load", later);
  window.addEventListener("resize", later);
})();
