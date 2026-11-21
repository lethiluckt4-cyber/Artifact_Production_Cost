const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='canhbao'; document.querySelector('#main').dataset.cbt='ng'; render(); }); await pg.click('#ngE'); await pg.waitForTimeout(150);
 console.log('Số nút xóa:', await pg.evaluate(()=>[document.querySelectorAll('[data-rm]').length, document.querySelectorAll('[data-clr]').length]));
 await pg.screenshot({path:'/home/claude/work/shots/ng2.png', fullPage:true});
 // xóa ngưỡng giá mua + chỉ tiêu nkBan
 await pg.evaluate(()=>{ document.querySelector('[data-gn="muaV"]').closest('tr').querySelector('[data-clr]').click(); document.querySelector('[data-kp="nkBan"]').closest('tr').querySelector('[data-clr]').click(); });
 await pg.click('#ngSave'); await pg.waitForTimeout(200);
 console.log('Sau lưu:', await pg.evaluate(()=>JSON.stringify({gia:state.settings.giaNg, nk:state.settings.kpiNg.nkBan, giaNg:[giaNg().muaV, giaNg().muaD], kp:kpiNg().nkBan})));
 console.log('Ô hiển thị:', await pg.evaluate(()=>[document.querySelector('[data-gn="muaV"]').textContent, document.querySelector('[data-kp="nkBan"]').textContent]));
 await pg.evaluate(()=>{ document.querySelector('#main').dataset.cbt='kq'; render(); }); console.log('Kết quả kiểm tra chạy được:', await pg.evaluate(()=>document.querySelectorAll('#main table').length>0));
 console.log('errs', errs); await b.close(); })();
