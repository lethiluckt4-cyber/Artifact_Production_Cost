const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); changed(); state.settings.workYear='2026'; selKy='2026-10'; render(); });
 const a = await pg.evaluate(()=>{ const p=(calcCache=null,P()); const x=p.nxt.find(x=>x.ma==='THGA'); return [p.daysData, x.bq, x.days, p.sum154]; });
 // cut data to first 10 days
 await pg.evaluate(()=>{ const cut=r=>r<='2026-10-10'; app.state.purchases=app.state.purchases.filter(r=>cut(r.ngayNhap)); app.state.sales=app.state.sales.filter(r=>cut(r.ngay)); app.state.orders=app.state.orders.filter(r=>cut(r.ngaySX)); changed(); });
 const c = await pg.evaluate(()=>{ const p=(calcCache=null,P()); const x=p.nxt.find(x=>x.ma==='THGA'); return [p.daysData, x.bq, x.days]; });
 console.log('full', a, 'to day10', c, errs); await b.close(); })();
