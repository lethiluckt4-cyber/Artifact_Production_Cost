const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const r=await pg.evaluate(()=>{ for (let mth=1;mth<=9;mth++){ const k=`2026-${String(mth).padStart(2,'0')}`; state.costs[k]=Object.assign(state.costs[k]||{}, {soCN:6, c622:42000000}); } calcCache=null; resetProposal('2026-01'); calcCache=null; calc(); const pl=buildPlan('2026'); const ms=[...new Set(pl.list.map(x=>x.kyDX))]; applyPlanCore(pl, ms); calcCache=null; selKy='2026'; const c=calc();
  return opChecks({c, p:P(), items:itemMap(), y:'2026', incomplete:[], missing:{}, dupLenh:[], adjTP:[], dupS:[], noDong:[]}).filter(x=>x.n).map(x=>`${x.lvl} ${x.t}: ${x.n} | ${x.list.slice(0,3).join(' ; ')}`); });
 console.log(r.join('\n')||'(không có lỗi)'); await b.close(); })();
