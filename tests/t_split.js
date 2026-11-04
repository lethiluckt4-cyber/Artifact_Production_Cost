const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(700);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); calcCache=null; calcDirty=false; selKy='2026-10'; view='d_purchases'; render(); },[seed]); await pg.waitForTimeout(400);
 const r0=await pg.evaluate(()=>{ const r=state.purchases.find(x=>x.ngayNhap.startsWith('2026-10') && num(x.sl)>=100); return {id:r._id, ma:r.ma, hd:r.hoaDon}; });
 await pg.click(`[data-split="${r0.id}"]`); await pg.waitForTimeout(250);
 console.log('vị trí:', await pg.evaluate(id=>{ const trs=[...document.querySelectorAll('#main tbody tr')]; const i=trs.findIndex(tr=>tr.querySelector(`[data-id="${id}"]`)); const nx=trs[i+1]; return [i, nx && !!nx.querySelector('td.ed'), document.activeElement.dataset.k, [...nx.querySelectorAll('td')].slice(0,12).map(t=>(t.querySelector('.ci')?t.querySelector('.ci').value:t.textContent).trim()).join(' | ')]; }, r0.id));
 await pg.screenshot({path:path.resolve(__dirname,'out','split_inline.png')});
 await pg.evaluate(()=>{ const id=editRow; document.querySelector(`td.ed[data-id="${id}"][data-k="ngayNhap"]`).textContent='9'; document.querySelector(`td.ed[data-id="${id}"][data-k="sl"]`).textContent='40'; });
 await pg.click('[data-save]'); await pg.waitForTimeout(300);
 console.log('toast:', await pg.evaluate(()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).pop()));
 console.log('sau', await pg.evaluate(r0=>{ const a=state.purchases.filter(x=>x.ma===r0.ma&&x.hoaDon===r0.hd); return {rows:a.map(x=>[x.ngayNhap,x.ngayMua,x.hoaDon,x.sl,x.tt,x.donGia,x.ghiChu,!!x._splitFrom,!!x._new]), tot:[a.reduce((s,x)=>s+num(x.sl),0), a.reduce((s,x)=>s+num(x.tt),0)]}; }, r0));
 // over-qty blocked
 await pg.click(`[data-split="${r0.id}"]`); await pg.waitForTimeout(200); await pg.evaluate(()=>{ const id=editRow; document.querySelector(`td.ed[data-id="${id}"][data-k="ngayNhap"]`).textContent='10'; document.querySelector(`td.ed[data-id="${id}"][data-k="sl"]`).textContent='500'; }); await pg.click('[data-save]'); await pg.waitForTimeout(150);
 console.log('chặn:', await pg.evaluate(()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).pop()));
 await pg.click('[data-cancel]'); await pg.waitForTimeout(150); console.log('hủy -> số dòng', await pg.evaluate(r0=>state.purchases.filter(x=>x.ma===r0.ma&&x.hoaDon===r0.hd).length, r0));
 console.log('errs',errs); await b.close(); })();
