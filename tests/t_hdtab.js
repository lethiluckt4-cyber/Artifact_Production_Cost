const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950},acceptDownloads:true}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 await pg.evaluate((docs)=>{ fromDocs(docs); calcCache=null; closeModal(); selKy='2026'; view='xuatphieu'; $('#main').dataset.ptab='dc'; render(); }, docs);
 console.log(await pg.$$eval('.tabs button',x=>x.map(y=>y.textContent)));
 for (const k of ['mh','nv','ds','dc']) { await pg.click(`[data-hsh="${k}"]`); await pg.waitForTimeout(200); console.log(k, await pg.$$eval('#main tbody tr',x=>x.length)); }
 await pg.click('[data-hsh="mh"]'); await pg.screenshot({path:'hdtab.png'});
 const [dl]=await Promise.all([pg.waitForEvent('download'), pg.click('#exMua')]); console.log(dl.suggestedFilename());
 await pg.click('.tabs button[data-t="xk"]'); console.log('xk', await pg.$$eval('#main tbody tr',x=>x.length));
 console.log('errs',errs); await b.close(); })();
