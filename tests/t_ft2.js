const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1150,height:500}}); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 for (const v of ['d_subs','tongquan','giathanh','nxt']) { await pg.evaluate(v=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view=v; render(); }, v); await pg.waitForTimeout(300); await pg.screenshot({path:`/home/claude/work/shots/c_${v}.png`, clip:{x:236,y:0,width:914,height:190}}); }
 await b.close(); })();
