const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2500);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final_dk2026.json','utf8')); delete docs._nap; docs.settings=JSON.parse(fs.readFileSync('settings_live.json','utf8'));
 const n=await pg.evaluate(d=>{ fromDocs(d); state.cal=[]; [['2026-01-10','TP_BBN','VAI_DKCG_1',-12.5],['2026-01-12','TP_BNR','VAI_DKCG_1',30],['2026-02-05','TP_BBN','TUZI',5],['2026-03-05','TP_QBN','VALO',-3]].forEach(([d,tp,vt,q])=>state.adjustments.push({_id:'t'+Math.random(),ngaySX:d,maTP:tp,maVT:vt,dieuChinh:q,lyDo:'test',nguon:''})); changed(); calcCache=null; render(); return state.adjustments.length; }, docs); console.log('adj rows',n);
 await pg.locator('[data-v="d_adjustments"]').first().click(); await pg.waitForTimeout(600);
 console.log('tabs', await pg.$$eval('#main [data-adt]',x=>x.map(e=>e.textContent+(e.classList.contains('act')?'*':''))));
 await pg.locator('#main [data-adt="th"]').click(); await pg.waitForTimeout(800);
 console.log(await pg.$$eval('#main table thead th',x=>x.map(e=>e.textContent).join(' | ')));
 console.log(await pg.$$eval('#main table tbody tr',x=>x.slice(0,4).concat(x.slice(-1)).map(e=>e.innerText.replace(/\t/g,' | '))));
 const chk=await pg.evaluate(()=>{ const s=state.adjustments.filter(r=>selHas(r.ngaySX)).reduce((a,r)=>a+num(r.dieuChinh),0); return {selKy, s}; }); console.log(chk);
 await pg.screenshot({path:'/home/claude/work/adjsum.png'});
 const tr=await pg.$('#main table tbody tr[data-i="0"]'); if (tr){ await tr.click(); await pg.waitForTimeout(600); console.log('after click', await pg.evaluate(()=>[document.querySelector('#main').dataset.adt, document.querySelector('#q').value])); }
 console.log('errs',errs); await b.close(); })();
