/* Navegación, progreso, tema y ensamblado de vistas. */
(function () {
  "use strict";

  var KEY = "bdii-cont-done-v1";
  var KEY_LEGACY = "muelle-t1-done-v1";
  var THEME_KEY = "bdii-cont-theme";
  var QUIZ_PREFIX = "bdii-cont-quiz-";
  var LAB_PREFIX = "bdii-cont-lab-";

  var view = document.getElementById("view");
  var where = document.getElementById("where");
  var nav = document.getElementById("rail-nav");
  var fill = document.getElementById("progress-fill");
  var meta = document.getElementById("progress-meta");
  var themeBtn = document.getElementById("themeBtn");
  var U = function () { return window.DOCKUI; };

  function migrateDone() {
    var cur = U().lsGetJSON(KEY, null);
    if (cur && typeof cur === "object") return cur;
    var legacy = U().lsGetJSON(KEY_LEGACY, null);
    if (legacy && typeof legacy === "object") {
      U().lsSetJSON(KEY, legacy);
      return legacy;
    }
    return {};
  }

  var done = migrateDone();

  function saveDone() {
    U().lsSetJSON(KEY, done);
  }

  function applyTheme(t) {
    document.body.classList.toggle("light", t === "light");
    if (themeBtn) themeBtn.textContent = t === "light" ? "☀️" : "🌙";
    try {
      localStorage.setItem(THEME_KEY, t);
      localStorage.setItem("bdii-hub-theme", t);
    } catch (e) { /* ignore */ }
  }
  (function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY) || localStorage.getItem("bdii-hub-theme"); } catch (e) { /* ignore */ }
    applyTheme(saved === "light" ? "light" : "dark");
  })();
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      applyTheme(document.body.classList.contains("light") ? "dark" : "light");
    });
  }

  function topics() { return window.DOCKTOPICS || []; }

  var navBtns = [];

  function renderNav(active) {
    nav.innerHTML = "";
    navBtns = [];

    function addLink(opts) {
      var b = document.createElement("button");
      b.className = "rail-link" + (opts.done ? " done" : "");
      b.type = "button";
      b.dataset.view = opts.view || "";
      if (opts.topic) b.dataset.topic = opts.topic;
      b.innerHTML = '<span class="n">' + opts.n + "</span>";
      var s = document.createElement("span");
      s.textContent = opts.label;
      b.appendChild(s);
      b.addEventListener("click", opts.onClick);
      nav.appendChild(b);
      navBtns.push(b);
      return b;
    }

    addLink({ n: "··", label: "Mapa", view: "map", onClick: function () { location.hash = "#/"; } });
    topics().forEach(function (t) {
      addLink({
        n: t.num + (done[t.id] ? " ✓" : ""),
        label: t.title,
        topic: t.id,
        done: !!done[t.id],
        onClick: function () { location.hash = "#/t/" + t.id; }
      });
    });
    addLink({ n: "GL", label: "Glosario", view: "glossary", onClick: function () { location.hash = "#/glosario"; } });
    addLink({ n: "CS", label: "Cheatsheet", view: "cheat", onClick: function () { location.hash = "#/cheatsheet"; } });

    var n = topics().filter(function (t) { return done[t.id]; }).length;
    fill.style.width = (topics().length ? Math.round(n / topics().length * 100) : 0) + "%";
    meta.textContent = n + " / " + topics().length;
    markActive(active);
  }

  function markActive(active) {
    navBtns.forEach(function (b) {
      var on = false;
      if (!active || active.type === "map") on = b.dataset.view === "map";
      else if (active.type === "topic") on = b.dataset.topic === active.id;
      else if (active.type === "glossary") on = b.dataset.view === "glossary";
      else if (active.type === "cheat") on = b.dataset.view === "cheat";
      b.classList.toggle("active", on);
      b.setAttribute("aria-current", on ? "page" : "false");
    });
  }

  function scrollViewTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    var main = document.getElementById("main");
    if (main) main.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function showMap() {
    where.textContent = "Mapa · 7 temas";
    view.innerHTML = "";
    var k = U().el("p", "kicker", "Contenerización · Estudio");
    var h = U().el("h1", null, "Entendé el sistema antes de contenerizarlo");
    var lede = U().el("p", "lede", "Siete temas en el orden en que se rompen las cosas: imagen, orquestación, datos, arranque, identidad y el salto a Kubernetes. Cada tema cierra con un taller donde escribís, comprobás y comparás.");
    view.appendChild(k);
    view.appendChild(h);
    view.appendChild(lede);
    var call = U().el("div", "callout");
    call.innerHTML = "<p class=\"lbl\">Cómo estudiar acá</p><p>Leé el tema (índice a la derecha en desktop), hacé el quiz, practicá el taller y marcá la capa como revisada. El progreso, las respuestas del quiz y el texto de los editores se guardan en <strong>este navegador</strong>. Los labs <strong>no</strong> ejecutan Docker de verdad.</p>";
    view.appendChild(call);
    var tip = U().el("div", "callout warn");
    tip.innerHTML = "<p class=\"lbl\">Capas 06 y 07</p><p>Kind y Kustomize comparten el mismo taller de manifiestos: avanzá en orden; el editor es el mismo archivo guardado.</p>";
    view.appendChild(tip);

    var ul = U().el("ul", "topic-list");
    topics().forEach(function (t) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.appendChild(U().el("span", "n", t.num));
      b.appendChild(U().el("span", "t", t.title));
      b.appendChild(U().el("span", "s", t.sub));
      if (done[t.id]) b.appendChild(U().el("span", "pill", "revisada"));
      b.addEventListener("click", function () { location.hash = "#/t/" + t.id; });
      li.appendChild(b);
      ul.appendChild(li);
    });
    view.appendChild(ul);
    renderNav({ type: "map" });
  }

  function showTopic(id) {
    var t = topics().filter(function (x) { return x.id === id; })[0];
    if (!t) { showMap(); return; }
    where.textContent = t.num + " · " + t.title;
    view.innerHTML = "";
    view.appendChild(U().el("p", "kicker", "Tema " + t.num + " · " + t.sub));
    view.appendChild(U().el("h1", null, t.title));
    view.appendChild(U().el("p", "lede", t.lede));

    var layout = U().el("div", "topic-layout");
    var body = U().el("div", "topic-body");
    body.innerHTML = t.body;
    var toc = U().buildToc(body);
    if (toc) layout.appendChild(toc);
    layout.appendChild(body);
    view.appendChild(layout);

    view.appendChild(U().el("h2", null, "Comprobá que lo entendiste"));
    var qbox = U().el("div");
    view.appendChild(qbox);
    U().renderQuiz(qbox, t.quiz, { storeKey: QUIZ_PREFIX + t.id });

    view.appendChild(U().el("h2", null, "Taller"));
    var labHost = U().el("div");
    view.appendChild(labHost);
    var lab = window.DOCKLABS && window.DOCKLABS[t.lab];
    if (lab) lab.mount(labHost);
    else labHost.appendChild(U().el("p", "note", "Este tema comparte taller con su vecino."));

    var row = U().textButtons();
    view.appendChild(row.row);
    row.add(done[t.id] ? "Capa revisada ✓ (desmarcar)" : "Marcar capa como revisada", !done[t.id], function () {
      if (done[t.id]) delete done[t.id];
      else done[t.id] = 1;
      saveDone();
      renderNav({ type: "topic", id: id });
      showTopic(id);
    });
    row.add("Volver al mapa", false, function () { location.hash = "#/"; });
    var idx = topics().findIndex(function (x) { return x.id === id; });
    if (idx > 0) {
      var prev = topics()[idx - 1];
      row.add("← " + prev.num, false, function () { location.hash = "#/t/" + prev.id; });
    }
    if (idx >= 0 && idx < topics().length - 1) {
      var next = topics()[idx + 1];
      row.add(next.num + " →", false, function () { location.hash = "#/t/" + next.id; });
    }

    renderNav({ type: "topic", id: id });
    scrollViewTop();
  }

  function showGlossary() {
    where.textContent = "Glosario";
    view.innerHTML = "";
    view.appendChild(U().el("p", "kicker", "Referencia rápida"));
    view.appendChild(U().el("h1", null, "Glosario"));
    view.appendChild(U().el("p", "lede", "Términos EN/ES que aparecen en las capas. Filtrá por nombre o definición."));
    var input = document.createElement("input");
    input.className = "glossary-search";
    input.type = "search";
    input.placeholder = "Filtrar (ej: volume, JWT, probe)…";
    input.setAttribute("aria-label", "Filtrar glosario");
    view.appendChild(input);
    var list = U().el("div", "glossary-list");
    view.appendChild(list);

    function paint(q) {
      list.innerHTML = "";
      var qq = (q || "").trim().toLowerCase();
      (window.DOCKGLOSSARY || []).forEach(function (g) {
        var hay = (g.t + " " + g.d + " " + (g.x || "")).toLowerCase();
        if (qq && hay.indexOf(qq) === -1) return;
        var card = U().el("div", "gloss-term");
        card.appendChild(U().el("h3", null, g.t));
        card.appendChild(U().el("p", "def", g.d));
        if (g.x) card.appendChild(U().el("p", "note", g.x));
        list.appendChild(card);
      });
      if (!list.children.length) list.appendChild(U().el("p", "note", "Sin coincidencias."));
    }
    input.addEventListener("input", function () { paint(input.value); });
    paint("");
    renderNav({ type: "glossary" });
    scrollViewTop();
  }

  function showCheat() {
    where.textContent = "Cheatsheet";
    view.innerHTML = "";
    view.appendChild(U().el("p", "kicker", "Una página"));
    view.appendChild(U().el("h1", null, "Cheatsheet"));
    view.appendChild(U().el("p", "lede", "Solo bullets y reglas operativas. Imprimible."));
    var grid = U().el("div", "cheat-grid");
    (window.DOCKCHEAT || []).forEach(function (c) {
      var card = U().el("div", "sheet cheat-card");
      card.appendChild(U().el("h3", null, c.title));
      var ul = document.createElement("ul");
      c.lines.forEach(function (line) {
        var li = document.createElement("li");
        li.textContent = line;
        ul.appendChild(li);
      });
      card.appendChild(ul);
      grid.appendChild(card);
    });
    view.appendChild(grid);
    var printRow = U().textButtons();
    printRow.add("Imprimir / PDF", true, function () { window.print(); });
    view.appendChild(printRow.row);
    renderNav({ type: "cheat" });
    scrollViewTop();
  }

  function clearAllProgress() {
    done = {};
    saveDone();
    try { localStorage.removeItem(KEY_LEGACY); } catch (e) { /* ignore */ }
    var keys = [];
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && (k.indexOf(QUIZ_PREFIX) === 0 || k.indexOf(LAB_PREFIX) === 0)) keys.push(k);
      }
    } catch (e) { /* ignore */ }
    keys.forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) { /* ignore */ }
    });
  }

  function route() {
    var h = location.hash || "#/";
    var m = /^#\/t\/([\w-]+)/.exec(h);
    if (m) showTopic(m[1]);
    else if (h.indexOf("#/glosario") === 0) showGlossary();
    else if (h.indexOf("#/cheatsheet") === 0) showCheat();
    else showMap();
  }

  document.getElementById("btn-reset-progress").addEventListener("click", function () {
    if (!confirm("¿Borrar en este navegador las capas revisadas, respuestas de quiz y textos guardados de los talleres?")) return;
    clearAllProgress();
    renderNav({ type: "map" });
    route();
  });

  window.addEventListener("hashchange", route);
  renderNav({ type: "map" });
  route();
})();
