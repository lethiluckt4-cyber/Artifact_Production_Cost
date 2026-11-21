const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1600,height:900}})).newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const TABS = {canhbao:['cbt',['kq','ng']], thietlap:['tlt',['tl','cal','pb']], kehoach:['ktab',['kh','lenh','dc']], giathanh:['tab',['lenh','nvl','tp','th','xl']], xuatphieu:['ptab',['xk','nk','xg','ng']]};
 const views = await pg.evaluate(()=>NAV.filter(x=>x.id).map(x=>x.id).concat(['d_sales']));
 for (const v of views) { if (v==='huongdan') continue; for (const t of (TABS[v]?TABS[v][1]:[null])) {
   const r=await pg.evaluate(([v,t,k])=>{ selKy='2026-06'; view=v; const m=document.querySelector('#main'); if (t) m.dataset[k]=t; m.dataset.khDetail='1'; render(); const out=[]; m.querySelectorAll('.note, .small, div.mut, .hint, .pill, a').forEach(el=>{ if (el.closest('table')) return; const tx=el.innerText.replace(/\s+/g,' ').trim(); if (tx.length>(el.classList.contains('pill')||el.tagName==='A'?25:40)) out.push(el.className+' :: '+tx.slice(0,220)); }); return out; }, [v,t,t?TABS[v][0]:'']);
   if (r.length) { console.log('## '+v+(t?'/'+t:'')); r.forEach(x=>console.log('  - '+x)); } } }
 await b.close(); })();
