import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const demoProfile = {
  name: 'Nafis Tamim',
  eyebrow: 'STUDENT · BUILDER · DESIGNER',
  headline: 'Learning seriously. Building visibly.',
  intro: 'A student portfolio documenting academics, competitions, creative work and the things I build along the way.',
  location: 'Bangladesh',
  email: 'your-email@example.com',
  availability: 'Open to competitions, collaborations & learning opportunities',
  focus: 'Academic growth · Technology · Design',
  footer_note: 'Built as a living academic archive — not a static CV.'
};

const demoEntries = [
  { id: 1, type: 'education', title: 'Current Education', subtitle: 'Add your school / institution', description: 'Replace this placeholder from the admin dashboard with your current class, institution and academic details.', date_label: '2026', tags: ['Academics'], featured: 1, sort_order: 1 },
  { id: 2, type: 'project', title: 'Featured Project', subtitle: 'Your strongest project goes here', description: 'Show the problem, what you built, your role, tools used and the result. Keep it outcome-focused.', date_label: '2026', tags: ['Build','Featured'], featured: 1, sort_order: 1 },
  { id: 3, type: 'achievement', title: 'Competition / Award', subtitle: 'Add your best achievement', description: 'Use this space for olympiads, competitions, medals, rankings, ambassador roles or major recognition.', date_label: '2026', tags: ['Achievement'], featured: 1, sort_order: 1 },
  { id: 4, type: 'certificate', title: 'Academic Certificate', subtitle: 'Upload certificate PDF or image', description: 'Certificates can be uploaded from /admin and served from Cloudflare R2.', date_label: '2026', tags: ['Certificate'], featured: 0, sort_order: 1 },
  { id: 5, type: 'activity', title: 'Leadership & Activities', subtitle: 'Clubs · Ambassador · Volunteering', description: 'Document meaningful activities and what you actually contributed.', date_label: '2026', tags: ['Leadership'], featured: 0, sort_order: 1 },
  { id: 6, type: 'skill', title: 'Design', subtitle: 'Visual communication', description: 'Graphic design, presentation design and visual problem solving.', date_label: '', tags: ['Creative'], featured: 0, sort_order: 1 },
  { id: 7, type: 'skill', title: 'Technology', subtitle: 'Web & digital tools', description: 'Add the tools and technologies you genuinely use.', date_label: '', tags: ['Technical'], featured: 0, sort_order: 2 }
];

function normalizeEntry(entry) {
  return {
    ...entry,
    tags: Array.isArray(entry.tags) ? entry.tags : safeJson(entry.tags, []),
    featured: Number(entry.featured || 0),
    sort_order: Number(entry.sort_order || 0)
  };
}

function safeJson(value, fallback) {
  try { return JSON.parse(value); } catch { return fallback; }
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: options.body instanceof FormData ? options.headers : { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const type = res.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await res.json() : await res.text();
  if (!res.ok) throw new Error(data?.error || data || 'Request failed');
  return data;
}

function App() {
  const isAdmin = window.location.pathname.replace(/\/$/, '') === '/admin';
  return isAdmin ? <AdminApp /> : <Portfolio />;
}

function Portfolio() {
  const [profile, setProfile] = useState(demoProfile);
  const [entries, setEntries] = useState(demoEntries);
  const [menu, setMenu] = useState(false);
  const [filter, setFilter] = useState('all');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api('/api/content')
      .then((data) => {
        if (data?.profile && Object.keys(data.profile).length) setProfile({ ...demoProfile, ...data.profile });
        if (Array.isArray(data?.entries) && data.entries.length) setEntries(data.entries.map(normalizeEntry));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const byType = useMemo(() => {
    const map = {};
    entries.forEach((e) => (map[e.type] ||= []).push(e));
    Object.values(map).forEach((arr) => arr.sort((a,b) => a.sort_order - b.sort_order || b.id - a.id));
    return map;
  }, [entries]);

  const featured = entries.filter((e) => e.featured).slice(0, 4);
  const archiveTypes = ['achievement','certificate','project','activity','education','result'];
  const archive = entries.filter((e) => filter === 'all' ? archiveTypes.includes(e.type) : e.type === filter);
  const proof = [
    ['Projects', byType.project?.length || 0],
    ['Achievements', byType.achievement?.length || 0],
    ['Certificates', byType.certificate?.length || 0],
    ['Activities', byType.activity?.length || 0],
  ];
  const firstName = profile.name.split(' ')[0] || 'Nafis';
  const lastName = profile.name.split(' ').slice(1).join(' ') || 'Tamim';

  return <div className={`site site-v2 ${loaded ? 'loaded' : ''}`}>
    <div className="noise" />
    <header className="nav-shell nav-v2">
      <a className="brand brand-v2" href="#top" aria-label="Nafis Tamim home"><span>NAFIS</span><b>/</b>TAMIM</a>
      <nav className={menu ? 'nav-links open' : 'nav-links'}>
        <a href="#profile" onClick={() => setMenu(false)}>Profile</a>
        <a href="#work" onClick={() => setMenu(false)}>Work</a>
        <a href="#academics" onClick={() => setMenu(false)}>Academics</a>
        <a href="#archive" onClick={() => setMenu(false)}>Archive</a>
      </nav>
      <a className="nav-cta" href="#contact">Let’s talk ↗</a>
      <button className="menu-btn" onClick={() => setMenu(v => !v)} aria-label="Toggle navigation">{menu ? '×' : '≡'}</button>
    </header>

    <main>
      <section id="top" className="hero-v2 section-pad">
        <div className="hero-ambient hero-ambient-a" />
        <div className="hero-ambient hero-ambient-b" />
        <div className="hero-topline reveal">
          <span>ACADEMIC PORTFOLIO / 2026</span>
          <span>{profile.location} · GMT+6</span>
        </div>
        <div className="hero-v2-grid">
          <div className="hero-v2-copy reveal">
            <p className="hero-person"><i /> {firstName} {lastName}</p>
            <h1>Building beyond<br/><em>the syllabus.</em></h1>
            <p className="hero-v2-intro">{profile.intro}</p>
            <div className="hero-actions">
              <a href="#work" className="button-primary">Explore selected work <span>↓</span></a>
              <a href="#archive" className="text-link">Open academic archive ↗</a>
            </div>
          </div>
          <aside className="hero-console reveal delay-1">
            <div className="console-head"><span>NOW / 2026</span><i /></div>
            <div className="console-main">
              <small>CURRENT FOCUS</small>
              <strong>{profile.focus}</strong>
            </div>
            <div className="console-row"><span>STATUS</span><b>{profile.availability}</b></div>
            <div className="console-row"><span>BASE</span><b>{profile.location}</b></div>
            <div className="console-mark">NT</div>
          </aside>
        </div>
        <div className="proof-bar reveal delay-2">
          <div className="proof-intro"><span>THE RECEIPTS</span><strong>Work, not just words.</strong></div>
          {proof.map(([label, value]) => <div className="proof-stat" key={label}><strong>{String(value).padStart(2,'0')}</strong><span>{label}</span></div>)}
        </div>
      </section>

      <section id="profile" className="section section-pad profile-v2">
        <SectionLabel index="01" title="Profile" />
        <div className="profile-v2-grid">
          <div className="profile-quote reveal">School gives me a curriculum.<br/><span>Curiosity gives me direction.</span></div>
          <div className="profile-copy reveal delay-1">
            <p>{profile.intro}</p>
            <div className="profile-facts">
              <div><span>01 / DIRECTION</span><strong>{profile.focus}</strong></div>
              <div><span>02 / OPEN TO</span><strong>{profile.availability}</strong></div>
            </div>
          </div>
        </div>
        <div className="manifesto-strip"><span>LEARN DEEPLY</span><i>✦</i><span>BUILD VISIBLY</span><i>✦</i><span>DOCUMENT CLEARLY</span><i>✦</i><span>KEEP MOVING</span></div>
      </section>

      <section id="work" className="section section-pad work-v2">
        <div className="work-head">
          <SectionLabel index="02" title="Selected work" dark />
          <p>Projects, competitions and proof of initiative—selected for signal, not volume.</p>
        </div>
        <div className="featured-v2-grid">
          {(featured.length ? featured : demoEntries.filter(e => e.featured)).map((item, i) => <FeatureCard item={item} key={item.id || i} index={i} />)}
        </div>
      </section>

      <section id="academics" className="section section-pad academics-v2">
        <SectionLabel index="03" title="Academic record" />
        <div className="academics-v2-head">
          <h2>Evidence over<br/><span>labels.</span></h2>
          <p>Education, results and milestones organized as a timeline—not a wall of badges.</p>
        </div>
        <div className="timeline timeline-v2">
          {[...(byType.education || []), ...(byType.result || [])].map((item, i) => <TimelineItem item={item} key={item.id || i} />)}
          {!(byType.education?.length || byType.result?.length) && <TimelineItem item={demoEntries[0]} />}
        </div>
      </section>

      <section className="section section-pad capabilities-v2">
        <SectionLabel index="04" title="Capabilities" dark />
        <div className="capability-title"><span>What I’m getting</span><strong>dangerously good at.</strong></div>
        <div className="skills-wrap skills-v2">
          {(byType.skill?.length ? byType.skill : demoEntries.filter(e => e.type === 'skill')).map((item, i) => (
            <article className="skill-row reveal" key={item.id || i}>
              <span className="skill-num">0{i + 1}</span>
              <div><h3>{item.title}</h3><p>{item.subtitle}</p></div>
              <p className="skill-desc">{item.description}</p>
              <span className="skill-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section id="archive" className="section section-pad archive-v2">
        <SectionLabel index="05" title="Academic archive" />
        <div className="archive-head archive-v2-head">
          <div><span className="archive-kicker">FULL INDEX</span><h2>Everything worth<br/>keeping.</h2></div>
          <div className="filter-bar">
            {['all','achievement','certificate','project','activity'].map(f => <button key={f} className={filter===f?'active':''} onClick={() => setFilter(f)}>{f}</button>)}
          </div>
        </div>
        <div className="archive-list">
          {archive.length ? archive.map((item, i) => <ArchiveRow item={item} index={i} key={item.id || i} />) : <div className="empty">No entries in this category yet.</div>}
        </div>
      </section>

      <section id="contact" className="contact-v2 section-pad">
        <div className="contact-v2-top"><span>06 / NEXT CHAPTER</span><span>{profile.location} · 2026</span></div>
        <div className="contact-v2-main">
          <p>Have a competition, project or learning opportunity?</p>
          <h2>Let’s make<br/><em>something count.</em></h2>
          <a href={`mailto:${profile.email}`}>{profile.email}<span>↗</span></a>
        </div>
        <div className="contact-v2-bottom"><p>{profile.footer_note}</p><span>© {new Date().getFullYear()} Nafis Tamim</span></div>
      </section>
    </main>
  </div>;
}

function SectionLabel({ index, title, dark }) {
  return <div className={`section-label ${dark ? 'light' : ''}`}><span>{index}</span><div /> <strong>{title}</strong></div>;
}

function FeatureCard({ item, index }) {
  const media = item.media_key ? `/api/media/${encodeURIComponent(item.media_key)}` : '';
  return <article className={`feature-card-v2 feature-v2-${index % 4} reveal`}>
    <div className="feature-visual">
      {media ? <img src={media} alt="" /> : <div className="abstract-visual"><span>{String(index+1).padStart(2,'0')}</span><i/><b>{item.type}</b></div>}
      <div className="feature-badge">{item.date_label || 'ONGOING'}</div>
    </div>
    <div className="feature-content">
      <div className="feature-meta"><span>{String(index+1).padStart(2,'0')} / {item.type}</span><div>{item.tags?.slice(0,2).map(t => <b key={t}>{t}</b>)}</div></div>
      <h3>{item.title}</h3>
      <strong>{item.subtitle}</strong>
      <p>{item.description}</p>
      <div className="feature-foot">{item.link ? <a href={item.link} target="_blank" rel="noreferrer">Open project ↗</a> : <span>Selected evidence</span>}<i>↗</i></div>
    </div>
  </article>;
}

function TimelineItem({ item }) {
  return <article className="timeline-item reveal">
    <div className="timeline-dot" />
    <div className="timeline-date">{item.date_label || 'Now'}</div>
    <div><h3>{item.title}</h3><strong>{item.subtitle}</strong><p>{item.description}</p></div>
  </article>;
}

function ArchiveRow({ item, index }) {
  const media = item.media_key ? `/api/media/${encodeURIComponent(item.media_key)}` : '';
  return <article className="archive-row reveal">
    <span className="archive-index">{String(index + 1).padStart(2, '0')}</span>
    <div><span className="archive-type">{item.type}</span><h3>{item.title}</h3><p>{item.subtitle || item.description}</p></div>
    <div className="archive-tags">{item.tags?.slice(0,2).map(t => <span key={t}>{t}</span>)}</div>
    <div className="archive-end"><span>{item.date_label}</span>{media ? <a href={media} target="_blank" rel="noreferrer">Open ↗</a> : item.link ? <a href={item.link} target="_blank" rel="noreferrer">Open ↗</a> : <span>—</span>}</div>
  </article>;
}

function AdminApp() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  useEffect(() => { api('/api/admin/session').then(() => setSession(true)).catch(() => setSession(false)).finally(() => setChecking(false)); }, []);
  if (checking) return <AdminShell><div className="admin-loading">Checking session…</div></AdminShell>;
  return <AdminShell>{session ? <Dashboard onLogout={() => setSession(false)} /> : <Login onLogin={() => setSession(true)} />}</AdminShell>;
}

function AdminShell({ children }) {
  return <div className="admin-root"><div className="admin-brand"><a href="/">NT<span>.</span></a><small>CONTROL ROOM</small></div>{children}</div>;
}

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try { await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password }) }); onLogin(); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="login-panel">
    <div><span className="admin-kicker">PRIVATE ACCESS</span><h1>Portfolio<br/>admin.</h1><p>Manage your academic archive without touching the code.</p></div>
    <form onSubmit={submit} className="login-form">
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••••" autoFocus /></label>
      {error && <div className="error-box">{error}</div>}
      <button disabled={busy}>{busy ? 'Signing in…' : 'Enter dashboard →'}</button>
    </form>
  </div>;
}

function Dashboard({ onLogout }) {
  const [data, setData] = useState({ profile: {}, entries: [] });
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const refresh = () => api('/api/content').then(d => setData({ profile: d.profile || {}, entries: (d.entries || []).map(normalizeEntry) })).catch(e => setNotice(e.message));
  useEffect(refresh, []);
  const counts = useMemo(() => data.entries.reduce((m,e)=>(m[e.type]=(m[e.type]||0)+1,m),{}), [data.entries]);
  async function logout(){ await api('/api/admin/logout',{method:'POST'}).catch(()=>{}); onLogout(); }
  async function remove(id){ if(!confirm('Delete this entry?')) return; try{ await api(`/api/admin/entry/${id}`,{method:'DELETE'}); setNotice('Entry deleted.'); refresh(); }catch(e){setNotice(e.message)} }

  return <div className="dashboard">
    <aside className="admin-sidebar">
      <div className="side-title">NAFIS TAMIM<br/><span>Academic OS</span></div>
      <div className="side-nav">
        {['overview','entries','profile'].map(x => <button className={tab===x?'active':''} onClick={()=>{setTab(x);setEditing(null)}} key={x}>{x}</button>)}
        <a href="/" target="_blank">view site ↗</a>
      </div>
      <button className="logout" onClick={logout}>Log out</button>
    </aside>
    <div className="admin-main">
      <div className="admin-top"><div><span>DASHBOARD / {tab.toUpperCase()}</span><h2>{tab === 'overview' ? 'Your academic system.' : tab === 'entries' ? 'Content archive.' : 'Profile settings.'}</h2></div><button className="primary-small" onClick={()=>{setTab('entries');setEditing({type:'project'})}}>+ New entry</button></div>
      {notice && <div className="notice" onClick={()=>setNotice('')}>{notice} <span>×</span></div>}
      {tab==='overview' && <Overview counts={counts} entries={data.entries} />}
      {tab==='entries' && <Entries entries={data.entries} onEdit={setEditing} onDelete={remove} onNew={()=>setEditing({type:'project'})} />}
      {tab==='profile' && <ProfileEditor profile={{...demoProfile,...data.profile}} onSaved={()=>{setNotice('Profile updated.');refresh()}} />}
      {editing && <EntryEditor entry={editing} onClose={()=>setEditing(null)} onSaved={()=>{setEditing(null);setNotice('Entry saved.');refresh()}} />}
    </div>
  </div>;
}

function Overview({ counts, entries }) {
  return <>
    <div className="stat-grid">
      <Stat label="Total entries" value={entries.length} /><Stat label="Projects" value={counts.project||0}/><Stat label="Achievements" value={counts.achievement||0}/><Stat label="Certificates" value={counts.certificate||0}/>
    </div>
    <div className="admin-card"><div className="admin-card-head"><h3>Recent content</h3><span>Live from D1</span></div><div className="compact-list">{entries.slice(0,6).map(e=><div key={e.id}><span>{e.type}</span><strong>{e.title}</strong><small>{e.date_label||'—'}</small></div>)}</div></div>
  </>;
}
function Stat({label,value}){return <div className="stat"><span>{label}</span><strong>{value}</strong></div>}

function Entries({ entries, onEdit, onDelete, onNew }) {
  const [q,setQ]=useState(''); const [type,setType]=useState('all');
  const filtered=entries.filter(e=>(type==='all'||e.type===type)&&`${e.title} ${e.subtitle}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="admin-card">
    <div className="toolbar"><input placeholder="Search entries…" value={q} onChange={e=>setQ(e.target.value)}/><select value={type} onChange={e=>setType(e.target.value)}><option value="all">All types</option>{['education','result','project','achievement','certificate','activity','skill','gallery'].map(t=><option key={t}>{t}</option>)}</select><button onClick={onNew}>+ Add</button></div>
    <div className="entry-table">{filtered.map(e=><div className="entry-tr" key={e.id}><span className="pill">{e.type}</span><div><strong>{e.title}</strong><small>{e.subtitle}</small></div><span>{e.date_label||'—'}</span><span>{e.featured?'Featured':'Standard'}</span><div><button onClick={()=>onEdit(e)}>Edit</button><button className="danger" onClick={()=>onDelete(e.id)}>Delete</button></div></div>)}</div>
  </div>;
}

function ProfileEditor({ profile, onSaved }) {
  const [form,setForm]=useState(profile); const [busy,setBusy]=useState(false); const fields=['name','eyebrow','headline','intro','location','email','availability','focus','footer_note'];
  async function save(e){e.preventDefault();setBusy(true);try{await api('/api/admin/profile',{method:'PUT',body:JSON.stringify(form)});onSaved()}finally{setBusy(false)}}
  return <form className="admin-card form-grid" onSubmit={save}>{fields.map(k=><label className={['intro','availability','footer_note'].includes(k)?'wide':''} key={k}><span>{k.replaceAll('_',' ')}</span>{['intro','availability','footer_note'].includes(k)?<textarea rows="4" value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/>:<input value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})}/>}</label>)}<button className="save-btn" disabled={busy}>{busy?'Saving…':'Save profile'}</button></form>
}

function EntryEditor({ entry, onClose, onSaved }) {
  const blank={type:'project',title:'',subtitle:'',description:'',date_label:'',tags:[],link:'',media_key:'',featured:0,sort_order:0};
  const [form,setForm]=useState({...blank,...entry,tags:Array.isArray(entry.tags)?entry.tags:[]}); const [tagText,setTagText]=useState((form.tags||[]).join(', ')); const [file,setFile]=useState(null); const [busy,setBusy]=useState(false); const [error,setError]=useState('');
  async function submit(e){e.preventDefault();setBusy(true);setError('');try{let mediaKey=form.media_key||'';if(file){const fd=new FormData();fd.append('file',file);const up=await api('/api/admin/upload',{method:'POST',body:fd});mediaKey=up.key;}const payload={...form,media_key:mediaKey,tags:tagText.split(',').map(s=>s.trim()).filter(Boolean),featured:form.featured?1:0,sort_order:Number(form.sort_order||0)};await api(form.id?`/api/admin/entry/${form.id}`:'/api/admin/entry',{method:form.id?'PUT':'POST',body:JSON.stringify(payload)});onSaved()}catch(err){setError(err.message)}finally{setBusy(false)}}
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><form className="editor-modal" onSubmit={submit}><div className="modal-head"><div><span>{form.id?'EDIT ENTRY':'NEW ENTRY'}</span><h3>{form.title||'Untitled item'}</h3></div><button type="button" onClick={onClose}>×</button></div><div className="form-grid"><label><span>Type</span><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>{['education','result','project','achievement','certificate','activity','skill','gallery'].map(t=><option key={t}>{t}</option>)}</select></label><label><span>Date label</span><input value={form.date_label||''} onChange={e=>setForm({...form,date_label:e.target.value})} placeholder="2026 / Ongoing"/></label><label className="wide"><span>Title</span><input required value={form.title||''} onChange={e=>setForm({...form,title:e.target.value})}/></label><label className="wide"><span>Subtitle</span><input value={form.subtitle||''} onChange={e=>setForm({...form,subtitle:e.target.value})}/></label><label className="wide"><span>Description</span><textarea rows="5" value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})}/></label><label className="wide"><span>Tags (comma separated)</span><input value={tagText} onChange={e=>setTagText(e.target.value)} placeholder="Academic, Design, Winner"/></label><label><span>External link</span><input value={form.link||''} onChange={e=>setForm({...form,link:e.target.value})} placeholder="https://…"/></label><label><span>Sort order</span><input type="number" value={form.sort_order||0} onChange={e=>setForm({...form,sort_order:e.target.value})}/></label><label className="wide file-field"><span>Image / PDF</span><input type="file" accept="image/*,.pdf" onChange={e=>setFile(e.target.files?.[0]||null)}/><small>{form.media_key ? `Current: ${form.media_key}` : 'Stored in Cloudflare R2 after upload.'}</small></label><label className="check"><input type="checkbox" checked={!!form.featured} onChange={e=>setForm({...form,featured:e.target.checked?1:0})}/><span>Feature this on homepage</span></label></div>{error&&<div className="error-box">{error}</div>}<div className="modal-actions"><button type="button" onClick={onClose}>Cancel</button><button className="save-btn" disabled={busy}>{busy?'Saving…':'Save entry'}</button></div></form></div>
}

createRoot(document.getElementById('root')).render(<App />);
