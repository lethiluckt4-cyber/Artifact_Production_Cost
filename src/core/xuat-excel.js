//# Xuất Excel: saveWb, exportDomTable (xuất đúng bảng đang hiện), exportSheet
// ---- Xuất file ----
let downloadsCap = null;
async function saveFile(name, blob){
  try { if (window.claude && typeof claude.use==='function') { if (downloadsCap===null) downloadsCap = (await claude.use('downloads')) || false; if (downloadsCap) { await downloadsCap.save({filename:name, data:blob}); toast('Đã lưu '+name); return; } } } catch(e){ if (e && e.code==='declined') return; console.warn(e); }
  try { const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},2000); } catch(e){ toast('Trình duyệt không cho phép tải file ở đây. Hãy mở phần mềm trong tab riêng.'); }
}
const XL_FONT = {name:'Aptos Narrow', size:11};
async function saveWb(wb, name){
  const mime='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  if (typeof ExcelJS==='undefined') { const out = XLSX.write(wb, {bookType:'xlsx', type:'array'}); return saveFile(name, new Blob([out], {type:mime})); }
  try {
    const ewb = new ExcelJS.Workbook();
    wb.SheetNames.forEach(sn=>{
      const ws = wb.Sheets[sn]; const aoa = XLSX.utils.sheet_to_json(ws, {header:1, raw:true, defval:null});
      const es = ewb.addWorksheet(sn); const hdrRow = (sn==='XK NVL'||sn==='NK TP') ? 8 : 1; const widths=[];
      aoa.forEach((row,ri)=>{ const er = es.getRow(ri+1); row.forEach((v,ci)=>{ if (v==null || v==='') return; const c = er.getCell(ci+1); let w;
        if (v instanceof Date) { c.value=v; c.numFmt='dd/mm/yyyy'; w=10; }
        else if (typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v)) { c.value=new Date(v+'T00:00:00'); c.numFmt='dd/mm/yyyy'; w=10; }
        else if (typeof v==='string' && /^\d{4}-\d{2}$/.test(v)) { c.value=new Date(v+'-01T00:00:00'); c.numFmt='mm/yyyy'; w=8; }
        else if (typeof v==='number') { c.value=v; c.numFmt = Number.isInteger(v) ? '#,##0' : '#,##0.####'; w=String(Math.round(v)).length+4; }
        else { c.value=v; w=Math.min(40, String(v).length+2); }
        c.font = ri+1===hdrRow ? {...XL_FONT, bold:true} : XL_FONT; widths[ci]=Math.max(widths[ci]||0, w); }); });
      const pctCols=new Set(); if (aoa[hdrRow-1]) aoa[hdrRow-1].forEach((h,ci)=>{ if (typeof h==='string' && /^Tỷ (trọng|lệ)/.test(h)) pctCols.add(ci); });
      aoa.forEach((row,ri)=>{ if (ri+1<=hdrRow) return; row.forEach((v,ci)=>{ if (pctCols.has(ci) && typeof v==='number' && Math.abs(v)<=5) { const c=es.getRow(ri+1).getCell(ci+1); c.numFmt='0.0%'; } }); });
      const cols = ws['!cols']||[]; for (let i=0;i<widths.length;i++) { es.getColumn(i+1).width = (cols[i]&&cols[i].wch) || Math.max(8, widths[i]||8); }
      if (aoa.length>=hdrRow) { const hr=es.getRow(hdrRow); hr.alignment={wrapText:true, vertical:'middle'}; hr.eachCell(c=>{ c.fill={type:'pattern', pattern:'solid', fgColor:{argb:'FFFFF2CC'}}; c.border={top:{style:'thin'},left:{style:'thin'},bottom:{style:'thin'},right:{style:'thin'}}; }); es.views=[{state:'frozen', ySplit:hdrRow}]; }
    });
    const buf = await ewb.xlsx.writeBuffer(); saveFile(name, new Blob([buf], {type:mime}));
  } catch(e) { console.error(e); const out = XLSX.write(wb, {bookType:'xlsx', type:'array'}); saveFile(name, new Blob([out], {type:mime})); }
}
// Xuất Excel đúng như bảng đang hiện trên tab: các cột đang hiện (theo thiết lập cột), các dòng sau lọc (kể cả dòng chưa vẽ do phân trang), dòng Tổng
function exportDomTable(tbl, name, sheet){ if (typeof XLSX==='undefined') return toast('Thư viện Excel chưa tải được'); if (!tbl) return toast('Không có bảng để xuất');
  const hr=tbl.querySelector('thead tr:last-child')||tbl.querySelector('thead tr'); const ths=[...hr.children];
  const keep=ths.map((th,i)=>i).filter(i=>{ const th=ths[i]; if (th.classList.contains('ckth')||th.classList.contains('actth')) return false; if (getComputedStyle(th).display==='none') return false; return th.textContent.replace('▼','').trim()!==''; });
  const head=keep.map(i=>ths[i].textContent.replace('▼','').replace(/\s+/g,' ').trim());
  const trs=[...tbl.querySelectorAll('tbody tr')].filter(tr=>tr.classList.contains('tot') || tr.classList.contains('pgh') || tr.style.display!=='none');
  const txt=td=>{ if (!td) return ''; const i=td.querySelector('input,select'); if (i) return (i.value||'').trim(); return (td.textContent||'').replace(/\s*🔒/,'').replace(/\s+/g,' ').trim(); };
  const body=trs.map(tr=>keep.map(i=>txt(tr.children[i])));
  const textCol=keep.map((_,j)=>body.some(r=>/^0\d/.test(r[j]))); // số HĐ, mã có số 0 đầu: giữ dạng chữ
  const aoa=[head, ...body.map(r=>r.map((v,j)=>{ if (v===''||v==='–') return ''; if (textCol[j] || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v) || /^\d{1,2}\/\d{4}$/.test(v)) return v; const n=cellNum(v); return n==null?v:(/%\)?$/.test(v)?n/100:n); }))];
  const ws=XLSX.utils.aoa_to_sheet(aoa); ws['!cols']=head.map((h,j)=>({wch:Math.max(10,Math.min(40,Math.max(h.length, ...body.slice(0,200).map(r=>String(r[j]).length))+2))}));
  const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, String(sheet).replace(/[\\/?*\[\]:]/g,'').slice(0,31)||'Sheet1'); saveWb(wb, name); }
function exportSheet(name, sheet, json){ const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(json), sheet); saveWb(wb, name); }
