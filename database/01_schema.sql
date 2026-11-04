-- =====================================================================
-- DATABASE SCHEMA – PHẦN MỀM GIÁ THÀNH (dựng từ mockup artifact Thiên Hồng)
-- Hệ quản trị: PostgreSQL 14+ (đã chạy thử trên PostgreSQL 16)
-- Thiết kế đa công ty: mọi bảng nghiệp vụ có cong_ty_id → dùng chung 1 database cho Thiên Hồng, Thảo Vy, Dương Vân…
-- Ánh xạ với mockup: xem database/README.md (mục "Ánh xạ mockup → bảng")
-- =====================================================================
BEGIN;
CREATE SCHEMA IF NOT EXISTS gia_thanh;
SET search_path TO gia_thanh, public;

-- ---------- Kiểu liệt kê ----------
CREATE TYPE loai_nhom_hang   AS ENUM ('TP_DONG_GOI','TU_SAN_XUAT','SAN_PHAM_LOI','NVL_MUA');
CREATE TYPE loai_lich        AS ENUM ('NGHI_LE','NGHI_CHO_VIEC','TANG_CA');
CREATE TYPE loai_doi_tac     AS ENUM ('NCC','KH');
CREATE TYPE loai_xuat_chung  AS ENUM ('CPSX_627','BAN_HANG_641');
CREATE TYPE nhom_chi_phi     AS ENUM ('622','627');
CREATE TYPE nguon_lenh       AS ENUM ('EXCEL','PM','PM_SUA_TAY','TAY','EXCEL_SUA_TAY');
CREATE TYPE nguon_can_doi    AS ENUM ('TAY','PM');
CREATE TYPE cong_doan        AS ENUM ('BT','TP');          -- BT = bán thành phẩm (CĐ1), TP = thành phẩm đóng gói (CĐ2)
CREATE TYPE phan_loai_rui_ro AS ENUM ('OK','CANH_BAO','RUI_RO_CAO');

-- =====================================================================
-- 1. CÔNG TY & KỲ
-- =====================================================================
CREATE TABLE cong_ty (
  id                    bigserial PRIMARY KEY,
  ma                    varchar(20)  NOT NULL UNIQUE,
  ten                   varchar(200) NOT NULL,
  ky_bat_dau            date,                                   -- kỳ có số dư đầu kỳ (ngày 01 của tháng)
  nam_lam_viec          smallint,
  kt_ma_doi_tuong       varchar(50),                            -- file kế toán: mã đối tượng
  kt_ten_doi_tuong      varchar(200),
  kt_tk_no_xuat_nvl     varchar(20)  NOT NULL DEFAULT '621',
  kt_tk_co_nhap_tp      varchar(20)  NOT NULL DEFAULT '154',
  tao_luc               timestamptz  NOT NULL DEFAULT now(),
  cap_nhat_luc          timestamptz  NOT NULL DEFAULT now(),
  CHECK (ky_bat_dau IS NULL OR extract(day FROM ky_bat_dau) = 1)
);
COMMENT ON TABLE  cong_ty IS 'Công ty / đơn vị dùng phần mềm (mockup: settings.company, startKy, workYear, kt*)';

CREATE TABLE ky (
  cong_ty_id   bigint  NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ky           date    NOT NULL CHECK (extract(day FROM ky) = 1),  -- tháng, lưu ngày 01
  da_khoa      boolean NOT NULL DEFAULT false,                     -- mockup: settings.locked[]
  khoa_luc     timestamptz,
  da_de_xuat   boolean NOT NULL DEFAULT false,                     -- mockup: settings.daDeXuat[] (tháng đã chạy đề xuất SX)
  PRIMARY KEY (cong_ty_id, ky)
);
COMMENT ON TABLE ky IS 'Kỳ (tháng): khóa kỳ, đánh dấu đã chạy đề xuất sản xuất';

-- =====================================================================
-- 2. DỮ LIỆU NỀN
-- =====================================================================
CREATE TABLE nhom_hang (
  id          bigserial PRIMARY KEY,
  cong_ty_id  bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ten         varchar(100) NOT NULL,
  loai        loai_nhom_hang NOT NULL,     -- quyết định cách tính: TP đóng gói / tự SX / SP lỗi / NVL mua
  thu_tu      numeric(5,2) NOT NULL DEFAULT 9,
  UNIQUE (cong_ty_id, ten)
);
COMMENT ON TABLE nhom_hang IS 'Nhóm hàng (mockup: NHOM, PROD_NHOM, isFinal/isProd/isLoi). Cột loai quyết định cách tính giá';

CREATE TABLE hang_hoa (
  id            bigserial PRIMARY KEY,
  cong_ty_id    bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ma            varchar(50)  NOT NULL,
  ten           varchar(300) NOT NULL,
  nhom_hang_id  bigint NOT NULL REFERENCES nhom_hang(id),
  dvt           varchar(20)  NOT NULL,
  kho           varchar(20),                 -- mã kho kế toán (152, 152-BB, 155…)
  ngung_dung    boolean NOT NULL DEFAULT false,
  UNIQUE (cong_ty_id, ma),
  UNIQUE (cong_ty_id, id)
);
COMMENT ON TABLE hang_hoa IS 'Danh mục hàng (mockup: items). Mã là khóa nghiệp vụ; không xóa/đổi mã đang được dùng (FK RESTRICT)';

CREATE TABLE ton_dau_ky (
  cong_ty_id   bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ky           date   NOT NULL CHECK (extract(day FROM ky) = 1),
  hang_hoa_id  bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  so_luong     numeric(18,6) NOT NULL DEFAULT 0,
  gia_tri      numeric(18,4) NOT NULL DEFAULT 0,
  kho          varchar(20),
  PRIMARY KEY (cong_ty_id, ky, hang_hoa_id)
);
COMMENT ON TABLE ton_dau_ky IS 'Số dư NXT đầu kỳ – chỉ nhập cho kỳ bắt đầu (mockup: opening)';

CREATE TABLE dinh_muc (
  id            bigserial PRIMARY KEY,
  cong_ty_id    bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  loai_dm       varchar(10) NOT NULL DEFAULT 'DM',
  san_pham_id   bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  nvl_id        bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  sl_tp_lan     numeric(18,6) NOT NULL CHECK (sl_tp_lan > 0),     -- > 1 ⇒ sản xuất theo mẻ, cỡ mẻ = sl_tp_lan
  sl_nvl_lan    numeric(18,6) NOT NULL,
  lan_ngay      numeric(10,2),
  hao_hut       numeric(9,6) NOT NULL DEFAULT 0,                  -- 0.02 = 2%
  hieu_luc_tu   date,                                             -- trống = từ đầu
  hieu_luc_den  date,                                             -- trống = vô thời hạn
  ghi_chu       text,
  thu_tu        integer,
  CHECK (hieu_luc_den IS NULL OR hieu_luc_tu IS NULL OR hieu_luc_den >= hieu_luc_tu),
  CHECK (san_pham_id <> nvl_id)
);
CREATE INDEX ix_dinh_muc_sp ON dinh_muc (cong_ty_id, san_pham_id, loai_dm);
COMMENT ON TABLE dinh_muc IS 'Định mức NVL (mockup: bom). Số lượng/SP = sl_nvl_lan ÷ sl_tp_lan';

CREATE TABLE nvl_thay_the (
  id               bigserial PRIMARY KEY,
  cong_ty_id       bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  san_pham_id      bigint REFERENCES hang_hoa(id) ON DELETE RESTRICT,   -- NULL = áp cho mọi TP
  nvl_goc_id       bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  nvl_thay_the_id  bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  hieu_luc_tu      date   NOT NULL,
  hieu_luc_den     date,
  ty_le            numeric(9,6) CHECK (ty_le IS NULL OR (ty_le > 0 AND ty_le <= 1)),  -- NULL/1 = thay toàn bộ
  ghi_chu          text
);
COMMENT ON TABLE nvl_thay_the IS 'NVL thay thế theo thời kỳ (mockup: subs)';

CREATE TABLE lich_lam_viec (
  id          bigserial PRIMARY KEY,
  cong_ty_id  bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ngay        date NOT NULL,
  loai        loai_lich NOT NULL,
  ghi_chu     text,
  UNIQUE (cong_ty_id, ngay, loai)
);
COMMENT ON TABLE lich_lam_viec IS 'Lịch nghỉ lễ / nghỉ chờ việc / tăng ca Chủ nhật (mockup: cal)';

CREATE TABLE doi_tac (
  id          bigserial PRIMARY KEY,
  cong_ty_id  bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  loai        loai_doi_tac NOT NULL,
  ten         varchar(300) NOT NULL,
  ma_so_thue  varchar(20),
  UNIQUE (cong_ty_id, loai, ten)
);
COMMENT ON TABLE doi_tac IS 'Nhà cung cấp / khách hàng (mockup lưu dạng chữ – chuẩn hóa thành bảng)';

-- =====================================================================
-- 3. PHÁT SINH HẰNG NGÀY
-- =====================================================================
CREATE TABLE mua_hang (
  id               bigserial PRIMARY KEY,
  cong_ty_id       bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ngay_nhap_kho    date NOT NULL,                                   -- quyết định kỳ tính
  ngay_hoa_don     date,
  so_hoa_don       varchar(50),
  nha_cung_cap_id  bigint REFERENCES doi_tac(id),
  ten_nha_cung_cap varchar(300),                                    -- giữ nguyên chữ như chứng từ
  hang_hoa_id      bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  so_luong         numeric(18,6) NOT NULL,
  don_gia          numeric(18,6),
  thanh_tien       numeric(18,4) NOT NULL,
  kho              varchar(20),
  ghi_chu          text,
  tach_tu_id       bigint REFERENCES mua_hang(id) ON DELETE SET NULL, -- dòng tách hóa đơn (✂ Tách)
  ky               date GENERATED ALWAYS AS (date_trunc('month', ngay_nhap_kho::timestamp)::date) STORED
);
CREATE INDEX ix_mua_hang_ky  ON mua_hang (cong_ty_id, ky, hang_hoa_id);
CREATE INDEX ix_mua_hang_hd  ON mua_hang (cong_ty_id, so_hoa_don);
COMMENT ON TABLE mua_hang IS 'Mua hàng / nhập kho (mockup: p_YYYY-MM). Mua hàng chưa HĐ: ngay_nhap_kho <> ngay_hoa_don';

CREATE TABLE ban_hang (
  id              bigserial PRIMARY KEY,
  cong_ty_id      bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ngay_hoa_don    date NOT NULL,
  so_hoa_don      varchar(50),
  khach_hang_id   bigint REFERENCES doi_tac(id),
  ten_khach_hang  varchar(300),
  hang_hoa_id     bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  so_luong        numeric(18,6) NOT NULL,
  don_gia         numeric(18,6),
  doanh_so        numeric(18,4) NOT NULL,
  ghi_chu         text,
  ky              date GENERATED ALWAYS AS (date_trunc('month', ngay_hoa_don::timestamp)::date) STORED
);
CREATE INDEX ix_ban_hang_ky ON ban_hang (cong_ty_id, ky, hang_hoa_id);
COMMENT ON TABLE ban_hang IS 'Bán hàng / xuất kho (mockup: s_YYYY-MM). Giá vốn lấy theo giá vốn BQ tháng bán';

CREATE TABLE xuat_dung_chung (
  id            bigserial PRIMARY KEY,
  cong_ty_id    bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  so_chung_tu   varchar(30) NOT NULL,                   -- XCyyyy-mm.dd-nn
  ngay_xuat     date NOT NULL,
  loai          loai_xuat_chung NOT NULL DEFAULT 'CPSX_627',
  hang_hoa_id   bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  so_luong      numeric(18,6) NOT NULL,
  ly_do         text,
  ky            date GENERATED ALWAYS AS (date_trunc('month', ngay_xuat::timestamp)::date) STORED,
  UNIQUE (cong_ty_id, so_chung_tu)
);
COMMENT ON TABLE xuat_dung_chung IS 'Xuất dùng chung: 627 vào giá thành, 641 chỉ trừ kho (mockup: i_YYYY-MM)';

CREATE TABLE loai_chi_phi (
  id          bigserial PRIMARY KEY,
  cong_ty_id  bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ma          varchar(30) NOT NULL,          -- c622, c6273, c6274, dien, nuoc…
  ten         varchar(100) NOT NULL,
  nhom        nhom_chi_phi NOT NULL,
  thu_tu      smallint NOT NULL DEFAULT 0,
  la_dien     boolean NOT NULL DEFAULT false, -- dùng cho đề xuất SX theo năng lượng
  UNIQUE (cong_ty_id, ma)
);
COMMENT ON TABLE loai_chi_phi IS 'Cột chi phí 622/627 cấu hình được (mockup: COSTCOLS0 / settings.costCols)';

CREATE TABLE chi_phi_thang (
  cong_ty_id       bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ky               date   NOT NULL CHECK (extract(day FROM ky) = 1),
  loai_chi_phi_id  bigint NOT NULL REFERENCES loai_chi_phi(id) ON DELETE RESTRICT,
  so_tien          numeric(18,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (cong_ty_id, ky, loai_chi_phi_id)
);
COMMENT ON TABLE chi_phi_thang IS 'Chi phí 622/627 theo tháng (mockup: c_YYYY-MM)';

-- =====================================================================
-- 4. KẾ HOẠCH & SẢN XUẤT
-- =====================================================================
CREATE TABLE lenh_san_xuat (
  id              bigserial PRIMARY KEY,
  cong_ty_id      bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ma_lenh         varchar(30) NOT NULL,                 -- LSXyyyy-mm.dd-nn
  ngay_san_xuat   date NOT NULL,
  ngay_xuat_nvl   date NOT NULL,                        -- = ngày SX; kỳ tính theo ngày xuất NVL
  san_pham_id     bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  loai_dm         varchar(10) NOT NULL DEFAULT 'DM',
  sl_lenh         numeric(18,6) NOT NULL DEFAULT 0,
  dieu_chinh_tp   numeric(18,6) NOT NULL DEFAULT 0,     -- +/- thùng, chỉ dòng thành phẩm đóng gói
  ghi_chu         text,
  khoa_ke_hoach   varchar(80),                          -- MÃ#yyyymmdd@SL~mẻ
  nguon           nguon_lenh NOT NULL DEFAULT 'EXCEL',
  sl_de_xuat      numeric(18,6),                        -- SL phần mềm đề xuất (để biết thùng sửa tay)
  sl_goc          numeric(18,6),                        -- SL trước khi "Bù hao hụt SP lỗi" (để hoàn tác)
  ky              date GENERATED ALWAYS AS (date_trunc('month', ngay_xuat_nvl::timestamp)::date) STORED,
  UNIQUE (cong_ty_id, ma_lenh)
);
CREATE INDEX ix_lenh_ngay ON lenh_san_xuat (cong_ty_id, ngay_san_xuat, san_pham_id);
COMMENT ON TABLE lenh_san_xuat IS 'Lệnh sản xuất (mockup: o_YYYY-MM.rows)';

CREATE TABLE can_doi_nvl (
  id             bigserial PRIMARY KEY,
  cong_ty_id     bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ngay_san_xuat  date   NOT NULL,
  san_pham_id    bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  nvl_id         bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  so_luong       numeric(18,6) NOT NULL,                 -- số âm = giảm tiêu hao
  ly_do          text,
  nguon          nguon_can_doi NOT NULL DEFAULT 'TAY'
);
CREATE INDEX ix_can_doi ON can_doi_nvl (cong_ty_id, ngay_san_xuat, san_pham_id, nvl_id);
COMMENT ON TABLE can_doi_nvl IS 'Cân đối NVL theo lệnh – khớp (ngày SX + mã SP + mã VT) (mockup: o_YYYY-MM.adj)';

-- =====================================================================
-- 5. THIẾT LẬP & QUY TẮC
-- =====================================================================
CREATE TABLE quy_tac_phan_bo (
  cong_ty_id      bigint PRIMARY KEY REFERENCES cong_ty(id) ON DELETE CASCADE,
  ty_le_cd1_622   numeric(9,6) NOT NULL DEFAULT 0.8 CHECK (ty_le_cd1_622 BETWEEN 0 AND 1),
  ty_le_cd1_627   numeric(9,6) NOT NULL DEFAULT 1   CHECK (ty_le_cd1_627 BETWEEN 0 AND 1)
  -- Công đoạn 2 = 1 − công đoạn 1; trong CĐ2 chia theo tỷ trọng 621 của tháng
);
COMMENT ON TABLE quy_tac_phan_bo IS 'Tỷ lệ phân bổ 622/627 cho công đoạn 1 (mockup: settings.alloc.cd1_*)';

CREATE TABLE phan_bo_san_pham (
  cong_ty_id   bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  san_pham_id  bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,
  ty_le_622    numeric(9,6) NOT NULL DEFAULT 0,
  ty_le_627    numeric(9,6) NOT NULL DEFAULT 0,
  PRIMARY KEY (cong_ty_id, san_pham_id)
);
COMMENT ON TABLE phan_bo_san_pham IS 'Tỷ lệ từng sản phẩm trong công đoạn 1 (tổng mỗi cột = 100%) (mockup: settings.alloc.rows cd=1)';

CREATE TABLE nguong_ton_kho (
  id             bigserial PRIMARY KEY,
  cong_ty_id     bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  nhom_hang_id   bigint REFERENCES nhom_hang(id) ON DELETE CASCADE,
  hang_hoa_id    bigint REFERENCES hang_hoa(id)  ON DELETE CASCADE,  -- ngưỡng riêng theo mã (ưu tiên hơn nhóm)
  ngay_rui_ro    numeric(10,2),                                     -- tồn trên mốc = Rủi ro cao; trên ½ mốc = Cảnh báo
  ngay_toi_thieu numeric(10,2),                                     -- dưới mốc = Tồn thấp
  ghi_chu        text,
  CHECK ((nhom_hang_id IS NULL) <> (hang_hoa_id IS NULL))
);
CREATE UNIQUE INDEX ux_nguong_nhom ON nguong_ton_kho (cong_ty_id, nhom_hang_id) WHERE nhom_hang_id IS NOT NULL;
CREATE UNIQUE INDEX ux_nguong_ma   ON nguong_ton_kho (cong_ty_id, hang_hoa_id)  WHERE hang_hoa_id  IS NOT NULL;
COMMENT ON TABLE nguong_ton_kho IS 'Ngưỡng tồn kho theo nhóm hoặc theo mã (mockup: settings.nguong)';

CREATE TABLE nguong_chenh_lech_gia (
  cong_ty_id  bigint PRIMARY KEY REFERENCES cong_ty(id) ON DELETE CASCADE,
  mua_vang    numeric(9,6) NOT NULL DEFAULT 0.10,
  mua_do      numeric(9,6) NOT NULL DEFAULT 0.30,
  ban_vang    numeric(9,6) NOT NULL DEFAULT 0.05,
  ban_do      numeric(9,6) NOT NULL DEFAULT 0.20
);
COMMENT ON TABLE nguong_chenh_lech_gia IS 'Ngưỡng cảnh báo chênh lệch giá mua/bán (mockup: settings.giaNg)';

CREATE TABLE quy_tac_san_pham_loi (
  id                 bigserial PRIMARY KEY,
  cong_ty_id         bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  san_pham_id        bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,  -- sản phẩm chính (BTP_BGK)
  san_pham_loi_id    bigint NOT NULL REFERENCES hang_hoa(id) ON DELETE RESTRICT,  -- mã lỗi (BTP_BGK_LOI), nhóm SAN_PHAM_LOI
  ty_le_loi          numeric(9,6)  NOT NULL CHECK (ty_le_loi >= 0 AND ty_le_loi < 1),
  gia_ban_uoc_tinh   numeric(18,4) NOT NULL DEFAULT 0,   -- giá trị thuần có thể thực hiện được (VAS 02)
  ap_dung_tu_ky      date CHECK (ap_dung_tu_ky IS NULL OR extract(day FROM ap_dung_tu_ky) = 1),
  ghi_chu            text,
  UNIQUE (cong_ty_id, san_pham_id, ap_dung_tu_ky)
);
COMMENT ON TABLE quy_tac_san_pham_loi IS 'Sản phẩm hỏng trong định mức: SL lỗi = SL thực hiện × tỷ lệ; thu hồi = SL lỗi × giá ước tính, trừ khỏi 154 (mockup: settings.spLoi)';

CREATE TABLE tham_so_de_xuat (
  cong_ty_id            bigint PRIMARY KEY REFERENCES cong_ty(id) ON DELETE CASCADE,
  so_ngay_bq_ban        smallint     NOT NULL DEFAULT 30,
  ton_toi_da_ngay       numeric(6,2) NOT NULL DEFAULT 15,
  ton_an_toan_ngay      numeric(6,2) NOT NULL DEFAULT 1,
  giam_toi_da           numeric(6,4) NOT NULL DEFAULT 0.15 CHECK (giam_toi_da BETWEEN 0 AND 0.5),
  ty_le_nang_luong      numeric(18,2),                      -- đ/kg; NULL = gợi ý BQ 3 tháng
  san_pham_nang_luong_id bigint REFERENCES hang_hoa(id),    -- sản phẩm làm mẫu số đ/kg (BTP_BGKT)
  tham_so_khac          jsonb                               -- ss, minKg, hz, hsd (tham số cũ, giữ tương thích)
);
COMMENT ON TABLE tham_so_de_xuat IS 'Tham số đề xuất sản xuất theo công suất năng lượng (mockup: settings.planPrm)';

CREATE TABLE uoc_tinh_nang_luong (
  cong_ty_id  bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ky          date   NOT NULL CHECK (extract(day FROM ky) = 1),
  so_tien     numeric(18,2) NOT NULL,
  PRIMARY KEY (cong_ty_id, ky)
);
COMMENT ON TABLE uoc_tinh_nang_luong IS 'Ước tính điện + gas đầu tháng (mockup: settings.planPrm.nlUoc)';

-- =====================================================================
-- 6. KẾT QUẢ TÍNH (mỗi lần bấm ▶ Tính giá thành = 1 lan_tinh)
-- =====================================================================
CREATE TABLE lan_tinh (
  id            bigserial PRIMARY KEY,
  cong_ty_id    bigint NOT NULL REFERENCES cong_ty(id) ON DELETE CASCADE,
  ky_tu         date NOT NULL,
  ky_den        date NOT NULL,
  tinh_luc      timestamptz NOT NULL DEFAULT now(),
  thoi_gian_ms  integer,
  phien_ban_pm  varchar(50),
  la_hien_hanh  boolean NOT NULL DEFAULT true,          -- lần tính mới nhất dùng cho báo cáo
  ghi_chu       text
);
CREATE UNIQUE INDEX ux_lan_tinh_hien_hanh ON lan_tinh (cong_ty_id) WHERE la_hien_hanh;

CREATE TABLE kq_ky (
  lan_tinh_id        bigint NOT NULL REFERENCES lan_tinh(id) ON DELETE CASCADE,
  ky                 date   NOT NULL,
  chi_phi_622        numeric(18,2), chi_phi_627 numeric(18,2), gas_627 numeric(18,2), chi_641 numeric(18,2),
  sum_621            numeric(18,2), sum_622 numeric(18,2), sum_627 numeric(18,2), sum_154 numeric(18,2),
  thu_hoi_sp_loi     numeric(18,2), chua_phan_bo_622 numeric(18,2), chua_phan_bo_627 numeric(18,2),
  sl_tp              numeric(18,4), sl_btp numeric(18,4),
  doanh_so           numeric(18,2), lai_gop numeric(18,2), ton_cuoi numeric(18,2),
  PRIMARY KEY (lan_tinh_id, ky)
);
COMMENT ON TABLE kq_ky IS 'Tổng hợp từng tháng của 1 lần tính (thẻ Tổng quan, Chi phí 622/627, Tổng hợp năm)';

CREATE TABLE kq_lenh_san_xuat (
  lan_tinh_id         bigint NOT NULL REFERENCES lan_tinh(id) ON DELETE CASCADE,
  lenh_id             bigint NOT NULL REFERENCES lenh_san_xuat(id) ON DELETE CASCADE,
  ky                  date   NOT NULL,
  cong_doan           cong_doan NOT NULL,
  sl_thuc_hien        numeric(18,6) NOT NULL,
  so_me               numeric(18,6),
  sl_loi              numeric(18,6) NOT NULL DEFAULT 0,
  sl_dat              numeric(18,6) NOT NULL,
  c621                numeric(18,4) NOT NULL, c622 numeric(18,4) NOT NULL, c627 numeric(18,4) NOT NULL, c154 numeric(18,4) NOT NULL,
  thu_hoi_sp_loi      numeric(18,4) NOT NULL DEFAULT 0,
  gia_thanh_nhap_kho  numeric(18,4) NOT NULL,           -- = c154 − thu_hoi_sp_loi
  gia_thanh_dv        numeric(18,6),                    -- = gia_thanh_nhap_kho ÷ sl_dat
  tinh_trang          varchar(100) NOT NULL DEFAULT 'Đủ',
  PRIMARY KEY (lan_tinh_id, lenh_id)
);
COMMENT ON TABLE kq_lenh_san_xuat IS 'Giá thành theo lệnh (tab Theo lệnh, sheet TheoLenh)';

CREATE TABLE kq_xuat_nvl (
  id               bigserial PRIMARY KEY,
  lan_tinh_id      bigint NOT NULL REFERENCES lan_tinh(id) ON DELETE CASCADE,
  lenh_id          bigint NOT NULL REFERENCES lenh_san_xuat(id) ON DELETE CASCADE,
  nvl_id           bigint NOT NULL REFERENCES hang_hoa(id),
  la_thay_the      boolean NOT NULL DEFAULT false,
  dinh_muc         numeric(18,8), me_sl numeric(18,6), sl_theo_dm numeric(18,6), can_doi numeric(18,6),
  tong_sl          numeric(18,6) NOT NULL, don_gia numeric(18,6) NOT NULL,
  c621             numeric(18,4) NOT NULL, c622 numeric(18,4) NOT NULL, c627 numeric(18,4) NOT NULL, c154 numeric(18,4) NOT NULL,
  ton_cuoi_ngay    numeric(18,6)
);
CREATE INDEX ix_kq_xuat_nvl ON kq_xuat_nvl (lan_tinh_id, lenh_id);
COMMENT ON TABLE kq_xuat_nvl IS 'Nhật ký xuất vật tư theo lệnh – mỗi dòng = 1 NVL của 1 lệnh (tab Chi tiết, sheet ChiTiet)';

CREATE TABLE kq_nxt (
  lan_tinh_id       bigint NOT NULL REFERENCES lan_tinh(id) ON DELETE CASCADE,
  ky                date   NOT NULL,
  hang_hoa_id       bigint NOT NULL REFERENCES hang_hoa(id),
  gia_von           numeric(18,6),
  ton_dau_sl        numeric(18,6), ton_dau_tt numeric(18,4),
  nhap_sl           numeric(18,6), nhap_tt    numeric(18,4),
  xuat_sl           numeric(18,6), xuat_tt    numeric(18,4),
  ton_cuoi_sl       numeric(18,6), ton_cuoi_tt numeric(18,4),
  don_gia_bq_mua    numeric(18,6),
  bq_ngay           numeric(18,6),
  so_ngay_con_dung  numeric(18,4),
  can_lay_15_ngay   numeric(18,6),
  phan_loai         phan_loai_rui_ro NOT NULL DEFAULT 'OK',
  trang_thai        varchar(200),
  PRIMARY KEY (lan_tinh_id, ky, hang_hoa_id)
);
COMMENT ON TABLE kq_nxt IS 'Nhập – Xuất – Tồn theo tháng, giá vốn BQ, trạng thái rủi ro';

CREATE TABLE kq_canh_bao (
  id           bigserial PRIMARY KEY,
  lan_tinh_id  bigint NOT NULL REFERENCES lan_tinh(id) ON DELETE CASCADE,
  ky           date,
  loai         varchar(50) NOT NULL,
  ma           varchar(80),
  noi_dung     text NOT NULL
);
COMMENT ON TABLE kq_canh_bao IS 'Cảnh báo phát sinh khi tính (mục "Cảnh báo khác khi tính toán", kiểm tra lệnh)';

-- =====================================================================
-- 7. NHẬT KÝ THAY ĐỔI (dùng khi lên hệ thống thật nhiều người dùng)
-- =====================================================================
CREATE TABLE nhat_ky_thay_doi (
  id          bigserial PRIMARY KEY,
  cong_ty_id  bigint REFERENCES cong_ty(id) ON DELETE CASCADE,
  bang        varchar(60) NOT NULL,
  ban_ghi_id  bigint,
  hanh_dong   varchar(10) NOT NULL CHECK (hanh_dong IN ('THEM','SUA','XOA','NHAP_EXCEL','TINH')),
  du_lieu_cu  jsonb,
  du_lieu_moi jsonb,
  nguoi_dung  varchar(200),
  luc         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ix_nhat_ky ON nhat_ky_thay_doi (cong_ty_id, bang, luc DESC);

-- ---------- Chặn sửa chứng từ của kỳ đã khóa ----------
-- Lưu ý: trong trigger BEFORE, cột sinh tự động (ky) chưa được tính → lấy kỳ từ cột ngày truyền qua TG_ARGV[0]
CREATE FUNCTION chan_ky_da_khoa() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE k_moi date; k_cu date;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    k_cu := date_trunc('month', (to_jsonb(OLD) ->> TG_ARGV[0])::date::timestamp)::date;
    IF EXISTS (SELECT 1 FROM ky WHERE cong_ty_id = OLD.cong_ty_id AND ky.ky = k_cu AND da_khoa) THEN
      RAISE EXCEPTION 'Kỳ % đã khóa – mở khóa trước khi sửa (bảng %)', to_char(k_cu,'MM/YYYY'), TG_TABLE_NAME;
    END IF;
  END IF;
  IF TG_OP <> 'DELETE' THEN
    k_moi := date_trunc('month', (to_jsonb(NEW) ->> TG_ARGV[0])::date::timestamp)::date;
    IF EXISTS (SELECT 1 FROM ky WHERE cong_ty_id = NEW.cong_ty_id AND ky.ky = k_moi AND da_khoa) THEN
      RAISE EXCEPTION 'Kỳ % đã khóa – mở khóa trước khi sửa (bảng %)', to_char(k_moi,'MM/YYYY'), TG_TABLE_NAME;
    END IF;
    RETURN NEW;
  END IF;
  RETURN OLD;
END $$;
CREATE TRIGGER tg_khoa_mua   BEFORE INSERT OR UPDATE OR DELETE ON mua_hang        FOR EACH ROW EXECUTE FUNCTION chan_ky_da_khoa('ngay_nhap_kho');
CREATE TRIGGER tg_khoa_ban   BEFORE INSERT OR UPDATE OR DELETE ON ban_hang        FOR EACH ROW EXECUTE FUNCTION chan_ky_da_khoa('ngay_hoa_don');
CREATE TRIGGER tg_khoa_xuat  BEFORE INSERT OR UPDATE OR DELETE ON xuat_dung_chung FOR EACH ROW EXECUTE FUNCTION chan_ky_da_khoa('ngay_xuat');
CREATE TRIGGER tg_khoa_lenh  BEFORE INSERT OR UPDATE OR DELETE ON lenh_san_xuat   FOR EACH ROW EXECUTE FUNCTION chan_ky_da_khoa('ngay_xuat_nvl');
CREATE TRIGGER tg_khoa_cp    BEFORE INSERT OR UPDATE OR DELETE ON chi_phi_thang   FOR EACH ROW EXECUTE FUNCTION chan_ky_da_khoa('ky');

COMMIT;
