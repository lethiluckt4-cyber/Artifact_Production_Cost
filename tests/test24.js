const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); changed(); state.settings.workYear='2026'; selKy='2026-10'; view='d_items'; render(); }); await pg.waitForTimeout(600);
 await pg.click('#add'); await pg.waitForTimeout(150);
 await pg.evaluate(()=>{ const id=editRow; document.querySelector(`td.ed[data-id="${id}"][data-k="ma"]`).textContent='ZZ1'; document.querySelector(`td.ed[data-id="${id}"][data-k="ten"]`).textContent='Thử'; document.querySelector(`select.ci[data-k="nhom"]`).value='PG'; document.querySelector(`td.ed[data-id="${id}"][data-k="dvt"]`).textContent='kg'; });
 await pg.click('[data-v=d_bom]'); await pg.waitForTimeout(200); await pg.screenshot({path:'/tmp/man-hinh-44-canh-bao-chua-luu.png'});
 await pg.click('#gSave'); await pg.waitForTimeout(400);
 console.log(await pg.evaluate(()=>[view, app.state.items.some(i=>i.ma==='ZZ1'), editRow]), errs); await b.close(); })();
