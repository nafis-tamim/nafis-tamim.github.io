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
 return n.openNewTab?'target="_blank" rel="noopener noreferrer"':"";
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
 const h=d.hero||{},i=d.identity||{};
 return '<section class="hero" id="top"><canvas id="orbit-canvas" aria-hidden="true"></canvas>'+
 '<div class="container hero-contents"><div class="hero-layout">'+
 '<div class="hero-copy"><span class="hero-disciplinary">'+E(i.identityLine||"MATHEMATICS / RESEARCH / DESIGN")+'</span>'+
 '<h1><span>'+E(h.firstLine||"Curiosity")+'</span><em>'+E(h.secondLine||"in motion.")+'</em></h1>'+
 '<p class="hero-summary">'+E(h.intro||"")+'</p>'+
 '<div class="hero-ctas">'+button(h.primaryLabel||"Projects","#"+safeId(h.primaryTarget||"projects"),"solid-button")+
 button(h.secondaryLabel||"Achievements","#"+safeId(h.secondaryTarget||"achievements"),"ghost-button")+'</div>'+
 '</div><div class="profile-stage" data-profile-stage>'+
 '<div class="profile-motion-frame"><div class="profile-orbit profile-orbit-a"></div><div class="profile-orbit profile-orbit-b"></div>'+
 '<div class="profile-glass"><div class="profile-photo">'+(i.portrait?asset(i.portrait,i.portraitAlt||"Nafis Tamim","hero-portrait"):'<span class="profile-initials">'+E(i.initials||"NT")+'</span>')+'</div></div>'+
 '</div><div class="profile-caption"><strong>'+E(i.name||"Nafis Tamim")+'</strong><span>'+E(i.descriptor||"Research / Design / Engineering")+'</span></div>'+
 '</div></div></div></section>';
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

/* Interactive media galleries: cover + any number of award/project/research photos. */
function gallerySources(item){
 const sources=[],seen=new Set();
 function add(src){
  const v=str(src).trim();if(!v||seen.has(v)||linkUrl(v)==="#")return;
  seen.add(v);sources.push({src:v,pdf:/\.pdf(?:[?#]|$)/i.test(v)});
 }
 add(item.image);
 arr(item.gallery).forEach(add);
 return sources;
}
function galleryMarkup(item,variant=""){
 const sources=gallerySources(item);
 if(!sources.length)return '<div class="media-gallery '+E(variant)+'"><div class="gallery-no-image">'+E(item.title||"Visual archive")+'</div></div>';
 const images=sources.map((slide,i)=>{
  const focus=i===0?'0':'-1';
  const inner=slide.pdf?
   '<a href="'+E(linkUrl(slide.src))+'" target="_blank" rel="noopener noreferrer" class="gallery-pdf" tabindex="'+focus+'"><strong>PDF</strong><span>'+E(item.title||"Document")+'</span><small>OPEN DOCUMENT ↗</small></a>':
   '<a href="'+E(linkUrl(slide.src))+'" target="_blank" rel="noopener noreferrer" class="gallery-photo" tabindex="'+focus+'" aria-label="Open image '+(i+1)+' of '+E(item.title)+'">'+asset(slide.src,item.imageAlt||item.title,"gallery-image")+'</a>';
  return '<div data-slide="'+i+'" class="gallery-slide'+(i===0?" is-active":"")+'" aria-hidden="'+(i===0?"false":"true")+'">'+inner+'</div>';
 }).join("");
 const controls=sources.length>1?'<div class="gallery-controls"><button type="button" data-gallery-step="-1" aria-label="Previous image">←</button><span class="gallery-count"><b data-gallery-position>01</b> / '+String(sources.length).padStart(2,"0")+'</span><button type="button" data-gallery-step="1" aria-label="Next image">→</button></div>'+
 '<div class="gallery-dots">'+sources.map((_,i)=>'<button type="button" data-gallery-index="'+i+'" class="'+(i===0?"active":"")+'" aria-label="Show image '+(i+1)+'" aria-pressed="'+(i===0?"true":"false")+'"></button>').join("")+'</div>':"";
 return '<div class="media-gallery '+E(variant)+'" data-gallery data-active="0">'+images+controls+'</div>';
}
function initGalleries(scope=document){
 $all("[data-gallery]",scope).forEach(gallery=>{
  const slides=$all("[data-slide]",gallery),dots=$all("[data-gallery-index]",gallery);
  if(!slides.length)return;
  const change=i=>{
   const current=(i+slides.length)%slides.length;gallery.dataset.active=String(current);
   slides.forEach((slide,j)=>{
    const chosen=j===current;slide.classList.toggle("is-active",chosen);slide.setAttribute("aria-hidden",String(!chosen));
    const link=slide.querySelector("a");if(link)link.tabIndex=chosen?0:-1;
   });
   dots.forEach((dot,j)=>{dot.classList.toggle("active",j===current);dot.setAttribute("aria-pressed",String(j===current))});
   const label=$("[data-gallery-position]",gallery);if(label)label.textContent=String(current+1).padStart(2,"0");
  };
  $all("[data-gallery-step]",gallery).forEach(b=>b.onclick=()=>change(Number(gallery.dataset.active||0)+Number(b.dataset.galleryStep)));
  dots.forEach(b=>b.onclick=()=>change(Number(b.dataset.galleryIndex)));
 });
}
function initOrbits(){
 $all("[data-award-orbit]").forEach(group=>{
  const buttons=$all("[data-orbit-index]",group),panels=$all("[data-orbit-panel]",group),wheel=$("[data-orbit-wheel]",group);
  if(!buttons.length)return;
  const activate=i=>{
   const current=(i+buttons.length)%buttons.length;
   group.dataset.active=String(current);
   buttons.forEach((btn,index)=>{const active=index===current;btn.classList.toggle("is-active",active);btn.setAttribute("aria-pressed",String(active))});
   panels.forEach((panel,index)=>{const active=index===current;panel.hidden=!active;panel.classList.toggle("is-active",active);panel.setAttribute("aria-hidden",String(!active))});
   if(wheel)wheel.style.setProperty("--active-angle",String(current*360/buttons.length)+"deg");
  };
  buttons.forEach((btn,i)=>btn.onclick=()=>activate(i));
  $all("[data-orbit-step]",group).forEach(btn=>btn.onclick=()=>activate(Number(group.dataset.active||0)+Number(btn.dataset.orbitStep)));
  activate(0);
 });
}

function achievement(d){
 const achievements=d.achievements||{},items=arr(achievements.cards),groups=arr(achievements.groups).filter(g=>g.visible!==false);
 const ids=new Set(groups.map(g=>g.id)),all=[...groups];
 if(items.some(x=>!ids.has(x.groupId)))all.push({id:"other",title:"Other recognition",subtitle:"Additional records"});
 const content=all.map(group=>{
  const records=items.filter(x=>ids.has(x.groupId)?x.groupId===group.id:group.id==="other");
  if(!records.length)return "";
  const n=records.length;
  const wheel=records.map((record,index)=>{
   const thumb=gallerySources(record).find(x=>!x.pdf);
   return '<button type="button" class="orbit-node'+(index===0?" is-active":"")+'" data-orbit-index="'+index+'" style="--angle:'+(index*360/n)+'deg" aria-pressed="'+(index===0?"true":"false")+'" aria-label="Show '+E(record.title)+'">'+
    (thumb?asset(thumb.src,record.title,"orbit-node-image"):'<span class="orbit-initial">◎</span>')+
    '<span class="orbit-node-id">'+String(index+1).padStart(2,"0")+'</span></button>';
  }).join("");
  const detail=records.map((record,index)=>
   '<article class="orbit-panel'+(index===0?" is-active":"")+'" data-orbit-panel="'+index+'"'+(index===0?"":' hidden')+' aria-hidden="'+(index===0?"false":"true")+'">'+
   '<div class="orbit-panel-media">'+galleryMarkup(record,"award-gallery")+'</div>'+
   '<div class="orbit-panel-info"><div class="orbit-panel-meta"><span>'+E(record.institution||group.title)+'</span><span>'+E(record.year||"")+'</span></div>'+
   '<h4>'+E(record.title)+'</h4><p>'+E(record.summary||record.details||"")+'</p>'+
   (record.result?'<strong class="orbit-result">'+E(record.result)+'</strong>':"")+
   '<div class="orbit-evidence">'+linkRow(record)+'</div></div></article>'
  ).join("");
  return '<section class="award-orbit-group" data-award-orbit data-active="0" id="awards-'+E(safeId(group.id))+'">'+
   '<div class="orbit-category"><div class="orbit-category-head">'+
   (group.logo?asset(group.logo,group.logoAlt||group.title,"orbit-category-logo"):"")+
   '<div><span class="orbit-category-overline">'+E(group.eyebrow||"RECOGNITION")+'</span><h3>'+E(group.title)+'</h3><p>'+E(group.subtitle||"")+'</p></div></div>'+
   '<div class="orbit-pager"><button type="button" data-orbit-step="-1" aria-label="Previous achievement">←</button><span>'+String(n).padStart(2,"0")+' RECORDS</span><button type="button" data-orbit-step="1" aria-label="Next achievement">→</button></div></div>'+
   '<div class="orbit-content"><div class="award-wheel-wrap"><div class="award-wheel" data-orbit-wheel style="--active-angle:0deg">'+
   '<div class="wheel-center"><div class="wheel-center-inner"></div><span>NT</span></div>'+wheel+'</div>'+
   '<div class="wheel-caption">SELECT AN ACHIEVEMENT</div></div>'+
   '<div class="orbit-panels">'+detail+'</div></div>'+
   (group.id==="government"&&group.description?'<p class="category-note">'+E(group.description)+'</p>':"")+'</section>';
 }).join("");
 const nav=all.filter(g=>items.some(x=>g.id==="other"?!ids.has(x.groupId):x.groupId===g.id)).map(g=>
  '<a href="#awards-'+E(safeId(g.id))+'">'+E(g.title)+' <span aria-hidden="true">↗</span></a>').join("");
 return block("achievements","block-achievement",heading(achievements.eyebrow,achievements.heading,achievements.intro,sectionLinks(achievements))+
 '<nav class="orbit-category-jump" aria-label="Achievement categories">'+nav+'</nav>'+content);
}
function projectCard(x,i){
 return '<article class="work-card reveal-card" style="--delay:'+((i%3)*70)+'ms">'+
 '<div class="work-media">'+galleryMarkup(x,"project-gallery")+'</div>'+
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
function researchDiagram(item){
 const steps=arr(item.diagramStages).length?arr(item.diagramStages).slice(0,5):["Question","Evidence","Verification","Analysis","Explanation"];
 return '<div class="research-diagram" aria-label="Conceptual research workflow">'+
 '<div class="diagram-core"><span>RESEARCH</span><strong>'+E(item.paperId||"MODEL")+'</strong></div>'+
 '<svg class="diagram-connectors" viewBox="0 0 680 420" preserveAspectRatio="none" aria-hidden="true">'+
 '<path d="M340 210L135 90 M340 210L545 90 M340 210L108 315 M340 210L565 315 M340 210L340 35" fill="none" stroke="#60A5FA" stroke-opacity=".4" stroke-width="1.6" stroke-dasharray="7 9"/>'+
 '<circle cx="340" cy="210" r="145" fill="none" stroke="#60A5FA" stroke-opacity=".26" stroke-width="1.6"/>'+
 '<circle cx="340" cy="210" r="185" fill="none" stroke="#1D4ED8" stroke-opacity=".22" stroke-width="1"/>'+
 '</svg>'+
 steps.map((label,i)=>'<div class="diagram-stage diagram-stage-'+i+'"><span>'+String(i+1).padStart(2,"0")+'</span><strong>'+E(label)+'</strong></div>').join("")+
 '</div>';
}
function research(d){
 const r=d.research||{},items=arr(r.items);
 const cards=items.map((item,i)=>'<article class="research-card reveal-card">'+
 '<div class="research-visual"><div class="research-model">'+researchDiagram(item)+'</div>'+
 '<div class="research-media-preview">'+galleryMarkup(item,"research-gallery")+'</div></div>'+
 '<div class="research-content"><div class="research-tags"><span>'+E(item.field||"RESEARCH")+'</span><span>'+E(item.year||"")+'</span></div>'+
 (item.status?'<span class="research-status">'+E(item.status)+'</span>':"")+
 '<h3>'+E(item.title)+'</h3>'+
 '<div class="paper-excerpt"><span class="paper-excerpt-label">RESEARCH PREVIEW</span>'+
 '<p>'+E(item.abstract||item.summary||"")+'</p></div>'+
 (item.question?'<div class="research-brief"><span>RESEARCH QUESTION</span><p>'+E(item.question)+'</p></div>':"")+
 '<div class="research-links">'+linkRow(item)+'</div></div></article>').join("");
 return block("research","block-research",heading(r.eyebrow,r.heading,r.intro,sectionLinks(r))+
 (items.length?'<div class="research-collection">'+cards+'</div>':'<p class="empty-archive">New research material can be added through the private editor.</p>'));
}
function resonance(d){
 const m=d.design||{};
 return '<section class="resonance-section" id="resonance-lab"><div class="resonance-sticky"><div class="container resonance-layout">'+
 '<div class="resonance-copy"><span class="resonance-kicker">'+E(m.scrollLabCaption||"INTERACTIVE RESONANCE")+'</span>'+
 '<h2>'+E(m.scrollLabTitle||"Scientific patterns, shaped by motion.")+'</h2>'+
 '<p>'+E(m.scrollLabIntro||"Scroll to change the pattern.")+'</p>'+
 '<div class="resonance-equation"><span>STANDING WAVE INTERFERENCE</span><code>f(x,y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy)</code></div>'+
 '<div class="resonance-progress"><span>01</span><div><div id="resonance-progress-bar"></div></div><span>03</span></div>'+
 '</div><div class="resonance-visual"><div class="resonance-plate" id="resonance-plate"><div class="resonance-layer"></div>'+
 '<canvas id="resonance-canvas" width="640" height="640" role="img" aria-label="Animated Chladni-inspired resonance contour pattern that changes with scrolling"></canvas>'+
 '</div><div class="resonance-data"><span>MODE <b id="resonance-mode">02 : 03</b></span><span>SCROLL TO MORPH</span></div></div>'+
 '</div></div></section>';
}
function creative(d){
 const c=d.creative||{};
 return block("creative","block-creative",heading(c.eyebrow,c.heading,c.intro,sectionLinks(c))+
 '<div class="creative-grid">'+arr(c.items).map((x,i)=>
 '<article class="creative-item reveal-card"><div class="creative-image-frame">'+galleryMarkup(x,"creative-gallery")+'</div>'+
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
 document.body?.classList?.toggle("disable-hover",ap.hoverEffects===false);
 const map={background:"--bg",paper:"--paper",ink:"--ink",inkSoft:"--muted",deep:"--deep",accent:"--accent",teal:"--teal",gold:"--gold",border:"--border"};
 Object.entries(map).forEach(([k,prop])=>{if(/^#[0-9a-f]{6}$/i.test(str(ap[k])))document.documentElement.style.setProperty(prop,ap[k])});
 document.title=d.seo?.title||"Nafis Tamim";
 const description=$('meta[name="description"]');if(description)description.setAttribute("content",d.seo?.description||"");
 const icon=$('link[rel="icon"]');if(icon&&d.seo?.favicon)icon.setAttribute("href",linkUrl(d.seo.favicon));
}
function render(){
 if(!root)return;
 const d=data;setTheme(d);
 const builder={about,achievements:achievement,projects,research,creative,academics:academic,contact};
 let aboutShown=false;
 const contents=arr(d.navigation).filter(x=>x.visible!==false).map(n=>{
   if(builder[n.id]){
     const output=builder[n.id](d);
     if(n.id==="about"){aboutShown=true;return output+spotlight(d)}
     if(n.id==="research")return resonance(d)+output;
     return output;
   }
   const sec=arr(d.customSections).find(s=>s.id===n.id&&s.visible!==false);
   if(sec)return custom({...d,customSections:[sec]});
   return "";
 }).join("");
 root.innerHTML='<div class="portfolio-site">'+navigation(d)+hero(d)+marquee(d)+(aboutShown?"":spotlight(d))+contents+'</div>';
 initEvents();initScroll();initGalleries();initOrbits();initMotion();initResonance();initProfileTilt();
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
   initProjectFilters();initGalleries();initScroll();
 });
}
function initProjectFilters(){
 $all("[data-filter]",$("#projects")||document).forEach(btn=>btn.onclick=()=>{
  category=btn.dataset.filter;
  const temp=document.createElement("div");temp.innerHTML=projects(data);
  $("#projects")?.replaceWith(temp.firstElementChild);
  initProjectFilters();initGalleries();initScroll();
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
 const heroEl=$(".hero");
 heroEl?.addEventListener("pointermove",move,{passive:true});
 heroEl?.addEventListener("pointerleave",()=>mouse={x:-1000,y:-1000},{passive:true});
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
