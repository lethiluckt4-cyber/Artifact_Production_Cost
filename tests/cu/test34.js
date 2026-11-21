const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); calcCache=null; calcDirty=true; state.settings.workYear='2026'; selKy='2026-10'; view='giathanh'; render(); }); await pg.waitForTimeout(300);
 const n0 = await pg.evaluate(()=>state.orders.length);
 await pg.click('#recalc'); await pg.waitForTimeout(200); await pg.click('#rcGo'); await pg.waitForTimeout(1500);
 console.log('orders', n0, '->', await pg.evaluate(()=>state.orders.length), 'dirty', await pg.evaluate(()=>[proposalDirty(), calcDirty]));
 console.log(await pg.evaluate(()=>[...document.querySelectorAll('.modal ol li')].map(l=>l.textContent.slice(0,110))));
 await pg.screenshot({path:'/tmp/n_autorun.png'});
 const hasAdj = await pg.evaluate(()=>!!document.querySelector('#rsAdj'));
 if (hasAdj) { await pg.click('#rsAdj'); await pg.waitForTimeout(1500); console.log('adj rows', await pg.evaluate(()=>state.adjustments.length), 'neg', await pg.evaluate(()=>P().nxt.filter(x=>x.closeSL<0).length)); console.log(await pg.evaluate(()=>[...document.querySelectorAll('.modal ol li')].map(l=>l.textContent.slice(0,100)))); }
 // re-run: must not re-apply
 await pg.evaluate(()=>closeModal()); const n1=await pg.evaluate(()=>state.orders.length);
 await pg.click('#recalc'); await pg.waitForTimeout(200); await pg.click('#rcGo'); await pg.waitForTimeout(1500);
 console.log('rerun orders', n1, '->', await pg.evaluate(()=>state.orders.length), errs);
 await b.close(); })();
