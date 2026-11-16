// Merchandise page (College > Merchandise): turns the items saved in the admin (Landing Page > Merchandise)
// into the product cards on the page. Each item has up to three model photos (front, side, back), saved in
// the website under PNTC Colleges/merch/ and served from /college/merch/.
// Shared by the admin server (publish) and by tools/merch-page.js.
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const VIEWS = [['front', 'Front'], ['side', 'Side'], ['back', 'Back']];
const PHOTO_PATH = /^\/college\/merch\/[\w.\-]+\.(webp|jpe?g|png)$/i;

// cleans an item saved from the admin
function clean(b) {
  const images = {};
  for (const [k] of VIEWS) if (b.images && PHOTO_PATH.test(String(b.images[k] || ''))) images[k] = String(b.images[k]);
  return {
    name: String(b.name || '').trim().slice(0, 120),
    category: String(b.category || '').trim().slice(0, 60),
    note: String(b.note || '').trim().slice(0, 600),
    price: String(b.price || '').trim().slice(0, 40),
    sizes: String(b.sizes || '').trim().slice(0, 120),
    status: b.status === 'hidden' ? 'hidden' : 'show',
    images,
  };
}

// only items marked to show, with at least the front photo, appear on the website
const isShown = i => (i.status || 'show') === 'show' && i.images && i.images.front;

function card(i) {
  const views = VIEWS.filter(([k]) => i.images[k]);
  const data = JSON.stringify(Object.fromEntries(views.map(([k]) => [k, i.images[k]])));
  const back = i.images.back || i.images.side;
  return `<article class="mc reveal" data-cat="${esc(i.category)}" data-name="${esc(i.name)}" data-price="${esc(i.price)}" data-sizes="${esc(i.sizes)}" data-note="${esc(i.note)}" data-views="${esc(data)}">`
    + `<button class="mc-media" type="button" aria-label="See ${esc(i.name)} up close">`
    + `<img class="mc-main" src="${esc(i.images.front)}" alt="${esc(i.name)}, front view" loading="lazy" decoding="async">`
    + (back ? `<img class="mc-alt" src="${esc(back)}" alt="" aria-hidden="true" loading="lazy" decoding="async">` : '')
    + (i.category ? `<span class="mc-cat">${esc(i.category)}</span>` : '')
    + `</button>`
    + (views.length > 1 ? `<div class="mc-views" role="group" aria-label="Views">${views.map(([k, l], n) => `<button type="button" class="mc-view${n ? '' : ' on'}" data-view="${k}">${l}</button>`).join('')}</div>` : '')
    + `<div class="mc-body"><h3 class="mc-name">${esc(i.name)}</h3>`
    + (i.note ? `<p class="mc-note">${esc(i.note)}</p>` : '')
    + (i.sizes ? `<p class="mc-sizes">Sizes ${esc(i.sizes)}</p>` : '')
    + `<div class="mc-foot">${i.price ? `<span class="mc-price">${esc(i.price)}</span>` : '<span></span>'}`
    + `<a class="mc-btn" href="mailto:admissions@mypntc.edu.ph?subject=${encodeURIComponent('Merchandise inquiry, ' + (i.name || ''))}">Inquire</a></div></div>`
    + `</article>`;
}

// the block that sits between the PNTC_MERCH markers on the page
function build(items) {
  return `    <div class="mc-grid">${(items || []).filter(isShown).map(card).join('')}</div>`;
}

module.exports = { build, card, clean, isShown, VIEWS };
