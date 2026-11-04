import json, sys, collections
d = json.load(open(sys.argv[1]))
F = {
 'items':['ma','ten','nhom','dvt','kho'],
 'bom':['loai','maTP','maNVL','slTP','slNVL','lanNgay','haoHut','maThayThe','tuNgay','denNgay','tyLe','ghiChu'],
 'purchases':['ngayNhap','ngayMua','hoaDon','ncc','ma','sl','donGia','tt','kho','ghiChu'],
 'orders':['maLenh','ngayXuatNVL','ngaySX','maTP','loaiDM','soMeKH','dieuChinhMe','ghiChu'],
 'adjustments':['maLenh','maVT','dieuChinh','lyDo'],
 'issues':['maPhieu','ngay','maVT','sl','lyDo'],
 'sales':['ngay','ma','sl','doanhSo'],
}
rows = lambda arr, f: [[r.get(k, '') for k in f] for r in arr]
docs = {}
docs['settings'] = {'company':'KH Thảo Vy', 'startKy': d['opening']['ky']}
docs['items'] = {'rows': rows(d['items'], F['items'])}
docs['bom'] = {'rows': rows(d['bom'], F['bom'])}
docs['opening'] = {'ky': d['opening']['ky'], 'rows': [[ma, v['sl'], v['tt']] for ma, v in d['opening']['rows'].items()]}
def byky(arr, f):
    g = collections.defaultdict(list)
    for r in arr: g[r[f][:7]].append(r)
    return g
for k, v in byky(d['purchases'], 'ngayNhap').items(): docs['p_'+k] = {'rows': rows(v, F['purchases'])}
for k, v in byky(d['sales'], 'ngay').items(): docs['s_'+k] = {'rows': rows(v, F['sales'])}
for k, v in byky(d['issues'], 'ngay').items(): docs['i_'+k] = {'rows': rows(v, F['issues'])}
oky = {o['maLenh']: o['ngayXuatNVL'][:7] for o in d['orders']}
O = byky(d['orders'], 'ngayXuatNVL')
A = collections.defaultdict(list)
for a in d['adjustments']: A[oky.get(a['maLenh'], 'none')].append(a)
for k in set(O) | set(A): docs['o_'+k] = {'rows': rows(O.get(k, []), F['orders']), 'adj': rows(A.get(k, []), F['adjustments'])}
for c in d['costs']:
    if any(c[f] for f in ['c622','c6273','c6274','dien','nuoc','khac']):
        docs['c_'+c['ky']] = {f: c[f] for f in ['c622','c6273','c6274','dien','nuoc','khac']}
json.dump(docs, open(sys.argv[2], 'w'), ensure_ascii=False)
print({k: len(json.dumps(v, ensure_ascii=False)) for k, v in docs.items()})
