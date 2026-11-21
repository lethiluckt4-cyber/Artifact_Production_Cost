const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); for (const W of [1100,1500]) { const pg=await b.newPage({viewport:{width:W,height:500}}); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='d_issues'; render(); }); await pg.waitForTimeout(300); await pg.screenshot({path:`/home/claude/work/shots/iss${W}.png`, clip:{x:236,y:0,width:W-236,height:260}}); await pg.close(); }
 await b.close(); })();
