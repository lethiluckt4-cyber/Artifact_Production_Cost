const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; view='d_issues'; render(); }); await pg.waitForTimeout(300);
 const n0=await pg.evaluate(()=>state.issues.length);
 await pg.click('#add'); await pg.waitForTimeout(200);
 // unsaved new row must not be persisted
 const persisted=await pg.evaluate(()=>toDocs()['i_2026-10'].rows.length);
 console.log('before',n0,'persisted after add',persisted, persisted===n0?'OK':'FAIL');
 // try saving empty -> toast
 await pg.click('button[data-save]').catch(()=>{}); await pg.waitForTimeout(200);
 console.log('still editing', await pg.evaluate(()=>!!editRow));
 // inject incomplete row directly (simulating bad import / old data)
 await pg.evaluate(()=>{ discardEdit(); state.issues.push({_id:uid(), maPhieu:'', ngay:'2026-10-01', maVT:'', sl:0, lyDo:''}); render(); }); await pg.waitForTimeout(300);
 console.log('badrows', await pg.evaluate(()=>document.querySelectorAll('tr.badrow').length), 'warnbox', await pg.evaluate(()=>!!document.querySelector('.warnbox')));
 await pg.screenshot({path:'/tmp/n_badrow.png'});
 await pg.evaluate(()=>{ view='canhbao'; render(); }); await pg.waitForTimeout(300);
 console.log(await pg.evaluate(()=>document.querySelector('.box').textContent.slice(0,120)));
 await pg.click('[data-go]'); await pg.waitForTimeout(200); console.log('view', await pg.evaluate(()=>view), errs);
 await b.close(); })();
