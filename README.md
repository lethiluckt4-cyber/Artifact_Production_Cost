# Phần mềm Giá thành – Công ty Dương Vân (may đồ bơi)

Branch `duong-van-gia-thanh` lưu toàn bộ phần mềm, dữ liệu và tài liệu của phần mềm tính giá thành Công ty Dương Vân, bản ngày 21/11/2026.

Phần mềm là **một file HTML duy nhất**, mở bằng Chrome/Edge là chạy. Bản đang dùng nằm trên claude.ai (artifact "Phần mềm Giá thành – Công ty Dương Vân"), dữ liệu sống lưu trong kho dữ liệu của artifact đó. Repo này là bản sao để lưu trữ và dựng lại.

## Cấu trúc thư mục

| Thư mục | Nội dung |
|---|---|
| `app/PhanMem_GiaThanh_DuongVan.html` | Phần mềm đang dùng (bản 18/11/2026), có sẵn dữ liệu mẫu năm 2026 |
| `app/KhungPhanMem_theo_PM_GiaThanh.html` | Khung phần mềm cùng giao diện, dữ liệu trống – dùng làm phần mềm cho dự án khác |
| `data/SaoLuu_GiaThanh_2026-11-18.json` | **Sao lưu đầy đủ dữ liệu** (49 bản ghi: danh mục, định mức, số dư đầu kỳ, mua, bán, gia công, lệnh SX, cân đối NVL, chi phí 622/627, lịch, thiết lập). Khôi phục: Thiết lập & sao lưu → Khôi phục |
| `data/kiem_toan_ket_qua_2026-11-18.json` | Kết quả rà soát số liệu trên bản sao lưu |
| `data/nap_du_lieu/` | Dữ liệu nạp ban đầu T01–T11/2026 và các file trung gian |
| `data/goi_mau/` | Dữ liệu mẫu và kết quả kỳ vọng dùng để đối chiếu với Excel |
| `data/nam_2025/` | Workbook giá thành 2025 dựng theo ngày (`GiaThanh_DuongVan_2025.xlsx`) và script dựng |
| `nguon/` | File gốc người dùng cung cấp: GT 12-26 DV, Dương Vân 2025, sổ chi tiết mua / bán, định mức, chi phí chung, danh sách hàng hóa, mẫu file tải ASP, gói mẫu phần mềm |
| `ke_toan/` | File tải ASP: `KeToan_ASP_2026.xlsx` (XK NVL, NK TP, 4 sheet hóa đơn chuyển ngày), file mua vào + NVK và script `build_nvk.py` |
| `docs/` | Tài liệu: 01 đặc tả chức năng, 02 quy định nghiệp vụ & công thức, 03 giao diện, 04 hướng dẫn xây dựng cho công ty mới, 05 nhật ký yêu cầu, 06 thay đổi cho Dương Vân, 07 file tải hóa đơn chuyển ngày nhập kho |
| `docs/quy_chuan_giao_dien/` | Quy chuẩn giao diện (menu, font, màu, nút, tab, cột từng màn hình, cách thiết lập bảng và nút Excel) – bản `.md` và `.docx` |
| `cong_cu/`, `tests/` | Script kiểm thử Playwright (đối chiếu số liệu, giao diện, xuất Excel) |

## Cách dùng nhanh

1. Tải `app/PhanMem_GiaThanh_DuongVan.html`, mở bằng trình duyệt.
2. Vào **Thiết lập & sao lưu → Khôi phục**, chọn `data/SaoLuu_GiaThanh_2026-11-18.json`.
3. Chạy **▶ Tính giá thành** cho kỳ cần xem.

Khi chạy ngoài claude.ai, dữ liệu lưu trong trình duyệt của máy đó; nhớ sao lưu định kỳ.
