//# Khung giao diện: NAV (menu), chọn năm/kỳ, layoutPage, render (bộ định tuyến màn hình)
// ---------- Giao diện ----------
const NAV = [
  {id:'tongquan', t:'Tổng quan'}, {id:'canhbao', t:'Cảnh báo & kiểm tra'},
  {g:'1 · Dữ liệu nền', c:'#5eead4'}, {id:'d_items', t:'Danh mục hàng'}, {id:'d_opening', t:'Số dư NXT đầu kỳ'}, {id:'d_bom', t:'Định mức'}, {id:'d_subs', t:'NVL thay thế'},
  {g:'2 · Phát sinh hằng ngày', c:'#fcd34d'}, {id:'d_purchases', t:'Mua hàng & Bán hàng'}, {id:'d_orders', t:'Lệnh sản xuất (kế hoạch)'}, {id:'d_issues', t:'Xuất dùng chung'}, {id:'d_costs', t:'Chi phí 622 / 627'},
  {g:'3 · Đề xuất & giá thành', c:'#86efac'}, {id:'luong', t:'Luồng xử lý'}, {id:'kehoach', t:'Đề xuất sản xuất'}, {id:'lsxtt', t:'Lệnh sản xuất thực tế'}, {id:'d_adjustments', t:'Cân đối NVL'}, {id:'giathanh', t:'Giá thành'},
  {g:'4 · Báo cáo', c:'#93c5fd'}, {id:'nxt', t:'Nhập – Xuất – Tồn'}, {id:'banhang', t:'Báo cáo bán hàng theo mặt hàng'}, {id:'nam', t:'Tổng hợp năm'}, {id:'xuatphieu', t:'File tải dữ liệu kế toán'},
  {g:'Hệ thống', c:'#cbd5e1'}, {id:'thietlap', t:'Thiết lập & sao lưu'}, {id:'huongdan', t:'Hướng dẫn'},
];
let navBadge = '';
function renderNav(){
  const n = $('#nav'); try { const pp=pendingProposal(); navBadge = pp.n ? pp.n : ''; } catch(e){ navBadge=''; }
  n.innerHTML = `<h1>Phần mềm Giá thành<small>${esc(state.settings.company||'')}</small></h1>` + NAV.map((x,i)=> x.g ? `<div class="grp"><i></i>${x.g}</div>` : `<button data-v="${x.id}" class="${(i<2?'top ':'')}${view===x.id||(x.id==='d_purchases'&&view==='d_sales')||(x.id==='d_items'&&view==='d_groups')?'act':''}">${x.t}${false&&navBadge?` <span style="background:#f97316;color:#fff;border-radius:10px;padding:0 7px;font-size:var(--fs-s);font-weight:700">${navBadge}</span>`:''}</button>`).join('') + `<div class="grp">Lưu trữ</div><div id="savebadge" style="padding:4px 10px;font-size:var(--fs-s);color:#9fb3d6"></div><div class="grp">Tính toán</div><div id="calcstat" style="padding:4px 10px;font-size:var(--fs-s);color:#9fb3d6">${calcStatHtml()}</div>`;
  n.querySelectorAll('button').forEach(b=>b.onclick=()=>guardEdit(()=>{ view=b.dataset.v; render(); }));
  updateSaveBadge(store._badge||'ok');
}
function topSaveText(){ const st=store._badge; return st==='saving' ? 'Đang lưu…' : st==='err' ? '⚠ Lỗi lưu' : 'Đã tải dữ liệu'; }
function updateSaveBadge(st, msg){
  store._badge = st; { const t=document.getElementById('topsave'); if (t) { t.textContent = st==='saving' ? 'Đang lưu…' : st==='err' ? '⚠ Lỗi lưu' : 'Đã lưu'; t.classList.toggle('bad', st==='err'); } } const el=$('#savebadge'); if(!el) return;
  const kind = store.kind==='cloud' ? 'Đã lưu trên tài khoản Claude (dùng được mọi máy)' : store.kind==='local' ? 'Lưu trong trình duyệt máy này – nhớ Sao lưu định kỳ' : 'Chưa lưu được – chỉ trong phiên này';
  el.innerHTML = (st==='saving' ? '⏳ Đang lưu…' : st==='err' ? `<span style="color:#fca5a5">⚠ Lỗi lưu: ${esc(msg||'')}</span>` : '✔ Đã lưu') + `<br><span style="color:#8ea4cc">${kind}</span>`;
}
function curYear(){ if (!selKy) return workYear(); return (isRange(selKy) ? rangeOf(selKy).from : selKy).slice(0,4); }
function workYear(){ if (!state.settings.workYear) { const ks=allKys(); state.settings.workYear = ks.length ? ks[ks.length-1].slice(0,4) : String(new Date().getFullYear()); } return String(state.settings.workYear); }
function setWorkYear(y){ state.settings.workYear=String(y); store.schedule(); kyByView = {}; kyDefault = null; selKy = String(y); renderedKy = selKy; }
function kySelector(){
  const wy = workYear(); if (!selKy) selKy = wy; const cy = curYear();
  const rng = isRange(selKy) ? rangeOf(selKy) : null; const m = rng ? 'RANGE' : (selKy.length===4 ? 'ALL' : selKy.slice(5,7));
  const nowY = new Date().getFullYear(); const ks=allKys(); const yMin = Math.min(+(state.settings.startKy||`${nowY}`).slice(0,4), ...ks.map(x=>+x.slice(0,4)), nowY, +wy-1, +cy); const yMax = Math.max(nowY+1, ...ks.map(x=>+x.slice(0,4)), +wy, +cy);
  const ys=[]; for (let k=yMin; k<=yMax; k++) ys.push(String(k));
  const monthSel = `<select id="selM"><option value="ALL" ${m==='ALL'?'selected':''}>Cả năm</option>${Array.from({length:12},(_,i)=>{const mm=String(i+1).padStart(2,'0');return `<option value="${mm}" ${mm===m?'selected':''}>Tháng ${i+1}</option>`;}).join('')}<option value="RANGE" ${m==='RANGE'?'selected':''}>Từ ngày – đến ngày</option></select>${m==='RANGE'?`<input type="date" id="selFrom" value="${rng?rng.from:''}" style="padding:4px"> → <input type="date" id="selTo" value="${rng?rng.to:''}" style="padding:4px"><button class="btn s p" id="selGo">Xem</button>`:''}`;
  if (view==='tongquan') return `<div class="sel"><span class="lbl-y">Năm làm việc</span> <select id="selY" class="ysel">${ys.map(v=>`<option ${v===wy?'selected':''}>${v}</option>`).join('')}</select> · Xem: ${monthSel}</div>`;
  return `<div class="sel"><span class="lbl-y">Năm</span><select id="selY2" class="ysel">${ys.map(v=>`<option ${v===cy?'selected':''}>${v}</option>`).join('')}</select> · Xem: ${monthSel}</div>`;
}
function bindKy(){ const sy2=$('#selY2'); if (sy2) sy2.onchange=()=>guardEdit(()=>{ const y=sy2.value; const v=$('#selM').value; selKy = (v==='ALL'||v==='RANGE') ? y : `${y}-${v}`; render(); }); const sy=$('#selY'); if (sy) sy.onchange=()=>guardEdit(()=>{ setWorkYear(sy.value); render(); toast(`Năm làm việc: ${sy.value} – tất cả phân hệ chuyển theo`); }); const rb0=$('#recalc'); if (rb0) rb0.onclick=null; const lb=$('#lockbtn'); if (lb) lb.onclick=lockDialog; const rb=$('#recalc'); if (rb) rb.onclick=runCalc; const f=()=>{ const v=$('#selM').value; if (v==='RANGE') { const r=isRange(selKy)?rangeOf(selKy):null; const wy=curYear(); const nk = r ? selKy : `R:${wy}-01-01:${wy}-12-31`; guardEdit(()=>{ selKy=nk; render(); }); return; } const nk = v==='ALL' ? curYear() : `${curYear()}-${v}`; guardEdit(()=>{ selKy=nk; render(); }); if (editRow) render(); }; $('#selM').onchange=f; const go=$('#selGo'); if (go) go.onclick=()=>{ const a=$('#selFrom').value, b2=$('#selTo').value; if(!a||!b2) return toast('Chọn đủ Từ ngày và Đến ngày'); if (a>b2) return toast('Từ ngày phải ≤ Đến ngày'); guardEdit(()=>{ selKy=`R:${a}:${b2}`; render(); }); }; }
// Kỳ xem riêng cho từng menu: mặc định Cả năm (năm làm việc); đổi kỳ ở menu này không ảnh hưởng menu khác
let kyByView = {}, kyDefault = null, renderedView = null, renderedKy = null;
function kyFallback(){ return kyDefault || workYear(); }
function goView(v){ kyByView[v] = selKy; view = v; }

const REPORT_VIEWS = ['tongquan','luong','canhbao','giathanh','nxt','banhang','nam','xuatphieu'];
const NOKY_VIEWS = ['d_items','d_groups','d_bom','d_subs','d_caps','d_opening','thietlap','huongdan','kehoach'];
function layoutPage(m){
  const top=m.querySelector(':scope > .top'), tb=m.querySelector(':scope > .toolbar'); if (!top || !tb) return;
  let after=top;
  const tabs=[...m.children].find(e=>e.classList.contains('tabs')); if (tabs) { top.after(tabs); after=tabs; }
  const sel=tb.querySelector('.sel'); let kyrow=null;
  if (sel && !NOKY_VIEWS.includes(view)) { kyrow=document.createElement('div'); kyrow.className='kyrow'; kyrow.appendChild(sel); after.after(kyrow); after=kyrow; } else if (sel) sel.remove();
  const left=document.createElement('div'); left.className='tb-left';
  const q=m.querySelector('#q');
  if (q) { const bar=q.closest('.bar'); left.appendChild(q);
    if (bar) { const ak=bar.querySelector('#allky'); if (ak) { const lab=ak.closest('label'); if (kyrow && lab) { lab.lastChild.textContent=' Mọi kỳ'; lab.classList.add('allky'); kyrow.appendChild(lab); } }
      const info=document.createElement('div'); info.className='tb-info'; [...bar.childNodes].forEach(n=>{ if (n.nodeType===1 && (n.classList.contains('pill') || (n.classList.contains('mut') && n.classList.contains('small')))) info.appendChild(n); else left.appendChild(n); }); bar.remove(); if (info.childNodes.length) tb.after(info); } }
  const rank=b=>{ const id=b.id||''; if (/^(add|opAdd|naRow|kadd)$/.test(id)) return 5; if (/^(paste|kpaste)$/.test(id)) return 4; if (/Xuất Excel/.test(b.textContent)) return 3; if (b.classList.contains('js-tbset')) return 2; if (b.classList.contains('js-rf')) return 1; return 0; };
  const btns=[...tb.children].filter(x=>!x.classList.contains('sp')).map((b,i)=>({b,i})).sort((a,c)=>rank(a.b)-rank(c.b)||a.i-c.i).map(x=>x.b);
  if (REPORT_VIEWS.includes(view) && kyrow) { const sp2=document.createElement('span'); sp2.className='sp'; kyrow.appendChild(sp2); btns.forEach(b=>kyrow.appendChild(b)); tb.textContent=''; if (left.childNodes.length) { tb.appendChild(left); after.after(tb); } else tb.remove(); const info=m.querySelector(':scope > .tb-info'); if (info && tb.isConnected) tb.after(info); return; }
  tb.textContent=''; tb.appendChild(left); const sp=document.createElement('span'); sp.className='sp'; tb.appendChild(sp);
  // các nút luôn nằm chung một hàng (Thêm luôn đứng cạnh Nhập Excel); không đủ chỗ thì cả hàng nút xuống dưới ô tìm, canh phải
  const grp=document.createElement('div'); grp.className='tb-btns'; btns.forEach(b=>grp.appendChild(b));
  { const add=grp.querySelector('#add,#opAdd,#naRow,#kadd'); const prev=add && add.previousElementSibling; if (add && prev) { const pair=document.createElement('span'); pair.className='tb-pair'; grp.insertBefore(pair, prev); pair.appendChild(prev); pair.appendChild(add); } }
  tb.appendChild(grp);
  after.after(tb);
  if (btns.length) { const lr=left.getBoundingClientRect(), gr=grp.getBoundingClientRect(); if (gr.top>=lr.bottom-2) tb.classList.add('two'); }
}
function render(){
  renderNav();
  if (!selKy) { kyByView = {}; kyDefault = null; renderedView = null; selKy = workYear(); }
  else if (renderedView !== null && view !== renderedView) {
    kyByView[renderedView] = renderedKy;
    if (selKy === renderedKy) selKy = kyByView[view] || kyFallback();
  }
  const m = $('#main');
  // ô Tìm riêng cho từng màn hình / tab: đổi màn hình hoặc tab thì lấy lại nội dung tìm của màn hình đó
  { const sk = searchKey(m); if (sk!==searchCur) { if (searchCur!=null) searchBy[searchCur]=search; search = searchBy[sk]||''; searchCur = sk; } }
  const R = { tongquan:vTongQuan, luong:vLuong, xuatphieu:vXuatPhieu, kehoach:vKeHoach, lsxtt:vLsxThucTe, nxt:vNXT, giathanh:vGiaThanh, banhang:vBanHang, chiphi:vChiPhi, canhbao:vCanhBao, nam:vNam, taidulieu:vTaiDuLieu, d_items:()=>vGrid('items'), d_groups:()=>vGrid('groups'), d_opening:vOpening, d_bom:()=>vGrid('bom'), d_subs:()=>vGrid('subs'), d_caps:()=>vGrid('caps'), d_purchases:()=>vGrid('purchases'), d_orders:()=>vGrid('orders'), d_adjustments:()=>vGrid('adjustments'), d_issues:()=>vGrid('issues'), d_sales:()=>vGrid('sales'), d_costs:vCosts, thietlap:vThietLap, huongdan:vHuongDan };
  m.innerHTML = ''; (R[view]||vTongQuan)(m); try { layoutPage(m); } catch(e){ console.error(e); } try { enhanceTables(m); } catch(e){ console.error(e); }
  renderedView = view; renderedKy = selKy; kyByView[view] = selKy;
  try { uiState.later(); } catch(e){}
  document.querySelectorAll('.js-tbset').forEach(b=>{ b.style.display = m.querySelector('.tw > table') ? '' : 'none'; });
}

