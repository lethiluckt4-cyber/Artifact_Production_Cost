const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message+' @'+(e.stack||'').split('\n')[1])); pg.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text()); });
 const docs=JSON.parse(fs.readFileSync(DATA('SaoLuu_GiaThanh_2026-11-04.json'),'utf8'));
 // Giả lập claude.use('db') với dữ liệu thật
 await pg.addInitScript(d=>{ const store=JSON.parse(JSON.stringify(d)); const deepFreeze=o=>{ if(o&&typeof o==="object"){ Object.values(o).forEach(deepFreeze); Object.freeze(o);} return o; }; window.claude={ use:async n=>({ collection:()=>({ get:async()=>({docs:Object.keys(store).map(id=>({id,exists:true,data:()=>deepFreeze(JSON.parse(JSON.stringify(store[id])))}))}), doc:k=>({set:async v=>{store[k]=v;}, delete:async()=>{delete store[k];}}) }) }) }; }, docs);
 await pg.goto(APP); await pg.waitForTimeout(2500);
 console.log('kind', await pg.evaluate(()=>store.kind), 'items', await pg.evaluate(()=>state.items.length), 'p', await pg.evaluate(()=>state.purchases.length), 'o', await pg.evaluate(()=>state.orders.length));
 console.log('main text:', (await pg.evaluate(()=>document.querySelector('#main').innerText)).slice(0,300));
 const views = await pg.evaluate(()=>NAV.filter(x=>x.id).map(x=>x.id)); const out={};
 for (const v of views) { try { await pg.evaluate(v=>{ view=v; render(); }, v); await pg.waitForTimeout(60); out[v]=await pg.evaluate(()=>document.querySelectorAll('#main table').length); } catch(e){ out[v]='ERR '+e.message.slice(0,150); } }
 console.log(JSON.stringify(out)); console.log('errs', errs.slice(0,10)); await b.close(); })();
