const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); { const pp=planPrm(); pp.nlUoc={'2026-10':110000000,'2026-11':110000000,'2026-12':110000000}; state.settings.planPrm=pp; calcCache=null; } // giả lập bán hàng tháng 11, 12 (chép từ tháng 9)
   state.sales.filter(r=>r.ngay.startsWith('2026-09')).forEach(r=>{ ['11','12'].forEach(m=>{ const d=r.ngay.replace('2026-09',`2026-${m}`); if (+d.slice(8)<=28) state.sales.push({...r, _id:uid(), ngay:d}); }); }); changed(); },[seed]);
 const run = async (mm, reset) => { await pg.evaluate(()=>{ view='giathanh'; render(); }); await pg.click('#recalc'); await pg.waitForTimeout(150); await pg.selectOption('#rcM', mm); if (reset) { await pg.check('#rcReset'); console.log('  warn:', await pg.evaluate(()=>$('#rcState').innerText)); } await pg.click('#rcGo'); await pg.waitForTimeout(3000); const t=await pg.evaluate(()=>document.querySelector('#modal').innerText); await pg.evaluate(()=>closeModal()); return t.split('Phần mềm đã tự chạy')[1].split('Bước tiếp theo')[0].trim(); };
 const cnt = () => pg.evaluate(()=>['2026-10','2026-11','2026-12'].map(k=>k.slice(5)+':'+state.orders.filter(o=>kyOf(o.ngaySX)===k).length).join(' '));
 console.log('T10', await run('10'), await cnt());
 console.log('T11', await run('11'), await cnt());
 console.log('T12', await run('12'), await cnt());
 // sửa tay tháng 11 + cân đối tay tháng 12
 await pg.evaluate(()=>{ state.orders.find(o=>kyOf(o.ngaySX)==='2026-11').slKH=1; state.adjustments.push({_id:uid(), ngaySX:'2026-12-01', maTP:'BTP_BGK', maVT:'BM_TH', dieuChinh:-1, lyDo:'tay', nguon:'Tay'}); changed(); });
 console.log('RESET T10', await run('10', true), await cnt(), await pg.evaluate(()=>[state.adjustments.length, state.settings.daDeXuat]));
 // khóa tháng 12 rồi thử đề xuất lại tháng 10
 await pg.evaluate(()=>{ toggleLock('2026-12'); });
 console.log('RESET locked', await run('10', true), await cnt());
 console.log('errs', errs); await b.close(); })();
