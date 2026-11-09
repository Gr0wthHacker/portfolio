# Extension policy site

Static site that hosts a page and a privacy policy for each Chrome extension, for
the Chrome Web Store's Privacy policy, Homepage and Support URL fields.

- Policies: `../privacy/<slug>.md` (CleanCritique ships its own HTML here).
- Extensions list: `extensions.json`.
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
