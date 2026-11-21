// Màn hình báo cáo: đưa nút (Xuất Excel…) và 2 biểu tượng Thiết lập bảng / Xuất Excel bảng lên cùng hàng chọn kỳ, canh phải
// Bảng chính kéo dài sát đáy màn hình (không để khoảng trống dưới bảng)
function fitTables(m){ m=m||$('#main'); if (!m) return; const vis=[...m.querySelectorAll('.tw')].filter(t=>t.offsetParent && !t.closest('#modal')); if (!vis.length) return;
  const single = vis.length===1; const tws = single ? vis : vis.filter(t=>t.scrollHeight>t.clientHeight+2); const t=tws[tws.length-1]; if (!t) return;
  const top=t.getBoundingClientRect().top + window.scrollY; const vh=window.innerHeight;
  let below=0; let n=t.nextElementSibling; while (n) { below+=n.offsetHeight||0; n=n.nextElementSibling; } let p=t.parentElement; while (p && p!==m) { const cs=getComputedStyle(p); below+=parseFloat(cs.paddingBottom)||0; let q=p.nextElementSibling; while (q) { below+=q.offsetHeight||0; q=q.nextElementSibling; } p=p.parentElement; }
  const h=Math.max(260, Math.floor(vh - top - below - (parseFloat(getComputedStyle(m).paddingBottom)||0) - 4)); t.style.maxHeight=h+'px'; if (single) t.style.height=h+'px';
  const over=document.documentElement.scrollHeight-window.innerHeight; if (over>0 && window.scrollY===0) { const nh=Math.max(200, h-over); t.style.maxHeight=nh+'px'; if (single) t.style.height=''; } }
window.addEventListener('resize', ()=>{ clearTimeout(window.__fitT); window.__fitT=setTimeout(()=>fitTables(), 120); });
function liftActions(m){
  // Thông số đề xuất: nút Sửa / Hủy / Lưu nằm cùng hàng với 2 biểu tượng của bảng ngay dưới
  { const eg=m.querySelector('#egPp'); if (eg) { let n=eg.nextElementSibling; while (n && !n.classList.contains('xlbar')) n=n.nextElementSibling; if (n) { const first=n.querySelector('[data-tset],[data-txl]'); [...eg.children].forEach(c=>n.insertBefore(c, first)); eg.remove(); n.classList.add('ppbar'); } } }
  if (/^d_/.test(view) || view==='thietlap' || view==='kehoach') return;
  const kr=m.querySelector(':scope > .kyrow'); if (!kr) return;
  const tb=m.querySelector(':scope > .toolbar'); const right=tb && tb.querySelector('.tbl-right');
  const box=document.createElement('div'); box.className='kyact';
  if (right) [...right.children].forEach(b=>box.appendChild(b));
  const bars=[...m.querySelectorAll('.xlbar.tools')];
  if (bars.length===1) { const bb=bars[0]; bb.querySelectorAll('[data-tset],[data-txl]').forEach(b=>box.appendChild(b)); bb.classList.remove('tools'); const sp=bb.querySelector('.xsp'); if (sp) sp.remove(); }
  if (!box.children.length) return; kr.appendChild(box);
  if (right) { right.remove(); if (!tb.children.length) tb.remove(); }
}
function arrangeToolbar(m){
  const tb=[...m.children].find(el=>el.classList && el.classList.contains('toolbar')); if (!tb || tb.dataset.arr) return; tb.dataset.arr='1';
  const kids=[...m.children]; const iTb=kids.indexOf(tb); const firstTw=kids.findIndex(el=>el.classList && (el.classList.contains('tw')||el.querySelector&&el.querySelector('.tw')));
  const tabs=kids.find((el,i)=>i>iTb && (firstTw<0 || i<firstTw) && el.classList && el.classList.contains('tabs')); if (tabs) m.insertBefore(tabs, tb);
  const left=document.createElement('div'); left.className='tbl-left'; const right=document.createElement('div'); right.className='tbl-right';
  const q=m.querySelector('#q'); const bar=q && q.closest('.bar');
  if (bar && bar.parentElement===m) { [...bar.children].filter(el=>(/^(INPUT|SELECT)$/.test(el.tagName) && el.type!=='checkbox') || el.id==='selBar' || el.classList.contains('flt')).forEach(el=>left.appendChild(el)); if (!bar.textContent.trim() && !bar.querySelector('input,select,button')) bar.remove(); else tb.after(bar); }
  const sel=tb.querySelector(':scope > .sel'); if (sel) { const kr=document.createElement('div'); kr.className='kyrow'; kr.appendChild(sel); m.insertBefore(kr, tb);
    m.querySelectorAll('.tokyrow').forEach(el=>{ const pb=el.parentElement; kr.appendChild(el); if (pb && pb.classList.contains('bar') && !pb.children.length && !pb.textContent.trim()) pb.remove(); }); } // kỳ xem: dòng riêng, canh trái (kèm Kỳ bắt đầu nếu có)
  const rank=b=>{ const id=b.id||'', t=(b.textContent||'').trim(); if (id==='recalc') return 10; if (['add','opAdd','nhAdd'].includes(id) || /^\+\s*Thêm/.test(t)) return 9; if (id==='paste' || /^(📋\s*)?Nhập Excel/.test(t)) return 8; if (/^(xl|opXl|nhXl)$/.test(id) || /^(⬇\s*)?Xuất Excel/.test(t)) return 7; if (id==='tblSet') return 6; if (id==='refreshData') return 5; if (id==='lockbtn') return 1; return 0; };
  const items=[...tb.children].filter(x=>x!==sel && !(x.classList && x.classList.contains('sp')));
  items.map((b,i)=>({b,i,r:rank(b)})).sort((a,c)=>a.r-c.r || a.i-c.i).forEach(o=>right.appendChild(o.b));
  tb.innerHTML=''; if (left.childNodes.length) tb.appendChild(left); tb.appendChild(right);
}
// Kỳ dạng mm/yyyy (ô nhập kỳ): '2026-02' ↔ '02/2026'
const kyMY = k => /^\d{4}-\d{2}$/.test(k||'') ? `${k.slice(5,7)}/${k.slice(0,4)}` : (k||'');
function kyParse(inp){ const v=String(inp.value||'').trim(); if (!v) return ''; const m=v.match(/^(\d{1,2})\s*[\/.-]\s*(\d{4})$/); if (!m || +m[1]<1 || +m[1]>12) { toast('Nhập kỳ theo dạng mm/yyyy, ví dụ 02/2026', 3500); inp.value=kyMY(state.settings.startKy||''); return null; } return `${m[2]}-${m[1].padStart(2,'0')}`; }
function decorAll(root){ (root||document).querySelectorAll('button.btn').forEach(decorBtn); }
try { new MutationObserver(ms=>{ for (const m of ms) for (const n of m.addedNodes) { if (n.nodeType!==1) continue; if (n.matches && n.matches('button.btn')) decorBtn(n); else if (n.querySelectorAll) n.querySelectorAll('button.btn').forEach(decorBtn); } }).observe(document.documentElement, {childList:true, subtree:true}); } catch(e){}
