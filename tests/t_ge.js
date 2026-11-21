const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='canhbao'; document.querySelector('#main').dataset.cbt='ng'; render(); }); await pg.click('#ngE');
 console.log('Nhãn đang sửa:', await pg.evaluate(()=>document.querySelector('#main>.top').textContent.includes('Đang sửa')));
 await pg.evaluate(()=>{ document.querySelector('td[data-f="max"]').textContent='999'; });
 await pg.click('nav button[data-v="nxt"]').catch(async()=>{ await pg.evaluate(()=>[...document.querySelectorAll('nav button')].find(b=>b.textContent.includes('Nhập – Xuất')).click()); });
 await pg.waitForTimeout(150); console.log('Cảnh báo hiện:', await pg.evaluate(()=>(document.querySelector('#modal h3')||{}).textContent), '| view:', await pg.evaluate(()=>view));
 await pg.click('#gStay'); console.log('Ở lại → view', await pg.evaluate(()=>view), 'vẫn sửa:', await pg.evaluate(()=>document.querySelector('#main').dataset.ngEd));
 await pg.evaluate(()=>[...document.querySelectorAll('nav button')].find(b=>b.textContent.includes('Nhập – Xuất')).click()); await pg.click('#gSave'); await pg.waitForTimeout(200);
 console.log('Lưu rồi tiếp tục → view', await pg.evaluate(()=>view), 'max =', await pg.evaluate(()=>nguongList()[0].max));
 // phân bổ: bỏ thay đổi
 await pg.evaluate(()=>{ view='thietlap'; document.querySelector('#main').dataset.tlt='pb'; render(); }); await pg.click('#alE'); await pg.selectOption('#alTs','621');
 await pg.evaluate(()=>[...document.querySelectorAll('nav button')].find(b=>b.textContent.includes('Tổng quan')).click()); console.log('Cảnh báo PB:', await pg.evaluate(()=>(document.querySelector('#modal h3')||{}).textContent));
 await pg.click('#gDrop'); await pg.waitForTimeout(150); console.log('Bỏ → view', await pg.evaluate(()=>view), 'ts =', await pg.evaluate(()=>allocCfg().cds[0].ts));
 // Số mã hàng không gạch chân
 await pg.evaluate(()=>{ view='d_items'; document.querySelector('#main').dataset.dmt='nhom'; render(); }); console.log('Gạch chân số:', await pg.evaluate(()=>getComputedStyle(document.querySelector('td.lnkc.n')).textDecorationLine));
 console.log('errs', errs); await b.close(); })();
