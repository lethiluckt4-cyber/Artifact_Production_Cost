const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1400,height:700}})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(500);
 // 1) Đề xuất sản xuất, tab Lệnh, tháng 5, cuộn xuống
 await pg.evaluate(()=>{ view='kehoach'; document.querySelector('#main').dataset.ktab='lenh'; selKy='2026-05'; render(); }); await pg.waitForTimeout(200); await pg.evaluate(()=>window.scrollTo(0,600)); await pg.waitForTimeout(500);
 await pg.reload(); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(400);
 console.log('1)', JSON.stringify(await pg.evaluate(()=>({view, selKy, ktab:document.querySelector('#main').dataset.ktab, y:Math.round(scrollY), h2:document.querySelector('#main h2').textContent}))));
 // 2) Mua hàng tháng 4, đang sửa 1 dòng (chưa lưu)
 await pg.evaluate(()=>{ view='d_purchases'; selKy='2026-04'; render(); }); await pg.click('[data-edit]'); await pg.click('td.ed[data-k="ncc"]'); await pg.keyboard.press('Control+A'); await pg.keyboard.type('NCC ĐANG GÕ DỞ'); await pg.waitForTimeout(500);
 await pg.reload(); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(400);
 console.log('2)', JSON.stringify(await pg.evaluate(()=>({view, selKy, editRow:!!editRow, ncc:(document.querySelector('td.ed[data-k="ncc"]')||{}).textContent, luuChua: state.purchases.some(p=>p.ncc==='NCC ĐANG GÕ DỞ')}))));
 await pg.click('[data-save]'); await pg.waitForTimeout(300); console.log('   sau Lưu:', await pg.evaluate(()=>state.purchases.some(p=>p.ncc==='NCC ĐANG GÕ DỞ')));
 // 3) dòng mới đang thêm
 await pg.evaluate(()=>{ view='d_sales'; selKy='2026-06'; render(); }); await pg.click('#add'); await pg.fill('#modal .ed[data-k="hoaDon"] .ci','HD-MOI'); await pg.waitForTimeout(500);
 await pg.reload(); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(400);
 console.log('3)', JSON.stringify(await pg.evaluate(()=>({view, editRow:!!editRow, hd:(document.querySelector('#modal .ed[data-k="hoaDon"] .ci')||{}).value}))));
 console.log('errs', errs); await b.close(); })();
