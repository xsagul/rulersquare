/* Homepage calculator search. The index is inlined by the build (RS_INDEX), so
 * there is no fetch and it works on the first keystroke. */
(function () {
  "use strict";
  var index = window.RS_INDEX;
  var input = document.getElementById("q");
  var hits = document.getElementById("hits");
  var browse = document.getElementById("browse");
  if (!index || !input || !hits) { return; }

  function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function score(item, q) {
    var t = item.t.toLowerCase();
    if (t.indexOf(q) === 0) { return 3; }
    if (t.indexOf(q) > -1) { return 2; }
    if ((item.k + " " + item.d).toLowerCase().indexOf(q) > -1) { return 1; }
    return 0;
  }

  function render() {
    var q = input.value.trim().toLowerCase();
    if (!q) {
      hits.hidden = true;
      hits.innerHTML = "";
      if (browse) { browse.hidden = false; }
      return;
    }
    var found = index
      .map(function (it) { return { it: it, s: score(it, q) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });

    hits.innerHTML = found.length
      ? found.map(function (r) {
          return '<li><a href="' + r.it.u + '"><b>' + esc(r.it.t) + "</b><span>" + esc(r.it.d) + "</span></a></li>";
        }).join("")
      : '<li class="empty">No calculator matches that yet.</li>';
    hits.hidden = false;
    if (browse) { browse.hidden = true; }
  }

  input.addEventListener("input", render);
  // Escape clears rather than leaving the visitor stranded in a filtered view.
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { input.value = ""; render(); }
  });
  render();
})();
