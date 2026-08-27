# Nafis Portfolio CMS — 100% free-stack starter

A static academic portfolio + private CMS admin built for:

- GitHub Pages hosting
- Supabase Postgres database
- Supabase Auth
- Supabase Storage
- Plain HTML / CSS / JavaScript
- No build tool
- No paid framework or server required

## What you can edit from `/admin.html`

- Hero / site identity
- Any hero stat
- Page section titles / subtitles
- Show / hide / reorder sections
- Add or delete custom sections
- Awards
- Award images and certificate files
- Certificate vault
- Certificate images
- Competition results
- Leadership roles
- Projects + project images + tags
- Research
- Compact skill groups
- Contact / social links

## Important free-plan reality

The code itself costs $0. GitHub Pages supports static sites from public repositories on GitHub Free. Supabase has a $0 Free plan, but its quotas and policies can change. A custom `.com` or `.me` domain is not included; use the free `github.io` URL if you want no mandatory cost.

Supabase Free currently has usage limits. Keep certificate images web-optimized so storage remains comfortably within the free quota.

---

# Setup

## 1. Create a free Supabase project

Create a project at Supabase.

## 2. Run the database script

Supabase Dashboard → SQL Editor → New query.

Paste the complete contents of:

`supabase-schema.sql`

Run it.

## 3. Create your admin login

Supabase Dashboard → Authentication → Users → Add user.

Create your own email/password user.

Then open SQL Editor and run:

```sql
insert into public.admin_users(user_id)
select id from auth.users
where email = 'YOUR_ADMIN_EMAIL'
on conflict (user_id) do nothing;
```

Replace `YOUR_ADMIN_EMAIL`.

## 4. Add your Supabase browser credentials

Supabase Dashboard → Project Settings / API.

Copy:
- Project URL
- anon / publishable key

Open `config.js`:

```js
window.PORTFOLIO_CONFIG = {
  supabaseUrl: "YOUR_PROJECT_URL",
  supabaseAnonKey: "YOUR_ANON_KEY"
};
```

The anon key is intentionally used by the browser. Database and Storage writes remain protected by Row Level Security.

**Never put the Supabase service-role key in this project.**

## 5. Test locally

You should serve the folder through a local web server rather than double-clicking files.

Python:

```bash
python -m http.server 8000
```

Then open:

Public:
`http://localhost:8000/`

Admin:
`http://localhost:8000/admin.html`

## 6. Publish for free with GitHub Pages

Create a public GitHub repository.

Recommended repository name if it matches your GitHub username:

`YOURUSERNAME.github.io`

Upload all files from this folder.

GitHub repository → Settings → Pages → Deploy from branch → `main` → `/ (root)`.

Your site becomes:

`https://YOURUSERNAME.github.io/`

Admin:

`https://YOURUSERNAME.github.io/admin.html`

The admin page is publicly reachable, but only your authenticated allow-listed admin account can change data.

---

# Image recommendations

Certificate and award scans can fill free Storage quickly if you upload raw phone photos.

Before upload, a good target is:
- JPG/WebP
- about 1400–2000 px on the longest side
- usually under 500 KB–1 MB each

Do not upload sensitive personal documents. Anything placed in the `portfolio-media` bucket is configured for public viewing because the portfolio needs to display it.

---

# Security

This project uses:

- Supabase Auth for sign-in
- `admin_users` allow-list
- PostgreSQL Row Level Security
- Storage policies
- public read / admin-only write

Do not remove the RLS policies.

Do not place secret keys in JavaScript.

---

# Adding a completely new section

Admin → Sections → Add section.

Choose `custom` as the section type.

You can set:
- slug
- nav label
- eyebrow
- title
- subtitle
- body
- image
- position
- visible status

Core section types (`awards`, `certificates`, etc.) automatically render records from their matching manager.

---

# Files

- `index.html` — public portfolio
- `admin.html` — private CMS
- `config.js` — Supabase public connection values
- `assets/styles.css` — public UI
- `assets/admin.css` — admin UI
- `assets/public.js` — public CMS renderer
- `assets/admin.js` — authentication + CRUD + uploads
- `supabase-schema.sql` — database, RLS, Storage and starter content
