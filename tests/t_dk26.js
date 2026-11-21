const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(3000);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final_dk2026.json','utf8')); const st=JSON.parse(fs.readFileSync('settings_live.json','utf8'));
 delete docs._nap; docs.settings=st;
 const r=await pg.evaluate(d=>{ fromDocs(d); state.cal=[]; changed(); selKy='2026'; calcCache=null; const c=calc();
   const k=c.list[0]; const P=c.periods[k]; let s=0,n=0; for(const ma in P.open){ s+=P.open[ma].tt||0; n++; }
   const neg=[]; c.list.forEach(kk=>{ const Q=c.periods[kk]; for(const ma in (Q.close||{})){ const z=Q.close[ma]; if((z.sl||0)<-1e-6||(z.tt||0)<-1) neg.push(kk+' '+ma+' '+Math.round(z.sl)+' '+Math.round(z.tt)); } });
   return {k, n, s, list:c.list, warn:(P.warnings||[]).slice(0,5), neg:neg.slice(0,30), negN:neg.length}; }, docs);
 console.log(JSON.stringify(r,null,1)); console.log('errs',errs); await b.close(); })();
