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
const { SITES, buildBlogIndex, resolveImageForSite } = require('../admin/server.js').blogTools;

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
  }
})();
