//# Biểu mẫu Thêm, đổi mã, sửa dữ liệu một lần, dán dữ liệu
// ---------- Hộp "Thêm" dạng biểu mẫu: chỉ tiêu theo từng menu (định nghĩa cột GRID) ----------
function codeChoices(ent, k){
  if (k==='maLenh') return state.orders.filter(o=>!o._new).slice().sort((a,b)=>String(b.ngaySX).localeCompare(String(a.ngaySX))).map(o=>[o.maLenh, `${o.maTP} ${fmtD(o.ngaySX)}`]);
  if (k==='maTP') return state.items.filter(i=>i.nhom==='Thành phẩm').map(i=>[i.ma,i.ten]);
  if (k==='maNVL'||k==='maVT'||k==='maThayThe') return state.items.filter(i=>i.nhom!=='Thành phẩm').map(i=>[i.ma,i.ten]);
  return state.items.map(i=>[i.ma,i.ten]);
}

// Enter trong ô nhập liệu: chuyển sang ô kế tiếp, KHÔNG lưu – chỉ lưu khi bấm nút Lưu
function focusNext(el){ if (!el) return; const root = el.closest('#modal .in, tr, .box, form') || document; const sel='input:not([type=hidden]):not([type=checkbox]):not(.dnat):not([disabled]):not([readonly]), select:not([disabled]), textarea:not([disabled]), td.ed[contenteditable="true"], td.ed[contenteditable=""], [contenteditable="true"]';
  const list=[...root.querySelectorAll(sel)].filter(x=>x.offsetParent!==null || x===el); let cur = el.classList && el.classList.contains('dnat') ? (el.closest('.dI')||{}).querySelector?.('.dtxt')||el : el; let i=list.indexOf(cur); if (i<0) i=list.indexOf(el);
  const nx=list[i+1]; if (nx) { nx.focus(); if (nx.select && nx.tagName==='INPUT') try{ nx.select(); }catch(e){} } else if (el.blur) el.blur(); }

// Cân đối NVL: xác định lệnh theo Ngày sản xuất + Mã sản phẩm (Lệnh SX có thể bỏ trống – PM tự gắn lệnh đầu tiên khớp)
function adjResolve(a){ if (!a) return a; const os=state.orders.filter(o=>!o._new);
  if (a.ngaySX && a.maTP) { const m=os.filter(o=>o.ngaySX===a.ngaySX && o.maTP===a.maTP).sort((x,y)=>String(x.maLenh).localeCompare(String(y.maLenh)));
    if (m.length) { if (!a.maLenh || !m.some(o=>o.maLenh===a.maLenh)) a.maLenh=m[0].maLenh; } else if (a.maLenh && !os.some(o=>o.maLenh===a.maLenh && o.ngaySX===a.ngaySX && o.maTP===a.maTP)) a.maLenh=''; }
  else if (a.maLenh) { const o=os.find(x=>x.maLenh===a.maLenh); if (o) { if (!a.ngaySX) a.ngaySX=o.ngaySX; if (!a.maTP) a.maTP=o.maTP; } }
  return a; }
function adjResolveAll(){ state.adjustments.forEach(a=>{ if (!a._new) adjResolve(a); }); }

// Đổi mã hàng trong Danh mục: cập nhật mọi chứng từ / định mức / NVL thay thế / cân đối / tồn đầu đang dùng mã cũ
function renameCode(oldMa, newMa){ if (!oldMa || !newMa || oldMa===newMa) return 0; let n=0; const sw=(arr,fields)=>(arr||[]).forEach(r=>fields.forEach(f=>{ if (r[f]===oldMa) { r[f]=newMa; n++; } }));
  sw(state.purchases,['ma']); sw(state.sales,['ma']); sw(state.issues,['maVT']); sw(state.bom,['maTP','maNVL']); sw(state.subs,['maTP','maNVL','maThayThe']); sw(state.orders,['maTP']); sw(state.adjustments,['maTP','maVT']); sw(state.caps,['maTP']);
  const op=state.opening&&state.opening.rows; if (op && op[oldMa]) { if (!op[newMa]) op[newMa]=op[oldMa]; else { op[newMa].sl=num(op[newMa].sl)+num(op[oldMa].sl); op[newMa].tt=num(op[newMa].tt)+num(op[oldMa].tt); } delete op[oldMa]; n++; }
  return n; }
// sửa mã một lần theo xác nhận của người dùng (17/11/2026): MUIHEO1 trong định mức chính là PG_GREENINNO
function fixCodesOnce(){ const FX=[['MUIHEO1','PG_GREENINNO']]; const done=state.settings.codeFixes||[]; let any=false;
  FX.forEach(([o,nw])=>{ const key=o+'>'+nw; if (done.includes(key)) return; const hasNew=state.items.some(i=>i.ma===nw);
    if (hasNew) state.items=state.items.filter(i=>i.ma!==o || false); else state.items.forEach(i=>{ if (i.ma===o) i.ma=nw; });
    // trùng mã do sửa tay: giữ một dòng (ưu tiên dòng không phải tên tạm)
    const dup=state.items.filter(i=>i.ma===nw); if (dup.length>1) { const keepOne=dup.find(i=>!/^MUIHEO1/.test(i.ten||''))||dup[0]; state.items=state.items.filter(i=>i.ma!==nw || i===keepOne); }
    renameCode(o, nw); done.push(key); any=true; });
  if (any) { state.settings.codeFixes=done; return true; } return false; }
// bổ sung dữ liệu theo xác nhận của KH (17/11/2026) – chạy một lần trên dữ liệu đang có
function dataFixesOnce(){ const done=state.settings.dataFixes||[]; const msg=[]; const it=itemMap(); const has=k=>done.includes(k);
  if (!has('bom-pate-pm')) { const add=(tp,nvl,q,gc)=>{ const ref=state.bom.find(b=>b.maTP===tp && (b.loai||'DM')==='DM'); if (!ref || !it[nvl] || state.bom.some(b=>b.maTP===tp && b.maNVL===nvl && (b.loai||'DM')==='DM')) return; state.bom.push({_id:uid(), loai:'DM', maTP:tp, maNVL:nvl, slTP:ref.slTP, slNVL:q, lanNgay:ref.lanNgay, haoHut:0, maThayThe:'', tuNgay:'', denNgay:'', tyLe:'', ghiChu:gc}); msg.push(`ĐM ${tp}: ${nvl} ${String(q).replace('.',',')}`); };
    add('PATE1','BB_PATE',760,'Túi pate'); add('PATE2','BB_PATE',720,'Túi pate'); add('DABAO','PG_PM',0.05,'Phẩm màu Sunset Yellow (màu da bao)'); done.push('bom-pate-pm'); }
  if (!has('xc-sgel-sp')) { [['PG_SGEL','2026-06-10'],['PG_SP','2026-06-11']].forEach(([ma,d])=>{ if (!it[ma] || state.issues.some(x=>x.maVT===ma && x.ngay===d)) return; const q=sum(state.purchases.filter(r=>r.ma===ma && r.ngayNhap<=d),r=>num(r.sl)); if (!q) return;
      state.issues.push({_id:uid(), maPhieu:genMaPhieu(d), ngay:d, maVT:ma, sl:q, lyDo:'Xuất thử nghiệm', loai:'Thử nghiệm (641)', kho:String(it[ma].kho||'152')}); msg.push(`Xuất thử nghiệm ${ma} ${q} ngày ${fmtD(d)}`); });
    done.push('xc-sgel-sp'); }
  if (!has('ml430-mepl') && it.PG_ML430 && it.PG_MEPL) {
    if (!state.subs.some(x=>x.maNVL==='PG_MEPL' && x.maThayThe==='PG_ML430')) state.subs.push({_id:uid(), maTP:'', maNVL:'PG_MEPL', maThayThe:'PG_ML430', tuNgay:'', denNgay:'', tyLe:0, ghiChu:'ML 430 thay thế Meat Plus +400 – dùng khi hết Meat Plus (ghi bằng Cân đối NVL)'});
    if (!state.adjustments.some(a=>a.maVT==='PG_ML430')) { const p0=state.purchases.filter(r=>r.ma==='PG_ML430').sort((a,b)=>a.ngayNhap.localeCompare(b.ngayNhap)); const d0=p0.length?p0[0].ngayNhap:''; let q=sum(p0,r=>num(r.sl));
      if (d0 && q>0) { dataVer++; calcCache=null; const c=calcLive(); const ls=[]; Object.values(c.periods||{}).forEach(p=>p.lines.forEach(l=>{ if (l.maVT==='PG_MEPL' && l.ngayXuatNVL>=d0 && l.slDM>0) ls.push(l); })); ls.sort((a,b)=>(a.ngayXuatNVL+a.maLenh).localeCompare(b.ngayXuatNVL+b.maLenh));
        for (const l of ls) { if (q<=0) break; const use=round(Math.min(q, l.slDM),6); const cut=round(Math.min(use, Math.max(0,l.tong)),6); const why='Hết Meat Plus – dùng ML 430 thay thế';
          if (cut>0) state.adjustments.push({_id:uid(), maLenh:l.maLenh, maVT:'PG_MEPL', dieuChinh:-cut, lyDo:why, ngaySX:l.ngaySX||l.ngayXuatNVL, maTP:l.maTP});
          state.adjustments.push({_id:uid(), maLenh:l.maLenh, maVT:'PG_ML430', dieuChinh:use, lyDo:why, ngaySX:l.ngaySX||l.ngayXuatNVL, maTP:l.maTP}); msg.push(`${l.maLenh}: dùng ${String(use).replace('.',',')} kg ML 430 thay Meat Plus`); q=round(q-use,6); } } }
    done.push('ml430-mepl'); }
  if (!has('pate-tnv')) { const nb=state.bom.length; state.bom=state.bom.filter(b=>!(['PATE1','PATE2'].includes(b.maTP) && b.maNVL==='BB_TNV')); const nB=nb-state.bom.length;
    const om={}; state.orders.forEach(o=>om[o.maLenh]=o); const na=state.adjustments.length; state.adjustments=state.adjustments.filter(a=>!(a.maVT==='BB_TNV' && ['PATE1','PATE2'].includes((om[a.maLenh]||{}).maTP||a.maTP))); const nA=na-state.adjustments.length;
    if (nB) msg.push(`Xóa BB_TNV khỏi ĐM PATE1/PATE2 (thay bằng BB_PATE)${nA?` và ${nA} dòng cân đối BB_TNV của lệnh pate`:''}`); done.push('pate-tnv'); }
  state.settings.dataFixes=done; return msg; }
function addForm(ent, defaults, opts){
  opts = opts || {};
  const g = GRID[ent]; if (!g) return;
  const EDIT = !!opts.row, VIEW = opts.mode==='view';
  const r = Object.assign({_id:uid()}, ...[{}]); g.cols.forEach(c=>r[c.k]=c.n?0:'');
  if (EDIT) Object.assign(r, opts.row); else { if (ent==='orders') r.loaiDM='DM'; if (ent==='issues') r.loai='Thử nghiệm (641)'; if (ent==='bom') r.loai='DM'; Object.assign(r, defaults||{}); }
  const rowKy = row => g.noKy ? '' : (g.kyOfRow ? g.kyOfRow(row) : kyOf(row[g.kyf]));
  const lockedRow = EDIT && rowKy(opts.row) && isLocked(rowKy(opts.row));
  const closeIt = () => { if (opts.back) opts.back(); else closeModal(); };
  const p = P(); const extra = g.extra ? g.extra(p) : {};
  const codes = g.codes || (ent==='plan'?['maTP']:[]);
  const codeSet = new Set([...codes, ...(ent==='adjustments'?['maLenh']:[])]);
  const req = new Set(g.req || (ent==='plan'?['ngaySX','maTP','soMe']:[]));
  const after=g.after||{}, before=g.before||{}; const placed=new Set([...Object.values(after).flat(), ...Object.values(before).flat()]);
  const layout=[]; g.cols.forEach(c=>{ (before[c.k]||[]).forEach(x=>{ if(extra[x]) layout.push({x}); }); layout.push({c}); (after[c.k]||[]).forEach(x=>{ if(extra[x]) layout.push({x}); }); }); Object.keys(extra).filter(x=>!placed.has(x)).forEach(x=>layout.push({x}));
  const lists = {};
  const fld = (l,i) => {
    if (l.x) return `<div class="af-f"><label>${esc(l.x)}</label><input type="text" class="af-ro" data-x="${esc(l.x)}" disabled></div>`;
    const c=l.c, v=r[c.k]; const lab=`<label>${esc(c.t)}${req.has(c.k)?' <b class="af-req">*</b>':''}</label>`;
    if (c.d) return `<div class="af-f">${lab}<input type="date" data-k="${c.k}" value="${esc(v||'')}"></div>`;
    if (c.n) return `<div class="af-f">${lab}<input type="text" inputmode="decimal" class="af-n" data-k="${c.k}" value="${v?esc(fmtQi(v)):''}"></div>`;
    if (c.sel || codeSet.has(c.k)) { const id='afl_'+c.k; lists[id] = c.sel ? c.sel.map(o=>[o,'']) : codeChoices(ent,c.k);
      return `<div class="af-f">${lab}<input type="text" list="${id}" data-k="${c.k}" data-pick="${c.sel?'sel':'code'}" placeholder="Gõ để tìm…" value="${esc(v||'')}" autocomplete="off"></div>`; }
    return `<div class="af-f">${lab}<input type="text" data-k="${c.k}" value="${esc(v||'')}"></div>`;
  };
  modal(`<div class="hd"><h3>${EDIT ? esc(opts.title||g.t)+(lockedRow?' <span class="pill bad small">Tháng đã khóa</span>':'') : 'Thêm — '+esc(opts.title||({purchases:'Mua hàng / nhập kho', sales:'Bán hàng / xuất kho'})[ent]||g.t)}</h3><button class="x" id="afX" title="Đóng" aria-label="Đóng">${IC('x')}</button></div>
    <div class="af-grid">${layout.map(fld).join('')}</div>
    ${Object.entries(lists).map(([id,arr])=>`<datalist id="${id}">${arr.map(([v,t])=>`<option value="${esc(v)}">${esc(t)}</option>`).join('')}</datalist>`).join('')}
    <div class="ft">${VIEW ? `<button class="btn" id="afClose">Đóng</button><button class="btn p" id="afEdit" ${lockedRow?'disabled title="Tháng đã khóa – mở khóa ở Tổng quan để sửa"':''}>${IC('edit')}Sửa</button>` : `<button class="btn" id="afCancel">Hủy</button><button class="btn p" id="afSave">${IC('save')}Lưu</button>`}</div>`);
  const box=$('#modal .in'); box.classList.add('tcm','afm');
  const inp = k => box.querySelector(`[data-k="${k}"]`);
  const pickVal = el => { let v=el.value.trim(); if (el.dataset.pick==='code') { v=v.split(' – ')[0].trim(); const up=v.toUpperCase(); if (state.items.some(i=>i.ma===up)) v=up; } return v; };
  const read = () => { const t=Object.assign({}, r); g.cols.forEach(c=>{ const el=inp(c.k); if(!el) return; let v = el.dataset.pick ? pickVal(el) : el.value.trim(); if (c.n) v=num(v); else if (c.d) v=v?toISODate(v):''; t[c.k]=v; }); return t; };
  const touched = new Set();
  const refresh = (k) => { const t=read(); if (k && g.onEdit) { try { g.onEdit(t,k); } catch(e){} }
    g.cols.forEach(c=>{ if (c.k===k || touched.has(c.k)) return; const el=inp(c.k); if (!el) return; const cur = c.n ? num(el.value) : el.value; if (t[c.k]!==undefined && t[c.k]!==cur && (c.n ? num(t[c.k])!==num(el.value) : t[c.k]!==el.value)) el.value = c.n ? (num(t[c.k])?fmtQ(t[c.k]):'') : (t[c.k]||''); });
    box.querySelectorAll('[data-x]').forEach(el=>{ const f=extra[el.dataset.x]; let v=''; try { v=f(t); } catch(e){} el.value = v==null?'':String(v); el.title=el.value; });
    return t; };
  // Ngày nhập kho tự theo Ngày hóa đơn (Mua hàng) khi chưa nhập tay
  { const khoEl=inp('kho'), codeK = ['purchases','sales'].includes(ent)?'ma':(ent==='issues'?'maVT':''); if (khoEl && codeK && inp(codeK)) { const ce=inp(codeK); const f=()=>{ if (touched.has('kho')) return; const k=itemKho(pickVal(ce)); if (k) khoEl.value=k; }; ce.addEventListener('input',f); ce.addEventListener('change',f); } }
  if (ent==='purchases') { const nm=inp('ngayMua'), nn=inp('ngayNhap'); if (nm && nn) { let auto=!nn.value; nn.addEventListener('input',()=>{ auto=!nn.value; }); nm.addEventListener('input',()=>{ if (auto) nn.value=nm.value; }); } }
  box.querySelectorAll('[data-k]').forEach(el=>{ const k=el.dataset.k; el.addEventListener('input',()=>{ touched.add(k); el.classList.remove('af-bad'); refresh(k); }); el.addEventListener('change',()=>refresh(k)); el.addEventListener('keydown',e=>{ if (e.key==='Enter' && el.tagName!=='TEXTAREA') { e.preventDefault(); focusNext(el); } }); });
  refresh();
  if (VIEW) {
    box.querySelectorAll('[data-k]').forEach(el=>{ el.disabled=true; el.classList.add('af-ro'); });
    $('#afX').onclick = $('#afClose').onclick = closeIt;
    $('#afEdit').onclick = () => { if (lockedRow) return toast('Tháng đã khóa – mở khóa ở Tổng quan để sửa', 4000); addForm(ent, null, Object.assign({}, opts, {mode:'edit'})); };
    return;
  }
  const first = box.querySelector('[data-k]'); if (first) setTimeout(()=>first.focus(),30);
  $('#afX').onclick = EDIT ? closeIt : ()=>closeModal();
  $('#afCancel').onclick = EDIT ? ()=>addForm(ent, null, Object.assign({}, opts, {mode:'view'})) : ()=>closeModal();
  const bad = (ks, msg, ms) => { ks.forEach(k=>{ const el=inp(k); if (el) el.classList.add('af-bad'); }); toast(msg, ms||5000); return false; };
  const doSave = (confirmed) => {
    const t = refresh();
    const missK = [...req].filter(k=>{ const c=g.cols.find(c=>c.k===k); return c && (c.n ? !num(t[k]) : !t[k]); });
    if (missK.length) return bad(missK, 'Chưa nhập đủ thông tin bắt buộc – còn thiếu: '+missK.map(k=>g.cols.find(c=>c.k===k).t).join(', '));
    { const bs=g.cols.find(c=>c.sel && t[c.k] && !c.sel.includes(t[c.k])); if (bs) return bad([bs.k], `${bs.t} phải là một trong: ${bs.sel.join(', ')}`); }
    if (g.unique && state[ent].some(x=>x!==opts.row && x[g.unique]===t[g.unique])) { const c=g.cols.find(c=>c.k===g.unique)||{t:'Mã'}; return bad([g.unique], `${c.t} ${c.d?fmtD(t[g.unique]):t[g.unique]} đã có ${ent==='items'?'trong danh mục':'trong danh sách'}`); }
    const im=itemMap(); const badCode=codes.filter(k=>t[k] && !im[t[k]]); if (badCode.length) return bad(badCode, `Mã chưa có trong Danh mục hàng: ${badCode.map(k=>t[k]).join(', ')} – chọn mã khác hoặc tạo mã trong Danh mục`, 6000);
    if (ent==='adjustments') { adjResolve(t); if (!t.maLenh) return bad(['ngaySX','maTP'], `Không có lệnh SX ngày ${fmtD(t.ngaySX)} cho mã ${t.maTP}`); }
    if (g.validate) { const er=g.validate(t, EDIT?opts.row:null); if (er) return bad([], er); }
    if (!g.noKy) { const ky = g.kyOfRow ? g.kyOfRow(t) : kyOf(t[g.kyf]); if (ky && isLocked(ky)) return bad([g.kyf||'maLenh'], `Kỳ ${fmtKy(ky)} đã khóa – không thêm được. Mở khóa ở Tổng quan nếu cần.`); }
    if (lockedRow) return bad([], 'Tháng của chứng từ đã khóa – không sửa được');
    const Lk=lockedList(); if (!confirmed && Lk.length && ['bom','subs','caps'].includes(ent)) { const last=Lk[Lk.length-1]; const lastEnd=`${last}-${String(daysInMonth(last)).padStart(2,'0')}`; if (!t.tuNgay || t.tuNgay<=lastEnd) { const keep=t; confirmBox(`Dòng mới có hiệu lực từ trước hoặc trong kỳ đã khóa (${Lk.map(fmtKy).join(', ')}) – giá thành các kỳ đó sẽ được tính lại.<br><span class="small mut">Nếu chỉ muốn áp dụng từ kỳ đang mở, hãy đặt <b>Hiệu lực từ</b> sau kỳ đã khóa.</span><br><br>Vẫn lưu?`, ()=>commit(keep)); return; } }
    commit(t);
  };
  const commit = t => {
    if (ent==='orders') { if (!EDIT || !t.ngaySX) t.ngaySX = t.ngayXuatNVL; if (!t.loaiDM) t.loaiDM='DM'; if (!t.maLenh) t.maLenh = genMaLenh(t.ngaySX); }
    if (ent==='issues' && !t.maPhieu) t.maPhieu = genMaPhieu(t.ngay);
    if (ent==='purchases' && !t.ngayMua) t.ngayMua = t.ngayNhap;
    if (ent==='sales') t.donGia = num(t.sl) ? round(num(t.doanhSo)/num(t.sl),2) : 0;
    delete t._new;
    if (EDIT) { const sc=[document.scrollingElement.scrollTop, ($('#main .tw')||{}).scrollTop||0]; t._id=opts.row._id; Object.keys(opts.row).forEach(k=>{ if(!(k in t)) delete opts.row[k]; }); Object.assign(opts.row, t); changed(); closeModal(); render(); document.scrollingElement.scrollTop=sc[0]; const tw=$('#main .tw'); if (tw) tw.scrollTop=sc[1]; toast('Đã lưu'); if (opts.back) opts.back(); return; }
    state[ent].unshift(t); changed(); closeModal(); if (opts.after) opts.after(t); render(); toast('Đã thêm');
  };
  $('#afSave').onclick = () => doSave(false);
}
function openingForm(){
  const items=itemMap(); const avail = state.items.filter(i=>!(state.opening.rows[i.ma]&&(state.opening.rows[i.ma].sl||state.opening.rows[i.ma].tt)));
  modal(`<div class="hd"><h3>Thêm — Số dư NXT đầu kỳ</h3><button class="x" id="afX" title="Đóng" aria-label="Đóng">${IC('x')}</button></div>
    <div class="af-grid">
      <div class="af-f"><label>Mã hàng <b class="af-req">*</b></label><input type="text" id="ofMa" list="ofl" placeholder="Gõ để tìm…" autocomplete="off"></div>
      <div class="af-f"><label>Tên hàng</label><input type="text" class="af-ro" id="ofTen" disabled></div>
      <div class="af-f"><label>Nhóm</label><input type="text" class="af-ro" id="ofNhom" disabled></div>
      <div class="af-f"><label>ĐVT</label><input type="text" class="af-ro" id="ofDvt" disabled></div>
      <div class="af-f"><label>Kho <b class="af-req">*</b></label><input type="text" id="ofKho"></div>
      <div class="af-f"><label>Tồn đầu SL <b class="af-req">*</b></label><input type="text" inputmode="decimal" class="af-n" id="ofSl"></div>
      <div class="af-f"><label>Tồn đầu trị giá <b class="af-req">*</b></label><input type="text" inputmode="decimal" class="af-n" id="ofTt"></div>
      <div class="af-f"><label>Giá vốn đầu kỳ</label><input type="text" class="af-ro" id="ofGv" disabled></div>
    </div><datalist id="ofl">${avail.map(i=>`<option value="${esc(i.ma)}">${esc(i.ten)}</option>`).join('')}</datalist>
    <div class="ft"><button class="btn" id="afCancel">Hủy</button><button class="btn p" id="afSave">${IC('save')}Lưu</button></div>`);
  $('#modal .in').classList.add('tcm','afm');
  const code=()=>$('#ofMa').value.split(' – ')[0].trim().toUpperCase();
  const fill=()=>{ const it=items[code()]; $('#ofTen').value=it?it.ten:(code()?'(chưa có trong danh mục)':''); $('#ofNhom').value=it?it.nhom:''; $('#ofDvt').value=it?it.dvt:''; if (!$('#ofKho').dataset.t) $('#ofKho').value=it?(it.kho||''):''; const sl=num($('#ofSl').value), tt=num($('#ofTt').value); $('#ofGv').value = sl?fmtN(tt/sl):''; };
  $('#ofKho').addEventListener('input',()=>{ $('#ofKho').dataset.t='1'; $('#ofKho').classList.remove('af-bad'); });
  ['#ofMa','#ofSl','#ofTt'].forEach(s=>{ $(s).oninput=()=>{ $(s).classList.remove('af-bad'); fill(); }; $(s).onkeydown=e=>{ if(e.key==='Enter'){ e.preventDefault(); focusNext($(s)); } }; });
  setTimeout(()=>$('#ofMa').focus(),30);
  $('#afX').onclick = $('#afCancel').onclick = ()=>closeModal();
  $('#afSave').onclick=()=>{ const ma=code(), sl=num($('#ofSl').value), tt=num($('#ofTt').value);
    if (!ma) { $('#ofMa').classList.add('af-bad'); return toast('Chọn mã hàng'); }
    if (!items[ma]) { $('#ofMa').classList.add('af-bad'); return toast(`Mã ${ma} chưa có trong Danh mục hàng – tạo mã trước`, 4000); }
    const kho=$('#ofKho').value.trim(); if (!kho) { $('#ofKho').classList.add('af-bad'); return toast('Chưa nhập Kho – Kho là cột bắt buộc'); }
    if (!sl && !tt) { $('#ofSl').classList.add('af-bad'); $('#ofTt').classList.add('af-bad'); return toast('Nhập Tồn đầu SL và Trị giá'); }
    if (state.opening.rows[ma] && (state.opening.rows[ma].sl||state.opening.rows[ma].tt)) { $('#ofMa').classList.add('af-bad'); return toast(`Mã ${ma} đã có số dư – dùng nút Sửa`, 4000); }
    state.opening.rows[ma]={sl,tt,kho}; if(!state.opening.ky) state.opening.ky = state.settings.startKy || selKy; if(!state.settings.startKy) state.settings.startKy=state.opening.ky;
    changed(); closeModal(); render(); toast('Đã thêm'); };
}
function confirmBox(html, onOk){ modal(`<h3>Xác nhận</h3><div>${html}</div><div style="text-align:right;margin-top:14px"><button class="btn" id="mc">Hủy</button> <button class="btn p" id="mo">Đồng ý</button></div>`); $('#mc').onclick=()=>closeModal(); $('#mo').onclick=()=>{ closeModal(); onOk(); }; }
function swapBomDialog(id){
  const r=state.bom.find(x=>x._id===id); if(!r) return; const it=itemMap();
  modal(`<h3>Đổi NVL vĩnh viễn – ${esc(r.maTP)} ${esc((it[r.maTP]||{}).ten||'')}</h3>
  <div class="note">NVL hiện tại <b>${esc(r.maNVL)} – ${esc((it[r.maNVL]||{}).ten||'')}</b> (${fmtQ(num(r.slNVL))}/mẻ) sẽ <b>hết hiệu lực</b> trước ngày đổi; dòng mới với NVL mới sẽ <b>có hiệu lực từ ngày đổi</b>. Lệnh SX trước ngày đổi vẫn tính theo NVL cũ.</div>
  <div class="grid2"><div class="fld"><label>NVL mới</label><select id="swNVL"><option value="">– chọn –</option>${state.items.filter(i=>i.nhom!=='Thành phẩm').map(i=>`<option value="${esc(i.ma)}">${esc(i.ma)} – ${esc(i.ten)}</option>`).join('')}</select></div><div class="fld"><label>Đổi từ ngày</label><input type="date" id="swNgay" value="${esc(new Date().toISOString().slice(0,10))}"></div><div class="fld"><label>SL NVL mới / lần (trống = giữ ${fmtQ(num(r.slNVL))})</label><input type="number" id="swSL" step="any"></div><div class="fld"><label>Ghi chú</label><input type="text" id="swGc" placeholder="Lý do đổi"></div></div>
  <div style="text-align:right;margin-top:10px"><button class="btn" id="mc">Hủy</button> <button class="btn p" id="swOk">Thực hiện</button></div>`);
  $('#mc').onclick=()=>{ closeModal(); render(); };
  $('#swOk').onclick=()=>{ const nv=$('#swNVL').value, ng=$('#swNgay').value; if(!nv||!ng) return toast('Chọn NVL mới và ngày đổi'); const d=new Date(ng+'T00:00:00'); d.setDate(d.getDate()-1); const prev=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; if (r.tuNgay && prev<r.tuNgay) return toast('Ngày đổi phải sau ngày hiệu lực của dòng cũ'); r.denNgay=prev; r.ghiChu=(r.ghiChu?r.ghiChu+' · ':'')+`Thay bằng ${nv} từ ${fmtD(ng)}`; state.bom.push({_id:uid(), loai:r.loai, maTP:r.maTP, maNVL:nv, slTP:r.slTP, slNVL: num($('#swSL').value)||r.slNVL, lanNgay:r.lanNgay, haoHut:r.haoHut, maThayThe:'', tuNgay:ng, denNgay:'', tyLe:0, ghiChu:$('#swGc').value||`Thay cho ${r.maNVL} từ ${fmtD(ng)}`}); changed(); closeModal(); render(); toast('Đã đổi NVL – dòng cũ hết hiệu lực, dòng mới áp dụng từ ngày đổi'); };
}
function pasteDialog(ent){ importDialog(ent); }

