const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:1000}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(1200);
 await pg.evaluate(s=>{ app.importDocs(s); calcCache=null; selKy='2026-10'; view='thietlap'; document.querySelector('#main').dataset.tlt='loi'; render(); }, JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8')));
 console.log(await pg.textContent('#loiCompInfo'));
 await pg.click('#loiCompPrev'); await pg.waitForTimeout(800);
 console.log((await pg.innerText('#loiCompOut')).slice(0,900));
 await pg.screenshot({path:path.resolve(__dirname,'out','loi_comp.png'), fullPage:true});
 await pg.click('#loiCompDo'); await pg.waitForTimeout(200); await pg.click('#mo'); await pg.waitForTimeout(500);
 console.log('after apply', await pg.textContent('#loiCompInfo'), await pg.evaluate(()=>{ calcCache=null; const c=calc(); return c.list.map(k=>Math.round(c.periods[k].nxt.find(n=>n.ma==='BTP_BGK').closeSL)).join(','); }));
 const docs=await pg.evaluate(()=>{ const d=toDocs(); return d['o_2026-03'].rows.find(r=>r[11]!==''); }); console.log('saved row', JSON.stringify(docs));
 // round trip toDocs/fromDocs keeps slGoc
 await pg.evaluate(()=>{ const d=JSON.parse(JSON.stringify(toDocs())); fromDocs(d); });
 console.log('rt count', await pg.evaluate(()=>state.orders.filter(o=>o.slGoc!==''&&o.slGoc!=null).length));
 await pg.evaluate(()=>{ view='thietlap'; document.querySelector('#main').dataset.tlt='loi'; render(); });
 await pg.click('#loiCompUndo'); await pg.waitForTimeout(200); await pg.click('#mo'); await pg.waitForTimeout(500);
 console.log('after undo', await pg.textContent('#loiCompInfo'), await pg.evaluate(()=>{ calcCache=null; const c=calc(); return c.list.map(k=>Math.round(c.periods[k].nxt.find(n=>n.ma==='BTP_BGK').closeSL)).join(','); }), await pg.evaluate(()=>state.orders.filter(o=>/Bù hao hụt/.test(o.ghiChu||'')).length));
 console.log(errs); await b.close(); })();
