/* Shared calculator UI: live readiness (while keeping measurement inputs empty
 * on load), validation, shareable URLs, copy/print actions, embed copy, and
 * live scaled SVG diagrams for geometric calculators. */
(function () {
  "use strict";

  /* After Calculate, bring the answer into view with a calm, even scroll (the browser's own
   * smooth scroll is fast and differs between browsers) and land it one grid square below the
   * sticky header, not under it. Phones: the results panel, which sits under the form.
   * Wider screens: the whole calculator, only if it is not already in view. */
  var scrolling = null;
  function stopScroll() { if (scrolling) { cancelAnimationFrame(scrolling); scrolling = null; } }
  function glideTo(y) {
    stopScroll();
    var start = window.pageYOffset, dist = y - start;
    if (Math.abs(dist) < 2) { return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { window.scrollTo(0, y); return; }
    var ms = Math.min(900, 560 + Math.abs(dist) * 0.25), t0 = null;
    var ease = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
    function step(now) {
      if (t0 === null) { t0 = now; }
      var t = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, Math.round(start + dist * ease(t)));
      scrolling = t < 1 ? requestAnimationFrame(step) : null;
    }
    scrolling = requestAnimationFrame(step);
  }
  // the reader takes over: a wheel, touch or key stops the glide at once
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (ev) { window.addEventListener(ev, stopScroll, { passive: true }); });

  window.RSRevealResult = function (form) {
    if (!form || typeof form.querySelector !== "function") { return; }
    var results = form.querySelector(".calc-results");
    if (!results) { return; }
    // one frame later: the result panel has its final height (grid.js rounds it before paint)
    requestAnimationFrame(function () {
      var header = document.querySelector(".site-header");
      var top = (header ? header.getBoundingClientRect().bottom : 0) + 24;   // one square under the header
      var height = window.innerHeight || document.documentElement.clientHeight;
      var stacked = window.matchMedia("(max-width: 800px)").matches;
      var target = stacked ? results : form;
      var box = target.getBoundingClientRect();
      if (box.top >= top - 1 && box.bottom <= height) { return; }   // already fully in view
      if (!stacked && box.top >= top - 1 && box.top < height * 0.25) { return; }   // calculator already at the top
      glideTo(window.pageYOffset + box.top - top);
    });
  };

  window.RSShowDiagram = function (shape) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-diagram]"), function (d) {
      d.hidden = d.getAttribute("data-diagram") !== shape;
    });
  };

  /* Returns true once every visible, enabled required field has a valid value.
   * If a form allows partial entry (e.g. inches-only on Feet & Inches), returns
   * true once at least one visible numeric input has been filled in. */
  window.RSReadyToCalc = function (form) {
    if (!form) { return false; }
    var els = Array.from(form.querySelectorAll("input,select"));
    var hasRequired = false;
    var hasAnyNum = false;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.disabled || el.type === "hidden" || el.type === "radio" || el.closest("[hidden]")) { continue; }
      if (el.type === "number" && el.value !== "") { hasAnyNum = true; }
      if (el.required) {
        hasRequired = true;
        if (el.value === "" || !el.checkValidity()) { return false; }
      } else if (el.value !== "" && !el.checkValidity()) {
        return false;
      }
    }
    return hasRequired ? true : hasAnyNum;
  };

  window.RSValidate = function (form, report) {
    var invalid = Array.from(form.querySelectorAll("input,select")).find(function (el) {
      return !el.disabled && !el.closest("[hidden]") && !el.checkValidity();
    });
    var error = form.querySelector(".form-error");
    if (!error) {
      error = document.createElement("p");
      error.className = "form-error";
      error.setAttribute("role", "alert");
      var btn = form.querySelector(".btn-calc");
      if (btn) { btn.before(error); }
    }
    if (error) { error.hidden = !invalid; }
    if (!invalid) { return true; }
    if (error) { error.textContent = "Enter valid measurements in the highlighted field to calculate."; }
    var out = form.querySelector("#r-out");
    var empty = form.querySelector("#r-empty");
    if (out) { out.hidden = true; }
    if (empty) { empty.hidden = false; }
    if (report) {
      var details = invalid.closest("details");
      if (details) { details.open = true; }
      invalid.reportValidity();
    }
    return false;
  };

  /* Build a shareable URL containing only visible, non-empty field values. */
  window.RSShareUrl = function (form) {
    var params = new URLSearchParams();
    Array.from(form.elements).forEach(function (el) {
      if (!el.name || el.disabled || el.closest("[hidden]")) { return; }
      if ((el.type === "radio" || el.type === "checkbox") && !el.checked) { return; }
      if (el.value !== "") { params.set(el.name, el.value); }
    });
    var base = window.location.origin + window.location.pathname;
    var qs = params.toString();
    return qs ? base + "?" + qs : base;
  };

  /* Restore inputs from ?query params (if present) and trigger calculation. */
  window.RSLoadQuery = function (form, onLoaded) {
    var params = new URLSearchParams(window.location.search);
    if (!params.toString()) { return false; }
    var applied = false;
    params.forEach(function (val, key) {
      var el = form.elements.namedItem(key);
      if (!el) { return; }
      if (typeof RadioNodeList !== "undefined" && el instanceof RadioNodeList) {
        Array.from(el).forEach(function (r) { if (r.value === val) { r.checked = true; applied = true; } });
      } else if (el.type === "radio") {
        if (el.value === val) { el.checked = true; applied = true; }
      } else {
        el.value = val;
        applied = true;
      }
    });
    if (applied && typeof onLoaded === "function") { onLoaded(); }
    return applied;
  };

  /* Copy text helper with temporary button confirmation. */
  function flashCopy(btn, text, doneLabel) {
    var orig = btn.textContent;
    function done() {
      btn.textContent = doneLabel || "Copied!";
      window.setTimeout(function () { btn.textContent = orig; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }
  function fallbackCopy(text, cb) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    cb();
  }

  /* Inject Copy / Share / Print toolbar into #r-out once. */
  window.RSInitResultTools = function (form) {
    var out = form && form.querySelector("#r-out");
    if (!out || out.querySelector(".result-tools")) { return; }
    var bar = document.createElement("div");
    bar.className = "result-tools";
    bar.innerHTML =
      '<button type="button" class="btn-chip" data-act="copy">Copy summary</button>' +
      '<button type="button" class="btn-chip" data-act="share">Share link</button>' +
      '<button type="button" class="btn-chip" data-act="print">Print</button>';
    out.appendChild(bar);
    bar.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) { return; }
      var act = btn.getAttribute("data-act");
      if (act === "print") { window.print(); return; }
      if (act === "share") {
        var url = window.RSShareUrl(form);
        if (window.history && window.history.replaceState) { window.history.replaceState(null, "", url); }
        flashCopy(btn, url, "Link copied!");
        return;
      }
      if (act === "copy") {
        var h1 = (document.querySelector("h1") || {}).textContent || "Estimate";
        var big = out.querySelector(".big");
        var lines = [h1.trim()];
        if (big) { lines.push(big.textContent.replace(/\s+/g, " ").trim()); }
        var alt = out.querySelector(".big-alt");
        if (alt && alt.textContent.trim()) { lines.push(alt.textContent.trim()); }
        Array.from(out.querySelectorAll(".results-list li")).forEach(function (li) {
          var s = li.querySelector("span"), b = li.querySelector("b");
          if (s && b && b.textContent.trim() !== "—") {
            lines.push("- " + s.textContent.trim() + ": " + b.textContent.trim());
          }
        });
        var cost = out.querySelector("#r-cost-box");
        if (cost && !cost.hidden) { lines.push(cost.textContent.replace(/\s+/g, " ").trim()); }
        lines.push("Link: " + window.RSShareUrl(form));
        flashCopy(btn, lines.join("\n"), "Copied!");
      }
    });
  };

  /* Live scaled SVG preview inside results for geometric calculators. */
  window.RSLiveDiagram = function (kind, v, result) {
    var find = function (lbl) {
      var r = result && result.rows && result.rows.find(function (x) { return x.label === lbl; });
      return r ? r.value : null;
    };
    var svgWrap = function (vb, label, inner) {
      return '<svg class="live-svg" viewBox="' + vb + '" role="img" aria-label="' + label + '">' + inner + "</svg>";
    };
    if (kind === "board-and-batten" || kind === "baluster-spacing" || kind === "wainscoting") {
      var count = find("Battens including both ends") || find("Balusters needed") || find("Vertical stiles");
      var gap = find("Clear space between battens") || find("Clear gap between balusters") || find("Clear panel width");
      if (!count || !gap) { return ""; }
      var drawN = Math.min(Math.max(count, 2), 14);
      var W = 320, x0 = 16, y0 = 22, h = 92, bw = Math.max(4, Math.min(12, 220 / (drawN * 2.5)));
      var span = W - x0 * 2 - bw;
      var step = span / (drawN - 1);
      var bars = "";
      for (var i = 0; i < drawN; i++) {
        bars += '<rect x="' + (x0 + i * step).toFixed(1) + '" y="' + y0 + '" width="' + bw.toFixed(1) + '" height="' + h + '" fill="var(--accent)" opacity=".85"/>';
      }
      var cap = count + " pieces · " + Number(gap).toFixed(2) + '" clear gap';
      return svgWrap("0 0 320 142", cap,
        '<rect x="' + x0 + '" y="' + y0 + '" width="' + (W - x0 * 2) + '" height="' + h + '" fill="none" stroke="currentColor" stroke-width="1.4"/>' +
        bars +
        '<text x="160" y="134" text-anchor="middle" font-size="13" fill="var(--muted)">' + cap + "</text>");
    }
    if (kind === "stair" || kind === "concrete-steps") {
      var risers = find("Risers") || find("Number of steps");
      var riserH = find("Actual riser height") || v.riserHeight;
      var treadD = v.treadDepth || 10;
      if (!risers) { return ""; }
      var n = Math.min(risers, 16);
      var sx = 24, sy = 124, dx = 250 / n, dy = 96 / n;
      var d = "M" + sx + "," + sy;
      for (var j = 0; j < n; j++) {
        d += " v" + (-dy).toFixed(1) + " h" + dx.toFixed(1);
      }
      d += " L" + (sx + n * dx).toFixed(1) + "," + sy + " Z";
      var txt = risers + " steps · " + Number(riserH).toFixed(2) + '" rise × ' + Number(treadD).toFixed(1) + '" tread';
      return svgWrap("0 0 320 144", txt,
        '<path d="' + d + '" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="1.8"/>' +
        '<text x="160" y="140" text-anchor="middle" font-size="13" fill="var(--muted)">' + txt + "</text>");
    }
    if (kind === "roof-pitch") {
      var pitch = find("Pitch");
      var angle = find("Angle");
      var rafter = find("Rafter length");
      if (angle === null || !rafter) { return ""; }
      var risePx = Math.max(12, Math.min(96, 180 * Math.tan(angle * Math.PI / 180)));
      var baseY = 114;
      var pLabel = pitch !== null ? Number(pitch.toFixed(2)) : v.rise;
      var txt2 = pLabel + "/12 pitch · " + angle.toFixed(1) + "° · " + rafter.toFixed(2) + " ft rafter";
      return svgWrap("0 0 320 140", txt2,
        '<polygon points="40,' + baseY + " 260," + baseY + " 260," + (baseY - risePx).toFixed(1) + '" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2"/>' +
        '<text x="160" y="134" text-anchor="middle" font-size="13" fill="var(--muted)">' + txt2 + "</text>");
    }
    return "";
  };

  /* Wire embed copy buttons anywhere on the page. */
  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy-embed]");
    if (!btn) { return; }
    var box = btn.closest(".embed-box");
    var ta = box && box.querySelector("textarea");
    if (ta) { flashCopy(btn, ta.value, "Embed code copied!"); }
  });
})();
