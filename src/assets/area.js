/* Ruler Square — square footage calculator.
 * Measurement boxes stay empty on load; computes live once required fields are filled.
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

  function sectionFt2(sec) {
    var u = sec.unit || "ft";
    switch (sec.shape) {
      case "rect":
        return toFeet(sec.a, u) * toFeet(sec.b, u);
      case "circle": {
        var r = toFeet(sec.a, u) / 2;
        return Math.PI * r * r;
      }
      case "triangle":
        return toFeet(sec.a, u) * toFeet(sec.b, u) / 2;
      case "trapezoid":
        return (toFeet(sec.a, u) + toFeet(sec.b, u)) * toFeet(sec.c, u) / 2;
      default:
        return 0;
    }
  }

  function sectionPerim(sec) {
    var u = sec.unit || "ft";
    switch (sec.shape) {
      case "rect": {
        var l = toFeet(sec.a, u), w = toFeet(sec.b, u);
        return l > 0 && w > 0 ? 2 * (l + w) : 0;
      }
      case "circle":
        return Math.PI * toFeet(sec.a, u);
      default:
        return 0;
    }
  }

  function calc(sections, opts) {
    opts = opts || {};
    var ft2 = 0;
    var perim = 0;
    for (var i = 0; i < sections.length; i++) {
      var qty = Math.max(1, Math.floor(num(sections[i].qty)) || 1);
      var sign = Number(sections[i].sign) === -1 ? -1 : 1;
      ft2 += sectionFt2(sections[i]) * qty * sign;
      if (sign === 1) { perim += sectionPerim(sections[i]) * qty; }
    }
    ft2 = Math.max(0, ft2);
    var waste = Math.min(50, Math.max(0, parseFloat(opts.wastePct) || 0));
    var ft2w = ft2 * (1 + waste / 100);
    var pricePerFt2 = num(opts.pricePerFt2);

    return {
      ft2: ft2,
      ft2WithWaste: ft2w,
      yd2: ft2w / FT2_PER_YD2,
      m2: ft2w / FT2_PER_M2,
      acres: ft2w / FT2_PER_ACRE,
      squares: ft2w / 100,
      perimeterFt: perim,
      cost: pricePerFt2 > 0 ? ft2w * pricePerFt2 : null,
    };
  }

  var api = { calc: calc, sectionFt2: sectionFt2, FT_PER: FT_PER };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof document === "undefined") { return; }

  function fmt(n, d) {
    return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  var form = document.getElementById("area-form");
  if (!form) { return; }

  var submitted = false;
  var list = document.getElementById("sections");
  var tpl = document.getElementById("section-tpl");

  function readSections() {
    return Array.prototype.map.call(list.querySelectorAll(".section"), function (el) {
      var get = function (n) { var f = el.querySelector('[data-f="' + n + '"]'); return f ? f.value : ""; };
      var signBtn = el.querySelector(".section-sign");
      var sign = signBtn ? Number(signBtn.dataset.sign) : 1;
      return { shape: get("shape"), a: get("a"), b: get("b"), c: get("c"), unit: get("unit"), qty: get("qty"), sign: sign };
    });
  }

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
      input.disabled = !labels[i];
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

  function addSection(prefill) {
    var el = tpl.content.firstElementChild.cloneNode(true);
    el.querySelector('[data-f="qty"]').setAttribute("aria-label", "Number of identical sections");
    el.querySelector('[data-f="qty"]').required = true;
    if (prefill) {
      Object.keys(prefill).forEach(function (k) {
        if (k === "sign") {
          var sb = el.querySelector(".section-sign");
          if (sb && prefill.sign === -1) { sb.dataset.sign = "-1"; sb.textContent = "− Cutout"; }
          return;
        }
        var f = el.querySelector('[data-f="' + k + '"]');
        if (f) { f.value = prefill[k]; }
      });
    }
    syncFields(el);
    var signBtn = el.querySelector(".section-sign");
    if (signBtn) {
      signBtn.addEventListener("click", function () {
        var next = signBtn.dataset.sign === "-1" ? "1" : "-1";
        signBtn.dataset.sign = next;
        signBtn.textContent = next === "-1" ? "− Cutout" : "+ Add";
        update(false);
      });
    }
    el.querySelector(".section-remove").addEventListener("click", function () {
      if (list.querySelectorAll(".section").length > 1) { el.remove(); update(false); }
    });
    el.addEventListener("change", function () { syncFields(el); update(false); });
    el.addEventListener("input", function () { update(false); });
    list.appendChild(el);
    return el;
  }

  function set(id, text) { var el = document.getElementById(id); if (el) { el.textContent = text; } }

  function renderResult() {
    var empty = document.getElementById("r-empty");
    var out = document.getElementById("r-out");
    var err = form.querySelector(".form-error");
    if (err) { err.hidden = true; }
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
    set("r-acres", r.acres >= 0.001 ? fmt(r.acres, 4) + " acres" : "—");
    set("r-squares", fmt(r.squares, 2) + " squares");
    set("r-perim", r.perimeterFt > 0 ? fmt(r.perimeterFt, 1) + " ft (" + fmt(r.perimeterFt * 0.3048, 1) + " m)" : "—");

    var costBox = document.getElementById("r-cost-box");
    if (costBox) {
      if (r.cost !== null && r.ft2 > 0) {
        costBox.hidden = false;
        set("r-cost", "$" + fmt(r.cost, 0));
      } else {
        costBox.hidden = true;
      }
    }
    if (window.RSInitResultTools) { window.RSInitResultTools(form); }
  }

  function update(report) {
    if (report === true) {
      submitted = true;
      if (!window.RSValidate(form, true)) { return; }
      renderResult();
      return;
    }
    if (window.RSReadyToCalc && window.RSReadyToCalc(form)) {
      renderResult();
    } else if (submitted) {
      window.RSValidate(form, false);
    } else {
      var out = document.getElementById("r-out");
      var empty = document.getElementById("r-empty");
      if (out) { out.hidden = true; }
      if (empty) { empty.hidden = false; }
    }
  }

  addSection();
  document.getElementById("add-section").addEventListener("click", function () {
    addSection();
    update(false);
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    update(true);
    var out = document.getElementById("r-out");
    if (out && !out.hidden && window.RSRevealResult) { window.RSRevealResult(form); }
  });
  form.addEventListener("input", function () { update(false); });
  form.addEventListener("change", function () { update(false); });

  var exBtn = document.getElementById("use-example");
  if (exBtn) {
    exBtn.addEventListener("click", function () {
      list.replaceChildren();
      addSection({ shape: "rect", unit: "ft", a: "16", b: "12", qty: "1" });
      addSection({ shape: "rect", unit: "ft", a: "8", b: "6", qty: "1" });
      if (form.elements.wastePct) { form.elements.wastePct.value = "10"; }
      update(true);
    });
  }
  var resetBtn = document.getElementById("reset-calc");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      list.replaceChildren();
      addSection();
      submitted = false;
      var out = document.getElementById("r-out");
      var empty = document.getElementById("r-empty");
      var err = form.querySelector(".form-error");
      if (out) { out.hidden = true; }
      if (empty) { empty.hidden = false; }
      if (err) { err.hidden = true; }
    });
  }
})();
