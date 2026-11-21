const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true); await pg.waitForTimeout(2000);
 console.log('Lần 1:', await pg.evaluate(()=>({items:state.items.length, orders:state.orders.length, h:document.querySelector('#main h2').textContent, saved:Object.keys(store.lastSaved).length})));
 await pg.evaluate(()=>{ state.items[0].ten='SỬA THỬ'; changed(); }); await pg.waitForTimeout(2000);
 await pg.reload(); await pg.waitForFunction(()=>window.__booted===true);
 console.log('Lần 2:', await pg.evaluate(()=>({items:state.items.length, ten0:state.items[0].ten, orders:state.orders.length})), errs); await b.close(); })();
