/* Homepage Feet & Inches mini calculator: adds or subtracts two feet + inches
 * measurements and shows the result in feet and inches, rounded to 1/16 in.
 * The full calculator (fractions, decimals, metric) lives on its own page. */
(function () {
  "use strict";
  var form = document.getElementById("fi-form");
  var out = document.getElementById("fi-out");
  if (!form || !out) { return; }
  var op = "+";

  function num(name) {
    var v = parseFloat(form.elements[name].value);
    return isFinite(v) ? v : 0;
  }

  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  function format(totalIn) {
    var sign = totalIn < 0 ? "−" : "";
    var sixteenths = Math.round(Math.abs(totalIn) * 16);
    var ft = Math.floor(sixteenths / 192);
    var rest = sixteenths - ft * 192;
    var inch = Math.floor(rest / 16);
    var frac = rest % 16;
    var fracText = "";
    if (frac) {
      var g = gcd(frac, 16);
      fracText = " " + (frac / g) + "/" + (16 / g);
    }
    return "= " + sign + ft + " ft " + inch + fracText + " in";
  }

  function update() {
    var a = num("f1") * 12 + num("i1");
    var b = num("f2") * 12 + num("i2");
    out.textContent = format(op === "+" ? a + b : a - b);
  }

  form.addEventListener("input", update);
  form.addEventListener("submit", function (e) { e.preventDefault(); update(); });
  Array.prototype.forEach.call(form.querySelectorAll(".fi-op"), function (btn) {
    btn.addEventListener("click", function () {
      op = btn.getAttribute("data-op");
      Array.prototype.forEach.call(form.querySelectorAll(".fi-op"), function (b) {
        var on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      update();
    });
  });
  update();
}());
