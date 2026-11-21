const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 console.log(await pg.evaluate(()=>{ selKy='2026'; const p=P(); return p.nxt.filter(x=>x.closeSL>=100&&x.closeSL<=1000).map(x=>x.ma+':'+x.closeSL).join(' ')+' | quần: '+p.nxt.filter(x=>/quần/i.test(x.ten)).length; })); await b.close(); })();
