# Nafis Tamim — Living Academic Portfolio

This repository hosts a responsive, accessible, evidence-first academic portfolio on GitHub Pages.

## Architecture

- Static HTML/CSS/JS served by GitHub Pages.
- Every visible item lives in `content/site.json`; no rebuild required.
- Custom non-indexed editor: `/admin-studio-nt26.html`.
- Editor writes back to GitHub using the GitHub Contents API with a fine-grained, Contents Read/Write personal access token provided manually in the browser. The token is never stored in code, localStorage or cookies; closing the tab removes it.
- The editor supports text, colors, SEO, avatar and image URLs, projects, case studies, timeline, skills, notes, navigation ordering, and custom sections.
- For direct image upload use a trusted hosted media service or GitHub upload, then paste the HTTPS URL. Direct media file upload is not implemented in the editor.
- No MongoDB passwords or API keys are exposed in this static site. Secure MongoDB live data/API requires a separate server-side deployment, not GitHub Pages alone.

## Setup

The website requires only GitHub Pages set to **Deploy from a branch → main / (root)**.

To edit, open `/admin-studio-nt26.html` and supply a GitHub fine-grained token limited to this repository with `Contents: Read and write`. Click Publish to commit the changes. The admin URL is deliberately absent from the public navigation, but security comes from GitHub authorization, not its obscurity.

## Safety

Never include GitHub tokens, MongoDB connection strings with passwords, or private documents in publicly readable files. All awards and project claims should be evidence-based. Old site can be restored from `backup/pre-redesign-2026-10-13`.
