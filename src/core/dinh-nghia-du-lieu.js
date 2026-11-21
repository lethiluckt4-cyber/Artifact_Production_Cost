//# Định nghĩa dữ liệu: nhóm hàng, F (thứ tự cột lưu), lịch nghỉ, chi phí, TEMPLATE/SAMPLES mẫu Excel, NUMF
// ---------- Định nghĩa dữ liệu ----------
const NHOM = ['Thành phẩm','NVLC','PG','GV','BB','Khác'];
const GROUPS0 = [['Thành phẩm','Thành phẩm','Nhóm hệ thống – hàng sản xuất ra, có định mức'],['NVLC','Nguyên vật liệu chính','Nhóm hệ thống – dùng để đề xuất tăng / giảm sản xuất'],['PG','Phụ gia',''],['GV','Gia vị',''],['BB','Bao bì','Nhóm hệ thống – quy tắc bao bì ≤ 10%'],['Khác','Khác','']];
const SYS_GROUPS = ['Thành phẩm','NVLC','BB'];
function groupCodes(){ const g=(typeof state!=='undefined' && state.groups && state.groups.length) ? state.groups.filter(x=>x.ma && !x._new).map(x=>x.ma) : NHOM; return g.length ? g : NHOM; }
function khoList(){ const s=new Set(); (state.items||[]).forEach(i=>{ if(i.kho) s.add(String(i.kho)); }); return [...s].sort(); }
function fillKhoDefaults(){ const km={}; (state.items||[]).forEach(i=>{ if(i.kho) km[i.ma]=String(i.kho); }); (state.purchases||[]).forEach(r=>{ if(!r.kho && km[r.ma]) r.kho=km[r.ma]; }); (state.sales||[]).forEach(r=>{ if(!r.kho && km[r.ma]) r.kho=km[r.ma]; }); (state.issues||[]).forEach(r=>{ if(!r.kho && km[r.maVT]) r.kho=km[r.maVT]; }); if (state.opening && state.opening.rows) for (const ma in state.opening.rows) { const o=state.opening.rows[ma]; if(!o.kho && km[ma]) o.kho=km[ma]; } }
function itemKho(ma){ const it=(state.items||[]).find(i=>i.ma===ma); return it && it.kho ? String(it.kho) : ''; }
const F = {
  items:    ['ma','ten','nhom','dvt','kho'],
  bom:      ['loai','maTP','maNVL','slTP','slNVL','lanNgay','haoHut','maThayThe','tuNgay','denNgay','tyLe','ghiChu'],
  purchases:['ngayNhap','ngayMua','hoaDon','ncc','ma','sl','donGia','tt','kho','ghiChu','nkGoc','maNCC','mauSo','kyHieu','thueSuat','tienThue'],
  orders:   ['maLenh','ngayXuatNVL','ngaySX','maTP','loaiDM','soMeKH','dieuChinhMe','ghiChu','dcPM'],
  adjustments:['maLenh','maVT','dieuChinh','lyDo','ngaySX','maTP'],
  issues:   ['maPhieu','ngay','maVT','sl','lyDo','loai','kho'],
  sales:    ['ngay','ma','sl','donGia','doanhSo','ghiChu','kho'],
  groups:   ['ma','ten','ghiChu'],
  plan:     ['ngaySX','maTP','soMe','ghiChu'],
  subs:     ['maTP','maNVL','maThayThe','tuNgay','denNgay','tyLe','ghiChu'],
  caps:     ['maTP','tuNgay','denNgay','lanNgay','meThang','ghiChu'],
  cal:      ['ngay','loai','ghiChu'],
};
const COSTCOLS0 = [{k:'c622',t:'622 Nhân công',g:'622'},{k:'c6273',t:'6273 Dụng cụ',g:'627'},{k:'c6274',t:'6274 Khấu hao',g:'627'},{k:'dien',t:'Điện',g:'627'},{k:'nuoc',t:'Nước',g:'627'},{k:'khac',t:'Chi phí khác',g:'627'}];
function costCols(){ const s=(typeof state!=='undefined' && state.settings && state.settings.costCols); return (Array.isArray(s)&&s.length) ? s : COSTCOLS0; }
const CAL_TYPES = ['Nghỉ lễ / công ty','Nghỉ chờ việc','Tăng ca'];
const HOL_L='Nghỉ lễ / công ty';
const HOL2026 = [
  ['2026-01-01',HOL_L,'Tết Dương lịch'],
  ['2026-02-14',HOL_L,'Thứ bảy trong kỳ nghỉ Tết Nguyên đán 9 ngày (14–22/02)'],
  ['2026-02-16',HOL_L,'Tết Nguyên đán – 29 tháng Chạp (ngày nghỉ 1)'],
  ['2026-02-17',HOL_L,'Tết Nguyên đán – mùng 1 (ngày nghỉ 2)'],
  ['2026-02-18',HOL_L,'Tết Nguyên đán – mùng 2 (ngày nghỉ 3)'],
  ['2026-02-19',HOL_L,'Tết Nguyên đán – mùng 3 (ngày nghỉ 4)'],
  ['2026-02-20',HOL_L,'Tết Nguyên đán – mùng 4 (ngày nghỉ 5)'],
  ['2026-02-21',HOL_L,'Thứ bảy trong kỳ nghỉ Tết Nguyên đán 9 ngày (14–22/02)'],
  ['2026-04-26',HOL_L,'Giỗ Tổ Hùng Vương (10/3 âm lịch, rơi Chủ nhật)'],
  ['2026-04-27',HOL_L,'Nghỉ bù Giỗ Tổ Hùng Vương'],
  ['2026-04-30',HOL_L,'Ngày Chiến thắng 30/4'],
  ['2026-05-01',HOL_L,'Quốc tế Lao động 1/5'],
  ['2026-08-31',HOL_L,'Nghỉ hoán đổi dịp Quốc khánh (làm bù thứ Bảy 22/8) – theo Bộ Nội vụ, doanh nghiệp tùy chọn'],
  ['2026-09-01',HOL_L,'Quốc khánh – ngày nghỉ liền kề trước 2/9'],
  ['2026-09-02',HOL_L,'Quốc khánh 2/9'],
];
function addHolidays(){ let n=0; const have=new Set(state.cal.map(r=>r.ngay)); HOL2026.forEach(([d,l,g])=>{ if(!have.has(d)){ state.cal.push({_id:uid(), ngay:d, loai:l, ghiChu:g}); n++; } }); return n; }
const THU = ['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
function thuOf(d){ if(!d) return ''; const x=new Date(d+'T00:00:00'); return isNaN(x)?'':THU[x.getDay()]; }
function isWorkDay(d){ const e=(state.cal||[]).find(r=>r.ngay===d && !r._new); if (e) return e.loai==='Tăng ca'; const wd=new Date(d+'T00:00:00').getDay(); if (wd===0 && state.settings.nghiCN!==false) return false; if (wd===6 && state.settings.nghiT7===true) return false; return true; }
function isChung627(r){ return String(r.loai||'').includes('627'); }
function costF(){ return costCols().map(c=>c.k); }
function costSum(c, g){ return costCols().filter(x=>x.g===g).reduce((s,x)=>s+num((c||{})[x.k]),0); }
const COSTF = COSTCOLS0.map(c=>c.k);
const KYFIELD = {purchases:'ngayNhap', orders:'ngayXuatNVL', issues:'ngay', sales:'ngay', plan:'ngaySX', cal:'ngay'};

// Sheet gộp GiaoDich: một dòng = một chứng từ, cột Loại quyết định loại dữ liệu
const GD_COLS = ['Loại (MUA/BAN)','Ngày','Hóa đơn','Nhà cung cấp','Mã hàng','Số lượng','Đơn giá','Thành tiền / Doanh số','Ghi chú'];
const GD_TYPES = {MUA:'purchases', BAN:'sales'};
function splitGiaoDich(aoa){
  const out = {}; const push=(ent,row)=>{ (out[ent]=out[ent]||[]).push(row); };
  aoa.forEach((r,i)=>{ if (i===0 && String(r[0]||'').toLowerCase().startsWith('lo')) return; const loai=String(r[0]||'').trim().toUpperCase(); const ent=GD_TYPES[loai]; if(!ent) return;
    const [ ,ngay,ct,ncc,ma,sl,dg,tt,gc] = r;
    if (ent==='purchases') push(ent,[ngay,ngay,ct,ncc,ma,sl,dg,tt,gc]);
    else if (ent==='sales') push(ent,[ngay,ma,sl,tt,gc]);
  });
  return out;
}
// Mẫu tải dữ liệu (tên sheet + tiêu đề cột)
const TEMPLATE = {
  DanhMuc:     {ent:'items', cols:[['ma','Mã'],['ten','Tên hàng'],['nhom','Nhóm hàng'],['dvt','ĐVT'],['kho','Kho']]},
  TonDau:      {ent:'opening', cols:[['ky','Kỳ (mm/yyyy)'],['ma','Mã'],['sl','Tồn đầu SL'],['tt','Tồn đầu TT']]},
  DinhMuc:     {ent:'bom', cols:[['loai','Loại ĐM'],['maTP','Mã TP'],['maNVL','Mã NVL'],['slTP','SL TP/lần'],['slNVL','SL NVL/lần'],['lanNgay','Số lần/ngày'],['haoHut','Hao hụt (%)'],['tuNgay','Hiệu lực từ (trống = từ đầu)'],['denNgay','Hiệu lực đến (trống = vô thời hạn)'],['ghiChu','Ghi chú']]},
  NVLThayThe:  {ent:'subs', cols:[['maTP','Mã TP (trống = mọi TP)'],['maNVL','Mã NVL gốc'],['maThayThe','Mã NVL thay thế'],['tuNgay','Từ ngày'],['denNgay','Đến ngày (trống = vô thời hạn)'],['tyLe','Tỷ lệ thay thế (0.3 = 30%, trống = 100%)'],['ghiChu','Ghi chú']]},
  MuaHang:     {ent:'purchases', cols:[['ngayNhap','Ngày nhập kho'],['ngayMua','Ngày hóa đơn'],['hoaDon','Hóa đơn'],['ncc','Nhà cung cấp'],['ma','Mã hàng'],['sl','Số lượng'],['donGia','Đơn giá'],['tt','Thành tiền'],['ghiChu','Ghi chú'],['maNCC','Mã NCC'],['mauSo','Mẫu số HĐ'],['kyHieu','Ký hiệu HĐ'],['thueSuat','Thuế suất GTGT (%)'],['tienThue','Tiền thuế GTGT']]},
  KeHoachSX:   {ent:'plan', cols:[['ngaySX','Ngày SX'],['maTP','Mã TP'],['soMe','Số mẻ'],['ghiChu','Ghi chú']]},
  LenhSX:      {ent:'orders', cols:[['maLenh','Mã lệnh (trống = tự sinh)'],['ngayXuatNVL','Ngày xuất NVL (= ngày SX)'],['maTP','Mã TP'],['loaiDM','Loại ĐM'],['soMeKH','Số mẻ kế hoạch'],['dieuChinhMe','Điều chỉnh mẻ'],['ghiChu','Ghi chú']]},
  DieuChinhNVL:{ent:'adjustments', cols:[['ngaySX','Ngày sản xuất'],['maTP','Mã sản phẩm'],['maLenh','Lệnh SX'],['maVT','Mã VT/HH'],['dieuChinh','SL cân đối (+/-)'],['lyDo','Lý do']]},
  LichNghi:    {ent:'cal', cols:[['ngay','Ngày'],['loai','Loại (Nghỉ lễ / công ty · Nghỉ chờ việc · Tăng ca)'],['ghiChu','Lý do / ghi chú']]},
  XuatChung:   {ent:'issues', cols:[['maPhieu','Số chứng từ (trống = tự sinh)'],['ngay','Ngày xuất'],['loai','Loại xuất (641 thử nghiệm / 627 dùng chung SX)'],['maVT','Mã VT'],['sl','Số lượng'],['lyDo','Lý do']]},
  BanHang:     {ent:'sales', cols:[['ngay','Ngày hóa đơn'],['ma','Mã hàng'],['sl','Số lượng bán'],['doanhSo','Doanh số (đồng)'],['ghiChu','Ghi chú']]},
  ChiPhi:      {ent:'costs', get cols(){ return [['ky','Kỳ (mm/yyyy)'], ...costCols().map(c=>[c.k,c.t])]; }},
};
// Dòng ví dụ cho từng sheet mẫu (người dùng xóa đi rồi dán dữ liệu thật)
const SAMPLES = {
  DanhMuc:[['TRGA','Trứng gà','NVLC','Quả','152']],
  TonDau:[['2026-10','TRGA',41380,86150710]],
  DinhMuc:[['DM','BO','TRGA',23,30,16,'','','','']],
  NVLThayThe:[['','TRGA','TRGA2','2026-11-05','2026-11-20',0.3,'Hết trứng loại 1']],
  MuaHang:[['2026-11-03','2026-11-03','1297','Hộ Kinh Doanh Phát Hải','TRGA',1500,2100,3150000,'','PHATHAI','1','C26THH',0,0]],
  BanHang:[['2026-11-03','BO',491.3,27190473,'']],
  GiaoDich:[['MUA','2026-11-03','1297','Hộ Kinh Doanh Phát Hải','TRGA',1500,2100,3150000,''],['BAN','2026-11-03','','','BO',491.3,'',27190473,'']],
  LenhSX:[['','2026-11-03','BO','DM',16,'','']],
  DieuChinhNVL:[['LSX2026-11.03-01','TRGA',-10,'Thực tế xuất ít hơn định mức']],
  KeHoachSX:[['2026-11-03','BO',16,'']],
  LichNghi:[['2026-11-09','Nghỉ lễ / công ty','Ví dụ ngày nghỉ'],['2026-11-15','Tăng ca','Làm Chủ nhật']],
  XuatChung:[['','2026-11-03','641','TRGA',20,'Thử nghiệm sản phẩm'],['','2026-11-03','627','DAU',5,'Dùng chung cho sản xuất']],
  ChiPhi:[['2026-11',120000000,0,4229167,53000000,2700000,69000000]],
};
const SAMPLE_NOTE = 'Dòng 2 là ví dụ – xóa đi rồi dán dữ liệu của bạn từ dòng 2. Chỉ điền các cột có trong mẫu; tên hàng, ĐVT, giá vốn… phần mềm tự dò. Mã hàng phải có trong Danh mục.';
function sampleSheet(name, cols){ const aoa=[cols, ...(SAMPLES[name]||[]).map(r=>cols.map((_,i)=>r[i]??''))]; const ws=XLSX.utils.aoa_to_sheet(aoa); const n=(SAMPLES[name]||[]).length; XLSX.utils.sheet_add_aoa(ws, [[SAMPLE_NOTE]], {origin:{r:n+2, c:0}}); ws['!cols']=cols.map(c=>({wch:Math.max(12,Math.min(34,c.length+2))})); return ws; }
const DATEF = new Set(['ngayNhap','ngayMua','ngayXuatNVL','ngaySX','ngay','tuNgay','denNgay']);
const NUMF = new Set(['dcPM','meThang','soMe','slTP','slNVL','lanNgay','haoHut','tyLe','sl','donGia','tt','soMeKH','dieuChinhMe','dieuChinh','doanhSo','tienThue',...COSTF]);

