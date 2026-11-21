const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1300,height:400}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='d_items'; render(); }); await pg.waitForTimeout(300); await pg.screenshot({path:'/home/claude/work/shots/dmk1.png', clip:{x:236,y:0,width:1064,height:200}});
 const t2=await pg.$('[data-dmt="nh"], .tabs button:nth-child(2)'); if (t2) { await t2.click(); await pg.waitForTimeout(300); await pg.screenshot({path:'/home/claude/work/shots/dmk2.png', clip:{x:236,y:0,width:1064,height:200}}); }
 await pg.evaluate(()=>{ view='d_purchases'; render(); }); await pg.waitForTimeout(200); console.log('ksel purchases', await pg.evaluate(()=>!!document.querySelector('.ksel')));
 console.log(errs); await b.close(); })();
