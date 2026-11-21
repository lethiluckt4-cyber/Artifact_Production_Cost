function vSetup(m){ const t=m.dataset.tlt||'tl'; if (t==='cal') vGrid('cal'); else if (t==='pb') vAlloc(m); else if (t==='loi') vLoi(m); else vThietLap(m);
  const tb=document.createElement('div'); tb.className='tabs'; tb.innerHTML=`<button data-tlt="tl" class="${t==='tl'?'act':''}">Thiết lập & sao lưu</button><button data-tlt="cal" class="${t==='cal'?'act':''}">Lịch nghỉ / tăng ca</button><button data-tlt="pb" class="${t==='pb'?'act':''}">Phân bổ 622/627</button><button data-tlt="loi" class="${t==='loi'?'act':''}">Sản phẩm lỗi</button>`;
  const anchor=m.querySelector('.toolbar')||m.querySelector('.top'); if (anchor) anchor.after(tb); else m.prepend(tb);
  tb.querySelectorAll('[data-tlt]').forEach(b=>b.onclick=()=>guardEdit(()=>{ m.dataset.tlt=b.dataset.tlt; render(); })); }
// Thiết lập: mặc định khóa (mờ) – bấm Sửa mới cho sửa; Lưu / Hủy để kết thúc
const EDK=new Set(), EDSNAP={};
function editGate(scope, key, place, snap, restore){ if (!scope || !place) return;
  const on=EDK.has(key);
  if (!on) { scope.querySelectorAll('input:not([type=file]),select,textarea').forEach(i=>i.disabled=true); [...scope.querySelectorAll('.edonly'), ...place.querySelectorAll('.edonly')].forEach(e=>e.classList.add('edhide'));
    scope.querySelectorAll('[contenteditable]').forEach(td=>{ td.removeAttribute('contenteditable'); td.classList.remove('ed'); td.classList.add('rov'); });
    const b=document.createElement('button'); b.className='btn p'; b.innerHTML=`${icon('edit')}<span>Sửa</span>`; b.onclick=()=>{ EDSNAP[key]=snap?JSON.stringify(snap()):null; EDK.add(key); render(); }; place.appendChild(b); }
  else { const c=document.createElement('button'); c.className='btn'; c.textContent='Hủy'; c.onclick=()=>{ if (restore && EDSNAP[key]!=null) restore(JSON.parse(EDSNAP[key])); EDK.delete(key); render(); }; const sv=place.querySelector('.edsave'); if (sv) sv.before(c); else place.appendChild(c); } }
function vThietLap(m){
  const F=(lab,inner)=>`<div class="fld"><label>${lab}</label>${inner}</div>`;
  m.innerHTML = head('Thiết lập & sao lưu') +
  `<div class="grid2">
  <div class="box"><h3>Thông tin chung</h3>
    ${F('Tên công ty / đơn vị', `<input type="text" id="company" value="${esc(state.settings.company||'')}">`)}
    ${F('Kỳ bắt đầu (kỳ có số dư đầu kỳ)', `<input type="text" class="kyin" id="startKy2" placeholder="mm/yyyy" value="${esc(kyMY(state.settings.startKy||''))}">`)}
    <div class="bar edbar" id="egInfo"><button class="btn p edonly edsave" id="tlSave1">${icon('save')}<span>Lưu</span></button></div></div>
  <div class="box"><h3>Sao lưu & phục hồi</h3>
    <p class="small mut" style="margin:0 0 10px">Nên sao lưu cuối mỗi tháng. Phục hồi sẽ thay toàn bộ dữ liệu hiện tại.</p>
    <div class="bar" style="flex-wrap:wrap;gap:8px"><button class="btn p" id="bk">${icon('save')}<span>Sao lưu (.json)</span></button><label class="btn">${icon('xin')}<span>Phục hồi từ file sao lưu</span><input type="file" id="rs" accept=".json" style="display:none"></label><button class="btn" id="bkx">${icon('xout')}<span>Xuất toàn bộ dữ liệu ra Excel</span></button>${hasSeed()?`<button class="btn" id="seed2">${icon('refresh')}<span>Nạp dữ liệu năm 2026</span></button>`:''}</div></div>
  <div class="box"><h3>File tải dữ liệu kế toán</h3><div class="grid2">
    ${F('Mã đối tượng', `<input type="text" id="ktMaDT" value="${esc(state.settings.ktMaDT||'')}">`)}${F('Tên đối tượng', `<input type="text" id="ktTenDT" value="${esc(state.settings.ktTenDT||'')}">`)}
    ${F('TK Nợ phiếu xuất NVL', `<input type="text" id="ktTkNoXK" value="${esc(state.settings.ktTkNoXK||'621')}">`)}${F('TK Có phiếu nhập TP', `<input type="text" id="ktTkCoNK" value="${esc(state.settings.ktTkCoNK||'154')}">`)}</div>
    <div class="bar edbar" id="egKt"><button class="btn p edonly edsave" id="tlSave2">${icon('save')}<span>Lưu</span></button></div></div>
  </div>`;
  { const tb=m.querySelector('.toolbar'); if (tb) tb.remove(); } // tab này không cần chọn kỳ / thiết lập bảng
  const [bInfo,bKt]=[$('#egInfo').closest('.box'), $('#egKt').closest('.box')];
  editGate(bInfo, 'tl-info', $('#egInfo')); editGate(bKt, 'tl-kt', $('#egKt'));
  $('#tlSave1').onclick=()=>{ const inp=$('#startKy2'); const k=kyParse(inp); if (k==null) return; if (!k) return toast('Nhập Kỳ bắt đầu dạng mm/yyyy'); state.settings.company=$('#company').value.trim(); if (state.settings.startKy!==k) { state.settings.startKy=k; state.opening.ky=k; } EDK.delete('tl-info'); changed(); renderNav(); render(); toast('Đã lưu thông tin chung'); };
  $('#tlSave2').onclick=()=>{ ['ktMaDT','ktTenDT','ktTkNoXK','ktTkCoNK'].forEach(k=>{ state.settings[k]=$('#'+k).value.trim(); }); EDK.delete('tl-kt'); store.schedule(); render(); toast('Đã lưu thiết lập file kế toán'); };
  $('#bk').onclick=()=>saveFile(`SaoLuu_GiaThanh_${new Date().toISOString().slice(0,10)}.json`, new Blob([JSON.stringify(toDocs())], {type:'application/json'}));
  $('#bkx').onclick=()=>saveWb(buildTemplate(true), `DuLieu_GiaThanh_${new Date().toISOString().slice(0,10)}.xlsx`);
  $('#rs').onchange=async e=>{ const f=e.target.files[0]; if(!f) return; try { const docs=JSON.parse(await f.text()); confirmBox('Thay toàn bộ dữ liệu hiện tại bằng dữ liệu trong file sao lưu?', ()=>{ fromDocs(docs); changed(); selKy=''; render(); toast('Đã phục hồi dữ liệu'); }); } catch(err){ toast('File sao lưu không hợp lệ'); } };
  if ($('#seed2')) $('#seed2').onclick=()=>confirmBox('Thay toàn bộ dữ liệu hiện có bằng dữ liệu năm 2026 từ file Gia thanh - 26 TH?', ()=>{ fromDocs(JSON.parse($('#seed').textContent)); changed(); selKy=''; render(); });
}
