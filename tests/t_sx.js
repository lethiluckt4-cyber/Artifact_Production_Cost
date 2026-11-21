const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const run = cn => pg.evaluate(cn=>{ for (let mth=1;mth<=9;mth++){ const k=`2026-${String(mth).padStart(2,'0')}`; state.costs[k]=Object.assign(state.costs[k]||{}, {soCN:cn}); } calcCache=null; resetProposal('2026-01'); calcCache=null; calc(); const pl=buildPlan('2026'); applyPlanCore(pl, [...new Set(pl.list.map(x=>x.kyDX))]); calcCache=null; const c=calc();
  const ords=Object.values(c.periods).flatMap(P=>P.orders); const am=Object.values(c.periods).flatMap(P=>P.sales).filter(s=>s.tonNgay<-1e-9 && isFinal(itemMap()[s.ma]));
  const by={}; ords.forEach(o=>{ const t=by[o.loaiLenh]||(by[o.loaiLenh]={n:0,sl:0}); t.n++; t.sl+=o.slTH; });
  const sx=ords.filter(o=>o.loaiLenh==='SX'); return {cn, theoLoai:by, sx100: sx.every(o=>o.slTH%100===0), vdSX: sx.slice(0,3).map(o=>`${o.maLenh} cắt ${o.ngayXuatNVL} cần ${o.ngaySX} xong ${o.ngayHT} sl ${o.slTH}`), amBan:am.length, tre:ords.filter(o=>o.tre).length}; }, cn);
 console.log(JSON.stringify(await run(0))); console.log(JSON.stringify(await run(6)));
 console.log('errs', errs); await b.close(); })();
