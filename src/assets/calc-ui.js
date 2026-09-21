/* Shared validation for the legacy calculators. Hidden shapes do not take part
 * in validation; optional values may be empty but may not be negative. */
(function () {
  "use strict";
  window.RSValidate = function (form, report) {
    var invalid = Array.from(form.querySelectorAll("input,select")).find(function (el) {
      return !el.closest("[hidden]") && !el.checkValidity();
    });
    var error = form.querySelector(".form-error");
    if (!error) {
      error = document.createElement("p");
      error.className = "form-error";
      error.setAttribute("role", "alert");
      form.querySelector(".btn-calc").before(error);
    }
    error.hidden = !invalid;
    if (!invalid) return true;
    error.textContent = "Enter valid values in the highlighted field to calculate.";
    form.querySelector("#r-out").hidden = true;
    form.querySelector("#r-empty").hidden = false;
    if (report) {
      var details = invalid.closest("details");
      if (details) details.open = true;
      invalid.reportValidity();
    }
    return false;
  };
})();
