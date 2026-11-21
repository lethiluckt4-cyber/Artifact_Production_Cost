const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1300,height:1000}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='luong'; renderNav(); render(); }); await pg.waitForTimeout(400);
 await pg.screenshot({path:'/home/claude/work/shots/luong.png', fullPage:true});
 console.log(await pg.evaluate(()=>[...document.querySelectorAll('[data-fn]')].map(b=>b.dataset.fn+':'+(b.classList.contains('R')?'R':b.classList.contains('Y')?'Y':'ok')+(b.querySelector('.flw-c')?'('+b.querySelector('.flw-c').textContent+')':'')).join(' ')));
 const red=await pg.$('.flw-n.R'); if (red) { await red.click(); await pg.waitForTimeout(300); await pg.screenshot({path:'/home/claude/work/shots/luong2.png'}); await pg.click('#flGo'); await pg.waitForTimeout(300); console.log('view after go', await pg.evaluate(()=>view)); }
 await pg.evaluate(()=>{ view='luong'; render(); }); await pg.waitForTimeout(200);
 const ok=await pg.$('.flw-n:not(.R):not(.Y)'); const id=await ok.getAttribute('data-fn'); await ok.click(); await pg.waitForTimeout(300); console.log('ok click', id, '->', await pg.evaluate(()=>view));
 await pg.evaluate(()=>{ view='luong'; selKy='2026-03'; render(); }); await pg.waitForTimeout(300);
 console.log('T3:', await pg.evaluate(()=>[...document.querySelectorAll('.flw-n.R,.flw-n.Y')].map(b=>b.dataset.fn).join(' ')));
 console.log(errs); await b.close(); })();
