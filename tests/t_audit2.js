const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(()=>{ const D=Date; const fixed=new D('2026-11-18T09:00:00+07:00').getTime(); window.Date=class extends D{ constructor(...a){ if(a.length) super(...a); else super(fixed);} static now(){return fixed;} }; });
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(1500);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 const R=await pg.evaluate(docs=>{ fromDocs(docs); calcCache=null; closeModal(); const c=calc(); const it=itemMap(); const ks=c.list; const out={};
   const last=c.periods['2026-10']; const l11=c.periods['2026-11'];
   out.nvl=l11.nxt.filter(x=>!isFinal(it[x.ma]) && Math.abs(x.closeTT)>1e6).sort((a,b)=>b.closeTT-a.closeTT).map(x=>`${x.ma} ${x.closeSL.toFixed(0)} ${Math.round(x.closeTT/1e6*10)/10}tr`);
   out.tp=l11.nxt.filter(x=>isFinal(it[x.ma]) && x.closeTT>5e6).sort((a,b)=>b.closeTT-a.closeTT).map(x=>`${x.ma} ${x.closeSL.toFixed(0)} ${Math.round(x.closeTT/1e6*10)/10}tr`);
   // cân đối theo mã cả năm (SL, giá trị theo giá gần nhất)
   const g={}; ks.forEach(k=>{ const P=c.periods[k]; P.lines.forEach(l=>{ const d=num(l.dcTay); if (d<0) { const x=g[l.maVT]||(g[l.maVT]={sl:0,tt:0,tt0:0}); x.sl+=d; const pr=l.dg||0; x.tt+=d*pr; } }); });
   // giá tham chiếu = giá mua BQ cả năm
   const pm={}; state.purchases.forEach(r=>{ const x=pm[r.ma]||(pm[r.ma]={sl:0,tt:0}); x.sl+=num(r.sl); x.tt+=num(r.tt); });
   out.adjMa=Object.entries(g).map(([ma,x])=>{ const p=pm[ma]&&pm[ma].sl?pm[ma].tt/pm[ma].sl:0; return `${ma}: giảm ${(-x.sl).toFixed(0)} ${(it[ma]||{}).dvt} · ghi nhận ${Math.round(-x.tt/1e5)/10}tr · theo giá mua BQ ${Math.round(-x.sl*p/1e5)/10}tr`; });
   out.adjTotRef=Math.round(Object.entries(g).reduce((s,[ma,x])=>{ const p=pm[ma]&&pm[ma].sl?pm[ma].tt/pm[ma].sl:0; return s-x.sl*p; },0));
   // nhu cầu NVL theo định mức cả năm vs mua+tồn đầu
   const need={}; ks.forEach(k=>c.periods[k].lines.forEach(l=>{ need[l.maVT]=(need[l.maVT]||0)+num(l.slDM); }));
   const op=state.opening.rows; out.cung=Object.keys(need).sort().map(ma=>`${ma}: cần theo ĐM ${need[ma].toFixed(0)} · tồn đầu+mua ${(num((op[ma]||{}).sl)+((pm[ma]||{}).sl||0)+(ma==='VAI_IN'?state.gc.reduce((s,x)=>s+num(x.slNhan),0):0)).toFixed(0)}`);
   // sản xuất vs bán (bộ chuẩn) theo tháng, MT
   out.sxBan=ks.map(k=>{ const P=c.periods[k]; const ban=P.sales.reduce((s,x)=>s+x.sl*(num((it[x.ma]||{}).heSo)||1),0); const mt=state.orders.filter(o=>o.loaiLenh==='MT' && kyOf(o.ngaySX)===k).reduce((s,o)=>s+num(o.slKH)*(num((it[o.maTP]||{}).heSo)||1),0); return `${k}: NK ${Math.round(P.qdNK)} · bán ${Math.round(ban)} · MT ${Math.round(mt)}`; });
   // 622 / bộ chuẩn
   out.r622=ks.map(k=>{ const P=c.periods[k]; return `${k}: ${P.qdNK?Math.round(P.sum622/P.qdNK):0}`; }).join(' · ');
   out.gm=ks.map(k=>{ const P=c.periods[k]; const ds=P.sales.reduce((s,x)=>s+num(x.ds),0); return `${k}: ${ds?Math.round((P.lai||0)/ds*1000)/10:0}%`; }).join(' · ');
   out.gc=state.gc.map(x=>JSON.stringify(x));
   return out; }, docs);
 Object.entries(R).forEach(([k,v])=>{ console.log('== '+k); (Array.isArray(v)?v:[v]).forEach(x=>console.log('  '+x)); }); console.log('errs',errs); await b.close(); })();
