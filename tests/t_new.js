const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/newapp/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2000);
 const info=await pg.evaluate(()=>({items:state.items.length, pur:state.purchases.length, company:state.settings.company, nav:NAV.filter(x=>x.id).length}));
 console.log(JSON.stringify(info));
 const ids=await pg.evaluate(()=>NAV.filter(x=>x.id).map(x=>x.id)); const bad=[];
 for (const id of ids){ await pg.evaluate(v=>{ closeModal(); view=v; render(); },id); await pg.waitForTimeout(150); const t=await pg.evaluate(()=>({h:$('#main .top h2')?.textContent||'', err:/Lỗi hiển thị|TypeError|undefined/.test($('#main').innerText.slice(0,400))})); if(!t.h||t.err) bad.push([id,t]); }
 console.log('bad',JSON.stringify(bad)); await pg.evaluate(()=>{ view='d_purchases'; render(); }); await pg.screenshot({path:'new.png'}); console.log('errs',errs.slice(0,5)); await b.close(); })();
