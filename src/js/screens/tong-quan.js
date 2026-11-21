// ---- Tổng quan ----
function vTongQuan(m){
  const p = P(); if (!p) return noData(m);
  const bien = p.doanhSo ? p.lai/p.doanhSo : 0;
  const c = calc(); const prio = p.nxt.filter(x=>x.risk==='RỦI RO CAO' || (x.status && x.status.includes('cần mua'))).slice(0,40);
  const warns = c.warnings.length; const tp154 = sum(p.orders.filter(o=>o.cd==='TP'),o=>o.c154);
  m.innerHTML = head(`Tổng quan điều hành`) + emptyNote() +
  `<div class="cards">
    <div class="card"><div class="l">Doanh số bán</div><div class="v">${fmtN(p.doanhSo)}</div></div>
    <div class="card"><div class="l">Tổng lãi gộp</div><div class="v">${fmtN(p.lai)}</div><div class="s">Biên lợi nhuận ${fmtP(bien)}</div></div>
    <div class="card"><div class="l">Sản lượng thành phẩm (thùng)</div><div class="v">${fmtQ(p.slSX)}</div></div>
    <div class="card"><div class="l">Giá trị SX thành phẩm (154)</div><div class="v">${fmtN(tp154)}</div></div>
    <div class="card"><div class="l">Giá trị tồn cuối kỳ</div><div class="v">${fmtN(p.tonCuoi)}</div><div class="s">${p.nxt.filter(x=>x.closeSL<-1e-9).length} mã âm kho</div></div>
    <div class="card"><div class="l">Cảnh báo dữ liệu</div><div class="v">${warns}</div><div class="s">${prio.length?`${prio.length} mã rủi ro tồn kho – xem Cảnh báo & kiểm tra`:(warns?'Xem mục Cảnh báo & kiểm tra':'Dữ liệu sạch')}</div></div>
  </div>
`;
  bindKy(); bindSeed();
  m.querySelectorAll('[data-go]').forEach(a=>a.onclick=e=>{ e.preventDefault(); view=a.dataset.go; if(view==='giathanh') m.dataset.tab='tp'; render(); });
}
const gtdvOf = o => o.slDat ? (o.gtNhap ?? o.c154)/o.slDat : (o.slTH ? o.c154/o.slTH : 0); // giá thành nhập kho / đv đạt (đã trừ thu hồi sản phẩm lỗi)
const hasLoi = p => !!p && p.orders.some(o=>o.slLoi>0);
function tpSummary(p){
  const byTP = {};
  p.orders.forEach(o=>{ const x=byTP[o.maTP]||(byTP[o.maTP]={ma:o.maTP, cd:o.cd, sl:0, c621:0, c622:0, c627:0, c154:0, lenh:0, slLoi:0, thuHoi:0, slDat:0, gtNhap:0}); x.sl+=o.slTH; x.c621+=o.c621; x.c622+=o.c622; x.c627+=o.c627; x.c154+=o.c154; x.lenh++; x.slLoi+=o.slLoi||0; x.thuHoi+=o.thuHoi||0; x.slDat+=(o.slDat??o.slTH); x.gtNhap+=(o.gtNhap??o.c154); });
  const items=itemMap(); const lv=calc().levels||{};
  return Object.values(byTP).map(x=>{ const s=p.sales.filter(z=>z.ma===x.ma); const slBan=sum(s,z=>z.sl), ds=sum(s,z=>z.ds); x.ten=(items[x.ma]||{}).ten||''; x.dvt=(items[x.ma]||{}).dvt||''; x.gtdv = x.slDat? x.gtNhap/x.slDat : (x.sl? x.c154/x.sl : 0); x.gv = p.giaVon[x.ma]||0; x.gb = slBan? ds/slBan : 0; x.slBan=slBan; x.ds=ds; x.lai=sum(s,z=>z.lai); x.tl = x.ds ? x.lai/x.ds : 0; x.ton=(p.close[x.ma]||{}).sl||0; x.lv=lv[x.ma]||0; return x; }).sort((a,b)=>(a.lv-b.lv)||a.ma.localeCompare(b.ma));
}
function tpSummaryTable(p){
  return table([
    {t:'Mã sản phẩm',f:x=>x.ma},{t:'Tên sản phẩm',f:x=>x.ten},{t:'Công đoạn',f:x=>x.cd==='TP'?'Thành phẩm':'Bán TP'},{t:'Lệnh',n:1,f:x=>x.lenh},{t:'SL sản xuất',n:1,d:2,f:x=>x.sl},{t:'ĐVT',f:x=>x.dvt},{t:'621 NVL',n:1,f:x=>x.c621,sum:1},{t:'622',n:1,f:x=>x.c622,sum:1},{t:'627',n:1,f:x=>x.c627,sum:1},{t:'Giá thành 154',n:1,f:x=>x.c154,sum:1}, ...(hasLoi(p)?[{t:'SL lỗi',n:1,d:2,f:x=>x.slLoi||'',sum:1},{t:'Thu hồi SP lỗi (giảm 154)',n:1,f:x=>x.thuHoi||'',sum:1},{t:'SL đạt nhập kho',n:1,d:2,f:x=>x.slDat}]:[]),{t:'Giá thành/đv',n:1,f:x=>x.gtdv},{t:'Đơn giá bình quân',n:1,f:x=>x.gv},{t:'SL bán',n:1,d:2,f:x=>x.slBan},{t:'Giá bán BQ',n:1,f:x=>x.gb},{t:'Lãi gộp',n:1,f:x=>x.lai,sum:1},{t:'Tỷ lệ lãi',n:1,f:x=>x.tl,fmt:fmtP},{t:'Tồn cuối kỳ',n:1,d:2,f:x=>x.ton}
  ], tpSummary(p), {total:true, h:'50vh', freeze:2});
}
