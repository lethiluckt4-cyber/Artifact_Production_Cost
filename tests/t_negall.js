const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 console.log(await pg.evaluate(()=>{ calcCache=null; const c=calc(); return c.list.map(k=>{ const P=c.periods[k]; const neg=Object.entries(P.pBQ).filter(([m,v])=>v<0).length; return `${k}: 621=${Math.round(P.sum621)} 155=${Math.round(P.c154NK||0)} giáÂm=${neg} lineÂm=${P.lines.filter(l=>l.tt<0).length}`; }).join('\n'); }));
 await b.close(); })();
