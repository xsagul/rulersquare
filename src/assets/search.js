/* Homepage calculator search — uses shared lazy search-index.json. */
(function () {
  "use strict";
  var input = document.getElementById("q");
  var hits = document.getElementById("hits");
  var browse = document.getElementById("browse");
  if (!input || !hits) { return; }

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function render(index) {
    var q = input.value.trim().toLowerCase();
    if (!q) {
      hits.hidden = true;
      hits.innerHTML = "";
      if (browse) { browse.hidden = false; }
      return;
    }
    var score = window.RSScoreItem || function (it, term) {
      return (it.t + " " + (it.k || "") + " " + (it.d || "")).toLowerCase().indexOf(term) > -1 ? 1 : 0;
    };
    var found = index
      .map(function (it) { return { it: it, s: score(it, q) }; })
      .filter(function (r) { return r.s > 0; })
      .sort(function (a, b) { return b.s - a.s || a.it.t.localeCompare(b.it.t); });

    hits.innerHTML = found.length
      ? found.map(function (r) {
          return '<li><a href="' + r.it.u + '"><b>' + esc(r.it.t) + "</b><span>" + esc(r.it.d || "") + "</span></a></li>";
        }).join("")
      : '<li class="empty">No calculator matches that yet.</li>';
    hits.hidden = false;
    if (browse) { browse.hidden = true; }
  }

  function run() {
    if (window.RSGetIndex) { window.RSGetIndex().then(render); }
  }

  input.addEventListener("focus", function () { if (window.RSGetIndex) { window.RSGetIndex(); } });
  input.addEventListener("input", run);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { input.value = ""; hits.hidden = true; hits.innerHTML = ""; if (browse) browse.hidden = false; }
    if (e.key === "Enter") {
      var first = hits.querySelector("a");
      if (first) { e.preventDefault(); window.location.href = first.getAttribute("href"); }
    }
  });

  var query = new URLSearchParams(window.location.search).get("q");
  if (query) { input.value = query; run(); }
})();
