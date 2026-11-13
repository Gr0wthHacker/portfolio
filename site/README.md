# Extension policy site

Static site with a landing page and a privacy policy for each Chrome extension, for
the Chrome Web Store's Privacy policy, Homepage and Support URL fields, plus an index
of all of them.

- Policies: `../privacy/<slug>.md` (CleanCritique ships its own HTML here). An entry
  with no policy (Knownhire door map, for now) gets a landing page and no privacy link.
- Extensions list and landing page copy: `extensions.json`. Add `storeUrl` to an entry
  once its Chrome Web Store listing is live and the page shows an Add to Chrome button.
- Images: `assets/<slug>/` (icon.png, promo.webp, screenshots as WebP, converted from
  each extension's store assets). Add `storeUrl` (Chrome Web Store listing) or `sourceUrl` (public repo) to an entry and its pages link it; without `storeUrl` they say the listing is coming soon.
- Build: `npm install && npm run build` writes `dist/`.

## Vercel

Import `Gr0wthHacker/portfolio`, set **Root Directory** to `site`, framework
**Other**. `vercel.json` sets the build and output. Optionally add a domain
such as `extensions.jackgierlich.com`.

URLs after deploy, with `<host>` the Vercel or custom domain:

| Extension | Privacy policy URL |
| --- | --- |
| TabFlow | `https://<host>/tabflow/privacy` |
| Ghost Mode | `https://<host>/ghost-mode/privacy` |
| Queue for Claude | `https://<host>/claude-queue/privacy` |
| ChatBridge | `https://<host>/chatbridge/privacy` |
| AngleCheck | `https://<host>/anglecheck/privacy` |
| CleanCritique | `https://<host>/cleancritique/privacy` |
