/* Tema 4 — Taller arranque: corriendo no es lo mismo que listo. */
(function () {
  "use strict";
  window.DOCKLABS = window.DOCKLABS || {};

  window.DOCKLABS.arranque = {
    mount: function (host) {
      var U = window.DOCKUI;
      var box = U.labShell(
        "Ordená el arranque sin adivinar",
        "El error clásico: la app arranca antes que Postgres y muere intentando conectar. Elegí la estrategia y mapeá cada ruta a su sonda."
      );

      var q = U.el("div");
      box.appendChild(q);
      U.renderQuiz(q, [
        {
          q: "depends_on a secas (sin condition). ¿Qué garantiza?",
          opts: [
            "Que la base acepta conexiones antes de crear la app",
            "Solo el orden de creación: la app puede nacer antes de que la base responda",
            "Que la app reintenta sola hasta conectar",
            "Que el healthcheck de la base ya pasó"
          ],
          a: 1,
          why: "Sin condition: service_healthy, Compose solo ordena la creación. La base puede estar corriendo pero sorda. Por eso la T1 pide healthcheck + estrategia justificada."
        },
        {
          q: "Tu app reintenta la conexión con espera exponencial aunque Compose no tenga depends_on. ¿Eso vale?",
          opts: [
            "No, la T1 exige depends_on sí o sí",
            "Sí: reintentos en la app es una estrategia válida, y combinada con depends_on es lo más robusto",
            "Solo si usás Kubernetes",
            "Solo para Keycloak, no para Postgres"
          ],
          a: 1,
          why: "La T1 deja la estrategia a tu criterio (depends_on con condición, reintentos, o ambos) siempre que la justifiques. Sistemas distribuidos: nadie te promete orden, programá para el desorden."
        }
      ]);

      box.appendChild(U.el("h3", null, "Cada ruta a su sonda"));
      var maps = [
        { c: "GET /health (sin tocar la base)", answer: "liveness", why: "/health dice si el proceso vive. En Compose es el healthcheck de la app; en K8s, el livenessProbe." },
        { c: "GET /ready (prueba la base)", answer: "readiness", why: "/ready dice si puede atender. En K8s el readinessProbe saca al pod del tráfico sin reiniciarlo." },
        { c: "pg_isready en el servicio db", answer: "salud de la dependencia", why: "La base declara su propia salud; la app la espera con condition: service_healthy." }
      ];
      maps.forEach(function (k) {
        var row = U.el("div", "match-row");
        row.appendChild(U.el("span", null, k.c));
        var sel = document.createElement("select");
        sel.setAttribute("aria-label", "Sonda para: " + k.c);
        ["elegí…", "liveness", "readiness", "salud de la dependencia"].forEach(function (o) {
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
        box.appendChild(row);
      });
      host.appendChild(box);
    }
  };
})();
