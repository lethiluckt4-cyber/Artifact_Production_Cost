const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; view='xuatphieu'; render(); }); await pg.waitForTimeout(400);
 await pg.screenshot({path:'/tmp/man-hinh-48-xuat-phieu.png'});
 console.log(await pg.evaluate(()=>{ const p=P(); const xk=buildXK(p), nk=buildNK(p); return {xk:xk.length, nk:nk.length, x0:xk[0], n0:nk[0]}; }), errs); await b.close(); })();
