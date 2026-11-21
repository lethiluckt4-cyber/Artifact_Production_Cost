const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1200,height:800}})).newPage();
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const views=await pg.evaluate(()=>NAV.filter(x=>x.id).map(x=>x.id));
 const res=[];
 for (const v of views) { const r=await pg.evaluate(v=>{ selKy='2026-06'; view=v; render(); const out=[]; document.querySelectorAll('#main .tw > table').forEach((t,i)=>{ const ths=[...t.querySelectorAll('thead th')]; const fz=ths.filter(h=>h.classList.contains('fz')).map(h=>ths.indexOf(h)); const tw=t.parentElement; out.push({i, n:ths.length, fz:fz.join(','), df:t.dataset.freeze||'', first:(ths[0]||{}).textContent.replace('▼','').trim().slice(0,18), scroll: t.scrollWidth>tw.clientWidth+2}); }); return out; }, v);
   r.forEach(x=>res.push(v+' '+JSON.stringify(x))); }
 console.log(res.join('\n')); await b.close(); })();
