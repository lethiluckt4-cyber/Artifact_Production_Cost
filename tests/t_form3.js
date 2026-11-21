const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 await pg.evaluate(()=>{ view='d_purchases'; selKy='2026-03'; render(); }); await pg.click('#add');
 await pg.fill('#modal .ed[data-k="ngayNhap"] .ci','22/03/2026'); await pg.fill('#modal .ed[data-k="ma"] .ci','VALO'); await pg.click('#modal .ed[data-k="sl"] .ci'); await pg.keyboard.type('0,125'); await pg.click('#modal .ed[data-k="tt"] .ci'); await pg.keyboard.type('1500'); await pg.click('#frmS'); await pg.waitForTimeout(300);
 console.log(await pg.evaluate(()=>{ const r=state.purchases.find(r=>r.ngayNhap==='2026-03-22'); return r?[r.sl,r.tt,r.donGia]:null; })); await b.close(); })();
