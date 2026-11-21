//# head(), P()/calcLive(), kỳ khoảng ngày/năm, table() dựng bảng
function head(title, extra=''){ const editNote = (editRow ? `<span class="pill warn" style="font-size:var(--fs-s)">✎ Đang sửa – nhớ bấm Lưu</span>` : '') + (calcDirty && !editRow && (view==='giathanh' || !REPORT_VIEWS.includes(view)) ? `<span class="pill warn" style="font-size:var(--fs-s)" title="Số lượng, doanh số, kiểm tra dữ liệu đã cập nhật ngay; giá vốn, giá thành, lãi, đề xuất sẽ cập nhật khi vào mục Giá thành bấm ▶ Tính giá thành">⚠ Chưa tính lại</span>` : ''); const lkNow = selKy && !isRange(selKy) && selKy.length===7 && isLocked(selKy); const lk = `<button class="btn btn-lock" id="lockbtn" title="Chọn tháng để khóa / mở khóa">${lkNow?'🔒 Tháng này đã khóa':'🔒 Khóa kỳ'}</button>`; return `<div class="top"><h2>${title}</h2><span class="top-r">${editNote}<span class="top-save" id="topsave">${topSaveText()}</span></span></div><div class="toolbar">${extra}${(/js-tbset/.test(extra)||view==='thietlap'||view==='huongdan')?'':tbExtra()}${view==='tongquan'?lk:''}${view==='giathanh'?`<button class="btn btn-calc" id="recalc" title="Chạy tuần tự từng tháng đến kỳ đang chọn và kiểm tra giá xuất kho" style="${calcDirty?'box-shadow:0 0 0 3px #bbf7d0':''}">▶ Tính giá thành${calcDirty?' (có dữ liệu mới)':''}</button>`:''}<span class="sp"></span>${kySelector()}</div>`; }
function periodOf(c){ if (isRange(selKy)) return rangePeriod(c, selKy); if (selKy.length===4) return yearPeriod(c, selKy); return c.periods[selKy] || null; }
// P(): số liệu theo lần ▶ Tính giá thành gần nhất (giá vốn, giá thành, lãi…)
function P(){ return periodOf(calc()); }
// PL(): số liệu cập nhật ngay theo dữ liệu đang có (số lượng, doanh số, kiểm tra dữ liệu…)
let calcLiveCache = null, calcLiveVer = -1, calcCacheVer = -1;
function calcLive(){ if (calcCache && calcCacheVer===dataVer) return calcCache; if (calcLiveCache && calcLiveVer===dataVer) return calcLiveCache; const saved=calcCache, sv=calcCacheVer; calcCache=null; let r; try { r=calc(); } finally { if (saved) { calcCache=saved; calcCacheVer=sv; } } calcLiveCache=r; calcLiveVer=dataVer; return r; }
function PL(){ return periodOf(calcLive()); }
function liveDiff(){ return !!(calcCache && calcCacheVer!==dataVer); }
function liveNote(){ return liveDiff() ? `<div class="note small">Số lượng, doanh số và kiểm tra dữ liệu đã cập nhật theo dữ liệu mới nhất. <b>Giá vốn, giá trị tồn, giá thành, lãi</b> vẫn theo lần ▶ Tính giá thành gần nhất – vào mục <b>Giá thành</b> bấm ▶ Tính giá thành để cập nhật.</div>` : ''; }
function rangePeriod(c, key){
  c.ranges = c.ranges||{}; if (c.ranges[key]) return c.ranges[key];
  const {from,to}=rangeOf(key); const kys=c.list.filter(k=>k>=from.slice(0,7) && k<=to.slice(0,7)); if (!kys.length) return null;
  const items=itemMap(); const Y={ky:key, open:{}, close:{}, nhap:{}, xuat:{}, giaVon:{}, nhapSX:{}, xuatSX:{}, xuatBan:{}, xuatChung:{}, orders:[], lines:[], sales:[], cost:{}, rates:{r622:0,r627:0}, sum621:0,sum622:0,sum627:0,sum154:0, slSX:0, doanhSo:0, lai:0, nxt:[], isRange:true, chungRows:[], c627chung:0, c641:0};
  const openSL={}, openTT={}, inSL={}, inTT={}, outSL={}, outTT={}; const add=(o,k,v)=>{o[k]=(o[k]||0)+v;};
  const first=c.periods[kys[0]];
  for (const ma in first.open) { openSL[ma]=first.open[ma].sl; openTT[ma]=first.open[ma].tt; }
  let days=0;
  kys.forEach(k=>{ const p=c.periods[k]; const gv=ma=>p.giaVon[ma]||0; p.chungRows.filter(x=>x.ngay>=from && x.ngay<=to).forEach(x=>{ Y.chungRows.push(x); if (x.loai==='627') Y.c627chung+=x.tt; else Y.c641+=x.tt; });
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
  codes.forEach(ma=>{ const o=openSL[ma]||0, ot=openTT[ma]||0, i=inSL[ma]||0, it2=inTT[ma]||0, x=outSL[ma]||0, xt=outTT[ma]||0; const cs=round(o+i-x,6); const ct = cs===0?0:Math.round(ot+it2-xt); Y.open[ma]={sl:o,tt:ot}; Y.nhap[ma]={sl:i,tt:it2}; Y.xuat[ma]=x; Y.close[ma]={sl:cs,tt:ct}; const it=items[ma]||{ma,ten:'(chưa có trong danh mục)',nhom:'',dvt:'',kho:''}; const isTP=it.nhom==='Thành phẩm'; const bq=(isTP?(Y.xuatBan[ma]||0):((Y.xuatSX[ma]||0)+(Y.xuatChung[ma]||0)))/Math.max(1,days); const dys=bq>0?Math.max(0,cs/bq):null; const gv=Y.giaVon[ma]||0;
    if (o||i||x||cs) Y.nxt.push({ma, ten:it.ten, nhom:it.nhom, dvt:it.dvt, kho:it.kho, gv, openSL:o, openTT:ot, nhapSL:i, nhapTT:it2, xuatSL:x, xuatTT:xt, closeSL:cs, closeTT:ct, bq, days:dys, canLay5: (!isTP&&bq>0)?Math.max(0,bq*5-cs):0, status: cs<0?'Âm kho - xử lý ngay':''}); });
  const order={'Thành phẩm':0,'NVLC':1,'PG':2,'GV':3,'BB':4}; Y.nxt.sort((a,b)=>((order[a.nhom]??9)-(order[b.nhom]??9))||a.ma.localeCompare(b.ma)); Y.tonCuoi=sum(Y.nxt,x=>x.closeTT); Y.daysData=days;
  c.ranges[key]=Y; return Y;
}
function yearPeriod(c, y){
  if (c.years && c.years[y]) return c.years[y];
  const kys = c.list.filter(k=>k.startsWith(y)); if (!kys.length) return null;
  const first=c.periods[kys[0]], last=c.periods[kys[kys.length-1]];
  const Y = {ky:y, open:first.open, close:last.close, nhap:{}, xuat:{}, giaVon:{}, nhapSX:{}, xuatSX:{}, xuatBan:{}, xuatChung:{}, orders:[], lines:[], sales:[], cost:{}, rates:{r622:0,r627:0}, sum621:0, sum622:0, sum627:0, sum154:0, slSX:0, doanhSo:0, lai:0, nxt:[], tonCuoi:last.tonCuoi, isYear:true, chungRows:[], c627chung:0, c641:0};
  kys.forEach(k=>{ const pp=c.periods[k]; if (pp) { Y.chungRows.push(...pp.chungRows); Y.c627chung+=pp.c627chung; Y.c641+=pp.c641; } });
  const add=(o,ma,v)=>{o[ma]=(o[ma]||0)+v;};
  let days=0;
  kys.forEach(k=>{ const p=c.periods[k]; days+=(p.daysData||daysInMonth(k));
    for (const ma in p.nhap){ const x=Y.nhap[ma]||(Y.nhap[ma]={sl:0,tt:0}); x.sl+=p.nhap[ma].sl; x.tt+=p.nhap[ma].tt; }
    for (const ma in p.xuat) add(Y.xuat,ma,p.xuat[ma]); for (const ma in p.xuatSX) add(Y.xuatSX,ma,p.xuatSX[ma]); for (const ma in p.xuatBan) add(Y.xuatBan,ma,p.xuatBan[ma]); for (const ma in p.xuatChung) add(Y.xuatChung,ma,p.xuatChung[ma]);
    Y.orders.push(...p.orders); Y.lines.push(...p.lines); Y.sales.push(...p.sales);
    Y.sum621+=p.sum621; Y.sum622+=p.sum622; Y.sum627+=p.sum627; Y.sum154+=p.sum154; Y.slSX+=p.slSX; Y.doanhSo+=p.doanhSo; Y.lai+=p.lai;
    costF().forEach(f=>Y.cost[f]=(Y.cost[f]||0)+num((p.cost||{})[f]));
  });
  Y.rates.r622 = Y.sum621 ? Y.sum622/Y.sum621 : 0; Y.rates.r627 = Y.sum621 ? Y.sum627/Y.sum621 : 0;
  const items=itemMap(); const codes=new Set([...Object.keys(Y.open),...Object.keys(Y.close),...Object.keys(Y.nhap),...Object.keys(Y.xuat)]);
  codes.forEach(ma=>{ const o=Y.open[ma]||{sl:0,tt:0}, n=Y.nhap[ma]||{sl:0,tt:0}, cl=Y.close[ma]||{sl:0,tt:0}, xs=Y.xuat[ma]||0; const xt=o.tt+n.tt-cl.tt; const gv=(o.sl+n.sl)?(o.tt+n.tt)/(o.sl+n.sl):0; Y.giaVon[ma]=gv;
    const it=items[ma]||{ma,ten:'(chưa có trong danh mục)',nhom:'',dvt:'',kho:''}; const isTP=it.nhom==='Thành phẩm'; const bq=(isTP?(Y.xuatBan[ma]||0):((Y.xuatSX[ma]||0)+(Y.xuatChung[ma]||0)))/days; const dys=bq>0?Math.max(0,cl.sl/bq):null; const lastRow=last.nxt.find(x=>x.ma===ma);
    Y.nxt.push({ma, ten:it.ten, nhom:it.nhom, dvt:it.dvt, kho:it.kho, gv, openSL:o.sl, openTT:o.tt, nhapSL:n.sl, nhapTT:n.tt, xuatSL:xs, xuatTT:xt, closeSL:cl.sl, closeTT:cl.tt, bq, days:dys, canLay5:lastRow?lastRow.canLay5:0, status:lastRow?lastRow.status:''}); });
  const order={'Thành phẩm':0,'NVLC':1,'PG':2,'GV':3,'BB':4}; Y.nxt.sort((a,b)=>((order[a.nhom]??9)-(order[b.nhom]??9))||a.ma.localeCompare(b.ma));
  (c.years=c.years||{})[y]=Y; return Y;
}
function hasSeed(){ return false; /* đã bỏ nút nạp dữ liệu mẫu tháng 10/2026 */ try { const d=JSON.parse($('#seed').textContent); return !!(d.items && d.items.rows && d.items.rows.length); } catch(e){ return false; } }
function emptyNote(){ return allKys().length ? '' : `<div class="note">Chưa có dữ liệu. ${hasSeed()?'Bạn có thể: (1) bấm <b>Nạp dữ liệu tháng 10/2026</b> (đã chuyển sẵn từ file GT_10-26 của bạn), hoặc (2) nhập':'Nhập'} tại nhóm <b>1 · Dữ liệu nền</b> và <b>2 · Phát sinh hằng ngày</b> – mỗi bảng có nút <b>Nhập Excel</b> kèm tệp mẫu.</div>${hasSeed()?`<div class="bar" style="margin-bottom:10px"><button class="btn p" id="seedbtn">Nạp dữ liệu tháng 10/2026 (từ file GT_10-26)</button></div>`:''}`; }
function bindSeed(){ const b=$('#seedbtn'); if (b) b.onclick=()=>{ try { const d=JSON.parse($('#seed').textContent); fromDocs(d); changed(); selKy=''; render(); toast('Đã nạp dữ liệu tháng 10/2026'); } catch(e){ toast('Không nạp được dữ liệu mẫu'); } }; }
function noData(m){ const nv=NAV.find(x=>x.id===view); m.innerHTML = head(nv?nv.t:'Tổng quan') + emptyNote(); bindKy(); bindSeed(); }
function table(cols, rows, opts={}){
  const th = cols.map(c=>`<th class="${c.n?'n':''}">${c.t}</th>`).join('');
  const body = rows.map((r,i)=>`<tr data-i="${i}" ${opts.click?'style="cursor:pointer"':''}>${cols.map(c=>{ const v=c.f(r); const neg = c.n && typeof v==='number' && v<0; return `<td class="${c.n?'n':''} ${neg?'neg':''}">${c.raw?v:esc(c.fmt?c.fmt(v):(c.n?fmtN(v,c.d||0):v))}</td>`; }).join('')}</tr>`).join('');
  let tot=''; if (opts.total) tot = `<tr class="tot">${cols.map((c,i)=> i===0 ? `<td>Tổng cộng</td>` : c.sum ? `<td class="n">${esc(c.fmt?c.fmt(sum(rows,c.f)):fmtN(sum(rows,c.f),c.d||0))}</td>` : '<td></td>').join('')}</tr>`;
  return `<div class="tw" style="${opts.h?`max-height:${opts.h}`:''}"><table><thead><tr>${th}</tr></thead><tbody>${body}${tot}</tbody></table></div>`;
}

