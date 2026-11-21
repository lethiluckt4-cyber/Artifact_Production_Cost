const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1500,height:900}})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 await pg.evaluate(()=>{ selKy='2026-01'; view='d_adjustments'; lastView='d_adjustments'; render(); });
 await pg.click('#goDX'); await pg.waitForTimeout(200);
 const info=await pg.evaluate(()=>({n:document.querySelectorAll('#modal input[data-adjok]').length, lenh:[...document.querySelectorAll('#modal tbody tr')].slice(-4).map(r=>r.innerText.replace(/\s+/g,' ').slice(0,90))}));
 console.log(JSON.stringify(info));
 // bỏ chọn tất cả, chọn 2 dòng đầu, sửa SL dòng 1
 await pg.click('#adjAll'); const boxes=await pg.$$('#modal input[data-adjok]'); await boxes[0].check(); await boxes[1].check();
 const a0=await pg.evaluate(()=>state.adjustments.length);
 await pg.click('#adjApply'); await pg.waitForTimeout(150); await pg.click('#cbYes').catch(async()=>{ const b=await pg.$('.modal button.p'); if (b) await b.click(); }); await pg.waitForTimeout(400);
 console.log('Đã ghi:', await pg.evaluate(a0=>state.adjustments.length-a0, a0));
 // chi tiết lệnh: đề xuất của lệnh
 const r=await pg.evaluate(()=>{ const c=calc(); const P=c.periods['2026-01']; const d=buildAdjProposal(P); const ma=d.rows[0]&&d.rows[0].maLenh; const o=P.orders.find(x=>x.maLenh===ma); orderDetail(o); return {ma, nDX:document.querySelectorAll('#modal [data-odok]').length}; }); console.log('Chi tiết lệnh:', JSON.stringify(r));
 if (r.nDX) { await pg.fill('#modal input[data-odx="0"]', '-1'); await pg.click('#modal [data-odok="0"]'); await pg.waitForTimeout(300); console.log('Sau chấp nhận:', await pg.evaluate(()=>[document.querySelectorAll('#modal [data-odok]').length, [...document.querySelectorAll('#adjList input[data-edit-adj]')].map(i=>i.value).join(',')])); 
   const inp=await pg.$('#adjList input[data-edit-adj]'); await inp.fill('-2'); await inp.dispatchEvent('change'); await pg.waitForTimeout(300); console.log('Sau sửa:', await pg.evaluate(()=>[...document.querySelectorAll('#adjList input[data-edit-adj]')].map(i=>i.value).join(','))); }
 console.log('errs', errs); await b.close(); })();
