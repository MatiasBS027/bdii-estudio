const MODULES = [
{ id:'m0', tag:'Módulo 0', accent:'gold', title:'Qué es Redis: servidor de estructuras de datos',
summary:'REmote DIctionary Service: más que un caché clave-valor.',
html: `
<p class="lede">Redis es un servidor de base de datos clave-valor de código abierto. La descripción más precisa: un <strong>servidor de estructuras de datos</strong>.</p>
<div class="callout info"><div class="lbl">Architecture Notes · Redis Explained</div>"Redis (‘REmote DIctionary Service’) is an open-source key-value database server. The most accurate description of Redis is that it's a <strong>data structure server</strong>."</div>
<p><strong>Traducción didáctica:</strong> en lugar de filas que ordenas después, Redis te da estructuras (strings, hashes, lists, sets, sorted sets) listas para usar. Empezó como caché tipo Memcached y evolucionó a pub/sub, streaming, colas y, con HA, incluso DB primaria en ciertos workloads.</p>
<p>Casos típicos de caché: datos que cambian poco y se piden mucho; o datos menos críticos que cambian seguido (sesiones, leaderboards, dashboards).</p>
<div class="trade"><b>Trade-off 0 · Memoria primero.</b> Ganas: latencia sub-ms. Pierdes: el dataset debe caber (o particionarse) en RAM; la durabilidad es opcional y asíncrona.</div>
<div class="callout warn"><div class="lbl">Error común</div>Decir que Redis "solo es caché". Puede serlo — y también DB primaria con plugins/HA, según el caso.</div>
`,
mini:{q:'¿Cuál es la descripción más precisa de Redis según Architecture Notes?', opts:['Solo un caché LRU','Un servidor de estructuras de datos','Un RDBMS con SQL','Un filesystem'], a:1, why:'El artículo insiste: data structure server, no solo caché.'} },
{ id:'m1', tag:'Módulo 1', accent:'blue', title:'Redis vs Memcached',
summary:'Misma familia (caché en memoria), capacidades distintas.',
html: `
<p class="lede">Memcached (2003) fue el caché de facto; Redis (2009) añadió tipos, persistencia y topologías.</p>
<table><tr><th>Capacidad</th><th>Memcached</th><th>Redis</th></tr>
<tr><td>Latencia sub-ms</td><td>Sí</td><td>Sí</td></tr>
<tr><td>Facilidad para developers</td><td>Sí</td><td>Sí</td></tr>
<tr><td>Particionado de datos</td><td>Sí</td><td>Sí</td></tr>
<tr><td>Muchos lenguajes</td><td>Sí</td><td>Sí</td></tr>
<tr><td>Estructuras avanzadas</td><td>No</td><td>Sí</td></tr>
<tr><td>Multithreaded</td><td>Sí</td><td>No (single-threaded)</td></tr>
<tr><td>Snapshots / replicación / tx / pub-sub / Lua / geo</td><td>No</td><td>Sí</td></tr></table>
<div class="trade"><b>Trade-off 1 · Single-thread vs multi-thread.</b> Redis: modelo simple y estructuras ricas. Memcached: paralelismo CPU en caché puro, pero menos features.</div>
`,
mini:{q:'¿Qué tiene Redis que Memcached no?', opts:['Latencia sub-ms','Estructuras avanzadas + snapshots + replicación','Particionado','Muchos lenguajes'], a:1, why:'La tabla del artículo: estructuras, snapshots, replication, transactions, pub/sub, Lua, geo.'} },
{ id:'m2', tag:'Módulo 2', accent:'purple', title:'Instancia única',
summary:'El despliegue más simple: un solo Redis.',
html: `
<p class="lede">Single Redis Instance: setup mínimo. Si cae, fallan todas las llamadas a Redis.</p>
<div class="callout info"><div class="lbl">Architecture Notes</div>"If this instance fails or is unavailable, all client calls to Redis will fail…"</div>
<p>Los comandos se procesan <strong>primero en memoria</strong>. Con persistencia, un proceso forkeado escribe RDB o AOF.</p>
<div class="trade"><b>Trade-off 2 · Simpleza vs SPOF.</b> Ganas: operación trivial. Pierdes: punto único de fallo.</div>
`,
mini:{q:'En instancia única, si Redis cae…', opts:['Las réplicas responden','Fallan las llamadas de clientes a Redis','Sentinel elige otro primary al instante','El AOF evita el downtime'], a:1, why:'Sin HA/Sentinel/Cluster, la instancia es SPOF.'} },
{ id:'m3', tag:'Módulo 3', accent:'teal', title:'Redis HA y replicación',
summary:'Primary + réplicas: replication ID, offset, sync parcial vs completa.',
html: `
<p class="lede">HA: primary sincroniza secundarios. Escalan lecturas y permiten failover.</p>
<p>Cada primary tiene <strong>replication ID</strong> + <strong>offset</strong>. Poco desfase → sync parcial. Sin ancestro común → <strong>full sync</strong> (RDB + buffer).</p>
<div class="callout info"><div class="lbl">Architecture Notes</div>"If two instances have the same replication ID and offset, they have precisely the same data."</div>
<div class="trade"><b>Trade-off 3 · Réplicas asíncronas.</b> Ganas: lecturas y failover. Pierdes: ventana de pérdida de writes.</div>
`,
mini:{q:'¿Cuándo hace falta full sync?', opts:['Siempre','Cuando no hay replication ID/offset común utilizable','Nunca','Solo con Sentinel'], a:1, why:'Sin ancestro común se pide RDB completo.'} },
{ id:'m4', tag:'Módulo 4', accent:'orange', title:'Redis Sentinel',
summary:'Monitoreo, discovery, quorum y failover automático.',
html: `
<p class="lede">Sentinel es un sistema distribuido de procesos para HA (el protector no debe ser SPOF).</p>
<p>Responsabilidades: Monitoring, Notification, Failover, Configuration/discovery del primary.</p>
<p><strong>Quorum:</strong> votos mínimos para failover. Recomendación: ≥3 nodos, quorum 2.</p>
<div class="callout warn"><div class="lbl">Pitfalls</div>Old primary en minoría → writes perdidos. Mitigación: exigir ack de ≥1 réplica.</div>
<div class="trade"><b>Trade-off 4 · Failover automático vs pérdida de writes.</b> Ganas: recuperación. Pierdes: durabilidad no garantizada en el corte.</div>
`,
mini:{q:'Sentinel NO hace…', opts:['Monitoreo','Guardar el dataset de Redis','Failover','Decir a clientes quién es el primary'], a:1, why:'Sentinel coordina HA; los datos están en las instancias Redis.'} },
{ id:'m5', tag:'Módulo 5', accent:'gold', title:'Redis Cluster y hashslots',
summary:'Sharding horizontal con 16K hashslots, gossip y resharding.',
html: `
<p class="lede">Cuando el dataset no cabe en una máquina: Cluster reparte shards.</p>
<p>Solución al resharding: <strong>16384 hashslots</strong>. Clave → slot → shard. Al añadir nodos se mueven slots (no se rehashea cada key).</p>
<p>Ejemplo: M1 0–8191, M2 8192–16383; con M3 se reparticionan los rangos de slots.</p>
<p><strong>Gossip</strong> para salud; mal configurado → split brain. Regla: primarios impares + 2 réplicas c/u.</p>
<div class="trade"><b>Trade-off 5 · Escala horizontal vs complejidad.</b> Ganas: más RAM/throughput. Pierdes: multi-key limitado a mismo slot.</div>
`,
mini:{q:'¿Cuántos hashslots tiene Redis Cluster?', opts:['1024','16384 (16K)','ilimitados','64'], a:1, why:'Architecture Notes: 16K hashslots.'} },
{ id:'m6', tag:'Módulo 6', accent:'pink', title:'Persistencia: RDB, AOF, fork y COW',
summary:'Velocidad primero; durabilidad configurable.',
html: `
<p class="lede">"Redis is fast and all consistency guarantees come second to speed."</p>
<table><tr><th>Modo</th><th>Qué hace</th><th>Trade-off</th></tr>
<tr><td><strong>Ninguno</strong></td><td>Solo RAM</td><td>Máxima velocidad; pierdes todo al reiniciar</td></tr>
<tr><td><strong>RDB</strong></td><td>Snapshots</td><td>Compacto; pierdes entre snapshots; fork puede pausar</td></tr>
<tr><td><strong>AOF</strong></td><td>Log de writes + fsync</td><td>Más durable; más disco/I/O</td></tr>
<tr><td><strong>Ambos</strong></td><td>RDB+AOF</td><td>En restart usa AOF (más completo)</td></tr></table>
<p><strong>Fork + copy-on-write:</strong> hijo comparte páginas; escrituras del padre copian páginas tocadas.</p>
<div class="trade"><b>Trade-off 6 · Durabilidad vs latencia.</b> fsync siempre = más seguro y más lento.</div>
`,
mini:{q:'Si RDB y AOF están activos, al reiniciar Redis usa…', opts:['Solo RDB','AOF (más completo)','Ninguno','Memcached'], a:1, why:'AOF es más completo para reconstruir.'} }
];

const QUIZ = [
{tag:'Intro', c:'gold', q:'Redis se describe mejor como…', opts:['RDBMS SQL','Servidor de estructuras de datos','Solo Memcached clone','Object storage'], a:1, why:'Architecture Notes: data structure server.'},
{tag:'Intro', c:'gold', q:'Un use case típico de Redis como caché…', opts:['Joins multi-tabla','Sesiones / datos leídos mucho y cambiados poco','Filesystem POSIX','2PC distribuido'], a:1, why:'Session/data caches y leaderboards.'},
{tag:'Memcached', c:'blue', q:'Diferencia clave Redis vs Memcached…', opts:['Redis no tiene latencia baja','Redis tiene estructuras avanzadas y persistencia; Memcached es multi-thread caché simple','Memcached tiene AOF','Memcached tiene Sentinel'], a:1, why:'Tabla de capacidades del artículo.'},
{tag:'Single', c:'purple', q:'Limitación de instancia única…', opts:['No cabe en un proceso','SPOF: si cae, fallan las llamadas','No puede hacer SET','No habla TCP'], a:1, why:'Single instance failure degrada la app.'},
{tag:'HA', c:'teal', q:'replication ID + offset sirven para…', opts:['Cifrar datos','Saber si basta sync parcial o hace falta full sync','Elegir hashslot','Configurar fsync'], a:1, why:'Punto en el tiempo de la réplica.'},
{tag:'HA', c:'teal', q:'Full sync implica…', opts:['Solo PING','Transferir RDB + buffer de updates intermedios','Borrar AOF','Apagar Sentinel'], a:1, why:'Primary crea RDB y buffer mientras transfiere.'},
{tag:'Sentinel', c:'orange', q:'Quorum en Sentinel es…', opts:['Tamaño del AOF','Mínimo de votos para declarar fallo/failover','Número de hashslots','Replication ID'], a:1, why:'Definición de quorum del artículo.'},
{tag:'Sentinel', c:'orange', q:'Recomendación de despliegue Sentinel…', opts:['1 nodo basta','Al menos 3 nodos con quorum 2','100 nodos obligatorios','Solo en el primary'], a:1, why:'Odd count / tolerate failures.'},
{tag:'Cluster', c:'gold', q:'Hashslots en Redis Cluster…', opts:['64','16384','ilimitados','2'], a:1, why:'16K hashslots.'},
{tag:'Cluster', c:'gold', q:'Al añadir un shard, Redis Cluster…', opts:['Rehashea todas las keys desde cero','Mueve hashslots entre nodos','Borra réplicas','Desactiva gossip'], a:1, why:'Indirection via slots.'},
{tag:'Cluster', c:'gold', q:'Split brain se mitiga con…', opts:['Más AOF','Número impar de primarios + réplicas y quorum bien puesto','Apagar gossip','Un solo Sentinel'], a:1, why:'Artículo: odd primaries, 2 replicas each.'},
{tag:'Persistencia', c:'pink', q:'Desventaja principal de RDB…', opts:['No cabe en disco','Pérdida de datos entre snapshots','No se puede cargar','Es más grande que AOF siempre'], a:1, why:'Point-in-time gaps.'},
{tag:'Persistencia', c:'pink', q:'AOF…', opts:['Solo lee','Registra writes para replay al arrancar','Es multi-thread','Reemplaza Cluster'], a:1, why:'Append-only log of write ops.'},
{tag:'Persistencia', c:'pink', q:'Con RDB+AOF, restart usa…', opts:['RDB','AOF','Ninguno','Sentinel'], a:1, why:'AOF more complete.'},
{tag:'Fork', c:'pink', q:'Fork + COW permite…', opts:['Evitar TCP','Snapshot sin duplicar toda la RAM','Multi-thread Redis','SQL joins'], a:1, why:'Shared pages until write.'},
{tag:'trade-off', c:'gold', q:'Trade-off central de Redis…', opts:['SQL vs NoSQL joins','Velocidad en memoria vs garantías de consistencia/durabilidad','Solo disco vs solo red','IPv4 vs IPv6'], a:1, why:'Speed first; durability optional/async.'},
{tag:'Sentinel', c:'orange', q:'Sentinel como discovery…', opts:['Guarda SSTables','Indica a clientes el primary actual','Ejecuta Lua de negocio','Hashea slots'], a:1, why:'Configuration management / service discovery.'},
{tag:'HA', c:'teal', q:'HA busca…', opts:['Máximo SQL','Uptime/operational performance sin SPOF','Solo snapshots diarios','Apagar réplicas'], a:1, why:'High availability definition in article.'},
{tag:'Cluster', c:'gold', q:'Gossip en Cluster…', opts:['Comprime AOF','Nodos comparten salud del cluster','Es un tipo de dato','Solo corre en Memcached'], a:1, why:'Health via gossip.'},
{tag:'Intro', c:'gold', q:'Redis puede usarse como DB primaria cuando…', opts:['Nunca','Hay HA/plugins y el workload encaja','Solo sin persistencia','Solo con SQL'], a:1, why:'Article: HA setups make Redis viable as primary for certain scenarios.'},
{tag:'Memcached', c:'blue', q:'Memcached eviction clásica…', opts:['LFU only','LRU (limitada frente a Redis)','Never','Random only in Redis'], a:1, why:'Article: Memcached limited eviction LRU.'},
{tag:'Persistencia', c:'pink', q:'fsync…', opts:['Hashea claves','Fuerza flush a disco de buffers del archivo','Elige primary','Cuenta quorum'], a:1, why:'fsync definition in article.'},
{tag:'Single', c:'purple', q:'Sin persistencia al reiniciar…', opts:['Se carga AOF','Se pierden los datos en memoria','Cluster rebalancea','Sentinel restaura'], a:1, why:'No persistence = data loss on restart.'},
{tag:'Cluster', c:'gold', q:'Sharding algorítmico ingenuo (hash % N) falla al…', opts:['Hacer GET','Añadir shards (resharding costoso)','Usar TCP','Abrir AOF'], a:1, why:'Why hashslots exist.'},
{tag:'trade-off', c:'gold', q:'Forzar ack de ≥1 réplica en primary…', opts:['Elimina toda latencia','Reduce pérdida de writes a costa de dejar de aceptar writes si no hay ack','Borra hashslots','Apaga Sentinel'], a:1, why:'Mitigation mentioned for async replication losses.'},
{tag:'Intro', c:'gold', q:'Pub/Sub y colas en Redis…', opts:['Imposibles','Casos de uso más allá del caché puro','Solo en Memcached','Solo en Cluster'], a:1, why:'Evolution beyond Memcached-like cache.'},
{tag:'HA', c:'teal', q:'Al promover réplica a primary…', opts:['Mantiene el mismo replication ID siempre','Obtiene nuevo replication ID (recuerda el anterior)','Borra offset','Desactiva AOF'], a:1, why:'New ID on promotion; old remembered for partial sync.'},
{tag:'Sentinel', c:'orange', q:'Si Sentinel pierde quorum…', opts:['Nada pasa','Puede no poder hacer failover de forma confiable','Se apaga Redis','Se crean hashslots'], a:1, why:'Pitfall list in article.'},
{tag:'Fork', c:'pink', q:'Durante el snapshot, si el padre escribe…', opts:['Se aborta Redis','Kernel copia páginas modificadas (COW)','Se apaga el hijo','Se pierde el RDB'], a:1, why:'Copy-on-write explanation.'},
{tag:'Persistencia', c:'pink', q:'RDB suele…', opts:['Ser más lento de cargar que AOF','Cargar en memoria más rápido que AOF','No poder usarse en réplicas','Requerir Cluster'], a:1, why:'Article: RDB files load faster than AOF.'}
];

const CASES = [
{ title:'Caso 1 · ¿Caché o primaria?', prompt:'Tu app necesita sesiones con TTL y un leaderboard en tiempo real. ¿Redis caché delante de Postgres basta, o Redis como store principal del leaderboard?', solution:'<strong>Híbrido típico:</strong> sesiones/caché en Redis; leaderboard con sorted sets puede vivir en Redis como fuente de verdad del ranking si aceptas el modelo de durabilidad (AOF/RDB + HA). Postgres sigue para datos transaccionales duros.', h1:'¿Qué estructuras usa un leaderboard?', h2:'¿Qué garantiza (o no) la persistencia async?', rubric:'Rúbrica: 2 decisión + 2 mecanismo + 1 trade-off.'},
{ title:'Caso 2 · SPOF en producción', prompt:'Solo hay un Redis single instance en el mismo host que la API. El host reinicia. ¿Qué pasa y qué topología propones?', solution:'Sin persistencia: datos de caché perdidos y latencia sube al origen. Con RDB/AOF: tarda en reload. Propón HA+réplica o Sentinel (≥3) según SLA.', h1:'¿Qué es SPOF aquí?', h2:'¿Sentinel vs solo réplica?', rubric:'Rúbrica 2/2/1.'},
{ title:'Caso 3 · Sync parcial vs full', prompt:'Una réplica estuvo offline 2 días. Vuelve. ¿Partial o full sync? ¿Por qué duele el full?', solution:'Si el primary ya no tiene el backlog de offsets → full sync: RDB grande + buffer. Duele CPU/red/latencia en primary.', h1:'¿Qué son replication ID y offset?', h2:'¿Qué envía un full sync?', rubric:'Rúbrica 2/2/1.'},
{ title:'Caso 4 · Quorum Sentinel', prompt:'2 Sentinels, quorum 2. Un Sentinel queda aislado. ¿Puede haber failover falso o bloqueo?', solution:'Con 2 nodos y quorum 2, un aislamiento puede impedir quorum o crear decisiones frágiles. Mejor 3/2.', h1:'Define quorum.', h2:'¿Por qué número impar?', rubric:'Rúbrica 2/2/1.'},
{ title:'Caso 5 · Añadir shard', prompt:'Cluster 2 primarios. Añades M3. ¿Se rehashean todas las keys?', solution:'No: se migran hashslots. Clave→slot estable; cambian slot→nodo.', h1:'¿Cuántos slots?', h2:'Ejemplo M1/M2/M3 del artículo.', rubric:'Rúbrica 2/2/1.'},
{ title:'Caso 6 · RDB vs AOF', prompt:'Analytics en tiempo real: perder 1 minuto de datos es OK; reinicios deben ser rápidos. ¿RDB, AOF o ambos?', solution:'RDB (o RDB+AOF con fsync laxo) encaja: snapshots y carga rápida. Si necesitas casi no perder writes → AOF con fsync más frecuente (más latencia).', h1:'¿Qué pierdes entre snapshots RDB?', h2:'¿Qué usa Redis al restart si ambos?', rubric:'Rúbrica 2/2/1.'},
{ title:'Caso 7 · Split brain', prompt:'Partición de red: dos mitades con igual número de primarios. ¿Riesgo?', solution:'Split brain: dos primarios aceptando writes. Mitigar con odd primaries + réplicas y quorum/gossip bien configurados.', h1:'¿Qué es gossip?', h2:'Regla de odd primaries.', rubric:'Rúbrica 2/2/1.'}
];

const GLOSSARY = [
['Redis','Servidor open-source de estructuras de datos en memoria (REmote DIctionary Service). (Architecture Notes)'],
['Memcached','Caché multi-thread predador de Redis; sin estructuras avanzadas ni persistencia rica. (Architecture Notes)'],
['RDB','Redis Database: snapshot point-in-time compacto; pérdida entre snapshots. (Architecture Notes)'],
['AOF','Append Only File: log de writes para replay; más durable, menos compacto. (Architecture Notes)'],
['fsync','Syscall que fuerza flush de buffers de archivo a disco. (Architecture Notes)'],
['Replication ID','Identificador de la línea de replicación del primary. (Architecture Notes)'],
['Offset de replicación','Contador de acciones en el primary; base del sync parcial. (Architecture Notes)'],
['Sincronización parcial','Réplica recibe comandos faltantes por offset. (Architecture Notes)'],
['Sincronización completa','Transferencia de RDB + buffer cuando no hay ancestro común. (Architecture Notes)'],
['Redis Sentinel','Procesos distribuidos: monitor, notify, failover, discovery. (Architecture Notes)'],
['Quorum','Mínimo de votos para operaciones como failover. (Architecture Notes)'],
['Redis Cluster','Modo sharded horizontal con 16K hashslots. (Architecture Notes)'],
['Hashslot','Una de 16384 ranuras; las keys mapean a slots, los slots a shards. (Architecture Notes)'],
['Sharding','Partir el dataset entre instancias/shards. (Architecture Notes)'],
['Resharding','Redistribuir slots al añadir/quitar shards. (Architecture Notes)'],
['Gossiping','Protocolo de rumor entre nodos para salud del cluster. (Architecture Notes)'],
['Split brain','Partición donde dos lados creen ser primarios. (Architecture Notes)'],
['Primary','Instancia que acepta writes en una topología HA/Cluster. (Architecture Notes)'],
['Replica','Copia que sigue al primary (antes secondary). (Architecture Notes)'],
['Fork','Crear proceso hijo compartiendo memoria inicialmente. (Architecture Notes)'],
['Copy-on-write','Páginas compartidas hasta escritura; entonces se copian. (Architecture Notes)'],
['Pub/Sub','Patrón publicación-suscripción soportado por Redis. (Architecture Notes)'],
['Single-threaded','Modelo de Redis: un hilo de comandos (simplifica estructuras). (Architecture Notes)'],
['High Availability','Diseño para uptime: sin SPOF, detección y recuperación. (Architecture Notes)'],
['Data structure server','Descripción canónica de Redis frente a “solo caché”. (Architecture Notes)']
];

const CHEATSHEET = `
<div class="card accent-gold"><h3 style="margin-top:0;">Qué es</h3><p style="font-size:14px;"><strong>Data structure server</strong> en memoria. Caché y/o primaria según HA y durabilidad.</p></div>
<div class="card accent-blue"><h3 style="margin-top:0;">vs Memcached</h3><p style="font-size:14px;">Redis: estructuras + persistencia + réplica + pub/sub. Memcached: multi-thread, LRU simple.</p></div>
<div class="card accent-purple"><h3 style="margin-top:0;">Topologías</h3><p style="font-size:14px;"><strong>Single</strong> (SPOF) · <strong>HA</strong> (ID+offset) · <strong>Sentinel</strong> (quorum/failover) · <strong>Cluster</strong> (16K slots + gossip).</p></div>
<div class="card accent-teal"><h3 style="margin-top:0;">Replicación</h3><p style="font-size:14px;">Partial vs full sync. Async → posible pérdida. Mitigar con min replicas ack.</p></div>
<div class="card accent-orange"><h3 style="margin-top:0;">Sentinel</h3><p style="font-size:14px;">Monitor · notify · failover · discovery. ≥3 nodos, quorum 2. Cuidado split/minoría.</p></div>
<div class="card accent-gold"><h3 style="margin-top:0;">Cluster</h3><p style="font-size:14px;">16384 hashslots; reshard mueve slots. Gossip; odd primaries + 2 réplicas.</p></div>
<div class="card accent-pink"><h3 style="margin-top:0;">Persistencia</h3><p style="font-size:14px;">None / RDB / AOF / ambos (restart→AOF). Fork+COW. Speed &gt; consistency guarantees.</p></div>
`;
