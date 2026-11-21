import json, openpyxl, collections, datetime
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as CL
from openpyxl.comments import Comment
d=json.load(open('/home/claude/work/import/nap_final.json'))
items={r[0]:r for r in d['items']['rows']}
bom=collections.OrderedDict()
for r in d['bom']['rows']: bom.setdefault(r[1],collections.OrderedDict())[r[2]]=r[4]/r[3]
src=openpyxl.load_workbook('/mnt/user-data/uploads/e9a18b22-Duong_Van_2025.xlsx', data_only=True)
P=[r for r in list(src['Mua hang'].iter_rows(values_only=True))[4:] if hasattr(r[0],'month')]
S=[r for r in list(src['Ban hang'].iter_rows(values_only=True))[4:] if r[4] and r[4]!='x' and hasattr(r[1],'month')]
C=[r for r in list(src['622+627'].iter_rows(values_only=True))[1:13] if isinstance(r[0],int)]
MONTHS=[8,9,10,11,12]
pur_codes=set(r[4] for r in P)
AVAIL=set(pur_codes)|{'VAI_IN'}  # VAI_IN có từ in gia công
GC=[r for r in P if r[4]=='V_IGC']
PUR=[r for r in P if r[4]!='V_IGC']
sold=collections.OrderedDict()
for r in S: sold.setdefault(r[4],0); sold[r[4]]+=r[7]
TPS=sorted(sold)
nvls=[]
for tp in TPS:
    for n in bom[tp]:
        if n not in nvls: nvls.append(n)
for extra in ['VAI_K4471','CHI_402_RW']:
    if extra not in nvls: nvls.append(extra)
order_n=['VAI_DKCG_1','VAI_K4471','VAI_IN','VALO','THUN','DALU','DK_RN','DK_NL','CHI_402_RW','TUZI','TEM_TTG','TEM_LAV','TEM_SPN','TEM_SPL']
nvls=[n for n in order_n if n in nvls]+[n for n in nvls if n not in order_n]

AR='Arial'; F=lambda **k: Font(name=AR, size=10, **k)
HF=PatternFill('solid', fgColor='1F3A68'); YF=PatternFill('solid', fgColor='FFF2CC'); GF=PatternFill('solid', fgColor='E2EFDA'); TF=PatternFill('solid', fgColor='DDEBF7')
thin=Side(style='thin', color='BFBFBF'); BD=Border(left=thin,right=thin,top=thin,bottom=thin)
N0='#,##0;(#,##0);"-"'; N2='#,##0.00;(#,##0.00);"-"'; N4='#,##0.####;(#,##0.####);"-"'; DF='dd/mm/yyyy'; PF='0.0%;(0.0%);"-"'
BLUE='0000FF'; GREEN='008000'
wb=openpyxl.Workbook()
def sheet(name, title, headers, widths):
    ws=wb.create_sheet(name); ws['A1']=title; ws['A1'].font=Font(name=AR,size=13,bold=True,color='1F3A68')
    for i,h in enumerate(headers,1):
        c=ws.cell(row=3,column=i,value=h); c.font=Font(name=AR,size=10,bold=True,color='FFFFFF'); c.fill=HF; c.alignment=Alignment(wrap_text=True,vertical='center',horizontal='center'); c.border=BD
    for i,w in enumerate(widths,1): ws.column_dimensions[CL(i)].width=w
    ws.row_dimensions[3].height=32; ws.freeze_panes='A4'
    return ws
def put(ws,r,c,v,fmt=None,color=None,fill=None,bold=False):
    x=ws.cell(row=r,column=c,value=v); x.font=F(color=color,bold=bold) if (color or bold) else F(); x.border=BD
    if fmt: x.number_format=fmt
    if fill: x.fill=fill
    return x
def total(ws,r,cols,first,last,label_col=1,label='Tổng cộng'):
    put(ws,r,label_col,label,bold=True,fill=TF)
    for c,fmt in cols: put(ws,r,c,f'=SUBTOTAL(9,{CL(c)}{first}:{CL(c)}{last})',fmt,bold=True,fill=TF)

# ---------- Hướng dẫn ----------
ws=wb.active; ws.title='Huong dan'
lines=[('GIÁ THÀNH NĂM 2025 – CÔNG TY DƯƠNG VÂN',True),('',False),
('Cách đọc file',True),
('• Chữ xanh dương = số liệu nhập (lấy từ file Duong_Van_2025.xlsx). Chữ đen = công thức. Chữ xanh lá = lấy từ sheet khác.',False),
('• Ô nền vàng ở sheet "Dinh muc 2025" (cột Dùng năm 2025) là ô bạn được sửa: gõ Có / Không để tính hay bỏ qua NVL đó – toàn bộ giá thành tự tính lại.',False),
('',False),('Giả định (do năm 2025 chưa đủ hóa đơn chứng từ)',True),
('1. Định mức 2025 lấy theo định mức năm 2026 của đúng mã thành phẩm.',False),
('2. NVL không có hóa đơn mua năm 2025 (Vải lót VALO, Thun, Dây kéo, Đầu kéo, Tem nhãn…) → bỏ qua (Dùng = Không), không tính vào 621.',False),
('3. NVL tính vào giá thành: VAI_DKCG_1, VAI_IN (vải in gia công), DALU, TUZI – các mã có hóa đơn mua 2025.',False),
('4. Vải in gia công: mỗi mét in (V_IGC) = 1 mét VAI_DKCG_1 gửi đi → 1 mét VAI_IN nhận về. Giá VAI_IN = giá vải gửi + phí in.',False),
('5. Sản xuất trong tháng bán: mỗi (tháng, mã thành phẩm) có bán = 1 lệnh sản xuất, SL sản xuất = SL bán trong tháng → không có tồn thành phẩm cuối năm 2025.',False),
('6. Tồn đầu kỳ 01/2025 = 0 (công ty phát sinh mua từ 08/2025).',False),
('7. Giá xuất kho NVL: bình quân gia quyền cuối tháng (tồn đầu + nhập trong tháng).',False),
('8. 622 / 627 từng tháng lấy theo sheet 622+627 của file gốc; phân bổ cho lệnh theo SL quy đổi bộ chuẩn (quần bơi = 0,5 bộ).',False),
('9. Chỉ may CHI_402_RW và vải K44-71 không có trong định mức → để tồn kho.',False),
('',False),('Thứ tự sheet',True),
('Tong hop thang → Gia thanh lenh → Gia thanh chi tiet → Dinh muc 2025 → NXT NVL 2025 → Lenh SX 2025 → Ban hang 2025 → Mua hang 2025 → Gia cong 2025 → Chi phi 622 627 → Ton cuoi 2025 (= số dư đầu kỳ 2026)',False)]
for i,(t,b) in enumerate(lines,1):
    c=ws.cell(row=i,column=1,value=t); c.font=Font(name=AR,size=13 if i==1 else 10,bold=b,color='1F3A68' if b else None)
ws.column_dimensions['A'].width=140

# ---------- Định mức ----------
ws=sheet('Dinh muc 2025','ĐỊNH MỨC NVL NĂM 2025 (cho 1 thành phẩm) – theo định mức 2026, bỏ NVL không có hóa đơn 2025',
 ['Mã TP','Tên thành phẩm','ĐVT TP','Hệ số bộ chuẩn','Mã NVL','Tên NVL','ĐVT NVL','ĐM 2026 (SL NVL / 1 SP)','Dùng năm 2025 (Có/Không)','ĐM áp dụng 2025','Ghi chú'],
 [16,40,8,10,13,36,9,13,13,13,40])
r=4; dm_first=r
for tp in TPS:
    for n,q in bom[tp].items():
        put(ws,r,1,tp,color=BLUE); put(ws,r,2,items[tp][1]); put(ws,r,3,items[tp][3]); put(ws,r,4,items[tp][6],N2,color=BLUE)
        put(ws,r,5,n,color=BLUE); put(ws,r,6,items[n][1] if n in items else ''); put(ws,r,7,items[n][3] if n in items else '')
        put(ws,r,8,q,N4,color=BLUE); put(ws,r,9,'Có' if n in AVAIL else 'Không',color=BLUE,fill=YF)
        put(ws,r,10,f'=IF(I{r}="Có",H{r},0)',N4)
        put(ws,r,11,'' if n in AVAIL else 'Năm 2025 không có hóa đơn mua – bỏ qua')
        r+=1
dm_last=r-1
ws.auto_filter.ref=f'A3:K{dm_last}'
DM=f"'Dinh muc 2025'"
# ---------- Mua hàng ----------
ws=sheet('Mua hang 2025','CHI TIẾT MUA NVL NĂM 2025 (không gồm phí in gia công – xem sheet Gia cong 2025)',
 ['Ngày nhập kho','Ngày hóa đơn','Số HĐ','Nhà cung cấp','Mã hàng','Tên hàng','ĐVT','Số lượng','Đơn giá','Thành tiền','Tháng'],[12,12,11,44,13,34,8,12,12,15,7])
r=4; m_first=r
for x in PUR:
    put(ws,r,1,x[0],DF,BLUE); put(ws,r,2,x[1],DF,BLUE); put(ws,r,3,str(x[2]),color=BLUE); put(ws,r,4,x[3],color=BLUE); put(ws,r,5,x[4],color=BLUE)
    put(ws,r,6,items[x[4]][1] if x[4] in items else x[5]); put(ws,r,7,x[6]); put(ws,r,8,x[7],N2,BLUE); put(ws,r,9,x[8],N2,BLUE)
    put(ws,r,10,f'=H{r}*I{r}',N0); put(ws,r,11,f'=MONTH(A{r})'); r+=1
m_last=r-1; total(ws,r,[(8,N2),(10,N0)],m_first,m_last)
MH="'Mua hang 2025'"
# ---------- Gia công ----------
ws=sheet('Gia cong 2025','IN GIA CÔNG NĂM 2025 – gửi VAI_DKCG_1 đi in, nhận về VAI_IN (1 mét in = 1 mét vải)',
 ['Ngày HĐ (nhận về)','Số HĐ','Đơn vị in','SL in (m)','Đơn giá in','Phí in','Mã vải gửi','SL vải gửi','Mã nhận về','SL nhận về','Tháng'],[12,9,40,11,11,14,13,11,11,11,7])
r=4; g_first=r
for x in GC:
    put(ws,r,1,x[0],DF,BLUE); put(ws,r,2,str(x[2]),color=BLUE); put(ws,r,3,x[3],color=BLUE); put(ws,r,4,x[7],N2,BLUE); put(ws,r,5,x[8],N2,BLUE)
    put(ws,r,6,f'=D{r}*E{r}',N0); put(ws,r,7,'VAI_DKCG_1',color=BLUE,fill=YF); put(ws,r,8,f'=D{r}',N2); put(ws,r,9,'VAI_IN'); put(ws,r,10,f'=D{r}',N2); put(ws,r,11,f'=MONTH(A{r})'); r+=1
g_last=r-1; total(ws,r,[(4,N2),(6,N0),(8,N2),(10,N2)],g_first,g_last)
GCs="'Gia cong 2025'"
# ---------- Lệnh SX ----------
lenh=sorted({(x[1].month, x[4]) for x in S})
ws=sheet('Lenh SX 2025','LỆNH SẢN XUẤT 2025 – mỗi tháng / mã thành phẩm có bán = 1 lệnh, SL sản xuất = SL bán trong tháng',
 ['Mã lệnh','Tháng','Mã TP','Tên thành phẩm','SL sản xuất','Hệ số bộ chuẩn','SL quy đổi (bộ chuẩn)'],[20,7,16,42,12,10,12])
r=4; l_first=r; LROW={}
for m,tp in lenh:
    put(ws,r,1,f'LSX2025-{m:02d}-{tp}'); put(ws,r,2,m,color=BLUE); put(ws,r,3,tp,color=BLUE); put(ws,r,4,items[tp][1])
    put(ws,r,5,f"=SUMIFS('Ban hang 2025'!$H:$H,'Ban hang 2025'!$E:$E,C{r},'Ban hang 2025'!$K:$K,B{r})",N0,GREEN)
    put(ws,r,6,f"=INDEX({DM}!$D:$D,MATCH(C{r},{DM}!$A:$A,0))",N2,GREEN); put(ws,r,7,f'=E{r}*F{r}',N2); LROW[(m,tp)]=r; r+=1
l_last=r-1; total(ws,r,[(5,N0),(7,N2)],l_first,l_last)
LS="'Lenh SX 2025'"
# ---------- Giá thành chi tiết ----------
ws=sheet('Gia thanh chi tiet','GIÁ THÀNH CHI TIẾT – NVL XUẤT CHO TỪNG LỆNH (621)',
 ['Mã lệnh','Tháng','Mã TP','Mã NVL','Tên NVL','ĐVT','SL sản xuất','ĐM áp dụng','SL NVL xuất','Đơn giá xuất (BQ tháng)','Thành tiền 621'],[22,7,16,13,34,8,11,11,12,14,15])
r=4; c_first=r
for m,tp in lenh:
    lr=LROW[(m,tp)]
    for n in bom[tp]:
        put(ws,r,1,f'={LS}!A{lr}',color=GREEN); put(ws,r,2,f'={LS}!B{lr}',color=GREEN); put(ws,r,3,f'={LS}!C{lr}',color=GREEN); put(ws,r,4,n,color=BLUE)
        put(ws,r,5,items[n][1] if n in items else ''); put(ws,r,6,items[n][3] if n in items else '')
        put(ws,r,7,f'={LS}!E{lr}',N0,GREEN)
        put(ws,r,8,f'=SUMIFS({DM}!$J:$J,{DM}!$A:$A,C{r},{DM}!$E:$E,D{r})',N4,GREEN)
        put(ws,r,9,f'=G{r}*H{r}',N2)
        put(ws,r,10,f"=SUMIFS('NXT NVL 2025'!$J:$J,'NXT NVL 2025'!$A:$A,D{r},'NXT NVL 2025'!$C:$C,B{r})",N2,GREEN)
        put(ws,r,11,f'=I{r}*J{r}',N0); r+=1
c_last=r-1; total(ws,r,[(9,N2),(11,N0)],c_first,c_last); ws.auto_filter.ref=f'A3:K{c_last}'
CT="'Gia thanh chi tiet'"
# ---------- NXT NVL ----------
ws=sheet('NXT NVL 2025','NHẬP – XUẤT – TỒN NVL NĂM 2025 (giá bình quân tháng)',
 ['Mã NVL','Tên NVL','Tháng','Tồn đầu SL','Tồn đầu giá trị','Nhập SL','Nhập giá trị','—','—','Đơn giá BQ','Xuất SX SL','Xuất gửi in SL','Xuất giá trị','Tồn cuối SL','Tồn cuối giá trị'],
 [13,32,7,12,15,12,15,3,3,13,12,12,15,12,15])
ws.column_dimensions['H'].hidden=True; ws.column_dimensions['I'].hidden=True
r=4; n_first=r; NROW={}
for n in nvls:
    for i,m in enumerate(MONTHS):
        put(ws,r,1,n,color=BLUE); put(ws,r,2,items[n][1] if n in items else ''); put(ws,r,3,m,color=BLUE)
        if i==0: put(ws,r,4,0,N2,BLUE); put(ws,r,5,0,N0,BLUE)
        else: put(ws,r,4,f'=N{r-1}',N2); put(ws,r,5,f'=O{r-1}',N0)
        if n=='VAI_IN':
            put(ws,r,6,f'=SUMIFS({GCs}!$J:$J,{GCs}!$K:$K,C{r})',N2,GREEN)
            src_r=NROW.get(('VAI_DKCG_1',m))
            put(ws,r,7,f'=SUMIFS({GCs}!$F:$F,{GCs}!$K:$K,C{r})+SUMIFS({GCs}!$H:$H,{GCs}!$K:$K,C{r},{GCs}!$G:$G,"VAI_DKCG_1")*J{src_r}',N0,GREEN)
        else:
            put(ws,r,6,f'=SUMIFS({MH}!$H:$H,{MH}!$E:$E,A{r},{MH}!$K:$K,C{r})',N2,GREEN)
            put(ws,r,7,f'=SUMIFS({MH}!$J:$J,{MH}!$E:$E,A{r},{MH}!$K:$K,C{r})',N0,GREEN)
        put(ws,r,10,f'=IFERROR((E{r}+G{r})/(D{r}+F{r}),0)',N2)
        put(ws,r,11,f'=SUMIFS({CT}!$I:$I,{CT}!$D:$D,A{r},{CT}!$B:$B,C{r})',N2,GREEN)
        put(ws,r,12,f'=SUMIFS({GCs}!$H:$H,{GCs}!$G:$G,A{r},{GCs}!$K:$K,C{r})',N2,GREEN)
        put(ws,r,13,f'=(K{r}+L{r})*J{r}',N0); put(ws,r,14,f'=D{r}+F{r}-K{r}-L{r}',N2); put(ws,r,15,f'=E{r}+G{r}-M{r}',N0)
        NROW[(n,m)]=r; r+=1
n_last=r-1
ws.auto_filter.ref=f'A3:O{n_last}'
# ---------- Bán hàng ----------
ws=sheet('Ban hang 2025','CHI TIẾT BÁN HÀNG NĂM 2025 – giá vốn = giá thành đơn vị của lệnh cùng tháng',
 ['Ngày HĐ','Số HĐ','Khách hàng','Mã TP','Mã hàng','Tên hàng','ĐVT','Số lượng','Đơn giá','Doanh số','Tháng','Giá vốn đơn vị','Giá vốn','Lãi gộp','Tỷ lệ lãi'],[11,10,40,3,16,40,7,10,11,14,7,13,14,14,9])
ws.column_dimensions['D'].hidden=True
r=4; b_first=r
for x in S:
    put(ws,r,1,x[1],DF,BLUE); put(ws,r,2,str(x[2]),color=BLUE); put(ws,r,3,x[3],color=BLUE); put(ws,r,4,'')
    put(ws,r,5,x[4],color=BLUE); put(ws,r,6,items[x[4]][1]); put(ws,r,7,x[6]); put(ws,r,8,x[7],N0,BLUE); put(ws,r,9,x[8],N0,BLUE)
    put(ws,r,10,f'=H{r}*I{r}',N0); put(ws,r,11,f'=MONTH(A{r})')
    put(ws,r,12,f"=SUMIFS('Gia thanh lenh'!$K:$K,'Gia thanh lenh'!$C:$C,E{r},'Gia thanh lenh'!$B:$B,K{r})",N0,GREEN)
    put(ws,r,13,f'=H{r}*L{r}',N0); put(ws,r,14,f'=J{r}-M{r}',N0); put(ws,r,15,f'=IFERROR(N{r}/J{r},0)',PF); r+=1
b_last=r-1; total(ws,r,[(8,N0),(10,N0),(13,N0),(14,N0)],b_first,b_last); put(ws,r,15,f'=IFERROR(N{r}/J{r},0)',PF,bold=True,fill=TF)
# ---------- Chi phí 622/627 ----------
ws=sheet('Chi phi 622 627','CHI PHÍ NHÂN CÔNG (622) & SẢN XUẤT CHUNG (627) NĂM 2025 – theo file gốc',
 ['Tháng','622 Nhân công trực tiếp','6273 CCDC','6274 Khấu hao','6277 Điện','6277 Nước','6277 Khác','627 cộng','Số công nhân'],[7,16,12,12,12,12,12,14,10])
r=4; cp_first=r; CPROW={}
cdict={int(x[0]):x for x in C}
for m in MONTHS:
    x=cdict.get(m)
    put(ws,r,1,m,color=BLUE); put(ws,r,2,(x[5] or 0) if x else 0,N0,BLUE)
    for j,ci in zip(range(3,8),[9,10,12,13,14]): put(ws,r,j,(x[ci] or 0) if x else 0,N0,BLUE)
    put(ws,r,8,f'=SUM(C{r}:G{r})',N0); put(ws,r,9,(x[18] if x and x[18] else None),N0,BLUE); CPROW[m]=r; r+=1
total(ws,r,[(2,N0),(8,N0)],cp_first,r-1)
CP="'Chi phi 622 627'"
# ---------- Giá thành lệnh ----------
ws=sheet('Gia thanh lenh','BẢNG TÍNH GIÁ THÀNH THEO LỆNH SẢN XUẤT NĂM 2025',
 ['Mã lệnh','Tháng','Mã TP','Tên thành phẩm','SL sản xuất','SL quy đổi','621 NVL trực tiếp','622 phân bổ','627 phân bổ','Tổng giá thành (154 → 155)','Giá thành đơn vị','621 / SP','622 / SP'],[22,7,16,40,11,11,15,15,13,17,14,12,12])
r=4; t_first=r
for m,tp in lenh:
    lr=LROW[(m,tp)]
    put(ws,r,1,f'={LS}!A{lr}',color=GREEN); put(ws,r,2,f'={LS}!B{lr}',color=GREEN); put(ws,r,3,f'={LS}!C{lr}',color=GREEN); put(ws,r,4,f'={LS}!D{lr}',color=GREEN)
    put(ws,r,5,f'={LS}!E{lr}',N0,GREEN); put(ws,r,6,f'={LS}!G{lr}',N2,GREEN)
    put(ws,r,7,f'=SUMIFS({CT}!$K:$K,{CT}!$A:$A,A{r})',N0,GREEN)
    put(ws,r,8,f'=IFERROR(INDEX({CP}!$B:$B,MATCH(B{r},{CP}!$A:$A,0))*F{r}/SUMIFS($F:$F,$B:$B,B{r}),0)',N0,GREEN)
    put(ws,r,9,f'=IFERROR(INDEX({CP}!$H:$H,MATCH(B{r},{CP}!$A:$A,0))*F{r}/SUMIFS($F:$F,$B:$B,B{r}),0)',N0,GREEN)
    put(ws,r,10,f'=G{r}+H{r}+I{r}',N0); put(ws,r,11,f'=IFERROR(J{r}/E{r},0)',N0,bold=True); put(ws,r,12,f'=IFERROR(G{r}/E{r},0)',N0); put(ws,r,13,f'=IFERROR(H{r}/E{r},0)',N0); r+=1
t_last=r-1; total(ws,r,[(5,N0),(6,N2),(7,N0),(8,N0),(9,N0),(10,N0)],t_first,t_last); ws.auto_filter.ref=f'A3:M{t_last}'
# ---------- Tổng hợp tháng ----------
ws=sheet('Tong hop thang','TỔNG HỢP GIÁ THÀNH – DOANH THU – LÃI GỘP THEO THÁNG NĂM 2025',
 ['Tháng','SL sản xuất','621 NVL','622 Nhân công','627 SX chung','Tổng 154','622 chưa phân bổ (tháng không có lệnh)','Doanh thu','Giá vốn hàng bán','Lãi gộp','Tỷ lệ lãi gộp','Tồn kho NVL cuối tháng'],[7,11,15,15,13,16,16,16,16,16,10,17])
r=4; s_first=r
for m in MONTHS:
    put(ws,r,1,m,color=BLUE)
    put(ws,r,2,f"=SUMIFS('Gia thanh lenh'!$E:$E,'Gia thanh lenh'!$B:$B,A{r})",N0,GREEN)
    put(ws,r,3,f"=SUMIFS('Gia thanh lenh'!$G:$G,'Gia thanh lenh'!$B:$B,A{r})",N0,GREEN)
    put(ws,r,4,f"=SUMIFS('Gia thanh lenh'!$H:$H,'Gia thanh lenh'!$B:$B,A{r})",N0,GREEN)
    put(ws,r,5,f"=SUMIFS('Gia thanh lenh'!$I:$I,'Gia thanh lenh'!$B:$B,A{r})",N0,GREEN)
    put(ws,r,6,f'=C{r}+D{r}+E{r}',N0)
    put(ws,r,7,f'=INDEX({CP}!$B:$B,MATCH(A{r},{CP}!$A:$A,0))+INDEX({CP}!$H:$H,MATCH(A{r},{CP}!$A:$A,0))-D{r}-E{r}',N0,GREEN)
    put(ws,r,8,f"=SUMIFS('Ban hang 2025'!$J:$J,'Ban hang 2025'!$K:$K,A{r})",N0,GREEN)
    put(ws,r,9,f"=SUMIFS('Ban hang 2025'!$M:$M,'Ban hang 2025'!$K:$K,A{r})",N0,GREEN)
    put(ws,r,10,f'=H{r}-I{r}',N0); put(ws,r,11,f'=IFERROR(J{r}/H{r},0)',PF)
    put(ws,r,12,f"=SUMIFS('NXT NVL 2025'!$O:$O,'NXT NVL 2025'!$C:$C,A{r})",N0,GREEN); r+=1
s_last=r-1; total(ws,r,[(2,N0),(3,N0),(4,N0),(5,N0),(6,N0),(7,N0),(8,N0),(9,N0),(10,N0)],s_first,s_last); put(ws,r,11,f'=IFERROR(J{r}/H{r},0)',PF,bold=True,fill=TF)
put(ws,r,12,f'=L{s_last}',N0,bold=True,fill=TF)
r+=2
chk=[('Kiểm tra 1: Tổng 621 = NVL xuất SX trên NXT',f"=ROUND(C{s_last+1}-SUMPRODUCT('NXT NVL 2025'!$K$4:$K${n_last},'NXT NVL 2025'!$J$4:$J${n_last}),0)"),
     ('Kiểm tra 2: Tổng 154 = Giá vốn hàng bán (không tồn TP)',f"=ROUND(F{s_last+1}-I{s_last+1},0)"),
     ('Kiểm tra 3: Mã NVL tồn cuối âm (số dòng)',f"=COUNTIF('NXT NVL 2025'!$N$4:$N${n_last},\"<-0.001\")")]
for t,f in chk:
    put(ws,r,1,t,bold=True); ws.merge_cells(start_row=r,start_column=1,end_row=r,end_column=6); put(ws,r,7,f,N0); put(ws,r,8,'(bằng 0 là khớp)'); r+=1

# ---------- Tồn cuối 2025 = số dư đầu kỳ 2026 ----------
ws=sheet('Ton cuoi 2025','TỒN KHO CUỐI 31/12/2025 = SỐ DƯ ĐẦU KỲ 01/01/2026 (dùng nhập vào phần mềm)',
 ['Mã hàng','Tên hàng','ĐVT','Số lượng','Giá trị','Đơn giá'],[13,40,8,13,16,13])
r=4; e_first=r
for n in nvls:
    nr=NROW[(n,12)]
    put(ws,r,1,n,color=BLUE); put(ws,r,2,items[n][1] if n in items else ''); put(ws,r,3,items[n][3] if n in items else '')
    put(ws,r,4,f"='NXT NVL 2025'!N{nr}",N2,GREEN); put(ws,r,5,f"='NXT NVL 2025'!O{nr}",N0,GREEN); put(ws,r,6,f'=IFERROR(E{r}/D{r},0)',N2); r+=1
total(ws,r,[(5,N0)],e_first,r-1)
put(ws,r+2,1,'Thành phẩm tồn cuối 2025 = 0 (giả định sản xuất trong tháng bán).')
# order sheets
order=['Huong dan','Tong hop thang','Gia thanh lenh','Gia thanh chi tiet','Dinh muc 2025','NXT NVL 2025','Lenh SX 2025','Ban hang 2025','Mua hang 2025','Gia cong 2025','Chi phi 622 627','Ton cuoi 2025']
wb._sheets=[wb[n] for n in order]
wb.save('GiaThanh_DuongVan_2025.xlsx'); print('ok', len(lenh),'lệnh', c_last-c_first+1,'dòng chi tiết')
