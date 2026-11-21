//# Bảng kiểu Excel: giá trị ô, cột cố định
// ---------- Bảng kiểu Excel: lọc cột, sắp xếp, thanh cuộn trên, cột đầu cố định ----------
const tblState = {}; // key -> {filters:{col:Set|null, search}, sort:{col,dir}, on:boolean}
function cellVal(td){ if (td.dataset && td.dataset.v!=null) return td.dataset.v; return (td.textContent||'').trim(); } // data-v: giá trị dùng để lọc / sắp xếp (vd ô 'chưa có giá' = trống)
function cellNum(s){ let x=String(s).replace(/\s/g,''); const pm=x.match(/^\(([\d.,]+%?)\)$/); if (pm) x='-'+pm[1];
  let m=x.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (m) return +m[3]*10000+ +m[2]*100+ +m[1];
  m=x.match(/^(\d{1,2})\/(\d{4})$/); if (m) return +m[2]*10000+ +m[1]*100;
  if (!/^-?[\d.,]+%?$/.test(x)) return null; x=x.replace('%','');
  const dot=x.includes('.'), com=x.includes(',');
  if (dot && com) x=x.replace(/\./g,'').replace(',','.');
  else if (com) x=x.replace(',','.');
  else if (dot && !/^-?\d{1,3}(\.\d{3})+$/.test(x)) { /* dấu chấm thập phân */ }
  else if (dot) x=x.replace(/\./g,'');
  const v=parseFloat(x); return isNaN(v)?null:v; }
function freezeCols(tbl){
  tbl.querySelectorAll('.frz').forEach(c=>{ c.classList.remove('frz','frz-last'); c.style.left=''; });
  const n = +tbl.dataset.freeze||0; if (!n) return;
  const ths=[...tbl.querySelectorAll('thead th')]; const vis=ths.map((t,i)=>i).filter(i=>ths[i].style.display!=='none').slice(0,n); const rows=[...tbl.querySelectorAll('tbody tr')]; let left=0;
  vis.forEach((ci,k)=>{ const w=ths[ci].getBoundingClientRect().width; [ths[ci], ...rows.map(r=>r.children[ci])].forEach(c=>{ if(!c) return; c.classList.add('frz'); c.classList.toggle('frz-last', k===vis.length-1); c.style.left=left+'px'; }); left+=w; });
}

