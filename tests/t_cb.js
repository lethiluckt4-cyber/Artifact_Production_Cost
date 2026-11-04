const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1300,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); calcCache=null; calcDirty=false; selKy='2026-10'; view='canhbao'; render(); },[seed]); await pg.waitForTimeout(300);
 console.log('menu nhóm 1:', await pg.evaluate(()=>NAV.filter(x=>x.id).map(x=>x.t).join(', ')));
 console.log('tabs:', await pg.evaluate(()=>[...document.querySelectorAll('#main .tabs button')].map(b=>b.textContent+(b.classList.contains('act')?'*':'')).join(' | ')));
 await pg.click('[data-cbt="ng"]'); await pg.waitForTimeout(250);
 console.log('tab ngưỡng:', await pg.evaluate(()=>[document.querySelector('#main h2').textContent, [...document.querySelectorAll('#main thead th')].map(t=>t.innerText.replace('▼','').trim()).join('|'), document.querySelector('nav button.act')?.textContent]));
 // edit and save
 await pg.evaluate(()=>{ document.querySelector('td[data-i="1"][data-f="max"]').textContent='3'; }); await pg.click('#ngSave'); await pg.waitForTimeout(200);
 console.log('lưu:', await pg.evaluate(()=>nguongList()[1].max), await pg.evaluate(()=>[...document.querySelectorAll('#main .tabs button')].map(b=>b.textContent+(b.classList.contains('act')?'*':'')).join(' | ')));
 await pg.screenshot({path:path.resolve(__dirname,'out','cb_ng.png')});
 await pg.click('[data-cbt="kq"]'); await pg.waitForTimeout(250); console.log('quay lại:', await pg.evaluate(()=>document.querySelectorAll('#main .box, #main .sec, #main table').length));
 console.log('errs', errs); await b.close(); })();
