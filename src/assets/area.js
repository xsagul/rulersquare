/* Ruler Square — square footage calculator.
 *
 * Real rooms and yards are rarely one rectangle, so this adds up sections.
 * Everything is converted to feet first and reported in ft², yd², m² and acres.
 */
(function () {
  "use strict";

  var FT_PER = { in: 1 / 12, ft: 1, yd: 3, cm: 0.032808399, m: 3.280839895 };
  var FT2_PER_YD2 = 9;
  var FT2_PER_M2 = 10.763910417;
  var FT2_PER_ACRE = 43560;

  function num(v) {
    var n = parseFloat(v);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function toFeet(v, unit) {
    return num(v) * (FT_PER[unit] || 1);
  }

  /* Area of one section, in square feet. */
  function sectionFt2(sec) {
    var u = sec.unit || "ft";
    switch (sec.shape) {
      case "rect":
        return toFeet(sec.a, u) * toFeet(sec.b, u);
      case "circle":
        var r = toFeet(sec.a, u) / 2;       // a = diameter
        return Math.PI * r * r;
      case "triangle":
        return toFeet(sec.a, u) * toFeet(sec.b, u) / 2;  // base x height
      case "trapezoid":
        // a and b are the parallel sides, c the height between them
        return (toFeet(sec.a, u) + toFeet(sec.b, u)) * toFeet(sec.c, u) / 2;
      default:
        return 0;
    }
  }

  /* sections: [{shape, a, b, c, unit, qty}] */
  function calc(sections, opts) {
    opts = opts || {};
    var ft2 = 0;
    for (var i = 0; i < sections.length; i++) {
      var qty = Math.max(1, Math.floor(num(sections[i].qty)) || 1);
      ft2 += sectionFt2(sections[i]) * qty;
    }
    // Flooring and tile are bought with an allowance for cuts and breakage.
    var waste = Math.min(50, Math.max(0, parseFloat(opts.wastePct) || 0));
    var ft2w = ft2 * (1 + waste / 100);
    var pricePerFt2 = num(opts.pricePerFt2);

    return {
      ft2: ft2,
      ft2WithWaste: ft2w,
      yd2: ft2w / FT2_PER_YD2,
      m2: ft2w / FT2_PER_M2,
      acres: ft2w / FT2_PER_ACRE,
      squares: ft2w / 100,          // roofing "square" = 100 ft²
      cost: pricePerFt2 > 0 ? ft2w * pricePerFt2 : null,
    };
  }

  var api = { calc: calc, sectionFt2: sectionFt2, FT_PER: FT_PER };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof document === "undefined") { return; }

  // ---------- UI ----------
  function fmt(n, d) {
    return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  var form = document.getElementById("area-form");
  if (!form) { return; }

  var calculated = false;
  var list = document.getElementById("sections");
  var tpl = document.getElementById("section-tpl");

  function readSections() {
    return Array.prototype.map.call(list.querySelectorAll(".section"), function (el) {
      var get = function (n) { var f = el.querySelector('[data-f="' + n + '"]'); return f ? f.value : ""; };
      return { shape: get("shape"), a: get("a"), b: get("b"), c: get("c"), unit: get("unit"), qty: get("qty") };
    });
  }

  /* Each shape needs a different set of boxes; relabel rather than rebuild. */
  function syncFields(el) {
    var shape = el.querySelector('[data-f="shape"]').value;
    var labels = {
      rect: ["Length", "Width", null],
      circle: ["Diameter", null, null],
      triangle: ["Base", "Height", null],
      trapezoid: ["Side A", "Side B", "Height"],
    }[shape] || ["Length", "Width", null];
    ["a", "b", "c"].forEach(function (k, i) {
      var wrap = el.querySelector('[data-w="' + k + '"]');
      if (!wrap) { return; }
      var input = wrap.querySelector("input");
      input.required = !!labels[i];
      input.min = "0.001";
      input.max = "10000000";
      input.setAttribute("aria-label", labels[i] || "Unused dimension");
      if (labels[i]) {
        wrap.hidden = false;
        wrap.querySelector(".label").textContent = labels[i];
      } else {
        wrap.hidden = true;
      }
    });
  }

  function addSection() {
    var el = tpl.content.firstElementChild.cloneNode(true);
    el.querySelector('[data-f="qty"]').setAttribute("aria-label", "Number of identical sections");
    el.querySelector('[data-f="qty"]').required = true;
    syncFields(el);
    el.querySelector(".section-remove").addEventListener("click", function () {
      if (list.querySelectorAll(".section").length > 1) { el.remove(); update(); }
    });
    el.addEventListener("change", function () { syncFields(el); update(); });
    el.addEventListener("input", update);
    list.appendChild(el);
    return el;
  }

  function set(id, text) { var el = document.getElementById(id); if (el) { el.textContent = text; } }

  function update(report) {
    if (!calculated) { return; }
    if (!window.RSValidate(form, report === true)) { return; }
    var empty = document.getElementById("r-empty");
    var out = document.getElementById("r-out");
    if (empty) { empty.hidden = true; }
    if (out) { out.hidden = false; }

    var r = calc(readSections(), {
      wastePct: form.elements.wastePct ? form.elements.wastePct.value : 0,
      pricePerFt2: form.elements.pricePerFt2 ? form.elements.pricePerFt2.value : 0,
    });
    set("r-ft2", fmt(r.ft2WithWaste, 1));
    set("r-ft2-raw", fmt(r.ft2, 1) + " ft²");
    set("r-yd2", fmt(r.yd2, 2) + " yd²");
    set("r-m2", fmt(r.m2, 2) + " m²");
    set("r-acres", r.acres >= 0.01 ? fmt(r.acres, 3) + " acres" : "—");
    set("r-squares", fmt(r.squares, 2) + " squares");

    var costBox = document.getElementById("r-cost-box");
    if (costBox) {
      if (r.cost !== null && r.ft2 > 0) {
        costBox.hidden = false;
        set("r-cost", "$" + fmt(r.cost, 0));
      } else {
        costBox.hidden = true;
      }
    }
  }

  addSection();
  document.getElementById("add-section").addEventListener("click", function () {
    addSection();
    update(false);
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    calculated = true;
    update(true);
  });
  form.addEventListener("input", update);
  form.addEventListener("change", update);
})();
