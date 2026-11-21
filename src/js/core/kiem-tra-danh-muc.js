// ---- Kiểm tra danh mục từ file Excel: báo mã chưa có, cho bổ sung thông tin và nạp vào ----
function dmFromAOA(aoa){
  const nm=v=>String(v??'').normalize('NFC').toLowerCase().replace(/\s+/g,' ').trim();
  let hr=-1, C={};
  for (let r=0; r<Math.min(aoa.length,15) && hr<0; r++){ const row=(aoa[r]||[]).map(nm); const mi=row.findIndex(h=>/^m[ãa](\s|$)/.test(h) && !/nh[óo]m|kho|l[ệe]nh|tp\b|nvl/.test(h));
    if (mi>=0) { hr=r; C.ma=mi; row.forEach((h,i)=>{ if (C.ten==null && /^t[êe]n/.test(h)) C.ten=i; if (C.nhom==null && /nh[óo]m/.test(h)) C.nhom=i; if (C.dvt==null && (/^đvt$|^dvt$|đơn vị|don vi/.test(h))) C.dvt=i; if (C.kho==null && /kho/.test(h) && i!==mi) C.kho=i; }); } }
  if (hr<0) return null;
  const out=[]; for (let r=hr+1; r<aoa.length; r++){ const row=aoa[r]||[]; const ma=String(row[C.ma]??'').trim(); if (!ma || /^dòng\s/i.test(ma)) continue;
    const g=k=>C[k]==null?'':String(row[C[k]]??'').trim(); out.push({ma, ten:g('ten'), nhom:g('nhom'), dvt:g('dvt'), kho:g('kho')}); }
  return out;
}
function kiemTraDM(){
  modal(`<div class="tsh"><h3>Kiểm tra mã – Danh mục hàng</h3><button class="tsx" id="kdX" title="Đóng" aria-label="Đóng">${icon('x')}</button></div>
  <div class="dz" id="kdz"><div class="ic">⤒</div><div class="t"><b>Chọn tệp Excel</b> hoặc kéo và thả tệp vào đây</div><div class="s">Tệp cần có cột <b>Mã hàng</b> (nên có thêm Tên hàng, Nhóm hàng, ĐVT, Kho) · XLSX, XLS</div><input type="file" id="kdf" accept=".xlsx,.xls,.xlsm,.csv" style="display:none"></div>
  <div id="kdOut"></div>
  <div class="tsf" id="kdFoot"><span class="sp"></span><button class="btn" id="kdClose">Đóng</button></div>`);
  const box=$('#modal .in'); box.classList.add('tsm'); box.style.maxWidth='1100px';
  const close=()=>{ closeModal(); render(); }; $('#kdX').onclick=close; $('#kdClose').onclick=close;
  const dz=$('#kdz'); dz.onclick=()=>$('#kdf').click(); dz.ondragover=e=>{e.preventDefault(); dz.classList.add('over');}; dz.ondragleave=()=>dz.classList.remove('over');
  const nl=()=>nhomList().map(x=>x.ten); const findNhom=t=>nl().find(n=>n.toLowerCase()===String(t||'').trim().toLowerCase())||'';
  const khoList=[...new Set(state.items.map(i=>i.kho).filter(Boolean))].sort(); const dvtList=[...new Set(state.items.map(i=>i.dvt).filter(Boolean))].sort();
  const handle=async f=>{ if (typeof XLSX==='undefined') return toast('Thư viện Excel chưa tải được', 4000);
    let wb; try { wb=XLSX.read(await f.arrayBuffer(), {type:'array', cellDates:true}); } catch(e){ $('#kdOut').innerHTML=`<div class="err">Không đọc được tệp: ${esc(e.message)}</div>`; return; }
    let rows=[], sheets=[]; wb.SheetNames.forEach(n=>{ const r=dmFromAOA(XLSX.utils.sheet_to_json(wb.Sheets[n], {header:1, raw:false, defval:''})); if (r && r.length) { rows=rows.concat(r); sheets.push(n); } });
    if (!sheets.length) { $('#kdOut').innerHTML=`<div class="err" style="margin-top:12px">Không tìm thấy cột <b>Mã hàng</b> trong tệp <b>${esc(f.name)}</b>. Dòng tiêu đề cần có ô "Mã hàng" (hoặc "Mã").</div>`; return; }
    const seen=new Map(); rows.forEach(r=>{ const k=r.ma.toUpperCase(); if (!seen.has(k)) seen.set(k,r); });
    const have=new Set(state.items.map(i=>String(i.ma).trim().toUpperCase()));
    const all=[...seen.values()], miss=all.filter(r=>!have.has(r.ma.toUpperCase())).map(r=>({...r, nhom:findNhom(r.nhom)||r.nhom}));
    const sum=`<div class="note" style="margin-top:12px">Tệp <b>${esc(f.name)}</b> (sheet ${esc(sheets.join(', '))}): <b>${fmtN(all.length)}</b> mã · đã có trong phần mềm <b>${fmtN(all.length-miss.length)}</b> · <b style="color:${miss.length?'#b91c1c':'#15803d'}">chưa có ${fmtN(miss.length)}</b></div>`;
    if (!miss.length) { $('#kdOut').innerHTML = sum + `<div class="box" style="margin-top:10px"><h3>Tất cả mã trong tệp đã có trong danh mục <span class="pill ok">Đạt</span></h3></div>`; return; }
    const inp=(i,k,v,list)=>`<input type="text" data-r="${i}" data-k="${k}" value="${esc(v||'')}" ${list?`list="${list}"`:''} autocomplete="off" style="width:100%;min-width:${k==='ten'?200:90}px">`;
    $('#kdOut').innerHTML = sum + `<div class="tw" style="max-height:52vh;margin-top:10px"><table class="kdt"><thead><tr><th class="selc"><input type="checkbox" id="kdAll" checked></th><th>Mã hàng</th><th>Tên hàng <b class="rq">*</b></th><th>Nhóm hàng <b class="rq">*</b></th><th>ĐVT <b class="rq">*</b></th><th>Kho <b class="rq">*</b></th><th>Tình trạng</th></tr></thead><tbody>${miss.map((r,i)=>`<tr data-i="${i}"><td class="selc"><input type="checkbox" class="kdc" data-i="${i}" checked></td><td><b>${esc(r.ma)}</b></td><td>${inp(i,'ten',r.ten)}</td><td>${inp(i,'nhom',r.nhom,'kd_nhom')}</td><td>${inp(i,'dvt',r.dvt,'kd_dvt')}</td><td>${inp(i,'kho',r.kho,'kd_kho')}</td><td class="kst" data-i="${i}"></td></tr>`).join('')}</tbody></table></div>
      <datalist id="kd_nhom">${nl().map(v=>`<option value="${esc(v)}">`).join('')}</datalist><datalist id="kd_dvt">${dvtList.map(v=>`<option value="${esc(v)}">`).join('')}</datalist><datalist id="kd_kho">${khoList.map(v=>`<option value="${esc(v)}">`).join('')}</datalist>`;
    const why=r=>{ const t=[]; if (!r.ten) t.push('tên'); if (!r.nhom) t.push('nhóm'); if (!r.dvt) t.push('ĐVT'); if (!r.kho) t.push('kho'); const e=t.length?['Thiếu '+t.join(', ')]:[]; if (r.nhom && !findNhom(r.nhom)) e.push(`Nhóm "${r.nhom}" chưa có trong phần mềm`); return e; };
    const foot=$('#kdFoot'); foot.innerHTML=`<button class="btn" id="kdXl">${icon('xout')}<span>Xuất Excel mã chưa có</span></button><span class="sp"></span><button class="btn" id="kdClose2">Đóng</button><button class="btn p" id="kdLoad">${icon('xin')}<span>Nạp vào danh mục</span></button>`;
    $('#kdClose2').onclick=close;
    const upd=()=>{ let ok=0; miss.forEach((r,i)=>{ const e=why(r); const td=$(`.kst[data-i="${i}"]`); const cb=$(`.kdc[data-i="${i}"]`);
        td.innerHTML = e.length ? `<span style="color:#b91c1c">${esc(e.join(' · '))}</span>` : `<span style="color:#15803d">Đủ thông tin</span>`;
        cb.disabled=!!e.length; if (e.length) cb.checked=false; if (cb.checked) ok++; });
      $('#kdLoad').disabled=!ok; $('#kdLoad').querySelector('span').textContent = ok ? `Nạp ${fmtN(ok)} mã vào danh mục` : 'Nạp vào danh mục'; };
    $('#kdOut').querySelectorAll('input[data-r]').forEach(el=>el.oninput=()=>{ const r=miss[+el.dataset.r]; r[el.dataset.k]=el.value.trim(); const cb=$(`.kdc[data-i="${el.dataset.r}"]`); const wasBad=cb.disabled; upd(); if (wasBad && !cb.disabled) { cb.checked=true; upd(); } });
    $('#kdOut').querySelectorAll('.kdc').forEach(cb=>cb.onchange=upd);
    $('#kdAll').onchange=e=>{ $('#kdOut').querySelectorAll('.kdc').forEach(cb=>{ if (!cb.disabled) cb.checked=e.target.checked; }); upd(); };
    upd();
    $('#kdXl').onclick=()=>exportSheet('MaChuaCo_DanhMuc.xlsx', 'Ma chua co', miss.map(r=>({'Mã hàng':r.ma,'Tên hàng':r.ten,'Nhóm hàng':r.nhom,'ĐVT':r.dvt,'Kho':r.kho,'Tình trạng':why(r).length?why(r).join(' · '):'Đủ thông tin'})));
    $('#kdLoad').onclick=()=>{ const pick=miss.filter((r,i)=>$(`.kdc[data-i="${i}"]`).checked && !why(r).length); if (!pick.length) return;
      pick.forEach(r=>state.items.push({_id:uid(), ma:r.ma, ten:r.ten, nhom:findNhom(r.nhom), dvt:r.dvt, kho:r.kho})); changed(); closeModal(); render(); toast(`Đã thêm ${pick.length} mã vào danh mục`, 3500); };
  };
  $('#kdf').onchange=e=>{ if (e.target.files[0]) handle(e.target.files[0]); };
  dz.ondrop=e=>{ e.preventDefault(); dz.classList.remove('over'); if (e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]); };
}
