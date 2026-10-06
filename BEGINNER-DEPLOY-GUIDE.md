# Beginner Deploy Guide

This project is prepared so you can deploy it using the GitHub and Cloudflare dashboards without using a terminal.

## Main setup
1. Upload the project files to a GitHub repository.
2. Connect that repository to Cloudflare Pages.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Create a D1 database called `nafistamim-portfolio`.
6. Run `migrations/0001_init.sql`, then `migrations/0002_seed.sql` in the D1 Console.
7. Bind the D1 database to the Pages project with variable name `DB`.
8. Add encrypted secrets `ADMIN_PASSWORD` and `SESSION_SECRET`.
9. Redeploy and open `/admin`.

## R2 is optional
The site and admin text/content management work without R2. File upload requires an R2 bucket and a binding named `MEDIA`. Cloudflare may require billing setup to activate R2 even if usage remains within its free tier. If you want a no-billing-setup path, skip R2 and use the External link field for certificate/project links.
