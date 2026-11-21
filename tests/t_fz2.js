const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1200,height:700}})).newPage();
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 for (const [v,k] of [['d_purchases','2026-04'],['nxt','2026-06'],['d_gc','2026-04']]) { await pg.evaluate(([v,k])=>{ selKy=k; view=v; render(); const tw=document.querySelector('#main .tw'); tw.scrollLeft=400; }, [v,k]); await pg.waitForTimeout(300); await pg.screenshot({path:`/home/claude/work/shots/fz_${v}.png`}); }
 await b.close(); })();
