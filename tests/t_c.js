const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='nxt'; selKy='2026-06'; document.querySelector('#main').dataset.nt='ct'; render(); }); await pg.waitForTimeout(200);
 await pg.screenshot({path:'/home/claude/work/shots/c1.png', clip:{x:236,y:180,width:1204,height:200}}); await b.close(); })();
