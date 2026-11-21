const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error' && !/Failed to load/.test(m.text())) errs.push(m.text()); });
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true); await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); calcCache=null; selKy=''; render(); }); await pg.waitForTimeout(300);
 const fill = async (k, v) => { const fm = await pg.$(`#modal .ed[data-k="${k}"] .ci`); if (fm) { const tag = await fm.evaluate(e=>e.tagName); if (tag==='SELECT') await fm.selectOption(String(v)); else await fm.fill(String(v)); return; } const sel = await pg.$(`td.ed[data-k="${k}"] select.ci`); if (sel) await sel.selectOption(v); else { await pg.click(`td.ed[data-k="${k}"]`); await pg.keyboard.type(String(v)); } };
 // 1. Lệnh SX tay: chỉ nhập ngày nhập kho + mã + SL → ngày xuất NVL tự tính
 await pg.evaluate(()=>{ selKy='2026-06'; view='d_orders'; render(); }); await pg.click('#add'); await fill('ngaySX','20/06/2026'); await fill('maTP','QB807_M-3XL'); await fill('slKH','40'); await pg.click((await pg.$('#frmS'))?'#frmS':'[data-save]'); await pg.waitForTimeout(200);
 console.log('Lệnh tay:', JSON.stringify(await pg.evaluate(()=>{ const o=state.orders.find(o=>o.nguon==='Tay'); return o && {maLenh:o.maLenh, x:o.ngayXuatNVL, nk:o.ngaySX, sl:o.slKH, loai:o.loaiLenh, kyDX:o.kyDX}; })));
 // 2. Lô gia công tay
 await pg.evaluate(()=>{ selKy='2026-07'; view='d_gc'; render(); }); await pg.click('#add'); await fill('ngayGui','10/07/2026'); await fill('ngayNhan','14/07/2026'); await fill('maGui','VAI_DKCG_1'); await fill('slGui','500'); await fill('maNhan','VAI_IN'); await fill('slNhan','500'); await pg.click((await pg.$('#frmS'))?'#frmS':'[data-save]'); await pg.waitForTimeout(200);
 console.log('Lô GC:', JSON.stringify(await pg.evaluate(()=>{ const g=state.gc.find(g=>g.ngayGui==='2026-07-10'); return g && {soCT:g.soCT, slGui:g.slGui, ma:g.maNhan}; })), '· toast:', await pg.evaluate(()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).join('|')));
 // tính lại tháng 7 → vải in nhập có giá = vải gửi
 console.log('GC T7:', JSON.stringify(await pg.evaluate(()=>{ calcCache=null; const P=calc().periods['2026-07']; return P.gcNhan.map(x=>({sl:x.sl, vGui:Math.round(x.vGui), dg:Math.round(x.dg)})); })));
 // 3. Danh mục: sửa hệ số để trống / tỷ trọng %
 await pg.evaluate(()=>{ selKy='2026-06'; view='d_items'; search='TP_QBN_1'; render(); }); await pg.click('[data-edit]'); await pg.click('td.ed[data-k="heSo"]'); await pg.keyboard.press('Control+A'); await pg.keyboard.type('0,5'); await pg.click((await pg.$('#frmS'))?'#frmS':'[data-save]'); await pg.waitForTimeout(200);
 await pg.evaluate(()=>{ search=''; selKy='2026-06'; view='kehoach'; render(); }); await pg.click('#tpBtn'); await pg.waitForTimeout(150); await pg.fill('input[data-itf="lo"][data-ma="TP_QBN_1"]','60'); await pg.dispatchEvent('input[data-itf="lo"][data-ma="TP_QBN_1"]','change'); await pg.waitForTimeout(200); await pg.fill('input[data-itf="tyTrong"][data-ma="TP_QBN_1"]','5'); await pg.dispatchEvent('input[data-itf="tyTrong"][data-ma="TP_QBN_1"]','change'); await pg.waitForTimeout(200); await pg.click('#mclose'); await pg.waitForTimeout(150);
 console.log('Danh mục:', JSON.stringify(await pg.evaluate(()=>{ const i=state.items.find(i=>i.ma==='TP_QBN_1'); const L=itemCalc('2026'); return {lo:i.lo, ty:i.tyTrong, heSo:i.heSo, loAD:L.lo(i), tyAD:L.ty(i)}; })));
 // 4. Lệnh: ngày xuất sau ngày nhập kho → chặn
 await pg.evaluate(()=>{ search=''; selKy='2026-06'; view='d_orders'; render(); }); await pg.click('#add'); await fill('ngayXuatNVL','25/06/2026'); await fill('ngaySX','20/06/2026'); await fill('maTP','QB807_M-3XL'); await fill('slKH','10'); await pg.click((await pg.$('#frmS'))?'#frmS':'[data-save]'); await pg.waitForTimeout(200);
 console.log('Chặn ngày sai:', await pg.evaluate(()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).pop()), '· còn đang sửa:', await pg.evaluate(()=>!!editRow));
 await pg.click((await pg.$('#frmC'))?'#frmC':'[data-cancel]');
 // 5. Tạo lô gia công tự động khi đã có (không trùng)
 console.log('Tự lập lô:', JSON.stringify(await pg.evaluate(()=>autoGcLots())));
 // 6. Nhập Excel lệnh SX bằng dán
 console.log('Nhập dán lệnh:', await pg.evaluate(()=>{ const n=importAOA('orders', [['Khóa','x','Ngày NK','Mã','SL'],['TP_BBN#20260710@100~SX','','','','','','',''],['','','2026-07-15','TP_DB_BG',30,'','Tay','mẫu']], 'add', true); const o=state.orders.filter(o=>o.ngaySX==='2026-07-10'||o.ngaySX==='2026-07-15').map(o=>[o.maLenh,o.ngayXuatNVL,o.ngaySX,o.maTP,o.slKH,o.loaiLenh]); return JSON.stringify({n,o}); }));
 console.log('errs', errs);
 await b.close(); })();
