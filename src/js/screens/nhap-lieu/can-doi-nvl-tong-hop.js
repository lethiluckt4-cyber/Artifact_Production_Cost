// ---- Tồn đầu kỳ ----
// ---- Danh mục hàng: 2 tab Danh mục VTHH / Nhóm hàng ----
// ---- Cân đối NVL: tab Tổng hợp cân đối theo mặt hàng ----
function cdTabs(act){ return `<div class="tabs"><button data-cdt="ct" class="${act==='ct'?'act':''}">${icon('list')}Chi tiết cân đối</button><button data-cdt="th" class="${act==='th'?'act':''}">${icon('chart')}Tổng hợp CĐ theo mặt hàng</button></div>`; }
function bindCdTabs(m){ m.querySelectorAll('[data-cdt]').forEach(b=>b.onclick=()=>guardEdit(()=>{ m.dataset.cdt=b.dataset.cdt; render(); })); }
function vCdTH(m){
  const p=P(); if(!p) return noData(m); const items=itemMap(); const by={};
  p.lines.forEach(l=>{ const it=items[l.maVT]||{}; const r=by[l.maVT]||(by[l.maVT]={ma:l.maVT, ten:it.ten||'', nhom:it.nhom||'', dvt:it.dvt||'', n:0, giam:0, tang:0, dc:0, gt:0, slDM:0, tong:0}); r.slDM+=num(l.slDM); r.tong+=num(l.tong); if (l.dc) { r.n++; r.dc+=l.dc; if (l.dc<0) r.giam+=l.dc; else r.tang+=l.dc; r.gt+=l.dc*num(l.dg); } });
  const rows=Object.values(by).filter(r=>r.n).map(r=>({...r, tl:r.slDM?r.dc/r.slDM:0})).filter(r=>!search || matchQ(search, [r.ma,r.ten,r.nhom].join(' '))).sort((a,b)=>Math.abs(b.gt)-Math.abs(a.gt) || a.ma.localeCompare(b.ma));
  m.innerHTML = head('Cân đối nguyên vật liệu theo lệnh', `<button class="btn" id="xl" title="Xuất bảng tổng hợp ra Excel">⬇ Xuất Excel</button>`) + cdTabs('th') +
  `<div class="bar"><input type="text" id="q" placeholder="Tìm mã / tên" value="${esc(search)}" style="width:220px"></div>` +
  table([{t:'Mã VT',raw:1,f:x=>`<a href="#" class="malink" data-cdma="${esc(x.ma)}" title="Xem nhập – xuất – tồn của mã này (chọn được kỳ)">${esc(x.ma)}</a>`},{t:'Tên vật tư',f:x=>x.ten},{t:'Nhóm',f:x=>x.nhom},{t:'ĐVT',f:x=>x.dvt},{t:'Số dòng CĐ',n:1,d:0,f:x=>x.n,sum:1},{t:'SL giảm',n:1,d:2,f:x=>x.giam},{t:'SL tăng',n:1,d:2,f:x=>x.tang},{t:'SL cân đối',n:1,d:2,f:x=>x.dc},{t:'Giá trị CĐ',n:1,f:x=>x.gt,sum:1}], rows, {total:true, freeze:2});
  bindKy(); bindSearch(); bindCdTabs(m);
  m.querySelectorAll('a[data-cdma]').forEach(a=>a.onclick=e=>{ e.preventDefault(); const ma=a.dataset.cdma, ky=selKy; guardEdit(()=>{ kyByMenu[menuOf('nxt')]=ky; view='nxt'; m.dataset.nxtTab='th'; search=ma; render(); theKho(ma, ky); }); });
  $('#xl').onclick=()=>exportTable(mainTable(), `TongHopCanDoi_${String(selKy).replace(/[:\/]/g,'-')}.xlsx`, 'CanDoiTheoMatHang');
}
