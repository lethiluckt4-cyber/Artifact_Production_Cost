const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); state.settings.nhomCT=[{ten:'Đồ bơi nữ',loai:'Thành phẩm-SX',kho:'155'}]; view='d_items'; document.querySelector('#main').dataset.dmt='nhom'; render(); }); await pg.waitForTimeout(200);
 console.log('Ô chọn:', await pg.evaluate(()=>[document.querySelectorAll('[data-nsel]').length, document.querySelectorAll('#main tbody tr').length]));
 await pg.click('#nhAll'); console.log('Chọn tất cả →', await pg.evaluate(()=>$('#nhDelSel').textContent)); await pg.click('#nhDelSel'); await pg.waitForTimeout(150);
 console.log('Hộp xác nhận:', await pg.evaluate(()=>(document.querySelector('#modal')||{}).innerText||'')); await pg.click('#mo').catch(()=>{}); await pg.waitForTimeout(150);
 console.log('Còn nhóm tự thêm:', await pg.evaluate(()=>JSON.stringify(state.settings.nhomCT)));
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); render(); }); await pg.screenshot({path:'/home/claude/work/shots/nh4.png', clip:{x:236,y:0,width:1204,height:480}});
 console.log('errs', errs); await b.close(); })();
