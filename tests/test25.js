const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); calcCache=null; calcDirty=false; state.settings.workYear='2026'; selKy='2026-10'; view='giathanh'; render(); }); await pg.waitForTimeout(300);
 const s1 = await pg.evaluate(()=>P().sum154);
 await pg.evaluate(()=>{ app.state.orders.push({_id:'x1', maLenh:'LSX2026-10.29-99', ngayXuatNVL:'2026-10-29', ngaySX:'2026-10-29', maTP:'BO', loaiDM:'DM', soMeKH:10, dieuChinhMe:0, ghiChu:''}); changed(); render(); }); await pg.waitForTimeout(200);
 console.log('dirty', await pg.evaluate(s1=>[calcDirty, P().sum154===s1, document.querySelector('#recalc').textContent.trim()], s1), s1);
 await pg.click('#recalc'); await pg.waitForTimeout(200); await pg.click('#rcGo'); await pg.waitForTimeout(600); await pg.screenshot({path:'/tmp/man-hinh-45-ket-qua-tinh.png'});
 console.log('after', await pg.evaluate(()=>[calcDirty, P().sum154, P().orders.length, !!document.querySelector('.modal')]), errs); await b.close(); })();
