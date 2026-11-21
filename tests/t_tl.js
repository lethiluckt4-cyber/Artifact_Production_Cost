const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='thietlap'; render(); }); await pg.waitForTimeout(200);
 console.log(await pg.evaluate(()=>({xoa:document.body.innerText.includes('Xóa toàn bộ dữ liệu'), dlhc:document.querySelector('#main').innerText.includes('Dữ liệu hiện có')})));
 await pg.screenshot({path:'/home/claude/work/shots/tl1.png', fullPage:true}); console.log(errs); await b.close(); })();
