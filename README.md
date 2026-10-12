# Nafis Tamim — Multidisciplinary Academic Portfolio (v4)

A responsive editorial portfolio with a scientific visual layer, evidence-linked achievements, design and software projects, research, writing and editable content.

## Live site

- Website: https://nafis-tamim.github.io/
- Private editor: https://nafis-tamim.github.io/admin-studio-nt26.html (not included in public navigation; noindexed)
- Source: https://github.com/nafis-tamim/nafis-tamim.github.io

## Live architecture

- GitHub Pages hosts the static site (no payments or server required).
- Site content: \`content/site.json\`. All major text, sections, project details, achievements, links, images, colors and menus are read from this file.
- Admin Studio writes to the **GitHub Contents API** with a fine-grained GitHub personal access token limited to this repository and \`Contents: Read and write\` permission.
- Admin Studio does **not** store tokens in localStorage, cookies or repository files. Reload or disconnect clears token.
- Media uploader accepts PNG, JPG, WebP, GIF, ICO and PDF up to 8MB/file. It commits uploads to \`media/\` automatically. The upload's URL is inserted into the selected field. SVG uploads intentionally blocked for security.
- Custom favicon: update \`seo.favicon\` in studio; upload PNG/ICO or supply a trusted favicon URL.
- Search metadata: Studio updates JSON **and** static head tags in \`index.html\` to keep social cards and search snippets synced.
- Backups: GitHub commit history and branch \`backup/pre-redesign-2026-10-13\`.

## IMPORTANT: MongoDB

A MongoDB Atlas cluster exists in the separate project \`Nafis Academic Portfolio\`. Site content has been saved as a copy in \`academic_portfolio.site_content\` through the user's ChatGPT connector.

**The live GitHub Pages site does not connect directly to MongoDB.** Doing so from browser code would expose database credentials. Until a secure server-side integration is deployed, GitHub JSON is the source of truth; MongoDB is a separate snapshot, not a live sync target. Neither the website nor Studio ever asks for or stores a MongoDB password.

## Adding media

1. Open the Studio URL.
2. Create a GitHub fine-grained token for only this repository, giving \`Contents: Read and write\`.
3. Paste the token in Studio. It stays in this browser tab's memory.
4. Open a relevant collection, select the entry and use **Upload image / PDF** on a media field. Gallery fields also offer upload.
5. Edit text, URLs, captions and context. Click **Publish changes** to commit to GitHub; GitHub Pages refreshes automatically.
6. You can also ask ChatGPT to edit this GitHub repository directly through the connected GitHub app, subject to authorization.

## Credibility and evidence

- ICSC 2026 Top 1 Ambassador: https://icscompetition.org/en/top-ambassadors
- ICSC 2026 Most Participants Ambassador Award: https://icscompetition.org/en/announcement2026
- IYMC Silver Honour and International Mother Language Institute national essay first place are included as user-provided milestones, pending a personal certificate or public verification link.
- No claim of university admission, completed research publication or commercial impact is invented.

## Accessibility

Responsive, keyboard-operable detail modals, visible focus states, alt text, reduced-motion support and low-key constellation animation with optional motion off in the Studio.
