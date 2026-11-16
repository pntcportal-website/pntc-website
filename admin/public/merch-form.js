/* Landing Page > Merchandise: the item editor with its model photos (front, side, back).
   Photos are made small in the browser (WebP, at most 1400 px on the long side) and saved into the website
   when the item is saved, all three in one upload. The front photo is required, so the page never shows
   an item without a picture. Used by landing.html. */
(function () {
  var VIEWS = [['front', 'Front view', true], ['side', 'Side view', false], ['back', 'Back view', false]];
  var CATS = ['Apparel', 'Uniform', 'PE Uniform', 'Accessories', 'Bags', 'Academic'];
  var state = { images: {}, files: {}, previews: {}, dataUrls: {} };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var $ = function (id) { return document.getElementById(id); };

  var css = document.createElement('style');
  css.textContent = [
    '.modal-box.mf-wide{max-width:760px}',
    '.mf-photos{display:grid;grid-template-columns:repeat(3,1fr);gap:.75rem}',
    '.mf-slot{border:1px dashed var(--border);border-radius:10px;padding:.55rem;display:flex;flex-direction:column;gap:.45rem}',
    '.mf-slot b{font-size:.74rem}.mf-slot b i{color:#f87171;font-style:normal}',
    '.mf-pic{aspect-ratio:4/5;border-radius:8px;background:rgba(255,255,255,.04);display:grid;place-items:center;overflow:hidden;font-size:.72rem;color:var(--muted);text-align:center;padding:.4rem}',
    '.mf-pic img{width:100%;height:100%;object-fit:contain;background:#f3f2f8}',
    '.mf-btns{display:flex;gap:.35rem}.mf-btns .btn{flex:1;padding:.3rem .4rem;font-size:.72rem}',
    '.mf-hint{font-size:.74rem;color:var(--muted);line-height:1.55;margin:.2rem 0 .6rem}',
    '.mf-status{display:flex;gap:.5rem}.mf-status label{flex:1;border:1px solid var(--border);border-radius:8px;padding:.55rem .7rem;font-size:.78rem;cursor:pointer;line-height:1.4}',
    '.mf-status input{display:none}.mf-status label:has(input:checked){border-color:var(--gold);background:rgba(200,150,12,.1)}.mf-status span{display:block;font-size:.7rem;color:var(--muted)}',
    '.mf-thumb{width:40px;height:50px;object-fit:cover;border-radius:6px;background:#f3f2f8;flex-shrink:0}',
    '.mf-pill{display:inline-block;padding:.1rem .45rem;border-radius:99px;font-size:.62rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;margin-left:.4rem;vertical-align:middle}',
    '.mf-pill.show{background:rgba(22,163,74,.18);color:#4ade80}.mf-pill.hidden{background:rgba(122,139,168,.2);color:var(--text)}.mf-pill.warn{background:rgba(248,113,113,.15);color:#f87171}',
    '@media(max-width:640px){.mf-photos{grid-template-columns:1fr 1fr}}',
  ].join('\n');
  document.head.appendChild(css);

  function slotHtml(v) {
    var src = state.previews[v[0]] || state.images[v[0]];
    return '<div class="mf-slot" data-view="' + v[0] + '"><b>' + v[1] + (v[2] ? ' <i>*</i>' : '') + '</b>'
      + '<div class="mf-pic">' + (src ? '<img src="' + esc(src) + '" alt="">' : 'No photo yet') + '</div>'
      + '<div class="mf-btns"><button type="button" class="btn" data-pick="' + v[0] + '">' + (src ? 'Change' : 'Choose photo') + '</button>'
      + (src && !v[2] ? '<button type="button" class="btn" data-drop="' + v[0] + '" style="color:#f87171">Remove</button>' : '') + '</div></div>';
  }
  function renderSlots() { var el = $('mf-photos'); if (el) el.innerHTML = VIEWS.map(slotHtml).join(''); }

  // makes a photo small enough for the website (WebP when the browser can, JPG otherwise)
  async function shrink(file) {
    var img = await createImageBitmap(file);
    var k = Math.min(1, 1400 / Math.max(img.width, img.height));
    var c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    var blob = await new Promise(function (r) { c.toBlob(r, 'image/webp', 0.82); });
    var ext = 'webp';
    if (!blob || blob.type !== 'image/webp') { blob = await new Promise(function (r) { c.toBlob(r, 'image/jpeg', 0.85); }); ext = 'jpg'; }
    return new File([blob], 'photo.' + ext, { type: blob.type });
  }

  function onClick(e) {
    var pick = e.target.closest('[data-pick]'), drop = e.target.closest('[data-drop]');
    if (pick) {
      var input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/jpeg,image/png,image/webp';
      input.onchange = async function () {
        var f = input.files[0]; if (!f) return;
        var v = pick.dataset.pick;
        try {
          var small = await shrink(f);
          state.files[v] = small;
          state.previews[v] = URL.createObjectURL(small);
          state.dataUrls[v] = await new Promise(function (r) { var fr = new FileReader(); fr.onload = function () { r(fr.result); }; fr.readAsDataURL(small); });
          renderSlots();
        } catch (err) { alert('This photo could not be read. Please use a JPG, PNG or WebP photo.'); }
      };
      input.click();
    }
    if (drop) { var d = drop.dataset.drop; delete state.files[d]; delete state.previews[d]; delete state.dataUrls[d]; delete state.images[d]; renderSlots(); }
  }

  window.merchFormHtml = function (item) {
    state = { images: Object.assign({}, (item && item.images) || {}), files: {}, previews: {}, dataUrls: {} };
    var status = (item && item.status) || 'show';
    setTimeout(function () {
      document.querySelector('#modal .modal-box').classList.add('mf-wide');
      var box = $('mf-photos'); if (!box) return;
      box.addEventListener('click', onClick);
      renderSlots();
    });
    return '<div class="form-group"><label class="form-label">On the website</label><div class="mf-status">'
      + '<label><input type="radio" name="mf-status" value="show"' + (status === 'show' ? ' checked' : '') + '>Show<span>Appears on the Merchandise page after you click Publish</span></label>'
      + '<label><input type="radio" name="mf-status" value="hidden"' + (status === 'hidden' ? ' checked' : '') + '>Hidden<span>Kept here only</span></label></div></div>'
      + '<div class="form-group"><label class="form-label">Model photos</label>'
      + '<p class="mf-hint">The front photo is required. Side and back are optional. On the website the card turns to the back view when the mouse is over it, and visitors can switch between the views. Portrait photos on a plain light background look best.</p>'
      + '<div class="mf-photos" id="mf-photos"></div></div>'
      + '<div class="form-group"><label class="form-label">Item name</label><input class="form-input" id="f-name" value="' + esc(item && item.name) + '" placeholder="e.g. PNTC Classic Polo Shirt"></div>'
      + '<div class="form-group"><label class="form-label">Category</label><input class="form-input" id="f-category" list="mf-cats" value="' + esc(item && item.category) + '" placeholder="e.g. Apparel"><datalist id="mf-cats">' + CATS.map(function (c) { return '<option value="' + c + '">'; }).join('') + '</datalist></div>'
      + '<div class="form-group"><label class="form-label">Description</label><textarea class="form-input" id="f-note" rows="3" placeholder="Material, colors, what makes it special">' + esc(item && item.note) + '</textarea></div>'
      + '<div class="form-group"><label class="form-label">Price <span style="opacity:.6">(numbers only, the peso sign is added on the website)</span></label><input class="form-input" id="f-price" value="' + esc(item && item.price) + '" placeholder="e.g. 450" inputmode="decimal"></div>'
      + '<div class="form-group"><label class="form-label">Sizes <span style="opacity:.6">(optional, separate them with commas. Buyers choose one when ordering)</span></label><input class="form-input" id="f-sizes" value="' + esc(item && item.sizes) + '" placeholder="e.g. XS, S, M, L, XL, 2XL"></div>';
  };

  // uploads new photos (one save, one upload) and returns the item to save
  window.merchFormValue = async function () {
    var name = ($('f-name').value || '').trim();
    if (!name) throw new Error('Add the item name.');
    if (!state.images.front && !state.files.front) throw new Error('Add the front photo.');
    var views = Object.keys(state.files);
    if (views.length) {
      var fd = new FormData();
      fd.append('name', name);
      views.forEach(function (v) { fd.append(v, state.files[v], v + '.' + state.files[v].name.split('.').pop()); });
      var r = await fetch('/api/landing/merchandise/photos', { method: 'POST', body: fd });
      var d = await r.json().catch(function () { return {}; });
      if (!r.ok) throw new Error(d.error || 'The photos could not be saved.');
      Object.assign(state.images, d.images);
      state.files = {};
    }
    var st = document.querySelector('input[name="mf-status"]:checked');
    return {
      name: name, category: ($('f-category').value || '').trim(), note: ($('f-note').value || '').trim(),
      price: ($('f-price').value || '').trim(), sizes: ($('f-sizes').value || '').trim(),
      status: st ? st.value : 'show', images: state.images,
    };
  };

  // Preview: opens the Merchandise page with this item added as a card (from the editor, or a saved item)
  window.merchPreview = function (saved) {
    var it;
    if (saved) it = { name: saved.name, category: saved.category, note: saved.note, price: saved.price, sizes: saved.sizes, images: saved.images || {} };
    else {
      var imgs = {};
      VIEWS.forEach(function (v) { var k = v[0]; if (state.dataUrls[k]) imgs[k] = state.dataUrls[k]; else if (state.images[k]) imgs[k] = state.images[k]; });
      it = { name: ($('f-name').value || '').trim(), category: ($('f-category').value || '').trim(), note: ($('f-note').value || '').trim(),
        price: ($('f-price').value || '').trim(), sizes: ($('f-sizes').value || '').trim(), images: imgs };
    }
    if (!it.images || !it.images.front) { alert('Add the front photo to see a preview.'); return; }
    try { localStorage.setItem('pntc-merch-preview', JSON.stringify(it)); }
    catch (e) { alert('The photos are too large for a preview in this browser. Save the item, then use Preview in the list.'); return; }
    window.open('/college/merchandise?preview=1#merchandise', '_blank');
  };

  // the row in the list: small photo, status and missing photo warning
  window.merchRowExtras = function (item) {
    var st = item.status || 'show', front = item.images && item.images.front;
    return { thumb: front ? '<img class="mf-thumb" src="' + esc(front) + '" alt="">' : '',
      pill: !front ? '<span class="mf-pill warn">Needs front photo</span>' : '<span class="mf-pill ' + st + '">' + (st === 'show' ? 'Shown' : 'Hidden') + '</span>' };
  };
})();
