const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 console.log('Thiếu kho sau khởi động:', await pg.evaluate(()=>({items:state.items.filter(i=>!i.kho).length, mua:state.purchases.filter(r=>!r.kho).length, ban:state.sales.filter(r=>!r.kho).length, dk:Object.values(state.opening.rows).filter(o=>!o.kho).length, banKho:[...new Set(state.sales.map(r=>r.kho))]})));
 console.log('Dòng tô đỏ (thiếu bắt buộc):', await pg.evaluate(()=>['d_items','d_purchases','d_sales','d_issues'].map(v=>{ view=v; selKy='2026'; render(); return v+':'+document.querySelectorAll('#main tr.badrow').length+' cột Kho:'+[...document.querySelectorAll('#main thead th')].some(t=>t.textContent.startsWith('Kho')); }).join(' | ')));
 // Thêm bán hàng: chọn mã → kho tự điền
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='d_sales'; selKy='2026-03'; render(); }); await pg.click('#add'); await pg.waitForTimeout(150);
 await pg.fill('#modal .ed[data-k="ma"] .ci','TP_BBN'); console.log('Kho tự điền (bán):', await pg.evaluate(()=>document.querySelector('#modal .ed[data-k="kho"] .ci').value), '| bắt buộc *:', await pg.evaluate(()=>document.querySelector('#modal .ed[data-k="kho"] label').textContent));
 await pg.click('#frmC'); if (await pg.$('#gDrop')) await pg.click('#gDrop');
 // Xuất dùng chung: bỏ trống kho, mã không có kho → báo thiếu
 await pg.evaluate(()=>{ view='d_issues'; render(); }); await pg.click('#add'); await pg.fill('#modal .ed[data-k="ngay"] .ci','10/03/2026'); await pg.selectOption('#modal .ed[data-k="loai"] select', {index:1}); await pg.fill('#modal .ed[data-k="maVT"] .ci','VALO'); await pg.fill('#modal .ed[data-k="sl"] .ci','5');
 console.log('Kho xuất dùng chung:', await pg.evaluate(()=>document.querySelector('#modal .ed[data-k="kho"] .ci').value)); await pg.click('#frmS'); await pg.waitForTimeout(200);
 console.log('Đã lưu xuất chung:', await pg.evaluate(()=>{ const r=state.issues.find(r=>r.maVT==='VALO'); return r?[r.kho,r.sl]:null; }));
 // NXT chọn kho
 await pg.evaluate(()=>{ view='nxt'; selKy='2026'; render(); }); const all=await pg.evaluate(()=>document.querySelectorAll('#main tbody tr[data-i]').length);
 await pg.click('#khoBtn'); await pg.waitForTimeout(100); await pg.screenshot({path:'/home/claude/work/shots/kho1.png', clip:{x:236,y:0,width:900,height:360}});
 await pg.evaluate(()=>{ [...document.querySelectorAll('#khoPop input')].forEach(x=>x.checked=['152','156'].includes(x.value)); }); await pg.click('#khoOk'); await pg.waitForTimeout(200);
 const r=await pg.evaluate(()=>({n:document.querySelectorAll('#main tbody tr[data-i]').length, kho:[...new Set([...document.querySelectorAll('#main tbody tr[data-i] td:first-child')].map(t=>t.textContent))], btn:document.querySelector('#khoBtn').textContent}));
 console.log('NXT: tất cả', all, 'dòng → chọn 152+156:', JSON.stringify(r));
 await pg.screenshot({path:'/home/claude/work/shots/kho2.png', clip:{x:236,y:0,width:1204,height:300}});
 await pg.evaluate(()=>{ view='d_opening'; render(); }); console.log('Số dư đầu kỳ cột Kho*:', await pg.evaluate(()=>[...document.querySelectorAll('#main thead th')].map(t=>t.textContent).find(t=>t.startsWith('Kho'))));
 console.log('errs', errs); await b.close(); })();
