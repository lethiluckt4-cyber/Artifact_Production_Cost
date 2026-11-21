const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 console.log(await pg.evaluate(()=>{ const c=calc(); const P=c.periods['2026-04']; const k=o=>o?Object.keys(o).slice(0,30).join(','):'-';
  return ['sales: '+k(P.sales[0]), 'sales.r? '+!!(P.sales[0]&&P.sales[0].r), 'rcvAll: '+k(c.rcvAll[0]), 'rcv.o: '+k(c.rcvAll[0].o), 'rcv.o._id '+(c.rcvAll[0].o._id||'-')+' o.o '+(c.rcvAll[0].o.o?Object.keys(c.rcvAll[0].o.o).slice(0,8):'-'), 'lines: '+k(P.lines[0]), 'issues: '+k(P.issues[0]), 'gcNhan: '+k(P.gcNhan[0]), 'gcGui: '+k(P.gcGui[0])].join('\n'); })); await b.close(); })();
