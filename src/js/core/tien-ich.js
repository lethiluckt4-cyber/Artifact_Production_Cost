// ---------- Tiện ích ----------
const $ = (s, el=document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Số âm hiển thị trong ngoặc (1.234) – tô đỏ tự động (markNeg)
const negP = (x, s) => x<0 ? `(${s})` : s;
const fmtN = (v, d=0) => { if (v==null || v==='' || isNaN(v)) return ''; let x=Number(v); if (Math.abs(x) < 0.5*Math.pow(10,-d)) x=0; return negP(x, Math.abs(x).toLocaleString('vi-VN', {minimumFractionDigits:d, maximumFractionDigits:d})); }; // không hiện "-0"
const fmtQ = v => { if (v==null || isNaN(v)) return ''; let x=Number(v); if (Math.abs(x)<0.0005) x=0; return negP(x, Math.abs(x).toLocaleString('vi-VN', {maximumFractionDigits:3})); };
const fmtPct = v => (v===''||v==null||!num(v)) ? '' : (num(v)*100).toLocaleString('vi-VN',{maximumFractionDigits:4})+'%';
const pctIn = v => { let t=String(v==null?'':v).trim(); if(!t) return 0; t=t.replace('%','').trim(); if(t.includes(',') && !/\.\d{3}/.test(t)) t=t.replace(',','.'); return num(t)/100; };
const fmtP = v => { if (v==null || isNaN(v)) return ''; const x=Math.abs(v*100)<0.05 ? 0 : v*100; return negP(x, Math.abs(x).toLocaleString('vi-VN', {maximumFractionDigits:1}) + '%'); };
const fmtD = s => { if(!s) return ''; const [y,m,d]=String(s).split('-'); return d && m && y ? `${d}/${m}/${y}` : s; };
const fmtKy = ky => { if(!ky) return ''; if(ky.startsWith('R:')) { const [,a,b]=ky.split(':'); return `${fmtD(a)} – ${fmtD(b)}`; } if(ky.length===4) return `cả năm ${ky}`; const [y,m]=ky.split('-'); return `${m}/${y}`; };
const kyOf = s => (s||'').slice(0,7);
const num = v => { if (v==null || v==='') return 0; if (typeof v==='number') return v; let t=String(v).trim().replace(/\s/g,''); { const m=t.match(/^\((.+)\)$/); if (m) t='-'+m[1].replace(/^-/,''); } let x; if(/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) x=parseFloat(t.replace(/\./g,'').replace(',','.')); else if(/^-?\d+,(\d{1,2}|\d{4,})$/.test(t)) x=parseFloat(t.replace(',','.')); else x=parseFloat(t.replace(/,/g,'')); return isNaN(x)?0:x; };
const daysInMonth = ky => { const [y,m]=ky.split('-').map(Number); return new Date(y,m,0).getDate(); };
const nextKy = ky => { let [y,m]=ky.split('-').map(Number); m++; if(m>12){m=1;y++;} return `${y}-${String(m).padStart(2,'0')}`; };
const todayKy = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; };
const uid = () => Math.random().toString(36).slice(2,9) + Date.now().toString(36).slice(-3);
const shiftE = (n, e) => { const [m, ex] = String(n).split('e'); return Number(m+'e'+((+ex||0)+e)); }; // dịch dấu phẩy an toàn cả khi số ở dạng 1.2e-13
const round = (v,d) => { if (!isFinite(v) || !v) return v||0; const sg=v<0?-1:1; const x=Number(Math.abs(v).toPrecision(15)); return sg*shiftE(Math.round(shiftE(x, d)), -d); }; // làm tròn như hàm ROUND của Excel (15 chữ số)
const sum = (a, f) => a.reduce((s,x)=>s+(f?f(x):x),0);
// Nhập nhanh ngày: "15" = ngày 15 của tháng đang xem; "15/10" = 15/10 của năm đang xem
function quickDate(v){ const t=String(v||'').trim(); if(!t) return t; const k=(typeof selKy==='string' && /^\d{4}-\d{2}$/.test(selKy)) ? selKy : (typeof selKy==='string' && /^\d{4}/.test(selKy) ? selKy.slice(0,4)+'-'+String(new Date().getMonth()+1).padStart(2,'0') : null); if(!k) return t; let m=t.match(/^(\d{1,2})$/); if(m) return `${m[1].padStart(2,'0')}/${k.slice(5,7)}/${k.slice(0,4)}`; m=t.match(/^(\d{1,2})[\/.-](\d{1,2})$/); if(m) return `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${k.slice(0,4)}`; return t; }
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
function toast(msg, ms=2600){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(), ms); }

