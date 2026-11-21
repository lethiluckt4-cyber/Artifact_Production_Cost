const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 for (const [t,f] of [['th','nt2'],['ct','nt3']]) { await pg.evaluate(t=>{ document.querySelectorAll('.toast').forEach(x=>x.remove()); view='nxt'; document.querySelector('#main').dataset.nt=t; render(); }, t); await pg.waitForTimeout(200); await pg.screenshot({path:`/home/claude/work/shots/${f}.png`, clip:{x:236,y:50,width:700,height:60}}); }
 await b.close(); })();
