
/* Independent, opt-in collaborative cursor rebuild visualization. */
(function(){
"use strict";
if(document.getElementById("swarm-replay"))return;
const motionPreference=window.matchMedia("(prefers-reduced-motion: reduce)");
const trigger=document.createElement("button");
trigger.type="button";trigger.id="swarm-replay";trigger.className="swarm-replay";
trigger.setAttribute("aria-label","Watch the portfolio rebuild animation");
trigger.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5h6v6H5zM13 13h6v6h-6zM13 5h6M5 16h6M16 2v6M2 8h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 13l3-3" stroke="currentColor" stroke-width="1.5"/></svg><span>Watch Rebuild</span>';
const layer=document.createElement("div");
layer.id="swarm-cover";layer.className="swarm-cover";layer.hidden=true;
layer.setAttribute("role","dialog");layer.setAttribute("aria-modal","true");
layer.setAttribute("aria-label","Portfolio rebuild animation");
layer.innerHTML=
'<div class="swarm-head"><div class="swarm-head-left"><span class="swarm-head-mark">N.</span><span class="swarm-head-title"><strong>PORTFOLIO / REBUILD</strong><small>CURSORS AT WORK</small></span></div><button class="swarm-skip" type="button">Skip animation ↗</button></div>'+
'<div class="swarm-browser">'+
 '<div class="swarm-browser-top"><div class="swarm-dots"><i></i><i></i><i></i></div><div class="swarm-url">nafis-tamim.github.io</div><div class="swarm-live-indicator">PREVIEW</div></div>'+
 '<div class="swarm-preview">'+
  '<div class="swarm-preview-top"><div class="swarm-preview-brand swarm-piece" data-stage="0">NAFIS <b>TAMIM.</b></div><div class="swarm-preview-menu swarm-piece" data-stage="0"><span>Projects</span><span>Research</span><span>Awards</span><span>Contact ↗</span></div></div>'+
  '<div class="swarm-hero"><div class="swarm-copy">'+
    '<div class="swarm-eyebrow swarm-piece" data-stage="1">STUDENT / RESEARCH / DESIGN</div>'+
    '<h2 class="swarm-piece" data-stage="1" id="swarm-name">Nafis <span>Tamim.</span></h2>'+
    '<p class="swarm-intro swarm-piece" data-stage="2" id="swarm-intro"></p>'+
    '<div class="swarm-hero-actions swarm-piece" data-stage="2"><span class="swarm-faux-btn">EXPLORE WORK ↗</span><span class="swarm-faux-btn swarm-faux-btn-secondary">RESEARCH</span></div>'+
   '</div><div class="swarm-portrait swarm-piece" data-stage="2"><img id="swarm-photo" alt="Portfolio portrait preview"></div></div>'+
  '<div class="swarm-cards">'+
   '<div class="swarm-card swarm-piece" data-stage="3"><small>01 / RESEARCH</small><strong>Independent inquiry</strong></div>'+
   '<div class="swarm-card swarm-piece" data-stage="3"><small>02 / AWARDS</small><strong>Recognition</strong></div>'+
   '<div class="swarm-card swarm-piece" data-stage="3"><small>03 / LEARNING</small><strong>Courses &amp; certificates</strong></div>'+
  '</div>'+
  '<div class="swarm-bottom-line swarm-piece" data-stage="4"><span>PERSONAL PORTFOLIO / 2026</span><span>DESIGNED TO EXPLORE ↗</span></div>'+
 '</div></div>'+
'<div class="swarm-progress"><span id="swarm-status" role="status" aria-live="polite">PREPARING CANVAS</span><div class="swarm-progress-track"><i class="swarm-progress-fill"></i></div><strong id="swarm-percent">0%</strong></div>'+
'<div class="swarm-cursor-layer" aria-hidden="true"></div>';
document.body.append(trigger,layer);
const playButton=trigger;
const skipButton=layer.querySelector(".swarm-skip");
const progress=layer.querySelector(".swarm-progress-fill");
const percent=layer.querySelector("#swarm-percent");
const status=layer.querySelector("#swarm-status");
const indicator=layer.querySelector(".swarm-live-indicator");
const cursorLayer=layer.querySelector(".swarm-cursor-layer");
const stages=["STRUCTURE / GRID","TYPOGRAPHY / HEADLINE","MEDIA / CONTENT","SECTIONS / CARDS","FINAL DETAILS / PUBLISH"];
const agents=[
 {name:"Layout",color:"#4c6ef5",x:.12,y:.82},
 {name:"Type",color:"#e65b97",x:.9,y:.13},
 {name:"Media",color:"#329c81",x:.66,y:.87},
 {name:"Style",color:"#aa71e8",x:.22,y:.24},
 {name:"Motion",color:"#e58b40",x:.83,y:.65},
 {name:"Review",color:"#507d9b",x:.5,y:.04}
];
const cursors=agents.map(function(agent){
 const node=document.createElement("div");node.className="swarm-cursor";
 node.style.setProperty("--sc",agent.color);
 node.innerHTML='<svg viewBox="0 0 24 29" aria-hidden="true"><path d="M2 2v21l6-6 4.3 9 4.3-2.1-4.1-8.5 8.5-.7L2 2z" fill="white" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg><span class="swarm-cursor-label">'+agent.name+'</span>';
 cursorLayer.appendChild(node);
 return {node:node,initialX:agent.x,initialY:agent.y,x:0,y:0};
});
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let runId=0,active=false,previousOverflow="",returnFocus=null;
function setProgress(p,title){
 progress.style.width=Math.max(0,Math.min(p,100))+"%";
 percent.textContent=String(Math.round(p))+"%";
 status.textContent=title;
}
function fillPreview(){
 const title=document.querySelector(".hero h1");
 const name=(title&&title.textContent.trim())||"Nafis Tamim";
 const words=name.split(/\s+/);
 const headline=layer.querySelector("#swarm-name");
 headline.textContent="";
 const first=document.createTextNode(words.slice(0,-1).join(" ")||words[0]);
 const last=document.createElement("span");
 last.textContent=(words.length>1?words[words.length-1]:"")+".";
 headline.append(first,document.createTextNode(" "),last);
 const intro=document.querySelector(".hero-intro .lead");
 const text=(intro&&intro.textContent.trim())||"Research, academic work and creative projects.";
 layer.querySelector("#swarm-intro").textContent=text.slice(0,225);
 const portrait=document.querySelector(".hero-window img");
 const preview=layer.querySelector("#swarm-photo");
 if(portrait&&portrait.getAttribute("src"))preview.src=portrait.getAttribute("src");
 else preview.src="/favicon.png";
}
function reset(){
 layer.classList.remove("is-finishing","is-active");
 layer.querySelectorAll(".swarm-piece").forEach(el=>el.classList.remove("is-built"));
 indicator.classList.remove("is-live");
 indicator.textContent="PREVIEW";
 setProgress(0,"PREPARING CANVAS");
 cursors.forEach(c=>{
  c.x=c.initialX*window.innerWidth;c.y=c.initialY*window.innerHeight;
  c.node.style.transition="none";
  c.node.style.transform="translate3d("+c.x+"px,"+c.y+"px,0)";
  c.node.style.opacity="0";
 });
}
function close(){
 if(!active)return;
 ++runId;active=false;
 layer.classList.remove("is-active","is-finishing");
 document.documentElement.style.overflow=previousOverflow;
 layer.hidden=true;playButton.hidden=false;
 reset();
 if(returnFocus&&typeof returnFocus.focus==="function")returnFocus.focus({preventScroll:true});
}
function moveCursor(cursor,target,offset){
 const r=target.getBoundingClientRect();
 const nextX=Math.max(8,Math.min(window.innerWidth-98,r.left+r.width*(.16+((offset%3)*.26))));
 const nextY=Math.max(8,Math.min(window.innerHeight-50,r.top+Math.min(32,r.height*.42)+((offset%2)*12)));
 const startX=cursor.x,startY=cursor.y;
 cursor.x=nextX;cursor.y=nextY;
 const node=cursor.node;
 node.style.opacity="1";
 if(typeof node.animate!=="function"){
  node.style.transform="translate3d("+nextX+"px,"+nextY+"px,0)";
  return wait(460);
 }
 const animation=node.animate([
 {transform:"translate3d("+startX+"px,"+startY+"px,0)",offset:0},
 {transform:"translate3d("+((startX+nextX)/2-12)+"px,"+((startY+nextY)/2-18)+"px,0)",offset:.53},
 {transform:"translate3d("+nextX+"px,"+nextY+"px,0)",offset:1}
 ],{duration:530+(offset%3)*90,easing:"cubic-bezier(.28,.7,.2,1)",fill:"forwards"});
 return animation.finished.catch(function(){}).then(function(){
  node.style.transform="translate3d("+nextX+"px,"+nextY+"px,0)";
  animation.cancel();
 });
}
async function rebuild(){
 if(active)return;
 active=true;
 const id=++runId;
 returnFocus=document.activeElement||playButton;
 previousOverflow=document.documentElement.style.overflow;
 document.documentElement.style.overflow="hidden";
 fillPreview();reset();layer.hidden=false;
 playButton.hidden=true;
 // A separate full-screen layer simulates reconstruction; the original DOM is untouched.
 await new Promise(resolve=>requestAnimationFrame(()=>{layer.classList.add("is-active");resolve()}));
 if(id!==runId)return;
 if(motionPreference.matches){
  layer.querySelectorAll(".swarm-piece").forEach(el=>el.classList.add("is-built"));
  indicator.classList.add("is-live");indicator.textContent="LIVE";
  setProgress(100,"PREVIEW COMPLETE");
  await wait(850);if(id===runId)close();return;
 }
 await wait(350);if(id!==runId)return;
 for(let phase=0;phase<stages.length;phase++){
  if(id!==runId)return;
  const elements=[...layer.querySelectorAll('[data-stage="'+phase+'"]')];
  setProgress(phase*20,stages[phase]);
  await Promise.all(cursors.map(async function(cursor,index){
   const el=elements[index%elements.length];
   await moveCursor(cursor,el,index+phase);
   if(id!==runId)return;
   if(index<elements.length)el.classList.add("is-built");
  }));
  if(id!==runId)return;
  elements.forEach(el=>el.classList.add("is-built"));
  setProgress((phase+1)*20,stages[phase]);
  await wait(170);
 }
 if(id!==runId)return;
 layer.classList.add("is-finishing");
 indicator.classList.add("is-live");indicator.textContent="LIVE";
 setProgress(100,"REBUILD COMPLETE / GO LIVE");
 await wait(980);
 if(id===runId)close();
}
playButton.addEventListener("click",rebuild);
skipButton.addEventListener("click",close);
document.addEventListener("keydown",e=>{
 if(!active)return;
 if(e.key==="Escape"){e.preventDefault();close()}
 if(e.key==="Tab"){
  // Only the Skip button is interactive while the reconstruction overlay is open.
  e.preventDefault();skipButton.focus({preventScroll:true});
 }
});
})();
