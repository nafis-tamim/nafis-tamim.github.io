# Deploy checklist

- [ ] `npm install`
- [ ] Create Cloudflare D1 database: `nafistamim-portfolio`
- [ ] Put D1 database ID into `wrangler.jsonc`
- [ ] Optional: Create R2 bucket: `nafistamim-media` (only for direct file uploads)
- [ ] Run both SQL migration files
- [ ] Create/connect Pages project named `nafistamim`
- [ ] Build command = `npm run build`
- [ ] Output directory = `dist`
- [ ] Bind D1 as `DB`
- [ ] Optional: Bind R2 as `MEDIA`
- [ ] Set secret `ADMIN_PASSWORD`
- [ ] Set secret `SESSION_SECRET`
- [ ] Deploy
- [ ] Open `/admin` and replace placeholder content
- [ ] Confirm certificate/PDF upload
- [ ] Confirm mobile layout
