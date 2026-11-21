const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 const r=await pg.evaluate(()=>{ const d=buildMoveProposal('2026-02'); const ex=d.rows.slice(0,3).map(x=>({ma:x.ma,d:x.d,q:x.q,ln:x.maLenh})); applyMoveCore(d.rows); calcCache=null; const c=calc(); const p=c.periods['2026-02'];
   const ls=p.lines.filter(l=>l.maVT==='TEM_SPN').map(l=>[l.ngayXuatNVL,l.tong,l.tonTruoc,l.tonSau,l.thieuSL]).slice(0,8);
   const pur=state.purchases.filter(x=>x.ma==='TEM_SPN').map(x=>[x.ngayNhap,x.sl]);
   const d2=buildMoveProposal('2026-02'); return {ex, ls, pur, again:d2.rows.slice(0,3).map(x=>[x.ma,x.d,x.q,x.r.ngayNhap])}; });
 console.log(JSON.stringify(r)); await b.close(); })();
