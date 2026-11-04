const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage();
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 const r = await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; const p=P(); return {xk:buildXK(p), nk:buildNK(p), XK_HDR, NK_HDR}; });
 fs.writeFileSync(require('path').resolve(__dirname,'../data/trung_gian/phieu.json'), JSON.stringify(r)); await b.close(); })();
