#!/usr/bin/env bash
# Kiểm tra schema + dữ liệu demo trên một database tạm.
# Dùng: PGHOST=... PGPORT=... PGUSER=... ./tools/test_schema.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB=giathanh_test_$$
psql -v ON_ERROR_STOP=1 -q -c "CREATE DATABASE $DB"
trap 'psql -q -c "DROP DATABASE IF EXISTS $DB" >/dev/null' EXIT
psql -d $DB -v ON_ERROR_STOP=1 -q -f migrations/0001_init.sql
psql -d $DB -v ON_ERROR_STOP=1 -q -f seed/demo_thao_vy.sql >/dev/null
chk() { # tên | câu lệnh | giá trị mong đợi
  got=$(psql -d $DB -At -c "SET search_path=giathanh; $2" | tail -1)
  if [ "$got" = "$3" ]; then echo "OK   $1 = $got"; else echo "LỖI $1: nhận $got, cần $3"; exit 1; fi
}
chk "danh mục hàng"   "SELECT count(*) FROM item" 98
chk "định mức"        "SELECT count(*) FROM bom_line" 269
chk "mua hàng"        "SELECT count(*) FROM purchase" 172
chk "bán hàng"        "SELECT count(*) FROM sale" 243
chk "lệnh sản xuất"   "SELECT count(*) FROM production_order" 132
chk "điều chỉnh NVL"  "SELECT count(*) FROM order_material_adjustment" 249
chk "doanh số T10"    "SELECT round(sum(revenue)) FROM sale WHERE invoice_date >= '2026-10-01' AND invoice_date < '2026-11-01'" 2868789838
chk "mã thiếu định mức ràng buộc" "SELECT count(*) FROM bom_line b LEFT JOIN item i ON i.company_id=b.company_id AND i.code=b.material_code WHERE i.code IS NULL" 0
# ràng buộc phải chặn dữ liệu sai
if psql -d $DB -q -c "SET search_path=giathanh; INSERT INTO sale(company_id,invoice_date,item_code,qty,revenue) VALUES (1,'2026-10-01','KHONG_CO',1,1)" 2>/dev/null; then echo "LỖI: cho phép bán mã không có trong danh mục"; exit 1; else echo "OK   chặn mã hàng không có trong danh mục"; fi
echo "Tất cả kiểm tra đạt."
