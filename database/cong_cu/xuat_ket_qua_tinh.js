// Chạy phần mềm (artifact/index.html) với tệp sao lưu, bấm "tính" và xuất toàn bộ kết quả ra JSON
// Dùng: node xuat_ket_qua_tinh.js ../../data/SaoLuu_GiaThanh_2026-11-04.json ket_qua.json
const { chromium } = require('playwright'); const fs=require('fs'); const path=require('path');
const [,, IN, OUT] = process.argv;
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+path.resolve(__dirname,'../../artifact/index.html')); await pg.waitForTimeout(1500);
 const t0=Date.now();
 const r=await pg.evaluate(d=>{ app.importDocs(d); calcCache=null; const c=calc(); const it=itemMap();
   const out={periods:[], orders:[], lines:[], nxt:[], warnings:c.warnings.map(w=>({loai:w.loai, ma:w.ma, nd:w.nd}))};
   c.list.forEach(ky=>{ const P=c.periods[ky];
     out.periods.push({ky, c622:P.cp.c622, c627:P.cp.c627, gas:P.cp.gas, chi641:P.chi641||0, sum621:P.sum621, sum622:P.sum622, sum627:P.sum627, sum154:P.sum154, thuHoi:P.thuHoi||0, un622:P.unalloc622, un627:P.unalloc627, slSX:P.slSX, slBTP:P.slBTP, doanhSo:P.doanhSo, lai:P.lai, tonCuoi:P.tonCuoi});
     P.orders.forEach(o=>{ out.orders.push({ky, maLenh:o.maLenh, cd:o.cd, slTH:o.slTH, soMe:o.bs?o.soMe:null, slLoi:o.slLoi||0, slDat:o.slDat??o.slTH, c621:o.c621, c622:o.c622, c627:o.c627, c154:o.c154, thuHoi:o.thuHoi||0, gtNhap:o.gtNhap??o.c154, gtdv:gtdvOf(o), status:o.status});
       o.lines.forEach(l=>out.lines.push({maLenh:o.maLenh, maVT:l.maVT, thayThe:!!l.thayThe, dm:l.dm, soMe:l.soMe, slDM:l.slDM, dc:l.dc, tong:l.tong, dg:l.dg, tt:l.tt, c622:l.c622, c627:l.c627, c154:l.c154, tonNgay:l.tonNgay})); });
     P.nxt.forEach(n=>out.nxt.push({ky, ma:n.ma, gv:n.gv, openSL:n.openSL, openTT:n.openTT, nhapSL:n.nhapSL, nhapTT:n.nhapTT, xuatSL:n.xuatSL, xuatTT:n.xuatTT, closeSL:n.closeSL, closeTT:n.closeTT, pBQ:n.pBQ, bq:n.bq, days:n.days, can15:n.can15, risk:n.risk, status:n.status}));
   });
   return out; }, JSON.parse(fs.readFileSync(IN,'utf8')));
 r.ms=Date.now()-t0; fs.writeFileSync(OUT, JSON.stringify(r)); console.log('periods',r.periods.length,'orders',r.orders.length,'lines',r.lines.length,'nxt',r.nxt.length,'warn',r.warnings.length, errs); await b.close(); })();
