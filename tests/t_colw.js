const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1400,height:900}}); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 for (const v of ['nxt','d_purchases','d_items']) {
 await pg.evaluate(v=>{ selKy='2026-06'; view=v; render(); }, v); await pg.waitForTimeout(200);
 const h=await pg.$$('#main .tw > table thead th .xrs'); const bx=await h[1].boundingBox(); await pg.mouse.move(bx.x+2,bx.y+5); await pg.mouse.down(); await pg.mouse.move(bx.x+122,bx.y+5,{steps:5}); await pg.mouse.up(); await pg.waitForTimeout(100);
 const w1=await pg.evaluate(()=>Math.round(document.querySelectorAll('#main .tw > table thead th')[1].getBoundingClientRect().width));
 // đổi màn hình rồi quay lại, rồi xóa localStorage + tải lại (chỉ còn lưu trong dữ liệu)
 await pg.evaluate(()=>{ view='tongquan'; render(); }); await pg.evaluate(v=>{ view=v; render(); }, v); const w2=await pg.evaluate(()=>Math.round(document.querySelectorAll('#main .tw > table thead th')[1].getBoundingClientRect().width));
 await pg.waitForTimeout(1500); await pg.evaluate(()=>{ localStorage.removeItem('dv_uiColW'); }); await pg.reload(); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.evaluate(v=>{ selKy='2026-06'; view=v; render(); }, v); await pg.waitForTimeout(300);
 const w3=await pg.evaluate(()=>Math.round(document.querySelectorAll('#main .tw > table thead th')[1].getBoundingClientRect().width));
 console.log(v, 'kéo', w1, '· đổi màn hình', w2, '· tải lại (lưu trong dữ liệu)', w3); }
 console.log(await pg.evaluate(()=>JSON.stringify(state.settings.uiColW)));
 console.log('errs', errs); await b.close(); })();
