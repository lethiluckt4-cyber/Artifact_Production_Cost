const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 await pg.evaluate(()=>document.querySelectorAll('.toast').forEach(t=>t.remove()));
 const shot=async(v,f)=>{ await pg.evaluate(v=>{ view=v; render(); document.querySelectorAll('.toast').forEach(t=>t.remove()); }, v); await pg.waitForTimeout(250); await pg.screenshot({path:`/home/claude/work/shots/${f}.png`, clip:{x:236,y:0,width:1204,height:260}}); };
 await shot('d_purchases','lay1'); await shot('d_items','lay2'); await shot('canhbao','lay3'); await shot('nxt','lay4'); await shot('d_costs','lay5');
 // Kỳ riêng từng menu
 const ky=()=>pg.evaluate(()=>selKy);
 await pg.evaluate(()=>{ view='tongquan'; render(); }); const a=await ky();
 await pg.evaluate(()=>{ view='d_purchases'; render(); }); const b1=await ky();
 await pg.selectOption('#selM', '03'); await pg.waitForTimeout(200); const b2=await ky();
 await pg.evaluate(()=>{ view='nxt'; render(); }); const c1=await ky();
 await pg.evaluate(()=>{ view='d_purchases'; render(); }); const b3=await ky();
 await pg.evaluate(()=>{ view='tongquan'; render(); }); const a2=await ky();
 console.log({tongquan:a, mua_mac_dinh:b1, mua_doi:b2, nxt:c1, mua_quay_lai:b3, tongquan_lai:a2});
 console.log('errs', errs); await b.close(); })();
