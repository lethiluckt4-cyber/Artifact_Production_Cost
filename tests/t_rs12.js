const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2500);
 const docs=JSON.parse(fs.readFileSync(process.argv[2]||'/home/claude/work/import/nap_final.json','utf8')); delete docs._nap; docs.settings=JSON.parse(fs.readFileSync('settings_live.json','utf8')); docs.settings.daDeXuat=[]; docs.settings.dxSig={};
 await pg.evaluate(d=>{ fromDocs(d); state.cal=[]; changed(); calcCache=null; closeModal&&closeModal(); }, docs);
 const K=process.argv[3]||'2026-01';
 await pg.evaluate(k=>{ view='giathanh'; selKy=k; render(); runCalcFor({reset:true}); }, K);
 const waitRes=async()=>{ await pg.waitForFunction(()=>{ const h=document.querySelector('#modal h3'); return h && h.textContent.includes('Đã tính xong'); },null,{timeout:120000}); await pg.waitForTimeout(300); };
 const btns=async()=>pg.$$eval('#modal .bar button',x=>x.map(e=>e.textContent.trim()+(e.disabled?'[x]':'')));
 await waitRes(); console.log('R1', await btns()); await pg.screenshot({path:'/home/claude/work/rs1.png'});
 if (await pg.$('#rsMv')) { await pg.click('#rsMv'); await pg.waitForTimeout(500); console.log('MV', await pg.$eval('#modal h3',e=>e.textContent), await btns());
   await pg.screenshot({path:'/home/claude/work/rs_mv.png'});
   await pg.click('#mc'); await waitRes(); console.log('back ok');
   await pg.click('#rsMv'); await pg.waitForTimeout(500); if (await pg.$('#mvOK')) { await pg.click('#mvOK'); await waitRes(); console.log('R2', await btns()); } }
 if (await pg.$('#rsAdj')) { await pg.click('#rsAdj'); await pg.waitForTimeout(500); console.log('AD', await pg.$eval('#modal h3',e=>e.textContent), await btns()); await pg.screenshot({path:'/home/claude/work/rs_ad.png'});
   const first=await pg.$('[data-ap="0"]'); if (first) { await first.click(); console.log('after untick', await btns()); }
   await pg.click('#apOK'); await waitRes(); console.log('R3', await btns()); await pg.screenshot({path:'/home/claude/work/rs3.png'}); }
 console.log('errs',errs); await b.close(); })();
