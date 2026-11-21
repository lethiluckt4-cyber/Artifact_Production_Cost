const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2500);
 const go=async v=>{ await pg.locator(`[data-v="${v}"], [data-dk="${v}"]`).first().click(); await pg.waitForTimeout(400); };
 const qv=async()=>pg.evaluate(()=>{ const q=document.querySelector('#q'); return q?q.value:'(no q)'; });
 await go('d_purchases'); await pg.fill('#q','VAI'); await pg.press('#q','Enter'); await pg.waitForTimeout(500); console.log('mua',await qv());
 await go('d_sales'); console.log('ban',await qv());
 await pg.fill('#q','TP_BBN'); await pg.press('#q','Enter'); await pg.waitForTimeout(500);
 await go('d_purchases'); console.log('mua lại',await qv());
 await go('d_sales'); console.log('ban lại',await qv());
 await go('d_bom'); console.log('dm',await qv());
 const tabs=await pg.$$eval('#main [data-dmt]',x=>x.map(e=>e.dataset.dmt)); console.log('dmt tabs',tabs);
 if (tabs.length>1){ await pg.fill('#q','QB'); await pg.press('#q','Enter'); await pg.waitForTimeout(400); await pg.click(`#main [data-dmt="${tabs[1]}"]`); await pg.waitForTimeout(400); console.log('tab2',await qv()); await pg.click(`#main [data-dmt="${tabs[0]}"]`); await pg.waitForTimeout(400); console.log('tab1',await qv()); }
 console.log('errs',errs); await b.close(); })();
