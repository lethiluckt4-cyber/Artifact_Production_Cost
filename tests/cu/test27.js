const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; view='nxt'; render(); }); await pg.waitForTimeout(300);
 const full = await pg.evaluate(()=>{ const p=P(); const x=p.nxt.find(x=>x.ma==='TRGA'); return [p.sum154, p.doanhSo, x.openSL, x.closeSL]; });
 await pg.selectOption('#selM','RANGE'); await pg.waitForTimeout(200); await pg.fill('#selFrom','2026-10-01'); await pg.fill('#selTo','2026-10-10'); await pg.click('#selGo'); await pg.waitForTimeout(400);
 const r1 = await pg.evaluate(()=>{ const p=P(); const x=p.nxt.find(x=>x.ma==='TRGA'); return [selKy, p.orders.length, p.sum154, p.doanhSo, x.openSL, x.nhapSL, x.xuatSL, x.closeSL]; });
 await pg.evaluate(()=>{ selKy='R:2026-10-11:2026-10-31'; render(); }); await pg.waitForTimeout(300);
 const r2 = await pg.evaluate(()=>{ const p=P(); const x=p.nxt.find(x=>x.ma==='TRGA'); return [p.orders.length, p.sum154, p.doanhSo, x.openSL, x.closeSL]; });
 console.log('full', full); console.log('r1', r1); console.log('r2', r2, 'sum check', Math.round(r1[2]+r2[1])===Math.round(full[0]), Math.round(r1[3]+r2[2])===Math.round(full[1]), r1[7]===r2[3], r2[4]===full[3]);
 await pg.screenshot({path:'/tmp/man-hinh-49-tu-ngay-den-ngay.png'});
 for (const v of ['canhbao','giathanh','banhang','kehoach','lsxtt','d_purchases','d_orders','d_adjustments','xuatphieu','canhbao','chiphi','nam']) { await pg.evaluate(v=>{ view=v; render(); }, v); await pg.waitForTimeout(150); }
 console.log(errs); await b.close(); })();
