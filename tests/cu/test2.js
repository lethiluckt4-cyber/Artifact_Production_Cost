const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{
  const aoa = JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../data/trung_gian/aoa.json'),'utf8'));
  const seed = JSON.parse(fs.readFileSync(require('path').resolve(__dirname,'../data/trung_gian/seed.json'),'utf8'));
  const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}});
  const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
  await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(1200);
  await pg.evaluate(()=>app.importDocs({settings:{company:'KH Thảo Vy'}})); await pg.waitForTimeout(300);
  const log = await pg.evaluate(a=>{ const l={}; for (const ent of ['items','opening','bom','purchases','orders','adjustments','issues','sales','costs','plan']) l[ent]=app.importAOA(ent, a[ent], 'replace', true); return l; }, aoa);
  console.log(log);
  await pg.evaluate(()=>{ app.setKy('2026-10'); });
  const r = await pg.evaluate(()=>{ const c=app.calc(); const p=c.periods['2026-10']; return {sum154:p.sum154, ds:p.doanhSo, lai:p.lai, ton:p.tonCuoi, warn:c.warnings.slice(0,5), start:app.state.settings.startKy, opk:app.state.opening.ky}; });
  console.log(r);
  // second import in replace mode must not duplicate
  await pg.evaluate(a=>{ for (const ent of ['purchases','orders','adjustments','sales']) app.importAOA(ent, a[ent], 'replace', true); }, aoa);
  const r2 = await pg.evaluate(()=>{ const c=app.calc(); const p=c.periods['2026-10']; return {sum154:p.sum154, n:app.state.orders.length, adj:app.state.adjustments.length, pur:app.state.purchases.length}; });
  console.log('re-import', r2);
  // add a November purchase + order to test roll-forward
  await pg.evaluate(()=>{ app.state.purchases.push({_id:'t1', ngayNhap:'2026-11-03', ngayMua:'2026-11-03', hoaDon:'1', ncc:'X', ma:'TRGA', sl:1000, donGia:2500, tt:2500000, kho:'152', ghiChu:''}); app.state.orders.push({_id:'t2', maLenh:'LSX2026-11.03-01', ngayXuatNVL:'2026-11-03', ngaySX:'2026-11-03', maTP:'BO', loaiDM:'DM', soMeKH:10, dieuChinhMe:0, ghiChu:''}); app.state.costs['2026-11']={c622:50000000,c6273:0,c6274:0,dien:0,nuoc:0,khac:0}; app.setKy('2026-11'); });
  const r3 = await pg.evaluate(()=>{ const c=app.calc(); const p10=c.periods['2026-10'], p11=c.periods['2026-11']; const trga=p11.nxt.find(x=>x.ma==='TRGA'); const bo=p11.nxt.find(x=>x.ma==='BO'); return {open11_eq_close10: trga.openSL===p10.close['TRGA'].sl && trga.openTT===p10.close['TRGA'].tt, trga, bo:{open:bo.openSL, nhap:bo.nhapSL, close:bo.closeSL}, o:p11.orders[0].c154, r622:p11.rates.r622, sum154:p11.sum154}; });
  console.log(JSON.stringify(r3));
  await pg.screenshot({path:'/tmp/shot_nov.png'});
  await pg.evaluate(()=>{ document.querySelector('[data-v=canhbao]').click(); }); await pg.waitForTimeout(400); await pg.screenshot({path:'/tmp/shot_cb.png'});
  await pg.evaluate(()=>{ document.querySelector('[data-v=nam]').click(); }); await pg.waitForTimeout(400); await pg.screenshot({path:'/tmp/shot_nam.png'});
  console.log('errors', errs.filter(e=>!e.includes('XLSX')));
  await b.close();
})();
