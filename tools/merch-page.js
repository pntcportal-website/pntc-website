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
        <p class="mx-intro">${slot('merch.intro', 'Official PNTC merchandise for students, employees, alumni and supporters. Tap any item to see it up close and order it online, then pay at the Finance Office.')}</p>
      </div>
      <div class="mx-side">
        <a class="mx-ask" id="mx-email" data-c="merch.email" href="mailto:admissions@mypntc.edu.ph"><span>${slot('merch.ask', 'Questions about an item?')}</span><b>${slot('merch.email', 'admissions@mypntc.edu.ph')}</b></a>
        <a class="mx-track-link" href="#track">Track your order</a>
      </div>
    </div>
    <div class="mx-chips" id="mx-chips" role="group" aria-label="Filter by category" hidden></div>
    ${START}
    ${cards}
    ${END}
    <p class="mx-none" id="mx-none" hidden>${slot('merch.none', 'New merchandise will be posted here soon. You may ask the Campus Store about the items available today.')}</p>

    <div class="mt" id="track">
      <div class="mt-text">
        <h2 class="mt-h">${slot('merch.track.title', 'Track your order')}</h2>
        <p class="mt-intro">${slot('merch.track.intro', 'Enter your order number and the email you used when you ordered.')}</p>
      </div>
      <form class="mt-form" id="mt-form" novalidate>
        <label><span>Order number</span><input name="no" placeholder="M-1001" autocomplete="off" required></label>
        <label><span>Email</span><input name="email" type="email" placeholder="you@email.com" autocomplete="email" required></label>
        <button type="submit" class="mt-btn">Check status</button>
      </form>
      <p class="mt-err" id="mt-err" role="alert"></p>
      <div class="mt-result" id="mt-result" hidden></div>
    </div>
  </div>
</section>

<div class="mx-texts" hidden>
  <span id="mx-t-finance">${slot('merch.pay.finance', 'Pay at the Finance Office with your order number. Your order is confirmed once Finance receives the payment.')}</span>
  <span id="mx-t-salary">${slot('merch.pay.salary', 'Finance will arrange the deduction from your salary and confirm your order.')}</span>
  <span id="mx-t-done">${slot('merch.done', 'Thank you. Your order has been placed. Keep your order number so you can follow your order on this page.')}</span>
</div>

<div class="mq" id="mq" role="dialog" aria-modal="true" aria-labelledby="mq-name" hidden>
  <div class="mq-box">
    <button class="mq-x" type="button" id="mq-x" aria-label="Close">&times;</button>
    <div class="mq-media">
      <div class="mq-stage"><img id="mq-img" src="" alt=""></div>
      <div class="mq-thumbs" id="mq-thumbs"></div>
    </div>
    <div class="mq-info">
      <div id="mq-details" class="mq-details">
        <p class="mq-cat" id="mq-cat"></p>
        <h3 class="mq-name" id="mq-name"></h3>
        <p class="mq-price" id="mq-price"></p>
        <p class="mq-note" id="mq-note"></p>
        <p class="mq-sizes" id="mq-sizes"></p>
        <div class="mq-actions">
          <button class="mq-btn" type="button" id="mq-order">Order this item</button>
          <a class="mq-ask" id="mq-btn" href="mailto:admissions@mypntc.edu.ph">Ask a question</a>
        </div>
      </div>
      <form class="mo" id="mo" novalidate hidden>
        <button type="button" class="mo-back" id="mo-back">&larr; Back to the item</button>
        <h3 class="mo-h">Order <span id="mo-item"></span></h3>
        <p class="mo-unit" id="mo-unit"></p>
        <fieldset class="mo-q"><legend>I am a</legend>
          <div class="mo-seg"><label><input type="radio" name="buyer" value="student"><span>Student</span></label><label><input type="radio" name="buyer" value="employee"><span>Employee</span></label></div>
        </fieldset>
        <label class="mo-f"><span>Full name</span><input name="name" autocomplete="name" maxlength="120"></label>
        <div class="mo-2">
          <label class="mo-f"><span>Email</span><input name="email" type="email" autocomplete="email" maxlength="160"></label>
          <label class="mo-f"><span>Mobile number</span><input name="phone" type="tel" autocomplete="tel" maxlength="30"></label>
        </div>
        <div class="mo-2">
          <label class="mo-f"><span id="mo-id-l">Student number</span><input name="idNumber" maxlength="40"></label>
          <label class="mo-f"><span id="mo-dept-l">Course and year</span><input name="department" maxlength="120"></label>
        </div>
        <div class="mo-2">
          <label class="mo-f" id="mo-size-w"><span>Size</span><select name="size"></select></label>
          <label class="mo-f"><span>Quantity</span><input name="quantity" type="number" min="1" max="20" value="1"></label>
        </div>
        <fieldset class="mo-q" id="mo-pay"><legend>Payment</legend>
          <div class="mo-opts">
            <label class="mo-opt"><input type="radio" name="payment" value="finance" checked><span><b>Pay at the Finance Office</b><small id="mo-t-finance"></small></span></label>
            <label class="mo-opt" id="mo-salary" hidden><input type="radio" name="payment" value="salary"><span><b>Salary deduction</b><small id="mo-t-salary"></small></span></label>
          </div>
        </fieldset>
        <label class="mo-f"><span>Notes <em>(optional)</em></span><textarea name="notes" rows="2" maxlength="500"></textarea></label>
        <div class="mo-hp" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></div>
        <div class="mo-total"><span>Total</span><b id="mo-total"></b></div>
        <p class="mo-err" id="mo-err" role="alert"></p>
        <button class="mq-btn mo-send" type="submit" id="mo-send">Place order</button>
      </form>
      <div class="mo-done" id="mo-done" hidden></div>
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
.mx-preview{margin:0 0 1.2rem;padding:.9rem 1.1rem;border-radius:14px;background:#1C1650;color:#fff;font-size:.86rem;line-height:1.5}
.mx-preview b{color:#F3CF33;margin-right:.5rem}
.mc-preview{outline:3px solid #F3CF33;outline-offset:3px}
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
/* ordering */
.mx-side{display:flex;flex-direction:column;align-items:flex-end;gap:.6rem}
.mx-track-link{font-size:.8rem;font-weight:800;color:#1C1650;text-decoration:none;border-bottom:2px solid #F3CF33;padding-bottom:2px}
.mq-details,.mo,.mo-done{display:flex;flex-direction:column;flex:1}
.mq-details[hidden],.mo[hidden],.mo-done[hidden]{display:none}
.mq-actions{margin-top:auto;padding-top:1.4rem;display:flex;align-items:center;gap:1rem;flex-wrap:wrap}
.mq-actions .mq-btn{margin-top:0;border:0;cursor:pointer;font-family:inherit}
.mq-ask{font-size:.8rem;font-weight:700;color:#1C1650}
.mo-back{align-self:flex-start;background:none;border:0;padding:0;font:inherit;font-size:.76rem;font-weight:800;color:rgba(28,22,80,.7);cursor:pointer;margin-bottom:.8rem}
.mo-h{margin:0;font-size:1.35rem;font-weight:900;letter-spacing:-.01em;line-height:1.2}
.mo-unit{margin:.25rem 0 1rem;font-size:.86rem;font-weight:700;color:rgba(28,22,80,.65)}
.mo-q{border:0;padding:0;margin:0 0 .9rem}
.mo-q legend{font-size:.74rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;margin-bottom:.45rem;padding:0}
.mo-seg{display:grid;grid-template-columns:1fr 1fr;gap:.5rem}
.mo-seg label{cursor:pointer}.mo-seg input{position:absolute;opacity:0;pointer-events:none}
.mo-seg span{display:block;text-align:center;padding:.75rem;border-radius:12px;border:1.5px solid rgba(28,22,80,.15);font-weight:800;font-size:.88rem}
.mo-seg input:checked+span{background:#1C1650;border-color:#1C1650;color:#F3CF33}
.mo-seg input:focus-visible+span{outline:3px solid rgba(243,207,51,.6)}
.mo-f{display:flex;flex-direction:column;gap:.3rem;margin-bottom:.75rem;font-size:.76rem;font-weight:700}
.mo-f[hidden]{display:none}
.mo-f em{font-style:normal;font-weight:500;color:rgba(28,22,80,.55)}
.mo-f input,.mo-f select,.mo-f textarea,.mt-form input{font:inherit;font-size:.9rem;font-weight:500;color:#1C1650;background:#F7F6FB;border:1.5px solid rgba(28,22,80,.12);border-radius:11px;padding:.7rem .85rem;width:100%;box-sizing:border-box}
.mo-f input:focus,.mo-f select:focus,.mo-f textarea:focus,.mt-form input:focus{outline:0;border-color:#1C1650;background:#fff;box-shadow:0 0 0 4px rgba(243,207,51,.35)}
.mo-2{display:grid;grid-template-columns:1fr 1fr;gap:0 .7rem}
.mo-opts{display:grid;gap:.5rem}
.mo-opt{display:flex;gap:.65rem;align-items:flex-start;padding:.75rem .85rem;border:1.5px solid rgba(28,22,80,.12);border-radius:12px;cursor:pointer}
.mo-opt[hidden]{display:none}
.mo-opt input{margin-top:.2rem;accent-color:#1C1650}
.mo-opt b{display:block;font-size:.86rem}.mo-opt small{display:block;font-size:.74rem;line-height:1.5;color:rgba(28,22,80,.65);margin-top:.15rem}
.mo-opt:has(input:checked){border-color:#1C1650;background:#fff}
.mo-hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.mo-total{display:flex;justify-content:space-between;align-items:baseline;padding:.9rem 0;border-top:1.5px dashed rgba(28,22,80,.15);margin-top:.3rem}
.mo-total span{font-size:.8rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em}.mo-total b{font-size:1.4rem;font-weight:900}
.mo-err,.mt-err{margin:0 0 .6rem;font-size:.82rem;font-weight:700;color:#B42318;min-height:0}
.mo-send{margin-top:.2rem!important;align-self:stretch;text-align:center;border:0;cursor:pointer;font-family:inherit}
.mo-send:disabled{opacity:.6;cursor:default}
.mo-done{align-items:flex-start}
.mo-ok{width:58px;height:58px;border-radius:50%;background:#F3CF33;display:grid;place-items:center;margin-bottom:1rem}
.mo-ok svg{width:28px;height:28px;fill:none;stroke:#1C1650;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}
.mo-no{margin:1rem 0 0;font-size:.8rem;font-weight:700;color:rgba(28,22,80,.65)}.mo-no b{display:block;font-size:2rem;font-weight:900;color:#1C1650;letter-spacing:.02em}
.mo-sum{margin:.3rem 0 0;font-weight:800}
.mo-next{margin:.8rem 0 0;font-size:.88rem;line-height:1.65;color:rgba(28,22,80,.78)}
.mo-done .mq-btn{margin-top:1.4rem;border:0;cursor:pointer;font-family:inherit}
/* order tracking */
.mt{margin-top:4rem;padding:2rem clamp(1.25rem,3vw,2.4rem);border-radius:26px;background:#1C1650;color:#fff;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:1rem 2rem;align-items:center}
.mt-h{margin:0;font-size:clamp(1.4rem,2.6vw,1.9rem);font-weight:900;letter-spacing:-.02em}
.mt-intro{margin:.4rem 0 0;font-size:.88rem;line-height:1.6;color:rgba(255,255,255,.75)}
.mt-form{display:grid;grid-template-columns:1fr 1.3fr auto;gap:.6rem;align-items:end}
.mt-form label{display:flex;flex-direction:column;gap:.3rem;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.75)}
.mt-form input{background:#fff}
.mt-btn{font:inherit;font-size:.78rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;border:0;border-radius:999px;padding:.85rem 1.3rem;background:#F3CF33;color:#1C1650;cursor:pointer}
.mt-err{grid-column:1/-1;color:#FFB4A9}
.mt-err:empty{display:none}
.mt-result{grid-column:1/-1;background:#fff;color:#1C1650;border-radius:20px;padding:1.4rem 1.5rem}
.mt-result[hidden]{display:none}
.mt-top{display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;flex-wrap:wrap}
.mt-no{margin:0;font-size:.74rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(28,22,80,.6)}
.mt-item{margin:.25rem 0 0;font-size:1.05rem;font-weight:800}.mt-meta{margin:.25rem 0 0;font-size:.82rem;color:rgba(28,22,80,.7)}
.mt-badge{font-size:.72rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:.45rem .85rem;border-radius:999px;background:#F3CF33}
.mt-badge.off{background:#FDECEA;color:#B42318}
.mt-steps{list-style:none;margin:1.3rem 0 0;padding:0;display:grid;grid-template-columns:repeat(5,1fr);gap:.4rem;counter-reset:s}
.mt-steps li{position:relative;padding-top:1.9rem;font-size:.74rem;line-height:1.4;color:rgba(28,22,80,.5);counter-increment:s}
.mt-steps li::before{content:counter(s);position:absolute;top:0;left:0;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-size:.72rem;font-weight:800;background:#EEEDF5;color:rgba(28,22,80,.5)}
.mt-steps li::after{content:'';position:absolute;top:12px;left:30px;right:6px;height:2px;background:#EEEDF5}
.mt-steps li:last-child::after{display:none}
.mt-steps li.done,.mt-steps li.now{color:#1C1650}
.mt-steps li.done::before{content:'\\2713';background:#1C1650;color:#F3CF33}.mt-steps li.done::after{background:#1C1650}
.mt-steps li.now::before{background:#F3CF33;color:#1C1650}
.mt-steps b{display:block;font-weight:800}.mt-steps span{display:block;font-size:.66rem;margin-top:.15rem;color:rgba(28,22,80,.6)}
.mt-cancel{margin:1rem 0 0;font-size:.86rem;line-height:1.6}
@media(max-width:860px){.mt{grid-template-columns:1fr}.mt-form{grid-template-columns:1fr}.mx-side{align-items:stretch}}
@media(max-width:560px){.mo-2{grid-template-columns:1fr}.mt-steps{grid-template-columns:1fr;gap:.9rem}.mt-steps li{padding:0 0 0 2.2rem;min-height:26px}.mt-steps li::after{display:none}}
@media(max-width:760px){.mq-box{grid-template-columns:1fr}.mq-info{padding:1.4rem 1.4rem 1.6rem}.mq-btn{margin-top:1.4rem;align-self:stretch;text-align:center}}
@media(max-width:640px){#merchandise.mx{padding:4rem 1.25rem 4.5rem}.mx-ask{width:100%}}
@media(prefers-reduced-motion:reduce){.mc,.mc-media img,.mx-ask,.mc-btn{transition:none}}
</style>`;

const JS = String.raw`<script id="merch-js">
/* Merchandise: category filter, front, side and back views, quick view, ordering, and order tracking */
document.addEventListener('DOMContentLoaded',function(){
  function e(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function peso(n){n=Number(n)||0;return n?'₱ '+n.toLocaleString('en-PH',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2}):'';}
  function txt(id){var el=document.getElementById(id);return el?el.textContent.trim():'';}
  var NAMES={front:'Front',side:'Side',back:'Back'};
  /* preview from the admin console: the item being edited is shown first, in this browser only */
  if(/[?&]preview=1/.test(location.search)){try{var pv=JSON.parse(localStorage.getItem('pntc-merch-preview')||'null');if(pv&&pv.images&&pv.images.front)previewCard(pv);}catch(x){}}
  function previewCard(i){
    var ks=['front','side','back'].filter(function(k){return i.images[k];}),v={};ks.forEach(function(k){v[k]=i.images[k];});
    var back=i.images.back||i.images.side,n=parseFloat(String(i.price||'').replace(/[^\d.]/g,''))||0,sz=String(i.sizes||'').split(/[,/|]+/).map(function(x){return x.trim();}).filter(Boolean).join(', ');
    var html='<article class="mc mc-preview" data-preview="1" data-cat="'+e(i.category)+'" data-name="'+e(i.name)+'" data-price="'+e(peso(n))+'" data-amount="'+(n||'')+'" data-sizes="'+e(sz)+'" data-note="'+e(i.note)+'" data-views="'+e(JSON.stringify(v))+'">'
      +'<button class="mc-media" type="button"><img class="mc-main" src="'+e(i.images.front)+'" alt="">'+(back?'<img class="mc-alt" src="'+e(back)+'" alt="">':'')+(i.category?'<span class="mc-cat">'+e(i.category)+'</span>':'')+'</button>'
      +(ks.length>1?'<div class="mc-views">'+ks.map(function(k,m){return '<button type="button" class="mc-view'+(m?'':' on')+'" data-view="'+k+'">'+NAMES[k]+'</button>';}).join('')+'</div>':'')
      +'<div class="mc-body"><h3 class="mc-name">'+e(i.name)+'</h3>'+(i.note?'<p class="mc-note">'+e(i.note)+'</p>':'')+(sz?'<p class="mc-sizes">Sizes '+e(sz)+'</p>':'')
      +'<div class="mc-foot">'+(n?'<span class="mc-price">'+e(peso(n))+'</span><button class="mc-btn" type="button" data-order>Order</button>':'<span></span><a class="mc-btn" href="#">Inquire</a>')+'</div></div></article>';
    var grid=document.querySelector('#merchandise .mc-grid');grid.insertAdjacentHTML('afterbegin',html);
    var note=document.createElement('p');note.className='mx-preview';note.innerHTML='<b>Preview</b> This is how the item will look on the page once it is saved and published. Only you can see it. Orders cannot be placed from a preview.';
    grid.parentNode.insertBefore(note,document.getElementById('mx-chips'));
  }

  /* track an order (also works when no item is published) */
  var STEPS=[['placed','Order placed'],['confirmed','Order confirmed'],['ongoing','Ongoing'],['ready','Ready for pickup'],['completed','Completed']];
  var tf=document.getElementById('mt-form'),terr=document.getElementById('mt-err'),tres=document.getElementById('mt-result');
  function when(iso){return new Date(iso).toLocaleString('en-PH',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});}
  function track(no,email){
    terr.textContent='';tres.hidden=true;
    fetch('/api/public/merch/track?no='+encodeURIComponent(no)+'&email='+encodeURIComponent(email)).then(function(r){return r.json().then(function(d){return{ok:r.ok,d:d};});}).then(function(x){
      if(!x.ok)throw new Error(x.d.error||'The order could not be checked.');
      var d=x.d,at={};(d.steps||[]).forEach(function(s){at[s.status]=s.at;});
      var cancelled=d.status==='cancelled',idx=STEPS.map(function(s){return s[0];}).indexOf(d.status);
      tres.innerHTML='<div class="mt-top"><div><p class="mt-no">Order '+e(d.orderNo)+'</p><p class="mt-item">'+e(d.item)+(d.size?', size '+e(d.size):'')+' &times; '+e(d.quantity)+'</p><p class="mt-meta">'+e(d.total)+' &middot; '+e(d.payment)+'</p></div>'
        +'<span class="mt-badge'+(cancelled?' off':'')+'">'+(cancelled?'Cancelled':e(STEPS[idx]?STEPS[idx][1]:d.status))+'</span></div>'
        +(cancelled?'<p class="mt-cancel">This order was cancelled. Please contact the Finance Office if you have questions.</p>':'<ol class="mt-steps">'+STEPS.map(function(s,i){return '<li class="'+(i<idx?'done':i===idx?'now':'')+'"><b>'+s[1]+'</b>'+(at[s[0]]&&i<=idx?'<span>'+when(at[s[0]])+'</span>':'')+'</li>';}).join('')+'</ol>');
      tres.hidden=false;
    }).catch(function(x){terr.textContent=x.message;});
  }
  if(tf)tf.addEventListener('submit',function(ev){ev.preventDefault();var no=tf.no.value.trim(),em=tf.email.value.trim();if(!no||!em){terr.textContent='Enter your order number and email.';return;}track(no,em);});

  var cards=[].slice.call(document.querySelectorAll('#merchandise .mc')),chips=document.getElementById('mx-chips'),none=document.getElementById('mx-none');
  if(!chips)return;
  if(!cards.length){none.hidden=false;return;}
  var mail=document.getElementById('mx-email'),addr=mail?(mail.getAttribute('href')||'').replace(/^mailto:/,'').split('?')[0]:'';
  function views(c){try{return JSON.parse(c.getAttribute('data-views')||'{}');}catch(x){return {};}}
  function mailto(c){return 'mailto:'+addr+'?subject='+encodeURIComponent('Merchandise inquiry, '+c.getAttribute('data-name'));}
  cards.forEach(function(c){
    var b=c.querySelector('a.mc-btn');if(b&&addr)b.href=mailto(c);
    var ob=c.querySelector('[data-order]');if(ob)ob.addEventListener('click',function(){open(c,true);});
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
  var det=document.getElementById('mq-details'),fo=document.getElementById('mo'),done=document.getElementById('mo-done'),oerr=document.getElementById('mo-err'),send=document.getElementById('mo-send');
  function show(k){var v=views(cur);img.src=v[k];img.alt=cur.getAttribute('data-name')+', '+NAMES[k].toLowerCase()+' view';[].forEach.call(thumbs.children,function(t){t.classList.toggle('on',t.getAttribute('data-k')===k);});}
  function step(which){det.hidden=which!=='details';fo.hidden=which!=='form';done.hidden=which!=='done';var box=mq.querySelector('.mq-box');box.scrollTop=0;}
  function open(c,ordering){
    cur=c;last=document.activeElement;var v=views(c);keys=['front','side','back'].filter(function(k){return v[k];});
    document.getElementById('mq-cat').textContent=c.getAttribute('data-cat')||'';
    document.getElementById('mq-name').textContent=c.getAttribute('data-name')||'';
    document.getElementById('mq-price').textContent=c.getAttribute('data-price')||'';
    document.getElementById('mq-note').textContent=c.getAttribute('data-note')||'';
    var sz=c.getAttribute('data-sizes');document.getElementById('mq-sizes').textContent=sz?'Sizes '+sz:'';
    document.getElementById('mq-btn').href=addr?mailto(c):'#';
    document.getElementById('mq-order').hidden=!c.getAttribute('data-amount');
    thumbs.innerHTML=keys.length>1?keys.map(function(k){return '<button type="button" class="mq-thumb" data-k="'+k+'"><img src="'+v[k]+'" alt=""><span>'+NAMES[k]+'</span></button>';}).join(''):'';
    show(keys[0]);mq.hidden=false;document.body.style.overflow='hidden';
    if(ordering&&c.getAttribute('data-amount'))startOrder();else step('details');
    document.getElementById('mq-x').focus();
  }
  function close(){mq.hidden=true;document.body.style.overflow='';if(last)last.focus();}
  thumbs.addEventListener('click',function(ev){var t=ev.target.closest('.mq-thumb');if(t)show(t.getAttribute('data-k'));});
  document.getElementById('mq-x').addEventListener('click',close);
  mq.addEventListener('click',function(ev){if(ev.target===mq)close();});
  document.addEventListener('keydown',function(ev){
    if(mq.hidden)return;
    if(ev.key==='Escape')close();
    if((ev.key==='ArrowRight'||ev.key==='ArrowLeft')&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){var on=thumbs.querySelector('.on'),i=keys.indexOf(on?on.getAttribute('data-k'):keys[0]);show(keys[(i+(ev.key==='ArrowRight'?1:keys.length-1))%keys.length]);}
  });

  /* ordering: students pay at the Finance Office, employees may choose salary deduction */
  document.getElementById('mo-t-finance').textContent=txt('mx-t-finance');
  document.getElementById('mo-t-salary').textContent=txt('mx-t-salary');
  function buyer(){var r=fo.querySelector('[name=buyer]:checked');return r?r.value:'';}
  function total(){var q=Math.max(1,Math.min(20,parseInt(fo.quantity.value,10)||1));document.getElementById('mo-total').textContent=peso((parseFloat(cur.getAttribute('data-amount'))||0)*q);}
  function setBuyer(){
    var b=buyer(),emp=b==='employee';
    document.getElementById('mo-salary').hidden=!emp;
    if(!emp)fo.querySelector('[name=payment][value=finance]').checked=true;
    document.getElementById('mo-id-l').textContent=emp?'Employee ID number':'Student number';
    document.getElementById('mo-dept-l').textContent=emp?'Office or department':'Course and year';
  }
  function startOrder(){
    fo.reset();oerr.textContent='';send.disabled=false;send.textContent='Place order';
    document.getElementById('mo-item').textContent=cur.getAttribute('data-name');
    document.getElementById('mo-unit').textContent=cur.getAttribute('data-price')+' each';
    var sizes=(cur.getAttribute('data-sizes')||'').split(',').map(function(x){return x.trim();}).filter(Boolean);
    document.getElementById('mo-size-w').hidden=!sizes.length;
    fo.size.innerHTML='<option value="">Choose a size</option>'+sizes.map(function(x){return '<option>'+e(x)+'</option>';}).join('');
    setBuyer();total();step('form');
  }
  document.getElementById('mq-order').addEventListener('click',startOrder);
  document.getElementById('mo-back').addEventListener('click',function(){step('details');});
  fo.addEventListener('change',function(ev){if(ev.target.name==='buyer')setBuyer();if(ev.target.name==='quantity')total();});
  fo.quantity.addEventListener('input',total);
  fo.addEventListener('submit',function(ev){
    ev.preventDefault();oerr.textContent='';
    var b=buyer(),f=fo,need=function(m,el){oerr.textContent=m;if(el)el.focus();};
    if(!b)return need('Please choose Student or Employee.');
    if(!f.elements.name.value.trim())return need('Please enter your full name.',f.elements.name);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.value.trim()))return need('Please enter a valid email address.',f.email);
    if(!/^[0-9+()\-.\s]{7,20}$/.test(f.phone.value.trim()))return need('Please enter a valid mobile number.',f.phone);
    if(!f.idNumber.value.trim())return need(b==='employee'?'Please enter your employee ID number.':'Please enter your student number.',f.idNumber);
    if(!document.getElementById('mo-size-w').hidden&&!f.size.value)return need('Please choose a size.',f.size);
    if(cur.getAttribute('data-preview'))return need('This is a preview. Orders work once the item is published.');
    var pay=(f.querySelector('[name=payment]:checked')||{}).value||'finance';
    var body={item:cur.getAttribute('data-id'),buyer:b,payment:b==='employee'?pay:'finance',name:f.elements.name.value,email:f.email.value,phone:f.phone.value,idNumber:f.idNumber.value,department:f.department.value,size:f.size.value,quantity:f.quantity.value,notes:f.notes.value,website:f.website.value};
    send.disabled=true;send.textContent='Placing your order…';
    fetch('/api/public/merch/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(function(r){return r.json().then(function(d){return{ok:r.ok,d:d};});}).then(function(x){
      if(!x.ok)throw new Error(x.d.error||'Your order could not be placed. Please try again.');
      var d=x.d,salary=d.payment==='salary';
      if(window.pntcTrack)window.pntcTrack('merch_order',{item:cur.getAttribute('data-name'),buyer:body.buyer,payment:body.payment,quantity:Number(body.quantity)||1,value:(parseFloat(cur.getAttribute('data-amount'))||0)*(Number(body.quantity)||1),currency:'PHP'});
      done.innerHTML='<div class="mo-ok"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div><h3 class="mo-h">Order placed</h3>'
        +'<p class="mo-no">Your order number<b>'+e(d.orderNo)+'</b></p><p class="mo-sum">Total '+e(d.total)+'</p>'
        +'<p class="mo-next">'+e(salary?txt('mx-t-salary'):txt('mx-t-finance'))+'</p><p class="mo-next">'+e(txt('mx-t-done'))+'</p>'
        +'<button type="button" class="mq-btn" id="mo-track">Track this order</button>';
      step('done');
      var em=body.email.trim();
      document.getElementById('mo-track').addEventListener('click',function(){close();tf.no.value=d.orderNo;tf.email.value=em;document.getElementById('track').scrollIntoView({behavior:'smooth'});track(d.orderNo,em);});
    }).catch(function(x){send.disabled=false;send.textContent='Place order';oerr.textContent=x.message;});
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
