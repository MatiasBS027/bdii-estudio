# BDII Estudio

Hub estático para estudiar Bases de Datos II: papers (GFS, Bigtable, Aurora, Zanzibar) + Contenerización.

Estilo: **Study-desk editorial** (hub, papers y Contenerización). Sin backend; progreso en `localStorage`.

## Abrir en local

1. Abrí [`index.html`](index.html) en el navegador (doble clic), **o**
2. Serví la carpeta (recomendado para Contenerización, que carga CSS/JS relativos):

```bash
npx --yes serve .
```

Luego entrá a la URL que imprima (p. ej. `http://localhost:3000`).

## GitHub Pages

1. Creá un repo público (p. ej. `bdii-estudio`) y subí esta carpeta como raíz.
2. En el repo: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Branch: `main` (o `master`), folder: `/` (root).
4. La URL queda: `https://<tu-usuario>.github.io/bdii-estudio/`

Hay un archivo `.nojekyll` para que GitHub no procese el sitio con Jekyll. El hub incluye `noindex` para que no aparezca fácil en buscadores.

**Nota:** en cuenta personal, aunque el repo sea privado, el sitio de Pages sigue siendo **público** en internet (salvo Enterprise Cloud con Pages privado).

## Estructura

```
index.html                 # hub
papers/gfs|bigtable|aurora|zanzibar/
contenerizacion/           # Docker → K8s (Study-desk, layout dock)
SISTEMA_HTML_ESTUDIO.md    # spec para generar papers nuevos
```

## Añadir un paper nuevo

1. Generá un HTML siguiendo [`SISTEMA_HTML_ESTUDIO.md`](SISTEMA_HTML_ESTUDIO.md) (6 vistas, quiz, offline).
2. Guardalo en `papers/<slug>/<slug>_app.html`.
3. Añadí una card en `index.html` apuntando a esa ruta.
4. Incluí el botón `← Hub` con `href="../../index.html"`.
5. Commit + push → Pages se actualiza solo.

## Qué no va en este repo

PDFs de papers con copyright, datos personales y backups `*.bak`. Esos se quedan fuera de la carpeta publicada.
