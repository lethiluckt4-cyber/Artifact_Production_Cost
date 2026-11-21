// ---------- Giao diện ----------
const NAV = [
  {id:'tongquan', t:'Tổng quan'}, {id:'canhbao', t:'Cảnh báo & kiểm tra'},
  {g:'1 · Dữ liệu nền', c:'#5eead4'}, {id:'d_items', t:'Danh mục hàng'}, {id:'d_opening', t:'Số dư NXT đầu kỳ'}, {id:'d_bom', t:'Định mức'}, {id:'d_subs', t:'NVL thay thế'},
  {g:'2 · Phát sinh hằng ngày', c:'#fcd34d'}, {id:'d_purchases', t:'Mua hàng & Bán hàng'}, {id:'d_issues', t:'Xuất dùng chung'}, {id:'d_costs', t:'Chi phí 622/627'},
  {g:'3 · Kế hoạch & giá thành', c:'#86efac'}, {id:'luong', t:'Luồng xử lý'}, {id:'kehoach', t:'Đề xuất sản xuất'}, {id:'d_orders', t:'Lệnh sản xuất'}, {id:'d_adjustments', t:'Cân đối NVL'}, {id:'giathanh', t:'Giá thành'},
  {g:'4 · Báo cáo', c:'#93c5fd'}, {id:'nxt', t:'Nhập – Xuất – Tồn'}, {id:'banhang', t:'Tổng hợp bán hàng theo mặt hàng'}, {id:'nam', t:'Tổng hợp năm'}, {id:'xuatphieu', t:'File tải dữ liệu kế toán'},
  {g:'Hệ thống', c:'#cbd5e1'}, {id:'thietlap', t:'Thiết lập & sao lưu'}, {id:'huongdan', t:'Hướng dẫn'},
];
let navBadge = '';
function renderNav(){
  const n = $('#nav'); navBadge='';
  n.innerHTML = `<h1>Phần mềm Giá thành<small>${esc(state.settings.company||'')}</small></h1>` + NAV.map((x,i)=> x.g ? `<div class="grp"><i></i>${x.g}</div>` : `<button data-v="${x.id}" class="${(i<2?'top ':'')}${view===x.id||(x.id==='d_purchases'&&view==='d_sales')||(x.id==='d_items'&&view==='d_nhom')?'act':''}">${x.t}${x.id==='kehoach'&&navBadge?` <span style="background:#f97316;color:#fff;border-radius:10px;padding:0 7px;font-size:var(--fs-s);font-weight:700">${navBadge}</span>`:''}</button>`).join('') + `<div class="grp">Lưu trữ</div><div id="savebadge" style="padding:4px 10px;font-size:var(--fs-s);color:#9fb3d6"></div><div class="grp">Tính toán</div><div id="calcstat" style="padding:4px 10px;font-size:var(--fs-s);color:#9fb3d6">${calcStatHtml()}</div>`;
  n.querySelectorAll('button').forEach(b=>b.onclick=()=>guardEdit(()=>{ view=b.dataset.v; render(); }));
  updateSaveBadge(store._badge||'ok');
}
function updateSaveBadge(st, msg){
  store._badge = st; const el=$('#savebadge'); if(!el) return;
  if (store.kind==='offline') { el.innerHTML = `<span style="color:#fca5a5">⚠ Chưa kết nối kho dữ liệu</span><br><span style="color:#8ea4cc">Đang xem bản sao trên máy – chưa lưu được</span>`; return; }
  const kind = store.kind==='cloud' ? 'Đã lưu trên tài khoản Claude (dùng được mọi máy)' : store.kind==='local' ? 'Lưu trong trình duyệt máy này – nhớ Sao lưu định kỳ' : 'Chưa lưu được – chỉ trong phiên này';
  el.innerHTML = (st==='saving' ? '⏳ Đang lưu…' : st==='err' ? `<span style="color:#fca5a5">⚠ Lỗi lưu: ${esc(msg||'')}</span>` : '✔ Đã lưu') + `<br><span style="color:#8ea4cc">${kind}</span>`;
}
function workYear(){ if (!state.settings.workYear) { const ks=allKys(); state.settings.workYear = ks.length ? ks[ks.length-1].slice(0,4) : String(new Date().getFullYear()); } return String(state.settings.workYear); }
function setWorkYear(y){ state.settings.workYear=String(y); store.schedule(); selKy = String(y); Object.keys(kyByMenu).forEach(k=>delete kyByMenu[k]); }
function kySelector(){
  const wy = workYear(); if (!selKy || (!isRange(selKy) && selKy.slice(0,4)!==wy)) selKy = wy;
  const rng = isRange(selKy) ? rangeOf(selKy) : null; const m = rng ? 'RANGE' : (selKy.length===4 ? 'ALL' : selKy.slice(5,7));
  const nowY = new Date().getFullYear(); const ks=allKys(); const yMin = Math.min(+(state.settings.startKy||`${nowY}`).slice(0,4), ...ks.map(x=>+x.slice(0,4)), nowY); const yMax = Math.max(nowY+1, ...ks.map(x=>+x.slice(0,4)), +wy);
  const ys=[]; for (let k=yMin; k<=yMax; k++) ys.push(String(k));
  const monthSel = `<select id="selM"><option value="ALL" ${m==='ALL'?'selected':''}>Cả năm</option>${Array.from({length:12},(_,i)=>{const mm=String(i+1).padStart(2,'0');return `<option value="${mm}" ${mm===m?'selected':''}>Tháng ${i+1}</option>`;}).join('')}<option value="RANGE" ${m==='RANGE'?'selected':''}>Từ ngày – đến ngày</option></select>${m==='RANGE'?`<input type="date" id="selFrom" value="${rng?rng.from:''}" style="padding:4px"> → <input type="date" id="selTo" value="${rng?rng.to:''}" style="padding:4px"><button class="btn s p" id="selGo">Xem</button>`:''}`;
  if (view==='tongquan') return `<div class="sel"><span class="kylbl">Năm làm việc:</span> <select id="selY">${ys.map(v=>`<option ${v===wy?'selected':''}>${v}</option>`).join('')}</select> · Xem: ${monthSel}</div>`;
  return `<div class="sel"><span class="kylbl">Năm <b>${wy}</b></span> · Xem: ${monthSel}</div>`;
}
function bindKy(){ const sy=$('#selY'); if (sy) sy.onchange=()=>guardEdit(()=>{ setWorkYear(sy.value); render(); toast(`Năm làm việc: ${sy.value} – tất cả phân hệ chuyển theo`); }); const rb0=$('#recalc'); if (rb0) rb0.onclick=null; const lb=$('#lockbtn'); if (lb) lb.onclick=lockDialog; const ox=$('#opXl'); if (ox) ox.onclick=()=>{ const t=$('#main .tw > table'); if (t) exportVisibleTable(t); }; const rf=$('#refreshData'); if (rf) rf.onclick=()=>guardEdit(refreshData); const ts=$('#tblSet'); if (ts) ts.onclick=e=>{ e.stopPropagation(); const t=$('#main table[data-grid]') || $('#main .tw > table'); if (!t || !t.dataset.tkey) return toast('Trang này chưa có bảng dữ liệu'); openTblSet(t); }; const rb=$('#recalc'); if (rb) rb.onclick=runCalc; const f=()=>{ const v=$('#selM').value; if (v==='RANGE') { const r=isRange(selKy)?rangeOf(selKy):null; const wy=workYear(); const nk = r ? selKy : `R:${wy}-01-01:${wy}-12-31`; guardEdit(()=>{ selKy=nk; render(); }); return; } const nk = v==='ALL' ? workYear() : `${workYear()}-${v}`; guardEdit(()=>{ selKy=nk; render(); }); if (editRow) render(); }; if ($('#selM')) $('#selM').onchange=f; const go=$('#selGo'); if (go) go.onclick=()=>{ const a=$('#selFrom').value, b2=$('#selTo').value; if(!a||!b2) return toast('Chọn đủ Từ ngày và Đến ngày'); if (a>b2) return toast('Từ ngày phải ≤ Đến ngày'); guardEdit(()=>{ selKy=`R:${a}:${b2}`; render(); }); }; }
// Kỳ xem riêng cho từng menu: mặc định "Cả năm"; đổi kỳ ở menu này không ảnh hưởng menu khác (tab trong cùng menu dùng chung)
let lastMenu=null; const kyByMenu={};
const menuOf = v => ({d_sales:'d_purchases', d_nhom:'d_items', thamso:'canhbao', d_cal:'thietlap', d_pb:'thietlap'})[v] || v;
// Ô tìm riêng cho từng màn hình / tab: giá trị gõ ở tab nào chỉ hiện ở tab đó
const searchBy={}; let lastSK=null;
const SK_TAB={giathanh:['tab','lenh'], kehoach:['ktab','kh'], xuatphieu:['ptab','xk'], canhbao:['cbt','kq'], thietlap:['tlt','tl'], d_adjustments:['cdt','ct'], nxt:['nxtTab','th']};
function searchKey(){ if (view==='thamso') return 'canhbao|ng'; if (view==='d_cal') return 'thietlap|cal'; if (view==='d_pb') return 'thietlap|pb'; const t=SK_TAB[view]; const m=$('#main'); return view+'|'+(t ? ((m&&m.dataset[t[0]])||t[1]) : ''); }
function render(){
  { const sk=searchKey(); if (sk!==lastSK) { if (lastSK==null || search===(searchBy[lastSK]||'')) search=(lastSK==null && search) ? search : (searchBy[sk]||''); lastSK=sk; } }
  const mn=menuOf(view); if (mn!==lastMenu) { if (lastMenu!=null && selKy) kyByMenu[lastMenu]=selKy; selKy = kyByMenu[mn] || workYear(); lastMenu=mn; } else if (selKy) kyByMenu[mn]=selKy;
  renderNav();
  if (!selKy) selKy = workYear();
  const m = $('#main');
  const R = { luong:vLuong, xuatphieu:vXuatPhieu, kehoach:vKeHoach, thamso:m=>{ view='canhbao'; m.dataset.cbt='ng'; renderNav(); vThamSo(m); }, canhbao:m=>m.dataset.cbt==='ng'?vThamSo(m):vCanhBao(m), d_cal:m=>{ view='thietlap'; m.dataset.tlt='cal'; renderNav(); vSetup(m); }, d_pb:m=>{ view='thietlap'; m.dataset.tlt='pb'; renderNav(); vSetup(m); }, tongquan:vTongQuan, nxt:vNXT, giathanh:vGiaThanh, banhang:vBanHang, chiphi:vChiPhi,  nam:vNam, taidulieu:vTaiDuLieu, d_items:()=>vGrid('items'), d_nhom:vNhomHang, d_opening:vOpening, d_bom:()=>vGrid('bom'), d_subs:()=>vGrid('subs'), d_caps:()=>vGrid('caps'), d_purchases:()=>vGrid('purchases'), d_orders:()=>vGrid('orders'), d_adjustments:m=>m.dataset.cdt==='th'?vCdTH(m):vGrid('adjustments'), d_issues:()=>vGrid('issues'), d_sales:()=>vGrid('sales'), d_costs:vCosts, thietlap:vSetup, huongdan:vHuongDan };
  m.innerHTML = '';
  try { (R[view]||vTongQuan)(m); }
  catch(e){ console.error(e); m.innerHTML = `<div class="note" style="background:#fef2f2;border:1px solid #fca5a5;color:#991b1b"><b>⚠ Màn hình này bị lỗi khi hiển thị.</b> Dữ liệu vẫn còn nguyên (${state.items.length} mã hàng, ${state.purchases.length} dòng mua, ${state.sales.length} dòng bán, ${state.orders.length} lệnh SX). Hãy chọn màn hình khác và chụp khung này gửi lại để sửa.<br><small>${esc(e&&e.message||e)}</small></div>`; }
  lastSK=searchKey(); searchBy[lastSK]=search;
  try { arrangeToolbar(m); } catch(e){ console.error(e); }
  try { enhanceTables(m); } catch(e){ console.error(e); }
  try { liftActions(m); } catch(e){ console.error(e); }
  try { fitTables(m); } catch(e){ console.error(e); }
  if (window.__booted) setTimeout(saveUI, 0);
  if (store.kind==='offline') {
    const has = state.items.length || state.purchases.length || state.orders.length;
    const b = document.createElement('div'); b.className='note'; b.id='offlineBar';
    b.style.cssText='background:#fef2f2;border:1px solid #fca5a5;color:#991b1b;margin-bottom:10px';
    b.innerHTML = `<b>⚠ Chưa kết nối được kho dữ liệu trên tài khoản Claude.</b> Dữ liệu của bạn <b>vẫn còn nguyên</b> trên tài khoản – chỉ là lần mở này trình duyệt chưa tải được. `+
      (has ? 'Đang hiển thị <b>bản sao lần trước trên máy này (chỉ xem)</b> – mọi chỉnh sửa lúc này sẽ <b>không được lưu</b>. ' : '')+
      `Hãy bấm <b>Thử kết nối lại</b>; nếu vẫn không được, tải lại trang (F5) và kiểm tra đã đăng nhập Claude.<br><small style="color:#7f1d1d">Chi tiết: ${esc(store.lastErr||'')}</small> `+
      `<button class="btn p" id="reconBtn" style="margin-left:8px">↻ Thử kết nối lại</button>`;
    m.prepend(b); $('#reconBtn').onclick = async ()=>{ $('#reconBtn').disabled=true; $('#reconBtn').textContent='Đang kết nối…'; await store.reconnect(); };
  }
}
function head(title, extra=''){ const editNote = (editRow ? `<span class="pill warn" style="font-size:var(--fs-s)">✎ Đang sửa – nhớ bấm Lưu</span>` : '') + ''; const lkNow = selKy && !isRange(selKy) && selKy.length===7 && isLocked(selKy); const lk = `<button class="btn" id="lockbtn" title="Chọn tháng để khóa / mở khóa" style="${lkNow?'background:#fee2e2;border-color:#fca5a5;color:#991b1b':''}">${lkNow?'🔒 Tháng này đã khóa':'🔒 Khóa kỳ'}</button>`; const dataView = /^d_/.test(view) || view==='thietlap'; const noPeriod = ['d_items','d_nhom'].includes(view); const tb = dataView ? `<button class="btn" id="refreshData" title="Tải lại bản dữ liệu mới nhất đang lưu trên tài khoản (khi người khác vừa nhập, hoặc mở trên máy khác)">Làm mới dữ liệu</button><button class="btn" id="tblSet" title="Ẩn/hiện cột, mật độ dòng của bảng">Thiết lập bảng</button>` : ''; return `<div class="top"><h2>${title}</h2>${editNote}</div><div class="toolbar">${extra}${tb}${view==='tongquan'?lk:''}${view==='giathanh'?`<button class="btn ${calcDirty?'p':''}" id="recalc" title="Chạy tuần tự từng tháng đến kỳ đang chọn và kiểm tra giá xuất kho" style="${calcDirty?'box-shadow:0 0 0 3px #fde68a':''}">▶ Tính giá thành${calcDirty?' (có dữ liệu mới)':''}</button>`:''}<span class="sp"></span>${noPeriod?'':kySelector()}</div>`; }
function P(){ const c=calc(); if (isRange(selKy)) return rangePeriod(c, selKy); if (selKy.length===4) return yearPeriod(c, selKy); return c.periods[selKy] || null; }
function rangePeriod(c, key){
  c.ranges = c.ranges||{}; if (c.ranges[key]) return c.ranges[key];
  const {from,to}=rangeOf(key); const kys=c.list.filter(k=>k>=from.slice(0,7) && k<=to.slice(0,7)); if (!kys.length) return null;
  const items=itemMap(); const Y={ky:key, open:{}, close:{}, nhap:{}, xuat:{}, giaVon:{}, nhapSX:{}, xuatSX:{}, xuatBan:{}, xuatChung:{}, orders:[], lines:[], sales:[], cost:{}, rates:{r622:0,r627:0}, sum621:0,sum622:0,sum627:0,sum154:0, slSX:0, doanhSo:0, lai:0, nxt:[], isRange:true};
  const openSL={}, openTT={}, inSL={}, inTT={}, outSL={}, outTT={}; const add=(o,k,v)=>{o[k]=(o[k]||0)+v;};
  const first=c.periods[kys[0]];
  for (const ma in first.open) { openSL[ma]=first.open[ma].sl; openTT[ma]=first.open[ma].tt; }
  let days=0;
  kys.forEach(k=>{ const p=c.periods[k]; const gv=ma=>p.giaVon[ma]||0;
    const ev=[]; state.purchases.filter(r=>kyOf(r.ngayNhap)===k).forEach(r=>ev.push({d:r.ngayNhap, ma:r.ma, sl:num(r.sl), tt:num(r.tt), kind:'in'}));
    p.orders.forEach(o=>{ if (kyOf(o.ngaySX)===k) ev.push({d:o.ngaySX, ma:o.maTP, sl:o.slTH, tt:o.c154, kind:'in', sx:true}); });
    p.lines.forEach(l=>ev.push({d:l.ngayXuatNVL, ma:l.maVT, sl:l.tong, tt:l.tong*gv(l.maVT), kind:'out', sx:true}));
    state.issues.filter(r=>kyOf(r.ngay)===k).forEach(r=>ev.push({d:r.ngay, ma:r.maVT, sl:num(r.sl), tt:num(r.sl)*gv(r.maVT), kind:'out', chung:true}));
    state.sales.filter(r=>kyOf(r.ngay)===k).forEach(r=>ev.push({d:r.ngay, ma:r.ma, sl:num(r.sl), tt:num(r.sl)*gv(r.ma), kind:'out', ban:true}));
    ev.forEach(e=>{ if (e.d<from) { if (e.kind==='in'){ add(openSL,e.ma,e.sl); add(openTT,e.ma,e.tt); } else { add(openSL,e.ma,-e.sl); add(openTT,e.ma,-e.tt); } } else if (e.d<=to) { if (e.kind==='in'){ add(inSL,e.ma,e.sl); add(inTT,e.ma,e.tt); if(e.sx) add(Y.nhapSX,e.ma,e.sl); } else { add(outSL,e.ma,e.sl); add(outTT,e.ma,e.tt); if(e.sx) add(Y.xuatSX,e.ma,e.sl); if(e.ban) add(Y.xuatBan,e.ma,e.sl); if(e.chung) add(Y.xuatChung,e.ma,e.sl); } } });
    Y.orders.push(...p.orders.filter(o=>o.ngayXuatNVL>=from && o.ngayXuatNVL<=to)); Y.lines.push(...p.lines.filter(l=>l.ngayXuatNVL>=from && l.ngayXuatNVL<=to)); Y.sales.push(...p.sales.filter(s=>s.ngay>=from && s.ngay<=to));
    for (const ma in p.giaVon) Y.giaVon[ma]=p.giaVon[ma];
    const dFrom = k===from.slice(0,7) ? +from.slice(8,10) : 1; const dTo = k===to.slice(0,7) ? +to.slice(8,10) : Math.min(daysInMonth(k), p.daysData||daysInMonth(k)); days += Math.max(0, dTo-dFrom+1);
  });
  Y.sum621=sum(Y.orders,o=>o.c621); Y.sum622=sum(Y.orders,o=>o.c622); Y.sum627=sum(Y.orders,o=>o.c627); Y.sum154=sum(Y.orders,o=>o.c154); Y.slSX=sum(Y.orders,o=>o.slTH); Y.doanhSo=sum(Y.sales,s=>s.ds); Y.lai=sum(Y.sales,s=>s.lai); Y.rates.r622=Y.sum621?Y.sum622/Y.sum621:0; Y.rates.r627=Y.sum621?Y.sum627/Y.sum621:0;
  const codes=new Set([...Object.keys(openSL),...Object.keys(inSL),...Object.keys(outSL),...Object.keys(items)]);
  codes.forEach(ma=>{ const o=openSL[ma]||0, ot=openTT[ma]||0, i=inSL[ma]||0, it2=inTT[ma]||0, x=outSL[ma]||0, xt=outTT[ma]||0; const cs=round(o+i-x,6); const ct = cs===0?0:Math.round(ot+it2-xt); Y.open[ma]={sl:o,tt:ot}; Y.nhap[ma]={sl:i,tt:it2}; Y.xuat[ma]=x; Y.close[ma]={sl:cs,tt:ct}; const it=items[ma]||{ma,ten:'(chưa có trong danh mục)',nhom:'',dvt:'',kho:''}; const isTP=isFinal(it); const bq=(isTP?(Y.xuatBan[ma]||0):isProd(it)?((Y.nhapSX[ma]||0)):((Y.xuatSX[ma]||0)+(Y.xuatChung[ma]||0)))/Math.max(1,days); const dys=bq>0?Math.max(0,cs/bq):null; const gv=Y.giaVon[ma]||0;
    if (o||i||x||cs) Y.nxt.push({ma, ten:it.ten, nhom:it.nhom, dvt:it.dvt, kho:it.kho, gv, openSL:o, openTT:ot, nhapSL:i, nhapTT:it2, xuatSL:x, xuatTT:xt, closeSL:cs, closeTT:ct, bq, days:dys, canLay5: (!isProd(it)&&bq>0)?Math.max(0,bq*15-cs):0, can15:(!isProd(it)&&bq>0)?Math.max(0,bq*15-cs):0, pBQ:null, risk: cs<0?'RỦI RO CAO':'', status: cs<0?'Âm kho – xử lý ngay':''}); });
  Y.nxt.sort((a,b)=>((NHOM_ORDER[a.nhom]??9)-(NHOM_ORDER[b.nhom]??9))||a.ma.localeCompare(b.ma)); Y.tonCuoi=sum(Y.nxt,x=>x.closeTT); Y.daysData=days;
  c.ranges[key]=Y; return Y;
}
function yearPeriod(c, y){
  if (c.years && c.years[y]) return c.years[y];
  const kys = c.list.filter(k=>k.startsWith(y)); if (!kys.length) return null;
  const first=c.periods[kys[0]], last=c.periods[kys[kys.length-1]];
  const Y = {ky:y, open:first.open, close:last.close, nhap:{}, xuat:{}, giaVon:{}, nhapSX:{}, xuatSX:{}, xuatBan:{}, xuatChung:{}, orders:[], lines:[], sales:[], cost:{}, rates:{r622:0,r627:0}, sum621:0, sum622:0, sum627:0, sum154:0, slSX:0, doanhSo:0, lai:0, nxt:[], tonCuoi:last.tonCuoi, isYear:true};
  const add=(o,ma,v)=>{o[ma]=(o[ma]||0)+v;};
  let days=0;
  kys.forEach(k=>{ const p=c.periods[k]; days+=(p.daysData||daysInMonth(k));
    for (const ma in p.nhap){ const x=Y.nhap[ma]||(Y.nhap[ma]={sl:0,tt:0}); x.sl+=p.nhap[ma].sl; x.tt+=p.nhap[ma].tt; }
    for (const ma in p.nhapSX) add(Y.nhapSX,ma,p.nhapSX[ma].sl); for (const ma in p.xuat) add(Y.xuat,ma,p.xuat[ma]); for (const ma in p.xuatSX) add(Y.xuatSX,ma,p.xuatSX[ma]); for (const ma in p.xuatBan) add(Y.xuatBan,ma,p.xuatBan[ma]); for (const ma in p.xuatChung) add(Y.xuatChung,ma,p.xuatChung[ma]);
    Y.orders.push(...p.orders); Y.lines.push(...p.lines); Y.sales.push(...p.sales);
    Y.sum621+=p.sum621; Y.sum622+=p.sum622; Y.sum627+=p.sum627; Y.sum154+=p.sum154; Y.slSX+=p.slSX; Y.doanhSo+=p.doanhSo; Y.lai+=p.lai;
    costF().forEach(f=>Y.cost[f]=(Y.cost[f]||0)+num((p.cost||{})[f]));
  });
  Y.rates.r622 = Y.sum621 ? Y.sum622/Y.sum621 : 0; Y.rates.r627 = Y.sum621 ? Y.sum627/Y.sum621 : 0;
  const items=itemMap(); const codes=new Set([...Object.keys(Y.open),...Object.keys(Y.close),...Object.keys(Y.nhap),...Object.keys(Y.xuat)]);
  codes.forEach(ma=>{ const o=Y.open[ma]||{sl:0,tt:0}, n=Y.nhap[ma]||{sl:0,tt:0}, cl=Y.close[ma]||{sl:0,tt:0}, xs=Y.xuat[ma]||0; const xt=o.tt+n.tt-cl.tt; const gv=(o.sl+n.sl)?(o.tt+n.tt)/(o.sl+n.sl):0; Y.giaVon[ma]=gv;
    const it=items[ma]||{ma,ten:'(chưa có trong danh mục)',nhom:'',dvt:'',kho:''}; const isTP=isFinal(it); const bq=(isTP?(Y.xuatBan[ma]||0):isProd(it)?(Y.nhapSX[ma]||0):((Y.xuatSX[ma]||0)+(Y.xuatChung[ma]||0)))/Math.max(1,days); const dys=bq>0?Math.max(0,cl.sl/bq):null; const lastRow=last.nxt.find(x=>x.ma===ma);
    Y.nxt.push({ma, ten:it.ten, nhom:it.nhom, dvt:it.dvt, kho:it.kho, gv, openSL:o.sl, openTT:o.tt, nhapSL:n.sl, nhapTT:n.tt, xuatSL:xs, xuatTT:xt, closeSL:cl.sl, closeTT:cl.tt, bq, days:dys, canLay5:lastRow?lastRow.canLay5:0, can15:lastRow?lastRow.can15:0, pBQ:lastRow?lastRow.pBQ:null, risk:lastRow?lastRow.risk:'', status:lastRow?lastRow.status:''}); });
  Y.nxt.sort((a,b)=>((NHOM_ORDER[a.nhom]??9)-(NHOM_ORDER[b.nhom]??9))||a.ma.localeCompare(b.ma));
  (c.years=c.years||{})[y]=Y; return Y;
}
function hasSeed(){ try { const d=JSON.parse($('#seed').textContent); return !!(d.items && d.items.rows && d.items.rows.length); } catch(e){ return false; } }
function emptyNote(){ return allKys().length ? '' : `<div class="note">Chưa có dữ liệu. ${hasSeed()?'Bạn có thể: (1) bấm <b>Nạp dữ liệu năm 2026</b> (đã chuyển sẵn từ file Gia thanh - 26 TH), hoặc (2) nhập':'Nhập'} tại nhóm <b>1 · Dữ liệu nền</b> và <b>2 · Phát sinh hằng ngày</b> – mỗi bảng có nút <b>Nhập Excel</b> kèm tệp mẫu.</div>${hasSeed()?`<div class="bar" style="margin-bottom:10px"><button class="btn p" id="seedbtn">Nạp dữ liệu năm 2026 (từ file Gia thanh - 26 TH)</button></div>`:''}`; }
function bindSeed(){ const b=$('#seedbtn'); if (b) b.onclick=()=>{ try { const d=JSON.parse($('#seed').textContent); fromDocs(d); changed(); selKy=''; render(); toast('Đã nạp dữ liệu năm 2026 – vào menu Giá thành bấm ▶ Tính giá thành'); } catch(e){ toast('Không nạp được dữ liệu mẫu'); } }; }
function noData(m){ const nv=NAV.find(x=>x.id===view); m.innerHTML = head(nv?nv.t:'Tổng quan') + emptyNote(); bindKy(); bindSeed(); }
const NAME_COL = t => /^(Tên|Mặt hàng)/i.test(String(t||'').replace(/<[^>]+>/g,'').trim());
const autoFreeze = titles => { let k=0; titles.slice(0,7).forEach((t,i)=>{ if (NAME_COL(t)) k=i+1; }); return k>=2 ? k : 0; };
function table(cols, rows, opts={}){
  if (opts.freeze==null) opts.freeze = autoFreeze(cols.map(c=>c.t));
  const th = cols.map(c=>`<th class="${c.n?'n':''}">${c.t}</th>`).join('');
  const body = rows.map((r,i)=>`<tr data-i="${i}" ${opts.click?'style="cursor:pointer"':''}>${cols.map(c=>{ const v=c.f(r); const neg = c.n && typeof v==='number' && v<0; return `<td class="${c.n?'n':''} ${neg?'neg':''}">${c.raw?v:esc(c.fmt?c.fmt(v):(c.n?fmtN(v,c.d||0):v))}</td>`; }).join('')}</tr>`).join('');
  let tot=''; if (opts.total) tot = `<tr class="tot">${cols.map((c,i)=> i===0 ? `<td>Tổng cộng</td>` : c.sum ? `<td class="n">${esc(c.fmt?c.fmt(sum(rows,c.f)):fmtN(sum(rows,c.f),c.d||0))}</td>` : '<td></td>').join('')}</tr>`;
  return `<div class="tw" style="${opts.h?`max-height:${opts.h}`:''}"><table${opts.freeze?` data-freeze="${opts.freeze}"`:''}><thead><tr>${th}</tr></thead><tbody>${body}${tot}</tbody></table></div>`;
}

