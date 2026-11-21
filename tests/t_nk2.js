const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 const R=await pg.evaluate((docs)=>{ fromDocs(docs); calcCache=null; closeModal(); const o={}; const c=calc();
   for (const k of ['2026','2026-03','2026-11']) { selKy=k; const p=P(); const nk=buildNK(p); o[k]={nk:nk.length, sl:Math.round(sum(nk,r=>r[13])), slNK:Math.round(p.slNK)}; }
   o.all=Math.round(sum((c.rcvAll||[]).filter(r=>r.d.startsWith('2026')),r=>r.sl));
   selKy='2026'; view='xuatphieu'; $('#main').dataset.ptab='nk'; render(); o.rows=document.querySelectorAll('#main tbody tr').length; return o; }, docs);
 console.log(JSON.stringify(R)); await pg.screenshot({path:'nk.png'}); console.log(errs); await b.close(); })();
