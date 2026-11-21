// ---------- Số âm (…) tô đỏ trên mọi màn hình ----------
const NEG_RE=/^\(\d[\d.,]*%?\)$/;
function markNeg(root){ if (!root || !root.ownerDocument && root!==document) return; const w=document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
  while ((n=w.nextNode())) { const t=n.nodeValue; const s=t.length<40 ? t.trim() : ''; if (s.length>2 && NEG_RE.test(s)) { const e=n.parentElement; if (e && !e.classList.contains('negv') && !e.isContentEditable && e.tagName!=='OPTION') e.classList.add('negv'); } } }
(()=>{ let q=new Set(), raf=0; const run=()=>{ raf=0; const a=[...q]; q=new Set(); a.forEach(x=>{ if (x.isConnected) markNeg(x); }); };
  const mo=new MutationObserver(ms=>{ ms.forEach(m=>{ if (m.type==='characterData') { const e=m.target.parentElement; if (e) { e.classList.remove('negv'); q.add(e); } } else m.addedNodes.forEach(x=>{ if (x.nodeType===1) q.add(x); else if (x.nodeType===3 && x.parentElement) { x.parentElement.classList.remove('negv'); q.add(x.parentElement); } }); }); if (!raf) raf=requestAnimationFrame(run); });
  const start=()=>{ markNeg(document.body); mo.observe(document.body, {childList:true, subtree:true, characterData:true}); };
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start); })();
// Ô sửa trực tiếp: (1.234) → -1.234 khi bắt đầu sửa
document.addEventListener('focusin', e=>{ const t=e.target; if (t && t.isContentEditable) { const v=(t.textContent||'').trim(); if (NEG_RE.test(v)) t.textContent='-'+v.slice(1,-1); t.classList.remove('negv'); }
  else if (t && t.tagName==='INPUT' && NEG_RE.test((t.value||'').trim())) { t.value='-'+t.value.trim().slice(1,-1); } });

