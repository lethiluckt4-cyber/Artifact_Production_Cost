const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}});
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 await pg.evaluate(()=>{ view='d_purchases'; selKy='2026-03'; render(); document.querySelectorAll('.toast').forEach(t=>t.remove()); }); await pg.click('#tblCfg'); await pg.waitForTimeout(200);
 console.log(await pg.evaluate(()=>{ const x=document.querySelector('#mc2'); const r=x.getBoundingClientRect(); const s=x.querySelector('svg').getBoundingClientRect(); return [r.x,r.y,r.width,r.height,s.width,s.height, getComputedStyle(x.querySelector('svg')).display]; }));
 await pg.evaluate(()=>document.querySelectorAll('.toast').forEach(t=>t.remove()));
 await (await pg.$('#modal .in')).screenshot({path:'/home/claude/work/shots/tc2.png'}); await b.close(); })();
