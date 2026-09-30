/* Tema 1 — Taller Dockerfile: escribís, comprobás, comparás. */
(function () {
  "use strict";
  window.DOCKLABS = window.DOCKLABS || {};

  var STARTER =
    "FROM python:latest\n" +
    "COPY . /app\n" +
    "RUN pip install -r requirements.txt\n" +
    "RUN apt-get update\n" +
    "RUN apt-get install -y curl\n" +
    "ENV DB_PASSWORD=secreto123\n" +
    "CMD python app.py\n";

  var REFERENCE =
    "# Una opción válida (no la única): imagen chica, reproducible, sin secretos.\n" +
    "FROM python:3.12-slim\n" +
    "WORKDIR /app\n" +
    "COPY requirements.txt .\n" +
    "RUN pip install --no-cache-dir -r requirements.txt\n" +
    "COPY app.py .\n" +
    "RUN useradd -m appuser && chown -R appuser /app\n" +
    "USER appuser\n" +
    "EXPOSE 5000\n" +
    "CMD [\"python\", \"app.py\"]\n";

  window.DOCKLABS.dockerfile = {
    mount: function (host) {
      var U = window.DOCKUI, C = window.DOCKCHECK, P = window.DOCKCOMPARE;
      var box = U.labShell(
        "Escribí el Dockerfile del servicio",
        "Escenario: servicio Python con app.py y requirements.txt. La imagen debe ser reproducible, liviana y sin secretos. El punto de partida trae errores a propósito: encontralos."
      );
      var ta = document.createElement("textarea");
      ta.className = "editor";
      ta.setAttribute("aria-label", "Tu Dockerfile");
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
        U.renderFindings(out, C.checkDockerfile(ta.value));
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
      var sum = U.el("summary", null, "Ver la opción de referencia");
      var pre = U.el("pre", "ref-block", REFERENCE);
      ref.appendChild(sum);
      ref.appendChild(pre);
      box.appendChild(ref);
      box.appendChild(U.el("p", "note",
        "No hay un único Dockerfile correcto. La referencia es una opción que cumple: base oficial con versión, WORKDIR, COPY en vez de ADD, CMD en forma exec, USER no-root y ningún secreto."));
      host.appendChild(box);
    }
  };
})();
