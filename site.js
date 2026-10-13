
/* NAFIS / TAMIM — Academic Portfolio · v4 */
"use strict";
const $ = (selector,root=document)=>root.querySelector(selector);
const $$ = (selector,root=document)=>Array.from(root.querySelectorAll(selector));
const arr = x=>Array.isArray(x)?x:[];
const txt = x=>String(x===null||x===undefined?"":x);
const esc = x=>txt(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const url = u=>{try{const v=new URL(txt(u),location.origin);return ["http:","https:","mailto:"].includes(v.protocol)?v.href:"#"}catch{return "#"}};
const safeId = x=>txt(x).replace(/[^a-zA-Z0-9_-]/g,"");
const trunc = (x,n=170)=>txt(x).length>n?txt(x).slice(0,n-1)+"…":txt(x);
const join = x=>arr(x).map(y=>esc(y)).join(" · ");
let DATA=null;
let filter="All", projectLimit=4, currentModal=null, motionAllowed=!window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function btnLink(label,href,cls="btn",attrs=""){return '<a '+attrs+' class="'+cls+'" href="'+esc(url(href))+'">'+esc(label)+' <span aria-hidden="true">↗</span></a>'}
function label(kicker,index){return '<div class="section-overline"><span class="seq">'+esc(index)+'</span><span>'+esc(kicker)+'</span><span class="section-rule"></span></div>'}
function section(id,inner,extra=""){return '<section id="'+esc(safeId(id))+'" class="section '+esc(extra)+'"><div class="wrap">'+inner+'</div></section>'}
function image(src,alt="",cls="",fallback=""){return src?'<img class="'+esc(cls)+'" src="'+esc(url(src))+'" alt="'+esc(alt)+'" loading="lazy" decoding="async" onerror="this.style.display=\'none\';this.parentElement.classList.add(\'image-failed\')">':fallback}
function tags(list){return '<div class="tags">'+arr(list).map(x=>'<span>'+esc(x)+'</span>').join("")+'</div>'}
function verifyBadge(item){
  if(item.verified && item.verification) return '<span class="proof verified"><span class="proof-dot">✓</span> '+esc(DATA?.ui?.achievementsEvidence||"Official source available")+'</span>';
  if(item.certificateReviewed) return '<span class="proof verified"><span class="proof-dot">✓</span> Personal certificate reviewed</span>';
  if(item.emailReviewed) return '<span class="proof"><span class="proof-dot">✉</span> '+esc(DATA?.ui?.achievementsEmail||"Personal organizer email reviewed")+'</span>';
  if(item.verification) return '<span class="proof"><span class="proof-dot">↗</span> Supporting link</span>';
  return '<span class="proof pending"><span class="proof-dot">○</span> '+esc(DATA?.ui?.achievementsPending||"Document can be requested")+'</span>';
}
const addName=(data,id)=>{if(!data)return null;return {id,kind:data.kind||"record",...data}};
function allDetails(){
 const d=DATA||{};
 return [
 ...arr(d.achievements?.cards).map(x=>({kind:"achievement",...x})),
 ...arr(d.projects?.items).map(x=>({kind:"project",...x})),
 ...arr(d.research?.items).map(x=>({kind:"research",...x})),
 ...arr(d.creative?.items).map(x=>({kind:"creative",...x})),
 ...arr(d.writing?.items).map(x=>({kind:"writing",...x}))
 ];
}
function hero(d){
 const h=d.hero||{},i=d.identity||{};
 return '<section class="hero" id="top">'+
  '<div class="hero-lattice" aria-hidden="true"></div>'+
  '<canvas id="science-canvas" aria-hidden="true"></canvas>'+
  '<div class="wrap hero-wrap">'+
    '<div class="hero-top meta"><span><i class="status-pulse"></i> '+esc(h.overline)+'</span><span>'+esc(i.location)+' / '+esc(d.lastEditedLabel)+'</span></div>'+
    '<div class="hero-grid">'+
     '<div class="hero-content">'+
      '<div class="eyebrow reveal"><span class="eyebrow-line"></span>'+esc(i.identityLine)+'</div>'+
      '<h1 class="reveal"><span>'+esc(h.firstLine)+'</span><em>'+esc(h.secondLine)+'</em></h1>'+
      '<p class="hero-intro reveal">'+esc(h.intro)+'</p>'+
      '<div class="hero-actions reveal"><a href="#'+esc(safeId(h.primaryTarget||"projects"))+'" class="btn bright">'+esc(h.primaryLabel||"Explore projects")+'<span>↗</span></a><a href="#'+esc(safeId(h.secondaryTarget||"achievements"))+'" class="text-btn">'+esc(h.secondaryLabel||"Explore honours")+'<span>↗</span></a></div>'+
      '<a class="hero-proof reveal" href="'+esc(url(h.verifiedUrl))+'" target="_blank" rel="noopener noreferrer"><span class="proof-symbol">✦</span><span class="proof-copy"><small>'+esc(d.ui?.heroEvidenceOverline||"INDEPENDENTLY LISTED")+'</small><b>'+esc(h.verifiedTag)+'</b></span><span class="proof-arrow">↗</span></a>'+
     '</div>'+
     '<div class="hero-visual reveal">'+
       '<div class="portrait-frame"><div class="portrait-sheen" aria-hidden="true"></div><div class="portrait-inner"><div class="portrait-fallback">'+esc(i.initials||"NT")+'</div>'+image(i.portrait,i.portraitAlt||i.name,"portrait-photo")+'</div>'+
         '<div class="portrait-caption"><span>'+esc(i.portraitCaption)+'</span><span>01 / PROFILE</span></div>'+
         '<span class="portrait-corner c1"></span><span class="portrait-corner c2"></span>'+
       '</div>'+
       '<div class="hero-research-label"><span class="crosshair">⌖</span><div><small>'+esc(h.stageLabel)+'</small><strong>'+esc(h.stageText)+'</strong></div></div>'+
     '</div>'+
    '</div>'+
    '<div class="hero-baseline meta"><span>'+esc(h.smallCaption)+'</span><span>'+esc(d.ui?.heroScroll||"SCROLL TO INVESTIGATE ↓")+'</span></div>'+
  '</div></section>'
}
function featureStrip(d){
 const h=d.hero||{};
 return '<section class="proof-strip"><div class="wrap proof-inner">'+
   '<div class="proof-identity"><span class="mini-kicker">'+esc(d.ui?.proofStripOverline||"RECOGNITION / 2026")+'</span><h2>'+esc(h.featureTitle||"#01")+'</h2><span>'+esc(h.featureSubtitle)+'</span></div>'+
   '<div class="proof-divider"></div>'+
   '<div class="proof-message"><span class="mini-kicker">'+esc(d.ui?.disciplinesOverline||"MORE THAN ONE DISCIPLINE")+'</span><p>'+esc(d.ui?.disciplines||"Leadership. Mathematics. Research. Design. Writing. Technology.").replaceAll("\n","<br>")+'</p></div>'+
   '<a class="outline-circle" href="'+esc(url(h.featureUrl))+'" target="_blank" rel="noopener noreferrer" aria-label="View ICSC official source">↗</a>'+
  '</div></section>'
}

function spotlight(d){
 const h=d.highlights||{};
 if(h.enabled===false)return "";
 const all=allDetails(),selected=arr(h.ids).map(id=>all.find(x=>x.id===id)).filter(Boolean);
 if(!selected.length)return "";
 return '<section class="spotlight-section" id="selected"><div class="wrap">'+
  label(d.ui?.highlightOverline||"CURATED HIGHLIGHTS","✦")+
  '<div class="spotlight-header"><h2 class="section-heading reveal">'+esc(d.ui?.highlightTitle||"A closer look.")+'</h2><p class="section-aside reveal">'+esc(d.ui?.highlightIntro||"An editor-selected index of work and evidence.")+'</p></div>'+
  '<div class="spotlight-grid">'+selected.map((x,i)=>
    '<article class="spotlight-card reveal" data-open="'+esc(x.kind)+'" data-id="'+esc(x.id)+'" role="button" tabindex="0" aria-label="Open '+esc(x.title)+'">'+
      '<span class="spotlight-number">0'+(i+1)+' / '+esc(x.kind.toUpperCase())+'</span>'+
      (x.image?'<div class="spotlight-pic">'+image(x.image,x.title,"")+'</div>':'<div class="spotlight-monogram">'+(x.kind==="achievement"?"✳":x.kind==="research"?"∑":"↗")+'</div>')+
      '<div class="spotlight-copy"><h3>'+esc(x.title)+'</h3><p>'+esc(trunc(x.summary||x.abstract||x.description,125))+'</p></div>'+
      '<span class="spotlight-arrow">'+esc(d.ui?.highlightOpen||"EXPLORE DETAILS")+' ↗</span>'+
    '</article>').join("")+'</div></div></section>'
}

function about(d){
 const a=d.about||{};
 return section("about",label(a.eyebrow,"01")+
   '<div class="about-grid"><div><h2 class="section-heading reveal">'+esc(a.heading)+'</h2><blockquote class="quotation reveal">'+esc(a.quote)+'</blockquote></div>'+
   '<div class="about-copy reveal"><p class="lead">'+esc(a.lead)+'</p><p>'+esc(a.body)+'</p><p class="about-school"><span>EDUCATION</span><b>'+esc(d.identity?.institution||"Independent student")+'</b></p></div></div>'+
   '<div class="principles">'+arr(a.principles).map(p=>'<article class="principle reveal"><span class="micro">'+esc(p.number)+'</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.body)+'</p></article>').join("")+'</div>',
   "on-paper");
}

function evidenceLinks(item){
 const evidence=[],seen=new Set();
 const add=(label,uri)=>{
  if(!uri)return;
  const href=url(uri);
  if(href==="#"||seen.has(href))return;
  seen.add(href);evidence.push({label:label||"Supporting evidence",href});
 };
 arr(item.supportingLinks).forEach(x=>add(x.label,x.url));
 if(item.kind==="achievement"||!item.kind){
  add(item.groupId==="government"?"Government results notice":"Official result",item.verification);
  add(/\.pdf(?:[?#]|$)/i.test(item.documentUrl||"")?"Certificate PDF":"Document",item.documentUrl);
  arr(item.gallery).filter(link=>/\.pdf(?:[?#]|$)/i.test(link)).forEach((link,i)=>add("Certificate / PDF "+(i+1),link));
 }
 return evidence;
}
function achievementCard(x,index,featured=false){
 const fallback=x.id?.includes("iymc")?"∑":x.id?.includes("icsc")?"01":x.groupId==="government"?"✎":"✧";
 const evidence=evidenceLinks(x);
 return '<article class="award-card reveal '+(featured?"featured ":"")+'" tabindex="0" role="button" data-open="achievement" data-id="'+esc(x.id)+'" aria-label="Open details about '+esc(x.title)+'">'+
 '<div class="award-art '+(x.image?"has-img":"")+'">'+(x.image?image(x.image,x.title,"award-img"):'<div class="award-glyph" aria-hidden="true">'+fallback+'</div>')+
 '<div class="award-art-top"><span>'+esc(x.year||"RECOGNITION")+'</span><span>'+esc(x.category)+'</span></div>'+
 '<div class="award-art-index">'+String(index+1).padStart(2,"0")+'</div></div>'+
 '<div class="award-content"><span class="micro">'+esc(x.institution)+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.summary)+'</p><div class="award-bottom">'+verifyBadge(x)+'<span class="card-open">'+esc(DATA?.ui?.achievementDetails||"VIEW THE RECORD")+' ↗</span></div>'+
 '<div class="award-source-list"><strong>'+esc(DATA?.ui?.supportingLinksTitle||"SUPPORTING LINKS")+'</strong><div class="award-source-chips">'+
 (evidence.length?evidence.map(l=>'<a href="'+esc(l.href)+'" target="_blank" rel="noopener noreferrer" aria-label="'+esc(l.label)+' for '+esc(x.title)+'">'+esc(l.label)+' <span>↗</span></a>').join(""):'<span class="award-source-empty">'+esc(DATA?.ui?.supportingLinksEmpty||"Documentation can be provided on request")+'</span>')+
 '</div></div></div></article>';
}
function achievements(d){
 const a=d.achievements||{},all=arr(a.cards);
 const groups=arr(a.groups).filter(g=>g.visible!==false);
 const known=new Set(groups.map(g=>g.id));
 const out=[...groups];
 if(all.some(x=>!known.has(x.groupId))){out.push({id:"uncategorized",eyebrow:"ADDITIONAL RECORDS",title:"Other Recognition",subtitle:"Additional achievements",description:"",logo:""})}
 return section("achievements",label(a.eyebrow,"02")+
 '<div class="section-split"><h2 class="section-heading reveal">'+esc(a.heading)+'</h2><p class="section-aside reveal">'+esc(a.intro)+'</p></div>'+
 '<nav class="award-group-index" aria-label="Achievement categories">'+out.filter(g=>all.some(x=>known.has(x.groupId)?x.groupId===g.id:g.id==="uncategorized")).map(g=>'<a href="#awards-'+esc(safeId(g.id))+'"><span class="index-dot"></span>'+esc(g.title)+'<span aria-hidden="true">↗</span></a>').join("")+'</nav>'+
 '<div class="award-groups">'+out.map((g,i)=>{
  const items=all.filter(x=>known.has(x.groupId)?x.groupId===g.id:!known.has(x.groupId)&&g.id==="uncategorized");
  if(!items.length)return "";
  return '<div class="award-group reveal" id="awards-'+esc(safeId(g.id))+'">'+
   '<div class="award-group-heading"><div class="award-group-logo">'+
   (g.logo?image(g.logo,g.logoAlt||g.title,"award-group-logo-image"):'<span class="award-group-symbol" aria-hidden="true">'+(g.id==="international"?"◎":g.id==="government"?"BD":"✦")+'</span>')+
   '</div><div class="award-group-text"><span class="micro">'+esc(g.eyebrow||"RECOGNITION")+'</span><h3>'+esc(g.title)+'</h3><p>'+esc(g.subtitle||g.description)+'</p></div>'+
   '<div class="award-group-count"><b>'+String(items.length).padStart(2,"0")+'</b><span>RECORDS</span></div></div>'+
   '<div class="award-grid">'+items.map((x,j)=>achievementCard(x,j,j===0)).join("")+'</div>'+
   (g.id==="government"?'<p class="award-group-disclaimer">'+esc(g.description)+'</p>':"")+
   (g.logoSource?'<a class="award-logo-credit" href="'+esc(url(g.logoSource))+'" target="_blank" rel="noopener noreferrer">Emblem source ↗</a>':"")+
   '</div>';
 }).join("")+'</div>'+
 '<div class="section-footnote"><span>↗</span> '+esc(d.ui?.achievementsNote||"Sources are available alongside each record.")+'</div>');
}
function projectCard(p,i){
 return '<article class="project-card reveal" tabindex="0" role="button" data-open="project" data-id="'+esc(p.id)+'" aria-label="Open '+esc(p.title)+' project details">'+
  '<div class="project-image">'+(p.image?image(p.image,p.title,"project-cover"):'<div class="project-abstraction abstraction-'+(i%4)+'"><span class="project-geometry"></span><span class="project-geometry secondary-geom"></span></div>')+
  '<span class="project-serial">'+String(i+1).padStart(2,"0")+' / '+esc(p.category)+'</span><span class="project-status">'+esc(p.status)+'</span></div>'+
  '<div class="project-meta"><span>'+esc(p.subtitle)+'</span><span>'+esc(p.year)+'</span></div>'+
  '<div class="project-body"><h3>'+esc(p.title)+'</h3><p>'+esc(p.summary)+'</p>'+tags(p.tags)+'<div class="project-more"><span>'+esc(DATA?.ui?.projectsDetails||"VIEW MORE")+'</span><b>↗</b></div></div>'+
 '</article>'
}
function projects(d){
 const p=d.projects||{},all=arr(p.items);
 const cats=["All",...new Set(all.map(x=>txt(x.category)).filter(Boolean))];
 const selected=(filter==="All"?all:all.filter(x=>x.category===filter));
 const shown=selected.slice(0,projectLimit);
 return section("projects",label(p.eyebrow,"03")+
 '<div class="section-split"><h2 class="section-heading reveal">'+esc(p.heading)+'</h2><p class="section-aside reveal">'+esc(p.intro)+'</p></div>'+
 '<div class="filters" role="group" aria-label="Filter project categories">'+cats.map(cat=>'<button type="button" class="filter '+(filter===cat?"is-active":"")+'" data-filter="'+esc(cat)+'">'+esc(cat)+'</button>').join("")+'</div>'+
 '<div class="projects-grid">'+shown.map((x,i)=>projectCard(x,i)).join("")+'</div>'+
 (selected.length>shown.length?'<button class="view-more" type="button" id="more-projects">'+esc(d.ui?.projectsMore||"VIEW MORE PROJECTS")+' <span>＋</span></button>':'')+
 (!selected.length?'<div class="empty-state">Nothing published in this category yet.</div>':'')
 );
}
function researchCard(p,index){
 return '<article class="research-record reveal" role="button" tabindex="0" data-open="research" data-id="'+esc(p.id)+'" aria-label="View research '+esc(p.title)+'">'+
 '<span class="research-number">R / '+String(index+1).padStart(2,"0")+'</span><div><span class="micro">'+esc(p.field||"RESEARCH")+' / '+esc(p.year||"ONGOING")+'</span>'+(p.status?'<span class="research-status">'+esc(p.status)+(p.paperId?' · '+esc(p.paperId):"")+'</span>':"")+'<h3>'+esc(p.title)+'</h3><p>'+esc(p.abstract||p.summary)+'</p></div><span class="research-arrow">↗</span></article>';
}
function research(d){
 const a=d.research||{},items=arr(a.items);
 return section("research",label(a.eyebrow,"04")+
 '<div class="research-head"><div><span class="micro">'+esc(d.ui?.researchJournal||"RESEARCH JOURNAL / WORKING ARCHIVE")+'</span><h2 class="section-heading reveal">'+esc(a.heading)+'</h2></div><div class="research-note reveal"><div class="notation" aria-hidden="true">∂<span>ƒ</span><sup>∞</sup></div><p>'+esc(a.intro)+'</p></div></div>'+
 (items.length?'<div class="research-list">'+items.map(researchCard).join("")+'</div>':
 '<div class="research-empty"><div class="notation" aria-hidden="true">∑ <span>?</span></div><div><h3>'+esc(a.emptyTitle)+'</h3><p>'+esc(a.emptyBody)+'</p></div><span>ONGOING / ARCHIVE</span></div>'),
 "research-section");
}
function creativeCard(x,i){
 return '<article class="creative-card reveal" tabindex="0" role="button" data-open="creative" data-id="'+esc(x.id)+'" aria-label="View '+esc(x.title)+'">'+
 '<div class="creative-visual creative-v'+(i%4)+'">'+(x.image?image(x.image,x.title,"creative-img"):'<div class="creative-shape shape-'+(i%3)+'"><span></span><i></i></div>')+
 '<small>'+String(i+1).padStart(2,"0")+' / '+esc(x.category)+'</small></div><div class="creative-title"><div><h3>'+esc(x.title)+'</h3><p>'+esc(x.description)+'</p></div><span>↗</span></div></article>'
}
function creative(d){
 const a=d.creative||{},items=arr(a.items);
 return section("creative",label(a.eyebrow,"05")+
 '<div class="section-split"><h2 class="section-heading reveal">'+esc(a.heading)+'</h2><p class="section-aside reveal">'+esc(a.intro)+'</p></div>'+
 '<div class="creative-grid">'+items.map(creativeCard).join("")+'</div>',
 "creative-section");
}
function writing(d){
 const a=d.writing||{},items=arr(a.items);
 return section("writing",label(a.eyebrow,"06")+
 '<div class="section-split"><h2 class="section-heading reveal">'+esc(a.heading)+'</h2><p class="section-aside reveal">'+esc(a.intro)+'</p></div>'+
 (items.length?'<div class="writing-list">'+items.map((x,i)=>
 '<article class="writing-row reveal" role="button" tabindex="0" data-open="writing" data-id="'+esc(x.id)+'"><span class="micro">'+String(i+1).padStart(2,"0")+' / '+esc(x.year||x.date||"ESSAY")+'</span><div><h3>'+esc(x.title)+'</h3><p>'+esc(trunc(x.summary||x.description||x.abstract,220))+'</p></div><span class="writing-arrow">↗</span></article>').join("")+'</div>':
 '<div class="writing-empty reveal"><span class="writing-mark">“</span><h3>'+esc(a.emptyTitle)+'</h3><p>'+esc(a.emptyBody)+'</p></div>'),
 "writing-section");
}
function academics(d){
 const a=d.academics||{};
 return section("academics",label(a.eyebrow,"07")+
 '<div class="section-split"><h2 class="section-heading reveal">'+esc(a.heading)+'</h2><p class="section-aside reveal">'+esc(a.intro)+'</p></div>'+
 '<div class="path-list">'+arr(a.items).map((x,i)=>'<article class="path-row reveal"><div class="path-date">'+esc(x.year)+'</div><div class="path-dot"></div><div><span class="micro">'+esc(x.type)+' / '+esc(x.organization)+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.description)+'</p>'+(x.link?btnLink("SEE SOURCE",x.link,"subtle-link",'target="_blank" rel="noopener noreferrer"'):"")+'</div></article>').join("")+'</div>',
 "academic-section");
}
function custom(d){
 return arr(d.customSections).filter(x=>x.visible!==false).map((a,i)=>section(a.id||"custom-"+i,
 label(a.eyebrow||a.label||"CUSTOM SECTION",String(i+9).padStart(2,"0"))+
 '<div class="section-split"><h2 class="section-heading reveal">'+esc(a.heading||a.title)+'</h2><p class="section-aside reveal">'+esc(a.intro)+'</p></div>'+
 '<div class="custom-cards">'+arr(a.items).map((x,j)=>'<article class="custom-card reveal"><div class="custom-cover">'+image(x.image,x.title,"custom-image")+'</div><div class="custom-body"><span class="micro">'+esc(x.category||"FEATURE")+'</span><h3>'+esc(x.title)+'</h3><p>'+esc(x.description||x.body)+'</p>'+(x.url?btnLink("OPEN",x.url,"subtle-link",'target="_blank" rel="noopener noreferrer"'):"")+'</div></article>').join("")+'</div>'
 ,"custom-section")).join("");
}
function contact(d){
 const c=d.contact||{},i=d.identity||{};
 return '<section class="contact-section" id="contact"><div class="wrap">'+label(c.eyebrow,"08")+
 '<div class="contact-grid"><div><p class="contact-small">'+esc(i.availability)+'</p><h2>'+esc(c.heading)+'</h2><p>'+esc(c.intro)+'</p></div><div class="contact-actions">'+
 (i.email?btnLink(c.emailLabel||"EMAIL ME","mailto:"+i.email,"btn dark"):"")+
 btnLink(c.githubLabel||"GITHUB",c.githubUrl||"https://github.com/nafis-tamim","outlined-btn",'target="_blank" rel="noopener noreferrer"')+'</div></div>'+
 '<footer class="footer"><div class="footer-brand">'+esc(i.name)+'<span> / '+esc(c.footerLine)+'</span></div><div class="footer-links">'+arr(i.socials).map(x=>btnLink(x.label,x.url,"footer-link",'target="_blank" rel="noopener noreferrer"')).join("")+'</div><div class="footer-end"><span>© '+new Date().getFullYear()+' '+esc(c.copyrightName||i.name)+'</span><span>'+esc(c.credit)+'</span></div></footer>'+
 '</div></section>'
}
function render(){
 const d=DATA;
 document.title=d.seo?.title||d.identity?.name||"Academic Portfolio";
 const meta=$('meta[name="description"]');if(meta)meta.setAttribute("content",d.seo?.description||"");
 const keywords=$('meta[name="keywords"]');if(keywords)keywords.setAttribute("content",d.seo?.keywords||"");
 const fav=$('link[rel="icon"]');if(fav&&d.seo?.favicon)fav.setAttribute("href",url(d.seo.favicon));
 for(const [k,v] of Object.entries({background:"--bg",paper:"--paper",ink:"--ink",inkSoft:"--muted",deep:"--deep",accent:"--accent",teal:"--teal",gold:"--gold",border:"--border"})){
   if(/^#[0-9a-fA-F]{3,8}$/.test(txt(d.appearance?.[k]))) document.documentElement.style.setProperty(v,d.appearance[k]);
 }
 const nav=arr(d.navigation).filter(x=>x.visible!==false);
 const builtin={about,achievements,projects,research,creative,writing,academics,contact};
 const built=new Set();
 let sections="";
 for(const n of nav){
  const fn=builtin[n.id];
  if(fn){sections+=fn(d);built.add(n.id)}
  else {const customEntry=arr(d.customSections).find(x=>x.id===n.id);if(customEntry&&customEntry.visible!==false){sections+=custom({...d,customSections:[customEntry]})}}
 }
 const links=nav.filter(x=>x.id!=="contact").map(x=>'<a class="nav-item" href="#'+esc(safeId(x.id))+'">'+esc(x.label)+'</a>').join("");
 $('#app').innerHTML='<div class="site">'+
 '<header class="site-header"><div class="wrap nav-wrap">'+
 '<a href="#top" class="brand" aria-label="Nafis Tamim, home"><span class="brand-mark">'+esc(d.identity?.initials||"NT")+(d.identity?.portrait?'<img src="'+esc(url(d.identity.portrait))+'" alt="" loading="eager" onerror="this.remove()">':"")+'</span><span class="brand-name">'+esc(d.identity?.name)+'</span></a>'+
 '<nav class="site-nav" id="site-nav" aria-label="Main navigation">'+links+'</nav>'+
 '<div class="nav-actions"><a class="nav-contact" href="#contact">'+esc(d.ui?.mobileContact||"LET’S TALK")+' <span>↗</span></a><button id="menu-toggle" class="menu-toggle" aria-label="Open navigation" aria-expanded="false" aria-controls="mobile-nav"><span></span><span></span></button></div>'+
 '</div><nav class="mobile-nav" id="mobile-nav" aria-label="Mobile navigation">'+nav.map(x=>'<a href="#'+esc(safeId(x.id))+'">'+esc(x.label)+'</a>').join("")+'</nav></header>'+
 '<main>'+hero(d)+featureStrip(d)+spotlight(d)+sections+'</main>'+
 '<div id="detail-modal" class="modal" hidden role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-backdrop" data-close="1"></div><div class="modal-panel" tabindex="-1"><button class="modal-close" type="button" data-close="1" aria-label="Close details">✕</button><div id="modal-body"></div></div></div>'+
 '</div>';
 bind(); reveal(); startScienceCanvas(d.appearance||{});
}
function modalContent(item){
 const files=[item.image,...arr(item.gallery)].filter(Boolean);
 const gallery=files.length?'<div class="modal-gallery">'+files.map(f=>'<a href="'+esc(url(f))+'" target="_blank" rel="noopener noreferrer">'+(/\.(pdf)(\?|$)/i.test(f)?'<div class="pdf-tile">PDF DOCUMENT ↗</div>':image(f,item.title,"modal-img"))+'</a>').join("")+'</div>':"";
 const items=[
 ...(item.kind==="research"?[["Editorial status",item.status],["Journal / publication plan",item.publication],["Paper ID",item.paperId],["Acceptance evidence",item.reviewEvidence],["Verification status",item.evidenceStatus]]:[]),
 ["Overview",item.summary||item.description||item.abstract],
 ["Question / Challenge",item.challenge||item.question],
 ["Method / Process",item.process||item.method],
 ["What came of it",item.outcome||item.result],
 ["Further context",item.details||item.body]
 ].filter(x=>x[1]);
 const direct=item.url||item.link||item.documentUrl;
 const verify=item.verification;
 const support=evidenceLinks(item);

 const title=item.title||"Project details";
 return '<div class="modal-kicker">'+esc((item.category||item.field||item.kind||"PORTFOLIO ENTRY").toUpperCase())+' / '+esc(item.year||"ARCHIVE")+'</div>'+
 '<h2 id="modal-title">'+esc(title)+'</h2>'+
 '<p class="modal-org">'+esc(item.institution||item.organization||item.subtitle||"")+'</p>'+
 gallery+
 '<div class="modal-sections">'+items.map(x=>'<section><h3>'+esc(x[0])+'</h3><p>'+esc(x[1])+'</p></section>').join("")+'</div>'+
 tags(item.tags)+
 '<div class="modal-actions">'+(verify?btnLink(item.kind==="research"?"OPEN RESEARCHGATE RECORD":(DATA?.ui?.modalVerification||"OPEN OFFICIAL SOURCE"),verify,"btn dark",'target="_blank" rel="noopener noreferrer"'):"")+
 (direct?btnLink(DATA?.ui?.modalLink||"VIEW PROJECT / DOCUMENT",direct,"btn outline",'target="_blank" rel="noopener noreferrer"'):"")+
 (item.kind==="achievement"?support.filter(l=>l.href!==url(verify)&&l.href!==url(direct)).map(l=>btnLink(l.label,l.href,"btn outline",'target="_blank" rel="noopener noreferrer"')).join(""):"")+
 '</div>'+
 ((item.verified&&verify)?'<p class="modal-proof">✓ Recognition linked to an independently accessible official source.</p>':
 (item.certificateReviewed?'<p class="modal-proof">✓ A named personal certificate has been reviewed. Public certificate preview can be added through the Portfolio Studio.</p>':
 (item.emailReviewed?'<p class="modal-proof">✉ Named organizer correspondence was provided for review. This is a commendation, not an officially announced medal or published featured submission.</p>':
 (item.kind==="achievement"&&!verify?'<p class="modal-proof">Supporting certificate or individual result link can be added through the private Portfolio Studio.</p>':""))));
}
function openDetail(kind,id){
 const item=allDetails().find(x=>x.kind===kind&&x.id===id);
 if(!item)return;
 currentModal=document.activeElement;
 const modal=$('#detail-modal');
 $('#modal-body').innerHTML=modalContent(item);
 modal.hidden=false;
 document.body.classList.add("modal-open");
 $('.modal-panel',modal).scrollTop=0;
 $('.modal-close',modal)?.focus();
}
function closeDetail(){
 const modal=$('#detail-modal');if(!modal||modal.hidden)return;
 modal.hidden=true;document.body.classList.remove("modal-open");
 currentModal?.focus?.();
}
function bind(){
 const toggle=$('#menu-toggle'),nav=$('#mobile-nav');
 toggle?.addEventListener("click",()=>{const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",open?"true":"false")});
 $$(".mobile-nav a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");toggle?.setAttribute("aria-expanded","false")}));
 $$("[data-open]").forEach(card=>{
  card.addEventListener("click",e=>{if(e.target.closest("a"))return;openDetail(card.dataset.open,card.dataset.id)});
  card.addEventListener("keydown",e=>{if(e.target!==card)return;if(e.key==="Enter"||e.key===" "){e.preventDefault();openDetail(card.dataset.open,card.dataset.id)}});
 });
 $$("[data-close]").forEach(el=>el.addEventListener("click",closeDetail));
 $$("#modal-body a").forEach(a=>a.addEventListener("click",e=>e.stopPropagation()));
 $$(".filter").forEach(el=>el.addEventListener("click",()=>{
  filter=el.dataset.filter;projectLimit=4;const holder=$("#projects");
  if(!holder)return;
  const temp=document.createElement("div");temp.innerHTML=projects(DATA);
  holder.replaceWith(temp.firstElementChild);
  bindSection("#projects");reveal();
 }));
 $("#more-projects")?.addEventListener("click",()=>{
  projectLimit+=4;const holder=$("#projects"),temp=document.createElement("div");temp.innerHTML=projects(DATA);holder.replaceWith(temp.firstElementChild);bindSection("#projects");reveal();
 });
 document.addEventListener("keydown",e=>{
  if(e.key==="Escape")closeDetail();
  if(e.key==="Tab"&&!$("#detail-modal")?.hidden){
   const foc=$$("#detail-modal button,#detail-modal a").filter(el=>el.offsetParent!==null);
   if(foc.length){const first=foc[0],last=foc[foc.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
  }
 },{once:false});
}
function bindSection(selector){
 const s=$(selector);if(!s)return;
 $$("[data-open]",s).forEach(x=>{
 x.onclick=()=>openDetail(x.dataset.open,x.dataset.id);
 x.onkeydown=e=>{if(e.target!==x)return;if(e.key==="Enter"||e.key===" "){e.preventDefault();openDetail(x.dataset.open,x.dataset.id)}}});
 $$(".filter",s).forEach(x=>x.onclick=()=>{filter=x.dataset.filter;projectLimit=4;const t=document.createElement("div");t.innerHTML=projects(DATA);s.replaceWith(t.firstElementChild);bindSection(selector);reveal()});
 $("#more-projects",s)?.addEventListener("click",()=>{projectLimit+=4;const t=document.createElement("div");t.innerHTML=projects(DATA);s.replaceWith(t.firstElementChild);bindSection(selector);reveal()});
}
function reveal(){
 const elements=$$(".reveal");
 if(!DATA.appearance?.sectionReveals||!DATA.appearance?.motion||!motionAllowed||!window.IntersectionObserver){
  elements.forEach(x=>x.classList.add("is-visible"));return;
 }
 const io=new IntersectionObserver(list=>list.forEach(x=>{if(x.isIntersecting){x.target.classList.add("is-visible");io.unobserve(x.target)}}),{rootMargin:"0px 0px -25px 0px",threshold:.035});
 elements.forEach(el=>{if(!el.classList.contains("is-visible"))io.observe(el)});
}
function startScienceCanvas(config){
 const canvas=$("#science-canvas");if(!canvas)return;
 if(!config.motion||!motionAllowed||config.animation==="none"){canvas.style.display="none";return}
 const ctx=canvas.getContext("2d");if(!ctx)return;
 let w=0,h=0,dpr=1,raf=0,active=true;
 let nodes=[];let cursor={x:-999,y:-999};
 const resize=()=>{
  const box=canvas.getBoundingClientRect();w=box.width;h=box.height;dpr=Math.min(2,window.devicePixelRatio||1);
  canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
  const n=Math.min(65,Math.max(25,Math.floor(w*h/25000)));
  nodes=Array.from({length:n},(_,i)=>({x:(i*.6180339887%1)*w,y:(i*.414213562%1)*h,vx:(Math.sin(i*2.5))*.045,vy:(Math.cos(i*1.6))*.04,r:i%5===0?1.9:1}));
 };
 let tick=0;
 const renderFrame=()=>{
  if(!active)return;ctx.clearRect(0,0,w,h);tick++;
  if(config.animation==="orbit"){
   const centerX=w*.72,centerY=h*.43;
   for(let j=0;j<5;j++){
    ctx.beginPath();ctx.strokeStyle=j===2?"rgba(187,240,121,.12)":"rgba(227,240,235,.075)";ctx.lineWidth=1;
    ctx.ellipse(centerX,centerY,70+j*47,35+j*20,(j*.48)+Math.sin(tick/800)*.15,0,Math.PI*2);ctx.stroke();
   }
  }
  for(const p of nodes){
   p.x+=p.vx;p.y+=p.vy;
   if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;
   ctx.beginPath();ctx.fillStyle="rgba(205,228,221,.22)";ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();
  }
  for(let i=0;i<nodes.length;i++){for(let j=i+1;j<nodes.length;j++){
   const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,dist=dx*dx+dy*dy;
   if(dist<14500){ctx.beginPath();ctx.strokeStyle="rgba(192,230,217,"+(0.085*(1-dist/14500))+")";ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
  }}
  if(cursor.x>0){
   const near=nodes.filter(p=>Math.hypot(p.x-cursor.x,p.y-cursor.y)<125).slice(0,10);
   for(const p of near){ctx.beginPath();ctx.moveTo(cursor.x,cursor.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle="rgba(187,240,121,.13)";ctx.stroke()}
  }
  raf=requestAnimationFrame(renderFrame);
 };
 canvas.addEventListener("pointermove",e=>{const b=canvas.getBoundingClientRect();cursor.x=e.clientX-b.left;cursor.y=e.clientY-b.top},{passive:true});
 canvas.addEventListener("pointerleave",()=>cursor={x:-999,y:-999});
 window.addEventListener("resize",resize,{passive:true});
 document.addEventListener("visibilitychange",()=>{active=!document.hidden;if(active){resize();cancelAnimationFrame(raf);raf=requestAnimationFrame(renderFrame)}else cancelAnimationFrame(raf)});
 resize();raf=requestAnimationFrame(renderFrame);
}
async function init(){
 try{
  const resp=await fetch("/content/site.json",{cache:"no-cache"});
  if(!resp.ok)throw Error("The portfolio could not be loaded");
  DATA=await resp.json();render();
 }catch(e){console.error(e);$("#app").innerHTML='<section class="offline"><h1>Portfolio temporarily unavailable.</h1><p>Please refresh in a moment.</p><a href="/">Retry ↗</a></section>'}
}
window.addEventListener("scroll",()=>{
 const max=document.documentElement.scrollHeight-innerHeight;const progress=max>0?scrollY/max:0;
 document.documentElement.style.setProperty("--scroll-progress",(100*progress)+"%");
},{passive:true});
init();
