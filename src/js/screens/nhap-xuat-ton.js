// ---- NXT ----
// Ô tìm kiếm: lọc dòng theo chữ gõ vào; chờ gõ xong (0,35 giây) mới lọc, giữ nguyên vị trí con trỏ – không bị đảo chữ khi gõ tiếng Việt
// Tìm kiếm: không phân biệt hoa/thường và dấu tiếng Việt; nhiều từ = phải có đủ các từ; ngày gõ dạng 05/10, 5/10, 05/10/2026 hoặc 2026-10-05 đều được
const normQ = v => String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
const dateForms = d => { if (!/^\d{4}-\d{2}-\d{2}$/.test(d||'')) return ''; const [y,m,dd]=d.split('-'); return `${d} ${dd}/${m}/${y} ${+dd}/${+m}/${y} ${dd}/${m} ${+dd}/${+m}`; };
const searchText = vals => vals.map(v=>{ const t=String(v??''); return t+' '+dateForms(t); }).join(' ');
// Tìm: từ gõ có dấu → so khớp đúng dấu ("trứng" không khớp "Trung", "gà" không khớp "ngày"); từ gõ không dấu → khớp bỏ dấu
const lowNFC = v => String(v??'').normalize('NFC').toLowerCase();
const matchQ = (q, text) => { const words=lowNFC(q).trim().split(/\s+/).filter(Boolean); if(!words.length) return true; const tA=lowNFC(text); let tF=null; return words.every(w=>{ const f=normQ(w); if (f!==w) return tA.includes(w); tF=tF??normQ(text); return tF.includes(f); }); };
function bindSearch(){ const q=$('#q'); if(!q) return; let comp=false;
  const run=()=>{ clearTimeout(bindSearch.t); bindSearch.t=setTimeout(()=>{ const cur=$('#q'); if(!cur || document.activeElement!==cur) { search=cur?cur.value:search; render(); return; } const pos=cur.selectionStart, end=cur.selectionEnd; search=cur.value; render(); const n=$('#q'); if(n){ n.focus(); try{ n.setSelectionRange(pos,end); }catch(e){} } }, 350); };
  q.addEventListener('compositionstart',()=>{ comp=true; }); q.addEventListener('compositionend',()=>{ comp=false; run(); });
  q.addEventListener('input',()=>{ if(!comp) run(); });
  q.addEventListener('keydown',e=>{ if(e.key==='Enter'){ clearTimeout(bindSearch.t); const pos=q.selectionStart; search=q.value; render(); const n=$('#q'); if(n){ n.focus(); n.setSelectionRange(pos,pos); } } });
}
const riskLbl = r => ({'RỦI RO CAO':'Rủi ro cao','CẢNH BÁO':'Cảnh báo'})[r] || (r||'');
function vNXT(m){
  const p=P(); if(!p) return noData(m);
  const nhom = m.dataset.nhom || '';
  const khoAll=[...new Set(p.nxt.map(x=>x.kho||''))].sort(); const khoSet=new Set((m.dataset.khoSel||'').split('|').filter(k=>khoAll.includes(k))); const khoOn = khoSet.size && khoSet.size<khoAll.length;
  const coPS = x => [x.openSL,x.openTT,x.nhapSL,x.nhapTT,x.xuatSL,x.xuatTT,x.closeSL,x.closeTT].some(v=>Math.abs(num(v))>1e-9); // mã không tồn, không nhập, không xuất trong kỳ → không hiện
  const rows = p.nxt.filter(x=> coPS(x) && (!nhom || x.nhom===nhom) && (!khoOn || khoSet.has(x.kho||'')) && (!search || matchQ(search, [x.ma,x.ten,x.nhom,x.kho].join(' '))));
  const tab = m.dataset.nxtTab==='ct' ? 'ct' : 'th';
  m.innerHTML = head(`Nhập – Xuất – Tồn`, `<button class="btn" id="xl">⬇ Xuất Excel</button>`) +
  `<div class="tabs"><button data-nxtt="th" class="${tab==='th'?'act':''}">${icon('box')}Tổng hợp nhập xuất tồn</button><button data-nxtt="ct" class="${tab==='ct'?'act':''}">${icon('folder')}Chi tiết nhập xuất tồn</button></div>` +
  `<div class="bar"><input type="text" id="q" placeholder="Tìm mã / tên" value="${esc(search)}" style="width:220px"><select id="nh"><option value="">Tất cả nhóm</option>${NHOM.map(n=>`<option ${n===nhom?'selected':''}>${n}</option>`).join('')}</select><button class="btn flt" id="khoSel" title="Chọn một hoặc nhiều kho để xem">Kho: ${khoOn?esc([...khoSet].map(k=>k||'(trống)').join(', ')):'Tất cả'} ▾</button>${tab==='th'?`<a href="#" id="goRR" class="small">ⓘ Ý nghĩa Phân loại / Trạng thái rủi ro</a>`:''}</div>` +
  (tab==='ct' ? nxtChiTietHtml(rows) : table([
    {t:'Kho',f:x=>x.kho},{t:'Mã',raw:1,f:x=>`<a href="#" class="malink" title="Xem chi tiết nhập – xuất – tồn">${esc(x.ma)}</a>`},{t:'Mặt hàng',f:x=>x.ten},{t:'Nhóm',f:x=>x.nhom},{t:'ĐVT',f:x=>x.dvt},{t:'Giá vốn',n:1,f:x=>x.gv},
    {t:'Tồn đầu SL',n:1,d:2,f:x=>x.openSL},{t:'Tồn đầu TT',n:1,f:x=>x.openTT,sum:1},{t:'Nhập SL',n:1,d:2,f:x=>x.nhapSL},{t:'Nhập TT',n:1,f:x=>x.nhapTT,sum:1},{t:'Xuất SL',n:1,d:2,f:x=>x.xuatSL},{t:'Xuất TT',n:1,f:x=>x.xuatTT,sum:1},{t:'Tồn cuối SL',n:1,d:2,f:x=>x.closeSL},{t:'Tồn cuối TT',n:1,f:x=>x.closeTT,sum:1},
    {t:'Đơn giá BQ mua (NVL)',n:1,f:x=>x.pBQ==null?'':x.pBQ,fmt:v=>v===''?'':fmtN(v)},{t:'NVL cần lấy đủ 15 ngày',n:1,d:2,f:x=>x.can15||0},{t:'BQ/ngày',n:1,d:2,f:x=>x.bq},{t:'Số ngày còn dùng',n:1,f:x=>x.days==null?'':x.days,fmt:v=>v===''?'':fmtN(v,1)},{t:'Phân loại',raw:1,f:x=>x.risk?`<span class="pill nfs ${x.risk==='RỦI RO CAO'?'bad':x.risk==='CẢNH BÁO'?'warn':'ok'}">${esc(riskLbl(x.risk))}</span>`:''},{t:'Trạng thái rủi ro',f:x=>x.status}
  ], rows, {total:true, freeze:3, click:1}));
  m.querySelectorAll('[data-nxtt]').forEach(b=>b.onclick=()=>{ m.dataset.nxtTab=b.dataset.nxtt; render(); });
  bindKy(); bindSearch(); $('#nh').onchange=e=>{ m.dataset.nhom=e.target.value; render(); };
  if (tab==='ct') { bindCtLinks(m, ()=>{ view='nxt'; render(); }); }
  else m.querySelectorAll('.tw > table > tbody > tr[data-i]').forEach(tr=>{ tr.title='Bấm để xem chi tiết nhập – xuất – tồn'; tr.onclick=e=>{ if (e.target.closest('a.malink')) e.preventDefault(); else if (e.target.closest('button,a,input')) return; const x=rows[+tr.dataset.i]; if (x) theKho(x.ma); }; });
  $('#khoSel').onclick=e=>{ e.stopPropagation(); closeFilter(); const cnt={}; p.nxt.forEach(x=>{ const k=x.kho||''; cnt[k]=(cnt[k]||0)+1; }); const sel = khoOn ? khoSet : new Set(khoAll);
    const pop=document.createElement('div'); pop.className='xfpop'; pop.id='xfpop'; pop.style.width='240px';
    pop.innerHTML=`<div class="small" style="font-weight:600;margin-bottom:4px">Chọn kho xem báo cáo</div><div class="xfrow small"><a href="#" data-all>Chọn tất cả</a> · <a href="#" data-none>Bỏ chọn</a></div><div class="xflist">${khoAll.map(k=>`<label><input type="checkbox" value="${esc(k)}" ${sel.has(k)?'checked':''}> ${k?esc(k):'<i class="mut">(trống)</i>'}</label>`).join('')}</div><div class="xfrow" style="justify-content:flex-end"><button class="btn s p" data-ok>Đóng</button></div>`;
    document.body.appendChild(pop); const r=e.currentTarget.getBoundingClientRect(); pop.style.top=(r.bottom+window.scrollY+4)+'px'; pop.style.left=Math.min(r.left+window.scrollX, window.innerWidth-260)+'px';
    // tích / bỏ tích là áp dụng ngay (không cần bấm Xem)
    const apply=()=>{ const v=[...pop.querySelectorAll('.xflist input:checked')].map(i=>i.value); m.dataset.khoSel = (!v.length || v.length===khoAll.length) ? '' : v.join('|'); render(); };
    pop.querySelectorAll('.xflist input').forEach(i=>i.onchange=apply);
    pop.querySelector('[data-all]').onclick=ev=>{ ev.preventDefault(); pop.querySelectorAll('.xflist input').forEach(i=>i.checked=true); apply(); };
    pop.querySelector('[data-none]').onclick=ev=>{ ev.preventDefault(); pop.querySelectorAll('.xflist input').forEach(i=>i.checked=false); apply(); };
    pop.querySelector('[data-ok]').onclick=()=>{ apply(); closeFilter(); };
    pop.onclick=ev=>ev.stopPropagation(); setTimeout(()=>document.addEventListener('click', closeFilter, {once:true}),0); }; const gr=$('#goRR'); if (gr) gr.onclick=e=>{ e.preventDefault(); view='huongdan'; render(); setTimeout(()=>{ const b=[...document.querySelectorAll('#main .box h3')].find(h=>h.textContent.startsWith('Trạng thái rủi ro')); if (b) b.scrollIntoView({block:'start'}); }, 50); };
  $('#xl').onclick=()=>(tab==='ct' && nxtChiTietRows(rows).length>1500) ? exportSheet(`NXT_ChiTiet_${String(selKy).replace(/[:\/]/g,'-')}.xlsx`, 'Chi tiet NXT', nxtChiTietRows(rows).map(tkJson)) : exportTable(mainTable(), tab==='ct' ? `NXT_ChiTiet_${String(selKy).replace(/[:\/]/g,'-')}.xlsx` : `NXT_${String(selKy).replace(/[:\/]/g,'-')}.xlsx`, tab==='ct'?'Chi tiet NXT':'NXT');
}
