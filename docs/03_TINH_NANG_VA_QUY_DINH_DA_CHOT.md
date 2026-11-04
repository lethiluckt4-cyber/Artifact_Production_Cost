# Tính năng và quy định đã chốt – Phần mềm Giá thành KH Thảo Vy

Trạng thái đến 04/11/2026. Nguồn: file Excel `GT_10 - 26 TV.xlsx` (tháng 10/2026), các yêu cầu đã chốt với kế toán của công ty trong quá trình xây dựng.

Đối chiếu Excel gốc tháng 10/2026: tổng giá thành thành phẩm nhập kho (TK 154) = **1.735.493.282 đ**, doanh số 2.868.789.838 đ, tồn cuối 4.544.613.870 đ (kiểm tra bằng `tests/test3.js`).

## 1. Cấu trúc menu
| Nhóm | Mục |
|---|---|
| Đầu menu | **Tổng quan** (năm làm việc, bộ chọn "Xem") · **Cảnh báo & rủi ro** |
| 1 · Dữ liệu nền | Danh mục hàng · Số dư NXT đầu kỳ · Định mức · NVL thay thế |
| 2 · Phát sinh hằng ngày | Mua hàng & Bán hàng (2 tab) · Lệnh sản xuất (kế hoạch) · Xuất dùng chung · Chi phí 622 / 627 |
| 3 · Đề xuất & giá thành | Đề xuất sản xuất · Lệnh sản xuất thực tế · Điều chỉnh NVL · Giá thành |
| 4 · Báo cáo | Nhập – Xuất – Tồn · Báo cáo bán hàng theo mặt hàng · Tổng hợp năm · File tải dữ liệu Misa |
| Hệ thống | Thiết lập & sao lưu · Hướng dẫn |

Tên các mục menu và tiêu đề trang dùng một tông màu xanh; các tab Mua hàng / Bán hàng có màu và chữ đậm riêng.

## 2. Quy trình vận hành hằng tháng
1. Nhập dữ liệu: mua hàng, bán hàng, lệnh sản xuất kế hoạch, xuất dùng chung (loại 627 / 641), chi phí 622 / 627.
2. Bấm **▶ Tính giá thành** (thủ công; sửa dữ liệu chỉ lưu và hiện nhãn "Chưa tính lại"). Chọn tháng, màn hình khóa, chạy tuần tự từng tháng từ kỳ bắt đầu.
3. Khi tính, phần mềm tự chạy chuỗi: **đề xuất sản xuất** → cập nhật **lệnh sản xuất thực tế** → tính lại NXT → **đề xuất điều chỉnh NVL** (bảng thông báo).
4. Người dùng xem, áp dụng hoặc sửa tay đề xuất; tính lại; nhập chi phí 622 / 627 cuối tháng; tính lại; **Khóa kỳ**.
5. Xuất báo cáo và File tải dữ liệu Misa.

**Hoàn tác đề xuất (kỳ này)** đưa kỳ về lệnh kế hoạch gốc: xóa điều chỉnh mẻ (kể cả sửa tay), lệnh phát sinh không có mẻ kế hoạch và mọi điều chỉnh NVL của kỳ. Cần hoàn tác trước khi cập nhật lại lệnh.

## 3. Quy tắc tính giá thành
- **Giá vốn** bình quân kỳ (theo mã hàng).
- **621** = số lượng NVL trải từ định mức × giá vốn; hỗ trợ NVL thay thế theo thời kỳ (có tỷ lệ) và định mức có hiệu lực từ ngày – đến ngày.
- **622 / 627**: phân bổ theo **kg sản lượng** (mặc định) hoặc theo giá trị 621; đổi ở **Thiết lập → tab Phân bổ 622 / 627**. Đổi tiêu thức làm tổng 154 không đổi nhưng giá thành từng mã đổi.
- **627** gồm cả các phiếu xuất dùng chung loại 627; phiếu loại 641 vào chi phí bán hàng.
- Cột chi phí 622 / 627 thêm được bằng **⚙ Cột chi phí**; có dòng tổng và các cột công thức tự cập nhật.
- Bình quân / ngày = phát sinh ÷ số ngày làm việc đến lệnh sản xuất cuối tháng.

## 4. Đề xuất sản xuất và điều chỉnh NVL
- **Lịch làm việc**: mặc định nghỉ Chủ nhật; thiết lập **ngày nghỉ lễ / tăng ca** ở Thiết lập (2 tab, có sẵn ngày lễ 2026 của Nhà nước). Ngày tăng ca được tính là ngày làm việc.
- Đề xuất tăng / giảm mẻ chạy cho **tháng đang làm, từ đầu tháng đến ngày làm dữ liệu**, theo tiêu chí: tồn thành phẩm thấp → lãi / đơn vị cao → dùng nhiều NVL chính / mẻ; NVL và năng lực sản xuất giữ chỗ và trừ dần; giảm sản xuất không làm tồn thành phẩm âm.
- Tham số đề xuất đổi ở tab đầu của **Đề xuất sản xuất** (ngày tồn lâu, dự phòng, bỏ qua).
- **Đề xuất điều chỉnh NVL** cho NVL tồn âm; áp dụng tự động hoặc sửa tay; có thể tăng thêm bằng tay.
- Bảng **Lệnh sản xuất thực tế**: số mẻ kế hoạch + điều chỉnh mẻ, thêm / sửa / xóa dòng, cột "Trong đó PM đề xuất".

## 5. Cảnh báo & rủi ro
- Bảng chỉ tiêu rủi ro theo tháng (ngưỡng cảnh báo vàng, rủi ro cao đỏ, sửa được): lệch giá mua / bán, tỷ lệ sản xuất / bán, số ngày tồn thành phẩm, chi phí 622+627 / đơn vị, tỷ lệ giá vốn / doanh thu, bán dưới giá vốn, mã âm kho, CP chưa phân bổ, tháng chưa nhập CP 622.
- Ưu tiên xử lý tồn kho; giá mua / giá bán bất thường; 7 mục kiểm tra dữ liệu (giữ nguyên); tồn cuối âm; cảnh báo khác.
- Nút **⬇ Xuất Excel** xuất cả trang thành `CanhBao_RuiRo_<kỳ>.xlsx` (7 sheet).
- Cột **Phân loại** trong NXT: Rủi ro cao / Cảnh báo / OK. Giải thích trạng thái rủi ro nằm trong mục Hướng dẫn.
- Cột **Có định mức** ở Danh mục; cảnh báo "Chưa xây dựng định mức" kiểm cả bảng Định mức và bảng NVL thay thế.

## 6. Mua hàng, bán hàng
- Mua hàng: nút **✂ Tách** chia một dòng thành nhiều dòng; cột **Mua hàng chưa hóa đơn**.
- Bán hàng chỉ nhập số lượng và doanh số, đơn giá tự chia. Báo cáo bán hàng theo mặt hàng gồm: mã, mặt hàng, nhóm, ĐVT, SL bán, đơn giá bán BQ, doanh số, tỷ trọng, giá vốn, giá vốn hàng bán, lãi gộp, tỷ lệ lãi.
- Số chứng từ tự sinh; ngày nhập tự điền khi để trống.

## 7. Giao diện bảng nhập liệu
- Bảng kiểu Excel: kẻ ô, tiêu đề màu cố định, canh giữa, cột đầu cố định, thanh cuộn ngang, nút ▼ lọc và sắp xếp từng cột (sắp xếp đúng số, ngày, phần trăm; ô trống xếp cuối), kéo dãn cột.
- Dòng có nút **Sửa / Xóa / Lưu**; cột thao tác cố định bên phải ở Mua / Bán. Ô vàng = nhập, xám = tự tính.
- **Lưu** chỉ thành công khi đủ trường bắt buộc; thiếu thì tô đỏ ô thiếu. Mã hàng phải có trong Danh mục. Rời trang khi chưa lưu → hộp "Lưu rồi tiếp tục / Bỏ thay đổi / Ở lại".
- Mọi ô tìm kiếm không phân biệt dấu, tìm cả ngày dạng dd/mm/yyyy.
- Phông chữ: Inter + Plus Jakarta Sans.

## 8. Nhập / xuất Excel
- Nhập: cửa sổ kéo thả, thẻ tải tệp mẫu đúng loại; mã chưa có trong Danh mục → chặn và liệt kê (có nút tạo nhanh). Mẫu: `data/excel/Mau_Tai_Du_Lieu_GiaThanh.xlsx` (sinh bằng `tools/make_template.py`).
- Xuất: mọi báo cáo xuất Excel với phông **Aptos Narrow cỡ 11**, ngày **dd/mm/yyyy**. Báo cáo Giá thành có tab **Chi tiết** (28 cột) và xuất Excel riêng.
- **File tải dữ liệu Misa**: một tệp 2 sheet XK NVL / NK TP theo mẫu ASP; số CT = XK/TP- + mã TP + serial Excel; đối tượng NV_DMT, TK 621 / 154 sửa ở Thiết lập.
- Bộ chọn **Xem**: Tháng / Cả năm / Từ ngày – đến ngày, áp dụng mọi báo cáo.

## 9. Lưu trữ
- Artifact claude.ai: lưu trên tài khoản (`claude.use('db')`, bộ sưu tập `gt`). Mở trực tiếp bằng trình duyệt: lưu IndexedDB `giathanh_kh`.
- **Khóa kỳ** chặn sửa dữ liệu kỳ đã chốt (mở khóa được). Sao lưu / phục hồi bằng file `.json` ở Thiết lập.

## 10. Chưa làm
Ưu tiên đề xuất theo giá trị tồn; hạn sử dụng NVL; cảnh báo định mức sai khi điều chỉnh lặp lại; nhật ký đề xuất đã áp dụng; công tắc tự tính sau mỗi lần lưu; xuất 2 sheet còn lại của mẫu ASP (VTHH, Danh mục đối tượng THCP).
