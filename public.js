(() => {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const message = document.getElementById("siteMessage");

  if (!cfg.supabaseUrl || cfg.supabaseUrl.includes("PASTE_") || !cfg.supabaseAnonKey || cfg.supabaseAnonKey.includes("PASTE_")) {
    showMessage("Connect Supabase in config.js to load CMS content.");
    return;
  }

  const db = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);

  const $ = (s, root=document) => root.querySelector(s);
  const esc = (v="") => String(v ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const nl = (v="") => esc(v).replace(/\n/g, "<br>");
  const sectionHost = $("#dynamicSections");

  function showMessage(text) {
    message.textContent = text;
    message.hidden = false;
    clearTimeout(showMessage.t);
    showMessage.t = setTimeout(() => message.hidden = true, 5000);
  }

  function openLightbox(url) {
    if (!url) return;
    $("#lightboxImage").src = url;
    $("#lightbox").classList.add("active");
    $("#lightbox").setAttribute("aria-hidden","false");
  }

  $("#lightboxClose").addEventListener("click", closeLightbox);
  $("#lightbox").addEventListener("click", e => { if (e.target.id === "lightbox") closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });
  function closeLightbox() {
    $("#lightbox").classList.remove("active");
    $("#lightbox").setAttribute("aria-hidden","true");
  }

  async function get(table, order="position") {
    let q = db.from(table).select("*");
    if (["awards","certificates","competitions","leadership","projects","research","skills","social_links"].includes(table)) q = q.eq("published", true);
    q = q.order(order, { ascending:true });
    const { data, error } = await q;
    if (error) throw error;
    return data || [];
  }

  function sectionShell(section, body) {
    const el = document.createElement("section");
    el.id = section.slug;
    el.className = "portfolio-section";
    el.innerHTML = `
      <div class="container">
        <div class="section-head">
          <div><div class="eyebrow">${esc(section.eyebrow || "")}</div><h2>${nl(section.title || "")}</h2></div>
          <p>${nl(section.subtitle || "")}</p>
        </div>
        ${body}
      </div>`;
    return el;
  }

  function renderHonours(section, awards) {
    const top = awards.filter(a => a.featured).slice(0,4);
    const chosen = top.length ? top : awards.slice(0,4);
    const body = chosen.length ? `<div class="honour-grid">${chosen.map((a,i)=>`
      <article class="honour ${i===1?'featured':i===3?'dark':''}">
        <div class="honour-index">${esc(a.year || a.category || "HONOUR")}</div>
        <div class="honour-symbol">${esc(a.symbol || (a.result || "✦").slice(0,3))}</div>
        <h3>${esc(a.result || a.title)}</h3>
        <p>${esc(a.title)}${a.organization ? " · "+esc(a.organization):""}</p>
      </article>`).join("")}</div>` : `<div class="empty-state">Add featured awards from Admin.</div>`;
    return sectionShell(section, body);
  }

  function renderAwards(section, awards) {
    const body = awards.length ? `<div class="gallery">${awards.map(a=>`
      <article class="media-card ${a.featured?'featured':''}" data-preview="${esc(a.image_url || a.certificate_url || "")}">
        <div class="media-image">${a.image_url?`<img src="${esc(a.image_url)}" alt="${esc(a.title)}">`:`<span>Upload award image</span>`}</div>
        <div class="media-content">
          <span class="pill">${esc(a.result || a.category || "AWARD")}</span>
          <h3>${esc(a.title)}</h3>
          <p>${esc(a.organization || "")}${a.year ? " · "+esc(a.year):""}</p>
        </div>
      </article>`).join("")}</div>` : `<div class="empty-state">No awards published yet.</div>`;
    const el = sectionShell(section, body);
    el.querySelectorAll("[data-preview]").forEach(c => c.addEventListener("click", () => openLightbox(c.dataset.preview)));
    return el;
  }

  function renderCertificates(section, certs) {
    const cats = [...new Set(certs.flatMap(c => (c.category || "").split(",").map(x=>x.trim()).filter(Boolean)))];
    const filters = `<div class="filter-row"><button class="filter-btn active" data-cat="all">All</button>${cats.map(c=>`<button class="filter-btn" data-cat="${esc(c.toLowerCase())}">${esc(c)}</button>`).join("")}</div>`;
    const cards = certs.length ? `<div class="cert-grid">${certs.map(c=>`
      <article class="cert-card" data-category="${esc((c.category||"").toLowerCase())}" data-preview="${esc(c.image_url || c.credential_url || "")}">
        <div class="cert-img">${c.image_url?`<img src="${esc(c.image_url)}" alt="${esc(c.title)}">`:`<span>Certificate image</span>`}</div>
        <div class="cert-info"><small>${esc(c.category || "Credential")}</small><h3>${esc(c.title)}</h3><p>${esc(c.organization || "")}${c.year ? " · "+esc(c.year):""}</p></div>
      </article>`).join("")}</div>` : `<div class="empty-state">No certificates published yet.</div>`;
    const el = sectionShell(section, filters + cards);
    el.querySelectorAll(".filter-btn").forEach(btn => btn.addEventListener("click", () => {
      el.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.cat;
      el.querySelectorAll(".cert-card").forEach(card => card.style.display = cat === "all" || card.dataset.category.includes(cat) ? "" : "none");
    }));
    el.querySelectorAll("[data-preview]").forEach(c => c.addEventListener("click", () => openLightbox(c.dataset.preview)));
    return el;
  }

  function renderRows(section, items, type) {
    const body = items.length ? `<div class="rows">${items.map(item=>`
      <article class="row-item">
        <small>${esc(item.year || item.period || "")}</small>
        <div><h3>${esc(item.name || item.title || item.organization || "")}</h3>
          <p>${esc(item.description || item.organization || item.role || "")}</p></div>
        <span class="result-pill">${esc(item.result || item.role || item.category || "")}</span>
      </article>`).join("")}</div>` : `<div class="empty-state">No ${esc(type)} published yet.</div>`;
    return sectionShell(section, body);
  }

  function renderLeadership(section, items) {
    const body = items.length ? `<div class="leadership-layout">
      <aside class="sticky-title"><div class="eyebrow">${esc(section.eyebrow||"")}</div><h2>${nl(section.title||"")}</h2></aside>
      <div class="timeline">${items.map(item=>`
        <article class="timeline-row"><small>${esc(item.period || "")}</small><div><h3>${esc(item.organization)}</h3><div class="timeline-role">${esc(item.role)}</div><p>${esc(item.description || "")}</p></div></article>`).join("")}</div>
    </div>` : `<div class="empty-state">No leadership entries published yet.</div>`;
    const el = document.createElement("section"); el.id=section.slug; el.className="portfolio-section"; el.innerHTML=`<div class="container">${body}</div>`; return el;
  }

  function renderProjects(section, items) {
    const body = items.length ? `<div class="project-grid">${items.map((p,i)=>`
      <article class="project-card">
        ${p.image_url?`<img src="${esc(p.image_url)}" alt="${esc(p.title)}">`:""}
        <div class="project-label">PROJECT / ${String(i+1).padStart(2,"0")}</div>
        <h3>${esc(p.title)}</h3><p>${esc(p.description || "")}</p>
        <div class="tags">${(p.tags||[]).map(t=>`<span>${esc(t)}</span>`).join("")}</div>
        ${p.url?`<a class="button button-light" style="margin-top:18px;width:max-content" href="${esc(p.url)}" target="_blank" rel="noreferrer">View project ↗</a>`:""}
      </article>`).join("")}</div>` : `<div class="empty-state">No projects published yet.</div>`;
    return sectionShell(section, body);
  }

  function renderResearch(section, items) {
    const body = items.length ? `<div class="research-grid">${items.map(r=>`
      <article class="research-card"><div><small>${esc(r.year || "RESEARCH")}</small></div><div><h3>${esc(r.title)}</h3><p>${esc(r.description || "")}</p>${r.url?`<a href="${esc(r.url)}" target="_blank" rel="noreferrer">View publication ↗</a>`:""}</div></article>`).join("")}</div>` : `<div class="empty-state">No research published yet.</div>`;
    return sectionShell(section, body);
  }

  function renderSkills(section, items) {
    const body = items.length ? `<div class="skill-list">${items.map(s=>`<div class="skill-row"><strong>${esc(s.category)}</strong><span>${esc((s.items||[]).join(" · "))}</span></div>`).join("")}</div>` : `<div class="empty-state">No skills published yet.</div>`;
    return sectionShell(section, body);
  }

  function renderCustom(section) {
    const d = section.custom_data || {};
    const body = `<div class="custom-card"><p>${nl(d.body || "Add text from Admin → Sections.")}</p>${d.image_url?`<img src="${esc(d.image_url)}" alt="${esc(section.title)}">`:""}</div>`;
    return sectionShell(section, body);
  }

  async function init() {
    try {
      const [{data:settings,error:settingsError}, {data:sections,error:sectionsError}] = await Promise.all([
        db.from("site_settings").select("*").eq("id",1).maybeSingle(),
        db.from("sections").select("*").eq("visible",true).order("position")
      ]);
      if (settingsError) throw settingsError;
      if (sectionsError) throw sectionsError;

      const s = settings || {};
      $("#navName").textContent = s.name || "Nafis Tamim";
      $("#heroStatus").textContent = s.hero_status || "Academic Portfolio · 2026";
      $("#heroTitle").innerHTML = `${esc(s.hero_line_1||"Learn.")}<br>${esc(s.hero_line_2||"Compete.")}<br><em>${esc(s.hero_line_3||"Build.")}</em>`;
      $("#heroDescription").textContent = s.hero_description || "Science student exploring engineering, STEM, leadership and global opportunities.";
      $("#identityLabel").textContent = s.identity_label || "Student Profile / Bangladesh";
      $("#identityName").innerHTML = esc(s.name||"Nafis Tamim").replace(/\s+/, "<br>");
      $("#identityRole").textContent = s.identity_role || "STEM · Engineering · Leadership · Global Engagement";
      $("#contactHeading").textContent = s.contact_heading || "Always open to the next challenge.";
      $("#footerLeft").textContent = s.footer_left || `© ${new Date().getFullYear()} ${s.name||"Nafis Tamim"}`;
      $("#footerRight").textContent = s.footer_right || "Academic · STEM · Engineering · Leadership";
      if (s.cv_url) $("#cvLink").href = s.cv_url; else $("#cvLink").style.display = "none";

      const stats = Array.isArray(s.hero_stats) ? s.hero_stats : [];
      $("#identityStats").innerHTML = stats.map(x=>`<div class="identity-stat"><span>${esc(x.label)}</span><strong>${esc(x.value)}</strong></div>`).join("");

      const [awards,certs,competitions,leadership,projects,research,skills,socials] = await Promise.all([
        get("awards"), get("certificates"), get("competitions"), get("leadership"), get("projects"), get("research"), get("skills"), get("social_links")
      ]);

      $("#contactLinks").innerHTML = socials.map(l=>{
        const href = l.platform.toLowerCase()==="email" && !String(l.url).startsWith("mailto:") ? `mailto:${l.url}` : l.url;
        return `<a class="contact-link" href="${esc(href)}" ${href.startsWith("http")?'target="_blank" rel="noreferrer"':''}>${esc(l.label || l.platform)} ↗</a>`;
      }).join("");

      const navLinks = [];
      for (const section of (sections || [])) {
        navLinks.push(`<a href="#${esc(section.slug)}">${esc(section.nav_label || section.title || section.slug)}</a>`);
        let el;
        switch(section.kind) {
          case "honours": el = renderHonours(section, awards); break;
          case "awards": el = renderAwards(section, awards); break;
          case "certificates": el = renderCertificates(section, certs); break;
          case "competitions": el = renderRows(section, competitions, "competitions"); break;
          case "leadership": el = renderLeadership(section, leadership); break;
          case "projects": el = renderProjects(section, projects); break;
          case "research": el = renderResearch(section, research); break;
          case "skills": el = renderSkills(section, skills); break;
          default: el = renderCustom(section);
        }
        sectionHost.appendChild(el);
      }
      $("#navLinks").innerHTML = navLinks.slice(0,6).join("");
      if ((sections||[])[0]) $("#primaryCta").href = `#${sections[0].slug}`;
    } catch (err) {
      console.error(err);
      showMessage("Could not load portfolio content. Check Supabase config and schema.");
    }
  }

  init();
})();
