// Careers page: turns the job openings saved in the admin (Landing Content > Careers) into the cards on the page,
// and holds the application form rules shared by the admin console, the server and the apply page data.
// Shared by the admin console (admin/server.js) and by tools/careers-page.js.
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const HR_EMAIL = 'hr@pntc.edu.ph';
const PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>';
const badgeClass = t => (t === 'Part-Time' ? 'b-pt' : t === 'Contract' ? 'b-ct' : 'b-ft');

// ── Application forms ─────────────────────────────────────────────
// Question types an application form can use (the admin form builder offers the same list).
const FIELD_TYPES = ['short', 'paragraph', 'email', 'phone', 'number', 'date', 'url', 'select', 'radio', 'checkbox', 'file'];
const CHOICE_TYPES = ['select', 'radio', 'checkbox'];
// files applicants may attach (résumé, certificates, IDs)
const FILE_EXT = /\.(pdf|docx?|jpe?g|png)$/i;
const FILE_MAX = 5 * 1024 * 1024;

// The form every new opening starts with. HR can change it for each opening.
const DEFAULT_FORM = {
  intro: 'Please fill in the form below. Fields marked with a star are required.',
  success: 'Thank you for applying. Our HR office will review your application and contact you if you are shortlisted.',
  fields: [
    { id: 'name', type: 'short', label: 'Full name', required: true },
    { id: 'email', type: 'email', label: 'Email address', required: true },
    { id: 'phone', type: 'phone', label: 'Mobile number', required: true },
    { id: 'address', type: 'short', label: 'Current address', required: false },
    { id: 'resume', type: 'file', label: 'Résumé or CV', help: 'PDF, Word or image file, up to 5 MB.', required: true },
    { id: 'letter', type: 'paragraph', label: 'Cover letter or short introduction', required: false },
  ],
};

// Cleans a form saved from the admin so only known settings reach the website.
function normalizeForm(form) {
  const f = form && Array.isArray(form.fields) && form.fields.length ? form : DEFAULT_FORM;
  const used = new Set();
  const fields = f.fields.slice(0, 40).map((x, i) => {
    let id = String(x.id || '').replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'q' + (i + 1);
    while (used.has(id)) id += '_';
    used.add(id);
    const type = FIELD_TYPES.includes(x.type) ? x.type : 'short';
    const out = { id, type, label: String(x.label || '').trim().slice(0, 200) || 'Question ' + (i + 1), required: !!x.required };
    if (x.help) out.help = String(x.help).trim().slice(0, 300);
    if (CHOICE_TYPES.includes(type)) out.options = (Array.isArray(x.options) ? x.options : []).map(o => String(o).trim().slice(0, 150)).filter(Boolean).slice(0, 30);
    return out;
  }).filter(x => !CHOICE_TYPES.includes(x.type) || x.options.length);
  return {
    intro: String(f.intro == null ? DEFAULT_FORM.intro : f.intro).trim().slice(0, 1000),
    success: String(f.success || DEFAULT_FORM.success).trim().slice(0, 1000),
    fields,
  };
}

// Checks one application against its form. Returns { answers } or { error }.
function checkAnswers(form, body, files) {
  const answers = {};
  for (const f of form.fields) {
    if (f.type === 'file') {
      const list = (files || []).filter(x => x.fieldname === f.id);
      if (f.required && !list.length) return { error: `Please attach a file for "${f.label}".` };
      if (list.length > 1) return { error: `Please attach only one file for "${f.label}".` };
      for (const x of list) {
        if (!FILE_EXT.test(x.originalname || '')) return { error: `"${f.label}" accepts PDF, Word, JPG or PNG files only.` };
        if (x.size > FILE_MAX) return { error: `The file for "${f.label}" is larger than 5 MB.` };
      }
      continue;
    }
    let v = body[f.id];
    if (f.type === 'checkbox') {
      v = (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]).map(String).filter(o => f.options.includes(o));
      if (f.required && !v.length) return { error: `Please choose at least one option for "${f.label}".` };
      answers[f.id] = v;
      continue;
    }
    v = String(Array.isArray(v) ? v[0] : v == null ? '' : v).trim().slice(0, f.type === 'paragraph' ? 5000 : 500);
    if (f.required && !v) return { error: `Please answer "${f.label}".` };
    if (v) {
      if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { error: `Please enter a valid email address for "${f.label}".` };
      if (f.type === 'phone' && !/^[0-9+()\-.\s]{7,20}$/.test(v)) return { error: `Please enter a valid phone number for "${f.label}".` };
      if (f.type === 'number' && isNaN(Number(v))) return { error: `Please enter a number for "${f.label}".` };
      if (f.type === 'url' && !/^https?:\/\/\S+$/i.test(v)) return { error: `Please enter a full link starting with https:// for "${f.label}".` };
      if ((f.type === 'select' || f.type === 'radio') && !f.options.includes(v)) return { error: `Please choose an option for "${f.label}".` };
    }
    answers[f.id] = v;
  }
  return { answers };
}

// Only openings marked Open appear on the website. Drafts and closed openings stay in the admin.
const isOpen = i => (i.status || 'open') === 'open';

// ── Cards on the Careers page ─────────────────────────────────────
function card(i) {
  const type = i.badgeType || 'Full-Time';
  const location = i.location || 'Dasmariñas, Cavite';
  return `<article class="job-card reveal" data-type="${esc(type)}">`
    + `<div class="job-top"><span class="job-dept">${esc(i.department)}</span><span class="job-badge ${badgeClass(type)}">${esc(type)}</span></div>`
    + `<h3 class="job-title">${esc(i.title)}</h3>`
    + `<p class="job-meta">${PIN}<span>${esc(location)}</span></p>`
    + `<p class="job-desc">${esc(i.description)}</p>`
    + `<a class="job-apply" href="/careers-apply?job=${encodeURIComponent(i.id || '')}">Apply for this role <span aria-hidden="true">&rarr;</span></a>`
    + `</article>`;
}

// The block that sits between the PNTC_CAREERS markers on the page
function build(items) {
  return `    <div class="jobs-grid">${(items || []).filter(isOpen).map(card).join('')}</div>`;
}

// The data file the apply page reads (careers-jobs.json): open openings and their forms, nothing else
function jobsData(items) {
  return JSON.stringify({
    jobs: (items || []).filter(isOpen).map(i => ({
      id: i.id, title: i.title || '', department: i.department || '', location: i.location || 'Dasmariñas, Cavite',
      badgeType: i.badgeType || 'Full-Time', description: i.description || '', form: normalizeForm(i.form),
    })),
  }, null, 1) + '\n';
}

module.exports = { build, card, jobsData, normalizeForm, checkAnswers, isOpen, DEFAULT_FORM, FIELD_TYPES, HR_EMAIL };
