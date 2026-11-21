const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(()=>{ const D=Date; const fixed=new D('2026-11-18T09:00:00+07:00').getTime(); window.Date=class extends D{ constructor(...a){ if(a.length) super(...a); else super(fixed);} static now(){return fixed;} }; });
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2000);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 const nap=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final_dk2026.json','utf8'));
 const R=await pg.evaluate(({docs,nap})=>{ fromDocs(docs); calcCache=null; closeModal(); const out={};
   const c=calc(); const it=itemMap(); const ks=c.list; const r0=x=>Math.round(x); const T=(a,f)=>a.reduce((s,x)=>s+(f(x)||0),0);
   out.ks=ks;
   // 1. NXT liên tục & cân
   const cont=[], bal=[], negEnd=[];
   ks.forEach((k,i)=>{ const P=c.periods[k]; P.nxt.forEach(x=>{ if (Math.abs(x.openSL+x.nhapSL-x.xuatSL-x.closeSL)>0.01 || Math.abs(x.openTT+x.nhapTT-x.xuatTT-x.closeTT)>2) bal.push(k+' '+x.ma);
       if (x.closeSL<-1e-6) negEnd.push(`${k} ${x.ma} ${(it[x.ma]||{}).nhom} SL ${x.closeSL.toFixed(2)} TT ${r0(x.closeTT)}`);
       if (i>0) { const pv=c.periods[ks[i-1]].nxt.find(z=>z.ma===x.ma); if (pv && (Math.abs(pv.closeSL-x.openSL)>0.01 || Math.abs(pv.closeTT-x.openTT)>2)) cont.push(k+' '+x.ma); } });
     });
   out.cont=cont.length; out.bal=bal.slice(0,10); out.negEnd=negEnd;
   // 2. Luồng chi phí
   out.flow=ks.map(k=>{ const P=c.periods[k]; return {k, n621:r0(P.sum621), n622:r0(P.sum622), n627:r0(P.sum627), c154:r0(P.sum154), ddDK:r0(P.ddDK), ddCK:r0(P.ddCK), nk155:r0(P.c154NK), chk154:r0(P.ddDK+P.sum154-P.ddCK-P.c154NK-(P.gcDD||0)), c622:r0(num((P.cost||{}).c622)), un622:r0(P.unalloc622||0), un627:r0(P.unalloc627||0), ds:r0(T(P.sales,s=>s.ds)), gv:r0(T(P.sales,s=>s.gv*s.sl+(s.gvAdj||0)*0)), lai:r0(P.lai||0), orders:P.orders.length, slNK:r0(P.slNK), qdNK:r0(P.qdNK), thieuTT:r0(P.thieuTT||0), ot:r0((c.otKy||{})[k]||0), bad:P.orders.filter(o=>o.status!=='Đủ').map(o=>o.maLenh+':'+o.status).slice(0,5)}; });
   // 3. Mua hàng: so với dữ liệu gốc
   const agg=rows=>{ const g={}; rows.forEach(r=>{ const x=g[r.ma]||(g[r.ma]={sl:0,tt:0,thue:0}); x.sl+=num(r.sl); x.tt+=num(r.tt); x.thue+=num(r.thueGTGT); }); return g; };
   const nP=[]; Object.keys(nap).filter(k=>k.startsWith('p_')).forEach(k=>nap[k].rows.forEach(r=>nP.push({ma:r[4], sl:r[5], tt:r[7], thueGTGT:r[11]})));
   const A=agg(state.purchases), B=agg(nP); out.muaLech=Object.keys({...A,...B}).filter(m=>{ const a=A[m]||{sl:0,tt:0,thue:0}, b=B[m]||{sl:0,tt:0,thue:0}; return Math.abs(a.sl-b.sl)>0.01||Math.abs(a.tt-b.tt)>1||Math.abs(a.thue-b.thue)>1; }).map(m=>m+' '+JSON.stringify(A[m])+' vs '+JSON.stringify(B[m]));
   const moved=state.purchases.filter(r=>r.ngayGoc && r.ngayGoc!==r.ngayNhap); out.moved=moved.map(r=>({ma:r.ma, hd:r.hoaDon, ngayHD:r.ngayMua, goc:r.ngayGoc, moi:r.ngayNhap, sl:num(r.sl), tt:num(r.tt), tach:!!r.tachTu, lech:dayDiff(r.ngayNhap, r.ngayMua||r.ngayNhap)}));
   out.movedNoGoc=state.purchases.filter(r=>!r.ngayGoc && r.ngayMua && Math.abs(dayDiff(r.ngayNhap,r.ngayMua))>0).map(r=>r.ma+' '+r.ngayMua+'→'+r.ngayNhap);
   // 4. Bán hàng so với gốc
   const nS=[]; Object.keys(nap).filter(k=>k.startsWith('s_')).forEach(k=>nap[k].rows.forEach(r=>nS.push(r)));
   out.ban={pm:state.sales.length, pmSL:T(state.sales,r=>num(r.sl)), pmDS:T(state.sales,r=>num(r.ds)), nap:nS.length, napSL:T(nS,r=>num(r[2])), napDS:T(nS,r=>num(r[4]))};
   // 5. Cân đối NVL
   const adj=state.adjustments; out.adjN=adj.length; out.adjNoOrder=adj.filter(a=>!state.orders.some(o=>o.ngaySX===a.ngaySX && o.maTP===a.maTP)).length; out.adjPos=adj.filter(a=>num(a.dieuChinh)>0).length; out.adjNguon=[...new Set(adj.map(a=>a.nguon||''))];
   const over=[]; ks.forEach(k=>{ const P=c.periods[k]; const g={}; P.lines.forEach(l=>{ if (num(l.dcTay)<0) g[l.maVT]=(g[l.maVT]||0)-num(l.dcTay); }); Object.entries(g).forEach(([ma,red])=>{ const x=P.nxt.find(z=>z.ma===ma)||{}; if (x.closeSL>0.01) over.push(`${k} ${ma} giảm ${red.toFixed(1)} nhưng tồn cuối còn ${x.closeSL.toFixed(1)}`); }); }); out.over=over;
   const adjByKy={}; ks.forEach(k=>{ const P=c.periods[k]; adjByKy[k]={dong:P.lines.filter(l=>num(l.dcTay)<0).length, sl:T(P.lines,l=>Math.min(0,num(l.dcTay))), tt:r0(T(P.lines,l=>Math.min(0,num(l.dcTay))*l.dg))}; }); out.adjByKy=adjByKy;
   // 6. Lệnh SX
   const os=state.orders; out.ord={n:os.length, nguon:[...new Set(os.map(o=>o.nguon))], loai:os.reduce((g,o)=>(g[o.loaiLenh]=(g[o.loaiLenh]||0)+1,g),{})};
   out.ddhMT=os.filter(o=>o.loaiLenh==='MT' && ((it[o.maTP]||{}).dong==='DDH' || String((it[o.maTP]||{}).nhom||'').includes('DDH'))).map(o=>o.maLenh+' '+o.maTP);
   out.hhSX=os.filter(o=>isHH(it[o.maTP])).map(o=>o.maLenh);
   out.xuatSauNK=os.filter(o=>o.ngayXuatNVL>o.ngaySX).map(o=>o.maLenh);
   out.cutLong=os.filter(o=>dayDiff(o.ngayXuatNVL,o.ngaySX)<-31).map(o=>o.maLenh);
   const tre=[]; ks.forEach(k=>(c.periods[k].orders||[]).filter(o=>o.tre).forEach(o=>tre.push(o.maLenh+' cần '+o.ngaySX+' xong '+o.ngayHT))); out.tre=tre;
   out.sau17=os.filter(o=>o.ngayXuatNVL>'2026-11-18').map(o=>o.maLenh+' '+o.ngayXuatNVL);
   // 7. opChecks + luồng
   selKy='2026'; calcCache=null; const D=cbData(); out.ops=D.opFail.filter(x=>x.n).map(x=>`[${x.lvl}] ${x.t}: ${x.n} | ${x.list.slice(0,4).join(' ; ')}`);
   const LI=luongIssues(); out.luong=Object.entries(LI).map(([n,a])=>n+': '+a.map(x=>`[${x.lvl}] ${x.t} (${x.n})`).join(' | '));
   out.dxStale=null;
   // 8. Giá thành đơn vị theo TP & tháng, bán dưới giá vốn
   const uc={}; ks.forEach(k=>{ const P=c.periods[k]; Object.entries(P.unitCost||{}).forEach(([ma,v])=>{ if (isFinal(it[ma]) && v>0) (uc[ma]=uc[ma]||{})[k]=r0(v); }); });
   const disp=[]; Object.entries(uc).forEach(([ma,m])=>{ const v=Object.values(m); const mn=Math.min(...v), mx=Math.max(...v); if (v.length>1 && mx>mn*1.6) disp.push(`${ma}: ${mn}–${mx} (${Object.entries(m).map(([k,x])=>k.slice(5)+':'+x).join(', ')})`); }); out.ucDisp=disp;
   const below=[]; ks.forEach(k=>c.periods[k].sales.forEach(s=>{ if (s.gb && s.gv>s.gb) below.push(`${k} ${s.ma} giá bán ${r0(s.gb)} < GV ${r0(s.gv)}`); })); out.below=below;
   // 9. Năm
   out.year={ds:r0(T(ks,k=>T(c.periods[k].sales,s=>s.ds))), c621:r0(T(ks,k=>c.periods[k].sum621)), c622:r0(T(ks,k=>c.periods[k].sum622)), c627:r0(T(ks,k=>c.periods[k].sum627)), nk:r0(T(ks,k=>c.periods[k].c154NK)), lai:r0(T(ks,k=>c.periods[k].lai||0))};
   const last=c.periods[ks[ks.length-1]]; out.tonCuoi={nvl:r0(T(last.nxt.filter(x=>!isFinal(it[x.ma])),x=>x.closeTT)), tp:r0(T(last.nxt.filter(x=>isFinal(it[x.ma])),x=>x.closeTT)), dd:r0(last.ddCK)};
   const op=state.opening; out.opening={ky:op.ky, n:Object.keys(op.rows).length, tt:r0(Object.values(op.rows).reduce((s,x)=>s+num(x.tt),0))};
   return out; }, {docs,nap});
 fs.writeFileSync('/home/claude/work/audit/result.json', JSON.stringify(R,null,1)); console.log('errs',errs); await b.close(); })();
