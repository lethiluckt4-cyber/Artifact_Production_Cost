-- =====================================================================
-- Phần mềm Giá thành – Database schema (PostgreSQL 14+)
-- Dựa trên mô hình dữ liệu của bản mockup artifact (artifact/index.html):
--   mỗi "tài liệu" của kho `gt` (settings, items, bom, subs, caps, opening,
--   p_/s_/i_/k_/o_/c_YYYY-MM, h_YYYY) được tách thành bảng quan hệ.
-- Đa công ty: mọi bảng nghiệp vụ có company_id.
-- Quy ước: tên bảng / cột tiếng Anh, chú thích tiếng Việt; kỳ = 'YYYY-MM'.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS giathanh;
SET search_path = giathanh, public;

-- ---------- Hàm dùng chung ----------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

-- =====================================================================
-- 1. CÔNG TY VÀ THIẾT LẬP
-- =====================================================================
CREATE TABLE company (
  id          bigserial PRIMARY KEY,
  code        text NOT NULL UNIQUE,                 -- mã ngắn: THAOVY, THIENHONG...
  name        text NOT NULL,                        -- settings.company
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Thiết lập chung của công ty (doc `settings`)
CREATE TABLE company_setting (
  company_id        bigint PRIMARY KEY REFERENCES company(id) ON DELETE CASCADE,
  start_period      char(7)  CHECK (start_period ~ '^\d{4}-\d{2}$'),  -- startKy: kỳ bắt đầu tính giá thành
  work_year         smallint,                                          -- workYear: năm làm việc
  sunday_off        boolean  NOT NULL DEFAULT true,                    -- nghiCN: nghỉ Chủ nhật cố định
  alloc_basis_622   text NOT NULL DEFAULT 'kg' CHECK (alloc_basis_622 IN ('kg','nvl')), -- pb622: phân bổ theo kg hoặc theo 621
  alloc_basis_627   text NOT NULL DEFAULT 'kg' CHECK (alloc_basis_627 IN ('kg','nvl')), -- pb627
  stale_days        numeric(10,2),                                     -- tonLau: số ngày tồn lâu (đề xuất SX)
  reserve_days      numeric(10,2),                                     -- duPhong: số ngày dự phòng
  ignore_days       numeric(10,2),                                     -- boQua: bỏ qua
  misa_partner_code text,                                              -- ktMaDT: mã đối tượng (NV_DMT)
  misa_partner_name text,                                              -- ktTenDT
  misa_debit_issue  text,                                              -- ktTkNoXK: TK nợ phiếu xuất (621)
  misa_credit_recv  text,                                              -- ktTkCoNK: TK có phiếu nhập (154)
  holidays_2026_seeded boolean NOT NULL DEFAULT false,                 -- holSeed2026
  extra             jsonb NOT NULL DEFAULT '{}'::jsonb,                -- thiết lập khác chưa tách cột
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- Cột chi phí 622 / 627 do người dùng tự thêm (settings.costCols)
CREATE TABLE cost_column (
  company_id  bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  code        text   NOT NULL,                      -- k: c622, c6273, c6274, dien, nuoc, khac...
  label       text   NOT NULL,                      -- t
  account_grp text   NOT NULL CHECK (account_grp IN ('622','627')),  -- g
  sort_order  smallint NOT NULL DEFAULT 0,
  PRIMARY KEY (company_id, code)
);

-- Ngưỡng cảnh báo / rủi ro cao (settings.risk)
CREATE TABLE risk_threshold (
  company_id  bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  risk_key    text   NOT NULL,                      -- giamua, giaban, sxban, tonTP, cp627, gvdt, banlo, tpam, cpchua, maam, nvlam
  warn_value  numeric(18,4),                        -- cb
  high_value  numeric(18,4),                        -- cao
  PRIMARY KEY (company_id, risk_key)
);

-- Khóa kỳ (settings.locked[])
CREATE TABLE period_lock (
  company_id  bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  period      char(7) NOT NULL CHECK (period ~ '^\d{4}-\d{2}$'),
  locked_at   timestamptz NOT NULL DEFAULT now(),
  locked_by   text,
  PRIMARY KEY (company_id, period)
);

-- Lịch nghỉ lễ / nghỉ chờ việc / tăng ca (docs h_YYYY)
CREATE TABLE work_calendar (
  company_id  bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  day         date   NOT NULL,                      -- ngay
  kind        text   NOT NULL CHECK (kind IN ('HOLIDAY','STANDBY','OVERTIME')),
                                                    -- loai: 'Nghỉ lễ / công ty' | 'Nghỉ chờ việc' | 'Tăng ca'
  note        text,                                 -- ghiChu
  PRIMARY KEY (company_id, day)
);

-- =====================================================================
-- 2. DỮ LIỆU NỀN
-- =====================================================================
CREATE TABLE item_group (
  code        text PRIMARY KEY,                     -- đúng giá trị NHOM của phần mềm
  name        text NOT NULL,
  is_finished boolean NOT NULL DEFAULT false        -- true = Thành phẩm
);
INSERT INTO item_group(code, name, is_finished) VALUES
  ('Thành phẩm','Thành phẩm',true),
  ('NVLC','Nguyên vật liệu chính',false),
  ('PG','Phụ gia',false),
  ('GV','Gia vị',false),
  ('BB','Bao bì',false),
  ('Khác','Khác',false);

-- Danh mục hàng hóa (doc `items`)
CREATE TABLE item (
  company_id  bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  code        text   NOT NULL,                      -- ma
  name        text   NOT NULL,                      -- ten
  group_code  text   NOT NULL REFERENCES item_group(code),  -- nhom
  uom         text   NOT NULL,                      -- dvt
  warehouse   text,                                 -- kho (TK kho: 152, 155...)
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, code)
);

-- Định mức NVL (doc `bom`)
CREATE TABLE bom_line (
  id               bigserial PRIMARY KEY,
  company_id       bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  bom_type         text   NOT NULL DEFAULT 'DM',    -- loai: loại định mức
  product_code     text   NOT NULL,                 -- maTP
  material_code    text   NOT NULL,                 -- maNVL
  product_qty      numeric(18,4) NOT NULL DEFAULT 0,-- slTP: SL thành phẩm / lần
  material_qty     numeric(18,6) NOT NULL DEFAULT 0,-- slNVL: SL NVL / lần
  runs_per_day     numeric(18,4) NOT NULL DEFAULT 0,-- lanNgay: mẻ / ngày (năng lực mặc định)
  loss_pct         numeric(18,6) NOT NULL DEFAULT 0,-- haoHut
  substitute_code  text,                            -- maThayThe
  valid_from       date,                            -- tuNgay
  valid_to         date,                            -- denNgay
  substitute_ratio numeric(9,6) NOT NULL DEFAULT 0, -- tyLe
  note             text,                            -- ghiChu
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (company_id, product_code)  REFERENCES item(company_id, code),
  FOREIGN KEY (company_id, material_code) REFERENCES item(company_id, code),
  FOREIGN KEY (company_id, substitute_code) REFERENCES item(company_id, code),
  CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
);
CREATE INDEX ix_bom_product ON bom_line (company_id, product_code, bom_type);
CREATE INDEX ix_bom_material ON bom_line (company_id, material_code);

-- NVL thay thế theo thời kỳ (doc `subs`)
CREATE TABLE material_substitution (
  id               bigserial PRIMARY KEY,
  company_id       bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  product_code     text,                            -- maTP (NULL = mọi thành phẩm)
  material_code    text   NOT NULL,                 -- maNVL gốc
  substitute_code  text   NOT NULL,                 -- maThayThe
  valid_from       date,                            -- tuNgay
  valid_to         date,                            -- denNgay
  ratio            numeric(9,6) NOT NULL DEFAULT 1, -- tyLe
  note             text,
  FOREIGN KEY (company_id, product_code)   REFERENCES item(company_id, code),
  FOREIGN KEY (company_id, material_code)  REFERENCES item(company_id, code),
  FOREIGN KEY (company_id, substitute_code) REFERENCES item(company_id, code),
  CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
);

-- Năng lực sản xuất theo thời kỳ (doc `caps`)
CREATE TABLE production_capacity (
  id            bigserial PRIMARY KEY,
  company_id    bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  product_code  text   NOT NULL,                    -- maTP
  valid_from    date,                               -- tuNgay
  valid_to      date,                               -- denNgay
  runs_per_day  numeric(18,4),                      -- lanNgay: mẻ / ngày
  runs_per_month numeric(18,4),                     -- meThang: tổng mẻ tối đa / tháng
  note          text,
  FOREIGN KEY (company_id, product_code) REFERENCES item(company_id, code)
);

-- Số dư NXT đầu kỳ – chỉ ở kỳ bắt đầu (doc `opening`)
CREATE TABLE opening_balance (
  company_id  bigint  NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  period      char(7) NOT NULL CHECK (period ~ '^\d{4}-\d{2}$'),
  item_code   text    NOT NULL,
  qty         numeric(18,4) NOT NULL DEFAULT 0,     -- sl
  amount      numeric(20,4) NOT NULL DEFAULT 0,     -- tt
  warehouse   text,                                 -- kho
  PRIMARY KEY (company_id, period, item_code),
  FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)
);

-- =====================================================================
-- 3. PHÁT SINH HẰNG NGÀY
-- =====================================================================
-- Mua hàng (docs p_YYYY-MM)
CREATE TABLE purchase (
  id            bigserial PRIMARY KEY,
  company_id    bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  receipt_date  date   NOT NULL,                    -- ngayNhap: ngày nhập kho (quyết định kỳ)
  invoice_date  date,                               -- ngayMua: ngày hóa đơn
  invoice_no    text,                               -- hoaDon (trống = mua hàng chưa hóa đơn)
  supplier      text,                               -- ncc
  item_code     text   NOT NULL,                    -- ma
  qty           numeric(18,4) NOT NULL DEFAULT 0,   -- sl
  unit_price    numeric(18,4) NOT NULL DEFAULT 0,   -- donGia
  amount        numeric(20,4) NOT NULL DEFAULT 0,   -- tt
  warehouse     text,                               -- kho
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)
);
CREATE INDEX ix_purchase_date ON purchase (company_id, receipt_date);
CREATE INDEX ix_purchase_item ON purchase (company_id, item_code, receipt_date);
CREATE INDEX ix_purchase_invoice ON purchase (company_id, invoice_no) WHERE invoice_no IS NOT NULL AND invoice_no <> '';

-- Bán hàng (docs s_YYYY-MM) – chỉ nhập SL và doanh số, đơn giá tự chia
CREATE TABLE sale (
  id            bigserial PRIMARY KEY,
  company_id    bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  invoice_date  date   NOT NULL,                    -- ngay
  item_code     text   NOT NULL,                    -- ma
  qty           numeric(18,4) NOT NULL DEFAULT 0,   -- sl
  revenue       numeric(20,4) NOT NULL DEFAULT 0,   -- doanhSo
  unit_price    numeric(18,4) GENERATED ALWAYS AS (CASE WHEN qty <> 0 THEN round(revenue / qty, 2) ELSE 0 END) STORED,  -- donGia = doanh số / SL (tự tính)
  note          text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)
);
CREATE INDEX ix_sale_date ON sale (company_id, invoice_date);
CREATE INDEX ix_sale_item ON sale (company_id, item_code, invoice_date);

-- Kế hoạch sản xuất (docs k_YYYY-MM)
CREATE TABLE production_plan (
  id            bigserial PRIMARY KEY,
  company_id    bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  production_date date NOT NULL,                    -- ngaySX
  product_code  text   NOT NULL,                    -- maTP
  batches       numeric(18,4) NOT NULL DEFAULT 0,   -- soMe
  note          text,
  FOREIGN KEY (company_id, product_code) REFERENCES item(company_id, code)
);
CREATE INDEX ix_plan_date ON production_plan (company_id, production_date);

-- Lệnh sản xuất (docs o_YYYY-MM, phần rows)
CREATE TABLE production_order (
  id                bigserial PRIMARY KEY,
  company_id        bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  order_code        text   NOT NULL,                -- maLenh: LSX2026-10.01-01 (tự sinh)
  material_issue_date date NOT NULL,                -- ngayXuatNVL (quyết định kỳ)
  production_date   date,                           -- ngaySX
  product_code      text   NOT NULL,                -- maTP
  bom_type          text   NOT NULL DEFAULT 'DM',   -- loaiDM
  planned_batches   numeric(18,4) NOT NULL DEFAULT 0, -- soMeKH: số mẻ kế hoạch
  batch_adjustment  numeric(18,4) NOT NULL DEFAULT 0, -- dieuChinhMe: điều chỉnh mẻ (tăng +, giảm -)
  proposed_batches  numeric(18,4) NOT NULL DEFAULT 0, -- dcPM: phần PM đề xuất trong điều chỉnh
  note              text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, order_code),
  UNIQUE (company_id, id),
  FOREIGN KEY (company_id, product_code) REFERENCES item(company_id, code)
);
CREATE INDEX ix_order_date ON production_order (company_id, material_issue_date);
CREATE INDEX ix_order_product ON production_order (company_id, product_code);

-- Điều chỉnh NVL theo lệnh (docs o_YYYY-MM, phần adj)
CREATE TABLE order_material_adjustment (
  id          bigserial PRIMARY KEY,
  company_id  bigint NOT NULL,
  order_id    bigint NOT NULL,
  item_code   text   NOT NULL,                      -- maVT
  adjustment_qty numeric(18,4) NOT NULL,            -- dieuChinh (+ / -)
  reason      text,                                 -- lyDo
  FOREIGN KEY (company_id, order_id) REFERENCES production_order(company_id, id) ON DELETE CASCADE,
  FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)
);
CREATE INDEX ix_adj_order ON order_material_adjustment (order_id);

-- Xuất vật tư dùng chung, không gắn lệnh (docs i_YYYY-MM)
CREATE TABLE common_issue (
  id          bigserial PRIMARY KEY,
  company_id  bigint NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  voucher_no  text,                                 -- maPhieu: số chứng từ (tự sinh)
  issue_date  date   NOT NULL,                      -- ngay
  item_code   text   NOT NULL,                      -- maVT
  qty         numeric(18,4) NOT NULL DEFAULT 0,     -- sl
  issue_type  text   NOT NULL CHECK (issue_type IN ('627','641')),
                                                    -- loai: 'Dùng chung SX (627)' | 'Thử nghiệm (641)'
  reason      text,                                 -- lyDo
  FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)
);
CREATE INDEX ix_issue_date ON common_issue (company_id, issue_date);

-- Chi phí 622 / 627 theo tháng, mỗi cột chi phí một dòng (docs c_YYYY-MM)
CREATE TABLE period_cost (
  company_id  bigint  NOT NULL,
  period      char(7) NOT NULL CHECK (period ~ '^\d{4}-\d{2}$'),
  cost_code   text    NOT NULL,                     -- trùng cost_column.code
  amount      numeric(20,4) NOT NULL DEFAULT 0,
  PRIMARY KEY (company_id, period, cost_code),
  FOREIGN KEY (company_id, cost_code) REFERENCES cost_column(company_id, code)
);

-- =====================================================================
-- 4. KẾT QUẢ TÍNH (snapshot) – phần mềm tính lại khi cần; bảng này lưu
--    kết quả của lần tính để xem lại / khóa kỳ / xuất báo cáo nhanh.
-- =====================================================================
CREATE TABLE cost_run (
  id            bigserial PRIMARY KEY,
  company_id    bigint  NOT NULL REFERENCES company(id) ON DELETE CASCADE,
  period        char(7) NOT NULL CHECK (period ~ '^\d{4}-\d{2}$'),
  calculated_at timestamptz NOT NULL DEFAULT now(),
  calculated_by text,
  is_locked_snapshot boolean NOT NULL DEFAULT false, -- true = bản chốt khi khóa kỳ
  sum_621       numeric(20,4) NOT NULL DEFAULT 0,
  sum_622       numeric(20,4) NOT NULL DEFAULT 0,
  sum_627       numeric(20,4) NOT NULL DEFAULT 0,
  sum_154       numeric(20,4) NOT NULL DEFAULT 0,    -- tổng giá thành thành phẩm nhập kho
  revenue       numeric(20,4) NOT NULL DEFAULT 0,    -- doanh số
  gross_profit  numeric(20,4) NOT NULL DEFAULT 0,    -- lãi gộp
  closing_value numeric(20,4) NOT NULL DEFAULT 0,    -- tồn cuối (giá trị)
  warnings      jsonb NOT NULL DEFAULT '[]'::jsonb
);
CREATE INDEX ix_run_period ON cost_run (company_id, period, calculated_at DESC);

-- Giá thành theo lệnh sản xuất
CREATE TABLE cost_order_result (
  run_id        bigint NOT NULL REFERENCES cost_run(id) ON DELETE CASCADE,
  order_id      bigint NOT NULL REFERENCES production_order(id) ON DELETE CASCADE,
  output_qty    numeric(18,4) NOT NULL DEFAULT 0,    -- slTH: SL sản xuất
  c621          numeric(20,4) NOT NULL DEFAULT 0,
  c622          numeric(20,4) NOT NULL DEFAULT 0,
  c627          numeric(20,4) NOT NULL DEFAULT 0,
  c154          numeric(20,4) NOT NULL DEFAULT 0,    -- tổng giá thành
  unit_cost     numeric(18,4) NOT NULL DEFAULT 0,    -- giá thành / đơn vị
  PRIMARY KEY (run_id, order_id)
);

-- Chi tiết NVL của từng lệnh (tab "Nhật ký xuất vật tư" / "Chi tiết")
CREATE TABLE cost_material_line (
  id            bigserial PRIMARY KEY,
  run_id        bigint NOT NULL,
  order_id      bigint NOT NULL,
  company_id    bigint NOT NULL,
  item_code     text   NOT NULL,                     -- maVT
  norm_qty      numeric(18,6) NOT NULL DEFAULT 0,    -- theo định mức
  adjustment_qty numeric(18,6) NOT NULL DEFAULT 0,   -- điều chỉnh
  total_qty     numeric(18,6) NOT NULL DEFAULT 0,
  unit_price    numeric(18,4) NOT NULL DEFAULT 0,    -- giá vốn bình quân
  amount        numeric(20,4) NOT NULL DEFAULT 0,
  is_substitute boolean NOT NULL DEFAULT false,
  FOREIGN KEY (run_id, order_id) REFERENCES cost_order_result(run_id, order_id) ON DELETE CASCADE,
  FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)
);
CREATE INDEX ix_cml_run ON cost_material_line (run_id, order_id);

-- Nhập – xuất – tồn theo mã hàng
CREATE TABLE inventory_result (
  run_id        bigint NOT NULL REFERENCES cost_run(id) ON DELETE CASCADE,
  company_id    bigint NOT NULL,
  item_code     text   NOT NULL,
  open_qty      numeric(18,4) NOT NULL DEFAULT 0,
  open_amount   numeric(20,4) NOT NULL DEFAULT 0,
  in_qty        numeric(18,4) NOT NULL DEFAULT 0,
  in_amount     numeric(20,4) NOT NULL DEFAULT 0,
  out_qty       numeric(18,4) NOT NULL DEFAULT 0,
  out_amount    numeric(20,4) NOT NULL DEFAULT 0,
  close_qty     numeric(18,4) NOT NULL DEFAULT 0,
  close_amount  numeric(20,4) NOT NULL DEFAULT 0,
  avg_cost      numeric(18,4) NOT NULL DEFAULT 0,    -- giá vốn bình quân kỳ
  avg_daily_qty numeric(18,4),                       -- bq: bình quân / ngày
  stock_days    numeric(12,2),                       -- days
  need_5days    numeric(18,4),                       -- canLay5
  status        text,                                -- trạng thái rủi ro (Âm kho, Tồn lâu, ...)
  PRIMARY KEY (run_id, item_code),
  FOREIGN KEY (company_id, item_code) REFERENCES item(company_id, code)
);

-- =====================================================================
-- 5. VIEW TIỆN ÍCH
-- =====================================================================
-- Cột "Có định mức" của Danh mục hàng
CREATE VIEW v_item_has_bom AS
SELECT i.company_id, i.code, i.name, i.group_code,
       EXISTS (SELECT 1 FROM bom_line b WHERE b.company_id=i.company_id AND
                 (b.product_code=i.code OR b.material_code=i.code OR b.substitute_code=i.code))
       OR EXISTS (SELECT 1 FROM material_substitution s WHERE s.company_id=i.company_id AND
                 (s.material_code=i.code OR s.substitute_code=i.code)) AS has_bom
FROM item i;

-- Tổng chi phí 622 / 627 theo tháng
CREATE VIEW v_period_cost_summary AS
SELECT pc.company_id, pc.period,
       SUM(pc.amount) FILTER (WHERE cc.account_grp = '622') AS total_622,
       SUM(pc.amount) FILTER (WHERE cc.account_grp = '627') AS total_627
FROM period_cost pc
JOIN cost_column cc ON cc.company_id = pc.company_id AND cc.code = pc.cost_code
GROUP BY pc.company_id, pc.period;

-- Mua hàng chưa hóa đơn
CREATE VIEW v_purchase_without_invoice AS
SELECT * FROM purchase WHERE invoice_no IS NULL OR btrim(invoice_no) = '';

-- =====================================================================
-- 6. TRIGGER updated_at
-- =====================================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['company','company_setting','item','bom_line','purchase','sale','production_order'] LOOP
    EXECUTE format('CREATE TRIGGER trg_%I_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()', t, t);
  END LOOP;
END $$;
