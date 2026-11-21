const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='canhbao'; document.querySelector('#main').dataset.cbt='kq'; render(); });
 const info=()=>pg.evaluate(()=>({tab:[...document.querySelectorAll('[data-cbt]')].map(b=>b.textContent+(b.classList.contains('act')?'*':'')).join(' | '), h3:[...document.querySelectorAll('#main .box h3')].map(h=>h.textContent.slice(0,40))}));
 console.log('Cảnh báo rủi ro:', JSON.stringify(await info()));
 await pg.click('[data-cbt="kt"]'); await pg.waitForTimeout(200); console.log('Kiểm tra số liệu:', JSON.stringify(await info()));
 await pg.screenshot({path:'/home/claude/work/shots/cb3.png', clip:{x:236,y:0,width:1204,height:420}});
 await pg.click('[data-cbt="ng"]'); await pg.waitForTimeout(200); console.log('Ngưỡng:', JSON.stringify((await info()).tab));
 console.log('errs', errs); await b.close(); })();
