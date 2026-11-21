const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='d_items'; document.querySelector('#main').dataset.dmt='nhom'; render(); }); await pg.waitForTimeout(200);
 // Thêm nhóm "Đồ bơi nữ" tính như Thành phẩm-SX
 await pg.click('#nhAdd'); await pg.fill('#nfTen','Đồ bơi nữ'); await pg.selectOption('#nfLoai','Thành phẩm-SX'); console.log('Kho tự điền:', await pg.evaluate(()=>$('#nfKho').value)); await pg.click('#nfS'); await pg.waitForTimeout(200);
 console.log('nhomCT:', await pg.evaluate(()=>JSON.stringify(state.settings.nhomCT)));
 await pg.screenshot({path:'/home/claude/work/shots/nh3.png', clip:{x:236,y:0,width:1204,height:560}});
 // chuyển 1 mã TP sang nhóm mới → giá thành không đổi
 const r=await pg.evaluate(()=>{ calcCache=null; const c0=calc(); const a=Object.values(c0.periods).reduce((s,P)=>s+P.sum154,0); const it=state.items.find(i=>i.ma==='TP_BBN'); const old=it.nhom; it.nhom='Đồ bơi nữ'; calcCache=null; const c1=calc(); const b2=Object.values(c1.periods).reduce((s,P)=>s+P.sum154,0); return [old, isFinal(it), dongOf(it), khoOfMa('TP_BBN'), Math.round(a), Math.round(b2)]; });
 console.log('TP_BBN sang nhóm mới:', JSON.stringify(r));
 // xóa nhóm đang có mã → chặn
 await pg.evaluate(()=>render()); await pg.click('[data-ndel="Đồ bơi nữ"]'); await pg.waitForTimeout(150); console.log('Xóa nhóm có mã:', await pg.evaluate(()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).pop()));
 await pg.evaluate(()=>{ state.items.find(i=>i.ma==='TP_BBN').nhom='Thành phẩm-SX'; render(); }); await pg.check('[data-nsel="Đồ bơi nữ"]'); console.log('Nút xóa chọn hiện:', await pg.evaluate(()=>$('#nhDelSel').style.display!=='none')); await pg.click('#nhDelSel'); await pg.click('#mo'); await pg.waitForTimeout(150); console.log('Sau xóa:', await pg.evaluate(()=>JSON.stringify(state.settings.nhomCT)));
 // Ô chọn ở bảng nhập liệu
 await pg.evaluate(()=>{ view='d_sales'; selKy='2026-03'; render(); }); await pg.waitForTimeout(200);
 const n0=await pg.evaluate(()=>state.sales.length); const k=await pg.evaluate(()=>document.querySelectorAll('[data-sel]').length);
 await pg.check('#main [data-sel] >> nth=0'); await pg.check('#main [data-sel] >> nth=1'); console.log('Bán hàng: ô chọn', k, 'dòng · nút:', await pg.evaluate(()=>$('#delSel').textContent));
 await pg.screenshot({path:'/home/claude/work/shots/sel1.png', clip:{x:236,y:0,width:1204,height:330}});
 await pg.click('#delSel'); await pg.click('#mo'); await pg.waitForTimeout(200); console.log('Xóa 2 dòng:', n0, '→', await pg.evaluate(()=>state.sales.length));
 await pg.click('#selAll'); console.log('Chọn tất cả:', await pg.evaluate(()=>[gridSel.ids.size, document.querySelectorAll('[data-sel]').length])); await pg.click('#selAll'); console.log('Bỏ chọn:', await pg.evaluate(()=>gridSel.ids.size));
 console.log('errs', errs); await b.close(); })();
