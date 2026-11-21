const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}});
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ view='d_purchases'; selKy='2026-03'; render(); const tw=document.querySelector('#main .tw'); tw.scrollLeft=99999; }); await pg.waitForTimeout(300);
 const tw=await pg.$('#main .tw'); await tw.screenshot({path:'/home/claude/work/shots/ic5.png'});
 await pg.evaluate(()=>{ const id=state.purchases.find(r=>kyOf(r.ngayNhap)==='2026-03')._id; editRow=id; render(); document.querySelector('#main .tw').scrollLeft=99999; }); await pg.waitForTimeout(300);
 await (await pg.$('#main .tw')).screenshot({path:'/home/claude/work/shots/ic6.png'});
 await b.close(); })();
