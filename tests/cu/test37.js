const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:800}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 const views = await pg.evaluate(()=>NAV.filter(x=>x.id).map(x=>x.id));
 const out={};
 for (const v of views) { try { await pg.evaluate(v=>{ view=v; render(); }, v); await pg.waitForTimeout(150); out[v]=await pg.evaluate(()=>[document.querySelectorAll('#main table').length, !!document.querySelector('#main .note'), document.querySelector('#main h2')?.textContent]); } catch(e){ out[v]='ERR '+e.message.slice(0,80); } }
 console.log(out); console.log('errs', errs);
 await pg.evaluate(()=>{ view='nxt'; render(); }); await pg.waitForTimeout(200); await pg.screenshot({path:'/tmp/n_empty_nxt.png'});
 await pg.evaluate(()=>{ view='tongquan'; render(); }); await pg.waitForTimeout(200); await pg.screenshot({path:'/tmp/n_empty_tq.png'});
 await pg.click('#seedbtn'); await pg.waitForTimeout(800); console.log('seeded', await pg.evaluate(()=>[state.items.length, selKy]));
 await b.close(); })();
