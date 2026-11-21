// ---- Cảnh báo ----
const cbTabs = t => `<div class="tabs"><button data-cbt="kq" class="${t==='kq'?'act':''}">Cảnh báo số liệu</button><button data-cbt="kt" class="${t==='kt'?'act':''}">Kiểm tra số liệu</button><button data-cbt="ng" class="${t==='ng'?'act':''}">Ngưỡng cảnh báo</button></div>`;
const bindCbTabs = m => m.querySelectorAll('[data-cbt]').forEach(b=>b.onclick=()=>guardEdit(()=>{ m.dataset.cbt=b.dataset.cbt; render(); }));
function vCanhBao(m){
  const c=calc(); const p=P();
  const items=itemMap(); const missing = {};
  const chk=(ma,src)=>{ if(ma && !items[ma]) (missing[ma]=missing[ma]||new Set()).add(src); };
  state.purchases.forEach(r=>chk(r.ma,'Mua hàng')); state.sales.forEach(r=>chk(r.ma,'Bán hàng')); state.bom.forEach(b=>{chk(b.maTP,'Định mức (TP)');chk(b.maNVL,'Định mức (NVL)');}); state.orders.forEach(o=>chk(o.maTP,'Lệnh SX')); state.adjustments.forEach(a=>{chk(a.maVT,'Cân đối NVL');chk(a.maTP,'Cân đối NVL');}); state.issues.forEach(i=>chk(i.maVT,'Xuất dùng chung'));
  const noBom = state.orders.map(o=>o.maTP+'|'+(o.loaiDM||'DM')).filter((v,i,a)=>a.indexOf(v)===i).filter(k=>{const [tp,l]=k.split('|'); return !bomFor(tp,l).length;});
  const badBom = state.bom.filter(b=>!b.maNVL || !num(b.slNVL) || !num(b.slTP));
  const soldNoBom = [...new Set(state.sales.map(s=>s.ma))].filter(ma=>isFinal(items[ma]) && !state.bom.some(b=>b.maTP===ma));
  const dupLenh = Object.entries(state.orders.reduce((a,o)=>{a[o.maLenh]=(a[o.maLenh]||0)+1;return a;},{})).filter(([k,v])=>v>1);
  const adjTP = state.orders.filter(o=>num(o.dieuChinhTP) && !isFinal(items[o.maTP]));
  const am = p ? p.nxt.filter(x=>x.closeSL<-1e-9) : [];
  const noPrice = p ? p.lines.filter(l=>l.tong>0 && !l.dg).map(l=>l.maVT).filter((v,i,a)=>a.indexOf(v)===i) : [];
  const pcM=purchaseChecks(), pcB=salesChecks(c); const itm=itemMap();
  const pwRows=[...state.purchases.filter(r=>selHas(r.ngayNhap) && (pcM[r._id]||{}).lvl).map(r=>({...pcM[r._id], loai:'Mua', ngay:r.ngayNhap, hd:r.hoaDon, ma:r.ma, dg:num(r.donGia)||(num(r.sl)?num(r.tt)/num(r.sl):0), go:'d_purchases'})),
    ...state.sales.filter(r=>selHas(r.ngay) && (pcB[r._id]||{}).lvl).map(r=>({...pcB[r._id], loai:'Bán', ngay:r.ngay, hd:r.hoaDon, ma:r.ma, dg:num(r.sl)?num(r.doanhSo)/num(r.sl):0, go:'d_sales'}))]
    .sort((a,b)=>(a.lvl===b.lvl?0:a.lvl==='R'?-1:1) || a.loai.localeCompare(b.loai) || (a.ngay||'').localeCompare(b.ngay||''));
  const prio = p ? p.nxt.filter(x=>x.closeSL<-1e-9 || x.risk==='RỦI RO CAO' || (x.status && x.status.includes('cần mua'))) : [];
  const badOrd = (p ? p.orders : []).filter(o=>o.status!=='Đủ').sort((a,b)=>(a.ngaySX+a.maLenh).localeCompare(b.ngaySX+b.maLenh)); const cw = c.warnings.filter(w=>w.loai!=='Lệnh SX');
  const sec=(t,ok,body)=>`<div class="box"><h3>${t} <span class="pill ${ok?'ok':'bad'}">${ok?'Đạt':'Cần xử lý'}</span></h3>${body}</div>`;
  // Sai sót do thao tác: chỉ hiện mục chưa đạt; tất cả đạt thì ẩn cả nhóm
  const secE=(t,ok,body)=>ok?'':sec(t,ok,body); let ERRH=''; const errGrp=h=>{ ERRH=h; return ''; }; // nội dung chuyển sang tab Kiểm tra số liệu
  const incomplete = Object.entries(GRID).filter(([e,g])=>g.req && state[e]).map(([e,g])=>{ const n=state[e].filter(r=>!r._new && (g.noKy || !g.kyf || selHas(r[g.kyf])) && g.req.some(k=>{ const c=g.cols.find(c=>c.k===k); return c && c.n ? !num(r[k]) : !r[k]; })).length; return n ? {e, t:(NAV.find(x=>x.id==='d_'+e)||{}).t || g.t, n} : null; }).filter(Boolean);
  // Chỉ tiêu theo tháng (sheet Cảnh báo)
  const y=workYear(); const kys=Array.from({length:12},(_,i)=>`${y}-${String(i+1).padStart(2,'0')}`).filter(k=>c.periods[k]);
  const KPI = [
    ['Tỷ lệ SL nhập kho / SL bán (thùng)', '≥', 1.15, 1.3, P=>{ const b=sum(P.sales.filter(s=>isFinal(items[s.ma])),s=>s.sl); return b?P.slSX/b:null; }, fmtP],
    ['Số ngày tồn thành phẩm (tồn cuối / bán BQ ngày)', '≥', 45, 60, P=>{ const f=P.nxt.filter(x=>isFinal(items[x.ma])); const b=sum(f,x=>x.xuatSL); const nd=daysInMonth(P.ky); return b ? sum(f,x=>x.closeSL)/(b/nd) : null; }, v=>fmtN(v,1)],
    ['Chi phí năng lượng (điện + gas) / kg BGKT (đ/kg)', '≥', 3500, 5000, P=>{ const kg=sum(P.orders.filter(o=>o.maTP==='BTP_BGKT'),o=>o.slTH); return kg ? (num((P.cost||{}).dien)+num((P.cp||{}).gas))/kg : null; }, v=>fmtN(v)],
    ['Tỷ lệ giá vốn / doanh thu', '≥', 0.9, 1, P=>P.doanhSo?(P.doanhSo-P.lai)/P.doanhSo:null, fmtP],
    ['Số dòng bán dưới giá vốn', '≥', 1, 5, P=>P.sales.filter(s=>s.gb&&s.gb<s.gv).length, v=>fmtN(v)],
    ['Số dòng bán làm tồn thành phẩm âm (theo ngày)', '≥', 1, 1, P=>P.sales.filter(s=>s.tonNgay<0).length, v=>fmtN(v)],
    ['CP 622 + 627 chưa phân bổ vào giá thành (đ)', '≥', 1, 1, P=>Math.round(Math.abs(P.unalloc622||0)+Math.abs(P.unalloc627||0)), v=>fmtN(v)],
    ['Số mã hàng âm kho cuối tháng', '≥', 1, 1, P=>P.nxt.filter(x=>x.closeSL<-1e-9).length, v=>fmtN(v)],
    ['Số dòng xuất NVL làm âm kho tại ngày xuất', '≥', 1, 10, P=>P.lines.filter(l=>l.tonNgay<-1e-6).length, v=>fmtN(v)],
    ['Tháng có sản xuất nhưng chưa nhập CP nhân công 622', '', 1, 1, P=>(P.orders.length && !costSum(P.cost,'622'))?1:0, v=>v?'Chưa nhập':'–', true],
  ];
  const cell = (k, v, lo, hi) => { if (v==null) return '<td class="n mut">–</td>'; const cls = v>=hi ? 'background:#fee2e2;color:#991b1b' : (v>=lo ? 'background:#fef3c7;color:#92400e' : ''); return `<td class="n" style="${cls}">${k(v)}</td>`; };
  const kpiTbl = kys.length ? `<div class="tw" style="max-height:none"><table><thead><tr><th>Chỉ tiêu</th><th>Chiều</th><th class="n">Cảnh báo</th><th class="n">Rủi ro cao</th>${kys.map(k=>`<th class="n">T${+k.slice(5)}</th>`).join('')}</tr></thead><tbody>${KPI.map(([t,dir,lo,hi,f,fm,noThr])=>`<tr><td style="white-space:normal;min-width:260px">${t}</td><td>${dir}</td><td class="n">${noThr?'':fm(lo)}</td><td class="n">${noThr?'':fm(hi)}</td>${kys.map(k=>cell(fm, f(c.periods[k]), lo, hi)).join('')}</tr>`).join('')}</tbody></table></div><div class="small mut" style="margin-top:4px">Ô vàng = vượt ngưỡng cảnh báo, ô đỏ = vượt ngưỡng rủi ro cao.</div>` : '<div class="mut">Chưa có dữ liệu năm.</div>';
  m.innerHTML = head(`Cảnh báo & kiểm tra dữ liệu`, `<button class="btn p" id="cbXl">⬇ Xuất Excel toàn bộ</button>`) + cbTabs('kq') +
  `<div class="box"><h3>Chỉ tiêu đánh giá rủi ro theo tháng – năm ${y}</h3>${kpiTbl}</div>` +
  sec(`Rủi ro tồn kho cần xử lý – gồm tồn cuối kỳ âm${prio.length?` (${prio.length} mã${am.length?`, ${am.length} mã âm kho`:''})`:''}`, !prio.length, (prio.length ? table([
    {t:'Mã hàng',f:x=>x.ma},{t:'Tên hàng',f:x=>x.ten},{t:'Nhóm hàng',f:x=>x.nhom},{t:'Phân loại',raw:1,f:x=>`<span class="pill nfs ${x.risk==='RỦI RO CAO'?'bad':x.risk==='CẢNH BÁO'?'warn':'ok'}">${esc(riskLbl(x.risk))}</span>`},{t:'Trạng thái rủi ro',f:x=>x.status},
    {t:'Tồn đầu SL',n:1,d:2,f:x=>x.openSL},{t:'Nhập SL',n:1,d:2,f:x=>x.nhapSL},{t:'Xuất SL',n:1,d:2,f:x=>x.xuatSL},{t:'Tồn cuối kỳ',n:1,d:2,f:x=>x.closeSL},{t:'Cần lấy đủ 15 ngày',n:1,d:2,f:x=>x.can15||0},{t:'Số ngày còn dùng',n:1,d:0,f:x=>x.days==null?'':x.days,fmt:v=>v===''?'':fmtN(v,0)}
  ], [...prio].sort((x,y)=>((x.closeSL<-1e-9)?0:1)-((y.closeSL<-1e-9)?0:1)), {h:'50vh'}) : '<div class="mut">Không có mã cần ưu tiên, không có mã âm kho.</div>') + `<div class="small mut" style="margin-top:6px">Mã âm kho xếp lên đầu. Chi tiết đầy đủ ở <a href="#" data-go="nxt">Nhập – Xuất – Tồn</a>; ý nghĩa từng trạng thái xem <a href="#" data-go="huongdan">Hướng dẫn</a>.</div>`) +
  errGrp(
  secE('Dòng nhập liệu chưa đầy đủ thông tin bắt buộc', !incomplete.length, incomplete.length ? `<ul class="tight">${incomplete.map(x=>`<li><a href="#" data-go="d_${x.e}"><b>${esc(x.t)}</b></a>: ${x.n} dòng (tô đỏ trong bảng)</li>`).join('')}</ul>` : '<div class="mut small">Không có.</div>') +
  secE('Mã phát sinh nhưng chưa có trong danh mục', !Object.keys(missing).length, Object.keys(missing).length ? `<ul class="tight">${Object.entries(missing).map(([k,v])=>`<li><b>${esc(k)}</b> – ${[...v].join(', ')}</li>`).join('')}</ul><div class="small mut">Thêm mã tại Danh mục hàng (mã, tên, nhóm, ĐVT, kho).</div>` : '<div class="mut">Không có.</div>') +
  secE('Định mức: lệnh SX không có định mức / dòng định mức lỗi / thành phẩm có bán nhưng chưa có định mức', !noBom.length && !badBom.length && !soldNoBom.length, (noBom.length||badBom.length||soldNoBom.length)?`<ul class="tight">${noBom.map(k=>`<li>Lệnh SX không có định mức: ${esc(k.replace('|',' / '))}</li>`).join('')}${badBom.map(b=>`<li>Định mức lỗi: ${esc(b.maTP)} – ${esc(b.maNVL||'(thiếu mã NVL)')} (SL = 0)</li>`).join('')}${soldNoBom.map(ma=>`<li>Có bán nhưng chưa có định mức: ${esc(ma)}</li>`).join('')}</ul>`:'<div class="mut">Không có.</div>') +
  secE('Mã lệnh SX bị trùng / điều chỉnh TP nhập sai dòng', !dupLenh.length && !adjTP.length, (dupLenh.length||adjTP.length)?`<ul class="tight">${dupLenh.map(([k,v])=>`<li>${esc(k)} – ${v} dòng</li>`).join('')}${adjTP.map(o=>`<li>${esc(o.maLenh)} (${esc(o.maTP)}): CHỈ NHẬP +/- Ở DÒNG THÀNH PHẨM ĐÓNG GÓI</li>`).join('')}</ul>`:'<div class="mut">Không có.</div>') +
  secE('NVL xuất dùng nhưng chưa có giá (không tồn đầu, không mua; hoặc bán thành phẩm chưa có giá thành trong tháng)', !noPrice.length, noPrice.length?`<ul class="tight">${noPrice.map(k=>`<li>${esc(k)} – ${esc((items[k]||{}).ten||'')}</li>`).join('')}</ul>`:'<div class="mut">Không có.</div>') +
  secE(`Đơn giá mua / bán bất thường${pwRows.length?` (${pwRows.filter(x=>x.lvl==='R').length} đỏ · ${pwRows.filter(x=>x.lvl==='Y').length} vàng)`:''}`, !pwRows.length, pwRows.length?table([{t:'Mức',raw:1,f:x=>`<span class="pill ${x.lvl==='R'?'bad':'warn'}">${x.lvl==='R'?'Đỏ':'Vàng'}</span>`},{t:'Loại',f:x=>x.loai},{t:'Ngày',f:x=>fmtD(x.ngay)},{t:'Số HĐ',f:x=>x.hd||''},{t:'Mã',f:x=>x.ma},{t:'Tên hàng',f:x=>(itm[x.ma]||{}).ten||''},{t:'Đơn giá',n:1,f:x=>x.dg},{t:'Chênh lệch giá',n:1,f:x=>x.base?round(x.dg-x.base,0):'',fmt:v=>v===''?'':(v>0?'+':'')+fmtN(v)},{t:'Tỷ lệ chênh lệch',n:1,f:x=>x.d==null?'':x.d,fmt:v=>v===''?'':pctSigned(v)},{t:'Cảnh báo',f:x=>x.short||x.msg},{t:'Ghi chú',raw:1,f:x=>`<div style="white-space:normal;min-width:260px;line-height:1.35">${esc(x.note!=null?x.note:x.msg)}</div>`},{t:'',raw:1,f:x=>`<button class="btn s" data-pw="${x.go}" data-q="${esc((x.hd||'')+' '+x.ma)}">Đi tới dòng</button>`}], pwRows, {h:'40vh'})+`<div class="small mut" style="margin-top:6px">Ngưỡng: mua vàng ±${fmtP(giaNg().muaV)}, đỏ ±${fmtP(giaNg().muaD)} · bán vàng ±${fmtP(giaNg().banV)}, đỏ ±${fmtP(giaNg().banD)}; bán dưới giá vốn luôn đỏ – chỉnh ở tab <b>Ngưỡng cảnh báo</b>.</div>`:'<div class="mut">Không có.</div>') +
  secE(`Kiểm tra lệnh sản xuất${badOrd.length?` (${badOrd.length} lệnh chưa đủ dữ liệu)`:''}`, !badOrd.length, badOrd.length?table([{t:'Mã lệnh',f:x=>x.maLenh},{t:'Ngày SX',f:x=>fmtD(x.ngaySX)},{t:'Mã sản phẩm',f:x=>x.maTP},{t:'Tên sản phẩm',f:x=>(itm[x.maTP]||{}).ten||''},{t:'SL thực hiện',n:1,d:2,f:x=>x.slTH},{t:'Kiểm tra',raw:1,f:x=>`<span class="pill bad nfs">${esc(x.status)}</span>`},{t:'Cách xử lý',f:x=>/định mức/i.test(x.status)?'Khai báo định mức cho sản phẩm ở Định mức':/mã NVL/i.test(x.status)?'Thêm mã NVL vào Danh mục hàng hoặc sửa định mức':/giá thành/i.test(x.status)?'Kiểm tra lệnh bán thành phẩm cùng tháng (chưa có SL / giá thành)':'Bổ sung tồn đầu kỳ hoặc chứng từ mua cho NVL chưa có giá'},{t:'',raw:1,f:x=>`<button class="btn s" data-golenh="${esc(x.maLenh)}">Đi tới lệnh</button>`}], badOrd, {h:'40vh'}):'<div class="mut">Tất cả lệnh đủ định mức, mã NVL và giá.</div>') +
  secE('Cảnh báo khác khi tính toán', !cw.length, cw.length?table([{t:'Loại',f:x=>x.loai},{t:'Mã',f:x=>x.ma},{t:'Nội dung',f:x=>x.nd}], cw.slice(0,500), {h:'40vh'}):'<div class="mut">Không có.</div>'));
  if (m.dataset.cbt==='kt') m.innerHTML = head(`Cảnh báo & kiểm tra dữ liệu`, `<button class="btn p" id="cbXl">⬇ Xuất Excel toàn bộ</button>`) + cbTabs('kt') +
    (ERRH ? ERRH : `<div class="box"><h3>Không có sai sót <span class="pill ok">Đạt</span></h3><div class="mut small">Nhập liệu đầy đủ, mã hàng, định mức, lệnh sản xuất và giá đều hợp lệ.</div></div>`);
  $('#cbXl').onclick=()=>{
    const wb=XW.book_new(); const R2=v=>v==null||v===''?'':round(v,2);
    const add=(name, rows, fz)=>{ if(!rows.length) return; const ws=XW.json_to_sheet(rows); ws['!freeze']=fz||{x:0,y:1}; XW.book_append_sheet(wb, ws, name); };
    const st=(ok)=>ok?'Đạt':'Cần xử lý';
    const sums=[
      ['Chỉ tiêu đánh giá rủi ro theo tháng', '', 'ChiTieu'],
      ['Rủi ro tồn kho cần xử lý – gồm tồn cuối kỳ âm', prio.length, 'RuiRoTonKho'],
      ['Dòng nhập liệu chưa đầy đủ thông tin bắt buộc', incomplete.length, 'NhapThieu'],
      ['Mã phát sinh nhưng chưa có trong danh mục', Object.keys(missing).length, 'ThieuDanhMuc'],
      ['Định mức: lệnh SX không có ĐM / dòng ĐM lỗi / TP có bán chưa có ĐM', noBom.length+badBom.length+soldNoBom.length, 'DinhMuc'],
      ['Mã lệnh SX bị trùng / điều chỉnh TP nhập sai dòng', dupLenh.length+adjTP.length, 'TrungLenh'],
      ['NVL xuất dùng nhưng chưa có giá', noPrice.length, 'ChuaCoGia'],
      ['Đơn giá mua / bán bất thường', pwRows.length, 'DonGiaBatThuong'],
      ['Kiểm tra lệnh sản xuất', badOrd.length, 'LenhSX'],
      ['Cảnh báo khác khi tính toán', cw.length, 'CanhBaoKhac'],
    ];
    add('TongHop', sums.map(([t,n,sh])=>({'Mục kiểm tra':t, 'Số dòng / mã':n===''?'':n, 'Kết quả':n===''?'':st(!n), 'Sheet chi tiết':(n===''||n)?sh:'', 'Kỳ':fmtKy(selKy)})));
    add('ChiTieu', KPI.map(([t,dir,lo,hi,f,fm,noThr])=>{ const o={'Chỉ tiêu':t,'Chiều':dir,'Ngưỡng cảnh báo':noThr?'':lo,'Ngưỡng rủi ro cao':noThr?'':hi}; let nY=0,nR=0;
      kys.forEach(k=>{ const v=f(c.periods[k]); o['T'+(+k.slice(5))]= v==null?'':(noThr?(v?'Chưa nhập':''):round(v,4)); if(v!=null){ if(v>=hi) nR++; else if(v>=lo) nY++; } });
      o['Số tháng vượt cảnh báo']=nY; o['Số tháng rủi ro cao']=nR; return o; }), {x:1,y:1});
    add('RuiRoTonKho', [...prio].sort((x,y)=>((x.closeSL<-1e-9)?0:1)-((y.closeSL<-1e-9)?0:1)).map(x=>({'Mã hàng':x.ma,'Tên hàng':x.ten,'Nhóm hàng':x.nhom,'Phân loại':riskLbl(x.risk),'Trạng thái rủi ro':x.status,'Tồn đầu SL':R2(x.openSL),'Nhập SL':R2(x.nhapSL),'Xuất SL':R2(x.xuatSL),'Tồn cuối kỳ':R2(x.closeSL),'Cần lấy đủ 15 ngày':R2(x.can15||0),'Số ngày còn dùng':x.days==null?'':Math.round(x.days)})), {x:2,y:1});
    add('NhapThieu', incomplete.map(x=>({'Màn hình':x.t,'Số dòng thiếu thông tin bắt buộc':x.n})));
    add('ThieuDanhMuc', Object.entries(missing).map(([k,v])=>({'Mã':k,'Phát sinh ở':[...v].join(', ')})));
    add('DinhMuc', [...noBom.map(k=>({'Loại lỗi':'Lệnh SX không có định mức','Mã TP':k.split('|')[0],'Mã NVL':'','Ghi chú':'Loại ĐM '+(k.split('|')[1]||'')})),
      ...badBom.map(b=>({'Loại lỗi':'Dòng định mức lỗi (SL = 0 / thiếu mã NVL)','Mã TP':b.maTP,'Mã NVL':b.maNVL||'','Ghi chú':''})),
      ...soldNoBom.map(ma=>({'Loại lỗi':'Có bán nhưng chưa có định mức','Mã TP':ma,'Mã NVL':'','Ghi chú':''}))]);
    add('TrungLenh', [...dupLenh.map(([k,v])=>({'Loại lỗi':'Mã lệnh bị trùng','Mã lệnh':k,'Mã TP':'','Ghi chú':v+' dòng'})), ...adjTP.map(o=>({'Loại lỗi':'Điều chỉnh TP nhập sai dòng','Mã lệnh':o.maLenh,'Mã TP':o.maTP,'Ghi chú':'Chỉ nhập +/- ở dòng thành phẩm đóng gói'}))]);
    add('ChuaCoGia', noPrice.map(k=>({'Mã':k,'Tên hàng':(items[k]||{}).ten||''})));
    add('DonGiaBatThuong', pwRows.map(x=>({'Mức':x.lvl==='R'?'Đỏ':'Vàng','Loại':x.loai,'Ngày':fmtD(x.ngay),'Số HĐ':x.hd||'','Mã':x.ma,'Tên hàng':(itm[x.ma]||{}).ten||'','Đơn giá':R2(x.dg),'Chênh lệch giá':x.base?round(x.dg-x.base,0):'','Tỷ lệ chênh lệch':x.d==null?'':round(x.d,4),'Cảnh báo':x.short||x.msg,'Ghi chú':x.note!=null?x.note:x.msg})), {x:0,y:1});
    add('LenhSX', badOrd.map(x=>({'Mã lệnh':x.maLenh,'Ngày SX':fmtD(x.ngaySX),'Mã sản phẩm':x.maTP,'Tên sản phẩm':(itm[x.maTP]||{}).ten||'','SL thực hiện':R2(x.slTH),'Kiểm tra':x.status})));
    add('CanhBaoKhac', cw.map(x=>({'Loại':x.loai,'Mã':x.ma,'Nội dung':x.nd})));
    saveWb(wb, `CanhBao_KiemTra_${String(selKy).replace(/[^0-9A-Za-z_-]/g,'_')}.xlsx`);
  };
  m.querySelectorAll('[data-golenh]').forEach(b=>b.onclick=()=>{ view='d_orders'; search=b.dataset.golenh; render(); });
  m.querySelectorAll('[data-pw]').forEach(b=>b.onclick=()=>{ view=b.dataset.pw; search=b.dataset.q.trim(); render(); });
  bindKy(); bindCbTabs(m); const b=$('#goDc'); if(b) b.onclick=()=>{ view='d_adjustments'; render(); };
  m.querySelectorAll('[data-go]').forEach(a=>a.onclick=e=>{ e.preventDefault(); view=a.dataset.go; render(); });
}
