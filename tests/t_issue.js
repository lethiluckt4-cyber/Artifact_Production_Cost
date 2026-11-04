const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:500}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); calcCache=null; selKy='2026-07'; view='d_issues'; render(); },[seed]); await pg.waitForTimeout(300);
 console.log('menu:', await pg.evaluate(()=>[...document.querySelectorAll('nav button')].map(b=>b.textContent.trim()).filter(t=>/Xuất/.test(t)).join(' | ')));
 console.log('headers:', await pg.evaluate(()=>[...document.querySelectorAll('#main thead th')].map(t=>t.innerText.replace(/\s+/g,' ').replace('▼','').trim()).join(' | ')));
 console.log('rows ky10:', await pg.evaluate(()=>state.issues.filter(r=>r.ngay.startsWith('2026-07')).map(r=>[r.maVT,r.sl,r.loai||'(trống)'])));
 const c0=await pg.evaluate(()=>{ calcCache=null; const P=calc().periods['2026-07']; return [P.chung, P.chi641||0, P.cp.c627]; }); console.log('trước:', c0);
 // add 641 row
 await pg.click('#add'); await pg.waitForTimeout(100);
 const ma=await pg.evaluate(()=>state.issues.find(r=>r.ngay.startsWith('2026-07')).maVT);
 await pg.evaluate(m=>{ const id=editRow; document.querySelector(`td.ed[data-id="${id}"][data-k="ngay"]`).textContent='20'; document.querySelector(`td.ed[data-id="${id}"] .ci[data-k="loai"]`).value='Bán hàng (641)'; document.querySelector(`td.ed[data-id="${id}"] .ci[data-k="maVT"]`).value=m; document.querySelector(`td.ed[data-id="${id}"][data-k="sl"]`).textContent='2'; document.querySelector(`td.ed[data-id="${id}"][data-k="lyDo"]`).textContent='Thử công thức mới'; },ma);
 await pg.click('[data-save]'); await pg.waitForTimeout(200);
 const c1=await pg.evaluate(()=>{ calcCache=null; const P=calc().periods['2026-07']; return [P.chung, P.chi641||0, P.cp.c627]; }); console.log('sau thêm 641:', c1);
 await pg.evaluate(()=>{ calcCache=null; render(); }); await pg.waitForTimeout(200);
 console.log('note:', await pg.evaluate(()=>document.querySelector('#main .bar').innerText));
 await pg.screenshot({path:path.resolve(__dirname,'out','issues.png')});
 console.log('errs', errs); await b.close(); })();
