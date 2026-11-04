const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); selKy='2026-10'; window.__files=[]; saveFile = async (name, blob)=>{ const buf=new Uint8Array(await blob.arrayBuffer()); let bin=''; buf.forEach(x=>bin+=String.fromCharCode(x)); window.__files.push({name, b64:btoa(bin)}); }; },[seed]);
 await pg.evaluate(async()=>{ saveWb(buildTemplate(false),'Mau_trong.xlsx'); saveWb(buildTemplate(true),'Mau_du_lieu.xlsx'); view='nxt'; render(); $('#xl').click(); view='xuatphieu'; render(); $('#exBoth').click(); view='giathanh'; render(); $('#xl').click(); view='d_orders'; render(); $('#paste').click(); $('#tplc').click(); closeModal(); await new Promise(r=>setTimeout(r,500)); });
 const files = await pg.evaluate(()=>window.__files);
 files.forEach(f=>fs.writeFileSync('xout/'+f.name, Buffer.from(f.b64,'base64'))); console.log(files.map(f=>f.name), errs); await b.close(); })();
