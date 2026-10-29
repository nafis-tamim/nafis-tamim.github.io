/* Portfolio content rendering and interactions. */
(()=>{"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const items=x=>Array.isArray(x)?x:[];
const txt=x=>x==null?"":String(x);
const esc=x=>txt(x).replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[k]));
const uri=x=>{const v=txt(x).trim();if(!v)return"#";if(v[0]==="#"&&/^#[\w-]+$/.test(v))return v;if(/^\/(?!\/)/.test(v))return v;try{const a=new URL(v,location.href);return ["https:","http:","mailto:"].includes(a.protocol)?a.href:"#"}catch{return"#"}};
const image=(src,alt="")=>'<img src="'+esc(uri(src))+'" alt="'+esc(alt)+'" loading="lazy" decoding="async">';
const evidenceLink=(label,link)=>uri(link)==="#"?"":'<a class="nt-link" href="'+esc(uri(link))+'" target="_blank" rel="noopener noreferrer">'+esc(label||"Open source")+' <span aria-hidden="true">↗</span></a>';
const put=(selector,v,base=document)=>{const e=$(selector,base);if(e)e.textContent=txt(v);return e};
const setImg=(selector,src,alt,base=document)=>{const e=$(selector,base);if(e&&src){e.src=uri(src);e.alt=txt(alt||"Photograph");e.removeAttribute("srcset");e.removeAttribute("width");e.removeAttribute("height")}return e};
const setLink=(selector,url,label,base=document)=>{const a=$(selector,base);if(a){a.href=uri(url);if(label!==undefined){const span=$("span",a);if(span)span.textContent=label;else a.textContent=label}if(uri(url).startsWith("http")){a.target="_blank";a.rel="noopener noreferrer"}}};
const get=(x,k,defaultValue)=>x&&x[k]!=null?x[k]:defaultValue;
const anchored={
 hero:"hero",top:"hero",about:"about",achievements:"achievements",awards:"achievements",principles:"principles",
 academics:"academics",journey:"academics",projects:"projects",research:"research",
 creative:"creative",design:"creative",interests:"interests",learning:"learning",
 focus:"focus",faq:"faq",journal:"journal",contact:"contact"
};
const normalizeNav=n=>{
 let dest=txt(n.href||n.target||("#"+n.id));if(dest[0]==="#"){const id=dest.slice(1);dest="#"+(anchored[id]||id)}
 return{label:txt(n.label||n.id),href:uri(dest),openNewTab:!!n.openNewTab}
};
const socialLinks=d=>items(d.identity?.socials).filter(x=>x.url);
function navigation(d){
 const ns=items(d.navigation).filter(x=>x.visible!==false).map(normalizeNav);
 const nav=ns.map(n=>'<a class="link" href="'+esc(n.href)+'"'+(n.openNewTab?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(n.label)+'</a>').join("");
 const main=$(".hdr-nav");if(main)main.innerHTML=nav;
 const menu=$(".menu nav");if(menu)menu.innerHTML=ns.map(n=>'<a href="'+esc(n.href)+'"'+(n.openNewTab?' target="_blank" rel="noopener noreferrer"':'')+'>'+esc(n.label)+'</a>').join("")+'<a href="#contact">Contact</a>';
 const brand=$(".hdr-brand span:last-child");if(brand)brand.textContent=d.identity?.name||"Nafis Tamim";
 const brandAnchor=$(".hdr-brand");if(brandAnchor){brandAnchor.href="#hero";brandAnchor.setAttribute("aria-label","Back to "+(d.identity?.name||"Nafis Tamim")+" homepage")}
 put(".hdr-tag",d.identity?.descriptor||"Student · Research · Design");
 put(".hdr-login span","Research");
 setLink(".hdr-login","#research");
 put(".hdr-cta span","Contact");
 setLink(".hdr-cta","#contact");
 put(".menu-foot a:first-child","View GitHub");setLink(".menu-foot a:first-child",d.contact?.githubUrl||"https://github.com/nafis-tamim");
 put(".menu-foot a:nth-child(2)",d.identity?.email||"");setLink(".menu-foot a:nth-child(2)","mailto:"+(d.identity?.email||""));
}
function hero(d){
 const name=d.identity?.name||"Nafis Tamim";
 const giant=$(".hero h1");if(giant){giant.textContent=name;giant.style.setProperty("--len",String(name.length))}
 put(".hero-intro .lead",d.hero?.intro||"Student working at the intersection of research, mathematics, engineering and design.");
 put(".hero-intro .btn span",d.hero?.primaryLabel||"Explore projects");
 setLink(".hero-intro .btn","#"+(anchored[d.hero?.primaryTarget]||"projects"));
 const second=$(".hero-intro .actions .link");if(second){second.textContent=d.hero?.secondaryLabel||"Academic achievements";second.href="#"+(anchored[d.hero?.secondaryTarget]||"achievements")}
 put(".hero-aim p:first-child","My direction");
 put(".hero-aim p:last-child",d.hero?.firstLine+" "+d.hero?.secondLine||"Exploring ideas with care.");
 const p=d.identity?.portrait;
 setImg(".hero-window img",p,d.identity?.portraitAlt||"Portrait of Nafis Tamim");
 put(".hero-statement",d.hero?.intro||"Curiosity, evidence, design, and the work of asking better questions.");
 // Original hero uses the SAME user portrait through its stage / strip pinning animation.
}
function about(d){
 const a=d.about||{};
 put(".about-title",a.heading||"Curiosity across disciplines.");
 put(".about-copy .lead",a.body||a.lead||"An academic and creative portfolio built around learning and doing.");
 const l=$(".about-copy .link");if(l){l.textContent="Explore my research";l.href="#research"}
 setImg(".about-photo img",d.identity?.portrait,d.identity?.portraitAlt||"Nafis Tamim");
 const facts=$$(".facts .fact");
 const stat=[
  [items(d.achievements?.cards).length,"documented academic milestones"],
  [items(d.projects?.items).length,"selected project case studies"],
  [items(d.research?.items).length,"research archive entry"],
  [items(d.creative?.items).length,"creative work collections"]
 ];
 facts.forEach((e,i)=>{put(".fact-num",stat[i][0],e);put(".fact-label",stat[i][1],e)});
}
let awardData=[];
const categoryLogo=g=>{
 const title=txt(g?.title||"Academic recognition");
 const fallback=esc(title.trim().slice(0,1).toUpperCase()||"✦");
 const src=txt(g?.logo||"").trim();
 return '<span class="nt-category-mark"><span class="nt-category-placeholder" aria-hidden="true">'+fallback+'</span>'+
   (src?image(src,txt(g?.logoAlt||title+" category logo")):"")+'</span>';
};
function achievements(d){
 const a=d.achievements||{}; awardData=items(a.cards);
 put(".services .svc-head h2",a.heading||"Awards");
 put(".services .svc-head p",a.intro||"Certificates, award evidence and official results — kept in context.");
 const section=$("#achievements"),list=$(".svc-list",section);if(!list)return;
 const groups=items(a.groups);
 // The live category strip uses the exact group logos, titles and order edited in Portfolio Studio.
 $(".nt-award-groups",section)?.remove();
 const activeGroups=groups.filter(g=>g.visible!==false);
 if(activeGroups.length){
  const strip=document.createElement("div");
  strip.className="nt-award-groups";
  strip.setAttribute("aria-label","Award categories");
  strip.innerHTML=activeGroups.map(g=>
   '<div class="nt-award-category" data-group="'+esc(g.id||"")+'" title="'+esc(g.description||g.title||"")+'">'+
   categoryLogo(g)+'<div class="nt-category-copy"><span class="nt-category-eyebrow">'+esc(g.eyebrow||"RECOGNITION")+'</span>'+
   '<h3 class="nt-category-title">'+esc(g.title||"Recognition")+'</h3>'+
   (g.subtitle?'<p class="nt-category-subtitle">'+esc(g.subtitle)+'</p>':"")+'</div></div>'
  ).join("");
  const body=$(".svc-body",section);if(body)section.insertBefore(strip,body);
 }
 list.innerHTML=awardData.map((w,i)=>{
  const g=groups.find(x=>x.id===w.groupId),group=g?.title||w.category||"Recognition";
  const category='<div class="nt-award-group-label">'+categoryLogo(g||{title:group})+
   '<span>'+esc(group)+'</span></div>';
  return '<li class="svc" data-award-item="'+i+'"><figure class="svc-media frame">'+image(w.image||"/assets/aw-notes.svg",w.imageAlt||"Illustration representing "+w.title)+'</figure>'+
  category+'<h3>'+esc(w.title)+'</h3><p class="svc-text">'+esc(w.summary||"")+'</p>'+
  '<ul class="svc-points"><li>'+esc(w.year||"")+'</li><li>'+esc(group)+'</li></ul>'+
  '<div class="nt-award-action"><button class="btn nt-view" data-award="'+i+'" type="button"><span>'+esc(d.ui?.achievementDetails||"View more")+'</span><span aria-hidden="true">↗</span></button>'+
  (()=>{
   // Use only record-specific evidence URLs, never substitute an unrelated official website.
   const links=items(w.supportingLinks).filter(x=>uri(x.url)!=="#");
   const direct=links[0]?.url||w.verification||w.documentUrl||
     items(w.gallery).map(x=>typeof x==="string"?x:x?.url).find(x=>uri(x)!=="#")||"";
   const label=links[0]?.label||(w.verification?"Official source":w.documentUrl?"Certificate PDF":"Certificate / evidence");
   return uri(direct)==="#"?"":evidenceLink(label,direct).replace('class="nt-link"','class="nt-link nt-award-direct"');
  })()+'</div></li>';
 }).join("");
 // Keep the text placeholder visible if an uploaded/external category logo cannot be loaded.
 $$(".nt-category-mark img",section).forEach(img=>{
  img.addEventListener("error",()=>{img.hidden=true},{once:true});
 });
}
function principles(d){
 const a=d.about||{},arr=items(a.principles); put(".pr-head h2",d.portfolioContent?.labels?.principlesTitle||"What I work by");put(".pr-head p",a.lead||"Principles behind the projects and study.");
 const list=$(".pr-list");
 if(list&&arr.length)list.innerHTML=arr.map(p=>'<li class="principle"><h3>'+esc(p.title)+'</h3><p>'+esc(p.body)+'</p></li>').join("");
}
function academic(d){
 const a=d.academics||{},arr=items(a.items);
 put(".pc-head h2",a.heading||"Academic journey");
 put(".pc-head p",a.intro||"Milestones, interests and the process of learning.");
 setLink(".pc-head .btn","#achievements","Explore achievements");
 const steps=$(".steps");if(steps&&arr.length)steps.innerHTML=arr.map(v=>'<li class="step"><p class="step-when">'+esc(v.year||v.type||"")+'</p><h3>'+esc(v.title)+'</h3><p>'+esc((v.organization?v.organization+". ":"")+(v.description||""))+'</p></li>').join("");
}

function certifications(d){
 const c=d.certifications||{},records=items(c.items).filter(x=>x.visible!==false);
 const root=$("#certifications");if(!root)return;
 put(".nt-cert-eyebrow",c.eyebrow||"COURSES / CERTIFICATES",root);
 put(".nt-cert-intro h2",c.heading||"Courses & certificates",root);
 put(".nt-cert-intro > p:last-child",c.intro||"Supporting evidence of completed short courses.",root);
 const list=$(".nt-cert-list",root);if(!list)return;
 list.innerHTML=records.map(x=>
  '<article class="nt-cert" data-cert-id="'+esc(x.id||"")+'">'+
  '<div class="nt-cert-meta"><span class="nt-cert-issuer">'+esc(x.issuer||"Course provider")+'</span><span class="nt-cert-year">'+esc(x.year||"")+'</span></div>'+
  '<h3>'+esc(x.title||"Course record")+'</h3>'+
  '<p class="nt-cert-desc">'+esc(x.description||"")+'</p>'+
  '<div class="nt-cert-footer"><span class="nt-cert-kind">'+esc(x.kind||"Course completion")+
    (x.date?" · "+esc(x.date):"")+'</span>'+
  '<div class="nt-cert-links">'+
   (x.documentUrl?'<a class="nt-cert-link" href="'+esc(uri(x.documentUrl))+'" target="_blank" rel="noopener noreferrer">View original PDF ↗</a>':'<span class="nt-cert-pending">PDF not published</span>')+
   (x.verification?'<a class="nt-cert-link" href="'+esc(uri(x.verification))+'" target="_blank" rel="noopener noreferrer">Verify source ↗</a>':"")+
  '</div></div></article>'
 ).join("");
}

function projects(d){
 const p=d.projects||{},arr=items(p.items);
 put(".tm-head h2",p.heading||"Selected projects");
 put(".tm-head p",p.intro||"Design, software and research-related work.");
 const team=$(".tm-grid");if(team)team.innerHTML=arr.map((x,i)=>
 '<li class="person" data-shutter><figure class="person-photo frame">'+image(x.image||"/assets/pr-web.svg",x.imageAlt||x.title)+'</figure>'+
 '<h3 class="person-name">'+esc(x.title)+'</h3><p class="person-role soft">'+esc(x.subtitle||x.category||"Project")+'</p>'+
 '<div class="nt-project-links">'+evidenceLink("Open project",x.url||x.links?.[0]?.url)+'</div></li>').join("");
 put(".tm-foot p","Independent projects and evidence-based case studies, updated as the work develops.");
 setLink(".tm-foot .link","#research","Explore research");
}
function research(d){
 const r=d.research||{},entries=items(r.items),first=entries[0];
 put(".vc-title",r.heading||"Research");
 put(".vc-feature blockquote p",first?.abstract||r.intro||"Independent inquiry and evolving methods.");
 put(".vc-feature figcaption strong",first?.title||"Nafis Tamim");
 put(".vc-feature figcaption span",first?.status||"Research in progress");
 const cards=[];
 for(const x of entries)cards.push({quote:x.question||x.abstract||x.title,by:x.title,kind:x.field||x.status});
 for(const x of items(d.achievements?.cards).slice(0,4))cards.push({quote:x.summary,by:x.institution||x.title,kind:x.category||"Academic recognition"});
 for(const x of items(d.projects?.items).slice(0,4))cards.push({quote:x.summary,by:x.title,kind:x.category||"Project"});
 const track=$(".vc-track");if(track)track.innerHTML=cards.map(x=>'<li class="vc-card"><p>'+esc(x.quote||"")+'</p><p class="vc-by"><strong>'+esc(x.by||"")+'</strong><span>'+esc(x.kind||"")+'</span></p></li>').join("");
}
function gallery(d){
 put(".gl-head h2",d.creative?.heading||d.portfolioContent?.labels?.creativeTitle||"Visual work");
 put(".gl-head p",d.creative?.intro||"Design concepts, selected artwork and projects.");
 const sources=[...items(d.creative?.items),...items(d.projects?.items),...items(d.achievements?.cards)].filter(x=>x.image);
 $$(".collage .gl img").forEach((node,i)=>{
  const item=sources[i%sources.length];
  if(item){node.src=uri(item.image);node.alt=txt(item.title||item.imageAlt||"Portfolio work");node.removeAttribute("width");node.removeAttribute("height")}
 });
}
function interests(d){
 put(".sc-head h2",d.portfolioContent?.labels?.interestsTitle||"Fields of inquiry");
 put(".sc-head p",d.portfolioContent?.labels?.interestsIntro||"Where my academic interests meet creative practice.");
 const records=items(d.portfolioContent?.interests).length?d.portfolioContent.interests.map(v=>[v.title,v.note]):[
  ["Mathematics","Competition work, problem solving and mathematical writing"],
  ["Engineering","Structural systems, design questions and theoretical exploration"],
  ["Research","Hypotheses, frameworks, methods and documentation"],
  ["Technology","Computing, prototypes and digital tools"],
  ["Design","Branding, visual communication and thoughtful layouts"],
  ["Leadership","Student outreach, collaboration and communication"]
 ];
 const el=$(".sc-list");if(el)el.innerHTML=records.map(v=>'<li class="sector" data-drift><h3 class="sector-name">'+esc(v[0])+'</h3><p class="sector-note">'+esc(v[1])+'</p></li>').join("");
}
function learning(d){
 put(".cl-head h2",d.portfolioContent?.labels?.learningTitle||"Learning, documented");
 put(".cl-head p",d.portfolioContent?.labels?.learningIntro||"An open-ended cycle of investigation, making and reflection.");
 const modes=items(d.portfolioContent?.learning).length?d.portfolioContent.learning.map(v=>[v.title,...items(v.events).map(e=>[e.number,e.text])]):[
  ["Questions",["01","Formulate the problem"],["02","Review existing work"]],
  ["Models",["01","Explore possible methods"],["02","Sketch initial frameworks"]],
  ["Practice",["01","Build and test ideas"],["02","Refine through feedback"]],
  ["Evidence",["01","Document results and limits"],["02","Present with supporting sources"]]
 ];
 const list=$(".months");if(list)list.innerHTML=modes.map(v=>
 '<div class="month"><span class="month-bar"></span><h3 class="month-name">'+esc(v[0])+'</h3><ul class="month-dates">'+v.slice(1).map(row=>'<li><strong>'+esc(row[0])+'</strong><span>'+esc(row[1])+'</span></li>').join("")+'</ul></div>').join("");
}
function focus(d){
 put(".fe-head h2",d.portfolioContent?.labels?.focusTitle||"Areas of focus");
 const switches=$$(".fe-toggle [data-period]");switches.forEach((b,i)=>{b.textContent=i?(d.portfolioContent?.labels?.switchB||"Methods"):(d.portfolioContent?.labels?.switchA||"Disciplines");b.setAttribute("aria-pressed",String(i===0))});
 const focusItems=items(d.portfolioContent?.focus).length?d.portfolioContent.focus:[
 {title:"Academic inquiry",for:"Learning with rigor",features:["Mathematics","Competition experience","Critical problem solving","Scientific writing"]},
 {title:"Research practice",for:"Research with evidence",features:["Framework development","Source analysis","Clear documentation","Open questions"]},
 {title:"Creative work",for:"Making with intent",features:["Visual identity","Product concepts","Graphic systems","Digital design"]}
 ];
 const plans=$(".plans");if(plans)plans.innerHTML=focusItems.map((f,i)=>
 '<li class="plan'+(i===1?' plan-main':'')+'" data-rise><div class="plan-top"><h3 class="plan-name">'+esc(f.title)+'</h3>'+(i===1?'<span class="plan-tag">Active practice</span>':'')+'</div>'+
 '<p class="plan-for soft">'+esc(f.for)+'</p><p class="plan-price"><span class="plan-num" data-monthly="0'+(i+1)+'" data-yearly="'+String.fromCharCode(65+i)+'">0'+(i+1)+'</span><span class="plan-per" data-monthly="field" data-yearly="method">field</span></p>'+
 '<ul class="plan-list">'+f.features.map(t=>'<li>'+esc(t)+'</li>').join("")+'</ul><a class="btn '+(i===1?'':'btn-line')+'" href="'+["#academics","#research","#creative"][i]+'"><span>Explore this area</span></a></li>').join("");
}
function faqs(d){
 put(".fq-head h2",d.portfolioContent?.labels?.faqTitle||"Questions & context");
 const intro=$(".fq-head p");if(intro)intro.innerHTML='Looking for more context? <a class="link" href="#contact">Contact me directly</a>';
 const fa=items(d.portfolioContent?.faq).length?d.portfolioContent.faq.map(x=>[x.title,x.answer]):[
 ["What is this website?","A student portfolio documenting education, academic recognition, research interests, projects and visual work."],
 ["Are the results independently verified?","Each achievement includes its available official sources, certificates or contextual status. A report or award is described according to its evidence."],
 ["Can I view an achievement certificate?","Select View more under an achievement. When a certificate image, PDF or result link has been uploaded it appears in that panel."],
 ["Is every research idea a published paper?","No. Research entries distinguish exploratory manuscripts, editorial acceptance and confirmed publication. Any missing publication or DOI confirmation is clearly stated."],
 ["Can I get in touch about collaboration?","Yes. The contact section links to email, GitHub and professional profiles."]
 ];
 const faqlist=$(".fq-list");if(faqlist)faqlist.innerHTML=fa.map(v=>'<details class="fq"><summary><span>'+esc(v[0])+'</span><i class="fq-icon" aria-hidden="true"></i></summary><div class="fq-a"><p>'+esc(v[1])+'</p></div></details>').join("");
}
function journal(d){
 put(".jr-head h2",d.portfolioContent?.labels?.journalTitle||"Research");
 setLink(".jr-head .link","https://www.researchgate.net/profile/Nafis-Tamim-2","ResearchGate profile");
 // Research contains research records only. Awards live in their own section.
 const entries=items(d.research?.items).map(x=>({name:x.title,label:x.field||"Research",year:x.year,image:x.image,url:x.documentUrl||x.links?.[0]?.url||"#research"}));
 const list=$(".jr-list");
 if(list)list.innerHTML=entries.map(x=>'<li class="post"><a class="post-link" href="'+esc(uri(x.url))+'"'+(uri(x.url).startsWith("http")?' target="_blank" rel="noopener noreferrer"':'')+'><p class="post-meta soft">'+esc(x.year||"")+'<br>'+esc(x.label||"")+'</p><h3 class="post-title">'+esc(x.name)+'</h3><figure class="post-photo frame" data-wipe>'+image(x.image||"/assets/pr-web.svg",x.name)+'</figure></a></li>').join("");
}
function contact(d){
 const c=d.contact||{},email=d.identity?.email||"";
 put(".ct-title",c.heading||"Have something interesting in mind?");
 const details=$(".ct-details dl");
 if(details)details.innerHTML=[
 ["Based in",d.identity?.location||"Dhaka, Bangladesh"],
 ["Education",d.identity?.institution||"Student"],
 ["Write",email?'<a class="link" href="mailto:'+esc(email)+'">'+esc(email)+'</a>':""],
 ["Connect",evidenceLink("GitHub",c.githubUrl||"https://github.com/nafis-tamim")]
 ].map(v=>'<div><dt>'+esc(v[0])+'</dt><dd>'+v[1]+'</dd></div>').join("");
 const form=$(".ct-form");if(form){
 form.removeAttribute("data-sent");
 const fields=$$(".field",form);
 if(fields[2]){put("span","Subject",fields[2]);const input=$("input",fields[2]);if(input){input.name="subject";input.removeAttribute("autocomplete")}}
 if(fields[3])fields[3].style.display="none";
 put(".field-wide span",d.portfolioContent?.labels?.messageLabel||"Your message",form);
 put(".ct-send .btn span",d.portfolioContent?.labels?.composeLabel||"Compose email",form);
 put(".ct-note","Opens your email application; no message is sent automatically.",form);
 form.addEventListener("submit",e=>{
  e.preventDefault();e.stopImmediatePropagation();
  const fd=new FormData(form);const subject=txt(fd.get("subject")||"Portfolio inquiry");
  const body=txt(fd.get("message")||"")+"\n\nFrom: "+txt(fd.get("name")||"")+"\nEmail: "+txt(fd.get("email")||"");
  if(email)window.location.href="mailto:"+encodeURIComponent(email)+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);
 },true);
 }
}
function footer(d){
 const c=d.contact||{};
 put(".ftr-lead p",c.footerLine||"A living archive of curiosity and work.");
 put(".ftr-lead .btn span","Get in touch");
 const navs=$$(".ftr-grid nav.ftr-col");
 if(navs[0])navs[0].innerHTML='<p class="ftr-h">Portfolio</p>'+
 [['About',"#about"],['Awards',"#achievements"],['Research',"#research"],['Projects',"#projects"]].map(x=>'<a class="link" href="'+x[1]+'">'+x[0]+'</a>').join("");
 if(navs[1])navs[1].innerHTML='<p class="ftr-h">Explore</p>'+
 [['Academic path',"#academics"],['Certificates',"#certifications"],['Research',"#research"],['Contact',"#contact"]].map(x=>'<a class="link" href="'+x[1]+'">'+x[0]+'</a>').join("");
 const follow=$(".ftr-grid .ftr-col:last-child");
 if(follow)follow.innerHTML='<p class="ftr-h">Follow</p>'+socialLinks(d).map(x=>evidenceLink(x.label,x.url).replace('class="nt-link"','class="link"')).join("")+'<a class="ibtn ftr-top" href="#hero" aria-label="Back to the top">↑</a>';
 const name=d.identity?.name||"Nafis Tamim";put(".ftr-name",name.split(" ")[0]);const word=$(".ftr-word");if(word)word.style.setProperty("--len",String(name.split(" ")[0].length));
 const base=$(".ftr-base");if(base)base.innerHTML='<span>© '+new Date().getFullYear()+' '+esc(name)+'</span><span>'+esc(c.credit||"Student portfolio")+'</span><a class="link" href="#hero">Back to top ↑</a>';
}
function custom(d){
 const sections=items(d.customSections).filter(x=>x.visible!==false),main=$("main"),contactEl=$(".contact");
 for(const c of sections){
  const id=txt(c.id||c.title).replace(/[^a-z0-9_-]/gi,"");
  const holder=document.createElement("section");holder.id=id;holder.className="sheet nt-custom";
  holder.dataset.kind="custom";holder.dataset.tone="light";
  holder.innerHTML='<div class="grid svc-head"><h2 data-split>'+esc(c.heading||c.title||"New section")+'</h2><p>'+esc(c.intro||c.description||"")+'</p></div>'+
  '<div class="nt-custom-detail" data-reveal><p>'+esc(c.body||c.text||"")+'</p>'+
  (c.image?'<figure class="frame">'+image(c.image,c.heading||c.title)+'</figure>':"")+
  items(c.links||c.sectionLinks).map(x=>evidenceLink(x.label,x.url)).join("")+'</div>';
  if(main&&contactEl)main.insertBefore(holder,contactEl);
 }
}
function showEvidence(i){
 const a=awardData[i];if(!a)return;
 const m=$("#nt-modal"),body=$("#nt-modal-body");if(!m||!body)return;
 const links=[...items(a.supportingLinks)];
 if(a.verification&&!links.some(x=>x.url===a.verification))links.push({label:"Official source",url:a.verification});
 if(a.documentUrl&&!links.some(x=>x.url===a.documentUrl))links.push({label:"Certificate / PDF",url:a.documentUrl});
 const gallery=[a.image,...items(a.gallery).map(x=>typeof x==="string"?x:x?.url),a.documentUrl].filter(Boolean);
 const unique=[...new Set(gallery)];
 const cards=unique.map((v,k)=>{
  const pdf=/\.pdf(?:[?#]|$)/i.test(v);
  return '<div class="nt-media-card">'+(pdf?'<div class="nt-pdf" aria-hidden="true">PDF</div>':image(v,"Evidence image "+(k+1)+" for "+a.title))+
    evidenceLink(pdf?"Open PDF document":"Open image",v)+'</div>';
 }).join("");
 body.innerHTML='<p class="nt-overline">'+esc(a.institution||a.category||"Academic achievement")+'</p><h2 id="nt-modal-title">'+esc(a.title)+'</h2>'+
 '<p class="nt-summary">'+esc(a.summary||"")+'</p><div class="nt-gallery">'+cards+'</div>'+
 (a.details?'<p class="nt-detail">'+esc(a.details)+'</p>':"")+
 (a.evidenceStatus?'<p class="nt-status">'+esc(a.evidenceStatus)+'</p>':"")+
 '<div class="nt-links">'+links.map(x=>evidenceLink(x.label,x.url)).join("")+'</div>';
 m.hidden=false;document.body.classList.add("nt-modal-open");$("#nt-modal-close")?.focus();
}
function activateModal(){
 const backdrop=document.createElement("div");backdrop.id="nt-modal";backdrop.className="nt-modal-backdrop";backdrop.hidden=true;
 backdrop.innerHTML='<div class="nt-modal" role="dialog" aria-modal="true" aria-labelledby="nt-modal-title" tabindex="-1"><button class="nt-close" id="nt-modal-close" type="button" aria-label="Close details">×</button><div id="nt-modal-body"></div></div>';
 document.body.appendChild(backdrop);
 let opener=null;
 document.addEventListener("click",e=>{
  const b=e.target.closest?.("[data-award]");if(b){opener=b;showEvidence(Number(b.dataset.award));return}
  if(e.target===backdrop||e.target.closest?.("#nt-modal-close"))close();
 });
 const close=()=>{backdrop.hidden=true;document.body.classList.remove("nt-modal-open");opener?.focus()};
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!backdrop.hidden)close();
 if(e.key==="Tab"&&!backdrop.hidden){const controls=$$("a[href],button",backdrop).filter(x=>!x.disabled);
  if(!controls.length)return;const first=controls[0],last=controls[controls.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 }});
}
function finish(d){
 // Set admin-uploaded favicon, SEO content, title and brand without altering original motion classes.
 const icon=$('link[rel="icon"]');if(icon&&d.seo?.favicon)icon.href=uri(d.seo.favicon);
 if(d.seo?.title)document.title=d.seo.title;
 const meta=$('meta[name="description"]');if(meta&&d.seo?.description)meta.content=d.seo.description;
 const color=d.appearance?.accent;if(/^#[0-9a-fA-F]{6}$/.test(color||""))document.documentElement.style.setProperty("--accent",color);
 document.body.classList.add("nt-loaded");
 document.body.style.removeProperty("visibility");
 const anim=document.createElement("script");anim.src="/portfolio-effects.js?v=1";anim.defer=true;
 anim.onerror=()=>{document.documentElement.classList.remove("motion");console.warn("Animation library could not initialize")};
 document.body.appendChild(anim);
}
function hydrate(d){
 try{
  navigation(d);hero(d);about(d);achievements(d);principles(d);academic(d);certifications(d);projects(d);
  interests(d);faqs(d);journal(d);contact(d);custom(d);footer(d);activateModal();
  for(const [id,visible] of Object.entries(d.portfolioContent?.sections||{})){if(visible===false){const sec=document.getElementById(id);if(sec&&sec.tagName==="SECTION")sec.remove()}}
 }catch(err){console.error("Portfolio rendering error",err)}
 finish(d);
}
fetch("/content/site.json?v=8",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("Portfolio data unavailable");return r.json()}).then(hydrate).catch(err=>{
 console.warn(err);
 const main=document.querySelector("main");if(main){main.innerHTML='<section class="sheet" style="min-height:75vh;padding-top:160px"><div class="grid"><div style="grid-column:1/-1"><p style="color:#3366ff;font-size:12px">NAFIS TAMIM / STUDENT PORTFOLIO</p><h1 style="font:300 clamp(48px,8vw,115px)/.95 var(--f-display);letter-spacing:-.06em">Curiosity in motion.</h1><p style="max-width:45ch;margin:30px 0">The portfolio content could not load. You can still view my public projects and academic links.</p><a class="btn" href="https://github.com/nafis-tamim">Explore GitHub ↗</a></div></div></section>';}
 document.body.classList.add("nt-loaded");document.body.style.removeProperty("visibility");
});
})();