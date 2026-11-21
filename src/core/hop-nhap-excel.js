//# Hộp Nhập Excel
function importDialog(ent){
  const tplEntry = Object.entries(TEMPLATE).find(([k,v])=>v.ent===ent); const sheetName = tplEntry ? tplEntry[0] : ent; const cols = tplEntry ? tplEntry[1].cols : [];
  const dk = (ent==='purchases'||ent==='sales'); const title = GRID[ent] ? GRID[ent].t : ent; const sub = {caps:'Năng lực SX', subs:'NVL thay thế', purchases:'Mua hàng', sales:'Bán hàng', plan:'Kế hoạch SX', opening:'Số dư NXT đầu kỳ', costs:'Chi phí 622/627', items:'Danh mục hàng', bom:'Định mức', orders:'Lệnh sản xuất', adjustments:'Cân đối NVL', issues:'Xuất dùng chung'}[ent]||'';
  modal(`<h3>Nhập Excel – ${esc(sub||title)}</h3>
  <div class="dz" id="dz"><div class="ic">⤒</div><div class="t"><b>Chọn tệp</b> hoặc kéo và thả tệp vào đây</div><div class="s">Định dạng XLSX, XLS (tối đa 20MB) · ${dk?'sheet <b>MuaHang</b>, <b>BanHang</b> – nhập cả mua và bán cùng lúc':'sheet <b>'+esc(sheetName)+'</b>'}</div><input type="file" id="dzf" accept=".xlsx,.xls,.xlsm,.csv" style="display:none"></div>
  <div style="margin:14px 0 4px;font-size:var(--fs)">Để có kết quả nhập chính xác, hãy sử dụng tệp mẫu.</div>
  <div class="tplcard" id="tplc"><div><b>Tải tệp mẫu – ${dk?'Mua hàng / Bán hàng':esc(sub||sheetName)}</b><span>${dk?'Sheet MuaHang: '+esc(TEMPLATE.MuaHang.cols.map(c=>c[1]).join(' | '))+' · Sheet BanHang: '+esc(TEMPLATE.BanHang.cols.map(c=>c[1]).join(' | ')):'Gồm các cột bắt buộc: '+esc(cols.map(c=>c[1]).join(' | '))}</span></div><div class="dl">⬇</div></div>
  <div id="ipv"></div>
  <details style="margin-top:12px"><summary class="small mut" style="cursor:pointer">Hoặc dán trực tiếp từ Excel (Ctrl+V)</summary><textarea id="pt" style="width:100%;height:140px;margin-top:8px;font-family:Consolas,monospace;font-size:var(--fs-s)" placeholder="Copy vùng dữ liệu trong Excel rồi dán vào đây…"></textarea><div class="bar" style="margin-top:6px"><button class="btn p s" id="ptok">Nhập từ vùng dán</button></div></details>
  <div class="bar" style="margin-top:12px"><label><input type="radio" name="pm" value="replace" checked> Thay thế dữ liệu của các kỳ có trong tệp</label><label><input type="radio" name="pm" value="add"> Thêm vào dữ liệu hiện có</label><span class="sp"></span><button class="btn" id="mc">Đóng</button></div>`);
  const mode=()=>document.querySelector('[name=pm]:checked').value;
  $('#mc').onclick=()=>{ closeModal(); render(); };
  $('#tplc').onclick=()=>{ if (typeof XLSX==='undefined') return toast('Thư viện Excel chưa tải được'); const wb=XLSX.utils.book_new(); const addS=(name,cs)=>{ XLSX.utils.book_append_sheet(wb, sampleSheet(name, cs), name); };
    if (dk) { addS('MuaHang', TEMPLATE.MuaHang.cols.map(c=>c[1])); addS('BanHang', TEMPLATE.BanHang.cols.map(c=>c[1])); saveWb(wb, 'Mau_MuaHang_BanHang.xlsx'); } else { addS(sheetName, cols.map(c=>c[1])); saveWb(wb, `Mau_${sheetName}.xlsx`); } };
  const dz=$('#dz'); dz.onclick=()=>$('#dzf').click(); dz.ondragover=e=>{e.preventDefault(); dz.classList.add('over');}; dz.ondragleave=()=>dz.classList.remove('over');
  const handle=async f=>{ if (typeof XLSX==='undefined') return toast('Thư viện Excel chưa tải được – dùng cách dán trực tiếp'); try { const wb=XLSX.read(await f.arrayBuffer(), {type:'array', cellDates:true});
      if (dk) { const sn = s=>wb.SheetNames.find(n=>n.toLowerCase().replace(/\s/g,'')===s); const parts={}; const mh=sn('muahang'), bh=sn('banhang'), gd=sn('giaodich');
        if (mh) parts.purchases = XLSX.utils.sheet_to_json(wb.Sheets[mh], {header:1, raw:true, defval:''}); if (bh) parts.sales = XLSX.utils.sheet_to_json(wb.Sheets[bh], {header:1, raw:true, defval:''});
        if (gd) { const g=splitGiaoDich(XLSX.utils.sheet_to_json(wb.Sheets[gd], {header:1, raw:true, defval:''})); for (const e in g) parts[e]=(parts[e]||[]).concat(g[e]); }
        if (!mh && !bh && !gd) { parts[ent] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {header:1, raw:true, defval:''}); }
        const cnt = e => (parts[e]||[]).filter(r=>r.some(c=>c!=='' && c!=null)).length;
        $('#ipv').innerHTML = `<div class="note" style="margin-top:12px">Tệp <b>${esc(f.name)}</b>: Mua hàng ${cnt('purchases')} dòng · Bán hàng ${cnt('sales')} dòng. <button class="btn p s" id="ipok">Nhập dữ liệu</button></div>`;
        $('#ipok').onclick=()=>{ const md=mode(); const chk={missing:[],counts:{}}; ['purchases','sales'].forEach(e=>{ if(!parts[e]) return; const r=importAOA(e, parts[e], 'check', true); if (typeof r==='object') r.missing.forEach(m=>{ if(!chk.counts[m]) chk.missing.push(m); chk.counts[m]=(chk.counts[m]||0)+r.counts[m]; }); }); if (chk.missing.length) { chk.missing.sort(); $('#ipv').querySelectorAll('.err').forEach(x=>x.remove()); $('#ipv').insertAdjacentHTML('beforeend', missingHtml(chk)); bindMissing($('#ipv'), ()=>$('#ipok').click()); return; }
          const a = parts.purchases ? importAOA('purchases', parts.purchases, md, true) : 0; const b2 = parts.sales ? importAOA('sales', parts.sales, md, true) : 0; changed(); closeModal(); render(); toast(`Đã nhập ${a} dòng mua hàng, ${b2} dòng bán hàng`); };
        return; }
      let name = wb.SheetNames.find(n=>n.toLowerCase().replace(/\s/g,'')===sheetName.toLowerCase()); let aoa=null, src='';
      if (name) { aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], {header:1, raw:true, defval:''}); src=name; }
      else { const gd = wb.SheetNames.find(n=>n.toLowerCase().replace(/\s/g,'')==='giaodich'); if (gd && GD_TYPES[Object.keys(GD_TYPES).find(k=>GD_TYPES[k]===ent)]) { const parts=splitGiaoDich(XLSX.utils.sheet_to_json(wb.Sheets[gd], {header:1, raw:true, defval:''})); aoa = parts[ent]||[]; src='GiaoDich'; } else { name = wb.SheetNames[0]; aoa = XLSX.utils.sheet_to_json(wb.Sheets[name], {header:1, raw:true, defval:''}); src=name+' (sheet đầu tiên)'; } }
      const n = aoa.filter(r=>r.some(c=>c!=='' && c!=null)).length;
      $('#ipv').innerHTML = `<div class="note" style="margin-top:12px">Tệp <b>${esc(f.name)}</b> – sheet <b>${esc(src)}</b>: ${n} dòng. <button class="btn p s" id="ipok">Nhập dữ liệu</button></div>`;
      $('#ipok').onclick=()=>{ const k=importAOA(ent, aoa, mode(), true); if (typeof k==='object') { $('#ipv').querySelectorAll('.err').forEach(x=>x.remove()); $('#ipv').insertAdjacentHTML('beforeend', missingHtml(k)); bindMissing($('#ipv'), ()=>$('#ipok').click()); return; } changed(); closeModal(); render(); toast(`Đã nhập ${k} dòng ${sub||title}${importAOA.skipped?` · bỏ qua ${importAOA.skipped} dòng thuộc kỳ đã khóa`:''}`, 5000); };
    } catch(e){ console.error(e); $('#ipv').innerHTML=`<div class="err">Không đọc được tệp: ${esc(e.message)}</div>`; } };
  $('#dzf').onchange=e=>{ if(e.target.files[0]) handle(e.target.files[0]); };
  dz.ondrop=e=>{ e.preventDefault(); dz.classList.remove('over'); if(e.dataTransfer.files[0]) handle(e.dataTransfer.files[0]); };
  $('#ptok').onclick=()=>{ const txt=$('#pt').value; if(!txt.trim()) return; const aoa = txt.split(/\r?\n/).filter(l=>l.trim()!=='').map(l=>l.split('\t')); const n = importAOA(ent, aoa, mode()); if (typeof n==='object') { $('#ipv').innerHTML = missingHtml(n); bindMissing($('#ipv'), ()=>$('#ptok').click()); return; } changed(); closeModal(); render(); toast(`Đã nhập ${n} dòng`); };
}
