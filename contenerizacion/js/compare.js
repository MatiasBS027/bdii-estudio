/* Comparación honesta: tu texto vs una opción de referencia.
   Verde = misma decisión. Ámbar = distinto pero válido. Rojo = falta o contradice. */
(function () {
  "use strict";

  function norm(line) {
    return String(line || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  function keyOf(line) {
    var t = norm(line);
    if (!t || t.charAt(0) === "#") return null;
    var m = /^([a-z_]+)[\s:[]/.exec(t);
    return m ? m[1] : t.slice(0, 18);
  }

  /* Para Dockerfile/Compose/YAML: compara por directivas, no por texto exacto. */
  function compareDirectives(mine, ref) {
    var myLines = String(mine || "").split(/\r?\n/);
    var refLines = String(ref || "").split(/\r?\n/);
    var myKeys = {};
    myLines.forEach(function (l) {
      var k = keyOf(l);
      if (k) myKeys[k] = (myKeys[k] || []).concat([l]);
    });
    var rows = [];
    refLines.forEach(function (rl) {
      var t = rl.trim();
      if (!t) return;
      if (t.charAt(0) === "#") {
        rows.push({ cls: "ok", mine: "", ref: rl, note: "comentario" });
        return;
      }
      var k = keyOf(rl);
      var mine = (myKeys[k] || [])[0];
      if (!mine) {
        rows.push({ cls: "miss", mine: "", ref: rl, note: "te falta" });
      } else if (norm(mine) === norm(rl)) {
        rows.push({ cls: "ok", mine: mine, ref: rl, note: "igual" });
      } else {
        rows.push({ cls: "add", mine: mine, ref: rl, note: "distinto" });
        delete myKeys[k];
      }
      if (mine && myKeys[k]) myKeys[k] = myKeys[k].slice(1);
    });
    Object.keys(myKeys).forEach(function (k) {
      (myKeys[k] || []).forEach(function (l) {
        if (l.trim()) rows.push({ cls: "add", mine: l, ref: "", note: "tuyo, de más" });
      });
    });
    var same = rows.filter(function (r) { return r.cls === "ok" && r.note === "igual"; }).length;
    var total = rows.filter(function (r) { return r.note !== "comentario"; }).length;
    return { rows: rows, same: same, total: total };
  }

  function renderCompare(el, result) {
    el.innerHTML = "";
    var head = document.createElement("p");
    head.className = "legend";
    head.textContent = "Coincidencias de decisión: " + result.same + " / " + result.total +
      ". Distinto no es malo: puede ser otra opción válida. Lo que importa es si cumple el contrato.";
    el.appendChild(head);
    var wrap = document.createElement("div");
    wrap.className = "compare";
    var left = document.createElement("div");
    var right = document.createElement("div");
    left.innerHTML = "<h3>Lo tuyo</h3>";
    right.innerHTML = "<h3>Una opción válida</h3>";
    result.rows.forEach(function (r) {
      var a = document.createElement("div");
      a.className = "line " + r.cls;
      a.textContent = r.mine || "—";
      var b = document.createElement("div");
      b.className = "line " + (r.cls === "miss" ? "miss" : r.cls === "ok" ? "ok" : "add");
      b.textContent = r.ref || "—";
      left.appendChild(a);
      right.appendChild(b);
    });
    wrap.appendChild(left);
    wrap.appendChild(right);
    el.appendChild(wrap);
  }

  window.DOCKCOMPARE = {
    compareDirectives: compareDirectives,
    renderCompare: renderCompare
  };
})();
