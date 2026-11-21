//# Báo cáo bán hàng theo mặt hàng
// ---- Bán hàng ----
function salesLines(p, ps){ const diff=liveDiff(); const gvS={}; if (diff && ps) (ps.nxt||[]).forEach(y=>gvS[y.ma]=num(y.gv)); return p.sales.map(x=>{ const g0 = diff ? (gvS[x.ma]||0) : num(x.gv); const sl=num(x.sl), ds=num(x.ds); return {r:x.r, ngay:x.ngay, ma:x.ma, sl, ds, gb: sl?ds/sl:0, gv:g0, gvTT:g0*sl, lai: diff ? ds-g0*sl : num(x.lai)}; }); }
function salesDetail(ma){
  const p=PL(); const L=salesLines(p, P()).filter(x=>x.ma===ma).sort((a,b)=>a.ngay<b.ngay?-1:1); const it=itemMap()[ma]||{};
  const S={sl:sum(L,x=>x.sl), ds:sum(L,x=>x.ds), gvTT:sum(L,x=>x.gvTT), lai:sum(L,x=>x.lai)};
  modal(`<div class="hd"><h3>Bán hàng – ${esc(ma)} · ${esc(it.ten||'')} <span class="mut small">(${fmtKy(selKy)})</span></h3><button class="x" id="sdX" title="Đóng" aria-label="Đóng">${IC('x')}</button></div>
   <div class="tw tk"><table><thead><tr><th>Ngày</th><th class="n">SL bán</th><th class="n">Đơn giá bán</th><th class="n">Doanh số</th><th class="n">Giá vốn</th><th class="n">Giá vốn hàng bán</th><th class="n">Lãi gộp</th><th class="n">Tỷ lệ lãi</th></tr></thead><tbody>
   ${L.map(x=>`<tr><td><a href="#" class="lnk" data-src="sales|${x.r&&x.r._id}">${fmtD(x.ngay)}</a></td><td class="n">${fmtQ(x.sl)}</td><td class="n">${fmtN(x.gb)}</td><td class="n">${fmtN(x.ds)}</td><td class="n">${fmtN(x.gv)}</td><td class="n">${fmtN(x.gvTT)}</td><td class="n">${fmtN(x.lai)}</td><td class="n">${x.ds?fmtP(x.lai/x.ds):''}</td></tr>`).join('')}
   <tr class="tot"><td>Cộng</td><td class="n">${fmtQ(S.sl)}</td><td class="n">${S.sl?fmtN(S.ds/S.sl):''}</td><td class="n">${fmtN(S.ds)}</td><td class="n">${S.sl?fmtN(S.gvTT/S.sl):''}</td><td class="n">${fmtN(S.gvTT)}</td><td class="n">${fmtN(S.lai)}</td><td class="n">${S.ds?fmtP(S.lai/S.ds):''}</td></tr></tbody></table></div>
   <div class="ft"><button class="btn" id="sdXl">${IC('xlOut')}Xuất Excel</button><button class="btn p" id="sdC">Đóng</button></div>`);
  $('#modal .in').classList.add('tcm','wide'); $('#sdX').onclick=$('#sdC').onclick=()=>closeModal();
  bindSrc($('#modal .in'), ()=>salesDetail(ma));
  $('#sdXl').onclick=()=>exportSheet(`BanHang_${ma}_${selKy}.xlsx`,'BanHang', L.map(x=>({'Ngày':x.ngay,'SL bán':x.sl,'Đơn giá bán':x.gb,'Doanh số':x.ds,'Giá vốn':x.gv,'Giá vốn hàng bán':x.gvTT,'Lãi gộp':x.lai,'Tỷ lệ lãi':x.ds?x.lai/x.ds:0})));
}
function vBanHang(m){
  const p=PL(); if(!p) return noData(m); const ps=P();
  const items=itemMap(); const GL = groupCodes(); const fg = pickFn('bhNhom');
  const byMa={}; salesLines(p, ps).forEach(x=>{ const r=byMa[x.ma]||(byMa[x.ma]={ma:x.ma, ten:(items[x.ma]||{}).ten||'', nhom:(items[x.ma]||{}).nhom||'', dvt:(items[x.ma]||{}).dvt||'', sl:0, ds:0, gvTT:0, lai:0}); r.sl+=x.sl; r.ds+=x.ds; r.gvTT+=x.gvTT; r.lai+=x.lai; });
  let rows = Object.values(byMa).filter(r=>fg(r.nhom) && matchSearch(search,[r.ma,r.ten,r.nhom,r.dvt]));
  const tongDS = sum(rows,r=>r.ds); rows = rows.map(r=>({...r, gb:r.sl?r.ds/r.sl:0, gv:r.sl?r.gvTT/r.sl:0, tl:r.ds?r.lai/r.ds:0, tt:tongDS?r.ds/tongDS:0})).sort((a,b)=>b.ds-a.ds);
  const cols=[{t:'Mã',raw:1,f:x=>`<a href="#" class="lnk u" data-sd="${esc(x.ma)}">${esc(x.ma)}</a>`,sv:x=>x.ma},{t:'Mặt hàng',f:x=>x.ten},{t:'Nhóm',f:x=>x.nhom},{t:'ĐVT',f:x=>x.dvt},{t:'SL bán',n:1,d:2,f:x=>x.sl,sum:1},{t:'Đơn giá bán BQ',n:1,f:x=>x.gb},{t:'Doanh số',n:1,f:x=>x.ds,sum:1},{t:'Tỷ trọng doanh số',n:1,f:x=>x.tt,fmt:fmtP},{t:'Giá vốn',n:1,f:x=>x.gv},{t:'Giá vốn hàng bán',n:1,f:x=>x.gvTT,sum:1},{t:'Lãi gộp',n:1,f:x=>x.lai,sum:1},{t:'Tỷ lệ lãi',n:1,f:x=>x.tl,fmt:fmtP}];
  m.innerHTML = head('Tổng hợp bán hàng theo mặt hàng', `<button class="btn" id="xl">${IC('xlOut')}Xuất Excel</button>`) + liveNote() +
  `<div class="bar"><input type="text" id="q" placeholder="Tìm mã / tên" value="${esc(search)}" style="width:220px">${pickHtml('bhNhom','Nhóm',GL.map(g=>[g,g]))}<span class="pill">${rows.length} mặt hàng</span></div>` +
  table(cols, rows, {total:true});
  bindKy(); bindSearch(); bindPick(m);
  m.querySelectorAll('[data-sd]').forEach(a=>{ a.onclick=e=>{ e.preventDefault(); e.stopPropagation(); salesDetail(a.dataset.sd); }; const tr=a.closest('tr'); if (tr) { tr.classList.add('clk'); tr.onclick=e=>{ if (e.target.closest('button,input,a,.flt')) return; salesDetail(a.dataset.sd); }; } });
  $('#xl').onclick=()=>exportDomTable(m.querySelector('.tw table'), `BaoCaoBanHang_${selKy}.xlsx`, 'BanHangTheoMatHang');
}
