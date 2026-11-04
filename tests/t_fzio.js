const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:520}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); calcCache=null; calcDirty=false; selKy='2026-10'; },[seed]);
 for (const v of ['d_purchases','d_sales']) { await pg.evaluate(v=>{ view=v; render(); },v); await pg.waitForTimeout(300);
   console.log(v, await pg.evaluate(()=>[...document.querySelectorAll('#main thead th.fz')].map(t=>t.innerText.replace('▼','').replace(/\s+/g,' ').trim()).join(' | ')));
   await pg.evaluate(()=>{ document.querySelector('#main .tw').scrollLeft=900; }); await pg.waitForTimeout(150); await pg.screenshot({path:`shots/fz_${v}.png`});
   // edit row while frozen
   await pg.evaluate(()=>{ const r=state[view==='d_sales'?'sales':'purchases'].find(x=>selHas(x.ngay||x.ngayNhap)); editRow=r._id; render(); }); await pg.waitForTimeout(200);
   console.log(' edit fz cells:', await pg.evaluate(()=>document.querySelectorAll('#main td.ed.fz').length));
   await pg.evaluate(()=>{ editRow=null; render(); });
 }
 console.log('errs', errs); await b.close(); })();
