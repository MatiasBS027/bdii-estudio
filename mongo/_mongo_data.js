const MODULES = [
{ id:'m0', tag:'Módulo 0', accent:'gold', title:'CAP, BASE y NoSQL frente a ACID',
summary:'Teorema CAP, réplicas vs shards, beneficios e inconvenientes de NoSQL.',
html: `
<p class="lede">En sistemas distribuidos con muchos nodos y particiones de red, no puedes maximizar todo a la vez: entra el <strong>teorema CAP</strong> y el estilo <strong>BASE</strong> típico de muchas bases NoSQL.</p>
<div class="callout info"><div class="lbl">Apuntes BDII · Semana 6 Clase 2 (interpretación CAP)</div>Si no puedes acotar fallas, las peticiones van a cualquier servidor y exiges atender todas, entonces <strong>no puedes ser coherente</strong> (consistent) en el sentido fuerte. Siempre hay que renunciar a algo: coherencia, disponibilidad o tolerancia a partición/reconfiguración.</div>
<table><tr><th>Letra</th><th>Significado didáctico</th></tr>
<tr><td><strong>C</strong>onsistency</td><td>Todas las réplicas ven la misma versión; el cliente tiene la misma vista sin importar el nodo.</td></tr>
<tr><td><strong>A</strong>vailability</td><td>El sistema sigue operativo aunque fallen nodos.</td></tr>
<tr><td><strong>P</strong>artition tolerance</td><td>Sigue operando aunque haya partición de red (comunicación rota).</td></tr></table>
<div class="callout warn"><div class="lbl">Clase · BASE (extra didáctico)</div><strong>Basically Available, Soft state, Eventually consistent</strong> — contraste habitual con ACID en NoSQL: disponibilidad y escala primero; coherencia fuerte relajada o eventual.</div>
<p><strong>Réplica set vs sharding (visión de clase):</strong> con ~3 réplicas replicas el mismo subconjunto de datos (HA). Con sharding divides el dataset: 10M docs → 5M en un shard y 5M en otro; cada shard suele ser a su vez un replica set.</p>
<div class="trade"><b>Trade-off 0 · CAP en la práctica.</b> Ganas: escala horizontal y uptime. Pierdes: garantías ACID/SQL clásicas y consultas ad hoc fáciles.</div>
<div class="callout warn"><div class="lbl">Error común</div>Decir que MongoDB “elige CP o AP siempre”. El comportamiento depende de <strong>write concern</strong>, <strong>read concern</strong> y si hay partición; el material del curso enfatiza el marco CAP, no un solo rótulo fijo.</div>
`,
mini:{q:'Según la interpretación de clase del teorema CAP, ¿qué es imposible bajo partición?', opts:['Tener nodos','Satisfacer C, A y P a la vez sin compromiso','Usar TCP','Tener índices'], a:1, why:'CAP: no puedes maximizar los tres sin renunciar a algo.'} },
{ id:'m1', tag:'Módulo 1', accent:'blue', title:'Modelo documento y BSON',
summary:'Colecciones, documentos, _id, JSON binario y esquema dinámico.',
html: `
<p class="lede">MongoDB es una base <strong>orientada a documentos</strong>: guardas registros flexibles en colecciones, no filas rígidas de un esquema DDL único.</p>
<div class="callout info"><div class="lbl">Apuntes BDII · Semana 6</div>Document-oriented · schema-less en el servidor: almacena hashes/clave-valor que elijas. La aplicación lleva el esquema. Usa formato <strong>BSON</strong> (Binary JSON) con tipos extra. Escrito en C++; drivers en muchos lenguajes.</div>
<p><strong>BSON:</strong> JSON en binario + tipos como <code>Date</code>, <code>ObjectId</code>, <code>int64</code>. Las claves se almacenan como strings; MongoDB crea <code>_id</code> si no lo envías (campo reservado).</p>
<pre><code>{ "_id": ObjectId("…"), "name": "Ana", "tags": ["bdii","nosql"], "meta": { "campus": "TEC" } }</code></pre>
<div class="trade"><b>Trade-off 1 · Flexibilidad de esquema.</b> Ganas: evolucionar la app sin migraciones DDL constantes. Pierdes: validación menos centralizada (debes aplicarla en app o con JSON Schema / validator).</div>
<div class="callout tip"><div class="lbl">PDF curso · funcionalidad</div>Dynamic schema (no DDL), document database, secondary indexes, query API, atomic writes and fully consistent reads <em>when configured that way</em>, replica sets, horizontal scaling via sharding — <strong>no joins nor transactions</strong> (material clásico del curso; versiones modernas añaden multi-doc TX limitadas — extra, no foco del PDF).</div>
`,
mini:{q:'¿Qué es BSON?', opts:['Un protocolo de red','JSON binario con tipos adicionales','Un índice B+','Un shard key'], a:1, why:'B = Binary; extiende JSON.'} },
{ id:'m2', tag:'Módulo 2', accent:'purple', title:'CRUD y consultas',
summary:'insert/find/update/remove y proyecciones.',
html: `
<p class="lede">El acceso es por <strong>API de consulta</strong> (shell/drivers), no SQL declarativo general.</p>
<div class="callout info"><div class="lbl">Apuntes BDII · Semana 7</div>Create: <code>insertOne</code>, <code>insertMany</code>, <code>save</code>, <code>update</code> con upsert. Read: <code>find</code>, <code>findOne</code> con query y projection. Update/Delete vía <code>update</code> / <code>remove</code> (legacy) o métodos modernos equivalentes.</div>
<pre><code>db.users.insertOne({ name: "Matias", email: "m@tec.cr" })
db.users.find({ campus: "Cartago" }, { name: 1, email: 1 })
db.users.updateOne({ email: "m@tec.cr" }, { $set: { role: "student" } })</code></pre>
<p><strong>Query + projection:</strong> el filtro elige documentos; la proyección recorta campos (similar a SELECT columnas). Operadores (<code>$gt</code>, <code>$in</code>, <code>$and</code>…) componen consultas.</p>
<div class="trade"><b>Trade-off 2 · API rica vs ad hoc BI.</b> Ganas: consultas alineadas a la app. Pierdes: analítica ad hoc tipo SQL warehouse (debilidad histórica de NoSQL en clase).</div>
`,
mini:{q:'¿Qué hace la proyección en find()?', opts:['Ordena shards','Limita qué campos devuelve','Crea un índice','Elige el primary'], a:1, why:'Segundo argumento de find: shape del documento de salida.'} },
{ id:'m3', tag:'Módulo 3', accent:'teal', title:'Índices B+',
summary:'_id automático, simples, compuestos, sparse y arrays.',
html: `
<p class="lede">MongoDB usa <strong>índices B+</strong> para acelerar búsquedas; sin índice adecuado, un find puede escanear toda la colección.</p>
<div class="callout info"><div class="lbl">Apuntes BDII · Semana 7</div>Auto-index on <code>_id</code>. Users may create indexes for performance or unique values. Single-field and <strong>compound</strong> indexes — field order matters (like SQL). Indexing array fields creates separate index entries per element. <strong>Sparse</strong> index: only documents that contain the indexed field. Unique + sparse: rejects duplicate keys but allows missing field.</div>
<p><strong>Compuesto:</strong> índice <code>{ a:1, b:1 }</code> sirve bien a queries que filtran por <code>a</code> y luego <code>b</code>, no al revés en general.</p>
<div class="trade"><b>Trade-off 3 · Índices.</b> Ganas: latencia de lectura. Pierdes: espacio en disco y costo en writes (mantener árboles).</div>
<div class="callout warn"><div class="lbl">Error común</div>Crear muchos índices “por si acaso” en colecciones write-heavy — cada insert/update toca índices.</div>
`,
mini:{q:'Un índice sparse…', opts:['Solo indexa docs con el campo presente','Prohíbe _id','Reemplaza al oplog','Shard automático'], a:0, why:'Definición Semana 7.'} },
{ id:'m4', tag:'Módulo 4', accent:'orange', title:'Replica set, oplog y elecciones',
summary:'Primary/secondary, journal, votación y failover.',
html: `
<p class="lede">La <strong>replica set</strong> es el mecanismo de HA de MongoDB: un primary y secondaries que replican datos.</p>
<div class="callout info"><div class="lbl">Apuntes BDII · Semana 8 Clase 2 (EN paraphrase)</div>MongoDB uses a <strong>master-slave replication</strong> strategy: one primary for all writes, replicated to slaves. Changes tracked in a capped <strong>oplog</strong> on the primary; secondaries apply operations by reading the oplog. Reads on any server OK but slaves may be slightly stale. On primary failure, a slave is <strong>automatically promoted</strong> via a <strong>voting protocol</strong>.</div>
<p><strong>Oplog:</strong> colección limitada (capped) de operaciones — base del tailing replication. <strong>Elecciones:</strong> mayoría de votos elige nuevo primary (típicamente replica set impar ≥3).</p>
<p><strong>Docker / rs.initiate (clase):</strong> varios <code>mongod --replSet replica-1</code> en red Docker; <code>rs.initiate(config)</code> declara miembros.</p>
<div class="trade"><b>Trade-off 4 · Async replication.</b> Ganas: lecturas escaladas y failover. Pierdes: lag y posible ventana de writes no replicados si cae el primary.</div>
`,
mini:{q:'¿Quién acepta writes en un replica set?', opts:['Cualquier secondary','Solo el primary','mongos','Config server'], a:1, why:'Primary único para writes; secondaries replican.'} },
{ id:'m5', tag:'Módulo 5', accent:'gold', title:'Sharding: shard key y chunks',
summary:'Partición horizontal, rangos, hash y hotspots.',
html: `
<p class="lede"><strong>Sharding</strong> reparte una colección entre varios shards para escalar almacenamiento y throughput.</p>
<div class="callout info"><div class="lbl">Apuntes BDII · Semana 8</div>Sharding partitions data horizontally; each partition is a <strong>shard</strong>. MongoDB shards at <strong>collection</strong> level. Uses <strong>shard key</strong> to distribute documents in non-overlapping ranges → <strong>chunks</strong>, balanced across shards.</div>
<p><strong>Range vs hashed shard key (clase):</strong> range optimiza consultas por rangos continuos; hash ayuda distribución uniforme y evita hotspots cuando la clave es monótona (ej. timestamp creciente).</p>
<p>Consideraciones de clase: división lógica, consultas multi-shard, recuperación ante fallos.</p>
<div class="trade"><b>Trade-off 5 · Shard key irreversible.</b> Ganas: scale-out. Pierdes: mal diseño de clave concentra tráfico en un shard; resharding es operación pesada.</div>
`,
mini:{q:'¿Qué es un chunk?', opts:['Un documento BSON','Rango de shard key asignado a un shard','Un índice sparse','El oplog'], a:1, why:'Chunks = trozos por rangos de shard key.'} },
{ id:'m6', tag:'Módulo 6', accent:'pink', title:'Config servers y mongos',
summary:'Metadata del cluster y enrutamiento de consultas.',
html: `
<p class="lede">Un clúster sharded añade piezas de control: <strong>config servers</strong> (metadata) y <strong>mongos</strong> (routers).</p>
<div class="callout info"><div class="lbl">Apuntes BDII · Semana 8</div><strong>Config server</strong> stores sharded cluster configuration — which chunk lives on which shard. Vital for correct routing; dedicated config servers recommended. <strong>Query routers</strong> direct queries to the appropriate shard; MongoDB’s router is <strong>mongos</strong>. Often consistent hashing on shard key so same key → same shard.</div>
<p>Flujo: cliente → <strong>mongos</strong> → lee catálogo en config → envía operación al shard (replica set) correcto. Si un shard cae, metadata + ops de recuperación redistribuyen chunks (detalle operativo va más allá del quiz, pero la idea de routing es examinable).</p>
<div class="trade"><b>Trade-off 6 · Complejidad operativa.</b> Ganas: dataset mayor que un solo nodo. Pierdes: más componentes (config RS, mongos, balancer) y queries scatter/gather costosas.</div>
`,
mini:{q:'¿Qué componente enruta consultas al shard correcto?', opts:['Oplog','mongos','Chubby','Bloom filter'], a:1, why:'Query router = mongos en MongoDB sharded.'} },
{ id:'m7', tag:'Módulo 7', accent:'gold', title:'Trade-offs vs RDBMS',
summary:'Esquema, ACID, ad hoc, costo y cuándo elegir MongoDB.',
html: `
<p class="lede">El curso contraste NoSQL vs RDBMS en flexibilidad, escala y relajación de ACID.</p>
<table><tr><th>Tema</th><th>RDBMS (clase)</th><th>MongoDB / NoSQL</th></tr>
<tr><td>Esquema</td><td>Rígido, DDL central</td><td>Dinámico; app lleva el shape</td></tr>
<tr><td>Consultas</td><td>SQL ad hoc, joins</td><td>API orientada a documentos; sin joins clásicos</td></tr>
<tr><td>Escala</td><td>Scale-up (servidor más grande)</td><td>Scale-out (shards, commodity servers)</td></tr>
<tr><td>ACID</td><td>Fuerte por defecto</td><td>Relajación histórica; tunable con concerns</td></tr>
<tr><td>BI / analytics</td><td>Fuerte</td><td>Diseñado para apps web 2.0; BI limitado</td></tr></table>
<div class="callout info"><div class="lbl">Apuntes BDII · beneficios NoSQL</div>Elastic scaling, less DBA-heavy ops, big data volumes, flexible data models, economy on commodity clusters.</div>
<div class="callout warn"><div class="lbl">Inconvenientes (clase)</div>Aún requiere administración; analítica ad hoc no es el fuerte; herramientas BI en evolución.</div>
<div class="trade"><b>Trade-off 7 · Cuándo MongoDB.</b> Ganas: documentos JSON-like, horizontal scale, HA integrada. Pierdes: joins/transacciones multi-tabla fáciles y reporting SQL clásico.</div>
`,
mini:{q:'Según apuntes de clase, NoSQL escala principalmente…', opts:['Scale-up en un mainframe','Scale-out repartiendo datos en hosts','Solo en memoria sin disco','Con SQL estándar'], a:1, why:'Elastic scaling / scale-out vs bigger single server.'} }
];

const QUIZ = [
{tag:'CAP', c:'gold', q:'El teorema CAP en la lectura de clase implica…', opts:['SQL obligatorio','No C+A+P simultáneos sin compromiso bajo partición','Sin réplicas','Solo un nodo'], a:1, why:'Interpretación Semana 6: renunciar a algo.'},
{tag:'CAP', c:'gold', q:'Un replica set de 3 nodos busca principalmente…', opts:['Partir datos en mitades','HA y tolerancia a fallo de un nodo','Reemplazar índices','Eliminar oplog'], a:1, why:'Tres réplicas del mismo dataset; sharding es otro paso.'},
{tag:'BASE', c:'gold', q:'BASE en contraste didáctico con ACID enfatiza…', opts:['Joins fuertes','Disponibilidad y consistencia eventual','Solo batch','DDL estricto'], a:1, why:'Basically Available, Soft state, Eventually consistent.'},
{tag:'BSON', c:'blue', q:'_id en MongoDB…', opts:['Es opcional y nunca indexado','Es campo reservado; índice único automático','Solo string','Solo en sharded'], a:1, why:'Semana 6: system reserved; auto index.'},
{tag:'Documento', c:'blue', q:'¿Quién define el esquema en MongoDB clásico del curso?', opts:['DDL del servidor','La aplicación','mongos','Config server'], a:1, why:'Schema-less en DB; app tracks schema.'},
{tag:'BSON', c:'blue', q:'BSON significa…', opts:['Binary JSON','Basic SQL Object Notation','Batch Sync Object Network','Bloom Sorted Object Nodes'], a:0, why:'B = Binary extension of JSON.'},
{tag:'CRUD', c:'purple', q:'insertOne() pertenece a…', opts:['Create','Read','Update','Delete'], a:0, why:'Operación de creación.'},
{tag:'CRUD', c:'purple', q:'find(query, projection) — projection…', opts:['Shard key','Campos a devolver','Write concern','Replica ID'], a:1, why:'Semana 7 CRUD notes.'},
{tag:'Consulta', c:'purple', q:'NoSQL del curso vs RDBMS: consultas…', opts:['Solo SQL','Vía API orientada a documentos','Solo MapReduce','Sin filtros'], a:1, why:'Query language through API.'},
{tag:'Índice', c:'teal', q:'Índices en MongoDB son principalmente…', opts:['Hash tables en RAM','B+ trees','LSM only','Full text only'], a:1, why:'Semana 7: B+ tree indexes.'},
{tag:'Indice', c:'teal', q:'En índice compuesto {a:1,b:1} importa…', opts:['Solo el nombre','El orden de campos','El color del shard','El puerto mongos'], a:1, why:'Like SQL composite indexes.'},
{tag:'Índice', c:'teal', q:'Indexar un campo array…', opts:['Prohibido','Crea entradas por elemento','Borra el array','Desactiva _id'], a:1, why:'Semana 7 note on arrays.'},
{tag:'Replica', c:'orange', q:'Oplog vive en…', opts:['Config server','Primary (capped collection)','Cliente','mongos only'], a:1, why:'Semana 8: oplog on master/primary.'},
{tag:'Oplog', c:'orange', q:'Secondaries se ponen al día…', opts:['Leyendo SQL logs','Aplicando entradas del oplog','Copiando RDB','Vía Bloom'], a:1, why:'Tail oplog and apply.'},
{tag:'Election', c:'orange', q:'Nuevo primary se elige con…', opts:['Round-robin','Protocolo de votación','Primer ping','Hash del _id'], a:1, why:'Voting protocol Semana 8.'},
{tag:'Replica', c:'orange', q:'Reads en secondaries pueden estar…', opts:['Siempre más nuevos que primary','Ligeramente desactualizados (stale)','Prohibidos','Sin oplog'], a:1, why:'Replication lag.'},
{tag:'Sharding', c:'gold', q:'Sharding en MongoDB es a nivel de…', opts:['Campo _id solo','Colección','Instancia única','Oplog'], a:1, why:'Collection-level sharding.'},
{tag:'Shard', c:'gold', q:'Shard key sirve para…', opts:['Cifrar BSON','Distribuir documentos en chunks/shards','Elegir primary','Compactar índices'], a:1, why:'Distribution key.'},
{tag:'Chunk', c:'gold', q:'Chunks son…', opts:['Backups RDB','Rangos no superpuestos de shard key','Entradas oplog','Sentinel nodes'], a:1, why:'Semana 8 chunks definition.'},
{tag:'Sharding', c:'gold', q:'Sharding por hash ayuda cuando…', opts:['Quieres rangos geográficos','La clave es monótona y riesgo de hotspot','No hay config server','No hay mongos'], a:1, why:'Class: hash for even distribution.'},
{tag:'mongos', c:'pink', q:'mongos es…', opts:['Storage engine','Query router','Oplog','Primary election daemon'], a:1, why:'Query router Semana 8.'},
{tag:'Config', c:'pink', q:'Config servers guardan…', opts:['Todos los documentos','Metadata de chunks y shards','Solo logs de app','Índices B+ completos'], a:1, why:'Configuration of sharded cluster.'},
{tag:'trade-off', c:'gold', q:'Trade-off central NoSQL vs RDBMS en clase…', opts:['IPv6 vs IPv4','Scale-out + flexibilidad vs ACID/joins/ad hoc SQL','Solo UI','Solo caché'], a:1, why:'Elastic scaling, relaxed ACID, API queries.'},
{tag:'ACID', c:'gold', q:'Relajación ACID en NoSQL implica…', opts:['Sin disco','Garantías transaccionales menos fuertes que RDBMS clásico','Sin réplicas','Sin índices'], a:1, why:'Semana 6 trade-offs.'},
{tag:'RDBMS', c:'gold', q:'Ventaja histórica RDBMS señalada en clase…', opts:['Sharding nativo','Analítica / BI ad hoc','Sin esquema','Solo BSON'], a:1, why:'Inconveniente NoSQL: analytics niche for RDBMS.'},
{tag:'CRUD', c:'purple', q:'update con upsert:true…', opts:['Solo borra','Inserta si no hay match','Desactiva índice','Inicia elección'], a:1, why:'Semana 7 CRUD pattern.'},
{tag:'Replica', c:'orange', q:'Si primary cae, writes…', opts:['Continúan en secondary sin elección','Pausan hasta nuevo primary elegido','Van a mongos','Se pierden siempre'], a:1, why:'Promotion delay / election.'},
{tag:'Sharding', c:'gold', q:'Escalabilidad horizontal clave de sharding…', opts:['Un servidor más grande','Más nodos/shards para datos y tráfico','Menos réplicas','Sin chunks'], a:1, why:'Add nodes to grow.'},
{tag:'Indice', c:'teal', q:'Unique + sparse index…', opts:['Permite duplicados siempre','Rechaza duplicados pero permite campo ausente','Borra _id','Shard automático'], a:1, why:'Semana 7 sparse+unique rule.'},
{tag:'CAP', c:'gold', q:'Partir 10M docs en dos replica sets distintos (5M c/u) es…', opts:['Replica set','Sharding','Oplog','Index'], a:1, why:'Semana 6: shards hold partitions.'},
{tag:'mongos', c:'pink', q:'Cliente en clúster sharded habla normalmente con…', opts:['Solo config','mongos (no cada shard directo)','Oplog','Secondary only'], a:1, why:'Router abstracts shard map.'},
{tag:'Oplog', c:'orange', q:'Oplog es colección…', opts:['Ilimitada','Capped / limitada','Solo en secondary','Sin orden'], a:1, why:'Capped collection on primary.'}
];

const CASES = [
{ title:'Caso 1 · CAP en outage', prompt:'Hay partición de red: dos datacenters no se hablan pero clientes siguen escribiendo en ambos lados de un replica set mal configurado. ¿Qué principio CAP violaste y qué política usar?', solution:'<strong>Riesgo:</strong> split-brain / divergencia (consistencia). Usar mayoría en elecciones, write concern <code>majority</code>, evitar writes en minoría aislada. <strong>Trade-off:</strong> disponibilidad en minoría vs consistencia global.', h1:'¿Qué significa P en CAP?', h2:'¿Qué hace write concern majority?', rubric:'Rúbrica: 2 CAP + 2 mecanismo Mongo + 1 trade-off.'},
{ title:'Caso 2 · Elegir shard key', prompt:'Logs con timestamp monótono como única shard key. ¿Problema y alternativa?', solution:'<strong>Hotspot:</strong> inserts van al mismo chunk/shard (range). Mezclar hashed shard key o compound con alta cardinalidad (deviceId + ts).', h1:'Range vs hashed en clase.', h2:'¿Qué es un chunk?', rubric:'Rúbrica 2/2/1.'},
{ title:'Caso 3 · Replica set Docker', prompt:'Tres contenedores mongod --replSet rs0 pero writes fallan. Falta rs.initiate. ¿Pasos mínimos?', solution:'Misma red Docker, puertos publicados, luego <code>rs.initiate({ _id:"rs0", members:[…] })</code> con hostnames alcanzables entre contenedores.', h1:'¿Cuántos miembros mínimo recomendado?', h2:'¿Quién acepta writes?', rubric:'Rúbrica 2/2/1.'},
{ title:'Caso 4 · Índice compuesto', prompt:'Tienes índice { campus:1, studentId:1 }. ¿Qué query lo usa bien y cuál no?', solution:'Bien: <code>{ campus:"Cartago", studentId:123 }</code> o prefix <code>{ campus:"Cartago" }</code>. Mal: solo <code>{ studentId:123 }</code> sin campus (no usa el índice compuesto eficientemente).', h1:'¿Por qué importa el orden?', h2:'¿Qué es COLLSCAN?', rubric:'Rúbrica 2/2/1.'},
{ title:'Caso 5 · Read stale', prompt:'Dashboard lee de secondary con mucha carga write. Números van “atrás”. ¿Por qué y mitigación?', solution:'<strong>Lag</strong> oplog replication. Mitigar: read from primary, read concern majority, o tolerar staleness en UI.', h1:'¿Qué es oplog?', h2:'Read preference options.', rubric:'Rúbrica 2/2/1.'},
{ title:'Caso 6 · MongoDB vs Postgres', prompt:'Sistema bancario con joins complejos y reportes SQL ad hoc. ¿MongoDB solo?', solution:'<strong>Probablemente no como único store:</strong> RDBMS fuerte en ACID/joins/BI. Mongo podría ser catálogo flexible o cache, pero core transaccional suele quedarse relacional (trade-offs m7).', h1:'Inconveniente NoSQL analytics.', h2:'¿Qué gana Mongo?', rubric:'Rúbrica 2/2/1.'},
{ title:'Caso 7 · mongos caído', prompt:'Shards vivos pero mongos no responde. ¿Qué ven los clientes?', solution:'Clientes no enrutan queries: app debe usar otro mongos o SPOF de routers. Config/shards pueden estar bien pero sin router no hay acceso sharded normal.', h1:'Rol de mongos.', h2:'¿Dónde está metadata?', rubric:'Rúbrica 2/2/1.'},
{ title:'Caso 8 · Sparse unique email', prompt:'Users con email opcional. Quieres unicidad cuando existe email.', solution:'Índice <strong>unique + sparse</strong> en email: rechaza duplicados con email definido; permite muchos docs sin campo email.', h1:'Definición sparse.', h2:'Unique behavior.', rubric:'Rúbrica 2/2/1.'}
];

const GLOSSARY = [
['MongoDB','Base de datos document-oriented open source (10gen/2007+). (Semana 6)'],
['BSON','Binary JSON: serialización binaria con tipos extra. (Semana 6)'],
['Colección','Contenedor de documentos (análogo flexible a tabla). (Curso)'],
['Documento','Registro BSON en una colección. (Curso)'],
['_id','Identificador reservado del sistema; índice único automático. (Semana 6)'],
['Teorema CAP','Consistencia, Disponibilidad, Tolerancia a partición — no los tres sin compromiso. (Semana 6)'],
['BASE','Basically Available, Soft state, Eventually consistent — contraste didáctico con ACID. (Clase)'],
['ACID','Atomicity, Consistency, Isolation, Durability — relajado en muchos NoSQL. (Semana 6)'],
['Replica set','Grupo de mongod replicando el mismo dataset; elección de primary. (Semana 6–8)'],
['Primary','Nodo que acepta writes en replica set. (Semana 8)'],
['Secondary','Nodo que replica al primary; reads opcionales. (Semana 8)'],
['Oplog','Capped collection de operaciones en primary para replication. (Semana 8)'],
['Elección','Votación para promover secondary a primary. (Semana 8)'],
['Sharding','Partición horizontal de datos en shards. (Semana 6–8)'],
['Shard','Partición que contiene subset de chunks. (Semana 8)'],
['Shard key','Campo(s) que determinan chunk de un documento. (Semana 8)'],
['Chunk','Rango no superpuesto de shard key migrable. (Semana 8)'],
['Config server','Almacena metadata del clúster sharded. (Semana 8)'],
['mongos','Router de consultas hacia shards correctos. (Semana 8)'],
['Índice B+','Estructura de índice por defecto para acelerar queries. (Semana 7)'],
['Índice compuesto','Índice multi-campo; orden importa. (Semana 7)'],
['Índice sparse','Solo indexa documentos con el campo presente. (Semana 7)'],
['Write concern','Cuántas réplicas deben ack un write. (Extra operativo)'],
['Read preference','De qué nodo leer (primary/secondary…). (Extra operativo)'],
['CRUD','Create Read Update Delete vía API MongoDB. (Semana 7)'],
['Scale-out','Crecer añadiendo nodos vs scale-up. (Semana 6)']
];

const CHEATSHEET = `
<div class="card accent-gold"><h3 style="margin-top:0;">Modelo</h3><p style="font-size:14px;">Colecciones de <strong>documentos BSON</strong>; esquema en la app; <code>_id</code> automático.</p></div>
<div class="card accent-blue"><h3 style="margin-top:0;">CAP / NoSQL</h3><p style="font-size:14px;">C+A+P no gratis bajo partición · scale-out · BASE vs ACID · API queries vs SQL ad hoc.</p></div>
<div class="card accent-purple"><h3 style="margin-top:0;">CRUD</h3><p style="font-size:14px;"><code>insertOne/Many</code> · <code>find/findOne</code> + projection · <code>update</code> · delete/remove.</p></div>
<div class="card accent-teal"><h3 style="margin-top:0;">Índices</h3><p style="font-size:14px;">B+ · simple/compuesto (orden) · sparse · arrays → multikey entries.</p></div>
<div class="card accent-orange"><h3 style="margin-top:0;">Replica set</h3><p style="font-size:14px;">Primary writes · secondaries tail <strong>oplog</strong> · elección si cae primary · ≥3 nodos típico.</p></div>
<div class="card accent-gold"><h3 style="margin-top:0;">Sharding</h3><p style="font-size:14px;"><strong>Shard key</strong> → <strong>chunks</strong> → shards (cada uno RS) · range vs hash · evitar hotspots.</p></div>
<div class="card accent-pink"><h3 style="margin-top:0;">Cluster</h3><p style="font-size:14px;"><strong>Config servers</strong> (metadata) + <strong>mongos</strong> (router) · cliente → mongos → shard.</p></div>
<div class="card accent-blue"><h3 style="margin-top:0;">vs RDBMS</h3><p style="font-size:14px;">Flex + horizontal scale vs joins/ACID/BI fuertes — elige según workload.</p></div>
`;
