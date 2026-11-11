/* Careers > job opening editor: status, the application form builder, and Preview.
   Used by landing.html. The form is saved with the opening, and the website shows it at /careers-apply?job=<id>
   after Careers is published. Preview opens that page with what is being edited, before anything is saved. */
(function () {
  var TYPES = [
    ['short', 'Short answer'], ['paragraph', 'Paragraph'], ['email', 'Email'], ['phone', 'Phone number'],
    ['number', 'Number'], ['date', 'Date'], ['url', 'Link'], ['select', 'Dropdown'],
    ['radio', 'Multiple choice (pick one)'], ['checkbox', 'Checkboxes (pick any)'], ['file', 'File upload'],
  ];
  var CHOICE = ['select', 'radio', 'checkbox'];
  var DEFAULT_FORM = {
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
  var STATUS = [
    ['open', 'Open', 'Shown on the Careers page after you click Publish'],
    ['draft', 'Draft', 'Hidden from the website while you prepare it'],
    ['closed', 'Closed', 'Hidden from the website. Applications already received are kept'],
  ];
  var fields = [];
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var $ = function (id) { return document.getElementById(id); };
  var newId = function () { return 'q' + Date.now().toString(36) + Math.floor(Math.random() * 1000); };

  var css = document.createElement('style');
  css.textContent = [
    '.modal-box.cf-wide{max-width:860px}',
    '.cf-sec{margin:1.6rem 0 .9rem;padding-top:1.2rem;border-top:1px solid var(--border)}',
    '.cf-sec h3{font-size:.95rem;font-weight:700;margin:0 0 .3rem}.cf-sec p{font-size:.78rem;color:var(--muted);margin:0;line-height:1.55}',
    '.cf-status{display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem}',
    '.cf-status label{border:1px solid var(--border);border-radius:8px;padding:.65rem .75rem;cursor:pointer;font-size:.8rem;line-height:1.4}',
    '.cf-status label b{display:block;font-size:.85rem}.cf-status label span{color:var(--muted);font-size:.72rem}',
    '.cf-status input{display:none}.cf-status label:has(input:checked){border-color:var(--gold);background:rgba(200,150,12,.1)}',
    '.cf-q{border:1px solid var(--border);border-radius:10px;padding:.9rem 1rem;margin-bottom:.7rem;background:rgba(255,255,255,.02)}',
    '.cf-q-top{display:grid;grid-template-columns:minmax(0,1fr) 210px;gap:.6rem}',
    '.cf-q-row{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-top:.6rem}',
    '.cf-q-row .form-input{flex:1;min-width:200px}',
    '.cf-req{display:flex;align-items:center;gap:.35rem;font-size:.78rem;color:var(--muted);white-space:nowrap;cursor:pointer}',
    '.cf-tools{display:flex;gap:.3rem;margin-left:auto}',
    '.cf-tools button{padding:.3rem .55rem;font-size:.75rem}',
    '.cf-opts{margin-top:.6rem}.cf-opts textarea{min-height:84px}',
    '.cf-num{font-size:.7rem;font-weight:700;color:var(--muted);letter-spacing:.06em;text-transform:uppercase;margin-bottom:.4rem}',
    '.cf-add{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.4rem}',
    '.cf-pill{display:inline-block;padding:.12rem .5rem;border-radius:99px;font-size:.66rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;margin-left:.4rem;vertical-align:middle}',
    '.cf-pill.open{background:rgba(22,163,74,.18);color:#4ade80}.cf-pill.draft{background:rgba(122,139,168,.2);color:var(--text)}.cf-pill.closed{background:rgba(248,113,113,.15);color:#f87171}',
    '.cf-apps{font-size:.76rem;color:var(--gold-lt);text-decoration:none;font-weight:600;margin-left:.5rem}.cf-apps:hover{text-decoration:underline}',
    '@media(max-width:700px){.cf-status{grid-template-columns:1fr}.cf-q-top{grid-template-columns:1fr}}',
  ].join('\n');
  document.head.appendChild(css);

  function typeSelect(q, i) {
    return '<select class="form-select form-input" data-i="' + i + '" data-k="type">' + TYPES.map(function (t) {
      return '<option value="' + t[0] + '"' + (t[0] === q.type ? ' selected' : '') + '>' + t[1] + '</option>';
    }).join('') + '</select>';
  }

  function renderFields() {
    var list = $('cf-list'); if (!list) return;
    list.innerHTML = fields.map(function (q, i) {
      return '<div class="cf-q"><div class="cf-num">Question ' + (i + 1) + '</div>'
        + '<div class="cf-q-top"><input class="form-input" data-i="' + i + '" data-k="label" value="' + esc(q.label) + '" placeholder="Question">' + typeSelect(q, i) + '</div>'
        + (CHOICE.indexOf(q.type) > -1 ? '<div class="cf-opts"><textarea class="form-input" data-i="' + i + '" data-k="options" placeholder="One choice per line">' + esc((q.options || []).join('\n')) + '</textarea></div>' : '')
        + '<div class="cf-q-row"><input class="form-input" data-i="' + i + '" data-k="help" value="' + esc(q.help || '') + '" placeholder="Help text under the question (optional)">'
        + '<label class="cf-req"><input type="checkbox" data-i="' + i + '" data-k="required"' + (q.required ? ' checked' : '') + '> Required</label>'
        + '<div class="cf-tools"><button type="button" class="btn" data-act="up" data-i="' + i + '" title="Move up"' + (i ? '' : ' disabled') + '>↑</button>'
        + '<button type="button" class="btn" data-act="down" data-i="' + i + '" title="Move down"' + (i < fields.length - 1 ? '' : ' disabled') + '>↓</button>'
        + '<button type="button" class="btn" data-act="copy" data-i="' + i + '" title="Duplicate">⧉</button>'
        + '<button type="button" class="btn" data-act="del" data-i="' + i + '" title="Remove" style="color:#f87171">✕</button></div></div></div>';
    }).join('') || '<div style="color:var(--muted);font-size:.82rem;padding:.6rem 0">No questions yet. Add at least one.</div>';
  }

  function onInput(e) {
    var t = e.target, i = t.dataset.i, k = t.dataset.k;
    if (i == null || !k) return;
    var q = fields[+i];
    if (k === 'required') q.required = t.checked;
    else if (k === 'options') q.options = t.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    else if (k === 'type') {
      q.type = t.value;
      if (CHOICE.indexOf(q.type) > -1 && !(q.options || []).length) q.options = ['Option 1', 'Option 2'];
      renderFields();
    } else q[k] = t.value;
  }

  function onClick(e) {
    var b = e.target.closest('[data-act]'); if (!b) return;
    var i = +b.dataset.i, a = b.dataset.act;
    if (a === 'up' && i > 0) fields.splice(i - 1, 0, fields.splice(i, 1)[0]);
    if (a === 'down' && i < fields.length - 1) fields.splice(i + 1, 0, fields.splice(i, 1)[0]);
    if (a === 'copy') fields.splice(i + 1, 0, Object.assign({}, JSON.parse(JSON.stringify(fields[i])), { id: newId() }));
    if (a === 'del') { if (!confirm('Remove this question?')) return; fields.splice(i, 1); }
    if (a === 'add') fields.push({ id: newId(), type: b.dataset.type, label: '', required: false, options: CHOICE.indexOf(b.dataset.type) > -1 ? ['Option 1', 'Option 2'] : undefined });
    if (a === 'reset') { if (!confirm('Replace the questions with the standard application form?')) return; fields = JSON.parse(JSON.stringify(DEFAULT_FORM.fields)); }
    renderFields();
  }

  // The editor HTML for a job opening (landing.html calls this from formCareers)
  window.careersFormHtml = function (item) {
    var form = item && item.form && (item.form.fields || []).length ? item.form : DEFAULT_FORM;
    fields = JSON.parse(JSON.stringify(form.fields));
    var status = (item && item.status) || (item ? 'open' : 'draft');
    setTimeout(function () {
      document.querySelector('#modal .modal-box').classList.add('cf-wide');
      var box = $('cf-list'); if (!box) return;
      box.addEventListener('input', onInput); box.addEventListener('change', onInput);
      box.addEventListener('click', onClick); $('cf-add').addEventListener('click', onClick);
      renderFields();
      var pv = $('modal-preview-btn'); if (pv) pv.hidden = false;
    });
    return '<div class="cf-sec" style="border:0;padding-top:0;margin-top:0"><h3>Status</h3></div><div class="cf-status">' + STATUS.map(function (s) {
        return '<label><input type="radio" name="cf-status" value="' + s[0] + '"' + (s[0] === status ? ' checked' : '') + '><b>' + s[1] + '</b><span>' + s[2] + '</span></label>';
      }).join('') + '</div>';
  };
  window.careersFormBuilderHtml = function (item) {
    var form = item && item.form && (item.form.fields || []).length ? item.form : DEFAULT_FORM;
    return '<div class="cf-sec"><h3>Application form</h3><p>The form people fill in when they click Apply for this role. Use Preview to check it before saving or publishing.</p></div>'
      + '<div class="form-group"><label class="form-label">Text above the form</label><textarea class="form-input" id="cf-intro" rows="2">' + esc(form.intro) + '</textarea></div>'
      + '<div id="cf-list"></div>'
      + '<div class="cf-add" id="cf-add"><button type="button" class="btn" data-act="add" data-type="short">+ Short answer</button><button type="button" class="btn" data-act="add" data-type="paragraph">+ Paragraph</button>'
      + '<button type="button" class="btn" data-act="add" data-type="radio">+ Multiple choice</button><button type="button" class="btn" data-act="add" data-type="checkbox">+ Checkboxes</button>'
      + '<button type="button" class="btn" data-act="add" data-type="select">+ Dropdown</button><button type="button" class="btn" data-act="add" data-type="file">+ File upload</button>'
      + '<button type="button" class="btn" data-act="reset" style="margin-left:auto">Use standard form</button></div>'
      + '<div class="form-group" style="margin-top:1.1rem"><label class="form-label">Message after sending</label><textarea class="form-input" id="cf-success" rows="2">' + esc(form.success) + '</textarea></div>';
  };

  window.careersDefaultForm = function () { return JSON.parse(JSON.stringify(DEFAULT_FORM)); };

  // What the editor holds right now (saved by landing.html, and used by Preview)
  window.careersFormValue = function () {
    var st = document.querySelector('input[name="cf-status"]:checked');
    return {
      status: st ? st.value : 'draft',
      form: {
        intro: ($('cf-intro') || {}).value || '',
        success: ($('cf-success') || {}).value || '',
        fields: fields.map(function (q) {
          var o = { id: q.id, type: q.type, label: (q.label || '').trim(), required: !!q.required };
          if ((q.help || '').trim()) o.help = q.help.trim();
          if (CHOICE.indexOf(q.type) > -1) o.options = q.options || [];
          return o;
        }),
      },
    };
  };
  window.careersFormProblem = function () {
    if (!fields.length) return 'Add at least one question to the application form.';
    for (var i = 0; i < fields.length; i++) {
      if (!(fields[i].label || '').trim()) return 'Question ' + (i + 1) + ' needs a question text.';
      if (CHOICE.indexOf(fields[i].type) > -1 && !(fields[i].options || []).length) return 'Question ' + (i + 1) + ' needs at least one choice.';
    }
    return '';
  };

  // Preview: opens the apply page with the opening as it is in the editor (nothing is saved or published)
  window.careersPreview = function (job) {
    try { localStorage.setItem('pntc-career-preview', JSON.stringify(job)); }
    catch (e) { alert('Preview needs browser storage, which is blocked in this window.'); return; }
    window.open('/careers-apply?preview=1', '_blank');
  };

  // List row extras: status pill and the link to its applications
  window.careersRowExtras = function (item, counts) {
    var st = item.status || 'open', c = (counts || {})[item.id];
    var apps = c ? c.total + (c.total === 1 ? ' application' : ' applications') + (c.new ? ', ' + c.new + ' new' : '') : 'No applications yet';
    return '<span class="cf-pill ' + st + '">' + st + '</span><a class="cf-apps" href="applications.html?job=' + encodeURIComponent(item.id) + '">' + apps + '</a>';
  };
})();
