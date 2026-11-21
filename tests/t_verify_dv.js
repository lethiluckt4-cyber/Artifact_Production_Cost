// Đối chiếu phần mềm với file Excel GT 12 - 26 DV: lệnh SX (suy luận), nhật ký xuất NVL, NXT từng mã từng tháng, tổng hợp 154
const { chromium } = require('playwright');
const fs = require('fs');
const APP = process.argv[2] || '/home/claude/work/app/index.html';
const seed = JSON.parse(fs.readFileSync('/home/claude/work/data/seed.json','utf8'));
const exp = JSON.parse(fs.readFileSync('/home/claude/work/data/expected.json','utf8'));
(async()=>{
  const b = await chromium.launch(); const pg = await b.newPage(); const errs=[];
  pg.on('pageerror', e=>errs.push(e.message)); pg.on('console', m=>{ if (m.type()==='error') errs.push(m.text()); });
  await pg.goto('file://'+APP); await pg.waitForFunction(()=>window.__booted===true, null, {timeout:30000});
  const out = await pg.evaluate((seed)=>{
    fromDocs(JSON.parse(JSON.stringify(seed))); state.settings.workYear='2026'; selKy='2026-01'; calcCache=null;
    fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; state.settings.planPrm=Object.assign({}, planPrm(), {canDoi:1}); /* file Excel cân đối mọi NVL */ /* lệnh SX tháng 1–9 đúng như file Excel (nạp sẵn); quy tắc lô cắt mới chỉ áp dụng cho đề xuất về sau */ selKy='2026-12'; calcCache=null; const c=calc();
    const ords = Object.values(c.periods).flatMap(P=>P.orders).map(o=>({maLenh:o.maLenh, ngayXuat:o.ngayXuatNVL, ngayNK:o.ngaySX, ma:o.maTP, sl:o.slTH, loai:o.loaiLenh, c621:o.c621, c154:o.c154, thieu:o.thieu, lines:o.lines.map(l=>({vt:l.maVT, slDM:l.slDM, tong:l.tong, dg:l.dg, tt:l.tt, ton:l.tonSau, thieu:l.thieuTT}))}));
    const nxt=[]; Object.values(c.periods).forEach(P=>P.nxt.forEach(x=>nxt.push({th:+P.ky.slice(5), ma:x.ma, gv:x.gv, oSL:x.openSL, oTT:x.openTT, iSL:x.nhapSL, iTT:x.nhapTT, xSL:x.xuatSL, xTT:x.xuatTT, cSL:x.closeSL, cTT:x.closeTT})));
    const th = {}; tongHop154('2026').forEach(r=>th[r.t]=r.v);
    const gc = Object.values(c.periods).flatMap(P=>P.gcNhan).map(x=>({vGui:x.vGui, vDV:x.vDV, vNhan:x.tt}));
    return {ords, nxt, th, gc, docs: toDocs()};
  }, seed);
  let bad=0, n=0; const tol=0.5; const log=[]; const diff=(lbl,a,e,t)=>{ n++; if (Math.abs((a||0)-(e||0))>(t??tol)) { bad++; if (log.length<60) log.push(`${lbl}: PM=${a} Excel=${e}`); } };
  // 1. Lệnh SX
  const E=exp.orders; const A=out.ords.slice().sort((a,b)=>a.maLenh.localeCompare(b.maLenh)); const Es=E.slice().sort((a,b)=>a.maLenh.localeCompare(b.maLenh));
  console.log('Số lệnh: PM', A.length, '· Excel', E.length);
  const em=new Map(Es.map(x=>[x.maLenh,x]));
  // Sai số dấu phẩy động của Excel: mã có tồn đầu tháng ≈ 0 (< 1e-9) nhưng Excel vẫn chia ra 'đơn giá' – chỉ ảnh hưởng giá trị NVL thiếu
  const resid=new Set(exp.nxt.filter(x=>x.oSL!==0 && Math.abs(x.oSL)<1e-9 && x.iSL===0).map(x=>x.th+'|'+x.ma)); let nExpl=0; const explained=new Set();
  A.forEach(o=>{ const th=+o.ngayXuat.slice(5,7); o.lines.forEach(l=>{ if (resid.has(th+'|'+l.vt)) explained.add(o.maLenh); }); });
  A.forEach(o=>{ const e=em.get(o.maLenh); n++; if (!e) { bad++; log.push('Lệnh thừa '+o.maLenh+' '+o.ma); return; }
    if (e.ma!==o.ma || e.ngayXuat!==o.ngayXuat || e.ngayNK!==o.ngayNK) { bad++; if (log.length<60) log.push(`Lệnh ${o.maLenh}: PM ${o.ma} ${o.ngayXuat}→${o.ngayNK} · Excel ${e.ma} ${e.ngayXuat}→${e.ngayNK}`); }
    diff(`SL ${o.maLenh}`, o.sl, e.sl, 1e-6); diff(`621 ${o.maLenh}`, o.c621, e.c621); diff(`154 ${o.maLenh}`, o.c154, e.c154); if (!explained.has(o.maLenh)) diff(`Thiếu ${o.maLenh}`, o.thieu, e.thieu); });
  Es.forEach(e=>{ if (!A.some(o=>o.maLenh===e.maLenh)) { bad++; log.push('Lệnh thiếu '+e.maLenh+' '+e.ma); } });
  // 2. Nhật ký xuất NVL
  const EL={}; exp.lines.forEach(l=>{ (EL[l.maLenh]=EL[l.maLenh]||[]).push(l); }); let nl=0;
  A.forEach(o=>{ const el=EL[o.maLenh]||[]; o.lines.forEach((l,i)=>{ nl++; const e=el[i]; if (!e) { bad++; log.push(`Dòng NVL thừa ${o.maLenh} ${l.vt}`); return; } if (e.vt!==l.vt) { bad++; log.push(`Dòng ${o.maLenh}#${i+1}: PM ${l.vt} Excel ${e.vt}`); } diff(`SLĐM ${o.maLenh} ${l.vt}`, l.slDM, e.slDM, 1e-6); diff(`Xuất ${o.maLenh} ${l.vt}`, l.tong, e.tong, 1e-6); if (resid.has(+o.ngayXuat.slice(5,7)+'|'+l.vt)) { nExpl++; } else diff(`ĐG ${o.maLenh} ${l.vt}`, l.dg, e.dg, 1e-4); diff(`TT ${o.maLenh} ${l.vt}`, l.tt, e.tt); diff(`Tồn sau ${o.maLenh} ${l.vt}`, l.ton, e.ton, 1e-4); }); });
  console.log('Dòng xuất NVL: PM', nl, '· Excel', exp.lines.length);
  // 3. NXT từng mã từng tháng
  const NM=new Map(out.nxt.map(x=>[x.th+'|'+x.ma,x])); let nn=0;
  exp.nxt.forEach(e=>{ const a=NM.get(e.th+'|'+e.ma)||{oSL:0,oTT:0,iSL:0,iTT:0,xSL:0,xTT:0,cSL:0,cTT:0,gv:0}; nn++; ['oSL','iSL','xSL','cSL'].forEach(k=>diff(`NXT T${e.th} ${e.ma} ${k}`, a[k], e[k], 1e-4)); ['oTT','iTT','xTT','cTT'].forEach(k=>diff(`NXT T${e.th} ${e.ma} ${k}`, a[k], e[k], 1)); if (!resid.has(e.th+'|'+e.ma)) diff(`NXT T${e.th} ${e.ma} gv`, a.gv, e.gv, 1e-4); });
  console.log('NXT đối chiếu', nn, 'dòng (mã × tháng)');
  // 4. Tổng hợp 154 & gia công
  Object.entries(exp.tonghop).forEach(([t,v])=>{ const a=out.th[t]; if (!a) return; v.slice(0,12).forEach((x,i)=>diff(`TH ${t} T${i+1}`, a[i], x, 1)); });
  if (out.gc[0]) { diff('GC giá trị gửi', out.gc[0].vGui, exp.gc.vGui); diff('GC phí in', out.gc[0].vDV, exp.gc.vDV); diff('GC giá trị nhận', out.gc[0].vNhan, exp.gc.vNhan); }
  console.log(log.join('\n'));
  console.log(`Sai số dấu phẩy động của Excel (tồn ≈ 1e-12, không phải lỗi phần mềm): ${nExpl} dòng NVL · ${explained.size} lệnh – chỉ ảnh hưởng 'Giá trị NVL thiếu'. Mã/tháng: ${[...resid].join(', ')}`);
  console.log(`Số chỉ tiêu so sánh: ${n} · Số chỉ tiêu lệch: ${bad}`);
  if (errs.length) console.log('Lỗi trang:', errs.slice(0,10));
  fs.writeFileSync('/home/claude/work/data/docs_after.json', JSON.stringify(out.docs));
  await b.close();
})();
