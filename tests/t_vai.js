const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2000);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final_dk2026.json','utf8')); delete docs._nap; docs.settings=JSON.parse(fs.readFileSync('settings_live.json','utf8')); docs.settings.daDeXuat=[]; docs.settings.dxSig={};
 Object.entries({"2026-02":50,"2026-03":2200,"2026-04":2250,"2026-05":550,"2026-06":1400}).forEach(([k,v])=>docs['c_'+k].tangCa=v); docs['c_2026-11']={soCN:4};
 await pg.evaluate(d=>{ fromDocs(d); calcCache=null; closeModal(); resetProposal('2026-01'); calcCache=null; calc(); const pl=buildPlan('2026'); applyPlanCore(pl, Array.from({length:11},(_,i)=>`2026-${String(i+1).padStart(2,'0')}`)); calcCache=null; }, docs);
 const r=await pg.evaluate(()=>{ const out=[]; calcCache=null; const c=calc(); c.list.forEach(k=>{ const P=c.periods[k]; ['VALO','VAI_IN'].forEach(ma=>{ const th=sum(P.lines.filter(l=>l.maVT===ma),l=>num(l.thieuSL)); const x=P.nxt.find(z=>z.ma===ma)||{}; if (th>0.01) out.push(`${k} ${ma} thiếu ${th.toFixed(1)} | đầu ${(x.openSL||0).toFixed(1)} nhập ${(x.nhapSL||0).toFixed(1)} xuất ${(x.xuatSL||0).toFixed(1)} cuối ${(x.closeSL||0).toFixed(1)}`); }); }); 
   out.push('VALO mua: '+state.purchases.filter(r=>r.ma==='VALO').map(r=>r.ngayNhap+' '+r.sl).join(', ')); out.push('VAI_IN gc: '+state.gc.map(g=>g.ngayNhan+' '+g.slNhan).join(', ')); return out; });
 r.forEach(x=>console.log(x)); console.log('errs',errs); await b.close(); })();
