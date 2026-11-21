//# File tải dữ liệu kế toán (mẫu ASP): XK NVL, NK TP, File tải hóa đơn chuyển ngày nhập kho (4 sheet)
// ---------- Xuất phiếu kho cho phần mềm kế toán (mẫu ASP) ----------
const XK_HDR = [['FILE MẪU PHIẾU XUẤT KHO ĐỂ NHẬP VÀO PHẦN MỀM ASP KẾ TOÁN'],['Hướng dẫn:'],['- Điền dữ liệu vào các cột tương ứng trên file này'],['- Các cột có dấu (*) là những cột bắt buộc'],['- Nếu muốn nhập nhiều thông tin hơn người dùng có thể tải mẫu đầy đủ/hoặc tự thêm cột trên mẫu cơ bản'],['- Các dòng dữ liệu phía dưới chỉ là ví dụ minh họa'],['','','','','','','','Chi tiết hàng tiền'],
  ['Loại xuất kho','Ngày hạch toán (*)','Ngày chứng từ (*)','Số chứng từ (*)','Mã đối tượng','Tên đối tượng','Lý do xuất','Mã hàng','Tên hàng','Mã kho','TK Nợ (*)','TK Có (*)','ĐVT','Số lượng','Mã đối tượng THCP','Tên đối tượng THCP']];
const NK_HDR = [['FILE MẪU PHIẾU NHẬP KHO ĐỂ NHẬP VÀO PHẦN MỀM ASP KẾ TOÁN'],['Hướng dẫn:'],['- Điền dữ liệu vào các cột tương ứng trên file này'],['- Các cột có dấu (*) là những cột bắt buộc'],['- Nếu muốn nhập nhiều thông tin hơn người dùng có thể tải mẫu đầy đủ/hoặc tự thêm cột trên mẫu cơ bản'],['- Các dòng dữ liệu phía dưới chỉ là ví dụ minh họa'],['','','','','','','','Chi tiết hàng tiền'],
  ['Loại nhập kho','Ngày hạch toán (*)','Ngày chứng từ (*)','Số chứng từ (*)','Mã đối tượng','Tên đối tượng','Diễn giải','Mã hàng','Tên hàng','Mã kho','TK Nợ (*)','TK Có (*)','ĐVT','Số lượng','Mã đối tượng THCP']];
const xlSerial = d => Math.round((new Date(d+'T00:00:00Z') - Date.UTC(1899,11,30))/86400000);
function ktSettings(){ const s=state.settings; return {maDT: s.ktMaDT||'NV_DMT', tenDT: s.ktTenDT||'Đặng Minh Thảo', tkNoXK: s.ktTkNoXK||'621', tkCoNK: s.ktTkCoNK||'154'}; }
function buildXK(p){ const items=itemMap(); const k=ktSettings(); return p.lines.filter(l=>l.tong>0).slice().sort((a,b)=>(a.ngayXuatNVL+a.maLenh).localeCompare(b.ngayXuatNVL+b.maLenh)).map(l=>{ const it=items[l.maVT]||{}; const tp=items[l.maTP]||{}; return ['Xuất kho sản xuất', l.ngayXuatNVL, l.ngayXuatNVL, `XK${l.maTP}${xlSerial(l.ngayXuatNVL)}`, k.maDT, k.tenDT, `Xuất VL - ${tp.ten||l.maTP}`, l.maVT, it.ten||'', it.kho||'152', k.tkNoXK, it.kho||'152', it.dvt||'', round(l.tong,4), l.maTP, tp.ten||'']; }); }
function buildNK(p){ const items=itemMap(); const k=ktSettings(); return p.orders.filter(o=>o.slTH>0).slice().sort((a,b)=>(a.ngaySX+a.maLenh).localeCompare(b.ngaySX+b.maLenh)).map(o=>{ const tp=items[o.maTP]||{}; return ['Nhập kho thành phẩm sản xuất', o.ngaySX, o.ngaySX, `TP-${o.maTP}${xlSerial(o.ngaySX)}`, k.maDT, k.tenDT, `Nhập kho TP sản xuất - ${tp.ten||o.maTP}`, o.maTP, tp.ten||'', tp.kho||'155', tp.kho||'155', k.tkCoNK, tp.dvt||'', round(o.slTH,4), o.maTP]; }); }
// Mua hàng có chuyển ngày nhập kho về trước ngày hóa đơn → file tải mua vào ASP (Mua hàng trong nước: Không kèm hóa đơn) + Nghiệp vụ khác (thuế GTGT Nợ 1331/Có 331 theo ngày hóa đơn)
const ASP_TOP = t => [[ '', t],['', 'Hướng dẫn:'],['', '- Điền dữ liệu vào các cột tương ứng trên file này'],['', '- Các cột có dấu (*) là những cột bắt buộc'],['', '- Nếu muốn nhập nhiều thông tin hơn người dùng có thể tải mẫu đầy đủ/hoặc tự thêm cột trên mẫu cơ bản'],['', '- Các dòng dữ liệu phía dưới chỉ là ví dụ minh họa']];
const MH_HDR = ASP_TOP('FILE MẪU CHỨNG TỪ MUA HÀNG TRONG NƯỚC ĐỂ NHẬP VÀO PHẦN MỀM ASP KẾ TOÁN').concat([['','','','','','','','','','','','','','','Chi tiết hàng tiền'],
  ['STT','Hình thức mua hàng','Phương thức thanh toán','Nhận kèm hóa đơn','Ngày hạch toán (*)','Ngày chứng từ (*)','Số phiếu nhập (*)','Mẫu số HĐ','Ký hiệu HĐ','Số hóa đơn','Ngày hóa đơn','Mã nhà cung cấp','Tên nhà cung cấp','Diễn giải','Mã hàng','Tên hàng','Mã kho','TK kho/TK chi phí (*)','TK công nợ/TK tiền (*)','ĐVT','Số lượng','Đơn giá','Thành tiền','% thuế GTGT','Tiền thuế GTGT','TK thuế GTGT','Nhóm HHDV mua vào']]);
const NVK_HDR = ASP_TOP('FILE MẪU CHỨNG TỪ NGHIỆP VỤ KHÁC ĐỂ NHẬP VÀO PHẦN MỀM ASP KẾ TOÁN').concat([['','','','','','Chi tiết hạch toán'],
  ['STT','Ngày chứng từ (*)','Ngày hạch toán (*)','Số chứng từ (*)','Diễn giải','Diễn giải (Hạch toán)','TK Nợ (*)','TK Có (*)','Số tiền','Mã đối tượng Có','Diễn giải thuế','Giá trị HHDV chưa thuế','% thuế GTGT','% thuế suất KHAC','Tiền thuế GTGT','TK thuế GTGT','Ngày hóa đơn','Số hóa đơn','Mẫu số HĐ','Ký hiệu HĐ','Nhóm HHDV mua vào','Mã đối tượng thuế','Tên đối tượng thuế']]);
function aspMoved(){ return state.purchases.filter(r=>!r._new && r.nkGoc && r.nkGoc!==r.ngayNhap && r.ngayMua && r.ngayNhap<r.ngayMua && selHas(r.ngayNhap)).sort((a,b)=>(a.ngayNhap+a.ncc+a.hoaDon+a.ma).localeCompare(b.ngayNhap+b.ncc+b.hoaDon+b.ma)); }
const hasTS = r => r.thueSuat!=='' && r.thueSuat!=null && !isNaN(num(r.thueSuat)); // thuế suất đã nhập (kể cả 0%)
const hdKey = r => `${r.ngayMua}|${r.ncc}|${r.hoaDon}`;
const hdNo = so => String(so||'').replace(/^0+(?=\d)/,'');
function aspRate(k, L){ const m=state.settings.aspVatHD||{}; if (k in m) { const v=m[k]; return v===''||v==null||isNaN(+v) ? null : +v; } const r=(L||[]).find(hasTS); if (r) return num(r.thueSuat); if ((L||[]).some(r=>num(r.tienThue))) return null; const v=state.settings.aspVat; return v===''||v==null||isNaN(+v) ? null : +v; }
const isMovedHD = r => r.nkGoc && r.nkGoc!==r.ngayNhap && r.ngayMua && r.ngayNhap<r.ngayMua;
// Hóa đơn có dòng chuyển ngày nhập kho về trước HĐ (dòng chuyển nằm trong kỳ đang xem): dòng chuyển (x / x - SHĐ) → Mua hàng trong nước "Không kèm hóa đơn", thuế khai ở Nghiệp vụ khác;
// các dòng còn lại của cùng hóa đơn → Mua hàng trong nước "Nhận kèm hóa đơn" (có thuế). Tổng 2 sheet = giá trị + thuế của tờ hóa đơn.
function buildASP(){ const it=itemMap(); const keys=[...new Set(aspMoved().map(hdKey))].sort();
  const invs=keys.map(k=>{ const all=state.purchases.filter(r=>!r._new && hdKey(r)===k); const rate=aspRate(k, all); const ov=(state.settings.aspVatHD||{})[k];
    const tax=r=>{ if (ov===undefined && num(r.tienThue)) return Math.round(num(r.tienThue)); return rate==null ? null : Math.round(Math.round(num(r.tt))*rate/100); };
    const mv=all.filter(isMovedHD), kem=all.filter(r=>!isMovedHD(r)); const S=(L,f)=>sum(L,f); const tnull=L=>L.some(r=>tax(r)==null);
    const [d,ncc,so]=k.split('|'); const pick=f=>(all.find(r=>r[f])||{})[f]||'';
    return {k, d, ncc, so, rate, all, mv, kem, tax, gtMv:S(mv,r=>Math.round(num(r.tt))), gtKem:S(kem,r=>Math.round(num(r.tt))), txMv:tnull(mv)?null:S(mv,tax), txKem:tnull(kem)?null:S(kem,tax),
      maNCC:pick('maNCC'), mauSo:pick('mauSo'), kyHieu:pick('kyHieu'), ten:(it[(mv[0]||all[0]).ma]||{}).ten||(mv[0]||all[0]).ma,
      goc:[...new Set(mv.map(r=>r.nkGoc))].sort(), moi:[...new Set(mv.map(r=>r.ngayNhap))].sort()}; });
  // phiếu nhập: cùng ngày nhập + NCC + HĐ + loại (không kèm / kèm HĐ)
  const lines=[]; invs.forEach(x=>{ x.mv.forEach(r=>lines.push({r, x, kem:false})); x.kem.forEach(r=>lines.push({r, x, kem:true})); });
  lines.sort((a,b)=>(a.r.ngayNhap+a.x.ncc+a.x.so+(a.kem?1:0)+a.r.ma).localeCompare(b.r.ngayNhap+b.x.ncc+b.x.so+(b.kem?1:0)+b.r.ma));
  const soPhieu={}, cnt={}; lines.forEach(l=>{ const g=`${l.r.ngayNhap}|${l.x.k}|${l.kem}`; if (soPhieu[g]) return; const d=l.r.ngayNhap; cnt[d]=(cnt[d]||0)+1; soPhieu[g]=`NK${d.slice(0,4)}-${d.slice(5,7)}.${d.slice(8,10)}-${String(cnt[d]).padStart(2,'0')}`; l.first=true; });
  const firstTen={}; lines.forEach(l=>{ const g=`${l.r.ngayNhap}|${l.x.k}|${l.kem}`; if (!firstTen[g]) firstTen[g]=(it[l.r.ma]||{}).ten||l.r.ma; });
  const mh=lines.map((l,i)=>{ const r=l.r, x=l.x, t=it[r.ma]||{}; const g=`${r.ngayNhap}|${x.k}|${l.kem}`; const sl=num(r.sl), tt=Math.round(num(r.tt)); const tx=l.kem?x.tax(r):null;
    return [i+1,'Chưa thanh toán','Chưa thanh toán', l.kem?'Nhận kèm hóa đơn':'Không kèm hóa đơn', r.ngayNhap, r.ngayNhap, soPhieu[g], l.kem?x.mauSo:'', l.kem?x.kyHieu:'', l.kem?x.so:'', l.kem?x.d:'', x.maNCC, x.ncc,
      l.kem ? `Mua ${firstTen[g]} theo HĐ ${x.so}` : `Mua ${firstTen[g]} (nhập kho trước HĐ ${x.so} ngày ${fmtD(x.d)})`, r.ma, t.ten||'', r.kho||t.kho||'152', t.kho||r.kho||'152', 331, t.dvt||'', sl, sl?round(tt/sl,4):0, tt,
      l.kem ? (x.rate==null?'':x.rate) : '', l.kem ? (tx==null?'':tx) : '', 1331, 1, l.kem]; });
  const c2={}; const inv=invs.map(x=>{ c2[x.d]=(c2[x.d]||0)+1; return {...x, soNVK:`NVK${x.d.slice(0,4)}-${x.d.slice(5,7)}.${x.d.slice(8,10)}-${String(c2[x.d]).padStart(2,'0')}`,
      pnCu:x.goc.map(g=>`NK${g.slice(2,4)}${g.slice(5,7)}${g.slice(8,10)}-${hdNo(x.so)}`).join(', '), pnMoi:[...new Set(x.mv.map(r=>soPhieu[`${r.ngayNhap}|${x.k}|false`]))].join(', '),
      gt:x.gtMv+x.gtKem, thue:(x.txMv==null||x.txKem==null)?null:x.txMv+x.txKem}; });
  const nvk=inv.map((x,i)=>[i+1, x.d, x.d, x.soNVK, `Thuế GTGT HĐ ${x.so} – ${x.ncc} (hàng đã nhập kho ${x.moi.map(fmtD).join(', ')})`, `Thuế GTGT đầu vào HĐ ${x.so}`, 1331, 331, x.txMv==null?'':x.txMv, x.maNCC, `Thuế GTGT ${x.ten}`, x.gtMv, x.rate==null?'':x.rate, '', x.txMv==null?'':x.txMv, 1331, x.d, x.so, x.mauSo, x.kyHieu, 1, x.maNCC, x.ncc]);
  const E=v=>v==null?'':v;
  const ds=inv.map(x=>[x.pnCu, x.so, x.gt, x.rate==null?'':x.rate, E(x.thue), x.gt+(x.thue||0), x.d, x.ncc, x.gtMv, E(x.txMv), x.gtKem, E(x.txKem), x.goc.map(fmtD).join(', '), x.moi.map(fmtD).join(', '), x.pnMoi, x.soNVK]);
  const dc=inv.map(x=>{ const sGt=x.gtMv+x.gtKem; const dGt=x.gt-sGt; const dTx=x.thue==null?'':x.thue-((x.txMv||0)+(x.txKem||0));
    return [x.so, x.d, x.ncc, x.gt, E(x.thue), x.gtMv, x.gtKem, E(x.txKem), E(x.txMv), dGt, dTx, x.thue==null ? 'Chưa có % thuế' : (Math.abs(dGt)>1||Math.abs(num(dTx))>1) ? 'Lệch' : (x.gtKem>0 ? 'Khớp – chuyển một phần' : 'Khớp – chuyển toàn bộ')]; });
  return {mh:mh.map(r=>r.slice(0,27)), nvk, ds, dc, inv, n:mh.length, tt:sum(mh,r=>r[22]), tx:sum(mh,r=>num(r[24]))}; }
const DS_COLS = ['Phiếu nhập cũ','Số hóa đơn','Số tiền chưa thuế','% thuế','Thuế','Tổng thanh toán','Ngày hóa đơn','Nhà cung cấp','Nhập trước HĐ (không kèm HĐ)','Thuế khai NVK','Nhập theo HĐ (kèm HĐ)','Thuế kèm HĐ','Ngày nhập kho cũ','Ngày nhập kho mới','Phiếu nhập mới (không kèm HĐ)','Số chứng từ NVK'];
const DC_COLS = ['Số hóa đơn','Ngày hóa đơn','Nhà cung cấp','Giá trị HĐ','Thuế HĐ','Mua hàng – không kèm HĐ','Mua hàng – kèm HĐ','Thuế sheet Mua hàng','Thuế sheet NVK','Chênh lệch giá trị','Chênh lệch thuế','Kết quả'];
function sheetASP(hdr, rows, dateIdx, widths){ const aoa = hdr.concat(rows.map(r=>r.map((v,i)=> dateIdx.includes(i) && typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v+'T00:00:00') : v))); const ws=XLSX.utils.aoa_to_sheet(aoa, {cellDates:true}); const n=hdr.length;
  for (let r=0;r<rows.length;r++) for (const c of dateIdx) { const a=XLSX.utils.encode_cell({r:n+r,c}); if (ws[a] && ws[a].t==='d') ws[a].z='dd/mm/yyyy'; } ws['!cols']=widths.map(w=>({wch:w})); return ws; }
function sheetWithDates(hdr, rows){ const aoa = hdr.concat(rows.map(r=>r.map((v,i)=> (i===1||i===2) && typeof v==='string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v+'T00:00:00') : v))); const ws=XLSX.utils.aoa_to_sheet(aoa, {cellDates:true}); const n=hdr.length; for (let r=0;r<rows.length;r++) for (const c of [1,2]) { const a=XLSX.utils.encode_cell({r:n+r,c}); if (ws[a]) { ws[a].t='d'; ws[a].z='dd/mm/yyyy'; } } ws['!cols']=[20,16,16,18,12,18,34,12,34,8,8,8,8,12,16,24].map(w=>({wch:w})); return ws; }
function vXuatPhieu(m){
  const p=P(); if(!p) return noData(m); const tab=m.dataset.ptab||'xk'; const xk=buildXK(p), nk=buildNK(p); const k=ktSettings();
  const prev = (rows, hdr) => `<div class="tw"><table><thead><tr>${hdr[hdr.length-1].map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.slice(0,400).map(r=>`<tr>${r.map((v,i)=>`<td class="${i===13?'n':''}">${esc((i===1||i===2)?fmtD(v):(i===13?fmtQ(v):v))}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${rows.length>400?`<div class="small mut">Chỉ xem trước 400/${rows.length} dòng – tệp xuất có đủ.</div>`:''}`;
  m.innerHTML = head(`File tải dữ liệu kế toán (mẫu ASP)`, `<button class="btn p" id="exBoth">${IC('xlOut')}Xuất Excel</button>`) +
  `<div class="tabs"><button data-t="xk" class="${tab==='xk'?'act':''}">Phiếu xuất kho NVL (XK NVL)</button><button data-t="nk" class="${tab==='nk'?'act':''}">Phiếu nhập kho TP (NK TP)</button><button data-t="mh" class="${tab==='mh'?'act':''}">File tải hóa đơn chuyển ngày nhập kho</button></div>` + (tab==='xk' ? prev(xk, XK_HDR) : tab==='nk' ? prev(nk, NK_HDR) : (()=>{ const a=buildASP(); const st=['mh','nvk','ds','dc'].includes(m.dataset.atab)?m.dataset.atab:'ds';
    const sub=`<div class="subtabs">${[['mh','Mua hàng trong nước'],['nvk','Nghiệp vụ khác'],['ds','DS HĐ chuyển ngày'],['dc','Đối chiếu HĐ']].map(([k,t])=>`<button data-at="${k}" class="${st===k?'act':''}">${t}</button>`).join('')}</div>`;
    if (!a.n) return sub+`<div class="box" style="text-align:center;padding:18px"><span class="pill ok" style="font-size:var(--fs);padding:6px 14px">Kỳ ${esc(fmtKy(selKy))} không có phiếu mua chuyển ngày nhập kho về trước hóa đơn</span></div>`;
    const T=(cols, rows, fmt, tot)=>`<div class="tw"><table><thead><tr>${cols.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((v,i)=>fmt(v,i,r)).join('')}</tr>`).join('')}${tot||''}</tbody></table></div>`;
    const td=(v,cls)=>`<td class="${cls||''}">${v}</td>`; const nN=v=>td(v===''?'':fmtN(v),'n'); const dD=v=>td(fmtD(v));
    if (st==='mh') { const H=MH_HDR[MH_HDR.length-1]; return sub+T(H, a.mh, (v,i)=> [4,5,10].includes(i)?dD(v) : i===20?td(fmtQ(v),'n') : [21,22,24].includes(i)?nN(v) : td(esc(v)), `<tr class="tot"><td>Tổng cộng</td>${H.slice(1).map((_,i)=>i===21?`<td class="n">${fmtN(a.tt)}</td>`:i===23?`<td class="n">${fmtN(a.tx)}</td>`:'<td></td>').join('')}</tr>`); }
    if (st==='nvk') { const H=NVK_HDR[NVK_HDR.length-1]; return sub+T(H, a.nvk, (v,i)=> [1,2,16].includes(i)?dD(v) : [8,11,14].includes(i)?nN(v) : td(esc(v)), `<tr class="tot"><td>Tổng cộng</td>${H.slice(1).map((_,i)=>i===7?`<td class="n">${fmtN(sum(a.inv,x=>x.txMv||0))}</td>`:i===10?`<td class="n">${fmtN(sum(a.inv,x=>x.gtMv))}</td>`:i===13?`<td class="n">${fmtN(sum(a.inv,x=>x.txMv||0))}</td>`:'<td></td>').join('')}</tr>`); }
    if (st==='ds') return sub+`<div class="small" style="margin:4px 0 6px">% thuế mặc định <input id="aspVat" style="width:56px" inputmode="decimal" value="${esc(state.settings.aspVat??'')}" placeholder="trống"> <span class="mut">– sửa % thuế từng hóa đơn ở cột "% thuế"</span></div>` +
      T(DS_COLS, a.ds, (v,i,r)=> i===3 ? `<td class="n"><input class="aspR" data-k="${esc(a.inv[a.ds.indexOf(r)].k)}" title="Sửa % thuế của hóa đơn này" style="width:52px;text-align:right;border:none;background:transparent;outline:none;font:inherit" inputmode="decimal" value="${v===''?'':v}"></td>` : [2,4,5,8,9,10,11].includes(i)?nN(v) : i===6?dD(v) : td(esc(v)),
        `<tr class="tot"><td>Tổng cộng</td>${DS_COLS.slice(1).map((_,j)=>{ const i=j+1; return [2,4,5,8,9,10,11].includes(i)?`<td class="n">${fmtN(sum(a.ds,r=>num(r[i])))}</td>`:'<td></td>'; }).join('')}</tr>`);
    return sub+T(DC_COLS, a.dc, (v,i)=> [3,4,5,6,7,8,9,10].includes(i)?nN(v) : i===1?dD(v) : i===11?td(esc(v), /^Khớp/.test(v)?'':'mut') : td(esc(v)),
      `<tr class="tot"><td>Tổng cộng</td><td></td><td></td>${[3,4,5,6,7,8,9,10].map(i=>`<td class="n">${fmtN(sum(a.dc,r=>num(r[i])))}</td>`).join('')}<td></td></tr>`); })());
  bindKy(); m.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>{ m.dataset.ptab=b.dataset.t; render(); });
  const mk = (which) => { if (typeof XLSX==='undefined') return toast('Thư viện Excel chưa tải được'); const wb=XLSX.utils.book_new(); if (which!=='nk') XLSX.utils.book_append_sheet(wb, sheetWithDates(XK_HDR, xk), 'XK NVL'); if (which!=='xk') XLSX.utils.book_append_sheet(wb, sheetWithDates(NK_HDR, nk), 'NK TP'); saveWb(wb, `${which==='xk'?'Misa_XK_NVL':which==='nk'?'Misa_NK_TP':'Misa_Phieu_kho'}_${selKy}.xlsx`); };
  $('#exBoth').onclick=()=> tab==='mh' ? mkAsp() : mk('both');
  const mkAsp = () => { if (typeof XLSX==='undefined') return toast('Thư viện Excel chưa tải được'); const a=buildASP(); if (!a.n) return toast('Kỳ này không có phiếu mua chuyển ngày nhập kho về trước hóa đơn');
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, sheetASP(MH_HDR, a.mh, [4,5,10], [6,16,16,18,14,14,22,10,10,12,12,14,36,40,12,34,8,10,10,8,10,12,14,8,12,8,8]), 'Mua hang trong nuoc ');
    XLSX.utils.book_append_sheet(wb, sheetASP(NVK_HDR, a.nvk, [1,2,16], [6,14,14,20,50,30,8,8,14,12,30,16,8,8,14,8,14,14,10,10,8,12,40]), 'Nghiep vu khac');
    const tot=(n, idx)=>{ const r=new Array(n).fill(''); r[0]='Tổng cộng'; return r; };
    const dsTot=tot(DS_COLS.length); [2,4,5,8,9,10,11].forEach(i=>dsTot[i]=sum(a.ds,r=>num(r[i])));
    XLSX.utils.book_append_sheet(wb, sheetASP([DS_COLS], a.ds.concat([dsTot]), [6], [20,14,16,8,14,16,14,40,18,14,18,14,18,18,24,20]), 'DS HD chuyen ngay');
    const dcTot=tot(DC_COLS.length); [3,4,5,6,7,8,9,10].forEach(i=>dcTot[i]=sum(a.dc,r=>num(r[i])));
    XLSX.utils.book_append_sheet(wb, sheetASP([DC_COLS], a.dc.concat([dcTot]), [1], [14,14,40,16,14,18,18,16,16,14,14,22]), 'Doi chieu HD');
    saveWb(wb, `File_tai_HD_chuyen_ngay_nhap_kho_${selKy}.xlsx`); };
  m.querySelectorAll('[data-at]').forEach(b=>b.onclick=()=>{ m.dataset.atab=b.dataset.at; render(); });
  const pv=v=>{ v=String(v).trim().replace(',','.').replace('%',''); return v==='' ? '' : (isNaN(+v) ? null : +v); };
  const av=$('#aspVat'); if (av) av.onchange=()=>{ const v=pv(av.value); if (v===null) return toast('% thuế không hợp lệ'); state.settings.aspVat=v; changed(); render(); };
  m.querySelectorAll('.aspR').forEach(inp=>inp.onchange=()=>{ const v=pv(inp.value); if (v===null) return toast('% thuế không hợp lệ'); const mm={...(state.settings.aspVatHD||{})}; if (v==='') delete mm[inp.dataset.k]; else mm[inp.dataset.k]=v; state.settings.aspVatHD=mm; changed(); render(); });
}


