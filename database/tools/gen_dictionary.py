#!/usr/bin/env python3
"""Sinh docs/DATA_DICTIONARY.md từ chú thích trong migrations/0001_init.sql."""
import re, os
here = os.path.dirname(os.path.abspath(__file__))
sql = open(os.path.join(here, '../migrations/0001_init.sql'), encoding='utf8').read().split('\n')
out = ['# Từ điển dữ liệu – schema `giathanh`', '',
       'Sinh tự động từ `migrations/0001_init.sql` bằng `tools/gen_dictionary.py` (không sửa tay). Cột "Trường trong phần mềm" là khóa/field của bản mockup artifact (`artifact/index.html`).', '']
sect = ''; i = 0
while i < len(sql):
    l = sql[i]
    m = re.match(r'^-- (\d\. .+)$', l)
    if m: sect = m.group(1)
    t = re.match(r'^CREATE TABLE (\w+) \(', l)
    if t:
        # mô tả bảng: dòng chú thích gần nhất phía trên, bỏ dòng "=====" và dòng trống
        j = i - 1; desc = ''
        while j >= 0 and sql[j].startswith('--') and not sql[j].startswith('-- ==') :
            desc = sql[j][3:].strip() + (' ' + desc if desc else ''); j -= 1
        if sect:
            out += ['', f'## {sect}']; sect = ''
        out += ['', f'### `{t.group(1)}`', '', desc, '', '| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |', '|---|---|---|---|']
        i += 1
        extra = []
        while not sql[i].startswith(');'):
            ln = sql[i]; i += 1
            body, _, cm = ln.partition('--')
            body = body.strip().rstrip(',')
            if not body: continue
            if re.match(r'^(PRIMARY KEY|FOREIGN KEY|UNIQUE|CHECK)', body):
                extra.append(body + (f'  ({cm.strip()})' if cm.strip() else '')); continue
            c = re.match(r'^(\w+)\s+(.*)$', body)
            if not c: continue
            rest = c.group(2)
            ty = re.match(r'^([a-z]+(?:\(\d+(?:,\d+)?\))?(?: with time zone)?)\s*(.*)$', rest, re.I)
            typ, cons = (ty.group(1), ty.group(2)) if ty else (rest, '')
            out.append(f'| `{c.group(1)}` | {typ} | {cons.replace("|", "/")} | {cm.strip()} |')
        if extra: out += ['', 'Khóa / ràng buộc bảng: ' + '; '.join(f'`{e.split("  (")[0]}`' for e in extra)]
    i += 1
out += ['', '## Ánh xạ từ kho dữ liệu `gt` của phần mềm sang bảng', '',
        '| Tài liệu trong kho `gt` | Bảng |', '|---|---|',
        '| `settings` | `company`, `company_setting`, `cost_column`, `risk_threshold`, `period_lock` |',
        '| `items` | `item` |', '| `bom` | `bom_line` |', '| `subs` | `material_substitution` |', '| `caps` | `production_capacity` |',
        '| `opening` | `opening_balance` |', '| `p_YYYY-MM` | `purchase` |', '| `s_YYYY-MM` | `sale` |', '| `k_YYYY-MM` | `production_plan` |',
        '| `o_YYYY-MM` (rows) | `production_order` |', '| `o_YYYY-MM` (adj) | `order_material_adjustment` |',
        '| `i_YYYY-MM` | `common_issue` |', '| `c_YYYY-MM` | `period_cost` (mỗi cột chi phí một dòng) |', '| `h_YYYY` | `work_calendar` |',
        '| (tính lại khi mở phần mềm) | `cost_run`, `cost_order_result`, `cost_material_line`, `inventory_result` |', '',
        '## Quy đổi giá trị', '',
        '| Phần mềm | Cơ sở dữ liệu |', '|---|---|',
        '| Loại lịch `Nghỉ lễ / công ty` / `Nghỉ chờ việc` / `Tăng ca` | `work_calendar.kind` = `HOLIDAY` / `STANDBY` / `OVERTIME` |',
        '| Loại xuất `Dùng chung SX (627)` / `Thử nghiệm (641)` | `common_issue.issue_type` = `627` / `641` |',
        '| Kỳ `YYYY-MM` (tháng của ngày nhập kho / ngày hóa đơn / ngày xuất NVL / ngày SX) | không lưu cột kỳ ở bảng phát sinh, lấy từ cột ngày; bảng theo kỳ dùng `period char(7)` |',
        '| Đơn giá bán = doanh số ÷ SL | `sale.unit_price` là cột sinh tự động |', '']
open(os.path.join(here, '../docs/DATA_DICTIONARY.md'), 'w', encoding='utf8').write('\n'.join(out))
print('ok', len(out), 'dòng')
