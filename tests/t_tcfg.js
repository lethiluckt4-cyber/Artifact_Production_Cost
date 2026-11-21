const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 await pg.evaluate(()=>{ view='d_purchases'; selKy='2026-03'; render(); }); await pg.click('#tblCfg'); await pg.waitForTimeout(200);
 await (await pg.$('#modal .in')).screenshot({path:'/home/claude/work/shots/tc1.png'});
 const th0 = await pg.evaluate(()=>[...document.querySelectorAll('#main .tw > table thead th')].map(t=>t.textContent.trim()).slice(0,5));
 // đưa cột 3 (Số hóa đơn) lên đầu, ẩn Ngày hóa đơn
 await pg.click('[data-up="2"]'); await pg.click('[data-up="1"]'); await pg.evaluate(()=>{ const x=[...document.querySelectorAll('#tcList [data-tc]')].find(i=>i.parentElement.textContent.trim()==='Ngày hóa đơn'); x.click(); });
 await pg.click('#tcOk'); await pg.waitForTimeout(300);
 const th1 = await pg.evaluate(()=>[...document.querySelectorAll('#main .tw > table thead th')].map(t=>t.textContent.trim()).slice(0,5));
 // sửa & lưu 1 dòng vẫn đúng dữ liệu
 const r = await pg.evaluate(()=>{ const id=state.purchases.find(r=>kyOf(r.ngayNhap)==='2026-03')._id; return [id, JSON.stringify(state.purchases.find(r=>r._id===id))]; });
 await pg.evaluate(id=>{ editRow=id; render(); }, r[0]); await pg.click(`[data-save="${r[0]}"]`); await pg.waitForTimeout(200);
 const same = await pg.evaluate(([id,js])=>{ const x=JSON.parse(js), y=state.purchases.find(r=>r._id===id); return Object.keys(x).every(k=>k[0]==='_'||String(x[k])===String(y[k])); }, r);
 console.log('Trước:', th0); console.log('Sau :', th1); console.log('Lưu dòng không đổi dữ liệu:', same);
 await pg.click('#tblCfg'); await pg.click('#tcReset'); await pg.click('#tcOk'); await pg.waitForTimeout(300);
 console.log('Trả mặc định:', await pg.evaluate(()=>[...document.querySelectorAll('#main .tw > table thead th')].map(t=>t.textContent.trim()).slice(0,5)), JSON.stringify(uiPrefOrder=await pg.evaluate(()=>[state.settings.uiOrder, state.settings.uiHide])));
 console.log('errs', errs); await b.close(); })();
