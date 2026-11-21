//# Cân đối NVL: tab Tổng hợp CĐ theo mặt hàng
let cdTab = 'lenh';
const cdTabs = () => `<div class="tabs"><button data-cdt="lenh" class="${cdTab==='lenh'?'act':''}">Cân đối theo lệnh</button><button data-cdt="th" class="${cdTab==='th'?'act':''}">Tổng hợp CĐ theo mặt hàng</button></div>`;
function bindCd(m){ m.querySelectorAll('[data-cdt]').forEach(b=>b.onclick=()=>guardEdit(()=>{ cdTab=b.dataset.cdt; render(); }));
  const t=$('#cdT'); if (t) t.onclick=()=>guardEdit(()=>transferDialog()); const b=$('#cdB'); if (b) b.onclick=()=>guardEdit(()=>balanceDialog()); const u=$('#cdU'); if (u) u.onclick=()=>guardEdit(()=>undoTransferDialog(d=>selHas(d))); }
// Tổng hợp cân đối NVL theo mặt hàng (kỳ đang xem)
function vCdSum(m){ const g=GRID.adjustments; const it=itemMap(); const c=calcLive(); const om={}; state.orders.forEach(o=>om[o.maLenh]=o);
  const kyR=r=>{ const o=om[r.maLenh]; return o?kyOf(o.ngayXuatNVL):kyOf(r.ngaySX||''); };
  const gia=r=>{ const pp=(c.periods||{})[kyR(r)]; return pp && pp.giaVon ? (pp.giaVon[r.maVT]||0) : 0; };
  const acc={}; state.adjustments.filter(r=>!r._new && r.maVT && num(r.dieuChinh) && selHas((om[r.maLenh]||{}).ngayXuatNVL||r.ngaySX||'') ).forEach(r=>{ const a=acc[r.maVT]||(acc[r.maVT]={ma:r.maVT, n:0, lenh:new Set(), tang:0, giam:0, sl:0, gt:0, np:0}); const q=num(r.dieuChinh), gv=gia(r);
    a.n++; if (r.maLenh) a.lenh.add(r.maLenh); if (q>0) a.tang+=q; else a.giam+=q; a.sl+=q; if (gv) a.gt+=Math.round(gv*q); else a.np++; });
  const rows=Object.values(acc).sort((a,b)=>a.gt-b.gt || a.ma.localeCompare(b.ma)); const T=k=>sum(rows,r=>r[k]);

  const gvCell=r=>r.np===r.n?'<td class="n" data-v=""><span class="mut small">chưa có giá</span></td>':`<td class="n">${r.sl?fmtN(Math.round(r.gt/r.sl)):''}</td>`;
  const gtCell=r=>r.np===r.n?'<td class="n" data-v=""><span class="mut small">chưa có giá</span></td>':`<td class="n">${fmtN(r.gt)}</td>`;
  m.innerHTML = head(g.t, `${cdButtons()}<button class="btn" id="xl">${IC('xlOut')}Xuất Excel</button>`) + cdTabs() +
  (rows.length ? `<div class="tw"><table data-freeze="1"><thead><tr><th>Mã VT</th><th>Tên vật tư</th><th>Nhóm</th><th>ĐVT</th><th class="n">Số dòng CĐ</th><th class="n">SL giảm</th><th class="n">SL tăng</th><th class="n">SL cân đối</th><th class="n">Giá trị CĐ</th></tr></thead><tbody>
    ${rows.map(r=>`<tr><td><a href="#" class="lnk u" data-tk="${esc(r.ma)}" title="Xem thẻ kho (nhập – xuất – tồn) của mã này"><b>${esc(r.ma)}</b></a></td><td>${esc((it[r.ma]||{}).ten||'⚠ thiếu mã')}</td><td>${esc((it[r.ma]||{}).nhom||'')}</td><td>${esc((it[r.ma]||{}).dvt||'')}</td><td class="n">${r.n}</td><td class="n" style="color:#b91c1c">${r.giam?fmtQ(r.giam):''}</td><td class="n">${r.tang?fmtQ(r.tang):''}</td><td class="n">${fmtQ(r.sl)}</td>${gtCell(r)}</tr>`).join('')}
    <tr class="tot"><td>Tổng cộng</td><td>${rows.length} mặt hàng</td><td></td><td></td><td class="n">${T('n')}</td><td></td><td></td><td></td><td class="n">${fmtN(T('gt'))}</td></tr>
    </tbody></table></div>` : `<div class="box" style="text-align:center;padding:18px"><span class="pill ok" style="font-size:var(--fs);padding:6px 14px">Kỳ ${esc(fmtKy(selKy))} chưa có dòng cân đối NVL</span></div>`);
  m.querySelectorAll('[data-tk]').forEach(a=>a.onclick=e=>{ e.preventDefault(); e.stopPropagation(); theKho(a.dataset.tk); });
  bindKy(); bindCd(m);
  $('#xl').onclick=()=>exportDomTable(m.querySelector('.tw table'), `CanDoiNVL_TongHop_${selKy}.xlsx`, 'TongHop');
}
