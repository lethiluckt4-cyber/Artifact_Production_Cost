const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8')); await pg.evaluate(([s])=>{ app.importDocs(s); { const pp=planPrm(); pp.nlUoc={'2026-10':110000000,'2026-11':110000000,'2026-12':110000000}; state.settings.planPrm=pp; calcCache=null; } selKy='2026-10'; view='d_orders'; render(); },[seed]); await pg.waitForTimeout(200);
 // lệnh tay + cân đối tay trong tháng 10
 await pg.evaluate(()=>{ state.orders.push({_id:uid(), maLenh:'TAY1', ngayXuatNVL:'2026-10-02', ngaySX:'2026-10-02', maTP:'TP_BKG', loaiDM:'DM', slKH:5, dieuChinhTP:0, ghiChu:'tay', khoa:'', nguon:'Tay'}); state.adjustments.push({_id:uid(), ngaySX:'2026-10-01', maTP:'BTP_BGK', maVT:'BM_TH', dieuChinh:-3, lyDo:'tay', nguon:'Tay'}); changed(); render(); });
 const before = await pg.evaluate(()=>[state.orders.filter(o=>kyOf(o.ngaySX)==='2026-10').length, state.adjustments.length]);
 await pg.click('#rsDX'); await pg.waitForTimeout(200); console.log('confirm:', (await pg.evaluate(()=>document.querySelector('#modal').innerText)).slice(0,300));
 await pg.click('#mo'); await pg.waitForTimeout(2500); const txt=await pg.evaluate(()=>document.querySelector('#modal').innerText); await pg.evaluate(()=>closeModal());
 console.log(txt.split('Phần mềm đã tự chạy')[1].split('Bước tiếp theo')[0].trim());
 console.log('before', before, 'after', await pg.evaluate(()=>[state.orders.filter(o=>kyOf(o.ngaySX)==='2026-10').length, state.adjustments.length, state.orders.some(o=>o.maLenh==='TAY1'), state.orders.filter(o=>o.ngaySX==='2026-10-01').map(o=>o.maTP+':'+o.slKH+':'+o.nguon).join(' ')]));
 console.log('errs', errs); await b.close(); })();
