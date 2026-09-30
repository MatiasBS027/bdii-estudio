/* Tema 5 — Taller auth: decodificás un JWT y decidís 401 vs 403. */
(function () {
  "use strict";
  window.DOCKLABS = window.DOCKLABS || {};

  function b64url(obj) {
    var s = btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
    return s.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  var EXPECTED_ISS = "http://keycloak:8080/realms/tarea-corta-realm";
  var EXPECTED_AUD = "api-backend";

  window.DOCKLABS.auth = {
    mount: function (host) {
      var U = window.DOCKUI, C = window.DOCKCHECK;
      var box = U.labShell(
        "Leé el token antes de confiar",
        "Generamos un JWT de ejemplo (firma simulada). Decodificalo, pasá el checklist OIDC y después clasificá respuestas 401 vs 403."
      );

      var sample = b64url({ alg: "RS256", typ: "JWT", kid: "demo-key-1" }) + "." +
        b64url({
          iss: EXPECTED_ISS,
          aud: EXPECTED_AUD,
          sub: "usuario_prueba",
          exp: 2000000000,
          iat: 1900000000,
          realm_access: { roles: ["creador"] }
        }) + ".firma-simulada";

      var ta = document.createElement("textarea");
      ta.className = "editor";
      ta.style.minHeight = "120px";
      ta.setAttribute("aria-label", "JWT a inspeccionar");
      ta.spellcheck = false;
      var ed = U.bindEditor(ta, "bdii-cont-lab-auth-jwt", sample);
      box.appendChild(ta);

      var out = U.el("div");
      box.appendChild(out);
      var bar = U.textButtons();
      bar.add("Decodificar y validar", true, function () {
        out.innerHTML = "";
        var d = C.decodeJwt(ta.value);
        if (d.error) {
          U.renderFindings(out, [{ level: "bad", tag: "FALLA", title: "Token inválido", body: d.error }]);
          return;
        }
        var pre = U.el("pre", "ref-block",
          "header:  " + JSON.stringify(d.header) + "\n" +
          "payload: " + JSON.stringify(d.payload, null, 1) + "\n" +
          "firma:   " + d.sig + " (simulada: en producción se valida con el JWKS de Keycloak)");
        out.appendChild(pre);
        var claims = C.checkJwtClaims(d.payload, { iss: EXPECTED_ISS, aud: EXPECTED_AUD });
        var roles = (d.payload.realm_access && d.payload.realm_access.roles) || [];
        claims.push(roles.indexOf("creador") !== -1
          ? { level: "good", tag: "OK", title: "Rol creador presente", body: "Con este token, POST /reservas pasa el 403." }
          : { level: "bad", tag: "FALLA", title: "Sin rol requerido", body: "Token válido pero sin rol: la ruta responde 403, no 401." });
        U.renderFindings(out, claims);
      });
      bar.add("Probar con iss roto", false, function () {
        var broken = b64url({ alg: "RS256", typ: "JWT", kid: "demo-key-1" }) + "." +
          b64url({
            iss: "http://localhost:8080/realms/tarea-corta-realm",
            aud: EXPECTED_AUD,
            sub: "usuario_prueba",
            exp: 2000000000,
            iat: 1900000000,
            realm_access: { roles: ["creador"] }
          }) + ".firma-simulada";
        ta.value = broken;
        ed.saveNow();
        out.innerHTML = "";
        out.appendChild(U.el("p", "note",
          "Cambiamos el iss a localhost (el error clásico dentro de Docker). Ahora dale a Decodificar y validar: el checklist debe marcar FALLA en emisor aunque todo lo demás esté bien."));
      });
      box.appendChild(bar.row);

      box.appendChild(U.el("h3", null, "401, 403 o 200"));
      var cases = [
        { c: "POST /reservas sin header Authorization", answer: "401", why: "Sin token no hay identidad: 401." },
        { c: "POST /reservas con token válido pero sin rol creador", answer: "403", why: "Hay identidad, falta permiso: 403." },
        { c: "GET /health sin token", answer: "200", why: "Salud siempre abierta: no toca la base ni pide token." },
        { c: "POST /reservas con token vencido", answer: "401", why: "Vencido es como inválido: 401, aunque la firma sea correcta." }
      ];
      cases.forEach(function (k) {
        var row = U.el("div", "match-row");
        row.appendChild(U.el("span", null, k.c));
        var sel = document.createElement("select");
        sel.setAttribute("aria-label", "Código para: " + k.c);
        ["elegí…", "200", "401", "403"].forEach(function (o) {
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
