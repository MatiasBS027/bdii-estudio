/**
 * Transform bigtable skeleton → Redis Study-desk (Architecture Notes / Redis Explained).
 *
 * NOTE: redis_app.html is now the source of truth (enriched coverage). Running this
 * against the current redis_app.html will DESTROY that content unless you first
 * restore from papers/bigtable/bigtable_app.html. Prefer editing redis_app.html directly.
 */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'redis_app.html');
let html = fs.readFileSync(file, 'utf8');
if (html.includes("PAPER_SHUFFLE_ID = 'redis'") && !process.env.REDIS_FORCE_REBUILD) {
  console.error('Refusing: redis_app.html already built. Set REDIS_FORCE_REBUILD=1 after restoring Bigtable skeleton if you really mean it.');
  process.exit(2);
}

function must(oldStr, newStr, label) {
  if (!html.includes(oldStr)) { console.error('FAIL', label); process.exit(1); }
  html = html.replace(oldStr, newStr);
  console.log('OK', label);
}

function mustRe(re, newStr, label) {
  if (!re.test(html)) { console.error('FAIL', label); process.exit(1); }
  html = html.replace(re, newStr);
  console.log('OK', label);
}

// Branding + hub
must('Bigtable · BDII Estudio — Distributed Storage for Structured Data',
  'Redis · BDII Estudio — Architecture Notes / Redis Explained', 'title');
must('href="../../index.html"', 'href="../index.html"', 'hub');
must('<div class="logo">B</div><div><div>Bigtable</div>\n        <small>BDII Estudio · Distributed Storage for Structured Data</small></div></div>',
  '<div class="logo">R</div><div><div>Redis</div>\n        <small>BDII Estudio · Architecture Notes · Redis Explained</small></div></div>', 'brand');
must("const PAPER_SHUFFLE_ID = 'bigtable';", "const PAPER_SHUFFLE_ID = 'redis';", 'shuffle id');
html = html.replace(/bigtable-/g, 'redis-');
html = html.replace(/Dominas Bigtable/g, 'Dominas Redis');
html = html.replace(/Aprende Bigtable/g, 'Aprende Redis');
console.log('OK storage prefix + strings');

// Full Inicio section
const inicioStart = html.indexOf('<section id="view-inicio"');
const aprendeStart = html.indexOf('<section id="view-aprende"');
if (inicioStart < 0 || aprendeStart < 0) { console.error('inicio markers'); process.exit(1); }
const inicioHTML = `<section id="view-inicio" class="view active">
  <div class="hero">
    <div>
      <p class="dateline">Apuntes de estudio · Basado en <cite>Redis Explained</cite> · Architecture Notes (Mahdi Yusuf) · PDF curso BDII</p>
      <h1 class="title">Un servidor de <em>estructuras de datos</em> en memoria</h1>
      <p class="lede">Redis es más que un caché: un <strong>data structure server</strong> con topologías Single / HA / Sentinel / Cluster y persistencia RDB/AOF opcional.</p>
      <p>Esta app cubre Architecture Notes + el PDF del curso: Memcached vs Redis, replicación (ID + offset), quorum Sentinel, 16K hashslots, fork/COW — con citas EN, tips, animaciones y casos.</p>
      <div class="hero-cta">
        <button class="btn" onclick="go('aprende')">Comenzar a aprender →</button>
        <button class="linklike" onclick="go('quiz')">Ir directo al quiz →</button>
      </div>
      <div class="continue-card" id="continueCard" hidden>
        <div>
          <div class="cc-label">Continuar</div>
          <div class="cc-detail" id="continueDetail"></div>
        </div>
        <button class="btn teal small" id="continueBtn" type="button">Seguir donde lo dejé →</button>
      </div>
    </div>
    <div class="hero-cards">
      <div class="card accent-blue" style="margin:0;"><div class="kicker">No solo caché</div><p style="margin:6px 0 0; font-size:14.5px;">Strings, hashes, lists, sets, sorted sets + pub/sub, colas y HA. Speed first; durabilidad configurable.</p></div>
      <div class="card accent-teal" style="margin:0;"><div class="kicker">La idea central en 1 línea</div><p style="margin:6px 0 0; font-size:14.5px;">Memoria primero; réplicas async; Cluster reparte <strong>16384 hashslots</strong>; Sentinel vota failover con quorum.</p></div>
    </div>
  </div>
  <div class="stat-grid">
    <div class="stat"><div class="n">16K</div><div class="l">hashslots en Redis Cluster</div></div>
    <div class="stat"><div class="n">≥3</div><div class="l">Sentinels recomendados (quorum 2)</div></div>
    <div class="stat"><div class="n">RDB</div><div class="l">snapshots · AOF = log de writes</div></div>
    <div class="stat"><div class="n">COW</div><div class="l">fork + copy-on-write al persistir</div></div>
  </div>
  <h2>¿Cómo usar esta app?</h2>
  <p class="lede">Tres pasos, en orden. Cada uno prepara el siguiente.</p>
  <ol class="path">
    <li><button class="path-step" onclick="go('aprende')"><span class="path-n">01</span><span><span class="path-t">Aprende</span><span class="path-d">7 módulos (Architecture Notes + PDF). Hover en términos del glosario.</span></span></button></li>
    <li><button class="path-step" onclick="go('animaciones')"><span class="path-n">02</span><span><span class="path-t">Animaciones</span><span class="path-d">Single, HA, Sentinel, Cluster hashslots y fork/COW.</span></span></button></li>
    <li><button class="path-step" onclick="go('quiz')"><span class="path-n">03</span><span><span class="path-t">Quiz y casos</span><span class="path-d">Preguntas sobre topologías, Sentinel, Cluster y persistencia + casos prácticos.</span></span></button></li>
  </ol>
</section>
`;
html = html.slice(0, inicioStart) + inicioHTML + html.slice(aprendeStart);
console.log('OK inicio');

// Replace MODULES ... CHEATSHEET block
const mStart = html.indexOf('const MODULES = [');
const tipStart = html.indexOf('/* ---- Glossary tip bubbles ---- */');
if (mStart < 0 || tipStart < 0) { console.error('markers'); process.exit(1); }
const data = fs.readFileSync(path.join(__dirname, '_redis_data.js'), 'utf8');
html = html.slice(0, mStart) + data + '\n' + html.slice(tipStart);
console.log('OK data injected');

// Tip aliases for Redis
const aliasStart = html.indexOf('const aliases = {');
const aliasEnd = html.indexOf('Object.keys(aliases)', aliasStart);
if (aliasStart > 0 && aliasEnd > aliasStart) {
  const newAliases = `const aliases = {
    'redis':'Redis', 'rdb':'RDB', 'aof':'AOF',
    'sentinel':'Redis Sentinel', 'redis sentinel':'Redis Sentinel',
    'redis cluster':'Redis Cluster', 'cluster':'Redis Cluster',
    'hashslot':'Hashslot', 'hashslots':'Hashslot', 'hash slot':'Hashslot',
    'replication id':'Replication ID', 'offset':'Offset de replicación',
    'quorum':'Quorum', 'gossip':'Gossiping', 'gossiping':'Gossiping',
    'split brain':'Split brain', 'fork':'Fork', 'copy-on-write':'Copy-on-write', 'cow':'Copy-on-write',
    'fsync':'fsync', 'memcached':'Memcached',
    'primary':'Primary', 'replica':'Replica', 'secondary':'Replica',
    'partial sync':'Sincronización parcial', 'full sync':'Sincronización completa',
    'sharding':'Sharding', 'resharding':'Resharding',
    'data structure server':'Data structure server', 'pub/sub':'Pub/Sub', 'pubsub':'Pub/Sub'
  };
  `;
  html = html.slice(0, aliasStart) + newAliases + html.slice(aliasEnd);
  console.log('OK aliases');
}

mustRe(/const MODULE_ANIMS = \{[\s\S]*?const QUIZ_MODULE_HINT = \{[\s\S]*?\};\n/,
`const MODULE_ANIMS = {
  m2: [{id:'anim-single', label:'Instancia única + persistencia'}],
  m3: [{id:'anim-ha', label:'HA / replicación'}],
  m4: [{id:'anim-sentinel', label:'Sentinel + quorum'}],
  m5: [{id:'anim-cluster', label:'Cluster hashslots'}],
  m6: [{id:'anim-fork', label:'Fork + copy-on-write'}]
};
const QUIZ_MODULE_HINT = {
  'Intro':'m0', 'Memcached':'m1', 'Single':'m2', 'HA':'m3', 'Replicación':'m3',
  'Sentinel':'m4', 'Cluster':'m5', 'Persistencia':'m6', 'trade-off':'m6', 'Fork':'m6'
};
`, 'MODULE_ANIMS');

must('animWebtable.init(); animLocate.init(); animServe.init(); animRecovery.init(); animRead.init();',
  'animSingle.init(); animHA.init(); animSentinel.init(); animCluster.init(); animFork.init();', 'initAnims');

// Anim HTML section
const animViewStart = html.indexOf('<section id="view-animaciones"');
const animViewEnd = html.indexOf('<section id="view-quiz"');
const animHTML = `<section id="view-animaciones" class="view">
  <span class="kicker">Laboratorio visual</span>
  <h2>Animaciones interactivas</h2>
  <p class="lede">Topologías y persistencia de Redis. Cada animación tiene play/paso y narrador.</p>
  <div class="card accent-blue" id="anim-single"><h3>1 · Instancia única: memoria → RDB/AOF</h3>
    <p style="font-size:14px;">Comando en memoria; fork escribe snapshot o AOF.</p>
    <div class="controls"><button class="btn small" onclick="animSingle.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animSingle.play()">Reproducir</button><button class="btn small ghost" onclick="animSingle.reset()">Reiniciar</button></div>
    <figure><svg id="svgGraph" viewBox="0 0 720 340" role="img"></svg><figcaption>Single · <span id="graphCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m2')">Leer en Aprende → Módulo 2</button></p></div>
  <div class="card accent-purple" id="anim-ha"><h3>2 · HA: replication ID + offset</h3>
    <p style="font-size:14px;">Primary envía comandos; réplica hace sync parcial o full (RDB).</p>
    <div class="controls"><button class="btn small" onclick="animHA.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animHA.play()">Reproducir</button><button class="btn small ghost" onclick="animHA.reset()">Reiniciar</button></div>
    <figure><svg id="svgCheck" viewBox="0 0 720 360" role="img"></svg><figcaption>HA · <span id="checkCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m3')">Leer en Aprende → Módulo 3</button></p></div>
  <div class="card accent-teal" id="anim-sentinel"><h3>3 · Sentinel: quorum y failover</h3>
    <p style="font-size:14px;">Varios Sentinel votan; promueven un secundario a primary.</p>
    <div class="controls"><button class="btn small" onclick="animSentinel.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animSentinel.play()">Reproducir</button><button class="btn small ghost" onclick="animSentinel.reset()">Reiniciar</button></div>
    <figure><svg id="svgEnemy" viewBox="0 0 720 300" role="img"></svg><figcaption>Sentinel · <span id="enemyCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m4')">Leer en Aprende → Módulo 4</button></p></div>
  <div class="card accent-orange" id="anim-cluster"><h3>4 · Cluster: 16K hashslots y reshard</h3>
    <p style="font-size:14px;">Clave → hashslot → shard; al añadir M3 se mueven slots, no se rehashea cada key.</p>
    <div class="controls"><button class="btn small" onclick="animCluster.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animCluster.play()">Reproducir</button><button class="btn small ghost" onclick="animCluster.reset()">Reiniciar</button></div>
    <figure><svg id="svgZookie" viewBox="0 0 720 340" role="img"></svg><figcaption>Cluster · <span id="zookieCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m5')">Leer en Aprende → Módulo 5</button></p></div>
  <div class="card accent-gold" id="anim-fork"><h3>5 · Fork + copy-on-write</h3>
    <p style="font-size:14px;">El hijo ve un snapshot; el padre escribe páginas nuevas (COW).</p>
    <div class="controls"><button class="btn small" onclick="animFork.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animFork.play()">Reproducir</button><button class="btn small ghost" onclick="animFork.reset()">Reiniciar</button></div>
    <figure><svg id="svgArch" viewBox="0 0 720 360" role="img"></svg><figcaption>Fork · <span id="archCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m6')">Leer en Aprende → Módulo 6</button></p></div>
</section>
`;
html = html.slice(0, animViewStart) + animHTML + html.slice(animViewEnd);
console.log('OK anim HTML');

// Replace animation JS objects — unique boot line (not resumeStudy's renderModuleNav)
const animJsStart = html.indexOf('const animWebtable = ');
const bootMarker = "renderModuleNav(); renderModule(); renderCases(); renderGlossary(''); updateProgress(); updateContinueCard();";
const bootStart = html.indexOf(bootMarker);
if (animJsStart < 0 || bootStart < 0 || bootStart < animJsStart) { console.error('anim js markers', animJsStart, bootStart); process.exit(1); }
const animJs = fs.readFileSync(path.join(__dirname, '_redis_anims.js'), 'utf8');
html = html.slice(0, animJsStart) + animJs + '\n' + html.slice(bootStart);
console.log('OK anim JS');

html = html.replace('Aprende Bigtable desde cero', 'Aprende Redis desde cero');
html = html.replace(/Sigue los módulos en orden\.[^<]*/, 'Sigue los módulos en orden. Fuente: Architecture Notes (Redis Explained) + PDF del curso. Términos subrayados abren el glosario.');
html = html.replace(/Herramienta de estudio sobre "Bigtable[^"]*"/, 'Herramienta de estudio sobre Redis Explained (Architecture Notes) y el PDF del curso BDII');
html = html.replace(/placeholder="Filtra por término[^"]*"/, 'placeholder="Filtra por término (ej: sentinel, hashslot, AOF)…"');
html = html.replace(/Misma fuente que las burbujas del Aprende\. Escribe para filtrar[^<]*/, 'Misma fuente que las burbujas del Aprende. Escribe para filtrar (ej: Sentinel, RDB, quorum).');
html = html.replace('Módulos 0/9', 'Módulos 0/7');

fs.writeFileSync(file, html, 'utf8');
console.log('Wrote', file, Buffer.byteLength(html));
