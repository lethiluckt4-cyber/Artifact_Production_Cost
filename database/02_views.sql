-- =====================================================================
-- VIEW báo cáo – đọc từ dữ liệu nhập và lần tính hiện hành (lan_tinh.la_hien_hanh)
-- =====================================================================
SET search_path TO gia_thanh, public;

-- Danh mục hàng kèm nhóm / loại
CREATE OR REPLACE VIEW v_hang_hoa AS
SELECT h.cong_ty_id, h.id, h.ma, h.ten, h.dvt, h.kho, n.ten AS nhom_hang, n.loai AS loai_nhom, n.thu_tu
FROM hang_hoa h JOIN nhom_hang n ON n.id = h.nhom_hang_id;

-- Mua hàng + cột "Mua hàng chưa HĐ" đúng quy định mockup:
--   ngày nhập kho ≠ ngày hóa đơn → 'x'; hóa đơn có tách (cùng số HĐ + NCC có cả dòng cùng ngày và khác ngày):
--   dòng cùng ngày hiện số HĐ, dòng khác ngày hiện 'x - <số HĐ>'
CREATE OR REPLACE VIEW v_mua_hang AS
WITH g AS (
  SELECT cong_ty_id, so_hoa_don, coalesce(ten_nha_cung_cap,'') AS ncc,
         bool_or(ngay_hoa_don IS NOT NULL AND ngay_nhap_kho <> ngay_hoa_don) AS co_khac,
         bool_or(ngay_hoa_don IS NULL OR ngay_nhap_kho = ngay_hoa_don)    AS co_cung
  FROM mua_hang WHERE so_hoa_don IS NOT NULL AND so_hoa_don <> '' GROUP BY 1,2,3)
SELECT m.*, h.ma, h.ten AS ten_hang, h.dvt,
       CASE WHEN g.co_khac AND g.co_cung THEN
              CASE WHEN m.ngay_hoa_don IS NOT NULL AND m.ngay_nhap_kho <> m.ngay_hoa_don THEN 'x - ' || m.so_hoa_don ELSE m.so_hoa_don END
            WHEN m.ngay_hoa_don IS NOT NULL AND m.ngay_nhap_kho <> m.ngay_hoa_don THEN 'x' ELSE '' END AS mua_hang_chua_hd,
       CASE WHEN m.so_luong <> 0 THEN m.thanh_tien / m.so_luong END AS don_gia_tinh
FROM mua_hang m JOIN hang_hoa h ON h.id = m.hang_hoa_id
LEFT JOIN g ON g.cong_ty_id = m.cong_ty_id AND g.so_hoa_don = m.so_hoa_don AND g.ncc = coalesce(m.ten_nha_cung_cap,'');

-- NXT của lần tính hiện hành
CREATE OR REPLACE VIEW v_nxt AS
SELECT l.cong_ty_id, x.ky, h.kho, h.ma, h.ten AS mat_hang, n.ten AS nhom, h.dvt,
       x.gia_von, x.ton_dau_sl, x.ton_dau_tt, x.nhap_sl, x.nhap_tt, x.xuat_sl, x.xuat_tt, x.ton_cuoi_sl, x.ton_cuoi_tt,
       x.don_gia_bq_mua, x.can_lay_15_ngay, x.bq_ngay, x.so_ngay_con_dung, x.phan_loai, x.trang_thai
FROM kq_nxt x JOIN lan_tinh l ON l.id = x.lan_tinh_id AND l.la_hien_hanh
JOIN hang_hoa h ON h.id = x.hang_hoa_id JOIN nhom_hang n ON n.id = h.nhom_hang_id;

-- Giá thành theo lệnh (tab "Theo lệnh sản xuất")
CREATE OR REPLACE VIEW v_gia_thanh_lenh AS
SELECT l.cong_ty_id, k.ky, o.ma_lenh, o.ngay_san_xuat, h.ma AS ma_san_pham, h.ten AS ten_san_pham, k.cong_doan,
       o.sl_lenh, o.dieu_chinh_tp, k.sl_thuc_hien, k.so_me, k.sl_loi, k.sl_dat,
       k.c621, k.c622, k.c627, k.c154, k.thu_hoi_sp_loi, k.gia_thanh_nhap_kho, k.gia_thanh_dv, k.tinh_trang
FROM kq_lenh_san_xuat k JOIN lan_tinh l ON l.id = k.lan_tinh_id AND l.la_hien_hanh
JOIN lenh_san_xuat o ON o.id = k.lenh_id JOIN hang_hoa h ON h.id = o.san_pham_id;

-- Tổng hợp bán hàng theo mặt hàng (giá vốn = giá vốn BQ tháng bán)
CREATE OR REPLACE VIEW v_tong_hop_ban_hang AS
SELECT b.cong_ty_id, b.ky, h.ma, h.ten AS mat_hang, n.ten AS nhom, h.dvt,
       sum(b.so_luong) AS sl_ban,
       sum(b.doanh_so) / nullif(sum(b.so_luong),0) AS don_gia_ban_bq,
       sum(b.doanh_so) AS doanh_so,
       max(x.gia_von) AS gia_von,
       sum(b.so_luong) * max(x.gia_von) AS gia_von_hang_ban,
       sum(b.doanh_so) - sum(b.so_luong) * max(x.gia_von) AS lai_gop
FROM ban_hang b JOIN hang_hoa h ON h.id = b.hang_hoa_id JOIN nhom_hang n ON n.id = h.nhom_hang_id
LEFT JOIN (SELECT x.ky, x.hang_hoa_id, x.gia_von FROM kq_nxt x JOIN lan_tinh l ON l.id = x.lan_tinh_id AND l.la_hien_hanh) x
       ON x.ky = b.ky AND x.hang_hoa_id = b.hang_hoa_id
GROUP BY b.cong_ty_id, b.ky, h.ma, h.ten, n.ten, h.dvt;

-- Chi phí 622/627 theo tháng (nhập) + kết quả tính
CREATE OR REPLACE VIEW v_chi_phi_thang AS
SELECT c.cong_ty_id, c.ky,
       sum(c.so_tien) FILTER (WHERE lc.nhom = '622') AS tong_622_nhap,
       sum(c.so_tien) FILTER (WHERE lc.nhom = '627') AS tong_627_nhap,
       max(k.gas_627) AS xuat_dung_chung_627, max(k.chi_641) AS ban_hang_641,
       max(k.sum_621) AS c621, max(k.sum_154) AS c154, max(k.thu_hoi_sp_loi) AS thu_hoi_sp_loi,
       max(k.chua_phan_bo_622) + max(k.chua_phan_bo_627) AS chua_phan_bo
FROM chi_phi_thang c JOIN loai_chi_phi lc ON lc.id = c.loai_chi_phi_id
LEFT JOIN (SELECT k.* , l.cong_ty_id FROM kq_ky k JOIN lan_tinh l ON l.id = k.lan_tinh_id AND l.la_hien_hanh) k
       ON k.cong_ty_id = c.cong_ty_id AND k.ky = c.ky
GROUP BY c.cong_ty_id, c.ky;

-- Rủi ro tồn kho cần xử lý (Cảnh báo & kiểm tra) – âm kho xếp đầu
CREATE OR REPLACE VIEW v_rui_ro_ton_kho AS
SELECT * FROM v_nxt
WHERE ton_cuoi_sl < 0 OR phan_loai = 'RUI_RO_CAO' OR trang_thai LIKE '%cần mua%'
ORDER BY (ton_cuoi_sl < 0) DESC, ma;
