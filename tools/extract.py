import openpyxl, json, sys, datetime
src = sys.argv[1]
wb = openpyxl.load_workbook(src, data_only=True)

def d(v):
    if isinstance(v, datetime.datetime): return v.strftime('%Y-%m-%d')
    if isinstance(v, datetime.date): return v.strftime('%Y-%m-%d')
    return v
def n(v):
    if v is None or v == '': return 0
    try: return float(v)
    except: return 0
def s(v): return '' if v is None else str(v).strip()
def isd(v): return isinstance(v,(datetime.datetime,datetime.date))

out = {}
# items + opening
ws = wb['NXT']; items=[]; opening={}
for r in ws.iter_rows(min_row=6, values_only=True):
    if not r[2] or r[2]=='-' or s(r[1])=='Tổng cộng': continue
    items.append({'ma':s(r[2]),'ten':s(r[3]),'nhom':s(r[4]),'dvt':s(r[5]),'kho':s(r[1])})
    opening[s(r[2])] = {'sl':n(r[7]),'tt':n(r[8])}
out['items']=items; out['opening']={'ky':'2026-10','rows':opening}
# bom
ws = wb['Dinh muc']; bom=[]
for r in ws.iter_rows(min_row=4, values_only=True):
    if not r[2] or not r[6]: continue
    bom.append({'loai':s(r[0]) or 'DM','maTP':s(r[2]),'maNVL':s(r[6]),'slTP':n(r[9]),'slNVL':n(r[10]),'lanNgay':n(r[11]),'haoHut':n(r[12]),
                'ghiChu':s(r[14]),'maThayThe':s(r[15]),'tuNgay':d(r[16]) or '','denNgay':d(r[17]) or '','tyLe':n(r[18])})
out['bom']=bom
# purchases
ws = wb['Mua hang']; pur=[]
for r in ws.iter_rows(min_row=5, values_only=True):
    if not r[4] or not isd(r[0]): continue
    pur.append({'ngayNhap':d(r[0]),'ngayMua':d(r[1]) or d(r[0]),'hoaDon':s(r[2]),'ncc':s(r[3]),'ma':s(r[4]),'sl':n(r[7]),'donGia':n(r[8]),'tt':n(r[9]),'kho':s(r[10]),'ghiChu':s(r[16])})
out['purchases']=pur
# orders
ws = wb['Lenh san xuat']; orders=[]
for r in ws.iter_rows(min_row=4, values_only=True):
    if not r[5] or not isd(r[4]): continue
    orders.append({'maLenh':s(r[1]),'ngayXuatNVL':d(r[3]) or d(r[4]),'ngaySX':d(r[4]),'maTP':s(r[5]),'loaiDM':s(r[6]) or 'DM','soMeKH':n(r[9]),'dieuChinhMe':n(r[11]),'ghiChu':s(r[15])})
out['orders']=orders
# adjustments
ws = wb['Nhap dieu chinh']; adj=[]
for r in ws.iter_rows(min_row=6, values_only=True):
    if not r[0] or not r[3]: continue
    adj.append({'maLenh':s(r[0]),'maVT':s(r[3]),'dieuChinh':n(r[5]),'lyDo':s(r[6])})
out['adjustments']=adj
# common issues
ws = wb['XK thu nghiem']; iss=[]
for r in ws.iter_rows(min_row=5, values_only=True):
    if not r[3] or not isd(r[1]): continue
    iss.append({'maPhieu':s(r[0]),'ngay':d(r[1]),'maVT':s(r[3]),'sl':n(r[6]),'lyDo':s(r[9])})
out['issues']=iss
# sales
ws = wb['Ban hang']; sales=[]
for r in ws.iter_rows(min_row=5, values_only=True):
    if not r[2] or not isd(r[1]): continue
    sales.append({'ngay':d(r[1]),'ma':s(r[2]),'sl':n(r[5]),'doanhSo':n(r[7])})
out['sales']=sales
# costs
ws = wb['622+627']; costs=[]
for r in ws.iter_rows(min_row=3, max_row=14, values_only=True):
    m = r[0]
    if not isinstance(m,(int,float)): continue
    costs.append({'ky':'2026-%02d'%int(m),'c622':n(r[5]),'c6273':n(r[9]),'c6274':n(r[10]),'dien':n(r[12]),'nuoc':n(r[13]),'khac':n(r[14])})
out['costs']=costs
# reference values for verification
ws = wb['NXT']; ref={}
for r in ws.iter_rows(min_row=6, values_only=True):
    if not r[2] or s(r[1])=='Tổng cộng': continue
    ref[s(r[2])]={'giaVon':n(r[6]),'nhapSL':n(r[9]),'nhapTT':n(r[10]),'xuatSL':n(r[11]),'xuatTT':n(r[12]),'tonSL':n(r[13]),'tonTT':n(r[14])}
out['ref']={'nxt':ref}
ws = wb['Gia thanh']; gt={}
for r in ws.iter_rows(min_row=6, values_only=True):
    if not r[1]: continue
    gt.setdefault(r[1],{'154':0,'621':0})
    gt[r[1]]['154']+=n(r[29]); gt[r[1]]['621']+=n(r[26])
out['ref']['giaThanh']=gt
json.dump(out, open(sys.argv[2],'w'), ensure_ascii=False, indent=1)
print({k:len(v) if isinstance(v,list) else '-' for k,v in out.items()})
