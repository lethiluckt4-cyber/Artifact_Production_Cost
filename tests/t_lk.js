const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 console.log(await pg.evaluate(()=>['tongquan','d_purchases','nxt','giathanh','canhbao','d_orders'].map(v=>{ view=v; render(); return v+':'+(!!document.querySelector('#lockbtn')); }).join(' ')));
 await pg.evaluate(()=>{ view='tongquan'; render(); }); await pg.click('#lockbtn'); console.log('Hộp khóa kỳ mở:', await pg.evaluate(()=>!!document.querySelector('#modal .modal'))); await b.close(); })();
