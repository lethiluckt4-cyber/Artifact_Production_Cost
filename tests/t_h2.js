const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='d_opening'; render(); }); await pg.waitForTimeout(150);
 console.log(await pg.evaluate(()=>getComputedStyle(document.querySelector('#main>.top h2')).color)); await pg.screenshot({path:'/home/claude/work/shots/h2.png', clip:{x:236,y:0,width:900,height:110}}); await b.close(); })();
