const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 let i=0; for (const [v,ds] of [['d_purchases',{}],['giathanh',{}],['canhbao',{}],['nxt',{nt:'th'}]]) { await pg.evaluate(([v,ds])=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view=v; Object.assign(document.querySelector('#main').dataset, ds); render(); }, [v,ds]); await pg.waitForTimeout(150); await pg.screenshot({path:`/home/claude/work/shots/tab${i++}.png`, clip:{x:236,y:55,width:800,height:50}}); }
 await b.close(); })();
