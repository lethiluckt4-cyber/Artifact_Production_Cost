const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1400,height:900}})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const r=0;
 console.log(JSON.stringify(r));
 // TP bán nhiều: tìm mã có bán + lệnh DDH
 const ma=await pg.evaluate(()=>{ const c=calc(); const P=c.periods['2026-06']; const cnt={}; P.sales.forEach(s=>cnt[s.ma]=(cnt[s.ma]||0)+1); return Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0]; });
 await pg.evaluate(ma=>{ selKy='2026'; view='nxt'; search=ma; render(); }, ma);
 const blue=await pg.evaluate(()=>{ const td=document.querySelector('#main td.lnkc'); return td?getComputedStyle(td).color+' '+td.textContent:'none'; }); console.log('Mã xanh:', blue);
 await pg.screenshot({path:'/home/claude/work/shots/kh_nxt.png'});
 await pg.click('#main td.lnkc'); await pg.waitForTimeout(300);
 const t=await pg.evaluate(()=>document.querySelector('#modal').innerText); console.log(t.replace(/\n+/g,' | ').slice(0,1500));
 await pg.screenshot({path:'/home/claude/work/shots/kh_detail.png'});
 const [dl]=await Promise.all([pg.waitForEvent('download'), pg.click('#ndXl')]); await dl.saveAs('/home/claude/work/shots/thekho.xlsx');
 await pg.evaluate(()=>{ closeModal(); search=''; view='d_customers'; render(); }); await pg.screenshot({path:'/home/claude/work/shots/kh_grid.png'});
 // sales grid onEdit via grid config

 console.log('errs', errs); await b.close(); })();
