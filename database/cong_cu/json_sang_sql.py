#!/usr/bin/env python3
"""
Chuyển tệp sao lưu của phần mềm giá thành (nút "Sao lưu (.json)") thành câu lệnh SQL nạp vào schema gia_thanh.

Dùng:
  python3 json_sang_sql.py <sao_luu.json> <ra_seed.sql> --ma-cong-ty TH
  python3 json_sang_sql.py <demo.json> <ra_seed.sql> --ma-cong-ty DEMO --ten-cong-ty "Công ty Demo"
  python3 json_sang_sql.py <sao_luu.json> <ra_seed.sql> --ma-cong-ty TH --ket-qua ket_qua.json --ra-ket-qua <ra_ket_qua.sql>

  - ket_qua.json do cong_cu/xuat_ket_qua_tinh.js tạo ra (chạy chính phần mềm để tính).
  - Tệp SQL sinh ra chạy được nhiều lần cho nhiều công ty (mỗi công ty một mã).
"""
import json, sys, argparse, re

NHOM_LOAI = {'TP đóng gói': 'TP_DONG_GOI', 'Thành phẩm': 'TU_SAN_XUAT', 'Bán thành phẩm': 'TU_SAN_XUAT',
             'Sản phẩm lỗi': 'SAN_PHAM_LOI'}
NHOM_ORDER = {'TP đóng gói': 0, 'Thành phẩm': 1, 'Bán thành phẩm': 2, 'Sản phẩm lỗi': 2.5, 'Bánh khô': 3,
              'Kem tươi': 4, 'Bao bì': 5, 'Nhiên liệu': 6, 'Khác': 7}
NHOM_KEY = {'TP đóng gói': 'TP đóng gói (Ngày)', 'Bánh khô': 'NVL Bánh khô', 'Kem tươi': 'NVL Kem tươi'}
CAL = {'Nghỉ lễ / công ty': 'NGHI_LE', 'Nghỉ chờ việc': 'NGHI_CHO_VIEC', 'Tăng ca / làm Chủ nhật': 'TANG_CA'}
NGUON = {'': 'EXCEL', 'Excel': 'EXCEL', 'PM': 'PM', 'PM+tay': 'PM_SUA_TAY', 'Tay': 'TAY', 'Excel+tay': 'EXCEL_SUA_TAY'}
RISK = {'OK': 'OK', 'CẢNH BÁO': 'CANH_BAO', 'RỦI RO CAO': 'RUI_RO_CAO'}
COSTCOLS0 = [{'k': 'c622', 't': '622 Nhân công', 'g': '622'}, {'k': 'c6273', 't': '6273 Dụng cụ', 'g': '627'},
             {'k': 'c6274', 't': '6274 Khấu hao', 'g': '627'}, {'k': 'dien', 't': '6277 Điện', 'g': '627'},
             {'k': 'nuoc', 't': '6277 Nước', 'g': '627'}]
F = {
    'items': ['ma', 'ten', 'nhom', 'dvt', 'kho'],
    'bom': ['loai', 'maTP', 'maNVL', 'slTP', 'slNVL', 'lanNgay', 'haoHut', 'maThayThe', 'tuNgay', 'denNgay', 'tyLe', 'ghiChu'],
    'purchases': ['ngayNhap', 'ngayMua', 'hoaDon', 'ncc', 'ma', 'sl', 'donGia', 'tt', 'kho', 'ghiChu'],
    'orders': ['maLenh', 'ngayXuatNVL', 'ngaySX', 'maTP', 'loaiDM', 'slKH', 'dieuChinhTP', 'ghiChu', 'khoa', 'nguon', 'slDX', 'slGoc'],
    'adjustments': ['ngaySX', 'maTP', 'maVT', 'dieuChinh', 'lyDo', 'nguon'],
    'issues': ['maPhieu', 'ngay', 'maVT', 'sl', 'lyDo', 'loai'],
    'sales': ['ngay', 'ma', 'sl', 'donGia', 'doanhSo', 'ghiChu', 'hoaDon', 'khach'],
    'subs': ['maTP', 'maNVL', 'maThayThe', 'tuNgay', 'denNgay', 'tyLe', 'ghiChu'],
    'cal': ['ngay', 'loai', 'ghiChu'],
}


def q(v):
    """Giá trị → literal SQL (chuỗi rỗng / None → NULL)."""
    if v is None or v == '':
        return 'NULL'
    if isinstance(v, bool):
        return 'true' if v else 'false'
    if isinstance(v, (int, float)):
        if v != v:  # NaN
            return 'NULL'
        r = repr(round(v, 8)) if isinstance(v, float) else str(v)
        return r[:-2] if r.endswith('.0') else r
    return "'" + str(v).replace("'", "''") + "'"


def num(v):
    try:
        return float(v) if v not in (None, '') else 0.0
    except (TypeError, ValueError):
        return 0.0


def ky_date(k):  # '2026-01' → '2026-01-01'
    return q(k + '-01') if k else 'NULL'


def recs(docs, key, ent):
    d = docs.get(key) or {}
    rows = d.get('rows') if ent != 'adjustments' else d.get('adj')
    return [dict(zip(F[ent], r)) for r in (rows or [])]


def period_keys(docs, pre):
    return sorted(k for k in docs if k.startswith(pre))


def chunks(lst, n=400):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]


def insert_values(out, head, cols, rows, tail):
    """INSERT … SELECT … FROM (VALUES …) v(cols) <tail> – chia lô để tệp không quá dài một dòng."""
    for part in chunks(rows):
        out.append(head + '\nFROM (VALUES\n  ' + ',\n  '.join('(' + ', '.join(r) + ')' for r in part) +
                   f'\n) v({", ".join(cols)})\n' + tail + ';')


def build_seed(docs, ma_ct, ten_ct=None):
    s = dict(docs.get('settings') or {})
    if ten_ct:
        s['company'] = ten_ct
    o = ['-- Sinh tự động bởi database/cong_cu/json_sang_sql.py – không sửa tay',
         'BEGIN;', 'SET search_path TO gia_thanh, public;', '']
    C = f"(SELECT id FROM cong_ty WHERE ma = {q(ma_ct)})"
    JC = f"JOIN cong_ty c ON c.ma = {q(ma_ct)}"
    JH = lambda col, al: f"JOIN hang_hoa {al} ON {al}.cong_ty_id = c.id AND {al}.ma = v.{col}"
    LH = lambda col, al: f"LEFT JOIN hang_hoa {al} ON {al}.cong_ty_id = c.id AND {al}.ma = v.{col}"

    # 1. Công ty
    o.append('-- 1. Công ty')
    o.append('INSERT INTO cong_ty (ma, ten, ky_bat_dau, nam_lam_viec, kt_ma_doi_tuong, kt_ten_doi_tuong, kt_tk_no_xuat_nvl, kt_tk_co_nhap_tp) VALUES (' +
             ', '.join([q(ma_ct), q(s.get('company') or ma_ct), ky_date(s.get('startKy')), q(int(s['workYear']) if s.get('workYear') else None),
                        q(s.get('ktMaDT')), q(s.get('ktTenDT')), q(s.get('ktTkNoXK') or '621'), q(s.get('ktTkCoNK') or '154')]) + ');')

    # Kỳ: mọi tháng có dữ liệu
    kys = set()
    for k in docs:
        m = re.match(r'^[psoic]_(\d{4}-\d{2})$', k)
        if m:
            kys.add(m.group(1))
    if s.get('startKy'):
        kys.add(s['startKy'])
    o.append('INSERT INTO ky (cong_ty_id, ky) VALUES ' + ', '.join(f'({C}, {ky_date(k)})' for k in sorted(kys)) + ';')

    # 2. Nhóm hàng & hàng hóa
    items = recs(docs, 'items', 'items')
    nhoms = list(dict.fromkeys(list(NHOM_ORDER) + [it['nhom'] for it in items if it.get('nhom')]))
    o += ['', '-- 2. Nhóm hàng, hàng hóa',
          'INSERT INTO nhom_hang (cong_ty_id, ten, loai, thu_tu) VALUES ' + ',\n  '.join(
              f"({C}, {q(n)}, {q(NHOM_LOAI.get(n, 'NVL_MUA'))}, {q(NHOM_ORDER.get(n, 9))})" for n in nhoms) + ';']
    insert_values(o, 'INSERT INTO hang_hoa (cong_ty_id, ma, ten, nhom_hang_id, dvt, kho)\nSELECT c.id, v.ma, v.ten, n.id, v.dvt, v.kho',
                  ['ma', 'ten', 'nhom', 'dvt', 'kho'],
                  [[q(it['ma']), q(it['ten'] or it['ma']), q(it['nhom'] or 'Khác'), q(it['dvt'] or ''), q(it['kho'])] for it in items],
                  f"{JC}\nJOIN nhom_hang n ON n.cong_ty_id = c.id AND n.ten = v.nhom")

    # Tồn đầu kỳ
    op = docs.get('opening') or {}
    rows = [[q(r[0]), q(num(r[1])), q(num(r[2])), q(r[3] if len(r) > 3 else None)] for r in op.get('rows') or []]
    if rows:
        o += ['', '-- Tồn đầu kỳ']
        insert_values(o, f"INSERT INTO ton_dau_ky (cong_ty_id, ky, hang_hoa_id, so_luong, gia_tri, kho)\nSELECT c.id, {ky_date(op.get('ky') or s.get('startKy'))}, h.id, v.sl::numeric, v.tt::numeric, v.kho",
                      ['ma', 'sl', 'tt', 'kho'], rows, f"{JC}\n{JH('ma', 'h')}")

    # Định mức (+ NVL thay thế khai trong định mức)
    bom = recs(docs, 'bom', 'bom')
    o += ['', '-- Định mức NVL']
    insert_values(o, 'INSERT INTO dinh_muc (cong_ty_id, loai_dm, san_pham_id, nvl_id, sl_tp_lan, sl_nvl_lan, lan_ngay, hao_hut, hieu_luc_tu, hieu_luc_den, ghi_chu, thu_tu)\n'
                     'SELECT c.id, v.loai, sp.id, nv.id, v.sltp::numeric, v.slnvl::numeric, v.lan::numeric, v.hh::numeric, v.tu::date, v.den::date, v.gc, v.tt::int',
                  ['loai', 'tp', 'nvl', 'sltp', 'slnvl', 'lan', 'hh', 'tu', 'den', 'gc', 'tt'],
                  [[q(b['loai'] or 'DM'), q(b['maTP']), q(b['maNVL']), q(num(b['slTP']) or 1), q(num(b['slNVL'])), q(b['lanNgay'] if b['lanNgay'] not in (0, '') else None),
                    q(num(b['haoHut'])), q(b['tuNgay']), q(b['denNgay']), q(b['ghiChu']), q(i + 1)] for i, b in enumerate(bom)],
                  f"{JC}\n{JH('tp', 'sp')}\n{JH('nvl', 'nv')}")
    subs = [dict(maTP=b['maTP'], maNVL=b['maNVL'], maThayThe=b['maThayThe'], tuNgay=b['tuNgay'], denNgay=b['denNgay'], tyLe=b['tyLe'], ghiChu=b['ghiChu'])
            for b in bom if b.get('maThayThe')] + recs(docs, 'subs', 'subs')
    if subs:
        o += ['', '-- NVL thay thế']
        insert_values(o, 'INSERT INTO nvl_thay_the (cong_ty_id, san_pham_id, nvl_goc_id, nvl_thay_the_id, hieu_luc_tu, hieu_luc_den, ty_le, ghi_chu)\n'
                         'SELECT c.id, sp.id, g.id, t.id, v.tu::date, v.den::date, v.tl::numeric, v.gc',
                      ['tp', 'goc', 'tt', 'tu', 'den', 'tl', 'gc'],
                      [[q(x['maTP']), q(x['maNVL']), q(x['maThayThe']), q(x['tuNgay'] or '2000-01-01'), q(x['denNgay']),
                        q(num(x['tyLe']) or None), q(x['ghiChu'])] for x in subs],
                      f"{JC}\n{LH('tp', 'sp')}\n{JH('goc', 'g')}\n{JH('tt', 't')}")

    # Lịch
    cal = recs(docs, 'cal', 'cal')
    if cal:
        o += ['', '-- Lịch làm việc']
        o.append('INSERT INTO lich_lam_viec (cong_ty_id, ngay, loai, ghi_chu) VALUES\n  ' + ',\n  '.join(
            f"({C}, {q(r['ngay'])}, {q(CAL.get(r['loai'], 'NGHI_LE'))}, {q(r['ghiChu'])})" for r in cal) + '\nON CONFLICT DO NOTHING;')

    # Đối tác
    pur = [r for k in period_keys(docs, 'p_') for r in recs(docs, k, 'purchases')]
    sal = [r for k in period_keys(docs, 's_') for r in recs(docs, k, 'sales')]
    ncc = sorted({str(r['ncc']).strip() for r in pur if str(r.get('ncc') or '').strip()})
    kh = sorted({str(r['khach']).strip() for r in sal if str(r.get('khach') or '').strip()})
    o += ['', '-- 3. Đối tác (chuẩn hóa từ tên NCC / khách hàng trên chứng từ)']
    vals = [f"({C}, 'NCC', {q(n)})" for n in ncc] + [f"({C}, 'KH', {q(n)})" for n in kh]
    if vals:
        o.append('INSERT INTO doi_tac (cong_ty_id, loai, ten) VALUES\n  ' + ',\n  '.join(vals) + ';')

    # Mua hàng
    o += ['', f'-- Mua hàng ({len(pur)} dòng)']
    insert_values(o, 'INSERT INTO mua_hang (cong_ty_id, ngay_nhap_kho, ngay_hoa_don, so_hoa_don, nha_cung_cap_id, ten_nha_cung_cap, hang_hoa_id, so_luong, don_gia, thanh_tien, kho, ghi_chu)\n'
                     'SELECT c.id, v.nn::date, v.nm::date, v.hd, d.id, v.ncc, h.id, v.sl::numeric, v.dg::numeric, v.tt::numeric, v.kho, v.gc',
                  ['nn', 'nm', 'hd', 'ncc', 'ma', 'sl', 'dg', 'tt', 'kho', 'gc'],
                  [[q(r['ngayNhap'] or r['ngayMua']), q(r['ngayMua'] or None), q(str(r['hoaDon']) if r['hoaDon'] not in ('', None) else None),
                    q(str(r['ncc']).strip() if r['ncc'] else None), q(r['ma']), q(num(r['sl'])), q(num(r['donGia']) if r['donGia'] != '' else None),
                    q(num(r['tt'])), q(r['kho']), q(r['ghiChu'])] for r in pur],
                  f"{JC}\n{JH('ma', 'h')}\nLEFT JOIN doi_tac d ON d.cong_ty_id = c.id AND d.loai = 'NCC' AND d.ten = v.ncc")
    o.append(f"""-- Nối dòng tách hóa đơn (✂ Tách) với dòng gốc cùng số HĐ + mã hàng
UPDATE mua_hang m SET tach_tu_id = g.id
FROM mua_hang g
WHERE m.cong_ty_id = {C} AND g.cong_ty_id = m.cong_ty_id AND m.ghi_chu LIKE 'Tách từ dòng%'
  AND g.so_hoa_don = m.so_hoa_don AND g.hang_hoa_id = m.hang_hoa_id AND g.id <> m.id AND g.ghi_chu IS DISTINCT FROM m.ghi_chu;""")

    # Bán hàng
    o += ['', f'-- Bán hàng ({len(sal)} dòng)']
    insert_values(o, 'INSERT INTO ban_hang (cong_ty_id, ngay_hoa_don, so_hoa_don, khach_hang_id, ten_khach_hang, hang_hoa_id, so_luong, don_gia, doanh_so, ghi_chu)\n'
                     'SELECT c.id, v.ng::date, v.hd, d.id, v.kh, h.id, v.sl::numeric, v.dg::numeric, v.ds::numeric, v.gc',
                  ['ng', 'hd', 'kh', 'ma', 'sl', 'dg', 'ds', 'gc'],
                  [[q(r['ngay']), q(str(r['hoaDon']) if r['hoaDon'] not in ('', None) else None), q(str(r['khach']).strip() if r['khach'] else None),
                    q(r['ma']), q(num(r['sl'])), q(num(r['donGia']) if r['donGia'] != '' else None), q(num(r['doanhSo'])), q(r['ghiChu'])] for r in sal],
                  f"{JC}\n{JH('ma', 'h')}\nLEFT JOIN doi_tac d ON d.cong_ty_id = c.id AND d.loai = 'KH' AND d.ten = v.kh")

    # Xuất dùng chung
    iss = [r for k in period_keys(docs, 'i_') for r in recs(docs, k, 'issues')]
    if iss:
        o += ['', f'-- Xuất dùng chung ({len(iss)} phiếu)']
        insert_values(o, 'INSERT INTO xuat_dung_chung (cong_ty_id, so_chung_tu, ngay_xuat, loai, hang_hoa_id, so_luong, ly_do)\n'
                         'SELECT c.id, v.so, v.ng::date, v.loai::loai_xuat_chung, h.id, v.sl::numeric, v.ld',
                      ['so', 'ng', 'ma', 'sl', 'ld', 'loai'],
                      [[q(r['maPhieu']), q(r['ngay']), q(r['maVT']), q(num(r['sl'])), q(r['lyDo']),
                        q('BAN_HANG_641' if re.search(r'641|thử|mẫu|bán hàng|khuyến mãi|tiếp thị|marketing', str(r.get('loai') or ''), re.I) else 'CPSX_627')] for r in iss],
                      f"{JC}\n{JH('ma', 'h')}")

    # Chi phí
    cols = s.get('costCols') if isinstance(s.get('costCols'), list) and s.get('costCols') else COSTCOLS0
    o += ['', '-- Loại chi phí & chi phí tháng',
          'INSERT INTO loai_chi_phi (cong_ty_id, ma, ten, nhom, thu_tu, la_dien) VALUES\n  ' + ',\n  '.join(
              f"({C}, {q(c['k'])}, {q(c['t'])}, {q(c['g'])}, {i + 1}, {q(c['k'] == 'dien')})" for i, c in enumerate(cols)) + ';']
    vals = []
    for k in period_keys(docs, 'c_'):
        for c in cols:
            vals.append([q(k[2:] + '-01'), q(c['k']), q(num(docs[k].get(c['k'])))])
    if vals:
        insert_values(o, 'INSERT INTO chi_phi_thang (cong_ty_id, ky, loai_chi_phi_id, so_tien)\nSELECT c.id, v.ky::date, l.id, v.st::numeric',
                      ['ky', 'ma', 'st'], vals, f"{JC}\nJOIN loai_chi_phi l ON l.cong_ty_id = c.id AND l.ma = v.ma")

    # Lệnh sản xuất & cân đối
    ords = [r for k in period_keys(docs, 'o_') for r in recs(docs, k, 'orders')]
    o += ['', f'-- 4. Lệnh sản xuất ({len(ords)} lệnh)']
    insert_values(o, 'INSERT INTO lenh_san_xuat (cong_ty_id, ma_lenh, ngay_san_xuat, ngay_xuat_nvl, san_pham_id, loai_dm, sl_lenh, dieu_chinh_tp, ghi_chu, khoa_ke_hoach, nguon, sl_de_xuat, sl_goc)\n'
                     'SELECT c.id, v.ml, v.nsx::date, v.nx::date, h.id, v.dm, v.sl::numeric, v.dc::numeric, v.gc, v.kh, v.ng::nguon_lenh, v.dx::numeric, v.goc::numeric',
                  ['ml', 'nsx', 'nx', 'ma', 'dm', 'sl', 'dc', 'gc', 'kh', 'ng', 'dx', 'goc'],
                  [[q(r['maLenh']), q(r['ngaySX']), q(r['ngayXuatNVL'] or r['ngaySX']), q(r['maTP']), q(r['loaiDM'] or 'DM'), q(num(r['slKH'])),
                    q(num(r['dieuChinhTP'])), q(r['ghiChu']), q(r['khoa']), q(NGUON.get(str(r.get('nguon') or ''), 'EXCEL')),
                    q(num(r['slDX']) if r.get('slDX') not in ('', None) else None), q(num(r['slGoc']) if r.get('slGoc') not in ('', None) else None)] for r in ords],
                  f"{JC}\n{JH('ma', 'h')}")
    adj = [r for k in period_keys(docs, 'o_') for r in recs(docs, k, 'adjustments')]
    if adj:
        o += ['', f'-- Cân đối NVL ({len(adj)} dòng)']
        insert_values(o, 'INSERT INTO can_doi_nvl (cong_ty_id, ngay_san_xuat, san_pham_id, nvl_id, so_luong, ly_do, nguon)\n'
                         'SELECT c.id, v.ng::date, sp.id, nv.id, v.sl::numeric, v.ld, v.src::nguon_can_doi',
                      ['ng', 'tp', 'vt', 'sl', 'ld', 'src'],
                      [[q(r['ngaySX']), q(r['maTP']), q(r['maVT']), q(num(r['dieuChinh'])), q(r['lyDo']), q('PM' if r.get('nguon') == 'PM' else 'TAY')] for r in adj],
                      f"{JC}\n{JH('tp', 'sp')}\n{JH('vt', 'nv')}")

    # 5. Thiết lập
    al = s.get('alloc') or {}
    o += ['', '-- 5. Thiết lập & quy tắc',
          f"INSERT INTO quy_tac_phan_bo (cong_ty_id, ty_le_cd1_622, ty_le_cd1_627) VALUES ({C}, {q(num(al.get('cd1_622', 0.8)))}, {q(num(al.get('cd1_627', 1)))});"]
    ar = [r for r in al.get('rows') or [] if r.get('cd') == 1]
    if ar:
        insert_values(o, 'INSERT INTO phan_bo_san_pham (cong_ty_id, san_pham_id, ty_le_622, ty_le_627)\nSELECT c.id, h.id, v.a::numeric, v.b::numeric',
                      ['ma', 'a', 'b'], [[q(r['ma']), q(num(r.get('t622'))), q(num(r.get('t627')))] for r in ar], f"{JC}\n{JH('ma', 'h')}")
    ng = s.get('nguong') or []
    item_codes = {it['ma'] for it in items}
    rev = {v: k for k, v in NHOM_KEY.items()}
    ng_nhom, ng_ma = [], []
    for r in ng:
        key = str(r.get('key') or '')
        base = key[:-7] if key.endswith(' (Ngày)') else key
        row = [q(num(r.get('max')) or None), q(num(r.get('min')) or None), q(r.get('ghiChu'))]
        if base in item_codes:
            ng_ma.append([q(base)] + row)
        else:
            ng_nhom.append([q(rev.get(key, key))] + row)
    if ng_nhom:
        insert_values(o, 'INSERT INTO nguong_ton_kho (cong_ty_id, nhom_hang_id, ngay_rui_ro, ngay_toi_thieu, ghi_chu)\nSELECT c.id, n.id, v.mx::numeric, v.mn::numeric, v.gc',
                      ['nhom', 'mx', 'mn', 'gc'], ng_nhom, f"{JC}\nJOIN nhom_hang n ON n.cong_ty_id = c.id AND n.ten = v.nhom")
    if ng_ma:
        insert_values(o, 'INSERT INTO nguong_ton_kho (cong_ty_id, hang_hoa_id, ngay_rui_ro, ngay_toi_thieu, ghi_chu)\nSELECT c.id, h.id, v.mx::numeric, v.mn::numeric, v.gc',
                      ['ma', 'mx', 'mn', 'gc'], ng_ma, f"{JC}\n{JH('ma', 'h')}")
    g = s.get('giaNg') or {}
    o.append(f"INSERT INTO nguong_chenh_lech_gia (cong_ty_id, mua_vang, mua_do, ban_vang, ban_do) VALUES ({C}, {q(num(g.get('muaV', 0.10)) or 0.10)}, {q(num(g.get('muaD', 0.30)) or 0.30)}, {q(num(g.get('banV', 0.05)) or 0.05)}, {q(num(g.get('banD', 0.20)) or 0.20)});")
    sl = s.get('spLoi') or []
    if sl:
        insert_values(o, 'INSERT INTO quy_tac_san_pham_loi (cong_ty_id, san_pham_id, san_pham_loi_id, ty_le_loi, gia_ban_uoc_tinh, ap_dung_tu_ky, ghi_chu)\n'
                         'SELECT c.id, sp.id, l.id, v.tl::numeric, v.gia::numeric, v.tu::date, v.gc',
                      ['sp', 'loi', 'tl', 'gia', 'tu', 'gc'],
                      [[q(r['maSP']), q(r['maLoi']), q(num(r.get('tyLe'))), q(num(r.get('gia'))), q((r.get('tuKy') + '-01') if r.get('tuKy') else None), q(r.get('ghiChu'))] for r in sl],
                      f"{JC}\n{JH('sp', 'sp')}\n{JH('loi', 'l')}")
    pp = s.get('planPrm') or {}
    khac = {k: v for k, v in pp.items() if k not in ('bqDays', 'maxDays', 'minDays', 'giam', 'nlRate', 'nlUoc', 'nlMa')}
    o.append('INSERT INTO tham_so_de_xuat (cong_ty_id, so_ngay_bq_ban, ton_toi_da_ngay, ton_an_toan_ngay, giam_toi_da, ty_le_nang_luong, san_pham_nang_luong_id, tham_so_khac) VALUES (' +
             ', '.join([C, q(int(num(pp.get('bqDays')) or 30)), q(num(pp.get('maxDays')) or 15), q(num(pp.get('minDays')) or 1), q(num(pp.get('giam')) or 0.15),
                        q(num(pp.get('nlRate')) or None), f"(SELECT id FROM hang_hoa WHERE cong_ty_id = {C} AND ma = {q(pp.get('nlMa') or 'BTP_BGKT')})",
                        q(json.dumps(khac, ensure_ascii=False)) + '::jsonb']) + ');')
    nl = pp.get('nlUoc') or {}
    if nl:
        o.append('INSERT INTO uoc_tinh_nang_luong (cong_ty_id, ky, so_tien) VALUES ' + ', '.join(f"({C}, {ky_date(k)}, {q(num(v))})" for k, v in sorted(nl.items()) if num(v)) + ';')

    # Khóa kỳ / đã đề xuất – cập nhật sau cùng (trigger chặn ghi vào kỳ đã khóa)
    for k in s.get('locked') or []:
        o.append(f"UPDATE ky SET da_khoa = true, khoa_luc = now() WHERE cong_ty_id = {C} AND ky = {ky_date(k)};")
    for k in s.get('daDeXuat') or []:
        o.append(f"UPDATE ky SET da_de_xuat = true WHERE cong_ty_id = {C} AND ky = {ky_date(k)};")
    o += ['', 'COMMIT;', '']
    return '\n'.join(o)


def build_results(kq, ma_ct, ghi_chu):
    C = f"(SELECT id FROM cong_ty WHERE ma = {q(ma_ct)})"
    JC = f"JOIN cong_ty c ON c.ma = {q(ma_ct)}"
    L = '(SELECT id FROM _lt)'
    ks = [p['ky'] for p in kq['periods']]
    o = ['-- Sinh tự động bởi database/cong_cu/json_sang_sql.py (--ket-qua) – kết quả 1 lần bấm "▶ Tính giá thành"',
         'BEGIN;', 'SET search_path TO gia_thanh, public;',
         f'UPDATE lan_tinh SET la_hien_hanh = false WHERE cong_ty_id = {C} AND la_hien_hanh;',
         'CREATE TEMP TABLE _lt ON COMMIT DROP AS WITH x AS (',
         f"  INSERT INTO lan_tinh (cong_ty_id, ky_tu, ky_den, thoi_gian_ms, phien_ban_pm, ghi_chu) VALUES ({C}, {ky_date(ks[0])}, {ky_date(ks[-1])}, {q(kq.get('ms'))}, 'artifact index.html', {q(ghi_chu)}) RETURNING id",
         ') SELECT id FROM x;', '']
    o.append('INSERT INTO kq_ky (lan_tinh_id, ky, chi_phi_622, chi_phi_627, gas_627, chi_641, sum_621, sum_622, sum_627, sum_154, thu_hoi_sp_loi, chua_phan_bo_622, chua_phan_bo_627, sl_tp, sl_btp, doanh_so, lai_gop, ton_cuoi) VALUES\n  ' +
             ',\n  '.join('(' + ', '.join([L, ky_date(p['ky'])] + [q(round(num(p[k]), 2)) for k in
                                                                    ('c622', 'c627', 'gas', 'chi641', 'sum621', 'sum622', 'sum627', 'sum154', 'thuHoi', 'un622', 'un627')] +
                                       [q(num(p['slSX'])), q(num(p['slBTP']))] + [q(round(num(p[k]), 2)) for k in ('doanhSo', 'lai', 'tonCuoi')]) + ')' for p in kq['periods']) + ';')
    insert_values(o, 'INSERT INTO kq_lenh_san_xuat (lan_tinh_id, lenh_id, ky, cong_doan, sl_thuc_hien, so_me, sl_loi, sl_dat, c621, c622, c627, c154, thu_hoi_sp_loi, gia_thanh_nhap_kho, gia_thanh_dv, tinh_trang)\n'
                     f'SELECT {L}, l.id, v.ky::date, v.cd::cong_doan, v.th::numeric, v.me::numeric, v.loi::numeric, v.dat::numeric, v.a::numeric, v.b::numeric, v.c::numeric, v.d::numeric, v.thu::numeric, v.nk::numeric, v.dv::numeric, v.st',
                  ['ml', 'ky', 'cd', 'th', 'me', 'loi', 'dat', 'a', 'b', 'c', 'd', 'thu', 'nk', 'dv', 'st'],
                  [[q(r['maLenh']), q(r['ky'] + '-01'), q(r['cd']), q(num(r['slTH'])), q(r['soMe']), q(num(r['slLoi'])), q(num(r['slDat'])),
                    q(round(num(r['c621']), 4)), q(round(num(r['c622']), 4)), q(round(num(r['c627']), 4)), q(round(num(r['c154']), 4)),
                    q(round(num(r['thuHoi']), 4)), q(round(num(r['gtNhap']), 4)), q(round(num(r['gtdv']), 6) if r['gtdv'] is not None else None), q(r['status'] or 'Đủ')] for r in kq['orders']],
                  f"{JC}\nJOIN lenh_san_xuat l ON l.cong_ty_id = c.id AND l.ma_lenh = v.ml")
    insert_values(o, 'INSERT INTO kq_xuat_nvl (lan_tinh_id, lenh_id, nvl_id, la_thay_the, dinh_muc, me_sl, sl_theo_dm, can_doi, tong_sl, don_gia, c621, c622, c627, c154, ton_cuoi_ngay)\n'
                     f'SELECT {L}, l.id, h.id, v.tt::boolean, v.dm::numeric, v.me::numeric, v.sdm::numeric, v.dc::numeric, v.tong::numeric, v.dg::numeric, v.a::numeric, v.b::numeric, v.c::numeric, v.d::numeric, v.ton::numeric',
                  ['ml', 'vt', 'tt', 'dm', 'me', 'sdm', 'dc', 'tong', 'dg', 'a', 'b', 'c', 'd', 'ton'],
                  [[q(r['maLenh']), q(r['maVT']), q(bool(r['thayThe'])), q(r['dm']), q(r['soMe']), q(r['slDM']), q(r['dc']), q(num(r['tong'])), q(num(r['dg'])),
                    q(round(num(r['tt']), 4)), q(round(num(r['c622']), 4)), q(round(num(r['c627']), 4)), q(round(num(r['c154']), 4)), q(r['tonNgay'])] for r in kq['lines']],
                  f"{JC}\nJOIN lenh_san_xuat l ON l.cong_ty_id = c.id AND l.ma_lenh = v.ml\nJOIN hang_hoa h ON h.cong_ty_id = c.id AND h.ma = v.vt")
    insert_values(o, 'INSERT INTO kq_nxt (lan_tinh_id, ky, hang_hoa_id, gia_von, ton_dau_sl, ton_dau_tt, nhap_sl, nhap_tt, xuat_sl, xuat_tt, ton_cuoi_sl, ton_cuoi_tt, don_gia_bq_mua, bq_ngay, so_ngay_con_dung, can_lay_15_ngay, phan_loai, trang_thai)\n'
                     f'SELECT {L}, v.ky::date, h.id, v.gv::numeric, v.a::numeric, v.b::numeric, v.c::numeric, v.d::numeric, v.e::numeric, v.f::numeric, v.g::numeric, v.h::numeric, v.pbq::numeric, v.bq::numeric, v.days::numeric, v.can::numeric, v.pl::phan_loai_rui_ro, v.st',
                  ['ky', 'ma', 'gv', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'pbq', 'bq', 'days', 'can', 'pl', 'st'],
                  [[q(r['ky'] + '-01'), q(r['ma']), q(r['gv']), q(num(r['openSL'])), q(round(num(r['openTT']), 4)), q(num(r['nhapSL'])), q(round(num(r['nhapTT']), 4)),
                    q(num(r['xuatSL'])), q(round(num(r['xuatTT']), 4)), q(num(r['closeSL'])), q(round(num(r['closeTT']), 4)), q(r['pBQ']), q(r['bq']),
                    q(r['days'] if isinstance(r['days'], (int, float)) and abs(r['days']) < 1e12 else None), q(r['can15']),
                    q(RISK.get(r['risk'], 'OK')), q(r['status'])] for r in kq['nxt']],
                  f"{JC}\nJOIN hang_hoa h ON h.cong_ty_id = c.id AND h.ma = v.ma")
    if kq.get('warnings'):
        o.append('INSERT INTO kq_canh_bao (lan_tinh_id, loai, ma, noi_dung) VALUES\n  ' + ',\n  '.join(
            f"({L}, {q(w.get('loai') or 'Khác')}, {q(w.get('ma'))}, {q(w.get('nd') or '')})" for w in kq['warnings']) + ';')
    o += ['', 'COMMIT;', '']
    return '\n'.join(o)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('sao_luu')
    ap.add_argument('ra_seed')
    ap.add_argument('--ma-cong-ty', default='TH')
    ap.add_argument('--ten-cong-ty', help='ghi đè tên công ty trong tệp sao lưu')
    ap.add_argument('--ket-qua')
    ap.add_argument('--ra-ket-qua')
    ap.add_argument('--ghi-chu', default='')
    a = ap.parse_args()
    docs = json.load(open(a.sao_luu, encoding='utf-8'))
    if isinstance(docs, dict) and 'docs' in docs and isinstance(docs['docs'], dict):
        docs = docs['docs']
    open(a.ra_seed, 'w', encoding='utf-8').write(build_seed(docs, a.ma_cong_ty, a.ten_cong_ty))
    print('seed →', a.ra_seed)
    if a.ket_qua and a.ra_ket_qua:
        kq = json.load(open(a.ket_qua, encoding='utf-8'))
        open(a.ra_ket_qua, 'w', encoding='utf-8').write(build_results(kq, a.ma_cong_ty, a.ghi_chu))
        print('kết quả →', a.ra_ket_qua)
