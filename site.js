/* NAFIS TAMIM / INDEX 06 — edited site engine */
"use strict";
const root=document.getElementById("app");
const $=(s,n=document)=>n.querySelector(s);
const $all=(s,n=document)=>Array.from(n.querySelectorAll(s));
const arr=x=>Array.isArray(x)?x:[];
const str=x=>x===undefined||x===null?"":String(x);
const E=x=>str(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeId=x=>str(x).replace(/[^a-z0-9_-]/gi,"");
const linkUrl=s=>{const v=str(s).trim();if(v.startsWith("#"))return "#"+safeId(v.slice(1));try{const u=new URL(v,location.origin);return ["https:","http:","mailto:"].includes(u.protocol)?u.href:"#"}catch{return "#"}};
const asset=(src,alt="",cl="")=>src?'<img class="'+E(cl)+'" loading="lazy" decoding="async" src="'+E(linkUrl(src))+'" alt="'+E(alt)+'" onerror="this.classList.add(\'broken-image\')">':'';
const micro=(left,right="")=>'<div class="eyeline"><span>'+E(left)+'</span>'+(right?'<span>'+E(right)+'</span>':'')+'</div>';
const visual=(item,cls="")=>'<div class="cover '+E(cls)+'">'+(item.image?asset(item.image,item.imageAlt||("Cover art for "+item.title),"cover-image"):'<div class="cover-empty"><span>IMAGE / MEDIA</span><b>'+E((item.title||"PROJECT").slice(0,2).toUpperCase())+'</b></div>')+'</div>';
const button=(label,target,variant="evidence-link")=>target&&linkUrl(target)!=="#"?'<a class="'+E(variant)+'" href="'+E(linkUrl(target))+'" target="'+(str(target).startsWith("#")?"_self":"_blank")+'" rel="noopener noreferrer">'+E(label||"Open source")+'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M7 5h12v12" stroke="currentColor" fill="none" stroke-width="1.8"/></svg></a>':"";
const sectionLinks=section=>arr(section?.sectionLinks).map(x=>button(x.label,x.url,"section-action")).join("");
const badge=x=>'<span class="inline-tag">'+E(x)+'</span>';
let data=null,category="All",canvasController=null;
function block(id,extra,body){return '<section id="'+E(safeId(id))+'" class="block '+E(extra||"")+'"><div class="container">'+body+'</div></section>'}
function heading(eyebrow,title,desc,links=""){return '<div class="section-heading"><div class="section-number">'+E(eyebrow||"INDEX ENTRY")+'</div><div class="section-title-row"><h2>'+E(title||"")+'</h2><div class="heading-aside"><p>'+E(desc||"")+'</p>'+(links?'<div class="section-link-set">'+links+'</div>':"")+'</div></div></div>'}
function navHref(entry){
 if(entry.href&&linkUrl(entry.href)!=="#")return linkUrl(entry.href);
 if(entry.target&&linkUrl(entry.target)!=="#")return linkUrl(entry.target);
 return "#"+safeId(entry.id);
}
function externalAttrs(n){
 return n.openNewTab||/^(https?:)/.test(str(n.href||n.target))?'target="_blank" rel="noopener noreferrer"':"";
}
function navigation(d){
 const list=arr(d.navigation).filter(n=>n.visible!==false);
 return '<header class="topbar"><div class="container topbar-inner">'+
 '<a class="identity" href="#top"><span class="identity-mark">'+(d.identity?.portrait?asset(d.identity.portrait,"",""):'<b>'+E(d.identity?.initials||"NT")+'</b>')+'</span><span class="identity-word">'+E(d.identity?.name||"Nafis Tamim")+'</span></a>'+
 '<nav class="desktop-links" aria-label="Primary navigation">'+list.filter((_,i)=>i<6).map(n=>'<a href="'+E(navHref(n))+'" '+externalAttrs(n)+'>'+E(n.label)+'</a>').join("")+'</nav>'+
 '<div class="nav-right"><a href="#contact" class="nav-cta">'+E(d.contact?.emailLabel||"CONTACT")+' <span aria-hidden="true">↗</span></a><button class="menu-button" id="menu-button" aria-label="Open menu" aria-expanded="false" aria-controls="menu-panel"><i></i><i></i></button></div>'+
 '</div><nav class="menu-panel" id="menu-panel" aria-label="Full site menu">'+list.map((n,i)=>'<a href="'+E(navHref(n))+'" '+externalAttrs(n)+'><span>'+String(i+1).padStart(2,"0")+'</span>'+E(n.label)+'<span>↗</span></a>').join("")+'</nav></header>'
}
function hero(d){
 const x=d.hero||{},i=d.identity||{};
 return '<section class="hero" id="top"><div class="hero-grid-bg" aria-hidden="true"></div><canvas id="orbit-canvas" aria-hidden="true"></canvas><div class="container">'+
 '<div class="hero-meta"><span class="red-dot"></span><span>'+E(x.overline)+'</span><span class="hero-meta-right">'+E(i.location||"Bangladesh")+' / '+E(d.design?.label||"2026")+'</span></div>'+
 '<div class="hero-layout"><div class="hero-copy"><div class="hero-overline">'+E(i.identityLine)+'</div><h1><span>'+E(x.firstLine||"Ideas")+'</span><em>'+E(x.secondLine||"take shape.")+'</em></h1>'+
 '<p class="hero-summary">'+E(x.intro||"")+'</p><div class="hero-ctas">'+
 button(x.primaryLabel||"Explore", "#"+safeId(x.primaryTarget||"projects"),"solid-button")+
 button(x.secondaryLabel||"Achievements","#"+safeId(x.secondaryTarget||"achievements"),"ghost-button")+'</div>'+
 '<div class="hero-stats"><span class="hero-pulse">●</span>'+E(i.availability||"Available for ideas")+'</div></div>'+
 '<div class="hero-image-wrap"><div class="hero-image-frame"><div class="portrait-backdrop"></div>'+
 (i.portrait?asset(i.portrait,i.portraitAlt||"Nafis Tamim","hero-portrait"):'<div class="hero-portrait-fallback">NT</div>')+
 '<div class="image-crosshair image-crosshair-one">+</div><div class="image-crosshair image-crosshair-two">+</div>'+
 '</div><div class="hero-image-bottom"><span>FIG. 001 / PERSONAL INDEX</span><span>'+E(i.descriptor||"Student · Maker")+'</span></div>'+
 '<div class="hero-satellite"><span class="satellite-index">© / 06</span><strong>'+E(x.stageLabel||"CURRENTLY EXPLORING")+'</strong><p>'+E(x.stageText||"")+'</p></div></div></div>'+
 '<div class="hero-footer"><span>'+E(d.design?.creativeStatement||"Ideas have no single discipline.")+'</span><span>SCROLL TO EXPLORE <b>↓</b></span></div></div></section>';
}
function marquee(d){
 const awards=arr(d.achievements?.cards).length,pro=arr(d.projects?.items).length,res=arr(d.research?.items).length;
 return '<div class="meta-ribbon"><div class="container ribbon-inner">'+
 '<span>'+E(d.design?.stripLabel||"ACADEMIC INDEX")+'</span><div class="ribbon-sets"><a href="#achievements">'+String(awards).padStart(2,"0")+' RECOGNITIONS ↗</a><a href="#projects">'+String(pro).padStart(2,"0")+' PROJECTS ↗</a><a href="#research">'+String(res).padStart(2,"0")+' RESEARCH ↗</a></div>'+
 '<span>RESEARCH × DESIGN × IDEAS</span></div></div>';
}
function about(d){
 const a=d.about||{};
 return block("about","block-about",heading(a.eyebrow,a.heading,a.lead,sectionLinks(a))+
 '<div class="about-under"><p class="about-body">'+E(a.body)+'</p><div class="about-principles">'+arr(a.principles).map((x,i)=>'<article class="principle"><span>'+String(i+1).padStart(2,"0")+'</span><h3>'+E(x.title)+'</h3><p>'+E(x.body)+'</p></article>').join("")+'</div></div>'+
 '<div class="thought"><span>FIELD NOTE / 001</span><q>'+E(a.quote||"The best work begins with a better question.")+'</q><span>↗</span></div>');
}
function linksFor(x){
 const out=[],used=new Set();
 function add(label,target){
  const u=linkUrl(target);if(u==="#"||used.has(u))return;
  used.add(u);out.push({label:label||"Open document",url:u});
 }
 arr(x.links).forEach(a=>add(a.label,a.url));
 arr(x.supportingLinks).forEach(a=>add(a.label,a.url));
 if(x.verification)add(x.groupId==="government"?"Government result":"Official result",x.verification);
 if(x.pdf)add("Open PDF",x.pdf);
 if(x.documentUrl)add(/\.pdf(?:[?#]|$)/i.test(x.documentUrl)?"Open certificate PDF":"Read document",x.documentUrl);
 if(x.url)add("Open project",x.url);
 if(x.link)add("Open source",x.link);
 if(x.image)add("View image",x.image);
 arr(x.gallery).forEach((f,j)=>add(/\.pdf(?:[?#]|$)/i.test(f)?"Open PDF "+(j+1):"Image "+(j+1),f));
 return out;
}
function linkRow(x){
 const all=linksFor(x);
 return '<div class="direct-links">'+(all.length?all.map(a=>button(a.label,a.url,"direct-link")).join(""):'<span class="no-link">'+E(data.ui?.supportingLinksEmpty||"Supporting files can be added")+'</span>')+'</div>';
}
function cardImg(x,cls){
 let main=arr(x.gallery).find(v=>/\.(png|jpe?g|webp|gif)(?:[?#]|$)/i.test(v))||x.image;
 return '<a class="media-anchor" href="'+E(linkUrl(main))+'" target="_blank" rel="noopener noreferrer" aria-label="View image for '+E(x.title)+'">'+visual({...x,image:main},cls)+'</a>';
}
function achievement(d){
 const a=d.achievements||{},items=arr(a.cards),groups=arr(a.groups).filter(g=>g.visible!==false);
 const groupIds=new Set(groups.map(g=>g.id));
 const all=[...groups];
 if(items.some(x=>!groupIds.has(x.groupId)))all.push({id:"other",title:"Other Recognition",subtitle:"Further academic records",eyebrow:"EXTRA"});
 const contents=all.map((g,gidx)=>{
  const records=items.filter(x=>groupIds.has(x.groupId)?x.groupId===g.id:g.id==="other");
  if(!records.length)return "";
  return '<div class="award-category" id="awards-'+E(safeId(g.id))+'"><div class="category-head"><div class="category-logo">'+(g.logo?asset(g.logo,g.logoAlt||g.title,"group-logo"):'<div class="category-monogram">◎</div>')+'</div>'+
  '<div><span class="category-label">'+E(g.eyebrow||"ACADEMIC GROUP")+'</span><h3>'+E(g.title)+'</h3><p>'+E(g.subtitle||g.description)+'</p></div><div class="category-count">'+String(records.length).padStart(2,"0")+'<small>ENTRIES</small></div></div>'+
  '<div class="achievement-grid">'+records.map((x,i)=>
    '<article class="record-card reveal-card" style="--delay:'+((i%3)*75)+'ms"><div class="record-media">'+cardImg(x,"achievement-image")+
    '<span class="record-nr">'+String(i+1).padStart(2,"0")+' / '+E(x.year||"RECORD")+'</span></div>'+
    '<div class="record-info"><span class="item-kicker">'+E(x.institution||g.title)+'</span><h4>'+E(x.title)+'</h4><p>'+E(x.summary||x.result)+'</p>'+
    (x.result?'<div class="record-result">'+E(x.result)+'</div>':"")+
    '<div class="card-direct-title">'+E(data.ui?.supportingLinksTitle||"SOURCE & MEDIA")+'</div>'+linkRow(x)+'</div></article>').join("")+'</div>'+
  (g.id==="government"&&g.description?'<div class="category-note">'+E(g.description)+'</div>':"")+'</div>'
 }).join("");
 return block("achievements","block-achievement",heading(a.eyebrow,a.heading,a.intro,sectionLinks(a))+
 '<div class="category-tabs">'+all.filter(g=>items.some(x=>g.id==="other"?!groupIds.has(x.groupId):x.groupId===g.id)).map(x=>'<a href="#awards-'+E(safeId(x.id))+'">'+E(x.title)+' <span>↘</span></a>').join("")+'</div>'+
 contents+'<p class="section-note">'+E(d.ui?.achievementsNote||"Explore the evidence for each entry.")+'</p>');
}
function projectCard(x,i){
 return '<article class="work-card reveal-card" style="--delay:'+((i%3)*70)+'ms">'+
 '<div class="work-media">'+cardImg(x,"work-image")+'<span class="work-index">P / '+String(i+1).padStart(2,"0")+'</span></div>'+
 '<div class="work-body"><div class="work-line"><span>'+E(x.category||"PROJECT")+'</span><span>'+E(x.year||"")+'</span></div>'+
 '<h3>'+E(x.title)+'</h3><p class="work-summary">'+E(x.summary)+'</p>'+
 (x.outcome?'<p class="work-outcome">'+E(x.outcome)+'</p>':"")+
 '<div class="chip-row">'+arr(x.tags).slice(0,5).map(tag=>badge(tag)).join("")+'</div>'+
 linkRow(x)+'</div></article>';
}
function projects(d){
 const p=d.projects||{},items=arr(p.items),cats=["All",...new Set(items.map(x=>x.category).filter(Boolean))];
 const shown=category==="All"?items:items.filter(x=>x.category===category);
 return block("projects","block-work",heading(p.eyebrow,p.heading,p.intro,sectionLinks(p))+
 '<div class="filter-line" role="group" aria-label="Filter project categories">'+cats.map(c=>'<button type="button" data-filter="'+E(c)+'" class="'+(c===category?"selected":"")+'">'+E(c)+'</button>').join("")+'</div>'+
 '<div class="work-grid">'+shown.map(projectCard).join("")+'</div>'+
 (!shown.length?'<p class="empty-archive">There are no projects in this category yet.</p>':""));
}
function research(d){
 const r=d.research||{},items=arr(r.items);
 const cards=items.map((x,i)=>'<article class="research-card reveal-card"><div class="research-visual">'+cardImg(x,"research-image")+'<span class="research-stamp">PAPER / '+String(i+1).padStart(3,"0")+'</span></div>'+
 '<div class="research-content"><div class="research-tags"><span>'+E(x.field||"RESEARCH")+'</span><span>'+E(x.year||"")+'</span></div>'+
 (x.status?'<span class="research-status">'+E(x.status)+'</span>':"")+
 '<h3>'+E(x.title)+'</h3><p class="research-intro">'+E(x.abstract||x.summary)+'</p>'+
 (x.question?'<div class="research-brief"><span>THE QUESTION</span><p>'+E(x.question)+'</p></div>':"")+
 '<div class="research-links">'+linkRow(x)+'</div></div></article>').join("");
 return block("research","block-research",heading(r.eyebrow,r.heading,r.intro,sectionLinks(r))+
 (items.length?'<div class="research-collection">'+cards+'</div>':'<div class="empty-paper"><span>R / 000</span><h3>'+E(r.emptyTitle)+'</h3><p>'+E(r.emptyBody)+'</p></div>'));
}
function creative(d){
 const c=d.creative||{};
 return block("creative","block-creative",heading(c.eyebrow,c.heading,c.intro,sectionLinks(c))+
 '<div class="creative-grid">'+arr(c.items).map((x,i)=>
 '<article class="creative-item reveal-card"><div class="creative-image-frame">'+cardImg(x,"creative-image")+'<span>FIG. '+String(i+1).padStart(2,"0")+'</span></div>'+
 '<div class="creative-item-body"><span class="item-kicker">'+E(x.category)+'</span><h3>'+E(x.title)+'</h3><p>'+E(x.description)+'</p>'+linkRow(x)+'</div></article>'
 ).join("")+'</div>');
}
function writing(d){
 const w=d.writing||{},items=arr(w.items);
 return block("writing","block-writing",heading(w.eyebrow,w.heading,w.intro,sectionLinks(w))+
 (items.length?'<div class="writing-grid">'+items.map((x,i)=>'<article class="writing-card reveal-card">'+cardImg(x,"writing-image")+
 '<div><span class="item-kicker">'+E(x.category||"WRITING")+' / '+E(x.year||x.date||"")+'</span><h3>'+E(x.title)+'</h3><p>'+E(x.summary||x.body)+'</p>'+linkRow(x)+'</div></article>').join("")+'</div>':
 '<div class="empty-writing"><span class="manuscript-icon">✎</span><h3>'+E(w.emptyTitle||"Archive in progress")+'</h3><p>'+E(w.emptyBody||"New writing is being prepared.")+'</p></div>'));
}
function academic(d){
 const a=d.academics||{};
 return block("academics","block-academics",heading(a.eyebrow,a.heading,a.intro,sectionLinks(a))+
 '<div class="timeline">'+arr(a.items).map((x,i)=>
 '<article class="timeline-row reveal-card"><div class="timeline-date">'+E(x.year||"ONGOING")+'</div>'+
 '<div class="timeline-main"><span class="item-kicker">'+E(x.type||"ACTIVITY")+' / '+E(x.organization||"")+'</span><h3>'+E(x.title)+'</h3><p>'+E(x.description)+'</p><div>'+linkRow(x)+'</div></div>'+
 '<div class="timeline-thumb">'+cardImg(x,"timeline-image")+'</div></article>').join("")+'</div>');
}
function custom(d){
 return arr(d.customSections).filter(x=>x.visible!==false).map((sec,index)=>
 block(sec.id||"custom-"+index,"block-custom",heading(sec.eyebrow||"EXTRA / INDEX",sec.heading||sec.title,sec.intro,sectionLinks(sec))+
 '<div class="custom-grid">'+arr(sec.items).map((x,i)=>
 '<article class="custom-card reveal-card">'+cardImg(x,"custom-image")+'<div><span class="item-kicker">'+E(x.category||"COLLECTION")+'</span><h3>'+E(x.title)+'</h3><p>'+E(x.description||x.body)+'</p>'+linkRow(x)+'</div></article>').join("")+'</div>')).join("");
}
function spotlight(d){
 const h=d.highlights||{};
 if(h.enabled===false)return "";
 const objects=[...arr(d.achievements?.cards),...arr(d.projects?.items),...arr(d.research?.items),...arr(d.creative?.items),...arr(d.writing?.items)];
 const selected=arr(h.ids).map(id=>objects.find(x=>x.id===id)).filter(Boolean).slice(0,4);
 if(!selected.length)return "";
 return '<section class="spotlight" id="spotlight"><div class="container"><div class="spotlight-caption"><span>00 / EDITOR’S INDEX</span><h2>'+E(d.ui?.highlightTitle||h.heading||"Selected work")+'</h2><p>'+E(d.ui?.highlightIntro||h.intro||"")+'</p></div>'+
 '<div class="spotlight-grid">'+selected.map((x,i)=>{
 const ev=linksFor(x),src=ev.find(z=>!z.label.startsWith("View image"))?.url||x.image;
 return '<a class="spotlight-card" href="'+E(linkUrl(src))+'" target="_blank" rel="noopener noreferrer"><div class="spotlight-media">'+visual(x,"spotlight-image")+'</div>'+
 '<div class="spotlight-card-foot"><span>'+String(i+1).padStart(2,"0")+' / '+E(x.category||x.field||x.institution||"INDEX")+'</span><strong>'+E(x.title)+'</strong><span class="spotlight-arr">↗</span></div></a>'
 }).join("")+'</div></div></section>';
}
function contact(d){
 const c=d.contact||{},id=d.identity||{};
 return '<section class="contact-block" id="contact"><div class="container">'+
 '<div class="contact-overline">✳ &nbsp; '+E(c.eyebrow||"LET’S CONNECT")+'</div>'+
 '<div class="contact-line"><h2>'+E(c.heading)+'</h2><p>'+E(c.intro)+'</p></div>'+
 '<div class="contact-actions">'+
 (id.email?button(c.emailLabel||"Send an email","mailto:"+id.email,"contact-button"):"")+
 button(c.githubLabel||"Explore GitHub",c.githubUrl||"https://github.com/nafis-tamim","contact-outline")+sectionLinks(c)+'</div>'+
 '<footer><span>'+E(id.name)+' / © '+new Date().getFullYear()+'</span><span>'+E(c.footerLine||d.design?.footerMotif||"Always building")+'</span><div>'+arr(id.socials).map(x=>button(x.label,x.url,"footer-link")).join("")+'</div></footer>'+
 '</div></section>';
}
function setTheme(d){
 const ap=d.appearance||{};
 const map={background:"--bg",paper:"--paper",ink:"--ink",inkSoft:"--muted",deep:"--deep",accent:"--accent",teal:"--teal",gold:"--gold",border:"--border"};
 Object.entries(map).forEach(([k,prop])=>{if(/^#[0-9a-f]{6}$/i.test(str(ap[k])))document.documentElement.style.setProperty(prop,ap[k])});
 document.title=d.seo?.title||"Nafis Tamim";
 const description=$('meta[name="description"]');if(description)description.setAttribute("content",d.seo?.description||"");
 const icon=$('link[rel="icon"]');if(icon&&d.seo?.favicon)icon.setAttribute("href",linkUrl(d.seo.favicon));
}
function render(){
 if(!root)return;
 const d=data;setTheme(d);
 const builder={about,achievements:achievement,projects,research,creative,writing,academics:academic,contact};
 const contents=arr(d.navigation).filter(x=>x.visible!==false).map(n=>{
   if(builder[n.id])return builder[n.id](d);
   const sec=arr(d.customSections).find(s=>s.id===n.id&&s.visible!==false);
   if(sec)return custom({...d,customSections:[sec]});
   return "";
 }).join("");
 root.innerHTML='<div class="portfolio-site">'+navigation(d)+hero(d)+marquee(d)+about(d)+spotlight(d)+contents.replace(/<section id="about"[\s\S]*?<\/section>/,"")+'</div>';
 /* About is placed before spotlight in the magazine layout; never duplicate it. */
 initEvents();initScroll();initMotion();
}
function initEvents(){
 const buttonEl=$("#menu-button"),panel=$("#menu-panel");
 if(buttonEl&&panel){
   buttonEl.onclick=()=>{const expanded=buttonEl.getAttribute("aria-expanded")==="true";buttonEl.setAttribute("aria-expanded",String(!expanded));panel.classList.toggle("is-open",!expanded)};
   $all("a",panel).forEach(a=>a.onclick=()=>{panel.classList.remove("is-open");buttonEl.setAttribute("aria-expanded","false")});
 }
 $all("[data-filter]").forEach(btn=>btn.onclick=()=>{
   category=btn.dataset.filter;
   const section=$("#projects"),template=document.createElement("div");
   template.innerHTML=projects(data);
   section?.replaceWith(template.firstElementChild);
   initProjectFilters();initScroll();
 });
}
function initProjectFilters(){
 $all("[data-filter]",$("#projects")||document).forEach(btn=>btn.onclick=()=>{
  category=btn.dataset.filter;
  const temp=document.createElement("div");temp.innerHTML=projects(data);
  $("#projects")?.replaceWith(temp.firstElementChild);
  initProjectFilters();initScroll();
 });
}
function initScroll(){
 const elems=$all(".reveal-card");
 if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||data.appearance?.sectionReveals===false){
  elems.forEach(el=>el.classList.add("visible"));return;
 }
 if(!window.IntersectionObserver){elems.forEach(el=>el.classList.add("visible"));return}
 const obs=new IntersectionObserver(records=>records.forEach(r=>{if(r.isIntersecting){r.target.classList.add("visible");obs.unobserve(r.target)}}),{threshold:.06,rootMargin:"0px 0px -30px 0px"});
 elems.forEach(el=>obs.observe(el));
}
function initMotion(){
 if(canvasController)canvasController.stop();
 const canvas=$("#orbit-canvas");
 if(!canvas||data.appearance?.motion===false||data.appearance?.animation==="none"||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
 const ctx=canvas.getContext("2d");if(!ctx)return;
 let W=0,H=0,raf,active=true;
 let dots=[],mouse={x:-1000,y:-1000};
 const resize=()=>{
  const b=canvas.getBoundingClientRect();W=b.width;H=b.height;const dpi=Math.min(2,devicePixelRatio||1);
  canvas.width=W*dpi;canvas.height=H*dpi;ctx.setTransform(dpi,0,0,dpi,0,0);
  dots=Array.from({length:Math.min(48,Math.max(20,Math.round(W*H/30000)))},(_,i)=>{
   const a=i*2.3999632,r=Math.sqrt((i+.4)/(Math.min(48,Math.max(20,Math.round(W*H/30000)))));
   return {x:W*.79+Math.cos(a)*r*W*.45,y:H*.51+Math.sin(a)*r*H*.43,vx:Math.sin(i*2.9)*.06,vy:Math.cos(i*2.2)*.06};
  });
 };
 const draw=()=>{
  if(!active)return;
  ctx.clearRect(0,0,W,H);
  dots.forEach(p=>{p.x+=p.vx;p.y+=p.vy;ctx.fillStyle="rgba(144,179,238,.55)";ctx.beginPath();ctx.arc(p.x,p.y,1.3,0,Math.PI*2);ctx.fill()});
  dots.forEach((a,i)=>dots.slice(i+1).forEach(b=>{
   const distance=Math.hypot(a.x-b.x,a.y-b.y);
   if(distance<150){ctx.strokeStyle="rgba(144,179,238,"+(.15*(1-distance/150))+")";ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
  }));
  for(const p of dots){let dist=Math.hypot(p.x-mouse.x,p.y-mouse.y);if(dist<110){ctx.strokeStyle="rgba(116,173,255,.24)";ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke()}}
  raf=requestAnimationFrame(draw);
 };
 const move=e=>{const r=canvas.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top};
 const visibility=()=>{if(document.hidden){active=false;cancelAnimationFrame(raf)}else{active=true;raf=requestAnimationFrame(draw)}};
 canvas.addEventListener("pointermove",move,{passive:true});
 canvas.addEventListener("pointerleave",()=>mouse={x:-1000,y:-1000},{passive:true});
 document.addEventListener("visibilitychange",visibility);
 window.addEventListener("resize",resize,{passive:true});
 resize();raf=requestAnimationFrame(draw);
 canvasController={stop(){active=false;cancelAnimationFrame(raf);document.removeEventListener("visibilitychange",visibility);window.removeEventListener("resize",resize)}};
}
async function load(){
 try{
  const r=await fetch("/content/site.json?revision="+Date.now(),{cache:"no-store"});
  if(!r.ok)throw Error("HTTP "+r.status);
  data=await r.json();render();
 }catch(e){
  root.innerHTML='<section class="load-error"><h1>Portfolio temporarily unavailable.</h1><p>Please refresh or return shortly.</p><a href="/">Reload ↗</a></section>';
  console.error(e);
 }
}
load();
