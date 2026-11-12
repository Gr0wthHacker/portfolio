// Builds a static site with a home page, a landing page and a privacy policy for each
// Chrome extension in extensions.json. Policies are read from ../privacy/*.md
// (one source of truth); images are in assets/<slug>/; output goes to dist/ for Vercel.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync, cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "dist");
const contact = "jackgierlich@gmail.com";
const exts = JSON.parse(readFileSync(join(here, "extensions.json"), "utf8"));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const asset = (e, file) => `/assets/${e.slug}/${file}`;
const hasPolicy = (e) => Boolean(e.policy || e.policyHtml);
const hasPromo = (e) => existsSync(join(here, "assets", e.slug, "promo.webp"));

// Install status. None of the extensions is on the Chrome Web Store yet; add "storeUrl" (and "sourceUrl" for a
// public repo) to an entry in extensions.json once it exists, and the pages link it.
const statusText = (e) => (e.storeUrl ? "On the Chrome Web Store" : e.statusText || "Coming soon to the Chrome Web Store");
const installButton = (e) =>
  e.storeUrl
    ? `<a class="btn primary" href="${esc(e.storeUrl)}">Add to Chrome</a>`
    : `<span class="btn soon" aria-disabled="true">${esc(statusText(e))}</span>`;

const css = `
:root { --bg: #ffffff; --fg: #17181c; --muted: #5d6170; --line: #e5e6eb; --card: #f6f7f9; --link: #2b59c3; --accent: #3d5bd9; --accent-fg: #ffffff; --soon: #eef0f6; }
@media (prefers-color-scheme: dark) { :root { --bg: #111216; --fg: #ececef; --muted: #a3a6b3; --line: #2a2c33; --card: #1a1b21; --link: #93b1ff; --accent: #6f8cff; --accent-fg: #0d0f17; --soon: #23252e; } }
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
a { color: var(--link); }
img { max-width: 100%; height: auto; display: block; }
.wrap { max-width: 1040px; margin: 0 auto; padding: 0 16px; }
.prose { max-width: 720px; }
header.top { border-bottom: 1px solid var(--line); }
header.top .wrap { display: flex; align-items: center; justify-content: space-between; height: 56px; }
header.top a { color: var(--fg); text-decoration: none; font-weight: 600; }
header.top nav a { color: var(--muted); font-weight: 400; font-size: 0.95rem; }
main { padding: 40px 0 64px; }
h1 { font-size: clamp(1.8rem, 4.5vw, 2.6rem); line-height: 1.15; margin: 0 0 8px; letter-spacing: -0.01em; }
h2 { font-size: 1.2rem; margin: 0 0 8px; }
p { margin: 0 0 12px; }
.lead { color: var(--muted); font-size: 1.15rem; margin: 0 0 16px; }
.hero { display: grid; grid-template-columns: 72px 1fr; gap: 20px; align-items: start; max-width: 760px; }
.hero img.icon { width: 72px; height: 72px; border-radius: 16px; }
.intro { font-size: 1.05rem; }
.actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 20px; }
.btn { display: inline-block; padding: 10px 18px; border-radius: 999px; font-weight: 600; font-size: 0.95rem; text-decoration: none; }
.btn.primary { background: var(--accent); color: var(--accent-fg); }
.btn.soon { background: var(--soon); color: var(--muted); border: 1px solid var(--line); cursor: default; }
.btn.ghost { border: 1px solid var(--line); color: var(--fg); }
.highlights { list-style: none; padding: 0; margin: 40px 0 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.highlights li { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px; font-weight: 600; }
.shots { margin: 40px 0 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.shots figure { margin: 0; }
.shots figure:first-child { grid-column: 1 / -1; }
.shots img { border-radius: 12px; border: 1px solid var(--line); width: 100%; }
.shots figcaption { color: var(--muted); font-size: 0.9rem; margin-top: 8px; }
.sections { margin: 48px 0 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 32px 40px; }
.sections ul { margin: 0; padding-left: 20px; }
.sections li { margin-bottom: 4px; }
.panel { margin: 48px 0 0; background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 20px; max-width: 760px; }
.small { color: var(--muted); font-size: 0.9rem; }
.grid { list-style: none; padding: 0; margin: 32px 0 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 20px; }
.card { border: 1px solid var(--line); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; background: var(--bg); }
.card .media { aspect-ratio: 440 / 280; background: var(--card); display: flex; align-items: center; justify-content: center; }
.card .media img.promo { width: 100%; height: 100%; object-fit: cover; }
.card .media img.icon { width: 72px; height: 72px; border-radius: 16px; }
.card .body { padding: 16px; display: flex; flex-direction: column; gap: 6px; flex: 1; }
.card h2 { margin: 0; font-size: 1.15rem; }
.card h2 a { color: var(--fg); text-decoration: none; }
.card h2 a::after { content: ""; position: absolute; inset: 0; }
.card { position: relative; }
.card .status { color: var(--muted); font-size: 0.85rem; margin-top: auto; }
.card .links { position: relative; z-index: 1; font-size: 0.9rem; }
footer { border-top: 1px solid var(--line); padding: 20px 0 40px; color: var(--muted); font-size: 0.9rem; }
.prose h1 { font-size: 1.8rem; }
.prose h2 { margin-top: 28px; }
.prose ul { padding-left: 20px; }
@media (max-width: 720px) {
  main { padding-top: 28px; }
  .hero { grid-template-columns: 1fr; gap: 12px; }
  .hero img.icon { width: 56px; height: 56px; border-radius: 12px; }
  .highlights, .shots, .sections { grid-template-columns: 1fr; }
  .actions .btn { width: 100%; text-align: center; }
}
`;

const page = (title, description, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<style>${css}</style>
</head>
<body>
<header class="top"><div class="wrap"><a href="/">Jack Gierlich's extensions</a><nav><a href="/">All extensions</a></nav></div></header>
<main><div class="wrap">
${body}
</div></main>
<footer><div class="wrap">Questions or support: <a href="mailto:${contact}">${contact}</a></div></footer>
</body>
</html>
`;

const section = (s) =>
  `<section><h2>${esc(s.title)}</h2>${s.text ? `<p>${esc(s.text)}</p>` : ""}${
    s.items ? `<ul>${s.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : ""
  }</section>`;

const landing = (e) => {
  const privacyLink = hasPolicy(e) ? `<a class="btn ghost" href="/${e.slug}/privacy">Privacy policy</a>` : "";
  const shots = (e.shots || []).length
    ? `<div class="shots">${e.shots
        .map(
          (s, i) =>
            `<figure><img src="${asset(e, s.file)}" alt="${esc(s.alt)}" width="1280" height="800"${i ? ' loading="lazy"' : ""}><figcaption>${esc(s.alt)}</figcaption></figure>`
        )
        .join("")}</div>`
    : "";
  return `<div class="hero">
<img class="icon" src="${asset(e, "icon.png")}" alt="" width="72" height="72">
<div>
<h1>${esc(e.name)}</h1>
<p class="lead">${esc(e.tagline)}</p>
<p class="intro">${esc(e.intro)}</p>
<div class="actions">${installButton(e)}${privacyLink}${e.sourceUrl ? `<a class="btn ghost" href="${esc(e.sourceUrl)}">Source code</a>` : ""}</div>
</div>
</div>
<ul class="highlights">${e.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>
${shots}
<div class="sections">${e.sections.map(section).join("")}</div>
<div class="panel">
<h2>Privacy</h2>
<p>${esc(e.privacy)}${hasPolicy(e) ? ` <a href="/${e.slug}/privacy">Read the privacy policy</a>.` : ""}</p>
${e.note ? `<p class="small">${esc(e.note)}</p>` : ""}
</div>
<div class="panel">
<h2>Support</h2>
<p>Email <a href="mailto:${contact}?subject=${encodeURIComponent(e.name)}">${contact}</a> with the extension name in the subject.</p>
</div>`;
};

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(join(here, "assets"), join(out, "assets"), { recursive: true });

const write = (rel, html) => {
  const file = join(out, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

for (const e of exts) {
  if (e.policy) {
    const md = readFileSync(join(here, e.policy), "utf8");
    write(
      `${e.slug}/privacy.html`,
      page(`${e.name} Privacy Policy`, `Privacy policy for the ${e.name} Chrome extension.`, `<article class="prose">${marked.parse(md)}</article>`)
    );
  } else if (e.policyHtml) {
    mkdirSync(join(out, e.slug), { recursive: true });
    copyFileSync(join(here, e.policyHtml), join(out, e.slug, "privacy.html"));
  }
  write(`${e.slug}.html`, page(`${e.name}: ${e.tagline}`, e.summary, landing(e)));
}

const card = (e) => `<li class="card">
<div class="media">${hasPromo(e) ? `<img class="promo" src="${asset(e, "promo.webp")}" alt="" width="440" height="280" loading="lazy">` : `<img class="icon" src="${asset(e, "icon.png")}" alt="" width="72" height="72">`}</div>
<div class="body">
<h2><a href="/${e.slug}">${esc(e.name)}</a></h2>
<p>${esc(e.tagline)}</p>
<p class="status">${esc(statusText(e))}</p>
<p class="links"><a href="/${e.slug}">Details</a>${hasPolicy(e) ? ` · <a href="/${e.slug}/privacy">Privacy policy</a>` : ""}</p>
</div>
</li>`;

write(
  "index.html",
  page(
    "Chrome extensions by Jack Gierlich",
    "Chrome extensions by Jack Gierlich for tabs, browsing history, AI chats, news and site reviews.",
    `<h1>Chrome extensions</h1>
<p class="lead">Built by Jack Gierlich. Tools for tabs, browsing history, AI chats, news coverage and site reviews.</p>
<ul class="grid">
${exts.map(card).join("\n")}
</ul>`
  )
);

console.log(`Built ${exts.length} extension pages into dist/`);
