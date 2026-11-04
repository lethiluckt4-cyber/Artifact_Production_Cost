#!/usr/bin/env python3
"""Chuyển file sao lưu của phần mềm (toDocs) thành SQL nạp vào schema giathanh.

Cách dùng:
  python3 build_seed_sql.py [sao_luu.json] [ra.sql] [ma_cong_ty]
Mặc định: ../../data/SaoLuu_GiaThanh_ThaoVy_demo_2026-10.json -> ../seed/demo_thao_vy.sql, THAOVY
"""
import json, sys, os, re

here = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(here, '../../data/SaoLuu_GiaThanh_ThaoVy_demo_2026-10.json')
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(here, '../seed/demo_thao_vy.sql')
ccode = sys.argv[3] if len(sys.argv) > 3 else 'THAOVY'
docs = json.load(open(src, encoding='utf8'))
CID = 1

COSTCOLS0 = [('c622', '622 Nhân công', '622'), ('c6273', '6273 Dụng cụ', '627'), ('c6274', '6274 Khấu hao', '627'),
             ('dien', 'Điện', '627'), ('nuoc', 'Nước', '627'), ('khac', 'Chi phí khác', '627')]
RISK0 = {'giamua': (1, 5), 'giaban': (1, 5), 'sxban': (1.15, 1.30), 'tonTP': (45, 60), 'cp627': (3500, 5000),
         'gvdt': (0.90, 1.00), 'banlo': (1, 5), 'tpam': (1, 1), 'cpchua': (1, 1), 'maam': (1, 1), 'nvlam': (1, 10)}
CAL = {'Nghỉ lễ / công ty': 'HOLIDAY', 'Nghỉ chờ việc': 'STANDBY', 'Tăng ca': 'OVERTIME'}
ISSUE = {'Dùng chung SX (627)': '627', 'Thử nghiệm (641)': '641'}


def q(v):
    if v is None or v == '': return 'NULL'
    return "'" + str(v).replace("'", "''") + "'"


def n(v, d=0):
    if v is None or v == '': return str(d)
    try: return repr(round(float(v), 6)).replace('e-05', 'e-5')
    except Exception: return str(d)


def dt(v): return q(v) if v else 'NULL'


def block(table, cols, rows, size=200):
    if not rows: return ''
    s = []
    for i in range(0, len(rows), size):
        s.append(f"INSERT INTO {table} ({', '.join(cols)}) VALUES\n  " + ',\n  '.join(rows[i:i + size]) + ';\n')
    return '\n'.join(s) + '\n'


st = docs.get('settings', {})
o = []
o.append(f"-- Dữ liệu demo sinh từ {os.path.basename(src)} bằng tools/build_seed_sql.py – KHÔNG sửa tay.\n"
         "SET search_path = giathanh, public;\nBEGIN;\n")
o.append(f"INSERT INTO company (id, code, name) VALUES ({CID}, {q(ccode)}, {q(st.get('company') or ccode)});\n"
         f"SELECT setval(pg_get_serial_sequence('giathanh.company','id'), {CID});\n")
o.append("INSERT INTO company_setting (company_id, start_period, work_year, sunday_off, alloc_basis_622, alloc_basis_627, "
         "stale_days, reserve_days, ignore_days, misa_partner_code, misa_partner_name, misa_debit_issue, misa_credit_recv, holidays_2026_seeded) VALUES "
         f"({CID}, {q(st.get('startKy'))}, {n(st.get('workYear')) if st.get('workYear') else 'NULL'}, "
         f"{'false' if st.get('nghiCN') is False else 'true'}, {q(st.get('pb622') or st.get('pbBasis') or 'kg')}, {q(st.get('pb627') or st.get('pbBasis') or 'kg')}, "
         f"{n(st['tonLau']) if st.get('tonLau') not in (None, '') else 'NULL'}, {n(st['duPhong']) if st.get('duPhong') not in (None, '') else 'NULL'}, "
         f"{n(st['boQua']) if st.get('boQua') not in (None, '') else 'NULL'}, {q(st.get('ktMaDT'))}, {q(st.get('ktTenDT'))}, {q(st.get('ktTkNoXK'))}, {q(st.get('ktTkCoNK'))}, "
         f"{'true' if st.get('holSeed2026') else 'false'});\n")

cc = [(c['k'], c['t'], c['g']) for c in st['costCols']] if st.get('costCols') else COSTCOLS0
o.append(block('cost_column', ['company_id', 'code', 'label', 'account_grp', 'sort_order'],
               [f"({CID}, {q(k)}, {q(t)}, {q(g)}, {i})" for i, (k, t, g) in enumerate(cc)]))
risk = st.get('risk') or {}
o.append(block('risk_threshold', ['company_id', 'risk_key', 'warn_value', 'high_value'],
               [f"({CID}, {q(k)}, {n(risk.get(k, {}).get('cb', v[0]))}, {n(risk.get(k, {}).get('cao', v[1]))})" for k, v in RISK0.items()]))
o.append(block('period_lock', ['company_id', 'period'], [f"({CID}, {q(p)})" for p in st.get('locked', [])]))

items = docs.get('items', {}).get('rows', [])
o.append(block('item', ['company_id', 'code', 'name', 'group_code', 'uom', 'warehouse'],
               [f"({CID}, {q(r[0])}, {q(r[1])}, {q(r[2])}, {q(r[3])}, {q(r[4] if len(r) > 4 else None)})" for r in items]))
codes = {r[0] for r in items}

orph = set()


def chk(*cs):
    for c in cs:
        if c and c not in codes: orph.add(c)


bom = []
for r in docs.get('bom', {}).get('rows', []):
    r = list(r) + [''] * (12 - len(r)); chk(r[1], r[2], r[7])
    bom.append(f"({CID}, {q(r[0] or 'DM')}, {q(r[1])}, {q(r[2])}, {n(r[3])}, {n(r[4])}, {n(r[5])}, {n(r[6])}, {q(r[7])}, {dt(r[8])}, {dt(r[9])}, {n(r[10])}, {q(r[11])})")
o.append(block('bom_line', ['company_id', 'bom_type', 'product_code', 'material_code', 'product_qty', 'material_qty', 'runs_per_day', 'loss_pct',
                            'substitute_code', 'valid_from', 'valid_to', 'substitute_ratio', 'note'], bom))
subs = []
for r in docs.get('subs', {}).get('rows', []):
    r = list(r) + [''] * (7 - len(r)); chk(r[0], r[1], r[2])
    subs.append(f"({CID}, {q(r[0])}, {q(r[1])}, {q(r[2])}, {dt(r[3])}, {dt(r[4])}, {n(r[5], 1)}, {q(r[6])})")
o.append(block('material_substitution', ['company_id', 'product_code', 'material_code', 'substitute_code', 'valid_from', 'valid_to', 'ratio', 'note'], subs))
caps = []
for r in docs.get('caps', {}).get('rows', []):
    r = list(r) + [''] * (6 - len(r)); chk(r[0])
    caps.append(f"({CID}, {q(r[0])}, {dt(r[1])}, {dt(r[2])}, {n(r[3]) if r[3] != '' else 'NULL'}, {n(r[4]) if r[4] != '' else 'NULL'}, {q(r[5])})")
o.append(block('production_capacity', ['company_id', 'product_code', 'valid_from', 'valid_to', 'runs_per_day', 'runs_per_month', 'note'], caps))

op = docs.get('opening', {})
orows = []
for r in op.get('rows', []):
    r = list(r) + [''] * (4 - len(r)); chk(r[0])
    orows.append(f"({CID}, {q(op.get('ky'))}, {q(r[0])}, {n(r[1])}, {n(r[2])}, {q(r[3])})")
o.append(block('opening_balance', ['company_id', 'period', 'item_code', 'qty', 'amount', 'warehouse'], orows))

cal = []
for k in sorted(docs):
    if k.startswith('h_'):
        for r in docs[k]['rows']: cal.append(f"({CID}, {q(r[0])}, {q(CAL[r[1]])}, {q(r[2] if len(r) > 2 else None)})")
o.append(block('work_calendar', ['company_id', 'day', 'kind', 'note'], cal))

pur, sal, plan, iss, ords, adj, costs = [], [], [], [], [], [], []
for k in sorted(docs):
    v = docs[k]
    if k.startswith('p_'):
        for r in v['rows']:
            r = list(r) + [''] * (10 - len(r)); chk(r[4])
            pur.append(f"({CID}, {dt(r[0])}, {dt(r[1])}, {q(r[2])}, {q(r[3])}, {q(r[4])}, {n(r[5])}, {n(r[6])}, {n(r[7])}, {q(r[8])}, {q(r[9])})")
    elif k.startswith('s_'):
        for r in v['rows']:
            r = list(r) + [''] * (6 - len(r)); chk(r[1])
            sal.append(f"({CID}, {dt(r[0])}, {q(r[1])}, {n(r[2])}, {n(r[4])}, {q(r[5])})")
    elif k.startswith('k_'):
        for r in v['rows']:
            r = list(r) + [''] * (4 - len(r)); chk(r[1])
            plan.append(f"({CID}, {dt(r[0])}, {q(r[1])}, {n(r[2])}, {q(r[3])})")
    elif k.startswith('i_'):
        for r in v['rows']:
            r = list(r) + [''] * (6 - len(r)); chk(r[2])
            iss.append(f"({CID}, {q(r[0])}, {dt(r[1])}, {q(r[2])}, {n(r[3])}, {q(ISSUE.get(r[5], '627'))}, {q(r[4])})")
    elif k.startswith('o_'):
        for r in v['rows']:
            r = list(r) + [''] * (9 - len(r)); chk(r[3])
            ords.append(f"({CID}, {q(r[0])}, {dt(r[1])}, {dt(r[2])}, {q(r[3])}, {q(r[4] or 'DM')}, {n(r[5])}, {n(r[6])}, {n(r[8])}, {q(r[7])})")
        for r in v.get('adj', []):
            r = list(r) + [''] * (4 - len(r)); chk(r[1])
            adj.append(f"({CID}, (SELECT id FROM production_order WHERE company_id={CID} AND order_code={q(r[0])}), {q(r[1])}, {n(r[2])}, {q(r[3])})")
    elif k.startswith('c_'):
        for ck, amt in v.items():
            if ck != 'ky' and any(ck == c[0] for c in cc) and float(amt or 0) != 0:
                costs.append(f"({CID}, {q(k[2:])}, {q(ck)}, {n(amt)})")

o.append(block('purchase', ['company_id', 'receipt_date', 'invoice_date', 'invoice_no', 'supplier', 'item_code', 'qty', 'unit_price', 'amount', 'warehouse', 'note'], pur))
o.append(block('sale', ['company_id', 'invoice_date', 'item_code', 'qty', 'revenue', 'note'], sal))
o.append(block('production_plan', ['company_id', 'production_date', 'product_code', 'batches', 'note'], plan))
o.append(block('common_issue', ['company_id', 'voucher_no', 'issue_date', 'item_code', 'qty', 'issue_type', 'reason'], iss))
o.append(block('production_order', ['company_id', 'order_code', 'material_issue_date', 'production_date', 'product_code', 'bom_type', 'planned_batches',
                                    'batch_adjustment', 'proposed_batches', 'note'], ords))
o.append(block('order_material_adjustment', ['company_id', 'order_id', 'item_code', 'adjustment_qty', 'reason'], adj))
o.append(block('period_cost', ['company_id', 'period', 'cost_code', 'amount'], costs))
o.append('COMMIT;\n')
open(out, 'w', encoding='utf8').write('\n'.join(x for x in o if x))
print('đã ghi', out, '| mã không có trong danh mục:', sorted(orph) or 'không có')
print({'items': len(items), 'bom': len(bom), 'purchase': len(pur), 'sale': len(sal), 'order': len(ords), 'adj': len(adj), 'plan': len(plan), 'cost': len(costs), 'cal': len(cal)})
