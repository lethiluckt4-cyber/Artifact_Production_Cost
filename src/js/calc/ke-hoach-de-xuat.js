// ---------- Kế hoạch & đề xuất sản xuất ----------
// ---------- [C] Kế hoạch sản xuất & đề xuất (theo sheet Ke hoach SX, Cân đối NVL của file Excel) ----------
function bomInfo(maTP, loai='DM', date){ const rows=bomFor(maTP, loai, date); return {slTP: rows.length?num(rows[0].slTP):0, lanNgay: rows.length?num(rows[0].lanNgay):0, rows}; }
function ordersOn(ngay, maTP){ return state.orders.filter(o=>o.ngaySX===ngay && o.maTP===maTP); }
// Cấu trúc sản phẩm cho kế hoạch: thành phẩm đóng gói ← bánh gấu kem tươi (nhóm "Thành phẩm") ← bán thành phẩm theo mẻ
function planStructure(date){
  const items=itemMap(); const finals=[]; let X=null;
  state.items.filter(i=>isFinal(i)).forEach(f=>{ const b=bomFor(f.ma,'DM',date).find(b=>(items[b.maNVL]||{}).nhom==='Thành phẩm'); if (b) { finals.push({ma:f.ma, ten:f.ten, dm:num(b.slTP)?num(b.slNVL)/num(b.slTP):0}); X = X || b.maNVL; } });
  if (!X || !finals.length) return null;
  const btp = bomFor(X,'DM',date).filter(b=>isProd(items[b.maNVL])).map(b=>({ma:b.maNVL, ten:(items[b.maNVL]||{}).ten||b.maNVL, r:num(b.slTP)?num(b.slNVL)/num(b.slTP):0, bs:batchSize(b.maNVL, date)||1}));
  finals.sort((a,b)=>b.dm-a.dm);
  return {X, tenX:(items[X]||{}).ten||X, finals, btp};
}
const ceil9 = v => Math.ceil(round(v,9)); const floor9 = v => Math.floor(round(v,9));
function keyQty(v){ const r=round(v,3); return Number.isInteger(r) ? `${r}.` : String(r); }
// Năng lượng tháng (điện + gas): thực tế nếu đã nhập tiền điện tháng, nếu không dùng ước tính đầu tháng
function energyOf(ky){ const c=calc(); const P=c.periods[ky]; const dien=num((state.costs[ky]||{}).dien); const gas=P?num((P.cp||{}).gas):0; const uoc=num((planPrm().nlUoc||{})[ky]);
  if (dien>0) return {E:dien+gas, src:'Thực tế', dien, gas, uoc, noGas: !gas};
  return {E:uoc, src: uoc?'Ước tính':'', dien:0, gas, uoc}; }
// Tỷ lệ gợi ý: bình quân đ/kg BGKT của 3 tháng gần nhất có đủ điện + gas + sản xuất
function suggestRate(beforeKy){ const c=calc(); const ks=c.list.filter(k=>!beforeKy || k<beforeKy).slice().reverse(); const out=[];
  for (const k of ks) { const P=c.periods[k]; const dien=num((state.costs[k]||{}).dien), gas=num((P.cp||{}).gas); const kg=sum(P.orders.filter(o=>o.maTP==='BTP_BGKT'),o=>o.slTH); if (dien>0 && gas>0 && kg>0) out.push({k, r:(dien+gas)/kg}); if (out.length>=3) break; }
  return {rate: out.length ? Math.round(sum(out,x=>x.r)/out.length) : 0, from: out.map(x=>x.k).reverse()}; }
const noCapWhy = (ky, x) => !num((x||energyOf(ky)).E) ? 'chưa có ước tính điện + gas' : 'chưa có Năng lượng/kg BGKT (không có tháng trước để tự tính – nhập ở Đề xuất sản xuất → Thông số đề xuất)';
function planRate(ky){ const p=planPrm(); return num(p.nlRate) || suggestRate(ky).rate; }
// Đề xuất sản xuất theo công suất năng lượng: công suất tháng (kg BGKT) = điện + gas ÷ đ/kg, chia đều ngày làm việc;
// ưu tiên thành phẩm còn ít ngày tồn (theo bán bình quân), làm thêm để tồn đến mức tối đa; tồn đủ hết thì giảm tối đa x%.
function buildPlan(year){
  const c=calc(); c.plans=c.plans||{}; if (c.plans[year]) return c.plans[year];
  const y=String(year); const d0=`${y}-01-01`, d1=`${y}-12-31`; const ST=planStructure(`${y}-12-31`);
  if (!ST) return (c.plans[year]={ok:false, msg:'Chưa nhận dạng được cấu trúc định mức (thành phẩm đóng gói → bánh gấu kem tươi nhóm "Thành phẩm" → bán thành phẩm). Kiểm tra Danh mục (cột Nhóm hàng) và Định mức.'});
  const prm=planPrm(); const items=itemMap(); const {nghi, tangCa}=calSets(); const TH=c.TH||{};
  const bqD=num(prm.bqDays)||30, maxDays=num(prm.maxDays)||15, minDays=num(prm.minDays??1), giam=Math.min(0.5,Math.max(0,num(prm.giam??0.15)));
  const days=[]; for (let d=d0; d<=d1; d=addDays(d,1)) days.push(d);
  const N=days.length; const idx={}; days.forEach((d,i)=>idx[d]=i);
  const prods=[...ST.btp.map(x=>x.ma), ST.X, ...ST.finals.map(x=>x.ma)];
  const lastSale=state.sales.map(r=>r.ngay).filter(d=>d&&d<=d1).sort().pop()||''; const lastIdx = lastSale ? (lastSale<d0 ? -1 : idx[lastSale]) : -1;
  const lockDate=state.orders.filter(o=>(TH[o._id]||{}).slTH>0).map(o=>o.ngaySX).sort().pop()||'';
  const actual={}; state.orders.forEach(o=>{ const t=TH[o._id]; if(!t||idx[o.ngaySX]==null) return; const k=o.ngaySX+'|'+o.maTP; actual[k]=(actual[k]||0)+t.slTH; });
  // bán thực tế (kể cả 30 ngày cuối năm trước để tính bình quân đầu năm)
  const pre0=addDays(d0,-bqD); const allDays=[]; for (let d=pre0; d<=d1; d=addDays(d,1)) allDays.push(d); const off=bqD; const aIdx={}; allDays.forEach((d,i)=>aIdx[d]=i);
  const T={}; ST.finals.forEach(f=>T[f.ma]=new Array(allDays.length).fill(0)); state.sales.forEach(r=>{ if(T[r.ma] && aIdx[r.ngay]!=null) T[r.ma][aIdx[r.ngay]]+=num(r.sl); });
  const isW = d => (dow(d)!==0 || tangCa.has(d)) && !nghi.has(d);
  const av=allDays.map(d=>isW(d)?1:0); const avPre=[0]; av.forEach(v=>avPre.push(avPre[avPre.length-1]+v)); const cntAV=(a,b)=>{ a=Math.max(0,a); b=Math.min(allDays.length-1,b); return b<a?0:avPre[b+1]-avPre[a]; };
  const pre={}; for (const ma in T){ const p=[0]; T[ma].forEach(v=>p.push(p[p.length-1]+v)); pre[ma]=p; } const sumT=(ma,a,b)=>{ a=Math.max(0,a); b=Math.min(allDays.length-1,b); return b<a?0:pre[ma][b+1]-pre[ma][a]; };
  const lastA = lastSale ? aIdx[lastSale] ?? (lastSale<pre0?-1:allDays.length-1) : -1;
  // bình quân bán / ngày làm việc trong 30 ngày trước (chỉ dùng ngày đã có số bán; sau ngày bán cuối thì giữ bình quân cuối)
  const bqAt = (f, ai) => { const e=Math.min(ai-1, lastA); if (e<0) return 0; const s=e-bqD+1; return sumT(f,s,e)/Math.max(1,cntAV(s,e)); };
  const nextW=new Array(N); { let nx=-1; for (let i=N-1;i>=0;i--){ nextW[i]= nx>=0 ? nx : i+1; if (av[i+off]) nx=i; } }
  // năng lượng & công suất từng tháng
  const months={}; for (let mm=1; mm<=12; mm++){ const k=`${y}-${String(mm).padStart(2,'0')}`; const en=energyOf(k); const rate=planRate(k); const wd=days.filter(d=>d.startsWith(k)&&isW(d)).length; const capKg = rate>0 ? en.E/rate : 0; months[k]={...en, rate, wd, capKg, kgDay: wd?capKg/wd:0, kg:0, n:0, min:Infinity, max:0}; }
  const P1 = c.periods[`${y}-01`]; const open = ma => P1 ? ((P1.open[ma]||{}).sl||0) : (state.opening.ky && state.opening.ky.startsWith(y) ? ((state.opening.rows[ma]||{}).sl||0) : 0);
  const ton={}; prods.forEach(p=>ton[p]=open(p));
  const nvlUse={}; const addUse=(prod, q, d)=>{ expandBom(prod,'DM',d).lines.forEach(l=>{ if (isProd(items[l.maVT])) return; const st=num(l.bom.slTP); nvlUse[l.maVT]=(nvlUse[l.maVT]||0)+(st?l.dm/st:0)*q; }); };
  const buyCum={}; const buys=state.purchases.filter(r=>r.ngayNhap&&r.ngayNhap<=d1).sort((a,b)=>a.ngayNhap.localeCompare(b.ngayNhap)); let bi=0;
  const rows=[];
  for (let i=0;i<N;i++){
    const d=days[i], ai=i+off, k=d.slice(0,7), M=months[k]; const locked = lockDate && d<=lockDate; const lam=av[ai]; const brk=(nextW[i]-i)>2;
    const r={d, locked, lam, brk, open:{}, sx:{}, out:{}, close:{}, sale:{}, fc:{}, bq:{}, cover:{}, me:{}, cap:0, warn:[]}; prods.forEach(p=>r.open[p]=ton[p]);
    const D={}; ST.finals.forEach(f=>{ r.bq[f.ma]=bqAt(f.ma, ai); const known = ai<=lastA; D[f.ma] = known ? T[f.ma][ai] : (lam ? r.bq[f.ma] : 0); r.sale[f.ma]=D[f.ma]; r.fc[f.ma]=!known; });
    if (locked) ST.finals.forEach(f=>{ r.sx[f.ma]=actual[d+'|'+f.ma]||0; });
    else if (lam && M.kgDay>0) {
      const K=M.kgDay; r.cap=K; const prod={}; let used=0;
      ST.finals.forEach(f=>{ const b=Math.max(0, ceil9(D[f.ma] + minDays*r.bq[f.ma] - ton[f.ma])); prod[f.ma]=b; used+=b*f.dm; });
      if (used>K+0.001) r.warn.push(`VƯỢT CÔNG SUẤT ${fmtN((used/K-1)*100,0)}% (đủ bán)`);
      const cover = f => r.bq[f.ma]>0 ? (ton[f.ma]+prod[f.ma]-D[f.ma])/r.bq[f.ma] : Infinity;
      const pick = (lim, cap) => { let best=null, bc=Infinity; ST.finals.forEach(f=>{ if (!(r.bq[f.ma]>0)) return; if (cap!=null && used+f.dm>cap+f.dm/2) return; const cv=cover(f); if (lim && cv>=maxDays) return; if (cv<bc){ bc=cv; best=f; } }); return best; };
      let g=0, full=false; while (used < K-1e-9 && g++<5000) { const f=pick(true, K); if (!f) { full = !pick(true, null) && ST.finals.some(f=>r.bq[f.ma]>0); break; } prod[f.ma]++; used+=f.dm; }
      const Kmin=K*(1-giam); g=0; if (full) while (used < Kmin-1e-9 && g++<5000) { const f=pick(false, null); if (!f) break; prod[f.ma]++; used+=f.dm; }
      if (full && used < K*0.995) r.warn.push(`GIẢM ${fmtN((1-used/K)*100,0)}% CÔNG SUẤT (TỒN ĐỦ ${maxDays} NGÀY)`);
      ST.finals.forEach(f=>{ r.sx[f.ma]=prod[f.ma]; });
    } else { ST.finals.forEach(f=>{ r.sx[f.ma]=0; }); if (lam && !(M.kgDay>0) && d>lockDate) r.warn.push('CHƯA CÓ ƯỚC TÍNH ĐIỆN + GAS'); }
    const MX=ton[ST.X]; const PX=sum(ST.finals,f=>r.sx[f.ma]*f.dm); r.out[ST.X]=PX;
    r.sx[ST.X] = locked ? (actual[d+'|'+ST.X]||0) : Math.max(0, round(PX-MX,3));
    // Bù hao hụt sản phẩm lỗi: chỉ phần đạt (1 − tỷ lệ lỗi) dùng được cho công đoạn sau → SX = cần ÷ (1 − tỷ lệ), làm tròn mẻ
    const dat = ma => { const lr=loiRule(ma, d); return lr ? Math.max(0.01, 1-num(lr.tyLe)) : 1; };
    ST.btp.forEach(b=>{ const F=r.sx[ST.X]*b.r; r.out[b.ma]=F; const k=dat(b.ma); const can=round((F-ton[b.ma])/k,6); r.sx[b.ma] = locked ? (actual[d+'|'+b.ma]||0) : (can<=0?0:(brk?round(can,3):Math.ceil(round(can/b.bs,9))*b.bs)); r.me[b.ma]=b.bs>1?r.sx[b.ma]/b.bs:0; r.loi=r.loi||{}; r.loi[b.ma]=round(r.sx[b.ma]*(1-k),3); });
    ST.btp.forEach(b=>{ ton[b.ma]=ton[b.ma]+r.sx[b.ma]*dat(b.ma)-r.out[b.ma]; r.close[b.ma]=ton[b.ma]; });
    ton[ST.X]=ton[ST.X]+r.sx[ST.X]-PX; r.close[ST.X]=ton[ST.X];
    ST.finals.forEach(f=>{ ton[f.ma]=ton[f.ma]+r.sx[f.ma]-r.sale[f.ma]; r.close[f.ma]=ton[f.ma]; r.cover[f.ma]= r.bq[f.ma]>0 ? ton[f.ma]/r.bq[f.ma] : null; });
    prods.forEach(p=>{ if (r.sx[p]) addUse(p, r.sx[p], d); }); while (bi<buys.length && buys[bi].ngayNhap<=d){ buyCum[buys[bi].ma]=(buyCum[buys[bi].ma]||0)+num(buys[bi].sl); bi++; }
    const usedToday=new Set(); prods.forEach(p=>{ if (r.sx[p]) expandBom(p,'DM',d).lines.forEach(l=>usedToday.add(l.maVT)); });
    const thieu = Object.keys(nvlUse).filter(ma=>usedToday.has(ma) && open(ma)+(buyCum[ma]||0)-nvlUse[ma] < -0.001);
    const W=r.warn; if (locked) W.unshift('ĐÃ KHÓA'); if (dow(d)===0 && tangCa.has(d)) W.push('TĂNG CA CN'); if (!lam) W.push(nghi.has(d)?'NGHỈ LỄ / CHỜ VIỆC':'CHỦ NHẬT');
    if (r.open[ST.X]>0.001 && r.close[ST.X]>0.001) W.push('BGKT CHƯA ĐÓNG GÓI QUÁ 1 NGÀY');
    if (lam && brk && ST.btp.some(b=>r.close[b.ma]>0.001)) W.push('BTP QUA KỲ NGHỈ');
    if (r.close[ST.X]<-0.001) W.push('THIẾU '+ST.X); ST.btp.forEach(b=>{ if (r.close[b.ma]<-0.001) W.push('THIẾU '+b.ma); }); ST.finals.forEach(f=>{ if (r.close[f.ma]<-0.001) W.push('THIẾU '+f.ma); });
    if (thieu.length) W.push('THIẾU NVL: '+thieu.join(', '));
    const v=r.sx[ST.X]; if (v>0){ M.n++; M.kg+=v; M.min=Math.min(M.min,v); } M.max=Math.max(M.max,v);
    rows.push(r);
  }
  const keySet=new Set(state.orders.map(o=>o.khoa).filter(Boolean)); const list=[]; const iOrd={}; state.items.forEach((it,i)=>iOrd[it.ma]=i);
  const lprods=[...ST.btp.map(x=>x.ma), ST.X, ...ST.finals.map(x=>x.ma).sort((a,b)=>(iOrd[a]??0)-(iOrd[b]??0))];
  rows.forEach(r=>lprods.forEach((p,pi)=>{ const q=r.sx[p]; if (!(q>0)) return; const me=r.me[p]||0; const key=`${p}#${r.d.replace(/-/g,'')}@${keyQty(q)}~${keyQty(me)}`;
    const st = r.locked ? 'ĐÃ KHÓA' : keySet.has(key) ? 'ĐÃ CÓ LỆNH' : (ordersOn(r.d,p).length ? 'LỆCH LỆNH' : 'CHƯA CÓ LỆNH');
    list.push({key, d:r.d, ma:p, sl:q, me, cd: ST.btp.some(b=>b.ma===p)||p===ST.X ? 'BT':'TP', st, ord:pi}); }));
  const planned=new Set(list.map(x=>x.d+'|'+x.ma)); const stale=state.orders.filter(o=>(!lockDate || o.ngaySX>lockDate) && o.ngaySX && o.ngaySX.startsWith(y) && !planned.has(o.ngaySX+'|'+o.maTP));
  return (c.plans[year]={ok:true, ST, rows, list, stale, lockDate, lastSale, months, prods, prm:{bqD, maxDays, minDays, giam}});
}
function planPending(ky){ try { const y=(ky||selKy||workYear()).slice(0,4); const pl=buildPlan(y); if(!pl.ok) return 0; const td=todayISO(); return pl.list.filter(x=>x.d<=td && (ky&&ky.length===7 ? x.d.startsWith(ky) : true) && (x.st==='CHƯA CÓ LỆNH'||x.st==='LỆCH LỆNH')).length; } catch(e){ console.error(e); return 0; } }
// Tạo / cập nhật Lệnh SX theo kế hoạch (thay việc dán khóa kế hoạch vào sheet Lệnh SX)
const todayISO = () => { if (window.__today) return window.__today; const t=new Date(); return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`; };
// upTo: chỉ tạo lệnh đến ngày này (mặc định = hôm nay – ngày tính giá thành)
function applyPlanCore(pl, ky, delStale, onlyNew, upTo){
  let nNew=0, nUpd=0, nDel=0; upTo = upTo===undefined ? todayISO() : upTo;
  pl.list.filter(x=>(!upTo || x.d<=upTo) && (!ky || ky.length!==7 || x.d.startsWith(ky)) && (x.st==='CHƯA CÓ LỆNH'||(!onlyNew && x.st==='LỆCH LỆNH'))).forEach(x=>{
    const os=ordersOn(x.d, x.ma);
    if (!os.length) { state.orders.push({_id:uid(), maLenh:genMaLenh(x.d), ngayXuatNVL:x.d, ngaySX:x.d, maTP:x.ma, loaiDM:'DM', slKH:x.sl, dieuChinhTP:0, ghiChu:'', khoa:x.key, nguon:'PM', slDX:x.sl}); nNew++; }
    else { os[0].slKH=x.sl; os[0].khoa=x.key; os[0].nguon='PM'; os[0].slDX=x.sl; os.slice(1).forEach(o=>{ o.slKH=0; }); nUpd++; }
  });
  if (ky && ky.length===7) markProposed(ky);
  if (delStale) { const ids=new Set(pl.stale.filter(o=>!ky || ky.length!==7 || o.ngaySX.startsWith(ky)).map(o=>o._id)); nDel=ids.size; state.orders=state.orders.filter(o=>!ids.has(o._id)); }
  return {nNew, nUpd, nDel};
}
// Đề xuất cân đối NVL khi tồn cuối âm (bảng DeXuatDieuChinhNVL): giảm tiêu hao tại lệnh/ngày làm tồn âm
const btpMe = ma => { const b=state.bom.find(r=>r.maTP===ma && num(r.slTP)>0); return b ? num(b.slTP) : 100; }; // 1 mẻ bán thành phẩm (SL thành phẩm/mẻ trong định mức)
function buildAdjProposal(p){
  const items=itemMap(); const out=[]; const byMa={}; p.lines.forEach(l=>{ (byMa[l.maVT]=byMa[l.maVT]||[]).push(l); });
  const analysis=[]; const inP = d => p.isRange ? (d>=rangeOf(p.ky).from && d<=rangeOf(p.ky).to) : (d||'').startsWith(p.ky);
  p.nxt.filter(x=>x.closeSL<-1e-9).forEach(x=>{
    const ls=(byMa[x.ma]||[]).slice().sort((a,b)=>(a.ngayXuatNVL+a.maLenh).localeCompare(b.ngayXuatNVL+b.maLenh));
    const fin = isFinal(items[x.ma]), prod=isProd(items[x.ma]); let why='', action='';
    if (fin) { why = 'Thành phẩm bán ra vượt tồn đầu + sản xuất'; action = 'Kiểm tra thiếu lệnh SX hoặc sai mã bán; xem Đề xuất sản xuất'; }
    else if (prod && ls.length && -x.closeSL <= btpMe(x.ma)+1e-9) { why = `Lệch làm tròn mẻ (âm ${fmtQ(-x.closeSL)} ≤ 1 mẻ ${fmtQ(btpMe(x.ma))})`; action = 'Cân đối giảm tiêu hao ở lệnh công đoạn sau cuối tháng theo đề xuất bên dưới'; }
    else if (prod) { why = 'Bán thành phẩm xuất cho công đoạn sau nhiều hơn lượng sản xuất'; action = 'Kiểm tra SL thực hiện / số mẻ của lệnh bán thành phẩm'; }
    else if (!ls.length) { why = x.xuatSL>0 ? 'Xuất dùng chung / bán NVL vượt tồn' : 'Tồn đầu âm'; action = 'Kiểm tra phiếu Xuất dùng chung hoặc số dư đầu kỳ'; }
    else if (x.openSL+x.nhapSL<=0) { why = 'Không có tồn đầu và không mua trong kỳ nhưng định mức vẫn xuất'; action = 'Bổ sung chứng từ mua hàng / tồn đầu, hoặc khai NVL thay thế'; }
    else { why = 'Xuất theo định mức lớn hơn lượng thực có'; action = 'Kiểm tra chứng từ mua chưa nhập; nếu đã đủ, cân đối giảm theo đề xuất bên dưới'; }
    analysis.push({ma:x.ma, ten:x.ten, nhom:x.nhom, dvt:x.dvt, open:x.openSL, nhap:x.nhapSL, xuat:x.xuatSL, close:x.closeSL, why, action, nLines:ls.length});
    if (!fin && prod && ls.length && -x.closeSL <= btpMe(x.ma)+1e-9) { // bán thành phẩm âm nhỏ (≤ 1 mẻ) do làm tròn mẻ → giảm tiêu hao ở các lệnh công đoạn sau cuối tháng
      let rem=round(-x.closeSL,6); const tot=rem; let cum=0;
      ls.slice().reverse().forEach(l=>{ if (rem<=1e-9 || l.tong<=0 || isLocked(kyOf(l.ngaySX))) return; const cut=round(Math.min(l.tong, rem),6); cum=round(cum+cut,6); rem=round(rem-cut,6);
        out.push({maLenh:l.maLenh, ngaySX:l.ngaySX, maTP:l.maTP, maVT:x.ma, ten:x.ten, dvt:x.dvt, hienXuat:l.tong, deXuat:-cut, tonSau: round(x.closeSL+cum,6), lyDo:`Làm tròn mẻ bán thành phẩm: giảm ${fmtQ(cut)} ở lệnh cuối tháng; lũy kế ${fmtQ(cum)}/${fmtQ(tot)}.`}); });
      return; }
    if (fin || prod || !ls.length) return;
    let remaining = -x.closeSL; let run = x.openSL; const ev=[]; const push=(d,q,l)=>ev.push({d,q,l});
    state.purchases.filter(r=>r.ma===x.ma && inP(r.ngayNhap)).forEach(r=>push(r.ngayNhap, num(r.sl), null));
    state.issues.filter(r=>r.maVT===x.ma && inP(r.ngay)).forEach(r=>push(r.ngay, -num(r.sl), null));
    state.sales.filter(r=>r.ma===x.ma && inP(r.ngay)).forEach(r=>push(r.ngay, -num(r.sl), null));
    ls.forEach(l=>push(l.ngayXuatNVL, -l.tong, l));
    ev.sort((a,b)=>a.d.localeCompare(b.d) || (a.q>0?-1:1));
    let cum=0; const tot=-x.closeSL;
    ev.forEach(e=>{ run = round(run+e.q, 9); if (e.l && run<0 && remaining>0) { const cut = round(Math.min(e.l.tong, -run, remaining), 6); if (cut>0) { cum=round(cum+cut,6); out.push({maLenh:e.l.maLenh, ngaySX:e.l.ngaySX, maTP:e.l.maTP, maVT:x.ma, ten:x.ten, dvt:x.dvt, hienXuat:e.l.tong, deXuat:-cut, tonSau: round(run+cut,6), lyDo:`Giảm tiêu hao để bù tồn âm: tồn sau các đề xuất trước = ${fmtQ(run)}; giảm ${fmtQ(cut)}; lũy kế ${fmtQ(cum)}/${fmtQ(tot)}.`}); run = round(run+cut,6); remaining = round(remaining-cut,6); } } });
  });
  return {rows:out, analysis};
}
// Các tháng (trong kỳ đang xem) còn đề xuất cân đối NVL chưa áp dụng – đề xuất tính theo từng tháng
const kyDangDo = k => /^\d{4}-\d{2}$/.test(k||'') && `${k}-${String(daysInMonth(k)).padStart(2,'0')}` > todayISO(); // tháng chưa kết thúc: chưa chuyển ngày nhập kho / cân đối
function pendingAdjMonths(){ const c=calc(); return c.list.filter(k=>selKyHas(k) && !isLocked(k) && !kyDangDo(k)).map(k=>({k, n:buildAdjProposal(c.periods[k]).rows.filter(r=>!isLocked(kyOf(r.ngaySX))).length})).filter(x=>x.n); }
// Áp dụng đề xuất lần lượt từng tháng (tháng trước cân đối xong mới tính đề xuất tháng sau)
const adjKey = r => `${kyOf(r.ngaySX)}|${r.ngaySX}|${r.maTP}|${r.maVT}`;
function applyAdjMonths(only, keys){ let tot=0; const ks=calc().list.filter(k=>selKyHas(k) && !isLocked(k) && (!only || only.includes(k))); ks.forEach(k=>{ calcCache=null; tot+=applyAdjCore(buildAdjProposal(calc().periods[k]), keys); }); calcCache=null; return tot; }
function applyAdjCore(d, keys){ d.rows=d.rows.filter(r=>!isLocked(kyOf(r.ngaySX)) && (!keys || keys.has(adjKey(r)))); d.rows.forEach(r=>state.adjustments.push({_id:uid(), ngaySX:r.ngaySX, maTP:r.maTP, maVT:r.maVT, dieuChinh:r.deXuat, lyDo:r.lyDo||'Đề xuất PM – xử lý tồn âm', nguon:'PM'})); return d.rows.length; }
