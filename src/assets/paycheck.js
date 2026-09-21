/* Ruler Square — US paycheck calculator (gross to net), 2026 tax year.
 *
 * Annualise, tax, then divide back down. That is how employers actually
 * withhold, and it is why a bonus period looks over-taxed on the payslip.
 * Shared with Node for the test suite.
 */
(function () {
  "use strict";

  var D = (typeof require === "function" && typeof module !== "undefined")
    ? require("../data/tax2026")
    : window.RS_TAX;

  function num(v) {
    var n = parseFloat(v);
    return isFinite(n) && n > 0 ? n : 0;
  }
  function pct(v) {
    var n = parseFloat(v);
    return isFinite(n) && n > 0 ? Math.min(100, n) : 0;
  }

  /* Progressive tax over a bracket table. */
  function bracketTax(taxable, brackets) {
    var tax = 0, lower = 0;
    for (var i = 0; i < brackets.length; i++) {
      var upper = brackets[i][0], rate = brackets[i][1];
      if (taxable > lower) {
        tax += (Math.min(taxable, upper) - lower) * rate;
      }
      lower = upper;
      if (taxable <= upper) { break; }
    }
    return tax;
  }

  function marginalRate(taxable, brackets) {
    for (var i = 0; i < brackets.length; i++) {
      if (taxable <= brackets[i][0]) { return brackets[i][1]; }
    }
    return brackets[brackets.length - 1][1];
  }

  /* v: { gross, periodsPerYear, status, pretax401kPct, pretaxOtherPerPeriod,
   *      stateRatePct, extraWithholdingPerPeriod } */
  function calc(v) {
    var periods = num(v.periodsPerYear) || 26;
    var grossPerPeriod = num(v.gross);
    var annualGross = grossPerPeriod * periods;

    // Pre-tax deductions reduce federal and state taxable pay, not FICA pay
    // for 401(k). Section 125 health premiums reduce both; we treat "other"
    // as Section 125, which is what most payroll deductions actually are.
    var k401 = Math.min(annualGross * pct(v.pretax401kPct) / 100, D.RETIREMENT.employee401kLimit);
    var otherPretax = Math.min(num(v.pretaxOtherPerPeriod) * periods, Math.max(0, annualGross - k401));

    var status = D.STANDARD_DEDUCTION[v.status] ? v.status : "single";
    var ficaWages = Math.max(0, annualGross - otherPretax);
    var federalWages = Math.max(0, annualGross - k401 - otherPretax);

    // Social Security stops at the wage base; Medicare never does.
    var ss = Math.min(ficaWages, D.FICA.socialSecurityWageBase) * D.FICA.socialSecurityRate;
    var medicare = ficaWages * D.FICA.medicareRate;
    var addlThreshold = D.FICA.additionalMedicareWithholdingThreshold;
    var addlMedicare = ficaWages > addlThreshold
      ? (ficaWages - addlThreshold) * D.FICA.additionalMedicareRate : 0;

    var taxable = Math.max(0, federalWages - D.STANDARD_DEDUCTION[status]);
    var federal = bracketTax(taxable, D.FEDERAL_BRACKETS[status]);
    var extra = num(v.extraWithholdingPerPeriod) * periods;
    federal += extra;

    var state = federalWages * pct(v.stateRatePct) / 100;

    var totalTax = federal + state + ss + medicare + addlMedicare;
    var annualNet = annualGross - k401 - otherPretax - totalTax;

    return {
      periods: periods,
      annualGross: annualGross,
      annualNet: annualNet,
      perPeriodGross: grossPerPeriod,
      perPeriodNet: annualNet / periods,
      federal: federal,
      state: state,
      socialSecurity: ss,
      medicare: medicare + addlMedicare,
      totalTax: totalTax,
      pretax401k: k401,
      pretaxOther: otherPretax,
      taxableIncome: taxable,
      // Share of gross that never reaches the bank account.
      effectiveRate: annualGross > 0 ? totalTax / annualGross : 0,
      marginalRate: marginalRate(taxable, D.FEDERAL_BRACKETS[status]),
      takeHomePct: annualGross > 0 ? annualNet / annualGross : 0,
    };
  }

  var api = { calc: calc, bracketTax: bracketTax, marginalRate: marginalRate };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof document === "undefined") { return; }

  // ---------- UI ----------
  function money(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  function money2(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  var form = document.getElementById("paycheck-form");
  if (!form) { return; }

  var calculated = false;

  function values() {
    var out = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && (el.type !== "radio" || el.checked)) { out[el.name] = el.value; }
    });
    var sel = form.elements.periodsPerYear;
    out.periodsPerYear = sel ? sel.value : 26;
    return out;
  }
  function set(id, text) { var el = document.getElementById(id); if (el) { el.textContent = text; } }

  function update(report) {
    if (!calculated) { return; }
    if (!window.RSValidate(form, report === true)) { return; }
    var empty = document.getElementById("r-empty");
    var out = document.getElementById("r-out");
    if (empty) { empty.hidden = true; }
    if (out) { out.hidden = false; }

    var r = calc(values());
    set("r-net", money2(r.perPeriodNet));
    set("r-net-annual", money(r.annualNet));
    set("r-gross-annual", money(r.annualGross));
    set("r-federal", money(r.federal));
    set("r-state", money(r.state));
    set("r-ss", money(r.socialSecurity));
    set("r-medicare", money(r.medicare));
    set("r-401k", r.pretax401k > 0 ? money(r.pretax401k) : "—");
    set("r-total-tax", money(r.totalTax));
    set("r-effective", (r.effectiveRate * 100).toFixed(1) + "%");
    set("r-marginal", (r.marginalRate * 100).toFixed(0) + "%");
    set("r-takehome", (r.takeHomePct * 100).toFixed(1) + "%");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    calculated = true;
    update(true);
  });
  form.addEventListener("input", update);
  form.addEventListener("change", update);
})();
