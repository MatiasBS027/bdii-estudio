# Tarea Corta 1 — Contenerización de un servicio con Docker

> **Curso:** Arquitectura e Ingeniería de Datos  
> **Profesor:** Kenneth Obando  
> **Institución:** Tecnológico de Costa Rica — Sede Central Cartago  
> **Unidad:** Ingeniería en Computación  
> **Fuente:** `TC1-contenerizacion.pdf`  
> **Entrega:** Semana 3, a más tardar 10:00 p.m. por TecDigital (fecha oficial en Discord)

---

## Instrucciones

Lea este documento completo antes de repartir el trabajo dentro de su grupo. Esta tarea se resuelve en grupos de dos o tres personas, sin excepción; los grupos de tres entregan además el módulo adicional descrito más adelante, que no otorga puntos extra. Esta tarea no contempla defensa, de modo que todo elemento que deba evaluarse ha de quedar demostrado en el repositorio y en el video. Las fechas oficiales son las publicadas en Discord.

---

## 1. Descripción

El objetivo de esta tarea es la contenerización de un servicio propio y su orquestación junto a una base de datos PostgreSQL mediante Docker y Docker Compose. El grupo desarrolla un servicio HTTP, escribe su Dockerfile y el `docker-compose.yml` correspondiente, y justifica por escrito cada decisión de construcción y orquestación.

El alcance es reducido de forma deliberada. La evaluación no se centra en la elaboración del código, sino en su **reproducibilidad**, entendida como la capacidad de un evaluador ajeno al proyecto para clonar el repositorio, ejecutar un único comando y poner el sistema en funcionamiento.

Lo que se evalúa son las decisiones de contenerización que la tarea ejercita:

- la selección de la imagen base
- el contenido de la imagen
- la comunicación entre servicios
- la persistencia
- la gestión de la configuración

---

## 2. Núcleo obligatorio

El núcleo es obligatorio para grupos de dos y de tres personas por igual.

### 2.1 Servicio HTTP propio

El grupo desarrolla un servicio, en el lenguaje que prefiera, que exponga al menos tres rutas:

- una de salud (`/health` o equivalente) que responda **sin acceder a la base de datos**
- una de escritura sobre PostgreSQL
- una de lectura de lo registrado

El dominio es libre, pero el servicio debe mantener **estado real en la base**; una ruta que devuelva únicamente texto fijo no cumple el requisito.

### 2.2 Dockerfile propio

Debe:

- partir de una imagen base oficial
- instalar únicamente lo necesario
- copiar el código del servicio
- declarar el puerto
- definir el comando de arranque

El README documenta la elección de la imagen base y las medidas adoptadas para excluir de la imagen los archivos que no le corresponden (dependencias del entorno de desarrollo, historial de Git, artefactos de compilación).

### 2.3 docker-compose.yml que levante el sistema completo

Tres servicios:

1. la aplicación
2. PostgreSQL a partir de su imagen oficial
3. un proveedor de identidad externo (Keycloak) a partir de la suya

La aplicación debe alcanzar tanto la base como el proveedor **por su nombre de servicio** en la red que Compose crea, y no por una dirección IP fija ni por `localhost`.

### 2.4 Autenticación delegada en un proveedor externo

La autenticación no se implementa a mano, sino que se delega en Keycloak, que corre como un contenedor más del Compose.

El grupo configura en Keycloak un **realm** y un **client** para la aplicación. El servicio protege sus rutas de modificación exigiendo un token de acceso (JWT/OIDC) emitido por Keycloak, cuya firma valida contra las llaves públicas del proveedor.

- Las rutas de salud y disponibilidad quedan abiertas.
- Una solicitud sin token válido recibe **401**.
- Una con token válido pero sin el rol requerido recibe **403**.
- El grupo **no** escribe su propio inicio de sesión ni su propia firma de tokens.

### 2.5 Persistencia con un volumen

Los datos de PostgreSQL residen en un volumen declarado en el Compose. El comportamiento esperado, que será verificado, es que los datos escritos persistan tras destruir y volver a crear los contenedores.

### 2.6 Healthchecks y arranque ordenado

Los servicios declaran su healthcheck, y el servicio de la aplicación no debe darse por listo mientras sus dependencias no lo estén.

La estrategia para resolver la dependencia de arranque (`depends_on` con condición, reintentos con espera en la aplicación, o ambos) queda a criterio del grupo, pero debe estar justificada.

### 2.7 Configuración por variables de entorno, sin secretos en la imagen

Credenciales, nombre de la base, host y puerto se inyectan como variables de entorno. La imagen no debe contener ninguna contraseña, ni en el Dockerfile, ni en el código, ni en un archivo copiado dentro.

En el repositorio se versiona un `.env.example` con las claves y valores de ejemplo; el `.env` real queda fuera por `.gitignore`.

### 2.8 Pruebas unitarias y de integración

La entrega incluye pruebas automatizadas.

- **Unitarias:** verifican la lógica del servicio de forma aislada, sin depender de servicios externos (por ejemplo, la validación de los campos de la entidad).
- **Integración:** ejercitan los endpoints contra la pila real que levanta Compose, e incluyen la persistencia en PostgreSQL y la aceptación o el rechazo de un token frente a Keycloak.

Las pruebas se ejecutan con un comando documentado en el README, sin pasos manuales.

### README

Además del código, el repositorio debe incluir un `README.md` que permita a una persona ajena al grupo poner el sistema en marcha sin consultas adicionales. Debe cubrir:

- requisitos previos
- comando de arranque
- contrato de cada ruta (método, cuerpo y respuesta esperada)
- comprobación de la persistencia
- apagado del sistema

---

## Requisitos funcionales mínimos del servicio

El dominio es libre, pero el **contrato del servicio no**.

1. **Una entidad con estado real.** Al menos tres campos además del identificador (por ejemplo, para una reserva: nombre, fecha y cantidad de personas). Esa entidad vive en una tabla de PostgreSQL.

2. **Inicialización automática del esquema.** Al levantar el sistema con un solo comando, la tabla debe crearse sola si no existe (script de inicialización, migración o código de arranque). El evaluador no carga esquemas a mano.

3. **Liveness.** `GET /health` responde 200 con un cuerpo JSON, **sin tocar la base de datos**. Es la ruta en la que se apoya el healthcheck del contenedor de la aplicación.

4. **Readiness.** `GET /ready` verifica la conexión con PostgreSQL y responde 200 cuando la base acepta consultas o **503** cuando no.

5. **Crear.** `POST` al recurso (p. ej. `/reservas`) recibe un JSON, valida campos obligatorios, inserta la fila y responde **201** con el recurso creado (incluido su identificador). Cuerpo inválido o incompleto → **400**, no 500 ni caída del proceso.

6. **Listar y filtrar.** `GET` sobre el recurso devuelve 200 con la lista, y admite al menos un filtro por query param (p. ej. `/reservas?fecha=2026-08-20`). La lista refleja lo que otro cliente escribió, no estado en memoria.

7. **Consultar por identificador.** `GET /reservas/{id}` → 200, o **404** si no existe.

8. **Actualizar.** `PUT` o `PATCH` a `/reservas/{id}` → 200 con la versión actualizada. 404 si no existe, 400 ante cuerpo inválido.

9. **Eliminar.** `DELETE /reservas/{id}` → **204** sin cuerpo, o 404 si no existe.

10. **Rutas protegidas.** Crear, actualizar y eliminar exigen un token válido de Keycloak; sin él **401**; con token sin el rol **403**. Salud y disponibilidad quedan siempre abiertas. Que listar y consultar sean públicas o protegidas queda a criterio del grupo (documentarlo).

11. **Manejo de errores.** El servicio no se interrumpe ante entrada mal formada ni recurso inexistente; responde el código correspondiente y permanece operativo.

Estos requisitos no exigen un framework extenso, autenticación propia ni interfaz gráfica.

---

## Criterios de aceptación

Cuatro comprobaciones sobre el repositorio recién clonado:

1. **Un solo comando.** Tras copiar `.env.example` a `.env`, `docker compose up` deja el sistema operativo y los servicios en estado saludable, sin pasos manuales, sin cargar esquemas a mano y sin editar archivos.

2. **El contrato se cumple.** `/health` sin tocar la base; `/ready` refleja la conexión; CRUD completo con códigos correctos; modificación sin token → 401; con token válido de Keycloak → éxito; inválido → 400; inexistente → 404; el servicio no se cae.

3. **Sobrevivir un reinicio.** Escribir datos, `docker compose down` (sin borrar volúmenes), volver a levantar y leer los mismos datos.

4. **Las pruebas corren.** El comando documentado en el README ejecuta unitarias e integración, y todas pasan.

---

## 3. Regla de frontera

Se prohíbe delegar en una herramienta o en un tercero la construcción de aquello que constituye el objeto de aprendizaje. En esta tarea la frontera se ubica en los archivos de construcción y orquestación: el **Dockerfile** y el **docker-compose.yml** deben ser escritos por el grupo, que debe poder explicar la función de cada instrucción.

**No se acepta:**

- referenciar en el Compose una imagen ya construida que realice el trabajo del servicio sin un Dockerfile propio
- generar el Dockerfile o el `docker-compose.yml` con una herramienta que los produzca automáticamente
- entregar un archivo copiado de una fuente externa cuyo contenido el grupo no pueda justificar
- una instrucción que el grupo no sepa fundamentar

**Sí se permite:**

- imágenes base oficiales (`postgres`, `python:slim`, `node:slim`, `golang` y similares)
- la biblioteca estándar del lenguaje elegido
- el cliente de base de datos que ese lenguaje requiera para PostgreSQL
- Docker, Compose, Kubernetes y Kustomize como herramientas de trabajo

No se requiere implementar mecanismos de bajo nivel como namespaces o cgroups.

**Autenticación, en sentido inverso:** lo correcto es **no** escribir el mecanismo a mano. No se acepta implementar inicio de sesión, emisión ni firma de tokens por cuenta propia. El trabajo es configurar Keycloak y validar contra él los tokens. Las bibliotecas de cliente OIDC o de validación de JWT del lenguaje elegido se usan **sin restricción**.

---

## 4. Módulo adicional para grupos de tres

Los grupos de tres trasladan el mismo sistema a Kubernetes sobre un clúster local levantado con **kind**. El ejercicio consiste en establecer la correspondencia entre cada concepto de Compose y su objeto equivalente en Kubernetes, y en identificar aquellos que carecen de equivalente directo.

Se requieren:

- un Deployment para el servicio y otro para PostgreSQL
- los Service que los exponen dentro del clúster (incluido el que permite alcanzar la aplicación desde el host)
- un PersistentVolumeClaim equivalente al volumen de Compose
- configuración externalizada mediante ConfigMap y Secret
- personalización con **Kustomize**: carpeta `base/` de manifiestos comunes y al menos un `overlay/` que modifique algo real (réplicas, tag de imagen o valores de configuración) **sin duplicar** los manifiestos originales
- `livenessProbe` y `readinessProbe` del Deployment, en correspondencia con `/health` y `/ready`

El README indica el comando exacto para crear el clúster, aplicar el overlay y verificar que el sistema responde.

Este módulo **no otorga puntos extra**. Un grupo de tres que entregue solo el núcleo se evalúa con el módulo de Kubernetes en cero.

---

## 5. Entrega

Publicada en la Semana 1, entrega en la Semana 3, a más tardar 10:00 p.m. por TecDigital. Cada día de atraso descuenta **cinco puntos** sobre base cien. Sin defensa: la evaluación es exclusivamente sobre repositorio y video.

Paquete en TecDigital:

1. **Enlace al repositorio de GitHub.** Historial con commits de todos los integrantes. Un integrante sin commits se evalúa individualmente según la autoría demostrable.

2. **Código fuente completo:** servicio, pruebas, Dockerfile, `docker-compose.yml`, `.env.example`, `.dockerignore`, `.gitignore`. Sin dependencias instaladas (`node_modules`, `.venv`, `vendor`). Grupos de tres: carpeta de manifiestos con `base/` y `overlay/`.

3. **Documentación en Markdown** dentro del repositorio (`README.md`). No se aceptan Word ni PDF como sustituto.

4. **Video de demostración** de máximo diez minutos, **sin edición**, que muestre: clonación, arranque con un solo comando, ejercicio de las rutas, persistencia tras reinicio y, en grupos de tres, despliegue en kind con el overlay.

---

## 6. Evaluación

- Criterio técnico demostrable: **70 puntos**
- Profesionalidad de la entrega: **30 puntos**

Cada criterio tiene un peso; la nota resulta de multiplicar ese peso por el nivel de logro (Excelente 100 %, Bueno 75 %, Regular 50 %, Deficiente ≤25 %).

### Rúbrica

| Criterio (peso) | Excelente (100 %) | Bueno (75 %) | Regular (50 %) | Deficiente (≤25 %) |
|---|---|---|---|---|
| **Dockerfile propio (10)** | Imagen base oficial justificada, dependencias mínimas y sin artefactos innecesarios; puerto y arranque correctos | Funciona, con alguna dependencia o archivo de más, o justificación incompleta | Construye, pero con imagen inflada o decisiones sin justificar | No construye, o parte de una imagen que ya hace el trabajo del servicio |
| **Sistema funcional end-to-end (12)** | Un solo comando levanta todo; la app alcanza la base por nombre de servicio; CRUD y liveness/readiness con códigos correctos | Levanta y las rutas responden, con algún código incorrecto o acceso por IP o localhost | Levanta con pasos manuales, o alguna ruta no cumple el contrato | No levanta con un comando, o las rutas no funcionan |
| **Autenticación con Keycloak (10)** | Realm y client configurados; modificación exige token válido; 401 sin token y 403 sin rol; firma validada contra el proveedor | Protección funcional, con un detalle incompleto (sin verificación de rol o validación laxa) | Protección parcial, o el token no se valida correctamente | Sin autenticación, o implementada a mano en vez de con Keycloak |
| **Pruebas unitarias y de integración (10)** | Ambos tipos corren con un comando y cubren CRUD, validación y autenticación; todas pasan | Pruebas de ambos tipos, con cobertura parcial | Solo unitarias, o pruebas superficiales | Sin pruebas válidas |
| **Persistencia (8)** | Volumen declarado; los datos sobreviven a down y up de forma verificable | Volumen presente, con verificación incompleta | Persistencia frágil o dependiente de pasos manuales | Sin volumen; los datos se pierden al recrear los contenedores |
| **Healthchecks y arranque (6)** | Healthchecks declarados y dependencia de arranque resuelta y justificada | Healthchecks presentes y dependencia resuelta, pero sin justificar | Un solo healthcheck, o dependencia resuelta de forma frágil | Sin healthchecks; la aplicación arranca antes que la base |
| **Configuración sin secretos (6)** | Variables de entorno, `.env.example` versionado y secretos fuera de la imagen y del repositorio | Configuración externalizada con un descuido menor | Algún valor sensible en el código o en el Compose | Credenciales dentro de la imagen o del repositorio |
| **Kubernetes y Kustomize (8, solo grupos de 3)** | Deployment, Service y PVC funcionales en kind; base y overlay sin duplicar manifiestos | Manifiestos funcionales, con overlay que duplica algo o configuración incompleta | Despliegue parcial o sin Kustomize | No se implementó |
| **README reproducible (14)** | Markdown claro con requisitos, arranque, contrato, pruebas, persistencia y apagado; un tercero lo sigue sin ayuda | Cubre lo esencial, con alguna omisión | Instrucciones incompletas o confusas | Ausente o insuficiente para ejecutar |
| **Repositorio y autoría (8)** | Historial con commits de todos, estructura ordenada y sin dependencias versionadas | Commits de todos, con algún descuido de orden | Contribución desigual o dependencias versionadas | Un solo autor, o repositorio desordenado |
| **Video y entrega (8)** | Video de máximo diez minutos sin edición que muestra el flujo completo; entrega conforme | Video que cubre casi todo el flujo | Video parcial, o incumple algún requisito de entrega | Sin video, o no demuestra el sistema |

**Grupos de dos.** El criterio de Kubernetes y Kustomize no aplica y sus 8 puntos se redistribuyen en el bloque técnico: Dockerfile propio pasa a 12, sistema funcional a 14, autenticación y pruebas a 12 cada una; persistencia, healthchecks y configuración sin secretos se mantienen en 8, 6 y 6.

Un grupo de tres que no entregue el módulo de Kubernetes obtiene el nivel Deficiente en él.

---

## Uso de inteligencia artificial y penalizaciones

El uso de herramientas de IA está permitido, pero cada entrega incluye una breve declaración de cómo se usaron, en qué partes y qué se verificó de forma manual. Declararlo no penaliza; ocultarlo agrava. Si no se distingue la aportación intelectual del grupo, la entrega queda sujeta a penalización según el Principio de Aportación Demostrable y la cláusula BDFL del curso.

Penalizaciones transversales:

- **−5 puntos** por cada día de atraso (base 100)
- Integrante sin commits → evaluación individual según autoría demostrable
- Subir `node_modules`, `.venv`, `vendor` o equivalentes → **−5 puntos** del bloque de profesionalidad
