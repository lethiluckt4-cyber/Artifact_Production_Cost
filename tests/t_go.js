const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1300,height:800}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 await pg.evaluate(s=>{ app.importDocs(s); selKy='2026-10'; view='tongquan'; render(); }, JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8')));
 await pg.screenshot({path:path.resolve(__dirname,'out','tq.png')});
 await pg.click('a[data-go="giathanh"]'); await pg.waitForTimeout(300);
 console.log(await pg.evaluate(()=>[view, document.querySelector('#main .tabs .act')?.textContent]), errs); await b.close(); })();
