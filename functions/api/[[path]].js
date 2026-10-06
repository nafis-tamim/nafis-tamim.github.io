const ENTRY_TYPES = new Set(['education','result','project','achievement','certificate','activity','skill','gallery']);
const PROFILE_KEYS = new Set(['name','eyebrow','headline','intro','location','email','availability','focus','footer_note']);

export async function onRequest(context) {
  try {
    const parts = Array.isArray(context.params.path) ? context.params.path : [context.params.path].filter(Boolean);
    const method = context.request.method.toUpperCase();

    if (method === 'GET' && parts[0] === 'content') return getContent(context.env);
    if (method === 'GET' && parts[0] === 'media') return getMedia(context.env, parts.slice(1));

    if (parts[0] === 'admin') {
      if (!sameOrigin(context.request)) return json({ error: 'Cross-origin request blocked.' }, 403);

      if (method === 'POST' && parts[1] === 'login') return login(context.request, context.env);
      if (method === 'POST' && parts[1] === 'logout') return logout();

      const session = await verifySession(context.request, context.env);
      if (!session) return json({ error: 'Unauthorized' }, 401);

      if (method === 'GET' && parts[1] === 'session') return json({ ok: true });
      if (method === 'PUT' && parts[1] === 'profile') return updateProfile(context.request, context.env);
      if (method === 'POST' && parts[1] === 'entry' && !parts[2]) return createEntry(context.request, context.env);
      if (method === 'PUT' && parts[1] === 'entry' && parts[2]) return updateEntry(context.request, context.env, parts[2]);
      if (method === 'DELETE' && parts[1] === 'entry' && parts[2]) return deleteEntry(context.env, parts[2]);
      if (method === 'POST' && parts[1] === 'upload') return uploadMedia(context.request, context.env);
    }

    return json({ error: 'Not found' }, 404);
  } catch (error) {
    console.error(error);
    return json({ error: 'Server error', detail: error?.message || 'Unknown error' }, 500);
  }
}

async function getContent(env) {
  const [profileResult, entriesResult] = await Promise.all([
    env.DB.prepare('SELECT key, value FROM profile').all(),
    env.DB.prepare('SELECT * FROM entries ORDER BY sort_order ASC, id DESC').all()
  ]);
  const profile = Object.fromEntries((profileResult.results || []).map(row => [row.key, row.value]));
  const entries = (entriesResult.results || []).map(row => ({ ...row, tags: parseTags(row.tags) }));
  return json({ profile, entries }, 200, { 'Cache-Control': 'public, max-age=30' });
}

async function getMedia(env, keyParts) {
  const encoded = keyParts.join('/');
  if (!encoded) return json({ error: 'Missing media key' }, 400);
  let key;
  try { key = decodeURIComponent(encoded); } catch { key = encoded; }
  if (!key.startsWith('uploads/')) return json({ error: 'Invalid media key' }, 400);
  const object = await env.MEDIA.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(object.body, { headers });
}

async function login(request, env) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return json({ error: 'Admin secrets are not configured.' }, 503);
  const body = await readJson(request);
  if (!body?.password || !safeEqual(body.password, env.ADMIN_PASSWORD)) return json({ error: 'Wrong password.' }, 401);
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 12;
  const sig = await hmac(`${exp}`, env.SESSION_SECRET);
  const token = `${exp}.${sig}`;
  return json({ ok: true }, 200, {
    'Set-Cookie': `nt_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=43200`
  });
}

function logout() {
  return json({ ok: true }, 200, {
    'Set-Cookie': 'nt_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
  });
}

async function verifySession(request, env) {
  if (!env.SESSION_SECRET) return false;
  const cookies = parseCookies(request.headers.get('Cookie') || '');
  const token = cookies.nt_session;
  if (!token) return false;
  const [expRaw, sig] = token.split('.');
  const exp = Number(expRaw);
  if (!exp || exp < Math.floor(Date.now() / 1000) || !sig) return false;
  const expected = await hmac(expRaw, env.SESSION_SECRET);
  return safeEqual(sig, expected);
}

async function updateProfile(request, env) {
  const body = await readJson(request);
  const statements = Object.entries(body || {})
    .filter(([key, value]) => PROFILE_KEYS.has(key) && typeof value === 'string')
    .map(([key, value]) => env.DB.prepare(`INSERT INTO profile (key,value,updated_at) VALUES (?,?,CURRENT_TIMESTAMP)
      ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP`).bind(key, value.slice(0, 5000)));
  if (!statements.length) return json({ error: 'Nothing to update.' }, 400);
  await env.DB.batch(statements);
  return json({ ok: true });
}

async function createEntry(request, env) {
  const item = validateEntry(await readJson(request));
  const result = await env.DB.prepare(`INSERT INTO entries
    (type,title,subtitle,description,date_label,tags,link,media_key,featured,sort_order,updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)`)
    .bind(item.type,item.title,item.subtitle,item.description,item.date_label,JSON.stringify(item.tags),item.link,item.media_key,item.featured,item.sort_order).run();
  return json({ ok: true, id: result.meta?.last_row_id });
}

async function updateEntry(request, env, idRaw) {
  const id = validId(idRaw);
  const item = validateEntry(await readJson(request));
  const existing = await env.DB.prepare('SELECT id FROM entries WHERE id=?').bind(id).first();
  if (!existing) return json({ error: 'Entry not found.' }, 404);
  await env.DB.prepare(`UPDATE entries SET type=?,title=?,subtitle=?,description=?,date_label=?,tags=?,link=?,media_key=?,featured=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .bind(item.type,item.title,item.subtitle,item.description,item.date_label,JSON.stringify(item.tags),item.link,item.media_key,item.featured,item.sort_order,id).run();
  return json({ ok: true });
}

async function deleteEntry(env, idRaw) {
  const id = validId(idRaw);
  const existing = await env.DB.prepare('SELECT media_key FROM entries WHERE id=?').bind(id).first();
  if (!existing) return json({ error: 'Entry not found.' }, 404);
  await env.DB.prepare('DELETE FROM entries WHERE id=?').bind(id).run();
  if (existing.media_key?.startsWith('uploads/')) await env.MEDIA.delete(existing.media_key).catch(() => {});
  return json({ ok: true });
}

async function uploadMedia(request, env) {
  const form = await request.formData();
  const file = form.get('file');
  if (!file || typeof file === 'string') return json({ error: 'No file supplied.' }, 400);
  if (file.size > 10 * 1024 * 1024) return json({ error: 'File must be 10 MB or smaller.' }, 413);
  const allowed = new Set(['image/jpeg','image/png','image/webp','image/gif','application/pdf']);
  if (!allowed.has(file.type)) return json({ error: 'Only JPG, PNG, WEBP, GIF or PDF files are allowed.' }, 415);
  const ext = extensionFor(file.type);
  const key = `uploads/${Date.now()}-${crypto.randomUUID()}${ext}`;
  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type, cacheControl: 'public, max-age=31536000, immutable' },
    customMetadata: { originalName: String(file.name || 'upload').slice(0, 200) }
  });
  return json({ ok: true, key, url: `/api/media/${encodeURIComponent(key)}` });
}

function validateEntry(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('Invalid entry payload.');
  const type = String(raw.type || '');
  const title = String(raw.title || '').trim();
  if (!ENTRY_TYPES.has(type)) throw new Error('Invalid entry type.');
  if (!title) throw new Error('Title is required.');
  return {
    type,
    title: title.slice(0, 180),
    subtitle: String(raw.subtitle || '').slice(0, 260),
    description: String(raw.description || '').slice(0, 5000),
    date_label: String(raw.date_label || '').slice(0, 80),
    tags: Array.isArray(raw.tags) ? raw.tags.map(x => String(x).trim().slice(0, 50)).filter(Boolean).slice(0, 12) : [],
    link: safeLink(raw.link),
    media_key: String(raw.media_key || '').startsWith('uploads/') ? String(raw.media_key).slice(0, 500) : '',
    featured: raw.featured ? 1 : 0,
    sort_order: Math.max(-9999, Math.min(9999, Number.parseInt(raw.sort_order || 0, 10) || 0))
  };
}

function validId(value) {
  const id = Number.parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid entry id.');
  return id;
}

function safeLink(value) {
  const str = String(value || '').trim();
  if (!str) return '';
  try {
    const url = new URL(str);
    return ['http:','https:'].includes(url.protocol) ? str.slice(0, 1000) : '';
  } catch { return ''; }
}

function extensionFor(type) {
  return ({'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif','application/pdf':'.pdf'})[type] || '';
}

function parseTags(value) {
  try { const parsed = JSON.parse(value || '[]'); return Array.isArray(parsed) ? parsed : []; } catch { return []; }
}

async function readJson(request) {
  try { return await request.json(); } catch { throw new Error('Invalid JSON body.'); }
}

function parseCookies(header) {
  return Object.fromEntries(header.split(';').map(v => v.trim()).filter(Boolean).map(pair => {
    const index = pair.indexOf('=');
    return index === -1 ? [pair, ''] : [pair.slice(0,index), pair.slice(index+1)];
  }));
}

function sameOrigin(request) {
  const origin = request.headers.get('Origin');
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}

async function hmac(message, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return bytesToBase64Url(new Uint8Array(signature));
}

function bytesToBase64Url(bytes) {
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
}

function safeEqual(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', ...extraHeaders }
  });
}
