const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='thietlap'; document.querySelector('#main').dataset.tlt='pb'; render(); }); await pg.waitForTimeout(200);
 const st=()=>pg.evaluate(()=>({khoa:document.querySelector('#alTs').disabled, nut:[...document.querySelectorAll('#main .box .bar .btn')].map(b=>b.textContent.trim()).join(',')}));
 console.log('Mở:', JSON.stringify(await st())); await pg.screenshot({path:'/home/claude/work/shots/al2.png', clip:{x:236,y:160,width:700,height:180}});
 await pg.click('#alE'); console.log('Sửa:', JSON.stringify(await st()));
 await pg.selectOption('#alTs','SL'); await pg.click('#alSave'); await pg.waitForTimeout(150); console.log('Lưu:', JSON.stringify(await st()), (await pg.evaluate(()=>state.settings.alloc.cds[0].ts)));
 await pg.click('#alE'); await pg.selectOption('#alTs','QD'); await pg.click('#alC'); console.log('Hủy:', JSON.stringify(await st()), await pg.evaluate(()=>state.settings.alloc.cds[0].ts));
 console.log('errs', errs); await b.close(); })();
