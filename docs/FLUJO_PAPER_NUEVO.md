# FLUJO_PAPER_NUEVO.md — Cómo añadir un paper nuevo (sistemático)

> **Entrada única:** [`README.md`](../README.md) → este archivo.
> **Spec de contenido y rúbrica:** [`SISTEMA_HTML_ESTUDIO.md`](../SISTEMA_HTML_ESTUDIO.md).
> **Errores que no deben repetirse:** [`LECCIONES_ERRORES.md`](LECCIONES_ERRORES.md).

## 0. Qué es referencia y qué no

| Paper | Estado | Uso |
|---|---|---|
| **Bigtable** (`papers/bigtable/bigtable_app.html`) | **Implementación de referencia.** Cobertura ~100% del paper + paquete UX completo. | Copiar el esqueleto de aquí. |
| **GFS** (`papers/gfs/gfs_app.html`) | Hermano con **UX portada** de Bigtable (Continuar, tips, quiz modes, TOC). Contenido no auditado al 100% como el piloto. | Ver cómo se remapeó `MODULE_ANIMS`, `PAPER_SHUFFLE_ID` y prefijo `gfs-*`. |
| **Aurora / Zanzibar** | **Antiguos / desactualizados a propósito.** No tienen el paquete UX actual. | No copiar de ahí. Solo se actualizan si se decide revisitarlos (usar este flujo). |
| **Contenerización** | Módulo aparte (Docker → K8s), layout dock. | Fuera de este flujo. |
| **Redis / MongoDB** | Sistemas prácticos bajo **Sistemas · práctica** (hermanos de Contenerización, no anidados). Study-desk + UX completo. | Misma checklist DoD §3; viven en `redis/` y `mongo/` (no en `papers/`). Hub → `../index.html`. Fuentes: Architecture Notes + PDF curso (Redis); PDF NoSQL + Notion S6–S8 (Mongo). Build helpers opcionales: `_build_*.js` (cuidado §15 LECCIONES). |

## 1. Estructura de archivos y naming

```
bdii-estudio/
├── index.html                      # hub: papers + Sistemas práctica
├── README.md                       # entrada; enlaza a docs
├── SISTEMA_HTML_ESTUDIO.md         # spec + rúbrica + prompt
├── docs/
│   ├── FLUJO_PAPER_NUEVO.md        # este archivo (checklist + DoD)
│   └── LECCIONES_ERRORES.md        # error log / anti-patrones
├── papers/<id>/<id>_app.html       # papers académicos
├── redis/redis_app.html            # sistema práctico
├── mongo/mongo_app.html            # sistema práctico
└── contenerizacion/                # dock aparte
```

Convenciones:

- `<id>`: slug en minúsculas, sin espacios (`bigtable`, `gfs`, `redis`, `mongo`).
- Papers: `papers/<id>/<id>_app.html` → Hub `href="../../index.html"`.
- Sistemas prácticos (Redis/Mongo): `<id>/<id>_app.html` en raíz → Hub `href="../index.html"`. Card en la sección **Sistemas · práctica** del hub (junto a Contenerización, no mezclada con su dock).
- **Prefijo único de storage = `<id>`** (nunca compartir claves entre apps):

| Clave | Contenido |
|---|---|
| `<id>-done` | módulos completados |
| `<id>-mini` | respuestas de mini-checks (por módulo) |
| `<id>-quiz` | historial de scores del quiz |
| `<id>-quiz-wrong` | índices (del array `QUIZ`) fallados |
| `<id>-cases` | pistas/soluciones vistas por caso |
| `<id>-last` | vista/módulo/modo para **Continuar** |
| `<id>-theme` | `light` / `dark` (además `bdii-hub-theme`, compartida con el hub) |

- `PAPER_SHUFFLE_ID = '<id>'` (semilla del barajado de opciones).
- Animaciones: nombres del dominio del paper (`animWebtable`, `animChunkWrite`…). Prohibido reutilizar los de otro paper.

## 2. Checklist para paper nuevo

Marcar en orden. No saltar a UX antes de tener contenido.

### Fase A — Preparación
- [ ] Tener `PAPER.pdf` (local, **no** se sube al repo) y `RESUMEN.md` por páginas.
- [ ] Listar: tesis en 1 frase, 5–8 mecanismos núcleo, **todas** las figuras/tablas, todos los números de evaluación, lecciones y related work.
- [ ] Decidir `<id>` y fijar el prefijo de storage.

### Fase B — Esqueleto
- [ ] `Copy-Item papers\bigtable\bigtable_app.html papers\<id>\<id>_app.html`
- [ ] Buscar y reemplazar **todas** las apariciones de `bigtable` (claves `bigtable-*`, `PAPER_SHUFFLE_ID`, títulos, textos, hrefs). Verificar con `rg -n -i bigtable papers/<id>/<id>_app.html` → **0 resultados** (salvo citas intencionales).
- [ ] Vaciar `MODULES`, `QUIZ`, `CASES`, `GLOSSARY`, `CHEATSHEET`, `MODULE_ANIMS`, `QUIZ_MODULE_HINT`, animaciones. **No** dejar contenido de Bigtable "para luego".
- [ ] Verificar que la página abre sin errores en consola con arrays vacíos/mínimos.

### Fase C — Contenido 100% del PDF
- [ ] `MODULES`: un módulo (o bloque) por sección §1…§N + **related work** + evaluación + lecciones.
- [ ] Cada módulo: lede + **cita EN** (`§ + página + Fig/Tabla`) + traducción ES didáctica + `.trade` numerado (Ganas/Pagas/Cuándo) + error común + mini-check.
- [ ] Cualquier contraste ajeno al paper (Redis, RDBMS, etc.) etiquetado como **didáctico/clase**, no como cita del paper (ver LECCIONES §8).
- [ ] Inferencias etiquetadas `[inferencia]`.
- [ ] Cada figura/tabla tiene animación o pregunta.

### Fase D — Glosario y tips
- [ ] `GLOSSARY` 20–40 términos: `ES + EN`, 1 línea con trade-off o ejemplo, `§ref`, aliases/acrónimos.
- [ ] `buildTipIndex` + `enhanceTips(root)` llamados tras **cada** render (módulos, quiz explains, soluciones de casos, Inicio, Animaciones, Cheatsheet).
- [ ] `escapeRe` correcto (ver LECCIONES §1). `enhanceTips` **omite** `table`, `code`, `pre`, `a`, `button`, `input`.

### Fase E — 5 animaciones SVG
- [ ] Mínimo 5, paso a paso (`init/draw/step/play/reset`) con caption numerada y 1 control interactivo.
- [ ] Naming del dominio. Colores vía `refreshAnimColors()` (tema claro/oscuro).
- [ ] `MODULE_ANIMS`: mapa **módulo → ids de animación de ESTE paper** (no copiar el de Bigtable). Link inverso Animación → módulo.

### Fase F — Quiz y casos
- [ ] Quiz 24–30 MCQ (30/40/20/10), `q, opts[4], a, why, tag`; `why` re-enseña (mecanismo + ref).
- [ ] Opciones barajadas con `prepareShuffledMCQ` (semilla `PAPER_SHUFFLE_ID|quiz|i`). **Nunca** asumir posición de la correcta en la UI.
- [ ] `QUIZ_MODULE_HINT`: pregunta/tag → módulo(s) a repasar (remediación accionable).
- [ ] ≥6 casos con pistas graduadas + solución en 3 partes + rúbrica 2/2/1.
- [ ] Quiz usa el quiz como **detector de huecos**: si falla por contenido ausente, se arregla el módulo, no la pregunta.

### Fase G — Paquete UX (obligatorio)
- [ ] **Continuar** (`<id>-last`), guardado solo en navegación intencional.
- [ ] Tip bubbles del glosario.
- [ ] Quiz: modos **Estudio / Examen / Solo falladas**, filtros por tag, paginación 1/5/Todas, persistencia de falladas + links de repaso.
- [ ] TOC intra-módulo (`h3` / `.trade`).
- [ ] Aprende ↔ Animaciones (links bidireccionales).
- [ ] Cheatsheet con botón **Imprimir / Guardar PDF** visible (`window.print()`).
- [ ] Barra de progreso: módulos + mini-checks + último quiz %.
- [ ] Subtabs **Preguntas | Casos** con progreso de casos persistido.
- [ ] Modo lectura, chip de módulo `N/M`, tema Claro/Oscuro.
- [ ] Study-desk: columna ancha, **sin emojis decorativos**.

### Fase H — Hub y QA
- [ ] Card en `index.html` apuntando a `papers/<id>/<id>_app.html`.
- [ ] Pasar la **Definition of Done** (sección 3) y el QA de `SISTEMA_HTML_ESTUDIO.md` §11.
- [ ] Probar en localStorage limpio **y** con datos previos de otro paper (no deben interferir).
- [ ] Commit + push (ver sección 5).

## 3. Definition of Done

Un paper está "terminado" solo si **todo** esto es verdad:

1. **Cobertura 100%**: cada sección del PDF (+ related work + evaluación + lecciones) tiene módulo; cada figura/tabla tiene animación o pregunta; cada número con unidad y contexto.
2. **Fidelidad**: citas EN con `§`+página; extras no-paper etiquetados; `[inferencia]` donde aplique.
3. **Tip bubbles** funcionando en Aprende, Inicio, Animaciones, explains, casos y Cheatsheet; no dentro de tablas.
4. **Quiz**: 3 modos, filtros por tag, paginación, falladas persistidas, remediación a módulos, opciones barajadas (la correcta no siempre en la misma posición).
5. **Continuar** restaura vista/módulo y **no** se pisa al cargar la página.
6. **Mini-checks** persisten al marcar módulo hecho / re-render.
7. **Cheatsheet** con botón Imprimir/PDF visible y CSS `@media print` 1 página.
8. **Sin `position: sticky` en `th` de tablas de módulos.**
9. **JS parsea**: sin errores de sintaxis ni de consola al cargar (ver verificación en LECCIONES).
10. **Storage** con prefijo `<id>-`; sin referencias a otro paper (`rg -i bigtable|gfs` según corresponda).
11. Offline en un solo archivo; Claro/Oscuro; responsive ≤860px; sin emojis decorativos.
12. Card en el hub y link `← Hub` válidos.

## 4. Portar UX entre papers (cuando solo se actualiza uno viejo)

1. Copiar **solo** la maquinaria (funciones UX), no los datos.
2. Remapear: `PAPER_SHUFFLE_ID`, prefijo de claves, `MODULE_ANIMS` (ids propios), `QUIZ_MODULE_HINT`, textos de Inicio.
3. Verificar con `rg` que no quedan strings del paper origen.
4. Revisar la lista de errores en `LECCIONES_ERRORES.md` (especialmente §1, §3, §5, §12).

## 5. Git y despliegue (Windows PowerShell)

```powershell
Set-Location "C:\Universidad\TEC_No_Git\IV Semestre\BDII\bdii-estudio"
git status --short
git diff --stat
git log --oneline -8          # respetar el estilo de mensajes existente
git add -A
git commit -m @"
Titulo corto en imperativo

Detalle en lineas siguientes.
"@
git push origin main
```

Reglas:

- PowerShell: **no usar `&&`**; usar `;` o líneas separadas. Usar `Set-Location`, no `cd /d`.
- No tocar `git config`; no `--force`.
- En Cursor (smart mode) el **push a `main` requiere aprobación explícita**: commitear localmente primero y pedir aprobación para el push.
- GitHub Pages sirve desde `main` / root. El sitio es público aunque el repo sea privado (cuenta personal).
- No subir PDFs con copyright, datos personales ni `*.bak`.
