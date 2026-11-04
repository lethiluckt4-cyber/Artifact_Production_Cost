const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); const pp=planPrm(); pp.nlUoc={'2026-10':110000000}; state.settings.planPrm=pp; calcCache=null; selKy='2026-10'; },[seed]);
 await pg.evaluate(()=>{ view='giathanh'; render(); }); await pg.click('#recalc'); await pg.selectOption('#rcM','10'); await pg.click('#rcGo'); await pg.waitForTimeout(3000); await pg.evaluate(()=>closeModal());
 const sl = () => pg.evaluate(()=>{ calcCache=null; const c=calc(); const g=ma=>state.orders.filter(o=>o.ngaySX==='2026-10-06'&&o.maTP===ma).reduce((s,o)=>s+c.TH[o._id].slTH,0); return {BGK:g('BTP_BGK'),KT:g('BTP_KT'),BGKT:g('BTP_BGKT'),TP:g('TP_BKG')}; });
 console.log('gốc', await sl());
 await pg.evaluate(()=>{ view='d_orders'; render(); const r=state.orders.find(o=>o.ngaySX==='2026-10-06'&&o.maTP==='TP_BKG'); editRow=r._id; render(); document.querySelector(`td.ed[data-id="${r._id}"][data-k="slKH"]`).textContent=String(r.slKH-70); }); await pg.click('[data-save]'); await pg.waitForTimeout(200);
 console.log('-70 thùng', await sl());
 // thêm tay 30 thùng 400G ngày 06/10
 await pg.click('#add'); await pg.waitForTimeout(150);
 await pg.evaluate(()=>{ const id=editRow; document.querySelector(`td.ed[data-id="${id}"][data-k="ngaySX"]`).textContent='06/10/2026'; document.querySelector(`td.ed[data-id="${id}"] .ci[data-k="maTP"]`).value='TP_BKG_400G'; document.querySelector(`td.ed[data-id="${id}"][data-k="slKH"]`).textContent='30'; }); await pg.click('[data-save]'); await pg.waitForTimeout(200);
 console.log('+30 thùng 400G', await sl(), await pg.evaluate(()=>[...document.querySelectorAll(`td.ed .ci[data-k="maTP"] option`)].map(o=>o.value)));
 await pg.evaluate(()=>{ render(); }); await pg.waitForTimeout(200);
 console.log('headers:', await pg.evaluate(()=>[...document.querySelectorAll('#main thead th')].map(t=>t.innerText.replace(/\s+/g,' ').trim()).join(' | ')));
 console.log('tình trạng:', await pg.evaluate(()=>[...document.querySelectorAll('#main td.xtra[data-x="Tình trạng"]')].map(t=>t.textContent).filter(t=>t.includes('TAY')).slice(0,3)));
 await pg.click('#add'); await pg.waitForTimeout(150); console.log('options new row:', await pg.evaluate(()=>[...document.querySelectorAll(`td.ed .ci[data-k="maTP"] option`)].map(o=>o.value).join(',')));
 console.log('errs', errs); await b.close(); })();
