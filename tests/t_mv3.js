const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 // tháng chưa kết thúc
 await pg.evaluate(()=>{ view='d_adjustments'; selKy='2026-11'; render(); mvModal('2026-11'); }); await pg.waitForTimeout(300); console.log('T11:', await pg.evaluate(()=>document.querySelector('#modal .warnbox,#modal .note')?.textContent.slice(0,80)));
 await pg.evaluate(()=>{ closeModal(); selKy='2026-02'; render(); }); await pg.waitForTimeout(300);
 await pg.click('#adjDX'); await pg.waitForTimeout(300); console.log('adjDX nhắc:', await pg.evaluate(()=>document.querySelector('#modal')?.textContent.slice(0,120)));
 await pg.evaluate(()=>{ closeModal(); dcModal(); }); await pg.waitForTimeout(300); console.log('dcModal nhắc:', await pg.evaluate(()=>!!document.querySelector('#dcMv')));
 // áp dụng tất cả các tháng lần lượt
 await pg.evaluate(()=>{ closeModal(); let g=0; let mm; while ((mm=moveMonths()).length && g++<12) { applyMoveCore(buildMoveProposal(mm[0]).rows); calcCache=null; } changed(); });
 const r=await pg.evaluate(()=>({left:moveMonths(), sl:state.purchases.reduce((s,r)=>s+num(r.sl),0), tt:state.purchases.reduce((s,r)=>s+num(r.tt),0), thue:state.purchases.reduce((s,r)=>s+num(r.thueGTGT),0), n:state.purchases.length, dc:dcMonths()}));
 console.log(JSON.stringify(r));
 await pg.evaluate(()=>{ view='d_purchases'; selKy='2026'; render(); }); await pg.waitForTimeout(300);
 console.log('chưa HĐ col:', await pg.evaluate(()=>{ const ths=[...document.querySelectorAll('#main table thead th')].map(t=>t.textContent.trim()); const ix=ths.findIndex(t=>t.startsWith('Mua hàng chưa HĐ')); return [...document.querySelectorAll('#main table tbody tr')].map(tr=>tr.children[ix]?.textContent.trim()).filter(Boolean).slice(0,12).join(' | '); }));
 console.log(errs); await b.close(); })();
