const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 console.log(await pg.evaluate(()=>NAV.filter(n=>n.id).map(n=>{ view=n.id; render(); return n.id+':'+document.querySelectorAll('#refresh').length; }).join(' '))); await b.close(); })();
