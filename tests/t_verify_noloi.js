// Đối chiếu số liệu phần mềm với file Excel Giá thành Thiên Hồng (giá trị đã lưu trong Excel)
const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8')); const exp=JSON.parse(fs.readFileSync(DATA('doi_chieu_excel_2026_expected.json'),'utf8'));
 const out = await pg.evaluate(([seed])=>{ try { app.importDocs(seed); } catch(e){ } state.settings.spLoi=[]; calcCache=null; const c=app.calc(); const r={}; for (const ky of c.list) { const p=c.periods[ky]; r[ky]={nxt:Object.fromEntries(p.nxt.map(x=>[x.ma,{openSL:x.openSL,openTT:x.openTT,nhapSL:x.nhapSL,nhapTT:x.nhapTT,xuatSL:x.xuatSL,xuatTT:x.xuatTT,gv:x.gv,closeSL:x.closeSL,closeTT:x.closeTT,pBQ:x.pBQ}])), tp621:p.sum621Of?0:0, orders:p.orders.map(o=>({maLenh:o.maLenh, ma:o.maTP, sl:o.slTH, c621:o.c621, c622:o.c622, c627:o.c627, c154:o.c154, cd:o.cd, lines:o.lines.map(l=>[l.maVT,l.tong,l.dg])})), c622:p.cp.c622, c627:p.cp.c627, gas:p.cp.gas, ds:p.doanhSo}; } return {r, th:Object.fromEntries(app.state.orders.map(o=>[o.maLenh, c.TH[o._id]]))}; }, [seed]);
 // so sánh
 let worst=[]; const cmp=(lab,a,b,tol)=>{ const d=Math.abs((a||0)-(b||0)); const rel=d/Math.max(1,Math.abs(b||0)); if (d>tol && rel>1e-9) worst.push([lab,a,b,d]); };
 for (const ky in exp.tonkho) { const P=out.r[ky]; if(!P){ console.log('thiếu kỳ',ky); continue; } for (const ma in exp.tonkho[ky]) { const e=exp.tonkho[ky][ma], g=P.nxt[ma]||{}; for (const f of ['openSL','nhapSL','xuatSL','closeSL']) cmp(`${ky} ${ma} ${f}`, g[f], e[f], 1e-6); for (const f of ['openTT','nhapTT','xuatTT','closeTT']) cmp(`${ky} ${ma} ${f}`, g[f], e[f], 0.5); if (e.pBQ!=null) cmp(`${ky} ${ma} pBQ`, g.pBQ, e.pBQ, 1e-4); }
   const cp=exp.cp[ky]; const tp621=P.orders.filter(o=>o.cd==='TP').reduce((s,o)=>s+o.lines.filter(l=>!l[0].startsWith('BTP_')).reduce((a,l)=>a+l[1]*l[2],0),0); const btp621=P.orders.filter(o=>o.cd!=='TP').reduce((s,o)=>s+o.lines.filter(l=>!l[0].startsWith('BTP_')).reduce((a,l)=>a+l[1]*l[2],0),0);
   cmp(`${ky} 621/TP`, tp621, cp.tp621, 0.5); cmp(`${ky} 621/BTP`, btp621, cp.btp621, 0.5); cmp(`${ky} 627`, P.c627, cp.c627, 0.5); cmp(`${ky} gas`, P.gas, cp.gas, 0.5); cmp(`${ky} doanh thu`, P.ds, cp.dt, 0.5);
   cmp(`${ky} 154 BGKT`, P.orders.filter(o=>o.ma==='BTP_BGKT').reduce((s,o)=>s+o.c154,0), cp.bgkt154, 0.5);
 }
 // theo lệnh
 const map={}; exp.lsx.forEach(x=>map[x.maLenh]=x); const allOrd={}; Object.values(out.r).forEach(P=>P.orders.forEach(o=>allOrd[o.maLenh]=o));
 let nOrd=0; for (const x of exp.lsx) { const e = exp.btp[String(x.excel)] || exp.tp[String(x.excel)]; const g=allOrd[x.maLenh]; if (!e||!g) { if (x.slTH) worst.push(['thiếu lệnh', x.maLenh, x.excel]); continue; } nOrd++; cmp(`lệnh ${x.maLenh}/${x.excel} SL`, g.sl, x.slTH, 1e-9); for (const f of ['c621','c622','c627','c154']) cmp(`lệnh ${x.maLenh}/${x.excel} ${f}`, g[f], e[f], 0.5); }
 console.log('kỳ:', Object.keys(out.r).join(','), '· số lệnh đối chiếu:', nOrd);
 console.log('Số chỉ tiêu lệch:', worst.length); worst.sort((a,b)=>String(a[0]).localeCompare(String(b[0]))); console.log(worst.slice(0,40).map(x=>x.join(' | ')).join('\n'));
 console.log('errs', errs.slice(0,5));
 await b.close(); })();
