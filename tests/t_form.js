const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 await pg.evaluate(()=>document.querySelectorAll('.toast').forEach(t=>t.remove()));
 const fill = async (k,v)=>{ await pg.fill(`#modal .ed[data-k="${k}"] .ci`, String(v)); };
 // 1. Danh mục hàng
 await pg.evaluate(()=>{ view='d_items'; render(); }); await pg.click('#add'); await pg.waitForTimeout(200);
 await (await pg.$('#modal .in')).screenshot({path:'/home/claude/work/shots/frm1.png'});
 console.log('Danh mục – trường:', await pg.evaluate(()=>[...document.querySelectorAll('#modal .frm-g label')].map(l=>l.textContent).join(' | ')));
 await pg.click('#frmS'); await pg.waitForTimeout(150); console.log('Lưu khi thiếu → hộp vẫn mở:', await pg.evaluate(()=>!!document.querySelector('#modal .frm-in')), '|', await pg.evaluate(()=>(document.querySelector('.toast')||{}).textContent));
 const n0=await pg.evaluate(()=>state.items.length);
 await fill('ma','TEST_FORM'); await fill('ten','Hàng thử form'); await pg.selectOption('#modal .ed[data-k="nhom"] select','Vải').catch(async()=>{ await fill('nhom','Vải'); }); await fill('dvt','m');
 await pg.click('#frmS'); await pg.waitForTimeout(300);
 console.log('Đã lưu mã:', await pg.evaluate(()=>{ const i=state.items.find(i=>i.ma==='TEST_FORM'); return i?[i.ten,i.nhom,i.dvt]:null; }), 'số mã', n0, '→', await pg.evaluate(()=>state.items.length), 'hộp đóng:', await pg.evaluate(()=>!document.querySelector('#modal .modal')));
 // 2. Mua hàng: tính live thành tiền / thuế
 await pg.evaluate(()=>{ view='d_purchases'; selKy='2026-03'; render(); }); await pg.click('#add'); await pg.waitForTimeout(200);
 await fill('ngayNhap','20/03/2026'); await fill('ma','VALO'); await pg.type('#modal .ed[data-k="sl"] .ci','10'); await pg.type('#modal .ed[data-k="donGia"] .ci','2500'); await pg.type('#modal .ed[data-k="thueSuat"] .ci','8');
 console.log('Live:', await pg.evaluate(()=>['tt','thueGTGT'].map(k=>document.querySelector(`#modal .ed[data-k="${k}"] .ci`).value)), 'Tên hàng (tự tính):', await pg.evaluate(()=>{ const x=[...document.querySelectorAll('#modal [data-fx]')].find(x=>x.dataset.fx==='Tên hàng'); return x&&x.value; }));
 await (await pg.$('#modal .in')).screenshot({path:'/home/claude/work/shots/frm2.png'});
 await pg.click('#frmS'); await pg.waitForTimeout(300);
 console.log('Mua đã lưu:', await pg.evaluate(()=>{ const r=state.purchases.find(r=>r.ma==='VALO'&&r.ngayNhap==='2026-03-20'&&num(r.sl)===10); return r?[r.tt,r.thueSuat,r.thueGTGT,r.ngayMua]:null; }));
 // 3. Hủy
 await pg.click('#add'); await pg.waitForTimeout(150); const np=await pg.evaluate(()=>state.purchases.length); await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
 console.log('Esc hủy:', np, '→', await pg.evaluate(()=>state.purchases.length), 'editRow', await pg.evaluate(()=>editRow), 'hộp:', await pg.evaluate(()=>!!document.querySelector('#modal .modal')));
 // 4. Định mức: + NVL mở hộp có sẵn mã TP
 await pg.evaluate(()=>{ view='d_bom'; render(); }); await pg.click('[data-ins]'); await pg.waitForTimeout(200);
 console.log('+NVL: maTP =', await pg.evaluate(()=>document.querySelector('#modal .ed[data-k="maTP"] .ci').value), 'tiêu đề:', await pg.evaluate(()=>document.querySelector('#modal h3').textContent));
 await pg.click('#frmC');
 // 5. Lệnh SX
 await pg.evaluate(()=>{ view='d_orders'; selKy='2026-07'; render(); }); await pg.click('#add'); await pg.waitForTimeout(200);
 console.log('Lệnh SX – trường:', await pg.evaluate(()=>[...document.querySelectorAll('#modal .frm-g label')].map(l=>l.textContent).join(' | ')));
 await fill('ngaySX','20/07/2026'); await fill('maTP','TP_BBN'); await fill('slKH','100'); await pg.click('#frmS'); await pg.waitForTimeout(300);
 console.log('Lệnh lưu:', await pg.evaluate(()=>{ const o=state.orders.find(o=>o.ngaySX==='2026-07-20'&&o.maTP==='TP_BBN'&&o.loaiLenh==='Tay'); return o?[o.maLenh,o.ngayXuatNVL,o.slKH,o.nguon]:null; }));
 // 6. Tách dòng mua
 await pg.evaluate(()=>{ view='d_purchases'; selKy='2026-03'; render(); }); const sp=await pg.$('[data-split]'); if (sp) { await sp.click(); await pg.waitForTimeout(200); console.log('Tách:', await pg.evaluate(()=>document.querySelector('#modal h3').textContent)); await pg.click('#frmC'); }
 // 7. Sửa vẫn sửa trên dòng
 await pg.click('[data-edit]'); await pg.waitForTimeout(150); console.log('Sửa trên dòng:', await pg.evaluate(()=>!!document.querySelector('#main td.ed') && !document.querySelector('#modal .modal')));
 await pg.evaluate(()=>{ editRow=null; state.items=state.items.filter(i=>i.ma!=='TEST_FORM'); });
 console.log('errs', errs); await b.close(); })();
