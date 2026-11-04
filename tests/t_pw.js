const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:700}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); calcCache=null; calcDirty=false; selKy='2026-10'; },[seed]);
 const sum=await pg.evaluate(()=>{ const a=purchaseChecks(), b=salesChecks(); const cnt=(o,f)=>Object.values(o).filter(f).length; const ky=r=>r.ngayNhap&&r.ngayNhap.startsWith('2026'); return {mua:{R:cnt(a,x=>x.lvl==='R'),Y:cnt(a,x=>x.lvl==='Y'),base:cnt(a,x=>x.base>0),tot:Object.keys(a).length}, ban:{R:cnt(b,x=>x.lvl==='R'),Y:cnt(b,x=>x.lvl==='Y'),base:cnt(b,x=>x.base>0),tot:Object.keys(b).length}}; });
 console.log(JSON.stringify(sum));
 console.log('mẫu mua:', await pg.evaluate(()=>{ const a=purchaseChecks(); return state.purchases.filter(r=>a[r._id]&&a[r._id].lvl).slice(0,6).map(r=>`${r.ngayNhap} ${r.ma} ${fmtN(num(r.donGia))} → ${a[r._id].lvl}: ${a[r._id].msg}`); }));
 console.log('mẫu bán:', await pg.evaluate(()=>{ const a=salesChecks(); return state.sales.filter(r=>a[r._id]&&a[r._id].lvl).slice(0,6).map(r=>`${r.ngay} ${r.ma} ${fmtN(num(r.doanhSo)/num(r.sl))} → ${a[r._id].lvl}: ${a[r._id].msg}`); }));
 await pg.evaluate(()=>{ view='d_purchases'; render(); }); await pg.waitForTimeout(300);
 console.log('cột mua:', await pg.evaluate(()=>[...document.querySelectorAll('#main thead th')].map(t=>t.innerText.replace(/\s+/g,' ').replace('▼','').trim()).join(' | ')));
 await pg.evaluate(()=>{ document.querySelector('#main .tw').scrollLeft=3000; }); await pg.waitForTimeout(100); await pg.screenshot({path:path.resolve(__dirname,'out','pw_mua.png')});
 await pg.evaluate(()=>{ view='d_sales'; render(); }); await pg.waitForTimeout(300);
 console.log('cột bán:', await pg.evaluate(()=>[...document.querySelectorAll('#main thead th')].map(t=>t.innerText.replace(/\s+/g,' ').replace('▼','').trim()).join(' | ')));
 await pg.evaluate(()=>{ document.querySelector('#main .tw').scrollLeft=3000; }); await pg.waitForTimeout(100); await pg.screenshot({path:path.resolve(__dirname,'out','pw_ban.png')});
 await pg.evaluate(()=>{ view='canhbao'; document.querySelector('#main').dataset.cbt='kq'; render(); }); await pg.waitForTimeout(300);
 const h=await pg.evaluate(()=>[...document.querySelectorAll('#main .box h3')].map(x=>x.innerText).filter(t=>/Đơn giá/.test(t)));
 console.log('section:', h);
 const btn=await pg.$('[data-pw]'); if (btn) { await btn.evaluate(e=>e.scrollIntoView()); await pg.screenshot({path:path.resolve(__dirname,'out','pw_cb.png')}); await btn.click(); await pg.waitForTimeout(300); console.log('đi tới:', await pg.evaluate(()=>[view, search, document.querySelectorAll('#main tbody tr:not(.tot)').length])); }
 // thresholds
 await pg.evaluate(()=>{ search=''; view='canhbao'; document.querySelector('#main').dataset.cbt='ng'; render(); }); await pg.waitForTimeout(300);
 await pg.evaluate(()=>{ document.querySelector('[data-gn="muaV"]').textContent='20'; }); await pg.click('#ngSave'); await pg.waitForTimeout(200);
 console.log('ngưỡng:', await pg.evaluate(()=>JSON.stringify(giaNg())), await pg.evaluate(()=>Object.values(purchaseChecks()).filter(x=>x.lvl==='Y').length));
 await pg.screenshot({path:path.resolve(__dirname,'out','pw_ng.png'), fullPage:true});
 console.log('errs', errs); await b.close(); })();
