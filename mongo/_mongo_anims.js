const animBSON = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/4 · Colección.</b> Una <strong>collection</strong> agrupa documentos (como una “tabla” sin filas fijas).',
  '<b>Paso 2/4 · Documento.</b> Cada documento es un documento BSON: pares campo→valor anidables.',
  '<b>Paso 3/4 · _id.</b> MongoDB reserva <code>_id</code> (ObjectId si no lo das). Índice único automático.',
  '<b>Paso 4/4 · Esquema en la app.</b> No hay DDL rígido: la aplicación define y valida el shape. ✓'
],
titles:['1/4 collection','2/4 documento','3/4 _id','4/4 esquema ✓'],
init(){ this.svg=$('#svgGraph'); svgDefs(this.svg);
  this.ch=animChrome('svgGraph',4,'Pulsa <b>Reproducir</b>: documento BSON.');
  this.playBtn=document.querySelector('[onclick="animBSON.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#graphCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,4,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(360,50,'users (collection)',cBlue,cBlue));
  s.appendChild(nodeBox(200,160,'{ _id, name, tags[] }',cTeal,cTeal));
  s.appendChild(nodeBox(360,160,'{ _id, email, addr{} }',cTeal,cTeal));
  s.appendChild(nodeBox(520,160,'{ _id, … }',cTeal,cTeal));
  arrow(s,360,72,200,128,cTeal,'docs'); arrow(s,360,72,360,128,cTeal,''); arrow(s,360,72,520,128,cTeal,'');
  const t=el('text',{x:360,y:240,'text-anchor':'middle',class:'tedge'}); t.textContent='BSON = JSON binario + tipos extra'; s.append(t);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx];
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,4,st,this.cap,st);
  glowIdx(this.svg,[[0],[1,2,3],[1],[0,1,2,3]][this.idx]); svgCap(this.svg,this.titles[this.idx],300); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,4); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1400); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,4); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',4,4,'<b>✓ BSON.</b> Documentos flexibles; _id e índice automático.',this.cap,'BSON + colección ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,4,'Pulsa <b>Reproducir</b>: documento BSON.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animIndex = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/4 · Sin índice.</b> <code>find({ email: "a@b.com" })</code> puede hacer <strong>COLLSCAN</strong> (todos los docs).',
  '<b>Paso 2/4 · Índice B+.</b> Árbol B+ en el campo <code>email</code> ordena claves → punteros a documentos.',
  '<b>Paso 3/4 · Compuesto / sparse.</b> Índice compuesto: el <strong>orden de campos importa</strong>. Sparse: solo docs con el campo.',
  '<b>Paso 4/4 · Arrays.</b> Si indexas un array, MongoDB crea entradas por cada elemento. ✓'
],
titles:['1/4 COLLSCAN','2/4 B+ tree','3/4 compound/sparse','4/4 arrays ✓'],
init(){ this.svg=$('#svgCheck'); svgDefs(this.svg);
  this.ch=animChrome('svgCheck',4,'Pulsa <b>Reproducir</b>: índice B+.');
  this.playBtn=document.querySelector('[onclick="animIndex.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#checkCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,4,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(140,140,'docs en disco',cDim,cDim));
  s.appendChild(nodeBox(360,140,'find(query)',cGold,cGold));
  s.appendChild(nodeBox(580,140,'índice B+ (email)',cTeal,cTeal));
  arrow(s,178,140,302,140,cGold,'query');
  arrow(s,418,140,522,140,cTeal,this.idx>=1?'usa índice':'scan?');
  const t=el('text',{x:360,y:260,'text-anchor':'middle',class:'tedge'}); t.textContent=this.idx>=1?'pocas entradas B+':'revisa N documentos'; s.append(t);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx]; this.draw();
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,4,st,this.cap,st);
  glowIdx(this.svg,[[0,1],[2],[2],[0,1,2]][this.idx]); svgCap(this.svg,this.titles[this.idx],310); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,4); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,4); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',4,4,'<b>✓ Índices.</b> B+ acelera find; compuesto/sparse/arrays tienen reglas propias.',this.cap,'Índice B+ ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,4,'Pulsa <b>Reproducir</b>: índice B+.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animReplica = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/5 · Tres nodos.</b> Replica set típico: ≥3 miembros (primary + secondaries).',
  '<b>Paso 2/5 · Writes.</b> Solo el <strong>primary</strong> acepta writes; confirma en su journal.',
  '<b>Paso 3/5 · Reads.</b> Lecturas en secondaries OK con <strong>read preference</strong>; pueden ir ligeramente stale.',
  '<b>Paso 4/5 · Fallo.</b> Primary cae → protocolo de <strong>elección</strong> (votos mayoritarios).',
  '<b>Paso 5/5 · Promoción.</b> Un secondary pasa a primary; writes continúan (breve pausa posible). ✓'
],
titles:['1/5 3 nodos','2/5 writes','3/5 reads','4/5 fallo','5/5 promote ✓'],
init(){ this.svg=$('#svgEnemy'); svgDefs(this.svg);
  this.ch=animChrome('svgEnemy',5,'Pulsa <b>Reproducir</b>: replica set.');
  this.playBtn=document.querySelector('[onclick="animReplica.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#enemyCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,5,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  const prim=this.idx>=4?cTeal:cBlue;
  s.appendChild(nodeBox(360,60,this.idx>=4?'new primary (ex-sec)':'primary',prim,prim));
  s.appendChild(nodeBox(180,200,'secondary',cPurple,cPurple));
  s.appendChild(nodeBox(540,200,'secondary',cPurple,cPurple));
  if(this.idx===3){ const x=el('text',{x:360,y:130,'text-anchor':'middle',class:'tnode'}); x.textContent='primary DOWN'; s.append(x); }
  arrow(s,300,88,220,178,cDim,'repl'); arrow(s,420,88,500,178,cDim,'repl');
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx]; this.draw();
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,5,st,this.cap,st);
  glowIdx(this.svg,[[0,1,2],[0],[1,2],[1,2],[0]][this.idx]); svgCap(this.svg,this.titles[this.idx],300); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,5); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,5); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',5,5,'<b>✓ Replica set.</b> Primary único para writes; elección ante fallo.',this.cap,'Replica set + elección ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,5,'Pulsa <b>Reproducir</b>: replica set.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animOplog = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/4 · Oplog.</b> Colección capped <code>local.oplog.rs</code> en el primary registra operaciones.',
  '<b>Paso 2/4 · Tailing.</b> Secondaries leen el oplog (tailable cursor) y aplican en orden.',
  '<b>Paso 3/4 · Lag.</b> Alto volumen de writes → secondaries pueden quedar <strong>behind</strong>.',
  '<b>Paso 4/4 · Rol.</b> Oplog es la base de réplica y de algunas herramientas de sync. ✓'
],
titles:['1/4 oplog','2/4 tail','3/4 lag','4/4 rol ✓'],
init(){ this.svg=$('#svgZookie'); svgDefs(this.svg);
  this.ch=animChrome('svgZookie',4,'Pulsa <b>Reproducir</b>: oplog.');
  this.playBtn=document.querySelector('[onclick="animOplog.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#zookieCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,4,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(200,120,'primary + oplog',cBlue,cBlue));
  s.appendChild(nodeBox(520,120,'secondary',cTeal,cTeal));
  for(let i=0;i<4;i++){ const y=200+i*28; s.appendChild(el('rect',{x:160,y:y-12,width:80,height:22,rx:4,fill:cOrange,'fill-opacity':0.2,stroke:cOrange,'stroke-width':1})); }
  arrow(s,280,120,440,120,cTeal,'op entries');
  const t=el('text',{x:360,y:310,'text-anchor':'middle',class:'tedge'}); t.textContent='master-slave replication via oplog (apuntes S8)'; s.append(t);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx];
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,4,st,this.cap,st);
  glowIdx(this.svg,[[0],[0,1],[1],[0,1]][this.idx]); svgCap(this.svg,this.titles[this.idx],330); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,4); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,4); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',4,4,'<b>✓ Oplog.</b> Log de operaciones en primary; secondaries replay.',this.cap,'Oplog replication ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,4,'Pulsa <b>Reproducir</b>: oplog.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animShard = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/6 · Shard key.</b> Eliges campos que particionan la colección (range o hashed).',
  '<b>Paso 2/6 · Chunks.</b> Rangos no superpuestos de shard key → <strong>chunks</strong> migrables entre shards.',
  '<b>Paso 3/6 · Shards.</b> Cada shard es un replica set; datos repartidos horizontalmente.',
  '<b>Paso 4/6 · Config.</b> <strong>Config servers</strong> guardan metadata: qué chunk vive en qué shard.',
  '<b>Paso 5/6 · mongos.</b> Router: consulta config → envía operación al shard correcto.',
  '<b>Paso 6/6 · Hotspot.</b> Shard key mal elegida → un shard saturado; hash ayuda distribución uniforme. ✓'
],
titles:['1/6 key','2/6 chunks','3/6 shards','4/6 config','5/6 mongos','6/6 hotspot ✓'],
init(){ this.svg=$('#svgArch'); svgDefs(this.svg);
  this.ch=animChrome('svgArch',6,'Pulsa <b>Reproducir</b>: sharding + mongos.');
  this.playBtn=document.querySelector('[onclick="animShard.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#archCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,6,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(120,160,'cliente',cGold,cGold));
  s.appendChild(nodeBox(300,80,'mongos',cOrange,cOrange));
  s.appendChild(nodeBox(300,200,'config servers',cPurple,cPurple));
  s.appendChild(nodeBox(520,80,'shard A (RS)',cBlue,cBlue));
  s.appendChild(nodeBox(520,200,'shard B (RS)',cTeal,cTeal));
  arrow(s,178,160,242,90,cGold,'query');
  arrow(s,300,102,300,178,cPurple,'metadata');
  arrow(s,358,90,462,90,cBlue,'chunk');
  arrow(s,358,90,462,200,cTeal,'chunk');
  if(this.idx>=1){ const t=el('text',{x:360,y:280,'text-anchor':'middle',class:'tedge'}); t.textContent='shard key → chunk → shard'; s.append(t); }
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const st=this.steps[this.idx];
  this.draw();
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,6,st,this.cap,st);
  glowIdx(this.svg,[[1],[2,3,4],[3,4],[2],[1,2],[3,4]][this.idx]); svgCap(this.svg,this.titles[this.idx],320); flowOn(this.svg,this.playing&&!manual);
  this.idx++; if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; } if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,6); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,6); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',6,6,'<b>✓ Sharding.</b> mongos + config + chunks; elige bien la shard key.',this.cap,'Sharding + mongos ✓'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,6,'Pulsa <b>Reproducir</b>: sharding + mongos.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };
