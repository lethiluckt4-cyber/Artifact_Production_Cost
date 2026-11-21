const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:1000}}); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 await pg.evaluate(()=>{ ['2026-01','2026-02','2026-03','2026-04'].forEach((k,i)=>{ (state.costs[k]=state.costs[k]||{}).soCN=[2,2,3,2][i]; }); calcCache=null; view='kehoach'; render(); }); await pg.waitForTimeout(400);
 await pg.click('#cnE'); await pg.waitForTimeout(300); await pg.evaluate(()=>document.querySelectorAll('.toast').forEach(t=>t.remove()));
 const bx=await pg.$('[data-cn]'); const box=await (await bx.evaluateHandle(e=>e.closest('table'))).asElement().boundingBox();
 await pg.screenshot({path:'/home/claude/work/shots/cn2.png', clip:{x:box.x, y:box.y, width:520, height:Math.min(box.height,480)}}); await b.close(); })();
