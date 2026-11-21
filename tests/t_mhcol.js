const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1700,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 await pg.evaluate((docs)=>{ fromDocs(docs); calcCache=null; closeModal(); selKy='2026-02'; view='d_purchases'; render(); }, docs);
 console.log(await pg.$$eval('#main thead th',x=>x.map(y=>y.textContent.replace('▼','').trim()).join(' | ')));
 console.log(await pg.$$eval('#main td.xtra[data-x="Mua hàng chưa HĐ"]',x=>x.map(y=>y.textContent).filter(Boolean).slice(0,6)));
 await pg.evaluate(()=>{ const t=document.querySelector('#main .tw'); t.scrollLeft=t.scrollWidth; }); await pg.screenshot({path:'mhcol.png'}); console.log(errs); await b.close(); })();
