//# Lọc chữ/số/ngày kiểu Excel, phân trang 200 dòng
// ---------- Lọc theo chữ / số / ngày kiểu Excel (Text Filters, Number Filters, Date Filters) ----------
const XF_OPS = {
  text:[['eq','Bằng'],['ne','Khác'],['bw','Bắt đầu bằng'],['ew','Kết thúc bằng'],['ct','Có chứa'],['nc','Không chứa']],
  num:[['eq','Bằng'],['ne','Khác'],['gt','Lớn hơn'],['ge','Lớn hơn hoặc bằng'],['lt','Nhỏ hơn'],['le','Nhỏ hơn hoặc bằng'],['bt','Nằm giữa']],
  date:[['eq','Bằng ngày'],['ne','Khác ngày'],['lt','Trước ngày'],['gt','Sau ngày'],['ge','Từ ngày'],['le','Đến ngày'],['bt','Nằm giữa']],
  month:[['eq','Bằng tháng'],['ne','Khác tháng'],['lt','Trước tháng'],['gt','Sau tháng'],['ge','Từ tháng'],['le','Đến tháng'],['bt','Nằm giữa']]
};
const XF_LBL = {text:'Lọc theo chữ', num:'Lọc theo số', date:'Lọc theo ngày', month:'Lọc theo tháng'};
function xfType(vals){ const ne=vals.filter(v=>v!==''); if (!ne.length) return 'text'; if (ne.every(v=>/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(v))) return 'date'; if (ne.every(v=>/^\d{1,2}\/\d{4}$/.test(v))) return 'month'; if (ne.some(v=>/^0\d/.test(v))) return 'text'; /* mã có số 0 đứng đầu (số hóa đơn…) là chữ */ if (ne.every(v=>cellNum(v)!=null)) return 'num'; return 'text'; }
function xfConv(type, v){ if (type==='num') return cellNum(v); if (type==='date') { const d=VND.parse('date', v); return d||null; } if (type==='month') { const d=VND.parse('month', v); return d||null; } return normS(String(v)).trim(); }
function xfTest(type, op, cell, val){ if (!op) return true; const a=xfConv(type, cell), b=xfConv(type, val);
  if (type==='text') { switch(op){ case 'eq': return a===b; case 'ne': return a!==b; case 'bw': return a.startsWith(b); case 'ew': return a.endsWith(b); case 'ct': return a.includes(b); case 'nc': return !a.includes(b); } return true; }
  if (a==null || b==null) return op==='ne' ? a!==b : false;
  switch(op){ case 'eq': return a===b; case 'ne': return a!==b; case 'gt': return a>b; case 'ge': return a>=b; case 'lt': return a<b; case 'le': return a<=b; } return true; }
function xfCondOk(c, v){ if (!c) return true; const t=c.type;
  if (c.c1.op==='bt') return xfTest(t,'ge',v,c.c1.v) && xfTest(t,'le',v,c.c1.v2);
  const r1=xfTest(t,c.c1.op,v,c.c1.v); if (!c.c2 || !c.c2.op) return r1; const r2=xfTest(t,c.c2.op,v,c.c2.v); return c.join==='or' ? (r1||r2) : (r1&&r2); }
function xfCondText(c){ const name=o=>((XF_OPS[c.type].find(x=>x[0]===o.op)||[])[1]||'').toLowerCase(); if (c.c1.op==='bt') return `nằm giữa "${c.c1.v}" và "${c.c1.v2}"`; let t=`${name(c.c1)} "${c.c1.v}"`; if (c.c2 && c.c2.op) t+=` ${c.join==='or'?'hoặc':'và'} ${name(c.c2)} "${c.c2.v}"`; return t; }
const XPAGE = 200;
function applyTable(tbl, key){
  const st=tblState[key]; const tbody=tbl.querySelector('tbody'); if(!tbody) return; const rows=[...tbody.querySelectorAll('tr')]; const data=rows.filter(r=>!r.classList.contains('tot')); const tot=rows.filter(r=>r.classList.contains('tot'));
  const ths=[...tbl.querySelectorAll('thead th')];
  // sắp xếp
  if (st.sort) { const {col,dir}=st.sort; data.sort((a,b)=>{ const va=cellVal(a.children[col]||{}), vb=cellVal(b.children[col]||{}); const na=cellNum(va), nb=cellNum(vb); if (va==='' && vb==='') return 0; if (va==='') return 1; if (vb==='') return -1; let c; if (na!=null && nb!=null) c=na-nb; else c=va.localeCompare(vb,'vi'); return dir==='desc'?-c:c; }); data.forEach(r=>tbody.appendChild(r)); tot.forEach(r=>tbody.appendChild(r)); }
  // lọc
  // chỉ vẽ tối đa XPAGE dòng đầu (dòng ẩn không tốn công vẽ / dò chuột) – bấm Hiện thêm / Hiện tất cả để xem tiếp; lọc, sắp xếp, xuất Excel vẫn tính trên toàn bộ dòng
  const lim = st.page || XPAGE; let drawn=0;
  let shown=0; data.forEach(r=>{ let ok=true; for (const c in st.filters){ const f=st.filters[c]; if(!f) continue; const v=cellVal(r.children[+c]||{}); if (f.vals && !f.vals.has(v)) ok=false; if (f.text && !v.toLowerCase().includes(f.text.toLowerCase())) ok=false; if (f.cond && !xfCondOk(f.cond, v)) ok=false; if(!ok) break; } if (ok && drawn>=lim) { r.style.display='none'; r.classList.add('pgh'); } else { r.style.display = ok?'':'none'; r.classList.remove('pgh'); if (ok) drawn++; } if(ok) shown++; });
  ths.forEach((th,ci)=>{ th.classList.toggle('xf-act', !!(st.filters[ci] && (st.filters[ci].vals||st.filters[ci].text||st.filters[ci].cond)) || !!(st.sort && st.sort.col===ci)); });
  const n = tbl.parentElement.previousElementSibling && tbl.parentElement.previousElementSibling.previousElementSibling; const lab = n && n.querySelector && n.querySelector('[data-xn]'); const active = Object.values(st.filters).some(f=>f) || !!st.sort; if (lab) { lab.textContent = shown<data.length ? `Đang lọc: hiện ${shown}/${data.length} dòng` : ''; lab.style.display = shown<data.length ? '' : 'none'; lab.parentElement.classList.toggle('on', shown<data.length || active); } const xc = n && n.querySelector && n.querySelector('[data-xc]'); if (xc) xc.style.display = active ? '' : 'none';
  const xp = tbl._xp || (n && n.querySelector && n.querySelector('[data-xp]')); if (xp) { const more = drawn < shown; xp.style.display = more ? '' : 'none'; if (more) { xp.querySelector('[data-xpt]').textContent = `Đang hiện ${fmtN(drawn)}/${fmtN(shown)} dòng`; xp.querySelector('[data-xm]').textContent = `Hiện thêm ${fmtN(Math.min(XPAGE, shown-drawn))} dòng`; } if (more && lab && !xp.classList.contains('in-tb')) lab.parentElement.classList.add('on'); }
}
function openFilter(tbl, key, ci, anchor){
  closeFilter(); const st=tblState[key]; const tbody=tbl.querySelector('tbody'); const vals=[...new Set([...tbody.querySelectorAll('tr:not(.tot)')].map(r=>cellVal(r.children[ci]||{})))]; const numeric = vals.length && vals.every(v=>v===''||cellNum(v)!=null); const blankLbl=(()=>{ const td=[...tbody.querySelectorAll('tr:not(.tot)')].map(r=>r.children[ci]).find(t=>t && t.dataset.v==='' && t.textContent.trim()); return td?td.textContent.trim():'trống'; })(); vals.sort((a,b)=> numeric ? (cellNum(a)||0)-(cellNum(b)||0) : a.localeCompare(b,'vi'));
  const cur = st.filters[ci] || {}; const sel = cur.vals ? new Set(cur.vals) : new Set(vals); const ftype = xfType(vals); const colName=(tbl.querySelectorAll('thead th')[ci]||{}).textContent.replace('▼','').trim();
  const pop=document.createElement('div'); pop.className='xfpop'; pop.id='xfpop';
  pop.innerHTML = `<div class="xfrow"><button class="btn s" data-s="asc">↑ Sắp xếp A→Z / nhỏ→lớn</button><button class="btn s" data-s="desc">↓ Z→A / lớn→nhỏ</button></div>
  <div class="xfm"><button type="button" class="xfmi ${cur.cond?'on':''}" data-cf>${cur.cond?'✓ ':''}${XF_LBL[ftype]}<span>▸</span></button>
    <div class="xfsub" hidden>${XF_OPS[ftype].map(o=>`<button type="button" data-op="${o[0]}">${o[1]}…</button>`).join('')}<button type="button" data-op="">Bộ lọc tùy chỉnh…</button></div></div>
  ${cur.cond?`<div class="xfcur small">Đang lọc: <b>${esc(xfCondText(cur.cond))}</b></div>`:''}
  <input type="text" class="xfs" placeholder="Tìm giá trị…" value="${esc(cur.text||'')}">
  <div class="xfrow small"><a href="#" data-all>Chọn tất cả</a> · <a href="#" data-none>Bỏ chọn</a> <span class="mut">(${vals.length} giá trị)</span></div>
  <div class="xflist">${vals.slice(0,500).map(v=>`<label><input type="checkbox" value="${esc(v)}" ${sel.has(v)?'checked':''}> ${v===''?`<i class="mut">(${esc(blankLbl)})</i>`:esc(v)}</label>`).join('')}${vals.length>500?'<div class="mut small">… chỉ hiện 500 giá trị đầu, dùng ô tìm để thu hẹp</div>':''}</div>
  <div class="xfrow" style="justify-content:flex-end"><button class="btn s" data-clear>Xóa lọc cột</button><button class="btn s p" data-ok>OK</button></div>`;
  document.body.appendChild(pop); const r=anchor.getBoundingClientRect(); pop.style.top=(r.bottom+window.scrollY+4)+'px'; pop.style.left=Math.min(r.left+window.scrollX, window.innerWidth-300)+'px';
  const refresh=()=>{ const q=pop.querySelector('.xfs').value; pop.querySelectorAll('.xflist label').forEach(l=>{ l.style.display = matchSearch(q,[l.textContent])?'':'none'; }); };
  pop.querySelector('.xfs').oninput=refresh; refresh();
  const sub=pop.querySelector('.xfsub'); pop.querySelector('[data-cf]').onclick=()=>{ sub.hidden=!sub.hidden; };
  sub.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>xfCustom(b.dataset.op));
  function xfCustom(op0){
    const c0 = cur.cond && (!op0 || cur.cond.c1.op===op0) ? cur.cond : {type:ftype, c1:{op:op0||XF_OPS[ftype][0][0], v:'', v2:''}, join:'and', c2:{op:'', v:''}};
    const opSel=(name,v,blank)=>`<select data-n="${name}">${blank?'<option value=""></option>':''}${XF_OPS[ftype].filter(o=>name==='op1'||o[0]!=='bt').map(o=>`<option value="${o[0]}" ${o[0]===v?'selected':''}>${o[1]}</option>`).join('')}</select>`;
    const ph = ftype==='date' ? 'dd/mm/yyyy' : ftype==='month' ? 'mm/yyyy' : ftype==='num' ? 'số' : 'giá trị';
    const inp=(name,v)=>`<input type="text" data-n="${name}" list="xfdl" placeholder="${ph}" value="${esc(v||'')}">`;
    pop.classList.add('xfcd');
    pop.innerHTML = `<div class="xfct">Bộ lọc tùy chỉnh – ${XF_LBL[ftype].toLowerCase()}</div>
      <div class="small mut" style="margin-bottom:6px">Hiện các dòng mà cột <b>${esc(colName)}</b>:</div>
      <div class="xfcr">${opSel('op1',c0.c1.op)}${inp('v1',c0.c1.v)}</div>
      <div class="xfcr xfbt" ${c0.c1.op==='bt'?'':'hidden'}><span class="small mut">và</span>${inp('v1b',c0.c1.v2)}</div>
      <div class="xfc2" ${c0.c1.op==='bt'?'hidden':''}><div class="xfcr small"><label><input type="radio" name="xfj" value="and" ${c0.join!=='or'?'checked':''}> Và</label><label><input type="radio" name="xfj" value="or" ${c0.join==='or'?'checked':''}> Hoặc</label></div>
      <div class="xfcr">${opSel('op2',(c0.c2||{}).op,1)}${inp('v2',(c0.c2||{}).v)}</div></div>
      <datalist id="xfdl">${vals.filter(v=>v!=='').slice(0,300).map(v=>`<option value="${esc(v)}">`).join('')}</datalist>
      ${ftype==='text'?'<div class="small mut" style="margin-top:4px">Không phân biệt chữ hoa / thường, có dấu / không dấu.</div>':''}
      <div class="xfrow" style="justify-content:flex-end;margin-top:8px"><button class="btn s" data-x>Hủy</button><button class="btn s p" data-y>OK</button></div>`;
    const g=n=>pop.querySelector(`[data-n="${n}"]`);
    g('op1').onchange=()=>{ const bt=g('op1').value==='bt'; pop.querySelector('.xfbt').hidden=!bt; pop.querySelector('.xfc2').hidden=bt; };
    pop.querySelector('[data-x]').onclick=()=>closeFilter();
    const ok=()=>{ const c={type:ftype, c1:{op:g('op1').value, v:g('v1').value.trim(), v2:g('v1b').value.trim()}, join:(pop.querySelector('[name=xfj]:checked')||{}).value||'and', c2:{op:g('op2').value, v:g('v2').value.trim()}};
      if (c.c1.op!=='bt' && c.c1.v==='' && ftype!=='text') return toast('Nhập giá trị cần lọc'); if (c.c1.op==='bt' && (c.c1.v===''||c.c1.v2==='')) return toast('Nhập đủ 2 giá trị cho điều kiện Nằm giữa');
      for (const [o,v] of [[c.c1.op,c.c1.v],[c.c1.op==='bt'?'bt':'',c.c1.v2],[c.c2.op,c.c2.v]]) { if (!o || v==='') continue; if (ftype==='num' && cellNum(v)==null) return toast(`"${v}" không phải số`); if (ftype==='date' && !VND.parse('date',v)) return toast(`"${v}" không phải ngày dd/mm/yyyy`); if (ftype==='month' && !VND.parse('month',v)) return toast(`"${v}" không phải tháng mm/yyyy`); }
      if (!c.c2.op || c.c1.op==='bt') c.c2=null; st.filters[ci]={vals:null, text:'', cond:c}; applyTable(tbl,key); closeFilter(); };
    pop.querySelector('[data-y]').onclick=ok; pop.querySelectorAll('input[data-n]').forEach(i=>i.onkeydown=e=>{ if (e.key==='Enter') ok(); });
    setTimeout(()=>g('v1').focus(),0);
  }
  pop.querySelector('[data-all]').onclick=e=>{e.preventDefault(); pop.querySelectorAll('.xflist label').forEach(l=>{ if(l.style.display!=='none') l.querySelector('input').checked=true; });};
  pop.querySelector('[data-none]').onclick=e=>{e.preventDefault(); pop.querySelectorAll('.xflist label').forEach(l=>{ if(l.style.display!=='none') l.querySelector('input').checked=false; });};
  pop.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ st.sort={col:ci, dir:b.dataset.s}; applyTable(tbl,key); closeFilter(); });
  pop.querySelector('[data-clear]').onclick=()=>{ delete st.filters[ci]; if (st.sort && st.sort.col===ci) st.sort=null; applyTable(tbl,key); closeFilter(); };
  pop.querySelector('[data-ok]').onclick=()=>{ const checked=new Set([...pop.querySelectorAll('.xflist input:checked')].map(i=>i.value)); const text=pop.querySelector('.xfs').value.trim(); const all = checked.size===vals.length; st.filters[ci] = (all && !text) ? (cur.cond ? {vals:null, text:'', cond:cur.cond} : null) : {vals: all?null:checked, text: text && !all ? '' : text}; if (st.filters[ci] && !st.filters[ci].vals && !st.filters[ci].text && !st.filters[ci].cond) st.filters[ci]=null; applyTable(tbl,key); closeFilter(); };
  pop.onclick=e=>e.stopPropagation(); setTimeout(()=>document.addEventListener('click', closeFilter, {once:true}),0);
}
function closeFilter(){ const p=$('#xfpop'); if(p) p.remove(); }

