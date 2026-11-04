const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); changed(); state.settings.workYear='2026'; selKy='2026-10'; view='kehoach'; render(); }); await pg.waitForTimeout(400);
 console.log(await pg.evaluate(()=>{ const d=buildProposal(P()); return {rem:d.remDays, last:d.lastDay, chot:d.chotRows.map(c=>[c.tp,c.dc]), notes:d.rows.map(r=>r.note)}; }));
 await pg.screenshot({path:'/tmp/man-hinh-23-de-xuat.png'});
 await pg.click('#recalc'); await pg.waitForTimeout(200); await pg.click('#rcGo'); await pg.waitForTimeout(1500); await pg.evaluate(()=>closeModal()); await pg.waitForTimeout(300);
 // proposal auto-applied by runCalcFor
 console.log('orders', await pg.evaluate(()=>[app.state.orders.length, app.state.orders.filter(o=>o.ghiChu==='Đề xuất SX').map(o=>[o.maLenh,o.soMeKH]), app.state.orders.filter(o=>o.dieuChinhMe<0).map(o=>[o.maLenh,o.dieuChinhMe])]));
 await pg.click('.tabs button[data-t=dc]'); await pg.waitForTimeout(400); await pg.screenshot({path:'/tmp/man-hinh-24-de-xuat-dieu-chinh-nvl.png', fullPage:true});
 console.log(await pg.evaluate(()=>{ const d=buildAdjProposal((calcCache=null,P())); return {an:d.analysis.map(a=>[a.ma,a.close,a.why]), rows:d.rows.length, tot:d.rows.reduce((s,r)=>s+r.deXuat,0)}; }));
 await pg.click('#adjApply'); await pg.waitForTimeout(200); await pg.click('#mo'); await pg.waitForTimeout(500);
 console.log('after apply neg', await pg.evaluate(()=>(calcCache=null,P()).nxt.filter(x=>x.closeSL<0).map(x=>[x.ma,x.closeSL])), errs);
 await b.close(); })();
