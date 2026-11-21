const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 console.log(await pg.evaluate(()=>Object.entries(GRID).map(([k,g])=>{ let ex=[]; try { ex=Object.keys(g.extra?g.extra(P()):{}); } catch(e){} return `${k}: COLS ${g.cols.map(c=>c.k+'='+plainT(c.t)).join(', ')}\n   EXTRA ${ex.join(', ')}`; }).join('\n'))); await b.close(); })();
