const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1300,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); calcCache=null; calcDirty=false; selKy='2026-10'; view='giathanh'; render(); window.__files=[]; saveFile = async (name, blob)=>{ const buf=new Uint8Array(await blob.arrayBuffer()); let bin=''; buf.forEach(x=>bin+=String.fromCharCode(x)); window.__files.push({name, b64:btoa(bin)}); }; },[seed]); await pg.waitForTimeout(300);
 for (const t of ['lenh','nvl','tp']) { await pg.evaluate(t=>{ $('#main').dataset.tab=t; render(); }, t); await pg.waitForTimeout(250); await pg.evaluate(()=>{ const tw=document.querySelector('#main .tw'); tw.scrollLeft=700; }); await pg.waitForTimeout(150); await pg.screenshot({path:`shots/fz_${t}.png`}); }
 await pg.evaluate(async()=>{ $('#xl').click(); await new Promise(r=>setTimeout(r,400)); });
 const f=(await pg.evaluate(()=>window.__files))[0]; fs.writeFileSync('xout/'+f.name, Buffer.from(f.b64,'base64')); console.log(f.name, errs); await b.close(); })();
