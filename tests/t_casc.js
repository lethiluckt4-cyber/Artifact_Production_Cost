const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1400,height:900}})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(500);
 // A. Đề xuất lại từ đầu tháng 4: thêm lệnh tay T6 + cân đối NVL T7 trước
 const a0=await pg.evaluate(()=>{ state.orders.push({_id:uid(), maLenh:'TAY-1', ngayXuatNVL:'2026-06-10', ngaySX:'2026-06-12', maTP:'TP_QBN_1', loaiDM:'DM', slKH:55, dieuChinhTP:0, nguon:'Tay', loaiLenh:'Tay'}); state.adjustments.push({_id:uid(), ngaySX:'2026-07-10', maTP:'TP_QBN_1', maVT:'VAI_IN', dieuChinh:-1, lyDo:'test'}); calcCache=null; return {n:state.orders.length, before4:state.orders.filter(o=>kyDXof(o)<'2026-04').length}; });
 await pg.evaluate(()=>{ selKy='2026-04'; runCalcFor({reset:true}); }); await pg.waitForTimeout(4000);
 const a1=await pg.evaluate(()=>({n:state.orders.length, tay:state.orders.filter(o=>o.maLenh==='TAY-1').length, adj:state.adjustments.length, before4:state.orders.filter(o=>kyDXof(o)<'2026-04').length, dx:state.settings.daDeXuat.join(','), steps:document.querySelector('#modal').innerText.split('\n').filter(l=>/Đề xuất|Đã/.test(l)).slice(0,6)}));
 console.log('A trước', JSON.stringify(a0)); console.log('A sau', JSON.stringify(a1));
 await pg.evaluate(()=>closeModal());
 // B. Tháng 5 chưa đề xuất nhưng 6–9 đã có → tự đề xuất lại từ 5
 const b0=await pg.evaluate(()=>{ resetProposal('2026-05'); calcCache=null; calc(); const pl=buildPlan('2026'); applyPlanCore(pl, ['2026-06','2026-07','2026-08','2026-09']); state.orders.push({_id:uid(), maLenh:'TAY-2', ngayXuatNVL:'2026-08-10', ngaySX:'2026-08-12', maTP:'TP_QBN_1', loaiDM:'DM', slKH:33, dieuChinhTP:0, nguon:'Tay', loaiLenh:'Tay'}); calcCache=null; return {dx:state.settings.daDeXuat.join(','), n:state.orders.length}; });
 await pg.evaluate(()=>{ selKy='2026-05'; runCalcFor({}); }); await pg.waitForTimeout(4000);
 const b1=await pg.evaluate(()=>({n:state.orders.length, tay2:state.orders.filter(o=>o.maLenh==='TAY-2').length, dx:state.settings.daDeXuat.join(','), steps:document.querySelector('#modal').innerText.split('\n').filter(l=>/Đề xuất|tự đề xuất|Đã xóa|Đã tạo/.test(l)).slice(0,6)}));
 console.log('B trước', JSON.stringify(b0)); console.log('B sau', JSON.stringify(b1));
 console.log('errs', errs); await b.close(); })();
