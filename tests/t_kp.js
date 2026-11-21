const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 console.log(await pg.evaluate(()=>kpiList().map(k=>(k[3]?'Y ':'N ')+k[0]+' | '+String(k[1]).replace(/<[^>]+>/g,'')+' | '+k[2]+' | '+k[3]).join('\n'))); await b.close(); })();
