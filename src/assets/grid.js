/* Notebook system, the part CSS cannot do (rules in style.css, "Notebook system").
 * 1. The vertical grid lines start at the left edge of the content.
 * 2. Boxes whose content has any height (calculator, details, formula, embed box)
 *    are rounded up to 24n+1 px, so their bottom stroke lies on a grid line.
 * 3. Every block of text and every box starts on a grid line: text blocks get
 *    padding above them, boxes get margin (padding would move their stroke).
 * 4. Each line of text is nudged so its baseline sits on a grid line, measured on
 *    the font this browser actually uses (fonts differ between Windows, Mac, iPhone).
 * It only writes where something is off the grid, and every value is rounded to a
 * whole screen pixel: rewriting everything on each change (a group closing) moved
 * all the text below by a hair on 3x screens, from rounding.
 * Re-runs whenever the width or the content height changes. */
(function () {
  var G = 24;
  var BOX = "main .calc, main details:not(.g-row), main .formula, main .embed-box";
  var TEXT = "main h1, main h2, main h3, main p, main ul, main ol, main .crumbs, main .jump-links";
  var EDGE = "main .table-wrap, main .search, .site-footer";
  var INSIDE = ".calc, details, table, .formula, .embed-box, .live-visual, .search-hits, .g-row, .g-head, li";
  var NUDGE = "main h1, main h2, main h3, main p, main li, main .crumbs, main .jump-links, main .g-name, .site-footer .wrap > *";
  var NO_NUDGE = ".calc, details:not(.g-row), table, .formula, .embed-box, .search-hits, .results-list";
  var TOL = 0.5;
  var busy = false;
  function px(x) { var r = window.devicePixelRatio || 1; return Math.round(x * r) / r; }
  function nudgeOf(cs) { return cs.position === "relative" ? (parseFloat(cs.top) || 0) : 0; }
  function mod(x) { return ((x % G) + G) % G; }
  function onLine(x) { var m = mod(x); return m < TOL || G - m < TOL; }
  // positions are taken against the page itself, not window.scrollY: on iPhones the
  // address bar animating in and out moves scrollY out of step with the layout
  function pageTop() { return document.documentElement.getBoundingClientRect().top; }
  function baseline(el) {
    // an inline wrapper keeps the probe on the text's first line, even in flex containers
    var wrap = document.createElement("span"), probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline;padding:0;margin:0;border:0";
    wrap.appendChild(probe); wrap.appendChild(document.createTextNode("​"));
    el.insertBefore(wrap, el.firstChild);
    var y = probe.getBoundingClientRect().top - pageTop();
    el.removeChild(wrap);
    return y;
  }
  var lastKey = "";
  function key() { return document.documentElement.clientWidth + "|" + document.body.offsetHeight; }
  function run() {
    if (busy) return; busy = true;
    var main = document.querySelector("main");
    if (main) {
      var gx = px(mod(main.getBoundingClientRect().left)) + "px";
      if (document.documentElement.style.getPropertyValue("--grid-x") !== gx) document.documentElement.style.setProperty("--grid-x", gx);
    }
    // 1. round boxes up to 24n+1, innermost first (measured without our min-height, same task, no paint)
    var boxes = document.querySelectorAll(BOX);
    for (var i = boxes.length - 1; i >= 0; i--) {
      var b = boxes[i];
      if (b.offsetParent === null) continue;
      var had = b.style.minHeight;
      b.style.minHeight = "";
      var h = b.getBoundingClientRect().height;
      var want = Math.ceil((h - 1) / G - 0.02) * G + 1;
      var next = Math.abs(want - h) > 0.3 ? want + "px" : "";
      b.style.minHeight = next === "" ? "" : next;
      if (had === next) b.style.minHeight = had;
    }
    // 2. every top-level block on a line, top to bottom; only change what is off.
    // A block that lands 1–3 px past a line (content a hair taller than whole squares,
    // as WebKit's column lists are) is pulled back up onto that line with margin;
    // anything further is pushed down to the next line (padding for text, margin for
    // boxes, whose stroke padding would move).
    var all = document.querySelectorAll(BOX + "," + TEXT + "," + EDGE);
    for (var j = 0; j < all.length; j++) {
      var el = all[j];
      if (el.parentElement && el.parentElement.closest(INSIDE)) continue;
      var cs = getComputedStyle(el);
      if (cs.display === "none" || cs.position === "absolute" || cs.position === "fixed") continue;
      var isBox = el.matches(BOX + "," + EDGE);
      var addP = parseFloat(el.getAttribute("data-gp") || "0"), addM = parseFloat(el.getAttribute("data-gm") || "0");
      var top = el.getBoundingClientRect().top - pageTop() - nudgeOf(cs) + (isBox ? 0 : parseFloat(cs.borderTopWidth) + parseFloat(cs.paddingTop));
      var natural = top - addP - addM;                 // where it would start without our adjustments
      var r = mod(natural), wantP = 0, wantM = 0;
      if (r < TOL || G - r < TOL) { /* on a line */ }
      else if (r <= 3) wantM = px(-r);
      else if (isBox) wantM = px(G - r);
      else wantP = px(G - r);
      if (Math.abs(wantP - addP) < TOL && Math.abs(wantM - addM) < TOL) continue;
      if (Math.abs(wantM - addM) >= TOL) { el.style.marginTop = px(parseFloat(cs.marginTop) - addM + wantM) + "px"; el.setAttribute("data-gm", String(wantM)); }
      if (Math.abs(wantP - addP) >= TOL) { el.style.paddingTop = px(parseFloat(cs.paddingTop) - addP + wantP) + "px"; el.setAttribute("data-gp", String(wantP)); }
    }
    // 3. baselines onto the lines, measured; only nudge text that is off its line
    var texts = document.querySelectorAll(NUDGE);
    for (var k = 0; k < texts.length; k++) {
      var t = texts[k];
      if (t.closest(NO_NUDGE) || (t.parentElement && t.parentElement.closest(NUDGE))) continue;
      if (t.offsetParent === null || !t.textContent.trim()) continue;
      var tcs = getComputedStyle(t);
      if (tcs.position !== "relative" && tcs.position !== "static") continue;
      // --lift: a title that sits a few px above its underline, on purpose
      var lift = parseFloat(tcs.getPropertyValue("--lift")) || 0;
      var d = mod(baseline(t) + lift);                 // how far the baseline sits below a line
      if (d < TOL || G - d < TOL) continue;
      var move = d > G / 2 ? G - d : -d;               // smallest move onto a line
      t.style.position = "relative";
      t.style.top = px(nudgeOf(tcs) + move) + "px";
    }
    lastKey = key();
    busy = false;
  }
  run();
  var queued = false;
  // re-run only when the width or the content height really changed (a result, an opened section),
  // not when the address bar or a menu overlay changes the window height
  function later() { if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; if (key() !== lastKey) run(); }); } }
  // A ResizeObserver callback runs after layout but before paint, so fixing the page
  // inside it means the off-by-a-hair frame is never drawn. (Deferring to the next
  // animation frame painted one frame with the sections below a pixel above their
  // lines, then dropped them onto the lines.) run() changes nothing once aligned,
  // so the callback does not loop.
  if (window.ResizeObserver) new ResizeObserver(function () { if (key() !== lastKey) run(); }).observe(document.body);
  window.addEventListener("load", later);
  // the heading font arrives after the first paint: measure the baselines again on it
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { run(); });
  window.addEventListener("resize", later);
})();
