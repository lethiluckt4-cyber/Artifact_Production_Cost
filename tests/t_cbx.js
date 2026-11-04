const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({acceptDownloads:true}); const pg=await ctx.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 await pg.evaluate(s=>{ app.importDocs(s); selKy='2026-10'; view='canhbao'; render(); }, JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8')));
 const [dl]=await Promise.all([pg.waitForEvent('download',{timeout:15000}), pg.click('#cbXl')]); await dl.saveAs(path.resolve(__dirname,'out','cb.xlsx')); console.log(dl.suggestedFilename(), errs); await b.close(); })();
