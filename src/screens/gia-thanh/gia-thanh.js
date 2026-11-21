//# Màn hình Giá thành, chi tiết lệnh
// ---- Giá thành ----
function ctCols(p){
  const IM=itemMap(); const om={}; p.orders.forEach(o=>om[o.maLenh]=o);
  const O=x=>om[x.maLenh]||{}; const raw=x=>O(x).o||{};
  return [
    {t:'Lệnh SX', f:x=>x.maLenh},
    {t:'Ngày SX', d:1, f:x=>x.ngaySX},
    {t:'Ngày xuất NVL', d:1, f:x=>x.ngayXuatNVL},
    {t:'Công đoạn', f:x=>'Sản xuất'},
    {t:'Mã thành phẩm', f:x=>x.maTP},
    {t:'Tên thành phẩm', f:x=>(IM[x.maTP]||{}).ten||''},
    {t:'ĐVT TP', f:x=>(IM[x.maTP]||{}).dvt||''},
    {t:'SL lệnh', n:1, d:2, f:x=>num(raw(x).soMeKH)*num(O(x).slTP)},
    {t:'Điều chỉnh TP', n:1, d:2, f:x=>num(raw(x).dieuChinhMe)*num(O(x).slTP)},
    {t:'SL thực hiện', n:1, d:2, f:x=>x.slTH},
    {t:'Số mẻ', n:1, d:2, f:x=>x.soMe},
    {t:'Mã NVL / VT', f:x=>x.maVT},
    {t:'Tên NVL / VT', f:x=>(IM[x.maVT]||{}).ten||''},
    {t:'Nhóm', f:x=>(IM[x.maVT]||{}).nhom||''},
    {t:'ĐVT', f:x=>(IM[x.maVT]||{}).dvt||''},
    {t:'Loại', f:x=>(x.loaiDM||'DM')+(x.thayThe?' – thay thế':'')},
    {t:'Định mức', n:1, d:4, f:x=>x.dm},
    {t:'Mẻ / SL', n:1, d:2, f:x=>O(x).slTP},
    {t:'SL theo ĐM', n:1, d:2, f:x=>x.slDM},
    {t:'Cân đối', n:1, d:2, f:x=>x.tong-x.slDM},
    {t:'Tổng SL xuất', n:1, d:2, f:x=>x.tong},
    {t:'Đơn giá', n:1, d:0, f:x=>x.dg},
    {t:'621 Thành tiền', n:1, f:x=>x.tt, sum:1},
    {t:'Tỷ trọng 621 trong lệnh', n:1, pct:1, f:x=>O(x).c621?x.tt/O(x).c621:0},
    {t:'622 phân bổ', n:1, f:x=>x.c622, sum:1},
    {t:'627 phân bổ', n:1, f:x=>x.c627, sum:1},
    {t:'154 Giá thành', n:1, f:x=>x.c154, sum:1},
    {t:'Giá thành/đv lệnh', n:1, f:x=>O(x).slTH?O(x).c154/O(x).slTH:0},
  ];
}
function ctExport(p){
  if (typeof XLSX==='undefined') return null; const cols=ctCols(p);
  const rows=p.lines.filter(x=>matchSearch(search,[x.maLenh,x.maVT,x.maTP,(itemMap()[x.maVT]||{}).ten,(itemMap()[x.maTP]||{}).ten,dTxt(x.ngaySX),dTxt(x.ngayXuatNVL)]));
  const aoa=[cols.map(c=>c.t), ...rows.map(x=>cols.map(c=>{ const v=c.f(x); return (c.n && typeof v==='number') ? round(v,6) : (v==null?'':v); }))];
  const ws=XLSX.utils.aoa_to_sheet(aoa); ws['!cols']=cols.map(c=>({wch:Math.max(11,Math.min(30,c.t.length+3))})); return ws;
}
function vGiaThanh(m){
  const p=P(); if(!p) return noData(m); const IM=itemMap();
  const tab = m.dataset.tab||'lenh';
  let body='';
  if (tab==='tp') body = tpSummaryTable(p);
  else if (tab==='ct') body = table(ctCols(p).map(c=>({t:c.t, n:c.n, d:c.d===1?undefined:c.d, sum:c.sum, f:c.f, fmt:c.pct?fmtP:(c.d===1?(v=>fmtD(v)):undefined)})), p.lines.filter(x=>matchSearch(search,[x.maLenh,x.maVT,x.maTP,(IM[x.maVT]||{}).ten,(IM[x.maTP]||{}).ten,dTxt(x.ngaySX),dTxt(x.ngayXuatNVL)])), {total:true});
  else if (tab==='lenh') body = table([
    {t:'Mã lệnh',f:x=>x.maLenh},{t:'Tháng SX',f:x=>x.ngaySX?String(+x.ngaySX.slice(5,7)):''},{t:'Ngày nhập kho TP',f:x=>fmtD(x.ngaySX)},{t:'Mã TP',f:x=>x.maTP},{t:'Tên thành phẩm',f:x=>(itemMap()[x.maTP]||{}).ten||''},{t:'ĐVT',f:x=>(itemMap()[x.maTP]||{}).dvt||''},{t:'Loại ĐM',f:x=>x.loaiDM},{t:'Tổng loại NVL',n:1,f:x=>x.lines.length},{t:'Số mẻ',n:1,d:2,f:x=>x.soMe},{t:'SL/mẻ',n:1,d:2,f:x=>x.slTP},{t:'SL sản xuất',n:1,d:2,f:x=>x.slTH,sum:1},{t:'Ngày xuất NVL',f:x=>fmtD(x.ngayXuatNVL)},{t:'621 NVL',n:1,f:x=>x.c621,sum:1},{t:'622',n:1,f:x=>x.c622,sum:1},{t:'627',n:1,f:x=>x.c627,sum:1},{t:'Giá thành 154',n:1,f:x=>x.c154,sum:1},{t:'Giá thành/đv',n:1,f:x=>x.slTH?x.c154/x.slTH:0},{t:'Kiểm tra',f:x=>x.status,raw:1,fmt:v=>`<span class="pill ${v==='Đủ'?'ok':'bad'}">${esc(v)}</span>`}
  ], p.orders.filter(x=>matchSearch(search,[x.maLenh,x.maTP,(IM[x.maTP]||{}).ten,dTxt(x.ngaySX),dTxt(x.ngayXuatNVL),x.loaiDM,x.status])), {total:true, click:true});
  else body = table([
    {t:'Mã lệnh',f:x=>x.maLenh},{t:'Tháng SX',f:x=>x.ngaySX?String(+x.ngaySX.slice(5,7)):''},{t:'Ngày nhập kho TP',f:x=>fmtD(x.ngaySX)},{t:'Mã TP',f:x=>x.maTP},{t:'Tên thành phẩm',f:x=>(IM[x.maTP]||{}).ten||''},{t:'ĐVT TP',f:x=>(IM[x.maTP]||{}).dvt||''},{t:'Loại ĐM',f:x=>x.loaiDM},{t:'Tổng loại NVL',n:1,f:x=>x.nLoai},{t:'SL sản xuất',n:1,d:2,f:x=>x.slTH},{t:'Tỷ lệ hao hụt',n:1,f:x=>x.haoHut,fmt:v=>v?fmtP(v):''},{t:'Tháng xuất VT',f:x=>x.ngayXuatNVL?String(+x.ngayXuatNVL.slice(5,7)):''},{t:'Ngày xuất kho NVL',f:x=>fmtD(x.ngayXuatNVL)},{t:'Mã VT',f:x=>x.maVT+(x.thayThe?' (thay thế)':'')},{t:'Tên vật tư',f:x=>(IM[x.maVT]||{}).ten||''},{t:'ĐVT',f:x=>(IM[x.maVT]||{}).dvt||''},{t:'Định mức/mẻ',n:1,d:4,f:x=>x.dm},{t:'Số lần SX',n:1,d:2,f:x=>x.soMe},{t:'SL theo ĐM',n:1,d:2,f:x=>x.slDM},{t:'Điều chỉnh',n:1,d:2,f:x=>x.dc},{t:'Tổng SL xuất',n:1,d:2,f:x=>x.tong},{t:'Đơn giá',n:1,f:x=>x.dg},{t:'Thành tiền',n:1,f:x=>x.tt,sum:1},{t:'NVL tồn cuối ngày',n:1,d:2,f:x=>x.tonNgay},{t:'621',n:1,f:x=>x.tt,sum:1},{t:'622',n:1,f:x=>x.c622,sum:1},{t:'627',n:1,f:x=>x.c627,sum:1},{t:'154',n:1,f:x=>x.c154,sum:1}
  ], p.lines.filter(x=>matchSearch(search,[x.maLenh,x.maVT,x.maTP,(IM[x.maVT]||{}).ten,(IM[x.maTP]||{}).ten,dTxt(x.ngaySX),dTxt(x.ngayXuatNVL),x.loaiDM])), {total:true});
  m.innerHTML = head(`Giá thành ${isRange(selKy)||selKy.length===4?'':'tháng '}${fmtKy(selKy)}`, `<button class="btn" id="xl">${IC('xlOut')}Xuất Excel</button>`) +
  `<div class="tabs"><button data-t="lenh" class="${tab==='lenh'?'act':''}">Theo lệnh sản xuất</button><button data-t="nvl" class="${tab==='nvl'?'act':''}">Nhật ký xuất vật tư</button><button data-t="tp" class="${tab==='tp'?'act':''}">Theo thành phẩm</button><button data-t="ct" class="${tab==='ct'?'act':''}">Chi tiết</button></div>
  <div class="bar">${tab!=='tp'?`<input type="text" id="q" placeholder="Lọc theo lệnh / mã" value="${esc(search)}">`:''}</div>` + body;
  bindKy(); m.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>guardEdit(()=>{ m.dataset.tab=b.dataset.t; render(); }));
  if ($('#q')) bindSearch();
  if (tab==='lenh') m.querySelectorAll('tbody tr[data-i]').forEach(tr=>tr.onclick=()=>orderDetail(p.orders[+tr.dataset.i]));
  $('#xl').onclick=()=>{
    if (typeof XLSX==='undefined') return toast('Thư viện Excel chưa tải được');
    const wb = XLSX.utils.book_new();
    if (tab==='ct') { XLSX.utils.book_append_sheet(wb, ctExport(p), 'ChiTiet'); saveWb(wb, `GiaThanh_ChiTiet_${selKy}.xlsx`); return; }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(p.orders.map(x=>({'Mã lệnh':x.maLenh,'Tháng SX':x.ngaySX?+x.ngaySX.slice(5,7):'','Ngày nhập kho TP':x.ngaySX,'Mã TP':x.maTP,'Tên thành phẩm':(IM[x.maTP]||{}).ten||'','ĐVT':(IM[x.maTP]||{}).dvt||'','Loại ĐM':x.loaiDM,'Tổng loại NVL':x.lines.length,'Số mẻ':x.soMe,'SL sản xuất':x.slTH,'621':x.c621,'622':x.c622,'627':x.c627,'154':x.c154,'Giá thành/đv':x.slTH?x.c154/x.slTH:0,'Kiểm tra':x.status}))), 'TheoLenh');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(p.lines.map(x=>({'Mã lệnh':x.maLenh,'Tháng SX':x.ngaySX?+x.ngaySX.slice(5,7):'','Ngày nhập kho TP':x.ngaySX,'Mã TP':x.maTP,'Tên thành phẩm':(IM[x.maTP]||{}).ten||'','ĐVT TP':(IM[x.maTP]||{}).dvt||'','Loại ĐM':x.loaiDM,'Tổng loại NVL':x.nLoai,'SL sản xuất':x.slTH,'Tỷ lệ hao hụt':x.haoHut,'Tháng xuất VT':x.ngayXuatNVL?+x.ngayXuatNVL.slice(5,7):'','Ngày xuất kho NVL':x.ngayXuatNVL,'Mã VT':x.maVT,'Tên vật tư':(IM[x.maVT]||{}).ten||'','ĐVT':(IM[x.maVT]||{}).dvt||'','Định mức/mẻ':x.dm,'Số lần SX':x.soMe,'SL theo ĐM':x.slDM,'Điều chỉnh':x.dc,'Tổng SL xuất':x.tong,'Đơn giá':x.dg,'Thành tiền':x.tt,'NVL tồn cuối ngày':x.tonNgay,'621':x.tt,'622':x.c622,'627':x.c627,'154':x.c154}))), 'XuatVatTu');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(tpSummary(p).map(x=>({'Mã TP':x.ma,'Tên':x.ten,'SL SX':x.sl,'621':x.c621,'622':x.c622,'627':x.c627,'154':x.c154,'Giá thành/đv':x.gtdv,'Giá vốn BQ':x.gv,'SL bán':x.slBan,'Doanh số':x.ds,'Giá bán BQ':x.gb,'Lãi gộp':x.lai,'Tỷ lệ lãi':x.tl}))), 'TheoTP');
    XLSX.utils.book_append_sheet(wb, ctExport(p), 'ChiTiet');
    saveWb(wb, `GiaThanh_${selKy}.xlsx`);
  };
}
function orderDetail(o){
  const items=itemMap(); const adj = state.adjustments.filter(a=>a.maLenh===o.maLenh);
  const html = `<h3>Lệnh ${esc(o.maLenh)} – ${esc(o.maTP)} ${esc((items[o.maTP]||{}).ten||'')}</h3>
  <div class="bar"><span class="pill">Ngày SX ${fmtD(o.ngaySX)}</span><span class="pill">Số mẻ ${fmtQ(o.soMe)} × ${fmtQ(o.slTP)} = ${fmtQ(o.slTH)} ${esc((items[o.maTP]||{}).dvt||'')}</span><span class="pill">621: ${fmtN(o.c621)}</span><span class="pill">622: ${fmtN(o.c622)}</span><span class="pill">627: ${fmtN(o.c627)}</span><span class="pill ok">154: ${fmtN(o.c154)} → ${fmtN(o.slTH?o.c154/o.slTH:0)}/đv</span></div>
  ${table([{t:'Mã VT',f:x=>x.maVT},{t:'Tên vật tư',f:x=>(items[x.maVT]||{}).ten||'(thiếu mã)'},{t:'ĐVT',f:x=>(items[x.maVT]||{}).dvt||''},{t:'ĐM/mẻ',n:1,d:4,f:x=>x.dm},{t:'SL theo ĐM',n:1,d:2,f:x=>x.slDM},{t:'Điều chỉnh',n:1,d:2,f:x=>x.dc},{t:'Tổng xuất',n:1,d:2,f:x=>x.tong},{t:'Đơn giá',n:1,f:x=>x.dg},{t:'Thành tiền',n:1,f:x=>x.tt,sum:1},{t:'Tồn cuối ngày',n:1,d:2,f:x=>x.tonNgay},{t:'',raw:1,f:x=>x.thayThe?'<span class="pill warn">thay thế</span>':''}], o.lines, {total:true, h:'40vh'})}
  <h3 style="margin-top:14px">Cân đối NVL của lệnh này</h3>
  <div class="bar"><select id="adjVT">${o.lines.map(l=>`<option value="${esc(l.maVT)}">${esc(l.maVT)} – ${esc((items[l.maVT]||{}).ten||'')}</option>`).join('')}${state.items.filter(i=>i.nhom!=='Thành phẩm' && !o.lines.some(l=>l.maVT===i.ma)).map(i=>`<option value="${esc(i.ma)}">${esc(i.ma)} – ${esc(i.ten)} (ngoài ĐM)</option>`).join('')}</select><input type="number" id="adjSL" placeholder="+/- số lượng" step="any" style="width:130px"><input type="text" id="adjLy" placeholder="Lý do" style="width:220px"><button class="btn p s" id="adjAdd">Thêm</button></div>
  <div id="adjList">${adj.length?table([{t:'Mã VT',f:x=>x.maVT},{t:'Điều chỉnh',n:1,d:2,f:x=>num(x.dieuChinh)},{t:'Lý do',f:x=>x.lyDo},{t:'',raw:1,f:x=>`<button class="btn s io d" data-del="${x._id}" title="Xóa" aria-label="Xóa">${IC('trash')}</button>`}], adj):'<div class="mut small">Chưa có điều chỉnh.</div>'}</div>
  <div style="text-align:right;margin-top:12px"><button class="btn" id="mclose">Đóng</button></div>`;
  modal(html);
  $('#adjAdd').onclick=()=>{ if (isLocked(kyOf(o.ngayXuatNVL))) return toast('Kỳ đã khóa – mở khóa để điều chỉnh'); const sl=num($('#adjSL').value); if(!sl) return toast('Nhập số lượng điều chỉnh'); state.adjustments.push({_id:uid(), maLenh:o.maLenh, maVT:$('#adjVT').value, dieuChinh:sl, lyDo:$('#adjLy').value}); changed(); const p=P(); const no=p.orders.find(x=>x.maLenh===o.maLenh); orderDetail(no); };
  document.querySelectorAll('#adjList [data-del]').forEach(b=>b.onclick=()=>{ state.adjustments = state.adjustments.filter(a=>a._id!==b.dataset.del); changed(); const p=P(); orderDetail(p.orders.find(x=>x.maLenh===o.maLenh)); });
  $('#mclose').onclick=()=>{ closeModal(); render(); };
}
