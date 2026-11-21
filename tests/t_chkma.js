const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); }); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 await pg.evaluate(()=>{ const AOA=[['BẢNG KÊ MUA HÀNG'],[],['Ngày','Mã hàng','Tên hàng','ĐVT','Số lượng','Kho'],['01/01/2026', state.items[0].ma, 'x','Cái',1,''],['02/01/2026','MOI_01','Vải mới 01','Mét',5,'152'],['03/01/2026','MOI_01','Vải mới 01','Mét',3,'152'],['03/01/2026','MOI_02','Nút mới','Cái',3,''],['04/01/2026', state.items[1].ma.toLowerCase()+'X','?','',1,''], ['05/01/2026', state.items[2].ma.toLowerCase(),'','',1,'']];
   window.XLSX={ read:()=>({SheetNames:['Sheet1'], Sheets:{Sheet1:{}}}), utils:{ sheet_to_json:()=>AOA } };
   document.querySelectorAll('.toast').forEach(t=>t.remove()); view='d_items'; render(); });
 await pg.waitForTimeout(300);
 await pg.screenshot({path:'/home/claude/work/shots/chk0.png', clip:{x:236,y:0,width:1164,height:150}});
 await pg.click('#dmChk'); await pg.waitForTimeout(200);
 await pg.setInputFiles('#dzf', {name:'BangKe.xlsx', mimeType:'application/octet-stream', buffer:Buffer.from('x')}); await pg.waitForTimeout(400);
 await pg.screenshot({path:'/home/claude/work/shots/chk1.png'}); console.log('E1', errs);
 const n0=await pg.evaluate(()=>state.items.length);
 await pg.click('#ckOK'); await pg.waitForTimeout(200); console.log('msg:', await pg.textContent('#ckMsg'));
 // chọn nhóm cho MOI_02 dòng 2
 const rows=await pg.$$('#ckRes tbody tr'); console.log('rows', rows.length);
 await pg.selectOption('#ckRes tbody tr[data-i="1"] select[data-f="nhom"]', 'Phụ liệu'); await pg.waitForTimeout(200);
 await pg.selectOption('#ckRes tbody tr[data-i="0"] select[data-f="nhom"]', 'Vải'); await pg.waitForTimeout(200);
 // bỏ chọn dòng thứ 3 (mã lạ thiếu thông tin)
 const r3=await pg.$('#ckRes tbody tr[data-i="2"] .ckR'); if (r3) { await r3.click(); await pg.waitForTimeout(200); }
 await pg.screenshot({path:'/home/claude/work/shots/chk2.png'});
 await pg.click('#ckOK'); await pg.waitForTimeout(400);
 console.log('added', await pg.evaluate(()=>state.items.length) - n0, await pg.evaluate(()=>JSON.stringify(state.items.filter(i=>/^MOI_/.test(i.ma)).map(i=>[i.ma,i.ten,i.nhom,i.dvt,i.kho]))));
 console.log(errs); await b.close(); })();
