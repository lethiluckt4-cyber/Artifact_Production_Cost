// ---------- Xuất phiếu kho cho phần mềm kế toán (mẫu ASP) ----------
const XK_HDR = [['FILE MẪU PHIẾU XUẤT KHO ĐỂ NHẬP VÀO PHẦN MỀM ASP KẾ TOÁN'],['Hướng dẫn:'],['- Điền dữ liệu vào các cột tương ứng trên file này'],['- Các cột có dấu (*) là những cột bắt buộc'],['- Nếu muốn nhập nhiều thông tin hơn người dùng có thể tải mẫu đầy đủ/hoặc tự thêm cột trên mẫu cơ bản'],['- Các dòng dữ liệu phía dưới chỉ là ví dụ minh họa'],['','','','','','','','Chi tiết hàng tiền'],
  ['Loại xuất kho','Ngày hạch toán (*)','Ngày chứng từ (*)','Số chứng từ (*)','Mã đối tượng','Tên đối tượng','Lý do xuất','Mã hàng','Tên hàng','Mã kho','TK Nợ (*)','TK Có (*)','ĐVT','Số lượng','Mã đối tượng THCP','Tên đối tượng THCP']];
const NK_HDR = [['FILE MẪU PHIẾU NHẬP KHO ĐỂ NHẬP VÀO PHẦN MỀM ASP KẾ TOÁN'],['Hướng dẫn:'],['- Điền dữ liệu vào các cột tương ứng trên file này'],['- Các cột có dấu (*) là những cột bắt buộc'],['- Nếu muốn nhập nhiều thông tin hơn người dùng có thể tải mẫu đầy đủ/hoặc tự thêm cột trên mẫu cơ bản'],['- Các dòng dữ liệu phía dưới chỉ là ví dụ minh họa'],['','','','','','','','Chi tiết hàng tiền'],
  ['Loại nhập kho','Ngày hạch toán (*)','Ngày chứng từ (*)','Số chứng từ (*)','Mã đối tượng','Tên đối tượng','Diễn giải','Mã hàng','Tên hàng','Mã kho','TK Nợ (*)','TK Có (*)','ĐVT','Số lượng','Mã đối tượng THCP']];
const xlSerial = d => Math.round((new Date(d+'T00:00:00Z') - Date.UTC(1899,11,30))/86400000);
function ktSettings(){ const s=state.settings; return {maDT: s.ktMaDT||'', tenDT: s.ktTenDT||'', tkNoXK: s.ktTkNoXK||'621', tkCoNK: s.ktTkCoNK||'154'}; }
const TK_KHO_ASP = {'155':'1551'}; // ASP: thành phẩm & bán thành phẩm hạch toán TK 1551
const tkOfKho = (kho, d) => { const t=(String(kho||'').match(/^\d+/)||[d])[0]; return TK_KHO_ASP[t]||t; }; // TK kế toán theo phần số của mã kho (152-BB → 152, 155 → 1551)
function buildXK(p){ const items=itemMap(); const k=ktSettings(); return p.lines.filter(l=>l.tong>0).slice().sort((a,b)=>(a.ngayXuatNVL+a.maLenh).localeCompare(b.ngayXuatNVL+b.maLenh)).map(l=>{ const it=items[l.maVT]||{}; const tp=items[l.maTP]||{}; return ['Xuất kho sản xuất', l.ngayXuatNVL, l.ngayXuatNVL, `XK${l.maTP}${xlSerial(l.ngayXuatNVL)}`, k.maDT, k.tenDT, `Xuất VL - ${tp.ten||l.maTP}`, l.maVT, it.ten||'', it.kho||'152', k.tkNoXK, tkOfKho(it.kho,'152'), it.dvt||'', round(l.tong,4), l.maTP, tp.ten||'']; }); }
function buildNK(p){ const items=itemMap(); const k=ktSettings(); return p.orders.filter(o=>o.slTH>0).slice().sort((a,b)=>(a.ngaySX+a.maLenh).localeCompare(b.ngaySX+b.maLenh)).flatMap(o=>{ const tp=items[o.maTP]||{}; const out=[['Nhập kho thành phẩm sản xuất', o.ngaySX, o.ngaySX, `TP-${o.maTP}${xlSerial(o.ngaySX)}`, k.maDT, k.tenDT, `Nhập kho TP sản xuất - ${tp.ten||o.maTP}`, o.maTP, tp.ten||'', tp.kho||'155', tkOfKho(tp.kho,'155'), k.tkCoNK, tp.dvt||'', round(o.slDat??o.slTH,4), o.maTP]];
  if (o.slLoi>0) { const lo=items[o.maLoi]||{}; out.push(['Nhập kho thành phẩm sản xuất', o.ngaySX, o.ngaySX, `TP-${o.maTP}${xlSerial(o.ngaySX)}`, k.maDT, k.tenDT, `Nhập kho sản phẩm lỗi thu hồi - ${lo.ten||o.maLoi}`, o.maLoi, lo.ten||'', lo.kho||'155', tkOfKho(lo.kho,'155'), k.tkCoNK, lo.dvt||'', round(o.slLoi,4), o.maTP]); }
  return out; }); }
function sheetWithDates(hdr, rows){ const ws=XW.aoa_to_sheet(hdr.concat(rows)); ws._bold=new Set([0, hdr.length-1]); ws['!cols']=[20,16,16,18,12,18,34,12,34,8,8,8,8,12,16,24].map(w=>({wch:w})); return ws; }
// ---- File tải HĐ chuyển ngày nhập kho (Mua hàng trong nước + Nghiệp vụ khác khai thuế phần không kèm HĐ) ----
const MV_HDR=[['','FILE MẪU CHỨNG TỪ MUA HÀNG TRONG NƯỚC ĐỂ NHẬP VÀO PHẦN MỀM ASP KẾ TOÁN'],['','Hướng dẫn:'],['','- Điền dữ liệu vào các cột tương ứng trên file này'],['','- Các cột có dấu (*) là những cột bắt buộc'],['','- Nếu muốn nhập nhiều thông tin hơn người dùng có thể tải mẫu đầy đủ/hoặc tự thêm cột trên mẫu cơ bản'],
  ['','- Các dòng dữ liệu phía dưới chỉ là ví dụ minh họa','','','','','','','','','','','','','29','31','','39',41,32,33,34,35,23,'37'],
  ['','','','','','','','','','','','','','','Chi tiết hàng tiền'],
  ['STT','Hình thức mua hàng','Phương thức thanh toán','Nhận kèm hóa đơn','Ngày hạch toán (*)','Ngày chứng từ (*)','Số phiếu nhập (*)','Mẫu số HĐ','Ký hiệu HĐ','Số hóa đơn','Ngày hóa đơn','Mã nhà cung cấp','Tên nhà cung cấp','Diễn giải','Mã hàng','Tên hàng','Mã kho','TK kho/TK chi phí (*)','TK công nợ/TK tiền (*)','ĐVT','Số lượng','Đơn giá','Thành tiền','% thuế GTGT','Tiền thuế GTGT','TK thuế GTGT','Nhóm HHDV mua vào']];
const NVK_HDR=[['','FILE MẪU CHỨNG TỪ NGHIỆP VỤ KHÁC ĐỂ NHẬP VÀO PHẦN MỀM ASP KẾ TOÁN'],['','Hướng dẫn:'],['','- Điền dữ liệu vào các cột tương ứng trên file này'],['','- Các cột có dấu (*) là những cột bắt buộc'],['','- Nếu muốn nhập nhiều thông tin hơn người dùng có thể tải mẫu đầy đủ/hoặc tự thêm cột trên mẫu cơ bản'],['','- Các dòng dữ liệu phía dưới chỉ là ví dụ minh họa'],
  ['','','','','','Chi tiết hạch toán','','','','','Thuế'],
  ['STT','Ngày chứng từ (*)','Ngày hạch toán (*)','Số chứng từ (*)','Diễn giải','Diễn giải (Hạch toán)','TK Nợ (*)','TK Có (*)','Số tiền','Mã đối tượng Có','Diễn giải thuế','Giá trị HHDV chưa thuế','% thuế GTGT','% thuế suất KHAC','Tiền thuế GTGT','TK thuế GTGT','Ngày hóa đơn','Số hóa đơn','Mẫu số HĐ','Ký hiệu HĐ','Nhóm HHDV mua vào','Mã đối tượng thuế','Tên đối tượng thuế']];
function buildHDChuyen(){
  const items=itemMap(); const inKy=r=>r.ngayMua && selKyHas(kyOf(r.ngayMua));
  const yymmdd=d=>d.slice(2,4)+d.slice(5,7)+d.slice(8,10);
  const g={}; state.purchases.forEach(r=>{ if (!r.hoaDon) return; const k=r.hoaDon+'|'+(r.ncc||''); (g[k]=g[k]||[]).push(r); });
  // Kèm / không kèm HĐ theo cột "Mua hàng chưa HĐ": "x - Số HĐ" (hoặc "x") = chuyển về trước → Không kèm hóa đơn; chỉ "Số HĐ" → Nhận kèm hóa đơn; trống → so ngày nhập kho với ngày HĐ
  const khong=r=>{ const c=String(r.chuaHD||'').trim(); return c ? /^x/i.test(c) : !!(r.ngayNhap && r.ngayMua && r.ngayNhap!==r.ngayMua); };
  const hds=Object.values(g).filter(rs=>rs.some(khong) && rs.some(inKy))
    .sort((a,b)=>(a[0].ngayMua+a[0].hoaDon).localeCompare(b[0].ngayMua+b[0].hoaDon));
  const mua=[], nvk=[], ds=[], dc=[]; let stt=0, sttN=0;
  hds.forEach(rs=>{
    const r0=rs[0], ngHD=r0.ngayMua, soHD=r0.hoaDon, ncc=r0.ncc||'', goc=`NK${yymmdd(ngHD)}-${soHD}`; const pick=k=>{ const x=rs.find(r=>String(r[k]||'').trim()); return x?String(x[k]).trim():''; }; const maNCC=pick('maNCC'), mauSo=pick('mauSo'), kyHieu=pick('kyHieu');
    // thuế: tổng theo từng thuế suất trên tờ hóa đơn, chia về từng dòng, phần lẻ dồn vào dòng lớn nhất
    const tax=new Map(); const byRate={};
    rs.forEach(r=>{ const t=num(r.thueGTGT); if (t>0) (byRate[t]=byRate[t]||[]).push(r); });
    Object.entries(byRate).forEach(([t,list])=>{ const T=Math.round(sum(list,r=>num(r.tt))*t); let a=0; list.forEach(r=>{ const v=Math.round(num(r.tt)*t); tax.set(r,v); a+=v; }); if (a!==T) { const big=list.reduce((x,y)=>num(y.tt)>num(x.tt)?y:x); tax.set(big, tax.get(big)+T-a); } });
    // phiếu theo ngày nhập kho
    const byD={}; rs.forEach(r=>{ const k=(khong(r)?'2':'1')+(r.ngayNhap||ngHD); (byD[k]=byD[k]||[]).push(r); });
    let seq=0, nKem=0; const days=Object.keys(byD).sort();
    let kemTT=0, khongTT=0, thueMua=0, thueNVK=0;
    days.forEach(dk=>{ const kem = dk[0]==='1', d=dk.slice(1); const so = kem && !nKem++ ? goc : `${goc}-${String(++seq).padStart(3,'0')}`; const list=byD[dk];
      const dg = `${(items[list[0].ma]||{}).ten||list[0].ma} - ${soHD} (${fmtD(ngHD)})`;
      list.forEach(r=>{ const it=items[r.ma]||{}; const kho=String(r.kho||it.kho||'152'); const k155=/^155/.test(kho); const t=tax.get(r)||0; const tt=num(r.tt);
        mua.push([++stt,'Chưa thanh toán','Chưa thanh toán', kem?'Nhận kèm hóa đơn':'Không kèm hóa đơn', d, d, so, mauSo, kyHieu, soHD, ngHD, maNCC, ncc, dg, r.ma, it.ten||'', k155?'155':kho, k155?'1551':tkOfKho(kho,'152'), 331, it.dvt||'', round(num(r.sl),4), round(num(r.donGia),4), tt, kem&&num(r.thueGTGT)>0?{v:num(r.thueGTGT),pct:true}:'', kem&&t?t:'', kem&&t?1331:'', 1]);
        if (kem) { kemTT+=tt; thueMua+=t; } else { khongTT+=tt; if (t) { thueNVK+=t; nvk.push([++sttN, ngHD, ngHD, 'NVK-'+so, dg, dg, 1331, 331, t, maNCC, dg, tt, {v:num(r.thueGTGT),pct:true}, '', t, 1331, ngHD, soHD, mauSo, kyHieu, 1, maNCC, ncc]); } } });
    });
    const tongTT=sum(rs,r=>num(r.tt)), tongThue=sum([...tax.values()],v=>v);
    ds.push([goc, soHD, tongTT, tongThue]);
    dc.push([soHD, ngHD, ncc, kemTT, khongTT, tongTT, kemTT+khongTT-tongTT, thueMua, thueNVK, tongThue, thueMua+thueNVK-tongThue, kemTT+khongTT+thueMua+thueNVK, tongTT+tongThue, kemTT+khongTT+thueMua+thueNVK-tongTT-tongThue]);
  });
  return {mua, nvk, ds, dc, n:hds.length};
}
function xuatHDChuyen(){
  const H=buildHDChuyen(); if (!H.n) return toast('Kỳ đang xem không có hóa đơn chuyển ngày nhập kho', 3500);
  const wb=XW.book_new(); const S=(hdr,rows,cols)=>{ const ws=XW.aoa_to_sheet(hdr.concat(rows)); ws._bold=new Set([0, hdr.length-1, hdr.length+rows.length-1].filter(i=>i>=0)); ws['!freeze']={y:hdr.length}; if (cols) ws['!cols']=cols.map(w=>({wch:w})); return ws; };
  const tMua=['x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x','x', sum(H.mua,r=>num(r[22])), 'x', sum(H.mua,r=>num(r[24])), 'x','x'];
  const wsM=S(MV_HDR, H.mua.concat([tMua]), [6,16,16,18,12,12,22,10,10,12,12,12,36,40,16,34,8,10,10,8,10,12,14,8,12,8,8]); wsM._bold=new Set([0,7,8+H.mua.length]);
  XW.book_append_sheet(wb, wsM, 'Mua hang trong nuoc ');   // đúng tên sheet mẫu ASP (có dấu cách cuối)
  const wsN=S(NVK_HDR, H.nvk, [6,12,12,26,40,40,8,8,12,12,40,14,8,8,12,8,12,12,10,10,8,12,36]); wsN._bold=new Set([0,7]);
  XW.book_append_sheet(wb, wsN, 'Nghiep vu khac');
  const tDS=['Tổng cộng','', sum(H.ds,r=>r[2]), sum(H.ds,r=>r[3])];
  XW.book_append_sheet(wb, S([['Phiếu nhập cũ','Số hóa đơn','Số tiền chưa thuế','Thuế']], H.ds.concat([tDS]), [24,14,18,14]), 'DS HD chuyen ngay');
  const tDC=['Tổng cộng','','', ...[3,4,5,6,7,8,9,10,11,12,13].map(i=>sum(H.dc,r=>r[i]))];
  XW.book_append_sheet(wb, S([['Số HĐ','Ngày HĐ','Nhà cung cấp','Tiền hàng kèm HĐ','Tiền hàng không kèm HĐ','Tiền hàng trên HĐ','Lệch tiền hàng','Thuế bên Mua hàng','Thuế bên NVK','Thuế trên HĐ','Lệch thuế','Tổng 2 sheet (tiền hàng + thuế)','Tổng giá trị tờ HĐ','Lệch tổng']], H.dc.concat([tDC]), [12,12,40,16,18,16,12,16,14,14,10,18,16,10]), 'Doi chieu HD');
  saveWb(wb, `File_tai_mua_vao_NVK_${String(selKy).replace(/[:\/]/g,'-')}.xlsx`);
}
function vXuatPhieu(m){
  const p=P(); if(!p) return noData(m); const tab=m.dataset.ptab||'xk'; const xk=buildXK(p), nk=buildNK(p); const k=ktSettings();
  const prev = (rows, hdr) => `<div class="tw"><table><thead><tr>${hdr[hdr.length-1].map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,400).map(r=>`<tr>${r.map((v,i)=>`<td class="${i===13?'n':''}">${esc((i===1||i===2)?fmtD(v):(i===13?fmtQ(v):v))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${rows.length>400?`<div class="small mut">Chỉ xem trước 400/${rows.length} dòng – tệp xuất có đủ.</div>`:''}`;
  m.innerHTML = head(`File tải dữ liệu kế toán (mẫu ASP)`, `<button class="btn p" id="exBoth">⬇ Xuất Excel</button>`) +
  `
  <div class="tabs"><button data-t="xk" class="${tab==='xk'?'act':''}">Phiếu xuất kho NVL (XK NVL)</button><button data-t="nk" class="${tab==='nk'?'act':''}">Phiếu nhập kho TP (NK TP)</button><button data-t="hd" class="${tab==='hd'?'act':''}">File tải hóa đơn chuyển ngày nhập kho</button></div>` + (tab==='xk' ? prev(xk, XK_HDR) : tab==='nk' ? prev(nk, NK_HDR) : hdPrev());
  bindKy(); m.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{ m.dataset.ptab=b.dataset.t; render(); });
  const mk = (which) => { const wb=XW.book_new(); if (which!=='nk') XW.book_append_sheet(wb, sheetWithDates(XK_HDR, xk), 'XK NVL'); if (which!=='xk') XW.book_append_sheet(wb, sheetWithDates(NK_HDR, nk), 'NK TP'); saveWb(wb, `${which==='xk'?'KeToan_XK_NVL':which==='nk'?'KeToan_NK_TP':'KeToan_Phieu_kho'}_${selKy}.xlsx`); };
  $('#exBoth').onclick=()=> tab==='hd' ? xuatHDChuyen() : mk('both');
  function hdPrev(){ const H=buildHDChuyen(); if (!H.n) return '<div class="mut" style="padding:10px">Kỳ đang xem không có hóa đơn chuyển ngày nhập kho.</div>';
    const st=m.dataset.hdt||'mua'; const T=[['mua','Mua hàng trong nước'],['nvk','Nghiệp vụ khác'],['ds','DS HĐ chuyển ngày'],['dc','Đối chiếu HĐ']];
    const bar=`<div class="hdtabs">${T.map(([k,t])=>`<button data-hdt="${k}" class="${st===k?'act':''}">${t}</button>`).join('')}</div>`;
    const V=v=> v&&v.pct ? v.v : v; const P=v=> v&&v.pct ? fmtP(v.v) : (typeof v==='number' ? fmtN(v) : v);
    const colsOf=(hdr, rows, opt={})=> hdr.map((h,i)=>{ const isN = rows.some(r=>typeof V(r[i])==='number') && !(opt.txt||[]).includes(i); const isD=(opt.dates||[]).includes(i);
      return {t:esc(h), n:isN, f:r=>{ const v=isD?r[i]:V(r[i]); return isN && v==='' ? null : v; }, fmt: isD ? fmtD : (opt.txt||[]).includes(i) ? (v=>v==null?'':String(v)) : (v=>{ return v==null||v===''?'':(typeof v==='number' && (opt.pct||[]).includes(i)) ? fmtP(v) : (typeof v==='number' ? fmtN(v, Number.isInteger(v)?0:2) : v); }), sum:(opt.sum||[]).includes(i)}; });
    let body='';
    if (st==='mua') body=table(colsOf(MV_HDR[MV_HDR.length-1], H.mua, {dates:[4,5,10], txt:[0,7,8,9,11,18,25,26], pct:[23], sum:[22,24]}), H.mua, {total:true});
    else if (st==='nvk') body = H.nvk.length ? table(colsOf(NVK_HDR[NVK_HDR.length-1], H.nvk, {dates:[1,2,16], txt:[0,6,7,9,15,17,18,19,20,21], pct:[12], sum:[8,11,14]}), H.nvk, {total:true}) : '<div class="mut" style="padding:10px">Không có dòng nghiệp vụ khác (phần không kèm hóa đơn không có thuế GTGT).</div>';
    else if (st==='ds') body=table(colsOf(['Phiếu nhập cũ','Số hóa đơn','Số tiền chưa thuế','Thuế'], H.ds, {txt:[1], sum:[2,3]}), H.ds, {total:true});
    else body=table(colsOf(['Số HĐ','Ngày HĐ','Nhà cung cấp','Tiền hàng kèm HĐ','Tiền hàng không kèm HĐ','Tiền hàng trên HĐ','Lệch tiền hàng','Thuế bên Mua hàng','Thuế bên NVK','Thuế trên HĐ','Lệch thuế','Tổng 2 sheet (tiền hàng + thuế)','Tổng giá trị tờ HĐ','Lệch tổng'], H.dc, {dates:[1], txt:[0], sum:[3,4,5,6,7,8,9,10,11,12,13]}), H.dc, {total:true});
    setTimeout(()=>m.querySelectorAll('[data-hdt]').forEach(b=>b.onclick=()=>{ m.dataset.hdt=b.dataset.hdt; render(); }),0);
    return bar+body; }
}

