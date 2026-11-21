const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(1000);
 await pg.evaluate(()=>app.importDocs({settings:{company:'KH Thảo Vy'}})); await pg.waitForTimeout(300);
 await pg.screenshot({path:'/tmp/shot_empty.png'});
 await pg.click('#seedbtn'); await pg.waitForTimeout(800);
 console.log(await pg.evaluate(()=>{ const p=app.calc().periods['2026-10']; return [p.sum154, app.state.orders.length]; }), errs);
 await b.close(); })();
