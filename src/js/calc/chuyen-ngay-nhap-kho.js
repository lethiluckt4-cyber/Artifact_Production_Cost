// Cột "Mua hàng chưa HĐ" theo hóa đơn: hóa đơn có dòng tách (nhập kho khác ngày hóa đơn) → dòng tách "x - Số HĐ", các dòng còn lại của hóa đơn "Số HĐ"; hóa đơn không tách: nhập kho khác ngày HĐ → "x"
function syncChuaHD(hoaDon, ncc){ if (!hoaDon) return; const g=state.purchases.filter(r=>r.hoaDon===hoaDon && (r.ncc||'')===(ncc||'')); if (!g.length) return;
  const df=r=>!!(r.ngayNhap && r.ngayMua && r.ngayNhap!==r.ngayMua); const anyDf=g.some(df), anySame=g.some(r=>!df(r));
  g.forEach(r=>{ r.chuaHD = (anyDf && anySame) ? (df(r)?`x - ${hoaDon}`:String(hoaDon)) : (df(r)?'x':''); }); }
// Bỏ chuyển ngày nhập kho: xóa dòng tách → SL, thành tiền cộng trả dòng gốc; dòng chuyển cả phiếu sửa Ngày nhập kho = Ngày hóa đơn → bỏ ghi chú chuyển
const MV_NOTE=/(\s·\s)?Chuyển nhập kho [^·]*/g;
function unmoveNote(r){ if (r && r.ngayNhap && r.ngayMua && r.ngayNhap===r.ngayMua && MV_NOTE.test(r.ghiChu||'')) { MV_NOTE.lastIndex=0; r.ghiChu=String(r.ghiChu).replace(MV_NOTE,'').replace(/^\s·\s/,'').trim(); } MV_NOTE.lastIndex=0; }
// Dòng gốc của dòng tách (sau khi tải lại không còn _splitFrom → tìm dòng cùng HĐ, NCC, mã hàng chưa chuyển ngày)
function splitSrc(r){ if (!r) return null; if (r._splitFrom) return state.purchases.find(x=>x._id===r._splitFrom)||null; if (!/Tách /.test(r.ghiChu||'') || !MV_RE.test(r.ghiChu||'')) return null;
  const c=state.purchases.filter(x=>x!==r && x.hoaDon===r.hoaDon && (x.ncc||'')===(r.ncc||'') && x.ma===r.ma && !MV_RE.test(x.ghiChu||'')); return c.length===1 ? c[0] : null; }
// ---- Bỏ chuyển ngày nhập kho (↩): phiếu chuyển nguyên → trả ngày nhập gốc; phiếu tách → gộp lại dòng gốc ----
const MV_RE=/Chuyển nhập kho (\d{2})\/(\d{2})\/(\d{4}) → /;
function movedRows(inKy){ const out=[]; state.purchases.forEach(r=>{ const m=MV_RE.exec(r.ghiChu||''); if (!m) return; const goc=`${m[3]}-${m[2]}-${m[1]}`; if (!r.ngayNhap || r.ngayNhap===goc || !inKy(kyOf(r.ngayNhap))) return;
    const tach=/Tách /.test(r.ghiChu||''); const src=tach?splitSrc(r):null; if (isLocked(kyOf(r.ngayNhap)) || isLocked(kyOf(goc)) || (src && isLocked(kyOf(src.ngayNhap)))) return;
    out.push({r, id:r._id, goc, tach, src, ve: src ? src.ngayNhap : goc}); }); return out.sort((a,b)=>a.r.ngayNhap.localeCompare(b.r.ngayNhap) || String(a.r.ma).localeCompare(String(b.r.ma))); }
function applyUnmove(list){ let n=0; const gs=[]; const del=new Set(); list.forEach(x=>{ const r=state.purchases.find(z=>z._id===x.id); if (!r) return; gs.push([r.hoaDon,r.ncc]);
    if (x.src && state.purchases.includes(x.src)) { const s=x.src; s.sl=round(num(s.sl)+num(r.sl),6); s.tt=num(s.tt)+num(r.tt); s.donGia=s.sl?s.tt/s.sl:0; del.add(r._id); }
    else { r.ngayNhap=x.goc; r.ghiChu=String(r.ghiChu||'').replace(/Tách [^–]*–\s*/,'').replace(MV_NOTE,'').replace(/^\s·\s/,'').trim(); MV_NOTE.lastIndex=0; }
    n++; }); state.purchases=state.purchases.filter(z=>!del.has(z._id)); gs.forEach(([h,c])=>syncChuaHD(h,c)); calcCache=null; return n; }
function unmoveDialog(list, after){ if (!list.length) return toast('Không có phiếu nào đã chuyển ngày nhập kho', 3500);
  modal(`<div class="tsh"><h3>↩ Bỏ chuyển kho – ${list.length} phiếu đã chuyển ngày nhập kho</h3><button class="tsx" id="umX" title="Đóng" aria-label="Đóng">${icon('x')}</button></div>
    <div class="tw" style="max-height:58vh;margin-top:6px"><table><thead><tr><th class="selc"><input type="checkbox" id="umAll" checked></th><th>Mã</th><th>Hóa đơn</th><th>Nhà cung cấp</th><th class="n">SL</th><th>Ngày nhập hiện tại</th><th>→ Ngày trả về</th><th>Cách làm</th></tr></thead><tbody>${list.map(x=>`<tr><td class="selc"><input type="checkbox" class="umk" value="${esc(x.id)}" checked></td><td title="${esc((itemMap()[x.r.ma]||{}).ten||'')}">${esc(x.r.ma)}</td><td>${esc(x.r.hoaDon||'')}</td><td title="${esc(x.r.ncc||'')}">${esc(x.r.ncc||'')}</td><td class="n">${fmtQ(num(x.r.sl))}</td><td>${fmtD(x.r.ngayNhap)}</td><td>${fmtD(x.ve)}</td><td>${x.src?`Gộp vào dòng gốc (${fmtQ(num(x.src.sl))} → ${fmtQ(round(num(x.src.sl)+num(x.r.sl),6))})`:x.tach?'Trả ngày nhập gốc (không tìm thấy dòng gốc để gộp)':'Trả ngày nhập gốc'}</td></tr>`).join('')}</tbody></table></div>
    <div class="tsf"><span class="sp"></span><button class="btn" id="umC">Hủy</button><button class="btn p" id="umOk">Bỏ chuyển kho</button></div>`);
  { const mi=$('#modal .in'); mi.classList.add('tsm'); mi.style.width='min(1200px,96vw)'; mi.style.maxWidth='96vw'; } $('#umX').onclick=closeModal; $('#umC').onclick=closeModal;
  const sel=()=>[...document.querySelectorAll('.umk:checked')].map(i=>i.value); const upd=()=>{ const n=sel().length; $('#umOk').disabled=!n; $('#umOk').textContent=n?`Bỏ chuyển kho ${n} dòng`:'Bỏ chuyển kho'; };
  document.querySelectorAll('.umk').forEach(i=>i.onchange=upd); $('#umAll').onchange=e=>{ document.querySelectorAll('.umk').forEach(i=>i.checked=e.target.checked); upd(); }; upd();
  $('#umOk').onclick=()=>{ const ids=new Set(sel()); if (!ids.size) return; closeModal(); const n=applyUnmove(list.filter(x=>ids.has(x.id))); changed(); if (after) after(n); else { render(); toast(`Đã bỏ chuyển kho ${n} phiếu mua`, 3500); } }; }
function delPurchases(ids){ const S=new Set(ids); const gs=[]; state.purchases.forEach(r=>{ if (!S.has(r._id)) return; gs.push([r.hoaDon,r.ncc]); const src=splitSrc(r); if (!src || S.has(src._id)) return; src.sl=round(num(src.sl)+num(r.sl),6); src.tt=num(src.tt)+num(r.tt); src.donGia=src.sl?src.tt/src.sl:0; });
  state.purchases=state.purchases.filter(x=>!S.has(x._id)); gs.forEach(([h,n])=>syncChuaHD(h,n)); }
// ---- Đề xuất chuyển ngày nhập kho (chạy TRƯỚC cân đối NVL) ----
// NVL âm cuối tháng → kéo phiếu mua của các tháng sau về ngày bắt đầu thiếu trong tháng (hàng về trước, hóa đơn về sau).
// Ngày hóa đơn không quá 1 tháng sau ngày nhập kho mới; âm nhiều (1 tháng chưa đủ) thì mở rộng tối đa 2 tháng. Phần còn thiếu mới cân đối NVL.
const addMonthsD = (d, k) => { const [y,m,dd]=d.split('-').map(Number); const t=new Date(y, m-1+k, 1); const last=new Date(t.getFullYear(), t.getMonth()+1, 0).getDate(); return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(Math.min(dd,last)).padStart(2,'0')}`; };
const DVT_NGUYEN = /^(cái|quả|bình|thùng|túi|bao|hộp|gói|chai|lon|cuộn|tấm|chiếc)$/i;
function buildMoveProposal(p){
  const res={rows:[], short:[]}; if (!p || p.isRange || p.isYear || !/^\d{4}-\d{2}$/.test(p.ky||'')) return res;
  const ky=p.ky; if (isLocked(ky)) return res; const items=itemMap(); const end=`${ky}-${String(daysInMonth(ky)).padStart(2,'0')}`;
  p.nxt.filter(x=>x.closeSL<-1e-9).forEach(x=>{ const it=items[x.ma]; if (!it || isProd(it)) return;
    // ngày bắt đầu thiếu: lũy kế tồn trong tháng xuống dưới 0
    const ev=[]; state.purchases.forEach(r=>{ if (r.ma===x.ma && kyOf(r.ngayNhap)===ky) ev.push([r.ngayNhap, num(r.sl)]); });
    p.lines.forEach(l=>{ if (l.maVT===x.ma) ev.push([l.ngayXuatNVL, -l.tong]); }); p.issues.forEach(i=>{ if (i.ma===x.ma) ev.push([i.r.ngay, -i.sl]); }); p.sales.forEach(z=>{ if (z.ma===x.ma) ev.push([z.ngay, -z.sl]); });
    ev.sort((a,b)=>a[0].localeCompare(b[0]) || b[1]-a[1]); let run=x.openSL, d0=null; for (const [d,q] of ev) { run=round(run+q,9); if (run<-1e-9) { d0=d; break; } } if (!d0) d0=end;
    let need=round(-x.closeSL,6); const lim1=addMonthsD(d0,1), lim2=addMonthsD(d0,2); const nguyen=DVT_NGUYEN.test(String(it.dvt||'').trim());
    const cands=state.purchases.filter(r=>r.ma===x.ma && r.ngayNhap>end && num(r.sl)>0 && !isLocked(kyOf(r.ngayNhap))).sort((a,b)=>a.ngayNhap.localeCompare(b.ngayNhap) || String(a.ngayMua||'').localeCompare(String(b.ngayMua||'')));
    [[lim1,false],[lim2,true]].forEach(([lim,vuot])=>{ cands.forEach(r=>{ if (need<=1e-9 || r._mvUsed) return; const hd=r.ngayMua||r.ngayNhap; if (hd>lim || (vuot && hd<=lim1)) return;
      const sl=num(r.sl); let mv = sl<=need+1e-9 ? sl : (nguyen ? Math.ceil(need-1e-9) : Math.ceil(need*100-1e-6)/100); mv=Math.min(sl, mv);
      res.rows.push({id:r._id, ky, ma:x.ma, ten:it.ten, dvt:it.dvt, hoaDon:r.hoaDon||'', ncc:r.ncc||'', ngayHD:hd, ngayCu:r.ngayNhap, ngayMoi:d0, slPhieu:sl, slChuyen:mv, tach:mv<sl-1e-9, vuot1:vuot, thieu:round(-x.closeSL,6)});
      r._mvUsed=true; need=round(need-mv,6); }); });
    cands.forEach(r=>delete r._mvUsed);
    if (need>1e-9) res.short.push({ma:x.ma, ten:it.ten, dvt:it.dvt, conThieu:need});
  });
  return res;
}
function pendingMoveMonths(){ const c=calc(); return c.list.filter(k=>selKyHas(k) && !isLocked(k) && !kyDangDo(k)).map(k=>({k, n:buildMoveProposal(c.periods[k]).rows.length})).filter(x=>x.n); }
function applyMoveCore(rows, only){ let n=0; rows.forEach(m=>{ if (only && !only.has(m.ky+'|'+m.id)) return; const r=state.purchases.find(z=>z._id===m.id); if (!r || r.ngayNhap!==m.ngayCu) return;
    const note=`Chuyển nhập kho ${fmtD(m.ngayCu)} → ${fmtD(m.ngayMoi)} (HĐ ${m.hoaDon||'–'} ngày ${fmtD(m.ngayHD)})`;
    if (!m.tach) { r.ngayNhap=m.ngayMoi; if (!r.ngayMua) r.ngayMua=m.ngayHD; r.ghiChu = r.ghiChu ? `${r.ghiChu} · ${note}` : note; }
    else { const sl=num(r.sl), tt=num(r.tt); const tt2=Math.round(tt*m.slChuyen/sl); const nr={...r, _id:uid(), ngayNhap:m.ngayMoi, ngayMua:r.ngayMua||m.ngayHD, sl:m.slChuyen, tt:tt2, ghiChu:`Tách ${fmtQ(m.slChuyen)}/${fmtQ(sl)} – ${note}`, _splitFrom:r._id};
      r.sl=round(sl-m.slChuyen,6); r.tt=tt-tt2; state.purchases.splice(state.purchases.indexOf(r), 0, nr); }
    syncChuaHD(r.hoaDon, r.ncc); n++; }); return n; }
// Áp dụng lần lượt từng tháng (tháng trước chuyển xong mới tính đề xuất tháng sau); only = tập id phiếu được chọn (không truyền = tất cả)
function applyMoveMonths(ks, only){ let tot=0; ks.slice().sort().forEach(k=>{ if (isLocked(k)) return; calcCache=null; const c=calc(); tot+=applyMoveCore(buildMoveProposal(c.periods[k]).rows, only); }); calcCache=null; return tot; }
function moveDialog(after){ const pm=pendingMoveMonths(); if (!pm.length) { toast('Không có phiếu mua nào cần chuyển ngày nhập kho', 3500); return; }
  const c=calc(); const all=[]; pm.forEach(x=>{ const d=buildMoveProposal(c.periods[x.k]); d.rows.forEach(r=>all.push(r)); });
  modal(`<div class="tsh"><h3>Đề xuất chuyển ngày nhập kho – NVL âm cuối tháng</h3><button class="tsx" id="mvX" title="Đóng" aria-label="Đóng">${icon('x')}</button></div>
    <div class="tw" style="max-height:58vh;margin-top:6px"><table><thead><tr><th class="selc"><input type="checkbox" id="mvAll" checked></th><th>Tháng âm</th><th>Mã NVL</th><th>Tên NVL</th><th class="n">SL thiếu</th><th class="n">SL chuyển</th><th class="n">SL phiếu</th><th>→ Ngày nhập kho mới</th><th>Ngày HĐ</th><th>Ngày nhập kho</th><th>Số HĐ</th><th>Nhà cung cấp</th><th>Ghi chú</th></tr></thead><tbody>${all.map(r=>`<tr><td class="selc"><input type="checkbox" class="mvk" value="${r.ky}|${r.id}" checked></td><td>${fmtKy(r.ky)}</td><td>${esc(r.ma)}</td><td style="max-width:260px;overflow:hidden;text-overflow:ellipsis" title="${esc(r.ten||(itemMap()[r.ma]||{}).ten||'')}">${esc(r.ten||(itemMap()[r.ma]||{}).ten||'')}</td><td class="n">${fmtQ(-r.thieu)}</td><td class="n"><b>${fmtQ(r.slChuyen)}</b></td><td class="n">${fmtQ(r.slPhieu)}</td><td><b>${fmtD(r.ngayMoi)}</b></td><td>${fmtD(r.ngayHD)}</td><td>${fmtD(r.ngayCu)}</td><td>${esc(r.hoaDon)}</td><td style="max-width:200px;overflow:hidden;text-overflow:ellipsis" title="${esc(r.ncc)}">${esc(r.ncc)}</td><td>Nhập kho trước ngày hóa đơn ${Math.round((new Date(r.ngayHD+'T00:00:00Z')-new Date(r.ngayMoi+'T00:00:00Z'))/86400000)} ngày</td></tr>`).join('')}</tbody></table></div>
    <div class="tsf"><span class="sp"></span><button class="btn" id="mvC">Hủy</button><button class="btn p" id="mvOk">Áp dụng</button></div>`);
  { const mi=$('#modal .in'); mi.classList.add('tsm'); mi.style.width='min(1360px,96vw)'; mi.style.maxWidth='96vw'; } $('#mvX').onclick=closeModal; $('#mvC').onclick=closeModal;
  const sel=()=>[...document.querySelectorAll('.mvk:checked')].map(i=>i.value); const upd=()=>{ const n=sel().length; $('#mvOk').disabled=!n; $('#mvOk').textContent=n?`Áp dụng ${n} phiếu`:'Áp dụng'; };
  document.querySelectorAll('.mvk').forEach(i=>i.onchange=upd); $('#mvAll').onchange=e=>{ document.querySelectorAll('.mvk').forEach(i=>i.checked=e.target.checked); upd(); }; upd();
  $('#mvOk').onclick=()=>{ const ids=new Set(sel()); if (!ids.size) return; closeModal(); const n=applyMoveMonths(pm.map(x=>x.k), ids); changed(); if (after) after(n); else { render(); toast(`Đã chuyển ngày nhập kho ${n} phiếu mua – phần còn âm xử lý bằng Cân đối NVL`, 4000); } }; }
