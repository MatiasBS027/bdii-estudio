/* Contenido de estudio: 7 temas. Tono: profesor de taller, directo, sin humo. */
(function () {
  "use strict";

  window.DOCKTOPICS = [
    {
      id: "dockerfile", num: "01", lab: "dockerfile",
      title: "La imagen no es el contenedor",
      sub: "Dockerfile: capas, base oficial y nada de secretos",
      lede: "La imagen es la receta congelada; el contenedor es una ejecución descartable de esa receta. Este tema cubre el material completo: compilación por etapas, elección de base, cada instrucción del Dockerfile y las prácticas que mantienen la imagen chica, reproducible y sin secretos.",
      body: `
        <div class="sheet"><p class="kicker">Para qué sirve</p>
        <p>Un Dockerfile describe <strong>cómo construir una imagen reproducible</strong>: misma receta, misma imagen, en tu máquina y en la del evaluador. La evaluación lo califica con lupa porque ahí se juega la reproducibilidad: base oficial, dependencias mínimas, puerto declarado, arranque definido y cero secretos.</p></div>

        <h2>1. Compilación por etapas (multi-stage)</h2>
        <p>Con varios <code>FROM</code> en el mismo Dockerfile, cada uno inicia una etapa nueva con su propia base. Copiás solo el artefacto de una etapa a otra (<code>COPY --from=0</code>) y dejás atrás lo que no ocupés. Solo necesitás ese Dockerfile: <code>docker build</code> y listo.</p>
        <p>El resultado es una imagen pequeña que contiene solo el binario. Ninguna herramienta de compilación (SDK de Go, etc.) queda en la imagen final. Por defecto las etapas se numeran desde 0, pero podés nombrarlas con <code>AS &lt;nombre&gt;</code> en el <code>FROM</code>.</p>
        <div class="trade"><div class="g"><b>Ganas</b>Imagen final mínima y builds más eficientes (etapas en paralelo).</div><div class="p"><b>Pagas</b>Un Dockerfile más largo que hay que saber leer por etapas.</div></div>

        <h2>2. Etapas reutilizables</h2>
        <p>Si tenés muchas etapas con componentes en común, creá una <strong>etapa base compartida</strong> e heredá de ella. Docker compila la etapa común una sola vez: las imágenes derivadas usan la memoria del host de forma más eficiente, rápida y mantenible.</p>

        <h2>3. La imagen base correcta</h2>
        <p>Elegí imagen de <strong>fuente confiable y pequeña</strong>. Buena práctica: un tipo de imagen para compilación y tests, otra para producción. Fuentes: insignias <em>official</em>, <em>verified publisher</em> y <em>open source</em> de Docker Hub.</p>
        <div class="callout warn"><p class="lbl">Error común</p><p><code>FROM python:latest</code>. latest hoy y latest en la demo pueden ser imágenes distintas. Fijá versión (<code>python:3.12-slim</code>) para que la construcción sea determinista.</p></div>

        <h2>4. Recompilar seguido, --pull y --no-cache</h2>
        <p>Las imágenes son <strong>inmutables</strong>: recompilar es tomar una foto con todo lo de ese momento. Para mantenerlas al día y seguras, recompilá regularmente con dependencias actualizadas.</p>
        <pre class="ref-block">docker build --pull -t mi-imagen:mi-tag .      # trae las bases más recientes
docker build --no-cache -t mi-imagen:mi-tag .   # reejecuta todas las capas desde cero
docker build --pull --no-cache -t mi-imagen:mi-tag .  # ambas: imagen fresca + build limpio</pre>

        <h2>5. Excluir con .dockerignore</h2>
        <p>Funciona como un <code>.gitignore</code>: excluye lo que el build no necesita (historial de Git, dependencias del entorno de desarrollo, artefactos). Menos contexto, builds más rápidos y menos secretos accidentales.</p>

        <h2>6. Instrucción por instrucción</h2>
        <p><strong>FROM.</strong> Imágenes oficiales siempre que se pueda. Etiqueta específica, nunca <code>latest</code>. Variantes mínimas (<code>alpine</code>, <code>slim</code>) si la app no necesita el SO completo: menos tamaño y menos superficie de ataque.</p>
        <p><strong>RUN.</strong> Cada <code>RUN</code> es una capa: agrupá comandos lógicos con <code>&amp;&amp;</code> y <code>\\</code>. Con <code>apt</code>, combiná <code>update</code> e <code>install</code> en el mismo <code>RUN</code> (un update cacheado por separado puede fallar al instalar). Limpiá la caché en la misma capa (<code>rm -rf /var/lib/apt/lists/*</code>).</p>
        <p><strong>COPY vs ADD.</strong> En el 99% usá <code>COPY</code>: transparente, solo copia. <code>ADD</code> solo por sus extras, como extraer un <code>.tar</code> automáticamente.</p>
        <p><strong>CMD vs ENTRYPOINT.</strong> <code>ENTRYPOINT</code> es el proceso central (el contenedor como binario); <code>CMD</code> da los argumentos por defecto. Ambos en <strong>forma exec</strong> (<code>CMD ["ejecutable","param1"]</code>): así el contenedor recibe SIGTERM y apaga limpio.</p>
        <p><strong>WORKDIR.</strong> Siempre ruta absoluta (<code>WORKDIR /app</code>), nunca <code>RUN cd</code>. Crea el directorio y fija el contexto de todo lo que sigue.</p>
        <p><strong>USER.</strong> Menor privilegio: creá usuario y grupo dedicados y cambiá con <code>USER</code>. Nunca root salvo necesidad estricta.</p>
        <p><strong>ENV.</strong> Variables persistentes para runtime (ej. <code>ENV PATH=/usr/local/nginx/bin:$PATH</code>). Ojo: lo que va en <code>ENV</code> queda en la imagen; secretos, jamás.</p>
        <p><strong>EXPOSE.</strong> Documentación: dice en qué puerto escucha la app. No publica nada al host por sí solo.</p>
        <p><strong>VOLUME.</strong> Expone lo que debe persistir fuera del ciclo del contenedor: datos, almacenamiento, configuración.</p>`,
      quiz: [
        { q: "¿Por qué conviene copiar requirements.txt e instalar antes de copiar el código?", opts: ["Porque Docker lo exige en ese orden", "Para que la capa de dependencias se cachee y los rebuilds sean rápidos", "Para que la imagen pese más", "Para evitar usar WORKDIR"], a: 1, why: "Las dependencias cambian poco; el código cambia siempre. Caché primero, código después." },
        { q: "¿Qué hace COPY --from=0 en un build multi-stage?", opts: ["Copia desde tu máquina al contenedor", "Trae solo el artefacto de la etapa 0 a la imagen final, sin las herramientas de compilación", "Crea un volumen", "Hace backup de la etapa anterior"], a: 1, why: "Separa compilar de correr: la imagen final trae el binario, no el SDK." },
        { q: "¿Cuándo usarías ADD en vez de COPY?", opts: ["Siempre, hace lo mismo pero mejor", "Solo por sus extras, como extraer un .tar automáticamente", "Cuando el archivo es muy grande", "Cuando copiás desde otra etapa"], a: 1, why: "COPY es transparente y predecible. ADD solo se justifica por sus comportamientos especiales." },
        { q: "¿Qué garantiza docker build --pull?", opts: ["Que no se usa la caché", "Que las imágenes base se descargan frescas en vez de reusar una parecida pero vieja", "Que la imagen pesa menos", "Que se excluye el .dockerignore"], a: 1, why: "--pull actualiza la base; --no-cache reejecuta las capas. Juntos dan el build más limpio." }
      ]
    },
    {
      id: "compose", num: "02", lab: "compose",
      title: "Tres servicios, una red",
      sub: "Compose: app + Postgres + Keycloak hablándose por nombre",
      lede: "Compose levanta el sistema entero con un comando a partir de un YAML. Este tema cubre el material completo: el modelo (services, networks, volumes, configs, secrets, project), el CLI, el ejemplo webapp+database y todo el networking.",
      body: `
        <div class="sheet"><p class="kicker">Para qué sirve</p>
        <p>Compose usa un archivo YAML para configurar los servicios y el <strong>Compose CLI</strong> para crearlos e iniciarlos. Es el contrato de “un solo comando” de la evaluación. El archivo por defecto vive en el directorio de trabajo como <code>compose.yaml</code> o <code>compose.yml</code>.</p></div>

        <h2>1. El modelo: seis piezas</h2>
        <table class="doc"><tr><th>Pieza</th><th>Qué es</th></tr>
        <tr><td><strong>services</strong></td><td>Los componentes de cómputo: conceptos abstractos que se implementan corriendo la misma imagen y configuración una o más veces.</td></tr>
        <tr><td><strong>networks</strong></td><td>Ruta IP entre contenedores conectados. Abstracción de la capacidad de la plataforma para comunicar servicios.</td></tr>
        <tr><td><strong>volumes</strong></td><td>Datos persistentes como montaje de alto nivel con opciones globales.</td></tr>
        <tr><td><strong>configs</strong></td><td>Configuración de runtime/dependiente de plataforma. Dentro del contenedor se comportan como volúmenes, pero se definen distinto.</td></tr>
        <tr><td><strong>secrets</strong></td><td>Configuración sensible: se expone como archivos montados, con tratamiento de plataforma específico para no exponerla.</td></tr>
        <tr><td><strong>project</strong></td><td>Una instalación concreta de la especificación. Su nombre aísla recursos (prefijo + etiqueta <code>com.docker.compose.project</code>) y permite desplegar el mismo archivo dos veces con distinto nombre.</td></tr></table>

        <h2>2. Mantener el YAML manejable</h2>
        <p><strong>Fragments y extensiones</strong> evitan repetir bloques. <strong>Múltiples archivos</strong> se combinan agregando o sobrescribiendo según el orden dado. E <strong>include</strong> permite reusar otros archivos Compose o factorizar partes del modelo.</p>

        <h2>3. CLI: el ciclo de vida</h2>
        <pre class="ref-block">docker compose up      # inicia todos los servicios del .yml
docker compose down    # detiene todo
docker compose logs    # salida de los contenedores (debug)
docker compose ps      # servicios y su estado</pre>
        <p>Incluido por defecto en Docker Desktop. Referencia completa: docs de Docker, CLI de Compose.</p>

        <h2>4. Ejemplo ilustrativo: webapp + database</h2>
        <p>Frontend (web) + backend (servicio). El frontend recibe en runtime un archivo de configuración HTTP (dominio) y un certificado HTTPS. El backend guarda en un volumen persistente. Hablan por una <strong>red inferior aislada</strong>; el frontend además está en una red superior y expone el 443.</p>
        <p>Piezas: dos servicios (<code>webapp</code>, <code>database</code>), un secret (certificado), una config (HTTP), un volumen y dos networks. <code>docker compose up</code> crea networks y volúmenes e inyecta config y secret en el frontend.</p>

        <h2>5. Networking: la red default</h2>
        <p>Por defecto Compose crea <strong>una sola red puente</strong> (<code>&lt;proyecto&gt;_default</code>). Cada contenedor se une con su <strong>nombre de servicio</strong> y cada servicio se registra en un DNS interno: los contenedores se alcanzan por nombre y resuelven la IP solos.</p>
        <p>Al recrear un servicio (<code>up</code> tras un cambio), el contenedor nuevo entra con <strong>IP distinta pero mismo nombre</strong>: los demás lo redescubren solos. Las conexiones abiertas al viejo se cierran.</p>
        <p><code>HOST_PORT</code> vs <code>CONTAINER_PORT</code> tienen propósitos distintos (ej. host 8001 → contenedor 5432). Sin <code>network_mode</code>, todo servicio usa el puente del proyecto: es el modo más seguro.</p>
        <div class="callout bad"><p class="lbl">Error común</p><p><code>DB_HOST=localhost</code> dentro del Compose. localhost es el propio contenedor: usá el nombre del servicio. Misma trampa con IPs fijas: la evaluación las prohíbe.</p></div>

        <h2>6. network_mode y redes propias</h2>
        <table class="doc"><tr><th>Modo</th><th>Efecto</th></tr>
        <tr><td><strong>host</strong></td><td>Comparte la pila de red del host. Sin mapeo de puertos ni DNS por nombre. Solo para herramientas de sistema (monitores). Puede ver todo el tráfico: úsese con pinzas.</td></tr>
        <tr><td><strong>none</strong></td><td>Apaga toda la red del contenedor.</td></tr>
        <tr><td><strong>service:{nombre}</strong></td><td>Comparte la red de otro servicio.</td></tr>
        <tr><td><strong>container:{id}</strong></td><td>Comparte la red de un contenedor por ID.</td></tr></table>
        <p>Se pueden mezclar modos en un proyecto. Y con la llave de alto nivel <code>networks</code> definís topologías propias (drivers, opciones, redes externas): cada servicio lista a cuáles se conecta. Ejemplo del material: <code>proxy</code> aislado de <code>db</code> (sin red común); solo <code>app</code> habla con ambos. También podés fijar <code>ipv4/ipv6</code> estáticas y darles nombre personalizado.</p>`,
      quiz: [
        { q: "La app corre en un contenedor y Postgres en otro. ¿Qué valor lleva DB_HOST?", opts: ["localhost", "127.0.0.1", "El nombre del servicio de la base en el Compose", "La IP que viste con docker inspect ayer"], a: 2, why: "Compose da DNS por nombre de servicio. IP fija se pudre; localhost apunta al propio contenedor." },
        { q: "¿Dónde va la contraseña real de Postgres?", opts: ["En el Dockerfile con ENV", "En el código, como constante", "En .env (ignorado) inyectada como variable; en el repo solo .env.example", "En el nombre de la imagen"], a: 2, why: "Secretos por entorno, nunca en la imagen ni en el repo. La rúbrica lo castiga directo." },
        { q: "Recreás el contenedor db con up y obtiene otra IP. ¿Se rompe la app?", opts: ["Sí, hay que actualizar la IP en la app", "No: la app resuelve por nombre de servicio vía DNS interno", "Solo si usás network_mode: host", "Solo si borrás los volúmenes"], a: 1, why: "El nombre es estable aunque la IP cambie. Por eso la evaluación exige nombres, no IPs." },
        { q: "¿Para qué sirve network_mode: host y cuál es su riesgo?", opts: ["Aislar el contenedor; ningún riesgo", "Dar acceso directo a la red del host (monitoreo); el contenedor ve todo el tráfico y pierde DNS por nombre", "Acelerar los builds", "Persistir datos"], a: 1, why: "Útil para herramientas de sistema, peligroso por defecto. El puente del proyecto es el modo seguro." }
      ]
    },
    {
      id: "volumenes", num: "03", lab: "persist",
      title: "Lo que sobrevive al down",
      sub: "Volúmenes: persistencia fuera del ciclo del contenedor",
      lede: "El contenedor es efímero por diseño. Este tema cubre el material completo: qué son los volúmenes, cuándo convienen (y cuándo no), su ciclo de vida, montajes sobre datos existentes, sintaxis --mount/--volume, gestión por CLI y uso en Compose.",
      body: `
        <div class="sheet"><p class="kicker">Para qué sirve</p>
        <p>Un <strong>volumen</strong> es almacenamiento persistente creado y manejado por Docker (<code>docker volume create</code> o creado al usarlo). Vive en un directorio del host Docker que se monta en el contenedor. Parecido al bind mount, pero <strong>gestionado por Docker y aislado del host</strong>.</p></div>

        <h2>1. Cuándo sí y cuándo no</h2>
        <p><strong>Convienen</strong> cuando: son más fáciles de respaldar/migrar que los binds; se manejan con CLI o API; funcionan en Linux y Windows; se comparten entre contenedores con más seguridad; se prellenan desde un contenedor o build; la app pide I/O de alto rendimiento.</p>
        <p><strong>No convienen</strong> si necesitás tocar los archivos desde el host: son 100% de Docker. Ahí, bind mount. Y son mejores que escribir en la capa del contenedor (no inflan la imagen y evitan el driver de almacenamiento, más lento).</p>
        <p>Datos no persistentes: <strong>tmpfs</strong> (RAM, nada a disco, máximo rendimiento). Propagación <code>rprivate</code>, no configurable.</p>
        <div class="trade"><div class="g"><b>Ganas</b>Persistencia portable y rápida fuera del ciclo del contenedor.</div><div class="p"><b>Pagas</b>Los datos dejan de estar en archivos visibles de tu carpeta.</div></div>

        <h2>2. Ciclo de vida</h2>
        <p>El contenido del volumen <strong>sobrevive a los contenedores</strong>. Un volumen se monta en varios contenedores a la vez; sin uso sigue existiendo y <strong>no se borra solo</strong> (<code>docker volume prune</code> para limpiarlo). Clave de la evaluación: <code>down</code> conserva volúmenes, <code>down -v</code> los destruye.</p>

        <h2>3. Montar sobre datos existentes</h2>
        <p>Montar un volumen <strong>no vacío</strong> sobre un directorio con archivos los <strong>oculta</strong> (sin forma de revelar los originales: recreá sin el montaje). Montar uno <strong>vacío</strong> prellena el volumen con el contenido del directorio: buena forma de pasar datos a otro contenedor. Para evitar el prellenado: <code>volume-nocopy</code>.</p>

        <h2>4. Sintaxis: --mount vs --volume</h2>
        <p>Con <code>docker run</code> podés usar ambas; <strong>--mount es mejor</strong>: más explícita y con todas las opciones. Usala para drivers de volumen, subdirectorios o servicios Swarm.</p>

        <h2>5. Crear y manejar</h2>
        <pre class="ref-block">docker volume create mi-datos   # crear
docker volume ls                # listar
docker volume inspect mi-datos  # inspeccionar
docker volume rm mi-datos       # quitar
docker volume prune             # limpiar los sin uso</pre>
        <p>A diferencia del bind, el volumen existe fuera de cualquier contenedor.</p>

        <h2>6. Volúmenes en Compose</h2>
        <p>El primer <code>up</code> crea el volumen; los siguientes lo <strong>reusan</strong>. También podés crearlo fuera (<code>docker volume create</code>) y referenciarlo en el YAML.</p>
        <div class="callout warn"><p class="lbl">Error común</p><p>Correr <code>down -v</code> antes de la demo y perder los datos de prueba. Y montar sobre datos existentes sin esperar el ocultamiento.</p></div>`,
      quiz: [
        { q: "¿Por qué los datos no van dentro del contenedor?", opts: ["Porque no hay espacio", "Porque el contenedor es efímero: al recrearlo, lo no montado en volumen se pierde", "Porque Postgres no lo permite", "Porque es más lento siempre"], a: 1, why: "El ciclo del contenedor es descartable; el volumen es el que persiste. Esa es la prueba down/up de la evaluación." },
        { q: "¿Cuándo elegirías bind mount en vez de volumen?", opts: ["Para datos que deben sobrevivir reinicios", "Cuando necesitás acceder a los archivos desde el host (desarrollo)", "Para I/O de alto rendimiento", "Para compartir entre contenedores con seguridad"], a: 1, why: "Bind = tu carpeta real visible. Volumen = gestionado por Docker, invisible desde el host." },
        { q: "Montás un volumen con datos sobre /app (que ya trae archivos). ¿Qué ves?", opts: ["La mezcla de ambos", "Solo el contenido del volumen: los originales quedan ocultos", "Error y el contenedor no arranca", "Se borra el volumen"], a: 1, why: "El montaje oculta lo previo sin remedio. Decisión de montaje = decisión de qué se ve." }
      ]
    },
    {
      id: "arranque", num: "04", lab: "arranque",
      title: "Corriendo no es lo mismo que listo",
      sub: "Healthchecks y arranque ordenado: /health vs /ready",
      lede: "Compose no espera a que un servicio esté listo, solo a que corra. Este tema cubre el material completo: depends_on y el orden de arranque/apagado, las tres conditions, restart, el healthcheck con sus formatos y su relación con el Dockerfile.",
      body: `
        <div class="sheet"><p class="kicker">Para qué sirve</p>
        <p>Con <code>depends_on</code> controlás el <strong>orden de inicio y apagado</strong> (junto a <code>links</code>, <code>volumes_from</code> y <code>network_mode:service:...</code>). El caso típico: la app necesita la base, pero puede nacer antes y morir buscando la sentencia SQL.</p></div>

        <h2>1. Correr no es estar listo</h2>
        <p>Al iniciar, Compose espera a que el contenedor <strong>corra</strong>, no a que esté <strong>listo</strong>. Una base relacional necesita arrancar sus propios servicios antes de aceptar conexiones. La solución es el atributo <code>condition</code>:</p>
        <table class="doc"><tr><th>Condition</th><th>Significado</th></tr>
        <tr><td><strong>service_started</strong></td><td>El contenedor corre (sin garantía de que responda).</td></tr>
        <tr><td><strong>service_healthy</strong></td><td>La dependencia está sana según su <code>healthcheck</code>. La app nace cuando la base realmente responde.</td></tr>
        <tr><td><strong>service_completed_successfully</strong></td><td>La dependencia corrió hasta terminar bien (tareas una-vez, migraciones).</td></tr></table>
        <p>Ejemplo del material: <code>db</code> y <code>redis</code> se crean antes que <code>web</code>; <code>web</code> espera a que <code>db</code> esté sana. El healthcheck de la db usa <code>pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}</code>, reintentando cada 10 segundos hasta 5 veces.</p>

        <h2>2. Orden también al apagar y reiniciar</h2>
        <p>Compose quita en orden inverso (<code>web</code> antes que <code>db</code> y <code>redis</code>). Y <code>restart: true</code> hace que si la base se reinicia (ej. <code>docker compose restart</code>), la web también se reinicie y restablezca conexiones.</p>

        <h2>3. El atributo healthcheck</h2>
        <p>Declara la comprobación de salud del servicio. Funciona igual que la instrucción <code>HEALTHCHECK</code> del Dockerfile y <strong>el Compose puede sobrescribirla</strong>. <code>interval</code>, <code>timeout</code>, <code>start_period</code> y <code>start_interval</code> son duraciones.</p>
        <p><code>test</code> puede ser cadena (equivale a <code>CMD-SHELL</code> + la cadena) o lista cuyo primer ítem es <code>NONE</code>, <code>CMD</code> o <code>CMD-SHELL</code>. <code>CMD-SHELL</code> ejecuta con el intérprete del contenedor. <code>NONE</code> deshabilita el healthcheck (útil para apagar el que trae la imagen).</p>
        <div class="callout good"><p class="lbl">Estrategia válida</p><p>La evaluación acepta depends_on con condición, reintentos con espera en la app, o ambos, siempre justificados. Lo que no acepta es nada.</p></div>`,
      quiz: [
        { q: "/health responde 200 pero /ready da 503. ¿Qué significa?", opts: ["Todo está bien", "El proceso vive pero la base no acepta consultas: la app no está lista", "Hay que borrar los volúmenes", "El token es inválido"], a: 1, why: "Liveness vs readiness: vivo no es listo. Esa distinción es la que sostiene el arranque ordenado." },
        { q: "¿Qué aporta condition: service_healthy frente a depends_on a secas?", opts: ["Nada, son lo mismo", "Esperar a que la dependencia pase su healthcheck, no solo a que el contenedor exista", "Reiniciar la app si falla", "Crear la red"], a: 1, why: "A secas solo ordena creación. Con condition, Compose espera salud real." },
        { q: "¿Para qué sirve test: NONE en un healthcheck?", opts: ["Para chequear red", "Para deshabilitar el healthcheck (ej. el que trae la imagen)", "Para hacerlo más estricto", "Para usar shell"], a: 1, why: "NONE apaga la comprobación. Útil cuando la imagen trae un HEALTHCHECK que no te sirve." }
      ]
    },
    {
      id: "auth", num: "05", lab: "auth",
      title: "No firmés tus propios tokens",
      sub: "Keycloak, JWT y la diferencia entre 401 y 403",
      lede: "Keycloak centraliza quién puede entrar a qué. Este tema cubre el material completo: qué es y cómo opera, correrlo en contenedor (build optimizado, puertos, dev, realms), su modelo (realms, clients, roles, JWT), validación en backend con código real y todo el troubleshooting.",
      body: `
        <div class="sheet"><p class="kicker">Para qué sirve</p>
        <p><strong>Keycloak</strong> es una plataforma IAM (gestión de identidad y acceso): centraliza autenticación, autorización y usuarios para que tus apps <strong>deleguen</strong> en vez de implementar login a mano. Es la capa transversal entre usuarios, apps y servicios.</p>
        <p>Estratégicamente: un solo punto para usuarios/roles/permisos, más seguridad sin más código, menos costo de desarrollo y escala cuando crecen usuarios, apps e integraciones. Cuando alguien pide una app protegida, esta delega en Keycloak, que valida y devuelve el contexto de seguridad. La app nunca toca contraseñas.</p></div>

        <h2>1. Correr Keycloak en contenedor</h2>
        <p>La imagen default viene lista para configurar. El truco de rendimiento: correr el paso <code>build</code> durante la construcción (<code>kc.sh build</code>) para una imagen optimizada; ahorra tiempo en cada arranque. <code>Containerfile</code> ≡ <code>Dockerfile</code> (nombre agnóstico; en Docker se usa con <code>docker build -f Containerfile</code>).</p>
        <pre class="ref-block">FROM quay.io/keycloak/keycloak:latest AS builder
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true
ENV KC_DB=postgres
WORKDIR /opt/keycloak
RUN keytool -genkeypair -storepass password -storetype PKCS12 \\
  -keyalg RSA -keysize 2048 -dname "CN=server" -alias server \\
  -ext "SAN:c=DNS:localhost,IP:127.0.0.1" -keystore conf/server.keystore
RUN /opt/keycloak/bin/kc.sh build
FROM quay.io/keycloak/keycloak:latest
COPY --from=builder /opt/keycloak/ /opt/keycloak/
ENV KC_DB=postgres
ENV KC_DB_URL=&lt;DBURL&gt;
ENV KC_DB_USERNAME=&lt;DBUSERNAME&gt;
ENV KC_DB_PASSWORD=&lt;DBPASSWORD&gt;
ENV KC_HOSTNAME=localhost
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]</pre>
        <p>El build fija opciones del servidor; lo generado se copia a la imagen final; hostname y base quedan seteados; el entrypoint expone todos los subcomandos. Proveedores custom: JARs a <code>/opt/keycloak/providers</code> <strong>antes</strong> del build (<code>ADD --chown=keycloak:keycloak --chmod=644</code>).</p>
        <pre class="ref-block">podman|docker build . -t mykeycloak -f Containerfile
podman|docker run --name mykeycloak -p 8443:8443 -p 9000:9000 \\
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin -e KC_BOOTSTRAP_ADMIN_PASSWORD=change_me \\
  mykeycloak start --optimized --hostname=localhost</pre>
        <p>Producción: solo HTTPS en <code>:8443</code>; salud en <code>:9000/health[/ready|/live]</code>; métricas en <code>:9000/metrics</code>. Otro puerto: publicás distinto y pasás el hostname como URL completa (<code>--hostname=https://localhost:3000</code>). Dev/testing: <code>start-dev</code> (nunca en producción). Admin inicial: como el contenedor no es red local, se crea con <code>KC_BOOTSTRAP_ADMIN_USERNAME/PASSWORD</code>. Realm importado: archivos en <code>/opt/keycloak/data/import</code> + <code>--import-realm</code>.</p>
        <div class="callout warn"><p class="lbl">Problemas conocidos</p><p><code>dnf install</code> eterno: revisá <code>LimitNOFILE</code> del servicio systemd o <code>--ulimit</code> en build. JAR que “cambió” con <code>--optimized</code>: Docker altera timestamps; fijalos con <code>touch -m --date=@…</code> antes del build.</p></div>

        <h2>2. Topología: realms, clients, IdP</h2>
        <table class="doc"><tr><th>Unidad</th><th>Qué es</th><th>Impacto</th></tr>
        <tr><td><strong>Master Realm</strong></td><td>Namespace superior: gobierna el servidor y los demás realms.</td><td>Jamás alojes usuarios de app ahí: mala práctica grave.</td></tr>
        <tr><td><strong>Application Realm</strong></td><td>Tenant aislado: usuarios, clients, sesiones y par RSA propio para firmar.</td><td>Validación exclusiva por app, sin colisiones de roles.</td></tr>
        <tr><td><strong>Client (OIDC)</strong></td><td>El software que delega: frontend o API.</td><td>Define el contrato: qué flujos OAuth permite.</td></tr>
        <tr><td><strong>Identity Provider</strong></td><td>Keycloak delegando a su vez en Google, GitHub, LDAP…</td><td>SSO empresarial sin tocar tu código.</td></tr></table>

        <h2>3. Llaves, tokens y mappers</h2>
        <p>Cada realm genera su <strong>par RSA 2048</strong>: la privada firma (nunca sale), la pública se expone por <strong>JWKS</strong>. El backend valida offline si cacheó las públicas. <strong>Access Token</strong>: 1–5 min (corto: un token robado sigue validando hasta expirar). <strong>Refresh</strong>: días/semanas, solo para renovar sin re-login.</p>
        <p>API backend: client en modo <strong>bearer-only</strong> (sin redirecciones). <strong>Protocol Mappers</strong> inyectan claims custom antes de firmar (ej. <code>student_id</code> como String/Integer/Boolean para lenguajes tipados).</p>

        <h2>4. RBAC y anatomía del payload</h2>
        <pre class="ref-block">{
  "iss": "http://keycloak:8080/realms/tarea-corta-realm",
  "aud": "api-backend", "sub": "a1b2…", "typ": "Bearer",
  "realm_access": { "roles": ["creador", "editor"] },
  "resource_access": { "api-backend": { "roles": ["acceso_api"] } }
}</pre>
        <p>Middleware al recibir <code>POST /recurso</code>: 1) <code>exp</code> vs reloj, 2) <code>iss</code> exacto, 3) rol <code>creador</code> en <code>realm_access.roles</code>; si falta → <strong>403</strong>.</p>

        <h2>5. Persistencia externa (Postgres)</h2>
        <p>Por defecto Keycloak usa <strong>H2 en memoria</strong>: un <code>down</code> borra clients y roles. Apuntá a Postgres por JDBC (<code>KC_DB=postgres</code>, <code>KC_DB_URL=jdbc:postgresql://postgres-db:5432/keycloak</code>, credenciales por entorno) con <code>depends_on: service_healthy</code>. Y creá una <strong>base lógica dedicada</strong> (<code>CREATE DATABASE keycloak</code>), separada de la de la app: nada de colisiones de esquema.</p>

        <h2>6. Validación en backend (nunca a mano)</h2>
        <p>Usá bibliotecas (PyJWT + PyJWKClient en Python; java-jwt + jwks-rsa en Java). Flujo: 1) al arrancar, GET al discovery (<code>/.well-known/openid-configuration</code>) con el <strong>nombre interno</strong> (<code>http://keycloak:8080/…</code>); 2) descargar JWKS y cachear en RAM (con fallback si llega un <code>kid</code> nuevo: Keycloak rotó llaves); 3) por petición, leer <code>Authorization: Bearer</code>; 4) verificar firma RSA + exp + roles.</p>
        <pre class="ref-block"># Python: PyJWT hace discovery + caché + validación estricta
jwks_client = PyJWKClient("http://keycloak:8080/realms/tarea-corta-realm/protocol/openid-connect/certs")
key = jwks_client.get_signing_key_from_jwt(token)
payload = jwt.decode(token, key.key, algorithms=["RS256"],
    audience="api-backend", issuer="http://keycloak:8080/realms/tarea-corta-realm")
# ExpiredSignatureError / InvalidIssuerError / InvalidSignatureError -> 401</pre>

        <h2>7. Realm reproducible + pruebas con cURL</h2>
        <p>Exportá el realm a <code>realm-export.json</code> y montalo read-only: <code>./config/realm-export.json:/opt/keycloak/data/import/realm-export.json:ro</code> + <code>--import-realm</code>. Token para tests con Direct Access Grants (<code>grant_type=password</code>); si el usuario no tiene el rol, Keycloak da 200 igual y tu API debe responder el 403: prueba completa sin GUI.</p>
        <pre class="ref-block">export TOKEN=$(curl -s -X POST http://localhost:8080/realms/tarea-corta-realm/protocol/openid-connect/token \\
  -d "grant_type=password" -d "client_id=api-backend" \\
  -d "username=usuario_prueba" -d "password=clave_segura" | jq -r '.access_token')
curl -X POST http://localhost:5000/recurso -H "Authorization: Bearer $TOKEN" \\
  -d '{"campo1":"valor","campo2":42}'</pre>

        <h2>8. OAuth 2.0 vs OIDC, JWT y validación estricta</h2>
        <p><strong>OAuth 2.0</strong> = autorización delegada (no dice quién sos; el access token puede ser opaco). <strong>OIDC</strong> = capa de identidad sobre OAuth: agrega el <strong>ID Token</strong> en formato <strong>JWT</strong> (RFC 7519, autónomo: todo viaja adentro).</p>
        <p>JWT = <code>header.payload.firma</code> en Base64Url. Header: <code>alg</code> (RS256) + <code>kid</code> (qué llave buscar). Payload: <code>iss</code>, <code>sub</code>, <code>aud</code>, <code>exp</code>, <code>iat</code>. Firma: hash firmado con la privada; inalterable sin ella. Discovery (RFC 8414) → <code>jwks_uri</code> → arreglo de llaves (<code>kid, kty, alg, n, e</code>).</p>
        <p>OIDC Core §3.1.3.7, sin saltos: decodificar header (alg/kid) → <code>iss</code> <strong>idéntico</strong> (una barra de más = 401) → <code>aud</code> contiene tu client → <code>exp</code> vs UTC → firma con la pública del <code>kid</code>. Omitir un paso = suplantación o replay.</p>
        <div class="callout bad"><p class="lbl">La trampa localhost vs keycloak</p><p>Si pedís el token por <code>localhost:8080</code>, Keycloak graba ese <code>iss</code>; tu backend espera <code>http://keycloak:8080</code> → Issuer Mismatch. Fijá el iss con <code>KC_HOSTNAME_URL</code> o el frontend URL para que siempre emita el nombre interno.</p></div>
        <table class="doc"><tr><th>Escenario</th><th>Código</th><th>Backend</th></tr>
        <tr><td>Sin Authorization</td><td><strong>401</strong></td><td>Bloquear antes de leer el body.</td></tr>
        <tr><td>Expirado</td><td><strong>401</strong></td><td>Excepción → error, sin lógica de negocio.</td></tr>
        <tr><td>Firma inválida</td><td><strong>401</strong></td><td>JWKS no verifica: posible ataque.</td></tr>
        <tr><td>Válido sin rol</td><td><strong>403</strong></td><td>Firma OK, RBAC niega.</td></tr></table>`,
      quiz: [
        { q: "POST /reservas con un JWT válido pero de un usuario sin rol creador. ¿Código?", opts: ["200", "401", "403", "500"], a: 2, why: "Identidad válida + permiso faltante = 403. El 401 es para identidad ausente o inválida." },
        { q: "Recreaste Keycloak sin persistencia y los tokens viejos dan firma inválida. ¿Por qué?", opts: ["Porque cambió el realm", "Porque al reiniciar sin base generó un nuevo par RSA y las firmas viejas ya no verifican", "Porque expiró el .env", "Porque falta el healthcheck"], a: 1, why: "Sin Postgres persistente, Keycloak pierde sus llaves al recrearse. Todo token anterior muere." },
        { q: "¿Por qué el access token debe vivir 1–5 minutos?", opts: ["Por ahorrar memoria", "Para achicar la ventana en que un token robado sigue validando", "Porque lo exige Docker", "Para que el refresh sea innecesario"], a: 1, why: "Revocar en Keycloak no invalida backends remotos hasta que el token expira." },
        { q: "¿Qué aporta el modo bearer-only del client backend?", opts: ["Que emite tokens", "Que no maneja redirecciones de login: solo valida el Bearer que le llega", "Que guarda contraseñas", "Que reemplaza al JWKS"], a: 1, why: "La API no loguea usuarios; verifica tokens. El login vive en Keycloak." },
        { q: "Pedís el token por localhost:8080 pero el backend espera iss http://keycloak:8080. ¿Resultado?", opts: ["200, es lo mismo", "401 por Issuer Mismatch", "403", "Se redirige solo"], a: 1, why: "El iss debe ser idéntico al esperado. Fijalo con KC_HOSTNAME_URL." }
      ]
    },
    {
      id: "kind", num: "06", lab: "k8s",
      title: "El mismo sistema, otro modelo",
      sub: "Kind: Compose traducido a Deployment, Service y PVC",
      lede: "Kubernetes no construye imágenes ni ordena arranques: declarás el estado deseado y el clúster converge. Este tema cubre el material completo: kind de punta a punta, Deployment, Service, almacenamiento (PV/PVC), ConfigMap/Secret, sidecars, probes con todos sus campos y la tabla Compose→K8s.",
      body: `
        <div class="sheet"><p class="kicker">Para qué sirve</p>
        <p><strong>kind</strong> (SIG Testing, oficial) corre clústeres K8s locales usando contenedores Docker como nodos: control plane + workers sin VMs pesadas (a diferencia de Minikube). Simula producción para el servicio HTTP + Postgres sin costo de nube, y es donde se aplican Deployment, Service y PVC.</p></div>

        <h2>1. Ciclo de vida del clúster</h2>
        <pre class="ref-block">kind create cluster --name tc1-cluster   # descarga imagen de nodo, levanta el clúster, ajusta ~/.kube/config
kubectl cluster-info --context kind-tc1-cluster
kubectl get nodes
kind delete cluster --name tc1-cluster    # equivale al down -v: limpia todo</pre>

        <h2>2. El cuello de botella: imágenes locales</h2>
        <p>En Compose, <code>build: .</code> construye e instancia. <strong>K8s no construye</strong>: el Deployment hace pull de un registro. Tu imagen local no está en ningún registro → <code>ErrImagePull/ImagePullBackOff</code>. Ritual:</p>
        <pre class="ref-block">docker build -t mi-servicio-http:v1 .
kind load docker-image mi-servicio-http:v1 --name tc1-cluster
# + imagePullPolicy: Never o IfNotPresent en el Deployment</pre>

        <h2>3. Deployment: nunca pods desnudos</h2>
        <p>El Pod es efímero: si muere, no resucita. El <strong>Deployment</strong> declara el estado deseado (“2 réplicas de v1”) y el controller converge. Por debajo crea un <strong>ReplicaSet</strong>; al actualizar imagen crea uno nuevo y migra gradual (<strong>RollingUpdate</strong>, cero downtime esperando readiness); si falla (CrashLoopBackOff), <strong>rollback</strong> al historial.</p>
        <p>Anatomía: <code>selector.matchLabels</code> debe coincidir con <code>template.metadata.labels</code> (ese es el vínculo). Tres Deployments en la evaluación: app, Postgres, Keycloak.</p>

        <h2>4. Service: nombre estable, pods volátiles</h2>
        <p>Cada Pod nace con IP nueva: conectarse por IP se rompe al reiniciar. El <strong>Service</strong> da IP + DNS persistentes y balancea vía kube-proxy/EndpointSlice. Solo conoce pods por <strong>selectores de labels</strong>.</p>
        <table class="doc"><tr><th>Tipo</th><th>Uso en la evaluación</th></tr>
        <tr><td><strong>ClusterIP</strong> (default)</td><td>Solo dentro del clúster. Ideal para Postgres: nada justifica exponerla.</td></tr>
        <tr><td><strong>NodePort</strong> (30000–32767)</td><td>API y Keycloak consumibles desde Postman/curl vía el puerto del contenedor kind.</td></tr>
        <tr><td><strong>LoadBalancer</strong></td><td>No aplica en kind: queda Pending sin MetalLB.</td></tr></table>
        <p>DNS (CoreDNS): <code>&lt;servicio&gt;.&lt;ns&gt;.svc.cluster.local</code>; en el namespace default basta el nombre, igual que Compose.</p>

        <h2>5. Almacenamiento: PV, PVC, StorageClass</h2>
        <p>El filesystem del Pod es volátil. K8s separa <strong>suministro</strong> de <strong>consumo</strong>:</p>
        <table class="doc"><tr><th>Recurso</th><th>Rol</th></tr>
        <tr><td><strong>PV</strong></td><td>Disco real (admin o StorageClass). En kind se crea solo.</td></tr>
        <tr><td><strong>PVC</strong></td><td>Tu reclamo: tamaño, accesos, clase. Lo que escribís en la evaluación.</td></tr>
        <tr><td><strong>StorageClass</strong></td><td>El “tipo” + provisioner. kind trae <code>standard</code> por defecto.</td></tr></table>
        <p>Ciclo: PVC (piden 1Gi) → la SC reserva en el nodo y crea el PV → <strong>Binding</strong> 1:1 (Pending→Bound) → el Pod monta en <code>/var/lib/postgresql/data</code>. <strong>Reclaim</strong>: <code>Retain</code> conserva (limpieza manual); <code>Delete</code> (default dinámico) borra todo si eliminás el PVC. Accesos: <strong>RWO</strong> (obligatorio para Postgres: un nodo, file locks), <strong>ROX</strong> (estáticos), <strong>RWX</strong> (NFS/Ceph; jamás Postgres clásico).</p>
        <p>Compose (4 líneas: servicio + <code>postgres_data:/var/lib/…</code> + declaración) se vuelve dos recursos: <strong>PVC</strong> (<code>ReadWriteOnce</code>, 1Gi) + <strong>Deployment</strong> con <code>volumeMounts</code> → <code>volumes.persistentVolumeClaim.claimName</code>.</p>
        <div class="callout warn"><p class="lbl">Frontera en kind</p><p><code>kubectl delete pod</code> → el nuevo Pod reata el PVC: datos intactos. <code>kind delete cluster</code> → muere el local-path del nodo: pérdida esperada, como quemar la región.</p></div>
        <table class="doc"><tr><th>Síntoma</th><th>Causa</th><th>Diagnóstico</th></tr>
        <tr><td>Pending</td><td>PVC sin Binding (espacio o claimName mal).</td><td><code>kubectl describe pvc postgres-pvc</code></td></tr>
        <tr><td>CrashLoopBackOff</td><td>Montó pero sin permiso de escritura.</td><td><code>kubectl logs &lt;pod-postgres&gt;</code></td></tr></table>

        <h2>6. Config: ConfigMap, Secret, sidecars</h2>
        <p><strong>ConfigMap</strong>: no sensible (pares clave-valor → env, args o archivos; desacopla entorno de imagen). <strong>Secret</strong>: contraseñas y afines (parecido, pero para secretos). Alternativas: <strong>sidecar</strong> (auxiliar en el mismo Pod que escribe config a un volumen compartido) e <strong>init containers</strong> (corren antes de la app, una sola vez; por archivos o por env).</p>

        <h2>7. Probes a fondo</h2>
        <p><strong>Liveness</strong> (/health, sin base): ¿bloqueado? Si falla, kubelet mata y reinicia. Éxito HTTP = 2xx–3xx. <strong>Readiness</strong> (/ready, con base): ¿atiendo? Si falla, saca del Service sin reiniciar. Juntas: sin tráfico a lo no listo + reinicio a lo atascado.</p>
        <table class="doc"><tr><th>Campo</th><th>Qué controla</th></tr>
        <tr><td>initialDelaySeconds</td><td>Espera antes del primer probe (0 default). Readiness más largo: da tiempo a la BD.</td></tr>
        <tr><td>periodSeconds</td><td>Cada cuánto (10 default, mín 1).</td></tr>
        <tr><td>timeoutSeconds</td><td>Cuándo se da por caducado (1 default).</td></tr>
        <tr><td>successThreshold</td><td>Éxitos seguidos para dar por bueno (liveness: siempre 1).</td></tr>
        <tr><td>failureThreshold</td><td>Fallos seguidos para declarar fallo (3 default).</td></tr></table>
        <p><code>httpGet</code>: <code>path</code>, <code>port</code> (1–65535), <code>host</code> (default IP del Pod), <code>scheme</code> (HTTP/HTTPS), <code>httpHeaders</code> opcionales.</p>

        <h2>8. Tabla de traducción Compose → K8s</h2>
        <table class="doc"><tr><th>Compose</th><th>Kubernetes</th></tr>
        <tr><td>services: app</td><td>Deployment (ciclo de vida, imagen de kind, recursos, probes).</td></tr>
        <tr><td>ports / red interna</td><td>Service ClusterIP adentro; NodePort o port-forward al host.</td></tr>
        <tr><td>volumes: db-data</td><td>PVC (el grupo lo escribe; kind lo ata al disco del nodo).</td></tr>
        <tr><td>healthcheck + depends_on</td><td>livenessProbe (/health) + readinessProbe (/ready).</td></tr>
        <tr><td>environment:</td><td>ConfigMap (URIs) + Secret Base64 (credenciales).</td></tr></table>
        <p>Un bloque de Compose se descompone en 2–3 manifiestos (cómputo, red, persistencia). Y el flujo README queda: create → build → load → <code>apply -k</code> → <code>get pods -w</code>.</p>`,
      quiz: [
        { q: "El pod queda en ImagePullBackOff con una imagen que sí existe en tu Docker. ¿Qué faltó?", opts: ["El healthcheck", "Cargarla al clúster con kind load (K8s no ve tu Docker local)", "El Secret", "El overlay"], a: 1, why: "El nodo de kind tiene su propio caché. Build local no es visible hasta el load." },
        { q: "¿Qué probe saca un pod del Service sin reiniciarlo cuando Postgres aún no responde?", opts: ["livenessProbe", "readinessProbe", "startupProbe obligatoria", "Ninguna: hay que usar depends_on"], a: 1, why: "Readiness = listo para tráfico. Fallar ahí esconde al pod, no lo mata." },
        { q: "¿Qué PVC pedirías para Postgres y por qué?", opts: ["RWX, para varios nodos", "RWO 1Gi: un solo escritor con file locks + espacio de prueba", "ROX, solo lectura", "Ninguno: disco del Pod"], a: 1, why: "Postgres exige escritor único. RWX lo corrompe; el disco del Pod es volátil." },
        { q: "Borraste el PVC con reclaim Delete. ¿Qué pasa?", opts: ["Nada, los datos quedan", "Borrado destructivo e irrecuperable del volumen", "Se hace backup solo", "Solo se reinicia el Pod"], a: 1, why: "Delete es el default dinámico. Retain conserva pero pide limpieza manual." }
      ]
    },
    {
      id: "kustomize", num: "07", lab: "k8s",
      title: "Una base, muchos despliegues",
      sub: "Kustomize: base + overlay, sin duplicar manifiestos",
      lede: "La base dice cómo es el sistema; el overlay dice qué cambia en este entorno. Este tema cubre el material completo: filosofía sin plantillas, kustomization.yaml, jerarquía base/overlays, ejemplos reales de la evaluación y los generadores y patches.",
      body: `
        <div class="sheet"><p class="kicker">Para qué sirve</p>
        <p><strong>Kustomize</strong> (nativo en kubectl desde 1.14, <code>kubectl apply -k</code>) personaliza YAML puro <strong>sin plantillas</strong> (a diferencia de Helm): la base intacta + capas de personalización. Misma config para dev, pruebas y prod, inyectando solo diferencias.</p></div>

        <h2>1. Gestión declarativa: patching, no templating</h2>
        <p>En vez de variables inyectadas que ensucian el YAML, Kustomize fusiona (<strong>patching + merging</strong>): la base sigue siendo K8s válido y la fuente de verdad; los overlays aplican mutaciones controladas. Ventaja: <strong>separación de preocupaciones</strong> entre arquitectura y entornos.</p>

        <h2>2. kustomization.yaml: el punto de entrada</h2>
        <p>Declara qué entra y qué se transforma: <code>resources</code> (YAMLs locales o externos), <code>bases</code> (otros directorios con su kustomization), <code>patches/patchesStrategicMerge</code> (réplicas, env, etc.). La base también lleva el suyo como índice (+ <code>commonLabels</code> tipo <code>app.kubernetes.io/part-of</code>).</p>

        <h2>3. Base agnóstica, overlays por entorno</h2>
        <table class="doc"><tr><th>Capa</th><th>Rol</th></tr>
        <tr><td><strong>base/</strong></td><td>Manifiestos inmutables y comunes (Deployment, Service, PVC). Sin valores de entorno ni réplicas masivas: la topología mínima viable.</td></tr>
        <tr><td><strong>overlays/</strong></td><td>Un subdirectorio por variante (dev, prod, local-kind) que referencia la base y declara overrides. Un entorno = un overlay.</td></tr></table>
        <pre class="ref-block">k8s/
├── base/
│   ├── deployment.yaml      # app original
│   ├── postgresql.yaml
│   ├── service.yaml
│   └── kustomization.yaml   # resources: [deployment.yaml, ...]
└── overlays/
    └── local/
        ├── kustomization.yaml
        └── patch-replicas.yaml  # el cambio real</pre>
        <pre class="ref-block"># overlays/local/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - ../../base
images:                       # transformer integrado: tag sin tocar la base
  - name: servicio-http
    newTag: v1.0.0-local
patches:
  - path: patch-replicas.yaml</pre>
        <p>Despliegue documentado: <code>kubectl apply -k k8s/overlays/local</code>. No duplicidad = puntaje completo.</p>

        <h2>4. Personalizar sin copiar: tres caminos</h2>
        <p><strong>Réplicas</strong> (directiva nativa, sin patch): <code>replicas: [{name: servicio-http-deployment, count: 3}]</code>. <strong>Config y secretos</strong> desde el overlay: <code>configMapGenerator</code>/<code>secretGenerator</code> con <code>literals</code> (ej. <code>DB_HOST</code>, <code>DB_PASSWORD</code> solo-local) en vez de quemarlos en la base. <strong>Imágenes</strong>: <code>images: [{name, newName, newTag}]</code> para apuntar al build local de kind.</p>
        <p><strong>Strategic Merge Patch</strong> cuando lo nativo no alcanza (ej. limits de recursos): YAML parcial con mismo <code>kind/name</code> que se fusiona, declarado en <code>patchesStrategicMerge</code>.</p>
        <div class="callout good"><p class="lbl">Verificación gratis</p><p><code>kubectl kustomize overlays/local-kind/</code> imprime el YAML fusionado antes de aplicar. Auditar antes de desplegar no cuesta nada.</p></div>`,
      quiz: [
        { q: "Necesitás 3 réplicas en dev pero 1 en la base. ¿Dónde va el cambio?", opts: ["Editando la base directamente", "Duplicando el Deployment en el overlay con 3 réplicas", "En el overlay con replicas: [{name, count: 3}] sin tocar la base", "En el Dockerfile"], a: 2, why: "El overlay modifica al vuelo; la base intacta sigue sirviendo a todos los entornos." },
        { q: "¿Por qué Kustomize evita las plantillas tipo Helm?", opts: ["Porque es más lento", "Para que la base siga siendo YAML válido y auditable, aplicando solo parches por entorno", "Porque no soporta variables", "Por compatibilidad con Docker"], a: 1, why: "Patching + merging: pureza estructural + separación de preocupaciones." },
        { q: "¿Dónde van las credenciales solo-locales?", opts: ["Quemadas en la base", "En secretGenerator del overlay", "En el nombre de la imagen", "En el README"], a: 1, why: "La base es agnóstica; lo específico del entorno vive en su overlay." }
      ]
    }
  ];
})();
