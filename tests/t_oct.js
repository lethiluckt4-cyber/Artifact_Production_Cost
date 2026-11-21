const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2000);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final_dk2026.json','utf8')); delete docs._nap; docs.settings=JSON.parse(fs.readFileSync('settings_live.json','utf8')); docs.settings.daDeXuat=[]; docs.settings.dxSig={};
 Object.entries({"2026-02":50,"2026-03":2200,"2026-04":2250,"2026-05":550,"2026-06":1400}).forEach(([k,v])=>docs['c_'+k].tangCa=v); docs['c_2026-11']={soCN:4};
 await pg.evaluate(d=>{ fromDocs(d); calcCache=null; closeModal(); resetProposal('2026-01'); calcCache=null; calc(); const pl=buildPlan('2026'); applyPlanCore(pl, Array.from({length:11},(_,i)=>`2026-${String(i+1).padStart(2,'0')}`)); calcCache=null; }, docs);
 const r=await pg.evaluate(()=>{ const out=[]; ['2026-08','2026-09','2026-10'].forEach(k=>{ selKy=k; calcCache=null; const d=buildAdjProposal(P()); out.push(k+': '+d.rows.length+' rows; '+d.rows.slice(0,6).map(x=>`${x.maLenh} sx=${x.ngaySX} adjKy=${adjKyOf(x)} ${x.maVT} ${x.deXuat}`).join(' | ')); }); return out; });
 r.forEach(x=>console.log(x)); console.log('errs',errs); await b.close(); })();
