const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='giathanh'; selKy='2026-02'; render(); const c=calc(); showCalcResult(c, 10, {steps:[], adj:buildAdjProposal(P())}); }); await pg.waitForTimeout(300);
 console.log('btns:', await pg.evaluate(()=>[...document.querySelectorAll('#modal button')].map(b=>b.id+':'+b.textContent.trim()).join(' | ')));
 const st=await pg.$('#modal .box:last-of-type'); await pg.screenshot({path:'/home/claude/work/shots/rs.png'}); console.log('E',errs);
 await pg.evaluate(()=>{ closeModal(); dcModal(); }); await pg.waitForTimeout(300); console.log('dc btn:', await pg.textContent('#adjApply'), '| th:', await pg.evaluate(()=>[...document.querySelectorAll('#modal table thead th')].map(t=>t.textContent.trim()).join(',')));
 await pg.screenshot({path:'/home/claude/work/shots/dc.png'});
 await pg.evaluate(()=>{ closeModal(); state.adjustments.push({_id:'t1', ngaySX:'2026-02-23', maTP:'TP_QBN_1', maVT:'THUN', dieuChinh:-10, lyDo:'test'}); calcCache=null; view='d_adjustments'; selKy='2026-02'; render(); }); await pg.waitForTimeout(300);
 console.log('grid:', await pg.evaluate(()=>{ const ths=[...document.querySelectorAll('#main table thead th')].map(t=>t.textContent.trim()); const i=ths.findIndex(t=>t.startsWith('Trị giá')); const tr=[...document.querySelectorAll('#main table tbody tr')].map(r=>r.children[i]?.textContent.trim()); return ths.join(',')+' || '+tr.slice(0,3).join(' | ')+' total '+document.querySelector('#main table tfoot, #main tr.tot')?.textContent.slice(0,200); }));
 // bấm Bỏ qua trong result
 await pg.evaluate(()=>{ view='giathanh'; render(); showCalcResult(calc(), 10, {steps:[], adj:buildAdjProposal(P())}); }); await pg.waitForTimeout(200);
 const n0=await pg.evaluate(()=>state.adjustments.length); await pg.click('#rsAdj'); await pg.waitForTimeout(3000); console.log('skip added', await pg.evaluate(()=>state.adjustments.length)-n0);
 console.log(errs); await b.close(); })();
