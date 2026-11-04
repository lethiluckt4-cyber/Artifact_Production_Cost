# Phần mềm Giá thành – Bộ khung dùng chung (mô tả hệ thống)

Tài liệu này mô tả toàn bộ phần **dùng chung** của phần mềm giá thành (đã xây cho KH Thảo Vy) để tái sử dụng cho công ty khác. Phần vận hành tính giá thành (riêng theo công ty) được tách ở tài liệu `02_Huong_dan_tuy_bien.md`.

## 1. Kiến trúc

- **Một tệp HTML duy nhất** `artifact/index.html` (HTML + CSS + JavaScript thuần), thư viện ngoài: SheetJS (đọc/ghi Excel) từ cdnjs, phông Inter + Plus Jakarta Sans từ Google Fonts.
- Chạy như **artifact trên claude.ai** (có tài khoản → lưu trên đám mây `claude.use('db')`, bộ sưu tập `gt`) hoặc mở trực tiếp trong trình duyệt (tự chuyển sang **IndexedDB** cục bộ `giathanh_kh`). Sao lưu/khôi phục bằng tệp `.json` ở Thiết lập.
- Không có máy chủ, không có API; toàn bộ tính toán chạy trong trình duyệt khi bấm **▶ Tính giá thành**.

## 2. Mô hình dữ liệu (tài liệu lưu trữ)

| Khóa | Nội dung | Thứ tự cột (`F`) |
|---|---|---|
| `settings` | company, startKy, workYear, locked[], tonLau, duPhong, boQua, costCols[], ktMaDT, ktTenDT, ktTkNoXK, ktTkCoNK | – |
| `items` | Danh mục hàng | ma, ten, nhom, dvt, kho |
| `opening` | Số dư đầu kỳ `{ky, rows:{ma:{sl,tt}}}` | – |
| `bom` | Định mức | loai, maTP, maNVL, slTP, slNVL, lanNgay, haoHut, maThayThe, tuNgay, denNgay, tyLe, ghiChu |
| `subs` | NVL thay thế theo thời kỳ | maTP, maNVL, maThayThe, tuNgay, denNgay, tyLe, ghiChu |
| `p_YYYY-MM` | Mua hàng theo tháng | ngayNhap, ngayMua, hoaDon, ncc, ma, sl, donGia, tt, kho, ghiChu |
| `s_YYYY-MM` | Bán hàng theo tháng | ngay, ma, sl, donGia, doanhSo, ghiChu |
| `o_YYYY-MM` | Lệnh SX theo tháng (rows) + điều chỉnh NVL (adj) | maLenh, ngayXuatNVL, ngaySX, maTP, loaiDM, soMeKH, dieuChinhMe, ghiChu, dcPM / maLenh, maVT, dieuChinh, lyDo |
| `i_YYYY-MM` | Xuất dùng chung | maPhieu, ngay, maVT, sl, lyDo |
| `k_YYYY-MM` | Kế hoạch SX | ngaySX, maTP, soMe, ghiChu |
| `c_YYYY-MM` | Chi phí 622/627 | theo `settings.costCols` (mặc định c622, c6273, c6274, dien, nuoc, khac) |

Nhóm hàng chuẩn (`NHOM`): Thành phẩm, NVLC, PG, GV, BB. Mã hàng là khóa chính; mọi chứng từ phải có mã trong danh mục (nhập Excel bị chặn và liệt kê mã thiếu).

## 3. Phần dùng chung (giữ nguyên khi làm công ty khác)

### 3.1 Khung giao diện
- Menu trái theo nghiệp vụ: Tổng quan · Cảnh báo & kiểm tra · **1 Dữ liệu nền** · **2 Phát sinh hằng ngày** · **3 Đề xuất & giá thành** · **4 Báo cáo** · Hệ thống. Mảng `NAV` quyết định menu, `R` (trong `render`) ánh xạ id → hàm vẽ.
- Tiêu đề 2 dòng: `head(title, extraButtons)` = dòng tiêu đề (+ nhãn "Đang sửa", "Chưa tính lại") và thanh công cụ (nút riêng, 🔒 Khóa kỳ, ▶ Tính giá thành chỉ ở nhóm 3, bộ chọn Năm làm việc / Xem).
- Kỳ xem (`selKy`): `YYYY-MM`, `YYYY` (cả năm) hoặc `R:từ:đến` (khoảng ngày). Hàm `selHas(date)`, `isRange`, `rangeOf`, `workYear()`.
- Phông: Inter (giao diện), Plus Jakarta Sans 600 (tiêu đề); cỡ 14 / bảng 13 / phụ 12,5 (biến CSS `--fs`, `--fs-t`, `--fs-s`).

### 3.2 Lưới nhập liệu (`GRID` + `vGrid`)
Mỗi bảng chỉ cần một dòng cấu hình: `cols` (cột nhập: k, t, n=số, d=ngày, sel=danh sách), `extra` (cột công thức xám), `before/after` (vị trí cột công thức), `req` (bắt buộc), `codes` (cột phải có trong danh mục), `unique`, `sumCols/sumExtra` (dòng tổng theo kỳ), `kyf` (cột ngày để lọc theo kỳ), `onEdit` (công thức phụ thuộc). Tính năng có sẵn: Sửa/Xóa/Lưu/Hủy theo dòng, ô vàng nhập – ô xám tự tính, kiểm tra bắt buộc, chọn mã từ danh mục, dòng thiếu thông tin tô đỏ + cảnh báo, chặn khi kỳ khóa, hỏi khi rời dòng chưa lưu, "Hiện tất cả các kỳ", tìm kiếm.

### 3.3 Bảng kiểu Excel (`enhanceTables`)
Đường kẻ, tiêu đề màu cố định, cột đầu cố định, thanh cuộn trên, nút ▼ lọc/sắp xếp từng cột, kéo giãn cột, nhãn "Đang lọc x/y" + Xóa lọc.

### 3.4 Nhập Excel (`importDialog`, `importAOA`, `TEMPLATE`, `SAMPLES`)
Hộp kéo-thả + "Tải tệp mẫu" (mẫu có dòng ví dụ và dòng ghi chú tự bỏ qua khi nhập), chế độ *Thay thế các kỳ có trong tệp* / *Thêm*, nhận dạng tiêu đề, chuyển ngày Excel, bỏ qua tháng đã khóa, chặn mã thiếu. Mỗi thực thể có sheet mẫu riêng (`tools/make_template.py` tạo tệp mẫu .xlsx giống hệt).

### 3.5 Lưu trữ, khóa kỳ, sao lưu
`store` (đám mây → IndexedDB), `toDocs/fromDocs` (bỏ dòng mới chưa lưu), `isLocked`, `lockDialog` (bảng 12 tháng), sao lưu/khôi phục .json, xóa toàn bộ dữ liệu.

### 3.6 Chuỗi tự chạy và hộp thoại (`runCalc`, `runCalcFor`, `showCalcResult`)
Chọn tháng (năm = năm làm việc), ô tick *Đề xuất lại từ đầu*, màn hình chờ khóa thao tác, hộp kết quả (số liệu kỳ, kiểm tra giá xuất kho/lệnh/tồn âm, "Phần mềm đã tự chạy", "Bước tiếp theo", nút Áp dụng điều chỉnh NVL & tính lại).

### 3.7 Hướng dẫn trong phần mềm
Trang Hướng dẫn: trình tự làm việc hằng tháng, sơ đồ nghiệp vụ, công thức, bảng "phát hiện sai – làm lại", bảng thiết lập và đường dẫn menu. Cần viết lại phần công thức theo công ty mới.

## 4. Phần riêng theo công ty (phải viết lại)

| Mục | Hàm / hằng | Nội dung hiện tại (KH Thảo Vy) |
|---|---|---|
| [B] Tính giá thành | `calc()`, `bomFor`, `expand` | Giá vốn bình quân kỳ; trải định mức theo mẻ (làm tròn 2) + điều chỉnh + NVL thay thế; 621 = SL × giá vốn; 622/627 phân bổ theo 621; 154; TP nhập kho theo giá thành; tồn cuối → tồn đầu; bình quân/ngày = chia cho số ngày đến lệnh cuối |
| [C] Đề xuất | `buildProposal`, `buildAdjProposal`, `applyProposalCore`, `undoCore`, `proposalParams` | Tăng mẻ khi NVLC tồn > mốc, chia theo ưu tiên TP (tồn ít ngày → lãi cao → dùng nhiều), giới hạn bởi NVL khác (>10% giá trị) và năng lực Lần/ngày; giảm mẻ khi NVLC âm; TP âm; điều chỉnh NVL cho mã âm; xếp mẻ trong tháng từ đầu tháng đến ngày có lệnh cuối |
| [E] Báo cáo | `vTongQuan`, `vNXT`, `vGiaThanh`, `vNam`, `vCanhBao`, `tpSummary` | Thẻ số liệu, ưu tiên tồn kho, giá thành theo lệnh/nhật ký/TP, NXT, hiệu quả năm |
| [F] Xuất kế toán | `XK_HDR`, `NK_HDR`, `buildXK`, `buildNK`, `ktSettings` | Mẫu phiếu XK NVL / NK TP (8 dòng tiêu đề), số chứng từ XK+MãTP+ngàyExcel |
| [A] Định nghĩa | `F`, `GRID`, `TEMPLATE`, `SAMPLES`, `NAV`, `NHOM`, `COSTCOLS0` | Nếu công ty mới có thêm/bớt cột, sửa ở đây – lưới, mẫu Excel, nhập liệu tự theo |

## 5. Quy ước & kiểm thử
- Ô vàng = nhập, ô xám = công thức; nút chữ (không icon) Sửa/Xóa/Lưu/Hủy; mã lệnh `LSXyyyy-mm.dd-nn`, số chứng từ xuất chung `XCyyyy-mm.dd-nn` tự sinh.
- Không tự tính khi nhập; chỉ tính khi bấm ▶ Tính giá thành; sau khi tính, mọi thay đổi bật nhãn "Chưa tính lại".
- Kiểm thử: thư mục `tests/test*.js` (Playwright) – nạp dữ liệu mẫu, chạy chuỗi, kiểm tra tổng 154, dòng tổng, khóa kỳ, hoàn tác, nhập mẫu. Khi làm công ty mới nên viết lại `test3` (đối chiếu số với file Excel gốc của công ty đó).
