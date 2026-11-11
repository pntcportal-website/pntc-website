// Training Center: contact details and number boxes (2026-11 update from Marketing).
// Marketing team in place of admissions, the MTAC marketing email, 32 STCW courses, 50,000+ trainees a year.
// Also makes the four number boxes on the Training Center home editable in Site Content (training.stat1..4).
// Rerunnable:  node tools/training-contact-update.js
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'PNTC Maritime Training and Assessment Center');
const EMAIL = 'mtac.marketing@mypntc.edu.ph';

for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.html'))) {
  const file = path.join(DIR, f);
  const raw = fs.readFileSync(file, 'utf8');
  let h = raw;
  h = h.split('admissions@mypntc.edu.ph').join(EMAIL);
  h = h.replace(/(<!--c:training\.cta\.btn1-->)Email Admissions/g, '$1Email Our Marketing Team');
  h = h.replace(/(<!--c:training\.cta\.sub-->)Our admissions staff are ready to assist you\./g, '$1Our marketing team is ready to assist you.');
  if (f === 'index.html') {
    const stats = [['30+', 'Years of Service'], ['50,000+', 'Trainees per Year'], ['32', 'STCW Courses'], ['MARINA', 'Accredited']];
    const block = '<div id="stats">\n' + stats.map(([n, l], i) =>
      `  <div class="stat"><div class="stat-n"><!--c:training.stat${i + 1}.n-->${n}<!--/c--></div><div class="stat-l"><!--c:training.stat${i + 1}.l-->${l}<!--/c--></div></div>`).join('\n') + '\n</div>';
    h = h.replace(/<div id="stats">[\s\S]*?\n<\/div>/, block);
  }
  if (h !== raw) { fs.writeFileSync(file, h); console.log('updated', f); }
}
