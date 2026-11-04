const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1300,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; calcCache=null; view='d_purchases'; render(); }); await pg.waitForTimeout(300);
 await pg.screenshot({path:'/tmp/n_sticky_act.png'});
 console.log('btn visible', await pg.evaluate(()=>{ const b=document.querySelector('tbody td.act [data-edit]'); const r=b.getBoundingClientRect(); return [Math.round(r.right), window.innerWidth, b.textContent]; }));
 // grid: new row -> Xóa discards
 const n0=await pg.evaluate(()=>state.purchases.length);
 await pg.click('#add'); await pg.waitForTimeout(200); await pg.click('button[data-cancel]'); await pg.waitForTimeout(200);
 console.log('new discard', await pg.evaluate(n0=>[state.purchases.length-n0, !!editRow], n0));
 // grid existing: Sửa then Xóa -> confirm
 await pg.click('tbody tr:first-child [data-edit]'); await pg.waitForTimeout(200); await pg.click('tbody tr:first-child button[data-cancel]'); await pg.waitForTimeout(200);
 console.log('confirm shown', await pg.evaluate(()=>!!document.querySelector('#mo')), await pg.evaluate(()=>document.querySelector('.modal')?.textContent.slice(0,30)));
 await pg.click('#mo'); await pg.waitForTimeout(300); console.log('deleted', await pg.evaluate(n0=>state.purchases.length-n0,n0));
 // opening
 await pg.evaluate(()=>{ view='d_opening'; render(); }); await pg.waitForTimeout(300);
 const o0=await pg.evaluate(()=>Object.keys(state.opening.rows).length);
 await pg.click('tbody tr:first-child [data-edit]'); await pg.waitForTimeout(200); await pg.click('tbody tr:first-child button[data-cancel]'); await pg.waitForTimeout(200); await pg.click('#mo'); await pg.waitForTimeout(300);
 console.log('opening', o0, '->', await pg.evaluate(()=>Object.keys(state.opening.rows).length));
 // costs
 await pg.evaluate(()=>{ view='d_costs'; render(); }); await pg.waitForTimeout(300);
 await pg.click('[data-edit="2026-09"]'); await pg.waitForTimeout(200); await pg.click('button[data-cancel="2026-09"]'); await pg.waitForTimeout(200); await pg.click('#mo'); await pg.waitForTimeout(300);
 console.log('cost 09', await pg.evaluate(()=>state.costs['2026-09']), errs);
 await b.close(); })();
