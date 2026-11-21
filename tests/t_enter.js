const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1500,height:800}})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 await pg.evaluate(()=>{ view='d_purchases'; selKy='2026-04'; render(); });
 await pg.click('[data-edit]'); await pg.click('td.ed[data-k="hoaDon"]'); await pg.keyboard.press('Control+A'); await pg.keyboard.type('HDX'); await pg.keyboard.press('Enter');
 const r=await pg.evaluate(()=>({dangSua:!!editRow, focusK:document.activeElement.dataset.k, luu:state.purchases.some(p=>p.hoaDon==='HDX')})); console.log('Sau Enter:', JSON.stringify(r));
 await pg.keyboard.type('NCC Y'); await pg.click('[data-save]'); await pg.waitForTimeout(200);
 console.log('Sau Lưu:', await pg.evaluate(()=>JSON.stringify(state.purchases.filter(p=>p.hoaDon==='HDX').map(p=>p.ncc))));
 console.log('errs', errs); await b.close(); })();
