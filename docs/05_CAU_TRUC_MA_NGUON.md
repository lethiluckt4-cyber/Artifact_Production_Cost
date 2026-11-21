# 05 – Cấu trúc mã nguồn (src/) và cách phát triển

Phần mềm chạy trên claude.ai dưới dạng **một tệp HTML duy nhất** (`artifact/index.html`). Để dễ phát triển, mã nguồn được tách ra thư mục `src/` theo **từng màn hình** và **phần dùng chung**; công cụ `tools/build.js` ghép lại thành tệp duy nhất khi cần xuất bản.

> Mỗi màn hình **không có tệp .html riêng**: giao diện được dựng bằng JavaScript (chuỗi HTML trong hàm `vTenManHinh(m)` rồi gắn sự kiện). Vì vậy "HTML của từng màn" nằm trong tệp `.js` của thư mục màn hình đó. Khung trang chung (head, menu, vùng nội dung, hộp thoại) nằm ở `src/khung-trang.html`.

## Sơ đồ thư mục

```
src/
  khung-trang.html        Khung HTML chung: <head>, thư viện SheetJS/ExcelJS, #nav, #main, #modal
  manifest.json           THỨ TỰ nạp các tệp CSS/JS (bắt buộc giữ đúng thứ tự)
  dev.html                Bản phát triển – sinh tự động bởi tools/build.js, mở thẳng bằng trình duyệt
  data/seed.json          Dữ liệu mẫu nhúng trong #seed (bản mẫu trống dùng {})
  styles/                 Giao diện (CSS) chia theo thành phần
  core/                   Phần dùng chung: dữ liệu, lưu trữ, bộ máy tính, lưới nhập liệu, bảng, lọc, xuất Excel…
  screens/<màn-hình>/     Mỗi màn hình trên menu một thư mục
```

## Menu → thư mục màn hình

| Menu | `view` | Hàm vẽ | Tệp |
|---|---|---|---|
| Tổng quan | `tongquan` | `vTongQuan` | `screens/tong-quan/tong-quan.js` (+ `canh-bao-gia-rui-ro.js`) |
| Cảnh báo & kiểm tra | `canhbao` | `vCanhBao` | `screens/canh-bao/canh-bao.js` |
| Danh mục hàng | `d_items` | `vGrid('items')` | cột: `screens/nhap-lieu/cau-hinh-luoi.js`; Kiểm tra mã: `screens/danh-muc/kiem-tra-ma.js` |
| Số dư NXT đầu kỳ | `d_opening` | `vOpening` | `screens/so-du-dau-ky/so-du-dau-ky.js` |
| Định mức | `d_bom` | `vGrid('bom')` | `screens/nhap-lieu/cau-hinh-luoi.js` |
| NVL thay thế | `d_subs` | `vGrid('subs')` | `screens/nhap-lieu/cau-hinh-luoi.js` |
| Mua hàng & Bán hàng | `d_purchases` | `vGrid('purchases')` / `vGrid('sales')` | `screens/nhap-lieu/cau-hinh-luoi.js` |
| Lệnh sản xuất (kế hoạch) | `d_orders` | `vGrid('orders')` | `screens/nhap-lieu/cau-hinh-luoi.js` |
| Xuất dùng chung | `d_issues` | `vGrid('issues')` | `screens/nhap-lieu/cau-hinh-luoi.js` |
| Chi phí 622 / 627 | `d_costs` | `vCosts` | `screens/chi-phi/chi-phi-nhap.js` (+ `chi-phi-xem.js`) |
| Luồng xử lý | `luong` | `vLuong` | `screens/luong-xu-ly/luong-xu-ly.js` |
| Đề xuất sản xuất | `kehoach` | `vKeHoach` | `screens/de-xuat-san-xuat/` (`de-xuat.js` tính đề xuất, `ke-hoach.js` màn hình, `ap-dung-de-xuat.js` áp dụng / Đề xuất lại từ đầu) |
| Lệnh sản xuất thực tế | `lsxtt` | `vLsxThucTe` | `screens/lenh-sx-thuc-te/lenh-sx-thuc-te.js` |
| Cân đối NVL | `d_adjustments` | `vGrid('adjustments')` | `screens/can-doi-nvl/` (`xu-ly-nvl-am.js`: ① Chuyển ngày nhập kho, ↩ Bỏ chuyển kho, ② Cân đối; `tong-hop-theo-mat-hang.js`: tab Tổng hợp CĐ theo mặt hàng) |
| Giá thành | `giathanh` | `vGiaThanh` | `screens/gia-thanh/gia-thanh.js` |
| Nhập – Xuất – Tồn | `nxt` | `vNXT` | `screens/nhap-xuat-ton/nhap-xuat-ton.js` |
| Báo cáo bán hàng theo mặt hàng | `banhang` | `vBanHang` | `screens/bao-cao-ban-hang/bao-cao-ban-hang.js` |
| Tổng hợp năm | `nam` | `vNam` | `screens/tong-hop-nam/tong-hop-nam.js` |
| File tải dữ liệu kế toán | `xuatphieu` | `vXuatPhieu` | `screens/file-tai-ke-toan/file-tai-ke-toan.js` (mẫu ASP: XK NVL, NK TP, hóa đơn chuyển ngày nhập kho 4 sheet) |
| Thiết lập & sao lưu | `thietlap` | `vThietLap` | `screens/thiet-lap/thiet-lap.js` |
| Hướng dẫn | `huongdan` | `vHuongDan` | `screens/huong-dan/huong-dan.js` |
| (Tải dữ liệu từ Excel) | `taidulieu` | `vTaiDuLieu` | `screens/tai-du-lieu/tai-du-lieu.js` |

Bảng định tuyến `view → hàm vẽ` là hằng `R` trong hàm `render()` ở `core/giao-dien.js`; danh sách menu là hằng `NAV` cùng tệp.

## Phần dùng chung (core/)

| Tệp | Nội dung |
|---|---|
| `tien-ich.js` | `$`, `esc`, định dạng số/ngày (số âm hiển thị `(x)` màu đỏ), tìm kiếm không dấu, toast |
| `dinh-nghia-du-lieu.js` | Nhóm hàng, **F** (thứ tự cột lưu của từng bảng – chỉ được thêm cuối), lịch nghỉ, chi phí, mẫu Excel, `NUMF` |
| `trang-thai.js` | `state`, `view`, kỳ đang xem, ô tìm theo màn hình |
| `luu-tru.js` | Lưu DB artifact (bộ sưu tập `gt`, tự chia nhỏ tài liệu > 100.000 ký tự) hoặc IndexedDB; `toDocs` / `fromDocs` |
| `tinh-toan.js` | **Bộ máy tính giá thành**: giá vốn bình quân, trải định mức, NVL thay thế, 621/622/627/154, NXT |
| `chay-tinh-gia-thanh.js` | Nút Tính giá thành, hộp kết quả (nút ① Chuyển kho / ② Cân đối), khóa kỳ |
| `giao-dien.js` | Menu, chọn năm/kỳ, `render()` |
| `tro-giup-man-hinh.js` | `head()`, `P()` / `calcLive()` (kết quả tính của kỳ), `table()` |
| `luoi-nhap-lieu.js` | `vGrid`: lưới nhập liệu dùng chung cho mọi màn danh mục / phát sinh |
| `bieu-mau-them.js` | Biểu mẫu Thêm dòng, đổi mã, sửa dữ liệu một lần (`dataFixesOnce`) |
| `hop-nhap-excel.js`, `xuat-excel.js` | Nhập / xuất Excel (xuất đúng cột, dòng đang lọc) |
| `bang-kieu-excel.js`, `loc-kieu-excel.js`, `o-ngay.js`, `thiet-lap-bang.js` | Bảng kiểu Excel: cột cố định, lọc, sắp xếp, phân trang, ô ngày dd/mm/yyyy, ẩn/hiện cột |
| `hop-thoai.js`, `bieu-tuong.js`, `lam-moi-du-lieu.js`, `giu-vi-tri.js`, `khoi-dong.js` | Hộp thoại, biểu tượng, làm mới, giữ vị trí khi tải lại, khởi động |

## Quy tắc quan trọng

1. **JavaScript thuần, biến toàn cục, không dùng module.** Tệp sau dùng hàm/hằng của tệp trước, nên **giữ đúng thứ tự trong `manifest.json`**. Tệp mới thêm vào `manifest.json` ở vị trí phù hợp (thường là trước `core/giu-vi-tri.js`).
2. Dòng đầu mỗi tệp bắt đầu `//# ` (JS) hoặc `/*# ` (CSS) là **dòng giới thiệu**, bị bỏ khi ghép.
3. Thêm cột cho bảng dữ liệu: **chỉ thêm vào cuối** mảng tương ứng trong `F` (`dinh-nghia-du-lieu.js`) để dữ liệu cũ vẫn đọc đúng; khai báo hiển thị trong `GRID` (`screens/nhap-lieu/cau-hinh-luoi.js`).
4. Thêm màn hình mới: tạo `screens/<ten>/<ten>.js` với hàm `vTen(m)`, thêm vào `manifest.json`, thêm mục vào `NAV` và `R` trong `core/giao-dien.js`.

## Quy trình làm việc

```bash
# 1. Sửa tệp trong src/ – mở src/dev.html bằng Chrome/Edge để xem, sửa xong bấm F5
#    (dev.html nạp từng tệp riêng nên lỗi báo đúng tên tệp và dòng trong DevTools)
# 2. Ghép thành tệp duy nhất
node tools/build.js            # → artifact/index.html, artifact/index_mau_trong.html, src/dev.html
# 3. Kiểm tra: mọi màn hình + tab con trên cả bản dev và bản ghép không lỗi
node tests/kiem_tra_man_hinh.js
# 4. Xuất bản artifact/index.html lên claude.ai
```

`node tools/build.js --check` cho biết `artifact/index.html` có khớp với `src/` không (dùng trước khi commit).

> Bản tách đầu tiên (21/11/2026) được kiểm chứng: ghép lại từ `src/` cho ra tệp **giống từng byte** với artifact đang chạy (phiên bản `1794993741-9524`).
