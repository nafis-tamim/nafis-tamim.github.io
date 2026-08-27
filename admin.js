(() => {
  const cfg = window.PORTFOLIO_CONFIG || {};
  if (!cfg.supabaseUrl || cfg.supabaseUrl.includes("PASTE_") || !cfg.supabaseAnonKey || cfg.supabaseAnonKey.includes("PASTE_")) {
    document.getElementById("loginError").textContent = "Add your Supabase URL and anon key to config.js first.";
    return;
  }

  const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const esc = (v="") => String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const state = { user:null, cache:{} };

  const schemas = {
    sections: [
      ["slug","Slug","text",true],["nav_label","Navigation label","text"],["eyebrow","Eyebrow","text"],["title","Title","text",true],
      ["subtitle","Subtitle","textarea"],["kind","Section type","select",true,["honours","awards","certificates","competitions","leadership","projects","research","skills","custom"]],
      ["position","Position","number"],["visible","Visible","checkbox"],["custom_body","Custom section body","textarea"],["custom_image","Custom image","file"]
    ],
    awards: [
      ["title","Award title","text",true],["organization","Organization","text"],["result","Result / honour","text"],["year","Year","text"],
      ["category","Category","text"],["symbol","Short symbol","text"],["description","Description","textarea"],["featured","Featured","checkbox"],
      ["published","Published","checkbox"],["position","Position","number"],["image_file","Award image","file"],["certificate_file","Certificate file/image","file"]
    ],
    certificates: [
      ["title","Certificate title","text",true],["organization","Organization","text"],["category","Categories (comma separated)","text"],["year","Year","text"],
      ["credential_url","Credential URL","url"],["published","Published","checkbox"],["position","Position","number"],["image_file","Certificate image","file"]
    ],
    competitions: [
      ["name","Competition name","text",true],["organization","Organization","text"],["result","Result","text"],["year","Year / label","text"],
      ["description","Description","textarea"],["published","Published","checkbox"],["position","Position","number"]
    ],
    leadership: [
      ["organization","Organization","text",true],["role","Role","text",true],["period","Period / label","text"],["description","Description","textarea"],
      ["published","Published","checkbox"],["position","Position","number"]
    ],
    projects: [
      ["title","Project title","text",true],["description","Description","textarea"],["url","Project URL","url"],["tags_text","Tags (comma separated)","text"],
      ["published","Published","checkbox"],["position","Position","number"],["image_file","Project image","file"]
    ],
    research: [
      ["title","Research title","text",true],["description","Description","textarea"],["url","Publication URL","url"],["year","Year","text"],
      ["published","Published","checkbox"],["position","Position","number"]
    ],
    skills: [
      ["category","Skill category","text",true],["items_text","Skills (comma separated)","text",true],["published","Published","checkbox"],["position","Position","number"]
    ],
    social_links: [
      ["platform","Platform","text",true],["label","Button label","text"],["url","URL or email","text",true],["published","Published","checkbox"],["position","Position","number"]
    ]
  };

  function toast(text) {
    const el = $("#adminToast"); el.textContent = text; el.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(()=>el.hidden=true, 3500);
  }

  async function isAdmin() {
    const { data, error } = await db.rpc("is_admin");
    if (error) return false;
    return data === true;
  }

  async function authChanged(session) {
    const user = session?.user || null;
    if (!user) {
      state.user = null; $("#loginView").hidden = false; $("#adminView").hidden = true; return;
    }
    state.user = user;
    if (!(await isAdmin())) {
      await db.auth.signOut();
      $("#loginError").textContent = "This account is not authorized as a portfolio admin.";
      return;
    }
    $("#loginView").hidden = true; $("#adminView").hidden = false;
    $("#adminEmail").textContent = user.email || "Admin";
    await refreshAll();
  }

  $("#loginForm").addEventListener("submit", async e => {
    e.preventDefault(); $("#loginError").textContent = "";
    const { error } = await db.auth.signInWithPassword({ email:$("#loginEmail").value.trim(), password:$("#loginPassword").value });
    if (error) $("#loginError").textContent = error.message;
  });

  $("#logoutBtn").addEventListener("click", ()=>db.auth.signOut());
  db.auth.onAuthStateChange((_event, session)=>setTimeout(()=>authChanged(session),0));
  db.auth.getSession().then(({data})=>authChanged(data.session));

  $$("#adminNav button").forEach(btn => btn.addEventListener("click", () => showPanel(btn.dataset.panel)));
  function showPanel(name) {
    $$("#adminNav button").forEach(b=>b.classList.toggle("active", b.dataset.panel===name));
    $$(".panel").forEach(p=>p.classList.toggle("active", p.id===`panel-${name}`));
    $("#panelTitle").textContent = $(`#adminNav button[data-panel="${name}"]`).textContent;
  }

  async function fetchTable(table) {
    const { data, error } = await db.from(table).select("*").order("position",{ascending:true});
    if (error) throw error;
    state.cache[table] = data || [];
    return data || [];
  }

  async function refreshAll() {
    try {
      const tables = ["sections","awards","certificates","competitions","leadership","projects","research","skills","social_links"];
      await Promise.all(tables.map(fetchTable));
      await loadSiteSettings();
      renderAll();
    } catch(err) { console.error(err); toast("Could not load CMS data."); }
  }

  function renderAll() {
    renderStats();
    renderRecords("sections","#sectionsList", x=>x.title, x=>`${x.kind} · ${x.visible?"Visible":"Hidden"}`);
    renderRecords("awards","#awardsList", x=>x.title, x=>`${x.result||""} · ${x.year||""}`, "image_url");
    renderRecords("certificates","#certificatesList", x=>x.title, x=>`${x.category||""} · ${x.year||""}`, "image_url");
    renderRecords("competitions","#competitionsList", x=>x.name, x=>`${x.result||""} · ${x.year||""}`);
    renderRecords("leadership","#leadershipList", x=>x.organization, x=>`${x.role||""} · ${x.period||""}`);
    renderRecords("projects","#projectsList", x=>x.title, x=>(x.tags||[]).join(" · "), "image_url");
    renderRecords("research","#researchList", x=>x.title, x=>x.year||"");
    renderRecords("skills","#skillsList", x=>x.category, x=>(x.items||[]).join(" · "));
    renderRecords("social_links","#socialList", x=>x.label||x.platform, x=>x.url||"");
  }

  function renderStats() {
    const cards = [
      ["Awards", state.cache.awards?.length||0],["Certificates",state.cache.certificates?.length||0],
      ["Projects",state.cache.projects?.length||0],["Sections",state.cache.sections?.length||0]
    ];
    $("#statsGrid").innerHTML = cards.map(([label,n])=>`<div class="stat-card"><strong>${n}</strong><span>${esc(label)}</span></div>`).join("");
  }

  function renderRecords(table, target, titleFn, subtitleFn, imageKey) {
    const rows = state.cache[table] || [];
    const host = $(target);
    if (!rows.length) { host.innerHTML = `<div class="empty">Nothing here yet. Use “Add” to create your first item.</div>`; return; }
    host.innerHTML = rows.map((r,idx)=>`
      <article class="record">
        ${imageKey && r[imageKey] ? `<img class="record-thumb" src="${esc(r[imageKey])}" alt="">` : ""}
        <div class="record-main">
          <h3>${esc(titleFn(r) || "Untitled")}</h3>
          <p>${esc(subtitleFn(r) || "")}</p>
          <div class="record-meta"><span>#${idx+1}</span>${"published" in r?`<span><i class="status-dot ${r.published?"on":""}"></i> ${r.published?"Published":"Draft"}</span>`:""}${"visible" in r?`<span><i class="status-dot ${r.visible?"on":""}"></i> ${r.visible?"Visible":"Hidden"}</span>`:""}</div>
        </div>
        <div class="record-actions">
          <button class="tiny" data-move="up" data-table="${table}" data-id="${r.id}">↑</button>
          <button class="tiny" data-move="down" data-table="${table}" data-id="${r.id}">↓</button>
          <button class="tiny" data-edit="${table}" data-id="${r.id}">Edit</button>
        </div>
      </article>`).join("");

    host.querySelectorAll("[data-edit]").forEach(b=>b.addEventListener("click",()=>openEditor(b.dataset.edit,b.dataset.id)));
    host.querySelectorAll("[data-move]").forEach(b=>b.addEventListener("click",()=>moveRecord(b.dataset.table,b.dataset.id,b.dataset.move)));
  }

  async function moveRecord(table,id,direction) {
    const rows = [...(state.cache[table]||[])];
    const i = rows.findIndex(x=>x.id===id); const j = direction==="up"?i-1:i+1;
    if (i<0 || j<0 || j>=rows.length) return;
    [rows[i],rows[j]]=[rows[j],rows[i]];
    const updates = rows.map((r,index)=>db.from(table).update({position:index+1}).eq("id",r.id));
    const results = await Promise.all(updates);
    if (results.some(x=>x.error)) return toast("Could not reorder.");
    await fetchTable(table); renderAll(); toast("Order updated.");
  }

  $$("[data-add]").forEach(b=>b.addEventListener("click",()=>openEditor(b.dataset.add)));

  const dialog = $("#editorDialog");
  $("#dialogClose").addEventListener("click",()=>dialog.close());
  $("#cancelDialogBtn").addEventListener("click",()=>dialog.close());

  function fieldHtml(def, value, record) {
    const [name,label,type,required,options] = def;
    if (type==="checkbox") return `<label class="checkbox-row"><input name="${name}" type="checkbox" ${value?"checked":""}> ${esc(label)}</label>`;
    if (type==="select") return `<label>${esc(label)}<select name="${name}" ${required?"required":""}>${options.map(o=>`<option value="${esc(o)}" ${value===o?"selected":""}>${esc(o)}</option>`).join("")}</select></label>`;
    if (type==="textarea") return `<label class="full">${esc(label)}<textarea name="${name}" rows="5" ${required?"required":""}>${esc(value||"")}</textarea></label>`;
    if (type==="file") {
      let existing = "";
      const urlKey = name==="image_file"?"image_url":name==="certificate_file"?"certificate_url":name==="custom_image"?(record?.custom_data?.image_url?"custom_preview":""):"";
      const url = urlKey==="custom_preview"?record?.custom_data?.image_url:record?.[urlKey];
      if (url) existing = `<img class="image-preview" src="${esc(url)}" alt="Current upload">`;
      return `<label class="full">${esc(label)}<input name="${name}" type="file" accept="image/*,.pdf">${existing}</label>`;
    }
    return `<label>${esc(label)}<input name="${name}" type="${type}" value="${esc(value ?? "")}" ${required?"required":""}></label>`;
  }

  function normalizeForEditor(table, r={}) {
    const out = {...r};
    if (table==="projects") out.tags_text = (r.tags||[]).join(", ");
    if (table==="skills") out.items_text = (r.items||[]).join(", ");
    if (table==="sections") out.custom_body = r.custom_data?.body || "";
    return out;
  }

  function openEditor(table,id="") {
    const record = id ? (state.cache[table]||[]).find(x=>x.id===id) : {};
    const values = normalizeForEditor(table, record);
    $("#recordTable").value = table; $("#recordId").value = id;
    $("#dialogTitle").textContent = `${id?"Edit":"Add"} ${table.replaceAll("_"," ")}`;
    $("#recordFields").innerHTML = schemas[table].map(def=>fieldHtml(def,values[def[0]],record)).join("");
    $("#deleteRecordBtn").hidden = !id;
    dialog.showModal();
  }

  $("#recordForm").addEventListener("submit", async e => {
    e.preventDefault();
    const table = $("#recordTable").value, id = $("#recordId").value;
    const form = new FormData(e.currentTarget);
    const payload = {};
    for (const def of schemas[table]) {
      const [name,_label,type] = def;
      if (type==="file") continue;
      if (type==="checkbox") payload[name] = e.currentTarget.elements[name].checked;
      else if (type==="number") payload[name] = Number(form.get(name) || 0);
      else payload[name] = (form.get(name) || "").trim();
    }

    if (table==="projects") { payload.tags = payload.tags_text.split(",").map(x=>x.trim()).filter(Boolean); delete payload.tags_text; }
    if (table==="skills") { payload.items = payload.items_text.split(",").map(x=>x.trim()).filter(Boolean); delete payload.items_text; }
    if (table==="sections") {
      const current = id ? (state.cache.sections||[]).find(x=>x.id===id) : {};
      payload.custom_data = {...(current?.custom_data||{}), body:payload.custom_body || ""};
      delete payload.custom_body;
    }

    try {
      const folder = table.replace("_","-");
      for (const def of schemas[table].filter(d=>d[2]==="file")) {
        const name = def[0], file = form.get(name);
        if (!(file instanceof File) || !file.size) continue;
        const uploaded = await uploadFile(file, folder);
        if (name==="image_file") { payload.image_url=uploaded.url; payload.image_path=uploaded.path; }
        if (name==="certificate_file") { payload.certificate_url=uploaded.url; payload.certificate_path=uploaded.path; }
        if (name==="custom_image") payload.custom_data = {...(payload.custom_data||{}), image_url:uploaded.url, image_path:uploaded.path};
      }

      let res;
      if (id) res = await db.from(table).update(payload).eq("id",id);
      else {
        if (!payload.position) payload.position = (state.cache[table]?.length||0)+1;
        res = await db.from(table).insert(payload);
      }
      if (res.error) throw res.error;
      dialog.close(); await fetchTable(table); renderAll(); toast("Saved.");
    } catch(err) { console.error(err); toast(err.message || "Save failed."); }
  });

  $("#deleteRecordBtn").addEventListener("click", async () => {
    const table=$("#recordTable").value,id=$("#recordId").value;
    if (!id || !confirm("Delete this item permanently?")) return;
    const record=(state.cache[table]||[]).find(x=>x.id===id);
    try {
      const paths=[record?.image_path,record?.certificate_path,record?.custom_data?.image_path].filter(Boolean);
      if (paths.length) await db.storage.from("portfolio-media").remove(paths);
      const {error}=await db.from(table).delete().eq("id",id); if(error) throw error;
      dialog.close(); await fetchTable(table); renderAll(); toast("Deleted.");
    } catch(err){console.error(err);toast(err.message||"Delete failed.");}
  });

  async function uploadFile(file, folder) {
    const safe = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}-${safe}`;
    const { error } = await db.storage.from("portfolio-media").upload(path,file,{upsert:false,cacheControl:"3600"});
    if (error) throw error;
    const { data } = db.storage.from("portfolio-media").getPublicUrl(path);
    return { path, url:data.publicUrl };
  }

  async function loadSiteSettings() {
    const {data,error}=await db.from("site_settings").select("*").eq("id",1).maybeSingle();
    if(error) throw error;
    const s=data||{};
    const f=$("#siteForm");
    for(const el of f.elements){
      if(!el.name) continue;
      if(el.name==="hero_stats") el.value=JSON.stringify(s.hero_stats||[],null,2);
      else el.value=s[el.name]??"";
    }
  }

  $("#siteForm").addEventListener("submit",async e=>{
    e.preventDefault();
    const form=new FormData(e.currentTarget),payload={id:1};
    for(const [k,v] of form.entries()) payload[k]=String(v).trim();
    try{payload.hero_stats=JSON.parse(payload.hero_stats||"[]");}
    catch{return toast("Hero stat cards must be valid JSON.");}
    const {error}=await db.from("site_settings").upsert(payload,{onConflict:"id"});
    if(error) return toast(error.message);
    toast("Site settings saved.");
  });
})();
