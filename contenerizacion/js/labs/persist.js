/* Tema 3 — Taller volúmenes: qué sobrevive a qué. */
(function () {
  "use strict";
  window.DOCKLABS = window.DOCKLABS || {};

  window.DOCKLABS.persist = {
    mount: function (host) {
      var U = window.DOCKUI;
      var box = U.labShell(
        "Qué sobrevive al down",
        "Tres decisiones chicas que valen 8 puntos: dónde viven los datos, qué borra cada comando y qué montaje pide cada caso."
      );

      /* Parte 1: down vs down -v */
      var q1 = U.el("div");
      box.appendChild(q1);
      U.renderQuiz(q1, [
        {
          q: "Escribiste 3 reservas, corrés docker compose down (sin -v) y volvés a levantar. ¿Qué pasa?",
          opts: [
            "Los datos siguen: el volumen declarado sobrevive al down",
            "Los datos se pierden: down siempre borra todo",
            "Los datos siguen solo si hiciste commit de la imagen",
            "Los datos siguen porque quedan en la caché de build"
          ],
          a: 0,
          why: "down destruye contenedores, no volúmenes. El volumen es un objeto aparte que sigue existiendo. Por eso se verifica persistencia con down/up."
        },
        {
          q: "Mismo caso pero con docker compose down -v. ¿Qué pasa?",
          opts: [
            "Nada cambia respecto al down normal",
            "Se borran los volúmenes declarados: los datos se pierden",
            "Solo se borran las imágenes",
            "Se borra el código del repositorio"
          ],
          a: 0 + 1,
          why: "-v borra los volúmenes nombrados del proyecto. Es la forma de arrancar de cero, y la trampa clásica antes de la demo."
        }
      ], { storeKey: "bdii-cont-quiz-lab-persist" });

      /* Parte 2: qué montaje para cada caso */
      var cases = [
        { c: "Datos de Postgres que deben sobrevivir reinicios", answer: "volumen", why: "Gestionado por Docker, portable, con driver de almacenamiento rápido. Es lo habitual en evaluación." },
        { c: "Editar código en tu máquina y verlo al instante en el contenedor", answer: "bind", why: "Bind monta tu carpeta real: ideal para desarrollo, malo para datos que deben viajar con el proyecto." },
        { c: "Caché temporal que no debe tocar disco nunca", answer: "tmpfs", why: "Vive solo en RAM: rapidísimo y efímero. Perfecto para lo no persistente." }
      ];
      var tbl = U.el("div");
      cases.forEach(function (k) {
        var row = U.el("div", "match-row");
        row.appendChild(U.el("span", null, k.c));
        var sel = document.createElement("select");
        sel.setAttribute("aria-label", "Tipo de montaje para: " + k.c);
        ["elegí…", "volumen", "bind", "tmpfs"].forEach(function (o) {
          var op = document.createElement("option");
          op.value = o;
          op.textContent = o;
          sel.appendChild(op);
        });
        var fb = U.el("span", "note", "");
        sel.addEventListener("change", function () {
          if (sel.value === "elegí…") { fb.textContent = ""; return; }
          fb.textContent = sel.value === k.answer ? "Bien. " + k.why : "No. " + k.why;
        });
        row.appendChild(sel);
        row.appendChild(fb);
        tbl.appendChild(row);
      });
      box.appendChild(U.el("h3", null, "El montaje correcto para cada caso"));
      box.appendChild(tbl);
      box.appendChild(U.el("p", "note", "Regla corta: volumen para lo que debe persistir, bind para desarrollar con archivos del host, tmpfs para lo efímero."));
      host.appendChild(box);
    }
  };
})();
