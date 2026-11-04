const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
const docs=JSON.parse(fs.readFileSync(DATA('SaoLuu_GiaThanh_2026-11-04.json'),'utf8'));
async function run(tag, mode){ const b=await chromium.launch(); const ctx=await b.newContext(); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(([d,mode])=>{ const store=JSON.parse(JSON.stringify(d)); let calls=0; window.__w=0;
   const db={ collection:()=>({ get:async()=>{ calls++; if(mode==='flaky' && calls<3) throw new Error('network'); return {docs:Object.keys(store).map(id=>({id,exists:true,data:()=>store[id]}))}; }, doc:k=>({set:async v=>{window.__w++; store[k]=v;}, delete:async()=>{}}) }) };
   window.claude={ use:async n=> mode==='null' ? null : db }; }, [docs,mode]);
 await pg.goto('http://localhost:8765/index.html' /* chạy: cd artifact && python3 -m http.server 8765 */); await pg.waitForTimeout(mode==='flaky'?9000:2500);
 const r = await pg.evaluate(()=>({kind:store.kind, ro:store.readOnly, items:state.items.length, p:state.purchases.length, bar:!!document.querySelector('#offlineBar'), badge:document.querySelector('#savebadge')?.innerText}));
 console.log(tag, JSON.stringify(r), errs); await b.close(); }
(async()=>{ await run('cloud-ok','ok'); await run('flaky','flaky'); await run('null','null'); })();
