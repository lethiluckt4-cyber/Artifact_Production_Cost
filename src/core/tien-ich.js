//# Tiện ích: định dạng số/ngày (số âm dạng ( )), tìm kiếm, toast
// ---------- Tiện ích ----------
const $ = (s, el=document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Số âm hiển thị dạng (1.234) – chữ đỏ (class .neg gắn tự động). fmtNi/fmtQi: dạng -1234 dùng cho ô nhập.
const negP = (t) => { const a=t.replace(/^-/,''); return /^-/.test(t) && /[1-9]/.test(a) ? '('+a+')' : a; };
const fmtNi = (v, d=0) => (v==null || v==='' || isNaN(v)) ? '' : Number(v).toLocaleString('vi-VN', {minimumFractionDigits:d, maximumFractionDigits:d});
const fmtQi = v => (v==null || isNaN(v)) ? '' : Number(v).toLocaleString('vi-VN', {maximumFractionDigits:3});
const fmtN = (v, d=0) => negP(fmtNi(v, d));
const NEG_RE = /^\(\d[\d.,]*%?\)$/;
function negCheck(el){ if (!el || el.nodeType!==1 || el.closest('input,select,textarea,option')) return; let t=''; for (const n of el.childNodes) { if (n.nodeType===3) t+=n.nodeValue; else if (n.nodeType===1 && n.textContent.trim()) return el.classList.remove('neg'); } t=t.trim(); if (NEG_RE.test(t)) el.classList.add('neg'); else el.classList.remove('neg'); }
function negScan(root){ if (!root) return; if (root.nodeType===3) return negCheck(root.parentElement); if (root.nodeType!==1) return; const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode:n=>n.nodeValue.indexOf('(')>=0 || (n.parentElement&&n.parentElement.classList.contains('neg')) ? 1 : 3 }); let n; const seen=new Set(); while ((n=w.nextNode())) { const p=n.parentElement; if (p && !seen.has(p)) { seen.add(p); negCheck(p); } } }
(()=>{ const pend=new Set(); let raf=0; const flush=()=>{ raf=0; pend.forEach(n=>{ if (n.isConnected) negScan(n); }); pend.clear(); };
  const mo=new MutationObserver(recs=>{ for (const r of recs) { if (r.type==='characterData') pend.add(r.target); else { r.addedNodes.forEach(n=>pend.add(n)); if (r.target.nodeType===1 && r.target.classList.contains('neg')) pend.add(r.target); } } if (!raf) raf=requestAnimationFrame(flush); });
  const go=()=>{ mo.observe(document.body, {childList:true, subtree:true, characterData:true}); negScan(document.body); };
  if (document.body) go(); else document.addEventListener('DOMContentLoaded', go); })();
const fmtQ = v => negP(fmtQi(v));
const fmtP = v => (v==null || isNaN(v)) ? '' : negP((v*100).toLocaleString('vi-VN', {maximumFractionDigits:1})).replace(/(\)?)$/, '%$1');
const fmtD = s => { if(!s) return ''; const [y,m,d]=String(s).split('-'); return d && m && y ? `${d}/${m}/${y}` : s; };
const fmtKy = ky => { if(!ky) return ''; if(ky.startsWith('R:')) { const [,a,b]=ky.split(':'); return `${fmtD(a)} – ${fmtD(b)}`; } if(ky.length===4) return `cả năm ${ky}`; const [y,m]=ky.split('-'); return `${m}/${y}`; };
const kyOf = s => (s||'').slice(0,7);
const num = v => { if (v==null || v==='') return 0; if (typeof v==='number') return v; let t=String(v).trim().replace(/\s/g,''); const pm=t.match(/^\((.+)\)$/); if (pm) t='-'+pm[1]; let x; if(/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) x=parseFloat(t.replace(/\./g,'').replace(',','.')); else x=parseFloat(t.replace(/,/g,'')); return isNaN(x)?0:x; };
const daysInMonth = ky => { const [y,m]=ky.split('-').map(Number); return new Date(y,m,0).getDate(); };
const nextKy = ky => { let [y,m]=ky.split('-').map(Number); m++; if(m>12){m=1;y++;} return `${y}-${String(m).padStart(2,'0')}`; };
const todayKy = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };
const uid = () => Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-3);
const round = (v,d) => { const p=Math.pow(10,d); return Math.round(v*p)/p; };
const sum = (a, f) => a.reduce((s,x)=>s+(f?f(x):x),0);
function toISODate(v){
  if (v==null || v==='') return '';
  if (v instanceof Date) { if (isNaN(v)) return ''; return `${v.getFullYear()}-${String(v.getMonth()+1).padStart(2,'0')}-${String(v.getDate()).padStart(2,'0')}`; }
  if (typeof v==='number') { if (v<20000 || v>80000) return ''; const d = new Date(Date.UTC(1899,11,30) + Math.round(v)*86400000); return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`; }
  const s=String(v).trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/); if (m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/); if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2})$/); if (m) return `20${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`;
  return '';
}
function toKy(v){
  if (v==null || v==='') return '';
  if (v instanceof Date || typeof v==='number') return kyOf(toISODate(v));
  const s=String(v).trim();
  let m=s.match(/^(\d{4})[-\/](\d{1,2})$/); if(m) return `${m[1]}-${m[2].padStart(2,'0')}`;
  m=s.match(/^(\d{1,2})[-\/](\d{4})$/); if(m) return `${m[2]}-${m[1].padStart(2,'0')}`;
  const d=toISODate(s); return d?kyOf(d):'';
}
function markMiss(root, id, keys){ root.querySelectorAll('td.miss').forEach(td=>td.classList.remove('miss')); let first=null; keys.forEach(k=>{ const td=root.querySelector(`td.ed[data-id="${id}"][data-k="${k}"]`); if (td) { td.classList.add('miss'); if(!first) first=td; const clr=()=>td.classList.remove('miss'); td.addEventListener('input',clr,{once:true}); td.addEventListener('change',clr,{once:true}); } }); if (first) { const f=first.querySelector('input,select')||first; try{ f.focus(); }catch(e){} } }
const normS = s => String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase();
function matchSearch(q, parts){ const n=normS(q).trim(); if (!n) return true; const hay=normS(parts.filter(x=>x!=null&&x!=='').join(' ')); return n.split(/\s+/).every(w=>hay.includes(w)); }
const dTxt = d => d ? `${d} ${fmtD(d)}` : '';
let _stm=null;
function bindSearch(){ const q=$('#q'); if(!q) return;
  const run=()=>{ const el=$('#q'); const pos=el?el.selectionStart:null; render(); const v=$('#q'); if (v) { v.focus(); const L=v.value.length; try{ v.setSelectionRange(pos==null?L:Math.min(pos,L), pos==null?L:Math.min(pos,L)); }catch(e){} } };
  q.oninput=e=>{ search=e.target.value; if (e.isComposing) return; clearTimeout(_stm); _stm=setTimeout(run, 220); };
  q.addEventListener('compositionend', e=>{ search=e.target.value; clearTimeout(_stm); _stm=setTimeout(run, 120); });
}
function toast(msg, ms=2600){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(), ms); }

