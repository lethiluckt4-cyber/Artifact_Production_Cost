const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 console.log(await pg.evaluate(()=>['tongquan','kehoach','d_orders','giathanh','d_adjustments','d_costs','d_gc','d_purchases','nxt','canhbao'].map(v=>{ view=v; render(); return v+':'+(!!document.querySelector('#recalc')); }).join(' ')));
 await pg.evaluate(()=>{ view='giathanh'; render(); }); await pg.click('#recalc'); await pg.waitForTimeout(300); console.log('Hộp tính mở:', await pg.evaluate(()=>!!document.querySelector('#modal .modal')));
 console.log(errs); await b.close(); })();
