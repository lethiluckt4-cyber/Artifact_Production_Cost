const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8')); await pg.evaluate(([s])=>{ app.importDocs(s); { const pp=planPrm(); pp.nlUoc={'2026-10':110000000,'2026-11':110000000,'2026-12':110000000}; state.settings.planPrm=pp; calcCache=null; } selKy='2026-10'; view='giathanh'; render(); },[seed]); await pg.waitForTimeout(200);
 const run = async (reset) => { await pg.click('#recalc'); await pg.waitForTimeout(150); await pg.selectOption('#rcM','10'); const st=await pg.evaluate(()=>$('#rcState').textContent); if (reset) await pg.check('#rcReset'); await pg.click('#rcGo'); await pg.waitForTimeout(2500); const t=await pg.evaluate(()=>document.querySelector('#modal').innerText); await pg.evaluate(()=>closeModal()); return [st, t.split('Phần mềm đã tự chạy')[1].split('Bước tiếp theo')[0].trim()]; };
 console.log('RUN1', await run(false), await pg.evaluate(()=>state.orders.length));
 await pg.screenshot({path:path.resolve(__dirname,'out','run1.png')});
 // sửa tay: giảm lệnh TP_BKG 05/10 từ 168 → 150
 await pg.evaluate(()=>{ view='d_orders'; render(); const r=state.orders.find(o=>o.ngaySX==='2026-10-05'&&o.maTP==='TP_BKG'); editRow=r._id; render(); document.querySelector(`td.ed[data-id="${r._id}"][data-k="slKH"]`).textContent='150'; }); await pg.click('[data-save]'); await pg.waitForTimeout(200);
 console.log('edited', await pg.evaluate(()=>{ const r=state.orders.find(o=>o.ngaySX==='2026-10-05'&&o.maTP==='TP_BKG'); return [r.slKH, r.nguon]; }));
 await pg.evaluate(()=>{ view='giathanh'; render(); });
 console.log('RUN2', await run(false), await pg.evaluate(()=>[state.orders.length, state.orders.find(o=>o.ngaySX==='2026-10-05'&&o.maTP==='TP_BKG').slKH]));
 await pg.evaluate(()=>{ view='d_orders'; render(); }); await pg.waitForTimeout(200); await pg.screenshot({path:path.resolve(__dirname,'out','run_orders.png')});
 await pg.evaluate(()=>{ view='giathanh'; render(); });
 console.log('RUN3 reset', await run(true), await pg.evaluate(()=>[state.orders.length, state.orders.find(o=>o.ngaySX==='2026-10-05'&&o.maTP==='TP_BKG').slKH]));
 // round-trip nguon
 console.log('roundtrip', await pg.evaluate(()=>{ const d=JSON.parse(JSON.stringify(toDocs())); fromDocs(d); return [state.orders.filter(o=>o.nguon==='PM').length, state.settings.daDeXuat]; }));
 console.log('errs', errs); await b.close(); })();
