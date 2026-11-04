const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 const a=JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../data/trung_gian/aoa3.json'),'utf8')); const gd=JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../data/trung_gian/gd.json'),'utf8'));
 await pg.evaluate(()=>{ fromDocs({settings:{company:'x'}}); });
 console.log(await pg.evaluate(({a,gd})=>{ const l={}; for (const e of ['items','opening','bom','orders','adjustments']) l[e]=importAOA(e,a[e],'replace',true); const parts=splitGiaoDich(gd); for (const e in parts) l[e]=importAOA(e,parts[e],'replace',true); state.settings.workYear='2026'; selKy='2026-10'; calcCache=null; const p=P(); return [l, p.sum154, p.doanhSo, p.lai, p.tonCuoi]; }, {a,gd}), errs); await b.close(); })();
