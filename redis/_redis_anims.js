const animSingle = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/4 · Cliente → Redis.</b> Un solo proceso recibe el comando (GET/SET). Single-threaded: un comando a la vez.',
  '<b>Paso 2/4 · Memoria primero.</b> El cambio vive en RAM. Sin persistencia, un reinicio lo borra.',
  '<b>Paso 3/4 · Fork.</b> Si hay RDB/AOF, Redis hace fork: el hijo escribe a disco mientras el padre sigue sirviendo.',
  '<b>Paso 4/4 · SPOF.</b> Si esta instancia cae, fallan todas las llamadas. ✓'
],
titles:['1/4 cliente','2/4 memoria','3/4 fork','4/4 SPOF ✓'],
init(){ this.svg=$('#svgGraph'); svgDefs(this.svg);
  this.ch=animChrome('svgGraph',4,'Pulsa <b>Reproducir</b>: instancia única + persistencia.');
  this.playBtn=document.querySelector('[onclick="animSingle.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#graphCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,4,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(120,160,'cliente',cGold,cGold));
  s.appendChild(nodeBox(360,160,'Redis (RAM)',cBlue,cBlue));
  s.appendChild(nodeBox(600,80,'hijo fork',cTeal,cTeal));
  s.appendChild(nodeBox(600,240,'disco RDB/AOF',cOrange,cOrange));
  arrow(s,178,160,302,160,cGold,'comando');
  arrow(s,420,140,542,100,cTeal,'fork');
  arrow(s,600,102,600,218,cOrange,'escribe');
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const s=this.steps[this.idx];
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,4,s,this.cap,s);
  glowIdx(this.svg,[[0,1],[1],[1,2],[0,1,2,3]][this.idx]); svgCap(this.svg,this.titles[this.idx],320); flowOn(this.svg,this.playing&&!manual);
  this.idx++;
  if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; }
  if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,4); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1400); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,4); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',4,4,'<b>✓ Single instance.</b> Rápido y simple; SPOF si no hay HA.',this.cap,'Instancia única: memoria → fork → disco.'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,4,'Pulsa <b>Reproducir</b>: instancia única + persistencia.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animHA = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/5 · Primary.</b> Tiene replication ID + offset. Cada write avanza el offset.',
  '<b>Paso 2/5 · Réplica online.</b> Misma línea de ID: pide sync parcial (comandos faltantes).',
  '<b>Paso 3/5 · Réplica offline larga.</b> Sin ancestro común → full sync: RDB + buffer.',
  '<b>Paso 4/5 · Async.</b> El primary no espera ack: posible pérdida de writes recientes al failover.',
  '<b>Paso 5/5 · Promoción.</b> La réplica promovida obtiene nuevo replication ID (recuerda el anterior). ✓'
],
titles:['1/5 primary','2/5 partial','3/5 full','4/5 async','5/5 promote ✓'],
init(){ this.svg=$('#svgCheck'); svgDefs(this.svg);
  this.ch=animChrome('svgCheck',5,'Pulsa <b>Reproducir</b>: HA / replicación.');
  this.playBtn=document.querySelector('[onclick="animHA.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#checkCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,5,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(200,140,'primary',cBlue,cBlue));
  s.appendChild(nodeBox(520,80,'réplica A',cTeal,cTeal));
  s.appendChild(nodeBox(520,220,'réplica B',cTeal,cTeal));
  arrow(s,258,120,462,90,cTeal,'repl stream');
  arrow(s,258,160,462,220,cTeal,'repl stream');
  const t=el('text',{x:200,y:220,'text-anchor':'middle',class:'tedge'}); t.textContent='ID + offset'; s.append(t);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const s=this.steps[this.idx];
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,5,s,this.cap,s);
  glowIdx(this.svg,[[0],[0,1],[0,2],[0,1,2],[1]][this.idx]); svgCap(this.svg,this.titles[this.idx],330); flowOn(this.svg,this.playing&&!manual);
  this.idx++;
  if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; }
  if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,5); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,5); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',5,5,'<b>✓ HA.</b> Partial vs full sync; writes async → ventana de pérdida.',this.cap,'HA: ID + offset · partial/full · promote.'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,5,'Pulsa <b>Reproducir</b>: HA / replicación.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animSentinel = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/5 · Monitor.</b> Varios procesos Sentinel vigilan el primary (ping).',
  '<b>Paso 2/5 · Sospecha.</b> Un Sentinel deja de ver al primary y propone “subjectively down”.',
  '<b>Paso 3/5 · Quorum.</b> Si ≥ quorum (ej. 2 de 3) están de acuerdo → objectively down.',
  '<b>Paso 4/5 · Failover.</b> Eligen una réplica y la promueven a primary.',
  '<b>Paso 5/5 · Discovery.</b> Clientes preguntan a Sentinel quién es el primary actual. ✓'
],
titles:['1/5 monitor','2/5 SDOWN','3/5 quorum','4/5 failover','5/5 discovery ✓'],
init(){ this.svg=$('#svgEnemy'); svgDefs(this.svg);
  this.ch=animChrome('svgEnemy',5,'Pulsa <b>Reproducir</b>: Sentinel + quorum.');
  this.playBtn=document.querySelector('[onclick="animSentinel.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#enemyCaption'); this.draw();
  animSetUI(this.ch,this.playBtn,'idle',0,5,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(360,50,'primary',cBlue,cBlue));
  s.appendChild(nodeBox(140,180,'Sentinel 1',cOrange,cOrange));
  s.appendChild(nodeBox(360,180,'Sentinel 2',cOrange,cOrange));
  s.appendChild(nodeBox(580,180,'Sentinel 3',cOrange,cOrange));
  s.appendChild(nodeBox(360,280,'réplica → new primary',cTeal,cTeal));
  arrow(s,200,160,320,72,cDim,'ping');
  arrow(s,360,158,360,72,cDim,'ping');
  arrow(s,520,160,400,72,cDim,'ping');
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const s=this.steps[this.idx];
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,5,s,this.cap,s);
  glowIdx(this.svg,[[1,2,3],[1],[1,2],[4],[1,2,3]][this.idx]); svgCap(this.svg,this.titles[this.idx],310); flowOn(this.svg,this.playing&&!manual);
  this.idx++;
  if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; }
  if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,5); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1400); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,5); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false);
  animSetUI(this.ch,this.playBtn,'done',5,5,'<b>✓ Sentinel.</b> Monitor · quorum · failover · discovery. ≥3 nodos, quorum 2.',this.cap,'Sentinel: votos → promote → clients.'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(); animSetUI(this.ch,this.playBtn,'idle',0,5,'Pulsa <b>Reproducir</b>: Sentinel + quorum.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animCluster = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/5 · 16K slots.</b> El keyspace se divide en 16384 hashslots (no “hash % N nodos”).',
  '<b>Paso 2/5 · Mapeo.</b> clave → CRC16 → slot → nodo (M1 tiene 0–8191, M2 8192–16383).',
  '<b>Paso 3/5 · Añadir M3.</b> Se migran rangos de slots a M3; las keys no se rehashean una a una.',
  '<b>Paso 4/5 · Gossip.</b> Los nodos comparten salud del cluster; mal configurado → split brain.',
  '<b>Paso 5/5 · Regla.</b> Primarios impares + 2 réplicas c/u mitigan particiones. ✓'
],
titles:['1/5 16K','2/5 map','3/5 reshard','4/5 gossip','5/5 odd ✓'],
init(){ this.svg=$('#svgZookie'); svgDefs(this.svg);
  this.ch=animChrome('svgZookie',5,'Pulsa <b>Reproducir</b>: Cluster hashslots.');
  this.playBtn=document.querySelector('[onclick="animCluster.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#zookieCaption'); this.draw(false);
  animSetUI(this.ch,this.playBtn,'idle',0,5,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(withM3){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(160,140,'M1 slots',cBlue,cBlue));
  s.appendChild(nodeBox(360,140,'M2 slots',cTeal,cTeal));
  if(withM3) s.appendChild(nodeBox(560,140,'M3 slots',cOrange,cOrange));
  else s.appendChild(nodeBox(560,140,'(vacío)',cDim,cDim));
  const t=el('text',{x:360,y:60,'text-anchor':'middle',class:'tnode'}); t.textContent='16384 hashslots'; s.append(t);
  const t2=el('text',{x:360,y:250,'text-anchor':'middle',class:'tedge'}); t2.textContent=withM3?'slots migrados a M3':'clave → slot → shard'; s.append(t2);
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const s=this.steps[this.idx];
  if(this.idx>=2) this.draw(true); else this.draw(false);
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,5,s,this.cap,s);
  glowIdx(this.svg,[[0,1],[0],[0,1,2],[0,1,2],[0,1,2]][this.idx]); svgCap(this.svg,this.titles[this.idx],300); flowOn(this.svg,this.playing&&!manual);
  this.idx++;
  if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; }
  if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,5); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,5); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false); this.draw(true);
  animSetUI(this.ch,this.playBtn,'done',5,5,'<b>✓ Cluster.</b> Reshard = mover slots. Gossip + odd primaries.',this.cap,'Cluster: 16K slots · reshard · gossip.'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(false); animSetUI(this.ch,this.playBtn,'idle',0,5,'Pulsa <b>Reproducir</b>: Cluster hashslots.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };

const animFork = { idx:0, timer:null, playing:false,
steps:[
  '<b>Paso 1/4 · Padre.</b> Redis padre sirve tráfico; decide hacer snapshot (RDB) o reescribir AOF.',
  '<b>Paso 2/4 · Fork.</b> Se crea un hijo que comparte las mismas páginas de memoria (virtual).',
  '<b>Paso 3/4 · COW.</b> Si el padre escribe una página, el kernel copia esa página: el hijo sigue viendo el snapshot.',
  '<b>Paso 4/4 · Disco.</b> El hijo vuelca el snapshot / AOF y termina. El padre nunca dejó de servir. ✓'
],
titles:['1/4 padre','2/4 fork','3/4 COW','4/4 disco ✓'],
init(){ this.svg=$('#svgArch'); svgDefs(this.svg);
  this.ch=animChrome('svgArch',4,'Pulsa <b>Reproducir</b>: fork + copy-on-write.');
  this.playBtn=document.querySelector('[onclick="animFork.play()"]'); this.playBtn._idleLabel=this.playBtn.innerHTML;
  this.cap=$('#archCaption'); this.draw(0);
  animSetUI(this.ch,this.playBtn,'idle',0,4,null,this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); },
draw(phase){ const s=this.svg; s.innerHTML=''; svgDefs(s);
  s.appendChild(nodeBox(200,120,'padre Redis',cBlue,cBlue));
  s.appendChild(nodeBox(520,120,phase>=1?'hijo (fork)':'(sin hijo)',phase>=1?cTeal:cDim,phase>=1?cTeal:cDim));
  s.appendChild(nodeBox(360,250,phase>=3?'disco RDB/AOF':'páginas compartidas',phase>=3?cOrange:cGold,phase>=3?cOrange:cGold));
  if(phase>=1) arrow(s,258,120,462,120,cTeal,'fork');
  if(phase>=2){ const t=el('text',{x:360,y:180,'text-anchor':'middle',class:'tedge'}); t.textContent=phase>=2?'COW: write → copia página':''; s.append(t); }
  if(phase>=3) arrow(s,520,142,420,228,cOrange,'vuelca');
},
advance(manual){ if(this.idx>=this.steps.length) return;
  const s=this.steps[this.idx];
  this.draw(this.idx+1);
  animSetUI(this.ch,this.playBtn,(this.playing&&!manual)?'playing':'paused',this.idx+1,4,s,this.cap,s);
  svgCap(this.svg,this.titles[this.idx],320); flowOn(this.svg,this.playing&&!manual);
  this.idx++;
  if(this.idx>=this.steps.length) this.finish(); },
play(){ if(this.playing){ this.pause(); return; }
  if(this.idx>=this.steps.length) this.reset();
  this.playing=true; animSetUI(this.ch,this.playBtn,'playing',this.idx,4); flowOn(this.svg,true);
  const self=this; this.timer=setInterval(function(){ self.advance(false); },1500); },
pause(){ this.playing=false; if(this.timer) clearInterval(this.timer); this.timer=null; flowOn(this.svg,false); animSetUI(this.ch,this.playBtn,'paused',this.idx,4); },
step(){ if(this.playing) this.pause(); this.advance(true); },
finish(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; flowOn(this.svg,false); this.draw(4);
  animSetUI(this.ch,this.playBtn,'done',4,4,'<b>✓ Fork+COW.</b> Snapshot sin duplicar toda la RAM; writes del padre pagan páginas nuevas.',this.cap,'Fork + copy-on-write ✓.'); },
reset(){ if(this.timer) clearInterval(this.timer); this.timer=null; this.playing=false; this.idx=0; this.draw(0); animSetUI(this.ch,this.playBtn,'idle',0,4,'Pulsa <b>Reproducir</b>: fork + copy-on-write.',this.cap,'Pulsa "Siguiente paso" o "Reproducir".'); } };
