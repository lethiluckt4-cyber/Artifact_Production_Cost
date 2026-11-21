const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:1000}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(4000);
 await pg.evaluate(()=>{ selKy='2026-03'; const s=state.sales.find(r=>kyOf(r.ngay)==='2026-02'); view='canhbao'; document.querySelector('#main').dataset.cbt='kq'; render(); s.sl=num(s.sl)+5; const o=state.orders.find(o=>kyOf(o.ngayXuatNVL)==='2026-03'); o.ngaySX='2026-03-01'; o.ngayXuatNVL='2026-03-10'; calcCache=null; render(); });
 const box = (await pg.$$('.box'))[0]; await box.screenshot({path:'/home/claude/work/shots/opchk2.png'});
 await pg.click('[data-opgo="d_orders"]'); console.log('view sau bấm:', await pg.evaluate(()=>view));
 console.log('err', errs); await b.close(); })();
