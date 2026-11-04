const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; view='d_costs'; render(); }); await pg.waitForTimeout(300);
 const before = await pg.evaluate(()=>({...state.costs['2026-10']}));
 await pg.click('#cols'); await pg.waitForTimeout(200);
 await pg.fill('#ccNew','Thuê kho'); await pg.click('#ccAdd'); await pg.waitForTimeout(100); await pg.click('#ccOk'); await pg.waitForTimeout(300);
 console.log('cols', await pg.evaluate(()=>costCols().map(c=>c.k+'/'+c.g)));
 await pg.click('[data-edit="2026-10"]'); await pg.waitForTimeout(200);
 await pg.fill('input.ci[data-k="x7"]','1000000'); await pg.keyboard.press('Enter'); await pg.waitForTimeout(300);
 console.log('c10', await pg.evaluate(()=>state.costs['2026-10']));
 // calc and compare 627
 await pg.evaluate(()=>{ calcCache=null; }); const r=await pg.evaluate(()=>{ const c=calc(); const p=c.periods['2026-10']; return [p.sum627, p.sum622]; });
 console.log('sum627/622', r, 'expected627', Object.values(before).reduce((s,v)=>s+v,0)-before.c622+1000000);
 // persistence roundtrip
 const rt = await pg.evaluate(()=>{ const d=toDocs(); fromDocs(JSON.parse(JSON.stringify(d))); return [state.costs['2026-10'].x7, costCols().length]; });
 console.log('roundtrip', rt);
 await pg.evaluate(()=>{ editRow=null; render(); }); await pg.screenshot({path:'/tmp/n_costs.png'});
 await pg.evaluate(()=>{ view='chiphi'; render(); }); await pg.waitForTimeout(300); await pg.screenshot({path:'/tmp/n_chiphi.png'});
 // template import roundtrip
 console.log(await pg.evaluate(()=>importAOA('costs',[TEMPLATE.ChiPhi.cols.map(c=>c[1]),['2026-12',1,2,3,4,5,6,7]],'add')), await pg.evaluate(()=>state.costs['2026-12']));
 console.log(errs); await b.close(); })();
