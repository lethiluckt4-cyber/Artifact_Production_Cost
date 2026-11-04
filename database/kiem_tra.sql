-- Kiểm tra nhanh sau khi nạp: số dòng theo công ty + đối chiếu kết quả tính
SET search_path TO gia_thanh, public;

SELECT c.ma AS cong_ty,
       (SELECT count(*) FROM hang_hoa      x WHERE x.cong_ty_id = c.id) AS hang_hoa,
       (SELECT count(*) FROM dinh_muc      x WHERE x.cong_ty_id = c.id) AS dinh_muc,
       (SELECT count(*) FROM mua_hang      x WHERE x.cong_ty_id = c.id) AS mua_hang,
       (SELECT count(*) FROM ban_hang      x WHERE x.cong_ty_id = c.id) AS ban_hang,
       (SELECT count(*) FROM lenh_san_xuat x WHERE x.cong_ty_id = c.id) AS lenh_sx,
       (SELECT count(*) FROM xuat_dung_chung x WHERE x.cong_ty_id = c.id) AS xuat_chung,
       (SELECT count(*) FROM lan_tinh      x WHERE x.cong_ty_id = c.id) AS lan_tinh
FROM cong_ty c ORDER BY c.id;

-- Kết quả tính phải tự khớp: 154 = 621 + 622 + 627 ; giá thành nhập kho = 154 − thu hồi SP lỗi
SELECT 'Lệnh lệch công thức 154' AS kiem_tra, count(*) AS so_dong
FROM kq_lenh_san_xuat
WHERE abs(c154 - (c621 + c622 + c627)) > 0.01 OR abs(gia_thanh_nhap_kho - (c154 - thu_hoi_sp_loi)) > 0.01
UNION ALL
SELECT 'Tháng lệch tổng 154 (kq_ky vs tổng lệnh)', count(*)
FROM (SELECT k.lan_tinh_id, k.ky, k.sum_154, sum(l.c154) s
      FROM kq_ky k JOIN kq_lenh_san_xuat l USING (lan_tinh_id, ky)
      GROUP BY 1, 2, 3 HAVING abs(k.sum_154 - sum(l.c154)) > 1) t
UNION ALL
SELECT 'Lệnh chưa có kết quả trong lần tính hiện hành', count(*)
FROM lenh_san_xuat l JOIN lan_tinh lt ON lt.cong_ty_id = l.cong_ty_id AND lt.la_hien_hanh
WHERE NOT EXISTS (SELECT 1 FROM kq_lenh_san_xuat k WHERE k.lan_tinh_id = lt.id AND k.lenh_id = l.id);
