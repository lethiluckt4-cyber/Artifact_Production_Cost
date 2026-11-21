# src/ – Mã nguồn Phần mềm Giá thành, chia theo thư mục

`artifact/index.html` (bản chạy trên claude.ai) được **ghép tự động** từ thư mục này. Sửa code ở `src/`, rồi ghép lại:

```
python3 build.py          # ghép src/ → artifact/index.html
python3 build.py --check  # chỉ kiểm tra artifact/index.html có khớp src/ không
```

- Bản ghép ra giống **từng byte** với bản đang chạy trên artifact.
- Các tệp `.js` là các **đoạn của một script chung**, không phải module. Chúng dùng chung biến toàn cục (`state`, `view`, `selKy`, `$`, `esc`, `num`…). Vì vậy:
  - **Thứ tự ghép** nằm trong `src/index.html`: mỗi dòng `//@include …` là một tệp. Thêm tệp mới thì thêm 1 dòng `//@include` đúng vị trí.
  - Không mở riêng một tệp `.js` để chạy. Luôn chạy bản ghép `artifact/index.html`.
- Muốn xem bố cục từng màn hình mà không cần chạy: mở `screens-preview/index.html`.

## Cấu trúc

```
src/
  index.html                 Khung trang: <head>, menu (#nav), vùng nội dung (#main), hộp thoại (#modal) + danh sách //@include
  css/app.css                Toàn bộ giao diện: màu, chữ, bảng, nút, tab, hộp thoại
  data/seed.json             Dữ liệu demo 2026 nhúng sẵn (nút "Nạp dữ liệu năm 2026")
  js/
    00_bao-ve-khoi-dong.js   Báo lỗi rõ ràng khi trang khởi động lỗi / treo
    00_dau-trang.js          'use strict' + sơ đồ mã nguồn
    core/                    Phần nền dùng chung
    calc/                    Công thức tính (giá thành, NXT, đề xuất, chuyển ngày nhập kho)
    ui/                      Khung giao diện, bảng kiểu Excel, lưới nhập liệu, biểu tượng
    screens/                 Mỗi màn hình một tệp (nhap-lieu/ = các màn nhập liệu, thiet-lap/ = các tab Thiết lập)
    99_khoi-dong.js          Khởi động: tải dữ liệu, hiện màn hình đang làm dở
```

### core/ – phần nền
| Tệp | Nội dung |
|---|---|
| `tien-ich.js` | `$`, `esc`, `num`, định dạng số / ngày / kỳ (`fmtN`, `fmtQ`, `fmtP`, `fmtD`), số âm trong ngoặc, `toast` |
| `ghi-excel.js` | Bộ ghi .xlsx tự viết `XW` (book_new, aoa_to_sheet…), phông Aptos Narrow, định dạng ngày / số âm đỏ |
| `dinh-nghia-du-lieu.js` | `F` (thứ tự cột lưu trữ của từng loại chứng từ), nhóm hàng, tham số mặc định, sản phẩm lỗi, `TEMPLATE` / `SAMPLES` (mẫu nhập Excel) |
| `trang-thai.js` | `state` – dữ liệu đang mở |
| `luu-tru.js` | Lưu trữ: kho DB của artifact → IndexedDB → bộ nhớ; `toDocs` / `fromDocs` (chia tài liệu theo tháng `p_/s_/o_/i_/c_YYYY-MM`) |
| `chay-tinh-va-khoa-ky.js` | `changed`, chạy Tính giá thành theo chuỗi (`runCalcFor`, `showCalcResult`), khóa / mở khóa kỳ |
| `kiem-tra-danh-muc.js` | Đọc file Excel: báo mã chưa có trong danh mục, cho bổ sung rồi nạp |
| `xuat-file.js` | `saveWb`, xuất đúng bảng đang xem (`tableAOA`, `exportTable`) |
| `lam-moi-du-lieu.js` | Nút Làm mới dữ liệu (tải lại bản mới nhất trên tài khoản) |

### calc/ – công thức
| Tệp | Nội dung |
|---|---|
| `ky-va-dinh-muc.js` | Danh sách kỳ, kỳ đang xem, định mức theo hiệu lực, trải định mức nhiều cấp |
| `tinh-gia-thanh.js` | **`calc()`** – trái tim phần mềm: SL thực hiện, xuất NVL, phân bổ 622/627 theo công đoạn, giá BTP / TP, NXT, giá vốn bán, chuyển số dư sang kỳ sau |
| `canh-bao-gia.js` | Chênh lệch giá mua / bán so với giá so sánh |
| `ke-hoach-de-xuat.js` | Đề xuất sản xuất (`buildPlan`, `applyPlanCore`), đề xuất cân đối NVL khi tồn âm (`buildAdjProposal`) |
| `chuyen-ngay-nhap-kho.js` | Cột "Mua hàng chưa HĐ", đề xuất chuyển ngày nhập kho, bỏ chuyển kho (↩), tách / gộp dòng mua |

### ui/ – giao diện dùng chung
| Tệp | Nội dung |
|---|---|
| `khung-giao-dien.js` | Menu `NAV`, `render()` (chọn màn hình theo `view`), chọn kỳ, ô tìm theo tab, `head()`, `table()` |
| `hop-thoai.js` | `modal()`, `closeModal()` |
| `luoi-nhap-lieu.js` | `vGrid()` – lưới nhập liệu sửa trực tiếp (thêm / sửa / xóa / tách dòng, tính ngay khi gõ) |
| `nhap-excel-hop-thoai.js` | Hộp thoại xác nhận, đổi NVL định mức, dán / nhập Excel |
| `bang-excel-trang-thai.js`, `bang-excel-loc-sap-xep.js` | Bảng kiểu Excel: lọc cột, sắp xếp, cố định cột, lọc số / chữ / ngày, bộ lọc tùy chỉnh |
| `bieu-tuong.js` | Bộ biểu tượng nút, tự gắn theo nhãn |
| `bo-cuc-man-hinh.js` | Kéo bảng sát đáy, xếp thanh công cụ, ô nhập kỳ mm/yyyy |
| `thiet-lap-bang.js` | Ẩn / hiện / đổi thứ tự cột, mật độ dòng (nhớ theo từng bảng) |
| `giu-cho-dang-lam.js` | Nhớ menu, tab, kỳ, ô tìm, vị trí cuộn khi tải lại |
| `so-am-to-do.js` | Tô đỏ mọi số âm dạng (…) |

## Màn hình → tệp mã nguồn → bản xem tĩnh

| Menu | Màn hình / tab | Mã nguồn (`src/js/…`) | Bản xem tĩnh (`screens-preview/…`) |
|---|---|---|---|
| | Tổng quan | `screens/tong-quan.js` | `01_tong-quan.html` |
| | Cảnh báo & kiểm tra (3 tab) | `screens/canh-bao-kiem-tra.js`, tab Ngưỡng: `screens/thiet-lap/nguong-tham-so.js` | `02a…`, `02b…`, `02c…` |
| 1 · Dữ liệu nền | Danh mục hàng / Nhóm hàng | cột: `screens/nhap-lieu/cau-hinh-luoi.js` (GRID.items) + `screens/nhap-lieu/danh-muc-nhom-hang.js` | `03a…`, `03b…` |
| | Số dư NXT đầu kỳ | `screens/nhap-lieu/so-du-dau-ky.js` | `04_so-du-dau-ky.html` |
| | Định mức | `screens/nhap-lieu/cau-hinh-luoi.js` (GRID.bom) | `05_dinh-muc.html` |
| | NVL thay thế | `screens/nhap-lieu/cau-hinh-luoi.js` (GRID.subs) | `06_nvl-thay-the.html` |
| 2 · Phát sinh hằng ngày | Mua hàng / Bán hàng | `screens/nhap-lieu/cau-hinh-luoi.js` (GRID.purchases, GRID.sales) | `07a…`, `07b…` |
| | Xuất dùng chung | `screens/nhap-lieu/cau-hinh-luoi.js` (GRID.issues) | `08_xuat-dung-chung.html` |
| | Chi phí 622/627 | `screens/nhap-lieu/chi-phi-622-627.js` | `09_chi-phi-622-627.html` |
| 3 · Kế hoạch & giá thành | Luồng xử lý | `screens/luong-xu-ly.js` | `10_luong-xu-ly.html` |
| | Đề xuất sản xuất | `screens/de-xuat-san-xuat.js` (+ tính: `calc/ke-hoach-de-xuat.js`) | `11_de-xuat-san-xuat.html` |
| | Lệnh sản xuất | `screens/nhap-lieu/cau-hinh-luoi.js` (GRID.orders) | `12_lenh-san-xuat.html` |
| | Cân đối NVL (chi tiết / tổng hợp) | GRID.adjustments + `screens/nhap-lieu/can-doi-nvl-tong-hop.js` (+ `calc/chuyen-ngay-nhap-kho.js`) | `13a…`, `13b…` |
| | Giá thành (4 tab) | `screens/gia-thanh.js` | `15a…` → `15d…` |
| 4 · Báo cáo | Nhập – Xuất – Tồn, Thẻ kho | `screens/nhap-xuat-ton.js`, `screens/the-kho.js` | `14a…`, `14b…` |
| | Tổng hợp bán hàng theo mặt hàng | `screens/tong-hop-ban-hang.js` | `16_tong-hop-ban-hang.html` |
| | Tổng hợp năm | `screens/tong-hop-nam.js` | `17_tong-hop-nam.html` |
| | File tải dữ liệu kế toán (XK NVL, NK TP, HĐ chuyển ngày nhập kho – 4 sheet) | `screens/xuat-phieu-ke-toan.js` | `18a…` → `18f…` |
| Hệ thống | Thiết lập & sao lưu / Lịch nghỉ / Phân bổ 622-627 / Sản phẩm lỗi | `screens/thiet-lap/thiet-lap-sao-luu.js`, `phan-bo-622-627.js`, `san-pham-loi.js` | `19a…` → `19d…` |
| | Hướng dẫn | `screens/huong-dan.js` | `20_huong-dan.html` |
| (không có menu) | Tải dữ liệu, Chi phí (báo cáo) | `screens/tai-du-lieu.js`, `screens/chi-phi-bao-cao.js` | – |

## Quy trình sửa → chạy thử → đưa lên artifact
1. Sửa tệp trong `src/` (ví dụ thêm cột Mua hàng: `screens/nhap-lieu/cau-hinh-luoi.js`, khóa `purchases`).
2. `python3 build.py` để ghép lại `artifact/index.html`.
3. Mở `artifact/index.html` bằng Chrome để thử. Chạy kiểm thử trong `tests/` nếu cần.
4. Chụp lại bản xem tĩnh: `cd tests && node chup_ban_xem_tinh.js ../data/<tệp sao lưu>.json`.
5. Xuất bản `artifact/index.html` lên artifact trên claude.ai.
