/* Motor de comprobación: reglas honestas, sin ejecutar Docker.
   Cada función recibe texto y devuelve findings:
   { level: "good" | "warn" | "bad", tag: "OK" | "OJO" | "FALLA", title, body } */
(function () {
  "use strict";

  function finding(level, tag, title, body) {
    return { level: level, tag: tag, title: title, body: body };
  }

  function lines(src) {
    return String(src || "").split(/\r?\n/);
  }

  function nonComment(src) {
    return lines(src).filter(function (l) {
      var t = l.trim();
      return t && t.charAt(0) !== "#";
    });
  }

  /* ---------------- Dockerfile ---------------- */
  function checkDockerfile(src) {
    var out = [];
    var text = String(src || "");
    var ls = nonComment(text);
    if (!ls.length) {
      return [finding("warn", "OJO", "Archivo vacío", "Escribí al menos un FROM para empezar.")];
    }

    var froms = ls.filter(function (l) { return /^from\s+/i.test(l.trim()); });
    if (!froms.length) {
      out.push(finding("bad", "FALLA", "Sin FROM", "Toda imagen nace de una base. Empezá con FROM <oficial>:<versión>."));
    } else {
      var multi = froms.length > 1;
      if (multi) {
        out.push(finding("good", "OK", "Multi-stage detectado", froms.length + " etapas FROM. La etapa final debería traer solo el artefacto, no el SDK."));
      }
      var first = froms[0].trim();
      if (/:latest(\s|$)/i.test(first) || !/:/.test(first)) {
        out.push(finding("bad", "FALLA", "Etiqueta latest o ausente", "Fijá versión (ej. python:3.12-slim). latest rompe reproducibilidad: hoy y mañana pueden ser imágenes distintas."));
      } else {
        out.push(finding("good", "OK", "Base con versión fija", "Versión explícita: la construcción es repetible."));
      }
      if (/(python|node|golang|eclipse-temurin|postgres|quay\.io\/keycloak)/i.test(first)) {
        out.push(finding("good", "OK", "Base de ecosistema conocido", "Partir de una imagen oficial es lo que la T1 permite y espera."));
      } else {
        out.push(finding("warn", "OJO", "Base no reconocida", "Si no es oficial (Docker Hub verified u oficial), justificá por qué. La T1 exige base oficial."));
      }
      if (/(alpine|slim|distroless)/i.test(first)) {
        out.push(finding("good", "OK", "Variante liviana", "Alpine o slim achica la imagen y la superficie de ataque."));
      } else {
        out.push(finding("warn", "OJO", "Imagen posiblemente pesada", "Si la app no necesita el SO completo, una variante slim o alpine pesa menos y falla menos."));
      }
    }

    var hasWorkdir = ls.some(function (l) { return /^workdir\s+\//i.test(l.trim()); });
    out.push(hasWorkdir
      ? finding("good", "OK", "WORKDIR absoluto", "Crea el directorio y fija el contexto. Mejor que RUN cd.")
      : finding("warn", "OJO", "Sin WORKDIR absoluto", "Usá WORKDIR /ruta/absoluta en vez de moverte con RUN cd."));

    var usesAdd = ls.some(function (l) { return /^add\s+/i.test(l.trim()); });
    var usesCopy = ls.some(function (l) { return /^copy\s+/i.test(l.trim()); });
    if (usesAdd) out.push(finding("warn", "OJO", "ADD detectado", "En el 99% de los casos COPY alcanza. ADD solo si necesitás su magia (descomprimir un .tar)."));
    if (usesCopy) out.push(finding("good", "OK", "COPY presente", "Transparente: copia lo local al contenedor, nada más."));
    if (!usesCopy && !usesAdd) out.push(finding("bad", "FALLA", "Nada se copia", "El código nunca entra a la imagen. Falta COPY."));

    var runs = ls.filter(function (l) { return /^run\s+/i.test(l.trim()); });
    var aptSplit = runs.some(function (l) { return /apt-get\s+update/i.test(l); }) &&
      !runs.some(function (l) { return /apt-get\s+update.*&&.*apt-get\s+install/i.test(l); });
    if (aptSplit) {
      out.push(finding("bad", "FALLA", "update e install separados", "La caché puede guardar un update viejo y fallar el install. Unilos en un solo RUN con &&."));
    }
    var noClean = runs.some(function (l) { return /apt-get\s+install/i.test(l); }) &&
      !runs.some(function (l) { return /rm\s+-rf\s+\/var\/lib\/apt\/lists/i.test(l); });
    if (noClean) {
      out.push(finding("warn", "OJO", "Sin limpieza de caché apt", "Agregá rm -rf /var/lib/apt/lists/* en la misma capa o arrastrás basura."));
    }
    if (runs.length > 4) {
      out.push(finding("warn", "OJO", "Muchos RUN (" + runs.length + ")", "Cada RUN es una capa. Agrupá comandos lógicos con && y \\."));
    }

    var hasUser = ls.some(function (l) { return /^user\s+\S+/i.test(l.trim()) && !/^user\s+root/i.test(l.trim()); });
    out.push(hasUser
      ? finding("good", "OK", "USER no-root", "Menor privilegio: si el servicio no necesita root, no lo uses.")
      : finding("warn", "OJO", "Todo corre como root", "La T1 no lo prohíbe, pero un USER dedicado es la práctica esperada."));

    var hasExpose = ls.some(function (l) { return /^expose\s+\d+/i.test(l.trim()); });
    out.push(hasExpose
      ? finding("good", "OK", "EXPOSE declara el puerto", "Documenta en qué puerto escucha la app. No lo publica solo, pero orienta.")
      : finding("warn", "OJO", "Sin EXPOSE", "La T1 pide declarar el puerto. Agregalo aunque no publique nada."));

    var execForm = ls.some(function (l) { return /^(cmd|entrypoint)\s*\[/i.test(l.trim()); });
    var shellForm = ls.some(function (l) { return /^(cmd|entrypoint)\s+[^[]/i.test(l.trim()); });
    if (execForm) out.push(finding("good", "OK", "CMD/ENTRYPOINT en forma exec", "El contenedor recibe SIGTERM y apaga limpio."));
    else if (shellForm) out.push(finding("warn", "OJO", "Forma shell", "Pasalo a JSON ([\"ejecutable\",\"param\"]) para que las señales del SO lleguen al proceso."));

    if (/password|passwd|secret|token\s*=\s*["']?[^"'\s]{3,}|BEGIN (RSA )?PRIVATE KEY/i.test(text)) {
      out.push(finding("bad", "FALLA", "Posible secreto en la imagen", "Ninguna contraseña va en el Dockerfile ni en archivos copiados. Eso es 0 en configuración según la rúbrica."));
    }
    if (/\.env(\s|$)/i.test(text) && /copy/i.test(text)) {
      out.push(finding("warn", "OJO", "Ojo con copiar .env", "El .env real queda fuera por .gitignore. Solo .env.example se versiona."));
    }
    return out;
  }

  /* ---------------- docker-compose.yml ---------------- */
  function checkCompose(src) {
    var out = [];
    var text = String(src || "");
    if (!text.trim()) {
      return [finding("warn", "OJO", "Archivo vacío", "Definí al menos los tres servicios: app, db y keycloak.")];
    }
    function has(re) { return re.test(text); }

    ["app|api|web|servicio", "postgres|db|database", "keycloak"].forEach(function (name, i) {
      var label = ["aplicación", "PostgreSQL", "Keycloak"][i];
      out.push(has(new RegExp("^\\s{2}" + name.split("|").join("|") + "\\s*:", "mi")) || has(new RegExp(name, "i"))
        ? finding("good", "OK", "Servicio " + label + " presente", "Los tres servicios levantan con un solo comando.")
        : finding("bad", "FALLA", "Falta " + label, "La T1 exige app + postgres oficial + keycloak oficial."));
    });

    var localHit = lines(text).some(function (l) {
      if (!/localhost|127\.0\.0\.1/i.test(l)) return false;
      if (/test\s*:|curl/i.test(l)) return false; /* healthcheck interno: ahí localhost sí es correcto */
      return true;
    });
    if (localHit) {
      out.push(finding("bad", "FALLA", "localhost dentro del Compose", "Dentro de la red de Docker, localhost es el propio contenedor. Usá el nombre del servicio (ej. postgres-db, keycloak)."));
    } else {
      out.push(finding("good", "OK", "Sin localhost cableado", "Los servicios se resuelven por nombre en la red de Compose."));
    }
    if (/\b\d{1,3}(\.\d{1,3}){3}\b/.test(text)) {
      out.push(finding("warn", "OJO", "IP fija detectada", "La T1 prohíbe IP fija: usá nombres de servicio."));
    }

    if (/depends_on/i.test(text)) {
      if (/condition\s*:\s*service_healthy/i.test(text)) {
        out.push(finding("good", "OK", "depends_on con service_healthy", "La app espera a que la dependencia esté sana, no solo corriendo."));
      } else {
        out.push(finding("warn", "OJO", "depends_on sin condición", "Sin condition: service_healthy solo espera a que el contenedor corra. Sumá healthcheck o reintentos en la app."));
      }
    } else {
      out.push(finding("warn", "OJO", "Sin depends_on", "Explicá cómo la app sobrevive a que la base aún no esté lista (reintentos con espera)."));
    }

    if (/healthcheck\s*:/i.test(text)) {
      out.push(finding("good", "OK", "healthcheck declarado", "Cada servicio dice qué significa estar sano."));
    } else {
      out.push(finding("bad", "FALLA", "Sin healthcheck", "La rúbrica lo exige: sin healthcheck la app puede arrancar antes que la base."));
    }

    if (/volumes\s*:/i.test(text)) {
      out.push(finding("good", "OK", "Volumen declarado", "Los datos de Postgres viven fuera del ciclo del contenedor."));
    } else {
      out.push(finding("bad", "FALLA", "Sin volumen", "Sin volumen los datos mueren con el contenedor. La prueba down/up la reprobaría."));
    }

    if (/POSTGRES_PASSWORD\s*:\s*["']?\$\{/i.test(text) || /env_file/i.test(text)) {
      out.push(finding("good", "OK", "Secretos por entorno", "Credenciales inyectadas, no cableadas."));
    } else if (/POSTGRES_PASSWORD\s*:\s*["']?[A-Za-z0-9]+/i.test(text)) {
      out.push(finding("warn", "OJO", "Contraseña literal en el YAML", "Pasala a variable (${VAR}) con .env.example versionado y .env ignorado."));
    }
    return out;
  }

  /* ---------------- JWT / auth ---------------- */
  function b64urlDecode(s) {
    s = String(s || "").replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s);
    try {
      return decodeURIComponent(Array.prototype.map.call(bin, function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(""));
    } catch (e) { return bin; }
  }

  function decodeJwt(token) {
    var parts = String(token || "").trim().split(".");
    if (parts.length !== 3) return { error: "Un JWT tiene 3 partes separadas por puntos: header.payload.firma." };
    try {
      return {
        header: JSON.parse(b64urlDecode(parts[0])),
        payload: JSON.parse(b64urlDecode(parts[1])),
        sig: parts[2].slice(0, 12) + "…"
      };
    } catch (e) {
      return { error: "No pude decodificarlo: revisá que sea Base64Url válido." };
    }
  }

  function checkJwtClaims(payload, expected) {
    var out = [];
    expected = expected || {};
    if (expected.iss) {
      out.push(payload.iss === expected.iss
        ? finding("good", "OK", "iss coincide", "El emisor es exactamente el esperado.")
        : finding("bad", "FALLA", "iss no coincide", "Debe ser idéntico, sin barras de más ni localhost cambiado por nombre de servicio."));
    }
    if (expected.aud) {
      var aud = payload.aud;
      var ok = aud === expected.aud || (Array.isArray(aud) && aud.indexOf(expected.aud) !== -1);
      out.push(ok
        ? finding("good", "OK", "aud válido", "El token es para esta API, no para otra app.")
        : finding("bad", "FALLA", "aud inválido", "Token emitido para otro cliente: rechazar con 401."));
    }
    if (typeof payload.exp === "number") {
      var now = Math.floor(Date.now() / 1000);
      out.push(payload.exp > now
        ? finding("good", "OK", "Token vigente", "exp está en el futuro.")
        : finding("bad", "FALLA", "Token vencido", "exp ya pasó: rechazar aunque la firma sea válida."));
    } else {
      out.push(finding("warn", "OJO", "Sin exp", "Todo token necesita expiración; sin ella la ventana de robo es infinita."));
    }
    return out;
  }

  /* ---------------- Kustomize ---------------- */
  function checkOverlay(base, overlay) {
    var out = [];
    var b = String(base || ""), o = String(overlay || "");
    if (!/\.\.\/\.\.\/base|\.\.\/base/.test(o) && !/resources\s*:\s*\n?\s*-\s*\.\./.test(o)) {
      out.push(finding("warn", "OJO", "El overlay no referencia la base", "Un overlay importa la base (resources: - ../../base) y la modifica, no la copia."));
    } else {
      out.push(finding("good", "OK", "Overlay referencia la base", "Bien: la base sigue siendo la fuente de verdad."));
    }
    if (/replicas\s*:|images\s*:|configMapGenerator|secretGenerator|patches/i.test(o)) {
      out.push(finding("good", "OK", "Modificación real", "Réplicas, imagen, config o patch: la rúbrica pide algo real, no un overlay vacío."));
    } else {
      out.push(finding("bad", "FALLA", "Overlay sin cambios", "Sin replicas/images/patches el overlay no modifica nada real."));
    }
    if (b && o && /kind:\s*Deployment[\s\S]*name:\s*(\S+)/.test(b)) {
      var m = /kind:\s*Deployment[\s\S]*?name:\s*(\S+)/.exec(b);
      if (m && o.indexOf(m[1]) === -1 && /patches/i.test(o)) {
        out.push(finding("warn", "OJO", "El patch no nombra el Deployment", "El patch debe apuntar al metadata.name de la base (" + m[1] + ")."));
      }
    }
    if (/kind:\s*Deployment[\s\S]*replicas:\s*\d+[\s\S]*kind:\s*Deployment/.test(o)) {
      out.push(finding("bad", "FALLA", "Manifiesto duplicado en el overlay", "Si el Deployment entero vive en el overlay, la base y el overlay divergen. Usá patches."));
    }
    return out;
  }

  window.DOCKCHECK = {
    checkDockerfile: checkDockerfile,
    checkCompose: checkCompose,
    decodeJwt: decodeJwt,
    checkJwtClaims: checkJwtClaims,
    checkOverlay: checkOverlay
  };
})();
