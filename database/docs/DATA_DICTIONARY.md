# Từ điển dữ liệu – schema `giathanh`

Sinh tự động từ `migrations/0001_init.sql` bằng `tools/gen_dictionary.py` (không sửa tay). Cột "Trường trong phần mềm" là khóa/field của bản mockup artifact (`artifact/index.html`).


## 1. CÔNG TY VÀ THIẾT LẬP

### `company`



| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `code` | text | NOT NULL UNIQUE | mã ngắn: THAOVY, THIENHONG... |
| `name` | text | NOT NULL | settings.company |
| `created_at` | timestamptz | NOT NULL DEFAULT now() |  |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() |  |

### `company_setting`

Thiết lập chung của công ty (doc `settings`)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `company_id` | bigint | PRIMARY KEY REFERENCES company(id) ON DELETE CASCADE |  |
| `start_period` | char(7) | CHECK (start_period ~ '^\d{4}-\d{2}$') | startKy: kỳ bắt đầu tính giá thành |
| `work_year` | smallint |  | workYear: năm làm việc |
| `sunday_off` | boolean | NOT NULL DEFAULT true | nghiCN: nghỉ Chủ nhật cố định |
| `alloc_basis_622` | text | NOT NULL DEFAULT 'kg' CHECK (alloc_basis_622 IN ('kg','nvl')) | pb622: phân bổ theo kg hoặc theo 621 |
| `alloc_basis_627` | text | NOT NULL DEFAULT 'kg' CHECK (alloc_basis_627 IN ('kg','nvl')) | pb627 |
| `stale_days` | numeric(10,2) |  | tonLau: số ngày tồn lâu (đề xuất SX) |
| `reserve_days` | numeric(10,2) |  | duPhong: số ngày dự phòng |
| `ignore_days` | numeric(10,2) |  | boQua: bỏ qua |
| `misa_partner_code` | text |  | ktMaDT: mã đối tượng (NV_DMT) |
| `misa_partner_name` | text |  | ktTenDT |
| `misa_debit_issue` | text |  | ktTkNoXK: TK nợ phiếu xuất (621) |
| `misa_credit_recv` | text |  | ktTkCoNK: TK có phiếu nhập (154) |
| `holidays_2026_seeded` | boolean | NOT NULL DEFAULT false | holSeed2026 |
| `extra` | jsonb | NOT NULL DEFAULT '{}'::jsonb | thiết lập khác chưa tách cột |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() |  |

### `cost_column`

Cột chi phí 622 / 627 do người dùng tự thêm (settings.costCols)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `code` | text | NOT NULL | k: c622, c6273, c6274, dien, nuoc, khac... |
| `label` | text | NOT NULL | t |
| `account_grp` | text | NOT NULL CHECK (account_grp IN ('622','627')) | g |
| `sort_order` | smallint | NOT NULL DEFAULT 0 |  |

Khóa / ràng buộc bảng: `PRIMARY KEY (company_id, code)`

### `risk_threshold`

Ngưỡng cảnh báo / rủi ro cao (settings.risk)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `risk_key` | text | NOT NULL | giamua, giaban, sxban, tonTP, cp627, gvdt, banlo, tpam, cpchua, maam, nvlam |
| `warn_value` | numeric(18,4) |  | cb |
| `high_value` | numeric(18,4) |  | cao |

Khóa / ràng buộc bảng: `PRIMARY KEY (company_id, risk_key)`

### `period_lock`

Khóa kỳ (settings.locked[])

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `period` | char(7) | NOT NULL CHECK (period ~ '^\d{4}-\d{2}$') |  |
| `locked_at` | timestamptz | NOT NULL DEFAULT now() |  |
| `locked_by` | text |  |  |

Khóa / ràng buộc bảng: `PRIMARY KEY (company_id, period)`

### `work_calendar`

Lịch nghỉ lễ / nghỉ chờ việc / tăng ca (docs h_YYYY)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `day` | date | NOT NULL | ngay |
| `kind` | text | NOT NULL CHECK (kind IN ('HOLIDAY','STANDBY','OVERTIME')) |  |
| `note` | text |  | ghiChu |

Khóa / ràng buộc bảng: `PRIMARY KEY (company_id, day)`

## 2. DỮ LIỆU NỀN

### `item_group`



| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `code` | text | PRIMARY KEY | đúng giá trị NHOM của phần mềm |
| `name` | text | NOT NULL |  |
| `is_finished` | boolean | NOT NULL DEFAULT false | true = Thành phẩm |

### `item`

Danh mục hàng hóa (doc `items`)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `code` | text | NOT NULL | ma |
| `name` | text | NOT NULL | ten |
| `group_code` | text | NOT NULL REFERENCES item_group(code) | nhom |
| `uom` | text | NOT NULL | dvt |
| `warehouse` | text |  | kho (TK kho: 152, 155...) |
| `created_at` | timestamptz | NOT NULL DEFAULT now() |  |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() |  |

Khóa / ràng buộc bảng: `PRIMARY KEY (company_id, code)`

### `bom_line`

Định mức NVL (doc `bom`)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `bom_type` | text | NOT NULL DEFAULT 'DM' | loai: loại định mức |
| `product_code` | text | NOT NULL | maTP |
| `material_code` | text | NOT NULL | maNVL |
| `product_qty` | numeric(18,4) | NOT NULL DEFAULT 0 | slTP: SL thành phẩm / lần |
| `material_qty` | numeric(18,6) | NOT NULL DEFAULT 0 | slNVL: SL NVL / lần |
| `runs_per_day` | numeric(18,4) | NOT NULL DEFAULT 0 | lanNgay: mẻ / ngày (năng lực mặc định) |
| `loss_pct` | numeric(18,6) | NOT NULL DEFAULT 0 | haoHut |
| `substitute_code` | text |  | maThayThe |
| `valid_from` | date |  | tuNgay |
| `valid_to` | date |  | denNgay |
| `substitute_ratio` | numeric(9,6) | NOT NULL DEFAULT 0 | tyLe |
| `note` | text |  | ghiChu |
| `created_at` | timestamptz | NOT NULL DEFAULT now() |  |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() |  |

Khóa / ràng buộc bảng: `FOREIGN KEY (company_id, product_code)  REFERENCES item(company_id, code)`; `FOREIGN KEY (company_id, material_code) REFERENCES item(company_id, code)`; `FOREIGN KEY (company_id, substitute_code) REFERENCES item(company_id, code)`; `CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)`

### `material_substitution`

NVL thay thế theo thời kỳ (doc `subs`)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `product_code` | text |  | maTP (NULL = mọi thành phẩm) |
| `material_code` | text | NOT NULL | maNVL gốc |
| `substitute_code` | text | NOT NULL | maThayThe |
| `valid_from` | date |  | tuNgay |
| `valid_to` | date |  | denNgay |
| `ratio` | numeric(9,6) | NOT NULL DEFAULT 1 | tyLe |
| `note` | text |  |  |

Khóa / ràng buộc bảng: `FOREIGN KEY (company_id, product_code)   REFERENCES item(company_id, code)`; `FOREIGN KEY (company_id, material_code)  REFERENCES item(company_id, code)`; `FOREIGN KEY (company_id, substitute_code) REFERENCES item(company_id, code)`; `CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)`

### `production_capacity`

Năng lực sản xuất theo thời kỳ (doc `caps`)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `product_code` | text | NOT NULL | maTP |
| `valid_from` | date |  | tuNgay |
| `valid_to` | date |  | denNgay |
| `runs_per_day` | numeric(18,4) |  | lanNgay: mẻ / ngày |
| `runs_per_month` | numeric(18,4) |  | meThang: tổng mẻ tối đa / tháng |
| `note` | text |  |  |

Khóa / ràng buộc bảng: `FOREIGN KEY (company_id, product_code) REFERENCES item(company_id, code)`

### `opening_balance`

Số dư NXT đầu kỳ – chỉ ở kỳ bắt đầu (doc `opening`)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `period` | char(7) | NOT NULL CHECK (period ~ '^\d{4}-\d{2}$') |  |
| `item_code` | text | NOT NULL |  |
| `qty` | numeric(18,4) | NOT NULL DEFAULT 0 | sl |
| `amount` | numeric(20,4) | NOT NULL DEFAULT 0 | tt |
| `warehouse` | text |  | kho |

Khóa / ràng buộc bảng: `PRIMARY KEY (company_id, period, item_code)`; `FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)`

## 3. PHÁT SINH HẰNG NGÀY

### `purchase`

Mua hàng (docs p_YYYY-MM)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `receipt_date` | date | NOT NULL | ngayNhap: ngày nhập kho (quyết định kỳ) |
| `invoice_date` | date |  | ngayMua: ngày hóa đơn |
| `invoice_no` | text |  | hoaDon (trống = mua hàng chưa hóa đơn) |
| `supplier` | text |  | ncc |
| `item_code` | text | NOT NULL | ma |
| `qty` | numeric(18,4) | NOT NULL DEFAULT 0 | sl |
| `unit_price` | numeric(18,4) | NOT NULL DEFAULT 0 | donGia |
| `amount` | numeric(20,4) | NOT NULL DEFAULT 0 | tt |
| `warehouse` | text |  | kho |
| `note` | text |  |  |
| `created_at` | timestamptz | NOT NULL DEFAULT now() |  |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() |  |

Khóa / ràng buộc bảng: `FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)`

### `sale`

Bán hàng (docs s_YYYY-MM) – chỉ nhập SL và doanh số, đơn giá tự chia

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `invoice_date` | date | NOT NULL | ngay |
| `item_code` | text | NOT NULL | ma |
| `qty` | numeric(18,4) | NOT NULL DEFAULT 0 | sl |
| `revenue` | numeric(20,4) | NOT NULL DEFAULT 0 | doanhSo |
| `unit_price` | numeric(18,4) | GENERATED ALWAYS AS (CASE WHEN qty <> 0 THEN round(revenue / qty, 2) ELSE 0 END) STORED | donGia = doanh số / SL (tự tính) |
| `note` | text |  |  |
| `created_at` | timestamptz | NOT NULL DEFAULT now() |  |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() |  |

Khóa / ràng buộc bảng: `FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)`

### `production_plan`

Kế hoạch sản xuất (docs k_YYYY-MM)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `production_date` | date | NOT NULL | ngaySX |
| `product_code` | text | NOT NULL | maTP |
| `batches` | numeric(18,4) | NOT NULL DEFAULT 0 | soMe |
| `note` | text |  |  |

Khóa / ràng buộc bảng: `FOREIGN KEY (company_id, product_code) REFERENCES item(company_id, code)`

### `production_order`

Lệnh sản xuất (docs o_YYYY-MM, phần rows)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `order_code` | text | NOT NULL | maLenh: LSX2026-10.01-01 (tự sinh) |
| `material_issue_date` | date | NOT NULL | ngayXuatNVL (quyết định kỳ) |
| `production_date` | date |  | ngaySX |
| `product_code` | text | NOT NULL | maTP |
| `bom_type` | text | NOT NULL DEFAULT 'DM' | loaiDM |
| `planned_batches` | numeric(18,4) | NOT NULL DEFAULT 0 | soMeKH: số mẻ kế hoạch |
| `batch_adjustment` | numeric(18,4) | NOT NULL DEFAULT 0 | dieuChinhMe: điều chỉnh mẻ (tăng +, giảm -) |
| `proposed_batches` | numeric(18,4) | NOT NULL DEFAULT 0 | dcPM: phần PM đề xuất trong điều chỉnh |
| `note` | text |  |  |
| `created_at` | timestamptz | NOT NULL DEFAULT now() |  |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() |  |

Khóa / ràng buộc bảng: `UNIQUE (company_id, order_code)`; `UNIQUE (company_id, id)`; `FOREIGN KEY (company_id, product_code) REFERENCES item(company_id, code)`

### `order_material_adjustment`

Điều chỉnh NVL theo lệnh (docs o_YYYY-MM, phần adj)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `company_id` | bigint | NOT NULL |  |
| `order_id` | bigint | NOT NULL |  |
| `item_code` | text | NOT NULL | maVT |
| `adjustment_qty` | numeric(18,4) | NOT NULL | dieuChinh (+ / -) |
| `reason` | text |  | lyDo |

Khóa / ràng buộc bảng: `FOREIGN KEY (company_id, order_id) REFERENCES production_order(company_id, id) ON DELETE CASCADE`; `FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)`

### `common_issue`

Xuất vật tư dùng chung, không gắn lệnh (docs i_YYYY-MM)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `voucher_no` | text |  | maPhieu: số chứng từ (tự sinh) |
| `issue_date` | date | NOT NULL | ngay |
| `item_code` | text | NOT NULL | maVT |
| `qty` | numeric(18,4) | NOT NULL DEFAULT 0 | sl |
| `issue_type` | text | NOT NULL CHECK (issue_type IN ('627','641')) |  |
| `reason` | text |  | lyDo |

Khóa / ràng buộc bảng: `FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)`

### `period_cost`

Chi phí 622 / 627 theo tháng, mỗi cột chi phí một dòng (docs c_YYYY-MM)

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `company_id` | bigint | NOT NULL |  |
| `period` | char(7) | NOT NULL CHECK (period ~ '^\d{4}-\d{2}$') |  |
| `cost_code` | text | NOT NULL | trùng cost_column.code |
| `amount` | numeric(20,4) | NOT NULL DEFAULT 0 |  |

Khóa / ràng buộc bảng: `PRIMARY KEY (company_id, period, cost_code)`; `FOREIGN KEY (company_id, cost_code) REFERENCES cost_column(company_id, code)`

## 4. KẾT QUẢ TÍNH (snapshot) – phần mềm tính lại khi cần; bảng này lưu

### `cost_run`



| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `company_id` | bigint | NOT NULL REFERENCES company(id) ON DELETE CASCADE |  |
| `period` | char(7) | NOT NULL CHECK (period ~ '^\d{4}-\d{2}$') |  |
| `calculated_at` | timestamptz | NOT NULL DEFAULT now() |  |
| `calculated_by` | text |  |  |
| `is_locked_snapshot` | boolean | NOT NULL DEFAULT false | true = bản chốt khi khóa kỳ |
| `sum_621` | numeric(20,4) | NOT NULL DEFAULT 0 |  |
| `sum_622` | numeric(20,4) | NOT NULL DEFAULT 0 |  |
| `sum_627` | numeric(20,4) | NOT NULL DEFAULT 0 |  |
| `sum_154` | numeric(20,4) | NOT NULL DEFAULT 0 | tổng giá thành thành phẩm nhập kho |
| `revenue` | numeric(20,4) | NOT NULL DEFAULT 0 | doanh số |
| `gross_profit` | numeric(20,4) | NOT NULL DEFAULT 0 | lãi gộp |
| `closing_value` | numeric(20,4) | NOT NULL DEFAULT 0 | tồn cuối (giá trị) |
| `warnings` | jsonb | NOT NULL DEFAULT '[]'::jsonb |  |

### `cost_order_result`

Giá thành theo lệnh sản xuất

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `run_id` | bigint | NOT NULL REFERENCES cost_run(id) ON DELETE CASCADE |  |
| `order_id` | bigint | NOT NULL REFERENCES production_order(id) ON DELETE CASCADE |  |
| `output_qty` | numeric(18,4) | NOT NULL DEFAULT 0 | slTH: SL sản xuất |
| `c621` | numeric(20,4) | NOT NULL DEFAULT 0 |  |
| `c622` | numeric(20,4) | NOT NULL DEFAULT 0 |  |
| `c627` | numeric(20,4) | NOT NULL DEFAULT 0 |  |
| `c154` | numeric(20,4) | NOT NULL DEFAULT 0 | tổng giá thành |
| `unit_cost` | numeric(18,4) | NOT NULL DEFAULT 0 | giá thành / đơn vị |

Khóa / ràng buộc bảng: `PRIMARY KEY (run_id, order_id)`

### `cost_material_line`

Chi tiết NVL của từng lệnh (tab "Nhật ký xuất vật tư" / "Chi tiết")

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `id` | bigserial | PRIMARY KEY |  |
| `run_id` | bigint | NOT NULL |  |
| `order_id` | bigint | NOT NULL |  |
| `company_id` | bigint | NOT NULL |  |
| `item_code` | text | NOT NULL | maVT |
| `norm_qty` | numeric(18,6) | NOT NULL DEFAULT 0 | theo định mức |
| `adjustment_qty` | numeric(18,6) | NOT NULL DEFAULT 0 | điều chỉnh |
| `total_qty` | numeric(18,6) | NOT NULL DEFAULT 0 |  |
| `unit_price` | numeric(18,4) | NOT NULL DEFAULT 0 | giá vốn bình quân |
| `amount` | numeric(20,4) | NOT NULL DEFAULT 0 |  |
| `is_substitute` | boolean | NOT NULL DEFAULT false |  |

Khóa / ràng buộc bảng: `FOREIGN KEY (run_id, order_id) REFERENCES cost_order_result(run_id, order_id) ON DELETE CASCADE`; `FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)`

### `inventory_result`

Nhập – xuất – tồn theo mã hàng

| Cột | Kiểu | Ràng buộc | Trường trong phần mềm / ý nghĩa |
|---|---|---|---|
| `run_id` | bigint | NOT NULL REFERENCES cost_run(id) ON DELETE CASCADE |  |
| `company_id` | bigint | NOT NULL |  |
| `item_code` | text | NOT NULL |  |
| `open_qty` | numeric(18,4) | NOT NULL DEFAULT 0 |  |
| `open_amount` | numeric(20,4) | NOT NULL DEFAULT 0 |  |
| `in_qty` | numeric(18,4) | NOT NULL DEFAULT 0 |  |
| `in_amount` | numeric(20,4) | NOT NULL DEFAULT 0 |  |
| `out_qty` | numeric(18,4) | NOT NULL DEFAULT 0 |  |
| `out_amount` | numeric(20,4) | NOT NULL DEFAULT 0 |  |
| `close_qty` | numeric(18,4) | NOT NULL DEFAULT 0 |  |
| `close_amount` | numeric(20,4) | NOT NULL DEFAULT 0 |  |
| `avg_cost` | numeric(18,4) | NOT NULL DEFAULT 0 | giá vốn bình quân kỳ |
| `avg_daily_qty` | numeric(18,4) |  | bq: bình quân / ngày |
| `stock_days` | numeric(12,2) |  | days |
| `need_5days` | numeric(18,4) |  | canLay5 |
| `status` | text |  | trạng thái rủi ro (Âm kho, Tồn lâu, ...) |

Khóa / ràng buộc bảng: `PRIMARY KEY (run_id, item_code)`; `FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)`

## Ánh xạ từ kho dữ liệu `gt` của phần mềm sang bảng

| Tài liệu trong kho `gt` | Bảng |
|---|---|
| `settings` | `company`, `company_setting`, `cost_column`, `risk_threshold`, `period_lock` |
| `items` | `item` |
| `bom` | `bom_line` |
| `subs` | `material_substitution` |
| `caps` | `production_capacity` |
| `opening` | `opening_balance` |
| `p_YYYY-MM` | `purchase` |
| `s_YYYY-MM` | `sale` |
| `k_YYYY-MM` | `production_plan` |
| `o_YYYY-MM` (rows) | `production_order` |
| `o_YYYY-MM` (adj) | `order_material_adjustment` |
| `i_YYYY-MM` | `common_issue` |
| `c_YYYY-MM` | `period_cost` (mỗi cột chi phí một dòng) |
| `h_YYYY` | `work_calendar` |
| (tính lại khi mở phần mềm) | `cost_run`, `cost_order_result`, `cost_material_line`, `inventory_result` |

## Quy đổi giá trị

| Phần mềm | Cơ sở dữ liệu |
|---|---|
| Loại lịch `Nghỉ lễ / công ty` / `Nghỉ chờ việc` / `Tăng ca` | `work_calendar.kind` = `HOLIDAY` / `STANDBY` / `OVERTIME` |
| Loại xuất `Dùng chung SX (627)` / `Thử nghiệm (641)` | `common_issue.issue_type` = `627` / `641` |
| Kỳ `YYYY-MM` (tháng của ngày nhập kho / ngày hóa đơn / ngày xuất NVL / ngày SX) | không lưu cột kỳ ở bảng phát sinh, lấy từ cột ngày; bảng theo kỳ dùng `period char(7)` |
| Đơn giá bán = doanh số ÷ SL | `sale.unit_price` là cột sinh tự động |
