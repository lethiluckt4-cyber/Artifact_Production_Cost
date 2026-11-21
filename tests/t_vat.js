const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1500,height:900}})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 await pg.evaluate(()=>{ selKy='2026-04'; view='d_purchases'; render(); });
 console.log('Cột:', await pg.evaluate(()=>[...document.querySelectorAll('#main thead th')].map(h=>h.textContent.replace('▼','').trim()).join(' | ')));
 await pg.click('[data-edit]'); await pg.click('td.ed[data-k="thueGTGT"]'); await pg.keyboard.type('14814835'); await pg.click('[data-save]'); await pg.waitForTimeout(300);
 console.log('Dòng tổng:', await pg.evaluate(()=>document.querySelector('#main tr.tot').innerText.replace(/\s+/g,' ')));
 const imp=await pg.evaluate(()=>{ const n=importAOA('purchases', [['Ngày nhập kho','Ngày hóa đơn','Số hóa đơn','Nhà cung cấp','Mã hàng','Số lượng','Đơn giá','Thành tiền','Kho','Ghi chú','Tiền thuế'],['2026-10-05','','HD9','NCC','VAI_IN',10,1000,'','','',800]], 'add', true); const g=splitGiaoDich([GD_COLS,['MUA','2026-10-07','HD11','NCC','VAI_IN',2,500,1000,'',80]]); importAOA('purchases', g.purchases, 'add', true); return state.purchases.filter(p=>p.hoaDon==='HD9'||p.hoaDon==='HD11').map(p=>[p.hoaDon,p.tt,p.thueGTGT]); }); console.log('Nhập Excel:', JSON.stringify(imp));
 console.log('errs', errs); await b.close(); })();
