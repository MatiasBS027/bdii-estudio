/* Glosario + cheatsheet de Contenerización. */
(function () {
  "use strict";

  window.DOCKGLOSSARY = [
    { t: "Image / Imagen", d: "Receta inmutable (capas). No es el proceso en ejecución.", x: "Misma imagen → muchos contenedores." },
    { t: "Container / Contenedor", d: "Proceso aislado que corre una imagen. Efímero por diseño.", x: "down lo mata; el volumen puede sobrevivir." },
    { t: "Dockerfile", d: "Instrucciones para construir una imagen reproducible.", x: "FROM con versión fija; nunca latest en prod." },
    { t: "Multi-stage build", d: "Varios FROM: compilás en una etapa y copiás solo el artefacto a la final.", x: "COPY --from=builder /out /app" },
    { t: "Layer cache", d: "Docker reusa capas si las instrucciones no cambiaron.", x: "Copiá requirements antes que el código." },
    { t: ".dockerignore", d: "Excluye del contexto de build (como .gitignore).", x: "Evita mandar .git y secretos al daemon." },
    { t: "CMD vs ENTRYPOINT", d: "ENTRYPOINT = binario principal; CMD = args por defecto. Preferí forma exec.", x: "CMD [\"python\",\"app.py\"]" },
    { t: "Compose service", d: "Unidad de cómputo en el YAML; DNS interno por nombre de servicio.", x: "DB_HOST=postgres, no localhost." },
    { t: "Compose network", d: "Red puente del proyecto; servicios se descubren por nombre.", x: "<proyecto>_default" },
    { t: "Volume", d: "Almacenamiento gestionado por Docker; sobrevive a down (sin -v).", x: "Datos de Postgres." },
    { t: "Bind mount", d: "Monta una carpeta del host en el contenedor.", x: "Dev de código; no para datos de prod." },
    { t: "tmpfs", d: "Montaje en RAM: rápido y no persistente.", x: "Cachés temporales." },
    { t: "depends_on", d: "Orden de creación. Sin condition no espera readiness.", x: "condition: service_healthy" },
    { t: "Healthcheck", d: "Prueba de que el proceso acepta trabajo (no solo que PID exista).", x: "pg_isready, curl /health" },
    { t: "Secret", d: "Dato sensible inyectado en runtime; nunca en la imagen ni en git.", x: ".env local + .env.example en repo." },
    { t: "Keycloak / realm", d: "IdP: realm aísla usuarios/clients; emite JWT firmados.", x: "Validá firma con JWKS." },
    { t: "JWT", d: "Token firmado (header.payload.signature) con claims.", x: "exp, iss, aud, roles." },
    { t: "Deployment (K8s)", d: "ReplicaSet gestionado: pods deseados + rolling update.", x: "selector debe matchear labels del template." },
    { t: "Service (K8s)", d: "IP/DNS estable delante de pods cambiantes.", x: "ClusterIP interno; NodePort/LB externo." },
    { t: "PVC / PV", d: "Claim de almacenamiento vs volumen real del clúster.", x: "Postgres necesita PVC." },
    { t: "ConfigMap / Secret (K8s)", d: "Config no sensible vs sensible montada o en env.", x: "No pongas passwords en ConfigMap." },
    { t: "Probe (liveness/readiness)", d: "liveness reinicia; readiness saca del Service si no está listo.", x: "No uses la misma sonda para ambos sin pensar." },
    { t: "Kustomize", d: "Base + overlays sin plantillas: patches declarativos por entorno.", x: "dev/staging/prod overlays." },
    { t: "kind", d: "Kubernetes en Docker local para practicar manifiestos.", x: "No es prod; sirve para aprender." },
    { t: "Sidecar", d: "Contenedor auxiliar en el mismo pod (logs, proxy, sync).", x: "Comparte network namespace del pod." }
  ];

  window.DOCKCHEAT = [
    {
      title: "Dockerfile",
      lines: [
        "FROM imagen:versión (nunca latest)",
        "WORKDIR absoluto · USER no-root",
        "COPY reqs → RUN install → COPY código (caché)",
        "CMD/ENTRYPOINT en forma exec JSON",
        "Sin secretos en ENV/imagen · EXPOSE documenta"
      ]
    },
    {
      title: "Compose",
      lines: [
        "3+ services: app, db, idp (según enunciado)",
        "DNS por nombre de servicio (no localhost/IP)",
        "volumes: para datos; down -v los borra",
        "depends_on + healthcheck o reintentos en app",
        "Secretos vía env/.env; repo solo con .env.example"
      ]
    },
    {
      title: "Persistencia",
      lines: [
        "Contenedor efímero ≠ datos efímeros",
        "volume: datos gestionados · bind: código en host",
        "tmpfs: solo RAM",
        "down conserva volúmenes · down -v no"
      ]
    },
    {
      title: "Arranque",
      lines: [
        "depends_on sin condition ≠ listo",
        "healthcheck = aceptación real",
        "Estrategia: healthy +/o retries en app",
        "Justificá el orden; no asumas magia"
      ]
    },
    {
      title: "Auth (Keycloak/JWT)",
      lines: [
        "Realm · client · roles",
        "Validá firma (JWKS), iss, aud, exp",
        "No confíes en claims sin verificar firma",
        "Keycloak también es un servicio Compose/K8s"
      ]
    },
    {
      title: "Kubernetes + Kustomize",
      lines: [
        "Deployment + Service + PVC/Secret/ConfigMap",
        "labels selector ≡ template labels",
        "readiness ≠ liveness",
        "base/ + overlays/ con patches",
        "Compose → K8s: servicios ≈ Deployments+Services"
      ]
    }
  ];
})();
