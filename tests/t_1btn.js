const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({acceptDownloads:true}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 for (const k of ['2026','2026-11']) {
 await pg.evaluate(({docs,k})=>{ fromDocs(docs); calcCache=null; closeModal(); selKy=k; view='xuatphieu'; $('#main').dataset.ptab='hd'; render(); }, {docs,k});
 console.log(await pg.$$eval('#main .btn.p',x=>x.map(y=>y.textContent)));
 const [dl]=await Promise.all([pg.waitForEvent('download'), pg.click('#exBoth')]); await dl.saveAs('asp_'+k+'.xlsx'); console.log(dl.suggestedFilename()); }
 console.log('errs',errs); await b.close(); })();
