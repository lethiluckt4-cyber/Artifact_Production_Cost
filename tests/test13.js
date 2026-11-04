const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); app.state.settings.tonLau=40; changed(); state.settings.workYear='2026'; selKy='2026-10'; view='kehoach'; render(); });
 console.log(await pg.evaluate(()=>{ const d=buildProposal(P()); return {rows:d.rows.filter(r=>r.st==='Tăng sản xuất').map(r=>[r.ma,r.tp,r.meLT,r.me,r.note.slice(0,60)]), chot:d.chotRows.map(c=>[c.tp,c.dc])}; }), errs);
 await pg.screenshot({path:'/tmp/man-hinh-23-de-xuat.png', fullPage:true}); await b.close(); })();
