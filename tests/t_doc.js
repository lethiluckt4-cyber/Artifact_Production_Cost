const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='nxt'; selKy='2026-06'; document.querySelector('#main').dataset.nt='ct'; render(); });
 const st=()=>pg.evaluate(()=>({view, nt:document.querySelector('#main').dataset.nt, modal:(document.querySelector('#modal h3')||{}).textContent||'', editRow:!!editRow}));
 // dòng xuất bán
 const idx = await pg.evaluate(()=>{ const trs=[...document.querySelectorAll('#main tbody tr[data-i]')]; return trs.findIndex(tr=>tr.children[5] && tr.children[5].textContent==='Xuất bán'); });
 await pg.click(`#main tbody tr[data-i="${idx}"] td.lnkc`); await pg.waitForTimeout(300);
 console.log('Mở xuất bán:', JSON.stringify(await st()), '| SL:', await pg.evaluate(()=>document.querySelector('#modal .ed[data-k="sl"] .ci').value), 'HĐ:', await pg.evaluate(()=>document.querySelector('#modal .ed[data-k="hoaDon"] .ci').value));
 await pg.screenshot({path:'/home/claude/work/shots/doc1.png'});
 await pg.click('#frmC'); await pg.waitForTimeout(300); console.log('Hủy →', JSON.stringify(await st()));
 // dòng nhập kho sản xuất → lệnh SX, sửa ghi chú & lưu
 const i2 = await pg.evaluate(()=>{ const trs=[...document.querySelectorAll('#main tbody tr[data-i]')]; return trs.findIndex(tr=>tr.children[5] && tr.children[5].textContent==='Nhập kho sản xuất'); });
 await pg.click(`#main tbody tr[data-i="${i2}"] td.lnkc`); await pg.waitForTimeout(300); console.log('Mở lệnh:', JSON.stringify(await st()));
 console.log('Chế độ xem – ô khóa:', await pg.evaluate(()=>document.querySelector('#modal .ed .ci').disabled), 'nút Sửa:', await pg.evaluate(()=>!!document.querySelector('#frmE'))); await pg.click('#frmE'); await pg.waitForTimeout(100); console.log('Sau Sửa – ô mở:', await pg.evaluate(()=>!document.querySelector('#modal .ed .ci').disabled), await pg.evaluate(()=>document.querySelector('#modal h3').textContent)); await pg.fill('#modal .ed[data-k="slKH"] .ci','777'); await pg.click('#frmS'); await pg.waitForTimeout(400);
 console.log('Lưu →', JSON.stringify(await st()), '| đã lưu:', await pg.evaluate(()=>state.orders.some(o=>num(o.slKH)===777)));
 // thẻ kho popup: bấm chứng từ mua
 await pg.evaluate(()=>{ document.querySelector('#main').dataset.nt='th'; render(); const p=P(); const x=p.nxt.find(x=>x.ma==='VALO'); nxtDetail(x); }); await pg.waitForTimeout(200);
 const ok=await pg.evaluate(()=>!!document.querySelector('#modal [data-doc]')); await pg.click('#modal [data-doc]'); await pg.waitForTimeout(300);
 console.log('Thẻ kho → chứng từ:', ok, JSON.stringify(await st())); await pg.click('#frmX'); await pg.waitForTimeout(300); console.log('Đóng →', JSON.stringify(await st()));
 // kỳ khóa: chỉ xem
 await pg.evaluate(()=>{ state.settings.locked=['2026-06']; view='nxt'; selKy='2026-06'; document.querySelector('#main').dataset.nt='ct'; render(); });
 await pg.click(`#main tbody tr[data-i="${idx}"] td.lnkc`); await pg.waitForTimeout(300);
 console.log('Kỳ khóa:', JSON.stringify(await st()), 'nút Lưu/Sửa:', await pg.evaluate(()=>!!document.querySelector('#frmS')||!!document.querySelector('#frmE')), 'ô khóa:', await pg.evaluate(()=>document.querySelector('#modal .ci').disabled));
 await pg.click('#frmC'); await pg.evaluate(()=>{ state.settings.locked=[]; });
 console.log('errs', errs); await b.close(); })();
