/* Shared calculator UI: validation, and bringing the answer into view.
 * Hidden shapes do not take part in validation; optional values may be empty
 * but may not be negative. */
(function () {
  "use strict";

  /* After Calculate, the answer has to arrive somewhere the eye can find it.
   * Below 800px the results sit under the form, so pressing the button can
   * look like nothing happened at all.
   *
   * Measured synchronously, not in a rAF callback. A framework would need the
   * extra frame to re-render before the target could be read, but these pages
   * mutate the DOM directly, so reading the box here forces a fresh layout and
   * already sees the expanded panel. A deferred frame would also be throttled
   * whenever the tab is not in the foreground.
   *
   * Nothing moves when the answer is already on screen — on a wide layout the
   * results sit beside the form and are usually visible, and scrolling the
   * page on every press would be a jolt with no purpose. */
  window.RSRevealResult = function (form) {
    if (!form || typeof form.querySelector !== "function") { return; }
    var results = form.querySelector(".calc-results");
    if (!results || typeof results.scrollIntoView !== "function") { return; }
    var box = results.getBoundingClientRect();
    var height = window.innerHeight || document.documentElement.clientHeight;
    if (box.top >= 0 && box.bottom <= height) { return; }
    var stacked = window.matchMedia("(max-width: 800px)").matches;
    var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    (stacked ? results : form).scrollIntoView({ behavior: still ? "auto" : "smooth", block: "start" });
  };

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
