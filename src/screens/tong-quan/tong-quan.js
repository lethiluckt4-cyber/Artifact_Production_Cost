//# Màn hình Tổng quan
function vTongQuan(m){
  // Số liệu luôn mới: tính lại tự động theo dữ liệu hiện có, không cần bấm ▶ Tính giá thành
  const p = PL(); if (!p) return noData(m);
  const bien = p.doanhSo ? p.lai/p.doanhSo : 0; const c = calcLive(); const warns = c.warnings.length; const am = p.nxt.filter(x=>x.closeSL<0).length;
  const tp = (p.nxt||[]).filter(x=>x.nhom==='Thành phẩm'); const tonTP = sum(tp,x=>Math.max(0,x.closeTT||0));
  const dvtTP = (()=>{ const it=itemMap(); const s=new Set(p.orders.map(o=>(it[o.maTP]||{}).dvt).filter(Boolean)); return s.size===1 ? [...s][0] : 'kg'; })();
  m.innerHTML = head('Tổng quan điều hành') + emptyNote() +
  `<div class="cards">
    <div class="card"><div class="l">Doanh số bán</div><div class="v">${fmtN(p.doanhSo)}</div></div>
    <div class="card"><div class="l">Tổng lãi gộp</div><div class="v">${fmtN(p.lai||0)}</div><div class="s">Biên lợi nhuận ${fmtP(bien)}</div></div>
    <div class="card"><div class="l">Sản lượng thành phẩm (${esc(dvtTP)})</div><div class="v">${fmtQ(p.slSX)}</div></div>
    <div class="card"><div class="l">Giá trị SX thành phẩm (154)</div><div class="v">${fmtN(p.sum154||0)}</div></div>
    <div class="card"><div class="l">Giá trị tồn cuối kỳ</div><div class="v">${fmtN(p.tonCuoi||0)}</div><div class="s">${am} mã âm kho · TP ${fmtN(tonTP)}</div></div>
    <div class="card"><div class="l">Cảnh báo dữ liệu</div><div class="v">${warns}</div><div class="s">${warns?'Xem mục Cảnh báo & kiểm tra':'Dữ liệu sạch'}</div></div>
  </div>`;
  bindKy(); bindSeed();
}
function tpSummary(p){
  const byTP = {};
  p.orders.forEach(o=>{ const x=byTP[o.maTP]||(byTP[o.maTP]={ma:o.maTP, sl:0, c621:0, c622:0, c627:0, c154:0, lenh:0}); x.sl+=o.slTH; x.c621+=o.c621; x.c622+=o.c622; x.c627+=o.c627; x.c154+=o.c154; x.lenh++; });
  const items=itemMap();
  return Object.values(byTP).map(x=>{ const s=p.sales.filter(z=>z.ma===x.ma); const slBan=sum(s,z=>z.sl), ds=sum(s,z=>z.ds); x.ten=(items[x.ma]||{}).ten||''; x.gtdv = x.sl? x.c154/x.sl : 0; x.gv = p.giaVon[x.ma]||0; x.gb = slBan? ds/slBan : 0; x.slBan=slBan; x.ds=ds; x.lai=sum(s,z=>z.lai); x.tl = x.gb ? (x.gb-x.gv)/x.gb : 0; x.ton=(p.close[x.ma]||{}).sl||0; return x; }).sort((a,b)=>a.ma.localeCompare(b.ma));
}
function tpSummaryTable(p){
  return table([
    {t:'Mã TP',f:x=>x.ma},{t:'Tên',f:x=>x.ten},{t:'Lệnh',n:1,f:x=>x.lenh},{t:'SL sản xuất',n:1,d:2,f:x=>x.sl,sum:1},{t:'621 NVL',n:1,f:x=>x.c621,sum:1},{t:'622',n:1,f:x=>x.c622,sum:1},{t:'627',n:1,f:x=>x.c627,sum:1},{t:'Giá thành 154',n:1,f:x=>x.c154,sum:1},{t:'Giá thành/đv',n:1,f:x=>x.gtdv},{t:'Giá vốn kho BQ',n:1,f:x=>x.gv},{t:'SL bán',n:1,d:2,f:x=>x.slBan,sum:1},{t:'Giá bán BQ',n:1,f:x=>x.gb},{t:'Lãi gộp',n:1,f:x=>x.lai,sum:1},{t:'Tỷ lệ lãi',n:1,f:x=>x.tl,fmt:fmtP},{t:'Tồn cuối',n:1,d:2,f:x=>x.ton}
  ], tpSummary(p), {total:true, h:'50vh'});
}
