const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final.json','utf8'));
 await pg.evaluate(d=>{ napImport(d); changed(); state.settings.workYear='2026'; selKy='2026-01'; view='giathanh'; render(); runCalcFor({reset:true}); setTimeout(()=>{ closeModal(); selKy='2026-11'; runCalcFor({}); }, 9000); }, docs);
 await pg.waitForTimeout(25000);
 const r=await pg.evaluate(()=>{ const c=calc(); const f=Math.round; return {orders:state.orders.length, list:c.list.map(k=>{ const P=c.periods[k]; return `${k}: lệnh ${P.orders.length} 621 ${f(P.sum621)} 622 ${f(P.sum622)} 627 ${f(P.sum627)} 155 ${f(P.c154NK)} DT ${f(P.doanhSo)} lãi% ${(P.doanhSo?P.lai/P.doanhSo*100:0).toFixed(1)} NVLâm ${P.nxt.filter(x=>x.closeSL<-1e-9).length} unalloc ${f(P.unalloc622+P.unalloc627)}`; })}; });
 console.log(r.orders); console.log(r.list.join('\n')); console.log(errs);
 await pg.screenshot({path:'/home/claude/work/shots/nap.png'}); await b.close(); })();
