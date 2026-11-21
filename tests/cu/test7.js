const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 const a = JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../data/trung_gian/aoa2.json'),'utf8'));
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); app.state.purchases=[]; app.state.sales=[]; changed(); });
 console.log(await pg.evaluate(a=>{ const l={}; for (const e in a) l[e]=importAOA(e,a[e],'replace',true); state.settings.workYear='2026'; selKy='2026-10'; calcCache=null; const p=P(); return [l,p.doanhSo,p.lai]; }, a), errs); await b.close(); })();
