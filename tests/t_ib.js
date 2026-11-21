const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 await pg.evaluate(()=>{ view='d_bom'; render(); }); await pg.waitForTimeout(300);
 await (await pg.$('.toolbar')).screenshot({path:'/home/claude/work/shots/ib1.png'});
 await pg.evaluate(()=>{ editRow=state.bom[0]._id; render(); }); await pg.waitForTimeout(300);
 const td=await pg.$$('#main td.act'); await td[0].scrollIntoViewIfNeeded(); const bb=await td[0].boundingBox(); await pg.screenshot({path:'/home/claude/work/shots/ib2.png', clip:{x:Math.max(0,bb.x-60),y:Math.max(0,bb.y-4),width:Math.min(bb.width+70,1440-Math.max(0,bb.x-60)),height:110}});
 await pg.evaluate(()=>{ editRow=null; view='d_costs'; render(); }); await (await pg.$('.toolbar')).screenshot({path:'/home/claude/work/shots/ib3.png'});
 console.log(errs); await b.close(); })();
