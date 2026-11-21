const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 const out=await pg.evaluate(()=>{ calcCache=null; const c=calc(); const items=itemMap(); const R=[]; const f=v=>Math.round(v);
  let prev=null;
  c.list.forEach(k=>{ const P=c.periods[k]; const nx={}; P.nxt.forEach(x=>nx[x.ma]=x);
    // R1: xuất SX theo NXT (giaVon) vs 621
    let xSX=0, xBan=0, xChung=0, xGC=0; const UU=P.uUsed||{}; for (const ma in P.xuatSX) xSX+=P.xuatSX[ma]*(P.giaVon[ma]||0)+((isProd(items[ma])||isFinal(items[ma]))?0:(UU[ma]||0)); for (const ma in UU) if (isFinal(items[ma])||isProd(items[ma])) xBan+=UU[ma];
    for (const ma in P.xuatBan) xBan+=P.xuatBan[ma]*(P.giaVon[ma]||0);
    for (const ma in P.xuatChung) xChung+=P.xuatChung[ma]*(P.giaVon[ma]||0);
    const gvhb=P.sales.reduce((s,x)=>s+x.sl*x.gv,0);
    const chung=(P.issues||[]).reduce((s,x)=>s+x.tt,0);
    const nhapSX=Object.values(P.nhapSX).reduce((s,x)=>s+x.tt,0);
    // R4: open = prev close
    let gap=0, gapN=0; if (prev) { P.nxt.forEach(x=>{ const pc=prev[x.ma]; const d=x.openTT-(pc?pc.closeTT:0); if (Math.abs(d)>1) { gap+=d; gapN++; } }); }
    // R5: open+nhập-xuất=close
    let eq=0; P.nxt.forEach(x=>{ const d=x.openTT+x.nhapTT-x.xuatTT-x.closeTT; if (Math.abs(d)>1) eq+=d; });
    // TP bán giá vốn 0
    const gv0=P.sales.filter(s=>!s.gv).reduce((a,s)=>a+s.sl,0); const gv0n=new Set(P.sales.filter(s=>!s.gv).map(s=>s.ma)).size;
    const negGV=Object.entries(P.giaVon).filter(([m,v])=>v<0).map(([m])=>m);
    const negClose=P.nxt.filter(x=>x.closeSL<-1e-9 && x.closeTT>1).length, posSLnegTT=P.nxt.filter(x=>x.closeSL>1e-9 && x.closeTT<-1).map(x=>x.ma);
    const gc=(P.gcNhan||[]).reduce((s,x)=>s+x.tt-(x.vGui||0)-(x.vDV||0),0);
    R.push({k, '621':f(P.sum621), 'NXT_xuatSX':f(xSX), 'lệch621':f(xSX-P.sum621), '154flow':f(P.ddDK+P.sum154-P.ddCK-P.c154NK), 'nhapSX-155':f(nhapSX-P.c154NK), 'GVHB':f(gvhb), 'NXT_xuatBan':f(xBan), 'lệchGV':f(xBan-gvhb), 'chung':f(chung), 'NXT_xuatChung':f(xChung), 'lệchChung':f(xChung-chung), 'unalloc':f(P.unalloc622+P.unalloc627), 'open≠close':gapN+'/'+f(gap), 'cânPT':f(eq), 'bánGV0':gv0n+' mã/'+gv0+' SP', negGV:negGV.length, posSLnegTT, gcLech:f(gc)});
    prev=nx; });
  return R; });
 out.forEach(r=>console.log(JSON.stringify(r)));
 await b.close(); })();
