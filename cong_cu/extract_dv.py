# Đọc file Excel giá thành Dương Vân -> seed.json (dữ liệu nhập) + expected.json (số đã tính trong Excel để đối chiếu)
import openpyxl, json, sys, datetime
src = sys.argv[1]; out_dir = sys.argv[2]
wb = openpyxl.load_workbook(src, data_only=True)

def d(v):
    if isinstance(v, datetime.datetime): return v.strftime('%Y-%m-%d')
    if isinstance(v, datetime.date): return v.strftime('%Y-%m-%d')
    return '' if v is None else str(v)
def n(v):
    try: return float(v) if v not in (None, '') else 0
    except: return 0
def s(v): return '' if v is None else str(v).strip()

NHOM_MAP = {'HH':'Hàng hóa','DV':'Dịch vụ gia công','BTP':'Bán thành phẩm','TP':'Thành phẩm'}
def nhom_nvl(ma):
    if ma.startswith('VAI') or ma=='VALO': return 'Vải'
    if ma.startswith('TEM') or ma=='TUZI': return 'Nhãn mác – bao bì'
    return 'Phụ liệu'

# ---- Danh mục ----
ws = wb['Danh muc']; items=[]; opening=[]
for r in ws.iter_rows(min_row=6, max_row=148, values_only=True):
    ma = s(r[2])
    if not ma: continue
    loai = s(r[4]); nhom = NHOM_MAP.get(loai) or nhom_nvl(ma)
    dong = s(r[6]) if loai=='TP' else ''
    heSo = n(r[7]) if loai=='TP' else ''
    lo = n(r[9]) if (loai=='TP' and r[9] not in (None,'')) else ''
    tonAT = n(r[11]) if (loai=='TP' and r[11] not in (None,'')) else ''
    tyTrong = n(r[12]) if (loai=='TP' and r[12] not in (None,'')) else ''
    items.append([ma, s(r[3]), nhom, s(r[5]), s(r[1]), dong, heSo, lo, tonAT, tyTrong])
    if n(r[14]) or n(r[15]): opening.append([ma, n(r[14]), n(r[15]), s(r[1])])

# ---- Định mức ----
ws = wb['Dinh muc']; bom=[]
for r in ws.iter_rows(min_row=4, max_row=1003, values_only=True):
    if not s(r[2]) or not s(r[5]): continue
    bom.append([s(r[0]) or 'DM', s(r[2]), s(r[5]), 1, n(r[10]), '', n(r[11]), '', '', '', '', s(r[9])])

# ---- Mua hàng ----
ws = wb['Mua hang']; P={}
for r in ws.iter_rows(min_row=5, max_row=305, values_only=True):
    if not s(r[4]): continue
    row=[d(r[0]), d(r[1]) or d(r[0]), s(r[2]), s(r[3]), s(r[4]), n(r[7]), n(r[8]), n(r[9]), s(r[10]), s(r[12])]
    P.setdefault('p_'+d(r[0])[:7], []).append(row)

# ---- Bán hàng ----
ws = wb['Ban hang']; S={}
for r in ws.iter_rows(min_row=5, max_row=1004, values_only=True):
    if not s(r[4]): continue
    row=[d(r[1]), s(r[4]), n(r[7]), n(r[8]), n(r[9]), '', s(r[2]), s(r[3])]
    S.setdefault('s_'+d(r[1])[:7], []).append(row)

# ---- Gia công ngoài (lô in) ----
ws = wb['Gia công IN']; G={}; k=0
for r in ws.iter_rows(min_row=8, max_row=87, values_only=True):
    if r[7] in (None,'') : continue
    k+=1; hd_ncc = s(r[3]); hd = hd_ncc.split(' - ')[0] if hd_ncc else ''; ncc = hd_ncc.split(' - ',1)[1] if ' - ' in hd_ncc else ''
    # soCT, ngayGui, ngayNhan, ncc, maGui, slGui, maNhan, slNhan, maDV, slDV, hoaDon, ghiChu
    row=['', d(r[10]), d(r[7]), ncc, s(r[12]), n(r[16]), s(r[23]), n(r[14]), s(r[19]), n(r[20]), hd, 'Lô in từ HĐ dịch vụ in']
    G.setdefault('g_'+d(r[7])[:7], []).append(row)

# ---- Lịch nghỉ ----
ws = wb['Thong so']; cal=[]
for r in ws.iter_rows(min_row=4, max_row=33, values_only=True):
    if r[7] in (None,''): continue
    cal.append([d(r[7]), 'Nghỉ lễ / công ty', s(r[8])])
prm = {}
for r in ws.iter_rows(min_row=4, max_row=28, values_only=True):
    prm[s(r[1])] = r[2]

docs = {'settings': {'company':'Công ty Dương Vân', 'startKy':'2026-01', 'workYear':'2026'},
        'items': {'rows': items}, 'bom': {'rows': bom}, 'subs': {'rows': []}, 'caps': {'rows': []}, 'cal': {'rows': cal},
        'opening': {'ky':'2026-01', 'rows': opening}}
for k,v in {**P, **S}.items(): docs[k] = {'rows': v}
for k,v in G.items(): docs[k] = {'rows': v}
json.dump(docs, open(out_dir+'/seed.json','w'), ensure_ascii=False)

# ---- Số đối chiếu ----
exp = {}
ws = wb['Lệnh SX']; L=[]
for r in ws.iter_rows(min_row=6, max_row=1505, values_only=True):
    if r[1] in (None,''): continue
    L.append({'maLenh':s(r[3]), 'nguon':s(r[4]), 'ngayXuat':d(r[5]), 'ngayNK':d(r[6]), 'ma':s(r[7]), 'sl':n(r[11]), 'qd':n(r[13]),
              'c621':n(r[20]), 'c622':n(r[22]), 'c627':n(r[23]), 'c154':n(r[24]), 'thieu':n(r[26]), 'ref':s(r[17])})
exp['orders'] = L
ws = wb['Gia thanh']; GT=[]
for r in ws.iter_rows(min_row=9, max_row=10008, values_only=True):
    if r[0] in (None,''): continue
    GT.append({'maLenh':s(r[1]), 'ma':s(r[4]), 'vt':s(r[15]), 'dm':n(r[18]), 'slDM':n(r[19]), 'cd':n(r[20]), 'tong':n(r[21]), 'dg':n(r[22]), 'tt':n(r[23]), 'ton':n(r[24]) if r[24] not in (None,'') else None, 'thieu':n(r[25])})
exp['lines'] = GT
ws = wb['Tồn kho tháng']; NX=[]
for r in ws.iter_rows(min_row=7, max_row=1266, values_only=True):
    if r[2] in (None,''): continue
    NX.append({'th':int(r[0]), 'ma':s(r[2]), 'gv':n(r[6]), 'oSL':n(r[7]), 'oTT':n(r[8]), 'iSL':n(r[9]), 'iTT':n(r[10]), 'xSL':n(r[11]), 'xTT':n(r[12]), 'cSL':n(r[13]), 'cTT':n(r[14])})
exp['nxt'] = NX
ws = wb['Tong hop GT']; TH={}
for r in ws.iter_rows(min_row=6, max_row=22, values_only=True):
    if r[0]: TH[s(r[0])] = [n(x) for x in r[1:14]]
exp['tonghop'] = TH
ws = wb['Gia công IN']; r = next(ws.iter_rows(min_row=8, max_row=8, values_only=True))
exp['gc'] = {'vGui': n(r[18]), 'vDV': n(r[22]), 'vNhan': n(r[24])}
json.dump(exp, open(out_dir+'/expected.json','w'), ensure_ascii=False)
print('items',len(items),'bom',len(bom),'mua',sum(len(v) for v in P.values()),'ban',sum(len(v) for v in S.values()),'gc',sum(len(v) for v in G.values()),'cal',len(cal),'open',len(opening))
print('orders',len(L),'lines',len(GT),'nxt',len(NX))
print(json.dumps({k:str(v) for k,v in prm.items()}, ensure_ascii=False)[:1500])
