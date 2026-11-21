// ---- Xuất file ----
let downloadsCap = null;
async function saveFile(name, blob){
  try { if (window.claude && typeof claude.use==='function') { if (downloadsCap===null) downloadsCap = (await claude.use('downloads')) || false; if (downloadsCap) { await downloadsCap.save({filename:name, data:blob}); toast('Đã lưu '+name); return; } } } catch(e){ if (e && e.code==='declined') return; console.warn(e); }
  try { const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},2000); } catch(e){ toast('Trình duyệt không cho phép tải file ở đây. Hãy mở phần mềm trong tab riêng.'); }
}
function saveWb(wb, name){ const out = XW.write(wb); saveFile(name, new Blob([out], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})); }
// Xuất đúng bảng đang xem: cột đang hiện, dòng sau lọc / sắp xếp, số → số, ngày → ngày
function tableAOA(tbl){ if (!tbl) return [];
  const hrow=[...tbl.querySelectorAll('thead tr')].pop(); if (!hrow) return [];
  const lab=th=>{ const c=th.cloneNode(true); c.querySelectorAll('button,input,select').forEach(x=>x.remove()); return c.textContent.replace(/[▼▲]/g,'').replace(/\s*\*\s*$/,'').replace(/\s*\*\s+/g,' ').replace(/\s+/g,' ').trim(); };
  const keep=[...hrow.children].map((th,i)=>({i, t:lab(th), skip: th.classList.contains('selc')})).filter(x=>!x.skip && x.t);
  const all=[...tbl.querySelectorAll('tbody tr, tfoot tr')].filter(r=>r.children.length>1);
  const body=all.filter(r=>!r.classList.contains('tot')), data=body.filter(r=>r.style.display!=='none');
  const tots = data.length<body.length ? [] : all.filter(r=>r.classList.contains('tot'));
  const val=td=>{ if (!td) return ''; const t=cellVal(td); if (!t) return '';
    const numish = td.classList.contains('n') || (/^\(?[+-]?[1-9][\d.]*(,\d+)?%?\)?$/.test(t) && /[(.,%]/.test(t)) || /^\(?0,\d+%?\)?$/.test(t);
    if (numish) { const v=cellNum(t); if (v!=null) return /%\)?$/.test(t) ? {v:v/100, pct:true} : v; }
    let m; if ((m=t.match(/^(\d{2})\/(\d{2})\/(\d{4})$/))) return `${m[3]}-${m[2]}-${m[1]}`;
    if ((m=t.match(/^(\d{2})\/(\d{4})$/)) && +m[1]>=1 && +m[1]<=12) return `${m[2]}-${m[1]}`; return t; };
  return [keep.map(k=>k.t), ...data.concat(tots).map(r=>keep.map(k=>val(r.children[k.i])))]; }
function tableSheet(tbl){ const ws=XW.aoa_to_sheet(tableAOA(tbl)); ws['!freeze']={y:1}; return ws; }
function exportTable(tbl, name, sheet){ if (!tbl) return toast('Không có bảng để xuất'); const wb=XW.book_new(); XW.book_append_sheet(wb, tableSheet(tbl), sheet); saveWb(wb, name); }
const mainTable = () => document.querySelector('#main .tw table');
function exportSheet(name, sheet, json){ const wb=XW.book_new(); XW.book_append_sheet(wb, XW.json_to_sheet(json), sheet); saveWb(wb, name); }
