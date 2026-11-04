# Artifact_Production_Cost – Phần mềm Giá thành KH Thảo Vy

Bộ **artifact hoàn chỉnh** của Phần mềm Giá thành cho **KH Thảo Vy** (chế biến thịt: pate, giò thủ, giò lụa, nem chua, da bao…), kèm **toàn bộ dữ liệu demo** (tháng 10/2026, chuyển từ file Excel `GT_10 - 26 TV.xlsx`). Dùng làm mẫu để dựng hệ thống.

- Phần mềm là một tệp HTML duy nhất (HTML + CSS + JavaScript thuần), không cần máy chủ. Thư viện ngoài: SheetJS và ExcelJS (cdnjs), phông Google Fonts.
- Đối chiếu Excel gốc tháng 10/2026: 132 lệnh sản xuất, tổng giá thành nhập kho (TK 154) = **1.735.493.282 đ**, khớp 100%.

> Branch này tách riêng với `main` và branch của công ty Thiên Hồng (`them-phan-mem-gia-thanh-thien-hong`).

## Cấu trúc
```
artifact/
  index.html                  Phần mềm đầy đủ, có nhúng dữ liệu demo T10/2026 (nút "Nạp dữ liệu")
  index_mau_trong.html        Bản mẫu trống cho công ty khác: không dữ liệu, tên [TÊN CÔNG TY]
  artifact_manifest.json      Khai báo artifact: capabilities db + downloads + user, bộ sưu tập dữ liệu "gt"
data/
  demo_seed_thao_vy.json                  Dữ liệu demo nhúng sẵn trong index.html (định dạng tài liệu)
  SaoLuu_GiaThanh_ThaoVy_demo_2026-10.json  Cùng dữ liệu, đúng định dạng file sao lưu của phần mềm (kèm lịch nghỉ 2026)
  db_gt/*.json                            Cùng dữ liệu, tách từng tài liệu của kho "gt" (tên tệp = id tài liệu)
  excel/                                  Mẫu nhập dữ liệu (11 sheet), mẫu mua / bán, dữ liệu T10 và báo cáo mẫu đã xuất
  excel_goc/                              File Excel gốc của công ty dùng để đối chiếu (GT_10-26_TV.xlsx, dm.xlsx)
  trung_gian/                             Dữ liệu trung gian do tools/extract.py, make_docs.py sinh ra từ Excel gốc
docs/
  02_MO_TA_HE_THONG_DUNG_CHUNG.md         Kiến trúc, mô hình dữ liệu, phần dùng chung / phần riêng theo công ty
  03_TINH_NANG_VA_QUY_DINH_DA_CHOT.md     Menu, quy trình, công thức, đề xuất, cảnh báo, giao diện, nhập / xuất
  04_HUONG_DAN_LAM_CHO_CONG_TY_MOI.md     Các bước dựng cho công ty khác, danh sách kiểm tra bàn giao
  hinh_anh/                               20 ảnh chụp các màn hình chính
database/                                 Thiết kế database PostgreSQL: schema, dữ liệu demo, sao lưu, ERD, từ điển dữ liệu (xem database/README.md)
tests/                                    Kiểm thử Playwright (test*.js)
tools/                                    extract.py, make_docs.py, make_template.py, export_phieu.js, shots_repo.js, mk_backup.js
```

## Dữ liệu demo
| | Số lượng |
|---|---|
| Danh mục hàng | 98 mã |
| Định mức | 269 dòng |
| Số dư đầu kỳ | 98 mã (kỳ 10/2026) |
| Mua hàng | 172 dòng (10/2026) |
| Bán hàng | 243 dòng (10/2026) |
| Lệnh sản xuất | 132 lệnh (10/2026) |
| Kế hoạch sản xuất | 196 dòng (10/2026) |
| Chi phí 622 / 627 | 6 tháng (05–10/2026) |
| Lịch nghỉ lễ 2026 | 15 ngày |

## Cách chạy
1. **Xem ngay trên máy:** mở `artifact/index.html` bằng Chrome / Edge. Ở **Tổng quan** bấm **Nạp dữ liệu tháng 10/2026**. Dữ liệu lưu trong trình duyệt của máy đó (cần mạng để tải SheetJS / ExcelJS).
2. **Phục hồi từ file sao lưu:** **Thiết lập & sao lưu → ⬆ Phục hồi từ file .json**, chọn `data/SaoLuu_GiaThanh_ThaoVy_demo_2026-10.json`.
3. **Dựng thành artifact trên claude.ai:** xuất bản `artifact/index.html`, khai báo capabilities theo `artifact_manifest.json`, rồi phục hồi từ file `.json` như bước 2. Cách khác: ghi từng tệp `data/db_gt/<id>.json` vào bộ sưu tập `gt` với id = tên tệp.
4. **Dựng cho công ty khác:** bắt đầu từ `artifact/index_mau_trong.html` và đọc `docs/04_HUONG_DAN_LAM_CHO_CONG_TY_MOI.md`.

## Chạy kiểm thử
```
cd tools && npm install && npx playwright install chromium
cd ../tests
node test3.js     # đối chiếu Excel: TK 154 tháng 10/2026 = 1.735.493.282
node test37.js    # mở mọi màn hình khi chưa có dữ liệu, không lỗi
```
Các kiểm thử `test*.js` còn lại kiểm từng luồng (đề xuất sản xuất, lưới nhập liệu, tìm kiếm, lịch nghỉ, tách dòng…); chạy bằng `node tests/<tên>.js`.

## Lưu ý
- **Phần tính giá thành là phần riêng theo công ty** (định mức theo mẻ, bao bì ≤ 10%, đề xuất theo tồn thành phẩm…). `index_mau_trong.html` chỉ bỏ dữ liệu và tên công ty, các phần riêng cần viết lại theo file Excel của công ty mới (xem docs/04).
- Số liệu đang là dữ liệu kinh doanh thật của KH Thảo Vy (nhà cung cấp, khách hàng, giá mua / bán, file Excel gốc). Repo đang **công khai**: nên chuyển sang riêng tư nếu không muốn người ngoài xem.
- Ảnh trong `docs/hinh_anh` chụp từ bản này; các tệp trong `data/excel/` (trừ mẫu nhập) là bản xuất ngày 31/10/2026.
