# LECCIONES_ERRORES.md — Error log y anti-patrones

> Errores reales ocurridos en el proyecto (Bigtable → GFS). Cada ítem: **síntoma → causa → prevención → cómo verificar**.
> Flujo general: [`FLUJO_PAPER_NUEVO.md`](FLUJO_PAPER_NUEVO.md). Spec: [`../SISTEMA_HTML_ESTUDIO.md`](../SISTEMA_HTML_ESTUDIO.md).

Comando base para verificación (PowerShell, desde la raíz del repo):

```powershell
Set-Location "C:\Universidad\TEC_No_Git\IV Semestre\BDII\bdii-estudio"
```

## Verificación rápida de sintaxis JS (antes de cada commit)

Extraer el `<script>` principal y parsearlo con Node (detecta cosas como el bug de `escapeRe`):

```powershell
node -e "const fs=require('fs');const h=fs.readFileSync('papers/<id>/<id>_app.html','utf8');const m=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)];m.forEach((x,i)=>{try{new Function(x[1]);console.log('script',i,'OK')}catch(e){console.log('script',i,'ERROR',e.message)}})"
```

Además: abrir la página, consola del navegador **sin errores rojos**, y probar hover en un término del glosario.

---

## 1. `escapeRe` corrupto (tips del glosario rotos en silencio)

- **Síntoma:** las burbujas del glosario no aparecían; sin error visible.
- **Causa:** al editar con reemplazo de strings, el reemplazo `'\\$&'` se sustituyó por código JS inyectado (`\\const $ = ...`). La regex quedó inválida/incorrecta y el `try/catch` o el flujo lo ocultó.
- **Prevención:** `escapeRe` debe ser exactamente:
  ```js
  function escapeRe(s){ return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  ```
  En PowerShell, `$&` y `$` dentro de comillas dobles/herestrings se **interpolan**: al parchear archivos con scripts usar herestring literal `@'...'@` o, mejor, editar con la herramienta del editor, no con `-replace` con `$`.
- **Verificar:** `rg -n "function escapeRe" papers` → la línea debe terminar en `'\\$&'); }`. Parse de JS (arriba). Hover en un término con carácter especial (p. ej. `C++`, `(x)`).

## 2. Todas las respuestas correctas en la opción B

- **Síntoma:** en el quiz la respuesta correcta era siempre el slot B → se adivina sin estudiar.
- **Causa:** datos escritos con `a: 1` y UI que mostraba el orden de `opts` tal cual.
- **Prevención:** barajar al **renderizar** con Fisher–Yates **sembrado** por pregunta (`prepareShuffledMCQ(opts, a, PAPER_SHUFFLE_ID+'|quiz|'+i)`), determinista para que el orden sea estable entre recargas. Nunca asumir/hardcodear el índice correcto en el orden mostrado; los datos pueden quedar con cualquier `a`.
- **Verificar:** abrir el quiz y recorrer ~10 preguntas: la correcta varía de posición. Misma pregunta tras recargar = mismo orden.

## 3. Mini-check se reinicia al marcar módulo como hecho

- **Síntoma:** respondías el mini-check, pulsabas "Marcar hecho" y la respuesta desaparecía.
- **Causa:** `markDone` re-renderizaba el módulo y el estado vivía solo en el DOM.
- **Prevención:** persistir en `<id>-mini` (`saveMiniAnswer`) y **re-aplicar** en cada `renderModule()`.
- **Verificar:** responder mini-check → marcar hecho → desmarcar → recargar: la respuesta (y su feedback) sigue.

## 4. `th` sticky + términos con tip dentro de tablas → solape

- **Síntoma:** en la tabla de related work, la fila "DHTs" se montaba sobre los encabezados.
- **Causa:** `th { position: sticky; top: 78px }` + `enhanceTips` envolviendo términos dentro de celdas (altura/stacking cambian).
- **Prevención:** **sin sticky `th`** en tablas de módulos; `enhanceTips` debe **saltar** `table` (y `code`, `pre`, `a`, `button`).
- **Verificar:** `rg -n "sticky" papers/<id>/<id>_app.html` → ningún `th` sticky; scroll por el módulo de related work sin solapes en dark y light.

## 5. Boot pisa "Continuar"

- **Síntoma:** al abrir la página, "Continuar" siempre apuntaba a Aprende/módulo 1.
- **Causa:** `renderModule()` llamaba `saveLastView('aprende')` en cada carga (incluido el boot).
- **Prevención:** `saveLastView` **solo** en navegación intencional (click en tab, módulo, modo de quiz, marcar hecho). El render inicial **lee** `*-last`, no lo escribe.
- **Verificar:** navegar a Quiz → recargar → "Continuar" lleva a Quiz. `rg -n "saveLastView" ` y revisar que ninguna llamada esté en el camino de boot.

## 6. Emojis decorativos y columna estrecha ("se siente AI")

- **Síntoma:** UI percibida como genérica/IA; columna de lectura angosta.
- **Prevención:** estilo **Study-desk**: medida de lectura más ancha, **sin emojis decorativos**, tema **Claro/Oscuro** con etiquetas de texto. (El `⚖️` del `.trade` en la spec heredada es la única excepción histórica; en papers nuevos preferir "Trade-off N" en texto.)
- **Verificar:** revisar visualmente en 1280px y móvil; `rg -n "[\u{1F300}-\u{1FAFF}]" papers/<id>/<id>_app.html` (PCRE2: `rg -P`) y justificar cada hit.

## 7. Contenido "se siente incompleto" vs resumen/PDF

- **Síntoma:** módulos no cubrían todo lo del PDF/resumen; el quiz fallaba por contenido ausente.
- **Prevención:** barra = **100% de cobertura** (§1…§N, related work, evaluación). Formato: **cita EN + §+página + enseñanza ES**. Usar el quiz como **detector de huecos**: si una pregunta del PDF no se puede responder con el HTML, falta contenido.
- **Verificar:** tabla sección-del-PDF → módulo; figuras/tablas → animación o pregunta; números con unidad. Ver DoD #1–2.

## 8. Contrastes Redis / RDBMS atribuidos al paper

- **Síntoma:** parecía que el paper de 2006 hablaba de Redis.
- **Causa:** mezclar analogías de clase con citas.
- **Prevención:** etiquetar explícitamente **"Didáctico / clase"** vs **"Cita del paper"**; usar análogos honestos (bases de datos main-memory) y no inventar citas. Redis no está en el paper.
- **Verificar:** todo bloque con Redis/RDBMS/SQL tiene label didáctico y ninguna `callout info "Cita del paper"` lo contiene.

## 9. Windows PowerShell: sintaxis y commits

- **Síntoma:** `&&` falla; heredocs de bash rotos; mensajes de commit mal formados.
- **Prevención:** usar `;` o líneas separadas; `Set-Location "<ruta>"`; commits multilínea con herestring:
  ```powershell
  git commit -m @"
  Titulo

  Cuerpo
  "@
  ```
  (el cierre `"@` va al inicio de línea). Sin `<<EOF`. Para rutas con espacios, siempre entre comillas.
- **Verificar:** `git log -1 --format=%B` muestra título + cuerpo íntegros.

## 10. Mito: "repo privado ⇒ GitHub Pages privado"

- **Hecho:** en cuenta personal, el sitio de Pages es **público** aunque el repo sea privado (salvo Enterprise Cloud con Pages privado). Pages no depende de que el repo sea público en todos los planes.
- **Prevención:** no subir PDFs con copyright ni datos personales; el hub lleva `noindex` pero no es un control de acceso.
- **Verificar:** abrir la URL de Pages en ventana de incógnito.

## 11. Push a `main` requiere aprobación explícita (Cursor smart mode)

- **Síntoma:** `git push origin main` bloqueado por el modo inteligente.
- **Prevención:** hacer **commit local primero**, luego pedir aprobación del push (no usar force, no tocar `git config`). Reportar al usuario si queda pendiente.
- **Verificar:** `git status -sb` → `## main...origin/main` sin `[ahead N]` tras el push.

## 12. Portar UX entre papers copiando datos del origen

- **Síntoma:** en GFS aparecían animaciones/ids de Bigtable o claves compartidas.
- **Prevención:** al portar, **remapear**: `MODULE_ANIMS` a ids de animaciones del paper destino, `PAPER_SHUFFLE_ID`, prefijo `localStorage`, `QUIZ_MODULE_HINT`. No copiar `MODULE_ANIMS` literal.
- **Verificar:**
  ```powershell
  rg -n -i "bigtable" papers/gfs/gfs_app.html      # esperado: 0 (o solo menciones didácticas)
  rg -n "localStorage|Item\('" papers/<id>/<id>_app.html   # todas con prefijo <id>-
  ```

## 13. Quiz "repasa trade-offs" no accionable

- **Síntoma:** el resultado decía "repasa trade-offs" sin decir dónde.
- **Prevención:** persistir índices fallados (`<id>-quiz-wrong`), modo **Solo falladas**, y **links de remediación** a módulos vía `QUIZ_MODULE_HINT` / tags.
- **Verificar:** fallar a propósito 2 preguntas → lista de falladas con salto a la pregunta y al módulo; recargar → siguen en "Solo falladas".

## 14. CSS de impresión existía pero no había botón

- **Síntoma:** `@media print` listo, pero nadie podía imprimir desde la UI.
- **Prevención:** siempre botón visible **Imprimir / Guardar PDF** (`onclick="window.print()"`) en la vista Cheatsheet.
- **Verificar:** `rg -n "window.print" papers/<id>/<id>_app.html`; vista previa de impresión = 1 página, sin nav/header.

## 15. Build script corta anim JS en medio de `resumeStudy`

- **Síntoma:** tras inyectar animaciones con `indexOf('renderModuleNav(); renderModule();')`, el HTML deja de parsear (`Unexpected token 'if'`). Ese string aparece **antes** en `resumeStudy`, no solo en el boot final.
- **Prevención:** usar el marcador **completo y único** del boot:
  `renderModuleNav(); renderModule(); renderCases(); renderGlossary(''); updateProgress(); updateContinueCard();`
  (ver `_build_redis.js` / `_build_mongo.js`).
- **Verificar:** `new Function(script)` OK; un solo bloque `const quiz`; fin del archivo = boot + `bootHash`.

---

## Anti-patrones resumidos (checklist de revisión antes de commit)

- [ ] JS parsea; consola limpia.
- [ ] `escapeRe` intacto (§1).
- [ ] Correcta no siempre en la misma posición (§2).
- [ ] Mini-check persiste (§3).
- [ ] Sin `th` sticky; `enhanceTips` salta `table` (§4).
- [ ] Boot no escribe `*-last` (§5).
- [ ] Sin emojis decorativos (§6).
- [ ] Cobertura 100% y quiz sin huecos (§7).
- [ ] Contrastes no-paper etiquetados (§8).
- [ ] Prefijo de storage y `PAPER_SHUFFLE_ID` correctos; `MODULE_ANIMS` propio (§12).
- [ ] Falladas persistidas + remediación (§13).
- [ ] Botón Imprimir visible (§14).
- [ ] Si hay build script de anim JS, boot marker único (§15).
