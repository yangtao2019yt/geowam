'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const taskVideo=$('#unified-video'), tasks=window.GEOWAM_TASKS;
let taskIndex=0,autoCycle=!reduced;
let playbackRate=.75;
taskVideo.defaultPlaybackRate=playbackRate;taskVideo.playbackRate=playbackRate;
const clock=t=>`${Number.isFinite(t)?t.toFixed(1):'0.0'} s`;
function syncTaskControls(){
  $('#unified-play').textContent=taskVideo.paused?'▶':'Ⅱ';
  $('#unified-play').setAttribute('aria-label',taskVideo.paused?'Play animation':'Pause animation');
  $('#unified-clock').textContent=clock(taskVideo.currentTime);
  $('#unified-duration').textContent=clock(taskVideo.duration);
  $('#unified-range').value=taskVideo.duration?Math.round(taskVideo.currentTime/taskVideo.duration*1000):0;
}
function selectTask(index,play=true){
  taskIndex=(index+tasks.length)%tasks.length;
  const t=tasks[taskIndex]; taskVideo.src=t.src;taskVideo.poster=t.poster;
  taskVideo.defaultPlaybackRate=playbackRate;taskVideo.playbackRate=playbackRate;
  $('#unified-suite').textContent=t.suite;$('#unified-title').textContent=t.title;
  $$('#unified-tasks button').forEach((b,i)=>{b.classList.toggle('active',i===taskIndex);b.setAttribute('aria-pressed',String(i===taskIndex))});
  if(play)taskVideo.play().catch(()=>syncTaskControls());syncTaskControls();
}
$('#unified-tasks').innerHTML=tasks.map((t,i)=>`<button data-task="${i}" class="${i===0?'active':''}" aria-pressed="${i===0}"><span>0${i+1}</span>${t.suite}<small>↗</small></button>`).join('');
$$('[data-task]').forEach(b=>b.addEventListener('click',()=>selectTask(+b.dataset.task)));
$('#unified-play').addEventListener('click',()=>taskVideo.paused?taskVideo.play():taskVideo.pause());
$('#unified-range').addEventListener('input',e=>{if(taskVideo.duration)taskVideo.currentTime=taskVideo.duration*(+e.target.value/1000)});
$('#unified-speed').addEventListener('change',e=>{playbackRate=+e.target.value;taskVideo.defaultPlaybackRate=playbackRate;taskVideo.playbackRate=playbackRate});
$('#unified-auto').addEventListener('click',()=>{autoCycle=!autoCycle;$('#unified-auto').textContent=autoCycle?'Auto-cycle on':'Auto-cycle off';$('#unified-auto').setAttribute('aria-pressed',String(autoCycle))});
for(const event of ['timeupdate','loadedmetadata','play','pause'])taskVideo.addEventListener(event,syncTaskControls);
taskVideo.addEventListener('ended',()=>{if(autoCycle)selectTask(taskIndex+1);else{taskVideo.currentTime=0;taskVideo.play().catch(()=>{})}});
if(reduced){taskVideo.autoplay=false;taskVideo.pause();$('#unified-auto').textContent='Auto-cycle off';$('#unified-auto').setAttribute('aria-pressed','false')}
syncTaskControls();
const benchmarks={libero:[['GeoWAM / policy',97.85,true],['Fast-WAM',97.6,false],['Cosmos3-Edge',94.4,false],['π₀',94.2,false]],plus:[['GeoWAM / policy',80.95,true],['Fast-WAM',51.5,false],['π₀',53.6,false]]};
function renderBenchmark(key){$('#benchmark-bars').innerHTML=benchmarks[key].map(([name,val,ours])=>`<div class="bar-row ${ours?'ours':''}"><span class="bar-label">${name}</span><div class="bar-track"><div class="bar-fill" style="--value:${val}%"></div></div><span class="bar-value">${ours?val.toFixed(2):val.toFixed(1)}%</span></div>`).join('');$('#chart-note').textContent=key==='libero'?'Selected published reference configurations; training protocols differ. Our score: 2,000 standard episodes.':'Our score covers all 10,030 Plus variants. Baseline values are reported reference results; Cosmos3’s 56-case diagnostic is shown separately below.';$$('[data-benchmark]').forEach(b=>{b.classList.toggle('active',b.dataset.benchmark===key);b.setAttribute('aria-pressed',b.dataset.benchmark===key)})}
$$('[data-benchmark]').forEach(b=>b.addEventListener('click',()=>renderBenchmark(b.dataset.benchmark)));renderBenchmark('libero');
const families=[['Robot initialization',62.06],['Camera viewpoint',68.36],['Object layout',78.95],['Background texture',82.81],['Sensor noise',84.70],['Lighting',95.97],['Language / ID control',98.70]];
$('#perturbation-bars').innerHTML=families.map(([n,v])=>`<div class="perturb-row"><div><span>${n}</span><strong>${v.toFixed(2)}%</strong></div><div class="perturb-track"><div class="perturb-fill" style="width:${v}%"></div></div></div>`).join('');
const comparisonVideo=$('#comparison-video'),comparisons=window.GEOWAM_PERTURBATIONS;
let comparisonIndex=0,comparisonSeek=0,comparisonPlayOnLoad=false,comparisonStarted=false;
function seekComparison(time,play=true){
  comparisonSeek=time;
  if(comparisonVideo.readyState>=1){comparisonVideo.currentTime=time;if(play)comparisonVideo.play().catch(()=>{})}
  else comparisonPlayOnLoad=play;
}
function selectComparison(index){
  comparisonIndex=index;
  const item=comparisons[index];
  comparisonSeek=item.preview_start;comparisonPlayOnLoad=!reduced;
  comparisonVideo.src=item.src;comparisonVideo.poster=item.poster;
  comparisonVideo.defaultPlaybackRate=.75;comparisonVideo.playbackRate=.75;
  $('#comparison-title').textContent=item.title;
  $('#comparison-event-label').textContent=`Disturbance at ${item.event_seconds.toFixed(1)} s`;
  $('#comparison-perturbation').textContent='Perturbed · '+item.perturbation;
  $$('[data-comparison]').forEach(b=>{const active=+b.dataset.comparison===index;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}
comparisonVideo.addEventListener('loadedmetadata',()=>{comparisonVideo.currentTime=comparisonSeek;if(comparisonPlayOnLoad)comparisonVideo.play().catch(()=>{})});
$$('[data-comparison]').forEach(b=>b.addEventListener('click',()=>selectComparison(+b.dataset.comparison)));
$('#comparison-event').addEventListener('click',()=>seekComparison(comparisons[comparisonIndex].preview_start));
$('#comparison-start').addEventListener('click',()=>seekComparison(0));
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting){comparisonVideo.pause();return}if(!comparisonStarted&&!reduced){comparisonStarted=true;seekComparison(comparisons[comparisonIndex].preview_start)}},{threshold:.25}).observe(comparisonVideo);
selectComparison(0);comparisonPlayOnLoad=false;
function setGeometry(key){$$('[data-geometry]').forEach(b=>{const active=b.dataset.geometry===key;b.classList.toggle('active',active);b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1;$('#geometry-'+b.dataset.geometry).hidden=!active});$$('.geometry-panel video').forEach(v=>v.pause())}
$$('[data-geometry]').forEach((b,i)=>{b.addEventListener('click',()=>setGeometry(b.dataset.geometry));b.addEventListener('keydown',e=>{const tabs=$$('[data-geometry]');if(['ArrowRight','ArrowLeft','Home','End'].includes(e.key)){e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?tabs.length-1:(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;setGeometry(tabs[n].dataset.geometry);tabs[n].focus()}})});
let task='0',cycle=0,gamPlaying=!reduced,gamVisible=false,gamTimer,gamRenderVersion=0;
const gamTasks=Object.keys(window.GEOWAM_EVIDENCE.gam);
async function renderGam(){
  const version=++gamRenderVersion,selectedTask=task,selectedCycle=cycle;
  const base=`assets/gam/task${selectedTask}/`;
  const frames=[['gam-rgb','rgb'],['gam-baseline','gam'],['gam-ours','ours']].map(([id,name])=>{
    const image=new Image();image.src=base+name+'_'+selectedCycle+'.webp';return{id,image};
  });
  try{await Promise.all(frames.map(({image})=>image.decode()))}catch{return}
  if(version!==gamRenderVersion)return;
  frames.forEach(({id,image})=>{$('#'+id).src=image.src});
  const d=window.GEOWAM_EVIDENCE.gam[selectedTask].cycles[selectedCycle];
  $('#gam-error').textContent=`H8 · ${((selectedCycle+1)*.4).toFixed(1)} s · AbsRel: GAM ${d.gam.toFixed(4)} / S12 ${d.ours.toFixed(4)}`;
  $('#gam-task').value=selectedTask;
  $$('[data-cycle]').forEach(b=>{const active=+b.dataset.cycle===selectedCycle;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
}
function scheduleGam(){
  clearTimeout(gamTimer);
  if(!gamPlaying||!gamVisible||document.hidden)return;
  gamTimer=setTimeout(async()=>{
    cycle++;
    if(cycle>=window.GEOWAM_EVIDENCE.gam[task].cycles.length){cycle=0;task=gamTasks[(gamTasks.indexOf(task)+1)%gamTasks.length]}
    await renderGam();scheduleGam();
  },1600);
}
$('#gam-task').addEventListener('change',async e=>{task=e.target.value;cycle=0;await renderGam();scheduleGam()});
$$('[data-cycle]').forEach(b=>b.addEventListener('click',async()=>{cycle=+b.dataset.cycle;await renderGam();scheduleGam()}));
$('#gam-play').addEventListener('click',()=>{gamPlaying=!gamPlaying;$('#gam-play').textContent=gamPlaying?'Ⅱ Pause':'▶ Play';$('#gam-play').setAttribute('aria-label',gamPlaying?'Pause prediction carousel':'Play prediction carousel');scheduleGam()});
if(reduced){$('#gam-play').textContent='▶ Play';$('#gam-play').setAttribute('aria-label','Play prediction carousel')}
new IntersectionObserver(entries=>{gamVisible=entries[0].isIntersecting;scheduleGam()},{threshold:.15}).observe($('#geometry-gam'));
document.addEventListener('visibilitychange',scheduleGam);
renderGam();
if(reduced)$$('video[autoplay]').forEach(v=>{v.autoplay=false;v.pause()});
