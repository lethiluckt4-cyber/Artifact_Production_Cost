const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2000);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final_dk2026.json','utf8')); delete docs._nap; docs.settings=JSON.parse(fs.readFileSync('settings_live.json','utf8')); docs.settings.daDeXuat=[]; docs.settings.dxSig={}; docs.settings.planPrm={canDoi:0};
 Object.entries({"2026-02":50,"2026-03":2200,"2026-04":2250,"2026-05":550,"2026-06":1400}).forEach(([k,v])=>docs['c_'+k].tangCa=v);
 await pg.evaluate(d=>{ fromDocs(d); calcCache=null; closeModal(); resetProposal('2026-01'); calcCache=null; calc(); const pl=buildPlan('2026'); applyPlanCore(pl, Array.from({length:11},(_,i)=>`2026-${String(i+1).padStart(2,'0')}`)); calcCache=null; }, docs);
 const r=await pg.evaluate(()=>{ const out=[]; out.push('trước: tt '+state.purchases.reduce((a,r)=>a+num(r.tt),0)+' thuế '+state.purchases.reduce((a,r)=>a+num(r.thueGTGT),0)); for (let it=0; it<12; it++) { calcCache=null; const c=calc(); const ks=moveMonths(); if (!ks.length) break; const k=ks[0]; const d=buildMoveProposal(k);
     const P=c.periods[k]; const neg=P.nxt.filter(x=>{ const i=itemMap()[x.ma]; return i && !isFinal(i) && !isProd(i) && (x.closeSL - sum(P.lines.filter(l=>l.maVT===x.ma),l=>num(l.thieuSL)))<-1e-9; }).map(x=>x.ma);
     out.push(k+' âm: '+neg.join(',')+' | '+d.rows.map(x=>`${x.ma} ${x.d}←${x.r.ngayNhap} q=${x.q}/${x.sl} tồn=${x.tonCuoi} lệch=${x.lech}`).join(' ; '));
     applyMoveCore(d.rows); }
   calcCache=null; const c=calc(); const after=c.list.map(k=>{ const P=c.periods[k]; return k+':'+P.nxt.filter(x=>{ const i=itemMap()[x.ma]; return i && !isFinal(i) && !isProd(i) && (x.closeSL - sum(P.lines.filter(l=>l.maVT===x.ma),l=>num(l.thieuSL)))<-1e-9; }).length; }).join(' ');
   const tt=state.purchases.reduce((a,r)=>a+num(r.tt),0), sl=state.purchases.reduce((a,r)=>a+num(r.sl),0); out.push('thuế sau '+state.purchases.reduce((a,r)=>a+num(r.thueGTGT),0)); return {out, after, tt, sl, ints: state.purchases.every(r=>Number.isInteger(num(r.tt)))}; });
 r.out.forEach(x=>console.log(x)); console.log('NVL âm cuối tháng sau chuyển:', r.after); console.log('tổng tt', r.tt, 'sl', r.sl, 'tt nguyên', r.ints); console.log('errs',errs); await b.close(); })();
