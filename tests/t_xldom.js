const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2000);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final_dk2026.json','utf8')); delete docs._nap; docs.settings=JSON.parse(fs.readFileSync('settings_live.json','utf8'));
 docs.settings.uiHide={d_purchases:['Ghi chú','Kho']};
 await pg.evaluate(d=>{ fromDocs(d); calcCache=null; closeModal(); window.__xl=[]; const o=saveWb; saveWb=(wb,name)=>{ window.__xl.push({name, aoa:wb.Sheets[wb.SheetNames[0]]._aoa}); }; }, docs);
 for (const v of ['d_purchases','d_sales','d_orders','d_bom','d_items','d_gc','d_issues','d_adjustments']) {
   await pg.evaluate(v=>{ view=v; selKy='2026'; render(); }, v); await pg.waitForTimeout(300);
   const has=await pg.$('#xl'); if (!has) { console.log(v,'no xl'); continue; }
   await pg.click('#xl'); await pg.waitForTimeout(200);
   const r=await pg.evaluate(()=>{ const x=window.__xl.pop(); const tbRows=[...document.querySelectorAll('#main .tw table tbody tr')].filter(tr=>!tr.classList.contains('tot')&&tr.style.display!=='none').length; return x?{name:x.name, n:x.aoa.length-1, tbRows, head:x.aoa[0].join(' | '), r1:JSON.stringify(x.aoa[1])}:null; });
   console.log(v, JSON.stringify(r)); }
 console.log('errs',errs); await b.close(); })();
