const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='d_gc'; render(); }); await pg.waitForTimeout(150);
 console.log('Bên trái:', await pg.evaluate(()=>!!$('#gcAuto').closest('.tbl-l'))); await pg.screenshot({path:'/home/claude/work/shots/gcb.png', clip:{x:236,y:0,width:1204,height:200}}); console.log(errs); await b.close(); })();
