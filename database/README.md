# Database – Phần mềm Giá thành

Thiết kế cơ sở dữ liệu quan hệ **PostgreSQL 14+** cho hệ thống dựng từ bản mockup artifact (`artifact/index.html`). Mỗi "tài liệu" của kho `gt` trong mockup (`settings`, `items`, `bom`, `p_YYYY-MM`…) được tách thành bảng riêng; hỗ trợ **nhiều công ty** trong cùng một database (cột `company_id`).

## Cấu trúc thư mục
```
database/
  migrations/0001_init.sql          Schema đầy đủ: 22 bảng + 3 view + trigger (schema `giathanh`)
  seed/demo_thao_vy.sql             Dữ liệu demo KH Thảo Vy tháng 10/2026 (sinh tự động, nạp được ngay)
  backups/                          Nơi lưu bản sao lưu database
    giathanh_demo_thao_vy_2026-11-04.sql   Bản pg_dump (schema + dữ liệu demo), phục hồi bằng 1 lệnh
  docs/
    ERD.md                          Sơ đồ quan hệ (Mermaid) và nhóm bảng
    DATA_DICTIONARY.md              Từ điển dữ liệu: từng cột, kiểu, ràng buộc, field tương ứng trong phần mềm
  tools/
    build_seed_sql.py               Chuyển file sao lưu .json của phần mềm → SQL nạp dữ liệu
    gen_dictionary.py               Sinh lại docs/DATA_DICTIONARY.md từ chú thích trong schema
    test_schema.sh                  Kiểm tra schema + dữ liệu demo trên database tạm
```

## Cách dùng
**Dựng database mới và nạp dữ liệu demo**
```
createdb giathanh
psql -d giathanh -v ON_ERROR_STOP=1 -f database/migrations/0001_init.sql
psql -d giathanh -v ON_ERROR_STOP=1 -f database/seed/demo_thao_vy.sql
```
**Hoặc phục hồi một lần từ bản sao lưu**
```
createdb giathanh
psql -d giathanh -v ON_ERROR_STOP=1 -f database/backups/giathanh_demo_thao_vy_2026-11-04.sql
```
**Nạp dữ liệu thật của công ty khác**: xuất file sao lưu `.json` từ phần mềm (Thiết lập & sao lưu → Sao lưu), rồi
```
python3 database/tools/build_seed_sql.py SaoLuu_xxx.json ra.sql MA_CONG_TY
psql -d giathanh -v ON_ERROR_STOP=1 -f ra.sql
```
(`build_seed_sql.py` dùng `company.id = 1`; nạp công ty thứ hai thì đổi `CID` trong script hoặc nạp vào database khác.)

**Kiểm tra**: `PGHOST=... PGUSER=... database/tools/test_schema.sh` (tạo database tạm, nạp schema + dữ liệu, so số dòng và doanh số tháng 10/2026 = 2.868.789.838 đ, rồi xóa).

## Nhóm bảng
| Nhóm | Bảng |
|---|---|
| Công ty và thiết lập | `company`, `company_setting`, `cost_column`, `risk_threshold`, `period_lock`, `work_calendar` |
| Dữ liệu nền | `item_group`, `item`, `bom_line`, `material_substitution`, `production_capacity`, `opening_balance` |
| Phát sinh hằng ngày | `purchase`, `sale`, `production_plan`, `production_order`, `order_material_adjustment`, `common_issue`, `period_cost` |
| Kết quả tính (snapshot) | `cost_run`, `cost_order_result`, `cost_material_line`, `inventory_result` |

## Quyết định thiết kế
- **Mã hàng là khóa nghiệp vụ**: `item(company_id, code)`; mọi chứng từ tham chiếu bằng khóa ngoại ghép, nên không thể mua / bán / sản xuất mã chưa có trong Danh mục (giống việc phần mềm chặn nhập Excel khi thiếu mã).
- **Không lưu cột "kỳ" ở bảng phát sinh**: kỳ lấy từ ngày (ngày nhập kho, ngày hóa đơn, ngày xuất NVL, ngày SX). Bảng theo kỳ (`opening_balance`, `period_cost`, `period_lock`, `cost_run`) dùng `period char(7)` dạng `YYYY-MM`.
- **Chi phí 622 / 627** lưu theo dòng `(kỳ, cột chi phí)` thay vì cột cố định, vì người dùng thêm cột chi phí mới được (`cost_column`).
- **Kết quả tính chỉ là snapshot**: phần mềm vẫn tính lại từ dữ liệu gốc; bảng `cost_*` và `inventory_result` để xem lại, khóa kỳ và xuất báo cáo nhanh. Chưa có code ghi vào các bảng này, cần viết khi dựng backend.
- **Giá trị tên thay vì mã ở vài cột**: `item.group_code` dùng đúng giá trị của phần mềm (`Thành phẩm`, `NVLC`, `PG`, `GV`, `BB`, `Khác`) để ánh xạ 1:1.

## Chưa có trong schema
- Người dùng, vai trò, phân quyền: mockup hiện chưa có (artifact dùng quyền của tài khoản claude.ai). Thêm khi dựng hệ thống thật, kèm Row-Level Security theo `company_id` nếu dùng chung một database.
- Nhật ký thay đổi (audit log) và lịch sử các đề xuất sản xuất đã áp dụng (mục "chưa làm" của phần mềm).
- Bản sao lưu trong `backups/` chứa số liệu kinh doanh thật của KH Thảo Vy; repo đang công khai, nên chuyển sang riêng tư nếu cần.
