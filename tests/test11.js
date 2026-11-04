const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); app.state.caps.push({_id:'c1', maTP:'BO', tuNgay:'2026-10-01', denNgay:'2026-10-31', lanNgay:16, meThang:420, ghiChu:'thử'}); changed(); state.settings.workYear='2026'; selKy='2026-10'; view='kehoach'; render(); }); await pg.waitForTimeout(400);
 console.log(await pg.evaluate(()=>{ const d=buildProposal(P()); return d.rows.filter(r=>r.tp==='BO').map(r=>[r.me,r.note]); }));
 await pg.evaluate(()=>{ view='d_caps'; render(); }); await pg.waitForTimeout(300); await pg.screenshot({path:'/tmp/man-hinh-27-nang-luc.png'});
 console.log(errs); await b.close(); })();
