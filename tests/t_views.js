// Mở mọi màn hình (trống và có dữ liệu), chạy chuỗi Tính giá thành, chụp ảnh
const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p);
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message)); pg.on('console',m=>{ if(m.type()==='error') errs.push('console: '+m.text()); });
 await pg.goto(APP); await pg.waitForTimeout(1200);
 const views = await pg.evaluate(()=>NAV.filter(x=>x.id).map(x=>x.id));
 const run = async (tag) => { const out={}; for (const v of views) { try { await pg.evaluate(v=>{ view=v; render(); }, v); await pg.waitForTimeout(80); out[v]=await pg.evaluate(()=>[document.querySelectorAll('#main table').length, document.querySelector('#main h2')?.textContent.slice(0,50)]); } catch(e){ out[v]='ERR '+e.message.slice(0,120); } } console.log(tag, JSON.stringify(out)); };
 await run('EMPTY');
 await pg.screenshot({path:path.resolve(__dirname,'out','empty.png')});
 await pg.evaluate(()=>{ view='tongquan'; render(); }); await pg.click('#seedbtn'); await pg.waitForTimeout(600); await pg.evaluate(()=>{ const pp=planPrm(); pp.nlUoc={'2026-10':110000000}; state.settings.planPrm=pp; calcCache=null; });
 const t0=Date.now(); await pg.evaluate(()=>{ calcCache=null; app.calc(); }); console.log('calc ms', Date.now()-t0);
 await pg.evaluate(()=>{ selKy='2026-10'; view='giathanh'; render(); }); await pg.click('#recalc'); await pg.waitForTimeout(200); await pg.selectOption('#rcM','10'); await pg.click('#rcGo'); await pg.waitForTimeout(2500);
 await pg.screenshot({path:path.resolve(__dirname,'out','calc_result.png')});
 console.log('modal:', (await pg.evaluate(()=>document.querySelector('#modal').innerText)).slice(0,900));
 await pg.evaluate(()=>closeModal());
 await run('DATA');
 const shots = [['tongquan','2026-10'],['giathanh','2026-10'],['kehoach','2026-10'],['d_orders','2026-10'],['nxt','2026-10'],['canhbao','2026-10'],['d_costs','2026-10'],['banhang','2026-10'],['d_purchases','2026-10']];
 for (const [v,k] of shots) { await pg.evaluate(([v,k])=>{ selKy=k; view=v; render(); }, [v,k]); await pg.waitForTimeout(250); await pg.screenshot({path:path.resolve(__dirname,'out',v+'.png')}); }
 await pg.evaluate(()=>{ view='kehoach'; $('#main').dataset.ktab='lenh'; render(); }); await pg.waitForTimeout(200); await pg.screenshot({path:path.resolve(__dirname,'out','kehoach_lenh.png')});
 console.log('plan', await pg.evaluate(()=>{ const pl=buildPlan('2026'); return {ok:pl.ok, lock:pl.lockDate, last:pl.lastSale, n:pl.list.length, st:pl.list.reduce((a,x)=>(a[x.st]=(a[x.st]||0)+1,a),{}), stale:pl.stale.length, oct:pl.list.filter(x=>x.d>='2026-10-04').slice(0,12).map(x=>x.key+' '+x.st)}; }));
 await pg.evaluate(()=>{ view='kehoach'; $('#main').dataset.ktab='dc'; render(); }); await pg.waitForTimeout(200); await pg.screenshot({path:path.resolve(__dirname,'out','kehoach_dc.png')});
 console.log('errs', errs.slice(0,10));
 await b.close(); })();
