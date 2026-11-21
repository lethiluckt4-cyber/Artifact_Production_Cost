const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const r=await pg.evaluate(()=>{ const cn={'2026-01':2,'2026-02':2,'2026-03':3,'2026-04':2}; for (const k in cn) state.costs[k]=Object.assign(state.costs[k]||{}, {soCN:cn[k]});
  calcCache=null; resetProposal('2026-01'); const out={};
  for (let m=1;m<=9;m++){ const k=`2026-${String(m).padStart(2,'0')}`; calcCache=null; calc(); const pl=buildPlan('2026'); applyPlanCore(pl,[k]); }
  calcCache=null; const c=calc(); const pl=buildPlan('2026');
  out.months=Object.fromEntries(Object.entries(pl.months).map(([k,v])=>[k,{nangLuc:v.nangLuc, R:v.R, perDay: v.perDay}]));
  const ords=Object.values(c.periods).flatMap(P=>P.orders);
  out.late=ords.filter(o=>o.tre).length; out.byMonthNeed={}; ords.forEach(o=>{ const k=kyOf(o.ngaySX); const x=out.byMonthNeed[k]||(out.byMonthNeed[k]={sl:0,n:0,tre:0,mt:0}); if(o.loaiLenh==='MT') x.mt+=o.slTH; else x.sl+=o.slTH; x.n++; if(o.tre) x.tre++; });
  out.ex=ords.filter(o=>o.tre).slice(0,5).map(o=>[o.maLenh,o.loaiLenh,o.maTP,o.slTH,o.ngayXuatNVL,o.ngaySX,o.ngayHT]);
  out.perDay=Object.fromEntries(['2026-01','2026-03','2026-05'].map(k=>[k, (typeof capMonth==='function')? JSON.stringify(capMonth(k)).slice(0,200):'']));
  return out; });
 console.log(JSON.stringify(r,null,1)); await b.close(); })();
