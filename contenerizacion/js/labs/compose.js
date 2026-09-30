/* Tema 2 — Taller Compose: tres servicios que se hablan por nombre. */
(function () {
  "use strict";
  window.DOCKLABS = window.DOCKLABS || {};

  var STARTER =
    "services:\n" +
    "  app:\n" +
    "    build: .\n" +
    "    ports:\n" +
    "      - \"5000:5000\"\n" +
    "    environment:\n" +
    "      - DB_HOST=localhost\n" +
    "      - DB_PASSWORD=secreto123\n" +
    "  db:\n" +
    "    image: postgres:16\n" +
    "    environment:\n" +
    "      - POSTGRES_PASSWORD=secreto123\n";

  var REFERENCE =
    "# Una opción válida (no la única): 3 servicios, nombres, salud y secretos por entorno.\n" +
    "services:\n" +
    "  app:\n" +
    "    build: .\n" +
    "    ports:\n" +
    "      - \"5000:5000\"\n" +
    "    environment:\n" +
    "      - DB_HOST=postgres-db\n" +
    "      - DB_PASSWORD=${DB_PASSWORD}\n" +
    "    depends_on:\n" +
    "      postgres-db:\n" +
    "        condition: service_healthy\n" +
    "    healthcheck:\n" +
    "      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:5000/health\"]\n" +
    "  postgres-db:\n" +
    "    image: postgres:16\n" +
    "    environment:\n" +
    "      - POSTGRES_PASSWORD=${DB_PASSWORD}\n" +
    "    volumes:\n" +
    "      - db-data:/var/lib/postgresql/data\n" +
    "    healthcheck:\n" +
    "      test: [\"CMD-SHELL\", \"pg_isready -U ${DB_USER}\"]\n" +
    "  keycloak:\n" +
    "    image: quay.io/keycloak/keycloak:24\n" +
    "    depends_on:\n" +
    "      postgres-db:\n" +
    "        condition: service_healthy\n" +
    "volumes:\n" +
    "  db-data:\n";

  window.DOCKLABS.compose = {
    mount: function (host) {
      var U = window.DOCKUI, C = window.DOCKCHECK, P = window.DOCKCOMPARE;
      var box = U.labShell(
        "Levantá app + Postgres + Keycloak con un comando",
        "El punto de partida tiene cuatro problemas clásicos: falta Keycloak, localhost donde va nombre de servicio, contraseña literal y ningún healthcheck. Arreglalo."
      );
      var ta = document.createElement("textarea");
      ta.className = "editor";
      ta.style.minHeight = "340px";
      ta.setAttribute("aria-label", "Tu docker-compose.yml");
      ta.spellcheck = false;
      ta.value = STARTER;
      box.appendChild(ta);

      var out = U.el("div");
      var cmp = U.el("div");
      box.appendChild(out);
      box.appendChild(cmp);

      var bar = U.textButtons();
      bar.add("Comprobar", true, function () {
        cmp.innerHTML = "";
        U.renderFindings(out, C.checkCompose(ta.value));
      });
      bar.add("Comparar con una opción válida", false, function () {
        out.innerHTML = "";
        P.renderCompare(cmp, P.compareDirectives(ta.value, REFERENCE));
      });
      bar.add("Reiniciar", false, function () {
        ta.value = STARTER;
        out.innerHTML = "";
        cmp.innerHTML = "";
      });
      box.appendChild(bar.row);

      var ref = U.el("details");
      ref.appendChild(U.el("summary", null, "Ver la opción de referencia"));
      ref.appendChild(U.el("pre", "ref-block", REFERENCE));
      box.appendChild(ref);
      box.appendChild(U.el("p", "note",
        "La referencia es una opción, no la respuesta. Lo que no negocia la T1: tres servicios, nombres de servicio en vez de localhost o IP, volumen para Postgres y healthchecks con arranque ordenado."));
      host.appendChild(box);
    }
  };
})();
