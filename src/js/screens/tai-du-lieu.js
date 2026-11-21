// ---- Tải dữ liệu ----
function vTaiDuLieu(m){
  const noXL = typeof XLSX==='undefined';
  m.innerHTML = head('Nhập cả bộ dữ liệu từ một tệp Excel nhiều sheet') +
  (noXL?`<div class="err">Thư viện đọc Excel chưa tải được (kiểm tra kết nối mạng rồi tải lại trang). Bạn vẫn có thể dùng nút <b>Dán từ Excel</b> ở từng mục nhập dữ liệu.</div>`:'') + `<div class="note"><b>Cách làm:</b> (1) Tải file mẫu → (2) đổ <b>mua hàng + bán hàng</b> nhiều tháng vào sheet <b>GiaoDich</b> (cột Loại = MUA / BAN); lệnh SX, điều chỉnh NVL, định mức, danh mục, tồn đầu, xuất dùng chung vào sheet riêng tương ứng → (3) kéo thả file vào khung dưới → (4) xem số dòng và bấm <b>Nhập dữ liệu</b>. Sheet trống được bỏ qua; một file chứa được nhiều tháng / nhiều năm. Chi phí 622/627 nhập tay tại mục <b>Chi phí 622/627</b>.</div>
  <div class="dz" id="drop"><div class="ic">⤒</div><div class="t"><b>Chọn tệp</b> hoặc kéo và thả tệp vào đây</div><div class="s">Định dạng XLSX, XLS (tối đa 20MB) · tệp có thể chứa nhiều sheet, nhiều tháng</div><input type="file" id="file" accept=".xlsx,.xls,.xlsm,.csv" style="display:none"></div>
  <div style="margin:14px 0 4px;font-size:var(--fs)">Để có kết quả nhập chính xác, hãy sử dụng tệp mẫu.</div>
  <div class="tplcard" id="tpl2"><div><b>Tải tệp mẫu cơ bản</b><span>Sheet GiaoDich (mua + bán) và các sheet dữ liệu nền, sản xuất – chỉ tiêu đề cột</span></div><div class="dl">⬇</div></div>
  <div class="tplcard" id="tplf2"><div><b>Tải tệp mẫu kèm toàn bộ dữ liệu hiện có</b><span>Dùng để sao lưu hoặc sửa hàng loạt rồi tải lại</span></div><div class="dl">⬇</div></div>
  <div id="prev"></div>
  <div class="box" style="margin-top:14px"><h3>Cấu trúc file mẫu</h3><div class="tw" style="max-height:none"><table><thead><tr><th>Sheet</th><th>Các cột (theo đúng thứ tự)</th><th>Ghi chú</th></tr></thead><tbody>
  <tr><td><b>GiaoDich</b> (sheet gộp)</td><td style="white-space:normal">${GD_COLS.join(' | ')}</td><td style="white-space:normal" class="mut small">Sheet nhập liệu định kỳ: toàn bộ chứng từ <b>mua hàng (MUA)</b> và <b>bán hàng (BAN)</b> của nhiều tháng trong một sheet. BAN: chỉ điền Ngày, Mã hàng, Số lượng, Thành tiền = doanh số (đơn giá bán phần mềm tự chia ngược). Lệnh SX, điều chỉnh NVL, định mức, xuất dùng chung dùng sheet riêng như cũ; chi phí 622/627 nhập tay trong phần mềm.</td></tr>
  ${Object.entries(TEMPLATE).map(([s,v])=>`<tr><td><b>${s}</b></td><td style="white-space:normal">${v.cols.map(c=>c[1]).join(' | ')}</td><td style="white-space:normal" class="mut small">${TPLNOTE[s]||''}</td></tr>`).join('')}</tbody></table></div></div>`;
  bindKy();
  const handle = async f => { try { const buf = await f.arrayBuffer(); const wb = XLSX.read(buf, {type:'array', cellDates:true}); previewImport(wb, f.name); } catch(e){ console.error(e); $('#prev').innerHTML=`<div class="err">Không đọc được file: ${esc(e.message)}</div>`; } };
  $('#file').onchange=e=>{ if(e.target.files[0]) handle(e.target.files[0]); };
  const dz=$('#drop'); dz.onclick=()=>$('#file').click(); dz.ondragover=e=>{e.preventDefault(); dz.classList.add('over');}; dz.ondragleave=()=>dz.classList.remove('over'); dz.ondrop=e=>{e.preventDefault(); dz.classList.remove('over'); if(e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]);};
  $('#tpl2').onclick=()=>saveWb(buildTemplate(false), 'Mau_Tai_Du_Lieu_GiaThanh.xlsx');
  $('#tplf2').onclick=()=>saveWb(buildTemplate(true), `DuLieu_GiaThanh_${todayKy()}.xlsx`);
}
const TPLNOTE = {NVLThayThe:'Mỗi dòng = một thời kỳ thay thế NVL. Ngày SX của lệnh nằm trong khoảng Từ–Đến ngày thì giá thành dùng NVL thay thế (toàn bộ hoặc theo tỷ lệ). Mã TP trống = áp dụng cho mọi sản phẩm.', DanhMuc:'Nhóm hàng: TP đóng gói, Thành phẩm (bánh gấu kem tươi), Bán thành phẩm, Bánh khô, Kem tươi, Bao bì, Nhiên liệu, Khác. Mã đã có sẽ được cập nhật tên/nhóm/ĐVT/kho.', TonDau:'Chỉ nhập cho kỳ bắt đầu (sheet NXT cột Tồn đầu SL/tiền). Kỳ dạng mm/yyyy (ví dụ 01/2026). Nhập file này sẽ thay toàn bộ tồn đầu.', DinhMuc:'Như sheet Dinh muc: mỗi dòng = 1 NVL của 1 sản phẩm. SL TP nhập kho/1 lần làm > 1 (ví dụ 100 kg) = tính theo mẻ. Hiệu lực từ/đến để trống nếu áp dụng mãi. Sheet này thay toàn bộ định mức của các mã có trong file.', MuaHang:'Như sheet Mua hang. Ngày nhập kho quyết định tháng hạch toán. Thành tiền trống = SL × Đơn giá.', LenhSX:'Dán cột Khóa kế hoạch (BTP_BGK#20260102@300.~3.) như sheet Lenh san xuat, hoặc nhập Ngày SX + Mã SP + SL. Điều chỉnh TP (+/- thùng) chỉ nhập ở dòng thành phẩm đóng gói. Mã lệnh tự sinh.', CanDoiNVL:'Như sheet Cân đối NVL: lệnh nhận diện bằng Ngày sản xuất + Mã sản phẩm. Số âm = giảm xuất, dương = xuất thêm.', XuatChung:'Như sheet Xuất VT chung (gas…). Giá trị xuất cộng vào 627 của tháng.', BanHang:'Như sheet Ban hang: Ngày HĐ, Số HĐ, Khách, Mã, SL, Đơn giá. Doanh số trống = SL × Đơn giá.', LichNghi:'Như sheet Lich nghi SX: ngày nghỉ lễ/công ty, nghỉ chờ việc, ngày tăng ca/làm Chủ nhật.', ChiPhi:'Mỗi dòng một tháng (sheet 622+627): 622, 6273, 6274, 6277-Điện, 6277-Nước. Gas tự lấy từ Xuất VT chung.'};
let pendingWb = null;
function previewImport(wb, fname){
  pendingWb = wb; const found = [];
  const gdName = wb.SheetNames.find(n=>n.toLowerCase().replace(/\s/g,'')==='giaodich');
  if (gdName) { const aoa = XLSX.utils.sheet_to_json(wb.Sheets[gdName], {header:1, raw:true, defval:''}); const parts = splitGiaoDich(aoa); const n = Object.values(parts).reduce((a,b)=>a+b.length,0); if (n) found.push({s:'GiaoDich', name:gdName, n, parts, detail: Object.entries(parts).map(([e,r])=>`${Object.keys(GD_TYPES).find(k=>GD_TYPES[k]===e)} ${r.length}`).join(', ')}); }
  Object.entries(TEMPLATE).forEach(([s,v])=>{ const name = wb.SheetNames.find(n=>n.toLowerCase().replace(/\s/g,'')===s.toLowerCase()); if(!name) return; const aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], {header:1, raw:true, defval:''}); const data = aoa.slice(1).filter(r=>r.some(c=>c!=='' && c!=null)); if (data.length) found.push({s, name, n:data.length}); });
  if (!found.length) { $('#prev').innerHTML = `<div class="err">File <b>${esc(fname)}</b> không có sheet nào trùng tên mẫu (GiaoDich, ${Object.keys(TEMPLATE).join(', ')}). Hãy dùng file mẫu.</div>`; return; }
  $('#prev').innerHTML = `<div class="box" style="margin-top:12px"><h3>File ${esc(fname)}</h3><ul class="tight">${found.map(f=>`<li><b>${f.s}</b>: ${f.n} dòng${f.detail?` (${f.detail})`:''}</li>`).join('')}</ul>
  <div class="bar" style="margin-top:8px"><label><input type="radio" name="im" value="replace" checked> <b>Thay thế</b> dữ liệu của các tháng có trong file (khuyên dùng khi tải lại cùng tháng)</label><label><input type="radio" name="im" value="add"> <b>Thêm</b> vào dữ liệu hiện có</label></div>
  <div class="small mut">Danh mục: cập nhật theo mã. Định mức: thay thế toàn bộ định mức của các mã TP có trong file. Tồn đầu: thay toàn bộ. Chi phí: ghi đè tháng có trong file.</div>
  <div style="margin-top:10px"><button class="btn p" id="doimp">Nhập dữ liệu</button></div></div>`;
  $('#doimp').onclick=()=>{ const mode=document.querySelector('[name=im]:checked').value; const log=[];
    const getAoa = f => XLSX.utils.sheet_to_json(wb.Sheets[f.name], {header:1, raw:true, defval:''});
    const dm = found.find(f=>f.s==='DanhMuc'); if (dm) { importAOA('items', getAoa(dm), mode, true); }
    const chk={missing:[],counts:{}}; found.forEach(f=>{ if (f.s==='DanhMuc') return; const ents = f.parts ? Object.entries(f.parts) : [[TEMPLATE[f.s].ent, getAoa(f)]]; ents.forEach(([e,aoa])=>{ const r=importAOA(e, aoa, 'check', true); if (typeof r==='object') r.missing.forEach(m=>{ if(!chk.counts[m]) chk.missing.push(m); chk.counts[m]=(chk.counts[m]||0)+r.counts[m]; }); }); });
    if (chk.missing.length) { chk.missing.sort(); const box=$('#prev .box'); box.querySelectorAll('.err').forEach(x=>x.remove()); box.insertAdjacentHTML('beforeend', missingHtml(chk, '(trừ Danh mục)')); bindMissing(box, ()=>$('#doimp').click()); if (dm) changed(); return; }
    found.forEach(f=>{ if (f.s==='DanhMuc') { log.push(`DanhMuc: ${f.n} dòng`); return; } if (f.parts) { const order=['purchases','sales']; order.filter(e=>f.parts[e]).forEach(e=>{ const n=importAOA(e, f.parts[e], mode, true); log.push(`${Object.keys(GD_TYPES).find(k=>GD_TYPES[k]===e)}: ${n}`); }); return; } const aoa = XLSX.utils.sheet_to_json(wb.Sheets[f.name], {header:1, raw:true, defval:''}); const n = importAOA(TEMPLATE[f.s].ent, aoa, mode, true); log.push(`${f.s}: ${n} dòng`); }); changed(); const ks=allKys(); if (ks.length) selKy = ks[ks.length-1]; view='tongquan'; render(); toast('Đã nhập: '+log.join(' · '), 5000); };
}
function missingHtml(res, where){ return `<div class="err" style="margin-top:10px"><b>Chưa nhập${where?' '+where:''}.</b> Có ${res.missing.length} mã hàng chưa có trong <b>Danh mục hàng</b>. Hãy tạo các mã này trước (Dữ liệu nền → Danh mục hàng → Thêm dòng hoặc Nhập Excel), rồi tải lại tệp:<div style="margin-top:6px;max-height:160px;overflow:auto;font-family:Consolas,monospace;font-size:var(--fs-s);background:#fff;padding:6px 8px;border-radius:6px">${res.missing.map(m=>`${esc(m)} <span class="mut">(${res.counts[m]} dòng)</span>`).join('<br>')}</div><div class="bar" style="margin-top:6px"><button class="btn s" data-copy="${esc(res.missing.join('\n'))}">Sao chép danh sách mã</button><button class="btn s p" data-mkitems="${esc(res.missing.join(','))}">Tạo nhanh các mã này trong Danh mục (điền tên/nhóm sau)</button></div></div>`; }
function bindMissing(root, after){ root.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{ try{ navigator.clipboard.writeText(b.dataset.copy); toast('Đã sao chép'); }catch(e){ toast('Không sao chép được'); } }); root.querySelectorAll('[data-mkitems]').forEach(b=>b.onclick=()=>{ const im=itemMap(); b.dataset.mkitems.split(',').forEach(ma=>{ if(ma && !im[ma]) state.items.push({_id:uid(), ma, ten:'', nhom:'', dvt:'', kho:''}); }); changed(); toast('Đã tạo mã trống trong Danh mục – hãy bổ sung tên, nhóm, ĐVT'); if (after) after(); }); }
// Khóa kế hoạch dạng MÃ#yyyymmdd@SL~mẻ (sheet Ke hoach SX / Lenh san xuat)
function parseKhoa(k){ const m=String(k||'').trim().match(/^([^#\s]+)#(\d{4})(\d{2})(\d{2})@([\d.,]+)~/); if(!m) return null; return {ma:m[1], ngay:`${m[2]}-${m[3]}-${m[4]}`, sl:parseFloat(m[5].replace(',','.').replace(/\.$/,''))||0}; }
function importAOA(ent, aoa, mode, hasHeaderMaybe){
  const tpl = Object.values(TEMPLATE).find(v=>v.ent===ent); const cols = tpl.cols.map(c=>c[0]);
  let rows = aoa.filter(r=>r.some(c=>c!=='' && c!=null)).filter(r=>!(typeof r[0]==='string' && r[0].startsWith('Dòng 2 là ví dụ')));
  if (rows.length) { const r0=rows[0]; const labels=tpl.cols.map(c=>c[1].toLowerCase()); const hits=r0.filter(c=>typeof c==='string' && c.trim().length>1 && labels.some(l=>l.startsWith(c.trim().toLowerCase().slice(0,5)))).length; const numeric=cols.some((k,i)=>NUMF.has(k) && r0[i]!=='' && r0[i]!=null && !isNaN(parseFloat(String(r0[i]).replace(/[.,\s]/g,'')))); if (hits>=2 && !numeric) rows = rows.slice(1); }
  const recs = rows.map(r=>{ const o={_id:uid()}; cols.forEach((k,i)=>{ let v=r[i]; if (v==null) v=''; if (k==='ky') v=toKy(v); else if (DATEF.has(k)) v=toISODate(v); else if (k==='haoHut' && typeof v==='string' && v.includes('%')) v=pctIn(v); else if (k==='thueGTGT') v = (v===''||v==null) ? '' : (typeof v==='number' ? (v>1 ? v/100 : v) : pctIn(v)); else if (NUMF.has(k)) v=num(v); else v=String(v).trim(); o[k]=v; }); return o; });
  if (['purchases','sales','issues','opening'].includes(ent)) { const im=itemMap(); recs.forEach(r=>{ if (!r.kho) { const it=im[String(r.ma||r.maVT||'').trim()]; if (it && it.kho) r.kho=it.kho; } }); }
  if (ent==='orders') recs.forEach(r=>{ const k=parseKhoa(r.khoa); if (k && (!r.maTP || !r.ngaySX)) { r.maTP=k.ma; r.ngaySX=k.ngay; r.slKH=k.sl; } r.khoa = k ? String(r.khoa).trim() : ''; r.ngayXuatNVL=r.ngaySX||''; if(!r.loaiDM) r.loaiDM='DM'; r.maTP=String(r.maTP||'').trim(); });
  if (ent!=='items' && ent!=='costs' && ent!=='cal') { const im=itemMap(); const keys={opening:['ma'],purchases:['ma'],sales:['ma'],orders:['maTP'],adjustments:['maTP','maVT'],issues:['maVT'],plan:['maTP'],bom:['maTP','maNVL'],subs:['maTP','maNVL','maThayThe'],caps:['maTP']}[ent]||[]; const miss={}; recs.forEach(r=>keys.forEach(k=>{ const v=r[k]; if (v && !im[v]) miss[v]=(miss[v]||0)+1; })); const list=Object.keys(miss).sort(); if (list.length) return {missing:list, counts:miss, n:0}; }
  if (mode==='check') return recs.length;
  if (ent==='items') { const map=itemMap(); recs.forEach(r=>{ if(!r.ma) return; if(map[r.ma]) Object.assign(map[r.ma], {ten:r.ten||map[r.ma].ten, nhom:r.nhom||map[r.ma].nhom, dvt:r.dvt||map[r.ma].dvt, kho:r.kho||map[r.ma].kho}); else { state.items.push(r); map[r.ma]=r; } }); return recs.length; }
  if (ent==='opening') { const ky = recs.map(r=>r.ky).find(Boolean) || state.settings.startKy || selKy; state.opening = {ky, rows:{}}; recs.forEach(r=>{ if(!r.ma) return; const o=state.opening.rows[r.ma]||(state.opening.rows[r.ma]={sl:0,tt:0,kho:''}); o.sl+=r.sl; o.tt+=r.tt; if (r.kho) o.kho=r.kho; }); state.settings.startKy = ky; return recs.length; }
  if (ent==='bom') { const tps=new Set(recs.map(r=>r.maTP)); state.bom = state.bom.filter(b=>!tps.has(b.maTP)); recs.forEach(r=>{ if(!r.loai) r.loai='DM'; if (r.maTP && r.maNVL) state.bom.push(r); }); return recs.length; }
  if (ent==='caps') { const key=r=>[r.maTP,r.tuNgay].join('|'); const ks=new Set(recs.map(key)); state.caps = state.caps.filter(s=>!ks.has(key(s))); recs.forEach(r=>{ if (r.maTP && r.tuNgay) state.caps.push(r); }); return recs.length; }
  if (ent==='subs') { const key=r=>[r.maTP,r.maNVL,r.maThayThe,r.tuNgay].join('|'); const ks=new Set(recs.map(key)); state.subs = state.subs.filter(s=>!ks.has(key(s))); recs.forEach(r=>{ if (r.maNVL && r.maThayThe) state.subs.push(r); }); return recs.length; }
  if (ent==='costs') { recs.forEach(r=>{ if(!r.ky) return; const c={}; costF().forEach(f=>c[f]=num(r[f])); state.costs[r.ky]=c; }); return recs.length; }
  if (ent==='cal') { const valid=recs.filter(r=>r.ngay); valid.forEach(r=>{ if (!CAL_TYPES.includes(r.loai)) r.loai = /chờ/i.test(r.loai)?CAL_TYPES[1]:/tăng|chủ nhật/i.test(r.loai)?CAL_TYPES[2]:CAL_TYPES[0]; }); if (mode==='replace') { const ds=new Set(valid.map(r=>r.ngay)); state.cal=state.cal.filter(c=>!ds.has(c.ngay)); } state.cal.push(...valid); return valid.length; }
  // giao dịch theo kỳ
  const kyf = KYFIELD[ent];
  if (ent==='issues') recs.forEach(r=>{ r.loai = issueType(r.loai); });
  if (ent==='purchases') recs.forEach(r=>{ if(!r.ngayMua) r.ngayMua=r.ngayNhap; if(!r.tt && r.sl && r.donGia) r.tt=round(r.sl*r.donGia,0); if(!r.donGia && r.sl && r.tt) r.donGia=r.tt/r.sl; });
  if (ent==='sales') recs.forEach(r=>{ if (!r.doanhSo && r.sl && r.donGia) r.doanhSo = r.sl*r.donGia; else r.donGia = r.sl ? r.doanhSo/r.sl : 0; });
  importAOA.skipped = 0;
  const valid = recs.filter(r=>{ if (r[kyf] && isLocked(kyOf(r[kyf]))) { importAOA.skipped++; return false; } return true; }).filter(r=>r[kyf] && (ent!=='plan' || r.maTP) && (ent!=='orders' || r.maTP) && (ent!=='adjustments' || (r.maTP && r.maVT)) && (ent!=='sales' || r.ma) && (ent!=='purchases' || r.ma) && (ent!=='issues' || r.maVT));
  if (mode==='replace') { const ks=new Set(valid.map(r=>kyOf(r[kyf])).filter(k=>!isLocked(k))); state[ent] = state[ent].filter(r=>!ks.has(kyOf(r[kyf]))); }
  if (ent==='orders') { valid.forEach(r=>{ if (!r.maLenh) { r.maLenh = genMaLenh(r.ngaySX); state.orders.push(r); } else { const dup = state.orders.find(o=>o.maLenh===r.maLenh); if (dup) Object.assign(dup, r, {_id:dup._id}); else state.orders.push(r); } }); }
  else if (ent==='issues') { valid.forEach(r=>{ state.issues.push(r); if (!r.maPhieu) r.maPhieu = genMaPhieu(r.ngay); }); }
  else state[ent].push(...valid);
  return valid.length;
}
function buildTemplate(withData){
  const wb = XW.book_new();
  const guide = [['HƯỚNG DẪN TẢI DỮ LIỆU VÀO PHẦN MỀM GIÁ THÀNH'],[''],['1. Mỗi sheet là một loại dữ liệu. Giữ nguyên tên sheet và thứ tự cột (dòng 1 là tiêu đề, dữ liệu từ dòng 2).'],['2. Copy dữ liệu từ file giá thành hiện tại vào đúng sheet. Sheet không có dữ liệu để trống.'],['3. Ngày nhập dạng dd/mm/yyyy (ô kiểu Ngày của Excel). Kỳ (tháng) nhập dạng mm/yyyy, ví dụ 01/2026.'],['4. Tồn đầu kỳ chỉ nhập một lần cho kỳ bắt đầu; các kỳ sau phần mềm tự chuyển số dư.'],['5. Vào phần mềm → Tải dữ liệu từ Excel → kéo thả file này → Nhập dữ liệu.'],[''],['Sheet','Nội dung','Ghi chú'], ...Object.entries(TEMPLATE).map(([s,v])=>[s, v.cols.map(c=>c[1]).join(' | '), TPLNOTE[s]||''])];
  XW.book_append_sheet(wb, XW.aoa_to_sheet(guide), 'HuongDan');
  { const gd=[GD_COLS]; if (withData) {
      state.purchases.forEach(r=>gd.push(['MUA',r.ngayNhap,r.hoaDon,r.ncc,r.ma,r.sl,r.donGia,r.tt,r.ghiChu]));
      state.sales.forEach(r=>gd.push(['BAN',r.ngay,'','',r.ma,r.sl,'',r.doanhSo,r.ghiChu||'']));
      gd.sort((a,b)=> a===gd[0]?-1: b===gd[0]?1 : String(a[1]).localeCompare(String(b[1])));
    }
    const ws= withData ? XW.aoa_to_sheet(gd) : sampleSheet('GiaoDich', GD_COLS); ws['!cols']=GD_COLS.map(c=>({wch:Math.max(12,c.length+2)})); XW.book_append_sheet(wb, ws, 'GiaoDich'); }
  Object.entries(TEMPLATE).filter(([s,v])=>!['purchases','sales'].includes(v.ent)).forEach(([s,v])=>{
    const hdr = v.cols.map(c=>c[1]); let data=[];
    if (withData) {
      if (v.ent==='items') data = state.items.map(r=>v.cols.map(c=>r[c[0]]));
      else if (v.ent==='opening') data = Object.entries(state.opening.rows).map(([ma,o])=>[state.opening.ky, ma, o.sl, o.tt]);
      else if (v.ent==='bom') data = state.bom.map(r=>v.cols.map(c=>r[c[0]]));
      else if (v.ent==='subs') data = state.subs.map(r=>v.cols.map(c=>r[c[0]]));
      else if (v.ent==='caps') data = state.caps.map(r=>v.cols.map(c=>r[c[0]]));
      else if (v.ent==='costs') data = Object.entries(state.costs).sort().map(([ky,c])=>[ky, ...costF().map(f=>num(c[f]))]);
      else data = state[v.ent].slice().sort((a,b)=>String(a[KYFIELD[v.ent]||'maLenh']).localeCompare(String(b[KYFIELD[v.ent]||'maLenh']))).map(r=>v.cols.map(c=>r[c[0]]));
    }
    const ws = withData ? XW.aoa_to_sheet([hdr, ...data]) : sampleSheet(s, hdr);
    ws['!cols'] = v.cols.map(c=>({wch: Math.max(12, Math.min(34, c[1].length+2))}));
    XW.book_append_sheet(wb, ws, s);
  });
  return wb;
}
