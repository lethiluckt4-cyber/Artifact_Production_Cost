const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:1000}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='kehoach'; render(); }); await pg.waitForTimeout(400);
 const sw=async(n)=>{ await pg.evaluate(()=>document.querySelectorAll('.toast').forEach(t=>t.remove())); const bx=await pg.$('.ppbox'); await bx.screenshot({path:`/home/claude/work/shots/pp_${n}.png`}); };
 console.log('disabled view:', await pg.evaluate(()=>[...document.querySelectorAll('.ppbox [data-pp]')].every(x=>x.disabled)), 'cn inputs:', await pg.evaluate(()=>document.querySelectorAll('[data-cn]').length));
 await sw('view');
 await pg.click('#ppE'); await pg.waitForTimeout(200); await pg.fill('.ppbox [data-pp="nangSuat"]','45'); console.log('panelEdit', await pg.evaluate(()=>JSON.stringify(panelEdit())));
 await pg.click('#ppSave'); await pg.waitForTimeout(300); console.log('nangSuat saved', await pg.evaluate(()=>planPrm().nangSuat), 'locked again', await pg.evaluate(()=>document.querySelector('.ppbox [data-pp]').disabled));
 await pg.click('#ppE'); await pg.fill('.ppbox [data-pp="nangSuat"]','40'); await pg.click('#ppSave'); await pg.waitForTimeout(300);
 await pg.click('#cnE'); await pg.waitForTimeout(200); const ins=await pg.$$('[data-cn]'); console.log('cn inputs edit', ins.length);
 const k5=await pg.evaluate(()=>document.querySelectorAll('[data-cn]')[4].dataset.cn); await ins[4].fill('2,5'); await pg.click('#cnSave'); await pg.waitForTimeout(300);
 console.log(k5, 'soCN', await pg.evaluate(k=>state.costs[k]&&state.costs[k].soCN, k5));
 const tb=await pg.$$('.box'); for (const bx of tb) { const h=await bx.$eval('h3', h=>h.textContent).catch(()=>''); if (h.startsWith('Năng lực công nhân')) { await pg.evaluate(()=>document.querySelectorAll('.toast').forEach(t=>t.remove())); await bx.screenshot({path:'/home/claude/work/shots/cn_view.png'}); } }
 console.log(errs); await b.close(); })();
