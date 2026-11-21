function itemTabs(act){ return `<div class="tabs"><button data-itab="d_items" class="${act==='vthh'?'act':''}">${icon('box')}Danh mục VTHH</button><button data-itab="d_nhom" class="${act==='nhom'?'act':''}">${icon('folder')}Nhóm hàng</button></div>`; }
function bindItemTabs(m){ m.querySelectorAll('[data-itab]').forEach(b=>b.onclick=()=>guardEdit(()=>{ view=b.dataset.itab; render(); })); }
function vNhomHang(m){
  const L=nhomList().slice().sort((a,b)=>num(a.thuTu)-num(b.thuTu) || a.ten.localeCompare(b.ten,'vi'));
  const cnt={}; state.items.forEach(i=>{ cnt[i.nhom]=(cnt[i.nhom]||0)+1; });
  const rows=L.filter(x=>!search || matchQ(search, [x.ten, NHOM_LOAI[x.loai]].join(' ')));
  m.innerHTML = head('Danh mục hàng hóa', `<button class="btn p" id="nhAdd" title="Thêm nhóm hàng">+ Thêm</button><button class="btn" id="nhXl" title="Xuất danh sách nhóm hàng ra Excel">⬇ Xuất Excel</button>`) + itemTabs('nhom') +
    `<div class="bar"><input type="text" id="q" placeholder="Tìm…" value="${esc(search)}" style="width:220px"><span id="selBar" class="small"></span></div>
    <div class="tw"><table data-grid="1"><thead><tr><th class="selc" title="Chọn / bỏ chọn tất cả"><input type="checkbox" class="rselall"></th><th>Nhóm hàng</th><th class="n">Số mã hàng</th><th></th></tr></thead><tbody>${rows.map(x=>{ const used=cnt[x.ten]||0;
      return `<tr data-rid="${esc(x.ten)}" class="${gridSel.has(x.ten)?'rowsel':''}"><td class="selc"><input type="checkbox" class="rsel" data-sel="${esc(x.ten)}" ${gridSel.has(x.ten)?'checked':''} title="Chọn dòng"></td><td>${esc(x.ten)}</td><td class="n">${used||''}</td><td class="act"><button class="btn s" data-nedit="${esc(x.ten)}" title="Sửa nhóm hàng">Sửa</button><button class="btn s d" data-ndel="${esc(x.ten)}" title="Xóa nhóm hàng">Xóa</button></td></tr>`; }).join('')}</tbody></table></div>`;
  bindKy(); bindSearch(); bindItemTabs(m);
  $('#nhXl').onclick=()=>{ const t=$('#main .tw > table'); if (t) exportVisibleTable(t); };
  const saveList = list => { state.settings.nhomList = list.map(({ten,loai,thuTu,macDinh})=>({ten,loai,thuTu:num(thuTu),...(macDinh?{macDinh:1}:{})})); applyNhom(); calcCache=null; changed(); render(); };
  const form = cur => { const isNew=!cur; const md=cur&&cur.macDinh; const used=cur?(cnt[cur.ten]||0):0;
    const F=(lab,inner)=>`<div class="fld"><label>${lab}</label>${inner}</div>`;
    modal(`<div class="tsh"><h3>${isNew?'Thêm':'Sửa'} — Nhóm hàng</h3><button class="tsx" id="afX" title="Đóng" aria-label="Đóng">${icon('x')}</button></div><div class="frm">`+
      F('Nhóm hàng <b class="rq">*</b>', `<input type="text" id="nhTen" value="${esc(cur?cur.ten:'')}" ${md?'disabled class="ro"':''}>`)+
      F('Cách tính giá <b class="rq">*</b>', `<input type="text" id="nhLoai" list="dl_nhloai" placeholder="Gõ để tìm…" autocomplete="off" value="${esc(cur?NHOM_LOAI[cur.loai]:'')}" ${md||used?'disabled class="ro"':''}>`)+
      F('Thứ tự', `<input type="text" class="num" id="nhTT" inputmode="decimal" value="${cur?esc(String(num(cur.thuTu)).replace('.',',')):fmtQ(Math.floor(Math.max(0,...L.map(x=>num(x.thuTu))))+1)}">`)+
      `</div><datalist id="dl_nhloai">${Object.values(NHOM_LOAI).map(v=>`<option value="${esc(v)}">`).join('')}</datalist>${md||used?`<div class="tsd" style="margin-top:8px">${md?'Nhóm mặc định của phần mềm – chỉ đổi được thứ tự.':'Nhóm đang có mã hàng – không đổi cách tính giá được.'}</div>`:''}<div class="tsf"><span class="sp"></span><button class="btn" id="afCancel">Hủy</button><button class="btn p" id="afSave">${icon('save')}<span>Lưu</span></button></div>`);
    const box=$('#modal .in'); box.classList.add('tsm','afm'); formEnterNav(box, $('#afSave')); box.onkeydown=e=>{ if (e.key==='Escape') closeModal(); };
    $('#afX').onclick=closeModal; $('#afCancel').onclick=closeModal;
    $('#afSave').onclick=()=>{ const ten=$('#nhTen').value.trim(); const lt=$('#nhLoai').value.trim(); const loai=Object.keys(NHOM_LOAI).find(k=>NHOM_LOAI[k]===lt); const tt=num($('#nhTT').value);
      if (!ten) return toast('Nhập tên nhóm hàng'); if (!loai) return toast('Chọn Cách tính giá trong danh sách', 3500);
      const list=nhomList().map(x=>({...x})); if (list.some(x=>x.ten.toLowerCase()===ten.toLowerCase() && (!cur || x.ten!==cur.ten))) return toast(`Nhóm "${ten}" đã có`, 3500);
      if (isNew) list.push({ten, loai, thuTu:tt}); else { const x=list.find(x=>x.ten===cur.ten); if (!md && x.ten!==ten) state.items.forEach(i=>{ if (i.nhom===x.ten) i.nhom=ten; }); if (!md) x.ten=ten; if (!md && !used) x.loai=loai; x.thuTu=tt; }
      closeModal(); saveList(list); toast('Đã lưu'); };
    setTimeout(()=>{ const f=box.querySelector('.frm input:not([disabled])'); if (f) f.focus(); }, 30); };
  $('#nhAdd').onclick=()=>form(null);
  m.querySelectorAll('[data-nedit]').forEach(b=>b.onclick=()=>form(nhomList().find(x=>x.ten===b.dataset.nedit)));
  m.querySelectorAll('tbody tr[data-rid]').forEach(tr=>tr.ondblclick=e=>{ if (e.target.closest('button')) return; const b=tr.querySelector('[data-nedit]'); if (b) b.click(); });
  const delNhom = names => { const busy=names.filter(n=>cnt[n]); const ok=names.filter(n=>!cnt[n]);
    if (!ok.length) return toast(busy.length===1 ? `Nhóm "${busy[0]}" đang có ${cnt[busy[0]]} mã hàng – chuyển các mã sang nhóm khác (tab Danh mục VTHH) rồi mới xóa được` : `Các nhóm đã chọn đều đang có mã hàng – chuyển mã sang nhóm khác trước`, 5000);
    confirmBox(`Xóa ${ok.length===1?`nhóm hàng <b>${esc(ok[0])}</b>`:`<b>${ok.length}</b> nhóm hàng`}?${busy.length?`<div class="warnbox" style="margin-top:8px">Bỏ qua ${busy.length} nhóm đang có mã hàng: ${esc(busy.join(', '))}</div>`:''}`, ()=>{ const S=new Set(ok); ok.forEach(n=>gridSel.delete(n)); saveList(nhomList().filter(x=>!S.has(x.ten))); toast(`Đã xóa ${ok.length} nhóm`); }); };
  m.querySelectorAll('[data-ndel]').forEach(b=>b.onclick=()=>delNhom([b.dataset.ndel]));
  if (gridSelEnt!=='nhom') { gridSel.clear(); gridSelEnt='nhom'; }
  const selUpd=()=>{ const bar=$('#selBar'); if(!bar) return; const n=gridSel.size; bar.classList.toggle('on', n>0); bar.innerHTML = n ? `Đã chọn <b>${n}</b> nhóm <button class="btn s d" id="selDel" title="Xóa ${n} nhóm đã chọn">Xóa các dòng đã chọn</button><button class="btn s" id="selClr" title="Bỏ chọn tất cả">Bỏ chọn</button>` : ''; if (n) { $('#selDel').onclick=()=>delNhom([...gridSel]); $('#selClr').onclick=()=>{ gridSel.clear(); render(); }; } };
  m.querySelectorAll('.rsel').forEach(c=>c.onchange=()=>{ if (c.checked) gridSel.add(c.dataset.sel); else gridSel.delete(c.dataset.sel); c.closest('tr').classList.toggle('rowsel', c.checked); selUpd(); });
  { const sa=m.querySelector('.rselall'); if (sa) { sa.onclick=e=>e.stopPropagation(); sa.onchange=()=>{ m.querySelectorAll('tbody tr').forEach(tr=>{ const c=tr.querySelector('.rsel'); if (!c || tr.style.display==='none') return; c.checked=sa.checked; if (sa.checked) gridSel.add(c.dataset.sel); else gridSel.delete(c.dataset.sel); tr.classList.toggle('rowsel', sa.checked); }); selUpd(); }; } }
  selUpd();
}
