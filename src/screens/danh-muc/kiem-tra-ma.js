//# Danh mục hàng: Kiểm tra mã từ Excel
// ---------- Danh mục hàng → Kiểm tra dữ liệu: đọc file Excel, báo mã chưa có trong danh mục, nạp vào luôn ----------
function vnKey(x){ return String(x==null?'':x).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9]+/g,' ').trim(); }
function scanItemCodes(wb){
  const isCode=h=>{ const k=vnKey(h); if (!/^ma( |$)/.test(k)) return false; return !/(lenh|phieu|chung tu|ncc|nha cung|khach|doi tuong|^ma dt|^ma kho|^ma nhom|^ma ct|hoa don|^ma hd|nhan vien|^ma nv( |$)|^ma so thue|^ma bp|bo phan|^ma tk|tai khoan)/.test(k); };
  const found={}; const sheets=[];
  wb.SheetNames.forEach(sn=>{ const ws=wb.Sheets[sn]; if (!ws || !ws['!ref']) return; const aoa=XLSX.utils.sheet_to_json(ws,{header:1, defval:'', raw:false});
    let hr=-1; for (let i=0;i<Math.min(15,aoa.length);i++) { if ((aoa[i]||[]).some(isCode)) { hr=i; break; } } if (hr<0) return;
    const hdr=aoa[hr].map(h=>String(h||'').trim()); const keys=hdr.map(vnKey);
    const codeCols=hdr.map((h,i)=>isCode(h)?i:-1).filter(i=>i>=0); if (!codeCols.length) return;
    const near=(ci,test)=>{ const nxt=codeCols.find(c=>c>ci); const end=nxt==null?keys.length:nxt; for (let j=ci+1;j<end;j++) if (test(keys[j])) return j; return codeCols.length===1 ? keys.findIndex(test) : -1; };
    let n=0;
    codeCols.forEach(ci=>{ const iTen=near(ci,k=>/^ten/.test(k)), iDvt=near(ci,k=>/^(dvt|don vi|dv tinh)/.test(k)), iNhom=near(ci,k=>/^nhom/.test(k)), iKho=near(ci,k=>/^(kho|ma kho)$/.test(k));
      for (let r=hr+1;r<aoa.length;r++) { const row=aoa[r]||[]; let ma=String(row[ci]==null?'':row[ci]).trim(); if (!ma || isCode(ma) || /^dòng \d+ là ví dụ/i.test(ma) || /^(tổng|cộng)/i.test(ma)) continue; ma=ma.replace(/\s+/g,'');
        const key=ma.toUpperCase(); const o=found[key]||(found[key]={ma, ten:'', dvt:'', nhom:'', kho:'', n:0, src:new Set(), tp:false}); o.n++; n++; if (/^ma (tp|thanh pham|sp|san pham)( |$)/.test(keys[ci])) o.tp=true;
        const g=i=>i>=0 ? String(row[i]==null?'':row[i]).trim() : ''; if (!o.ten) o.ten=g(iTen); if (!o.dvt) o.dvt=g(iDvt); if (!o.nhom) o.nhom=g(iNhom); if (!o.kho) o.kho=g(iKho); o.src.add(`${sn} · ${hdr[ci]}`); } });
    if (n) sheets.push(`${sn} (${n} dòng)`); });
  return {found, sheets};
}
function guessKho(nhom){ const cnt={}; (state.items||[]).filter(i=>i.kho && (!nhom || i.nhom===nhom)).forEach(i=>cnt[i.kho]=(cnt[i.kho]||0)+1); const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0]; if (best) return best[0]; return nhom ? guessKho('') : ''; }
function checkItemsDialog(){
  let scan=null, fname='', miss=[], force=false;
  const grp=groupCodes();
  const draw=()=>{ const im={}; state.items.forEach(i=>{ if (i.ma) im[String(i.ma).toUpperCase()]=i; });
    const all=scan?Object.values(scan.found):[]; const have=all.filter(o=>im[o.ma.toUpperCase()]);
    if (scan && !miss.length && !force) miss=all.filter(o=>!im[o.ma.toUpperCase()]).sort((a,b)=>a.ma.localeCompare(b.ma)).map(o=>{ const nhom=grp.find(g=>vnKey(g)===vnKey(o.nhom))||o.nhom||(o.tp && grp.includes('Thành phẩm')?'Thành phẩm':''); return {...o, nhom, kho:o.kho||guessKho(nhom), autoKho:!o.kho, on:true}; });
    miss=miss.filter(o=>!im[o.ma.toUpperCase()]);
    const nOn=miss.filter(o=>o.on).length;
    const res = !scan ? '' : !all.length ? `<div class="warnbox" style="margin-top:12px">Không tìm thấy cột mã hàng trong file <b>${esc(fname)}</b>. Cột mã cần có tiêu đề bắt đầu bằng "Mã" (Mã hàng, Mã VT, Mã NVL, Mã TP…).</div>` :
      `<div class="bar" style="margin-top:12px;flex-wrap:wrap;gap:8px"><span class="pill">File: <b>${esc(fname)}</b></span><span class="pill">${all.length} mã trong file</span><span class="pill ok">${have.length} mã đã có</span><span class="pill ${miss.length?'bad':'ok'}">${miss.length} mã chưa có</span></div>
      <div class="small mut" style="margin:4px 0 8px">Đã đọc: ${esc(scan.sheets.join(' · '))}</div>` +
      (miss.length ? `<div class="small" style="margin-bottom:6px">Bổ sung / sửa thông tin ngay trên bảng (ô trống tô đỏ là thông tin bắt buộc), bỏ tích mã không muốn nạp, rồi bấm <b>Nạp vào danh mục</b>.</div>
      <div class="tw" style="max-height:52vh"><table id="ckT"><thead><tr><th class="ckth"><input type="checkbox" id="ckmAll" ${nOn===miss.length?'checked':''}></th><th>Mã</th><th style="min-width:240px">Tên hàng</th><th>Nhóm hàng</th><th>ĐVT</th><th>Kho</th><th class="n">Số dòng</th><th>Nguồn trong file</th></tr></thead><tbody>
      ${miss.map((o,i)=>{ const bad=k=>o.on && !String(o[k]||'').trim() ? 'af-bad' : ''; return `<tr class="${o.on?'':'mut'}"><td class="ck"><input type="checkbox" data-mi="${i}" ${o.on?'checked':''}></td><td><b>${esc(o.ma)}</b></td>
        <td><input type="text" class="ci ${bad('ten')}" data-mi="${i}" data-f="ten" value="${esc(o.ten)}" style="width:100%"></td>
        <td><select class="ci ${bad('nhom')}" data-mi="${i}" data-f="nhom"><option value=""></option>${[...new Set([...grp, ...(o.nhom?[o.nhom]:[])])].map(g=>`<option ${g===o.nhom?'selected':''}>${esc(g)}</option>`).join('')}</select></td>
        <td><input type="text" class="ci ${bad('dvt')}" data-mi="${i}" data-f="dvt" value="${esc(o.dvt)}" style="width:70px"></td>
        <td><input type="text" class="ci ${bad('kho')}" data-mi="${i}" data-f="kho" value="${esc(o.kho)}" list="ckKho" style="width:70px"></td>
        <td class="n">${o.n}</td><td class="small mut" style="white-space:normal;min-width:160px">${esc([...o.src].join('; '))}</td></tr>`; }).join('')}
      </tbody></table></div><datalist id="ckKho">${khoList().map(k=>`<option value="${esc(k)}">`).join('')}</datalist>
      <div id="ckWarn"></div>
      <div class="bar" style="margin-top:10px;justify-content:flex-end"><button class="btn" id="ckXl">${IC('xlOut')}Xuất Excel mã chưa có</button><button class="btn p" id="ckLoad" ${nOn?'':'disabled'}>${IC('plus')}Nạp ${nOn} mã vào danh mục</button></div>`
      : `<div class="box" style="text-align:center;padding:20px;margin-top:6px"><span class="pill ok" style="font-size:var(--fs);padding:6px 14px">✓ Tất cả mã trong file đã có trong Danh mục hàng</span></div>`);
    $('#ckRes').innerHTML=res; bindRes(); };
  const bindRes=()=>{ const r=$('#ckRes');
    r.querySelectorAll('input[type=checkbox][data-mi]').forEach(c=>c.onchange=()=>{ miss[+c.dataset.mi].on=c.checked; force=true; draw(); });
    const ca=$('#ckmAll'); if (ca) ca.onchange=()=>{ miss.forEach(o=>o.on=ca.checked); force=true; draw(); };
    r.querySelectorAll('[data-f]').forEach(el=>{ const upd=()=>{ const o=miss[+el.dataset.mi]; o[el.dataset.f]=el.value.trim(); el.classList.toggle('af-bad', o.on && !o[el.dataset.f]); if (el.dataset.f==='kho') o.autoKho=false; if (el.dataset.f==='nhom' && (o.autoKho || !o.kho)) { o.kho=guessKho(o.nhom); o.autoKho=true; const k=r.querySelector(`[data-mi="${el.dataset.mi}"][data-f="kho"]`); if (k) { k.value=o.kho; k.classList.toggle('af-bad', !o.kho); } } }; el.oninput=upd; el.onchange=upd; });
    const xl=$('#ckXl'); if (xl) xl.onclick=()=>exportSheet('MaChuaCoTrongDanhMuc.xlsx','DanhMuc', miss.map(o=>({'Mã':o.ma,'Tên hàng':o.ten,'Nhóm hàng':o.nhom,'ĐVT':o.dvt,'Kho':o.kho,'Số dòng':o.n,'Nguồn trong file':[...o.src].join('; ')})));
    const ld=$('#ckLoad'); if (ld) ld.onclick=()=>load(false); };
  const load=(confirmed)=>{ const sel=miss.filter(o=>o.on); if (!sel.length) return; const inc=sel.filter(o=>!o.ten||!o.nhom||!o.dvt||!o.kho);
    if (inc.length && !confirmed) { $('#ckWarn').innerHTML=`<div class="warnbox" style="margin-top:10px">⚠ ${inc.length} mã còn thiếu thông tin bắt buộc (ô tô đỏ). Nên bổ sung trước khi nạp. <button class="btn s" id="ckForce" style="margin-left:8px">Vẫn nạp – bổ sung sau trong danh mục</button></div>`; $('#ckForce').onclick=()=>load(true); return; }
    sel.forEach(o=>state.items.push({_id:uid(), ma:o.ma, ten:o.ten, nhom:o.nhom, dvt:o.dvt, kho:o.kho}));
    changed(); render(); miss=[]; force=false; draw(); toast(`Đã thêm ${sel.length} mã vào Danh mục hàng${inc.length?` – ${inc.length} mã còn thiếu thông tin (tô đỏ trong danh mục)`:''}`, 4500); };
  modal(`<h3>Kiểm tra mã – mã hàng chưa có trong danh mục</h3>
  <div class="small mut" style="margin-bottom:8px">Chọn file Excel bất kỳ (mua hàng, bán hàng, định mức, tồn kho, file kế toán…). Phần mềm đọc mọi sheet, lấy các cột có tiêu đề bắt đầu bằng <b>"Mã"</b> (Mã hàng, Mã VT, Mã NVL, Mã TP…) và lấy kèm Tên, ĐVT, Nhóm, Kho nếu file có.</div>
  <div class="dz" id="dz"><div class="ic">⤒</div><div class="t"><b>Chọn tệp</b> hoặc kéo và thả tệp vào đây</div><div class="s">Định dạng XLSX, XLS, CSV</div><input type="file" id="dzf" accept=".xlsx,.xls,.xlsm,.csv" style="display:none"></div>
  <div id="ckRes"></div>
  <div style="text-align:right;margin-top:12px"><button class="btn" id="ckClose">Đóng</button></div>`);
  $('#modal .in').classList.add('wide');
  const dz=$('#dz'); dz.onclick=()=>$('#dzf').click(); dz.ondragover=e=>{ e.preventDefault(); dz.classList.add('over'); }; dz.ondragleave=()=>dz.classList.remove('over');
  const handle=async f=>{ if (typeof XLSX==='undefined') return toast('Thư viện Excel chưa tải được'); try { const wb=XLSX.read(await f.arrayBuffer(), {type:'array'}); fname=f.name; scan=scanItemCodes(wb); miss=[]; force=false; draw(); } catch(e){ console.error(e); $('#ckRes').innerHTML=`<div class="err" style="margin-top:10px">Không đọc được tệp: ${esc(e.message)}</div>`; } };
  $('#dzf').onchange=e=>{ if (e.target.files[0]) handle(e.target.files[0]); e.target.value=''; };
  dz.ondrop=e=>{ e.preventDefault(); dz.classList.remove('over'); if (e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]); };
  $('#ckClose').onclick=()=>{ closeModal(); render(); };
}
