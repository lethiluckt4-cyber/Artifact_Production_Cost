const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 const R=await pg.evaluate((docs)=>{ fromDocs(docs); calcCache=null; const o={}; for (const k of ['2026','2026-03','2026-10','2026-11']) { selKy=k; const p=P(); o[k]={rcv:p&&p.rcv?p.rcv.length:'none', orders:p&&p.orders.length, nk:p?buildNK(p).length:0, keys:p?Object.keys(p).filter(x=>/rcv|nk|NK/i.test(x)):[]}; } const c=calc(); o.anyRcv=Object.keys(c).slice(0,40); return o; }, docs);
 console.log(JSON.stringify(R,null,1)); console.log(errs); await b.close(); })();
