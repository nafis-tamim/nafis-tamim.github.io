
"use strict";
/* NT Portfolio Studio v4 — secure GitHub repository-scoped publishing */
const REPO="nafis-tamim/nafis-tamim.github.io";
const FILE="content/site.json";
const API="https://api.github.com/repos/"+REPO;
let token="",documentData=null,contentSha="",dirty=false,activeModule="overview",currentItem=0,busy=false;
let sourceJson="";
const $=s=>document.querySelector(s);
const node=(name,cls="",text="")=>{const n=document.createElement(name);if(cls)n.className=cls;if(text!==undefined&&text!==null)n.textContent=text;return n};
const text=x=>String(x===null||x===undefined?"":x);
const arr=x=>Array.isArray(x)?x:[];
const itemId=()=>typeof crypto!=="undefined"&&crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2);
const entries=[
 ["overview","OVERVIEW","Dashboard","Manage the whole portfolio from one secure space.",null],
 ["identity","IDENTITY","Profile & photo","Name, profile photo, academic identity, social accounts and contact email.","identity"],
 ["hero","LANDING PAGE","Hero & spotlight","Every headline, introduction and featured recognition on the first screen.","hero"],
 ["achievements","RECOGNITION","Achievements & awards","All awards and honours with images, certificate gallery, details and independent proof links.","achievements"],
 ["projects","ALL CATEGORIES","Projects & case studies","Software, research, design, writing, products and any other project type.","projects"],
 ["research","RESEARCH ARCHIVE","Research & inquiry","Research abstracts, methods, conclusions, publications and supporting images or PDFs.","research"],
 ["creative","DESIGN / ART","Creative work","Branding, posters, product concepts, creative collections and downloadable work.","creative"],
 ["writing","PUBLICATIONS","Writing & essays","Academic essays, publications, writing prizes, reviews and independent ideas.","writing"],
 ["academics","EDUCATION","Academic journey","Education, activities, internships, leadership and other milestones.","academics"],
 ["about","PERSONAL STATEMENT","About & approach","Edit the complete personal statement and three guiding principles.","about"],
 ["navigation","SITE STRUCTURE","Menus & sections","Edit navigation labels, reorder, hide, show, or add a custom section.","navigation"],
 ["highlights","FEATURED","Editorial highlights","Choose the entries featured in changing selected-work collections.","highlights"],
 ["contact","OUTREACH","Contact & footer","Edit footer and call-to-action content; social links are under Profile & photo.","contact"],
 ["appearance","DESIGN SYSTEM","Colors & animations","Set every theme color and choose subtle science animations and motion effects.","appearance"],
 ["seo","SEARCH PRESENCE","SEO & favicon","Control page title, description, keywords, social image and browser tab icon.","seo"],
 ["customSections","FLEXIBLE CONTENT","Custom sections","Create completely new sections with their own heading, description and cards.","customSections"],
 ["ui","SITE LANGUAGE","Labels & microcopy","All small labels, button captions, status text and non-editorial words.","ui"],
 ["advanced","ALL SITE CONTENT","Advanced JSON editor","Edit or add any text, property, array, label, menu or entire content block.","advanced"]
];
const prettyLabel=x=>text(x).replace(/([a-z])([A-Z])/g,"$1 $2").replace(/[_-]/g," ").replace(/\b\w/g,c=>c.toUpperCase());
const fieldLong=k=>/(body|summary|description|intro|details|challenge|process|outcome|method|abstract|quote|caption|lead|content|heading)/i.test(k);
const fieldMedia=k=>/(^image$|portrait|photo|favicon|cover|ogImage|thumbnail|banner|pdf|documentUrl)/i.test(k);
const fieldLink=k=>/(^url$|Url$|^link$|verification|email)/i.test(k);
function api(method,endpoint,body){
 return fetch(endpoint.startsWith("https://")?endpoint:API+endpoint,{
  method,headers:{
   "Authorization":"Bearer "+token,
   "Accept":"application/vnd.github+json",
   "X-GitHub-Api-Version":"2022-11-28",
   ...(body?{"Content-Type":"application/json"}:{})
  },
  body:body?JSON.stringify(body):undefined
 }).then(async r=>{
   const raw=await r.text();let data;
   try{data=JSON.parse(raw)}catch{data={message:raw}}
   if(!r.ok)throw Error(data.message||"GitHub API returned "+r.status);
   return data;
 });
}
function b64encode(str){
 const bytes=new TextEncoder().encode(str);
 let result="";
 for(let i=0;i<bytes.length;i+=8192)result+=String.fromCharCode(...bytes.slice(i,i+8192));
 return btoa(result);
}
function b64decode(raw){
 const binary=atob(raw.replace(/\s+/g,""));const bytes=Uint8Array.from(binary,x=>x.charCodeAt(0));
 return new TextDecoder().decode(bytes);
}
function flash(message,type="success"){
 const box=$("#status-banner");
 box.textContent=message;box.className=type;
}
function markDirty(){
 dirty=true;
 $("#dirty-label").textContent="UNPUBLISHED CHANGES";
 $("#dirty-label").style.color="#a46616";
 $("#publish").textContent="PUBLISH CHANGES ↗";
}
function clearDirty(){
 dirty=false;$("#dirty-label").textContent="ALL CHANGES PUBLISHED";
 $("#dirty-label").style.color="#24755e";
}
async function connect(){
 const entered=$("#token").value.trim(),error=$("#login-error");error.textContent="";
 if(!entered){error.textContent="Paste your GitHub fine-grained personal access token.";return}
 token=entered;$("#connect").disabled=true;
 try{
  const r=await api("GET","/contents/"+FILE);
  documentData=JSON.parse(b64decode(r.content));sourceJson=JSON.stringify(documentData);
  contentSha=r.sha;$("#token").value="";
  $("#login").hidden=true;$("#dashboard").hidden=false;
  clearDirty();renderNavigation();renderModule();
  flash("Connected securely to "+REPO+". All edits remain drafts until you choose Publish.");
 }catch(e){
  token="";
  error.textContent="Could not connect: "+e.message+" . Check the repository selection and Contents: Read & Write permissions.";
 }finally{$("#connect").disabled=false}
}
function renderNavigation(){
 const nav=$("#sections-nav");nav.innerHTML="";
 entries.forEach(([key,kicker,title],i)=>{
  const b=node("button",key===activeModule?"active":"");
  b.dataset.mod=key;
  b.innerHTML="<span>"+String(i+1).padStart(2,"0")+"</span>";
  b.append(document.createTextNode(title));
  b.addEventListener("click",()=>{activeModule=key;currentItem=0;renderNavigation();renderModule()});
  nav.append(b);
 });
}
function control(text,fn,cls="small-btn"){
 const b=node("button",cls,text);b.type="button";b.onclick=fn;return b;
}
function renderModule(){
 const definition=entries.find(x=>x[0]===activeModule)||entries[0];
 $("#panel-kicker").textContent=definition[1];
 $("#panel-title").textContent=definition[2];
 $("#panel-description").textContent=definition[3];
 const count=$("#panel-count"),area=$("#editor-area");count.textContent="";area.innerHTML="";
 if(activeModule==="overview"){overview(area);return}
 if(activeModule==="advanced"){advanced(area);return}
 const root=documentData[definition[4]];
 if(activeModule==="customSections"){
  customEditor(area);count.textContent=arr(root).length+" SECTIONS";return;
 }
 if(activeModule==="navigation"){
  const info=node("div","highlight-message","Navigation order defines the order visitors see sections. Hidden sections are removed from public navigation and the public page. Custom sections appear here automatically.");
  area.append(info);
  arrayEditor(area,root,documentData,"navigation","navigation");
  count.textContent=arr(root).length+" ITEMS";return;
 }
 if(Array.isArray(root)){
  arrayEditor(area,root,documentData,definition[4],activeModule);
  count.textContent=root.length+" ITEMS";return;
 }
 if(root&&typeof root==="object"){
  objectEditor(area,root,definition[4]);
  const listing=root.cards||root.items;
  if(Array.isArray(listing))count.textContent=listing.length+" ENTRIES";
 }else{
  area.append(node("p","mini-note","No content yet. Try the Advanced JSON Editor."));
 }
}
function overview(area){
 const counts=[
  [arr(documentData.achievements?.cards).length,"ACHIEVEMENTS"],
  [arr(documentData.projects?.items).length,"PROJECTS"],
  [arr(documentData.research?.items).length,"RESEARCH"],
  [arr(documentData.creative?.items).length,"DESIGN RECORDS"],
  [arr(documentData.writing?.items).length,"WRITINGS"],
  [arr(documentData.navigation).filter(x=>x.visible).length,"LIVE SECTIONS"]
 ];
 const note=node("div","highlight-message");
 note.innerHTML="<strong>One editorial system, unlimited types of work.</strong>  The site reads everything from the repository content document. You can upload PNG, JPG, WebP, GIF and PDF files directly to GitHub; the editor inserts their links automatically. For privacy, your token is kept in memory and disappears on disconnect.";
 area.append(note);
 const g=node("div","overview-stats");counts.forEach(([count,label])=>{const x=node("div","overview-stat");x.innerHTML="<strong>"+count+"</strong><small>"+label+"</small>";g.append(x)});area.append(g);
 const shortcuts=node("div","overview-actions");
 for(const [key,title,detail] of [
  ["achievements","Recognition & certificates","Add an award and attach a public official source"],
  ["projects","Projects & case studies","Publish software, graphic design or any other work"],
  ["research","Research & academic papers","Add abstracts, methods and supporting documents"],
  ["seo","Browser icon & Google SEO","Edit favicon, social preview, title and description"],
  ["navigation","Menu & layout","Reorder sections, create custom pages and hide sections"],
  ["appearance","Colors & effects","Change the visual system without writing CSS"]
 ]){
  const b=control(title,()=>{activeModule=key;currentItem=0;renderNavigation();renderModule()},"");
  b.append(node("small","",detail));shortcuts.append(b);
 }
 area.append(shortcuts);
 area.append(node("p","mini-note","GitHub Pages is a static hosting service, so MongoDB access credentials must not be placed in browser code. The live website uses this GitHub-backed content system; MongoDB is a separate backed-up dataset until a secure server-side integration is deployed."));
}
function makeLabel(title){
 const label=node("label","field");const name=node("span","field-label",prettyLabel(title));label.append(name);return label;
}
function createMediaInput(container,obj,key){
 const media=node("div","field-controls");
 const action=control("↑ Upload image / PDF",()=>picker.click());
 media.append(action);
 const picker=node("input","file-input");picker.type="file";
 picker.accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.ico,image/png,image/jpeg,image/webp,image/gif,application/pdf,image/x-icon";
 picker.style.display="none";media.append(picker);
 const status=node("span","micro","");
 media.append(status);
 picker.onchange=async()=>{
  const file=picker.files?.[0];if(!file)return;
  status.textContent="Uploading "+file.name+"…";
  try{
   const path=await uploadFile(file);
   obj[key]=path;markDirty();status.textContent="Uploaded! Image URL inserted.";
   renderModule();
   flash("Uploaded "+file.name+" to GitHub. Remember to Publish the portfolio changes to link the image.");
  }catch(e){status.textContent="Upload failed: "+e.message;flash("File upload failed: "+e.message,"warning")}
  picker.value="";
 };
 container.append(media);
 if(obj[key]&&/\.(png|jpe?g|webp|gif|ico)(\?|$)/i.test(obj[key])){
  const im=node("img","field-preview");im.src=obj[key];im.alt="Media preview";im.loading="lazy";im.onerror=()=>im.remove();container.append(im);
 }
}
function renderField(parent,obj,key,value){
 const label=makeLabel(key);
 const multiline=fieldLong(key)||text(value).length>130;
 label.classList.toggle("span-full",multiline||fieldMedia(key));
 if(typeof value==="boolean"){
  label.classList.add("field-check");
  const box=node("input");box.type="checkbox";box.checked=value;box.onchange=()=>{obj[key]=box.checked;markDirty()};
  label.append(box);
 }else if(typeof value==="number"){
  const input=node("input");input.type="number";input.value=String(value);
  input.oninput=()=>{obj[key]=Number(input.value);markDirty()};label.append(input);
 }else if(typeof value==="string"){
  const isHex=/^#[a-fA-F0-9]{6}$/.test(value);
  const el=isHex?node("input"):multiline?node("textarea"):node("input");
  if(isHex)el.type="color";else if(fieldLink(key))el.type=key==="email"?"email":"text";
  el.value=value;
  el.autocomplete="off";
  el.oninput=()=>{obj[key]=el.value;markDirty()};
  label.append(el);
  if(fieldMedia(key))createMediaInput(label,obj,key);
 }else{
  const el=node("textarea");el.value=JSON.stringify(value??null,null,2);
  el.onchange=()=>{try{obj[key]=JSON.parse(el.value);el.style.borderColor="#448866";markDirty()}catch(e){flash("Invalid JSON in "+key+": "+e.message,"warning");el.style.borderColor="red"}};
  label.append(el);
 }
 parent.append(label);
}
function objectEditor(parent,obj,path=""){
 if(!obj||typeof obj!=="object")return;
 const grid=node("div","editor-grid");parent.append(grid);
 Object.entries(obj).forEach(([key,v])=>{
  if(Array.isArray(v)){
   if(arr(v).length===0||typeof v[0]==="object"){
    const box=node("div","group-box");box.style.gridColumn="1/-1";
    box.append(node("div","group-legend",prettyLabel(key).toUpperCase()+" / COLLECTION"));
    grid.append(box);
    arrayEditor(box,v,obj,key,path+"."+key);
   }else{
    const label=makeLabel(key);label.classList.add("span-full");
    const input=node("textarea");input.rows=3;input.value=v.join("\n");input.onchange=()=>{obj[key]=input.value.split("\n").map(s=>s.trim()).filter(Boolean);markDirty()};
    label.append(input);label.append(node("div","field-desc","One item per line. You can also upload assets to add to this gallery."));
    createArrayMediaUpload(label,obj,key);
    grid.append(label);
   }
  }else if(v&&typeof v==="object"){
   const group=node("div","group-box");group.style.gridColumn="1/-1";
   group.append(node("h3","group-heading",prettyLabel(key)));grid.append(group);
   objectEditor(group,v,path+"."+key);
  }else renderField(grid,obj,key,v);
 });
}
function createArrayMediaUpload(parent,obj,key){
 const b=control("↑ Upload file into gallery",()=>input.click());
 b.style.marginTop="12px";parent.append(b);
 const input=node("input");input.type="file";input.accept=".png,.jpg,.jpeg,.webp,.gif,.pdf,.ico";input.style.display="none";
 parent.append(input);input.onchange=async()=>{
  if(!input.files?.[0])return;
  try{const link=await uploadFile(input.files[0]);obj[key].push(link);markDirty();renderModule();flash("Gallery media uploaded and added. Click Publish to make it visible.")}
  catch(e){flash("Upload failed: "+e.message,"warning")}
 };
}
function defaultRecord(type){
 const defaults={
  achievements:{id:itemId(),title:"New achievement",institution:"",category:"Academic achievement",year:"",summary:"",details:"",result:"",verified:false,verification:"",image:"",gallery:[],tags:[],featured:false},
  projects:{id:itemId(),title:"New project",subtitle:"",category:"Other",year:"",status:"In progress",summary:"",challenge:"",process:"",outcome:"",tools:"",image:"",gallery:[],url:"",verification:"",featured:false,tags:[]},
  research:{id:itemId(),title:"New research record",field:"Independent research",year:"",abstract:"",question:"",method:"",result:"",publication:"",verification:"",documentUrl:"",image:"",gallery:[],tags:[],featured:false},
  creative:{id:itemId(),title:"New creative work",category:"Graphic design",description:"",image:"",gallery:[],link:"",featured:false},
  writing:{id:itemId(),title:"New writing",year:"",category:"Essay",summary:"",body:"",verification:"",documentUrl:"",image:"",gallery:[],tags:[],featured:false},
  academics:{id:itemId(),year:"",type:"Education",title:"New milestone",organization:"",description:"",link:"",image:""},
  navigation:{id:"custom-"+Date.now(),label:"New menu item",visible:true},
  customSections:{id:"custom-"+Date.now(),label:"New section",eyebrow:"NEW COLLECTION",heading:"New section",intro:"Edit this description.",visible:true,items:[]},
  principles:{number:"04",title:"New principle",body:""},
  socials:{label:"New profile",url:"https://"},
  items:{id:itemId(),title:"New item",category:"",description:"",image:"",url:""}
 };
 return structuredClone(defaults[type]||defaults.items);
}
function listTitle(item,i){
 return item?.title||item?.name||item?.label||item?.heading||item?.id||"Item "+(i+1);
}
function arrayEditor(parent,items,owner,key,group){
 if(!Array.isArray(items)){parent.append(node("p","mini-note","Collection not initialized."));return}
 const heading=node("div","array-head");heading.append(node("h3","",prettyLabel(key)));
 const plus=control("＋ ADD NEW",()=>{
  const type=group.startsWith("about.principles")?"principles":group.includes("socials")?"socials":group.startsWith("customSections")?"customSections":activeModule;
  const fresh=defaultRecord(type);
  items.push(fresh);currentItem=items.length-1;
  if(type==="customSections"){
   documentData.navigation.push({id:fresh.id,label:fresh.label,visible:true});
  }
  markDirty();renderModule();
 },"");heading.append(plus);parent.append(heading);
 if(!items.length){
  parent.append(node("p","mini-note","This collection is empty. Click ＋ Add New to create the first entry."));
  return;
 }
 const selected=Math.min(Math.max(0,currentItem),items.length-1);currentItem=selected;
 if(typeof items[0]!=="object" || items[0]===null){
  const area=node("textarea","");area.value=items.join("\n");area.onchange=()=>{owner[key]=area.value.split("\n").filter(Boolean);markDirty()};
  parent.append(area);return;
 }
 const layout=node("div","item-layout"),left=node("div","item-list"),right=node("div","item-edit");layout.append(left,right);parent.append(layout);
 items.forEach((item,i)=>{
  const b=node("button",selected===i?"is-active":"");
  const mini=node("span","",String(i+1).padStart(2,"0")+" / "+text(item.category||item.type||"ENTRY"));b.append(mini);
  b.append(document.createTextNode(listTitle(item,i)));
  b.onclick=()=>{currentItem=i;renderModule()};left.append(b);
 });
 const actions=node("div","toolbar");
 actions.append(control("↑ UP",()=>move(-1)),control("↓ DOWN",()=>move(1)));
 actions.append(control("⧉ DUPLICATE",()=>{
  const copy=structuredClone(items[currentItem]);copy.id=itemId();items.splice(currentItem+1,0,copy);currentItem++;markDirty();renderModule();
 }));
 actions.append(control("× DELETE",()=>{
  if(!confirm("Delete this entry? You can recover from GitHub history until published."))return;
  const item=items[currentItem];
  if(activeModule==="customSections")documentData.navigation=documentData.navigation.filter(x=>x.id!==item.id);
  items.splice(currentItem,1);currentItem=Math.max(0,currentItem-1);markDirty();renderModule();
 },"small-btn danger"));
 right.append(actions);
 objectEditor(right,items[currentItem],group+"["+currentItem+"]");
 function move(delta){
  const to=currentItem+delta;if(to<0||to>=items.length)return;
  [items[to],items[currentItem]]=[items[currentItem],items[to]];
  currentItem=to;markDirty();renderModule();
 }
}
function customEditor(area){
 const note=node("div","highlight-message","Add your own section with any label, heading, descriptive text, and a set of image cards. The new section is automatically added to navigation; move it using Menus & sections.");
 area.append(note);
 arrayEditor(area,documentData.customSections,documentData,"customSections","customSections");
}
function advanced(area){
 const warn=node("div","highlight-message","This editor allows unrestricted changes to all text, metadata and content—including properties not shown in the visual editor. JSON syntax must be valid. Use Backup JSON first.");
 area.append(warn);
 const code=node("textarea","json-editor");code.spellcheck=false;code.value=JSON.stringify(documentData,null,2);
 area.append(code);
 const actions=node("div","json-actions");
 actions.append(control("APPLY JSON CHANGES",()=>{
  try{
   const proposed=JSON.parse(code.value);
   if(!proposed||typeof proposed!=="object"||!Array.isArray(proposed.navigation))throw Error("Missing top-level navigation array");
   documentData=proposed;markDirty();flash("Advanced JSON applied to the draft. Publish to make changes public.");renderModule();
  }catch(e){flash("Invalid JSON: "+e.message,"warning")}
 },"button-primary"));
 actions.append(control("RESET TO CURRENT DRAFT",()=>{code.value=JSON.stringify(documentData,null,2)}));
 area.append(actions);
}
function bytesToB64(file){
 return new Promise((resolve,reject)=>{
  const reader=new FileReader();
  reader.onload=()=>{const result=String(reader.result||"");resolve(result.split(",")[1]||"")};
  reader.onerror=()=>reject(Error("Cannot read this file"));
  reader.readAsDataURL(file);
 });
}
async function uploadFile(file){
 if(!token)throw Error("Connect to GitHub first.");
 const allowed=["image/png","image/jpeg","image/webp","image/gif","application/pdf","image/x-icon","image/vnd.microsoft.icon"];
 if(!allowed.includes(file.type)&&!/\.(ico)$/i.test(file.name))throw Error("Only PNG, JPG, WebP, GIF, ICO or PDF is supported. SVG is intentionally excluded for security.");
 if(file.size>8*1024*1024)throw Error("Files must be 8 MB or smaller on the free GitHub media uploader.");
 if(!file.size)throw Error("Empty file");
 const ext=String(file.name.split(".").pop()||"bin").toLowerCase();
 const base=String(file.name).replace(/\.[^.]+$/,"").toLowerCase().replace(/[^a-z0-9_-]+/g,"-").slice(0,36)||"asset";
 const filename=Date.now()+"-"+itemId().slice(0,8)+"-"+base+"."+ext;
 const path="media/"+filename;
 const b64=await bytesToB64(file);
 await api("PUT","/contents/"+encodeURIComponent(path).replaceAll("%2F","/"),{
  message:"Portfolio media: upload "+filename,content:b64,branch:"main"
 });
 return "/"+path;
}
function download(){
 const blob=new Blob([JSON.stringify(documentData,null,2)],{type:"application/json"});
 const u=URL.createObjectURL(blob);
 const a=node("a");a.href=u;a.download="nafis-portfolio-backup-"+new Date().toISOString().slice(0,10)+".json";
 a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);
}
function setMetaTag(html,selector,replacement){
 return html.replace(selector,replacement);
}
function escapeHtmlAttr(s){return text(s).replaceAll("&","&amp;").replaceAll('"',"&quot;").replaceAll("<","&lt;")}
async function publishIndexHead(){
 const file=await api("GET","/contents/index.html");
 let html=b64decode(file.content);
 const seo=documentData.seo||{},i=documentData.identity||{};
 const updates={
  "site-title":seo.title||i.name,
  "site-description":seo.description||"",
  "site-keywords":seo.keywords||"",
  "og-title":seo.title||i.name,
  "og-description":seo.description||"",
  "og-image":seo.ogImage||i.portrait||"",
  "site-favicon":seo.favicon||"/favicon.svg",
  "canonical":seo.canonical||"https://nafis-tamim.github.io/"
 };
 html=html.replace(/<title data-sync="site-title">[\s\S]*?<\/title>/i,'<title data-sync="site-title">'+text(updates["site-title"]).replaceAll("<","&lt;")+'</title>');
 for(const [key,value] of Object.entries(updates)){
  if(key==="site-title")continue;
  const pattern=new RegExp('(<(?:meta|link)\\b(?=[^>]*data-sync="'+key+'")[^>]*\\b(?:content|href)=")[^"]*(")',"i");
  html=html.replace(pattern,(_,a,b)=>a+escapeHtmlAttr(value)+b);
 }
 if(html===b64decode(file.content))return;
 await api("PUT","/contents/index.html",{
  message:"Portfolio Studio: refresh static SEO and social metadata",
  content:b64encode(html),sha:file.sha,branch:"main"
 });
}
async function publish(){
 if(!token||busy)return;
 busy=true;$("#publish").disabled=true;
 flash("Publishing content to the public repository…");
 try{
  const current=await api("GET","/contents/"+FILE);
  if(current.sha!==contentSha){
    if(!confirm("The GitHub content file changed since you connected. Overwrite the newer version with your current draft? Choose Cancel to protect the newer content.")){
      flash("Publish cancelled. Please disconnect and reconnect to load the latest content.","warning");return;
    }
    contentSha=current.sha;
  }
  const updated=await api("PUT","/contents/"+FILE,{
   message:"Portfolio Studio: publish new academic content",
   content:b64encode(JSON.stringify(documentData,null,2)+"\n"),
   sha:contentSha,branch:"main"
  });
  contentSha=updated.content.sha;
  sourceJson=JSON.stringify(documentData);
  clearDirty();
  try{
   await publishIndexHead();
   flash("Published! Content, favicon setting and search metadata committed. GitHub Pages may need 1–2 minutes to update.");
  }catch(e){
   flash("Content published, but the static SEO update could not finish: "+e.message+" . Your changes are live after GitHub Pages deploys.","warning");
  }
 }catch(e){flash("Publish failed: "+e.message,"warning")}
 finally{busy=false;$("#publish").disabled=false}
}
function disconnect(){
 if(dirty&&!confirm("Disconnect and discard unpublished changes?"))return;
 token="";documentData=null;contentSha="";location.reload();
}
window.addEventListener("beforeunload",e=>{if(dirty){e.preventDefault();e.returnValue=""}});
$("#connect").onclick=connect;
$("#token").addEventListener("keydown",e=>{if(e.key==="Enter")connect()});
$("#publish").onclick=publish;
$("#download").onclick=download;
$("#disconnect").onclick=disconnect;
