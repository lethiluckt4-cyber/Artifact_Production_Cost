const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const errs=[];
 for (const w of [1440, 1000]) { const pg=await b.newPage({viewport:{width:w,height:800}}); pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
  await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='d_items'; render(); }); await pg.click('#selAll'); await pg.waitForTimeout(100);
  const ov=await pg.evaluate(()=>{ const r=a=>a.getBoundingClientRect(); const d=r($('#delSel')), q=r($('#q')), k=r(document.querySelector('.toolbar .ksel')); const hit=(a,b)=>!(a.right<=b.left||a.left>=b.right||a.bottom<=b.top||a.top>=b.bottom); return {canhTim: Math.abs(d.top-q.top)<6 && d.left>q.left, deKy: hit(d,k), trongTrai: !!$('#delSel').closest('.tbl-l')}; });
  console.log(w, JSON.stringify(ov)); await pg.screenshot({path:`/home/claude/work/shots/dsel_${w}.png`, clip:{x:236,y:0,width:w-236,height:220}}); await pg.close(); }
 console.log('errs', errs); await b.close(); })();
