const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(1200);
 await pg.evaluate(s=>{ app.importDocs(s); const pp=planPrm(); pp.nlUoc={'2026-10':110000000}; state.settings.planPrm=pp; calcCache=null; selKy='2026-10'; view='thietlap'; document.querySelector('#main').dataset.tlt='loi'; render(); }, JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8')));
 await pg.screenshot({path:path.resolve(__dirname,'out','loi_tab.png')});
 // sửa áp dụng từ 11/2026 rồi lưu, kiểm tra lại
 await pg.fill('input[data-f="tuKy"]','11/2026'); await pg.click('#loiSave'); await pg.waitForTimeout(300);
 console.log('after save', JSON.stringify(await pg.evaluate(()=>state.settings.spLoi)), await pg.evaluate(()=>{ calcCache=null; const P=calc().periods['2026-10']; return [sum(P.orders,o=>o.slLoi), Math.round(P.nxt.find(n=>n.ma==='BTP_BGK').closeSL)]; }));
 await pg.fill('input[data-f="tuKy"]','01/2026'); await pg.fill('input[data-f="tyLe"]','7%'); await pg.click('#loiSave'); await pg.waitForTimeout(300);
 console.log('back', JSON.stringify(await pg.evaluate(()=>state.settings.spLoi)));
 // giá thành tab lenh & kế toán
 await pg.evaluate(()=>{ calcCache=null; view='giathanh'; delete document.querySelector('#main').dataset.tab; render(); }); await pg.waitForTimeout(300);
 console.log('GT headers', await pg.evaluate(()=>[...document.querySelectorAll('#main thead tr:last-child th')].map(t=>t.textContent.replace('▼','').trim()).join(' | ')));
 console.log('NK', JSON.stringify(await pg.evaluate(()=>buildNK(P()).filter(r=>r[7]==='BTP_BGK_LOI').slice(0,2))));
 const pl=await pg.evaluate(()=>{ const pl=buildPlan('2026'); return pl.ok ? pl.list.filter(x=>x.d>='2026-10-04' && x.ma==='BTP_BGK').slice(0,4).map(x=>x.d+' '+x.sl) : pl.msg; }); console.log('plan BGK', pl);
 await pg.evaluate(()=>{ view='d_costs'; render(); }); await pg.waitForTimeout(200); console.log('costs has col', await pg.evaluate(()=>document.querySelector('#main').innerText.includes('Thu hồi SP lỗi')));
 await pg.evaluate(()=>{ view='d_items'; render(); }); console.log('item row', await pg.evaluate(()=>[...document.querySelectorAll('#main tbody tr')].map(t=>t.innerText).find(t=>t.includes('BTP_BGK_LOI'))));
 console.log(errs); await b.close(); })();
