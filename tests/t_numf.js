const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(700);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); calcCache=null; calcDirty=false; selKy='2026'; view='d_purchases'; render(); },[seed]); await pg.waitForTimeout(400);
 const hs=await pg.evaluate(()=>[...document.querySelectorAll('#main thead th')].map(t=>t.innerText.replace('▼','').replace(/\s+/g,' ').trim())); console.log(hs.join(' | '));
 const ci=hs.indexOf('Tỷ lệ chênh lệch'); console.log('ci',ci, hs.includes('Cảnh báo giá'));
 const btn=(await pg.$$('#main thead th'))[ci]; await (await btn.$('.xfb')).click(); await pg.waitForTimeout(150);
 await pg.selectOption('.xfop','abs'); await pg.fill('.xfv','10'); await pg.click('[data-ok]'); await pg.waitForTimeout(200);
 console.log('lọc |lệch|≥10%:', await pg.evaluate(ci=>{ const rs=[...document.querySelectorAll('#main tbody tr:not(.tot)')].filter(r=>r.style.display!=='none'); return [rs.length, rs.slice(0,8).map(r=>r.children[ci].textContent).join(' ')]; },ci), await pg.evaluate(()=>document.querySelector('[data-xn]').textContent));
 // sort desc
 await (await btn.$('.xfb')).click(); await pg.waitForTimeout(150); await pg.click('[data-s="desc"]'); await pg.waitForTimeout(200);
 console.log('sắp giảm:', await pg.evaluate(ci=>[...document.querySelectorAll('#main tbody tr:not(.tot)')].filter(r=>r.style.display!=='none').slice(0,6).map(r=>r.children[ci].textContent).join(' '),ci));
 await pg.screenshot({path:path.resolve(__dirname,'out','numf.png')});
 console.log('errs',errs); await b.close(); })();
