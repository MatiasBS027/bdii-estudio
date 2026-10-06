/**
 * Transform bigtable skeleton → MongoDB Study-desk (BDII NoSQL / MongoDB).
 */
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'mongo_app.html');
let html = fs.readFileSync(file, 'utf8');

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

must('Bigtable · BDII Estudio — Distributed Storage for Structured Data',
  'MongoDB · BDII Estudio — NoSQL / MongoDB', 'title');
must('href="../../index.html"', 'href="../index.html"', 'hub');
must('<div class="logo">B</div><div><div>Bigtable</div>\n        <small>BDII Estudio · Distributed Storage for Structured Data</small></div></div>',
  '<div class="logo">M</div><div><div>MongoDB</div>\n        <small>BDII Estudio · NoSQL / MongoDB</small></div></div>', 'brand');
must("const PAPER_SHUFFLE_ID = 'bigtable';", "const PAPER_SHUFFLE_ID = 'mongo';", 'shuffle id');
html = html.replace(/bigtable-/g, 'mongo-');
html = html.replace(/Dominas Bigtable/g, 'Dominas MongoDB');
html = html.replace(/Aprende Bigtable/g, 'Aprende MongoDB');
console.log('OK storage prefix + strings');

const inicioStart = html.indexOf('<section id="view-inicio"');
const aprendeStart = html.indexOf('<section id="view-aprende"');
if (inicioStart < 0 || aprendeStart < 0) { console.error('inicio markers'); process.exit(1); }
const inicioHTML = `<section id="view-inicio" class="view active">
  <div class="hero">
    <div>
      <p class="dateline">Apuntes de estudio · Basado en <cite>NoSQL — MongoDB</cite> (PDF curso BDII) · Notion Semanas 6–8</p>
      <h1 class="title">Base de datos <em>orientada a documentos</em> que escala en clúster</h1>
      <p class="lede">MongoDB combina <strong>documentos BSON</strong>, <strong>replica sets</strong> (oplog + elecciones) y <strong>sharding</strong> (chunks, shard key, config servers, <code>mongos</code>) con un modelo más flexible que el relacional clásico.</p>
      <p>Esta app cubre CAP/BASE, CRUD, índices B+, réplicas, fragmentación y trade-offs frente a RDBMS — con citas EN del material del curso, tips, animaciones y casos.</p>
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
      <div class="card accent-blue" style="margin:0;"><div class="kicker">No es RDBMS</div><p style="margin:6px 0 0; font-size:14.5px;">Esquema dinámico, API de consulta, sin joins ni transacciones multi-documento clásicas. Escala <strong>out</strong> con shards.</p></div>
      <div class="card accent-teal" style="margin:0;"><div class="kicker">La idea central en 1 línea</div><p style="margin:6px 0 0; font-size:14.5px;">Colecciones de documentos BSON · primary en replica set · oplog replica writes · <strong>mongos</strong> enruta por shard key.</p></div>
    </div>
  </div>
  <div class="stat-grid">
    <div class="stat"><div class="n">CAP</div><div class="l">Consistencia vs disponibilidad bajo partición</div></div>
    <div class="stat"><div class="n">≥3</div><div class="l">nodos típicos en replica set</div></div>
    <div class="stat"><div class="n">BSON</div><div class="l">JSON binario + tipos extra</div></div>
    <div class="stat"><div class="n">mongos</div><div class="l">router de consultas al shard</div></div>
  </div>
  <h2>¿Cómo usar esta app?</h2>
  <p class="lede">Tres pasos, en orden. Cada uno prepara el siguiente.</p>
  <ol class="path">
    <li><button class="path-step" onclick="go('aprende')"><span class="path-n">01</span><span><span class="path-t">Aprende</span><span class="path-d">8 módulos (PDF + apuntes BDII). Hover en términos del glosario.</span></span></button></li>
    <li><button class="path-step" onclick="go('animaciones')"><span class="path-n">02</span><span><span class="path-t">Animaciones</span><span class="path-d">BSON, índices, replica set, oplog, sharding y mongos.</span></span></button></li>
    <li><button class="path-step" onclick="go('quiz')"><span class="path-n">03</span><span><span class="path-t">Quiz y casos</span><span class="path-d">~30 preguntas sobre CAP, CRUD, réplicas, sharding + casos prácticos.</span></span></button></li>
  </ol>
</section>
`;
html = html.slice(0, inicioStart) + inicioHTML + html.slice(aprendeStart);
console.log('OK inicio');

const mStart = html.indexOf('const MODULES = [');
const tipStart = html.indexOf('/* ---- Glossary tip bubbles ---- */');
if (mStart < 0 || tipStart < 0) { console.error('markers'); process.exit(1); }
const data = fs.readFileSync(path.join(__dirname, '_mongo_data.js'), 'utf8');
html = html.slice(0, mStart) + data + '\n' + html.slice(tipStart);
console.log('OK data injected');

const aliasStart = html.indexOf('const aliases = {');
const aliasEnd = html.indexOf('Object.keys(aliases)', aliasStart);
if (aliasStart > 0 && aliasEnd > aliasStart) {
  const newAliases = `const aliases = {
    'mongodb':'MongoDB', 'mongo db':'MongoDB', 'mongo':'MongoDB',
    'bson':'BSON', 'json':'JSON',
    'replica set':'Replica set', 'replicaset':'Replica set', 'replset':'Replica set',
    'oplog':'Oplog', 'primary':'Primary', 'secondary':'Secondary',
    'election':'Elección', 'elecciones':'Elección',
    'sharding':'Sharding', 'shard':'Shard', 'shards':'Shard',
    'shard key':'Shard key', 'chunk':'Chunk', 'chunks':'Chunk',
    'mongos':'mongos', 'config server':'Config server', 'config servers':'Config server',
    'cap':'Teorema CAP', 'teorema cap':'Teorema CAP', 'base':'BASE',
    'acid':'ACID', 'crud':'CRUD',
    'índice':'Índice B+', 'indice':'Índice B+', 'índices':'Índice B+',
    'sparse':'Índice sparse', 'compound index':'Índice compuesto',
    'collection':'Colección', 'document':'Documento', '_id':'_id',
    'write concern':'Write concern', 'read preference':'Read preference'
  };
  `;
  html = html.slice(0, aliasStart) + newAliases + html.slice(aliasEnd);
  console.log('OK aliases');
}

mustRe(/const MODULE_ANIMS = \{[\s\S]*?const QUIZ_MODULE_HINT = \{[\s\S]*?\};\n/,
`const MODULE_ANIMS = {
  m1: [{id:'anim-bson', label:'Documento BSON'}],
  m3: [{id:'anim-index', label:'Índice B+'}],
  m4: [{id:'anim-replica', label:'Replica set + elección'}],
  m5: [{id:'anim-oplog', label:'Oplog'}, {id:'anim-shard', label:'Sharding + mongos'}],
  m6: [{id:'anim-shard', label:'Config servers + mongos'}]
};
const QUIZ_MODULE_HINT = {
  'CAP':'m0', 'BASE':'m0', 'BSON':'m1', 'Documento':'m1', 'CRUD':'m2', 'Consulta':'m2',
  'Índice':'m3', 'Indice':'m3', 'Replica':'m4', 'Oplog':'m5', 'Election':'m4', 'Elección':'m4',
  'Sharding':'m5', 'Chunk':'m5', 'Shard':'m5', 'mongos':'m6', 'Config':'m6',
  'trade-off':'m7', 'RDBMS':'m7', 'ACID':'m7', 'NoSQL':'m0'
};
`, 'MODULE_ANIMS');

must('animWebtable.init(); animLocate.init(); animServe.init(); animRecovery.init(); animRead.init();',
  'animBSON.init(); animIndex.init(); animReplica.init(); animOplog.init(); animShard.init();', 'initAnims');

const animViewStart = html.indexOf('<section id="view-animaciones"');
const animViewEnd = html.indexOf('<section id="view-quiz"');
const animHTML = `<section id="view-animaciones" class="view">
  <span class="kicker">Laboratorio visual</span>
  <h2>Animaciones interactivas</h2>
  <p class="lede">Modelo documento, índices, réplicas, oplog, sharding y enrutamiento. Cada animación tiene play/paso y narrador.</p>
  <div class="card accent-blue" id="anim-bson"><h3>1 · Documento BSON en una colección</h3>
    <p style="font-size:14px;">JSON binario: <code>_id</code> reservado, campos anidados y tipos extra (Date, ObjectId…).</p>
    <div class="controls"><button class="btn small" onclick="animBSON.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animBSON.play()">Reproducir</button><button class="btn small ghost" onclick="animBSON.reset()">Reiniciar</button></div>
    <figure><svg id="svgGraph" viewBox="0 0 720 340" role="img"></svg><figcaption>BSON · <span id="graphCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m1')">Leer en Aprende → Módulo 1</button></p></div>
  <div class="card accent-purple" id="anim-index"><h3>2 · Índice B+ acelera find()</h3>
    <p style="font-size:14px;">Índice en <code>email</code>: de collection scan a pocas entradas del árbol.</p>
    <div class="controls"><button class="btn small" onclick="animIndex.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animIndex.play()">Reproducir</button><button class="btn small ghost" onclick="animIndex.reset()">Reiniciar</button></div>
    <figure><svg id="svgCheck" viewBox="0 0 720 360" role="img"></svg><figcaption>Índice · <span id="checkCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m3')">Leer en Aprende → Módulo 3</button></p></div>
  <div class="card accent-teal" id="anim-replica"><h3>3 · Replica set: primary, secondaries, elección</h3>
    <p style="font-size:14px;">Solo el primary acepta writes; fallo → votación promueve un secondary.</p>
    <div class="controls"><button class="btn small" onclick="animReplica.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animReplica.play()">Reproducir</button><button class="btn small ghost" onclick="animReplica.reset()">Reiniciar</button></div>
    <figure><svg id="svgEnemy" viewBox="0 0 720 300" role="img"></svg><figcaption>Replica set · <span id="enemyCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m4')">Leer en Aprende → Módulo 4</button></p></div>
  <div class="card accent-orange" id="anim-oplog"><h3>4 · Oplog: réplica de operaciones</h3>
    <p style="font-size:14px;">Colección capped en el primary; secondaries tailed y aplican operaciones.</p>
    <div class="controls"><button class="btn small" onclick="animOplog.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animOplog.play()">Reproducir</button><button class="btn small ghost" onclick="animOplog.reset()">Reiniciar</button></div>
    <figure><svg id="svgZookie" viewBox="0 0 720 340" role="img"></svg><figcaption>Oplog · <span id="zookieCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m5')">Leer en Aprende → Módulo 5</button></p></div>
  <div class="card accent-gold" id="anim-shard"><h3>5 · Sharding, chunks, config servers y mongos</h3>
    <p style="font-size:14px;">Shard key → chunks → shards; <strong>mongos</strong> lee metadata en config servers y enruta la consulta.</p>
    <div class="controls"><button class="btn small" onclick="animShard.step()">Siguiente paso →</button><button class="btn small ghost" onclick="animShard.play()">Reproducir</button><button class="btn small ghost" onclick="animShard.reset()">Reiniciar</button></div>
    <figure><svg id="svgArch" viewBox="0 0 720 360" role="img"></svg><figcaption>Sharding · <span id="archCaption">Pulsa "Siguiente paso".</span></figcaption></figure>
    <p class="anim-learn-link"><button class="linklike" type="button" onclick="goModule('m6')">Leer en Aprende → Módulos 5–6</button></p></div>
</section>
`;
html = html.slice(0, animViewStart) + animHTML + html.slice(animViewEnd);
console.log('OK anim HTML');

const animJsStart = html.indexOf('const animWebtable = ');
const bootMarker = "renderModuleNav(); renderModule(); renderCases(); renderGlossary(''); updateProgress(); updateContinueCard();";
const bootStart = html.indexOf(bootMarker);
if (animJsStart < 0 || bootStart < 0) { console.error('anim js markers', { animJsStart, bootStart }); process.exit(1); }
const animJs = fs.readFileSync(path.join(__dirname, '_mongo_anims.js'), 'utf8');
html = html.slice(0, animJsStart) + animJs + '\n' + html.slice(bootStart);
console.log('OK anim JS');

html = html.replace('Aprende Bigtable desde cero', 'Aprende MongoDB desde cero');
html = html.replace(/Sigue los módulos en orden\.[^<]*/, 'Sigue los módulos en orden. Fuente: PDF NoSQL-MongoDB + apuntes Notion (Semanas 6–8). Términos subrayados abren el glosario.');
html = html.replace(/Herramienta de estudio sobre "Bigtable[^"]*"/, 'Herramienta de estudio sobre MongoDB (PDF curso BDII y apuntes Semanas 6–8)');
html = html.replace(/placeholder="Filtra por término[^"]*"/, 'placeholder="Filtra por término (ej: oplog, shard key, BSON)…"');
html = html.replace(/Misma fuente que las burbujas del Aprende\. Escribe para filtrar[^<]*/, 'Misma fuente que las burbujas del Aprende. Escribe para filtrar (ej: oplog, mongos, CAP).');
html = html.replace('Módulos 0/9', 'Módulos 0/8');

fs.writeFileSync(file, html, 'utf8');
console.log('Wrote', file, Buffer.byteLength(html));
