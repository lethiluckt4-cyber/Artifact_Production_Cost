// ---- Giá thành ----
// Sheet "Gia thanh BTP" / "Gia thanh TP" đúng bố cục file Excel gốc (Gia thanh - 26 TH.xlsx) để đối chiếu từng ô
function giaThanhExcelData(p, isTP){ const items=itemMap(); const C=calc(); const bk=b=>[b.loai||'DM',b.maTP,b.maNVL,b.tuNgay||'',b.denNgay||''].join('|'); const bomIdx=new Map(); state.bom.forEach((b,i)=>{ if(!bomIdx.has(bk(b))) bomIdx.set(bk(b),i+1); });
  const allOrd = Object.values(C.periods).flatMap(P=>P.orders).filter(o=>isTP ? o.cd==='TP' : o.cd!=='TP');
  const avgGV = {}; allOrd.forEach(o=>{ if (o.slTH) { const a=avgGV[o.maTP]||(avgGV[o.maTP]={s:0,n:0}); a.s+=gtdvOf(o); a.n++; } });
  const firstPrice = {}; state.sales.slice().sort((a,b)=>(a.ngay||'').localeCompare(b.ngay||'')).forEach(r=>{ if (!(r.ma in firstPrice) && num(r.sl)) firstPrice[r.ma]=num(r.doanhSo)/num(r.sl); });
  const mon = d => d ? +d.slice(5,7) : '';
  const head = ['Lệnh SX','Tháng SX','Ngày nhập kho TP','Mã thành phẩm','Tên thành phẩm','ĐVT thành phẩm','Loại dịnh mức','Tổng loại NVL','SL SX','SL SX - 1','Tỷ lệ hao hụt','SL hao hụt','Tháng xuất VT','Ngày xuất kho NVL','Mã VT/HH','Tên vật tư','ĐVT', isTP?'Định mức':'ĐM NVL/mẻ hoặc kg', isTP?'SL':'SL NVL cần','Cân đối','Tổng số lương','Đơn giá','Thành tiền','NVL tồn cuối ngày','621','622','627','154','Giá vốn','Giá bán','Chênh lệch','Tỷ lệ lãi 1 sp','Tỷ lệ chênh lệch sản phẩm','STT dòng','Dòng ĐM'].concat(isTP?[]:['621 NVL mua']);
  const g = new Array(head.length).fill(''); g[0]='THÔNG TIN LỆNH SẢN XUẤT'; g[isTP?14:12]='ĐỊNH MỨC & CHI PHÍ NGUYÊN VẬT LIỆU'; g[24]='PHÂN BỔ CHI PHÍ'; g[28]='GIÁ THÀNH & BIÊN LỢI NHUẬN';
  const rows=[]; p.orders.filter(o=>isTP ? o.cd==='TP' : o.cd!=='TP').slice().sort((a,b)=>(a.ngaySX+a.maLenh).localeCompare(b.ngaySX+b.maLenh)).forEach(o=>{ const tp=items[o.maTP]||{}; const n=o.lines.length;
    o.lines.forEach((x,i)=>{ const vt=items[x.maVT]||{}; const first=i===0; const gv=gtdvOf(o); const gb=first?(firstPrice[o.maTP]||0):''; const a=avgGV[o.maTP];
      const r=[o.maLenh, mon(o.ngaySX), o.ngaySX, o.maTP, first?(tp.ten||''):'', first?(tp.dvt||''):'', o.loaiDM||'DM', n, first?round(o.slTH,4):0, round(o.slTH,4), round(num(x.haoHut),4), round(o.slTH*(1+num(x.haoHut)),4), mon(x.ngayXuatNVL||o.ngayXuatNVL), x.ngayXuatNVL||o.ngayXuatNVL, x.maVT, vt.ten||'', vt.dvt||'', round(num(x.dm),6), round(num(x.slDM),4), round(num(x.dc),4), round(num(x.tong),4), round(num(x.dg),4), round(num(x.tt),0), round(num(x.tonNgay),4), round(num(x.tt),0), round(num(x.c622),0), round(num(x.c627),0), round(num(x.c154),0),
        first?round(gv,0):'', first?round(gb,0):'', first?round((gb||0)-gv,0):'', first?(gb?round((gb-gv)/gb,4):0):'', first&&gv&&a?round((a.s/a.n-gv)/gv,4):'', i+1, x.bomRef&&bomIdx.has(bk(x.bomRef))?(x.thayThe?-bomIdx.get(bk(x.bomRef)):bomIdx.get(bk(x.bomRef))):''];
      if (!isTP) r.push(x.prod?0:round(num(x.tt),0)); rows.push(r); }); });
  return {head, g, rows}; }
function excelGiaThanh(p, isTP){ const {head, g, rows}=giaThanhExcelData(p, isTP);
  const ws = XW.aoa_to_sheet([[], [isTP?'GIÁ THÀNH THÀNH PHẨM':'GIÁ THÀNH BÁN THÀNH PHẨM'], g, head].concat(rows)); ws._bold=new Set([1,2,3]); ws['!freeze']={x:4,y:4};
  ws['!cols']=[18,8,12,14,30,8,8,8,10,10,8,10,8,12,16,34,8,10,10,10,12,12,14,12,14,12,12,14,12,12,12,10,10,8,8,14].slice(0,head.length).map(w=>({wch:w})); return ws; }
// Bảng chi tiết giá thành: mỗi dòng = 1 NVL của 1 lệnh (dùng cho tab Chi tiết và sheet ChiTiet khi xuất Excel)
function chiTietRows(p, raw){ const items=itemMap(); const R0=v=>raw?num(v):round(num(v),0), R4=v=>raw?num(v):round(num(v),4); const cdOf=o=>o.cd==='TP'?'Công đoạn 2 – đóng gói':'Công đoạn 1 – làm bánh';
    const loaiVT=l=>l.prod?'Bán thành phẩm (giá thành)':(l.thayThe?'NVL thay thế':'NVL / vật tư mua');
  return p.orders.slice().sort((a,b)=>(a.ngaySX+(a.cd==='TP'?'2':'1')+a.maLenh).localeCompare(b.ngaySX+(b.cd==='TP'?'2':'1')+b.maLenh)).flatMap(o=>{ const tp=items[o.maTP]||{}; return o.lines.map(x=>{ const vt=items[x.maVT]||{}; return {
      'Lệnh SX':o.maLenh, 'Ngày SX':o.ngaySX, 'Ngày xuất NVL':x.ngayXuatNVL||o.ngayXuatNVL, 'Công đoạn':cdOf(o), 'Mã thành phẩm':o.maTP, 'Tên thành phẩm':tp.ten||'', 'ĐVT TP':tp.dvt||'',
      'SL lệnh':R4(o.slKH), 'Điều chỉnh TP':R4(o.dieuChinhTP), 'SL thực hiện':R4(o.slTH), 'Số mẻ':o.bs?R4(o.soMe):'',
      'Mã NVL / VT':x.maVT, 'Tên NVL / VT':vt.ten||'', 'Nhóm':vt.nhom||'', 'ĐVT':vt.dvt||'', 'Loại':loaiVT(x),
      'Định mức':R4(x.dm), 'Mẻ / SL':R4(x.soMe), 'SL theo ĐM':R4(x.slDM), 'Cân đối':R4(x.dc), 'Tổng SL xuất':R4(x.tong), 'Đơn giá':R4(x.dg),
      '621 Thành tiền':R0(x.tt), 'Tỷ trọng 621 trong lệnh':o.c621?R4(x.tt/o.c621):0, '622 phân bổ':R0(x.c622), '627 phân bổ':R0(x.c627), '154 Giá thành':R0(x.c154),
      'Giá thành/đv lệnh':R0(gtdvOf(o)), 'SL lỗi (lệnh)':o.slLoi?R4(o.slLoi):'', 'Thu hồi SP lỗi (lệnh)':o.thuHoi?R0(o.thuHoi):'' }; }); });
}
function vGiaThanh(m){
  const p=P(); if(!p) return noData(m);
  const tab = m.dataset.tab||'lenh'; const cdf = m.dataset.cd||''; const items=itemMap();
  const ords = p.orders.filter(o=>(!cdf || o.cd===cdf) && (!search || matchQ(search, searchText([o.maLenh,o.maTP,(items[o.maTP]||{}).ten,o.ngaySX,o.ngayXuatNVL]))));
  const gb = {}; p.sales.forEach(s=>{ const x=gb[s.ma]||(gb[s.ma]={sl:0,ds:0}); x.sl+=s.sl; x.ds+=s.ds; });
  let body='';
  if (tab==='tp') body = tpSummaryTable(p);
  else if (tab==='xl') { const rows=chiTietRows(p, true).filter(r=>(!cdf || (cdf==='TP') === r['Công đoạn'].startsWith('Công đoạn 2')) && (!search || matchQ(search, searchText([r['Lệnh SX'], r['Mã thành phẩm'], r['Tên thành phẩm'], r['Mã NVL / VT'], r['Tên NVL / VT'], r['Ngày SX']])))); const keys=rows.length?Object.keys(rows[0]):[];
    const DATEK=new Set(['Ngày SX','Ngày xuất NVL']); const TXTK=new Set(['Lệnh SX','Công đoạn','Mã thành phẩm','Tên thành phẩm','ĐVT TP','Mã NVL / VT','Tên NVL / VT','Nhóm','ĐVT','Loại']); const MONEY=new Set(['621 Thành tiền','622 phân bổ','627 phân bổ','154 Giá thành','Giá thành/đv lệnh']);
    const cols = keys.map(k=>({t:k, n:!TXTK.has(k)&&!DATEK.has(k), f:r=>r[k], fmt:v=> (v===''||v==null) ? '' : DATEK.has(k) ? fmtD(v) : TXTK.has(k) ? v : k==='Tỷ trọng 621 trong lệnh' ? fmtP(v) : MONEY.has(k) ? fmtN(v) : fmtQ(v), sum:['621 Thành tiền','622 phân bổ','627 phân bổ','154 Giá thành'].includes(k)}));
    body = (rows.length ? table(cols, rows, {total:true, freeze:6, h:'70vh'}) : '<div class="mut">Không có dữ liệu.</div>'); }
  else if (tab==='lenh') body = table([
    {t:'Mã lệnh',f:x=>x.maLenh},{t:'Ngày SX',f:x=>fmtD(x.ngaySX)},{t:'Mã sản phẩm',f:x=>x.maTP},{t:'Tên thành phẩm',f:x=>(items[x.maTP]||{}).ten||''},{t:'Công đoạn',f:x=>x.cd},{t:'SL lệnh',n:1,d:2,f:x=>x.slKH},{t:'Điều chỉnh TP',n:1,f:x=>x.dieuChinhTP||''},{t:'SL thực hiện',n:1,d:2,f:x=>x.slTH,sum:1},{t:'Số mẻ',n:1,d:2,f:x=>x.bs?x.soMe:''},{t:'Số NVL',n:1,f:x=>x.lines.length},{t:'621',n:1,f:x=>x.c621,sum:1},{t:'622',n:1,f:x=>x.c622,sum:1},{t:'627',n:1,f:x=>x.c627,sum:1},{t:'154',n:1,f:x=>x.c154,sum:1}, ...(hasLoi(p)?[{t:'SL lỗi',n:1,d:2,f:x=>x.slLoi||'',sum:1},{t:'Thu hồi SP lỗi (giảm 154)',n:1,f:x=>x.thuHoi||'',sum:1}]:[]),{t:'Giá vốn/đv',n:1,f:x=>gtdvOf(x)},{t:'Giá bán BQ',n:1,f:x=>gb[x.maTP]&&gb[x.maTP].sl?gb[x.maTP].ds/gb[x.maTP].sl:''},{t:'Tỷ lệ lãi 1 sp',n:1,f:x=>{ const g=gb[x.maTP]; if(!g||!g.sl||!x.slTH) return ''; const b=g.ds/g.sl; return (b-gtdvOf(x))/b; },fmt:v=>v===''?'':fmtP(v)},{t:'Kiểm tra',f:x=>x.status,raw:1,fmt:v=>`<span class="pill ${v==='Đủ'?'ok':'bad'}">${esc(v)}</span>`}
  ], ords, {total:true, click:true, freeze:4});
  else body = table([
    {t:'Mã lệnh',f:x=>x.maLenh},{t:'Ngày xuất NVL',f:x=>fmtD(x.ngayXuatNVL)},{t:'Mã sản phẩm',f:x=>x.maTP},{t:'Tên thành phẩm',f:x=>(items[x.maTP]||{}).ten||''},{t:'Mã VT/HH',f:x=>x.maVT},{t:'Tên vật tư',f:x=>(items[x.maVT]||{}).ten||''},{t:'ĐVT',f:x=>(items[x.maVT]||{}).dvt||''},{t:'Định mức',n:1,d:4,f:x=>x.dm},{t:'Mẻ / SL',n:1,d:2,f:x=>x.soMe},{t:'SL theo ĐM',n:1,d:3,f:x=>x.slDM},{t:'Cân đối',n:1,d:3,f:x=>x.dc},{t:'Tổng số lượng',n:1,d:3,f:x=>x.tong},{t:'Đơn giá',n:1,f:x=>x.dg},{t:'Thành tiền (621)',n:1,f:x=>x.tt,sum:1},{t:'622',n:1,f:x=>x.c622,sum:1},{t:'627',n:1,f:x=>x.c627,sum:1},{t:'154',n:1,f:x=>x.c154,sum:1},{t:'NVL tồn cuối ngày',n:1,d:2,f:x=>x.tonNgay}
  ], ords.flatMap(o=>o.lines), {total:true, freeze:4});
  m.innerHTML = head(`Giá thành`, `<button class="btn" id="xl">⬇ Xuất Excel</button>`) +
  `<div class="tabs"><button data-t="lenh" class="${tab==='lenh'?'act':''}">Theo lệnh sản xuất</button><button data-t="nvl" class="${tab==='nvl'?'act':''}">Nhật ký xuất vật tư</button><button data-t="tp" class="${tab==='tp'?'act':''}">Theo sản phẩm</button><button data-t="xl" class="${tab==='xl'?'act':''}">Chi tiết</button></div>
  <div class="bar">${tab!=='tp'?`<select id="cdf"><option value="">Mọi công đoạn</option><option value="BT" ${cdf==='BT'?'selected':''}>Bán thành phẩm (Gia thanh BTP)</option><option value="TP" ${cdf==='TP'?'selected':''}>Thành phẩm (Gia thanh TP)</option></select><input type="text" id="q" placeholder="Lọc theo lệnh / mã" value="${esc(search)}">`:''}</div>` + body;
  bindKy(); m.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>guardEdit(()=>{ m.dataset.tab=b.dataset.t; render(); }));
  bindSearch();
  if ($('#cdf')) $('#cdf').onchange=e=>{ m.dataset.cd=e.target.value; render(); };
  if (tab==='lenh') m.querySelectorAll('tbody tr[data-i]').forEach(tr=>tr.onclick=()=>orderDetail(ords[+tr.dataset.i]));
  $('#xl').onclick=()=>{
    const wb = XW.book_new(); { const t=mainTable(); if (t) { const lb=(m.querySelector('.tabs button.act')||{}).textContent||'Dang xem'; XW.book_append_sheet(wb, tableSheet(t), lb.trim().slice(0,28)||'Dang xem'); } } const R0=v=>round(num(v),0), R4=v=>round(num(v),4); const A=allocCfg(); const cdOf=o=>o.cd==='TP'?'Công đoạn 2 – đóng gói':'Công đoạn 1 – làm bánh';
    const full = chiTietRows(p);
    XW.book_append_sheet(wb, XW.json_to_sheet(full), 'ChiTiet');
    // Sheet phân bổ 622/627 theo sản phẩm
    const byP={}; p.orders.forEach(o=>{ const x=byP[o.maTP]||(byP[o.maTP]={o, n:0, sl:0, c621:0, c622:0, c627:0, c154:0, slDat:0, gtNhap:0}); x.n++; x.sl+=o.slTH; x.c621+=o.c621; x.c622+=o.c622; x.c627+=o.c627; x.c154+=o.c154; x.slDat+=(o.slDat??o.slTH); x.gtNhap+=(o.gtNhap??o.c154); });
    const cd1 = new Set(A.rows.filter(r=>num(r.cd)===1).map(r=>r.ma)); const t621cd2 = sum(Object.values(byP).filter(x=>!cd1.has(x.o.maTP)), x=>x.c621);
    const pb = Object.values(byP).sort((a,b)=>(cd1.has(a.o.maTP)?0:1)-(cd1.has(b.o.maTP)?0:1) || a.o.maTP.localeCompare(b.o.maTP)).map(x=>{ const ma=x.o.maTP, r=A.rows.find(r=>r.ma===ma), is1=cd1.has(ma); return {
      'Công đoạn':is1?'Công đoạn 1 – làm bánh':'Công đoạn 2 – đóng gói', 'Mã sản phẩm':ma, 'Tên sản phẩm':(items[ma]||{}).ten||'', 'Số lệnh':x.n, 'SL thực hiện':R4(x.sl), '621 NVL':R0(x.c621),
      'Tỷ lệ công đoạn – 622':R4(is1?num(A.cd1_622):1-num(A.cd1_622)), 'Tỷ lệ SP trong CĐ – 622':R4(is1?num(r&&r.t622):(t621cd2?x.c621/t621cd2:0)), '622 phân bổ':R0(x.c622),
      'Tỷ lệ công đoạn – 627':R4(is1?num(A.cd1_627):1-num(A.cd1_627)), 'Tỷ lệ SP trong CĐ – 627':R4(is1?num(r&&r.t627):(t621cd2?x.c621/t621cd2:0)), '627 phân bổ':R0(x.c627),
      '154 Giá thành':R0(x.c154), 'Giá thành/đv':x.slDat?R0(x.gtNhap/x.slDat):(x.sl?R0(x.c154/x.sl):0), 'Cách chia trong CĐ':is1?'Tỷ lệ cố định (Thiết lập → Phân bổ 622/627)':'Theo tỷ trọng 621 trong tháng' }; });
    pb.push({'Công đoạn':'Tổng cộng', 'Mã sản phẩm':'', 'Tên sản phẩm':'', 'Số lệnh':sum(pb,x=>x['Số lệnh']), 'SL thực hiện':'', '621 NVL':R0(sum(pb,x=>x['621 NVL'])), 'Tỷ lệ công đoạn – 622':'', 'Tỷ lệ SP trong CĐ – 622':'', '622 phân bổ':R0(sum(pb,x=>x['622 phân bổ'])), 'Tỷ lệ công đoạn – 627':'', 'Tỷ lệ SP trong CĐ – 627':'', '627 phân bổ':R0(sum(pb,x=>x['627 phân bổ'])), '154 Giá thành':R0(sum(pb,x=>x['154 Giá thành'])), 'Giá thành/đv':'', 'Cách chia trong CĐ':''});
    const L=o=>o.lines.map(x=>({'Lệnh SX':x.maLenh,'Ngày SX':x.ngaySX,'Mã sản phẩm':x.maTP,'Tên thành phẩm':(items[x.maTP]||{}).ten||'','Công đoạn':o.cd,'SL SX':o.slTH,'Mã VT/HH':x.maVT,'Tên vật tư':(items[x.maVT]||{}).ten||'','Định mức':x.dm,'SL':x.slDM,'Cân đối':x.dc,'Tổng số lượng':x.tong,'Đơn giá':x.dg,'Thành tiền / 621':x.tt,'622 Nhân công':x.c622,'627 SX chung':x.c627,'154 Giá thành':x.c154,'NVL tồn cuối ngày':x.tonNgay}));
    XW.book_append_sheet(wb, XW.json_to_sheet(p.orders.map(x=>({'Mã lệnh':x.maLenh,'Ngày SX':x.ngaySX,'Mã sản phẩm':x.maTP,'Tên thành phẩm':(items[x.maTP]||{}).ten||'','Công đoạn':x.cd,'SL lệnh':x.slKH,'Điều chỉnh TP':x.dieuChinhTP,'SL thực hiện':x.slTH,'Số mẻ':x.bs?x.soMe:'','621 NVL':x.c621,'622 Nhân công':x.c622,'627 SX chung':x.c627,'154 Giá thành':x.c154,'SL lỗi':x.slLoi||0,'Thu hồi SP lỗi (giảm 154)':x.thuHoi||0,'Giá thành nhập kho':x.gtNhap??x.c154,'Giá vốn/đv':gtdvOf(x)}))), 'TheoLenh');
    XW.book_append_sheet(wb, excelGiaThanh(p, false), 'Gia thanh BTP');
    XW.book_append_sheet(wb, excelGiaThanh(p, true), 'Gia thanh TP');
    XW.book_append_sheet(wb, XW.json_to_sheet(tpSummary(p).map(x=>({'Mã':x.ma,'Tên':x.ten,'SL SX':x.sl,'621 NVL':x.c621,'622 Nhân công':x.c622,'627 SX chung':x.c627,'154 Giá thành':x.c154,'SL lỗi':x.slLoi||0,'Thu hồi SP lỗi (giảm 154)':x.thuHoi||0,'SL đạt nhập kho':x.slDat,'Giá thành/đv':x.gtdv,'Đơn giá bình quân':x.gv,'SL bán':x.slBan,'Doanh số':x.ds,'Giá bán BQ':x.gb,'Lãi gộp':x.lai,'Tỷ lệ lãi':x.tl}))), 'TheoSanPham');
    XW.book_append_sheet(wb, XW.json_to_sheet(pb), 'PhanBo_622_627');
    ['TheoLenh'].forEach(n=>{ if (wb.Sheets[n]) wb.Sheets[n]['!freeze']={x:4,y:1}; }); if (wb.Sheets['TheoSanPham']) wb.Sheets['TheoSanPham']['!freeze']={x:2,y:1};
    if (wb.Sheets['ChiTiet']) wb.Sheets['ChiTiet']['!freeze']={x:6,y:1}; if (wb.Sheets['PhanBo_622_627']) wb.Sheets['PhanBo_622_627']['!freeze']={x:3,y:1};
    saveWb(wb, `GiaThanh_${selKy}.xlsx`);
  };
}
function orderDetail(o){
  const items=itemMap(); const adj = state.adjustments.filter(a=>a.ngaySX===o.ngaySX && a.maTP===o.maTP);
  const html = `<h3>Lệnh ${esc(o.maLenh)} – ${esc(o.maTP)} ${esc((items[o.maTP]||{}).ten||'')}</h3>
  <div class="bar"><span class="pill">Ngày SX ${fmtD(o.ngaySX)}</span><span class="pill">SL thực hiện ${fmtQ(o.slTH)} ${esc((items[o.maTP]||{}).dvt||'')}${o.bs?` = ${fmtQ(o.soMe)} mẻ × ${fmtQ(o.bs)}`:''}</span><span class="pill">621: ${fmtN(o.c621)}</span><span class="pill">622: ${fmtN(o.c622)}</span><span class="pill">627: ${fmtN(o.c627)}</span><span class="pill ok">154: ${fmtN(o.c154)}${o.thuHoi?` − thu hồi SP lỗi ${fmtN(o.thuHoi)} (${fmtQ(o.slLoi)} lỗi)`:''} → ${fmtN(gtdvOf(o))}/đv</span></div>
  ${table([{t:'Mã VT',f:x=>x.maVT},{t:'Tên vật tư',f:x=>(items[x.maVT]||{}).ten||'(thiếu mã)'},{t:'ĐVT',f:x=>(items[x.maVT]||{}).dvt||''},{t:'Định mức',n:1,d:4,f:x=>x.dm},{t:'SL theo ĐM',n:1,d:3,f:x=>x.slDM},{t:'Cân đối',n:1,d:3,f:x=>x.dc},{t:'Tổng xuất',n:1,d:3,f:x=>x.tong},{t:'Đơn giá',n:1,f:x=>x.dg},{t:'Thành tiền',n:1,f:x=>x.tt,sum:1},{t:'Tồn cuối ngày',n:1,d:2,f:x=>x.tonNgay},{t:'',raw:1,f:x=>x.thayThe?'<span class="pill warn">thay thế</span>':(x.prod?'<span class="pill">giá thành tháng</span>':'')}], o.lines, {total:true, h:'40vh'})}
  <h3 style="margin-top:14px">Cân đối NVL của lệnh này (ngày SX + mã sản phẩm)</h3>
  <div class="bar"><select id="adjVT">${o.lines.map(l=>`<option value="${esc(l.maVT)}">${esc(l.maVT)} – ${esc((items[l.maVT]||{}).ten||'')}</option>`).join('')}${state.items.filter(i=>!isFinal(i) && i.ma!==o.maTP && !o.lines.some(l=>l.maVT===i.ma)).map(i=>`<option value="${esc(i.ma)}">${esc(i.ma)} – ${esc(i.ten)} (ngoài ĐM)</option>`).join('')}</select><input type="number" id="adjSL" placeholder="+/- số lượng" step="any" style="width:130px"><input type="text" id="adjLy" placeholder="Lý do" style="width:220px"><button class="btn p s" id="adjAdd">Thêm</button></div>
  <div id="adjList">${adj.length?table([{t:'Mã VT',f:x=>x.maVT},{t:'SL cân đối',n:1,d:3,f:x=>num(x.dieuChinh)},{t:'Lý do',f:x=>x.lyDo},{t:'',raw:1,f:x=>`<button class="btn s d" data-del="${x._id}">Xóa</button>`}], adj):'<div class="mut small">Chưa có cân đối.</div>'}</div>
  <div style="text-align:right;margin-top:12px"><button class="btn" id="mclose">Đóng</button></div>`;
  modal(html);
  const reopen = () => { const p=P(); const no=p && p.orders.find(x=>x.maLenh===o.maLenh); if (no) orderDetail(no); else { closeModal(); render(); } };
  $('#adjAdd').onclick=()=>{ if (isLocked(kyOf(o.ngaySX))) return toast('Kỳ đã khóa – mở khóa để cân đối'); const sl=num($('#adjSL').value); if(!sl) return toast('Nhập số lượng cân đối'); state.adjustments.push({_id:uid(), ngaySX:o.ngaySX, maTP:o.maTP, maVT:$('#adjVT').value, dieuChinh:sl, lyDo:$('#adjLy').value, nguon:'Tay'}); changed(); calcCache=null; reopen(); };
  document.querySelectorAll('#adjList [data-del]').forEach(b=>b.onclick=()=>{ state.adjustments = state.adjustments.filter(a=>a._id!==b.dataset.del); changed(); calcCache=null; reopen(); });
  $('#mclose').onclick=()=>{ closeModal(); render(); };
}
