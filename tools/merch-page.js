// College > Merchandise. Modern shop layout for PNTC Colleges/merchandise.html.
// The product cards come from the admin (Landing Page > Merchandise) through admin/merch.js, each with model
// photos (front, side, back). This script builds the section around the cards, the quick view and their styles.
// The texts around the cards are Site Content slots (group college-merch). No sample items are added.
// Rerunnable:  node tools/merch-page.js
const fs = require('fs');
const path = require('path');
const C = require('../admin/content.js');
const MERCH = require('../admin/merch.js');
const FILE = path.join(__dirname, '..', 'PNTC Colleges', 'merchandise.html');
const START = '<!-- PNTC_MERCH_START -->', END = '<!-- PNTC_MERCH_END -->';
const slot = (key, v) => `<!--c:${key}-->${v}<!--/c-->`;

const raw = fs.readFileSync(FILE, 'utf8');
const crlf = raw.includes('\r\n');
const before = raw.replace(/\r\n/g, '\n');
let h = before;

// cards already published stay; the old sample cards (emoji tiles) are dropped
const s0 = h.indexOf(START), e0 = h.indexOf(END);
const oldBlock = s0 > -1 ? h.slice(s0 + START.length, e0) : '';
const cards = /class="mc-grid"/.test(oldBlock) ? oldBlock.trim() : MERCH.build([]).trim();

const SECTION = `<section id="merchandise" class="mx">
  <div class="mx-wrap">
    <div class="mx-head reveal">
      <div class="mx-head-text">
        <p class="mx-eyebrow">${slot('merch.eyebrow', 'Official Campus Store')}</p>
        <h2 class="mx-h2">${slot('merch.title', 'Wear Your')} <span class="mx-mark">${slot('merch.mark', 'PNTC Pride')}</span></h2>
        <p class="mx-intro">${slot('merch.intro', 'Official PNTC merchandise for students, alumni and supporters. Tap any item to see it up close, then ask the Campus Store about sizes and availability.')}</p>
      </div>
      <a class="mx-ask" id="mx-email" data-c="merch.email" href="mailto:admissions@mypntc.edu.ph"><span>${slot('merch.ask', 'Questions about an item?')}</span><b>${slot('merch.email', 'admissions@mypntc.edu.ph')}</b></a>
    </div>
    <div class="mx-chips" id="mx-chips" role="group" aria-label="Filter by category" hidden></div>
    ${START}
    ${cards}
    ${END}
    <p class="mx-none" id="mx-none" hidden>${slot('merch.none', 'New merchandise will be posted here soon. You may ask the Campus Store about the items available today.')}</p>
  </div>
</section>

<div class="mq" id="mq" role="dialog" aria-modal="true" aria-labelledby="mq-name" hidden>
  <div class="mq-box">
    <button class="mq-x" type="button" id="mq-x" aria-label="Close">&times;</button>
    <div class="mq-media">
      <div class="mq-stage"><img id="mq-img" src="" alt=""></div>
      <div class="mq-thumbs" id="mq-thumbs"></div>
    </div>
    <div class="mq-info">
      <p class="mq-cat" id="mq-cat"></p>
      <h3 class="mq-name" id="mq-name"></h3>
      <p class="mq-price" id="mq-price"></p>
      <p class="mq-note" id="mq-note"></p>
      <p class="mq-sizes" id="mq-sizes"></p>
      <a class="mq-btn" id="mq-btn" href="mailto:admissions@mypntc.edu.ph">Inquire about this item</a>
    </div>
  </div>
</div>`;

const CSS = `<style id="merch-modern">
/* Merchandise shop, built by tools/merch-page.js */
#merchandise.mx{background:#fff;padding:5.5rem clamp(1.25rem,4vw,3rem) 6rem;position:relative;overflow:hidden;font-family:'Montserrat',sans-serif;color:#1C1650}
#merchandise.mx::before{content:'';position:absolute;left:-220px;top:-200px;width:620px;height:620px;border-radius:50%;background:radial-gradient(circle,rgba(243,207,51,.22),transparent 68%);pointer-events:none}
.mx-wrap{max-width:1240px;margin:0 auto;position:relative}
.mx-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1.5rem 2.5rem;flex-wrap:wrap;margin-bottom:2rem}
.mx-head-text{max-width:640px}
.mx-eyebrow{display:inline-flex;align-items:center;gap:.6rem;font-size:.7rem;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:#1C1650;margin:0 0 .9rem}
.mx-eyebrow::before{content:'';width:26px;height:3px;border-radius:3px;background:#F3CF33}
.mx-h2{margin:0;font-size:clamp(2rem,4.6vw,3.4rem);font-weight:900;line-height:1.05;letter-spacing:-.03em;color:#1C1650}
.mx-mark{position:relative;display:inline-block;z-index:0}
.mx-mark::after{content:'';position:absolute;left:-.1em;right:-.1em;bottom:.08em;height:.32em;background:#F3CF33;z-index:-1;border-radius:3px;transform:skewX(-8deg)}
.mx-intro{margin:1rem 0 0;font-size:.98rem;line-height:1.75;color:rgba(28,22,80,.72)}
.mx-ask{display:inline-flex;flex-direction:column;gap:.15rem;text-decoration:none;background:#1C1650;color:#fff;padding:.95rem 1.5rem;border-radius:20px;transition:transform .25s,box-shadow .25s}
.mx-ask span{font-size:.72rem;font-weight:600;color:rgba(255,255,255,.75)}
.mx-ask b{font-size:.98rem;font-weight:800;color:#F3CF33}
.mx-ask:hover{transform:translateY(-3px);box-shadow:0 18px 30px -14px rgba(28,22,80,.6)}
.mx-chips{display:flex;gap:.5rem;flex-wrap:wrap;margin:0 0 1.6rem}
.mx-chips[hidden]{display:none}
.mx-chip{font:inherit;font-size:.78rem;font-weight:700;padding:.55rem 1.1rem;border-radius:999px;border:1.5px solid rgba(28,22,80,.15);background:#fff;color:#1C1650;cursor:pointer;transition:background .2s,border-color .2s,color .2s}
.mx-chip:hover{border-color:#1C1650}
.mx-chip.on{background:#1C1650;border-color:#1C1650;color:#F3CF33}
.mc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,265px),1fr));gap:1.4rem}
.mc-grid:empty{display:none}
.mc{background:#fff;border:1px solid rgba(28,22,80,.1);border-radius:24px;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 24px 44px -36px rgba(28,22,80,.55);transition:transform .3s,box-shadow .3s}
.mc[hidden]{display:none}
.mc:hover{transform:translateY(-6px);box-shadow:0 32px 56px -32px rgba(28,22,80,.6)}
.mc-media{position:relative;display:block;width:100%;aspect-ratio:4/5;border:0;padding:0;cursor:zoom-in;background:radial-gradient(120% 90% at 50% 15%,#FFFFFF 0%,#F2F1F8 55%,#E8E6F3 100%);overflow:hidden}
.mc-media img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;transition:opacity .45s,transform .6s}
.mc-alt{opacity:0}
@media(hover:hover){.mc:hover .mc-media img.mc-main{opacity:0}.mc:hover .mc-media img.mc-alt{opacity:1;transform:scale(1.03)}.mc.picked .mc-media img.mc-alt{opacity:0}.mc.picked .mc-media img.mc-main{opacity:1}}
.mc-cat{position:absolute;left:.9rem;top:.9rem;font-size:.64rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;padding:.38rem .75rem;border-radius:999px;background:rgba(255,255,255,.9);color:#1C1650;box-shadow:0 6px 14px -8px rgba(28,22,80,.5)}
.mc-views{display:flex;gap:.35rem;justify-content:center;padding:.7rem .9rem 0}
.mc-view{font:inherit;font-size:.68rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:.35rem .75rem;border-radius:999px;border:1.5px solid rgba(28,22,80,.14);background:#fff;color:rgba(28,22,80,.7);cursor:pointer}
.mc-view.on{background:#F3CF33;border-color:#F3CF33;color:#1C1650}
.mc-body{padding:1rem 1.25rem 1.25rem;display:flex;flex-direction:column;flex:1}
.mc-name{margin:0;font-size:1.06rem;font-weight:800;line-height:1.3;letter-spacing:-.01em;color:#1C1650}
.mc-note{margin:.4rem 0 0;font-size:.84rem;line-height:1.6;color:rgba(28,22,80,.68);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.mc-sizes{margin:.45rem 0 0;font-size:.74rem;font-weight:700;color:rgba(28,22,80,.6)}
.mc-foot{display:flex;align-items:center;justify-content:space-between;gap:.8rem;margin-top:auto;padding-top:1rem}
.mc-price{font-size:1.15rem;font-weight:900;color:#1C1650}
.mc-btn{font-size:.74rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;text-decoration:none;color:#1C1650;background:#F3CF33;padding:.65rem 1.1rem;border-radius:999px;transition:background .25s,color .25s}
.mc-btn:hover{background:#1C1650;color:#F3CF33}
.mx-none{margin:0;padding:2.4rem 1.5rem;border:1.5px dashed rgba(28,22,80,.18);border-radius:22px;background:#F7F6FB;text-align:center;font-size:.95rem;line-height:1.7;color:rgba(28,22,80,.75)}
.mx-none[hidden]{display:none}
/* quick view */
.mq{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:clamp(.75rem,3vw,2rem);background:rgba(16,11,51,.72);backdrop-filter:blur(4px)}
.mq[hidden]{display:none}
.mq-box{position:relative;width:min(980px,100%);max-height:calc(100vh - 2rem);overflow:auto;background:#fff;border-radius:26px;display:grid;grid-template-columns:1.1fr 1fr;color:#1C1650;font-family:'Montserrat',sans-serif}
.mq-x{position:absolute;right:.8rem;top:.8rem;z-index:2;width:42px;height:42px;border-radius:50%;border:0;background:#1C1650;color:#fff;font-size:1.5rem;line-height:1;cursor:pointer}
.mq-media{background:radial-gradient(120% 90% at 50% 15%,#FFFFFF 0%,#F2F1F8 55%,#E8E6F3 100%);padding:1.2rem;display:flex;flex-direction:column;gap:.8rem}
.mq-stage{aspect-ratio:4/5;display:grid;place-items:center}
.mq-stage img{width:100%;height:100%;object-fit:contain}
.mq-thumbs{display:flex;gap:.6rem;justify-content:center}
.mq-thumb{width:68px;border:2px solid transparent;border-radius:12px;padding:0;background:#fff;cursor:pointer;overflow:hidden;display:flex;flex-direction:column;align-items:center;font:inherit}
.mq-thumb img{width:100%;aspect-ratio:4/5;object-fit:contain;background:#F2F1F8}
.mq-thumb span{font-size:.6rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:.25rem 0;color:rgba(28,22,80,.7)}
.mq-thumb.on{border-color:#F3CF33}
.mq-info{padding:2.4rem 2rem 2rem;display:flex;flex-direction:column}
.mq-cat{margin:0;font-size:.7rem;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:rgba(28,22,80,.6)}
.mq-name{margin:.5rem 0 0;font-size:clamp(1.4rem,2.6vw,1.9rem);font-weight:900;line-height:1.15;letter-spacing:-.02em}
.mq-price{margin:.7rem 0 0;font-size:1.4rem;font-weight:900}
.mq-note{margin:1rem 0 0;font-size:.92rem;line-height:1.75;color:rgba(28,22,80,.75);white-space:pre-line}
.mq-sizes{margin:.9rem 0 0;font-size:.82rem;font-weight:700}
.mq-btn{margin-top:auto;align-self:flex-start;display:inline-block;text-decoration:none;font-size:.8rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#1C1650;background:#F3CF33;padding:.95rem 1.5rem;border-radius:999px;transition:background .25s,color .25s}
.mq-btn:hover{background:#1C1650;color:#F3CF33}
.mq-info p:empty{display:none}
@media(max-width:760px){.mq-box{grid-template-columns:1fr}.mq-info{padding:1.4rem 1.4rem 1.6rem}.mq-btn{margin-top:1.4rem;align-self:stretch;text-align:center}}
@media(max-width:640px){#merchandise.mx{padding:4rem 1.25rem 4.5rem}.mx-ask{width:100%}}
@media(prefers-reduced-motion:reduce){.mc,.mc-media img,.mx-ask,.mc-btn{transition:none}}
</style>`;

const JS = `<script id="merch-js">
/* Merchandise: category filter, front, side and back views on each card, quick view, and the store email on every Inquire button */
document.addEventListener('DOMContentLoaded',function(){
  var cards=[].slice.call(document.querySelectorAll('#merchandise .mc')),chips=document.getElementById('mx-chips'),none=document.getElementById('mx-none');
  if(!chips)return;
  if(!cards.length){none.hidden=false;return;}
  var mail=document.getElementById('mx-email'),addr=mail?(mail.getAttribute('href')||'').replace(/^mailto:/,'').split('?')[0]:'';
  var NAMES={front:'Front',side:'Side',back:'Back'};
  function views(c){try{return JSON.parse(c.getAttribute('data-views')||'{}');}catch(e){return {};}}
  function mailto(c){return 'mailto:'+addr+'?subject='+encodeURIComponent('Merchandise inquiry, '+c.getAttribute('data-name'));}
  cards.forEach(function(c){
    var b=c.querySelector('.mc-btn');if(b&&addr)b.href=mailto(c);
    /* view buttons on the card */
    c.querySelectorAll('.mc-view').forEach(function(btn){btn.addEventListener('click',function(){
      var v=views(c);c.querySelector('.mc-main').src=v[btn.getAttribute('data-view')];c.querySelector('.mc-main').alt=c.getAttribute('data-name')+', '+btn.textContent.toLowerCase()+' view';
      c.classList.add('picked');c.querySelectorAll('.mc-view').forEach(function(x){x.classList.toggle('on',x===btn);});
    });});
    c.querySelector('.mc-media').addEventListener('click',function(){open(c);});
  });
  /* category filter, shown when there is more than one category */
  var cats=[];cards.forEach(function(c){var t=c.getAttribute('data-cat');if(t&&cats.indexOf(t)<0)cats.push(t);});
  if(cats.length>1){
    ['All'].concat(cats).forEach(function(t,i){var b=document.createElement('button');b.type='button';b.className='mx-chip'+(i?'':' on');b.textContent=t;
      b.addEventListener('click',function(){[].forEach.call(chips.children,function(x){x.classList.toggle('on',x===b);});cards.forEach(function(c){c.hidden=!(t==='All'||c.getAttribute('data-cat')===t);});});chips.appendChild(b);});
    chips.hidden=false;
  }
  /* quick view */
  var mq=document.getElementById('mq'),img=document.getElementById('mq-img'),thumbs=document.getElementById('mq-thumbs'),last=null,cur=null,keys=[];
  function show(k){var v=views(cur);img.src=v[k];img.alt=cur.getAttribute('data-name')+', '+NAMES[k].toLowerCase()+' view';[].forEach.call(thumbs.children,function(t){t.classList.toggle('on',t.getAttribute('data-k')===k);});}
  function open(c){
    cur=c;last=document.activeElement;var v=views(c);keys=['front','side','back'].filter(function(k){return v[k];});
    document.getElementById('mq-cat').textContent=c.getAttribute('data-cat')||'';
    document.getElementById('mq-name').textContent=c.getAttribute('data-name')||'';
    document.getElementById('mq-price').textContent=c.getAttribute('data-price')||'';
    document.getElementById('mq-note').textContent=c.getAttribute('data-note')||'';
    var sz=c.getAttribute('data-sizes');document.getElementById('mq-sizes').textContent=sz?'Sizes '+sz:'';
    document.getElementById('mq-btn').href=addr?mailto(c):c.querySelector('.mc-btn').href;
    thumbs.innerHTML=keys.length>1?keys.map(function(k){return '<button type="button" class="mq-thumb" data-k="'+k+'"><img src="'+v[k]+'" alt=""><span>'+NAMES[k]+'</span></button>';}).join(''):'';
    show(keys[0]);mq.hidden=false;document.body.style.overflow='hidden';document.getElementById('mq-x').focus();
  }
  function close(){mq.hidden=true;document.body.style.overflow='';if(last)last.focus();}
  thumbs.addEventListener('click',function(e){var t=e.target.closest('.mq-thumb');if(t)show(t.getAttribute('data-k'));});
  document.getElementById('mq-x').addEventListener('click',close);
  mq.addEventListener('click',function(e){if(e.target===mq)close();});
  document.addEventListener('keydown',function(e){
    if(mq.hidden)return;
    if(e.key==='Escape')close();
    if(e.key==='ArrowRight'||e.key==='ArrowLeft'){var on=thumbs.querySelector('.on'),i=keys.indexOf(on?on.getAttribute('data-k'):keys[0]);show(keys[(i+(e.key==='ArrowRight'?1:keys.length-1))%keys.length]);}
  });
});
</script>`;

// 1. the section and the quick view
const secStart = h.indexOf('<section id="merchandise"');
const secEnd = h.indexOf('</section>', secStart) + '</section>'.length;
if (secStart < 0) throw new Error('merchandise section not found');
let after = h.slice(secEnd);
after = after.replace(/^\s*<div class="mq" id="mq"[\s\S]*?\n<\/div>/, '');
h = h.slice(0, secStart) + SECTION + after;

// 2. styles and script, in place when already there
h = /<style id="merch-modern">/.test(h) ? h.replace(/<style id="merch-modern">[\s\S]*?<\/style>/, () => CSS) : h.replace('</head>', CSS + '\n</head>');
h = /<script id="merch-js">/.test(h) ? h.replace(/<script id="merch-js">[\s\S]*?<\/script>/, () => JS) : h.replace('<script src="/admin/chat-widget.js"', JS + '\n<script src="/admin/chat-widget.js"');

// 3. search description without items that may not be in the store
const DESC = 'Official PNTC merchandise for students, alumni, and supporters. See the items up close and inquire with the Campus Store at our Dasmariñas, Cavite campus.';
h = h.replace(/(<meta name="description" content=")[^"]*(")/, `$1${DESC}$2`).replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${DESC}$2`);

// 4. texts the admin console already holds
h = C.preserveSlots(before, h);

if (h !== before) { fs.writeFileSync(FILE, crlf ? h.replace(/\n/g, '\r\n') : h); console.log('updated', path.relative(process.cwd(), FILE)); }
else console.log('no change');
