const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const r=await pg.evaluate(()=>{ const cn={'2026-01':2,'2026-02':2,'2026-03':3,'2026-04':2}; for (const k in cn) state.costs[k]=Object.assign(state.costs[k]||{}, {soCN:cn[k]});
  calcCache=null; resetProposal('2026-01');
  for (let m=1;m<=9;m++){ const k=`2026-${String(m).padStart(2,'0')}`; calcCache=null; calc(); const pl=buildPlan('2026'); applyPlanCore(pl,[k]); }
  calcCache=null; const c=calc(); const ords=Object.values(c.periods).flatMap(P=>P.orders);
  const lead=ords.filter(o=>o.loaiLenh!=='MT').map(o=>(new Date(o.ngaySX)-new Date(o.ngayXuatNVL))/864e5);
  const vaiAm=Object.values(c.periods).flatMap(P=>P.nxt).filter(x=>(x.nhom==='Vải'||x.nhom==='Bán thành phẩm') && x.closeSL<-1e-6).length;
  const late=ords.filter(o=>o.tre); const delay=late.map(o=>(new Date(o.ngayHT)-new Date(o.ngaySX))/864e5);
  return {n:ords.length, late:late.length, maxLead:Math.max(...lead), maxDelay:Math.max(0,...delay), avgDelay: delay.length? delay.reduce((a,b)=>a+b,0)/delay.length:0, vaiAm, cut0102: ords.filter(o=>o.ngayXuatNVL==='2026-01-02').length}; });
 console.log(JSON.stringify(r), errs); await b.close(); })();
