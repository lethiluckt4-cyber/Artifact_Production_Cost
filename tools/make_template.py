import json, sys, datetime
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

seed = json.load(open(sys.argv[1]))
with_data = sys.argv[3] == '1'
SKIP = {'purchases','sales'}
out = sys.argv[2]

GD_COLS=['Loại (MUA/BAN)','Ngày','Hóa đơn','Nhà cung cấp','Mã hàng','Số lượng','Đơn giá','Thành tiền / Doanh số','Ghi chú']
GD_NOTE='SHEET NHẬP LIỆU ĐỊNH KỲ – toàn bộ chứng từ MUA HÀNG (Loại = MUA) và BÁN HÀNG (Loại = BAN) của nhiều tháng trong một sheet. Dòng BAN: chỉ điền Ngày, Mã hàng, Số lượng, Thành tiền = doanh số (đơn giá bán phần mềm tự chia ngược). Lệnh SX, điều chỉnh NVL, định mức, kế hoạch SX, xuất dùng chung: sheet riêng như cũ. Chi phí 622/627: nhập tay trong phần mềm.'
SHEETS = [
 ('DanhMuc', 'items', [('ma','Mã'),('ten','Tên hàng'),('nhom','Nhóm hàng'),('dvt','ĐVT'),('kho','Kho')],
  'Nhóm hàng: Thành phẩm / NVLC / PG / GV / BB. Mã đã có trong phần mềm sẽ được cập nhật tên, nhóm, ĐVT, kho.'),
 ('TonDau', 'opening', [('ky','Kỳ (mm/yyyy)'),('ma','Mã'),('sl','Tồn đầu SL'),('tt','Tồn đầu TT')],
  'CHỈ NHẬP MỘT LẦN cho kỳ bắt đầu. Các kỳ sau (và năm sau) phần mềm tự chuyển tồn cuối → tồn đầu. Nhập sheet này sẽ thay toàn bộ tồn đầu.'),
 ('DinhMuc', 'bom', [('loai','Loại ĐM'),('maTP','Mã TP'),('maNVL','Mã NVL'),('slTP','SL TP/lần'),('slNVL','SL NVL/lần'),('lanNgay','Số lần/ngày'),('haoHut','Hao hụt (%)'),('tuNgay','Hiệu lực từ (trống = từ đầu)'),('denNgay','Hiệu lực đến (trống = vô thời hạn)'),('ghiChu','Ghi chú')],
  'Mỗi dòng = 1 NVL của 1 thành phẩm. SL TP/lần = sản lượng 1 mẻ. Hiệu lực từ/đến: trống = áp dụng mãi; đổi NVL vĩnh viễn = đặt Hiệu lực đến cho dòng cũ + thêm dòng mới có Hiệu lực từ. Thay thế tạm thời khai ở sheet NVLThayThe.'),
 ('NVLThayThe', 'subs', [('maTP','Mã TP (trống = mọi TP)'),('maNVL','Mã NVL gốc'),('maThayThe','Mã NVL thay thế'),('tuNgay','Từ ngày'),('denNgay','Đến ngày (trống = vô thời hạn)'),('tyLe','Tỷ lệ thay thế (0.3 = 30%, trống = 100%)'),('ghiChu','Ghi chú')],
  'Mỗi dòng = một THỜI KỲ thay thế. Lệnh SX có Ngày SX trong khoảng Từ–Đến ngày sẽ dùng NVL thay thế khi tính giá thành: thay toàn bộ (tỷ lệ trống) hoặc tách 2 dòng theo tỷ lệ (ví dụ 0.3: gốc 70%, thay thế 30%). Mã TP trống = áp dụng cho mọi thành phẩm dùng NVL đó.'),
 ('MuaHang', 'purchases', [('ngayNhap','Ngày nhập kho'),('ngayMua','Ngày hóa đơn'),('hoaDon','Hóa đơn'),('ncc','Nhà cung cấp'),('ma','Mã hàng'),('sl','Số lượng'),('donGia','Đơn giá'),('tt','Thành tiền'),('ghiChu','Ghi chú')],
  'Ngày nhập kho quyết định kỳ hạch toán vào NXT; Ngày hóa đơn chỉ để đối chiếu chứng từ. Ngày kiểu Ngày của Excel (dd/mm/yyyy). Thành tiền trống sẽ = Số lượng × Đơn giá.'),
 ('KeHoachSX', 'plan', [('ngaySX','Ngày SX'),('maTP','Mã TP'),('soMe','Số mẻ'),('ghiChu','Ghi chú')],
  'Kế hoạch sản xuất theo ngày: mỗi dòng = 1 thành phẩm × số mẻ dự kiến. Phần mềm đối chiếu với Lệnh SX để tạo mới / cập nhật.'),
 ('LenhSX', 'orders', [('maLenh','Mã lệnh (trống = tự sinh)'),('ngayXuatNVL','Ngày xuất NVL (= ngày SX)'),('maTP','Mã TP'),('loaiDM','Loại ĐM'),('soMeKH','Số mẻ kế hoạch'),('dieuChinhMe','Điều chỉnh mẻ'),('ghiChu','Ghi chú')],
  'Mã lệnh trống → tự sinh LSXyyyy-mm.dd-nn. Ngày SX = Ngày xuất NVL. Loại ĐM trống = DM. Số mẻ thực hiện = Mẻ kế hoạch + Điều chỉnh mẻ.'),
 ('DieuChinhNVL', 'adjustments', [('maLenh','Mã lệnh'),('maVT','Mã VT'),('dieuChinh','Điều chỉnh SL (+/-)'),('lyDo','Lý do')],
  'Chênh lệch xuất NVL thực tế so với định mức, theo từng lệnh. Số âm = giảm, dương = xuất thêm. Mã lệnh phải có trong LenhSX.'),
 ('LichNghi', 'cal', [('ngay','Ngày'),('loai','Loại (Nghỉ lễ / công ty · Nghỉ chờ việc · Tăng ca)'),('ghiChu','Lý do / ghi chú')], 'Ngày nghỉ lễ, nghỉ chờ việc, hoặc ngày Tăng ca (làm vào ngày nghỉ cố định). Mặc định nghỉ Chủ nhật.'),
 ('XuatChung', 'issues', [('maPhieu','Số chứng từ (trống = tự sinh)'),('ngay','Ngày xuất'),('loai','Loại xuất (641 thử nghiệm / 627 dùng chung SX)'),('maVT','Mã VT'),('sl','Số lượng'),('lyDo','Lý do')],
  'Xuất vật tư thử nghiệm / dùng chung không gắn lệnh sản xuất. Đơn giá lấy theo giá vốn kỳ.'),
 ('BanHang', 'sales', [('ngay','Ngày hóa đơn'),('ma','Mã hàng'),('sl','Số lượng bán'),('doanhSo','Doanh số (đồng)'),('ghiChu','Ghi chú')],
  'Mỗi dòng = tổng bán của 1 mã trong 1 ngày (hoặc từng hóa đơn). Doanh số = tổng tiền bán của dòng đó.'),
 ('ChiPhi', 'costs', [('ky','Kỳ (mm/yyyy)'),('c622','622 Nhân công'),('c6273','6273 Dụng cụ'),('c6274','6274 Khấu hao'),('dien','Điện'),('nuoc','Nước'),('khac','Chi phí khác')],
  'Mỗi dòng một tháng. Chi phí phân bổ vào các lệnh SX trong tháng theo tỷ lệ chi phí NVL (621).'),
]
DATEF = {'ngayNhap','ngayMua','ngayXuatNVL','ngaySX','ngay','tuNgay','denNgay'}
NUMF = {'meThang','soMe','slTP','slNVL','lanNgay','haoHut','tyLe','sl','donGia','tt','soMeKH','dieuChinhMe','dieuChinh','doanhSo','c622','c6273','c6274','dien','nuoc','khac'}

SAMPLES = {
 'items':[{'ma':'TRGA','ten':'Trứng gà','nhom':'NVLC','dvt':'Quả','kho':'152'}],
 'opening':[{'ky':'2026-10','ma':'TRGA','sl':41380,'tt':86150710}],
 'bom':[{'loai':'DM','maTP':'BO','maNVL':'TRGA','slTP':23,'slNVL':30,'lanNgay':16}],
 'subs':[{'maTP':'','maNVL':'TRGA','maThayThe':'TRGA2','tuNgay':'2026-11-05','denNgay':'2026-11-20','tyLe':0.3,'ghiChu':'Hết trứng loại 1'}],
 'orders':[{'maLenh':'','ngayXuatNVL':'2026-11-03','maTP':'BO','loaiDM':'DM','soMeKH':16}],
 'adjustments':[{'maLenh':'LSX2026-11.03-01','maVT':'TRGA','dieuChinh':-10,'lyDo':'Thực tế xuất ít hơn định mức'}],
 'plan':[{'ngaySX':'2026-11-03','maTP':'BO','soMe':16}],
 'cal':[{'ngay':'2026-11-09','loai':'Nghỉ lễ / công ty','ghiChu':'Ví dụ ngày nghỉ'},{'ngay':'2026-11-15','loai':'Tăng ca','ghiChu':'Làm Chủ nhật'}],
 'issues':[{'maPhieu':'','ngay':'2026-11-03','loai':'641','maVT':'TRGA','sl':20,'lyDo':'Thử nghiệm sản phẩm'},{'maPhieu':'','ngay':'2026-11-03','loai':'627','maVT':'DAU','sl':5,'lyDo':'Dùng chung cho sản xuất'}],
 'costs':[{'ky':'2026-11','c622':120000000,'c6273':0,'c6274':4229167,'dien':53000000,'nuoc':2700000,'khac':69000000}],
}
NOTE='Dòng 2 là ví dụ – xóa đi rồi dán dữ liệu của bạn từ dòng 2. Chỉ điền các cột có trong mẫu; tên hàng, ĐVT, giá vốn… phần mềm tự dò. Mã hàng phải có trong Danh mục.'
def rows_for(ent):
    if not with_data: return SAMPLES.get(ent, [])
    if ent == 'opening':
        items={i['ma']:i for i in seed['items']}
        return [{'ky': seed['opening']['ky'], 'ma': ma, 'kho': items.get(ma,{}).get('kho',''), 'sl': v['sl'], 'tt': v['tt']} for ma, v in seed['opening']['rows'].items()]
    if ent == 'costs':
        return [c for c in seed['costs'] if any(c[f] for f in ['c622','c6273','c6274','dien','nuoc','khac'])]
    return seed.get(ent, [])

def gd_rows():
    if not with_data: return [['MUA','2026-11-03','1297','Hộ Kinh Doanh Phát Hải','TRGA',1500,2100,3150000,''],['BAN','2026-11-03','','','BO',491.3,None,27190473,'']]
    g=[]
    for r in seed['purchases']: g.append(['MUA',r['ngayNhap'],r['hoaDon'],r['ncc'],r['ma'],r['sl'],r['donGia'],r['tt'],r['ghiChu']])
    for r in seed['sales']: g.append(['BAN',r['ngay'],'','',r['ma'],r['sl'],None,r['doanhSo'],r.get('ghiChu','')])
    g.sort(key=lambda x:(x[1],x[0]))
    return g
wb = Workbook()
hdr_fill = PatternFill('solid', fgColor='FFF2CC'); hdr_font = Font(bold=True)
thin = Side(style='thin', color='BFBFBF'); border = Border(left=thin, right=thin, top=thin, bottom=thin)
ws = wb.active; ws.title = 'HuongDan'
ws['A1'] = 'HƯỚNG DẪN TẢI DỮ LIỆU VÀO PHẦN MỀM GIÁ THÀNH'; ws['A1'].font = Font(bold=True, size=14)
lines = [
 '1. Sheet GiaoDich = nhập liệu định kỳ: đổ toàn bộ MUA HÀNG và BÁN HÀNG của nhiều tháng vào một sheet (cột Loại = MUA / BAN). Các sheet khác: DanhMuc, TonDau, DinhMuc, LenhSX, DieuChinhNVL, KeHoachSX, XuatChung (như file cũ). Chi phí 622/627 nhập tay trong phần mềm. GIỮ NGUYÊN tên sheet và thứ tự cột; dòng 1 là tiêu đề.',
 '2. Copy dữ liệu từ file giá thành hiện tại vào đúng sheet (Paste Values). Sheet không có dữ liệu thì để trống.',
 '3. Ngày: ô kiểu Ngày của Excel (dd/mm/yyyy). Kỳ: dạng 2026-10 hoặc 10/2026.',
 '4. Tồn đầu kỳ (TonDau) chỉ nhập MỘT LẦN cho kỳ bắt đầu. Từ kỳ sau trở đi (kể cả sang năm mới) phần mềm tự chuyển số dư.',
 '5. Một file có thể chứa dữ liệu của nhiều tháng, nhiều năm.',
 '6. Trong phần mềm: menu "Tải dữ liệu từ Excel" → kéo thả file này → chọn chế độ "Thay thế các tháng có trong file" → Nhập dữ liệu.',
 '7. Sau khi nhập, xem "Cảnh báo & kiểm tra" để bổ sung mã thiếu / định mức thiếu, rồi xem Tổng quan, NXT, Giá thành.',
]
for i, l in enumerate(lines): ws.cell(row=3+i, column=1, value=l)
r = 3 + len(lines) + 1
for j, h in enumerate(['Sheet', 'Các cột (đúng thứ tự)', 'Ghi chú']):
    c = ws.cell(row=r, column=1+j, value=h); c.font = hdr_font; c.fill = hdr_fill
r += 1
ws.cell(row=r, column=1, value='GiaoDich').font = Font(bold=True)
ws.cell(row=r, column=2, value=' | '.join(GD_COLS)).alignment = Alignment(wrap_text=True, vertical='top')
ws.cell(row=r, column=3, value=GD_NOTE).alignment = Alignment(wrap_text=True, vertical='top')
for name, ent, cols, note in SHEETS:
    if ent in SKIP: continue
    r += 1
    ws.cell(row=r, column=1, value=name).font = Font(bold=True)
    ws.cell(row=r, column=2, value=' | '.join(c[1] for c in cols)).alignment = Alignment(wrap_text=True, vertical='top')
    ws.cell(row=r, column=3, value=note).alignment = Alignment(wrap_text=True, vertical='top')
ws.column_dimensions['A'].width = 16; ws.column_dimensions['B'].width = 90; ws.column_dimensions['C'].width = 80

ws = wb.create_sheet('GiaoDich')
for j,h in enumerate(GD_COLS):
    c=ws.cell(row=1,column=1+j,value=h); c.font=hdr_font; c.fill=hdr_fill; c.border=border; c.alignment=Alignment(wrap_text=True,vertical='center')
    ws.column_dimensions[get_column_letter(1+j)].width = max(13, min(45, len(h)+3))
ws.freeze_panes='A2'
for i,row in enumerate(gd_rows()):
    for j,v in enumerate(row):
        if j==1 and v: v=datetime.datetime.strptime(v,'%Y-%m-%d')
        c=ws.cell(row=2+i,column=1+j,value=v)
        if j==1: c.number_format='dd/mm/yyyy'
        elif j in (5,6,7): c.number_format='#,##0.##'
from openpyxl.worksheet.datavalidation import DataValidation
dv=DataValidation(type='list', formula1='"MUA,BAN"', allow_blank=True); ws.add_data_validation(dv); dv.add('A2:A20000')
ws.auto_filter.ref = f"A1:I{max(2,1+len(gd_rows()))}"
if not with_data: ws.cell(row=len(gd_rows())+4, column=1, value=NOTE).font=Font(italic=True, color='666666')
for name, ent, cols, note in SHEETS:
    if ent in SKIP: continue
    ws = wb.create_sheet(name)
    for j, (k, h) in enumerate(cols):
        c = ws.cell(row=1, column=1+j, value=h); c.font = hdr_font; c.fill = hdr_fill; c.border = border; c.alignment = Alignment(wrap_text=True, vertical='center')
        ws.column_dimensions[get_column_letter(1+j)].width = max(13, min(40, len(h)+3))
    ws.freeze_panes = 'A2'
    for i, row in enumerate(rows_for(ent)):
        for j, (k, h) in enumerate(cols):
            v = row.get(k, '')
            if k in DATEF and v:
                v = datetime.datetime.strptime(v, '%Y-%m-%d')
            elif k in NUMF:
                v = v if v not in ('', None) else None
                if v == 0 and k in ('dieuChinhMe','haoHut','tyLe','lanNgay'): v = None
            if k=='ky' and v: v = datetime.datetime.strptime(v, '%Y-%m')
            c = ws.cell(row=2+i, column=1+j, value=v)
            if k=='ky': c.number_format = 'mm/yyyy'
            elif k in DATEF: c.number_format = 'dd/mm/yyyy'
            elif k in NUMF: c.number_format = '#,##0.####' if k in ('sl','slNVL','slTP','soMeKH','dieuChinhMe','dieuChinh','tyLe','haoHut') else '#,##0'
    if not with_data:
        ws.cell(row=2+len(rows_for(ent))+2, column=1, value=NOTE).font = Font(italic=True, color='666666')
    if ent == 'items':
        from openpyxl.worksheet.datavalidation import DataValidation
        dv = DataValidation(type='list', formula1='"Thành phẩm,NVLC,PG,GV,BB"', allow_blank=True); ws.add_data_validation(dv); dv.add('C2:C5000')
    ws.auto_filter.ref = f"A1:{get_column_letter(len(cols))}{max(2, 1+len(rows_for(ent)))}"
BASE_FONT='Aptos Narrow'
for ws in wb.worksheets:
    for row in ws.iter_rows():
        for c in row:
            f=c.font; c.font=Font(name=BASE_FONT, size=11, bold=f.bold, italic=f.italic, color=f.color)

wb.save(out); print('saved', out)
