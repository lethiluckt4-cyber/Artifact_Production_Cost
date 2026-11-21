const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch({}); const pg=await (await b.newContext({viewport:{width:1400,height:900}, locale:'en-US'})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 await pg.evaluate(()=>{ if(!state.items.length){ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); calcCache=null; } view='thietlap'; document.querySelector('#main').dataset.tlt='tl'; render(); });
 const out=[]; out.push(await pg.inputValue('#startKy2'));
 for (const t of ['2/2026','13/2026','abc','01/2026']) { await pg.fill('#startKy2', t); await pg.dispatchEvent('#startKy2','change'); await pg.waitForTimeout(100); out.push(t+' → '+(await pg.evaluate(()=>state.settings.startKy))+' / ô: '+(await pg.inputValue('#startKy2'))); }
 await pg.evaluate(()=>{ view='d_opening'; render(); }); out.push('opening: '+await pg.inputValue('#startKy'));
 await pg.screenshot({path:'/home/claude/work/shots/kyin.png'});
 console.log(out.join('\n'), '\nlỗi', errs); await b.close(); })();
