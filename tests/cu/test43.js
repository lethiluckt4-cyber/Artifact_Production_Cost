const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1300,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; calcCache=null; view='thietlap'; document.querySelector('#main').dataset.stab='cal'; render(); }); await pg.waitForTimeout(300);
 console.log('workday Sun 25/10', await pg.evaluate(()=>[isWorkDay('2026-10-25'), isWorkDay('2026-10-26'), isWorkDay('2026-10-24')]));
 await pg.click('#add'); await pg.waitForTimeout(200);
 await pg.click('td.ed[data-k="ngay"]'); await pg.keyboard.type('25/10/2026'); await pg.selectOption('select.ci[data-k="loai"]','Tăng ca'); await pg.click('button[data-save]'); await pg.waitForTimeout(300);
 console.log('after tang ca', await pg.evaluate(()=>[isWorkDay('2026-10-25'), state.cal.map(r=>[r.ngay,r.loai]), thuOf('2026-10-25')]));
 await pg.click('#add'); await pg.click('td.ed[data-k="ngay"]'); await pg.keyboard.type('25/10/2026'); await pg.selectOption('select.ci[data-k="loai"]','Nghỉ lễ / công ty'); await pg.click('button[data-save]'); await pg.waitForTimeout(200);
 console.log('dup toast', await pg.evaluate(()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).pop()));
 await pg.click('button[data-cancel]'); await pg.waitForTimeout(100);
 // persistence
 console.log('docs', await pg.evaluate(()=>{ const d=toDocs(); fromDocs(JSON.parse(JSON.stringify(d))); return [Object.keys(d).filter(k=>k.startsWith('h_')), state.cal.length]; }));
 // proposal never allocates to Sundays
 await pg.evaluate(()=>{ state.cal=[]; selKy='2026-10'; view='giathanh'; calcCache=null; });
 await pg.evaluate(()=>{ const p=P(); const d=buildProposal(p); applyProposalCore(d,''); calcCache=null; });
 console.log('PM orders on Sundays', await pg.evaluate(()=>state.orders.filter(o=>o.dcPM && new Date(o.ngaySX+'T00:00:00').getDay()===0).length));
 await pg.evaluate(()=>{ view='thietlap'; document.querySelector('#main').dataset.stab='cal'; render(); }); await pg.waitForTimeout(300); await pg.screenshot({path:'/tmp/n_cal.png'});
 console.log('import', await pg.evaluate(()=>importAOA('cal',[['Ngày','Loại','Lý do'],['2026-11-09','Nghỉ lễ','x'],['2026-11-15','Tăng ca','y'],['2026-11-16','nghỉ chờ việc','']],'add')), await pg.evaluate(()=>state.cal.map(r=>r.loai)), errs);
 await b.close(); })();
