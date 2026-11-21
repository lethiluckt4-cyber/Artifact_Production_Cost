// ---------- Thiết lập bảng: ẩn/hiện cột, mật độ dòng (nhớ theo từng bảng trên máy này) ----------
const tblPrefs = (()=>{ try { return JSON.parse(localStorage.getItem('gt_tblprefs')||'{}')||{}; } catch(e){ return {}; } })();
function saveTblPrefs(){ try { localStorage.setItem('gt_tblprefs', JSON.stringify(tblPrefs)); } catch(e){} }
const thLabel = th => th.dataset.lbl!=null ? th.dataset.lbl : (th.dataset.lbl = (th.textContent||'').replace(/\s+/g,' ').replace(/\*/g,'').trim());
// Khóa cột = tên tiêu đề (cột trùng tên thêm " (2)", " (3)")
function colKeys(ths){ const seen={}; return ths.map(th=>{ const l=thLabel(th); if (!l) return ''; seen[l]=(seen[l]||0)+1; return seen[l]>1 ? `${l} (${seen[l]})` : l; }); }
const tblSimple = tbl => tbl.querySelectorAll('thead tr').length===1 && ![...tbl.querySelectorAll('tbody tr')].some(tr=>[...tr.children].some(td=>td.colSpan>1));
// Đổi thứ tự cột theo thiết lập (chạy trước khi gắn nút lọc để chỉ số cột khớp)
function applyColOrder(tbl){
  const pf=tblPrefs[tbl.dataset.tkey]; if (!pf || !pf.order || !pf.order.length || !tblSimple(tbl)) return;
  const hr=tbl.querySelector('thead tr'); const ths=[...hr.children]; const ks=colKeys(ths);
  const labeled = ks.map((k,i)=>k?i:-1).filter(i=>i>=0);
  const want = pf.order.map(k=>ks.indexOf(k)).filter(i=>i>=0 && ks[i]); labeled.forEach(i=>{ if (!want.includes(i)) want.push(i); });
  let w=0; const perm = ks.map((k,i)=> k ? want[w++] : i);
  if (perm.every((x,i)=>x===i)) return;
  [hr, ...tbl.querySelectorAll('tbody tr')].forEach(tr=>{ const cs=[...tr.children]; if (cs.length!==ths.length) return; perm.forEach(i=>tr.appendChild(cs[i])); });
}
function applyTblPrefs(tbl){
  const key=tbl.dataset.tkey; const pf=tblPrefs[key]||{}; const hid=new Set(pf.hidden||[]);
  const hrows=tbl.querySelectorAll('thead tr'); tbl.classList.toggle('compact', !!pf.compact);
  if (hrows.length!==1) return;
  const ths=[...hrows[0].children]; const ks=colKeys(ths); const set=new Set(ks.map((k,i)=>k&&hid.has(k)?i:-1).filter(i=>i>=0));
  ths.forEach((th,i)=>{ th.style.display = set.has(i)?'none':''; });
  tbl.querySelectorAll('tbody tr').forEach(tr=>{ if ([...tr.children].some(td=>td.colSpan>1)) return; [...tr.children].forEach((td,i)=>{ td.style.display = set.has(i)?'none':''; }); });
  if (tbl.dataset.freeze) freezeCols(tbl);
}
function openTblSet(tbl){
  closeFilter(); const key=tbl.dataset.tkey; const one=tbl.querySelectorAll('thead tr').length===1; const canMove=tblSimple(tbl);
  const pf=tblPrefs[key]||{}; const cur=one?colKeys([...tbl.querySelector('thead tr').children]).filter(Boolean):[];
  const def=JSON.parse(tbl.dataset.defcols||'[]').filter(Boolean);
  let draft=cur.map(k=>({k, on:!(pf.hidden||[]).includes(k)}));
  modal(`<div class="tsh">${icon('sliders')}<h3>Thiết lập bảng</h3><button class="tsx" id="tsX" title="Đóng" aria-label="Đóng">${icon('x')}</button></div>
    <div class="tsd">${one?`Bỏ tích để ẩn cột${canMove?'; dùng mũi tên để đổi thứ tự':''}. Thiết lập được nhớ riêng cho bảng này.`:'Bảng có tiêu đề nhiều tầng – không ẩn / đổi thứ tự cột được.'}</div>
    <div class="tslist" id="tsList"></div>
    <div class="tsf"><button class="btn" id="tsDef">${icon('undo')}<span>Trả về mặc định</span></button><span class="sp"></span><button class="btn" id="tsCancel">Hủy</button><button class="btn p" id="tsSave">${icon('save')}<span>Lưu</span></button></div>`);
  const box=$('#modal .in'); box.classList.add('tsm');
  const list=$('#tsList'); if (!one) list.style.display='none';
  const draw=()=>{ list.innerHTML = draft.map((d,i)=>`<div class="tsr ${d.on?'':'off'}"><label><input type="checkbox" data-i="${i}" ${d.on?'checked':''}><span title="${esc(d.k)}">${esc(d.k)}</span></label>${canMove?`<button class="mv" data-up="${i}" title="Đưa lên" aria-label="Đưa lên" ${i===0?'disabled':''}>${icon('up')}</button><button class="mv" data-dn="${i}" title="Đưa xuống" aria-label="Đưa xuống" ${i===draft.length-1?'disabled':''}>${icon('down')}</button>`:''}</div>`).join('');
    list.querySelectorAll('input[data-i]').forEach(c=>c.onchange=()=>{ const i=+c.dataset.i; draft[i].on=c.checked; c.closest('.tsr').classList.toggle('off', !c.checked); });
    const mv=(i,j)=>{ const st=list.scrollTop; [draft[i],draft[j]]=[draft[j],draft[i]]; draw(); list.scrollTop=st; const b=list.querySelector(`[data-${j<i?'up':'dn'}="${j}"]`)||list.querySelector(`[data-${j<i?'dn':'up'}="${j}"]`); if (b) b.focus(); };
    list.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.up; if (i>0) mv(i,i-1); });
    list.querySelectorAll('[data-dn]').forEach(b=>b.onclick=()=>{ const i=+b.dataset.dn; if (i<draft.length-1) mv(i,i+1); }); };
  draw();
  $('#tsX').onclick=closeModal; $('#tsCancel').onclick=closeModal;
  $('#tsDef').onclick=()=>{ const order = def.length ? def.filter(k=>cur.includes(k)).concat(cur.filter(k=>!def.includes(k))) : cur; draft=order.map(k=>({k, on:true})); draw(); };
  $('#tsSave').onclick=()=>{ const order=draft.map(d=>d.k); const p2={}; const hidden=draft.filter(d=>!d.on).map(d=>d.k); if (hidden.length) p2.hidden=hidden;
    const isDef = def.length ? JSON.stringify(order)===JSON.stringify(def.filter(k=>order.includes(k))) : JSON.stringify(order)===JSON.stringify(cur);
    if (canMove && !isDef) p2.order=order;
    const orderChanged = JSON.stringify(order)!==JSON.stringify(cur); if (Object.keys(p2).length) tblPrefs[key]=p2; else delete tblPrefs[key]; saveTblPrefs();
    if (orderChanged && tblState[key]) { tblState[key].filters={}; tblState[key].sort=null; tblState[key].widths={}; }
    closeModal(); render(); };
}
// Xuất đúng những gì đang thấy trong bảng (theo lọc, cột đang hiện)
function exportVisibleTable(tbl){
  const vis = el => el.style.display!=='none';
  const one = tbl.querySelectorAll('thead tr').length===1;
  const hdrRows=[...tbl.querySelectorAll('thead tr')].map(tr=>[...tr.children].filter(vis).map(th=>thLabel(th)));
  const keep = one ? [...tbl.querySelectorAll('thead th')].map(vis) : null;
  const body=[...tbl.querySelectorAll('tbody tr')].filter(vis).map(tr=>[...tr.children].filter((td,i)=>!keep||keep[i]).map(td=>{ if (td.classList.contains('act')) return ''; const v=cellVal(td); const n=cellNum(v); return n!=null && !/^0\d/.test(v) && !/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(v) ? n : v; }));
  let aoa=[...hdrRows, ...body]; if (one && aoa.length) { const nC=Math.max(...aoa.map(r=>r.length)); const drop=new Set(); for (let j=0;j<nC;j++) if (aoa.every(r=>r[j]===''||r[j]==null)) drop.add(j); if (drop.size) aoa=aoa.map(r=>r.filter((_,j)=>!drop.has(j))); }
  const title=(($('#main .top h2')||{}).textContent||view).trim(); const wb=XW.book_new(); XW.book_append_sheet(wb, XW.aoa_to_sheet(aoa), 'Bang'); saveWb(wb, `${title.replace(/[\\/:*?"<>|]+/g,'-').slice(0,80)}.xlsx`); toast(`Đã xuất ${body.length} dòng đang hiển thị`);
}
