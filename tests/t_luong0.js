const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1300,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(4000);
 for (const k of ['2026','2026-06','2026-01-05..2026-02-10']) { await pg.evaluate(k=>{ view='luong'; selKy=k; render(); }, k); await pg.waitForTimeout(200); console.log(k, await pg.evaluate(()=>document.querySelectorAll('[data-fn]').length + ' ' + (document.querySelector('#main').textContent.includes('bị lỗi')?'LỖI':'ok'))); }
 await pg.evaluate(()=>{ Object.keys(state).forEach(k=>{ if (Array.isArray(state[k])) state[k]=[]; }); changed(); view='luong'; selKy='2026'; render(); }); await pg.waitForTimeout(400);
 console.log('empty', await pg.evaluate(()=>document.querySelector('#main').textContent.slice(0,200)));
 console.log(errs); await b.close(); })();
