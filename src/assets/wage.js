/* Ruler Square — wage and salary conversions.
 *
 * Pure arithmetic, no tax: hourly to annual and back, across any schedule.
 * The subtlety is unpaid time off, which most converters ignore and which
 * moves a real hourly rate by several percent.
 */
(function () {
  "use strict";

  var WEEKS_PER_YEAR = 52;
  var MONTHS_PER_YEAR = 12;

  // How many pay periods a year, for each schedule.
  var PERIODS = {
    hour: 0,            // derived from hours worked
    day: 0,             // derived from days worked
    week: 52,
    biweek: 26,
    semimonth: 24,
    month: 12,
    year: 1,
  };

  function num(v) {
    var n = parseFloat(v);
    return isFinite(n) && n > 0 ? n : 0;
  }

  /* v: { amount, per, hoursPerWeek, daysPerWeek, unpaidWeeks, overtimeHours, overtimeMult } */
  function calc(v) {
    var amount = num(v.amount);
    var per = PERIODS.hasOwnProperty(v.per) ? v.per : "hour";
    var hoursPerWeek = num(v.hoursPerWeek) || 40;
    var daysPerWeek = num(v.daysPerWeek) || 5;
    // Unpaid leave shortens the paid year without changing the salary.
    var unpaidWeeks = Math.min(51, num(v.unpaidWeeks));
    var paidWeeks = WEEKS_PER_YEAR - unpaidWeeks;

    var otHours = num(v.overtimeHours);
    var otMult = num(v.overtimeMult) || 1.5;

    var annual, hourly;
    if (per === "hour") {
      hourly = amount;
      // Overtime is paid weekly, on top of the base week.
      annual = (hourly * hoursPerWeek + hourly * otMult * otHours) * paidWeeks;
    } else if (per === "day") {
      annual = amount * daysPerWeek * paidWeeks;
      hourly = hoursPerWeek > 0 ? (amount * daysPerWeek) / hoursPerWeek : 0;
    } else {
      annual = amount * PERIODS[per];
      var totalHours = hoursPerWeek * paidWeeks;
      hourly = totalHours > 0 ? annual / totalHours : 0;
    }

    var weekly = annual / WEEKS_PER_YEAR;
    return {
      hourly: hourly,
      daily: hourly * (daysPerWeek > 0 ? hoursPerWeek / daysPerWeek : 0),
      weekly: weekly,
      biweekly: annual / 26,
      semimonthly: annual / 24,
      monthly: annual / MONTHS_PER_YEAR,
      annual: annual,
      hoursPerYear: hoursPerWeek * paidWeeks,
      paidWeeks: paidWeeks,
      overtimePay: per === "hour" ? hourly * otMult * otHours * paidWeeks : 0,
    };
  }

  var api = { calc: calc, PERIODS: PERIODS };
  if (typeof module !== "undefined" && module.exports) { module.exports = api; }
  if (typeof document === "undefined") { return; }

  // ---------- UI ----------
  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function money0(n) {
    return "$" + Math.round(n).toLocaleString("en-US");
  }
  var form = document.getElementById("wage-form");
  if (!form) { return; }

  var calculated = false;

  function values() {
    var out = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name && (el.type !== "radio" || el.checked)) { out[el.name] = el.value; }
    });
    return out;
  }
  function set(id, text) {
    [id, id + "-headline"].forEach(function (key) {
      var el = document.getElementById(key); if (el) el.textContent = text;
    });
  }

  function update(report) {
    // Overtime only exists on an hourly rate; hide it otherwise.
    var per = form.elements.per ? form.elements.per.value : "hour";
    var ot = document.getElementById("ot-row");
    if (ot) { ot.hidden = per !== "hour"; }

    if (!calculated) { return; }
    if (!window.RSValidate(form, report === true)) { return; }
    var empty = document.getElementById("r-empty");
    var out = document.getElementById("r-out");
    if (empty) { empty.hidden = true; }
    if (out) { out.hidden = false; }

    var r = calc(values());
    set("r-annual", money0(r.annual));
    set("r-hourly", money(r.hourly));
    set("r-daily", money(r.daily));
    set("r-weekly", money(r.weekly));
    set("r-biweekly", money(r.biweekly));
    set("r-semimonthly", money(r.semimonthly));
    set("r-monthly", money(r.monthly));
    set("r-hours", Math.round(r.hoursPerYear).toLocaleString("en-US") + " hrs");
    var otBox = document.getElementById("r-ot-box");
    if (otBox) {
      otBox.hidden = !(r.overtimePay > 0);
      set("r-ot", money0(r.overtimePay));
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    calculated = true;
    update(true);
    // Only when there is something to look at: a failed validation leaves the
    // empty state in place, and scrolling to it would be a lie.
    var out = document.getElementById("r-out");
    if (out && !out.hidden && window.RSRevealResult) { window.RSRevealResult(form); }
  });
  form.addEventListener("input", update);
  form.addEventListener("change", update);
  update();
})();
