const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:500}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 await pg.evaluate(()=>{ view='d_orders'; render(); }); await pg.waitForTimeout(300);
 console.log(await pg.evaluate(()=>[...document.querySelectorAll('#main table thead th')].map(t=>t.textContent.trim()).join(' | ')));
 await pg.evaluate(()=>document.querySelectorAll('.toast').forEach(t=>t.remove())); await pg.click('#addRow').catch(async()=>{ await pg.click('.tbl-r .btn.p'); }); await pg.waitForTimeout(300); console.log('form fields:', await pg.evaluate(()=>[...document.querySelectorAll('#modal label')].map(l=>l.textContent.trim().slice(0,25)).join(' | ')));
 console.log(errs); await b.close(); })();
