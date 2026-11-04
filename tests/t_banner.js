const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1300,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); calcCache=null; selKy='2026'; view='d_adjustments'; render(); },[seed]); await pg.waitForTimeout(300);
 await pg.screenshot({path:path.resolve(__dirname,'out','banner_year.png')}); console.log(await pg.evaluate(()=>document.querySelector('#main .warnbox, #main .note').innerText));
 await pg.evaluate(()=>{ selKy='2026-10'; render(); }); await pg.waitForTimeout(200); console.log(await pg.evaluate(()=>document.querySelector('#main .warnbox, #main .note').innerText));
 console.log('errs', errs); await b.close(); })();
