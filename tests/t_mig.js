const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1400,height:900}}); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 const toast=await pg.evaluate(()=>document.body.innerText.match(/Đã áp dụng quy tắc lô mới[^\n]*/)?.[0]);
 const r=await pg.evaluate(()=>{ const c={}; state.orders.forEach(o=>{ const k=o.loaiLenh; c[k]=c[k]||{n:0,sl:0}; c[k].n++; c[k].sl+=num(o.slKH); }); const sx=state.orders.filter(o=>o.loaiLenh==='SX'); return {flag:state.settings.loCat, dx:state.settings.daDeXuat.length, c, sx100: sx.every(o=>num(o.slKH)%100===0), maxKy: state.orders.map(o=>kyDXof(o)).sort().pop()}; });
 console.log(toast); console.log(JSON.stringify(r));
 // giá thành & NXT không lỗi, không âm kho bất thường
 const k=await pg.evaluate(()=>{ calcCache=null; const c=calc(); const am=Object.values(c.periods).flatMap(P=>P.nxt).filter(x=>x.closeSL<-1e-6).map(x=>x.ma+'@'+x.ky); const P6=c.periods['2026-06']; return {am:am.slice(0,10), nAm:am.length, lenhT6:P6.orders.length, gt154:Math.round(P6.sum154), ddCK:Math.round(P6.ddCK)}; }); console.log(JSON.stringify(k));
 // tải lại: không chạy lại lần 2
 await pg.waitForTimeout(1500); await pg.reload(); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 console.log('Sau tải lại:', JSON.stringify(await pg.evaluate(()=>({n:state.orders.length, flag:state.settings.loCat}))));
 console.log('errs', errs); await b.close(); })();
