# Nafis Tamim — Student Portfolio (Original Tandem Effects / V9)

**Live website:** https://nafis-tamim.github.io/

**Hidden admin editor:** https://nafis-tamim.github.io/admin-studio-nt26.html

## Original animation fidelity

The supplied 8B Tandem HTML/CSS is the live `index.html` base. The exact original JavaScript animation engine is preserved, without rewriting its effects, in `tandem-original-effects.js`. Its GSAP, ScrollTrigger, SplitText and Lenis dependencies remain as in the source. The original 14 section structures and their animation selectors remain: pinned hero image-strip transition, sticky achievements image swapping, scroll-pinned geometric principles, academic journey progress, project shutter images, research marquee, parallax image collage, animated interest titles, scroll-driven learning bars, focus toggle animations, FAQs, journal reveal and contact/footer transitions.

## Content and administration

- **Student content source**: `content/site.json`. No credentials are placed in source code.
- **Original template hydration**: `tandem-data.js` reads the content before loading the untouched original animation engine, so current content is already present when GSAP measures page layout.
- **Certificate View more**: achievement cards open a full-screen accessible panel with gallery images, PDF file links, evidence details and source URLs. Unlimited gallery items are administered in Studio.
- **Home photo**: editable in Studio → Home & photo → Your identity & portrait; displayed in both the original hero photo and about photo.
- **Other fields**: Projects, Research, Design, Academic journey, navigation, SEO, favicon, custom sections, and all template text are editable via Studio. Use **Small website text / Original animated template text** for Interest titles, Learning steps, Focus cards and FAQ questions. The sections object has switches to show/hide built-in areas.
- **Add images or PDFs**: select a record, click **Upload / Replace** or **Upload multiple**, and **Publish**. Remove from the live site before deleting uploaded files in Media library.
- **Admin authorization**: fine-grained GitHub Personal Access Token restricted to this one repository, with Contents read/write. Token stays in the active tab's memory. The admin URL being absent from public menus is not security by itself; actual writes are restricted by GitHub permissions.
- **GitHub Pages**: static hosting with GitHub JSON as live content. MongoDB Atlas `academic_portfolio.site_content` is an updated snapshot only, not live sync. Do **not** expose MongoDB credentials in a browser.
- **Backup before this redesign**: branch `backup/pre-tandem-student-20261019`.

---

# Nafis Tamim — Interactive Research and Creative Portfolio (V7)


## V7 — Scientific Interactive Portfolio (13 October 2026)

The public site uses a five-color system: **#06070C, #10162A, #1D4ED8, #60A5FA, #F8FAFC**. Key changes from V6:

- Scientific 3D hero: interactive toroidal wireframe plus a tilting, faceted real portrait card. The original portrait image source remains unchanged.
- **Achievements**: interactive circular category navigation; choose an award to reveal its detail panel. Each panel provides an image/PDF slider and direct certificate/result links. Bangladesh Government, International and Academic Recognition are separate categories with editable logos.
- **Projects and Design**: multi-image sliders with next/previous controls and full-size image links.
- **Research**: an animated five-agent schematic paired with a direct research preview and document links. The linked TruthLens IJISRT editorial acceptance statement has not been promoted to a final journal publication claim.
- **Scroll-controlled science**: a sticky square resonance panel renders nodal contours of a standing-wave equation through marching squares, with shape mode and 3D presentation adjusting to scroll progress. This is Chladni-inspired rather than a copy of a separate website.
- The empty Writing section, surplus photo crosshairs, floating filler card, and Verified badges are not rendered. Existing writing data remains in content JSON as a backup.
- Accessibility: keyboard-accessible gallery/orbit controls, mobile breakpoints, reduced-motion and Admin motion settings.
- **Admin Studio**: image/PDF gallery accepts multiple files, supports item-by-item removal, UP/DOWN reordering, and **COVER** selection. Other existing editing options remain, including logos, text, menus, sections, links, SEO/favicon, and safe unused-media deletion.
- Photo upload still requires a GitHub fine-grained Personal Access Token scoped to the repository with **Contents: Read and write**. The site cannot bypass GitHub permission policy.
- Backup branch: \`backup/pre-v7-scientific-motion-20261013\`. This snapshot is GitHub commit history, separate from any database backup.


## V6 — The Working Index (2026)

**Design:** a responsive computational editorial portfolio with asymmetric layout, dark navy hero, editorial serif accents, particle constellation, light typography-first sections and image-led direct evidence cards.

**Every award, project, research record, design or writing item** has an image field and a gallery, and publicly accessible supporting links appear directly in each card (no "View more" modal). The initial SVG covers in `assets/` are labeled original illustrations, not scanned certificates or project screenshots; replace them with your real photos via Studio.

**New Admin Studio:** `/admin-studio-nt26.html`. Modules include Home & profile, Achievements, Award category logos, Projects, Research, Design, Writing, Education, Pages & menu, Style / SEO / favicon, All site text, Media library and Advanced JSON. Admin edits `content/site.json`, and Sync Search Meta updates static `index.html` metadata. Add arbitrary sections and menu URLs through Pages & menu; each section supports custom section links.

**GitHub permission troubleshooting:** user must sign in with a fine-grained GitHub token scoped to `nafis-tamim/nafis-tamim.github.io` with Repository permissions → Contents → **Read and write**. Studio performs a write-permission preflight through GitHub's Git Blobs API before enabling Publish or Upload. A 403 "Resource not accessible by personal access token" is a token/account permission issue and cannot be bypassed in browser code. Never share personal tokens.

**Media:** Photo/PDF uploads (max 8MB; PNG, JPEG, WebP, GIF, ICO, PDF) go into `uploads/`. SVG image uploads are disallowed for security, but existing trusted repository SVG editorial art can be linked. Delete media after unlinking it from all records and publishing; Media Library checks the live content before deleting unused files. Old `media/` uploads are also discoverable.

**No public "verified" label:** Removed from the new UI; legitimate evidence and official documents remain linked directly. TruthLens acceptance status remains differentiated from journal publication.

**Backups:** GitHub history and `backup/before-v6-redesign-20261013`. MongoDB Atlas snapshot is a separate backup, not a live database server; the website uses GitHub JSON as its public data source.

---


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


## V5 Achievement categories, media and links

The portfolio now separates **Bangladesh Government** competition recognition, **International Honours**, and **Academic Commendations** in the Awards section. These are organizer categories and **do not imply official government endorsement**.

- Open **Achievements & photos** in the Studio to create an award, select its group, upload or replace a cover photo, add gallery images or PDFs, and add multiple Supporting Links. Supporting evidence links appear **directly on the public award cards**, not only in a popup.
- Open **Government & international logos** to edit section titles and descriptions and upload/replace/remove each group's emblem. The international symbol is a neutral original globe illustration stored at \`assets/international-mark.svg\`.
- The initial Bangladesh Government seal image is loaded from a Wikimedia Commons source entry. The public site links to its source for attribution; replace or remove it in the Studio if desired. The source file's re-use conditions are documented at https://commons.wikimedia.org/wiki/File:Seal_of_the_Government_of_Bangladesh.svg.
- To remove any image from the live site, choose **Remove from website** for a cover/logo or **Remove** for a gallery item, then **Publish changes**. This unlinks media but does not delete shared repository assets or external media.
- To permanently remove unused files uploaded to \`media/\`, visit **Media library & delete** after publishing. Deletion is disabled if the file is still referenced by the current content or the site has unpublished changes; the editor re-checks the published content before deletion. History may retain old versions of a committed file.

Media storage limits remain those of GitHub. The editor accepts JPG/PNG/WebP/GIF/ICO/PDF under 8 MB per upload. SVG uploads are intentionally unsupported.
