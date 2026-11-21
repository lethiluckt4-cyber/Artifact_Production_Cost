// ---------- Định nghĩa dữ liệu ----------
const NHOM = ['TP đóng gói','Thành phẩm','Bán thành phẩm','Sản phẩm lỗi','Bánh khô','Kem tươi','Bao bì','Nhiên liệu','Khác'];
const PROD_NHOM = ['TP đóng gói','Thành phẩm','Bán thành phẩm','Sản phẩm lỗi']; // nhóm do công ty tự sản xuất
const NHOM_ORDER = {'TP đóng gói':0,'Thành phẩm':1,'Bán thành phẩm':2,'Sản phẩm lỗi':2.5,'Bánh khô':3,'Kem tươi':4,'Bao bì':5,'Nhiên liệu':6,'Khác':7};
// Nhóm hàng (tab "Nhóm hàng" trong Danh mục hàng): cách tính giá quyết định cách phần mềm xử lý mã hàng thuộc nhóm
const NHOM_LOAI = {TP:'Thành phẩm đóng gói (bán)', SX:'Tự sản xuất (bán thành phẩm / thành phẩm)', LOI:'Sản phẩm lỗi thu hồi (bán giá thấp)', NVL:'NVL / vật tư mua vào'};
const NHOM_DEF0 = NHOM.map(t=>({ten:t, loai: t==='TP đóng gói'?'TP' : t==='Sản phẩm lỗi'?'LOI' : PROD_NHOM.includes(t)?'SX' : 'NVL', thuTu:NHOM_ORDER[t]??9, macDinh:1}));
const NHOM_LMAP = {}; NHOM_DEF0.forEach(x=>NHOM_LMAP[x.ten]=x.loai);
function nhomList(){ const L=(typeof state!=='undefined' && state.settings && state.settings.nhomList); return Array.isArray(L)&&L.length ? L : NHOM_DEF0; }
function applyNhom(){ const L=nhomList().slice().sort((a,b)=>num(a.thuTu)-num(b.thuTu) || a.ten.localeCompare(b.ten,'vi'));
  NHOM.splice(0, NHOM.length, ...L.map(x=>x.ten)); PROD_NHOM.splice(0, PROD_NHOM.length, ...L.filter(x=>x.loai!=='NVL').map(x=>x.ten));
  Object.keys(NHOM_ORDER).forEach(k=>delete NHOM_ORDER[k]); Object.keys(NHOM_LMAP).forEach(k=>delete NHOM_LMAP[k]); L.forEach(x=>{ NHOM_ORDER[x.ten]=num(x.thuTu); NHOM_LMAP[x.ten]=x.loai; }); }
const nhomLoai = n => NHOM_LMAP[n] || 'NVL';
const isFinal = it => !!it && nhomLoai(it.nhom)==='TP';
const isProd = it => !!it && PROD_NHOM.includes(it.nhom);
const isLoi = it => !!it && nhomLoai(it.nhom)==='LOI'; // sản phẩm hỏng trong định mức thu hồi (bánh lỗi) – nhập kho theo giá trị thuần có thể thực hiện được
const isMade = it => isProd(it) && !isLoi(it); // sản phẩm có lệnh sản xuất / định mức
const isNVL = it => !!it && !PROD_NHOM.includes(it.nhom);
const CAL_TYPES = ['Nghỉ lễ / công ty','Nghỉ chờ việc','Tăng ca / làm Chủ nhật'];
const F = {
  items:    ['ma','ten','nhom','dvt','kho'],
  bom:      ['loai','maTP','maNVL','slTP','slNVL','lanNgay','haoHut','maThayThe','tuNgay','denNgay','tyLe','ghiChu'],
  purchases:['ngayNhap','ngayMua','hoaDon','ncc','ma','sl','donGia','tt','kho','ghiChu','chuaHD','thueGTGT','maNCC','mauSo','kyHieu'],
  orders:   ['maLenh','ngayXuatNVL','ngaySX','maTP','loaiDM','slKH','dieuChinhTP','ghiChu','khoa','nguon','slDX','slGoc'],
  adjustments:['ngaySX','maTP','maVT','dieuChinh','lyDo','nguon'],
  issues:   ['maPhieu','ngay','maVT','sl','lyDo','loai','kho'],
  sales:    ['ngay','ma','sl','donGia','doanhSo','ghiChu','hoaDon','khach','kho'],
  plan:     ['ngaySX','maTP','soMe','ghiChu'],
  subs:     ['maTP','maNVL','maThayThe','tuNgay','denNgay','tyLe','ghiChu'],
  caps:     ['maTP','tuNgay','denNgay','lanNgay','meThang','ghiChu'],
  cal:      ['ngay','loai','ghiChu'],
};
const COSTCOLS0 = [{k:'c622',t:'622 Nhân công',g:'622'},{k:'c6273',t:'6273 Dụng cụ',g:'627'},{k:'c6274',t:'6274 Khấu hao',g:'627'},{k:'dien',t:'6277 Điện',g:'627'},{k:'nuoc',t:'6277 Nước',g:'627'}];
function costCols(){ const s=(typeof state!=='undefined' && state.settings && state.settings.costCols); return (Array.isArray(s)&&s.length) ? s : COSTCOLS0; }
function costF(){ return costCols().map(c=>c.k); }
function costSum(c, g){ return costCols().filter(x=>x.g===g).reduce((s,x)=>s+num((c||{})[x.k]),0); }
const COSTF = COSTCOLS0.map(c=>c.k);
const ISSUE_TYPES = ['Chi phí sản xuất (627)','Bán hàng (641)'];
const issueType = v => { const t=String(v||'').trim(); if (ISSUE_TYPES.includes(t)) return t; return /641|thử|mẫu|bán hàng|khuyến mãi|tiếp thị|marketing/i.test(t) ? ISSUE_TYPES[1] : ISSUE_TYPES[0]; };
const is627 = r => issueType(r.loai)===ISSUE_TYPES[0];
const KYFIELD = {purchases:'ngayNhap', orders:'ngaySX', issues:'ngay', sales:'ngay', plan:'ngaySX', adjustments:'ngaySX', cal:'ngay'};
// Tham số mặc định (lấy theo file Excel Giá thành Thiên Hồng)
const ALLOC0 = {cd1_622:0.8, cd1_627:1, rows:[{ma:'BTP_BGK',cd:1,t622:0.25,t627:0.6},{ma:'BTP_KT',cd:1,t622:0.25,t627:0.2},{ma:'BTP_BGKT',cd:1,t622:0.5,t627:0.2}]};
const PLANPRM0 = {bqDays:30, maxDays:15, minDays:1, giam:0.15, nlRate:0, nlUoc:{}, ss:{}, minKg:{}};
const NGUONG0 = [{key:'Sản phẩm lỗi',max:30,min:0,ghiChu:'Bánh lỗi bán giá thấp – rủi ro trên 1 tháng'},{key:'TP đóng gói (Ngày)',max:180,min:0,ghiChu:'Thành phẩm đóng gói – rủi ro trên 6 tháng'},{key:'Bán thành phẩm',max:2,min:0,ghiChu:'Bánh gấu khô, kem – rủi ro trên 2 ngày'},{key:'Thành phẩm',max:2,min:0,ghiChu:'Bánh gấu kem tươi – rủi ro trên 2 ngày'},{key:'NVL Bánh khô',max:90,min:5,ghiChu:'NVL – rủi ro trên 3 tháng'},{key:'NVL Kem tươi',max:90,min:5,ghiChu:'NVL – rủi ro trên 3 tháng'},{key:'Bao bì',max:365,min:0,ghiChu:'Bao bì – rủi ro trên 1 năm'},{key:'Nhiên liệu',max:30,min:0,ghiChu:'Nhiên liệu – rủi ro trên 1 tháng'},{key:'TRUNG_GA (Ngày)',max:10,min:3,ghiChu:'Trứng gà – rủi ro trên 10 ngày'}];
// Sản phẩm lỗi (hỏng trong định mức) – VAS 02: tính theo giá trị thuần có thể thực hiện được, trừ khỏi giá thành sản phẩm chính
const SPLOI0 = [{maSP:'BTP_BGK', maLoi:'BTP_BGK_LOI', tenLoi:'Bánh gấu khô lỗi (dẹp)', tyLe:0.07, gia:8000, tuKy:'2026-01', ghiChu:'Bánh gấu khô bị dẹp khi lựa bánh bơm kem – bán giá thấp'}];
function spLoiList(){ const a=state.settings.spLoi; return Array.isArray(a) ? a : SPLOI0; }
function loiRule(maSP, ngay){ const k=kyOf(ngay); const c=spLoiList().filter(r=>r.maSP===maSP && r.maLoi && (!r.tuKy || k>=r.tuKy)).sort((a,b)=>(b.tuKy||'').localeCompare(a.tuKy||'')); const r=c[0]; return r && num(r.tyLe)>0 ? r : null; }
function allocCfg(){ const a=state.settings.alloc; return (a && Array.isArray(a.rows)) ? a : ALLOC0; }
function planPrm(){ const p=Object.assign({}, PLANPRM0, state.settings.planPrm||{}); p.ss=p.ss||{}; p.minKg=p.minKg||{}; p.nlUoc=p.nlUoc||{}; return p; }
function nguongList(){ const n=state.settings.nguong; if (Array.isArray(n) && n.length && !state.settings.nguongV2) { // 03/11/2026: Tồn tối đa = mốc RỦI RO theo quy định công ty (cảnh báo = một nửa)
    const map={'TP đóng gói (Ngày)':180,'Bán thành phẩm':2,'Thành phẩm':2,'NVL Bánh khô':90,'NVL Kem tươi':90,'Bao bì':365,'Nhiên liệu':30,'TRUNG_GA (Ngày)':10}; n.forEach(x=>{ if (x.key in map) x.max=map[x.key]; }); if (!n.some(x=>x.key==='TRUNG_GA (Ngày)')) n.push({key:'TRUNG_GA (Ngày)',max:10,min:3,ghiChu:'Trứng gà – rủi ro trên 10 ngày'}); state.settings.nguongV2=1; }
  if (Array.isArray(n) && n.length && !n.some(x=>x.key==='Sản phẩm lỗi')) n.splice(1,0,{key:'Sản phẩm lỗi',max:30,min:0,ghiChu:'Bánh lỗi bán giá thấp – rủi ro trên 1 tháng'});
  return Array.isArray(n)&&n.length ? n : NGUONG0; }

// Sheet gộp GiaoDich: một dòng = một chứng từ, cột Loại quyết định loại dữ liệu
const GD_COLS = ['Loại (MUA/BAN)','Ngày','Hóa đơn','Nhà cung cấp / Khách hàng','Mã hàng','Số lượng','Đơn giá','Thành tiền / Doanh số','Ghi chú'];
const GD_TYPES = {MUA:'purchases', BAN:'sales'};
function splitGiaoDich(aoa){
  const out = {}; const push=(ent,row)=>{ (out[ent]=out[ent]||[]).push(row); };
  aoa.forEach((r,i)=>{ if (i===0 && String(r[0]||'').toLowerCase().startsWith('lo')) return; const loai=String(r[0]||'').trim().toUpperCase(); const ent=GD_TYPES[loai]; if(!ent) return;
    const [ ,ngay,ct,ncc,ma,sl,dg,tt,gc] = r;
    if (ent==='purchases') push(ent,[ngay,ngay,ct,ncc,ma,sl,dg,tt,'',gc]);
    else if (ent==='sales') push(ent,[ngay,ct,ncc,ma,sl,dg,tt,gc]);
  });
  return out;
}
// Mẫu tải dữ liệu (tên sheet + tiêu đề cột)
const TEMPLATE = {
  DanhMuc:     {ent:'items', cols:[['ma','Mã'],['ten','Tên hàng'],['nhom','Nhóm hàng'],['dvt','ĐVT'],['kho','Kho']]},
  TonDau:      {ent:'opening', cols:[['ky','Kỳ (mm/yyyy)'],['ma','Mã hàng'],['sl','Tồn đầu kỳ - Số lượng'],['tt','Tồn đầu kỳ - Giá trị'],['kho','Kho']]},
  DinhMuc:     {ent:'bom', cols:[['loai','Loại ĐM'],['maTP','Mã TP'],['maNVL','Mã NVL'],['slTP','SL TP/lần'],['slNVL','SL NVL/lần'],['lanNgay','Lần/ngày'],['haoHut','Hao hụt % (gõ 2% hoặc 0.02)'],['tuNgay','Hiệu lực từ (trống = từ đầu)'],['denNgay','Hiệu lực đến (trống = vô thời hạn)'],['ghiChu','Ghi chú']]},
  NVLThayThe:  {ent:'subs', cols:[['maTP','Mã TP (trống = mọi TP)'],['maNVL','Mã NVL gốc'],['maThayThe','Mã NVL thay thế'],['tuNgay','Từ ngày'],['denNgay','Đến ngày (trống = vô thời hạn)'],['tyLe','Tỷ lệ thay thế (0.3 = 30%, trống = 100%)'],['ghiChu','Ghi chú']]},
  MuaHang:     {ent:'purchases', cols:[['ngayNhap','Ngày nhập kho'],['ngayMua','Ngày hóa đơn'],['hoaDon','Số hóa đơn'],['ncc','Nhà cung cấp'],['ma','Mã hàng'],['sl','Số lượng'],['donGia','Đơn giá'],['tt','Thành tiền'],['kho','Kho'],['ghiChu','Ghi chú'],['chuaHD','Mua hàng chưa HĐ (tự ghi, để trống được)'],['thueGTGT','% thuế GTGT (gõ 8% hoặc 0.08)'],['maNCC','Mã nhà cung cấp'],['mauSo','Mẫu số HĐ'],['kyHieu','Ký hiệu HĐ']]},
  LenhSX:      {ent:'orders', cols:[['khoa','Khóa kế hoạch (MÃ#yyyymmdd@SL~mẻ – nếu có thì bỏ trống các cột sau)'],['ngaySX','Ngày sản xuất'],['maTP','Mã sản phẩm'],['slKH','Số lượng'],['dieuChinhTP','Điều chỉnh TP (+/- thùng, chỉ dòng thành phẩm)'],['loaiDM','Loại ĐM'],['ghiChu','Ghi chú']]},
  CanDoiNVL:   {ent:'adjustments', cols:[['ngaySX','Ngày sản xuất'],['maTP','Mã sản phẩm'],['maVT','Mã VT/HH'],['dieuChinh','SL cân đối (+/-)'],['lyDo','Lý do']]},
  XuatChung:   {ent:'issues', cols:[['maPhieu','Số chứng từ (trống = tự sinh)'],['ngay','Ngày xuất'],['maVT','Mã VT'],['sl','Số lượng'],['lyDo','Lý do'],['loai','Loại xuất (627 / 641)'],['kho','Kho']]},
  BanHang:     {ent:'sales', cols:[['ngay','Ngày hóa đơn'],['hoaDon','Số hóa đơn'],['khach','Tên khách hàng'],['ma','Mã hàng'],['sl','Số lượng bán'],['donGia','Đơn giá'],['doanhSo','Doanh số (trống = SL × đơn giá)'],['ghiChu','Ghi chú'],['kho','Kho']]},
  LichNghi:    {ent:'cal', cols:[['ngay','Ngày'],['loai','Loại (Nghỉ lễ / công ty · Nghỉ chờ việc · Tăng ca / làm Chủ nhật)'],['ghiChu','Lý do / ghi chú']]},
  ChiPhi:      {ent:'costs', get cols(){ return [['ky','Kỳ (mm/yyyy)'], ...costCols().map(c=>[c.k,c.t])]; }},
};
// Dòng ví dụ cho từng sheet mẫu (người dùng xóa đi rồi dán dữ liệu thật)
const SAMPLES = {
  DanhMuc:[['BM_TH','Bột mì Trung 1 Thiên Hồng (Bao giấy)/25Kg','Bánh khô','kg','152']],
  TonDau:[['2026-01','BM_TH',100,1388900]],
  DinhMuc:[['DM','BTP_BGK','BM_TH',100,75,'',0,'','','']],
  NVLThayThe:[['BTP_BGK','DB','CB_AMF','2026-08-05','',1,'Hết dầu bơ']],
  MuaHang:[['2026-01-02','2026-01-02','31','','TRUNG_GA',1800,2300,4140000,'152','']],
  BanHang:[['2026-01-02','2','Khách A','TP_BKG_150G',60,356481.48,'','']],
  GiaoDich:[['MUA','2026-01-02','31','Nhà cung cấp A','TRUNG_GA',1800,2300,4140000,''],['BAN','2026-01-02','2','Khách A','TP_BKG_150G',60,356481.48,'','']],
  LenhSX:[['BTP_BGK#20260102@300.~3.','','','','','',''],['','2026-01-02','TP_BKG',45,'','DM','']],
  CanDoiNVL:[['2026-03-27','BTP_BGK','DB',-15.3,'Giảm tiêu hao để bù tồn âm']],
  XuatChung:[['','2026-01-31','GAS_45',23,'Gas dùng chung tháng 1','Chi phí sản xuất (627)']],
  LichNghi:[['2026-01-01','Nghỉ lễ / công ty','Tết Dương lịch']],
  ChiPhi:[['2026-01',90745650,0,0,57385369,0]],
};
const SAMPLE_NOTE = 'Dòng 2 là ví dụ – xóa đi rồi dán dữ liệu của bạn từ dòng 2. Chỉ điền các cột có trong mẫu; tên hàng, ĐVT, giá vốn… phần mềm tự dò. Mã hàng phải có trong Danh mục.';
function sampleSheet(name, cols){ const aoa=[cols, ...(SAMPLES[name]||[]).map(r=>cols.map((_,i)=>r[i]??''))]; const ws=XW.aoa_to_sheet(aoa); const n=(SAMPLES[name]||[]).length; XW.sheet_add_aoa(ws, [[SAMPLE_NOTE]], {origin:{r:n+2, c:0}}); ws['!cols']=cols.map(c=>({wch:Math.max(12,Math.min(34,c.length+2))})); return ws; }
const DATEF = new Set(['ngayNhap','ngayMua','ngayXuatNVL','ngaySX','ngay','tuNgay','denNgay']);
const NUMF = new Set(['slDX','meThang','soMe','slTP','slNVL','lanNgay','haoHut','tyLe','sl','donGia','tt','slKH','dieuChinhTP','dieuChinh','doanhSo',...COSTF]);
