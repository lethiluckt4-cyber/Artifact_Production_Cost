const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; view='d_orders'; render(); }); await pg.waitForTimeout(300);
 await pg.click('#add'); await pg.waitForTimeout(150);
 await pg.evaluate(()=>{ const id=editRow; document.querySelector(`td.ed[data-id="${id}"][data-k="ngayXuatNVL"]`).textContent='12/10/2026'; const s=document.querySelector(`select.ci[data-id="${id}"][data-k="maTP"]`); s.value='BO'; s.onchange(); document.querySelector(`td.ed[data-id="${id}"][data-k="soMeKH"]`).textContent='3'; });
 await pg.screenshot({path:'/tmp/man-hinh-53-lsx-kh.png'});
 await pg.click('[data-save]'); await pg.waitForTimeout(300);
 console.log(await pg.evaluate(()=>{ const o=app.state.orders.find(x=>x.soMeKH===3 && x.maTP==='BO' && x.ngayXuatNVL==='2026-10-12'); return o && [o.maLenh, o.ngaySX, o.loaiDM]; }), errs); await b.close(); })();
