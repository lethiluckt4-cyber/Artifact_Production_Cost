import json, openpyxl, datetime, copy
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter as L
d=json.load(open('/home/claude/work/audit/live.json'))
nap=json.load(open('/home/claude/work/import/nap_final_dk2026.json'))
items={r[0]:r for r in d['items']['rows']}
F=['ngayNhap','ngayMua','hoaDon','ncc','ma','sl','donGia','tt','kho','ghiChu','thueSuat','thueGTGT','ngayGoc','tachTu','mauSo','kyHieu','maNCC']
MAKHO={'152':'152','1551':'155','155':'155'}; TKKHO={'152':152,'155':1551,'1551':1551}
P=[]
for k in sorted(d):
    if k.startswith('p_'):
        for r in d[k]['rows']: P.append(dict(zip(F,r+['']*(len(F)-len(r)))))
# hóa đơn có chuyển ngày nhập kho
G={}
for r in P:
    if not r['hoaDon']: continue
    o=G.setdefault((r['hoaDon'],r['ncc']),{'diff':0,'same':0,'rows':[]}); o['rows'].append(r)
    if r['ngayNhap']!=r['ngayMua']: o['diff']+=1
    else: o['same']+=1
INV=[(k,o) for k,o in G.items() if o['diff']]
INV.sort(key=lambda x:(x[1]['rows'][0]['ngayMua'], x[0][0]))
D=lambda s: datetime.datetime.strptime(s,'%Y-%m-%d')
num=lambda v: float(v or 0)
# hóa đơn gốc (trước khi chuyển) để đối chiếu
NAPP={}
for k in nap:
    if k.startswith('p_'):
        for r in nap[k]['rows']:
            x=NAPP.setdefault((r[2],r[3]),{'tt':0,'thue':0}); x['tt']+=num(r[7]); x['thue']+=num(r[11])

wb=openpyxl.load_workbook('template.xlsx')
ws=wb['Mua hang trong nuoc ']; wn=wb['Nghiep vu khac']
st1={c:copy.copy(ws.cell(9,c)._style) for c in range(1,28)}
st2={c:copy.copy(wn.cell(9,c)._style) for c in range(1,25)}
for w,mx in ((ws,27),(wn,24)):
    for r in range(9, max(w.max_row,20)+1):
        for c in range(1,mx+1): w.cell(r,c).value=None
NUM='#,##0;[Red](#,##0);"-"'; QTY='#,##0.##;[Red](#,##0.##)'; DF='dd/mm/yyyy'
def put(w,r,c,v,st,fmt=None):
    cell=w.cell(r,c); cell._style=copy.copy(st[c]); cell.value=v
    if fmt: cell.number_format=fmt
    return cell
r1=9; r2=9; stt=0; nvk=0; rec=[]; pn_used=set()
for (hd,ncc),o in INV:
    rows=sorted(o['rows'], key=lambda x:(x['ngayNhap']!=x['ngayMua'] and 0 or 1, x['ngayNhap'], x['ma']))
    whole = o['same']==0
    # nhóm theo phiếu nhập: (ngày nhập, kèm/không kèm)
    phieu={}
    for x in rows:
        kem = x['ngayNhap']==x['ngayMua']
        phieu.setdefault((x['ngayNhap'],kem),[]).append(x)
    rc={'hd':hd,'ncc':ncc,'ngay':o['rows'][0]['ngayMua'],'w_kem':0,'w_khong':0,'y_kem':0,'nvk_m':0,'nvk_p':0,'thue_khong0':0}
    seq=0; seqk=(hd,ncc)
    _kp=[v for (nn,kem),v in sorted(phieu.items(), key=lambda z:z[0][0]) if kem] or [v for k,v in sorted(phieu.items(), key=lambda z:z[0][0])]
    baseDg=f"{(items.get(_kp[0][0]['ma']) or ['',''])[1]}-{hd} ({D(o['rows'][0]['ngayMua']).strftime('%d/%m/%Y')})"  # diễn giải của phiếu nhập cũ (kèm HĐ) bên sheet Mua hàng
    for (nn,kem),xs in sorted(phieu.items(), key=lambda z:z[0][0]):
        base=f"NK{o['rows'][0]['ngayMua'].replace('-','')[2:]}-{hd}"
        if kem: pn=base
        else: seq+=1; pn=f"{base}-{seq:03d}"
        assert pn not in pn_used, pn
        pn_used.add(pn)
        dg_ten=(items.get(xs[0]['ma']) or ['',''])[1]; ngHD=D(xs[0]['ngayMua']).strftime('%d/%m/%Y'); dgz=f"{dg_ten}-{hd} ({ngHD})"
        for x in xs:
            stt+=1; it=items.get(x['ma'],['','','','','152'])
            put(ws,r1,1,stt,st1); put(ws,r1,2,'Chưa thanh toán',st1); put(ws,r1,3,'Chưa thanh toán',st1)
            put(ws,r1,4,'Nhận kèm hóa đơn' if kem else 'Không kèm hóa đơn',st1)
            put(ws,r1,5,f'=+F{r1}',st1,DF); put(ws,r1,6,D(x['ngayNhap']),st1,DF); put(ws,r1,7,pn,st1)
            put(ws,r1,8,x.get('mauSo') or None,st1); put(ws,r1,9,x.get('kyHieu') or None,st1); put(ws,r1,10,hd,st1); put(ws,r1,11,D(x['ngayMua']),st1,DF)  # không kèm HĐ: lấy số HĐ đã tách ra
            put(ws,r1,12,x.get('maNCC') or None,st1); put(ws,r1,13,ncc,st1); put(ws,r1,17,MAKHO.get(str(it[4]),str(it[4])),st1); put(ws,r1,14,dgz,st1)
            put(ws,r1,15,x['ma'],st1); put(ws,r1,16,it[1],st1); put(ws,r1,18,TKKHO.get(str(it[4]),it[4]),st1); put(ws,r1,19,331,st1)
            put(ws,r1,20,it[3],st1); put(ws,r1,21,num(x['sl']),st1,QTY); put(ws,r1,22,num(x['donGia']),st1,'#,##0.##'); put(ws,r1,23,round(num(x['tt'])),st1,NUM)
            if kem:
                ts=num(x['thueSuat'])
                if ts or num(x['thueGTGT']): put(ws,r1,24,f"{round(ts*100)}%",st1)
                put(ws,r1,25,round(num(x['thueGTGT'])),st1,NUM)
                put(ws,r1,26,1331,st1); put(ws,r1,27,1,st1)
                rc['w_kem']+=num(x['tt']); rc['y_kem']+=num(x['thueGTGT'])
            else:
                put(ws,r1,27,1,st1)
                rc['w_khong']+=num(x['tt'])
                if num(x['thueGTGT']):
                    nvk+=1; t=round(num(x['thueGTGT'])); ts=num(x['thueSuat'])
                    sct=f"NVK-{base}"
                    vals={1:nvk,2:D(x['ngayMua']),3:D(x['ngayMua']),4:sct,5:baseDg,6:baseDg,
                          7:1331,8:331,9:t,12:baseDg,13:round(num(x['tt'])),14:f"{round(ts*100)}%",16:t,17:1331,18:D(x['ngayMua']),19:hd,20:x.get('mauSo') or None,21:x.get('kyHieu') or None,22:1,11:x.get('maNCC') or None,23:x.get('maNCC') or None,24:ncc}
                    for c,v in vals.items(): put(wn,r2,c,v,st2,DF if c in (2,3,18) else (NUM if c in (9,13,16) else None))
                    rc['nvk_m']+=num(x['tt']); rc['nvk_p']+=t; r2+=1
                else: rc['thue_khong0']+=1
            r1+=1
    rec.append(rc)
# dòng tổng như mẫu
def total(w,r,mx,sums,st):
    for c in range(1,mx+1): put(w,r,c,'x',st)
    for c,(a,b) in sums.items(): put(w,r,c,f'=SUM({L(c)}{a}:{L(c)}{b})',st,NUM).font=Font(name=w.cell(r,c).font.name or 'Arial', bold=True)
t1=r1; total(ws,t1,27,{23:(9,r1-1),25:(9,r1-1)},st1)
t2=r2; total(wn,t2,24,{9:(9,r2-1),13:(9,r2-1),16:(9,r2-1)},st2)
ws.cell(t1+2,6,'Là ngày nhập kho'); ws.cell(t1+2,7,'Đánh để không trùng, những dòng của 1 phiếu thì sẽ có cùng số phiếu'); ws.cell(t1+2,14,'Theo tên 1 mặt hàng trong phiếu')
# sheet đối chiếu
wc=wb.create_sheet('Doi chieu HD')
hdr=['Số HĐ','Nhà cung cấp','Ngày HĐ','Tiền hàng HĐ (gốc)','Thuế GTGT HĐ (gốc)','Mua hàng – kèm HĐ: tiền hàng','Mua hàng – không kèm HĐ: tiền hàng','Tổng tiền hàng 2 phần','Lệch tiền hàng','Mua hàng – kèm HĐ: thuế','NVK: thuế (phần không kèm HĐ)','Tổng thuế','Lệch thuế','NVK: giá trị HHDV chưa thuế','Ghi chú']
wc.cell(1,1,'ĐỐI CHIẾU HÓA ĐƠN CÓ CHUYỂN NGÀY NHẬP KHO – tổng 2 sheet = tờ hóa đơn (sheet này chỉ để kiểm tra, không nhập vào ASP)').font=Font(name='Arial',bold=True,size=12)
HF=PatternFill('solid',fgColor='1F4E78')
for i,h in enumerate(hdr,1):
    c=wc.cell(3,i,h); c.font=Font(name='Arial',bold=True,color='FFFFFF'); c.fill=HF; c.alignment=Alignment(wrap_text=True,horizontal='center',vertical='center')
wc.row_dimensions[3].height=45
r=4
for x in rec:
    g=NAPP.get((x['hd'],x['ncc']),{'tt':0,'thue':0})
    vals=[x['hd'],x['ncc'],D(x['ngay']),round(g['tt']),round(g['thue']),round(x['w_kem']),round(x['w_khong']),f'=F{r}+G{r}',f'=H{r}-D{r}',round(x['y_kem']),x['nvk_p'],f'=J{r}+K{r}',f'=L{r}-E{r}',round(x['nvk_m']),
          ('Hóa đơn không có thuế GTGT (hộ KD / cá nhân) – phần không kèm HĐ không cần NVK' if not g['thue'] else '')]
    for i,v in enumerate(vals,1):
        c=wc.cell(r,i,v); c.font=Font(name='Arial')
        if i==3: c.number_format=DF
        elif 4<=i<=14: c.number_format=NUM
    r+=1
for i in range(1,16):
    c=wc.cell(r,i); c.font=Font(name='Arial',bold=True)
    if i==1: c.value='Tổng cộng'
    elif 4<=i<=14: c.value=f'=SUM({L(i)}4:{L(i)}{r-1})'; c.number_format=NUM
for i,wd in enumerate([8,42,12,15,14,16,16,16,10,14,14,14,10,16,48],1): wc.column_dimensions[L(i)].width=wd
wc.freeze_panes='C4'
# sheet danh sách hóa đơn có chuyển ngày nhập kho về trước
wl=wb.create_sheet('DS HD chuyen ngay', 2)
wl.cell(1,1,'DANH SÁCH HÓA ĐƠN CÓ CHUYỂN NGÀY NHẬP KHO VỀ TRƯỚC').font=Font(name='Arial',bold=True,size=12)
for i,h in enumerate(['Phiếu nhập cũ','Số hóa đơn','Số tiền chưa thuế','Thuế'],1):
    c=wl.cell(3,i,h); c.font=Font(name='Arial',bold=True,color='FFFFFF'); c.fill=HF; c.alignment=Alignment(horizontal='center',vertical='center',wrap_text=True)
rr=4
for x in rec:
    g=NAPP.get((x['hd'],x['ncc']),{'tt':0,'thue':0})
    for i,v in enumerate([f"NK{x['ngay'].replace('-','')[2:]}-{x['hd']}", x['hd'], round(g['tt']), round(g['thue'])],1):
        c=wl.cell(rr,i,v); c.font=Font(name='Arial')
        if i>=3: c.number_format=NUM
    rr+=1
wl.cell(rr,1,'Tổng cộng').font=Font(name='Arial',bold=True)
for i in (3,4):
    c=wl.cell(rr,i,f'=SUM({L(i)}4:{L(i)}{rr-1})'); c.number_format=NUM; c.font=Font(name='Arial',bold=True)
for i,wd in enumerate([18,12,18,14],1): wl.column_dimensions[L(i)].width=wd
wl.freeze_panes='A4'
wb.save('/home/claude/work/nvk/FileTai_MuaVao_NVK_ChuyenNgayNhapKho_2026.xlsx')
print('mua rows',stt,'nvk rows',nvk,'invoices',len(rec))
