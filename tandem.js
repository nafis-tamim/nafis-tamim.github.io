
"use strict";
const root=document.querySelector("#app");
let CONTENT=null,awards=[],activeFilter="all",lastFocus=null;
const list=v=>Array.isArray(v)?v:[];
const val=v=>v===undefined||v===null?"":String(v);
const esc=v=>val(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const safeId=v=>val(v).replace(/[^a-zA-Z0-9_-]/g,"");
function url(v){
 const x=val(v).trim();if(!x)return "#";
 if(x[0]==="#")return "#"+safeId(x.slice(1));
 if(x.startsWith("/"))return x.startsWith("//")?"#":x;
 try{const u=new URL(x,location.href);return ["https:","http:","mailto:"].includes(u.protocol)?u.href:"#"}catch{return "#"}
}
const img=(src,alt,cl="",loading="lazy")=>url(src)==="#"?"":'<img src="'+esc(url(src))+'" alt="'+esc(alt||"")+'" class="'+esc(cl)+'" loading="'+loading+'" decoding="async">';
const href=(label,to,cl="text-link")=>url(to)==="#"?"":'<a class="'+cl+'" href="'+esc(url(to))+'" '+(val(to).startsWith("#")?"":'target="_blank" rel="noopener noreferrer"')+'>'+esc(label||"Open link")+' ↗</a>';
const small=x=>'<span class="eyebrow">'+esc(x)+'</span>';
const sectionStart=(id,cl="")=>'<section class="sheet '+cl+'" id="'+esc(safeId(id))+'">';
const heading=(tag,title,description)=>'<div class="section-top"><div>'+small(tag)+'<h2>'+esc(title)+'</h2></div><p>'+esc(description)+'</p></div>';
const sectionLinks=s=>list(s?.sectionLinks).map(x=>href(x.label,x.url)).join(" &nbsp; ");
const media=(src,alt,cl)=>'<div class="'+cl+'">'+(src?img(src,alt):'<div class="empty-note">VISUAL ARCHIVE / NAFIS TAMIM</div>')+'</div>';
const socialLinks=d=>list(d?.identity?.socials).filter(x=>x.url).map(x=>href(x.label,x.url)).join("");
const seeText=(key,fallback)=>val(CONTENT?.ui?.[key])||fallback;
const btn=(label,link,outline=false)=>'<a href="'+esc(url(link))+'" class="btn'+(outline?' outline':'')+'">'+esc(label)+' <span aria-hidden="true">↗</span></a>';
const getYear=(x)=>val(x.year)||"2026";
function header(d){
 const items=list(d.navigation).filter(n=>n.visible!==false);
 const anchors=items.map(n=>'<a href="'+esc(url(n.href||n.target||("#"+safeId(n.id))))+'"'+(n.openNewTab?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(n.label)+'</a>').join("");
 return '<a class="skip" href="#main">Skip to content</a><header class="top"><div class="top-inner"><a class="brand" href="#top" aria-label="Nafis Tamim, home"><span class="brand-symbol">'+esc(d.identity?.initials||"NT")+'</span><span>'+esc(d.identity?.name||"Nafis Tamim")+'<small>STUDENT / RESEARCH / DESIGN</small></span></a><nav class="nav-links" aria-label="Primary navigation">'+anchors+'</nav><div class="header-end"><a class="header-cta" href="#contact">'+esc(d.contact?.emailLabel||"Contact")+' <span aria-hidden="true">↗</span></a><button id="menu-toggle" class="menu-toggle" aria-label="Open navigation" aria-controls="mob-menu" aria-expanded="false">☰</button></div></div></header><nav id="mob-menu" class="mob-menu" aria-label="Mobile navigation">'+anchors+'</nav>'
}
function hero(d){
 const identity=d.identity||{},h=d.hero||{};
 return sectionStart("top","hero")+'<div class="hero-upper"><div class="hero-heading"><span>Nafis</span><span>Tamim.</span></div><div class="hero-side"><div>'+small(identity.identityLine||identity.descriptor||"STUDENT / CREATIVE TECHNOLOGY")+'<p class="rule-top" style="margin-top:16px;font-size:13px">'+esc(identity.institution||"")+"<br>"+esc(identity.location||"Dhaka, Bangladesh")+'</p></div><div>'+media(identity.portrait,identity.portraitAlt||"Portrait of Nafis Tamim","hero-image-wrap").replace('class="hero-image-wrap"','class="hero-image-wrap"')+'</div></div></div><div class="hero-bottom"><div class="hero-intro"><p class="prose">'+esc(h.intro||"Learning through research, mathematics and creative technology.")+'</p><div class="hero-actions">'+btn(h.primaryLabel||"Explore my work","#"+safeId(h.primaryTarget||"projects"))+href(h.secondaryLabel||"Achievements","#"+safeId(h.secondaryTarget||"achievements"))+'</div></div><div class="hero-fact"><span>'+esc(identity.descriptor||"Research / Design / Engineering")+'</span>'+esc(h.firstLine||"Curiosity")+' '+esc(h.secondLine||"in motion.")+'</div><div class="hero-fact"><span>BASED IN</span>'+esc(identity.location||"Bangladesh")+'</div></div><div class="hero-stage"></div></section>'
}
function about(d){
 const a=d.about||{};
 const traits=list(a.principles).map((p,i)=>'<div class="trait reveal">'+small(p.number||String(i+1).padStart(2,"0"))+'<div><b>'+esc(p.title)+'</b><p>'+esc(p.body)+'</p></div></div>').join("");
 return sectionStart("about","about")+heading(a.eyebrow||"01 / ABOUT",a.heading||"Across disciplines.",a.lead||"Mathematics, research and creative practice.")+'<div class="about-area"><div class="about-photo reveal">'+img(d.identity?.portrait,d.identity?.portraitAlt||"Portrait of Nafis Tamim")+'</div><div class="about-copy reveal"><p class="prose">'+esc(a.lead||"")+'</p><p>'+esc(a.body||"")+'</p><p><em>'+esc(a.quote||"")+'</em></p>'+sectionLinks(a)+'</div></div><div class="about-traits">'+traits+'</div></section>'
}
function categories(d){
 const gs=list(d.achievements?.groups).filter(g=>g.visible!==false);
 return [{id:"all",title:"All work"}].concat(gs.map(g=>({id:g.id,title:g.title})));
}
function awardCards(d){
 const data=list(d.achievements?.cards);
 const shown=data.filter(c=>activeFilter==="all"||val(c.groupId)===activeFilter);
 if(!shown.length)return '<div class="empty-note">No entries in this category yet.</div>';
 return shown.map((c)=>{const idx=awards.findIndex(x=>x===c);
 const group=list(d.achievements?.groups).find(x=>x.id===c.groupId);
 return '<article class="award reveal"><div class="award-visual">'+img(c.image,c.imageAlt||c.title)+'</div><div class="award-info"><h3>'+esc(c.title)+'</h3><p>'+esc(c.summary||c.institution||"")+'</p></div><div class="award-meta">'+small(c.year||"")+'<span class="pill">'+esc(group?.title||c.category||"Recognition")+'</span></div><button class="award-more" data-award="'+idx+'" aria-label="View more about '+esc(c.title)+'">'+esc(seeText("achievementDetails","View more"))+' <span aria-hidden="true">↗</span></button></article>'
 }).join("");
}
function achievements(d){
 const a=d.achievements||{};
 const filters=categories(d).map(g=>'<button class="filter" type="button" aria-pressed="'+(activeFilter===g.id)+'" data-filter="'+esc(g.id)+'">'+esc(g.title)+'</button>').join("");
 return sectionStart("achievements","achievements")+ '<div class="achievement-top"><div>'+small(a.eyebrow||"02 / RECOGNITION")+'<h2>'+esc(a.heading||"Achievements")+'</h2><p class="prose" style="margin-top:25px;max-width:42ch">'+esc(a.intro||"A collection of academic milestones and supporting materials.")+'</p></div><div class="filters" role="group" aria-label="Filter achievements">'+filters+'</div></div><div class="award-list" id="award-list">'+awardCards(d)+'</div><div style="margin-top:25px">'+sectionLinks(a)+'</div></section>'
}
function projectCard(c,i){
 let links=list(c.links).filter(x=>x.url);
 if(!links.length&&c.url)links=[{label:"Explore project",url:c.url}];
 if(c.pdf)links.push({label:"Open PDF",url:c.pdf});
 return '<article class="project reveal"><div class="rule-top"><span class="small-label faint">'+esc(String(i+1).padStart(2,"0"))+' / '+esc(c.category||c.status||"Project")+'</span></div>'+media(c.image,c.imageAlt||c.title,"project-media")+'<div><h3>'+esc(c.title)+'</h3><p>'+esc(c.summary||c.subtitle||"")+'</p><div class="project-foot"><span class="project-meta">'+esc(c.year||"")+' '+esc(c.status||"")+'</span>'+href(seeText("projectsDetails","View project"),c.url||links[0]?.url)+'</div><div class="project-links">'+links.slice(0,4).map(x=>href(x.label,x.url)).join("")+'</div></div></article>'
}
function projects(d){const p=d.projects||{};return sectionStart("projects","projects")+heading(p.eyebrow||"03 / PROJECTS",p.heading||"Selected projects",p.intro||"")+'<div class="project-grid">'+list(p.items).map(projectCard).join("")+'</div><div style="padding-top:35px">'+sectionLinks(p)+'</div></section>'}
function research(d){
 const r=d.research||{};
 let entries=list(r.items).map(c=>{
 let links=list(c.links).filter(x=>x.url);
 if(c.documentUrl&&!links.some(x=>x.url===c.documentUrl))links.push({label:"Open research",url:c.documentUrl});
 return '<article class="research-entry reveal"><div>'+media(c.image,c.imageAlt||c.title,"research-media")+'</div><div>'+small(c.field||"Independent research")+'<h3 style="margin-top:15px">'+esc(c.title)+'</h3><p>'+esc(c.abstract||c.details||"")+'</p><div class="research-tags"><span>'+esc(c.year||"")+'</span><span>'+esc(c.status||"Research work")+'</span>'+list(c.tags).slice(0,3).map(t=>'<span>'+esc(t)+'</span>').join("")+'</div>'+links.slice(0,5).map(x=>href(x.label,x.url)).join("")+(c.pdf?href("PDF",c.pdf):"")+'</div></article>'}).join("");
 if(!entries)entries='<div class="empty-note">'+esc(r.emptyBody||"Research work will appear here.")+'</div>';
 return sectionStart("research","research")+heading(r.eyebrow||"04 / RESEARCH",r.heading||"Research",r.intro||"")+'<p class="research-statement reveal">'+esc(seeText("researchJournal","An evolving archive of research, methods and inquiry."))+'</p><div class="research-list">'+entries+'</div>'+sectionLinks(r)+'</section>'
}
function values(d){
 const principles=list(d.about?.principles);
 return sectionStart("principles","blue-sheet")+heading("APPROACH / 05","What shapes the work.","The principles behind each project, experiment and academic pursuit.")+principles.map((v,i)=>'<div class="blue-stack reveal"><span>'+small(v.number||String(i+1).padStart(2,"0"))+'</span></span><div><h3>'+esc(v.title)+'</h3><p>'+esc(v.body)+'</p></div></div>').join("")+'</section>'
}
function creative(d){
 const c=d.creative||{};
 return sectionStart("creative","creative")+heading(c.eyebrow||"06 / VISUAL WORK",c.heading||"Creative work",c.intro||"")+'<div class="creative-grid">'+list(c.items).map((x,i)=>'<article class="creative-card reveal"><div class="creative-img">'+img(x.image,x.title)+'</div>'+small(x.category||"Design")+'<h3>'+esc(x.title)+'</h3><p>'+esc(x.description||"")+'</p>'+href(x.links?.[0]?.label||"Explore",x.link||x.links?.[0]?.url)+'</article>').join("")+'</div>'+sectionLinks(c)+'</section>'
}
function academic(d){
 const a=d.academics||{};
 return sectionStart("academics","academics")+heading(a.eyebrow||"07 / EDUCATION",a.heading||"An evolving journey",a.intro||"")+'<div class="timeline">'+list(a.items).map(x=>'<article class="time-item reveal"><span class="small-label">'+esc(x.year||"")+' / '+esc(x.type||"")+'</span><h3>'+esc(x.title)+'</h3><p><b>'+esc(x.organization||"")+'</b></p><p>'+esc(x.description||"")+'</p>'+href(x.links?.[0]?.label||"Supporting link",x.link||x.links?.[0]?.url)+'</article>').join("")+'</div>'+sectionLinks(a)+'</section>'
}
function custom(d){
 return list(d.customSections).filter(x=>x.visible!==false).map((c,i)=>{
 const id=safeId(c.id||("custom"+i));
 const links=list(c.links||c.sectionLinks).map(x=>href(x.label,x.url)).join(" &nbsp; ");
 return sectionStart(id,"custom-section line")+heading(c.eyebrow||"MORE / "+String(i+1).padStart(2,"0"),c.heading||c.title||"Untitled",c.intro||c.description||"")+'<div class="custom-body prose">'+esc(c.body||c.text||"")+'</div><div style="margin-top:26px">'+(c.image?img(c.image,c.title||"Portfolio section"):"")+'</div><div style="margin-top:26px">'+links+'</div></section>'
 }).join("");
}
function contact(d){
 const c=d.contact||{},mail=d.identity?.email||"";
 return sectionStart("contact","contact")+small(c.eyebrow||"08 / CONTACT")+'<h2 style="margin-top:20px">'+esc(c.heading||"Let’s talk.")+'</h2><p>'+esc(c.intro||"")+'</p>'+btn(c.emailLabel||"Write to me","mailto:"+mail)+'<div class="social-grid">'+socialLinks(d)+href(c.githubLabel||"GitHub",c.githubUrl)+'</div><div class="foot-word">Nafis.</div><div class="foot-bottom"><span>© '+new Date().getFullYear()+' '+esc(c.copyrightName||"Nafis Tamim")+'</span><span>'+esc(c.footerLine||"A living portfolio.")+'</span><a href="#top">BACK TO TOP ↑</a></div></section>'
}
function layout(d){
 awards=list(d.achievements?.cards);
 root.innerHTML=header(d)+'<main id="main">'+hero(d)+about(d)+achievements(d)+projects(d)+research(d)+values(d)+creative(d)+academic(d)+custom(d)+contact(d)+'</main><div id="award-modal" class="modal-backdrop" role="presentation" hidden><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><button id="close-modal" class="modal-close" aria-label="Close details">×</button><div id="modal-body"></div></div></div>';
 const theme=d.appearance?.accent;
 if(/^#[0-9a-fA-F]{6}$/.test(theme||""))document.documentElement.style.setProperty("--accent",theme);
 if(d.seo?.favicon){document.querySelector("link[rel=icon]")?.setAttribute("href",url(d.seo.favicon))}
 if(d.seo?.title)document.title=d.seo.title;
 const meta=document.querySelector('meta[name="description"]');if(meta&&d.seo?.description)meta.content=d.seo.description;
 const og=document.querySelector('meta[property="og:image"]');if(og)og.content=url(d.seo?.ogImage||d.identity?.portrait);
 initMotion();
}
function initMotion(){
 if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||CONTENT?.appearance?.motion===false){document.querySelectorAll(".reveal").forEach(e=>e.classList.add("in"));return}
 const ob=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");ob.unobserve(e.target)}})},{rootMargin:"0px 0px -7% 0px",threshold:.06});
 document.querySelectorAll(".reveal").forEach(x=>ob.observe(x));
}
function refreshAwards(){
 const el=document.querySelector("#award-list"),filter=document.querySelector(".filters");
 if(!el||!filter)return;
 el.innerHTML=awardCards(CONTENT);
 filter.innerHTML=categories(CONTENT).map(g=>'<button class="filter" type="button" aria-pressed="'+(activeFilter===g.id)+'" data-filter="'+esc(g.id)+'">'+esc(g.title)+'</button>').join("");
 initMotion();
}
function isPDF(u){return /\.pdf(?:[?#]|$)/i.test(val(u))}
function detail(d){
 if(!d)return;
 lastFocus=document.activeElement;
 let mediaList=[d.image,...list(d.gallery),d.documentUrl].filter(Boolean);
 mediaList=[...new Set(mediaList)];
 let gallery=mediaList.map((item,i)=>{
 if(isPDF(item))return '<a href="'+esc(url(item))+'" target="_blank" rel="noopener noreferrer"><div style="height:175px;display:grid;place-items:center;background:var(--paper);font:300 49px var(--head)">PDF ↗</div><span class="file-chip">Certificate / PDF — open document ↗</span></a>';
 return '<a href="'+esc(url(item))+'" target="_blank" rel="noopener noreferrer">'+img(item,"Evidence for "+d.title)+'<span class="file-chip">View image '+(i+1)+' in full size ↗</span></a>';
 }).join("");
 const links=[...list(d.supportingLinks)];
 if(d.verification&&!links.some(x=>x.url===d.verification))links.push({label:"Official result / source",url:d.verification});
 if(d.documentUrl&&!links.some(x=>x.url===d.documentUrl))links.push({label:"Certificate / Document",url:d.documentUrl});
 const modal=document.querySelector("#award-modal");
 document.querySelector("#modal-body").innerHTML=small(d.institution||d.category||"Academic recognition")+'<h2 id="modal-title">'+esc(d.title)+'</h2><div class="modal-lead prose">'+esc(d.summary||"")+'</div><div class="small-label">'+esc(d.year||"")+' / '+esc(d.result||d.category||"")+'</div><div class="modal-gallery">'+gallery+'</div><div class="modal-details">'+esc(d.details||"")+'</div>'+(d.evidenceStatus?'<div class="modal-details rule-top" style="margin-top:30px;font-size:12px;color:var(--soft)">'+esc(d.evidenceStatus)+'</div>':"")+'<div class="modal-source">'+links.map(x=>href(x.label,x.url,"btn outline")).join("")+'</div>';
 modal.hidden=false;document.body.style.overflow="hidden";document.querySelector("#close-modal").focus();
}
function closeModal(){const modal=document.querySelector("#award-modal");if(!modal)return;modal.hidden=true;document.body.style.overflow="";lastFocus?.focus()}
document.addEventListener("click",e=>{
 const menu=e.target.closest("#menu-toggle");
 if(menu){const m=document.querySelector("#mob-menu");const open=!m.classList.contains("open");m.classList.toggle("open",open);menu.setAttribute("aria-expanded",String(open));menu.textContent=open?"×":"☰";return}
 if(e.target.closest(".mob-menu a")){document.querySelector("#mob-menu")?.classList.remove("open");const b=document.querySelector("#menu-toggle");if(b){b.setAttribute("aria-expanded","false");b.textContent="☰"}}
 const f=e.target.closest("[data-filter]");if(f){activeFilter=f.dataset.filter;refreshAwards();return}
 const item=e.target.closest("[data-award]");if(item){detail(awards[Number(item.dataset.award)]);return}
 if(e.target.id==="award-modal"||e.target.closest("#close-modal"))closeModal();
});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();if(e.key==="Tab"&&!document.querySelector("#award-modal")?.hidden){const modal=document.querySelector("#award-modal");const focusable=[...modal.querySelectorAll('a[href],button:not([disabled])')];const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
(async()=>{
 try{
 const response=await fetch("./content/site.json",{cache:"no-store"});if(!response.ok)throw new Error("HTTP "+response.status);
 CONTENT=await response.json();layout(CONTENT);
 }catch(error){
 console.error(error);root.innerHTML='<section style="padding:160px 25px;font:20px system-ui"><h1>Portfolio temporarily unavailable</h1><p>Please refresh, or visit the <a href="https://github.com/nafis-tamim">GitHub profile</a>.</p></section>';
 }
})();
