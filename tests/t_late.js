const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
const docs=JSON.parse(fs.readFileSync(DATA('SaoLuu_GiaThanh_2026-11-04.json'),'utf8'));
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(d=>{ setTimeout(()=>{ const db={collection:()=>({get:async()=>({docs:Object.keys(d).map(id=>({id,exists:true,data:()=>d[id]}))}), doc:k=>({set:async()=>{},delete:async()=>{}})})}; window.claude={use:()=>new Promise(r=>setTimeout(()=>r(db),3000))}; }, 1500); }, docs);
 await pg.goto('http://localhost:8765/index.html' /* chạy: cd artifact && python3 -m http.server 8765 */); await pg.waitForTimeout(7000);
 console.log('late', JSON.stringify(await pg.evaluate(()=>({kind:store.kind, items:state.items.length, booted:window.__booted, err:!!document.querySelector('#bootErr')}))), errs);
 await b.close(); })();
