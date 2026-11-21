const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 console.log(await pg.evaluate(()=>{ const c=(arr,f)=>{ const o={}; arr.forEach(r=>{ const v=f(r)||'(trống)'; o[v]=(o[v]||0)+1; }); return o; };
  return JSON.stringify({items:c(state.items,r=>r.kho), itemsByNhom:c(state.items,r=>r.nhom+'→'+(r.kho||'')), purchases:c(state.purchases,r=>r.kho), opening:c(Object.values(state.opening.rows||{}),r=>r.kho), salesHasKho: state.sales.some(r=>'kho' in r), issues:state.issues.length, req:Object.fromEntries(Object.entries(GRID).map(([k,g])=>[k,g.req]))}, null, 1); })); await b.close(); })();
