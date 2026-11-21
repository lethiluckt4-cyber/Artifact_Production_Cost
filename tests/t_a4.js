const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 console.log(await pg.evaluate(()=>{ calcCache=null; const c=calc(); const items=itemMap(); const f=Math.round; const L=[];
   // tổng giá trị vào/ra toàn năm: tồn đầu năm + mua + phí GC (dịch vụ là NVL) + 622+627 = 621+... simplified: value conservation of inventory system
   let leak=0, n=0; const det=[];
   c.list.forEach(k=>{ const P=c.periods[k]; P.nxt.forEach(x=>{ if (x.closeSL===0) { const r=x.openTT+x.nhapTT-x.xuatTT; if (Math.abs(r)>1) { leak+=r; n++; det.push(`${k} ${x.ma} ${f(r)}`); } } }); });
   L.push(`Giá trị mất khi tồn SL về 0: ${n} lần, tổng ${f(leak)} – ${det.slice(0,8).join('; ')}`);
   const odd=[]; c.list.forEach(k=>{ const P=c.periods[k]; P.nxt.forEach(x=>{ if (x.closeSL>1e-6) { const u=x.closeTT/x.closeSL; const g=x.gv||0; if (g>0 && (u<0 || Math.abs(u-g)/g>0.5)) odd.push(`${k} ${x.ma} tồn ${x.closeSL} đơn giá tồn ${f(u)} vs giá xuất ${f(g)}`); } }); });
   L.push(`Đơn giá tồn cuối lệch >50% so giá xuất: ${odd.length} – ${odd.slice(0,10).join('; ')}`);
   return L.join('\n'); }));
 await b.close(); })();
