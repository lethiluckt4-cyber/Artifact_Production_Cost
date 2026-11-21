const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; view='d_sales'; render(); }); await pg.waitForTimeout(300);
 console.log(await pg.evaluate(()=>[...document.querySelectorAll('tr.tot td')].map(td=>td.textContent)));
 await pg.evaluate(()=>{ selKy='R:2026-10-01:2026-10-10'; render(); }); await pg.waitForTimeout(300);
 console.log(await pg.evaluate(()=>[...document.querySelectorAll('tr.tot td')].map(td=>td.textContent).filter(Boolean)));
 await pg.evaluate(()=>{ view='d_purchases'; render(); }); await pg.waitForTimeout(300); console.log(await pg.evaluate(()=>[...document.querySelectorAll('tr.tot td')].map(td=>td.textContent).filter(Boolean)), errs);
 await pg.screenshot({path:'/tmp/man-hinh-50-tong.png'}); await b.close(); })();
