# SISTEMA_HTML_ESTUDIO.md — Spec para generar HTMLs de papers (v1.0)

> **Propósito dual:** (1) **Prompt** que se le pega a la IA para generar el HTML, (2) **Rúbrica/checklist** para auditarlo.
> **Objetivo del usuario:** interiorización profunda — extraer el 100% de información valiosa del paper, entender trade-offs y su importancia, no solo pasar el quiz.
> **Convención de idioma:** cita literal en inglés + traducción/explicación en español. Nunca parafrasear sin marcarlo.

> **Flujo operativo y errores conocidos:** checklist paso a paso y Definition of Done en [`docs/FLUJO_PAPER_NUEVO.md`](docs/FLUJO_PAPER_NUEVO.md); bugs/anti-patrones en [`docs/LECCIONES_ERRORES.md`](docs/LECCIONES_ERRORES.md). **Bigtable = implementación de referencia; GFS = hermano con UX portada; Aurora/Zanzibar = antiguos a propósito** hasta que se revisiten.

---

## 0. Principios (no negociables)

1. **Fidelidad 100% > didáctica bonita.** Todo dato (número, nombre, figura, tabla) debe existir en el paper. Si es inferencia, se etiqueta `[inferencia]`.
2. **Trade-off first.** Cada mecanismo se enseña como `Ganas X / Pagas Y / Cuándo conviene`. Sin trade-off, no hay comprensión.
3. **Trazabilidad al paper.** Cada módulo, pregunta, caso y término cita `§Sec + p. + Fig/Tabla`. Sin cita = no entra.
4. **Transferencia > memoria.** 50% del quiz debe exigir aplicar (diseñar, estimar, predecir fallo), no solo recordar.
5. **Un archivo, offline, sin dependencias.** Un solo `.html`, CSS+JS inline, `localStorage` para progreso.

---

## 1. Entradas obligatorias antes de generar

- `PAPER.pdf` (fuente primaria), `RESUMEN.md` (extracción por páginas), quizzes/informes previos si existen.
- La IA debe listar: tesis en 1 frase, 5-8 mecanismos núcleo, todas las figuras/tablas, todos los números de evaluación, lecciones.
- Si falta un número en el resumen, se busca en el PDF. No se inventa.

## 2. Estructura HTML obligatoria (6 vistas)

```
Inicio | Aprende | Animaciones | Quiz & Casos | Glosario | Cheatsheet
```

- **Inicio:** tesis en 1 frase + 1 línea "idea central" + 4 stats con número exacto del paper + cómo usar (3 cards).
- **Aprende:** 8-10 módulos en orden del paper (cubre §1…§N + related work). Cada módulo = `lede + cita(s) + traducción didáctica + trade-off(s) + error común + mini-check (1Q)`. Longitud de clase OK si hace falta para 100% cobertura.
- **Animaciones:** 1 por mecanismo núcleo (mínimo 5). Botones paso-a-paso + reproducir + reiniciar + caption que explica el paso.
- **Quiz & Casos:** quiz técnico + casos separados. Ver §6 y §7.
- **Glosario:** bilingüe, filtrable. Cada entrada = `término EN + definición ES + trade-off o ejemplo + ref`.
- **Cheatsheet:** 1 página, 5-6 cards por sección del paper, solo bullets y números.

## 3. Sistema de diseño / interfaz (tokens)

- Variables CSS `:root` dark + `body.light`. Paleta: `--bg, --surface, --border, --text, --muted` + acentos `blue/teal/orange/purple/gold/pink` + `--good/--bad`.
- Componentes: `.card.accent-*`, `.callout.info|tip|warn|err`, `.trade` (siempre `⚖️ Trade-off N · Nombre. Ganas… Pierdes…`), `code/pre`, tablas, `.pill`, `.btn/.ghost/.teal`, `.stat-grid`, `.mini-card`, `.module-nav` sticky, `.question-card/.opt/.explain`, `.case-card/.case-step`, `.gloss-term`.
- Header sticky con tabs + botón tema + barra progreso por módulos completados.
- Responsive `@media(max-width:860px)`: hero 1 col, grids 1-2 col, nav horizontal.
- Accesibilidad: `role=img + aria-label` en SVG, botones reales, contraste en `light`, navegación teclado.

## 4. Reglas de fidelidad (cita + traducción)

Formato obligatorio por concepto complejo:

```html
<div class="callout info"><div class="lbl">Cita del paper §X p.Y</div>"...quote literal en inglés..."</div>
<p><strong>Traducción didáctica:</strong> ...en español, con ejemplo del paper (Webtable com.cnn.www, etc.)...</p>
<div class="trade"><b>⚖️ Trade-off N · Nombre.</b> Ganas: ... Pierdes: ... Si ... entonces ...</div>
<div class="callout warn"><div class="lbl">Error común</div>...</div>
```

- Cada módulo numera sus trade-offs de forma global (1..18) para poder referenciarlos en quiz.
- Prohibido: traducir un término técnico sin dar el original (`tablet, memtable, SSTable, Bloom filter, locality group, compaction, group commit` siempre en inglés + ES).

## 5. Modelo de trade-off (plantilla de redacción)

> **Ganas:** beneficio medible (ej. 10× menos espacio). **Pagas:** costo medible (ej. 100-200MB/s CPU + RAM de filtros). **Cuándo sí / cuándo no:** condición del paper (ej. in-memory solo pequeño+caliente como location de METADATA).

## 6. Preguntas (quiz + mini-checks)

### 6.1 Distribución (para N=24-30 preguntas)

- 30% modelo/API directo ( definiciones, paths ).
- 40% trade-off estilo `qué se gana y qué se pierde` (etiqueta `⚖️ trade-off`).
- 20% tricky (distractores plausibles: confunden familia/columna, minor/merging/major, 3 vs 6 RTTs, Bloom falsos +/-).
- 10% numérica/estimación (2³⁴ tablets, 3 vs 6 RTTs, 1212 vs 15385 ops/s, 64KB×1KB=75MB/s, 10-to-1 vs 3-4×).

### 6.2 Formatos obligatorios

- Todas `multiple-choice 4 opciones`, 1 correcta. `q, opts[4], a, why` donde `why` re-enseña (cita + trade-off), no solo dice la respuesta.
- Prohibido: `why` de 1 línea. Mínimo 1 frase con mecanismo + ref.
- Mini-check por módulo (1Q fácil, ancla el concepto). Quiz global reutiliza el formato pero sube dificultad.
- Incluir al menos 2 preguntas por figura clave del paper (Fig. Webtable, Fig. jerarquía 3 niveles, Fig. serving, Tabla perf).

### 6.3 Anti-patrones de preguntas (no hacer)

- Opciones desbalanceadas en largo (la larga = correcta). Igualar longitud.
- Distractores absurdos ("por magia", "por capricho"). El distractor debe ser el error común real.
- Preguntar solo "¿qué es?" sin "¿por qué no la alternativa?".

## 7. Casos prácticos (6 mínimo)

Estructura por caso: `título + prompt con datos del paper + [pistas graduadas] + solución en 3 partes (decisión + mecanismo + trade-off pagado)`.

- Cada caso mapea a 1 trade-off y 1 número (ej. Caso Bloom → 9 NO + 1 quizá; Caso recovery → sort (tabla,fila,seq) + 64MB paralelo).
- Solución oculta tras botón, no visible por defecto. Incluir `rúbrica de auto-nota`: 2 pts decisión + 2 mecanismo + 1 trade-off.
- Temas mínimos: row-key design, caché/RTTs, Bloom/seeks, recovery/sort, compaction sensible, tuning bloque.

## 8. Animaciones (spec mínimo)

- 5 animaciones: (1) ejemplo guía del paper, (2) lookup/jerarquía, (3) write/read path, (4) trade-off central (recovery/sort), (5) read path con optimizaciones.
- Cada una: `init/draw/step/play/reset`, caption numerada por paso, highlight del nodo activo.
- **Naming:** variables descriptivas del dominio (`animWebtable, animLocate, animServe, animRecovery, animRead`). Prohibido reutilizar nombres de otro paper (`enemy, zookie, check, graph` genéricos).
- Ideal: 1 control interactivo real (slider block-size 8KB/64KB, toggle Bloom on/off, toggle caché vacía/stale) que cambie el resultado visible.

## 9. Glosario, cheatsheet y tip bubbles (piloto Bigtable)

- Glosario: 20-40 términos, `ES + EN`, 1 línea con trade-off o ejemplo + `§ref`. Buscador filtra por término y definición.
- Cheatsheet: 5-7 cards (una por sección + related work), cada una ≤5 líneas, solo fórmulas, paths y números. Debe imprimirse en 1 página.
- **Tip bubbles (obligatorio desde piloto Bigtable):** los términos del `GLOSSARY` (y alias/acrónimos) se subrayan con borde punteado en Aprende / Inicio / Animaciones / Quiz explains / Cheatsheet. Hover (desktop) o tap (móvil) abre una burbuja tipo speech-bubble Study-desk con término + definición + `§ref`. Misma fuente de verdad que la vista Glosario — no duplicar definiciones en HTML estático.
- Implementación de referencia: `papers/bigtable/bigtable_app.html` → `buildTipIndex` + `enhanceTips(root)`.

## 10. Persistencia y modos

- `localStorage`: `*-done` (módulos), `*-mini` (mini-checks), `*-quiz` (historial scores), `*-quiz-wrong` (índices fallados), `*-cases` (pistas/soluciones), `*-last` (vista/módulo/panel para Continuar), `*-theme`.
- Barra de progreso: módulos done / total + meta (mini-checks + último quiz %).
- **Continuar:** botón en Inicio restaura `*-last` (vista + módulo o modo de quiz).
- Modo **Estudio** (default): feedback inmediato + explain. Modo **Examen**: oculta explains hasta terminar; nota final + lista de falladas con salto a pregunta y módulo. Modo **Solo falladas** + filtros por `.qtag`. Paginación 1 / 5 / Todas.
- Aprende: mini-TOC intra-módulo (`h3` / `.trade`), links a Animaciones, Modo lectura. Animaciones: link de vuelta a Aprende. Cheatsheet: CTA Imprimir/PDF.

## 11. QA checklist (rúbrica de aceptación)

- [ ] ¿Cada número del paper está con su unidad y contexto (1212 reads/s con 1KB/64KB, 0.0047% horas, 2³⁴ con 128MB)?
- [ ] ¿Cada figura/tabla del paper tiene animación o pregunta?
- [ ] ¿Todos los trade-offs están numerados y referenciados en quiz?
- [ ] ¿Nombres de variables/funciones son del dominio, sin copy-paste?
- [ ] ¿Citas literales en EN + traducción ES, con § y página?
- [ ] ¿Quiz tiene 40% trade-off + 10% numérica + distractores = errores reales?
- [ ] ¿Casos tienen solución en 3 partes + rúbrica?
- [ ] ¿Funciona offline en 1 archivo, dark/light, móvil?
- [ ] **Cobertura 100%:** ¿cada sección del paper (§1…§N + related work) tiene módulo o bloque de clase, y el quiz falla por estudio — no por contenido ausente?
- [ ] **Tip bubbles:** ¿hover/tap sobre términos del glosario muestra burbuja con la misma definición?

## 12. Prompt de generación (pegar a la IA)

> Genera un único `.html` offline siguiendo `SISTEMA_HTML_ESTUDIO.md` §§2-10 a partir de `PAPER.pdf` + `RESUMEN.md`. **Piloto de cobertura:** módulos suficientes para enseñar el 100% del paper (related work incluido); citas EN §+pág + traducción ES + trade-off numerado + error común + mini-check. Quiz que cubra todos los huecos (30/40/20/10) con `why` que re-enseñe. 6+ casos con solución en 3 partes. 5 animaciones SVG paso-a-paso con naming del dominio + 1 control interactivo. Glosario filtrable + tip bubbles (`enhanceTips`) + cheatsheet 1 página. Tokens y componentes de §3. Verifica checklist §11 y reporta gaps. Referencia: `papers/bigtable/bigtable_app.html`.
