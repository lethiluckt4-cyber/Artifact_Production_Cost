// ---- [B] Tính giá thành – Công ty Thiên Hồng ----
// Cấp sản xuất: NVL mua = 0; sản phẩm = 1 + cấp cao nhất của NVL trong định mức (BTP_BGK/BTP_KT = 1, BTP_BGKT = 2, TP đóng gói = 3)
function prodLevels(){
  const lv = {}; const tps = [...new Set(state.bom.map(b=>b.maTP))];
  const get = (ma, depth=0) => { if (lv[ma]!=null) return lv[ma]; if (depth>20) return 0; const rows=state.bom.filter(b=>b.maTP===ma); if (!rows.length) return (lv[ma]=0); let m=0; rows.forEach(b=>{ m=Math.max(m, get(b.maNVL, depth+1)); if (b.maThayThe) m=Math.max(m, get(b.maThayThe, depth+1)); }); return (lv[ma]=m+1); };
  tps.forEach(t=>get(t)); return lv;
}
// Cỡ mẻ: định mức có "SL thành phẩm/lần làm" > 1 → sản xuất theo mẻ (bánh khô, kem tươi 100 kg/mẻ)
function batchSize(maTP, date){ const rows=bomFor(maTP, 'DM', date); const s=rows.length?num(rows[0].slTP):0; return s>1 ? s : 0; }
// Định mức cho 1 đơn vị sản phẩm (Số lượng/SP = SL NVL/lần ÷ SL TP/lần)
function dmPerUnit(maTP, maNVL, date){ return sum(bomFor(maTP,'DM',date).filter(b=>b.maNVL===maNVL), b=>num(b.slTP)?num(b.slNVL)/num(b.slTP):0); }
// Sắp xếp lệnh như sheet Lệnh SX: ngày SX → cấp sản phẩm → thứ tự mã lệnh
function sortedOrders(lv){ lv=lv||prodLevels(); return state.orders.slice().sort((a,b)=>(a.ngaySX||'').localeCompare(b.ngaySX||'') || ((lv[a.maTP]||0)-(lv[b.maTP]||0)) || String(a.maLenh).localeCompare(String(b.maLenh))); }
// SL thực hiện (cột M sheet Lệnh SX): TP = SL kế hoạch + điều chỉnh thùng; BTP = lũy kế kế hoạch + phần điều chỉnh TP quy đổi (làm tròn xuống theo mẻ) − đã thực hiện trước đó
function computeSLTH(){
  const items=itemMap(); const lv=prodLevels(); const ords=sortedOrders(lv); const res={};
  const finals = [...new Set(state.orders.filter(o=>isFinal(items[o.maTP])).map(o=>o.maTP))];
  const manualTP = o => (o.nguon==='Tay'||o.nguon==='PM+tay'||o.nguon==='Excel+tay') ? num(o.slKH)-num(o.slDX) : 0; // thùng sửa tay / thêm tay so với đề xuất → bán thành phẩm tự tính lại
  const adjTP = {}; finals.forEach(f=>adjTP[f]=state.orders.filter(o=>o.maTP===f && (num(o.dieuChinhTP)||manualTP(o))).map(o=>[o.ngaySX, num(o.dieuChinhTP)+manualTP(o)]));
  const cumAdj = (f, d) => sum((adjTP[f]||[]).filter(x=>x[0]<=d), x=>x[1]);
  const consumers = ma => [...new Set(state.bom.filter(b=>b.maNVL===ma).map(b=>b.maTP))];
  const chenh = (ma, d, depth=0) => { if (depth>10) return 0; let raw=0; consumers(ma).forEach(c=>{ const q=dmPerUnit(c, ma, d); if (!q) return; raw += isFinal(items[c]) ? cumAdj(c,d)*q : chenh(c,d,depth+1)*q; }); const bs=batchSize(ma, d); return bs ? Math.trunc(raw/bs)*bs : raw; };
  const hasAdj = finals.some(f=>(adjTP[f]||[]).length);
  const cumKH = {}; const kh = {}; state.orders.forEach(o=>{ (kh[o.maTP]=kh[o.maTP]||[]).push([o.ngaySX, num(o.slKH)]); });
  const done = {};
  ords.forEach(o=>{
    let sl;
    if (isFinal(items[o.maTP]) || !items[o.maTP]) sl = Math.max(0, num(o.slKH) + num(o.dieuChinhTP));
    else { const k = sum((kh[o.maTP]||[]).filter(x=>x[0]<=o.ngaySX), x=>x[1]); const dich = Math.max(0, k + (hasAdj ? chenh(o.maTP, o.ngaySX) : 0)); sl = Math.max(0, round(dich - (done[o.maTP]||0), 9)); }
    done[o.maTP] = (done[o.maTP]||0) + sl;
    const bs = batchSize(o.maTP, o.ngaySX);
    res[o._id] = {slTH: sl, soMeTH: bs ? sl/bs : 0, soMeKH: bs ? num(o.slKH)/bs : 0, bs, cd: (lv[o.maTP]||0) && !isFinal(items[o.maTP]) ? 'BT' : 'TP'};
  });
  return res;
}
// Ngày làm việc (Thứ 2–Thứ 7, trừ ngày nghỉ lễ/chờ việc; Chủ nhật tăng ca được tính)
function calSets(){ const n=new Set(), t=new Set(); state.cal.forEach(r=>{ if(!r.ngay) return; if ((r.loai||'').startsWith('Tăng ca')) t.add(r.ngay); else n.add(r.ngay); }); return {nghi:n, tangCa:t}; }
const dow = d => new Date(d+'T00:00:00').getDay();
const addDays = (d, k) => { const x=new Date(d+'T00:00:00'); x.setDate(x.getDate()+k); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
// NETWORKDAYS.INTL(đầu tháng, ngày cuối, chỉ nghỉ Chủ nhật) như file Excel
function netDays(from, to){ if (!from || !to || to<from) return 0; let n=0, d=from, g=0; while (d<=to && g++<800) { if (dow(d)!==0) n++; d=addDays(d,1); } return n; }
const MUCTON0 = [{ngay:365, nd:'Tồn sử dụng trên 1 năm - không mua thêm (NVL quá dư)', pl:'RỦI RO CAO'},{ngay:180, nd:'Tồn sử dụng trên 6 tháng - rủi ro tồn lâu', pl:'RỦI RO CAO'},{ngay:90, nd:'Tồn sử dụng trên 3 tháng - không mua thêm (NVL quá dư)', pl:'CẢNH BÁO'}];
function mucTonList(){ const m=state.settings.mucTon; return (Array.isArray(m)&&m.length?m:MUCTON0).filter(x=>num(x.ngay)>0).slice().sort((a,b)=>num(b.ngay)-num(a.ngay)); }
const ngayLbl = n => { n=+n; if (n>=182 && n<=183) return '6 tháng'; if (n>=365 && n%365===0) return `${n/365} năm`; if (n>=30 && n%30===0) return `${n/30} tháng`; return `${fmtQ(n)} ngày`; };
function nguongFor(it){
  const L = nguongList(); const key = {'TP đóng gói':'TP đóng gói (Ngày)','Bánh khô':'NVL Bánh khô','Kem tươi':'NVL Kem tươi'}[it.nhom] || it.nhom;
  const f = k => L.find(x=>x.key===k); const r = f(it.ma+' (Ngày)') || f(it.ma) || f(key) || {};
  return {max: num(r.max)||null, min: num(r.min)||null};
}
function calc(){
  if (calcCache) return calcCache;
  const items = itemMap(); const periods = periodList(); const res = {periods:{}, list:periods, warnings:[]};
  const lv = prodLevels(); const TH = computeSLTH(); const A = allocCfg();
  const cd1 = {}; A.rows.filter(r=>num(r.cd)===1).forEach(r=>cd1[r.ma]=r);
  const adjMap = {}; state.adjustments.forEach(a=>{ const k=a.ngaySX+'|'+a.maTP+'|'+a.maVT; adjMap[k]=(adjMap[k]||0)+num(a.dieuChinh); });
  state.adjustments.forEach(a=>{ if(!state.orders.some(o=>o.ngaySX===a.ngaySX && o.maTP===a.maTP)) res.warnings.push({loai:'Cân đối NVL', ma:a.maVT, nd:`Cân đối ${a.maVT} ngày ${fmtD(a.ngaySX)} cho ${a.maTP}: không có lệnh SX tương ứng`}); });
  let prevClose = null; const pendingTP = {};
  const allCodes = new Set([...Object.keys(items)]);
  periods.forEach(ky=>{
    const P = {ky, open:{}, nhap:{}, xuat:{}, close:{}, giaVon:{}, pBQ:{}, unitCost:{}, nhapSX:{}, xuatSX:{}, xuatBan:{}, xuatChung:{}, orders:[], lines:[], sales:[], issues:[], cost: state.costs[ky]||{}, rates:{r622:0,r627:0}, sum621:0, sum622:0, sum627:0, sum154:0, slSX:0, doanhSo:0, lai:0, nxt:[], chung:0, cp:{}, unalloc622:0, unalloc627:0};
    if (prevClose===null) { const op = (state.opening.ky===ky) ? state.opening.rows : {}; for (const ma in op) P.open[ma]={sl:op[ma].sl, tt:op[ma].tt}; if (state.opening.ky && state.opening.ky!==ky && ky===periods[0]) res.warnings.push({loai:'Tồn đầu', ma:'', nd:`Kỳ tồn đầu (${fmtKy(state.opening.ky)}) khác kỳ bắt đầu (${fmtKy(ky)})`}); }
    else for (const ma in prevClose) P.open[ma]={sl:prevClose[ma].sl, tt:prevClose[ma].tt};
    const O = ma => P.open[ma] || {sl:0, tt:0};
    const addNhap = (ma, sl, tt) => { const x=P.nhap[ma]||(P.nhap[ma]={sl:0,tt:0}); x.sl+=sl; x.tt+=tt; allCodes.add(ma); };
    const addXuat = (ma, sl) => { P.xuat[ma]=(P.xuat[ma]||0)+sl; allCodes.add(ma); };
    // 1. Mua hàng → Giá BQ NVL mua (cột P sheet Tồn kho tháng) – dùng cho giá thành và xuất dùng chung
    const mua = {};
    state.purchases.filter(r=>kyOf(r.ngayNhap)===ky).forEach(r=>{ addNhap(r.ma, num(r.sl), num(r.tt)); const x=mua[r.ma]||(mua[r.ma]={sl:0,tt:0}); x.sl+=num(r.sl); x.tt+=num(r.tt); if(!items[r.ma]) res.warnings.push({loai:'Mua hàng', ma:r.ma, nd:`Mã ${r.ma} chưa có trong danh mục (ngày ${fmtD(r.ngayNhap)})`}); });
    allCodes.forEach(ma=>{ const o=O(ma), m=mua[ma]||{sl:0,tt:0}; const den=o.sl+m.sl; P.pBQ[ma] = den ? (o.tt+m.tt)/den : 0; });
    if (pendingTP[ky]) pendingTP[ky].forEach(x=>addNhap(x.ma, x.sl, x.tt));
    // 2. Xuất dùng chung: loại Chi phí sản xuất (627) → giá trị cộng vào 627 của tháng; loại Bán hàng (641) chỉ trừ kho, không vào giá thành
    state.issues.filter(r=>kyOf(r.ngay)===ky).forEach(r=>{ const dg=P.pBQ[r.maVT]||0; const v=num(r.sl)*dg; const c627=is627(r); if (c627) P.chung+=v; else P.chi641=(P.chi641||0)+v; P.issues.push({r, ma:r.maVT, sl:num(r.sl), dg, tt:v, loai:c627?'627':'641'}); });
    const c622 = costSum(P.cost,'622'), c627 = costSum(P.cost,'627') + P.chung;
    P.cp = {c622, c627, gas:P.chung};
    // 3. Lệnh SX trong kỳ – tính theo cấp: bán thành phẩm → bánh gấu kem tươi → thành phẩm đóng gói
    const ords = state.orders.filter(o=>kyOf(o.ngayXuatNVL||o.ngaySX)===ky);
    const levels = [...new Set(ords.map(o=>lv[o.maTP]||0))].sort((a,b)=>a-b);
    const all = []; const byProd = {};
    const mkOrd = o => { const t=TH[o._id]||{slTH:0,soMeTH:0,soMeKH:0,bs:0,cd:'TP'}; return {o, maLenh:o.maLenh, ngaySX:o.ngaySX, ngayXuatNVL:o.ngayXuatNVL||o.ngaySX, maTP:o.maTP, loaiDM:o.loaiDM||'DM', slKH:num(o.slKH), dieuChinhTP:num(o.dieuChinhTP), slTH:t.slTH, soMe:t.soMeTH, soMeKH:t.soMeKH, slTP:t.bs||1, bs:t.bs, cd:t.cd, c621:0, c622:0, c627:0, c154:0, slLoi:0, thuHoi:0, slDat:t.slTH, gtNhap:0, maLoi:'', lines:[], status:'Đủ'}; };
    const allocate = (list, isCd1) => {
      if (isCd1) { const g={}; list.forEach(x=>(g[x.maTP]=g[x.maTP]||[]).push(x)); for (const p in g) { const r=cd1[p]; const den=sum(g[p],x=>x.c621); const a622=c622*num(A.cd1_622)*num(r.t622), a627=c627*num(A.cd1_627)*num(r.t627); g[p].forEach(x=>{ x.c622 = den ? a622*x.c621/den : 0; x.c627 = den ? a627*x.c621/den : 0; }); } }
      else { const den=sum(list,x=>x.c621); const a622=c622*(1-num(A.cd1_622)), a627=c627*(1-num(A.cd1_627)); list.forEach(x=>{ x.c622 = den ? a622*x.c621/den : 0; x.c627 = den ? a627*x.c621/den : 0; }); }
      list.forEach(x=>{ x.c154=x.c621+x.c622+x.c627; const r = x.c621 ? 1/x.c621 : 0; x.lines.forEach(ln=>{ ln.c622=x.c622*ln.tt*r; ln.c627=x.c627*ln.tt*r; ln.c154=ln.tt+ln.c622+ln.c627; });
        // Sản phẩm lỗi trong định mức (VAS 02): SL lỗi = SL thực hiện × tỷ lệ; giá trị thu hồi = SL lỗi × giá bán ước tính → trừ khỏi giá thành sản phẩm đạt (Nợ 155 SP lỗi / Có 154)
        const lr = loiRule(x.maTP, x.ngaySX);
        if (lr && x.slTH>0) { x.maLoi=lr.maLoi; x.slLoi=round(x.slTH*num(lr.tyLe),4); x.thuHoi=x.slLoi*num(lr.gia); x.slDat=round(x.slTH-x.slLoi,9); } else { x.maLoi=''; x.slLoi=0; x.thuHoi=0; x.slDat=x.slTH; }
        x.gtNhap = x.c154 - x.thuHoi; });
    };
    const cd2List = []; const nhapSP = {}; // giá trị nhập kho sản phẩm trong tháng của các cấp đã tính xong
    const bqXuat = ma => { const o=O(ma), n=P.nhap[ma]||{sl:0,tt:0}, s=nhapSP[ma]||{sl:0,tt:0}; const den=o.sl+n.sl+s.sl; return den ? (o.tt+n.tt+s.tt)/den : 0; };
    levels.forEach(L=>{
      const cur = ords.filter(o=>(lv[o.maTP]||0)===L).map(mkOrd);
      cur.forEach(ord=>{
        const ex = expandBom(ord.maTP, ord.loaiDM, ord.ngayXuatNVL);
        if (!ex.lines.length) ord.status='Thiếu định mức';
        const slTP = ex.slTP || 1;
        ex.lines.forEach(l=>{
          let q;
          if (ord.bs) q = ord.soMe * l.dm;                               // theo mẻ: số mẻ thực hiện × NVL/mẻ
          else { const v = ord.slTH*(1+num(l.haoHut))*l.dm/slTP; q = (items[l.maVT]||{}).nhom==='Thành phẩm' ? v : round(v,1); } // theo SL: làm tròn 1 số lẻ (trừ bánh gấu kem tươi)
          const dc = adjMap[ord.ngaySX+'|'+ord.maTP+'|'+l.maVT]||0; const tong=q+dc;
          const prod = isProd(items[l.maVT]);
          let dg = prod ? bqXuat(l.maVT) : (P.pBQ[l.maVT] ?? 0); // bán thành phẩm xuất cho công đoạn sau: giá xuất kho = bình quân gia quyền cuối kỳ (tồn đầu + nhập trong tháng)
          const ln = {maLenh:ord.maLenh, ngayXuatNVL:ord.ngayXuatNVL, ngaySX:ord.ngaySX, maTP:ord.maTP, maVT:l.maVT, dm:l.dm/(ord.bs?1:slTP), soMe:ord.bs?ord.soMe:ord.slTH, slDM:q, dc, tong, dg, tt:tong*dg, thayThe:!!l.thayThe, prod, haoHut:num(l.haoHut), bomRef:l.bom};
          if (tong>0 && !dg) ord.status = ord.status==='Đủ' ? (prod ? `Chưa có giá thành ${l.maVT} trong tháng` : 'Thiếu giá vốn NVL') : ord.status;
          if (!items[l.maVT]) ord.status = 'Thiếu mã NVL';
          ord.c621 += ln.tt; ord.lines.push(ln);
        });
      });
      const c1 = cur.filter(x=>cd1[x.maTP]); const c2 = cur.filter(x=>!cd1[x.maTP]);
      allocate(c1, true); cd2List.push(...c2);
      // giá thành đơn vị bình quân tháng của sản phẩm cấp này (hiển thị); giá xuất cho cấp sau lấy bình quân gia quyền cuối kỳ (bqXuat)
      const g={}; cur.forEach(x=>{ const k=kyOf(x.ngaySX)===ky; if(!k) return; const y=g[x.maTP]||(g[x.maTP]={sl:0,tt:0}); y.sl+=x.slDat; y.tt+=x.gtNhap; }); for (const p in g) P.unitCost[p] = g[p].sl ? g[p].tt/g[p].sl : 0;
      c1.forEach(x=>{ if ((kyOf(x.ngaySX)||ky)>ky) return; const y=nhapSP[x.maTP]||(nhapSP[x.maTP]={sl:0,tt:0}); y.sl+=x.slDat; y.tt+=x.gtNhap; });
      all.push(...cur);
    });
    allocate(cd2List, false);
    { const g={}; cd2List.forEach(x=>{ const y=g[x.maTP]||(g[x.maTP]={sl:0,tt:0}); y.sl+=x.slDat; y.tt+=x.gtNhap; }); for (const p in g) P.unitCost[p] = g[p].sl ? g[p].tt/g[p].sl : 0; }
    // chi phí chưa phân bổ (công đoạn không có sản xuất trong tháng)
    P.unalloc622 = c622 - sum(all,x=>x.c622); P.unalloc627 = c627 - sum(all,x=>x.c627);
    if (Math.abs(P.unalloc622)>1 || Math.abs(P.unalloc627)>1) res.warnings.push({loai:'Phân bổ 622/627', ma:ky, nd:`Tháng ${fmtKy(ky)}: còn ${fmtN(P.unalloc622)} (622) và ${fmtN(P.unalloc627)} (627) chưa phân bổ – công đoạn/sản phẩm trong quy tắc phân bổ không có sản xuất`});
    all.sort((a,b)=>(a.ngaySX+String((lv[a.maTP]||0))+a.maLenh).localeCompare(b.ngaySX+String((lv[b.maTP]||0))+b.maLenh));
    const lines = []; all.forEach(x=>lines.push(...x.lines));
    // 4. Nhập kho sản phẩm theo giá thành 154
    all.forEach(ord=>{ const k=kyOf(ord.ngaySX)||ky; const nk=[[ord.maTP, ord.slDat, ord.gtNhap]]; if (ord.slLoi>0) nk.push([ord.maLoi, ord.slLoi, ord.thuHoi]);
      if (k<=ky) { nk.forEach(([ma,sl,tt])=>{ addNhap(ma, sl, tt); const x=P.nhapSX[ma]||(P.nhapSX[ma]={sl:0,tt:0}); x.sl+=sl; x.tt+=tt; }); } else { nk.forEach(([ma,sl,tt])=>(pendingTP[k]=pendingTP[k]||[]).push({ma, sl, tt})); res.warnings.push({loai:'Lệnh SX', ma:ord.maLenh, nd:`Ngày SX (${fmtD(ord.ngaySX)}) thuộc kỳ sau kỳ xuất NVL – nhập kho ở kỳ ${fmtKy(k)}`}); } });
    P.orders = all; P.lines = lines;
    P.sum621 = sum(all,x=>x.c621); P.sum622 = sum(all,x=>x.c622); P.sum627 = sum(all,x=>x.c627); P.sum154 = sum(all,x=>x.c154);
    P.slSX = sum(all.filter(x=>x.cd==='TP'),x=>x.slTH); P.slBTP = sum(all.filter(x=>x.cd!=='TP'),x=>x.slTH); P.slLoi = sum(all,x=>x.slLoi); P.thuHoi = sum(all,x=>x.thuHoi);
    P.rates.r622 = P.sum621 ? P.sum622/P.sum621 : 0; P.rates.r627 = P.sum621 ? P.sum627/P.sum621 : 0;
    all.forEach(ord=>{ if (ord.status!=='Đủ') res.warnings.push({loai:'Lệnh SX', ma:ord.maLenh, nd:`${ord.maLenh} (${ord.maTP}, ${fmtD(ord.ngaySX)}): ${ord.status}`}); });
    // 5. Giá vốn bình quân tháng (cột M sheet Tồn kho tháng) = (tồn đầu + nhập) ÷ (SL tồn đầu + SL nhập)
    allCodes.forEach(ma=>{ const o=O(ma), n=P.nhap[ma]||{sl:0,tt:0}; const den=o.sl+n.sl; P.giaVon[ma] = den ? (o.tt+n.tt)/den : 0; });
    // 6. Xuất: sản xuất, dùng chung, bán
    lines.forEach(ln=>{ addXuat(ln.maVT, ln.tong); P.xuatSX[ln.maVT]=(P.xuatSX[ln.maVT]||0)+ln.tong; });
    P.issues.forEach(x=>{ addXuat(x.ma, x.sl); P.xuatChung[x.ma]=(P.xuatChung[x.ma]||0)+x.sl; });
    state.sales.filter(r=>kyOf(r.ngay)===ky).forEach(r=>{
      const sl=num(r.sl), ds=num(r.doanhSo); addXuat(r.ma, sl); P.xuatBan[r.ma]=(P.xuatBan[r.ma]||0)+sl;
      const gv = P.giaVon[r.ma]||0; const gb = sl ? ds/sl : 0; const lai = sl*(gb-gv);
      P.sales.push({r, ngay:r.ngay, ma:r.ma, sl, ds, gb, gv, lai, tl: gb ? (gb-gv)/gb : 0, hoaDon:r.hoaDon||'', khach:r.khach||'', status: !items[r.ma] ? 'Thiếu mã NXT' : (gb && gb<gv ? 'Bán dưới giá vốn' : 'Hợp lệ')});
      if (!items[r.ma]) res.warnings.push({loai:'Bán hàng', ma:r.ma, nd:`Mã ${r.ma} chưa có trong danh mục (ngày ${fmtD(r.ngay)})`});
      P.doanhSo += ds; P.lai += lai;
    });
    // 7. Tồn cuối, bình quân/ngày (NETWORKDAYS từ đầu tháng đến ngày phát sinh cuối), trạng thái rủi ro theo ngưỡng
    const d0 = `${ky}-01`;
    const lastBy = {}; const setLast=(ma,d)=>{ if(!lastBy[ma]||d>lastBy[ma]) lastBy[ma]=d; };
    P.sales.forEach(s=>setLast(s.ma, s.ngay)); lines.forEach(l=>setLast(l.maVT, l.ngayXuatNVL)); P.issues.forEach(x=>setLast(x.ma, x.r.ngay)); all.forEach(o=>{ if (o.slTH>0) setLast('#'+o.maTP, o.ngaySX); });
    const lastAny = [ ...lines.map(l=>l.ngayXuatNVL), ...P.sales.map(s=>s.ngay) ].sort().pop();
    P.daysData = lastAny ? netDays(d0, lastAny) : 0;
    const loss = {}; P.sales.forEach(s=>{ if (s.gb && s.gb<s.gv) loss[s.ma]=(loss[s.ma]||0)+1; });
    const nvlUsed = new Set(); state.bom.forEach(b=>nvlUsed.add(b.maNVL)); state.subs.forEach(x=>{ nvlUsed.add(x.maNVL); nvlUsed.add(x.maThayThe); }); state.issues.forEach(x=>nvlUsed.add(x.maVT));
    allCodes.forEach(ma=>{
      const o=O(ma), n=P.nhap[ma]||{sl:0,tt:0}, xs=P.xuat[ma]||0, gv=P.giaVon[ma]||0; const xt = xs*gv;
      const cs = round(o.sl+n.sl-xs, 9); const ct = cs===0 ? 0 : o.tt+n.tt-xt;
      P.close[ma]={sl:cs, tt:ct};
      const it = items[ma]||{ma, ten:'(chưa có trong danh mục)', nhom:'', dvt:'', kho:''};
      const fin = isFinal(it), prod = isProd(it);
      let bqBase, last;
      if (fin || isLoi(it)) { bqBase = P.xuatBan[ma]||0; last = lastBy[ma]; }
      else if (prod) { bqBase = (P.nhapSX[ma]||{sl:0}).sl; last = lastBy['#'+ma]; }
      else { bqBase = (P.xuatSX[ma]||0)+(P.xuatChung[ma]||0); last = lastBy[ma]; }
      const nd = last ? netDays(d0, last) : 0; const bq = nd ? bqBase/nd : 0;
      const days = bq>0 ? cs/bq : null;
      const can15 = (!prod && bq>0) ? Math.max(0, bq*15-cs) : 0;
      const ng = nguongFor(it); let stt='', risk='OK';
      // Trạng thái rủi ro: 1 trạng thái / mã, ưu tiên mức nặng nhất (theo thiết lập ở Cảnh báo & kiểm tra → Ngưỡng cảnh báo)
      if (cs<-1e-9) { stt='Âm kho - xử lý ngay'; risk='RỦI RO CAO'; }
      else if (!prod && !nvlUsed.has(ma)) { stt='Chưa xây dựng định mức'; risk='RỦI RO CAO'; }
      else if (cs>1e-9 && ng.max && (days==null || days>ng.max/2)) { const dd = days==null ? Infinity : days; const hi = dd>ng.max; // vượt mốc rủi ro = Rủi ro cao; vượt một nửa = Cảnh báo
        const lim = hi ? ngayLbl(ng.max) : ngayLbl(ng.max/2);
        stt = prod ? (hi ? `Tồn trên ${lim} - rủi ro tồn lâu (lưu ý hạn dùng)` : `Tồn trên ${lim} - ưu tiên bán / dùng trước`) : (hi ? `Tồn sử dụng trên ${lim} - không mua thêm (NVL quá dư)` : `Tồn sử dụng trên ${lim} - SX thêm TP (hạn chế mua)`);
        risk = hi ? 'RỦI RO CAO' : 'CẢNH BÁO'; }
      else if (ng.min && cs>=0 && days!=null && days<ng.min) { stt = prod ? 'Tồn thấp - cần sản xuất' : 'Tồn thấp - cần mua'; risk='CẢNH BÁO'; }
      else if (cs<=1e-9 && ng.min && bq>0) { stt = prod ? 'Tồn thấp - cần sản xuất' : 'Tồn thấp - cần mua'; risk='CẢNH BÁO'; }
      P.nxt.push({ma, ten:it.ten, nhom:it.nhom, dvt:it.dvt, kho:it.kho, gv, pBQ: prod?null:P.pBQ[ma], openSL:o.sl, openTT:o.tt, nhapSL:n.sl, nhapTT:n.tt, xuatSL:xs, xuatTT:xt, closeSL:cs, closeTT:ct, bq, days, canLay5:can15, can15, risk, status: stt});
    });
    P.tonCuoi = sum(P.nxt, x=>x.closeTT);
    P.nxt.sort((a,b)=>((NHOM_ORDER[a.nhom]??9)-(NHOM_ORDER[b.nhom]??9)) || a.ma.localeCompare(b.ma));
    // Tồn cuối ngày cho từng dòng xuất
    const ev = {}; const push=(ma,d,q)=>{ (ev[ma]=ev[ma]||[]).push([d,q]); };
    state.purchases.filter(r=>kyOf(r.ngayNhap)===ky).forEach(r=>push(r.ma, r.ngayNhap, num(r.sl)));
    lines.forEach(l=>push(l.maVT, l.ngayXuatNVL, -l.tong));
    P.issues.forEach(x=>push(x.ma, x.r.ngay, -x.sl));
    P.sales.forEach(s=>push(s.ma, s.ngay, -s.sl));
    all.forEach(x=>{ if (kyOf(x.ngaySX)===ky) push(x.maTP, x.ngaySX, x.slTH); });
    lines.forEach(l=>{ const e=ev[l.maVT]||[]; l.tonNgay = round(O(l.maVT).sl + sum(e.filter(x=>x[0]<=l.ngayXuatNVL), x=>x[1]), 6); });
    P.sales.forEach(s=>{ const e=ev[s.ma]||[]; s.tonNgay = round(O(s.ma).sl + sum(e.filter(x=>x[0]<=s.ngay), x=>x[1]), 6); if (s.tonNgay<0 && s.status==='Hợp lệ') s.status='Âm kho theo ngày'; });
    res.periods[ky]=P; prevClose = P.close;
  });
  res.TH = TH; res.levels = lv;
  calcCache = res; return res;
}
