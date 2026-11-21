//# Ô ngày dd/mm/yyyy, enhanceTables
// ---------- Ô ngày / tháng hiển thị theo kiểu Việt Nam: dd/mm/yyyy và mm/yyyy (không phụ thuộc ngôn ngữ trình duyệt) ----------
const VND = {
  fmt(t, v){ if (!v) return ''; if (t==='month') { const m=/^(\d{4})-(\d{2})$/.exec(v); return m?`${m[2]}/${m[1]}`:v; } const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(v); return m?`${m[3]}/${m[2]}/${m[1]}`:v; },
  parse(t, s){ s=String(s||'').trim(); if (!s) return ''; const yy=y=>{ y=+y; return y<100?2000+y:y; };
    if (t==='month') { let m=/^(\d{1,2})[\/\-.](\d{2,4})$/.exec(s); if (m) { const mm=+m[1], y=yy(m[2]); if (mm>=1&&mm<=12&&y>1900) return `${y}-${String(mm).padStart(2,'0')}`; } m=/^(\d{4})-(\d{1,2})$/.exec(s); if (m && +m[2]>=1 && +m[2]<=12) return `${m[1]}-${String(+m[2]).padStart(2,'0')}`; return null; }
    let d,mo,y; let m=/^(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?$/.exec(s); if (m) { d=+m[1]; mo=+m[2]; y=m[3]?yy(m[3]):new Date().getFullYear(); } else { m=/^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s); if (m) { y=+m[1]; mo=+m[2]; d=+m[3]; } else { m=/^(\d{2})(\d{2})(\d{4})$/.exec(s); if (m) { d=+m[1]; mo=+m[2]; y=+m[3]; } } }
    if (!y) return null; const dt=new Date(y, mo-1, d); if (dt.getFullYear()!==y || dt.getMonth()!==mo-1 || dt.getDate()!==d) return null; return `${y}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`; },
  wrap(nat){ if (nat._vnd || !nat.parentNode) return; nat._vnd=true; const t=nat.type; const proto=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
    const box=document.createElement('span'); box.className='dI'+(nat.closest('.af-f')?' full':''); nat.parentNode.insertBefore(box, nat);
    const txt=document.createElement('input'); txt.type='text'; txt.className='dtxt '+(t==='month'?'m':'d'); txt.placeholder=t==='month'?'mm/yyyy':'dd/mm/yyyy'; txt.autocomplete='off'; txt.inputMode='numeric';
    if (nat.style.cssText) txt.style.cssText=nat.style.cssText; txt.title=nat.title||'';
    const cal=document.createElement('button'); cal.type='button'; cal.className='dcal'; cal.tabIndex=-1; cal.title='Chọn trên lịch'; cal.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
    box.appendChild(txt); box.appendChild(cal); box.appendChild(nat); nat.classList.add('dnat'); nat.tabIndex=-1;
    const show=()=>{ txt.value=VND.fmt(t, proto.get.call(nat)); };
    Object.defineProperty(nat,'value',{configurable:true, get(){ return proto.get.call(this); }, set(v){ proto.set.call(this,v); show(); }});
    const sync=()=>{ txt.disabled=nat.disabled; txt.readOnly=nat.readOnly; cal.disabled=nat.disabled||nat.readOnly; txt.classList.toggle('af-bad', nat.classList.contains('af-bad')); };
    new MutationObserver(sync).observe(nat,{attributes:true, attributeFilter:['disabled','readonly','class']}); sync(); show();
    const commit=()=>{ const raw=txt.value; const v=VND.parse(t, raw); if (v===null) { txt.classList.add('af-bad'); toast(`Ngày không hợp lệ – nhập theo dạng ${txt.placeholder}`, 3500); return false; } txt.classList.remove('af-bad'); if (v!==proto.get.call(nat)) { proto.set.call(nat, v); nat.dispatchEvent(new Event('input',{bubbles:true})); nat.dispatchEvent(new Event('change',{bubbles:true})); } show(); return true; };
    txt.addEventListener('change', commit);
    txt.addEventListener('keydown', e=>{ if (e.key==='Enter') { if (!commit()) { e.preventDefault(); e.stopPropagation(); return; } nat.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); e.preventDefault(); } else if (e.key==='Escape') nat.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); });
    nat.addEventListener('input', show); nat.addEventListener('change', show);
    cal.onclick=()=>{ if (nat.disabled||nat.readOnly) return; try { nat.showPicker(); } catch(e){ nat.focus(); } };
  },
  scan(root){ (root||document).querySelectorAll('input[type="date"]:not(.dnat),input[type="month"]:not(.dnat)').forEach(VND.wrap); }
};
new MutationObserver(ms=>{ for (const m of ms) for (const n of m.addedNodes) if (n.nodeType===1) { if (n.matches && n.matches('input[type="date"],input[type="month"]')) VND.wrap(n); else if (n.querySelector) VND.scan(n); } }).observe(document.documentElement,{childList:true, subtree:true});
VND.scan(document);
function enhanceTables(root){
  root.querySelectorAll('.tw > table').forEach((tbl, idx)=>{
    if (tbl.dataset.xl) return; tbl.dataset.xl='1';
    const tw = tbl.parentElement; const ths=[...tbl.querySelectorAll('thead th')]; if (!ths.length) return;
    const key = view+'|'+ths.map(h=>h.textContent.trim()).join('|').slice(0,200);
    tbl._orig = ths.map(h=>h.textContent.trim()); tbl._canOrder = tbl.querySelectorAll('thead tr').length===1 && ![...tbl.querySelectorAll('th,td')].some(c=>c.colSpan>1);
    { const oc=tblCfgOf(key); if (tbl._canOrder && oc.order && oc.order.length) { reorderTable(tbl, oc.order); ths.splice(0, ths.length, ...tbl.querySelectorAll('thead th')); } }
    tbl.dataset.key = key; tbl._heads = ths.map(h=>h.textContent.trim()); tbl._keep = ths.map(h=>h.hasAttribute('data-keep')); tbl.dataset.freeze0 = tbl.dataset.freeze||'';
    const st = tblState[key] = tblState[key] || {filters:{}, sort:null, on:false};
    // thanh công cụ
    const bar = document.createElement('div'); bar.className='xlbar';
    bar.innerHTML = `<span class="small mut" data-xn style="display:none"></span><button class="btn s" data-xc style="display:none">✕ Xóa lọc / sắp xếp</button><span class="xpg" data-xp style="display:none"><span class="small mut" data-xpt></span><button class="btn s" data-xm>Hiện thêm ${XPAGE} dòng</button><button class="btn s" data-xa>Hiện tất cả</button></span>`;
    tw.parentElement.insertBefore(bar, tw);
    // thanh cuộn ngang phía trên
    const hs = document.createElement('div'); hs.className='hscroll'; hs.innerHTML='<div></div>'; tw.parentElement.insertBefore(hs, tw);
    const sync=()=>{ hs.firstChild.style.width = tbl.scrollWidth+'px'; hs.style.display = tbl.scrollWidth > tw.clientWidth+2 ? '' : 'none'; };
    sync(); setTimeout(sync, 50); hs.onscroll=()=>{ tw.scrollLeft=hs.scrollLeft; }; tw.addEventListener('scroll', ()=>{ hs.scrollLeft=tw.scrollLeft; });
    // nút lọc từng cột
    st.widths = st.widths || {};
    const setW=(ci,w)=>{ const th=ths[ci]; if(!th) return; th.style.width=w+'px'; th.style.minWidth=w+'px'; th.style.maxWidth=w+'px'; tbl.querySelectorAll('tbody tr').forEach(r=>{ const td=r.children[ci]; if(td){ td.style.width=w+'px'; td.style.minWidth=w+'px'; td.style.maxWidth=w+'px'; } }); };
    // cột chỉ chứa nút (Sửa/Lưu/Xóa, thùng rác…) hoặc không có tiêu đề: không có nút lọc ▼
    const bodyRows=[...tbl.querySelectorAll('tbody tr')].filter(r=>!r.classList.contains('tot'));
    const btnOnly=ci=>{ if (!ths[ci].textContent.trim()) return true; let any=false; for (const r of bodyRows) { const td=r.children[ci]; if (!td) continue; if (td.textContent.trim()) return false; if (td.querySelector('button,a')) any=true; } return any; };
    ths.forEach((th,ci)=>{ if (btnOnly(ci)) th.classList.add('nof'); });
    ths.forEach((th,ci)=>{ if (th.classList.contains('nof')) return; const b=document.createElement('button'); b.className='xfb'; b.innerHTML='▼'; b.title='Lọc / sắp xếp cột'; b.onclick=e=>{ e.stopPropagation(); openFilter(tbl, key, ci, b); }; th.appendChild(b);
      const h=document.createElement('div'); h.className='xrs'; h.title='Kéo để đổi độ rộng cột'; th.appendChild(h);
      h.onmousedown=e=>{ e.preventDefault(); e.stopPropagation(); const x0=e.clientX, w0=th.getBoundingClientRect().width; tbl.classList.add('xresizing'); h.classList.add('on'); const mv=ev=>{ const w=Math.max(40, w0+(ev.clientX-x0)); setW(ci,w); st.widths[ci]=w; }; const up=()=>{ document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); tbl.classList.remove('xresizing'); h.classList.remove('on'); sync(); }; document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up); };
      h.ondblclick=e=>{ e.stopPropagation(); delete st.widths[ci]; th.style.width=th.style.minWidth=th.style.maxWidth=''; tbl.querySelectorAll('tbody tr').forEach(r=>{ const td=r.children[ci]; if(td){ td.style.width=td.style.minWidth=td.style.maxWidth=''; } }); sync(); };
      if (st.widths[ci]) setW(ci, st.widths[ci]); });
    bar.querySelector('[data-xc]').onclick=()=>{ st.filters={}; st.sort=null; applyTable(tbl, key); };
    bar.querySelector('[data-xm]').onclick=()=>{ st.page=(st.page||XPAGE)+XPAGE; applyTable(tbl, key); sync(); };
    bar.querySelector('[data-xa]').onclick=()=>{ st.page=Infinity; applyTable(tbl, key); sync(); };
    // đưa "Đang hiện … / Hiện thêm / Hiện tất cả" lên cùng dòng ô lọc (bảng chính của màn hình)
    { const xp=bar.querySelector('[data-xp]'); tbl._xp=xp; const mm=tbl.closest('#main'); const tl=mm && mm.querySelector(':scope > .toolbar .tb-left'); if (tl && mm.querySelector('.tw > table')===tbl) { xp.classList.add('in-tb'); tl.appendChild(xp); } }
    applyTable(tbl, key);
    { const ac=tbl.querySelector('td.act'); if (ac) { const h=ths[ac.cellIndex]; if (h) h.classList.add('actth'); } }
    applyTblCfg(tbl); if (typeof ResizeObserver!=='undefined') { const ro=new ResizeObserver(()=>freezeCols(tbl)); ths.slice(0,6).forEach(h=>ro.observe(h)); }
  });
}

