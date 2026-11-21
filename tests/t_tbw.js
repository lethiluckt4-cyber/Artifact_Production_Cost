const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:500}}); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='d_adjustments'; render(); }); await pg.waitForTimeout(400);
 await pg.screenshot({path:'/home/claude/work/shots/tbw15.png', clip:{x:236,y:0,width:1264,height:230}});
 console.log(await pg.evaluate(()=>{ const R=document.querySelector('#main>.toolbar .tbl-r'); return [...R.children].map(c=>(c.id||c.className)+':'+Math.round(c.getBoundingClientRect().top)+'/'+Math.round(c.getBoundingClientRect().width)).join(' '); }));
 await b.close(); })();
