const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2000);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/live_sim.json','utf8')); delete docs._nap; docs.settings=JSON.parse(fs.readFileSync('settings_live.json','utf8')); docs.settings.daDeXuat=[]; docs.settings.dxSig={};
 const _ddh=['TP_QB_QV01','TP_QB_QV02','TP_BVR_AV12','TP_BN_AV02_M3XL','TP_BN_AV02_M5XL','TP_BLT_AV03','TP_BLT_AV13','TP_BRT_AV07','TP_BVR_AV01']; docs.items.rows.forEach(r=>{ if (_ddh.includes(r[0])) { r[2]='Thành phẩm-DDH'; r[5]='DDH'; } });
 if (0) { const s6=docs['s_2026-06'].rows; const i=s6.findIndex(r=>r[0]==='2026-06-06'&&r[1]==='VR_TN2025'); const j=s6.findIndex((r,k)=>k>i&&r[0]==='2026-06-06'&&r[1]==='VR_TN2025'); if (j>i) s6.splice(j,1); }
 docs['c_2026-11']={soCN:4};
 await pg.evaluate(d=>{ fromDocs(d); calcCache=null; closeModal(); }, docs);
 const TC=JSON.parse(process.argv[2]||'{}'); const NOFIX=process.argv[3]==='nofix';
 const res=await pg.evaluate(({TC,NOFIX})=>{ const it=itemMap(); const log=[];
   const run=tc=>{ if (Object.keys(tc).length) { Object.keys(state.costs).forEach(k=>{ delete state.costs[k].tangCa; }); } Object.entries(tc).forEach(([k,v])=>{ (state.costs[k]=state.costs[k]||{}).tangCa=v; });
     resetProposal('2026-01'); calcCache=null; calc(); const pl=buildPlan('2026'); const ms=Array.from({length:11},(_,i)=>`2026-${String(i+1).padStart(2,'0')}`); applyPlanCore(pl, ms); if (!NOFIX) fixLateOrders(ms); selKy='2026'; calcCache=null; const c=calc();
     const ops=opChecks({c, p:null, items:it, y:'2026', incomplete:[], missing:[], dupLenh:[], adjTP:[], dupS:[], noDong:[]});
     const sale=ops.find(x=>x.t.startsWith('Bán thành phẩm khi tồn kho chưa đủ')); const tre=[]; c.list.forEach(k=>(c.periods[k].orders||[]).filter(o=>o.tre).forEach(o=>tre.push(kyOf(o.ngaySX))));
     const saleM=sale?sale.list.map(t=>{ const m=t.match(/từ (\d{2})\/(\d{2})\/(\d{4})/); return m?`${m[3]}-${m[2]}`:null; }).filter(Boolean):[];
     const L=[]; c.list.forEach(k=>(c.periods[k].orders||[]).filter(o=>o.tre).forEach(o=>L.push(o.maLenh+' '+o.maTP+' xuat='+o.ngayXuatNVL+' can='+o.ngaySX+' xong='+o.ngayHT+' '+(state.orders.find(x=>x.maLenh===o.maLenh)||{}).loaiLenh))); window.__sale=sale?sale.list:[]; const ot={}; Object.entries(c.otKy||{}).forEach(([k,v])=>ot[k]=Math.round(v)); return {ot, sale:sale?sale.n:0, SL:window.__sale, saleM, tre:tre.length, treM:tre, nOrd:state.orders.length, L}; };
   let tc={...TC}; let r=run(tc); log.push({tc:{...tc}, ot:r.ot, sale:r.sale, tre:r.tre, L:r.L, SL:r.SL});
   for (let i=0;i<(NOFIX===2?60:0) && (r.sale||r.tre);i++){ const ks=[...r.saleM, ...r.treM].filter(k=>k<'2026-11').sort(); const k=ks[0]; if (!k) break; tc[k]=(tc[k]||0)+50; r=run(tc); }
   log.push({tc:{...tc}, sale:r.sale, tre:r.tre, nOrd:r.nOrd});
   const ok=x=>!x.sale && !x.tre; if (ok(r)) { let ch=true; while(ch){ ch=false; for (const k of Object.keys(tc).sort()) { if (tc[k]<50) continue; const t2={...tc,[k]:tc[k]-50}; const r2=run(t2); if (ok(r2)) { tc=t2; ch=true; } } } r=run(tc); log.push({tc:{...tc}, sale:r.sale, tre:r.tre, final:1}); }
   return log; }, {TC,NOFIX});
 res.forEach(l=>console.log(JSON.stringify(l))); console.log('errs',errs); await b.close(); })();
