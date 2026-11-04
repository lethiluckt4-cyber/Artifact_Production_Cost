# Hướng dẫn tùy biến cho công ty mới

Mục tiêu: giữ nguyên toàn bộ khung (menu, lưới nhập liệu, nhập Excel, bảng Excel, khóa kỳ, sao lưu, hộp thoại tính), chỉ viết lại phần **vận hành tính giá thành**.

## Bước 0 – Thu thập từ công ty mới (trước khi sửa mã)
1. File Excel giá thành hiện tại của công ty (ít nhất 1 tháng đầy đủ) để đối chiếu số.
2. Danh sách nhóm hàng (có khác Thành phẩm / NVLC / PG / GV / BB không?).
3. Cách tính giá vốn (bình quân kỳ? nhập trước xuất trước? giá đích danh?).
4. Cấu trúc định mức (theo mẻ? theo 1 đơn vị TP? nhiều cấp – bán thành phẩm?).
5. Chi phí ngoài NVL: các khoản, tiêu thức phân bổ (theo 621, theo sản lượng, theo giờ máy…).
6. Có cần đề xuất sản xuất không? Tiêu chí nào? (nếu không: bỏ nhóm 3 chỉ còn Giá thành).
7. Mẫu nhập vào phần mềm kế toán (Misa/ASP/khác) – cột, số chứng từ, tài khoản.

## Bước 1 – Khởi tạo
- Sao chép `artifact/index.html`; đổi `<title>`, `company` mặc định (tìm `[TÊN CÔNG TY]`).
- `<script id="seed">{}</script>`: để trống, hoặc tạo dữ liệu mẫu bằng `tools/extract.py` + `make_docs.py` (đọc file Excel của công ty → `docs.json` → dán vào seed) để có nút "Nạp dữ liệu mẫu".
- Xuất bản thành artifact mới (slug mới) → dữ liệu hai công ty tách biệt hoàn toàn.

## Bước 2 – Định nghĩa dữ liệu [A]
Chỉ khi công ty mới có cột khác:
- `F`: thứ tự cột lưu trữ của từng thực thể (thêm cột = thêm vào cuối để không hỏng dữ liệu cũ).
- `GRID`: cột nhập (`cols`), cột công thức (`extra` + `before/after`), bắt buộc (`req`), mã phải có trong danh mục (`codes`), dòng tổng (`sumCols/sumExtra`).
- `TEMPLATE` + `SAMPLES` + `tools/make_template.py`: sheet mẫu Excel cho từng bảng (tên sheet, tiêu đề cột, dòng ví dụ).
- `NHOM`: nhóm hàng; `COSTCOLS0`: cột chi phí mặc định (người dùng vẫn thêm được bằng ⚙ Cột chi phí).
- `NAV`: thêm/bớt mục menu; thêm hàm vẽ vào `R` trong `render()`.

## Bước 3 – Tính giá thành [B] – hàm `calc()`
Giữ bộ khung: chạy tuần tự `periodList()` từ `settings.startKy` đến kỳ chọn; mỗi kỳ tạo `P = {ky, orders, lines, nxt, giaVon, sum621/622/627/154, doanhSo, lai, tonCuoi, cost, rates, warnings}`; tồn cuối kỳ → `opening` kỳ sau; `c.periods[ky]`, `c.list`, `c.warnings`. Các màn hình chỉ đọc từ `P()` nên nếu giữ đúng **tên trường** này thì báo cáo, Tổng quan, Cảnh báo, NXT, file kế toán dùng lại được không sửa.

Những chỗ thường phải viết lại:
- `giaVon[ma]`: công thức giá vốn.
- `bomFor()` / vòng `expand`: cách trải định mức ra `lines` (mỗi dòng: maLenh, maVT, dm, dieuChinh, tong, dg, tt, c622, c627).
- Phân bổ chi phí: hiện `r622 = Σ622 / Σ621` – đổi tiêu thức ở đây (`P.rates`, `ord.c622/c627`).
- Nhập kho thành phẩm: `slTH` (sản lượng) và giá nhập = `c154`.
- `daysData` (mẫu số bình quân/ngày) và `status` của từng mã trong `nxt` (tồn lâu, âm kho, cần mua…).

## Bước 4 – Đề xuất [C]
- Không cần đề xuất: trong `runCalcFor` bỏ khối `if (month && !isLocked(month)) {...}`; trong `NAV` bỏ `kehoach`, `lsxtt`, `d_adjustments` (hoặc giữ Lệnh SX thực tế để sửa mẻ tay).
- Cần đề xuất khác: viết lại `buildProposal(p)` trả về `{rows, chotRows:[{tp, dc, ...}], need, prm, lastDay, monthDays}` và `buildAdjProposal(p)` trả về `{rows:[{maLenh, maVT, deXuat,...}], analysis}`. `applyProposalCore` / `applyAdjCore` / `undoCore` ghi và hoàn tác vào `state.orders`, `state.adjustments` – dùng lại được nếu vẫn là "điều chỉnh mẻ" và "điều chỉnh NVL theo lệnh".
- Tham số: `proposalParams()` + 3 ô ở tab 1 (`#pTonLau`, `#pDuPhong`, `#pBoQua`) – thêm/bớt ô ở `vKeHoach`.

## Bước 5 – Báo cáo [E] và xuất kế toán [F]
- Báo cáo dùng `table(cols, rows, {total:true})` – chỉ sửa danh sách cột.
- File kế toán: sửa `XK_HDR`, `NK_HDR` theo mẫu của phần mềm kế toán mới, `buildXK/buildNK` trả mảng theo đúng thứ tự cột; đổi tên menu `xuatphieu` và mặc định `ktSettings()`.

## Bước 6 – Hướng dẫn & kiểm thử
- Viết lại trang Hướng dẫn (`vHuongDan`): công thức, sơ đồ, bảng làm lại.
- Chạy `node tools/test3.js` (sửa số đối chiếu bằng số từ Excel công ty mới), `test10` (chuỗi đề xuất), `test17/23` (lưới), `test28` (dòng tổng), `test30` (nhập mẫu), `test37` (mọi màn hình không lỗi khi trống).

## Danh sách kiểm tra bàn giao
- [ ] Số liệu 1 tháng khớp Excel gốc (154, doanh số, lãi, tồn cuối).
- [ ] Tệp mẫu Excel mỗi bảng nhập lại không lỗi (round-trip).
- [ ] Khóa kỳ, hoàn tác, đề xuất lại từ đầu hoạt động.
- [ ] Sao lưu .json và khôi phục.
- [ ] Hướng dẫn trong phần mềm đã sửa theo công ty mới.
