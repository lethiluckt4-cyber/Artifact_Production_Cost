import json, openpyxl, collections, datetime, calendar
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as CL
d=json.load(open('/home/claude/work/import/nap_final.json'))
items={r[0]:r for r in d['items']['rows']}
bom=collections.OrderedDict()
for r in d['bom']['rows']: bom.setdefault(r[1],collections.OrderedDict())[r[2]]=r[4]/r[3]
src=openpyxl.load_workbook('/mnt/user-data/uploads/e9a18b22-Duong_Van_2025.xlsx', data_only=True)
P=[r for r in list(src['Mua hang'].iter_rows(values_only=True))[4:] if hasattr(r[0],'month')]
S=[r for r in list(src['Ban hang'].iter_rows(values_only=True))[4:] if r[4] and r[4]!='x' and hasattr(r[1],'month')]
C=[r for r in list(src['622+627'].iter_rows(values_only=True))[1:13] if isinstance(r[0],int)]
MONTHS=[8,9,10,11,12]; PM=[9,10,11,12]   # tháng có công nhân sản xuất
AVAIL={r[4] for r in P}|{'VAI_IN'}
GC=[r for r in P if r[4]=='V_IGC']; PUR=[r for r in P if r[4]!='V_IGC']
TPS=sorted({r[4] for r in S})
nvls=[]
for tp in TPS:
    for n in bom[tp]:
        if n not in nvls: nvls.append(n)
for x in ['VAI_K4471','CHI_402_RW']:
    if x not in nvls: nvls.append(x)
order_n=['VAI_DKCG_1','VAI_K4471','VAI_IN','VALO','THUN','DALU','DK_RN','DK_NL','CHI_402_RW','TUZI','TEM_TTG','TEM_LAV','TEM_SPN','TEM_SPL']
nvls=[n for n in order_n if n in nvls]+[n for n in nvls if n not in order_n]
HOL={(2025,9,1),(2025,9,2)}
def wd(m):
    n=0
    for dd in range(1,calendar.monthrange(2025,m)[1]+1):
        if datetime.date(2025,m,dd).weekday()!=6 and (2025,m,dd) not in HOL: n+=1
    return n
AR='Arial'; F=lambda **k: Font(name=AR,size=10,**k)
HF=PatternFill('solid',fgColor='1F3A68'); YF=PatternFill('solid',fgColor='FFF2CC'); TF=PatternFill('solid',fgColor='DDEBF7')
thin=Side(style='thin',color='BFBFBF'); BD=Border(left=thin,right=thin,top=thin,bottom=thin)
N0='#,##0;(#,##0);"-"'; N2='#,##0.00;(#,##0.00);"-"'; N4='#,##0.####;(#,##0.####);"-"'; DF='dd/mm/yyyy'; PF='0.0%;(0.0%);"-"'
BLUE='0000FF'; GREEN='008000'
wb=openpyxl.Workbook()
def sheet(name,title,headers,widths,hrow=3):
    ws=wb.create_sheet(name); ws['A1']=title; ws['A1'].font=Font(name=AR,size=13,bold=True,color='1F3A68')
    for i,h in enumerate(headers,1):
        c=ws.cell(row=hrow,column=i,value=h); c.font=Font(name=AR,size=10,bold=True,color='FFFFFF'); c.fill=HF; c.alignment=Alignment(wrap_text=True,vertical='center',horizontal='center'); c.border=BD
    for i,w in enumerate(widths,1): ws.column_dimensions[CL(i)].width=w
    ws.row_dimensions[hrow].height=34; ws.freeze_panes=f'A{hrow+1}'
    return ws
def put(ws,r,c,v,fmt=None,color=None,fill=None,bold=False):
    x=ws.cell(row=r,column=c,value=v); x.font=F(color=color,bold=bold); x.border=BD
    if fmt: x.number_format=fmt
    if fill: x.fill=fill
    return x
def total(ws,r,cols,first,last,label_col=1,label='Tổng cộng'):
    put(ws,r,label_col,label,bold=True,fill=TF)
    for c,fmt in cols: put(ws,r,c,f'=SUBTOTAL(9,{CL(c)}{first}:{CL(c)}{last})',fmt,bold=True,fill=TF)
iname=lambda n: items[n][1] if n in items else ''
idvt=lambda n: items[n][3] if n in items else ''

# ===== Hướng dẫn =====
ws=wb.active; ws.title='Huong dan'
L=[('GIÁ THÀNH NĂM 2025 – CÔNG TY DƯƠNG VÂN',1),('',0),('Cách đọc file',1),
('• Chữ xanh dương = số nhập (từ file Duong_Van_2025.xlsx hoặc thông số). Chữ đen = công thức. Chữ xanh lá = lấy từ sheet khác.',0),
('• Ô nền vàng là ô bạn sửa được: Thông số (hao hụt in, năng suất…), cột "Dùng năm 2025" ở Định mức, cột "Tỷ trọng may tồn kho" ở Năng lực – giá thành tự tính lại.',0),
('',0),('Giả định',1),
('1. Định mức 2025 = định mức 2026 của đúng mã thành phẩm; NVL không có hóa đơn mua 2025 (vải lót, thun, dây kéo, đầu kéo, tem nhãn) → Dùng = Không.',0),
('1b. Thay vải: năm 2025 dùng vải in thay một phần vải trơn – mặc định 50% (sheet Thong so), từng mã sửa riêng ở cột L sheet Dinh muc 2025 (tùy mẫu nhiều / ít hơn).',0),
('2. In gia công: hao hụt in (sheet Thong so, mặc định 4% – khoảng 3–5%): SL vải gửi = SL in nhận về / (1 – hao hụt). Giá VAI_IN = giá vải gửi + phí in.',0),
('3. Chỉ may CHI_402_RW: xuất dùng chung → 627 (6272 vật liệu), chia đều số chỉ đang có cho các tháng còn lại đến 12/2025 (tháng xuất = (tồn đầu + mua) / số tháng còn lại) → dùng hết 31/12/2025; phân bổ cho lệnh theo SL quy đổi bộ chuẩn.',0),
('4. Sản xuất theo năng lực công nhân: năng lực tháng = số CN × năng suất (bộ chuẩn/người/ngày) × tỷ lệ thời gian may × ngày làm việc (T2–T7, trừ nghỉ lễ 01–02/09).',0),
('   Mỗi tháng may đủ hàng bán trong tháng; năng lực còn dư → may tồn kho cho mã may sẵn (SX) theo tỷ trọng bán cả năm → có tồn thành phẩm cuối năm.',0),
('   Mã may theo đơn (DDH: QV01, QV02, AV12, AV02 M-3XL, AV02 4XL-5XL – đơn của Amigo): may đúng số lượng đơn trong tháng giao, không may tồn kho.',0),
('5. Giá vốn hàng bán = giá bình quân tháng của thành phẩm (tồn đầu + nhập kho trong tháng). Giá xuất NVL = bình quân tháng.',0),
('6. Tồn đầu 01/2025 = 0. 622 theo file gốc (T9–T12); 627 = chỉ may; phân bổ 622 / 627 theo SL quy đổi (quần bơi 0,5 bộ).',0),
('7. Vải K44-71 (VAI_K4471) không có trong định mức → để tồn kho.',0),
('',0),('Thứ tự sheet',1),
('Tong hop thang → Gia thanh lenh → Gia thanh chi tiet → Nang luc 2025 → Lenh SX 2025 → Dinh muc 2025 → NXT NVL 2025 → NXT TP 2025 → Ban hang 2025 → Mua hang 2025 → Gia cong 2025 → Chi phi 622 627 → Thong so → Ton cuoi 2025 (= số dư đầu kỳ 2026)',0)]
for i,(t,b) in enumerate(L,1):
    c=ws.cell(row=i,column=1,value=t); c.font=Font(name=AR,size=13 if i==1 else 10,bold=bool(b),color='1F3A68' if b else None)
ws.column_dimensions['A'].width=150

# ===== Thông số =====
ws=sheet('Thong so','THÔNG SỐ TÍNH GIÁ THÀNH 2025',['Thông số','Giá trị','Ghi chú'],[40,12,70])
TS={}
for i,(k,t,v,fmt,g) in enumerate([('hh','Hao hụt in gia công',0.04,PF,'Bạn cung cấp: 3% – 5%. SL vải gửi = SL in / (1 – hao hụt)'),
    ('ns','Năng suất may (bộ chuẩn / người / ngày)',40,N0,'Theo thông số phần mềm 2026'),
    ('tl','Tỷ lệ thời gian dành cho may',0.75,PF,'Phần còn lại cho cắt + đóng gói (thông số phần mềm 2026)'),
    ('ty','Tỷ lệ thay vải trơn (VAI_DKCG_1) bằng vải in (VAI_IN)',0.5,PF,'Mặc định cho mọi mã; từng mã sửa riêng ở cột L sheet Dinh muc 2025 (tùy mẫu nhiều / ít hơn)')]):
    r=4+i; put(ws,r,1,t); put(ws,r,2,v,fmt,BLUE,YF); put(ws,r,3,g); TS[k]=f"'Thong so'!$B${r}"

# ===== Định mức =====
ws=sheet('Dinh muc 2025','ĐỊNH MỨC NVL NĂM 2025 (cho 1 thành phẩm) – theo định mức 2026, bỏ NVL không có hóa đơn 2025',
 ['Mã TP','Tên thành phẩm','ĐVT TP','Hệ số bộ chuẩn','Mã NVL','Tên NVL','ĐVT NVL','ĐM 2026 (SL NVL / 1 SP)','Dùng năm 2025 (Có/Không)','ĐM áp dụng 2025','Ghi chú','Tỷ lệ thay vải trơn bằng vải in','Giá bán BQ 2025 (đ/SP)','Giá thành ĐV BQ 2025 (đ/SP)','Giá thành / giá bán','SL bán 2025'],[16,40,8,10,13,36,9,13,13,13,40,13,14,14,11,10])
r=4
for tp in TPS:
    first=True
    for n,q in bom[tp].items():
        if first:
            put(ws,r,13,f"=IFERROR(SUMIFS('Ban hang 2025'!$I:$I,'Ban hang 2025'!$D:$D,A{r})/SUMIFS('Ban hang 2025'!$G:$G,'Ban hang 2025'!$D:$D,A{r}),0)",N0,GREEN,bold=True)
            put(ws,r,14,f"=IFERROR(SUMIFS('Gia thanh lenh'!$J:$J,'Gia thanh lenh'!$C:$C,A{r})/SUMIFS('Gia thanh lenh'!$E:$E,'Gia thanh lenh'!$C:$C,A{r}),0)",N0,GREEN)
            put(ws,r,15,f'=IFERROR(N{r}/M{r},0)',PF); put(ws,r,16,f"=SUMIFS('Ban hang 2025'!$G:$G,'Ban hang 2025'!$D:$D,A{r})",N0,GREEN)
            first=False
        put(ws,r,1,tp,color=BLUE); put(ws,r,2,iname(tp)); put(ws,r,3,idvt(tp)); put(ws,r,4,items[tp][6],N2,BLUE)
        put(ws,r,5,n,color=BLUE); put(ws,r,6,iname(n)); put(ws,r,7,idvt(n)); put(ws,r,8,q,N4,BLUE)
        put(ws,r,9,'Có' if n in AVAIL else 'Không',color=BLUE,fill=YF)
        if n=='VAI_DKCG_1':
            put(ws,r,12,f'={TS["ty"]}',PF,GREEN,YF); put(ws,r,10,f'=IF(I{r}="Có",H{r},0)*(1-L{r})',N4); put(ws,r,11,'Giảm phần vải trơn đã thay bằng vải in (cột L)'); dk=r; r+=1
            put(ws,r,1,tp,color=BLUE); put(ws,r,2,iname(tp)); put(ws,r,3,idvt(tp)); put(ws,r,4,items[tp][6],N2,BLUE)
            put(ws,r,5,'VAI_IN',color=BLUE); put(ws,r,6,iname('VAI_IN')); put(ws,r,7,idvt('VAI_IN')); put(ws,r,8,None); put(ws,r,9,'Có',color=BLUE,fill=YF)
            put(ws,r,10,f'=IF(I{r}="Có",H{dk}*L{dk},0)',N4); put(ws,r,11,'Vải in thay vải trơn năm 2025 (= ĐM vải trơn × tỷ lệ thay)'); r+=1
        else:
            put(ws,r,10,f'=IF(I{r}="Có",H{r},0)',N4); put(ws,r,11,'' if n in AVAIL else 'Năm 2025 không có hóa đơn mua – bỏ qua'); r+=1
ws.auto_filter.ref=f'A3:P{r-1}'
DM="'Dinh muc 2025'"

# ===== Mua hàng =====
ws=sheet('Mua hang 2025','CHI TIẾT MUA NVL NĂM 2025 (phí in gia công ở sheet Gia cong 2025)',
 ['Ngày nhập kho','Ngày hóa đơn','Số HĐ','Nhà cung cấp','Mã hàng','Tên hàng','ĐVT','Số lượng','Đơn giá','Thành tiền','Tháng'],[12,12,11,44,13,34,8,12,12,15,7])
r=4; a=r
for x in PUR:
    put(ws,r,1,x[0],DF,BLUE); put(ws,r,2,x[1],DF,BLUE); put(ws,r,3,str(x[2]),color=BLUE); put(ws,r,4,x[3],color=BLUE); put(ws,r,5,x[4],color=BLUE)
    put(ws,r,6,iname(x[4]) or x[5]); put(ws,r,7,x[6]); put(ws,r,8,x[7],N2,BLUE); put(ws,r,9,x[8],N2,BLUE); put(ws,r,10,f'=H{r}*I{r}',N0); put(ws,r,11,f'=MONTH(A{r})'); r+=1
total(ws,r,[(8,N2),(10,N0)],a,r-1)
MH="'Mua hang 2025'"

# ===== Gia công =====
ws=sheet('Gia cong 2025','IN GIA CÔNG 2025 – gửi VAI_DKCG_1 đi in, nhận về VAI_IN (có hao hụt in)',
 ['Ngày HĐ (nhận về)','Số HĐ','Đơn vị in','SL in nhận về (m)','Đơn giá in','Phí in','Mã vải gửi','SL vải gửi (gồm hao hụt)','Mã nhận về','SL nhận về','Tháng'],[12,9,40,12,11,14,13,13,11,11,7])
r=4; a=r
for x in GC:
    put(ws,r,1,x[0],DF,BLUE); put(ws,r,2,str(x[2]),color=BLUE); put(ws,r,3,x[3],color=BLUE); put(ws,r,4,x[7],N2,BLUE); put(ws,r,5,x[8],N2,BLUE)
    put(ws,r,6,f'=D{r}*E{r}',N0); put(ws,r,7,'VAI_DKCG_1',color=BLUE,fill=YF); put(ws,r,8,f'=D{r}/(1-{TS["hh"]})',N2,GREEN); put(ws,r,9,'VAI_IN'); put(ws,r,10,f'=D{r}',N2); put(ws,r,11,f'=MONTH(A{r})'); r+=1
total(ws,r,[(4,N2),(6,N0),(8,N2),(10,N2)],a,r-1)
GCs="'Gia cong 2025'"

# ===== Bán hàng =====
ws=sheet('Ban hang 2025','CHI TIẾT BÁN HÀNG 2025 – giá vốn = giá bình quân tháng của thành phẩm (NXT TP 2025)',
 ['Ngày HĐ','Số HĐ','Khách hàng','Mã TP','Tên hàng','ĐVT','Số lượng','Đơn giá','Doanh số','Tháng','Giá vốn đơn vị','Giá vốn','Lãi gộp','Tỷ lệ lãi'],[11,10,40,16,40,7,10,11,14,7,13,14,14,9])
r=4; a=r
for x in S:
    put(ws,r,1,x[1],DF,BLUE); put(ws,r,2,str(x[2]),color=BLUE); put(ws,r,3,x[3],color=BLUE); put(ws,r,4,x[4],color=BLUE); put(ws,r,5,iname(x[4])); put(ws,r,6,x[6])
    put(ws,r,7,x[7],N0,BLUE); put(ws,r,8,x[8],N0,BLUE); put(ws,r,9,f'=G{r}*H{r}',N0); put(ws,r,10,f'=MONTH(A{r})')
    put(ws,r,11,f"=SUMIFS('NXT TP 2025'!$J:$J,'NXT TP 2025'!$A:$A,D{r},'NXT TP 2025'!$C:$C,J{r})",N0,GREEN)
    put(ws,r,12,f'=G{r}*K{r}',N0); put(ws,r,13,f'=I{r}-L{r}',N0); put(ws,r,14,f'=IFERROR(M{r}/I{r},0)',PF); r+=1
b_last=r-1; total(ws,r,[(7,N0),(9,N0),(12,N0),(13,N0)],a,b_last); put(ws,r,14,f'=IFERROR(M{r}/I{r},0)',PF,bold=True,fill=TF)
BH="'Ban hang 2025'"

# ===== Chi phí =====
ws=sheet('Chi phi 622 627','CHI PHÍ NHÂN CÔNG (622) & SẢN XUẤT CHUNG (627) 2025',
 ['Tháng','622 Nhân công trực tiếp','6272 Vật liệu (chỉ may)','6273 CCDC','6274 Khấu hao','6277 Điện','6277 Nước','6277 Khác','627 cộng','Số công nhân'],[7,16,14,12,12,12,12,12,14,10])
r=4; a=r; cd={int(x[0]):x for x in C}
for m in MONTHS:
    x=cd.get(m); put(ws,r,1,m,color=BLUE); put(ws,r,2,(x[5] or 0) if x else 0,N0,BLUE)
    put(ws,r,3,f"=SUMIFS('NXT NVL 2025'!$M:$M,'NXT NVL 2025'!$A:$A,\"CHI_402_RW\",'NXT NVL 2025'!$C:$C,A{r})",N0,GREEN)
    for j,ci in zip(range(4,9),[9,10,12,13,14]): put(ws,r,j,(x[ci] or 0) if x else 0,N0,BLUE)
    put(ws,r,9,f'=SUM(C{r}:H{r})',N0); put(ws,r,10,(x[18] if x and x[18] else 0),N0,BLUE); r+=1
total(ws,r,[(2,N0),(3,N0),(9,N0)],a,r-1)
CP="'Chi phi 622 627'"

# ===== Năng lực =====
ws=sheet('Nang luc 2025','NĂNG LỰC MAY 2025 & PHẦN NĂNG LỰC DƯ ĐỂ MAY TỒN KHO',
 ['Tháng','Số công nhân','Ngày làm việc','Năng suất (bộ chuẩn/người/ngày)','Tỷ lệ thời gian may','Năng lực (bộ chuẩn)','SL bán quy đổi','Năng lực dư → may tồn kho','Kế hoạch SX quy đổi','Sử dụng năng lực'],[7,10,10,13,11,13,13,15,13,11])
r=4; NL={}
for m in MONTHS:
    put(ws,r,1,m,color=BLUE); put(ws,r,2,f'=INDEX({CP}!$J:$J,MATCH(A{r},{CP}!$A:$A,0))',N0,GREEN)
    put(ws,r,3,wd(m),N0,BLUE,YF); put(ws,r,4,f'={TS["ns"]}',N0,GREEN); put(ws,r,5,f'={TS["tl"]}',PF,GREEN)
    put(ws,r,6,f'=B{r}*C{r}*D{r}*E{r}',N0)
    put(ws,r,7,f"=SUMPRODUCT(({BH}!$J$4:$J${b_last}=A{r})*{BH}!$G$4:$G${b_last}*IFERROR(INDEX({DM}!$D:$D,MATCH({BH}!$D$4:$D${b_last},{DM}!$A:$A,0)),0))",N2)
    put(ws,r,8,f'=MAX(0,F{r}-G{r})',N2)
    put(ws,r,9,f"=SUMIFS('Lenh SX 2025'!$H:$H,'Lenh SX 2025'!$B:$B,A{r})",N2,GREEN); put(ws,r,10,f'=IFERROR(I{r}/F{r},0)',PF); NL[m]=r; r+=1
nl_last=r-1; total(ws,r,[(6,N0),(7,N2),(8,N2),(9,N2)],4,nl_last)
c=ws.cell(row=r+1,column=1,value='Ngày làm việc: Thứ 2 – Thứ 7, trừ nghỉ lễ 01–02/09/2025 (sửa ô vàng nếu có tăng ca / nghỉ khác). Tháng 8 chưa có công nhân → không sản xuất.'); c.font=F(color='595959')
# bảng tỷ trọng may tồn kho
r+=3; ws.cell(row=r,column=1,value='TỶ TRỌNG MAY TỒN KHO – chỉ mã may sẵn (SX), theo SL bán quy đổi cả năm; mã may theo đơn (DDH) không may tồn kho. Sửa cột Loại (vàng) để đổi.').font=Font(name=AR,size=11,bold=True,color='1F3A68')
r+=1; hdr=['Mã TP','Tên thành phẩm','Hệ số bộ chuẩn','SL bán cả năm','Bán quy đổi','Tỷ trọng may tồn kho','Loại (DDH = may theo đơn, SX = may sẵn)']
DDH={'TP_QB_QV01','TP_QB_QV02','TP_BVR_AV12','TP_BN_AV02_M3XL','TP_BN_AV02_M5XL'}
for i,h in enumerate(hdr,1):
    c=ws.cell(row=r,column=i,value=h); c.font=Font(name=AR,size=10,bold=True,color='FFFFFF'); c.fill=HF; c.border=BD; c.alignment=Alignment(wrap_text=True,horizontal='center')
r+=1; tt_first=r
for tp in TPS:
    put(ws,r,1,tp,color=BLUE); put(ws,r,2,iname(tp)); put(ws,r,3,f'=INDEX({DM}!$D:$D,MATCH(A{r},{DM}!$A:$A,0))',N2,GREEN)
    put(ws,r,4,f'=SUMIFS({BH}!$G:$G,{BH}!$D:$D,A{r})',N0,GREEN); put(ws,r,5,f'=C{r}*D{r}',N2); put(ws,r,7,'DDH' if tp in DDH else 'SX',color=BLUE,fill=YF); r+=1
tt_last=r-1
for rr in range(tt_first,tt_last+1): put(ws,rr,6,f'=IF(G{rr}="DDH",0,IFERROR(E{rr}/SUMIFS($E${tt_first}:$E${tt_last},$G${tt_first}:$G${tt_last},"SX"),0))',PF)
put(ws,r,1,'Cộng',bold=True,fill=TF); put(ws,r,4,f'=SUM(D{tt_first}:D{tt_last})',N0,bold=True,fill=TF); put(ws,r,5,f'=SUM(E{tt_first}:E{tt_last})',N2,bold=True,fill=TF); put(ws,r,6,f'=SUM(F{tt_first}:F{tt_last})',PF,bold=True,fill=TF)
NLs="'Nang luc 2025'"
TTR=f"{NLs}!$A${tt_first}:$A${tt_last}"; TTF=f"{NLs}!$F${tt_first}:$F${tt_last}"

# ===== Lệnh SX =====
ws=sheet('Lenh SX 2025','LỆNH SẢN XUẤT 2025 – may đủ hàng bán trong tháng + may tồn kho bằng năng lực dư',
 ['Mã lệnh','Tháng','Mã TP','Tên thành phẩm','Hệ số bộ chuẩn','SL bán trong tháng','SL may tồn kho','SL quy đổi (bộ chuẩn)','SL sản xuất'],[22,7,16,40,10,12,12,12,12])
r=4; LROW={}
for m in PM:
    for tp in TPS:
        put(ws,r,1,f'LSX2025-{m:02d}-{tp}'); put(ws,r,2,m,color=BLUE); put(ws,r,3,tp,color=BLUE); put(ws,r,4,iname(tp))
        put(ws,r,5,f'=INDEX({DM}!$D:$D,MATCH(C{r},{DM}!$A:$A,0))',N2,GREEN)
        put(ws,r,6,f'=SUMIFS({BH}!$G:$G,{BH}!$D:$D,C{r},{BH}!$J:$J,B{r})',N0,GREEN)
        put(ws,r,7,f'=IFERROR(ROUNDDOWN(INDEX({NLs}!$H:$H,MATCH(B{r},{NLs}!$A:$A,0))*SUMIFS({TTF},{TTR},C{r})/E{r},0),0)',N0,GREEN)
        put(ws,r,9,f'=F{r}+G{r}',N0,bold=True); put(ws,r,8,f'=I{r}*E{r}',N2); LROW[(m,tp)]=r; r+=1
l_last=r-1; total(ws,r,[(6,N0),(7,N0),(8,N2),(9,N0)],4,l_last); ws.auto_filter.ref=f'A3:I{l_last}'
LS="'Lenh SX 2025'"

# ===== Giá thành chi tiết =====
ws=sheet('Gia thanh chi tiet','GIÁ THÀNH CHI TIẾT – NVL XUẤT CHO TỪNG LỆNH (621)',
 ['Mã lệnh','Tháng','Mã TP','Mã NVL','Tên NVL','ĐVT','SL sản xuất','ĐM áp dụng','SL NVL xuất','Đơn giá xuất (BQ tháng)','Thành tiền 621'],[24,7,16,13,34,8,11,11,12,14,15])
r=4; a=r
for m in PM:
    for tp in TPS:
        lr=LROW[(m,tp)]
        for n in list(bom[tp])+(['VAI_IN'] if 'VAI_DKCG_1' in bom[tp] and 'VAI_IN' not in bom[tp] else []):
            put(ws,r,1,f'={LS}!A{lr}',color=GREEN); put(ws,r,2,f'={LS}!B{lr}',color=GREEN); put(ws,r,3,f'={LS}!C{lr}',color=GREEN); put(ws,r,4,n,color=BLUE)
            put(ws,r,5,iname(n)); put(ws,r,6,idvt(n)); put(ws,r,7,f'={LS}!I{lr}',N0,GREEN)
            put(ws,r,8,f'=SUMIFS({DM}!$J:$J,{DM}!$A:$A,C{r},{DM}!$E:$E,D{r})',N4,GREEN); put(ws,r,9,f'=G{r}*H{r}',N2)
            put(ws,r,10,f"=SUMIFS('NXT NVL 2025'!$J:$J,'NXT NVL 2025'!$A:$A,D{r},'NXT NVL 2025'!$C:$C,B{r})",N2,GREEN); put(ws,r,11,f'=I{r}*J{r}',N0); r+=1
c_last=r-1; total(ws,r,[(9,N2),(11,N0)],a,c_last); ws.auto_filter.ref=f'A3:K{c_last}'
CT="'Gia thanh chi tiet'"

# ===== NXT NVL =====
ws=sheet('NXT NVL 2025','NHẬP – XUẤT – TỒN NVL 2025 (giá bình quân tháng)',
 ['Mã NVL','Tên NVL','Tháng','Tồn đầu SL','Tồn đầu giá trị','Nhập SL','Nhập giá trị','—','—','Đơn giá BQ','Xuất SX SL','Xuất khác SL (gửi in / dùng chung)','Xuất giá trị','Tồn cuối SL','Tồn cuối giá trị'],[13,32,7,12,15,12,15,3,3,13,12,14,15,12,15])
ws.column_dimensions['H'].hidden=True; ws.column_dimensions['I'].hidden=True
r=4; NROW={}
for n in nvls:
    for i,m in enumerate(MONTHS):
        put(ws,r,1,n,color=BLUE); put(ws,r,2,iname(n)); put(ws,r,3,m,color=BLUE)
        if i==0: put(ws,r,4,0,N2,BLUE); put(ws,r,5,0,N0,BLUE)
        else: put(ws,r,4,f'=N{r-1}',N2); put(ws,r,5,f'=O{r-1}',N0)
        if n=='VAI_IN':
            put(ws,r,6,f'=SUMIFS({GCs}!$J:$J,{GCs}!$K:$K,C{r})',N2,GREEN)
            put(ws,r,7,f'=SUMIFS({GCs}!$F:$F,{GCs}!$K:$K,C{r})+SUMIFS({GCs}!$H:$H,{GCs}!$K:$K,C{r},{GCs}!$G:$G,"VAI_DKCG_1")*J{NROW[("VAI_DKCG_1",m)]}',N0,GREEN)
        else:
            put(ws,r,6,f'=SUMIFS({MH}!$H:$H,{MH}!$E:$E,A{r},{MH}!$K:$K,C{r})',N2,GREEN); put(ws,r,7,f'=SUMIFS({MH}!$J:$J,{MH}!$E:$E,A{r},{MH}!$K:$K,C{r})',N0,GREEN)
        put(ws,r,10,f'=IFERROR((E{r}+G{r})/(D{r}+F{r}),0)',N2)
        put(ws,r,11,f'=SUMIFS({CT}!$I:$I,{CT}!$D:$D,A{r},{CT}!$B:$B,C{r})',N2,GREEN)
        if n=='CHI_402_RW': put(ws,r,12,f'=IF(C{r}<9,0,(D{r}+F{r})/(13-C{r}))',N2)   # chia đều tồn chỉ cho các tháng còn lại, dùng hết 12/2025 → 6272
        else: put(ws,r,12,f'=SUMIFS({GCs}!$H:$H,{GCs}!$G:$G,A{r},{GCs}!$K:$K,C{r})',N2,GREEN)
        put(ws,r,13,f'=(K{r}+L{r})*J{r}',N0); put(ws,r,14,f'=D{r}+F{r}-K{r}-L{r}',N2); put(ws,r,15,f'=IF(ABS(N{r})<0.0001,0,E{r}+G{r}-M{r})',N0)
        NROW[(n,m)]=r; r+=1
n_last=r-1; ws.auto_filter.ref=f'A3:O{n_last}'

# ===== Giá thành lệnh =====
ws=sheet('Gia thanh lenh','BẢNG TÍNH GIÁ THÀNH THEO LỆNH SẢN XUẤT 2025',
 ['Mã lệnh','Tháng','Mã TP','Tên thành phẩm','SL sản xuất','SL quy đổi','621 NVL trực tiếp','622 phân bổ','627 phân bổ','Tổng giá thành (154 → 155)','Giá thành đơn vị','621 / SP','622 / SP','627 / SP'],[24,7,16,40,11,11,15,15,13,17,14,12,12,11])
r=4; a=r
for m in PM:
    for tp in TPS:
        lr=LROW[(m,tp)]
        put(ws,r,1,f'={LS}!A{lr}',color=GREEN); put(ws,r,2,f'={LS}!B{lr}',color=GREEN); put(ws,r,3,f'={LS}!C{lr}',color=GREEN); put(ws,r,4,f'={LS}!D{lr}',color=GREEN)
        put(ws,r,5,f'={LS}!I{lr}',N0,GREEN); put(ws,r,6,f'={LS}!H{lr}',N2,GREEN)
        put(ws,r,7,f'=SUMIFS({CT}!$K:$K,{CT}!$A:$A,A{r})',N0,GREEN)
        put(ws,r,8,f'=IFERROR(INDEX({CP}!$B:$B,MATCH(B{r},{CP}!$A:$A,0))*F{r}/SUMIFS($F:$F,$B:$B,B{r}),0)',N0,GREEN)
        put(ws,r,9,f'=IFERROR(INDEX({CP}!$I:$I,MATCH(B{r},{CP}!$A:$A,0))*F{r}/SUMIFS($F:$F,$B:$B,B{r}),0)',N0,GREEN)
        put(ws,r,10,f'=G{r}+H{r}+I{r}',N0); put(ws,r,11,f'=IFERROR(J{r}/E{r},0)',N0,bold=True)
        put(ws,r,12,f'=IFERROR(G{r}/E{r},0)',N0); put(ws,r,13,f'=IFERROR(H{r}/E{r},0)',N0); put(ws,r,14,f'=IFERROR(I{r}/E{r},0)',N0); r+=1
t_last=r-1; total(ws,r,[(5,N0),(6,N2),(7,N0),(8,N0),(9,N0),(10,N0)],a,t_last); ws.auto_filter.ref=f'A3:N{t_last}'
GL="'Gia thanh lenh'"

# ===== NXT TP =====
ws=sheet('NXT TP 2025','NHẬP – XUẤT – TỒN THÀNH PHẨM 2025 (giá bình quân tháng)',
 ['Mã TP','Tên thành phẩm','Tháng','Tồn đầu SL','Tồn đầu giá trị','Nhập kho SL','Nhập kho giá trị','—','—','Đơn giá BQ','Xuất bán SL','Xuất bán giá trị','Tồn cuối SL','Tồn cuối giá trị'],[16,40,7,11,15,11,15,3,3,13,11,15,11,15])
ws.column_dimensions['H'].hidden=True; ws.column_dimensions['I'].hidden=True
r=4; TROW={}
for tp in TPS:
    for i,m in enumerate(PM):
        put(ws,r,1,tp,color=BLUE); put(ws,r,2,iname(tp)); put(ws,r,3,m,color=BLUE)
        if i==0: put(ws,r,4,0,N0,BLUE); put(ws,r,5,0,N0,BLUE)
        else: put(ws,r,4,f'=M{r-1}',N0); put(ws,r,5,f'=N{r-1}',N0)
        put(ws,r,6,f'=SUMIFS({GL}!$E:$E,{GL}!$C:$C,A{r},{GL}!$B:$B,C{r})',N0,GREEN); put(ws,r,7,f'=SUMIFS({GL}!$J:$J,{GL}!$C:$C,A{r},{GL}!$B:$B,C{r})',N0,GREEN)
        put(ws,r,10,f'=IFERROR((E{r}+G{r})/(D{r}+F{r}),0)',N0)
        put(ws,r,11,f'=SUMIFS({BH}!$G:$G,{BH}!$D:$D,A{r},{BH}!$J:$J,C{r})',N0,GREEN); put(ws,r,12,f'=K{r}*J{r}',N0)
        put(ws,r,13,f'=D{r}+F{r}-K{r}',N0); put(ws,r,14,f'=IF(M{r}=0,0,E{r}+G{r}-L{r})',N0); TROW[(tp,m)]=r; r+=1
p_last=r-1; ws.auto_filter.ref=f'A3:N{p_last}'

# ===== Tổng hợp tháng =====
ws=sheet('Tong hop thang','TỔNG HỢP GIÁ THÀNH – DOANH THU – LÃI GỘP THEO THÁNG 2025',
 ['Tháng','SL sản xuất','621 NVL','622 Nhân công','627 SX chung','Tổng 154 (nhập kho TP)','Doanh thu','Giá vốn hàng bán','Lãi gộp','Tỷ lệ lãi gộp','Tồn TP cuối tháng','Tồn NVL cuối tháng'],[7,11,15,15,13,17,16,16,16,10,16,17])
r=4; a=r
for m in MONTHS:
    put(ws,r,1,m,color=BLUE)
    for j,col in zip(range(2,6),['E','G','H','I']): put(ws,r,j,f"=SUMIFS({GL}!${col}:${col},{GL}!$B:$B,A{r})",N0,GREEN)
    put(ws,r,6,f'=C{r}+D{r}+E{r}',N0); put(ws,r,7,f'=SUMIFS({BH}!$I:$I,{BH}!$J:$J,A{r})',N0,GREEN); put(ws,r,8,f'=SUMIFS({BH}!$L:$L,{BH}!$J:$J,A{r})',N0,GREEN)
    put(ws,r,9,f'=G{r}-H{r}',N0); put(ws,r,10,f'=IFERROR(I{r}/G{r},0)',PF)
    put(ws,r,11,f"=SUMIFS('NXT TP 2025'!$N:$N,'NXT TP 2025'!$C:$C,A{r})",N0,GREEN); put(ws,r,12,f"=SUMIFS('NXT NVL 2025'!$O:$O,'NXT NVL 2025'!$C:$C,A{r})",N0,GREEN); r+=1
s_last=r-1; tr=r; total(ws,r,[(2,N0),(3,N0),(4,N0),(5,N0),(6,N0),(7,N0),(8,N0),(9,N0)],a,s_last); put(ws,r,10,f'=IFERROR(I{r}/G{r},0)',PF,bold=True,fill=TF)
put(ws,r,11,f'=K{s_last}',N0,bold=True,fill=TF); put(ws,r,12,f'=L{s_last}',N0,bold=True,fill=TF)
r+=2
chk=[('Kiểm tra 1: 621 = NVL xuất SX trên NXT NVL',f"=ROUND(C{tr}-SUMPRODUCT('NXT NVL 2025'!$K$4:$K${n_last},'NXT NVL 2025'!$J$4:$J${n_last}),0)"),
     ('Kiểm tra 2: 154 = Giá vốn hàng bán + Tồn TP cuối năm',f"=ROUND(F{tr}-H{tr}-K{tr},0)"),
     ('Kiểm tra 3: 622 + 627 phát sinh = đã phân bổ (tháng 9–12)',f"=ROUND(SUMIFS({CP}!$B:$B,{CP}!$A:$A,\">=9\")+SUMIFS({CP}!$I:$I,{CP}!$A:$A,\">=9\")-D{tr}-E{tr},0)"),
     ('Kiểm tra 4: Số dòng NVL tồn cuối âm',f"=COUNTIF('NXT NVL 2025'!$N$4:$N${n_last},\"<-0.001\")"),
     ('Kiểm tra 5: Số dòng thành phẩm tồn âm',f"=COUNTIF('NXT TP 2025'!$M$4:$M${p_last},\"<0\")"),
     ('Kiểm tra 6: Số tháng kế hoạch SX vượt năng lực',f"=COUNTIF({NLs}!$J$4:$J${nl_last},\">1.0001\")")]
for t,f in chk:
    put(ws,r,1,t,bold=True); ws.merge_cells(start_row=r,start_column=1,end_row=r,end_column=5); put(ws,r,6,f,N0); put(ws,r,7,'(bằng 0 là khớp)'); r+=1

# ===== Tồn cuối 2025 =====
ws=sheet('Ton cuoi 2025','TỒN KHO 31/12/2025 = SỐ DƯ ĐẦU KỲ 01/01/2026 (dùng nhập vào phần mềm)',['Mã hàng','Tên hàng','ĐVT','Số lượng','Giá trị','Đơn giá'],[16,42,8,13,16,13])
r=4; a=r
for n in nvls:
    nr=NROW[(n,12)]; put(ws,r,1,n,color=BLUE); put(ws,r,2,iname(n)); put(ws,r,3,idvt(n)); put(ws,r,4,f"='NXT NVL 2025'!N{nr}",N2,GREEN); put(ws,r,5,f"='NXT NVL 2025'!O{nr}",N0,GREEN); put(ws,r,6,f'=IFERROR(E{r}/D{r},0)',N2); r+=1
for tp in TPS:
    nr=TROW[(tp,12)]; put(ws,r,1,tp,color=BLUE); put(ws,r,2,iname(tp)); put(ws,r,3,idvt(tp)); put(ws,r,4,f"='NXT TP 2025'!M{nr}",N0,GREEN); put(ws,r,5,f"='NXT TP 2025'!N{nr}",N0,GREEN); put(ws,r,6,f'=IFERROR(E{r}/D{r},0)',N0); r+=1
total(ws,r,[(5,N0)],a,r-1)
order=['Huong dan','Tong hop thang','Gia thanh lenh','Gia thanh chi tiet','Nang luc 2025','Lenh SX 2025','Dinh muc 2025','NXT NVL 2025','NXT TP 2025','Ban hang 2025','Mua hang 2025','Gia cong 2025','Chi phi 622 627','Thong so','Ton cuoi 2025']
wb._sheets=[wb[n] for n in order]
wb.save('GiaThanh_DuongVan_2025.xlsx'); print('ok', len(PM)*len(TPS),'lệnh', c_last-3,'dòng chi tiết')
