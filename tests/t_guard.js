const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:500}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(600);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); calcCache=null; selKy='2026-10'; view='d_purchases'; render(); },[seed]); await pg.waitForTimeout(300);
 console.log('mua:', await pg.evaluate(()=>[...document.querySelectorAll('#main thead th')].map(t=>t.innerText.replace('▼','').replace(/\s+/g,' ').trim()).join(' | ')));
 await pg.evaluate(()=>{ view='d_items'; render(); }); await pg.waitForTimeout(300);
 const id=await pg.evaluate(()=>state.items.find(i=>i.ma==='TRUNG_GA')._id);
 await pg.click(`[data-del="${id}"]`); await pg.waitForTimeout(150); console.log('xóa:', await pg.evaluate(()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).pop()), await pg.evaluate(()=>state.items.some(i=>i.ma==='TRUNG_GA')));
 await pg.evaluate(id=>{ editRow=id; render(); document.querySelector(`td.ed[data-id="${id}"][data-k="ma"]`).textContent='TRUNG_GA2'; },id); await pg.click('[data-save]'); await pg.waitForTimeout(150);
 console.log('đổi mã:', await pg.evaluate(()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).pop()), await pg.evaluate(()=>state.items.some(i=>i.ma==='TRUNG_GA')));
 // unused item can be deleted
 await pg.evaluate(()=>{ editRow=null; state.items.push({_id:'zz1',ma:'TEST_X',ten:'Thử',nhom:'Bao bì',dvt:'cái',kho:'152'}); render(); }); await pg.click('[data-del="zz1"]'); await pg.waitForTimeout(150); console.log('mã chưa dùng -> hỏi xác nhận:', await pg.evaluate(()=>!!document.querySelector('#modal .modal')));
 console.log('errs',errs); await b.close(); })();
