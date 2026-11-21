const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2000);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final_dk2026.json','utf8')); delete docs._nap; docs.settings=JSON.parse(fs.readFileSync('settings_live.json','utf8')); docs.settings.daDeXuat=[]; docs.settings.dxSig={};
 const ddh=['TP_QB_QV01','TP_QB_QV02','TP_BVR_AV12','TP_BN_AV02_M3XL','TP_BN_AV02_M5XL','TP_BLT_AV03','TP_BLT_AV13','TP_BRT_AV07','TP_BVR_AV01']; docs.items.rows.forEach(r=>{ if (ddh.includes(r[0])) { r[2]='Thành phẩm-DDH'; r[5]='DDH'; } });
 docs.bom.rows.push(...[['VAI_DKCG_1',0.7],['VALO',0.7],['THUN',0.7],['DALU',1],['TUZI',1],['TEM_SPN',1],['TEM_TTG',1]].map(([n,q])=>['DM','QB881_6XL-7XL',n,1,q,'',0,'','','','','']));
 { const s6=docs['s_2026-06'].rows; const i=s6.findIndex(r=>r[0]==='2026-06-06'&&r[1]==='VR_TN2025'); const j=s6.findIndex((r,k)=>k>i&&r[0]==='2026-06-06'&&r[1]==='VR_TN2025'); if (j>i) s6.splice(j,1); }
 docs['c_2026-11']={soCN:4};
 await pg.evaluate(d=>{ fromDocs(d); calcCache=null; closeModal(); }, docs);
 const TC=JSON.parse(process.argv[2]||'{}'); const iters=+(process.argv[3]||1);
 const res=await pg.evaluate(({TC,iters})=>{ const it=itemMap(); const hs=ma=>num((it[ma]||{}).heSo)||1; const log=[];
   const run=tc=>{ Object.keys(state.costs).forEach(k=>{ delete state.costs[k].tangCa; }); Object.entries(tc).forEach(([k,v])=>{ (state.costs[k]=state.costs[k]||{}).tangCa=v; });
     resetProposal('2026-01'); calcCache=null; calc(); const pl=buildPlan('2026'); const ms=Array.from({length:11},(_,i)=>`2026-${String(i+1).padStart(2,'0')}`); applyPlanCore(pl, ms); fixLateOrders(ms); selKy='2026'; calcCache=null; const c=calc();
     const def={}; c.list.forEach(k=>{ const P=c.periods[k]; def[k]=Math.round(sum(P.nxt.filter(x=>x.closeSL<-1e-9 && isFinal(it[x.ma])), x=>-x.closeSL*hs(x.ma))); });
     // bán khi chưa đủ tồn theo ngày (thành phẩm)
     const ops=opChecks({c, p:null, items:it, y:'2026', incomplete:[], missing:[], dupLenh:[], adjTP:[], dupS:[], noDong:[]}).find(x=>x.t.startsWith('Bán thành phẩm khi tồn kho chưa đủ'));
     const tre={}; c.list.forEach(k=>(c.periods[k].orders||[]).filter(o=>o.tre).forEach(o=>{ const kk=kyOf(o.ngaySX); tre[kk]=(tre[kk]||0)+num(o.slTH||o.slKH)*hs(o.maTP); })); Object.keys(tre).forEach(k=>tre[k]=Math.round(tre[k]));
     const lf=(ops&&ops.list.length)? ops.list.map(t=>{ const m=t.match(/từ (\d{2})\/(\d{2})\/(\d{4}).*thiếu nhiều nhất ([\d.,]+)/); return m?{d:`${m[3]}-${m[2]}-${m[1]}`, mx:num(m[4])}:null; }).filter(Boolean).sort((a,b)=>a.d.localeCompare(b.d)) : []; const lateFrom=lf.length?lf[0].d:null; const lateMax=lf.filter(x=>x.d.slice(0,7)===(lateFrom||'').slice(0,7)).reduce((a,x)=>a+x.mx,0);
     return {def, tre, lateFrom, lateMax, late:ops?ops.n:0, lateList:ops?ops.list.slice(0,40):[]}; };
   let tc={...TC}; let r=run(tc); log.push({tc:{...tc}, late:r.late, lf:r.lateFrom, def:Object.values(r.def).reduce((a,b)=>a+b,0)});
   for (let i=1;i<iters;i++){ const dk=Object.keys(r.def).sort().find(k=>r.def[k]>0 && k<'2026-11'); let k=dk, need=dk?r.def[dk]:0;
     if (r.lateFrom && (!k || r.lateFrom.slice(0,7)<=k)) { const d=r.lateFrom; k=d.slice(0,7); need=Math.max(50, r.lateMax*0.5); if (+d.slice(8,10)<=7) { const pk=prevKy(k); tc[pk]=(tc[pk]||0)+50; } }
     if (!k) break; tc[k]=(tc[k]||0)+Math.ceil(need/50)*50; r=run(tc); log.push({tc:{...tc}, late:r.late, lf:r.lateFrom, def:Object.values(r.def).reduce((a,b)=>a+b,0)}); }
   // giảm bớt: thử hạ từng tháng 50 một khi vẫn đạt
   const ok=x=>x.late===0 && Object.values(x.def).every(v=>v<=0);
   if (ok(r)) { let changed=true; while (changed) { changed=false; for (const k of Object.keys(tc).sort()) { if (tc[k]<50) continue; const t2={...tc, [k]:tc[k]-50}; const r2=run(t2); if (ok(r2)) { tc=t2; r=r2; changed=true; } } } log.push({tc:{...tc}, late:r.late, final:1}); }
   return {log, lateList:r.lateList}; }, {TC, iters});
 res.log.forEach(l=>console.log(JSON.stringify(l))); console.log(res.lateList.join('\n')); console.log('errs',errs); await b.close(); })();
