/* Live-page cursor swarm. Original portfolio, links, GSAP and scrolling stay intact. */
(function(){
"use strict";
if(window.__ntSwarmV4)return;
window.__ntSwarmV4=true;
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
if(reduced.matches||location.hash||new URLSearchParams(location.search).has("skipintro"))return;
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const COLORS=["#5079ff","#ed6c99","#28b49f","#9c72eb","#ed994a","#4ba8d3","#eb6957","#9cbf49","#dfb64a","#7785f1","#28c8bd","#fd8b78","#388be1","#c96bbf","#49bf86","#b39353"];
const NAMES=["Layout","Type","Media","Motion","Spacing","Review","Grid","Content","Color","Research","Assets","Systems","Awards","Images","Design","QA"];
const LAYOUT=[
 ["hero",[".hdr-brand",".hdr-nav",".hdr-cta","#hero .hero-word","#hero .hero-window","#hero .hero-intro","#hero .hero-aim","#hero .hero-stage"]],
 ["about",["#about .about-title","#about .about-photo","#about .about-copy","#about .facts .fact"]],
 ["principles",["#principles .pr-head","#principles .pr-list .principle"]],
 ["academics",["#academics .pc-head","#academics .steps .step"]],
 ["achievements",["#achievements .svc-head","#achievements .nt-award-category","#achievements .svc-list .svc"]],
 ["certifications",["#certifications .nt-cert-intro","#certifications .nt-cert-list .nt-cert"]],
 ["projects",["#projects .tm-head","#projects .tm-grid .person","#projects .tm-foot"]],
 ["interests",["#interests .sc-head","#interests .sc-list .sector"]],
 ["research",["#research .jr-head","#research .jr-list .post"]],
 ["faq",["#faq .fq-head","#faq .fq-list .fq"]],
 ["contact",["#contact .ct-title","#contact .ct-details","#contact .ct-form"]]
];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const rnd=(a,b)=>a+Math.random()*(b-a);
function add(name,parent,tag){
 const el=document.createElement(tag||"div");
 el.className=name;(parent||document.body).appendChild(el);return el
}
function gather(){
 const all=[],groups=[],seen=new Set(),mobile=innerWidth<700;
 for(const [id,selectors] of LAYOUT){
  const root=document.getElementById(id);if(!root)continue;
  if(mobile&&!["hero","about","academics","achievements","projects","research","contact"].includes(id))continue;
  const chosen=[];
  for(const selector of selectors){
   for(const el of $$(selector)){
    if(seen.has(el)||el.hidden)continue;
    const s=getComputedStyle(el),r=el.getBoundingClientRect();
    if(s.display==="none"||r.width<18||r.height<7)continue;
    if(chosen.some(x=>x.contains(el)||el.contains(x)))continue;
    chosen.push(el);seen.add(el);
   }
  }
  const items=chosen.slice(0,mobile?7:14);
  if(items.length){groups.push({id,root,items});all.push(...items)}
 }
 const footer=$(".ftr-word");
 if(!mobile&&footer&&footer.getBoundingClientRect().height>0){
  groups.push({id:"footer",root:footer,items:[footer]});
  all.push(footer);
 }
 return {all,groups};
}
let active=null,serial=0;
function running(id){return active&&active.id===id&&!active.stopped}
function scrollDestination(node){
 const offset=node.id==="hero"?0:Math.min(85,innerHeight*.1);
 return clamp(node.getBoundingClientRect().top+scrollY-offset,0,Math.max(0,document.documentElement.scrollHeight-innerHeight))
}
function glide(dest,duration,id){
 return new Promise(resolve=>{
  const begin=performance.now(),start=scrollY,dist=dest-start;
  if(Math.abs(dist)<5){scrollTo(0,dest);resolve();return}
  function step(now){
   if(!running(id)){resolve();return}
   const t=clamp((now-begin)/duration,0,1);
   const ease=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
   scrollTo(0,start+dist*ease);
   if(t<1)requestAnimationFrame(step);else resolve();
  }
  requestAnimationFrame(step);
 })
}
function pointer(canvas,index){
 const el=add("swarm-agent",canvas);
 el.style.setProperty("--ac",COLORS[index%COLORS.length]);
 el.innerHTML='<svg viewBox="0 0 20 25" aria-hidden="true"><path d="M2 1.5v19.3l5.4-5.3 3.6 7.2 4-1.8-3.8-7.2 7.2-.6L2 1.5z" fill="currentColor" stroke="#fff" stroke-width="1.25" stroke-linejoin="round"/></svg><span class="swarm-agent-name">'+NAMES[index%NAMES.length]+'</span>';
 const p={el,x:rnd(35,Math.max(45,innerWidth-55)),y:rnd(40,Math.max(60,innerHeight-60)),color:COLORS[index%COLORS.length]};
 el.style.transform="translate3d("+p.x+"px,"+p.y+"px,0)";
 return p;
}
function move(p,x,y,id,ms){
 const x2=clamp(x,2,innerWidth-65),y2=clamp(y,2,innerHeight-38);
 const sx=p.x,sy=p.y;p.x=x2;p.y=y2;
 p.el.style.opacity="1";p.el.classList.add("working");
 return new Promise(resolve=>{
  if(!running(id)){resolve();return}
  if(!p.el.animate){p.el.style.transform="translate3d("+x2+"px,"+y2+"px,0)";resolve();return}
  const anim=p.el.animate([
   {transform:"translate3d("+sx+"px,"+sy+"px,0)"},
   {transform:"translate3d("+((sx+x2)/2+rnd(-17,17))+"px,"+((sy+y2)/2+rnd(-18,18))+"px,0)",offset:.55},
   {transform:"translate3d("+x2+"px,"+y2+"px,0)"}
  ],{duration:ms,easing:"cubic-bezier(.2,.7,.28,1)",fill:"forwards"});
  anim.finished.catch(()=>{}).then(()=>{p.el.style.transform="translate3d("+x2+"px,"+y2+"px,0)";anim.cancel();resolve()})
 })
}
function selection(el,canvas,index){
 const r=el.getBoundingClientRect();
 if(r.bottom<76||r.top>innerHeight-35||r.width<16||r.height<7)return null;
 const left=clamp(r.left,1,innerWidth-2),right=clamp(r.right,1,innerWidth-1);
 const top=clamp(r.top,68,innerHeight-18),bottom=clamp(r.bottom,68,innerHeight-4);
 if(right-left<15||bottom-top<7)return null;
 const div=add("swarm-outline",canvas);
 div.style.left=left+"px";div.style.top=top+"px";
 div.style.width=(right-left)+"px";div.style.height=(bottom-top)+"px";
 div.style.setProperty("--oc",COLORS[index%COLORS.length]);
 let label=el.matches("h1,h2,h3")?"TEXT":el.matches("figure,img")?"IMAGE":el.matches("li,article")?"COMPONENT":el.matches("form")?"FORM":"FRAME";
 div.dataset.label=label+" / "+Math.round(r.width)+" × "+Math.round(r.height);
 for(let k=0;k<4;k++)add("swarm-handle",div,"span");
 requestAnimationFrame(()=>div.classList.add("on"));
 return div;
}
function ping(canvas,x,y,color){
 const d=add("swarm-ping",canvas);
 d.style.left=x+"px";d.style.top=y+"px";d.style.setProperty("--pc",color);
 setTimeout(()=>d.remove(),560);
}
function setProgress(ctx,message){
 const percent=Math.round(ctx.finished/ctx.all.length*100);
 ctx.bar.style.width=percent+"%";
 ctx.percent.textContent=percent+"%";
 ctx.counter.textContent=ctx.finished+" / "+ctx.all.length+" layers";
 ctx.phase.textContent=message;
}
async function batch(ctx,items,id){
 if(!running(id))return;
 const frames=[],jobs=[];
 items.forEach((el,i)=>{
  const r=el.getBoundingClientRect(),frame=selection(el,ctx.canvas,ctx.finished+i);
  if(frame)frames.push(frame);
  const x=r.left+clamp(r.width*.22,12,Math.max(12,r.width-12));
  const y=r.top+clamp(r.height*.27,8,Math.max(8,r.height-10));
  if(frame){
   const p=ctx.pointers[(ctx.next+i)%ctx.pointers.length];
   jobs.push(move(p,x,y,id,260+(i%3)*55).then(()=>{
    if(running(id))ping(ctx.canvas,clamp(x,0,innerWidth-8),clamp(y,0,innerHeight-8),p.color);
   }))
  }
 });
 ctx.next+=items.length;
 await Promise.all(jobs);
 if(!running(id))return;
 items.forEach(el=>el.classList.add("swarm-build-complete"));
 ctx.finished+=items.length;
 setProgress(ctx,"BUILD / "+ctx.section.toUpperCase());
 await delay(120);
 frames.forEach(f=>{f.classList.remove("on");setTimeout(()=>f.remove(),200)});
}
function stop(ctx,restore){
 if(!ctx||ctx.stopped)return;
 ctx.stopped=true;serial++;
 document.body.classList.remove("swarm-is-building");
 ctx.all.forEach(el=>el.classList.remove("swarm-build-target","swarm-build-complete"));
 document.documentElement.style.scrollBehavior=ctx.beforeBehavior;
 document.documentElement.style.overscrollBehavior=ctx.beforeOverscroll;
 document.removeEventListener("keydown",ctx.key,true);
 document.removeEventListener("wheel",ctx.prevent,true);
 document.removeEventListener("touchmove",ctx.prevent,true);
 document.removeEventListener("visibilitychange",ctx.visibility);
 if(restore!==false){
  scrollTo(0,ctx.originalTop);
  if(window.ScrollTrigger&&typeof window.ScrollTrigger.refresh==="function")
   requestAnimationFrame(()=>window.ScrollTrigger.refresh());
 }
 [ctx.canvas,ctx.guard,ctx.hud,ctx.badge,ctx.wash].forEach(el=>el.remove());
 if(active===ctx)active=null;
}
async function build(){
 if(active||reduced.matches||location.hash)return;
 const collection=gather();
 if(!collection.all.length)return;
 const id=++serial,mobile=innerWidth<700;
 const wash=add("swarm-wash"),guard=add("swarm-guard"),canvas=add("swarm-canvas");
 const badge=add("swarm-stage-badge"),hud=add("swarm-hud");
 const agents=Array.from({length:mobile?9:16},(_,i)=>pointer(canvas,i));
 hud.innerHTML='<div class="swarm-mark">N.</div>'+
 '<div class="swarm-status"><strong>PORTFOLIO REBUILD</strong><small class="swarm-phase">PREPARING</small></div>'+
 '<span class="swarm-counter">0 layers</span><div class="swarm-meter"><i></i></div>'+
 '<span class="swarm-percent">0%</span><span class="swarm-dots">'+COLORS.slice(0,6).map(c=>'<i style="--dc:'+c+'"></i>').join("")+'</span>'+
 '<button type="button" class="swarm-skip">Skip ↗</button>';
 const ctx={id,all:collection.all,groups:collection.groups,pointers:agents,wash,guard,canvas,hud,badge,
  bar:$(".swarm-meter i",hud),counter:$(".swarm-counter",hud),
  phase:$(".swarm-phase",hud),percent:$(".swarm-percent",hud),
  next:0,finished:0,section:"hero",stopped:false,originalTop:scrollY,
  beforeBehavior:document.documentElement.style.scrollBehavior,
  beforeOverscroll:document.documentElement.style.overscrollBehavior};
 ctx.prevent=e=>{if(active===ctx&&e.cancelable)e.preventDefault()};
 ctx.key=e=>{
  if(active!==ctx)return;
  if(e.key==="Escape"){e.preventDefault();stop(ctx);return}
  if(e.key==="Tab"){e.preventDefault();$(".swarm-skip",hud).focus({preventScroll:true});return}
  if(["PageDown","PageUp","ArrowDown","ArrowUp"," ","Home","End"].includes(e.key))e.preventDefault();
 };
 ctx.visibility=()=>{if(document.hidden&&active===ctx)stop(ctx)};
 active=ctx;
 $(".swarm-skip",hud).addEventListener("click",()=>stop(ctx));
 document.addEventListener("keydown",ctx.key,true);
 document.addEventListener("wheel",ctx.prevent,{capture:true,passive:false});
 document.addEventListener("touchmove",ctx.prevent,{capture:true,passive:false});
 document.addEventListener("visibilitychange",ctx.visibility);
 document.documentElement.style.scrollBehavior="auto";
 document.documentElement.style.overscrollBehavior="none";
 ctx.all.forEach(el=>el.classList.add("swarm-build-target"));
 document.body.classList.add("swarm-is-building");
 // Colored collaborator crosshairs are decorative, not interactive.
 const crosses=[];
 for(let i=0;i<(mobile?9:21);i++){
  const cross=add("swarm-cross",canvas);
  cross.style.setProperty("--px",(8+(i*31+13)%83)+"vw");
  cross.style.setProperty("--py",(7+(i*43+29)%79)+"vh");
  cross.style.setProperty("--cc",COLORS[i%COLORS.length]);
  crosses.push(cross);
 }
 try{
  await new Promise(resolve=>requestAnimationFrame(resolve));
  if(!running(id))return;
  wash.classList.add("on");
  await delay(330);if(!running(id))return;
  wash.classList.remove("on");
  hud.classList.add("on");
  $(".swarm-skip",hud).focus({preventScroll:true});
  await delay(180);if(!running(id))return;
  crosses.forEach((el,i)=>setTimeout(()=>{if(running(id))el.classList.add("on")},i*25));
  for(let i=0;i<ctx.groups.length;i++){
   if(!running(id))return;
   const g=ctx.groups[i];ctx.section=g.id;
   badge.textContent=(i+1)+"/"+ctx.groups.length+" · "+g.id.toUpperCase();
   setProgress(ctx,"BUILD / "+g.id.toUpperCase());
   await glide(scrollDestination(g.root),i?mobile?460:570:100,id);
   if(!running(id))return;
   await delay(85);
   const size=mobile?3:5;
   for(let j=0;j<g.items.length;j+=size){
    if(!running(id))return;
    await batch(ctx,g.items.slice(j,j+size),id);
   }
   await delay(90);
  }
  if(!running(id))return;
  ctx.all.forEach(el=>el.classList.add("swarm-build-complete"));
  ctx.finished=ctx.all.length;
  setProgress(ctx,"PUBLISH / COMPLETE");
  badge.textContent="SITE COMPLETE / 100%";
  await delay(650);if(!running(id))return;
  wash.classList.add("on");
  await delay(380);if(running(id))stop(ctx);
 }catch(err){
  console.warn("Rebuild animation stopped; portfolio restored",err);
  stop(ctx);
 }
}
let scheduled=false;
function begin(){
 if(scheduled||reduced.matches||location.hash||new URLSearchParams(location.search).has("skipintro"))return;
 scheduled=true;
 setTimeout(()=>{if(!document.hidden)build()},380);
}
function ready(){
 if(document.body.classList.contains("nt-loaded")){begin();return}
 const obs=new MutationObserver(()=>{
  if(document.body.classList.contains("nt-loaded")){obs.disconnect();begin()}
 });
 obs.observe(document.body,{attributes:true,attributeFilter:["class"]});
 setTimeout(()=>{obs.disconnect();begin()},6200);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",ready,{once:true});
else ready();
})();
