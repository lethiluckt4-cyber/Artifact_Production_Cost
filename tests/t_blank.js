const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:600}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); selKy='2026-10'; },[seed]);
 for (const ent of ['orders','purchases','sales','issues','adjustments','cal','bom','items']) {
   await pg.evaluate(e=>{ view='d_'+e; render(); },ent); await pg.waitForTimeout(150);
   if (!await pg.$('#add')) { console.log(ent,'no add'); continue; }
   await pg.click('#add'); await pg.waitForTimeout(100);
   const v=await pg.evaluate(()=>[...document.querySelectorAll(`td.ed[data-id="${editRow}"]`)].map(td=>{ const ci=td.querySelector('.ci'); return td.dataset.k+'='+(ci?ci.value:td.textContent); }).filter(x=>!/=$/.test(x)));
   console.log(ent,'non-blank:', JSON.stringify(v));
   await pg.evaluate(()=>{ discardEdit(); });
 }
 // quick date + save order
 await pg.evaluate(()=>{ view='d_orders'; render(); }); await pg.click('#add'); await pg.waitForTimeout(100);
 await pg.evaluate(()=>{ const id=editRow; document.querySelector(`td.ed[data-id="${id}"][data-k="ngaySX"]`).textContent='7'; document.querySelector(`td.ed[data-id="${id}"] .ci[data-k="maTP"]`).value='TP_BKG'; document.querySelector(`td.ed[data-id="${id}"][data-k="slKH"]`).textContent='25'; }); await pg.click('[data-save]'); await pg.waitForTimeout(150);
 console.log('saved:', await pg.evaluate(()=>{ const o=state.orders[state.orders.length-1]._new?null:state.orders.find(o=>o.nguon==='Tay'&&o.slKH===25); return o&&[o.ngaySX,o.ngayXuatNVL,o.maLenh,o.loaiDM,o.dieuChinhTP,o.slKH]; }));
 // purchases quick date 15/10 and ngayMua fill
 await pg.evaluate(()=>{ view='d_purchases'; render(); }); await pg.click('#add'); await pg.waitForTimeout(100);
 const ma=await pg.evaluate(()=>state.purchases[1].ma);
 await pg.evaluate(m=>{ const id=editRow; document.querySelector(`td.ed[data-id="${id}"][data-k="ngayNhap"]`).textContent='15/10'; document.querySelector(`td.ed[data-id="${id}"] .ci[data-k="ma"]`).value=m; document.querySelector(`td.ed[data-id="${id}"][data-k="sl"]`).textContent='10'; document.querySelector(`td.ed[data-id="${id}"][data-k="tt"]`).textContent='1000'; },ma); await pg.click('[data-save]'); await pg.waitForTimeout(150);
 console.log('purchase:', await pg.evaluate(()=>{ const r=state.purchases.find(r=>r.ngayNhap==='2026-10-15'&&r.tt===1000); return r&&[r.ngayNhap,r.ngayMua,r.sl,r.donGia]; }), await pg.evaluate(()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).pop()));
 console.log('errs', errs); await b.close(); })();
