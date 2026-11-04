# Đọc file Giá thành Thiên Hồng (Excel) -> seed docs cho phần mềm + số liệu đối chiếu
import openpyxl, json, sys, datetime, warnings, collections
warnings.filterwarnings('ignore')
src, out_seed, out_exp = sys.argv[1], sys.argv[2], sys.argv[3]
wb = openpyxl.load_workbook(src, data_only=True)
def d(v):
    if isinstance(v,(datetime.datetime,datetime.date)): return v.strftime('%Y-%m-%d')
    return ''
def n(v):
    try: return float(v) if v not in (None,'') else 0.0
    except: return 0.0
def s(v): return '' if v is None else str(v).strip()

# Danh mục + tồn đầu
ws=wb['NXT']; items=[]; opening=[]
for r in ws.iter_rows(min_row=6, values_only=True):
    if not r[2]: continue
    items.append([s(r[2]), s(r[3]), s(r[4]), s(r[5]), s(r[1])])
    if n(r[7]) or n(r[8]): opening.append([s(r[2]), n(r[7]), n(r[8]), s(r[1])])
# Định mức + NVL thay thế
ws=wb['Dinh muc']; bom=[]; subs=[]
for r in ws.iter_rows(min_row=4, values_only=True):
    if not r[1] or not r[5]: continue
    bom.append([s(r[0]) or 'DM', s(r[1]), s(r[5]), n(r[9]), n(r[10]), n(r[11]), n(r[12]), '', d(r[19]), d(r[20]), 0, s(r[14])])
    if r[15]: subs.append([s(r[1]), s(r[5]), s(r[15]), d(r[16]), d(r[17]), n(r[18]), 'Từ định mức Excel'])
# Mua hàng
ws=wb['Mua hang']; pur=[]
for r in ws.iter_rows(min_row=5, values_only=True):
    if not r[4] or not d(r[0]): continue
    sl, dg = n(r[7]), n(r[8])
    pur.append([d(r[0]), d(r[1]) or d(r[0]), s(r[2]), s(r[3]), s(r[4]), sl, dg, sl*dg, s(r[10]), s(r[17])])
# Bán hàng
ws=wb['Ban hang']; sales=[]
for r in ws.iter_rows(min_row=5, values_only=True):
    if not r[4] or not d(r[1]): continue
    sl, dg = n(r[7]), n(r[8])
    sales.append([d(r[1]), s(r[4]), sl, dg, sl*dg, '', s(r[2]), s(r[3])])
# Lệnh SX (khóa kế hoạch)
ws=wb['Lenh san xuat']; orders=[]; exp_lsx=[]
cnt=collections.Counter()
for r in ws.iter_rows(min_row=4, values_only=True):
    if not r[1]: continue
    key=s(r[1]); ma=key.split('#')[0]; x=key.split('#')[1].split('@')[0]; ngay=f'{x[:4]}-{x[4:6]}-{x[6:8]}'
    sl=float(key.split('@')[1].split('~')[0].rstrip('.') or 0)
    cnt[ngay]+=1; ma_lenh=f"LSX{ngay[:7]}.{ngay[8:]}-{cnt[ngay]:02d}"
    orders.append([ma_lenh, ngay, ngay, ma, s(r[5]) or 'DM', sl, n(r[11]), '', key])
    exp_lsx.append({'maLenh':ma_lenh,'excel':r[0],'ma':ma,'ngay':ngay,'slTH':n(r[12]),'meTH':n(r[13]) if r[13] not in (None,'') else None})
# Cân đối NVL
ws=wb['Cân đối NVL']; adj=[]
for r in ws.iter_rows(min_row=4, values_only=True):
    if r[0] and r[1] and r[2]: adj.append([d(r[0]), s(r[1]), s(r[2]), n(r[3]), s(r[4])])
# Xuất VT chung
ws=wb['Xuất VT chung']; iss=[]; k=0
for r in ws.iter_rows(min_row=5, values_only=True):
    if not d(r[1]) or not r[3]: continue
    k+=1; iss.append([s(r[0]) or f"XC{d(r[1])[:7]}.{d(r[1])[8:]}-{k:02d}", d(r[1]), s(r[3]), n(r[6]), s(r[9])])
# Chi phí
ws=wb['622+627']; costs={}
for r in range(2,14):
    th=ws.cell(r,1).value; ky=f'2026-{int(th):02d}'
    c={'c622':n(ws.cell(r,5).value),'c6273':n(ws.cell(r,10).value),'c6274':n(ws.cell(r,11).value),'dien':n(ws.cell(r,13).value),'nuoc':n(ws.cell(r,14).value)}
    if any(c.values()): costs[ky]=c
alloc={'cd1_622':n(ws['D22'].value),'cd1_627':n(ws['F22'].value),'rows':[]}
for r in range(19,26):
    ma=s(ws.cell(r,2).value)
    if not ma or s(ws.cell(r,1).value).startswith('Tổng'): continue
    cd=1 if 'Công đoạn 1' in s(ws.cell(r,1).value) else 2
    alloc['rows'].append({'ma':ma,'cd':cd,'t622':n(ws.cell(r,5).value) if cd==1 else 0,'t627':n(ws.cell(r,7).value) if cd==1 else 0})
# Lịch
ws=wb['Lich nghi SX']; cal=[]
for r in ws.iter_rows(min_row=5, values_only=True):
    if d(r[0]): cal.append([d(r[0]),'Nghỉ lễ / công ty',s(r[1])])
    if d(r[3]): cal.append([d(r[3]),'Nghỉ chờ việc',s(r[4])])
    if d(r[6]): cal.append([d(r[6]),'Tăng ca / làm Chủ nhật',s(r[7])])
# Ngưỡng tồn
ws=wb['Cảnh báo']; nguong=[]
for r in range(6,14):
    key=s(ws.cell(r,2).value)
    if key: nguong.append({'key':key,'max':n(ws.cell(r,3).value),'min':n(ws.cell(r,4).value),'ghiChu':s(ws.cell(r,5).value)})
# Tham số kế hoạch
ws=wb['Ke hoach SX']
plan={'hz':n(ws['AG7'].value),'hsd':n(ws['AG9'].value),'ss':{'TP_BKG':n(ws['AG11'].value),'TP_BKG_150G':n(ws['AG12'].value),'TP_BKG_400G':n(ws['AG13'].value)},'bqDays':n(ws['AG14'].value),'minKg':{}}
for r in range(5,17):
    th=ws.cell(r,35).value
    if th: plan['minKg'][str(int(th))]=n(ws.cell(r,36).value)

docs={'settings':{'company':'Công ty Thiên Hồng','startKy':'2026-01','workYear':'2026','alloc':alloc,'planPrm':plan,'nguong':nguong},
      'items':{'rows':items},'bom':{'rows':bom},'subs':{'rows':subs},'cal':{'rows':cal},
      'opening':{'ky':'2026-01','rows':opening}}
def byky(arr, i):
    g=collections.defaultdict(list)
    for r in arr: g[r[i][:7]].append(r)
    return g
for k,v in byky(pur,0).items(): docs['p_'+k]={'rows':v}
for k,v in byky(sales,0).items(): docs['s_'+k]={'rows':v}
for k,v in byky(iss,1).items(): docs['i_'+k]={'rows':v}
O=byky(orders,1); A=byky(adj,0)
for k in set(O)|set(A): docs['o_'+k]={'rows':O.get(k,[]),'adj':A.get(k,[])}
for k,c in costs.items(): docs['c_'+k]=c
json.dump(docs, open(out_seed,'w'), ensure_ascii=False)

# ---- Số liệu đối chiếu từ Excel ----
exp={'tonkho':{}, 'cp':{}, 'btp':{}, 'tp':{}, 'lsx':exp_lsx}
ws=wb['Tồn kho tháng']
for r in ws.iter_rows(min_row=6, values_only=True):
    if not r[3] or r[0] in (None,'*'): continue
    ky=f'2026-{int(r[0]):02d}'
    exp['tonkho'].setdefault(ky,{})[s(r[3])]={'openSL':n(r[6]),'openTT':n(r[7]),'nhapSL':n(r[8]),'nhapTT':n(r[9]),'xuatSL':n(r[10]),'xuatTT':n(r[11]),'gv':n(r[12]),'closeSL':n(r[13]),'closeTT':n(r[14]),'pBQ':n(r[15]) if r[15] not in (None,'') else None}
ws=wb['622+627']
for r in range(2,14):
    ky=f'2026-{int(ws.cell(r,1).value):02d}'
    exp['cp'][ky]={'tp621':n(ws.cell(r,2).value),'btp621':n(ws.cell(r,3).value),'c622':n(ws.cell(r,5).value),'c627':n(ws.cell(r,7).value),'gas':n(ws.cell(r,15).value),'dt':n(ws.cell(r,17).value),'bgkt154':n(ws.cell(r,18).value)}
for sh,key in (('Gia thanh BTP','btp'),('Gia thanh TP','tp')):
    ws=wb[sh]
    for r in ws.iter_rows(min_row=5, values_only=True):
        if r[0] in (None,'') or not r[3]: continue
        e=exp[key].setdefault(str(r[0]),{'ma':s(r[3]),'ngay':d(r[2]),'sl':0,'c621':0,'c622':0,'c627':0,'c154':0,'lines':[]})
        if n(r[8]): e['sl']=n(r[8])
        e['c621']+=n(r[24]); e['c622']+=n(r[25]); e['c627']+=n(r[26]); e['c154']+=n(r[27])
        if r[14]: e['lines'].append([s(r[14]), n(r[20]), n(r[21])])
json.dump(exp, open(out_exp,'w'), ensure_ascii=False)
print('items',len(items),'bom',len(bom),'subs',len(subs),'pur',len(pur),'sales',len(sales),'orders',len(orders),'adj',len(adj),'iss',len(iss),'cal',len(cal),'costs',len(costs))
print('btp orders',len(exp['btp']),'tp orders',len(exp['tp']))
print(json.dumps(alloc,ensure_ascii=False)); print(json.dumps(plan))
