const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 // mô phỏng người dùng: Thiết lập → Phục hồi file
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='thietlap'; render(); }); await pg.waitForTimeout(300);
 await pg.setInputFiles('#rs', '/home/claude/work/import/nap_final.json'); await pg.waitForTimeout(500);
 console.log('confirm:', (await pg.textContent('#modal')).slice(0,160));
 await pg.click('#modal .btn.p'); await pg.waitForTimeout(800);
 console.log('after:', await pg.evaluate(()=>JSON.stringify({items:state.items.length, pur:state.purchases.length, sales:state.sales.length, orders:state.orders.length, gc:state.gc.length, cal:state.cal.length})));
 await pg.evaluate(()=>{ view='giathanh'; render(); }); await pg.waitForTimeout(300); await pg.click('#recalc'); await pg.waitForTimeout(400);
 await pg.selectOption('#rcM','11'); await pg.waitForTimeout(200); console.log('btn:', await pg.textContent('#rcGo'), '|', await pg.textContent('#rcState'));
 await pg.click('#rcGo'); await pg.waitForTimeout(30000);
 console.log('orders', await pg.evaluate(()=>state.orders.length), await pg.evaluate(()=>document.querySelector('#modal h3')?.textContent));
 console.log(errs); await b.close(); })();
