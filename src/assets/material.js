/* Ruler Square — bulk material calculator (gravel, stone, sand, topsoil, mulch, asphalt, etc.).
 * Measurement inputs start empty; computes live once required fields are entered.
 */
(function () {
  "use strict";

  var FT3_PER_YD3 = 27;
  var LB_PER_TON = 2000;
  var M3_PER_FT3 = 0.028316846592;

  var DENSITY = {
    "gravel": 2800, "pea-gravel": 2800, "crushed": 2700, "river-rock": 2700,
    "limestone": 2700, "abc": 3000, "decomposed-granite": 2900,
    "sand": 2700, "sand-wet": 3240,
    "topsoil": 2000, "fill-dirt": 2000, "compost": 1000,
    "mulch": 800, "riprap": 2700, "asphalt": 3915
  };

  var FT_PER = { in: 1 / 12, ft: 1, yd: 3, cm: 0.032808399, m: 3.280839895 };

  function num(v) {
    var n = parseFloat(v);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function len(v, name) {
    return num(v[name]) * (FT_PER[v[name + "Unit"]] || 1);
  }

  function areaFt2(shape, v) {
    switch (shape) {
      case "rect":
        return len(v, "length") * len(v, "width");
      case "circle": {
        var r = len(v, "diameter") / 2;
        return Math.PI * r * r;
      }
      case "area":
        return num(v.areaFt2);
      default:
        return 0;
    }
  }

  function calc(shape, v) {
    var material = v.material && DENSITY[v.material] ? v.material : "gravel";
    var lbPerYd3 = num(v.density) || DENSITY[material];
    var compaction = Math.min(50, Math.max(0, parseFloat(v.compaction) || 0));

    var ft2 = areaFt2(shape, v);
    var depthFt = len(v, "depth");
    var ft3 = ft2 * depthFt;
    var ft3c = ft3 * (1 + compaction / 100);
    var yd3 = ft3c / FT3_PER_YD3;
    var tons = yd3 * lbPerYd3 / LB_PER_TON;

    var orderYd3 = yd3 > 0 ? Math.ceil(yd3 * 2 - 1e-9) / 2 : 0;
    var orderTons = tons > 0 ? Math.ceil(tons * 2 - 1e-9) / 2 : 0;
    var coverageFt2 = depthFt > 0 ? FT3_PER_YD3 / depthFt : 0;

    var price = num(v.price);
    var cost = null;
    if (price > 0) { cost = (v.priceUnit === "yd3" ? yd3 : tons) * price; }

    return {
      material: material,
      areaFt2: ft2,
      ft3: ft3,
      ft3Compacted: ft3c,
      yd3: yd3,
      m3: ft3c * M3_PER_FT3,
      tons: tons,
      lbs: tons * LB_PER_TON,
      orderYd3: orderYd3,
      orderTons: orderTons,
      coverageFt2: coverageFt2,
      bags: ft3c > 0 ? Math.ceil(ft3c / (num(v.bagSize) || 2) - 1e-9) : 0,
      density: lbPerYd3,
      bags2ft3: ft3c > 0 ? Math.ceil(ft3c / 2 - 1e-9) : 0,
      cost: cost
    };
  }

  var api = { calc: calc, areaFt2: areaFt2, DENSITY: DENSITY, FT_PER: FT_PER };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof document === "undefined") { return; }

  function fmt(n, d) {
    return n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  var form = document.getElementById("material-form");
  if (!form) { return; }

  function values() {
    var out = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && (el.type !== "radio" || el.checked)) { out[el.name] = el.value; }
    });
    return out;
  }
  function currentShape() {
    var c = form.querySelector('input[name="shape"]:checked');
    return c ? c.value : "rect";
  }
  function set(id, text) { var el = document.getElementById(id); if (el) { el.textContent = text; } }

  var submitted = false;

  function showShape() {
    var shape = currentShape();
    Array.prototype.forEach.call(form.querySelectorAll(".shape"), function (s) {
      var hide = s.getAttribute("data-shape") !== shape;
      s.hidden = hide;
      s.querySelectorAll("input,select").forEach(function (el) { el.disabled = hide; });
    });
    if (window.RSShowDiagram) { window.RSShowDiagram(shape); }
    return shape;
  }

  function truckEstimate(yd3, tons) {
    if (yd3 <= 0) { return "—"; }
    if (tons <= 1 && yd3 <= 1.5) { return "1 half-ton pickup trip (check payload)"; }
    if (yd3 <= 5 && tons <= 7) { return "1 single-axle dump truck"; }
    var tandem = Math.max(Math.ceil(yd3 / 10), Math.ceil(tons / 14));
    return tandem === 1 ? "1 tandem dump truck (10–12 yd³)" : tandem + " tandem dump truck loads";
  }

  function renderResult(shape) {
    var empty = document.getElementById("r-empty");
    var out = document.getElementById("r-out");
    var err = form.querySelector(".form-error");
    if (err) { err.hidden = true; }
    if (empty) { empty.hidden = true; }
    if (out) { out.hidden = false; }

    var r = calc(shape, values());
    set("r-tons", fmt(r.tons, 2));
    set("r-yd3", fmt(r.yd3, 2));
    set("r-ft3", fmt(r.ft3Compacted, 1));
    set("r-area", r.areaFt2 > 0 ? fmt(r.areaFt2, 0) + " ft²" : "—");
    set("r-order-yd3", r.orderYd3 > 0 ? fmt(r.orderYd3, 1) + " yd³" : "—");
    set("r-order-tons", r.orderTons > 0 ? fmt(r.orderTons, 1) + " tons" : "—");
    set("r-coverage", r.coverageFt2 > 0 ? fmt(r.coverageFt2, 0) + " ft² per yd³" : "—");
    set("r-bags", r.bags ? fmt(r.bags, 0) + " bags" : "—");
    set("r-truck", truckEstimate(r.yd3, r.tons));

    var costBox = document.getElementById("r-cost-box");
    if (costBox) {
      if (r.cost !== null && r.yd3 > 0) {
        costBox.hidden = false;
        set("r-cost", "$" + fmt(r.cost, 0));
      } else {
        costBox.hidden = true;
      }
    }

    var tip = document.getElementById("r-tip");
    if (tip) {
      tip.textContent = "Estimated weight: " + fmt(r.lbs, 0) + " lb (" + fmt(r.density, 0) + " lb/yd³). Confirm supplier weight per yard and delivery minimums before ordering.";
    }
    if (window.RSInitResultTools) { window.RSInitResultTools(form); }
  }

  function update(report) {
    var shape = showShape();
    if (report === true) {
      submitted = true;
      if (!window.RSValidate(form, true)) { return; }
      renderResult(shape);
      return;
    }
    if (window.RSReadyToCalc && window.RSReadyToCalc(form)) {
      renderResult(shape);
    } else if (submitted) {
      window.RSValidate(form, false);
    } else {
      var out = document.getElementById("r-out");
      var empty = document.getElementById("r-empty");
      if (out) { out.hidden = true; }
      if (empty) { empty.hidden = false; }
    }
  }

  var matSel = form.elements.material;
  if (matSel && matSel.tagName === "SELECT") {
    matSel.addEventListener("change", function () {
      if (DENSITY[matSel.value] && form.elements.density) {
        form.elements.density.value = DENSITY[matSel.value];
      }
    });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    update(true);
    var out = document.getElementById("r-out");
    if (out && !out.hidden && window.RSRevealResult) { window.RSRevealResult(form); }
  });
  form.addEventListener("input", function () { update(false); });
  form.addEventListener("change", function () { update(false); });

  var exBtn = document.getElementById("use-example");
  if (exBtn && exBtn.dataset.example) {
    exBtn.addEventListener("click", function () {
      try {
        var data = JSON.parse(exBtn.dataset.example);
        form.reset();
        var sh = data.shape || "rect";
        var r = form.querySelector('input[name="shape"][value="' + sh + '"]');
        if (r) { r.checked = true; }
        showShape();
        Object.keys(data).forEach(function (k) {
          if (k === "shape") { return; }
          var el = form.elements.namedItem(k);
          if (el) { el.value = data[k]; }
        });
        update(true);
      } catch (err) {}
    });
  }
  var resetBtn = document.getElementById("reset-calc");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      form.reset();
      submitted = false;
      showShape();
      var out = document.getElementById("r-out");
      var empty = document.getElementById("r-empty");
      var err = form.querySelector(".form-error");
      if (out) { out.hidden = true; }
      if (empty) { empty.hidden = false; }
      if (err) { err.hidden = true; }
    });
  }
  form.addEventListener("click", function (e) {
    var chip = e.target.closest("[data-preset]");
    if (!chip) { return; }
    try {
      var data = JSON.parse(chip.getAttribute("data-preset"));
      form.reset();
      var sh = data.shape || "rect";
      var r = form.querySelector('input[name="shape"][value="' + sh + '"]');
      if (r) { r.checked = true; }
      showShape();
      Object.keys(data).forEach(function (k) {
        if (k === "shape") { return; }
        var el = form.elements.namedItem(k);
        if (el) { el.value = data[k]; }
      });
      update(true);
    } catch (err) {}
  });

  showShape();
  if (window.RSLoadQuery) {
    window.RSLoadQuery(form, function () { showShape(); update(false); });
  }
})();
