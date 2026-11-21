const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); app.state.settings.tonLau=40; changed(); state.settings.workYear='2026'; selKy='2026-10'; view='kehoach'; render(); }); await pg.waitForTimeout(400);
 const before = await pg.evaluate(()=>JSON.stringify(app.state.orders.map(o=>[o.maLenh,o.soMeKH,o.dieuChinhMe])));
 await pg.evaluate(()=>{ calcDirty=true; view='giathanh'; render(); }); await pg.click('#recalc'); await pg.waitForTimeout(200); await pg.click('#rcGo'); await pg.waitForTimeout(1500); await pg.click('#rsAdj'); await pg.waitForTimeout(1500); await pg.evaluate(()=>closeModal()); await pg.evaluate(()=>{ view='kehoach'; render(); }); await pg.waitForTimeout(300);
 await pg.click('.tabs button[data-t=dc]'); await pg.waitForTimeout(400); if (await pg.$('#adjApply')) { await pg.click('#adjApply'); await pg.waitForTimeout(200); await pg.click('#mo'); await pg.waitForTimeout(400); }
 console.log('after apply', await pg.evaluate(()=>[app.state.orders.length, app.state.orders.filter(o=>num(o.dcPM)).length, app.state.adjustments.filter(a=>/Đề xuất PM/.test(a.lyDo)).length]));
 // manual tweak on one order should survive
 await pg.evaluate(()=>{ const o=app.state.orders.find(x=>x.maLenh==='LSX2026-10.01-01'); o.dieuChinhMe=num(o.dieuChinhMe)+1; changed(); view='lsxtt'; render(); }); await pg.waitForTimeout(300);
 await pg.click('#ltUndo'); await pg.waitForTimeout(200); await pg.click('#mo'); await pg.waitForTimeout(500);
 const after = await pg.evaluate(()=>JSON.stringify(app.state.orders.map(o=>[o.maLenh,o.soMeKH,o.dieuChinhMe])));
 console.log('restored all', after===before, await pg.evaluate(()=>[app.state.orders.length, app.state.orders.find(x=>x.maLenh==='LSX2026-10.01-01').dieuChinhMe, app.state.adjustments.filter(a=>/Đề xuất PM/.test(a.lyDo)).length]), errs);
 await b.close(); })();
