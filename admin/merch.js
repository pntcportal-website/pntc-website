// Merchandise page (College > Merchandise): turns the items saved in the admin (Landing Page > Merchandise)
// into the product cards on the page, and holds the rules for merchandise orders.
// Each item has up to three model photos (front, side, back), saved in the website under PNTC Colleges/merch/
// and served from /college/merch/.
// Shared by the admin server (publish, orders) and by tools/merch-page.js.
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const VIEWS = [['front', 'Front'], ['side', 'Side'], ['back', 'Back']];
const PHOTO_PATH = /^\/college\/merch\/[\w.\-]+\.(webp|jpe?g|png)$/i;

// ── prices: kept as a plain number, always shown with the peso sign ──
const amount = p => { const n = parseFloat(String(p == null ? '' : p).replace(/[^\d.]/g, '')); return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0; };
const peso = n => n ? '₱ ' + Number(n).toLocaleString('en-PH', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) : '';
// sizes are typed with commas between them, for example "XS, S, M, L, XL"
const sizeList = s => String(s || '').split(/[,/|]+/).map(x => x.trim()).filter(Boolean).slice(0, 15);

// cleans an item saved from the admin
function clean(b) {
  const images = {};
  for (const [k] of VIEWS) if (b.images && PHOTO_PATH.test(String(b.images[k] || ''))) images[k] = String(b.images[k]);
  const n = amount(b.price);
  return {
    name: String(b.name || '').trim().slice(0, 120),
    category: String(b.category || '').trim().slice(0, 60),
    note: String(b.note || '').trim().slice(0, 600),
    price: n ? String(n) : '',
    sizes: sizeList(b.sizes).join(', '),
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
  const n = amount(i.price);
  const sizes = sizeList(i.sizes);
  return `<article class="mc reveal" data-id="${esc(i.id)}" data-cat="${esc(i.category)}" data-name="${esc(i.name)}" data-price="${esc(peso(n))}" data-amount="${n || ''}" data-sizes="${esc(sizes.join(', '))}" data-note="${esc(i.note)}" data-views="${esc(data)}">`
    + `<button class="mc-media" type="button" aria-label="See ${esc(i.name)} up close">`
    + `<img class="mc-main" src="${esc(i.images.front)}" alt="${esc(i.name)}, front view" loading="lazy" decoding="async">`
    + (back ? `<img class="mc-alt" src="${esc(back)}" alt="" aria-hidden="true" loading="lazy" decoding="async">` : '')
    + (i.category ? `<span class="mc-cat">${esc(i.category)}</span>` : '')
    + `</button>`
    + (views.length > 1 ? `<div class="mc-views" role="group" aria-label="Views">${views.map(([k, l], n) => `<button type="button" class="mc-view${n ? '' : ' on'}" data-view="${k}">${l}</button>`).join('')}</div>` : '')
    + `<div class="mc-body"><h3 class="mc-name">${esc(i.name)}</h3>`
    + (i.note ? `<p class="mc-note">${esc(i.note)}</p>` : '')
    + (sizes.length ? `<p class="mc-sizes">Sizes ${esc(sizes.join(', '))}</p>` : '')
    + `<div class="mc-foot">${n ? `<span class="mc-price">${esc(peso(n))}</span>` : '<span></span>'}`
    + (n ? `<button class="mc-btn" type="button" data-order>Order</button>` : `<a class="mc-btn" href="mailto:admissions@mypntc.edu.ph?subject=${encodeURIComponent('Merchandise inquiry, ' + (i.name || ''))}">Inquire</a>`)
    + `</div></div></article>`;
}

// the block that sits between the PNTC_MERCH markers on the page
function build(items) {
  return `    <div class="mc-grid">${(items || []).filter(isShown).map(card).join('')}</div>`;
}

// ── orders ──
// The buyer pays at the Finance Office. Employees may choose salary deduction instead.
// Finance confirms the payment, then Purchasing orders from the supplier and moves the order along.
const STATUS = [
  ['placed', 'Order placed'], ['confirmed', 'Order confirmed'], ['ongoing', 'Ongoing'],
  ['ready', 'Ready for pickup'], ['completed', 'Completed'], ['cancelled', 'Cancelled'],
];
const STATUS_NAME = Object.fromEntries(STATUS);
const BUYERS = { student: 'Student', employee: 'Employee' };
const PAYMENTS = { finance: 'Pay at the Finance Office', salary: 'Salary deduction' };
// who may move an order to which status (Executive, Marketing and IT may do all)
const MOVES = {
  finance: { placed: ['confirmed', 'cancelled'], confirmed: ['placed', 'cancelled'] },
  purchasing: { confirmed: ['ongoing'], ongoing: ['ready', 'confirmed'], ready: ['completed', 'ongoing'], completed: ['ready'] },
};
const canMove = (role, from, to) => {
  if (!STATUS_NAME[to] || from === to) return false;
  const m = MOVES[role];
  return m ? (m[from] || []).includes(to) : true;
};
const orderNo = n => 'M-' + n;

// checks an order from the website against the item. Returns { order } or { error }.
function checkOrder(item, b) {
  const buyer = BUYERS[b.buyer] ? b.buyer : '';
  if (!buyer) return { error: 'Please choose Student or Employee.' };
  const payment = buyer === 'student' ? 'finance' : (PAYMENTS[b.payment] ? b.payment : '');
  if (!payment) return { error: 'Please choose how you will pay.' };
  const t = (k, max) => String(b[k] == null ? '' : b[k]).trim().slice(0, max);
  const name = t('name', 120), email = t('email', 160).toLowerCase(), phone = t('phone', 30), idNo = t('idNumber', 40), dept = t('department', 120), notes = t('notes', 500);
  if (!name) return { error: 'Please enter your full name.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Please enter a valid email address.' };
  if (!/^[0-9+()\-.\s]{7,20}$/.test(phone)) return { error: 'Please enter a valid mobile number.' };
  if (!idNo) return { error: buyer === 'student' ? 'Please enter your student number.' : 'Please enter your employee ID number.' };
  const sizes = sizeList(item.sizes);
  const size = t('size', 30);
  if (sizes.length && !sizes.includes(size)) return { error: 'Please choose a size.' };
  const qty = parseInt(b.quantity, 10);
  if (!(qty >= 1 && qty <= 20)) return { error: 'Please choose a quantity from 1 to 20.' };
  const unit = amount(item.price);
  if (!unit) return { error: 'This item cannot be ordered online yet.' };
  return { order: {
    item_id: item.id, item_name: item.name, size: sizes.length ? size : '', quantity: qty,
    unit_price: unit, total: Math.round(unit * qty * 100) / 100,
    buyer_type: buyer, name, email, phone, id_number: idNo, department: dept, payment_method: payment, notes,
  } };
}

module.exports = { build, card, clean, isShown, VIEWS, amount, peso, sizeList, STATUS, STATUS_NAME, BUYERS, PAYMENTS, canMove, orderNo, checkOrder };
