// Ô số: tự thêm dấu chấm phân cách hàng nghìn khi gõ (dấu phẩy = thập phân), giữ vị trí con trỏ
function fmtLive(i){ const v=i.value; const pos=i.selectionStart==null?v.length:i.selectionStart;
  const keep=ch=>/[\d,]/.test(ch); const nBefore=[...v.slice(0,pos)].filter(keep).length;
  const sign=/^\s*[-(]/.test(v)?'-':(/^\s*\+/.test(v)?'+':''); let t=v.replace(/[^\d,]/g,''); const ci=t.indexOf(','); let ip=ci<0?t:t.slice(0,ci), dp=ci<0?null:t.slice(ci+1).replace(/,/g,'');
  ip=ip.replace(/^0+(?=\d)/,''); const g=ip.replace(/\B(?=(\d{3})+(?!\d))/g,'.'); const out=(sign==='-'?'-':sign==='+'?'+':'')+g+(dp!=null?','+dp:'');
  if (out===v) return; i.value=out; let c=0, p2=out.length; if (nBefore===0) p2=sign?1:0; else for (let k=0;k<out.length;k++){ if (keep(out[k])) { c++; if (c===nBefore) { p2=k+1; break; } } } try { i.setSelectionRange(p2,p2); } catch(e){} }
// Bảng nhập: Enter = sang ô kế tiếp (ô cuối thì Lưu) · Shift+Enter = lùi lại · Ctrl+Enter = Lưu ngay
function formEnterNav(box, saveBtn){ const ins=[...box.querySelectorAll('.frm input:not([disabled])')];
  ins.forEach((i,ix)=>{ i.onkeydown=e=>{ if (e.key!=='Enter' || e.isComposing) return; e.preventDefault(); if (e.ctrlKey||e.metaKey) return saveBtn.click(); const j = e.shiftKey ? ix-1 : ix+1; if (j>=ins.length) return saveBtn.click(); if (j<0) return; ins[j].focus(); if (ins[j].select && ins[j].type!=='date') ins[j].select(); }; }); }
function cellVal(td){ return (td.textContent||'').trim(); }
// Lọc chữ kiểu Excel: chứa / không chứa / bắt đầu / kết thúc / bằng / khác / trống – không phân biệt hoa thường; gõ không dấu thì so bỏ dấu
function txtCond(c, v){ const raw=String(v??'').trim(); if (c.op==='tblank') return raw===''; if (c.op==='tnblank') return raw!=='';
  let q=lowNFC(c.val), t=lowNFC(raw); if (normQ(q)===q) { t=normQ(raw); }
  switch(c.op){ case 'tc': return t.includes(q); case 'tnc': return !t.includes(q); case 'tsw': return t.startsWith(q); case 'tew': return t.endsWith(q); case 'teq': return t===q; case 'tne': return t!==q; } return true; }
function cellDate(s){ const v=String(s).trim(); let m=v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; m=v.match(/^(\d{1,2})\/(\d{4})$/); if (m) return `${m[2]}-${m[1].padStart(2,'0')}`; return null; } // ngày dd/mm/yyyy → yyyy-mm-dd; tháng mm/yyyy → yyyy-mm
function cellNum(s){ let x=String(s).replace(/\s/g,'').replace(/^\+/,''); { const m=x.match(/^\((.+)\)$/); if (m) x='-'+m[1]; } if (!/^-?[\d.,]+%?$/.test(x)) return null; let t=x.replace('%',''); if (/^-?\d+,\d+$/.test(t)) t=t.replace(',','.'); const v=num(t); return isNaN(v)?null:v; } // số kiểu VN: 1.234,5 · 13,9%
// Cố định cột (như Freeze Panes của Excel): n cột đầu đứng yên khi cuộn ngang
function freezeCols(tbl){ const N=+tbl.dataset.freeze||0; if (N<2) return; const ths=[...tbl.querySelectorAll('thead th')]; const rows=[...tbl.querySelectorAll('tbody tr')];
  const tw=tbl.closest('.tw'); const cap=tw ? tw.clientWidth*0.86 : 1e9; // màn hình hẹp: bớt cột cố định để vẫn còn chỗ cuộn
  ths.slice(0,N).forEach(t=>{ if (t.classList.contains('nw') && t.textContent.trim().length>8) t.classList.remove('nw'); });
  const mark=(cells,k)=>cells.forEach((c,i)=>{ if (c) c.classList.toggle('fz', i<k); });
  mark(ths,N); rows.forEach(tr=>mark([...tr.children],N)); // gắn trước để áp độ rộng tối đa, rồi mới đo
  let n=N, left=0; const lefts=[];
  for (let i=0;i<N && i<ths.length;i++){ const w=ths[i].getBoundingClientRect().width; if (i>=1 && left+w>cap) { n=i; break; } lefts.push(left); left += w; }
  const apply=(cells)=>cells.forEach((c,i)=>{ if(!c) return; if (i<n) { c.classList.add('fz'); c.classList.toggle('fzl', i===n-1); c.style.left=lefts[i]+'px'; } else if (i<N) { c.classList.remove('fz','fzl'); c.style.left=''; } });
  apply(ths); rows.forEach(tr=>apply([...tr.children])); }
function enhanceTables(root){
  root.querySelectorAll('.tw > table').forEach((tbl, idx)=>{
    if (tbl.dataset.xl) return; tbl.dataset.xl='1';
    const tw = tbl.parentElement; const ths=[...tbl.querySelectorAll('thead th')]; if (!ths.length) return;
    const key = view+'|'+ths.map(h=>h.textContent.trim()).join('|').slice(0,200); tbl.dataset.tkey = key; ths.forEach(thLabel);
    if (tbl.querySelectorAll('thead tr').length===1) { tbl.dataset.defcols = JSON.stringify(colKeys(ths)); applyColOrder(tbl); ths.splice(0, ths.length, ...tbl.querySelectorAll('thead th')); }
    const st = tblState[key] = tblState[key] || {filters:{}, sort:null, on:false};
    const nBody = tbl.querySelectorAll('tbody tr:not(.tot)').length;
    const mainData = (/^d_/.test(view) || view==='thietlap') && root.id==='main' && tbl===root.querySelector('.tw > table');
    const tools = !tbl.dataset.grid && !mainData && !tbl.closest('#modal') && (nBody>=5 || ths.length>=6);
    // thanh công cụ
    const bar = document.createElement('div'); bar.className='xlbar';
    bar.innerHTML = `<span class="small mut" data-xn style="display:none"></span><button class="btn s" data-xc style="display:none">✕ Xóa lọc / sắp xếp</button>` + (tools ? `<span class="xsp"></span><button class="btn s io" data-ic="sliders" data-tset title="Thiết lập bảng: ẩn/hiện cột, mật độ dòng" aria-label="Thiết lập bảng">${icon('sliders')}</button><button class="btn s io" data-ic="xout" data-txl title="Xuất Excel bảng này (đúng các dòng, cột đang hiển thị)" aria-label="Xuất Excel bảng này">${icon('xout')}</button>` : '');
    if (tools) { bar.classList.add('tools'); bar.querySelector('[data-tset]').onclick=e=>{ e.stopPropagation(); openTblSet(tbl); }; bar.querySelector('[data-txl]').onclick=()=>exportVisibleTable(tbl); }
    tw.parentElement.insertBefore(bar, tw);
    // thanh cuộn ngang phía trên
    const hs = document.createElement('div'); hs.className='hscroll'; hs.innerHTML='<div></div>'; tw.parentElement.insertBefore(hs, tw);
    const sync=()=>{ hs.firstChild.style.width = tbl.scrollWidth+'px'; hs.style.display = tbl.scrollWidth > tw.clientWidth+2 ? '' : 'none'; };
    sync(); setTimeout(sync, 50); hs.onscroll=()=>{ tw.scrollLeft=hs.scrollLeft; }; tw.addEventListener('scroll', ()=>{ hs.scrollLeft=tw.scrollLeft; });
    // nút lọc từng cột
    st.widths = st.widths || {};
    const setW=(ci,w)=>{ const th=ths[ci]; if(!th) return; th.classList.remove('nw'); th.classList.add('rs'); th.style.width=w+'px'; th.style.minWidth=w+'px'; th.style.maxWidth=w+'px'; tbl.querySelectorAll('tbody tr').forEach(r=>{ const td=r.children[ci]; if(td){ td.style.width=w+'px'; td.style.minWidth=w+'px'; td.style.maxWidth=w+'px'; } }); };
    ths.forEach((th,ci)=>{ if (!th.querySelector('br') && th.textContent.replace(/\s+/g,' ').trim().length<=22) { th.classList.add('nw'); th.dataset.nw='1'; } if (thLabel(th) || (!th.querySelector('input') && !tbl.dataset.grid && [...tbl.querySelectorAll('tbody tr')].some(r=>{ const td=r.children[ci]; return td && !td.querySelector('button') && td.textContent.trim(); }))) { const b=document.createElement('button'); b.className='xfb'; b.innerHTML='▼'; b.title='Lọc / sắp xếp cột'; b.onclick=e=>{ e.stopPropagation(); openFilter(tbl, key, ci, b); }; th.appendChild(b); }
      const h=document.createElement('div'); h.className='xrs'; h.title='Kéo để đổi độ rộng cột'; th.appendChild(h);
      h.onmousedown=e=>{ e.preventDefault(); e.stopPropagation(); const x0=e.clientX, w0=th.getBoundingClientRect().width; tbl.classList.add('xresizing'); h.classList.add('on'); const mv=ev=>{ const w=Math.max(40, w0+(ev.clientX-x0)); setW(ci,w); st.widths[ci]=w; }; const up=()=>{ document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); tbl.classList.remove('xresizing'); h.classList.remove('on'); sync(); freezeCols(tbl); }; document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up); };
      h.ondblclick=e=>{ e.stopPropagation(); delete st.widths[ci]; th.style.width=th.style.minWidth=th.style.maxWidth=''; th.classList.remove('rs'); if (th.dataset.nw) th.classList.add('nw'); tbl.querySelectorAll('tbody tr').forEach(r=>{ const td=r.children[ci]; if(td){ td.style.width=td.style.minWidth=td.style.maxWidth=''; } }); sync(); };
      if (st.widths[ci]) setW(ci, st.widths[ci]); });
    bar.querySelector('[data-xc]').onclick=()=>{ st.filters={}; st.sort=null; applyTable(tbl, key); };
    applyTable(tbl, key); applyTblPrefs(tbl); if (tbl.dataset.freeze) { freezeCols(tbl); setTimeout(()=>freezeCols(tbl), 60);
      // độ rộng cột cố định đổi khi lọc / sắp xếp / đổi cỡ cửa sổ → tính lại vị trí để không hở khe (cột cuộn bị lộ qua khe)
      if (window.ResizeObserver) { let raf=0; const ro=new ResizeObserver(()=>{ if (!tbl.isConnected) { ro.disconnect(); return; } cancelAnimationFrame(raf); raf=requestAnimationFrame(()=>freezeCols(tbl)); }); [...tbl.querySelectorAll('thead th')].slice(0, (+tbl.dataset.freeze||0)+1).forEach(th=>ro.observe(th)); } }
  });
}
function applyTable(tbl, key){
  const st=tblState[key]; const tbody=tbl.querySelector('tbody'); if(!tbody) return; const rows=[...tbody.querySelectorAll('tr')]; const data=rows.filter(r=>!r.classList.contains('tot')); const tot=rows.filter(r=>r.classList.contains('tot'));
  const ths=[...tbl.querySelectorAll('thead th')];
  // sắp xếp
  if (st.sort) { const {col,dir}=st.sort; data.sort((a,b)=>{ const va=cellVal(a.children[col]||{}), vb=cellVal(b.children[col]||{}); const na=cellNum(va), nb=cellNum(vb), da=cellDate(va), db=cellDate(vb); let c; if (na!=null && nb!=null) c=na-nb; else if (da!=null && db!=null) c=da.localeCompare(db); else c=va.localeCompare(vb,'vi'); return dir==='desc'?-c:c; }); data.forEach(r=>tbody.appendChild(r)); tot.forEach(r=>tbody.appendChild(r)); }
  // lọc
  let shown=0; data.forEach(r=>{ let ok=true; for (const c in st.filters){ const f=st.filters[c]; if(!f) continue; const v=cellVal(r.children[+c]||{}); if (f.vals && !f.vals.has(v)) ok=false; if (f.text && !v.toLowerCase().includes(f.text.toLowerCase())) ok=false; if (f.cond && !condOk(f.cond, v)) ok=false; if(!ok) break; } r.style.display = ok?'':'none'; if(ok) shown++; });
  ths.forEach((th,ci)=>{ th.classList.toggle('xf-act', !!(st.filters[ci] && (st.filters[ci].vals||st.filters[ci].text||st.filters[ci].cond)) || !!(st.sort && st.sort.col===ci)); });
  const n = tbl.parentElement.previousElementSibling && tbl.parentElement.previousElementSibling.previousElementSibling; const lab = n && n.querySelector && n.querySelector('[data-xn]'); const active = Object.values(st.filters).some(f=>f) || !!st.sort; if (lab) { lab.textContent = shown<data.length ? `Đang lọc: hiện ${shown}/${data.length} dòng` : ''; lab.style.display = shown<data.length ? '' : 'none'; lab.parentElement.classList.toggle('on', shown<data.length || active); } const xc = n && n.querySelector && n.querySelector('[data-xc]'); if (xc) xc.style.display = active ? '' : 'none';
}
// ---- Lọc kiểu Excel: Lọc theo số / chữ / ngày + Bộ lọc tùy chỉnh (2 điều kiện, Và / Hoặc) ----
const XF = {
  num:{lbl:'số', ops:[['eq','bằng'],['ne','khác'],['gt','lớn hơn'],['ge','lớn hơn hoặc bằng'],['lt','nhỏ hơn'],['le','nhỏ hơn hoặc bằng'],['abs','lệch cả hai chiều ≥ (bỏ dấu +/-)']],
       menu:[['eq','Bằng…'],['ne','Khác…'],['gt','Lớn hơn…'],['ge','Lớn hơn hoặc bằng…'],['lt','Nhỏ hơn…'],['le','Nhỏ hơn hoặc bằng…'],['between','Nằm giữa…'],['neg','Chỉ số âm'],['abs','Lệch cả hai chiều ≥…'],['','Bộ lọc tùy chỉnh…']]},
  date:{lbl:'ngày', ops:[['eq','bằng'],['ne','khác'],['gt','sau'],['ge','sau hoặc bằng'],['lt','trước'],['le','trước hoặc bằng']],
       menu:[['eq','Bằng…'],['lt','Trước…'],['gt','Sau…'],['between','Nằm giữa…'],['','Bộ lọc tùy chỉnh…']]},
  txt:{lbl:'chữ', ops:[['eq','bằng'],['ne','khác'],['sw','bắt đầu bằng'],['ew','kết thúc bằng'],['c','chứa'],['nc','không chứa'],['blank','trống'],['nblank','không trống']],
       menu:[['eq','Bằng…'],['ne','Khác…'],['sw','Bắt đầu bằng…'],['ew','Kết thúc bằng…'],['c','Chứa…'],['nc','Không chứa…'],['','Bộ lọc tùy chỉnh…']]}
};
const xfNum = v => num(String(v).trim().replace(/%$/,'').replace(/^(-?\d+),(\d+)$/,'$1.$2'));
function condOne(k, c, v){ if (!c || !c.op) return true;
  if (k==='num') { if (c.op==='neg') { const n=cellNum(v); return n!=null && n<0; } const n=cellNum(v); if (n==null) return c.op==='ne'; const x=xfNum(c.val); const E=1e-9;
    switch(c.op){ case 'eq': return Math.abs(n-x)<E; case 'ne': return Math.abs(n-x)>=E; case 'gt': return n>x; case 'ge': return n>=x-E; case 'lt': return n<x; case 'le': return n<=x+E; case 'abs': return Math.abs(n)>=x-E; } return true; }
  if (k==='date') { const d=cellDate(v); if (!d) return c.op==='ne'; const x=String(c.val||'').slice(0,d.length); if (!x) return true;
    switch(c.op){ case 'eq': return d===x; case 'ne': return d!==x; case 'gt': return d>x; case 'ge': return d>=x; case 'lt': return d<x; case 'le': return d<=x; } return true; }
  return txtCond({op:{eq:'teq',ne:'tne',sw:'tsw',ew:'tew',c:'tc',nc:'tnc',blank:'tblank',nblank:'tnblank'}[c.op]||c.op, val:c.val}, v); }
function condOk(c, v){
  if (c.k) { const A=condOne(c.k, c.a, v); if (!c.b || !c.b.op) return A; const B=condOne(c.k, c.b, v); return c.j==='or' ? (A||B) : (A&&B); }
  // dạng cũ
  if (/^t/.test(c.op||'')) return txtCond(c, v);
  if (c.op==='dr') { const dv=cellDate(v); if (!dv) return false; const L=dv.length; return !(c.from && dv < c.from.slice(0,L)) && !(c.to && dv > c.to.slice(0,L)); }
  return condOne('num', {op:c.op, val:c.val}, v); }
const condTxt = c => { if (!c || !c.k) return ''; const L=Object.fromEntries(XF[c.k].ops); const one=x=>x&&x.op ? (x.op==='neg'?'chỉ số âm':`${L[x.op]||x.op}${/blank$/.test(x.op)?'':' '+(c.k==='date'?fmtD(x.val):x.val)}`) : ''; return [one(c.a), c.b&&c.b.op?(c.j==='or'?'hoặc ':'và ')+one(c.b):''].filter(Boolean).join(' '); };
function xfDialog(tbl, key, ci, k, op, cur, title, monthCol){ closeFilter(); const st=tblState[key];
  const old=$('#xfdlg'); if (old) old.remove(); const d=document.createElement('div'); d.id='xfdlg'; d.className='xfdlg';
  const inT = k==='num' ? 'text' : k==='date' ? (monthCol?'month':'date') : 'text'; const ph = k==='num' ? 'số' : k==='txt' ? 'chữ' : '';
  let a={op, val:''}, b={op:'', val:''}, j='and'; if (op==='between') { a={op:k==='date'?'ge':'ge', val:''}; b={op:'le', val:''}; }
  if (!op && cur && cur.k===k) { a={...cur.a}; b={...(cur.b||{op:'',val:''})}; j=cur.j||'and'; } else if (op && cur && cur.k===k && cur.a && cur.a.op===op && !(cur.b&&cur.b.op)) a={...cur.a};
  const sel=(cls,v,blank)=>`<select class="${cls}">${blank?'<option value=""></option>':''}${XF[k].ops.map(([o,t])=>`<option value="${o}" ${o===v?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}</select>`;
  const valIn=(cls,v)=>`<input type="${inT}" class="${cls}" value="${esc(v==null?'':(k==='num'?String(v).replace('.',','):v))}" placeholder="${ph}">`;
  d.innerHTML=`<div class="xfdh">Bộ lọc tùy chỉnh – lọc theo ${XF[k].lbl}</div><div class="small">Hiện các dòng mà cột <b>${esc(title)}</b>:</div>
   <div class="xfdr">${sel('xa',a.op,!a.op)}${valIn('xav',a.val)}</div>
   <div class="xfdr small" style="gap:14px"><label><input type="radio" name="xfj" value="and" ${j!=='or'?'checked':''}> Và</label><label><input type="radio" name="xfj" value="or" ${j==='or'?'checked':''}> Hoặc</label></div>
   <div class="xfdr">${sel('xb',b.op,true)}${valIn('xbv',b.val)}</div>
   <div class="xfdr" style="justify-content:flex-end"><button class="btn s" data-x>Hủy</button><button class="btn s p" data-ok>OK</button></div>`;
  document.body.appendChild(d); d.onclick=e=>e.stopPropagation();
  const tog=()=>{ ['xa','xb'].forEach(c=>{ const o=d.querySelector('.'+c).value; d.querySelector('.'+c+'v').style.visibility=/blank$/.test(o)?'hidden':''; }); }; d.querySelectorAll('select').forEach(x=>x.onchange=tog); tog();
  const f1=d.querySelector('.xav'); if (f1) setTimeout(()=>f1.focus(),0);
  d.querySelector('[data-x]').onclick=()=>d.remove();
  const ok=()=>{ const A={op:d.querySelector('.xa').value, val:d.querySelector('.xav').value.trim()}, B={op:d.querySelector('.xb').value, val:d.querySelector('.xbv').value.trim()};
    const need=x=>x.op && !/blank$/.test(x.op) && x.val==='';
    if (!A.op || need(A)) return toast('Nhập điều kiện thứ nhất'); if (B.op && need(B)) return toast('Nhập giá trị cho điều kiện thứ hai');
    const f=st.filters[ci]||{}; st.filters[ci]={vals:f.vals||null, text:f.text||'', cond:{k, a:A, b:B.op?B:null, j:d.querySelector('input[name=xfj]:checked').value}}; applyTable(tbl,key); d.remove(); };
  d.querySelector('[data-ok]').onclick=ok; d.querySelectorAll('input[type=text],input[type=date],input[type=month]').forEach(i=>i.onkeydown=e=>{ if (e.key==='Enter') ok(); if (e.key==='Escape') d.remove(); });
}
function openFilter(tbl, key, ci, anchor){
  closeFilter(); const st=tblState[key]; const tbody=tbl.querySelector('tbody'); const vals=[...new Set([...tbody.querySelectorAll('tr:not(.tot)')].map(r=>cellVal(r.children[ci]||{})))]; const numeric = vals.length && vals.every(v=>v===''||cellNum(v)!=null); const neV=vals.filter(v=>v!==''), dV=neV.filter(v=>cellDate(v)!=null); const dateCol = !numeric && dV.length>0 && dV.length>=neV.length*0.8; const monthCol = dateCol && dV.every(v=>cellDate(v).length===7); vals.sort((a,b)=> { if (numeric) return (cellNum(a)||0)-(cellNum(b)||0); if (dateCol) { const da=cellDate(a), db=cellDate(b); if (da&&db) return da.localeCompare(db); if (da||db) return da?-1:1; } return a.localeCompare(b,'vi'); });
  const cur = st.filters[ci] || {}; const sel = cur.vals ? new Set(cur.vals) : new Set(vals);
  const pop=document.createElement('div'); pop.className='xfpop'; pop.id='xfpop';
  pop.innerHTML = `<div class="xfrow"><button class="btn s" data-s="asc">↑ Sắp xếp A→Z / nhỏ→lớn</button><button class="btn s" data-s="desc">↓ Z→A / lớn→nhỏ</button></div>
  ${(()=>{ const k=numeric?'num':dateCol?'date':'txt'; const ct=cur.cond&&cur.cond.k===k?condTxt(cur.cond):(cur.cond?'(điều kiện cũ)':''); return `<div class="xfsub" data-sub><span>Lọc theo ${XF[k].lbl}${ct?' ✓':''}</span><span class="mut">▸</span></div>${ct?`<div class="xfcur small"><span>Đang lọc: <b>${esc(ct)}</b></span> <a href="#" data-cx title="Bỏ điều kiện lọc">✕</a></div>`:''}<div class="xfitems" style="display:none">${XF[k].menu.map(([o,t])=>`<a href="#" data-op="${o}">${t}</a>`).join('')}</div>`; })()}
  <input type="text" class="xfs" placeholder="Tìm giá trị…" value="${esc(cur.text||'')}">
  <div class="xfrow small"><a href="#" data-all>Chọn tất cả</a> · <a href="#" data-none>Bỏ chọn</a> <span class="mut">(${vals.length} giá trị)</span></div>
  <div class="xflist">${vals.slice(0,500).map(v=>`<label><input type="checkbox" value="${esc(v)}" ${sel.has(v)?'checked':''}> ${v===''?'<i class="mut">(trống)</i>':esc(v)}</label>`).join('')}${vals.length>500?'<div class="mut small">… chỉ hiện 500 giá trị đầu, dùng ô tìm để thu hẹp</div>':''}</div>
  <div class="xfrow" style="justify-content:flex-end"><button class="btn s" data-clear>Xóa lọc cột</button><button class="btn s p" data-ok>OK</button></div>`;
  document.body.appendChild(pop); const r=anchor.getBoundingClientRect(); pop.style.top=(r.bottom+window.scrollY+4)+'px'; pop.style.left=Math.min(r.left+window.scrollX, window.innerWidth-300)+'px';
  const refresh=()=>{ const q=pop.querySelector('.xfs').value.toLowerCase(); pop.querySelectorAll('.xflist label').forEach(l=>{ l.style.display = l.textContent.toLowerCase().includes(q)?'':'none'; }); };
  pop.querySelector('.xfs').oninput=refresh; refresh();
  pop.querySelector('[data-all]').onclick=e=>{e.preventDefault(); pop.querySelectorAll('.xflist label').forEach(l=>{ if(l.style.display!=='none') l.querySelector('input').checked=true; });};
  pop.querySelector('[data-none]').onclick=e=>{e.preventDefault(); pop.querySelectorAll('.xflist label').forEach(l=>{ if(l.style.display!=='none') l.querySelector('input').checked=false; });};
  pop.querySelectorAll('[data-s]').forEach(b=>b.onclick=()=>{ st.sort={col:ci, dir:b.dataset.s}; applyTable(tbl,key); closeFilter(); });
  { const k=numeric?'num':dateCol?'date':'txt'; const title=(anchor.closest('th')||anchor).textContent.replace(/[▼▾*]/g,'').trim();
    pop.querySelector('[data-sub]').onclick=()=>{ const it=pop.querySelector('.xfitems'); const open=it.style.display==='none'; it.style.display=open?'':'none'; pop.querySelector('[data-sub] .mut').textContent=open?'▾':'▸'; };
    pop.querySelectorAll('.xfitems [data-op]').forEach(a=>a.onclick=e=>{ e.preventDefault(); const op=a.dataset.op; if (op==='neg') { const f=st.filters[ci]||{}; st.filters[ci]={vals:f.vals||null, text:f.text||'', cond:{k:'num', a:{op:'neg',val:''}, b:null, j:'and'}}; applyTable(tbl,key); closeFilter(); return; } xfDialog(tbl, key, ci, k, op, cur.cond, title, monthCol); });
    const cx=pop.querySelector('[data-cx]'); if (cx) cx.onclick=e=>{ e.preventDefault(); const f=st.filters[ci]; if (f) { f.cond=null; if (!f.vals && !f.text) st.filters[ci]=null; } applyTable(tbl,key); closeFilter(); }; }
  pop.querySelector('[data-clear]').onclick=()=>{ delete st.filters[ci]; if (st.sort && st.sort.col===ci) st.sort=null; applyTable(tbl,key); closeFilter(); };
  pop.querySelector('[data-ok]').onclick=()=>{ const checked=new Set([...pop.querySelectorAll('.xflist input:checked')].map(i=>i.value)); const text=pop.querySelector('.xfs').value.trim(); const all = checked.size===vals.length; const cond=cur.cond||null; st.filters[ci] = {vals: all?null:checked, text: text && !all ? '' : text, cond}; if (!st.filters[ci].vals && !st.filters[ci].text && !st.filters[ci].cond) st.filters[ci]=null; applyTable(tbl,key); closeFilter(); };
  pop.onclick=e=>e.stopPropagation(); setTimeout(()=>document.addEventListener('click', closeFilter, {once:true}),0);
}
function closeFilter(){ const p=$('#xfpop'); if(p) p.remove(); }

