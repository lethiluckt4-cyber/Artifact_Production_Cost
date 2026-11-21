const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='nxt'; selKy='2026'; render(); }); await pg.waitForTimeout(300);
 const vis=()=>pg.evaluate(()=>[...document.querySelectorAll('#main .tw table tbody tr:not(.tot)')].filter(r=>r.style.display!=='none').length);
 console.log('all', await vis());
 const ths=await pg.$$('#main .tw table thead th'); const idx=await pg.evaluate(()=>[...document.querySelectorAll('#main .tw table thead th')].findIndex(t=>t.textContent.startsWith('Tồn cuối SL')));
 await (await ths[idx].$('.xfb')).click(); await pg.waitForTimeout(200);
 await pg.screenshot({path:'/home/claude/work/shots/xf1.png'});
 await pg.click('[data-cu="lt"]'); await pg.waitForTimeout(200); await pg.fill('#xa2','0'); await pg.screenshot({path:'/home/claude/work/shots/xf2.png'}); await pg.click('#xfO'); await pg.waitForTimeout(200);
 console.log('tồn cuối < 0:', await vis(), await pg.evaluate(()=>[...document.querySelectorAll('#main .tw table tbody tr:not(.tot)')].filter(r=>r.style.display!=='none').slice(0,5).map(r=>r.children[1].textContent).join(',')));
 // Nằm giữa
 await (await ths[idx].$('.xfb')).click(); await pg.waitForTimeout(200); await pg.click('[data-cu="bt"]'); await pg.fill('#xa2','100'); await pg.fill('#xb2','1000'); await pg.click('#xfO'); await pg.waitForTimeout(200);
 console.log('100..1000:', await vis(), await pg.evaluate(()=>JSON.stringify(Object.values(tblState).map(s=>s.filters))));
 // text
 const ti=await pg.evaluate(()=>[...document.querySelectorAll('#main .tw table thead th')].findIndex(t=>t.textContent.startsWith('Mặt hàng')));
 await (await ths[ti].$('.xfb')).click(); await pg.waitForTimeout(200); console.log('text label:', await pg.textContent('[data-sub]')); await pg.click('[data-cu="ct"]'); await pg.fill('#xa2','quần'); await pg.click('#xfO'); await pg.waitForTimeout(200);
 console.log('+ chứa "quần":', await vis());
 console.log(errs); await b.close(); })();
