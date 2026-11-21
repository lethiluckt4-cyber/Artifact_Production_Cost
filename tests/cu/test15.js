const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error' && !m.text().includes('ERR_')) errs.push(m.text()); });
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); changed(); state.settings.workYear='2026'; selKy='2026-10'; view='nxt'; render(); }); await pg.waitForTimeout(400);

 const ths = await pg.$$('thead th .xfb'); await ths[3].click(); await pg.waitForTimeout(200); await pg.screenshot({path:'/tmp/man-hinh-31-loc-cot.png'});
 await pg.evaluate(()=>{ document.querySelectorAll('#xfpop .xflist input').forEach(i=>i.checked = i.value==='NVLC'); document.querySelector('#xfpop [data-ok]').click(); }); await pg.waitForTimeout(300);
 console.log('shown', await pg.evaluate(()=>[...document.querySelectorAll('tbody tr')].filter(r=>r.style.display!=='none' && !r.classList.contains('tot')).length), await pg.evaluate(()=>document.querySelector('[data-xn]').textContent));
 await ths[5].click(); await pg.waitForTimeout(100); await pg.click('#xfpop [data-s=desc]'); await pg.waitForTimeout(200);
 console.log('first after sort', await pg.evaluate(()=>[...document.querySelectorAll('tbody tr')].filter(r=>r.style.display!=='none')[0].children[1].textContent));
 await pg.screenshot({path:'/tmp/man-hinh-32-nxt-excel.png'});
 await pg.evaluate(()=>{ view='d_purchases'; render(); }); await pg.waitForTimeout(300); await pg.screenshot({path:'/tmp/man-hinh-33-mua-hang-excel.png'});
 // filter persists after edit re-render
 await pg.evaluate(()=>{ view='nxt'; render(); }); await pg.waitForTimeout(300);
 console.log('persist', await pg.evaluate(()=>document.querySelector('[data-xn]').textContent));
 await pg.evaluate(()=>{ view='giathanh'; render(); }); await pg.waitForTimeout(300); await pg.click('tbody tr[data-i="0"]'); await pg.waitForTimeout(300); await pg.screenshot({path:'/tmp/man-hinh-34-modal-excel.png'});
 console.log(errs); await b.close(); })();
