const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const docs = JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../data/trung_gian/docs.json'),'utf8'));
  const seed = JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../data/trung_gian/seed.json'),'utf8'));
  const b = await chromium.launch(); const pg = await b.newPage({viewport:{width:1500,height:950}});
  const errs=[]; pg.on('pageerror', e=>errs.push(e.message)); pg.on('console', m=>{ if(m.type()==='error') errs.push(m.text()); });
  await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(1500);
  await pg.evaluate(d=>app.importDocs(d), docs); await pg.waitForTimeout(2500);
  const r = await pg.evaluate(()=>{ const c=app.calc(); const p=c.periods['2026-10']; const o={}; p.orders.forEach(x=>o[x.maLenh]={c154:x.c154,c621:x.c621,st:x.status}); const n={}; p.nxt.forEach(x=>n[x.ma]=x); return {sum154:p.sum154, ds:p.doanhSo, lai:p.lai, ton:p.tonCuoi, slSX:p.slSX, orders:o, nxt:n, warn:c.warnings.length, rates:p.rates, nOrders:p.orders.length}; });
  console.log('154', r.sum154, 'DS', r.ds, 'Lai', r.lai, 'Ton', r.ton, 'SLSX', r.slSX, 'orders', r.nOrders, 'warn', r.warn, r.rates);
  let bad=0; for (const [k,v] of Object.entries(seed.ref.giaThanh)) { const a=r.orders[k]; if(!a){console.log('missing',k); bad++; continue;} if (Math.abs(a.c154-v['154'])>1) { bad++; if(bad<8) console.log('154 diff',k,a.c154,v['154'],a.st); } }
  console.log('order mismatches', bad);
  let nb=0; for (const [k,v] of Object.entries(seed.ref.nxt)) { const a=r.nxt[k]; if(!a){console.log('nxt missing',k); nb++; continue;} const d=['giaVon','nhapSL','nhapTT','xuatSL','xuatTT','tonSL','tonTT']; const mp={giaVon:'gv',nhapSL:'nhapSL',nhapTT:'nhapTT',xuatSL:'xuatSL',xuatTT:'xuatTT',tonSL:'closeSL',tonTT:'closeTT'}; for (const f of d){ const x=a[mp[f]], y=v[f]; if (Math.abs(x-y)>Math.max(1, Math.abs(y)*1e-6)) { nb++; if(nb<12) console.log('nxt diff',k,f,x,y); } } }
  console.log('nxt mismatches', nb);
  await pg.screenshot({path:'/tmp/shot_tq.png'});
  await pg.evaluate(()=>{ document.querySelector('[data-v=giathanh]').click(); }); await pg.waitForTimeout(500); await pg.screenshot({path:'/tmp/shot_gt.png'});
  await pg.evaluate(()=>{ document.querySelector('[data-v=nxt]').click(); }); await pg.waitForTimeout(500); await pg.screenshot({path:'/tmp/shot_nxt.png'});
  await pg.evaluate(()=>{ document.querySelector('[data-v=d_orders]').click(); }); await pg.waitForTimeout(500); await pg.screenshot({path:'/tmp/shot_orders.png'});
  await pg.evaluate(()=>{ document.querySelector('[data-v=taidulieu]').click(); }); await pg.waitForTimeout(500); await pg.screenshot({path:'/tmp/shot_import.png'});
  // reload persistence check
  await pg.reload(); await pg.waitForTimeout(2000);
  console.log('after reload items', await pg.evaluate(()=>app.state.items.length+' '+app.state.orders.length+' '+app.state.adjustments.length));
  console.log('errors', errs);
  await b.close();
})();
