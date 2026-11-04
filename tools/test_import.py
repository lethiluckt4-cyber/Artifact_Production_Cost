import openpyxl, json, datetime, sys
wb = openpyxl.load_workbook('out/DuLieu_GiaThanh_T10-2026.xlsx')
MAP = {'DanhMuc':'items','TonDau':'opening','DinhMuc':'bom','MuaHang':'purchases','LenhSX':'orders','DieuChinhNVL':'adjustments','XuatChung':'issues','BanHang':'sales','ChiPhi':'costs','KeHoachSX':'plan'}
out = {}
for s, ent in MAP.items():
    ws = wb[s]; aoa=[]
    for r in ws.iter_rows(values_only=True):
        row=[]
        for v in r:
            if isinstance(v, datetime.datetime): v = v.strftime('%d/%m/%Y')   # giả lập người dùng nhập chuỗi dd/mm/yyyy
            elif v is None: v=''
            row.append(v)
        aoa.append(row)
    out[ent]=aoa
json.dump(out, open('data/aoa.json','w'), ensure_ascii=False)
print({k:len(v) for k,v in out.items()})
