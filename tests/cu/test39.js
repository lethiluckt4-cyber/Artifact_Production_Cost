const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:800}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; calcCache=null; view='lsxtt'; render(); }); await pg.waitForTimeout(300);
 const n0=await pg.evaluate(()=>state.orders.length);
 await pg.click('#naRow'); await pg.waitForTimeout(200); await pg.screenshot({path:'/tmp/n_addorder.png'});
 console.log('persist while new', await pg.evaluate(()=>toDocs()['o_2026-10'].rows.length), n0);
 await pg.click('button[data-save]'); await pg.waitForTimeout(200); console.log('still editing', await pg.evaluate(()=>!!editRow));
 await pg.selectOption('select.ci[data-k="maTP"]','BO'); await pg.fill('input.ci[data-k="soMeKH"]','3'); await pg.click('button[data-save]'); await pg.waitForTimeout(400);
 console.log('added', await pg.evaluate(n0=>[state.orders.length-n0, state.orders[0].maLenh, state.orders[0]._new], n0));
 // edit existing
 await pg.click('tbody tr:nth-child(1) [data-edit]'); await pg.waitForTimeout(200);
 await pg.fill('input.ci[data-k="dieuChinhMe"]','2'); await pg.press('input.ci[data-k="dieuChinhMe"]','Enter'); await pg.waitForTimeout(300);
 console.log('edited', await pg.evaluate(()=>state.orders.filter(o=>o.dieuChinhMe===2).map(o=>o.maLenh)));
 // cancel new
 await pg.click('#naRow'); await pg.waitForTimeout(200); await pg.click('tbody tr:first-child button[data-del]'); await pg.waitForTimeout(200); console.log('after cancel', await pg.evaluate(()=>state.orders.filter(o=>o._new).length));
 // delete
 const nb=await pg.evaluate(()=>state.orders.length); await pg.click('tbody tr:nth-child(1) [data-del]'); await pg.waitForTimeout(200); await pg.click('#mo'); await pg.waitForTimeout(300); console.log('deleted', nb, '->', await pg.evaluate(()=>state.orders.length), errs);
 await b.close(); })();
