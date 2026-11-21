//# Bộ máy tính: giá vốn BQ, trải định mức, NVL thay thế, 621/622/627/154, NXT
// ---------- Tính toán ----------
function itemMap(){ const m={}; state.items.forEach(i=>m[i.ma]=i); return m; }
function allKys(){
  const s = new Set();
  const add = v => { const k=kyOf(v); if (k && /^\d{4}-\d{2}$/.test(k)) s.add(k); };
  state.purchases.forEach(r=>add(r.ngayNhap)); state.sales.forEach(r=>add(r.ngay)); state.plan.forEach(r=>add(r.ngaySX)); state.orders.forEach(r=>{add(r.ngayXuatNVL); add(r.ngaySX);}); state.issues.forEach(r=>add(r.ngay));
  Object.keys(state.costs).forEach(k=>add(k));
  if (state.settings.startKy) s.add(state.settings.startKy);
  return [...s].sort();
}
function periodList(){
  let ks = allKys();
  if (!ks.length) { const y=workYear(); if (isRange(selKy)) { const r=rangeOf(selKy); ks=[r.from.slice(0,7), r.to.slice(0,7)]; } else if (selKy && selKy.length===7) ks=[selKy]; else ks=[`${y}-01`,`${y}-12`]; if (state.settings.startKy && state.settings.startKy<ks[0]) ks.unshift(state.settings.startKy); }
  let start = state.settings.startKy || ks[0]; const selEnd = isRange(selKy) ? rangeOf(selKy).to.slice(0,7) : (selKy||''); const end = ks[ks.length-1] > selEnd ? ks[ks.length-1] : (selEnd || ks[ks.length-1]);
  const out=[]; let k=start; let guard=0; while (k <= end && guard++<600) { out.push(k); k=nextKy(k); }
  return out;
}
const isRange = k => typeof k==='string' && k.startsWith('R:');
const rangeOf = k => { const [,a,b]=k.split(':'); return {from:a, to:b}; };
function selHas(d){ if(!d) return false; if (isRange(selKy)) { const r=rangeOf(selKy); return d>=r.from && d<=r.to; } return selKy.length===4 ? d.startsWith(selKy) : d.startsWith(selKy); }
function selKyHas(ky){ if(!ky) return false; if (isRange(selKy)) { const r=rangeOf(selKy); return ky>=r.from.slice(0,7) && ky<=r.to.slice(0,7); } return selKy.length===4 ? ky.startsWith(selKy) : ky===selKy; }
function periodEnd(){ if (!selKy) return '9999-12-31'; if (isRange(selKy)) return rangeOf(selKy).to; return selKy.length===4 ? `${selKy}-12-31` : `${selKy}-${String(daysInMonth(selKy)).padStart(2,'0')}`; }
function bomFor(maTP, loai, date){ const d = date || periodEnd(); return state.bom.filter(b=>b.maTP===maTP && (b.loai||'DM')===(loai||'DM') && (!b.tuNgay || d>=b.tuNgay) && (!b.denNgay || d<=b.denNgay)); }
function expandBom(maTP, loai, ngaySX){
  // trả về các dòng NVL sau khi áp dụng thay thế (giống công thức Gia thanh)
  const lines=[]; const rows = bomFor(maTP, loai, ngaySX);
  rows.forEach(b=>{
    const cand = state.subs.filter(s=>s.maNVL===b.maNVL && s.maThayThe && s.tuNgay && ngaySX>=s.tuNgay && ngaySX<=(s.denNgay||'9999-12-31') && (!s.maTP || s.maTP===maTP));
    const rule = cand.find(s=>s.maTP===maTP) || cand[0] || null;
    const src = rule || b;
    let rr = num(src.tyLe); if (rr>1) rr = rr/100; if (!rr) rr = 1;
    const tu = src.tuNgay, den = src.denNgay || '9999-12-31';
    const act = src.maThayThe && tu && ngaySX >= tu && ngaySX <= den;
    b = Object.assign({}, b, {maThayThe: src.maThayThe, tyLe: src.tyLe});
    if (!act) lines.push({maVT:b.maNVL, dm:num(b.slNVL), haoHut:num(b.haoHut), bom:b});
    else if (rr>=1) lines.push({maVT:b.maThayThe, dm:num(b.slNVL), haoHut:num(b.haoHut), bom:b, thayThe:true});
    else { lines.push({maVT:b.maNVL, dm:num(b.slNVL)*(1-rr), haoHut:num(b.haoHut), bom:b}); lines.push({maVT:b.maThayThe, dm:num(b.slNVL)*rr, haoHut:num(b.haoHut), bom:b, thayThe:true}); }
  });
  return {lines, slTP: rows.length ? num(rows[0].slTP) : 0, lanNgay: rows.length ? num(rows[0].lanNgay) : 0};
}
function calc(){
  if (calcCache) return calcCache;
  const items = itemMap(); const periods = periodList(); const res = {periods:{}, list:periods, warnings:[]};
  const tpSet = new Set(state.items.filter(i=>i.nhom==='Thành phẩm').map(i=>i.ma));
  state.orders.forEach(o=>tpSet.add(o.maTP));
  adjResolveAll(); const adjMap = {}; state.adjustments.forEach(a=>{ const k=a.maLenh+'|'+a.maVT; adjMap[k]=(adjMap[k]||0)+num(a.dieuChinh); });
  const adjByLenh = {}; Object.entries(adjMap).forEach(([k,v])=>{ const i=k.indexOf('|'); const l=k.slice(0,i), ma=k.slice(i+1); if (ma) (adjByLenh[l]=adjByLenh[l]||[]).push([ma, v]); });
  const orderByCode = {}; state.orders.forEach(o=>orderByCode[o.maLenh]=o);
  state.adjustments.forEach(a=>{ if(!orderByCode[a.maLenh]) res.warnings.push({loai:'Cân đối NVL', ma:a.maLenh, nd:`Điều chỉnh ${a.maVT} tham chiếu lệnh không tồn tại`}); });
  let prevClose = null; let prevGiaVon = {}; const pendingTP = {}; // TP nhập kho ở kỳ sau (ngaySX khác kỳ xuất NVL)
  const allCodes = new Set([...Object.keys(items)]);
  periods.forEach(ky=>{
    const P = {ky, open:{}, nhap:{}, xuat:{}, close:{}, giaVon:{}, nhapSX:{}, xuatSX:{}, xuatBan:{}, xuatChung:{}, orders:[], lines:[], sales:[], cost: state.costs[ky]||{}, rates:{r622:0,r627:0}, sum621:0, sum622:0, sum627:0, sum154:0, slSX:0, doanhSo:0, lai:0, nxt:[], chungRows:[], c627chung:0, c641:0};
    // Tồn đầu
    if (prevClose===null) { const op = (state.opening.ky===ky) ? state.opening.rows : {}; for (const ma in op) P.open[ma]={sl:op[ma].sl, tt:op[ma].tt}; if (state.opening.ky && state.opening.ky!==ky && ky===periods[0]) res.warnings.push({loai:'Tồn đầu', ma:'', nd:`Kỳ tồn đầu (${fmtKy(state.opening.ky)}) khác kỳ bắt đầu (${fmtKy(ky)})`}); }
    else for (const ma in prevClose) P.open[ma]={sl:prevClose[ma].sl, tt:prevClose[ma].tt};
    const O = ma => P.open[ma] || {sl:0, tt:0};
    const addNhap = (ma, sl, tt) => { const x=P.nhap[ma]||(P.nhap[ma]={sl:0,tt:0}); x.sl+=sl; x.tt+=tt; allCodes.add(ma); };
    const addXuat = (ma, sl) => { P.xuat[ma]=(P.xuat[ma]||0)+sl; allCodes.add(ma); };
    // Mua hàng
    state.purchases.filter(r=>kyOf(r.ngayNhap)===ky).forEach(r=>{ addNhap(r.ma, num(r.sl), num(r.tt)); if(!items[r.ma]) res.warnings.push({loai:'Mua hàng', ma:r.ma, nd:`Mã ${r.ma} chưa có trong danh mục (ngày ${fmtD(r.ngayNhap)})`}); });
    // TP nhập chờ từ kỳ trước
    if (pendingTP[ky]) pendingTP[ky].forEach(x=>addNhap(x.ma, x.sl, x.tt));
    // Giá vốn NVL (bình quân kỳ)
    // Bình quân gia quyền kỳ. Tồn đầu âm / bằng 0 thì không đưa vào bình quân (tránh giá âm hoặc giá ảo): lấy giá nhập trong kỳ, không nhập thì lấy giá kỳ trước
    const giaVon = ma => { const o=O(ma), n=P.nhap[ma]||{sl:0,tt:0};
      if (o.sl>0) { const den=o.sl+n.sl; if (den>0) { const g=(o.tt+n.tt)/den; if (g>=0) return g; } }
      if (n.sl>0 && n.tt>=0) return n.tt/n.sl;
      if (o.sl>0 && o.tt>0) return o.tt/o.sl;
      if (prevGiaVon[ma]>0) return prevGiaVon[ma];
      return (o.sl<0 && o.tt<0) ? o.tt/o.sl : 0; };
    allCodes.forEach(ma=>P.giaVon[ma]=giaVon(ma));
    // Lệnh SX trong kỳ (theo ngày xuất NVL)
    const ords = state.orders.filter(o=>kyOf(o.ngayXuatNVL)===ky).sort((a,b)=>(a.ngayXuatNVL+a.maLenh).localeCompare(b.ngayXuatNVL+b.maLenh));
    P.chungRows = state.issues.filter(r=>kyOf(r.ngay)===ky).map(r=>{ const gv=P.giaVon[r.maVT]||0; const is627=isChung627(r); return {ngay:r.ngay, maPhieu:r.maPhieu, maVT:r.maVT, sl:num(r.sl), loai:is627?'627':'641', gv, tt:num(r.sl)*gv}; });
    P.c627chung = sum(P.chungRows.filter(x=>x.loai==='627'),x=>x.tt); P.c641 = sum(P.chungRows.filter(x=>x.loai==='641'),x=>x.tt);
    const cost = P.cost; const c622 = costSum(cost,'622'); const c627 = costSum(cost,'627') + P.c627chung;
    const usesTP = ords.some(o=>expandBom(o.maTP,o.loaiDM,o.ngaySX).lines.some(l=>tpSet.has(l.maVT)));
    const iters = usesTP ? 6 : 1;
    let orders=[], lines=[];
    for (let it=0; it<iters; it++) {
      orders=[]; lines=[]; const tpNhap={};
      ords.forEach(o=>{
        const ex = expandBom(o.maTP, o.loaiDM, o.ngaySX);
        const soMe = num(o.soMeKH)+num(o.dieuChinhMe); const slTH = round(soMe*ex.slTP, 6);
        const ord = {o, maLenh:o.maLenh, ngaySX:o.ngaySX, ngayXuatNVL:o.ngayXuatNVL, maTP:o.maTP, loaiDM:o.loaiDM||'DM', soMe, slTP:ex.slTP, slTH, c621:0, c622:0, c627:0, c154:0, lines:[], status:'Đủ'};
        if (!ex.lines.length) { ord.status='Thiếu định mức'; }
        ex.lines.forEach(l=>{
          const slDM = round(l.dm*soMe, 2); const dc = adjMap[o.maLenh+'|'+l.maVT]||0; const tong = slDM+dc; const dg = P.giaVon[l.maVT] ?? 0;
          const ln = {maLenh:o.maLenh, ngayXuatNVL:o.ngayXuatNVL, ngaySX:o.ngaySX, maTP:o.maTP, loaiDM:ord.loaiDM, slTH, nLoai:ex.lines.length, haoHut:l.haoHut||0, maVT:l.maVT, dm:l.dm, soMe, slDM, dc, tong, dg, tt:tong*dg, thayThe:!!l.thayThe};
          if (tong>0 && !dg) ord.status = ord.status==='Đủ' ? 'Thiếu giá vốn NVL' : ord.status;
          if (!items[l.maVT]) ord.status = 'Thiếu mã NVL';
          ord.c621 += ln.tt; ord.lines.push(ln); lines.push(ln);
        });
        // cân đối (+) cho NVL không có trong định mức của lệnh (vd dùng NVL thay thế một phần) → thêm dòng xuất
        (adjByLenh[o.maLenh]||[]).forEach(([ma,dc])=>{ if (ex.lines.some(l=>l.maVT===ma) || !(dc>0)) return; const dg = P.giaVon[ma] ?? 0;
          const ln = {maLenh:o.maLenh, ngayXuatNVL:o.ngayXuatNVL, ngaySX:o.ngaySX, maTP:o.maTP, loaiDM:ord.loaiDM, slTH, nLoai:ex.lines.length, haoHut:0, maVT:ma, dm:0, soMe, slDM:0, dc, tong:dc, dg, tt:dc*dg, thayThe:true, ngoaiDM:true};
          if (dc>0 && !dg) ord.status = ord.status==='Đủ' ? 'Thiếu giá vốn NVL' : ord.status;
          ord.c621 += ln.tt; ord.lines.push(ln); lines.push(ln); });
        orders.push(ord);
      });
      const sum621 = sum(orders, x=>x.c621);
      P.rates.r622 = sum621 ? c622/sum621 : 0; P.rates.r627 = sum621 ? c627/sum621 : 0;
      const sumSL = sum(orders, x=>x.slTH); const b622=(state.settings.pb622||state.settings.pbBasis||'kg'), b627=(state.settings.pb627||state.settings.pbBasis||'kg'); const byKg = b627==='kg' && sumSL>0;
      P.rates.k622 = sumSL ? c622/sumSL : 0; P.rates.k627 = sumSL ? c627/sumSL : 0; P.pbKg = byKg;
      orders.forEach(ord=>{ const w622 = (b622==='kg' && sumSL>0) ? ord.slTH/sumSL : (sum621 ? ord.c621/sum621 : 0); const w627 = byKg ? ord.slTH/sumSL : (sum621 ? ord.c621/sum621 : 0); ord.c622 = c622*w622; ord.c627 = c627*w627; ord.c154 = ord.c621+ord.c622+ord.c627; ord.lines.forEach(ln=>{ const sh = ord.c621 ? ln.tt/ord.c621 : 0; ln.c622=ord.c622*sh; ln.c627=ord.c627*sh; ln.c154=ln.tt+ln.c622+ln.c627; });
        const k = kyOf(ord.ngaySX)||ky; if (k<=ky) { const x=tpNhap[ord.maTP]||(tpNhap[ord.maTP]={sl:0,tt:0}); x.sl+=ord.slTH; x.tt+=ord.c154; } });
      // cập nhật giá vốn TP để lặp (chỉ TP; NVL không đổi)
      for (const ma in P.nhap) if (P.nhapSX[ma]) { P.nhap[ma].sl -= P.nhapSX[ma].sl; P.nhap[ma].tt -= P.nhapSX[ma].tt; }
      P.nhapSX = tpNhap; for (const ma in tpNhap) addNhap(ma, tpNhap[ma].sl, tpNhap[ma].tt);
      allCodes.forEach(ma=>P.giaVon[ma]=giaVon(ma));
    }
    // TP nhập kho kỳ sau
    orders.forEach(ord=>{ const k=kyOf(ord.ngaySX); if (k>ky) { (pendingTP[k]=pendingTP[k]||[]).push({ma:ord.maTP, sl:ord.slTH, tt:ord.c154}); res.warnings.push({loai:'Lệnh SX', ma:ord.maLenh, nd:`Ngày SX (${fmtD(ord.ngaySX)}) thuộc kỳ sau kỳ xuất NVL – TP nhập kho ở kỳ ${fmtKy(k)}`}); } });
    P.orders = orders; P.lines = lines;
    P.sum621 = sum(orders,x=>x.c621); P.sum622 = sum(orders,x=>x.c622); P.sum627 = sum(orders,x=>x.c627); P.sum154 = sum(orders,x=>x.c154); P.slSX = sum(orders,x=>x.slTH);
    orders.forEach(ord=>{ if (ord.status!=='Đủ') res.warnings.push({loai:'Lệnh SX', ma:ord.maLenh, nd:`${ord.maLenh} (${ord.maTP}, ${ord.loaiDM}): ${ord.status}`}); });
    // Xuất
    lines.forEach(ln=>{ addXuat(ln.maVT, ln.tong); P.xuatSX[ln.maVT]=(P.xuatSX[ln.maVT]||0)+ln.tong; });
    state.issues.filter(r=>kyOf(r.ngay)===ky).forEach(r=>{ addXuat(r.maVT, num(r.sl)); P.xuatChung[r.maVT]=(P.xuatChung[r.maVT]||0)+num(r.sl); });
    state.sales.filter(r=>kyOf(r.ngay)===ky).forEach(r=>{
      const sl=num(r.sl), ds=num(r.doanhSo); addXuat(r.ma, sl); P.xuatBan[r.ma]=(P.xuatBan[r.ma]||0)+sl;
      const gv = P.giaVon[r.ma]||0; const gb = sl ? ds/sl : 0; const lai = sl*(gb-gv);
      P.sales.push({r, ngay:r.ngay, ma:r.ma, sl, ds, gb, gv, lai, tl: gb ? (gb-gv)/gb : 0, status: items[r.ma] ? 'Hợp lệ' : 'Thiếu mã NXT'});
      if (!items[r.ma]) res.warnings.push({loai:'Bán hàng', ma:r.ma, nd:`Mã ${r.ma} chưa có trong danh mục (ngày ${fmtD(r.ngay)})`});
      P.doanhSo += ds; P.lai += lai;
    });
    // Tồn cuối. Bình quân/ngày chia cho số ngày đã có dữ liệu (đến ngày chứng từ cuối trong tháng), không chia cho cả tháng
    const lastOrder = ords.map(o=>o.ngaySX).sort().pop();
    const lastDate = lastOrder || [ ...state.purchases.filter(r=>kyOf(r.ngayNhap)===ky).map(r=>r.ngayNhap), ...state.sales.filter(r=>kyOf(r.ngay)===ky).map(r=>r.ngay), ...state.issues.filter(r=>kyOf(r.ngay)===ky).map(r=>r.ngay) ].sort().pop();
    const dim = lastDate ? Math.max(1, Number(lastDate.slice(8,10))) : daysInMonth(ky);
    P.daysData = dim;
    allCodes.forEach(ma=>{
      const o=O(ma), n=P.nhap[ma]||{sl:0,tt:0}, xs=P.xuat[ma]||0, gv=P.giaVon[ma]||0; const xt = xs*gv;
      const cs = round(o.sl+n.sl-xs, 6); const ct = cs===0 ? 0 : (cs<0 || o.sl<0) ? Math.round(cs*gv) : Math.round(o.tt+n.tt-xt); // tồn âm / tồn đầu âm: định giá theo giá vốn kỳ
      P.close[ma]={sl:cs, tt:ct};
      const it = items[ma]||{ma, ten:'(chưa có trong danh mục)', nhom:'', dvt:'', kho:''};
      const isTP = it.nhom==='Thành phẩm';
      const bq = (isTP ? (P.xuatBan[ma]||0) : ((P.xuatSX[ma]||0)+(P.xuatChung[ma]||0)))/dim;
      const days = bq>0 ? Math.max(0, cs/bq) : null;
      const canLay5 = (!isTP && bq>0) ? Math.max(0, bq*5-cs) : 0;
      const dmCount = state.bom.filter(b=>b.maNVL===ma || b.maThayThe===ma).length + state.subs.filter(s=>s.maNVL===ma || s.maThayThe===ma).length;
      const st=[]; const db = ['PG','GV','BB'].includes(it.nhom);
      if (cs<0) st.push('Âm kho - xử lý ngay');
      if (!isTP && dmCount===0 && it.nhom) st.push('Chưa xây dựng định mức');
      if (isTP && o.sl+n.sl>0 && xs===0) st.push('TP có SX - chưa bán ra');
      if (cs>=0 && bq>0) {
        if (isTP) { if (days<7) st.push('Tồn TP thấp - tăng SX'); else if (days>30) st.push('Giảm SX TP - Tăng cường bán ra'); }
        else if (canLay5>0) st.push('Tồn thấp - cần mua');
        else if (it.nhom==='NVLC' && days>90) st.push('Tồn trên 3 tháng - không mua thêm (NVL quá dư)');
        else if (!db && days>30) st.push('Tồn trên 1 tháng - SX thêm TP (hạn chế mua)');
      }
      if (db && days!=null && days>180 && days<=365) st.push('Tồn trên 6 tháng - rủi ro tồn lâu');
      if (db && days!=null && days>365) st.push('Tồn trên 1 năm - không mua thêm (NVL quá dư)');
      P.nxt.push({ma, ten:it.ten, nhom:it.nhom, dvt:it.dvt, kho:it.kho, gv, openSL:o.sl, openTT:o.tt, nhapSL:n.sl, nhapTT:n.tt, xuatSL:xs, xuatTT:xt, closeSL:cs, closeTT:ct, bq, days, canLay5, status: cs===0 ? '' : st.join(', ')});
    });
    P.tonCuoi = sum(P.nxt, x=>x.closeTT);
    const order = {'Thành phẩm':0,'NVLC':1,'PG':2,'GV':3,'BB':4}; P.nxt.sort((a,b)=>((order[a.nhom]??9)-(order[b.nhom]??9)) || a.ma.localeCompare(b.ma));
    // Tồn NVL cuối ngày cho từng dòng xuất (open + mua ≤ ngày − xuất ≤ ngày)
    const ev = {}; const push=(ma,d,q)=>{ (ev[ma]=ev[ma]||[]).push([d,q]); };
    state.purchases.filter(r=>kyOf(r.ngayNhap)===ky).forEach(r=>push(r.ma, r.ngayNhap, num(r.sl)));
    lines.forEach(l=>push(l.maVT, l.ngayXuatNVL, -l.tong));
    state.issues.filter(r=>kyOf(r.ngay)===ky).forEach(r=>push(r.maVT, r.ngay, -num(r.sl)));
    state.sales.filter(r=>kyOf(r.ngay)===ky).forEach(r=>push(r.ma, r.ngay, -num(r.sl)));
    for (const ma in P.nhapSX) orders.filter(x=>x.maTP===ma && kyOf(x.ngaySX)===ky).forEach(x=>push(ma, x.ngaySX, x.slTH));
    lines.forEach(l=>{ const e=ev[l.maVT]||[]; l.tonNgay = round(O(l.maVT).sl + sum(e.filter(x=>x[0]<=l.ngayXuatNVL), x=>x[1]), 6); });
    res.periods[ky]=P; prevClose = P.close; prevGiaVon = P.giaVon;
  });
  // cảnh báo tồn âm kỳ chọn
  calcCache = res; calcCacheVer = dataVer; return res;
}

