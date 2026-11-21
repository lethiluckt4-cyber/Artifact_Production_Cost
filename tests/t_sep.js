const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 console.log(await pg.evaluate(()=>{ selKy='2026-09'; calcCache=null; const c=calc(); const p=c.periods['2026-09']; const am=p.nxt.filter(x=>x.closeSL<-1e-9).map(x=>[x.ma,x.closeSL]);
   const pur=['THUN','TEM_LAV','TUZI'].map(ma=>ma+': '+state.purchases.filter(r=>r.ma===ma).map(r=>`${r.ngayNhap}/${r.ngayMua}:${r.sl}`).join(' ')).join(' || ');
   const ls=p.lines.filter(l=>['THUN','TEM_LAV','TUZI'].includes(l.maVT)).map(l=>[l.maVT,l.ngayXuatNVL,l.tong,l.tonTruoc,l.tonSau,l.dg]);
   return JSON.stringify({orders:p.orders.length, s621:p.sum621, nk:p.c154NK, am, mv:buildMoveProposal('2026-09').rows.length, pur, ls, neg:p.lines.filter(l=>l.tt<0).slice(0,5).map(l=>[l.maVT,l.tong,l.dg,l.tt])}); }));
 await b.close(); })();
