/* Navegación, progreso y ensamblado de vistas. */
(function () {
  "use strict";

  var KEY = "muelle-t1-done-v1";
  var view = document.getElementById("view");
  var where = document.getElementById("where");
  var nav = document.getElementById("rail-nav");
  var fill = document.getElementById("progress-fill");
  var meta = document.getElementById("progress-meta");

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch (e) { return {}; }
  }
  function save(d) {
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { /* sin storage, sin drama */ }
  }
  var done = load();

  function topics() { return window.DOCKTOPICS || []; }

  var navBtns = [];

  function renderNav() {
    nav.innerHTML = "";
    navBtns = [];
    var home = document.createElement("button");
    home.className = "rail-link";
    home.type = "button";
    home.dataset.view = "map";
    home.innerHTML = '<span class="n">··</span><span>Mapa</span>';
    home.addEventListener("click", function () { location.hash = "#/"; });
    nav.appendChild(home);
    navBtns.push(home);
    topics().forEach(function (t) {
      var b = document.createElement("button");
      b.className = "rail-link" + (done[t.id] ? " done" : "");
      b.type = "button";
      b.dataset.topic = t.id;
      b.innerHTML = '<span class="n">' + t.num + (done[t.id] ? " ✓" : "") + "</span>";
      var s = document.createElement("span");
      s.textContent = t.title;
      b.appendChild(s);
      b.addEventListener("click", function () { location.hash = "#/t/" + t.id; });
      nav.appendChild(b);
      navBtns.push(b);
    });
    var n = topics().filter(function (t) { return done[t.id]; }).length;
    fill.style.width = (topics().length ? Math.round(n / topics().length * 100) : 0) + "%";
    meta.textContent = n + " / " + topics().length;
  }

  function markActive(id) {
    navBtns.forEach(function (b) {
      var isMap = b.dataset.view === "map";
      b.classList.toggle("active", (id == null && isMap) || (b.dataset.topic === id));
    });
  }

  function showMap() {
    where.textContent = "Mapa · 7 temas";
    view.innerHTML = "";
    var k = document.createElement("p");
    k.className = "kicker";
    k.textContent = "Contenerización · Estudio";
    var h = document.createElement("h1");
    h.textContent = "Entendé el sistema antes de contenerizarlo";
    var lede = document.createElement("p");
    lede.className = "lede";
    lede.textContent = "Siete temas en el orden en que se rompen las cosas: imagen, orquestación, datos, arranque, identidad y el salto a Kubernetes. Cada tema cierra con un taller donde escribís, comprobás y comparás.";
    view.appendChild(k);
    view.appendChild(h);
    view.appendChild(lede);
    var call = document.createElement("div");
    call.className = "callout";
    call.innerHTML = '<p class="lbl">Cómo estudiar acá</p><p>Leé el tema, hacé el taller y marcá la capa como revisada. Los simuladores no corren Docker de verdad: analizan tus archivos y predicen fallos. Si algo dice que no se ejecuta, es a propósito.</p>';
    view.appendChild(call);
    var ul = document.createElement("ul");
    ul.className = "topic-list";
    topics().forEach(function (t) {
      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      var n = document.createElement("span");
      n.className = "n";
      n.textContent = t.num;
      var tt = document.createElement("span");
      tt.className = "t";
      tt.textContent = t.title;
      var s = document.createElement("span");
      s.className = "s";
      s.textContent = t.sub;
      b.appendChild(n);
      b.appendChild(tt);
      b.appendChild(s);
      if (done[t.id]) {
        var p = document.createElement("span");
        p.className = "pill";
        p.textContent = "revisada";
        b.appendChild(p);
      }
      b.addEventListener("click", function () { location.hash = "#/t/" + t.id; });
      li.appendChild(b);
      ul.appendChild(li);
    });
    view.appendChild(ul);
    markActive(null);
  }

  function showTopic(id) {
    var t = topics().filter(function (x) { return x.id === id; })[0];
    if (!t) { showMap(); return; }
    where.textContent = t.num + " · " + t.title;
    view.innerHTML = "";
    var k = document.createElement("p");
    k.className = "kicker";
    k.textContent = "Tema " + t.num + " · " + t.sub;
    var h = document.createElement("h1");
    h.textContent = t.title;
    var lede = document.createElement("p");
    lede.className = "lede";
    lede.textContent = t.lede;
    view.appendChild(k);
    view.appendChild(h);
    view.appendChild(lede);
    var body = document.createElement("div");
    body.innerHTML = t.body;
    view.appendChild(body);

    var qh = document.createElement("h2");
    qh.textContent = "Comprobá que lo entendiste";
    view.appendChild(qh);
    var qbox = document.createElement("div");
    view.appendChild(qbox);
    window.DOCKUI.renderQuiz(qbox, t.quiz);

    var lh = document.createElement("h2");
    lh.textContent = "Taller";
    view.appendChild(lh);
    var labHost = document.createElement("div");
    view.appendChild(labHost);
    var lab = window.DOCKLABS && window.DOCKLABS[t.lab];
    if (lab) lab.mount(labHost);
    else labHost.appendChild(window.DOCKUI.el("p", "note", "Este tema comparte taller con su vecino."));

    var row = window.DOCKUI.textButtons();
    var bar = row.row;
    view.appendChild(bar);
    var toggle = row.add(done[t.id] ? "Capa revisada ✓ (desmarcar)" : "Marcar capa como revisada", !done[t.id], function () {
      if (done[t.id]) delete done[t.id];
      else done[t.id] = 1;
      save(done);
      renderNav();
      showTopic(id);
    });
    void toggle;
    var back = row.add("Volver al mapa", false, function () { location.hash = "#/"; });
    void back;
    markActive(id);
    document.getElementById("main").scrollIntoView();
  }

  function route() {
    var h = location.hash || "#/";
    var m = /^#\/t\/([\w-]+)/.exec(h);
    if (m) showTopic(m[1]);
    else showMap();
  }

  document.getElementById("btn-reset-progress").addEventListener("click", function () {
    done = {};
    save(done);
    renderNav();
    route();
  });

  window.addEventListener("hashchange", route);
  renderNav();
  route();
})();
