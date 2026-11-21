const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1700,height:900}})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 await pg.evaluate(()=>{ view='d_purchases'; selKy='2026-04'; search='00000013'; render(); });
 const row=()=>pg.evaluate(()=>state.purchases.filter(p=>p.hoaDon==='00000013').map(p=>[p.ngayNhap,p.sl,p.tt,p.thueSuat,p.thueGTGT]));
 // 1. nhập thuế suất 8
 await pg.click('[data-edit]'); await pg.click('td.ed[data-k="thueSuat"]'); await pg.keyboard.type('8'); await pg.waitForTimeout(100);
 console.log('Live thuế:', await pg.evaluate(()=>document.querySelector('td.ed[data-k="thueGTGT"]').textContent));
 await pg.click('[data-save]'); await pg.waitForTimeout(200); console.log('1) Sau lưu:', JSON.stringify(await row()));
 // 2. tách 5000
 await pg.click('[data-split]'); await pg.waitForTimeout(200);
 await pg.fill('#modal .ed[data-k="ngayNhap"] .ci','25/04/2026'); await pg.fill('#modal .ed[data-k="sl"] .ci','5000'); await pg.waitForTimeout(150);
 console.log('Live khi tách:', await pg.evaluate(()=>{ const n=document.querySelector('#modal .ed[data-k="thueGTGT"] .ci').value; const id=state.purchases.find(p=>p.hoaDon==='00000013'&&!p._new)._id; return 'dòng mới thuế '+n+' · dòng gốc thuế '+document.querySelector(`td[data-id="${id}"][data-k="thueGTGT"]`).textContent+' · dòng gốc TT '+document.querySelector(`td[data-id="${id}"][data-k="tt"]`).textContent; }));
 await pg.click('#frmS'); await pg.waitForTimeout(200); console.log('2) Sau tách:', JSON.stringify(await row()));
 // 3. dòng chỉ có tiền thuế nhập tay (không thuế suất) → tách theo tỷ lệ
 await pg.evaluate(()=>{ const p=state.purchases.find(x=>x.hoaDon==='00000013'&&x.ngayNhap==='2026-04-25'); });
 const r3=await pg.evaluate(()=>{ const p=state.purchases.find(x=>x.ngayNhap.startsWith('2026-03') && x.sl>100); p.thueSuat=''; p.thueGTGT=1000000; changed(); return [p.hoaDon, p.sl, p.tt, p._id]; }); console.log('3) dòng:', r3);
 await pg.evaluate(h=>{ selKy='2026-03'; search=h; render(); }, r3[0]);
 await pg.click(`[data-split="${r3[3]}"]`); await pg.waitForTimeout(200); await pg.fill('#modal .ed[data-k="ngayNhap"] .ci','28/03/2026'); await pg.fill('#modal .ed[data-k="sl"] .ci', String(Math.round(r3[1]/4))); await pg.click('#frmS'); await pg.waitForTimeout(200);
 console.log('   Sau tách:', await pg.evaluate(h=>JSON.stringify(state.purchases.filter(p=>p.hoaDon===h).map(p=>[p.ngayNhap,p.sl,p.tt,p.thueSuat,p.thueGTGT])), r3[0]));
 console.log('errs', errs); await b.close(); })();
