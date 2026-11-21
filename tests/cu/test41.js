const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026'; calcCache=null; view='d_purchases'; render(); }); await pg.waitForTimeout(300);
 await pg.click('#add'); await pg.waitForTimeout(300);
 console.log('blank', await pg.evaluate(()=>[...document.querySelectorAll('tbody tr:first-child td.ed')].slice(0,2).map(t=>t.textContent)), 'focus', await pg.evaluate(()=>document.activeElement.dataset.k));
 await pg.keyboard.type('05/10/2026'); await pg.waitForTimeout(100);
 console.log('auto', await pg.evaluate(()=>[...document.querySelectorAll('tbody tr:first-child td.ed')].slice(0,2).map(t=>t.textContent)));
 // edit nhap manually, then change mua: nhap must stay
 await pg.click('tbody tr:first-child td.ed[data-k="ngayNhap"]'); await pg.keyboard.press('Control+A'); await pg.keyboard.type('06/10/2026');
 await pg.click('tbody tr:first-child td.ed[data-k="ngayMua"]'); await pg.keyboard.press('Control+A'); await pg.keyboard.type('04/10/2026'); await pg.waitForTimeout(100);
 console.log('manual kept', await pg.evaluate(()=>[...document.querySelectorAll('tbody tr:first-child td.ed')].slice(0,2).map(t=>t.textContent)), errs);
 await b.close(); })();
