// ---- Bán hàng ----
function vBanHang(m){
  const p=P(); if(!p) return noData(m);
  const items=itemMap();
  const byTP={}; p.sales.forEach(x=>{ const it=items[x.ma]||{}; const r=byTP[x.ma]||(byTP[x.ma]={ma:x.ma, ten:it.ten||'', nhom:it.nhom||'', dvt:it.dvt||'', sl:0, ds:0, gvTT:0, lai:0, hd:new Set()}); r.sl+=num(x.sl); r.ds+=num(x.ds); r.gvTT+=num(x.gv)*num(x.sl); r.lai+=num(x.lai); if (x.hoaDon) r.hd.add(x.hoaDon); });
  const totDS = sum(Object.values(byTP), r=>r.ds);
  const rows = Object.values(byTP).map(r=>{ const n=p.nxt.find(x=>x.ma===r.ma)||{}; return {...r, gb:r.sl?r.ds/r.sl:0, gv:r.sl?r.gvTT/r.sl:0, tl:r.ds?r.lai/r.ds:0, tt:totDS?r.ds/totDS:0, soHD:r.hd.size, ton:n.closeSL||0}; })
    .filter(r=>!search || matchQ(search, [r.ma,r.ten,r.nhom].join(' '))).sort((a,b)=>b.ds-a.ds);
  m.innerHTML = head(`Tổng hợp bán hàng theo mặt hàng`, `<button class="btn" id="xl">⬇ Xuất Excel</button>`) +
  `<div class="cards" style="margin:8px 0"><div class="card"><div class="l">Doanh số</div><div class="v">${fmtN(p.doanhSo)}</div></div><div class="card"><div class="l">Giá vốn hàng bán</div><div class="v">${fmtN(p.doanhSo-p.lai)}</div></div><div class="card"><div class="l">Lãi gộp</div><div class="v">${fmtN(p.lai)}</div></div></div>
  <div class="bar"><input type="text" id="q" placeholder="Tìm mã / tên" value="${esc(search)}" style="width:220px"></div>` +
  table([{t:'Mã',raw:1,f:x=>`<a href="#" class="malink" data-bma="${esc(x.ma)}" title="Xem các dòng bán hàng của mã này">${esc(x.ma)}</a>`},{t:'Mặt hàng',f:x=>x.ten},{t:'Nhóm',f:x=>x.nhom},{t:'ĐVT',f:x=>x.dvt},{t:'SL bán',n:1,d:2,f:x=>x.sl,sum:1},{t:'Đơn giá bán BQ',n:1,f:x=>x.gb},{t:'Doanh số',n:1,f:x=>x.ds,sum:1},{t:'Tỷ trọng doanh số',n:1,f:x=>x.tt,fmt:fmtP},{t:'Giá vốn',n:1,f:x=>x.gv},{t:'Giá vốn hàng bán',n:1,f:x=>x.gvTT,sum:1},{t:'Lãi gộp',n:1,f:x=>x.lai,sum:1},{t:'Tỷ lệ lãi',n:1,f:x=>x.tl,fmt:fmtP}], rows, {total:true, freeze:2});
  bindKy(); bindSearch();
  m.querySelectorAll('a[data-bma]').forEach(a=>a.onclick=e=>{ e.preventDefault(); banHangCT(a.dataset.bma); });
  $('#xl').onclick=()=>exportTable(mainTable(), `TongHopBanHang_${String(selKy).replace(/[:\/]/g,'-')}.xlsx`, 'TheoMatHang');
}
// Chi tiết các dòng bán của 1 mã hàng trong kỳ đang chọn (tạo nên số trên bảng tổng hợp)
function banHangCT(ma){
  const p=P(); if(!p) return; const it=itemMap()[ma]||{};
  const L=p.sales.filter(x=>x.ma===ma).slice().sort((a,b)=>String(a.ngay).localeCompare(String(b.ngay)) || String(a.hoaDon).localeCompare(String(b.hoaDon)));
  const T={sl:0,ds:0,gvTT:0,lai:0}; L.forEach(x=>{ T.sl+=num(x.sl); T.ds+=num(x.ds); T.gvTT+=num(x.gv)*num(x.sl); T.lai+=num(x.lai); });
  const nc=(v,d)=>`<td class="n ${typeof v==='number'&&v<0?'neg':''}">${v==null?'':fmtN(v,d||0)}</td>`;
  const body=L.map(x=>`<tr><td>${esc(fmtD(x.ngay))}</td><td><a href="#" class="malink" data-ed="sales|${esc(x.r._id)}" title="Mở chứng từ">${esc(x.hoaDon||'(chưa có số)')}</a></td><td>${esc(x.khach||'')}</td>${nc(x.sl,2)}${nc(x.gb)}${nc(x.ds)}${nc(x.gv)}${nc(x.gv*x.sl)}${nc(x.lai)}<td class="n">${fmtP(x.ds?x.lai/x.ds:0)}</td></tr>`).join('') +
    `<tr class="tot"><td colspan="3">Cộng ${fmtN(L.length)} dòng</td>${nc(T.sl,2)}${nc(T.sl?T.ds/T.sl:0)}${nc(T.ds)}${nc(T.sl?T.gvTT/T.sl:0)}${nc(T.gvTT)}${nc(T.lai)}<td class="n">${fmtP(T.ds?T.lai/T.ds:0)}</td></tr>`;
  modal(`<h3>Chi tiết bán hàng: ${esc(ma)} – ${esc(it.ten||'')} <span class="mut" style="font-weight:400">· ${esc(isRange(selKy)||selKy.length===4?'':'tháng ')}${esc(fmtKy(selKy))}</span></h3>
  <div class="tw" style="max-height:62vh"><table class="thekho"><thead><tr><th>Ngày</th><th>Số hóa đơn</th><th>Khách hàng</th><th class="n">SL bán</th><th class="n">Đơn giá bán</th><th class="n">Doanh số</th><th class="n">Giá vốn</th><th class="n">Giá vốn hàng bán</th><th class="n">Lãi gộp</th><th class="n">Tỷ lệ lãi</th></tr></thead><tbody>${body}</tbody></table></div>
  <div style="text-align:right;margin-top:12px"><button class="btn" id="bhXl">Xuất Excel</button> <button class="btn p" id="mc">Đóng</button></div>`);
  $('#modal .in').style.maxWidth='1240px'; bindCtLinks($('#modal'), ()=>{ view='banhang'; render(); banHangCT(ma); });
  $('#mc').onclick=()=>{ closeModal(); render(); };
  $('#bhXl').onclick=()=>exportTable($('#modal .tw table'), `BanHang_${ma}_${String(selKy).replace(/[:\/]/g,'-')}.xlsx`, 'Ban hang');
}
