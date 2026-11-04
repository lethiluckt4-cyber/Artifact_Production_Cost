const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
const docs=JSON.parse(fs.readFileSync(DATA('SaoLuu_GiaThanh_2026-11-04.json'),'utf8'));
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext();
 const mk=async mode=>{ const pg=await ctx.newPage(); await pg.addInitScript(([d,mode])=>{ const db={collection:()=>({get:async()=>({docs:Object.keys(d).map(id=>({id,exists:true,data:()=>d[id]}))}), doc:k=>({set:async()=>{},delete:async()=>{}})})}; window.claude={use:async()=>mode==='null'?null:db}; },[docs,mode]); await pg.goto('http://localhost:8765/index.html' /* chạy: cd artifact && python3 -m http.server 8765 */); await pg.waitForTimeout(2500); return pg; };
 const p1=await mk('ok'); await p1.close();
 const p2=await mk('null'); console.log(JSON.stringify(await p2.evaluate(()=>({kind:store.kind, items:state.items.length, p:state.purchases.length, bar:document.querySelector('#offlineBar')?.innerText.slice(0,200)}))));
 await p2.screenshot({path:path.resolve(__dirname,'out','offline.png')});
 // sửa khi offline → không ghi
 await p2.evaluate(()=>{ state.items[0].ten+='x'; store.schedule(); }); await p2.waitForTimeout(1600); console.log(await p2.evaluate(()=>document.querySelector('#savebadge').innerText));
 await b.close(); })();
