const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 // dữ liệu cũ 3 công đoạn → tự chuyển, giá thành không đổi
 const before = await pg.evaluate(()=>{ state.settings.alloc={cds:[{ten:'Cắt',t622:0.15,t627:0.2,ts:'QD'},{ten:'May',t622:0.75,t627:0.6,ts:'QD'},{ten:'Đóng gói',t622:0.1,t627:0.2,ts:'QD'}]}; calcCache=null; const c=calc(); return Object.values(c.periods).reduce((s,P)=>s+P.sum154,0); });
 const after = await pg.evaluate(()=>{ state.settings.alloc={cds:[{ten:'Sản xuất',t622:1,t627:1,ts:'QD'}]}; calcCache=null; const c=calc(); return Object.values(c.periods).reduce((s,P)=>s+P.sum154,0); });
 console.log('Tổng 154 cả năm: 3 công đoạn', Math.round(before).toLocaleString('vi-VN'), '| 1 tiêu thức', Math.round(after).toLocaleString('vi-VN'), '| lệch', (after-before).toFixed(6));
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='thietlap'; document.querySelector('#main').dataset.tlt='pb'; render(); }); await pg.waitForTimeout(200);
 await pg.screenshot({path:'/home/claude/work/shots/al1.png', clip:{x:236,y:0,width:1204,height:330}});
 await pg.selectOption('#alTs','SL'); await pg.click('#alSave'); console.log('Lưu tiêu thức:', await pg.evaluate(()=>JSON.stringify(state.settings.alloc)));
 console.log('errs', errs); await b.close(); })();
