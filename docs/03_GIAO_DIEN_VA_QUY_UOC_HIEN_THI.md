# 03 – GIAO DIỆN (HÌNH THỨC) & QUY ƯỚC HIỂN THỊ

> Toàn bộ quy định về **hình thức**, để bản dựng cho công ty khác nhìn và thao tác giống hệt bản Thiên Hồng. Ảnh tham chiếu ở `hinh_anh/`.

## 1. Bố cục
- **Trái:** thanh menu cố định rộng **236 px**, nền xanh đậm `#0f2a57`.
  - Trên cùng: tên phần mềm "Phần mềm Giá thành" (Plus Jakarta Sans 600, 16 px, trắng), dưới là tên công ty (12,5 px, `#9fb3d6`).
  - **Hai mục đầu** (Tổng quan, Cảnh báo & kiểm tra) chữ đậm trắng, có chấm tròn xanh `#7dd3fc` phía trước.
  - **Tiêu đề nhóm** chữ HOA, đậm, 12,5 px, màu `#7dd3fc`, có ô vuông màu riêng của nhóm: 1 `#5eead4` · 2 `#fcd34d` · 3 `#86efac` · 4 `#93c5fd` · Hệ thống `#cbd5e1`.
  - Mục đang chọn: nền trắng, chữ xanh đậm. Rê chuột: nền trắng 8%.
  - Cuối menu: khối LƯU TRỮ và TÍNH TOÁN (trạng thái).
  - Mục Đề xuất sản xuất có **số tròn cam** (`#f97316`) = số ngày đề xuất chưa có lệnh.
- **Phải:** nội dung, nền `#f4f6f9`, đệm 16 px 22 px.

## 2. Bảng màu (biến CSS `:root`)
| Biến | Giá trị | Dùng cho |
|---|---|---|
| `--bg` | `#f4f6f9` | nền trang |
| `--card` | `#fff` | thẻ, hộp |
| `--line` | `#e3e7ee` | viền |
| `--txt` | `#1f2937` | chữ |
| `--mut` | `#6b7280` | chữ phụ |
| `--pri` | `#1d4ed8` | nút chính, link, **tiêu đề màn hình** |
| `--pri2` | `#e8efff` | nền dòng tổng |
| `--ok` | `#15803d` | Đạt / OK |
| `--warn` | `#b45309` | Cảnh báo |
| `--bad` | `#b91c1c` | Rủi ro cao / lỗi |
| `--yel` | `#fff7cc` | ô nhập |
| `--nav` | `#0f2a57` | menu |

**Tô màu theo mức:**

| Trường hợp | Nền | Chữ / ghi chú |
|---|---|---|
| Vàng (cảnh báo) | `#fef3c7` | `#92400e` |
| Đỏ (rủi ro) | `#fee2e2` | `#991b1b`, đậm |
| Ô đang nhập (`td.ed`) | `#fff3b0` | – |
| Dòng thiếu bắt buộc | `#fef2f2` | – |
| Xem trước dòng gốc khi tách | `#e0f2fe` | `#075985` |
| Tách vượt số gốc | `#fee2e2` | – |
| Viên Đạt / OK | `#dcfce7` | – |
| Viên Cảnh báo | `#fef3c7` | – |
| Viên Rủi ro cao / Cần xử lý | `#fee2e2` | – |
| Viên trung tính | `#eef2f7` | – |
| Khung thông báo `.note` | `#eef6ff` | viền `#cfe1ff` |
| Khung lỗi / mất kết nối | `#fef2f2` | viền `#fca5a5`, chữ `#991b1b` |

## 3. Chữ
- **Phông:**
  - Giao diện: **Inter** (dự phòng Segoe UI, Roboto, Arial).
  - Tiêu đề, số lớn: **Plus Jakarta Sans 600**.
  - Số dùng `tabular-nums` (thẳng cột).
- **Cỡ chữ:**
  - Chung 14 px (`--fs`), bảng 13 px (`--fs-t`), phụ 12,5 px (`--fs-s`).
  - Tiêu đề màn hình 20 px, **màu xanh `#1d4ed8`** (không dùng màu đen).
  - Số trên thẻ 20 px.
- Nhãn Phân loại (Rủi ro cao / Cảnh báo / OK) **viết hoa chữ đầu**, **cỡ bằng chữ chung** (class `pill nfs`).

## 4. Thành phần
- **Nút** `.btn`: viền `#cbd3df`, bo 7 px, nền trắng.
  - Nút chính `.btn.p`: nền xanh `#1d4ed8`, chữ trắng.
  - Nút nguy hiểm `.btn.d`: chữ đỏ.
  - Nút nhỏ `.btn.s`.
  - Nút dòng **dùng chữ** (Sửa / Xóa / Lưu / Hủy / ✂ Tách / + NVL / Đi tới dòng / Đi tới lệnh), **không chỉ dùng icon**.
- **Thẻ** `.card`: lưới tự giãn, tối thiểu 170 px, bo 10 px. Nhãn nhỏ xám, số lớn, dòng phụ xám.
- **Hộp** `.box`: nền trắng, viền, bo 10 px, tiêu đề h3 14 px đậm. Viên trạng thái đặt cạnh tiêu đề.
- **Tab** `.tabs`: hàng nút, gạch dưới. Tab chọn chữ xanh, gạch dưới xanh. Tab Mua màu xanh, tab Bán màu cam. Tab có thể kèm số (ví dụ "2 · Tạo lệnh sản xuất 129").
- **Hộp thoại** `.modal`: nền mờ, khung trắng, tiêu đề 16 px.
- **Thông báo nhanh** `toast`: giữa màn hình, nền `#111827`, chữ trắng, bo 12 px, tự tắt.
- **Màn hình chờ** `busy`: phủ mờ toàn trang, con trỏ chờ, ghi bước đang chạy.
- **Ô nhập:** viền `#cbd3df`, bo 6 px; ô số canh phải.

## 5. Bảng
- **Khung bảng** `.tw`: cuộn trong khung, cao tối đa 70 % màn hình (một số bảng 40–50 vh), viền bo 8 px.
  - Thanh cuộn ngang thêm ở **phía trên**.
- **Tiêu đề (th):** nền gradient `#2b4c8c → #1f3b70`, chữ trắng đậm, **canh giữa tuyệt đối** (cả cột số), cố định khi cuộn.
  - Đệm 6 px 26 px (chừa chỗ nút ▼), rộng tối thiểu 76 px (cột chữ dài 110 px).
  - Tiêu đề ngắn (≤ 22 ký tự) không xuống dòng (class `nw`). Khi người dùng kéo giãn thì cho xuống dòng (class `rs`).
- **Nút ▼** góc phải mỗi tiêu đề: nền trắng, viền `#9db3dc`. Cột đang lọc: tiêu đề nền cam `#b45309 → #92400e`, nút vàng.
- **Ô (td):** đệm 5 px 8 px, kẻ ô `#dde3ec`, không xuống dòng (cắt "…", tối đa 260 px). Dòng chẵn nền `#f7f9fc`.
  - Số canh phải; chữ, mã, ngày canh trái.
  - Bảng có class `wrap` thì cho xuống dòng (bảng hướng dẫn).
- **Cột cố định:** cột đầu luôn cố định. Cột cố định thêm có vạch phải `#8aa4cf`, tối đa 180 px.
- **Dòng tổng** `tr.tot`: nền `#e8efff`, chữ đậm, chữ "Tổng cộng" / "Cả năm".
- **Số âm** hiển thị chữ đỏ (ví dụ tồn âm `-2.199,00`).

## 6. Định dạng số & ngày (hiển thị)
- **Tiền:** số nguyên, ngăn nghìn bằng dấu chấm: `1.665.127.765`.
- **Số lượng:** 2 chữ số thập phân, dấu phẩy: `3.657,25`. Định mức đến 4 số lẻ.
- **Phần trăm:** `16,3%`. Chênh lệch có dấu: `+12,5%` / `−8%` / `0%`.
- **Ngày** `dd/mm/yyyy`, **tháng** `mm/yyyy`, tiêu đề "tháng 10/2026", "năm 2026".
- **Excel xuất ra:** phông Aptos Narrow 11, ngày là ô kiểu Ngày (`dd/mm/yyyy`), tiêu đề in đậm, cố định dòng tiêu đề (và cột tên khi cần).

## 7. Câu chữ (giọng văn trong phần mềm)
- Tiếng Việt có dấu, ngắn gọn, nói **việc cần làm** (ví dụ "Kiểm tra chứng từ mua chưa nhập; nếu đã đủ, cân đối giảm theo đề xuất bên dưới").
- **Tên gọi đã chốt:**
  - "Xuất dùng chung", "Chi phí 622/627", "Thiết lập & sao lưu".
  - "Mua hàng chưa HĐ", "Chênh lệch giá mua / bán", "Tỷ lệ chênh lệch", "Ngày hóa đơn" (không dùng "Ngày mua").
  - "Hiệu lực từ / đến", "Tổng hợp bán hàng theo mặt hàng", "Trạng thái rủi ro", "Phân loại".
- Thông báo lỗi **luôn trấn an về dữ liệu** ("Dữ liệu trên tài khoản không bị ảnh hưởng") và chỉ cách làm tiếp.
- Ô / cột: **vàng = nhập, xám = tự tính**. Cột bắt buộc có dấu `*`.
