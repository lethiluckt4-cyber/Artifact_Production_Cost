# Sơ đồ quan hệ (ERD) – schema `giathanh`

Đa công ty: `company` ở gốc; mọi bảng nghiệp vụ có `company_id` và khóa ngoại ghép `(company_id, mã hàng)` về `item`, để dữ liệu hai công ty không lẫn vào nhau.

```mermaid
erDiagram
  company ||--|| company_setting : "thiết lập"
  company ||--o{ cost_column : "cột chi phí"
  company ||--o{ risk_threshold : "ngưỡng rủi ro"
  company ||--o{ period_lock : "khóa kỳ"
  company ||--o{ work_calendar : "lịch nghỉ / tăng ca"
  company ||--o{ item : "danh mục hàng"
  item_group ||--o{ item : "nhóm hàng"

  item ||--o{ bom_line : "TP / NVL / thay thế"
  item ||--o{ material_substitution : "NVL gốc / thay thế"
  item ||--o{ production_capacity : "năng lực SX"
  item ||--o{ opening_balance : "số dư đầu kỳ"
  item ||--o{ purchase : "mua hàng"
  item ||--o{ sale : "bán hàng"
  item ||--o{ production_plan : "kế hoạch SX"
  item ||--o{ production_order : "lệnh SX"
  item ||--o{ common_issue : "xuất dùng chung"

  production_order ||--o{ order_material_adjustment : "điều chỉnh NVL"
  cost_column ||--o{ period_cost : "chi phí 622/627 theo tháng"

  company ||--o{ cost_run : "lần tính giá thành"
  cost_run ||--o{ cost_order_result : "giá thành theo lệnh"
  production_order ||--o{ cost_order_result : ""
  cost_order_result ||--o{ cost_material_line : "chi tiết NVL"
  cost_run ||--o{ inventory_result : "nhập - xuất - tồn"
  item ||--o{ inventory_result : ""
```

## Nhóm bảng
| Nhóm | Bảng |
|---|---|
| Công ty và thiết lập | `company`, `company_setting`, `cost_column`, `risk_threshold`, `period_lock`, `work_calendar` |
| Dữ liệu nền | `item_group`, `item`, `bom_line`, `material_substitution`, `production_capacity`, `opening_balance` |
| Phát sinh hằng ngày | `purchase`, `sale`, `production_plan`, `production_order`, `order_material_adjustment`, `common_issue`, `period_cost` |
| Kết quả tính (snapshot) | `cost_run`, `cost_order_result`, `cost_material_line`, `inventory_result` |
| View | `v_item_has_bom`, `v_period_cost_summary`, `v_purchase_without_invoice` |

## Luồng dữ liệu
Dữ liệu nền + phát sinh → phần mềm tính (giá vốn bình quân, 621 từ định mức, phân bổ 622 / 627) → ghi kết quả vào nhóm *Kết quả tính*. Khóa kỳ lưu bản chốt (`cost_run.is_locked_snapshot = true`) và dòng ở `period_lock`.
