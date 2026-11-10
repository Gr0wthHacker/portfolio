// Builds a static site with a home page, a page and a privacy policy for each
// Chrome extension in extensions.json. Policies are read from ../privacy/*.md
// (one source of truth); output goes to dist/ for Vercel.
import { readFileSync, writeFileSync, mkdirSync, rmSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "dist");
const contact = "jackgierlich@gmail.com";
const exts = JSON.parse(readFileSync(join(here, "extensions.json"), "utf8"));

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Install status. None of the extensions is on the Chrome Web Store yet; add "storeUrl" (and "sourceUrl" for a
// public repo) to an entry in extensions.json once it exists, and the pages link it.
const status = (e) => {
  const parts = [e.storeUrl ? `<a href="${esc(e.storeUrl)}">Add to Chrome</a>` : "Chrome Web Store listing coming soon."];
  if (e.sourceUrl) parts.push(`<a href="${esc(e.sourceUrl)}">Source code</a>`);
  return parts.join(" · ");
};

const page = (title, body) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
:root { --bg: #ffffff; --fg: #1a1a1a; --muted: #5c5c5c; --line: #e4e4e4; --link: #0b57d0; }
@media (prefers-color-scheme: dark) { :root { --bg: #121212; --fg: #ececec; --muted: #a8a8a8; --line: #2c2c2c; --link: #8ab4f8; } }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--fg); font: 16px/1.6 system-ui, -apple-system, "Segoe UI", sans-serif; }
main { max-width: 720px; margin: 0 auto; padding: 40px 16px 64px; }
a { color: var(--link); }
h1 { font-size: 1.8rem; line-height: 1.25; margin: 0 0 8px; }
h2 { font-size: 1.15rem; margin: 32px 0 8px; }
p.lead { color: var(--muted); margin-top: 0; }
ul.cards { list-style: none; padding: 0; }
ul.cards li { border-top: 1px solid var(--line); padding: 16px 0; }
footer { border-top: 1px solid var(--line); margin-top: 48px; padding-top: 16px; color: var(--muted); font-size: 0.9rem; }
code { font-size: 0.92em; }
</style>
</head>
<body><main>
${body}
<footer>Questions: <a href="mailto:${contact}">${contact}</a> · <a href="/">All extensions</a></footer>
</main></body>
</html>
`;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const write = (rel, html) => {
  const file = join(out, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

for (const e of exts) {
  const privacyPath = `/${e.slug}/privacy`;
  if (e.policy) {
    const md = readFileSync(join(here, e.policy), "utf8");
    write(`${e.slug}/privacy.html`, page(`${e.name} Privacy Policy`, marked.parse(md)));
  } else {
    mkdirSync(join(out, e.slug), { recursive: true });
    copyFileSync(join(here, e.policyHtml), join(out, e.slug, "privacy.html"));
  }
  write(
    `${e.slug}.html`,
    page(
      e.name,
      `<h1>${esc(e.name)}</h1>
<p class="lead">${esc(e.tagline)}</p>
<p>${esc(e.summary)}</p>
<p><strong>Status:</strong> ${status(e)}</p>
<p>A Chrome extension. <a href="${privacyPath}">Privacy policy</a></p>
<h2>Support</h2>
<p>Email <a href="mailto:${contact}?subject=${encodeURIComponent(e.name)}">${contact}</a> with the extension name in the subject.</p>`
    )
  );
}

write(
  "index.html",
  page(
    "Chrome extensions by Jack Gierlich",
    `<h1>Chrome extensions</h1>
<p class="lead">Built by Jack Gierlich.</p>
<ul class="cards">
${exts.map((e) => `<li><a href="/${e.slug}"><strong>${esc(e.name)}</strong></a><br>${esc(e.summary)}<br>${status(e)}<br><a href="/${e.slug}/privacy">Privacy policy</a></li>`).join("\n")}
</ul>`
  )
);

console.log(`Built ${exts.length} extension pages into dist/`);
