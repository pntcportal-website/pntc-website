// Rebuilds the blog list page (<site>/blog/index.html) of every site from the posts published on the live website.
// Normally the admin console does this each time a post is published or removed. This is for repairs, such as
// the empty blog lists of November 2026, when the admin's database query failed and the lists came out empty.
// Reads the public post feed (no keys needed) and writes the pages in the repo. Commit and push afterwards.
// Run:  node tools/rebuild-blog-lists.js            (uses https://www.pntc.edu.ph)
//       node tools/rebuild-blog-lists.js http://localhost:8787
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const BASE = (process.argv[2] || 'https://www.pntc.edu.ph').replace(/\/$/, '');
const { SITES, buildBlogIndex, resolveImageForSite, buildSHSNewsBlock } = require('../admin/server.js').blogTools;

(async () => {
  for (const site of Object.values(SITES)) {
    const r = await fetch(`${BASE}/api/public/posts?site=${encodeURIComponent(site.id)}&limit=20`);
    if (!r.ok) { console.warn(site.id, 'feed failed', r.status); continue; }
    const posts = (await r.json()).map(p => ({ ...p, status: 'published', featuredImage: resolveImageForSite(p.featuredImage, site) }));
    const file = path.join(ROOT, site.dir, 'blog', 'index.html');
    if (!fs.existsSync(path.dirname(file))) { console.log(site.id, 'has no blog folder, skipped'); continue; }
    // only posts whose page exists on this site get a card (no broken links)
    const live = posts.filter(p => fs.existsSync(path.join(ROOT, site.dir, 'blog', p.slug + '.html')));
    fs.writeFileSync(file, buildBlogIndex(live, site));
    console.log(`${site.id}: ${live.length} posts listed` + (live.length < posts.length ? ` (${posts.length - live.length} without a page here)` : ''));
    // the SHS home page Events cards saved in the page (the page also loads them live)
    if (site.id === 'shs') {
      const home = path.join(ROOT, site.dir, 'index.html'), S = '<!-- PNTC_NEWS_START -->', E = '<!-- PNTC_NEWS_END -->';
      const h = fs.readFileSync(home, 'utf8'), a = h.indexOf(S), b = h.indexOf(E);
      if (a > -1 && b > a) { fs.writeFileSync(home, h.slice(0, a + S.length) + '\n' + buildSHSNewsBlock(live.slice(0, 3), site) + '\n  ' + h.slice(b)); console.log('shs: home page Events refreshed'); }
    }
  }
})();
