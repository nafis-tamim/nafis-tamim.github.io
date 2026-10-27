/* NAFIS TAMIM — PORTFOLIO STUDIO V6
 GitHub-backed, browser-only admin. Tokens are never stored or committed.
*/
"use strict";
const GITHUB="nafis-tamim/nafis-tamim.github.io";
const API="https://api.github.com/repos/"+GITHUB;
const CONTENT="content/site.json";
const $=s=>document.querySelector(s);
const make=(tag,className="",string)=>{const x=document.createElement(tag);if(className)x.className=className;if(string!==undefined)x.textContent=String(string);return x};
const a=x=>Array.isArray(x)?x:[];
const s=x=>x===undefined||x===null?"":String(x);
const uuid=()=>globalThis.crypto?.randomUUID?.()||("entry-"+Date.now()+"-"+Math.random().toString(16).slice(2,10));
const clone=x=>JSON.parse(JSON.stringify(x));
const labelize=x=>s(x).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/[_-]/g," ").replace(/^./,ch=>ch.toUpperCase());
const isMedia=k=>/^(image|portrait|logo|favicon|ogImage|pdf|documentUrl|banner|cover|thumbnail|photo)$/i.test(k);
const isLong=k=>/(description|body|summary|detail|abstract|intro|challenge|process|outcome|method|question|quote|lead|heading|evidenceStatus|editorial)/i.test(k);
const freshId=prefix=>prefix+"-"+uuid().replace(/[^a-z0-9-]/gi,"").slice(0,14);
const modules=[
 ["start","Dashboard","See your website at a glance"],
 ["home","Home & photo","Change your picture, biography and landing page"],
 ["awards","Achievements","Add awards, certificate PDFs, photos and links"],
 ["groups","Achievement categories","Government, international and custom logos"],
 ["projects","Projects","All categories, images, work and PDF links"],
 ["research","Research","Paper covers, manuscripts and sources"],
 ["creative","Design gallery","Brand work, packaging, posters and graphics"],
 ["academics","Education & activities","Your academic journey"],
 ["certifications","Courses & certificates","Upload and edit original course evidence"],
 ["menu","Menus & sections","Add, move, hide or delete pages and custom links"],
 ["look","Favicon & appearance","Upload a tab icon, adjust colors and Google search"],
 ["labels","All website text","Edit headings, questions, labels and special sections"],
 ["files","Media library","Remove unused uploads after publishing"],
 ["advanced","Advanced (optional)","Only for changes not available in the simple forms"]
];
let token="",data=null,sha="",writeOK=false,dirty=false,mode="start",chosen={},busy=false;
let previewBlobUrls=[];
function dropPreviews(){previewBlobUrls.forEach(u=>URL.revokeObjectURL(u));previewBlobUrls=[]}
function errorMessage(e){
 const msg=s(e?.message||e);
 if(/rate limit|abuse detection/i.test(msg))return "GitHub API rate limit reached. Wait, then try again.";
 if(/Resource not accessible by personal access token|403|permission.*denied|Write access|requires.*write/i.test(msg))return "GitHub denied the upload (403). In GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens, select only nafis-tamim.github.io and grant Repository permissions → Contents: Read and write. Reconnect with the updated token. Never share your token. GitHub error: "+msg;
 if(/401|bad credentials/i.test(msg))return "GitHub rejected this token (401). Reconnect with a valid fine-grained token.";
 if(/failed to fetch|networkerror|network request failed/i.test(msg))return "Could not contact the GitHub API. Check your connection or browser extensions and retry.";
 if(/404|not found/i.test(msg))return "Repository/file not found for this token. Make sure Repository access includes nafis-tamim.github.io and you are signed into the right account.";
 if(/409|conflict/i.test(msg))return "GitHub detected a conflict. Reload the editor to get the newest repository version.";
 return msg;
}
async function request(method,endpoint,body){
 const url=endpoint.startsWith("https://")?endpoint:API+endpoint;
 const res=await fetch(url,{
  method,
  headers:{
   "Authorization":"Bearer "+token,
   "Accept":"application/vnd.github+json",
   "X-GitHub-Api-Version":"2022-11-28",
   ...(body?{"Content-Type":"application/json"}:{})
  },
  ...(body?{body:JSON.stringify(body)}:{})
 });
 const raw=await res.text();let result;
 try{result=JSON.parse(raw)}catch{result={message:raw}}
 if(!res.ok)throw new Error((result.message||"GitHub API error")+" ("+res.status+")");
 return result;
}
function encode(text){
 const u=new TextEncoder().encode(text);let str="";
 for(let k=0;k<u.length;k+=8192)str+=String.fromCharCode(...u.slice(k,k+8192));
 return btoa(str);
}
function decode(content){
 const raw=atob(s(content).replace(/\s/g,""));
 return new TextDecoder().decode(Uint8Array.from(raw,c=>c.charCodeAt(0)));
}
function notice(txt,kind="success"){
 const el=$("#notice");el.textContent=txt;el.className="notice is-visible"+(kind==="success"?"":" "+kind);
}
function dirtyNow(){
 dirty=true;const n=$("#draft-indicator");if(n){n.textContent="UNPUBLISHED CHANGES";n.className="draft-indicator dirty"}
}
function cleanNow(){
 dirty=false;const n=$("#draft-indicator");if(n){n.textContent="ALL CHANGES SAVED";n.className="draft-indicator"}
}
function button(txt,fn,cl="small-action"){
 const x=make("button",cl,txt);x.type="button";x.addEventListener("click",fn);return x;
}
function input(label,value,changed,{multiline=false,type="text",hint="",wide=false}={}){
 const wrapper=make("label","form-field"+(wide?" span2":""));
 const title=make("span","",labelize(label));wrapper.append(title);
 const el=multiline?make("textarea"):make("input");
 if(!multiline)el.type=type;
 el.value=value===undefined||value===null?"":s(value);
 if(multiline)el.rows=3;
 el.spellcheck=false;
 el.oninput=()=>changed(type==="number"?Number(el.value):el.value);
 wrapper.append(el);
 if(hint)wrapper.append(make("small","field-tip",hint));
 return {wrapper,el};
}
function caption(title,subtitle){
 const x=make("div","panel-header"),copy=make("div");
 copy.append(make("span","small-cap","EDITOR / "+mode.toUpperCase()),make("h2","",title),make("p","",subtitle||""));
 x.append(copy);return x;
}
function section(parent,title,desc){
 const el=make("section","simple-section");
 el.append(make("h3","",title));
 if(desc)el.append(make("p","field-tip",desc));
 parent.append(el);return el;
}
function editorFields(parent,obj,{omit=[],title="",desc=""}={}){
 if(title)parent.append(make("h3","",title));
 if(desc)parent.append(make("p","field-tip",desc));
 const grid=make("div","field-grid");parent.append(grid);
 for(const [key,v] of Object.entries(obj||{})){
  if(omit.includes(key))continue;
  if(key==="verified"||key==="certificateReviewed"||key==="emailReviewed")continue;
  if(Array.isArray(v)){
   if(["gallery"].includes(key)){const wrap=make("div","span2");grid.append(wrap);mediaGallery(wrap,obj,key);continue}
   if(["supportingLinks","links","sectionLinks","socials"].includes(key)){const wrap=make("div","span2");grid.append(wrap);linkEditor(wrap,obj,key);continue}
   if(["tags","ids","categories"].includes(key)){
    const item=input(labelize(key),v.join("\n"),t=>{obj[key]=t.split("\n").map(x=>x.trim()).filter(Boolean);dirtyNow()},{multiline:true,wide:true,hint:"One item per line."});
    grid.append(item.wrapper);continue;
   }
   if(v.length&&typeof v[0]==="object"||!v.length){
    const wrap=make("div","span2");grid.append(wrap);
    nestedEditor(wrap,obj,key);continue;
   }
   const item=input(key,v.join("\n"),t=>{obj[key]=t.split("\n").filter(Boolean);dirtyNow()},{multiline:true,wide:true});
   grid.append(item.wrapper);
   continue;
  }
  if(v&&typeof v==="object"){const wrap=make("div","span2");grid.append(wrap);const name=make("h3","",labelize(key));wrap.append(name);editorFields(wrap,v);continue}
  if(typeof v==="boolean"){
   const l=make("label","checkbox-field");const chk=make("input");chk.type="checkbox";chk.checked=v;
   chk.onchange=()=>{obj[key]=chk.checked;dirtyNow()};l.append(chk,make("span","",labelize(key)));grid.append(l);continue;
  }
  if(key==="groupId"){
   const field=make("label","form-field");field.append(make("span","","Award category"));
   const sel=make("select");for(const group of a(data.achievements?.groups)){const option=make("option","",group.title);option.value=group.id;sel.append(option)}
   if(!a(data.achievements?.groups).some(g=>g.id===v)){const option=make("option","",v||"Other");option.value=v;sel.append(option)}
   sel.value=v;sel.onchange=()=>{obj[key]=sel.value;dirtyNow()};field.append(sel);grid.append(field);continue;
  }
  if(typeof v==="string"&&/^#[0-9a-fA-F]{6}$/.test(v)){
   const field=input(key,v,t=>{obj[key]=t;dirtyNow()},{type:"color"});grid.append(field.wrapper);continue;
  }
  const media=isMedia(key);
  const item=input(key,v,t=>{obj[key]=t;dirtyNow()},{multiline:!media&&(isLong(key)||s(v).length>115),wide:media||isLong(key)||s(v).length>115,
   hint:key==="href"?"Use #achievements, #research or a complete https:// link.":key==="imageAlt"?"Describe the image for visitors using screen readers.":""});
  grid.append(item.wrapper);
  if(media)renderMediaControls(item.wrapper,obj,key);
 }
 return grid;
}
function renderMediaControls(container,obj,key){
 const tools=make("div","media-field-actions");
 const file=make("input");file.type="file";file.accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.ico,.pdf";file.style.display="none";
 const upload=button("↑ UPLOAD / REPLACE",()=>file.click());
 if(!writeOK)upload.disabled=true;
 tools.append(upload,file);
 if(obj[key]){
  tools.append(button("× REMOVE FROM WEBSITE",()=>{
   if(!confirm("Remove this image or file link from the website? You can separately delete an unused uploaded file from Media library after publishing."))return;
   obj[key]="";dirtyNow();render();
  },"remove"));
 }
 container.append(tools);
 file.onchange=async()=>{
  const f=file.files?.[0];if(!f)return;
  upload.disabled=true;
  try{
   const path=await uploadFile(f);obj[key]=path;dirtyNow();render();
   notice("File uploaded and linked in your draft. Click Publish to update the public website.");
  }catch(e){notice(errorMessage(e),"error")}finally{upload.disabled=false}
 };
 if(obj[key]&&/\.(png|jpe?g|webp|avif|gif|ico|svg)(?:[?#]|$)/i.test(obj[key])){
  const view=make("img","media-preview");view.src=obj[key];view.alt="Current image preview";view.onerror=()=>view.remove();
  container.append(view);
 }
}
function mediaGallery(container,obj,key){
 const wrap=make("div","inline-list media-gallery-editor");
 const head=make("div","inline-list-heading");
 head.append(make("h4","","Photos, certificates & PDF gallery"));
 const upload=button("↑ UPLOAD MULTIPLE",()=>picker.click(),"small-action");
 upload.disabled=!writeOK;head.append(upload);wrap.append(head);
 wrap.append(make("small","field-tip","Add as many images and PDFs as you need. Drag-free UP/DOWN ordering controls and Use as cover work without touching code. Gallery pictures are shown in a slideshow on the portfolio."));
 const entries=a(obj[key]);
 entries.forEach((path,index)=>{
  const row=make("div","inline-preview media-order-row");
  if(/\.(png|jpe?g|webp|avif|gif|svg)(?:[?#]|$)/i.test(path)){
   const img=make("img");img.src=path;img.alt="Image "+(index+1);row.append(img);
  }else row.append(make("span","pdf-thumb","PDF"));
  const meta=make("div","asset-name",String(index+1).padStart(2,"0")+" / "+path);
  row.append(meta);
  const btns=make("div","media-order-actions");
  const up=button("↑",()=>{if(index<1)return;[obj[key][index],obj[key][index-1]]=[obj[key][index-1],obj[key][index]];dirtyNow();render()},"small-action");
  up.disabled=index===0;up.title="Move earlier";
  const down=button("↓",()=>{if(index===entries.length-1)return;[obj[key][index],obj[key][index+1]]=[obj[key][index+1],obj[key][index]];dirtyNow();render()},"small-action");
  down.disabled=index===entries.length-1;down.title="Move later";
  btns.append(up,down);
  if(/\.(png|jpe?g|webp|avif|gif|svg)(?:[?#]|$)/i.test(path)){
   btns.append(button("COVER",()=>{
    const old=obj.image;
    obj.image=path;
    if(old&&old!==path&&!obj[key].includes(old))obj[key].unshift(old);
    obj[key]=obj[key].filter(x=>x!==path);
    dirtyNow();render();notice("Cover image updated. Publish changes to update the site.");
   },"small-action"));
  }
  const view=make("a","","OPEN ↗");view.href=path;view.target="_blank";view.rel="noopener noreferrer";btns.append(view);
  btns.append(button("REMOVE",()=>{obj[key].splice(index,1);dirtyNow();render()},"danger-action"));
  row.append(btns);wrap.append(row);
 });
 const picker=make("input");picker.type="file";picker.multiple=true;picker.accept=".jpg,.jpeg,.png,.webp,.avif,.gif,.ico,.pdf";picker.style.display="none";
 picker.onchange=async()=>{
  const files=Array.from(picker.files||[]);if(!files.length)return;
  upload.disabled=true;let count=0;
  for(const f of files){
   try{const path=await uploadFile(f);obj[key].push(path);count++;dirtyNow()}
   catch(e){notice("Uploaded "+count+" of "+files.length+". "+errorMessage(e),"error");break}
  }
  upload.disabled=false;render();
  if(count===files.length)notice(count+" gallery file(s) uploaded. Publish to show them on the live site.");
 };
 const tools=make("div","media-field-actions");
 tools.append(picker);
 tools.append(button("+ ADD IMAGE / PDF URL",()=>{
  const raw=prompt("Paste a public HTTPS image/PDF URL:");
  if(!raw)return;
  if(!/^https:\/\//i.test(raw)){notice("Enter a complete HTTPS URL.","warning");return}
  obj[key].push(raw.trim());dirtyNow();render();
 }));
 wrap.append(tools);container.append(wrap);
}
function linkEditor(container,obj,key){
 const wrap=make("div","inline-list"),head=make("div","inline-list-heading");
 head.append(make("h4","",labelize(key)+" / custom buttons"));
 head.append(button("+ ADD LINK",()=>{
  if(!Array.isArray(obj[key]))obj[key]=[];
  obj[key].push({label:"New link",url:"https://"});dirtyNow();render();
 }));
 wrap.append(head);
 wrap.append(make("small","field-tip","Set the button text and paste any public https:// link, PDF, image URL, or an internal #section anchor."));
 a(obj[key]).forEach((entry,index)=>{
  const row=make("div","link-item");
  const label=make("input");label.placeholder="Button text";label.value=entry.label||"";
  label.oninput=()=>{entry.label=label.value;dirtyNow()};
  const url=make("input");url.placeholder="https:// or #section";url.value=entry.url||"";
  url.oninput=()=>{entry.url=url.value;dirtyNow()};
  row.append(label,url,button("×",()=>{obj[key].splice(index,1);dirtyNow();render()},"danger-action"));
  wrap.append(row);
 });
 container.append(wrap);
}
function nestedEditor(parent,obj,key){
 if(!Array.isArray(obj[key]))return;
 const x=make("div","inline-list");
 const head=make("div","inline-list-heading");
 head.append(make("h4","",labelize(key)));
 head.append(button("＋ ADD",()=>{
  const src=a(obj[key])[0];
  let item;
  if(key==="principles")item={number:"",title:"New principle",body:""};
  else if(key==="items")item={id:freshId("item"),title:"New item",category:"Other",description:"",image:"/assets/pr-web.svg",imageAlt:"Illustration",gallery:[],links:[]};
  else item=src?Object.fromEntries(Object.keys(src).map(k=>[k,typeof src[k]==="boolean"?false:Array.isArray(src[k])?[]:""])):{id:freshId("item"),title:"New item"};
  obj[key].push(item);dirtyNow();render();
 }));
 x.append(head);
 a(obj[key]).forEach((record,i)=>{
  const details=make("details","group-panel");
  const summary=make("summary","",record.title||record.label||record.name||("Item "+(i+1)));
  details.append(summary);
  const actions=make("div","record-actions");
  actions.append(button("↑",()=>moveItem(obj[key],i,-1)));
  actions.append(button("↓",()=>moveItem(obj[key],i,1)));
  actions.append(button("REMOVE",()=>{if(!confirm("Remove this entry?"))return;obj[key].splice(i,1);dirtyNow();render()},"danger-action"));
  details.append(actions);
  editorFields(details,record);
  x.append(details);
 });
 parent.append(x);
}
function moveItem(list,index,delta){
 const next=index+delta;if(next<0||next>=list.length)return;
 [list[index],list[next]]=[list[next],list[index]];dirtyNow();render();
}
function schema(type){
 const base={id:freshId(type),image:"/assets/pr-web.svg",imageAlt:"Editorial placeholder image. Replace with a photograph.",gallery:[],links:[]};
 const map={
  awards:{id:freshId("achievement"),title:"New achievement",groupId:"international",institution:"",category:"Recognition",year:String(new Date().getFullYear()),summary:"",details:"",result:"",image:"/assets/aw-notes.svg",imageAlt:"Editorial cover illustration",gallery:[],supportingLinks:[],documentUrl:"",featured:false},
  projects:{...base,title:"New project",subtitle:"",category:"Other",year:String(new Date().getFullYear()),status:"In progress",summary:"",challenge:"",process:"",outcome:"",tools:"",pdf:"",url:"",verification:"",featured:false,tags:[]},
  research:{...base,image:"/assets/re-truthlens.svg",title:"New research",field:"Independent research",year:String(new Date().getFullYear()),status:"Draft",abstract:"",question:"",method:"",result:"",publication:"",paperId:"",documentUrl:"",pdf:"",verification:"",featured:false,tags:[]},
  creative:{...base,title:"New creative work",category:"Graphic design",description:"",link:"",featured:false},
  writing:{...base,title:"New essay or article",category:"Writing",year:String(new Date().getFullYear()),summary:"",body:"",documentUrl:"",featured:false},
  academics:{...base,title:"New activity",organization:"",type:"Academic activity",year:String(new Date().getFullYear()),description:"",link:""},
  certifications:{id:freshId("certificate"),title:"New course or certificate",issuer:"",date:"",year:String(new Date().getFullYear()),kind:"Course completion",category:"Learning",description:"",documentUrl:"",verification:"",visible:true},
  groups:{id:freshId("group"),title:"New category",eyebrow:"CATEGORY / INDEX",subtitle:"",description:"",logo:"",logoAlt:"",logoSource:"",visible:true},
  menu:{id:freshId("custom"),label:"New menu link",href:"https://",openNewTab:true,visible:true},
  custom:{id:freshId("section"),label:"New custom section",eyebrow:"EXPERIMENT / INDEX",heading:"New section",intro:"Introduce the work here.",body:"",image:"",visible:true,sectionLinks:[],items:[]}
 };
 return clone(map[type]||base);
}
const groupsByMode={
 awards:{path:"achievements.cards",title:"Achievements",singular:"Achievement",intro:"Each record can have a photo, certificates, direct evidence links and a chosen award category."},
 groups:{path:"achievements.groups",title:"Award categories & logos",singular:"Award category",intro:"Upload your own government or international category logo, change the category name and move groups."},
 projects:{path:"projects.items",title:"Projects",singular:"Project",intro:"Create case studies in any discipline. Every project displays its image, gallery and direct PDF/source buttons."},
 research:{path:"research.items",title:"Research",singular:"Research entry",intro:"Add a cover, abstract, publication status, research PDF and supporting sources."},
 creative:{path:"creative.items",title:"Design gallery",singular:"Design record",intro:"Add visual work, covers, supporting images and project links."},
 writing:{path:"writing.items",title:"Writing",singular:"Writing entry",intro:"A visual archive for essays and publications with file links."},
 academics:{path:"academics.items",title:"Education & activities",singular:"Timeline entry",intro:"Study, student leadership and academic milestones with direct links."},
 certifications:{path:"certifications.items",title:"Courses & certificates",singular:"Course record",intro:"Separate short-course completion and quiz results from competition prizes; upload an original PDF for each document."},
 menu:{path:"navigation",title:"Pages & menu",singular:"Menu link",intro:"Create internal section links (#research) or external links (https://...). Reorder freely; custom sections are below."},
 custom:{path:"customSections",title:"Custom sections",singular:"Section",intro:"Create unlimited new website sections with their own images, cards and links."}
};
function lookup(path){
 const parts=path.split(".");let parent=data;
 for(let i=0;i<parts.length-1;i++)parent=parent[parts[i]];
 return {parent,key:parts[parts.length-1],items:parent[parts[parts.length-1]]};
}
function collection(parent,type){
 const config=groupsByMode[type],loc=lookup(config.path),list=a(loc.items);
 const key=type;let position=chosen[key]||0;
 position=Math.min(Math.max(0,position),Math.max(0,list.length-1));chosen[key]=position;
 const head=make("div","collection-head");head.append(make("p","",list.length+" "+(list.length===1?config.singular:"entries")));
 head.append(button("＋ ADD "+config.singular.toUpperCase(),()=>{
  if(!Array.isArray(loc.parent[loc.key]))loc.parent[loc.key]=[];
  const newObj=schema(type);loc.parent[loc.key].push(newObj);chosen[key]=loc.parent[loc.key].length-1;
  if(type==="custom"){data.navigation.push({id:newObj.id,label:newObj.label,href:"#"+newObj.id,openNewTab:false,visible:true})}
  dirtyNow();render();
 },"main-action"));
 parent.append(head);
 if(!list.length){parent.append(make("div","record-empty","No entries yet. Click Add to create the first one."));return}
 const layout=make("div","collection-layout"),aside=make("div","record-list"),form=make("div","record-form");
 list.forEach((record,i)=>{
  const b=make("button",i===position?"active":"");
  if(record.image||record.logo){const image=make("img");image.src=record.image||record.logo;image.alt="";image.onerror=()=>image.remove();b.append(image)}
  else b.append(make("span","record-icon","✳"));
  const text=make("div");text.append(make("strong","",record.title||record.heading||record.label||record.name||record.id||("Item "+(i+1))));
  text.append(make("small","",record.category||record.type||record.year||record.id||"ENTRY"));
  b.append(text);
  b.onclick=()=>{chosen[key]=i;render()};aside.append(b);
 });
 const item=list[position];
 const actions=make("div","record-actions");
 actions.append(button("↑ MOVE UP",()=>moveItem(list,position,-1)));
 actions.append(button("↓ MOVE DOWN",()=>moveItem(list,position,1)));
 actions.append(button("⧉ DUPLICATE",()=>{
  const duplicate=clone(item);duplicate.id=freshId(type);
  list.splice(position+1,0,duplicate);chosen[key]=position+1;
  if(type==="custom")data.navigation.push({id:duplicate.id,label:duplicate.label,href:"#"+duplicate.id,openNewTab:false,visible:true});
  dirtyNow();render();
 }));
 actions.append(button("× DELETE",()=>{
  if(!confirm("Remove this "+config.singular+" from the website? Publish to confirm."))return;
  if(type==="custom")data.navigation=data.navigation.filter(x=>x.id!==item.id);
  list.splice(position,1);chosen[key]=Math.max(0,position-1);dirtyNow();render();
 },"danger-action"));
 form.append(actions);
 if(type==="awards")form.append(make("div","record-card-intro","Choose a category, upload its cover image and add supporting links. Visitors click View more to see your images, certificate PDFs, evidence and supporting links."));
 if(type==="menu")form.append(make("div","record-card-intro","For an existing section, use a link like #research or #projects. For custom external navigation use a full https:// URL and enable Open new tab."));
 editorFields(form,item);
 layout.append(aside,form);parent.append(layout);
}
function editorHeading(container,title,detail,number){
 const top=caption(title,detail);
 if(number){const pill=make("span","panel-badge",number);top.append(pill)}
 container.append(top);
}
function dashboard(container){
 editorHeading(container,"Your website, without the code.","Click a card below. Update text, images, certificate PDFs, menus or favicon, then press Publish at the top.");
 const list=[
 [a(data.achievements.cards).length,"Achievements","awards"],
 [a(data.projects.items).length,"Projects","projects"],
 [a(data.research.items).length,"Research","research"],
 [a(data.certifications?.items).length,"Course certificates","certifications"],
 [a(data.creative.items).length,"Design work","creative"],
 [a(data.navigation).filter(x=>x.visible!==false).length,"Menu links","menu"]
 ];
 const stats=make("div","overview-grid");
 list.forEach(([count,name],i)=>{const el=make("button","overview-tile");el.append(make("strong","",count),make("small","",name));el.onclick=()=>setMode(list[i][2]);stats.append(el)});
 container.append(stats);
 const links=make("div","quick-links");
 for(const [id,title,subtitle] of [
 ["home","Edit hero & your photo","Update your image, titles, profile and about text."],
 ["awards","Add achievement photos","Upload certificates, covers, and source links."],
 ["projects","Show new work","Graphic design, software, product concepts and more."],
 ["research","Publish a research entry","Add a research image, manuscript and source buttons."],
 ["menu","Add a menu or a section","Custom navigation, custom links and new sections."],
 ["look","Change favicon & colors","Adjust your site style, animation and Google description."]
 ]){
  const b=button("",()=>setMode(id),"");b.append(make("strong","",title),make("small","",subtitle));links.append(b)
 }
 container.append(links);
}
function rootSections(container,defs){
 for(const [key,title,help] of defs){
  const info=make("div","simple-section");
  info.append(make("h3","",title),make("p","field-tip",help));
  editorFields(info,data[key]);
  container.append(info);
 }
}
function recordPanel(container){
 const config=groupsByMode[mode];
 editorHeading(container,config.title,config.intro);
 if(["awards","projects","research","creative","academics","certifications"].includes(mode)){
  const baseKey=mode==="awards"?"achievements":mode;
  const root=make("section","simple-section");
  root.append(make("h3","","Section heading & introductory text"));
  const edit={};
  for(const k of ["eyebrow","heading","intro","emptyTitle","emptyBody"])if(typeof data[baseKey]?.[k]==="string")edit[k]=data[baseKey][k];
  const grid=make("div","field-grid");
  root.append(grid);
  Object.entries(edit).forEach(([k,v])=>{
   const f=input(k,v,t=>{data[baseKey][k]=t;dirtyNow()},{multiline:isLong(k),wide:isLong(k)});grid.append(f.wrapper);
  });
  if(data[baseKey]?.sectionLinks)linkEditor(root,data[baseKey],"sectionLinks");
  container.append(root);
 }
 collection(container,mode);
}
function menuPanel(container){
 editorHeading(container,"Pages, menus & custom links","You can change the order, hide a section, add an external menu link, or create an entirely new page section.");
 container.append(make("div","help-box","Each menu link has a label, destination (href), and visibility. Use #achievements, #projects, #research, or a complete https:// link. You can add links to each section from its editor, too."));
 collection(container,"menu");
 const sub=section(container,"New custom sections","Create a new homepage section with its own images and links. Adding a section creates its navigation item.");
 collection(sub,"custom");
}
function lookPanel(container){
 editorHeading(container,"Style, photos & search","Website colors, motion settings, Google SEO, favicon and social preview.");
 rootSections(container,[
  ["appearance","Theme colors & motion","Pick a palette for your website and adjust animations."],
  ["seo","Search engines & favicon","Upload an icon or photo, and update the text Google and social previews may show."]
 ]);
}
function homePanel(container){
 editorHeading(container,"Home, profile & all key text","Everything that identifies you: name, photo, introductory statement, contact and editorial highlights.");
 rootSections(container,[
  ["identity","Your identity & portrait","Name, photo, academic interests, email and social links."],
  ["hero","Landing page","Every headline, introduction, button and top-of-page line."],
  ["about","About & perspective","Your personal statement, principles, and inline section links."],
  ["contact","Contact & footer","Closing message and all outbound links."],
  ["design","Small creative details","Editorial labels, running strips and site motif language."],
  ["highlights","Selected index","Edit featured entry IDs, headline and intro. IDs can be copied from a card."]
 ]);
}
function labelsPanel(container){
 editorHeading(container,"All little words & labels","Change even small text such as link headings, chips, captions and featured intro.");
 const box=section(container,"Website microcopy","Text here is displayed throughout the portfolio.");
 editorFields(box,data.ui||{});
 if(data.tandemContent){const editor=section(container,"Original animated template text","Edit Interests, Learning, Focus, FAQs and labels without writing code.");editorFields(editor,data.tandemContent);}
 const path=section(container,"Academic section introduction","Other headings and labels also live in Home, Achievements, Projects, Research, Design, Writing and Education.");
 path.append(make("div","help-box","Use the editors above to update all content. Your changes go live only after you press Publish."));
}
function mediaPanel(container){
 editorHeading(container,"Media library & deletion","Uploaded images and PDFs stored in your GitHub repository.");
 const help=make("div","help-box");
 help.textContent="Remove the media link from its card first and Publish. Then return here to permanently delete the unused upload. Assets in assets/ are original design files and are not deleted by this tool.";
 container.append(help);
 const status=make("p","field-tip","Loading uploaded files…"),list=make("div");container.append(status,list);
 (async()=>{
  if(!writeOK){status.textContent="A token with Contents: Read and write is required to manage uploaded files.";return}
  try{
   const folders=["uploads","media"];
   const records=[];
   for(const folder of folders){
    try{
     const found=await request("GET","/contents/"+folder);
     records.push(...a(found).filter(x=>x.type==="file"));
    }catch(e){if(!/404|Not Found/i.test(s(e.message)))throw e}
   }
   if(mode!=="files")return;
   status.textContent=records.length+" uploaded file(s) in uploads/ and legacy media/";
   if(!records.length)list.append(make("div","record-empty","No uploads yet. Upload an image from an Achievement or Project."));
   for(const entry of records){
    const row=make("div","media-line");
    if(/\.(png|jpe?g|webp|avif|gif|ico)$/i.test(entry.name)){const pic=make("img");pic.src="/"+entry.path;pic.alt=entry.name;row.append(pic)}
    else row.append(make("span","record-icon","PDF"));
    const name=make("div","filename",entry.name),path="/"+entry.path;
    const used=JSON.stringify(data).includes(path);name.append(make("small","",used?"Linked in your current draft":"Not linked in the current draft"));
    row.append(name);
    const del=button(used?"IN USE":"DELETE FILE",async()=>{
     if(used||dirty){notice("First remove this file from the card, then Publish before deleting it.","warning");return}
     if(!confirm("Permanently delete "+entry.name+" from your GitHub branch? Older commits might still contain copies."))return;
     try{
      const current=await request("GET","/contents/"+CONTENT);
      if(current.sha!==sha)throw Error("Portfolio was updated elsewhere; reconnect before deleting.");
      if(decode(current.content).includes(path))throw Error("This file is still referenced by the published content.");
      const f=await request("GET","/contents/"+entry.path);
      await request("DELETE","/contents/"+entry.path,{message:"Delete unused portfolio media: "+entry.name,sha:f.sha,branch:"main"});
      notice("Deleted unused file. It may remain in Git history.");render();
     }catch(e){notice(errorMessage(e),"error")}
    },used?"sub-action":"danger-action");
    del.disabled=used||dirty;row.append(del);list.append(row);
   }
  }catch(e){
   status.textContent=/404|Not Found/i.test(s(e.message))?"No uploads folder exists yet. Add your first photo from a portfolio card.":errorMessage(e);
  }
 })();
}
function advancedPanel(container){
 editorHeading(container,"Full content / advanced","Every field that appears on the website can be edited here too. Make a backup before making structural changes.");
 container.append(make("div","help-box","Changes in this screen are drafts only. Press Apply JSON, then Publish to send them to your GitHub website."));
 const box=make("textarea","json-textarea");box.value=JSON.stringify(data,null,2);box.spellcheck=false;container.append(box);
 const actions=make("div","advanced-actions");
 actions.append(button("APPLY JSON",()=>{
  try{const candidate=JSON.parse(box.value);if(!candidate||typeof candidate!=="object"||!Array.isArray(candidate.navigation))throw Error("navigation array required");data=candidate;dirtyNow();render();notice("Advanced changes applied to the draft. Publish when ready.")}
  catch(e){notice("Invalid JSON: "+e.message,"error")}
 },"main-action"),button("RESET TEXT",()=>box.value=JSON.stringify(data,null,2)));
 container.append(actions);
}
function setMode(next){mode=next;render();document.getElementById("workspace")?.scrollIntoView({behavior:"smooth",block:"start"})}
function render(){
 if(!data)return;
 const editor=$("#editor");editor.innerHTML="";
 const nav=$("#admin-nav");nav.innerHTML="";
 modules.forEach(([key,name],i)=>{
  const b=button("",()=>setMode(key),key===mode?"current":"");
  b.append(make("span","nav-index",String(i+1).padStart(2,"0")),make("span","",name));nav.append(b)
 });
 const names=modules.find(m=>m[0]===mode)||modules[0];
 $("#screen-title").innerHTML="";
 $("#screen-title").append(document.createTextNode(names[1]));$("#screen-title").append(make("span","","."));
 $("#screen-note").textContent=names[2];
 if(mode==="start")dashboard(editor);
 else if(mode==="home")homePanel(editor);
 else if(mode==="look")lookPanel(editor);
 else if(mode==="labels")labelsPanel(editor);
 else if(mode==="menu")menuPanel(editor);
 else if(mode==="files")mediaPanel(editor);
 else if(mode==="advanced")advancedPanel(editor);
 else recordPanel(editor);
 $("#publish").disabled=!writeOK||busy;
}
async function uploadFile(file){
 if(!writeOK)throw Error("Write access required. This token cannot upload files.");
 if(!file)throw Error("Select a file.");
 const allowedExtensions=new Set(["png","jpg","jpeg","webp","avif","gif","ico","pdf"]);
 const allowedTypes=new Set(["image/png","image/jpeg","image/webp","image/avif","image/gif","application/pdf","image/x-icon","image/vnd.microsoft.icon","image/ico","application/octet-stream",""]);
 const extension=s(file.name.split(".").pop()).toLowerCase();
 if(!allowedExtensions.has(extension)||!allowedTypes.has(file.type))throw Error("Use PNG, JPG, JPEG, WebP, AVIF, GIF, ICO or PDF. SVG is blocked for security.");
 if(file.size<=0||file.size>15*1024*1024)throw Error("Choose a non-empty image or PDF smaller than 15 MB.");
 const basename=s(file.name).replace(/\.[^.]+$/,"").replace(/[^a-z0-9_-]+/gi,"-").slice(0,44)||"media";
 const final="uploads/"+Date.now()+"-"+uuid().slice(0,8)+"-"+basename+"."+extension;
 const buf=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(s(reader.result).split(",")[1]);reader.onerror=()=>reject(Error("Could not read file"));reader.readAsDataURL(file)});
 await request("PUT","/contents/"+final,{message:"Upload portfolio asset: "+basename,content:buf,branch:"main"});
 return "/"+final;
}
function download(){
 const content=JSON.stringify(data,null,2),blob=new Blob([content],{type:"application/json"});
 const href=URL.createObjectURL(blob),anchor=make("a");anchor.href=href;anchor.download="nafis-portfolio-"+new Date().toISOString().slice(0,10)+".json";
 anchor.click();setTimeout(()=>URL.revokeObjectURL(href),1000);
}
async function syncSearchMeta(){
 const file=await request("GET","/contents/index.html");
 let html=decode(file.content);
 const fields={"site-title":data.seo?.title||data.identity?.name,"site-description":data.seo?.description||"","site-keywords":data.seo?.keywords||"","og-title":data.seo?.title||"","og-description":data.seo?.description||"","og-image":data.seo?.ogImage||data.identity?.portrait||"","site-favicon":data.seo?.favicon||"/favicon.svg","canonical":data.seo?.canonical||"https://nafis-tamim.github.io/"};
 const encoded=s=>s.replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;");
 const original=html;
 html=html.replace(/<title data-sync="site-title">[\s\S]*?<\/title>/i,'<title data-sync="site-title">'+encoded(fields["site-title"])+'</title>');
 for(const [name,val] of Object.entries(fields)){
  if(name==="site-title")continue;
  const re=new RegExp('(<(?:meta|link)\\b(?=[^>]*data-sync="'+name+'")[^>]*\\b(?:content|href)=")[^"]*(")',"i");
  html=html.replace(re,(_match,prefix,end)=>prefix+encoded(s(val))+end);
 }
 if(html===original)return;
 await request("PUT","/contents/index.html",{message:"Update site meta description, title and favicon",content:encode(html),sha:file.sha,branch:"main"});
}
async function publish(){
 if(!writeOK||busy||!data)return;
 busy=true;$("#publish").disabled=true;notice("Publishing content to GitHub…");
 try{
  const latest=await request("GET","/contents/"+CONTENT);
  if(latest.sha!==sha)throw Error("Content changed on GitHub after you logged in. Disconnect and reconnect to load the latest version before publishing.");
  const saved=await request("PUT","/contents/"+CONTENT,{message:"Portfolio Studio: publish content changes",content:encode(JSON.stringify(data,null,2)+"\n"),sha,branch:"main"});
  sha=saved.content.sha;cleanNow();
  try{await syncSearchMeta();notice("Published successfully! GitHub Pages normally refreshes within a minute or two.")}
  catch(e){notice("Content published successfully. Static SEO update did not finish: "+errorMessage(e),"warning")}
 }catch(e){notice("Could not publish: "+errorMessage(e),"error")}
 finally{busy=false;render()}
}
async function login(){
 const input=$("#token"),auth=$("#auth-message");auth.textContent="";
 token=input.value.trim();
 if(!token){auth.textContent="Paste a GitHub token first.";return}
 const b=$("#connect");b.disabled=true;b.textContent="CHECKING ACCOUNT…";
 try{
  const file=await request("GET","/contents/"+CONTENT);
  data=JSON.parse(decode(file.content));sha=file.sha;
  /* Git Blobs preflight isn't the upload route and may incorrectly block
     file uploads. Real file PUTs enforce GitHub Contents: write access. */
  writeOK=true;
  input.value="";
  $("#login").hidden=true;$("#workspace").hidden=false;$("#disconnect").hidden=false;
  cleanNow();render();
  notice("Connected. You can choose photos, PDFs and favicons. GitHub will confirm your token has Contents: Read and write on the actual Upload or Publish request. A 403 requires fixing token permissions.", "success");
 }catch(e){
  auth.textContent=errorMessage(e);token="";data=null;
 }finally{b.disabled=false;b.textContent="CONNECT & CHECK PERMISSIONS ↗"}
}
function logout(){
 if(dirty&&!confirm("Discard unpublished changes and disconnect?"))return;
 token="";writeOK=false;data=null;sha="";location.reload();
}
$("#connect").onclick=login;
$("#token").addEventListener("keydown",e=>{if(e.key==="Enter")login()});
$("#publish").onclick=publish;
$("#backup").onclick=download;
$("#disconnect").onclick=logout;
window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue=""}});
