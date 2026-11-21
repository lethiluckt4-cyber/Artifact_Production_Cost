//# NVL âm cuối tháng: ① Chuyển ngày nhập kho, ↩ Bỏ chuyển kho, ② Cân đối NVL, đề xuất cân đối
// ---------- Xử lý NVL âm cuối tháng: 📅 Chuyển ngày nhập kho → ⚙ Cân đối NVL ----------
const isoD = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const todayISO = () => isoD(new Date());
const dayDiff = (a,b) => Math.round((new Date(a+'T00:00:00') - new Date(b+'T00:00:00'))/86400000);
const addDaysISO = (s,n) => { const d=new Date(s+'T00:00:00'); d.setDate(d.getDate()+n); return isoD(d); };
const kyEnd = k => `${k}-${String(daysInMonth(k)).padStart(2,'0')}`;
function monthEnded(k){ return kyEnd(k) < todayISO(); }
// các tháng thuộc kỳ đang xem (tháng / năm / khoảng ngày), có dữ liệu
function cdMonths(){ const c=calcLive(); return Object.keys(c.periods||{}).filter(k=>/^\d{4}-\d{2}$/.test(k) && (selHas(k+'-01')||selHas(kyEnd(k)))).sort(); }
// diễn biến tồn theo ngày của một mã trong tháng
function cdEvents(p, ma){ const ev=[]; const k=p.ky;
  state.purchases.filter(r=>!r._new && r.ma===ma && kyOf(r.ngayNhap)===k).forEach(r=>ev.push({d:r.ngayNhap, q:num(r.sl)}));
  state.issues.filter(r=>!r._new && r.maVT===ma && kyOf(r.ngay)===k).forEach(r=>ev.push({d:r.ngay, q:-num(r.sl)}));
  state.sales.filter(r=>!r._new && r.ma===ma && kyOf(r.ngay)===k).forEach(r=>ev.push({d:r.ngay, q:-num(r.sl)}));
  (p.lines||[]).filter(l=>l.maVT===ma).forEach(l=>ev.push({d:l.ngayXuatNVL, q:-l.tong}));
  return ev.sort((a,b)=>a.d.localeCompare(b.d) || (b.q-a.q)); }
function cdFirstNeg(p, x){ let run=Math.max(0,x.openSL); for (const e of cdEvents(p, x.ma)) { run=round(run+e.q,6); if (run<0) return e.d; } return kyEnd(p.ky); }
// đề xuất chuyển ngày nhập kho: phiếu mua của tháng sau (HĐ cách ngày nhập mới ≤ 1 tháng) lùi về tháng đang âm
function buildTransfer(only){ const c=calcLive(); const it=itemMap(); const rows=[]; const notEnded=[]; const used={};
  (only?[only]:cdMonths()).forEach(k=>{ const p=c.periods[k]; if (!p) return; const neg=(p.nxt||[]).filter(x=>x.closeSL<0 && x.nhom!=='Thành phẩm'); if (!neg.length) return;
    if (!only && !monthEnded(k)) { notEnded.push({k, n:neg.length}); return; } if (isLocked(k)) return; const end=kyEnd(k);
    neg.forEach(x=>{ let need=round(-(Math.max(0,x.openSL)+x.nhapSL-x.xuatSL),6); if (need<=1e-9) return; const d0=cdFirstNeg(p, x);
      state.purchases.filter(r=>!r._new && r.ma===x.ma && r.ngayNhap>end && num(r.sl)>0 && !isLocked(kyOf(r.ngayNhap))).sort((a,b)=>a.ngayNhap.localeCompare(b.ngayNhap)).forEach(r=>{ if (need<=1e-9) return;
        const hd=r.ngayMua||r.ngayNhap; let nd = d0 > addDaysISO(hd,-31) ? d0 : addDaysISO(hd,-31); if (nd>end) return; if (Math.abs(dayDiff(hd, nd))>31) return;
        const avail=round(num(r.sl)-(used[r._id]||0),6); if (avail<=1e-9) return; const q=Math.min(avail, need); used[r._id]=(used[r._id]||0)+q; need=round(need-q,6);
        rows.push({k, ma:x.ma, ten:x.ten||(it[x.ma]||{}).ten||'', dvt:x.dvt||'', close:x.closeSL, id:r._id, hoaDon:r.hoaDon||'', ncc:r.ncc||'', ngayMua:hd, from:r.ngayNhap, to:nd, slPhieu:num(r.sl), q:round(q,6), gt:num(r.sl)?Math.round(num(r.tt)*q/num(r.sl)):0, split: q < num(r.sl)-1e-9, gap:dayDiff(hd, nd), on:true}); }); }); });
  return {rows, notEnded}; }
function applyTransfer(sel){ let n=0;
  sel.forEach(t=>{ const R=state.purchases.find(r=>r._id===t.id); if (!R) return; const sl=num(R.sl); if (sl<=0) return; const q=Math.min(t.q, sl); const note=`PM chuyển ngày nhập kho từ ${fmtD(R.ngayNhap)}`;
    if (q >= sl-1e-9) { if (!R.nkGoc) R.nkGoc=R.ngayNhap; R.ngayNhap=t.to; R.ghiChu = R.ghiChu ? R.ghiChu+'; '+note : note; }
    else { const tt=Math.round(num(R.tt)*q/sl); const tx=Math.round(num(R.tienThue)*q/sl); const nr={...R, _id:uid(), sl:round(q,6), tt, tienThue:tx, ngayNhap:t.to, nkGoc:R.nkGoc||R.ngayNhap, ghiChu:note+' (tách '+fmtQ(q)+')'}; delete nr._new; delete nr._splitOf; R.sl=round(sl-q,6); R.tt=num(R.tt)-tt; R.tienThue=num(R.tienThue)-tx; state.purchases.push(nr); }
    n++; });
  return n; }
// bỏ chuyển ngày nhập kho: trả phiếu về ngày nhập gốc, dòng tách thì gộp lại vào dòng gốc
function movedRows(inK){ return state.purchases.filter(r=>r.nkGoc && r.nkGoc!==r.ngayNhap && inK(r.ngayNhap) && !isLocked(kyOf(r.ngayNhap)) && !isLocked(kyOf(r.nkGoc))); }
function movedOrig(m){ return state.purchases.find(r=>r!==m && !r.nkGoc && r.ma===m.ma && (r.hoaDon||'')===(m.hoaDon||'') && (r.ncc||'')===(m.ncc||'') && r.ngayNhap===m.nkGoc && Math.abs(num(r.donGia)-num(m.donGia))<1e-6); }
const TR_NOTE=/;?\s*PM chuyển ngày nhập kho từ [0-9/]+(\s*\(tách [^)]*\))?/g;
function undoTransfer(sel){ let n=0; sel.forEach(m=>{ if (!state.purchases.includes(m)) return; const o=/\(tách /.test(m.ghiChu||'') ? movedOrig(m) : null;
    if (o) { o.sl=round(num(o.sl)+num(m.sl),6); o.tt=num(o.tt)+num(m.tt); o.tienThue=num(o.tienThue)+num(m.tienThue); state.purchases.splice(state.purchases.indexOf(m),1); }
    else { m.ngayNhap=m.nkGoc; delete m.nkGoc; m.ghiChu=(m.ghiChu||'').replace(TR_NOTE,'').replace(/^;\s*/,'').trim(); }
    n++; }); return n; }
function undoTransferDialog(inK, after){ const rows=movedRows(inK).sort((a,b)=>(a.ngayNhap+a.ma).localeCompare(b.ngayNhap+b.ma)); const on=new Set(rows);
  const draw=()=>{ const nOn=on.size;
    modal(`<h3>↩ Bỏ chuyển ngày nhập kho</h3>
    ${rows.length ? `<div class="tw" style="max-height:56vh"><table id="cdUT"><thead><tr><th class="ckth"><input type="checkbox" id="cdAll" ${nOn===rows.length?'checked':''}></th><th>Mã</th><th>Tên NVL</th><th>Hóa đơn</th><th>Nhà cung cấp</th><th class="n">SL</th><th>Ngày nhập hiện tại → trả về</th><th>Cách làm</th></tr></thead><tbody>
      ${rows.map((r,i)=>{ const o=/\(tách /.test(r.ghiChu||'')?movedOrig(r):null; return `<tr class="${on.has(r)?'':'mut'}"><td class="ck"><input type="checkbox" data-ci="${i}" ${on.has(r)?'checked':''}></td><td><b>${esc(r.ma)}</b></td><td>${esc((itemMap()[r.ma]||{}).ten||'')}</td><td>${esc(r.hoaDon||'')}</td><td>${esc(r.ncc||'')}</td><td class="n">${fmtQ(num(r.sl))}</td><td>${fmtD(r.ngayNhap)} → <b>${fmtD(r.nkGoc)}</b></td><td>${o?'Gộp lại vào dòng gốc':'Trả cả phiếu về ngày gốc'}</td></tr>`; }).join('')}
      </tbody></table></div>` : `<div class="box" style="text-align:center;padding:18px"><span class="pill ok" style="font-size:var(--fs);padding:6px 14px">✓ Không có phiếu nào đã chuyển ngày nhập kho</span></div>`}
    <div style="text-align:right;margin-top:10px"><button class="btn" id="cdX">Đóng</button>${rows.length?` <button class="btn d" id="cdGo" ${nOn?'':'disabled'}>Bỏ chuyển kho ${nOn} dòng${after?' & tính lại':''}</button>`:''}</div>`);
    $('#modal .in').classList.add('wide');
    $('#cdX').onclick=()=>{ closeModal(); render(); };
    const all=$('#cdAll'); if (all) all.onchange=()=>{ rows.forEach(r=>all.checked?on.add(r):on.delete(r)); draw(); };
    document.querySelectorAll('#cdUT [data-ci]').forEach(c=>c.onchange=()=>{ const r=rows[+c.dataset.ci]; c.checked?on.add(r):on.delete(r); draw(); });
    const go=$('#cdGo'); if (go) go.onclick=()=>{ const n=undoTransfer(rows.filter(r=>on.has(r))); changed(); closeModal(); if (after) { toast(`Đã bỏ chuyển kho ${n} dòng – đang tính lại…`); after(); return; } render(); toast(`Đã bỏ chuyển kho ${n} dòng – trả phiếu về ngày nhập gốc`, 5000); }; };
  draw(); }
// đề xuất cân đối theo từng tháng đã kết thúc, chưa khóa
function balRows(k, a, rows, p){ const why={}; a.analysis.forEach(x=>why[x.ma]=x); const gv={}; ((p&&p.nxt)||[]).forEach(x=>gv[x.ma]=x.gv||0); a.rows.forEach(r=>rows.push({k, ...r, gt:gv[r.maVT]?Math.round(r.deXuat*gv[r.maVT])||0:null, close:(why[r.maVT]||{}).close, why:(why[r.maVT]||{}).why||'', sau:round(r.hienXuat+r.deXuat,6), key:`${k}|${r.maLenh}|${r.maVT}`, on:true})); }
function buildBalance(only){ const c=calcLive(); const rows=[]; const notEnded=[];
  (only?[only]:cdMonths()).forEach(k=>{ const p=c.periods[k]; if (!p) return; const a=buildAdjProposal(p); if (!a.rows.length) return;
    if (!only && !monthEnded(k)) { notEnded.push({k, n:a.rows.length}); return; } if (isLocked(k)) return;
    balRows(k, a, rows, p); });
  return {rows, notEnded}; }
function applyBalance(sel){ const want={}; sel.forEach(r=>{ want[r.key]=(want[r.key]||0)+r.deXuat; }); const ks=[...new Set(sel.map(r=>r.k))].sort(); let n=0;
  ks.forEach(k=>{ const p=calcLive().periods[k]; if (!p) return; const a=buildAdjProposal(p); const why={}; a.analysis.forEach(x=>why[x.ma]=x.why);
    a.rows.forEach(r=>{ const key=`${k}|${r.maLenh}|${r.maVT}`; if (!(key in want)) return; const q = Math.max(r.deXuat, want[key]); if (!(q<0)) return; // số âm: lấy mức giảm nhỏ hơn giữa đề xuất mới và số đã chọn
      state.adjustments.push({_id:uid(), ngaySX:(state.orders.find(o=>o.maLenh===r.maLenh)||{}).ngaySX||'', maTP:r.maTP, maLenh:r.maLenh, maVT:r.maVT, dieuChinh:round(q,6), lyDo:`PM cân đối – ${why[r.maVT]||'tồn cuối âm'} (tồn ${fmtD(r.ngay)} về ${fmtQ(r.tonSau)})`}); n++; });
    changed(); });
  return n; }
function cdStatus(){ try { const t=buildTransfer(), b=buildBalance(); return {tN:new Set(t.rows.map(r=>r.k)).size, bN:new Set(b.rows.map(r=>r.k)).size, t, b}; } catch(e){ console.error(e); return {tN:0,bN:0,t:{rows:[],notEnded:[]},b:{rows:[],notEnded:[]}}; } }
function cdButtons(){ const st=cdStatus(); const mv=movedRows(d=>selHas(d)).length;
  return `${mv?`<button class="btn" id="cdU" title="Trả các phiếu đã chuyển ngày nhập kho (kỳ đang xem) về ngày nhập gốc">↩ Bỏ chuyển kho (${mv})</button>`:''}<button class="btn ${st.tN?'btn-pend':'btn-done'}" id="cdT" title="${st.tN?`Còn ${st.tN} tháng cần chuyển ngày – `:''}Lùi ngày nhập kho các phiếu mua tháng sau về tháng đang âm (HĐ cách ngày nhập mới không quá 1 tháng)">${st.tN?'📅 Chuyển ngày nhập kho':'✓ Đã chuyển ngày nhập kho'}</button><button class="btn ${st.bN?'btn-pend':'btn-done'}" id="cdB" title="${st.bN?`Còn ${st.bN} tháng cần cân đối – `:''}Giảm tiêu hao NVL ở các lệnh làm tồn xuống âm cho đến khi tồn cuối tháng về 0">${st.bN?'⚙ Cân đối theo đề xuất':'✓ Đã cân đối theo đề xuất'}</button>`; }
function cdNotEnded(list, what){ return list.length ? `<div class="note" style="margin:6px 0">Tháng chưa kết thúc: ${list.map(x=>`<b>${fmtKy(x.k)}</b> (${x.n} ${what})`).join(', ')} – chưa ${what==='mã âm'?'chuyển ngày':'cân đối'} vì NVL âm thường do chưa nhập đủ phiếu mua. Cuối tháng nhập đủ chứng từ rồi tính lại.</div>` : ''; }
function transferDialog(only, after){ const d=buildTransfer(only); const rows=d.rows;
  const draw=()=>{ const nOn=rows.filter(r=>r.on).length;
    modal(`<h3>📅 Chuyển ngày nhập kho – NVL âm cuối tháng</h3>
    <div class="small mut" style="margin-bottom:6px">Phiếu mua của tháng sau được lùi ngày nhập kho về ngày tồn bắt đầu âm (ngày hóa đơn cách ngày nhập mới không quá 1 tháng). Phiếu lớn hơn số thiếu thì tách đúng phần thiếu. Làm bước này <b>trước</b> rồi mới ⚙ Cân đối phần còn âm.</div>
    ${cdNotEnded(d.notEnded,'mã âm')}
    ${rows.length ? `<div class="tw" style="max-height:56vh"><table id="cdTT"><thead><tr><th class="ckth"><input type="checkbox" id="cdAll" ${nOn===rows.length?'checked':''}></th><th>Tháng âm</th><th>Mã</th><th>Tên NVL</th><th class="n">Tồn cuối</th><th>Hóa đơn</th><th>Nhà cung cấp</th><th>Ngày HĐ</th><th>Ngày nhập kho mới</th><th class="n">SL phiếu</th><th class="n">SL chuyển</th><th class="n">Giá trị chuyển</th><th>Ghi chú</th></tr></thead><tbody>
      ${rows.map((r,i)=>`<tr class="${r.on?'':'mut'}"><td class="ck"><input type="checkbox" data-ci="${i}" ${r.on?'checked':''}></td><td>${fmtKy(r.k)}</td><td><b>${esc(r.ma)}</b></td><td>${esc(r.ten)}</td><td class="n" style="color:#b91c1c">${fmtQ(r.close)}</td><td>${esc(r.hoaDon)}</td><td>${esc(r.ncc)}</td><td>${fmtD(r.ngayMua)}</td><td><b>${fmtD(r.to)}</b></td><td class="n">${fmtQ(r.slPhieu)}</td><td class="n"><b>${fmtQ(r.q)}</b></td><td class="n">${fmtN(r.gt)}</td><td style="color:#c2410c">${r.gap?`HĐ ${r.gap>0?'sau':'trước'} ${Math.abs(r.gap)} ngày`:''}</td></tr>`).join('')}
      </tbody></table></div>` : `<div class="box" style="text-align:center;padding:18px"><span class="pill ok" style="font-size:var(--fs);padding:6px 14px">✓ Không còn phiếu nào chuyển ngày nhập kho được</span></div>`}
    <div style="text-align:right;margin-top:10px"><button class="btn" id="cdX">Đóng</button>${rows.length?` <button class="btn p" id="cdGo" ${nOn?'':'disabled'}>Áp dụng ${nOn} dòng đã chọn${after?' & tính lại':''}</button>`:''}</div>`);
    $('#modal .in').classList.add('wide');
    $('#cdX').onclick=()=>{ closeModal(); render(); };
    const all=$('#cdAll'); if (all) all.onchange=()=>{ rows.forEach(r=>r.on=all.checked); draw(); };
    document.querySelectorAll('#cdTT [data-ci]').forEach(c=>c.onchange=()=>{ rows[+c.dataset.ci].on=c.checked; draw(); });
    const go=$('#cdGo'); if (go) go.onclick=()=>{ const n=applyTransfer(rows.filter(r=>r.on)); changed(); closeModal(); if (after) { toast(`Đã chuyển ngày nhập kho ${n} dòng – đang tính lại…`); after(); return; } render(); const b=buildBalance(); toast(`Đã chuyển ngày nhập kho ${n} dòng${b.rows.length?` – còn ${new Set(b.rows.map(r=>r.k)).size} tháng cần ⚙ Cân đối theo đề xuất`:' – không còn NVL âm cần cân đối'}`, 5000); }; };
  draw(); }
function balanceDialog(only, after){ const d=buildBalance(only); const rows=d.rows; const tp=after?{rows:[]}:buildTransfer(only);
  const draw=()=>{ const nOn=rows.filter(r=>r.on).length;
    modal(`<h3>⚙ Cân đối theo đề xuất – giảm tiêu hao cho phần còn âm</h3>
    ${tp.rows.length?`<div class="warnbox" style="margin-bottom:8px">⚠ Còn <b>${tp.rows.length}</b> phiếu mua có thể <b>chuyển ngày nhập kho</b> (${new Set(tp.rows.map(r=>r.k)).size} tháng). Nên chuyển ngày trước, phần còn âm mới cân đối. <button class="btn s p" id="cdToT" style="margin-left:8px">📅 Chuyển ngày nhập kho trước</button></div>`:''}
    <div class="small mut" style="margin-bottom:6px">Phần mềm xét theo ngày trong tháng, giảm tiêu hao ở các lệnh làm tồn xuống âm cho đến khi tồn cuối tháng về 0. Tick từng dòng rồi Áp dụng. Phần mềm áp dụng lần lượt từng tháng, nên tháng sau có thể cần cân đối ít hơn số đang hiện.</div>
    ${cdNotEnded(d.notEnded,'dòng')}
    ${rows.length ? `<div class="tw" style="max-height:52vh"><table id="cdBT"><thead><tr><th class="ckth"><input type="checkbox" id="cdAll" ${nOn===rows.length?'checked':''}></th><th>Tháng</th><th>Mã VT</th><th>Tên NVL</th><th class="n">Tồn cuối</th><th>Mã lệnh</th><th>Ngày xuất NVL</th><th>Mã TP</th><th class="n">SL cân đối</th><th class="n">Giá trị cân đối</th><th class="n">Đang xuất → Sau cân đối</th></tr></thead><tbody>
      ${rows.map((r,i)=>`<tr class="${r.on?'':'mut'}"><td class="ck"><input type="checkbox" data-ci="${i}" ${r.on?'checked':''}></td><td>${fmtKy(r.k)}</td><td><b>${esc(r.maVT)}</b></td><td>${esc(r.ten)}</td><td class="n" style="color:#b91c1c">${fmtQ(r.close)}</td><td>${esc(r.maLenh)}</td><td>${fmtD(r.ngay)}</td><td>${esc(r.maTP)}</td><td class="n" style="color:#b91c1c"><b>${fmtQ(r.deXuat)}</b></td><td class="n" style="color:#b91c1c" ${r.gt==null?'data-v=""':''}>${r.gt==null?'<span class="mut small">chưa có giá</span>':fmtN(r.gt)}</td><td class="n">${fmtQ(r.hienXuat)} → <b>${fmtQ(r.sau)}</b></td></tr>`).join('')}
      ${(()=>{ const sel=rows.filter(r=>r.on); const np=sel.filter(r=>r.gt==null).length; return `<tr class="tot"><td></td><td colspan="8">Tổng cộng ${sel.length} dòng đã chọn${np?` <span class="small mut">(${np} dòng chưa có giá)</span>`:''}</td><td class="n" style="color:#b91c1c">${fmtN(sum(sel,r=>r.gt||0))}</td><td></td></tr>`; })()}
      </tbody></table></div>` : `<div class="box" style="text-align:center;padding:18px"><span class="pill ok" style="font-size:var(--fs);padding:6px 14px">✓ Không còn NVL âm cần cân đối</span></div>`}
    <div style="text-align:right;margin-top:10px"><button class="btn" id="cdX">Đóng</button>${rows.length?` <button class="btn p" id="cdGo" ${nOn?'':'disabled'}>Áp dụng ${nOn} dòng đã chọn${after?' & tính lại':''}</button>`:''}</div>`);
    $('#modal .in').classList.add('wide');
    $('#cdX').onclick=()=>{ closeModal(); render(); };
    const tt=$('#cdToT'); if (tt) tt.onclick=()=>transferDialog();
    const all=$('#cdAll'); if (all) all.onchange=()=>{ rows.forEach(r=>r.on=all.checked); draw(); };
    document.querySelectorAll('#cdBT [data-ci]').forEach(c=>c.onchange=()=>{ rows[+c.dataset.ci].on=c.checked; draw(); });
    const go=$('#cdGo'); if (go) go.onclick=()=>{ const n=applyBalance(rows.filter(r=>r.on)); closeModal(); if (after) { toast(`Đã ghi ${n} dòng cân đối vào Cân đối NVL – đang tính lại…`); after(); return; } render(); toast(`Đã ghi ${n} dòng cân đối vào Cân đối NVL – vào Giá thành bấm ▶ Tính giá thành để cập nhật giá vốn`, 5000); }; };
  draw(); }
function buildAdjProposal(p){
  const items=itemMap(); const out=[]; const byMa={}; p.lines.forEach(l=>{ (byMa[l.maVT]=byMa[l.maVT]||[]).push(l); });
  const analysis=[];
  p.nxt.filter(x=>x.closeSL<0).forEach(x=>{
    const ls=(byMa[x.ma]||[]).slice().sort((a,b)=>(a.ngayXuatNVL+a.maLenh).localeCompare(b.ngayXuatNVL+b.maLenh));
    const isTP = x.nhom==='Thành phẩm'; let why='', action='';
    const own = round(Math.max(0,x.openSL)+x.nhapSL-x.xuatSL, 6); // phần âm phát sinh trong tháng (tồn đầu âm của tháng trước không tính – cân đối ở tháng trước)
    if (!isTP && own>=0) { analysis.push({ma:x.ma, ten:x.ten, nhom:x.nhom, dvt:x.dvt, open:x.openSL, nhap:x.nhapSL, xuat:x.xuatSL, close:x.closeSL, why:'Tồn đầu âm từ tháng trước – cân đối tháng trước', action:'Chuyển kho / cân đối tháng trước', nLines:ls.length, prev:true}); return; }
    if (isTP) { why = 'Thành phẩm bán ra vượt tồn đầu + sản xuất'; action = 'Kiểm tra thiếu lệnh SX hoặc sai mã bán; xem Đề xuất SX (Thành phẩm âm)'; }
    else if (!ls.length) { why = x.xuatSL>0 ? 'Xuất dùng chung / bán NVL vượt tồn' : 'Tồn đầu âm'; action = 'Kiểm tra phiếu xuất chung hoặc số dư đầu kỳ'; }
    else if (x.openSL+x.nhapSL<=0) { why = 'Không có tồn đầu và không có mua hàng trong kỳ nhưng định mức vẫn xuất'; action = 'Bổ sung chứng từ mua hàng / tồn đầu, hoặc khai NVL thay thế cho kỳ này'; }
    else if (x.nhapSL>0) { why = 'Có mua hàng nhưng vẫn thiếu – xuất theo định mức lớn hơn lượng thực có'; action = 'Kiểm tra chứng từ mua chưa nhập; nếu đã đủ, giảm xuất theo đề xuất bên dưới'; }
    else { why = 'Không mua trong kỳ, tồn đầu không đủ cho định mức'; action = 'Bổ sung mua hàng hoặc giảm xuất theo đề xuất bên dưới'; }
    analysis.push({ma:x.ma, ten:x.ten, nhom:x.nhom, dvt:x.dvt, open:x.openSL, nhap:x.nhapSL, xuat:x.xuatSL, close:x.closeSL, why, action, nLines:ls.length});
    if (isTP || !ls.length) return;
    // chạy tồn theo ngày, giảm tại dòng làm tồn âm
    let remaining = -own; let run = Math.max(0, x.openSL); const ev=[]; const push=(d,q,l)=>ev.push({d,q,l});
    state.purchases.filter(r=>r.ma===x.ma && kyOf(r.ngayNhap)===p.ky).forEach(r=>push(r.ngayNhap, num(r.sl), null));
    state.issues.filter(r=>r.maVT===x.ma && kyOf(r.ngay)===p.ky).forEach(r=>push(r.ngay, -num(r.sl), null));
    state.sales.filter(r=>r.ma===x.ma && kyOf(r.ngay)===p.ky).forEach(r=>push(r.ngay, -num(r.sl), null));
    ls.forEach(l=>push(l.ngayXuatNVL, -l.tong, l));
    ev.sort((a,b)=>a.d.localeCompare(b.d) || (a.q>0?-1:1));
    ev.forEach(e=>{ run = round(run+e.q, 6); if (e.l && run<0 && remaining>0) { const cut = round(Math.min(e.l.tong, -run, remaining), 6); if (cut>0) { out.push({maLenh:e.l.maLenh, ngay:e.l.ngayXuatNVL, maTP:e.l.maTP, maVT:x.ma, ten:x.ten, dvt:x.dvt, hienXuat:e.l.tong, deXuat:-cut, tonSau: round(run+cut,6)}); run = round(run+cut,6); remaining = round(remaining-cut,6); } } });
  });
  return {rows:out, analysis};
}
function pendingProposal(){ try { const p=P(); if(!p) return {tang:0,giam:0,dc:0,n:0}; const d=buildProposal(p); const tang=sum(d.chotRows.filter(c=>c.dc>0),c=>c.dc), giam=-sum(d.chotRows.filter(c=>c.dc<0),c=>c.dc); const a=buildAdjProposal(p); return {tang, giam, dc:a.rows.length, am:a.analysis.length, n:(tang>0||giam>0?1:0)+(a.rows.length?1:0)}; } catch(e){ return {tang:0,giam:0,dc:0,n:0}; } }
