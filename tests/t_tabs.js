const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1500,height:900}})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 console.log('KH tabs:', await pg.evaluate(()=>{ view='kehoach'; selKy='2026-06'; render(); return document.querySelectorAll('#main .tabs').length+' · '+[...document.querySelectorAll('#main h3')].map(h=>h.textContent.trim().slice(0,40)).join(' | '); }));
 await pg.evaluate(()=>{ view='d_orders'; render(); }); await pg.click('#dxView'); await pg.waitForTimeout(200);
 console.log('Modal đề xuất:', await pg.evaluate(()=>document.querySelector('#modal').innerText.replace(/\s+/g,' ').slice(0,200)));
 await pg.click('#mclose');
 // tháng 10 chưa có lệnh → tạo
 await pg.evaluate(()=>{ state.sales.push({_id:uid(), ngay:'2026-10-20', ma:'TP_QBN_1', sl:150, donGia:20000, doanhSo:3000000, hoaDon:'X1', khach:'K'}); changed(); selKy='2026-10'; view='d_orders'; render(); });
 console.log('Nút:', await pg.evaluate(()=>document.querySelector('#dxView').innerText)); await pg.click('#dxView'); await pg.waitForTimeout(200); const dis=await pg.evaluate(()=>document.querySelector('#plApply').disabled); console.log('plApply disabled', dis);
 if (!dis) { await pg.click('#plApply'); await pg.waitForTimeout(200); console.log('Dialog:', await pg.evaluate(()=>document.querySelector('#modal').innerText.slice(0,120).replace(/\s+/g,' '))); }
 await pg.evaluate(()=>{ closeModal(); selKy='2026-06'; view='d_adjustments'; render(); }); await pg.click('#goDX'); await pg.waitForTimeout(200);
 console.log('Modal cân đối:', await pg.evaluate(()=>document.querySelector('#modal').innerText.replace(/\s+/g,' ').slice(0,160)));
 await pg.evaluate(()=>{ closeModal(); view='canhbao'; render(); }); 
 console.log('errs', errs); await b.close(); })();
