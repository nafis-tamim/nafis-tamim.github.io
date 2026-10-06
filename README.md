# Nafis Tamim — Academic Portfolio

A modern academic portfolio built for `nafistamim.pages.dev` with a public portfolio, private admin dashboard, Cloudflare D1 content database and R2 media storage.

## What is included

- Gen-Z editorial academic portfolio (responsive)
- Selected work, academics, capabilities and filterable archive
- `/admin` private dashboard
- Add / edit / delete entries
- Edit profile content without touching source code
- Feature selected entries on the homepage
- Upload JPG / PNG / WEBP / GIF / PDF to R2 (10 MB per file in the app)
- Same-origin Pages Functions API
- D1 migration + seed data
- HttpOnly signed admin session cookie

## Stack

- React + Vite
- Cloudflare Pages
- Cloudflare Pages Functions
- Cloudflare D1
- Cloudflare R2

## Local frontend preview

```bash
npm install
npm run dev
```

The public portfolio will use built-in placeholder data if the API/database is not available.

## Cloudflare setup

### 1. Login

```bash
npx wrangler login
```

### 2. Create D1 database

```bash
npx wrangler d1 create nafistamim-portfolio
```

If you use the dashboard-only setup, you do not need to edit any Wrangler file.

### 3. Optional: Create R2 bucket

R2 is only needed for direct image/PDF uploads from the admin panel. Cloudflare may require billing setup to activate R2 even if your usage stays inside the free tier. You can skip this step and use the External link field instead.

```bash
npx wrangler r2 bucket create nafistamim-media
```

### 4. Run database migrations

```bash
npx wrangler d1 execute nafistamim-portfolio --remote --file=./migrations/0001_init.sql
npx wrangler d1 execute nafistamim-portfolio --remote --file=./migrations/0002_seed.sql
```

### 5. Create the Pages project

The target project name is `nafistamim`. Connect the GitHub repository from Cloudflare Pages, then use:

- Build command: `npm run build`
- Build output directory: `dist`

A Pages project named `nafistamim` will use `nafistamim.pages.dev` if that project subdomain is available.

### 6. Add Pages Functions bindings

In the Cloudflare Pages project settings add:

- D1 binding variable: `DB` → `nafistamim-portfolio`
- R2 binding variable: `MEDIA` → `nafistamim-media`

For the easiest first deployment, configure these bindings in the Cloudflare dashboard. A reference config is included as `wrangler.example.jsonc`, but Cloudflare will not use it automatically.

### 7. Add admin secrets

In Pages project settings, add encrypted/secrets values:

- `ADMIN_PASSWORD` — your private admin password
- `SESSION_SECRET` — a long random string (32+ random characters recommended)

Do **not** commit these values to GitHub.

### 8. Deploy

With Git integration, push to the connected repository and Pages will build/deploy it. You can also use Wrangler once the Pages project/resources are configured:

```bash
npm run build
npx wrangler pages deploy dist --project-name nafistamim
```

## Admin

After deployment, open:

```text
https://nafistamim.pages.dev/admin
```

Use the password stored in `ADMIN_PASSWORD`.

## Content types

- `education`
- `result`
- `project`
- `achievement`
- `certificate`
- `activity`
- `skill`
- `gallery`

## Before publishing publicly

Replace the placeholder email, school/education, achievements, projects and skills from `/admin`. Only publish information you are comfortable making public.

## Design v2
The public portfolio UI has been redesigned with a premium academic/editorial system: deep navy, warm ivory, electric cobalt and a restrained lime accent. Hero proof counts are derived from real entries in D1. Featured cards automatically show uploaded media when a media key exists, otherwise they use an abstract visual placeholder. The admin/API/database architecture remains unchanged.
