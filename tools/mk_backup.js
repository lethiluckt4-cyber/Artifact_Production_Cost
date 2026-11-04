const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage();
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 const docs = await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; return toDocs(); });
 fs.writeFileSync('/tmp/backup.json', JSON.stringify(docs)); console.log(Object.keys(docs).length, Object.keys(docs).join(',')); await b.close(); })();
