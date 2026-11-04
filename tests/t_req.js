const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:600}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); selKy='2026-10'; view='d_orders'; render(); },[seed]); await pg.waitForTimeout(300);
 console.log('headers:', await pg.evaluate(()=>[...document.querySelectorAll('#main thead th')].map(t=>t.innerText.replace(/\s+/g,' ').replace('▼','').trim()).join(' | ')));
 const n0=await pg.evaluate(()=>state.orders.length);
 // 1. dòng mới chỉ có ngày + mã, không số lượng -> chặn
 await pg.click('#add'); await pg.waitForTimeout(100);
 await pg.evaluate(()=>{ const id=editRow; document.querySelector(`td.ed[data-id="${id}"][data-k="ngaySX"]`).textContent='07/10/2026'; document.querySelector(`td.ed[data-id="${id}"] .ci[data-k="maTP"]`).value='TP_BKG'; }); await pg.click('[data-save]'); await pg.waitForTimeout(150);
 console.log('chặn:', await pg.evaluate(()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).pop()), await pg.evaluate(()=>state.orders.filter(o=>!o._new).length));
 // 2. nhập số lượng, để trống điều chỉnh -> lưu được
 await pg.evaluate(()=>{ const id=editRow; document.querySelector(`td.ed[data-id="${id}"][data-k="slKH"]`).textContent='25'; }); await pg.click('[data-save]'); await pg.waitForTimeout(150);
 console.log('lưu với SL, ĐC trống:', await pg.evaluate(()=>state.orders.filter(o=>!o._new).length), n0);
 // 3. sửa dòng có sẵn chỉ nhập điều chỉnh
 await pg.evaluate(()=>{ const r=state.orders.find(o=>o.ngaySX==='2026-10-02'&&o.maTP==='TP_BKG'); editRow=r._id; render(); document.querySelector(`td.ed[data-id="${r._id}"][data-k="dieuChinhTP"]`).textContent='-10'; }); await pg.click('[data-save]'); await pg.waitForTimeout(150);
 console.log('chỉ điều chỉnh:', await pg.evaluate(()=>{ calcCache=null; const c=calc(); const r=state.orders.find(o=>o.ngaySX==='2026-10-02'&&o.maTP==='TP_BKG'); const g=ma=>state.orders.filter(o=>o.ngaySX==='2026-10-02'&&o.maTP===ma).reduce((s,o)=>s+c.TH[o._id].slTH,0); return [r.slKH, r.dieuChinhTP, c.TH[r._id].slTH, g('BTP_BGKT')]; }));
 console.log('errs', errs); await b.close(); })();
