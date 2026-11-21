const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 const R=await pg.evaluate((docs)=>{ fromDocs(docs); calcCache=null; selKy='2026'; const p=P(); const nk=buildNK(p), xk=buildXK(p); const cnt=(a,i)=>a.reduce((g,r)=>(g[r[i]]=(g[r[i]]||0)+1,g),{}); return {nkKho:cnt(nk,9), nkNo:cnt(nk,10), nkCo:cnt(nk,11), xkKho:cnt(xk,9), xkNo:cnt(xk,10), xkCo:cnt(xk,11), itemKho:cnt(state.items.map(i=>[i.nhom+'|'+i.kho]),0), kt:ktSettings()}; }, docs);
 console.log(JSON.stringify(R,null,1)); await b.close(); })();
