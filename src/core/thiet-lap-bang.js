//# Thiết lập bảng: ẩn/hiện, cố định cột, chiều cao dòng
// ---------- Thiết lập bảng: ẩn/hiện cột, cố định cột, chiều cao dòng (lưu theo từng bảng) ----------
function tblCfgOf(key, create){ const t = state.settings.tbl = state.settings.tbl || {}; if (create) return t[key] = t[key] || {}; return t[key] || {}; }
function applyTblCfg(tbl){
  const key=tbl.dataset.key; if (!key) return; const cfg=tblCfgOf(key); const heads=tbl._heads||[]; const keep=tbl._keep||[];
  const hide=new Set(); heads.forEach((h,i)=>{ if (h && !keep[i] && (cfg.hide||[]).includes(h)) hide.add(i); });
  tbl.querySelectorAll('tr').forEach(tr=>{ let c=0; [...tr.children].forEach(cell=>{ if (!cell.dataset.cs0) cell.dataset.cs0=cell.colSpan||1; const span=+cell.dataset.cs0; let vis=0; for (let j=c;j<c+span;j++) if (!hide.has(j)) vis++; c+=span; if (!vis) cell.style.display='none'; else { cell.style.display=''; cell.colSpan=span===1?1:vis; } }); });
  tbl.dataset.freeze = cfg.freeze!=null ? String(cfg.freeze) : (tbl.dataset.freeze0||'');
  const tw=tbl.parentElement; if (tw) { tw.classList.remove('dn-c','dn-w'); if (cfg.dens) tw.classList.add('dn-'+cfg.dens); }
  freezeCols(tbl);
  if (tw) { const hs=tw.previousElementSibling; if (hs && hs.classList.contains('hscroll')) { hs.firstChild.style.width=tbl.scrollWidth+'px'; hs.style.display = tbl.scrollWidth > tw.clientWidth+2 ? '' : 'none'; } }
  const st=tblState[key]; if (st) { let ch=false; hide.forEach(i=>{ if (st.filters[i]) { delete st.filters[i]; ch=true; } if (st.sort && st.sort.col===i) { st.sort=null; ch=true; } }); if (ch) applyTable(tbl,key); }
}
function tblSettings(){
  const tbls=[...document.querySelectorAll('#main .tw > table[data-key]')];
  if (!tbls.length) return toast('Trang này không có bảng để thiết lập');
  let cur=0, draft=null;
  const load=()=>{ const tbl=tbls[cur]; const cfg=tblCfgOf(tbl.dataset.key); const heads=tbl._heads||[]; const keep=tbl._keep||[];
    draft = heads.map((h,i)=>({h, keep:!!keep[i], on: keep[i] || !(cfg.hide||[]).includes(h)})).filter(x=>x.h); };
  const draw=()=>{
    const tbl=tbls[cur]; const can=!!tbl._canOrder;
    modal(`<div class="hd"><h3>${IC('sliders')}Thiết lập bảng</h3><button class="x" id="tcX" title="Đóng" aria-label="Đóng">${IC('x')}</button></div>
      <p class="desc">Bỏ tích để ẩn cột${can?'; dùng mũi tên để đổi thứ tự':''}. Thiết lập được nhớ riêng cho bảng này.${can?'':' (Bảng này có tiêu đề gộp nên không đổi thứ tự cột.)'}</p>
      ${tbls.length>1?`<div class="bar"><label>Bảng <select id="tcT">${tbls.map((t,i)=>`<option value="${i}" ${i===cur?'selected':''}>${i+1}. ${esc((t._heads||[]).filter(Boolean).slice(0,3).join(' · '))}…</option>`).join('')}</select></label></div>`:''}
      <div class="list">${draft.map((x,i)=>`<div class="it"><label><input type="checkbox" data-i="${i}" ${x.on?'checked':''} ${x.keep?'disabled':''}> ${esc(x.h)}</label>${can?`<button class="mv" data-up="${i}" ${i===0?'disabled':''} title="Lên" aria-label="Lên">${IC('up')}</button><button class="mv" data-dn="${i}" ${i===draft.length-1?'disabled':''} title="Xuống" aria-label="Xuống">${IC('down')}</button>`:''}</div>`).join('')}</div>
      <div style="margin-top:12px"><button class="btn" id="tcReset">${IC('undo')}Trả về mặc định</button></div>
      <div class="ft"><button class="btn" id="tcCancel">Hủy</button><button class="btn p" id="tcSave">${IC('save')}Lưu</button></div>`);
    $('#modal .in').classList.add('tcm');
    const keepScroll=fn=>{ const l=$('#modal .list'); const y=l?l.scrollTop:0; fn(); draw(); const l2=$('#modal .list'); if (l2) l2.scrollTop=y; };
    const T=$('#tcT'); if (T) T.onchange=()=>{ cur=+T.value; load(); draw(); };
    document.querySelectorAll('#modal .it input[data-i]').forEach(cb=>cb.onchange=()=>{ draft[+cb.dataset.i].on=cb.checked; });
    document.querySelectorAll('#modal [data-up]').forEach(b=>b.onclick=()=>keepScroll(()=>{ const i=+b.dataset.up; [draft[i-1],draft[i]]=[draft[i],draft[i-1]]; }));
    document.querySelectorAll('#modal [data-dn]').forEach(b=>b.onclick=()=>keepScroll(()=>{ const i=+b.dataset.dn; [draft[i+1],draft[i]]=[draft[i],draft[i+1]]; }));
    $('#tcReset').onclick=()=>{ const t=tbl._orig||draft.map(x=>x.h); const kp={}; draft.forEach(x=>kp[x.h]=x.keep); draft=t.filter(Boolean).map(h=>({h, keep:!!kp[h], on:true})); draw(); toast('Đã đưa về mặc định – bấm Lưu để áp dụng'); };
    $('#tcX').onclick=$('#tcCancel').onclick=()=>closeModal();
    $('#tcSave').onclick=()=>{ const key=tbl.dataset.key; const c=tblCfgOf(key,true); const prevOrder=JSON.stringify(c.order||tbl._orig.filter(Boolean)); c.hide=draft.filter(x=>!x.on).map(x=>x.h); const ord=draft.map(x=>x.h); const def=JSON.stringify((tbl._orig||[]).filter(Boolean));
      if (can) { if (JSON.stringify(ord)===def) delete c.order; else c.order=ord; }
      if (!c.hide.length) delete c.hide; if (!Object.keys(c).length) delete state.settings.tbl[key];
      if (can && JSON.stringify(ord)!==prevOrder) delete tblState[key];
      store.schedule(); closeModal(); render(); toast('Đã lưu thiết lập bảng'); };
  };
  load(); draw();
}
function reorderTable(tbl, order){
  const ths=[...tbl.querySelectorAll('thead th')]; const heads=ths.map(h=>h.textContent.trim()); const n=heads.length;
  const slots=heads.map((h,i)=>h?i:-1).filter(i=>i>=0); const used=new Set(); const pick=h=>{ for (const i of slots) if (!used.has(i) && heads[i]===h) { used.add(i); return i; } return -1; };
  const want=[]; order.forEach(h=>{ const i=pick(h); if (i>=0) want.push(i); }); slots.forEach(i=>{ if (!used.has(i)) want.push(i); });
  const perm=heads.map((h,i)=>i); slots.forEach((pos,k)=>perm[pos]=want[k]); if (perm.every((v,i)=>v===i)) return;
  tbl.querySelectorAll('tr').forEach(tr=>{ const cells=[...tr.children]; if (cells.length!==n) return; perm.forEach(j=>tr.appendChild(cells[j])); });
}
document.addEventListener('click', e=>{ const b=e.target.closest && e.target.closest('.js-rf,.js-tbset'); if (!b || b.disabled) return; if (b.classList.contains('js-rf')) refreshData(); else tblSettings(); });
