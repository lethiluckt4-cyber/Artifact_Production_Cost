const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1600,height:600}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(700);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); calcCache=null; calcDirty=false; selKy='2026-10'; view='d_purchases'; render(); },[seed]); await pg.waitForTimeout(400);
 const r0=await pg.evaluate(()=>{ const r=state.purchases.find(x=>x.ngayNhap.startsWith('2026-10') && num(x.sl)>=100); return {id:r._id, ma:r.ma, hd:r.hoaDon}; });
 await pg.click(`[data-split="${r0.id}"]`); await pg.waitForTimeout(250);
 await pg.keyboard.type('9');
 const nid=await pg.evaluate(()=>editRow);
 await pg.click(`td.ed[data-id="${nid}"][data-k="sl"]`); await pg.keyboard.type('40'); await pg.waitForTimeout(150);
 const snap=async()=>pg.evaluate(([nid,sid])=>({moi:['sl','donGia','tt'].map(k=>document.querySelector(`td[data-id="${nid}"][data-k="${k}"]`).textContent), goc:['sl','donGia','tt'].map(k=>document.querySelector(`td[data-id="${sid}"][data-k="${k}"]`).textContent)}),[nid,r0.id]);
 console.log('gõ SL 40:', JSON.stringify(await snap()));
 await pg.screenshot({path:path.resolve(__dirname,'out','live.png')});
 // manual tt
 await pg.click(`td.ed[data-id="${nid}"][data-k="tt"]`); await pg.keyboard.press('Control+A'); await pg.keyboard.type('3950000'); await pg.waitForTimeout(150);
 console.log('gõ TT 3.950.000:', JSON.stringify(await snap()));
 await pg.click('[data-save]'); await pg.waitForTimeout(300);
 console.log('sau lưu', await pg.evaluate(r0=>{ const a=state.purchases.filter(x=>x.ma===r0.ma&&x.hoaDon===r0.hd); return {rows:a.map(x=>[x.ngayNhap,x.sl,x.tt,Math.round(x.donGia)]), tot:[a.reduce((s,x)=>s+num(x.sl),0), a.reduce((s,x)=>s+num(x.tt),0)]}; }, r0));
 // decimal qty in normal edit
 await pg.evaluate(id=>{ editRow=id; render(); },r0.id); await pg.click(`td.ed[data-id="${r0.id}"][data-k="sl"]`); await pg.keyboard.press('Control+A'); await pg.keyboard.type('160,5'); await pg.waitForTimeout(100);
 console.log('sửa SL 160,5:', await pg.evaluate(id=>document.querySelector(`td[data-id="${id}"][data-k="tt"]`).textContent, r0.id));
 await pg.click('[data-save]'); await pg.waitForTimeout(200); console.log('lưu:', await pg.evaluate(id=>{ const r=state.purchases.find(x=>x._id===id); return [r.sl,r.tt]; }, r0.id));
 console.log('errs',errs); await b.close(); })();
