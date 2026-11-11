// Main site > Careers > Apply. Builds PNTC Main Landing Page/careers-apply.html (served at /careers-apply).
// The page takes its head, menu and footer from careers.html, and shows the application form of one opening.
// Openings and their forms come from careers-jobs.json, which the admin writes when Careers is published.
// ?job=<id> picks the opening. ?preview=1 shows what the admin is editing (from this browser only), and sends nothing.
// Rerunnable:  node tools/careers-apply-page.js
const fs = require('fs');
const path = require('path');
const DIR = path.join(__dirname, '..', 'PNTC Main Landing Page');
const SRC = path.join(DIR, 'careers.html');
const OUT = path.join(DIR, 'careers-apply.html');
const DATA = path.join(DIR, 'careers-jobs.json');

const src = fs.readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n');
const cut = (from, to) => { const a = src.indexOf(from), b = src.indexOf(to, a); if (a < 0 || b < 0) throw new Error('not found: ' + from); return src.slice(a, b); };

// head: the shared styles and scripts of careers.html, without its own search script, cards and search data
let head = src.slice(0, src.indexOf('</head>'));
head = head.replace(/<style id="careers-modern">[\s\S]*?<\/style>\n?/, '').replace(/<script id="careers-js">[\s\S]*?<\/script>\n?/, '')
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/, '')
  .replace(/<title>[^<]*<\/title>/, '<title>Apply | Careers at PNTC Colleges</title>')
  .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="Apply for an open position at PNTC Colleges, Inc.">\n<meta name="robots" content="noindex">')
  .replace(/<link rel="canonical" href="[^"]*">/, '<link rel="canonical" href="https://www.pntc.edu.ph/careers-apply">')
  .replace(/(<meta property="og:title" content=")[^"]*/, '$1Apply | Careers at PNTC Colleges')
  .replace(/(<meta property="og:description" content=")[^"]*/, '$1Apply for an open position at PNTC Colleges, Inc.')
  .replace(/(<meta property="og:url" content=")[^"]*/, '$1https://www.pntc.edu.ph/careers-apply');

const nav = cut('<!-- ===================== NAV', '<!-- ===================== HERO');
const footer = src.slice(src.indexOf('<!-- ===================== FOOTER'));

const CSS = `<style id="apply-css">
.ap{background:#fff;padding:3.5rem clamp(1.25rem,4vw,3rem) 5rem;color:#1C1650}
.ap-wrap{max-width:1180px;margin:0 auto;display:grid;grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);gap:2rem;align-items:start}
.ap-back{display:inline-flex;align-items:center;gap:.45rem;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1C1650;text-decoration:none;margin-bottom:1.2rem}
.ap-back:hover{text-decoration:underline}
.ap-job{position:sticky;top:110px;background:#fff;border:1px solid rgba(28,22,80,.1);border-radius:22px;padding:1.7rem 1.6rem;box-shadow:0 22px 46px -34px rgba(28,22,80,.5)}
.ap-job::before{content:'';display:block;height:5px;border-radius:5px;background:#F3CF33;margin:-.4rem 0 1.2rem;width:64px}
.ap-top{display:flex;align-items:flex-start;justify-content:space-between;gap:.7rem}
.ap-dept{font-size:.66rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,22,80,.62);line-height:1.5}
.ap-badge{flex:0 0 auto;font-size:.66rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:.34rem .7rem;border-radius:999px;background:rgba(243,207,51,.45)}
.ap-badge.b-pt{background:rgba(28,22,80,.08)}.ap-badge.b-ct{background:#1C1650;color:#fff}
.ap-title{margin:1rem 0 0;font-size:1.5rem;font-weight:800;line-height:1.2;letter-spacing:-.015em}
.ap-loc{margin:.7rem 0 0;display:flex;align-items:center;gap:.4rem;font-size:.84rem;font-weight:600;color:rgba(28,22,80,.75)}
.ap-loc svg{width:16px;height:16px;fill:none;stroke:#1C1650;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.ap-desc{margin:1rem 0 0;font-size:.9rem;line-height:1.75;color:rgba(28,22,80,.78);white-space:pre-line}
.ap-card{background:#fff;border:1px solid rgba(28,22,80,.1);border-radius:22px;padding:2rem clamp(1.25rem,3vw,2.2rem);box-shadow:0 22px 46px -34px rgba(28,22,80,.5)}
.ap-h{margin:0;font-size:1.35rem;font-weight:800;letter-spacing:-.01em}
.ap-intro{margin:.6rem 0 1.6rem;font-size:.9rem;line-height:1.7;color:rgba(28,22,80,.72);white-space:pre-line}
.ap-q{margin:0 0 1.35rem;border:0;padding:0;min-width:0}
.ap-q>label,.ap-q>legend{display:block;font-size:.86rem;font-weight:700;margin-bottom:.45rem;padding:0}
.ap-req{color:#C0392B;margin-left:.2rem}
.ap-help{display:block;font-size:.76rem;color:rgba(28,22,80,.6);margin:-.2rem 0 .5rem;line-height:1.5}
.ap-in{width:100%;box-sizing:border-box;font:inherit;font-size:.92rem;color:#1C1650;background:#F7F6FB;border:1.5px solid rgba(28,22,80,.12);border-radius:12px;padding:.8rem .95rem;transition:border-color .2s,background .2s,box-shadow .2s}
.ap-in:focus{outline:0;border-color:#1C1650;background:#fff;box-shadow:0 0 0 4px rgba(243,207,51,.35)}
textarea.ap-in{min-height:130px;resize:vertical;line-height:1.6}
select.ap-in{appearance:none;background-image:linear-gradient(45deg,transparent 50%,#1C1650 50%),linear-gradient(135deg,#1C1650 50%,transparent 50%);background-position:calc(100% - 20px) 50%,calc(100% - 14px) 50%;background-size:6px 6px;background-repeat:no-repeat;padding-right:2.4rem}
.ap-opts{display:grid;gap:.5rem}
.ap-opt{display:flex;align-items:center;gap:.65rem;font-size:.9rem;padding:.65rem .85rem;border:1.5px solid rgba(28,22,80,.12);border-radius:12px;background:#F7F6FB;cursor:pointer;transition:border-color .2s,background .2s}
.ap-opt:hover{border-color:rgba(28,22,80,.35)}
.ap-opt input{width:18px;height:18px;accent-color:#1C1650;margin:0;flex:0 0 auto}
.ap-opt:has(input:checked){border-color:#1C1650;background:#fff}
.ap-file{position:relative;display:flex;align-items:center;gap:.9rem;padding:1rem;border:1.5px dashed rgba(28,22,80,.3);border-radius:14px;background:#F7F6FB;cursor:pointer;transition:border-color .2s,background .2s}
.ap-file:hover,.ap-file.drag{border-color:#1C1650;background:#fff}
.ap-file input{position:absolute;inset:0;opacity:0;cursor:pointer;width:100%}
.ap-file-ic{flex:0 0 auto;width:42px;height:42px;border-radius:12px;background:#F3CF33;display:grid;place-items:center}
.ap-file-ic svg{width:20px;height:20px;fill:none;stroke:#1C1650;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ap-file-t{font-size:.86rem;font-weight:700;line-height:1.4;word-break:break-word}
.ap-file-s{display:block;font-size:.74rem;font-weight:500;color:rgba(28,22,80,.6)}
.ap-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.ap-err{display:none;margin:0 0 1rem;padding:.85rem 1rem;border-radius:12px;background:#FDECEA;color:#9B2C1F;font-size:.86rem;font-weight:600;line-height:1.5}
.ap-err.on{display:block}
.ap-send{display:inline-flex;align-items:center;gap:.55rem;border:0;cursor:pointer;font:inherit;font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1C1650;background:#F3CF33;padding:.95rem 1.5rem;border-radius:999px;transition:gap .25s,background .25s,color .25s}
.ap-send:hover{gap:.85rem;background:#1C1650;color:#F3CF33}
.ap-send:disabled{opacity:.6;cursor:default}
.ap-note{margin:1rem 0 0;font-size:.76rem;line-height:1.6;color:rgba(28,22,80,.6)}
.ap-done{text-align:center;padding:2.5rem 1rem}
.ap-done-ic{width:68px;height:68px;margin:0 auto 1.2rem;border-radius:50%;background:#F3CF33;display:grid;place-items:center}
.ap-done-ic svg{width:32px;height:32px;fill:none;stroke:#1C1650;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.ap-done p{font-size:.95rem;line-height:1.7;color:rgba(28,22,80,.78);max-width:460px;margin:.6rem auto 1.6rem;white-space:pre-line}
.ap-preview{max-width:1180px;margin:0 auto 1.5rem;padding:.9rem 1.1rem;border-radius:14px;background:#1C1650;color:#fff;font-size:.84rem;line-height:1.5;display:flex;gap:.7rem;align-items:center}
.ap-preview b{color:#F3CF33}
.ap-msg{max-width:640px;margin:2rem auto;text-align:center;font-size:.95rem;line-height:1.7;color:rgba(28,22,80,.75)}
.ap-cardprev{max-width:1180px;margin:0 auto 2rem}
.ap-cardprev h2{font-size:.74rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(28,22,80,.6);margin:0 0 .8rem}
.ap-cardprev .job-card{max-width:380px;background:#fff;border:1px solid rgba(28,22,80,.1);border-radius:22px;padding:1.6rem 1.5rem 1.5rem;display:flex;flex-direction:column;box-shadow:0 22px 46px -34px rgba(28,22,80,.5)}
.ap-cardprev .job-top{display:flex;align-items:flex-start;justify-content:space-between;gap:.7rem}
.ap-cardprev .job-title{margin:1rem 0 0;font-size:1.22rem;font-weight:800;line-height:1.25}
.ap-cardprev .job-desc{margin:.9rem 0 1.3rem;font-size:.88rem;line-height:1.7;color:rgba(28,22,80,.72)}
.ap-cardprev .job-apply{align-self:flex-start;font-size:.76rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1C1650;background:#F3CF33;padding:.75rem 1.15rem;border-radius:999px;text-decoration:none}
@media(max-width:900px){.ap-wrap{grid-template-columns:1fr}.ap-job{position:static}}
</style>
`;

const BODY = `<section id="page-banner" class="pntc-sub">
  <div class="pntc-sub-in">
    <p class="pntc-sub-eyebrow">Careers</p>
    <h1 id="ap-h1">Apply</h1>
    <p class="pntc-sub-lead" id="ap-lead">Application form</p>
  </div>
</section>

<section class="ap" id="apply">
  <div id="ap-root"><p class="ap-msg">Loading the application form…</p></div>
</section>

<script id="apply-js">
(function(){
  var root=document.getElementById('ap-root'),qs=new URLSearchParams(location.search),preview=qs.get('preview')==='1';
  var PIN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/></svg>';
  var UP='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg>';
  var OK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function badge(t){return t==='Part-Time'?'b-pt':t==='Contract'?'b-ct':'';}
  function none(msg){root.innerHTML='<p class="ap-msg">'+esc(msg)+'</p><p class="ap-msg"><a class="ap-back" href="/careers">&larr; See all openings</a></p>';}

  function field(f){
    var id='q-'+f.id,req=f.required?' required':'',star=f.required?'<span class="ap-req" aria-hidden="true">*</span>':'',help=f.help?'<span class="ap-help">'+esc(f.help)+'</span>':'';
    if(f.type==='radio'||f.type==='checkbox'){
      var opts=(f.options||[]).map(function(o,i){return '<label class="ap-opt"><input type="'+f.type+'" name="'+esc(f.id)+'" value="'+esc(o)+'"'+(f.type==='radio'&&f.required?' required':'')+'> '+esc(o)+'</label>';}).join('');
      return '<fieldset class="ap-q" data-q="'+esc(f.id)+'" data-type="'+f.type+'"'+(f.required?' data-req="1"':'')+'><legend>'+esc(f.label)+star+'</legend>'+help+'<div class="ap-opts">'+opts+'</div></fieldset>';
    }
    var input;
    if(f.type==='paragraph')input='<textarea class="ap-in" id="'+id+'" name="'+esc(f.id)+'"'+req+' maxlength="5000"></textarea>';
    else if(f.type==='select')input='<select class="ap-in" id="'+id+'" name="'+esc(f.id)+'"'+req+'><option value="">Choose…</option>'+(f.options||[]).map(function(o){return '<option>'+esc(o)+'</option>';}).join('')+'</select>';
    else if(f.type==='file')input='<label class="ap-file"><span class="ap-file-ic">'+UP+'</span><span class="ap-file-t" data-name>Choose a file or drop it here<span class="ap-file-s">PDF, Word, JPG or PNG, up to 5 MB</span></span><input type="file" id="'+id+'" name="'+esc(f.id)+'"'+req+' accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"></label>';
    else{var t={email:'email',phone:'tel',number:'number',date:'date',url:'url'}[f.type]||'text';input='<input class="ap-in" type="'+t+'" id="'+id+'" name="'+esc(f.id)+'"'+req+' maxlength="500"'+(t==='tel'?' autocomplete="tel"':t==='email'?' autocomplete="email"':f.id==='name'?' autocomplete="name"':'')+'>';}
    return '<div class="ap-q"><label for="'+id+'">'+esc(f.label)+star+'</label>'+help+input+'</div>';
  }

  function cardHtml(j){
    return '<div class="ap-cardprev"><h2>How the card looks on the Careers page</h2><article class="job-card"><div class="job-top"><span class="ap-dept">'+esc(j.department)+'</span><span class="ap-badge '+badge(j.badgeType)+'">'+esc(j.badgeType||'Full-Time')+'</span></div><h3 class="job-title">'+esc(j.title)+'</h3><p class="ap-loc">'+PIN+'<span>'+esc(j.location)+'</span></p><p class="job-desc">'+esc(j.description)+'</p><span class="job-apply">Apply for this role &rarr;</span></article></div>';
  }

  function render(j){
    var f=j.form||{fields:[]};
    document.title='Apply for '+j.title+' | Careers at PNTC Colleges';
    document.getElementById('ap-h1').textContent=j.title||'Apply';
    document.getElementById('ap-lead').textContent=[j.department,j.location].filter(Boolean).join(' · ');
    root.innerHTML=(preview?'<div class="ap-preview"><b>Preview</b><span>This is how the opening and its form will look once published. Nothing can be sent from this preview.</span></div>'+cardHtml(j):'')
      +'<div class="ap-wrap"><aside><a class="ap-back" href="/careers">&larr; All openings</a><div class="ap-job"><div class="ap-top"><span class="ap-dept">'+esc(j.department)+'</span><span class="ap-badge '+badge(j.badgeType)+'">'+esc(j.badgeType||'Full-Time')+'</span></div><h2 class="ap-title">'+esc(j.title)+'</h2><p class="ap-loc">'+PIN+'<span>'+esc(j.location)+'</span></p>'+(j.description?'<p class="ap-desc">'+esc(j.description)+'</p>':'')+'</div></aside>'
      +'<div class="ap-card" id="ap-card"><h2 class="ap-h">Application form</h2>'+(f.intro?'<p class="ap-intro">'+esc(f.intro)+'</p>':'<div style="height:1.4rem"></div>')
      +'<form id="ap-form" novalidate><div class="ap-err" id="ap-err" role="alert"></div>'+f.fields.map(field).join('')
      +'<div class="ap-hp" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>'
      +'<button class="ap-send" type="submit" id="ap-send">Send application <span aria-hidden="true">&rarr;</span></button>'
      +'<p class="ap-note">Your details are used only by the PNTC Colleges HR office to review your application.</p></form></div></div>';

    [].forEach.call(root.querySelectorAll('.ap-file'),function(box){
      var input=box.querySelector('input'),name=box.querySelector('[data-name]');
      input.addEventListener('change',function(){var fl=input.files[0];name.innerHTML=fl?esc(fl.name)+'<span class="ap-file-s">'+(fl.size/1048576).toFixed(1)+' MB · click to change</span>':'Choose a file or drop it here<span class="ap-file-s">PDF, Word, JPG or PNG, up to 5 MB</span>';});
      ['dragenter','dragover'].forEach(function(e){box.addEventListener(e,function(){box.classList.add('drag');});});
      ['dragleave','drop'].forEach(function(e){box.addEventListener(e,function(){box.classList.remove('drag');});});
    });

    var form=document.getElementById('ap-form'),err=document.getElementById('ap-err'),send=document.getElementById('ap-send');
    function fail(m,el){err.textContent=m;err.classList.add('on');(el||err).scrollIntoView({behavior:'smooth',block:'center'});if(el&&el.focus)el.focus();}
    form.addEventListener('submit',function(e){
      e.preventDefault();err.classList.remove('on');
      for(var i=0;i<f.fields.length;i++){
        var q=f.fields[i],els=form.querySelectorAll('[name="'+q.id+'"]');
        if(q.type==='checkbox'||q.type==='radio'){if(q.required&&!form.querySelector('[name="'+q.id+'"]:checked'))return fail('Please answer "'+q.label+'".',els[0]);continue;}
        var el=els[0];if(!el)continue;
        if(q.type==='file'){var fl=el.files[0];if(q.required&&!fl)return fail('Please attach a file for "'+q.label+'".',el);if(fl&&fl.size>5242880)return fail('The file for "'+q.label+'" is larger than 5 MB.',el);if(fl&&!/\\.(pdf|docx?|jpe?g|png)$/i.test(fl.name))return fail('"'+q.label+'" accepts PDF, Word, JPG or PNG files only.',el);continue;}
        if(q.required&&!el.value.trim())return fail('Please answer "'+q.label+'".',el);
        if(el.value&&el.checkValidity&&!el.checkValidity())return fail('Please check your answer for "'+q.label+'".',el);
      }
      if(preview)return fail('This is a preview. The form works once the opening is published.');
      var data=new FormData(form);data.append('job',j.id);
      send.disabled=true;send.firstChild.textContent='Sending… ';
      fetch('/api/public/careers/apply',{method:'POST',body:data}).then(function(r){return r.json().then(function(d){return{ok:r.ok,d:d};});}).then(function(x){
        if(!x.ok)throw new Error(x.d.error||'Your application could not be sent. Please try again.');
        document.getElementById('ap-card').innerHTML='<div class="ap-done"><div class="ap-done-ic">'+OK+'</div><h2 class="ap-h">Application sent</h2><p>'+esc(x.d.message||f.success)+'</p><a class="ap-send" href="/careers">Back to Careers</a></div>';
        window.scrollTo({top:document.getElementById('apply').offsetTop-90,behavior:'smooth'});
      }).catch(function(e){send.disabled=false;send.firstChild.textContent='Send application ';fail(e.message);});
    });
  }

  if(preview){
    var p=null;try{p=JSON.parse(localStorage.getItem('pntc-career-preview')||'null');}catch(_){}
    return p?render(p):none('Nothing to preview. Open the preview again from the admin console.');
  }
  var id=qs.get('job');
  if(!id)return none('Choose an opening on the Careers page to apply.');
  fetch('/careers-jobs.json',{cache:'no-cache'}).then(function(r){return r.ok?r.json():{jobs:[]};}).then(function(d){
    var j=(d.jobs||[]).filter(function(x){return x.id===id;})[0];
    j?render(j):none('This opening is no longer accepting applications.');
  }).catch(function(){none('The application form could not be loaded. Please refresh the page.');});
})();
</script>

`;

const page = head.replace(/\n*$/, '\n') + CSS + '</head>\n<body>\n\n' + nav + BODY + footer;
fs.writeFileSync(OUT, page.split('\n').join('\r\n'));
if (!fs.existsSync(DATA)) fs.writeFileSync(DATA, '{\n "jobs": []\n}\n');
console.log('written', path.relative(process.cwd(), OUT));
