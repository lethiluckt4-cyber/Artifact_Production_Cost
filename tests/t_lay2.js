const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 for (const [v,f] of [['d_purchases','l1'],['nxt','l2'],['giathanh','l3'],['d_orders','l4']]) { await pg.evaluate(v=>{ view=v; render(); document.querySelectorAll('.toast').forEach(t=>t.remove()); }, v); await pg.waitForTimeout(250); await pg.screenshot({path:`/home/claude/work/shots/${f}.png`, clip:{x:236,y:0,width:1204,height:200}}); }
 console.log('errs', errs); await b.close(); })();
