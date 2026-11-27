// Puts the official address (canonical) on every blog post page already in the repo, and removes posts that are
// no longer published from the sitemap list. Rules (the same as the admin uses for new posts):
//   - the address has no .html (the site serves pages without it, the .html form only redirects)
//   - a post that exists on several sites names the College copy as the original, then SHS
// Rerunnable:  node tools/fix-blog-canonicals.js
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const SITES = [['colleges', 'PNTC Colleges', '/college/blog/'], ['shs', 'SHS', '/shs/blog/']];
const URL = 'https://www.pntc.edu.ph';
const files = {};
for (const [id, dir] of SITES) {
  const d = path.join(ROOT, dir, 'blog');
  if (!fs.existsSync(d)) continue;
  for (const f of fs.readdirSync(d)) if (f.endsWith('.html') && f !== 'index.html') (files[f] = files[f] || []).push(id);
}
let changed = 0;
for (const [file, sites] of Object.entries(files)) {
  const slug = file.replace(/\.html$/, '');
  const home = SITES.find(([id]) => sites.includes(id));
  const canonical = URL + home[2] + slug;
  for (const [id, dir] of SITES) {
    if (!sites.includes(id)) continue;
    const p = path.join(ROOT, dir, 'blog', file);
    let h = fs.readFileSync(p, 'utf8');
    const before = h;
    if (/<link rel="canonical"[^>]*>/.test(h)) h = h.replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`);
    else h = h.replace('</head>', `<link rel="canonical" href="${canonical}">\n</head>`);
    h = h.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${canonical}$2`);
    if (h !== before) { fs.writeFileSync(p, h); changed++; }
  }
}
console.log('blog pages updated:', changed);
