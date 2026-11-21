const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ view='d_purchases'; render(); document.querySelectorAll('.toast').forEach(t=>t.remove()); }); await pg.waitForTimeout(200);
 await pg.screenshot({path:'/home/claude/work/shots/nav1.png', clip:{x:0,y:0,width:700,height:200}});
 console.log(await pg.evaluate(()=>[...document.querySelectorAll('nav button.top')].map(b=>getComputedStyle(b).backgroundColor+' '+b.textContent.trim()))); await b.close(); })();
