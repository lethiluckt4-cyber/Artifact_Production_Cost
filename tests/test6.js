const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 const gd = JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../data/trung_gian/gd.json'),'utf8'));
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); app.state.purchases=[]; app.state.sales=[]; changed(); });
 const r = await pg.evaluate(gd=>{ const parts=splitGiaoDich(gd); const l={}; for (const e in parts) l[e]=importAOA(e, parts[e], 'replace', true); state.settings.workYear='2026'; selKy='2026-10'; calcCache=null; const p=P(); return [l, p.sum154, p.doanhSo, p.lai, p.tonCuoi]; }, gd);
 console.log(r, errs); await b.close(); })();
