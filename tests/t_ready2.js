const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(4000);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final.json','utf8')); const st=JSON.parse(fs.readFileSync('settings_live.json','utf8'));
 delete docs._nap; docs.settings=st; docs.bom.rows.push(...[['VAI_DKCG_1',0.7],['VALO',0.7],['THUN',0.7],['DALU',1],['TUZI',1],['TEM_SPN',1],['TEM_TTG',1]].map(([n,q])=>['DM','QB881_6XL-7XL',n,1,q,'',0,'','','','','']));
 const pre=await pg.evaluate(d=>{ fromDocs(d); state.cal=[]; changed(); selKy='2026'; calcCache=null;
   const items=itemMap(); const inc=[]; for (const ent of ['items','bom','purchases','sales','gc']) { const g=GRID[ent]; (state[ent]||[]).forEach(r=>{ const miss=(g.req||[]).filter(k=>r[k]==null||String(r[k]).trim()===''); if (miss.length) inc.push(ent+':'+(r.ma||r.maTP||r.soCT)+' thiếu '+miss.join(',')); }); }
   const sold=[...new Set(state.sales.map(s=>s.ma))]; const bomTP=new Set(state.bom.map(r=>r.maTP));
   const noBom=sold.filter(m=>isProd(items[m]) && !bomTP.has(m));
   const badCode=[...state.bom.flatMap(r=>[r.maTP,r.maNVL]), ...state.purchases.map(r=>r.ma), ...state.sales.map(r=>r.ma)].filter(m=>!items[m]);
   const noPurNVL=[...new Set(state.bom.map(r=>r.maNVL))].filter(m=>!state.purchases.some(p=>p.ma===m) && !state.gc.some(g=>g.maNhan===m));
   const cnMiss=[]; for (let i=1;i<=11;i++){ const k='2026-'+String(i).padStart(2,'0'); const c=state.costs[k]||{}; if (!num(c.soCN)) cnMiss.push(k); }
   const ops=cbData().opFail.map(x=>`[${x.lvl}] ${x.t}: ${x.n}`);
   return {inc, noBom, badCode:[...new Set(badCode)], noPurNVL, cnMiss, ops, gc:state.gc.length, gcAuto:autoGcLots()};
 }, docs);
 console.log(JSON.stringify(pre,null,1));
 await pg.evaluate(()=>{ view='giathanh'; selKy='2026-01'; render(); runCalcFor({reset:true}); }); await pg.waitForTimeout(25000);
 const det=await pg.evaluate(()=>{ closeModal(); const D=cbData(); const c=calc(); 
   const st={}; D.badOrd.forEach(o=>{ st[o.status]=(st[o.status]||0)+1; });
   const dup=D.dupS? D.dupS.slice(0,3):null;
   const np=D.noPrice; const first={}; np.forEach(ma=>{ for (const k of c.list) { const P=c.periods[k]; if (P.lines.some(l=>l.maVT===ma && !l.dg)) { first[ma]=k; break; } } });
   const fp={}; np.forEach(ma=>{ const p=state.purchases.filter(x=>x.ma===ma).map(x=>x.ngayNhap).sort()[0]; fp[ma]=p; });
   return {st, dup:JSON.stringify(dup).slice(0,400), noPrice:np.map(m=>m+' xuất từ '+first[m]+' – mua đầu tiên '+fp[m]), ops:D.opFail.map(x=>x.t+': '+x.n+' | '+(x.list||[]).slice(0,2).join(' ; '))}; });
 console.log(JSON.stringify(det,null,1));
 const post=await pg.evaluate(()=>{ closeModal(); const c=calc(); const f=Math.round; const I=luongIssues ? (()=>{ selKy='2026'; return luongIssues(); })() : {};
   return {orders:state.orders.length, luong:Object.fromEntries(Object.entries(I).map(([k,a])=>[k,a.map(x=>`[${x.lvl}] ${x.t}: ${x.n}`)])), months:c.list.map(k=>{ const P=c.periods[k]; return `${k}: lệnh ${P.orders.length} 621 ${f(P.sum621)} 622 ${f(P.sum622)} 627 ${f(P.sum627)} 155 ${f(P.c154NK)} GVHB ${f(P.sales.reduce((s,x)=>s+x.sl*x.gv,0))} DT ${f(P.doanhSo)} TPâm ${P.nxt.filter(x=>isFinal(itemMap()[x.ma])&&x.closeSL<-1e-9).length} NVLâm ${P.nxt.filter(x=>!isFinal(itemMap()[x.ma])&&x.closeSL<-1e-9).length} thiếu ${f(P.thieuTT)} bánGV0 ${P.sales.filter(s=>!s.gv).length}`; }), mv:moveMonths(), dc:dcMonths()}; });
 console.log(JSON.stringify(post,null,1)); console.log(errs); await b.close(); })();
