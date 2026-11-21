# File tải hóa đơn chuyển ngày nhập kho (mẫu ASP) – cách xây dựng

Vị trí: menu **File tải dữ liệu kế toán** → tab **File tải hóa đơn chuyển ngày nhập kho**. Nút **Xuất Excel** xuất 1 file `KeToan_ASP_<kỳ>.xlsx` gồm XK NVL, NK TP và 4 sheet dưới đây (4 sheet này chỉ có khi kỳ có hóa đơn chuyển ngày).

## 1. Hóa đơn nào được đưa vào
- Một hóa đơn = Số hóa đơn + Nhà cung cấp (ở Mua hàng).
- Lấy hóa đơn có **ít nhất 1 dòng ngày nhập kho khác ngày hóa đơn**, và **ngày hóa đơn thuộc kỳ đang xem**.
- Lấy **tất cả các dòng** của hóa đơn đó (cả phần chuyển và phần không chuyển). Sắp theo ngày hóa đơn, rồi số hóa đơn.

## 2. Phân loại dòng và số phiếu nhập
- Ngày nhập kho = ngày hóa đơn → **Nhận kèm hóa đơn**.
- Ngày nhập kho ≠ ngày hóa đơn (phần đã chuyển về trước) → **Không kèm hóa đơn**.
- Gom phiếu theo ngày nhập kho. Số phiếu gốc = `NK` + ngày HĐ (yymmdd) + `-` + số HĐ, ví dụ HĐ 1 ngày 17/03/2026 → `NK260317-1`.
  - Phiếu kèm hóa đơn: lấy số gốc `NK260317-1`.
  - Phiếu không kèm hóa đơn: số gốc thêm đuôi `-001`, `-002`… theo thứ tự ngày nhập kho tăng dần.
- Diễn giải phiếu = `Tên 1 mặt hàng đầu tiên của phiếu - Số HĐ (ngày HĐ dd/mm/yyyy)`.

## 3. Sheet "Mua hang trong nuoc " – mỗi dòng mua 1 dòng
| Cột | Nội dung |
|---|---|
| A STT | Số thứ tự |
| B, C | Chưa thanh toán |
| D | Nhận kèm hóa đơn / Không kèm hóa đơn |
| E, F | Ngày nhập kho |
| G | Số phiếu nhập (mục 2) |
| H, I | Mẫu số HĐ, Ký hiệu HĐ (cột ở Mua hàng) |
| J, K | Số HĐ, Ngày HĐ – ghi cho cả dòng không kèm (lấy số HĐ đã tách ra) |
| L, M | Mã NCC, Tên NCC |
| N | Diễn giải phiếu (mục 2) |
| O, P, T | Mã hàng, Tên hàng, ĐVT |
| Q Mã kho | 152 → 152; 155/1551 → 155 |
| R TK kho | 152 → 152; 155/1551 → 1551 |
| S | 331 |
| U, V, W | Số lượng, Đơn giá, Thành tiền (làm tròn đồng) |
| X, Y, Z | % thuế, Tiền thuế, 1331 – **chỉ dòng kèm hóa đơn** |
| AA | 1 (mọi dòng) |

Dòng cuối: dòng tổng ghi `x`, cộng Thành tiền và Tiền thuế.

## 4. Sheet "Nghiep vu khac" – khai thuế phần không kèm hóa đơn
- Mỗi dòng **Không kèm hóa đơn có thuế > 0** → 1 dòng. Hóa đơn không có thuế GTGT (hộ KD/cá nhân) không có dòng NVK.

| Cột | Nội dung |
|---|---|
| STT | Số thứ tự |
| Ngày chứng từ, Ngày hạch toán | Ngày hóa đơn |
| Số chứng từ | `NVK-` + số phiếu nhập cũ, ví dụ `NVK-NK260317-1` (các dòng cùng hóa đơn chung 1 số) |
| Diễn giải, Diễn giải (hạch toán), Diễn giải thuế | Đúng diễn giải của phiếu nhập cũ (phiếu kèm hóa đơn) bên sheet Mua hàng |
| TK Nợ / TK Có | 1331 / 331 |
| Số tiền | Tiền thuế |
| Mã đối tượng Có | Mã NCC (đã bỏ cột Mã đối tượng Nợ) |
| Giá trị HHDV chưa thuế | Thành tiền của dòng không kèm |
| % thuế GTGT, Tiền thuế GTGT, TK thuế | % thuế, tiền thuế, 1331 |
| Ngày HĐ, Số HĐ, Mẫu số, Ký hiệu | Theo hóa đơn |
| Nhóm HHDV mua vào | 1 |
| Mã / Tên đối tượng thuế | Mã NCC / Tên NCC |

Dòng cuối: dòng tổng `x`, cộng Số tiền, Giá trị HHDV, Tiền thuế.

Mã nhà cung cấp (Mua hàng), Mã đối tượng Có và Mã đối tượng thuế (NVK) cùng lấy **Mã NCC** ở Mua hàng.

## 5. Sheet "DS HD chuyen ngay"
Mỗi hóa đơn 1 dòng: Phiếu nhập cũ (số gốc) – Số hóa đơn – Số tiền chưa thuế – Thuế (tổng tờ hóa đơn), có dòng tổng.

## 6. Sheet "Doi chieu HD" (chỉ kiểm tra, không nhập ASP)
- Tiền hàng: Mua kèm HĐ + Mua không kèm HĐ = tiền hàng tờ hóa đơn → Lệch = 0.
- Thuế: Thuế Mua kèm HĐ + Thuế NVK = thuế tờ hóa đơn → Lệch = 0.
- Có lệch thì tên tab trên màn hình hiện số hóa đơn lệch màu đỏ.

## 7. Ví dụ – HĐ 1, Minh Ngọc, 17/03/2026 (14.500.000 + thuế 1.160.000)
- `NK260317-1-001` ngày 21/02 – không kèm: TEM_LAV 1.600.000, TEM_SPN 1.050.000.
- `NK260317-1-002` ngày 28/02 – không kèm: TEM_SWL 300.000.
- `NK260317-1` ngày 17/03 – kèm HĐ: 5 dòng, 11.550.000, thuế 924.000.
- NVK `NVK-NK260317-1`: 3 dòng thuế 128.000 + 84.000 + 24.000 = 236.000.
- Kiểm tra: 11.550.000 + 2.950.000 = 14.500.000; 924.000 + 236.000 = 1.160.000.

## Số liệu cả năm 2026 (bản sao lưu 18/11/2026)
11 hóa đơn, 37 dòng Mua hàng (16 dòng không kèm), 8 dòng NVK. Tiền hàng 111.400.000; thuế 4.456.000 (Mua 3.700.118 + NVK 755.882). Lệch 0.
