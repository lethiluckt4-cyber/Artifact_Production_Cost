const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({acceptDownloads:true}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 await pg.evaluate((docs)=>{ fromDocs(docs); calcCache=null; closeModal(); selKy='2026'; view='xuatphieu'; $('#main').dataset.ptab='hd'; $('#main').dataset.hsh='nv'; render(); }, docs);
 console.log(await pg.$$eval('#main thead th',x=>x.map(y=>y.textContent.trim()).join(' | ')));
 const [dl]=await Promise.all([pg.waitForEvent('download'), pg.click('#exMua')]); await dl.saveAs('aspmua2.xlsx'); console.log('errs',errs); await b.close(); })();
