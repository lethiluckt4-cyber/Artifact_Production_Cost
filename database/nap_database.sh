#!/usr/bin/env bash
# Nạp toàn bộ database giá thành vào PostgreSQL.
# Dùng:  ./nap_database.sh "postgresql://user:matkhau@localhost:5432/gia_thanh"
#        ./nap_database.sh "postgresql://..." --khong-demo     (bỏ công ty DEMO)
#        ./nap_database.sh "postgresql://..." --chi-schema     (chỉ tạo bảng, không dữ liệu)
set -euo pipefail
DB="${1:?Truyền chuỗi kết nối PostgreSQL, ví dụ postgresql://postgres@localhost:5432/gia_thanh}"
MODE="${2:-}"
cd "$(dirname "$0")"
run(){ echo "▶ $1"; psql "$DB" -v ON_ERROR_STOP=1 -q -f "$1"; }
run 01_schema.sql
run 02_views.sql
[ "$MODE" = "--chi-schema" ] && { echo "Xong (chỉ schema)."; exit 0; }
run 03_du_lieu_thien_hong_2026.sql
run 04_ket_qua_tinh_thien_hong_2026.sql
[ "$MODE" = "--khong-demo" ] || run 05_du_lieu_demo_2026.sql
psql "$DB" -q -f kiem_tra.sql
echo "Xong."
