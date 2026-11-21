const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='banhang'; selKy='2026'; render(); });
 console.log('Màu mã:', await pg.evaluate(()=>{ const td=document.querySelector('#main tbody tr[data-i] td.lnkc'); return td?getComputedStyle(td).color+' '+td.textContent:'không'; }));
 await pg.click('#main tbody tr[data-i] td.lnkc'); await pg.waitForTimeout(300);
 console.log('Mở:', await pg.evaluate(()=>{ const h=document.querySelector('#modal h3'); return h?h.textContent:'không'; }), '| số dòng thẻ kho:', await pg.evaluate(()=>document.querySelectorAll('#modal tbody tr').length));
 console.log('errs', errs); await b.close(); })();
