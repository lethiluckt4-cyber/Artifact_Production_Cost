const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2000);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final.json','utf8')); delete docs._nap; docs.settings=JSON.parse(fs.readFileSync('settings_live.json','utf8'));
 await pg.evaluate(d=>{ fromDocs(d); calcCache=null; closeModal(); view='nxt'; selKy='2026'; render(); }, docs); await pg.waitForTimeout(800);
 console.log(await pg.evaluate(()=>[cellNum('(70,00)'), cellNum('(1.234.567)'), cellNum('12,5%'), cellNum('(12,5%)'), cellNum('1.234')]));
 const ths=await pg.$$('#main table thead th'); let idx=-1; for (let i=0;i<ths.length;i++){ const t=await ths[i].innerText(); if (t.includes('Tồn cuối SL')) { idx=i; break; } }
 const btn=await ths[idx].$('button, .xf-b, .xfb'); await (btn||ths[idx]).click(); await pg.waitForTimeout(300);
 console.log(await pg.evaluate(()=>{ const m=document.querySelector('.xf-menu, .xfm, [class*=xf]'); return document.body.innerText.match(/Lọc theo (số|văn bản)/g); }));
 console.log('errs',errs); await b.close(); })();
