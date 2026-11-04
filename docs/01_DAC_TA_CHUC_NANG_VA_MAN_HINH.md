# 01 – ĐẶC TẢ CHỨC NĂNG, DỮ LIỆU & MÀN HÌNH

> Mô tả **đầy đủ nội dung** của Phần mềm Giá thành (bản Thiên Hồng, 03/11/2026): kiến trúc, mô hình dữ liệu, menu, từng màn hình (cột, nút, tab, cột tự tính) và từng tệp xuất / nhập.
> Ảnh chụp từng màn hình nằm trong `tai_lieu/hinh_anh/` (số thứ tự ghi ở mỗi mục).
> Công thức chi tiết: xem `02_QUY_DINH_NGHIEP_VU_VA_CONG_THUC.md`. Hình thức giao diện: xem `03_GIAO_DIEN_VA_QUY_UOC_HIEN_THI.md`.

---

## 1. Kiến trúc

| Hạng mục | Nội dung |
|---|---|
| Dạng phần mềm | **Một tệp HTML duy nhất** (HTML + CSS + JavaScript thuần, không framework, không máy chủ). Tính toán chạy hoàn toàn trong trình duyệt. |
| Nơi chạy | Artifact trên claude.ai (khuyến nghị: lưu trên tài khoản, dùng được mọi máy), hoặc mở tệp trực tiếp trong trình duyệt (lưu trong trình duyệt của máy đó). |
| Lưu trữ | Kho `claude.use('db')` – bộ sưu tập `gt`. Dự phòng / ngoại tuyến: IndexedDB `giathanh_kh` (store `docs`). Không có cả hai thì chỉ giữ trong phiên. |
| Khai báo artifact | Capabilities: `db` với rule `{path:"", read:"view", write:"interact"}`; `downloads` (cho phép tải tệp Excel / json). |
| Thư viện ngoài | SheetJS 0.18.5 (cdnjs) – chỉ để **đọc** tệp Excel khi nhập. Ghi Excel bằng bộ ghi XLSX tự viết `XW`. Phông Inter + Plus Jakarta Sans (Google Fonts). |
| Ghi Excel (`XW`) | `aoa_to_sheet`, `json_to_sheet`, `sheet_add_aoa`, `book_new`, `book_append_sheet`, `write`. Hỗ trợ `ws._bold` (Set số dòng in đậm), `ws['!freeze']={x,y}` (cố định cột/dòng), `ws['!cols']` (độ rộng). Phông Aptos Narrow 11; ngày `dd/mm/yyyy`, tháng `mm/yyyy`. |
| Lưu ý khi đặt khóa cột trong `json_to_sheet` | Không đặt tên cột dạng số nguyên (ví dụ `'641'`) vì JavaScript tự đưa lên đầu. Dùng `'641 Bán hàng'`. |
| Bố cục mã nguồn | `[A]` định nghĩa dữ liệu (`F`, `GRID`, `TEMPLATE`, `SAMPLES`, `NAV`, `NHOM`, hằng mặc định) · `[B]` tính giá thành `calc()` · `[C]` đề xuất SX `buildPlan` / cân đối `buildAdjProposal` · `[D]` chuỗi tự chạy `runCalcFor` / `showCalcResult` · `[E]` báo cáo `vTongQuan`, `vNXT`, `vGiaThanh`, `vBanHang`, `vNam`, `vCanhBao` · `[F]` xuất kế toán `buildXK` / `buildNK` · `[G]` dữ liệu mẫu `<script type="application/json" id="seed">`. |

---

## 2. Menu (mảng `NAV`) – 19 màn hình

| Nhóm (màu chấm) | Mục menu | id | Ảnh |
|---|---|---|---|
| (đầu, chữ đậm) | Tổng quan | `tongquan` | 01 |
| (đầu, chữ đậm) | Cảnh báo & kiểm tra (2 tab) | `canhbao` | 02, 03 |
| **1 · DỮ LIỆU NỀN** (#5eead4) | Danh mục hàng | `d_items` | 04 |
|  | Số dư NXT đầu kỳ | `d_opening` | 05 |
|  | Định mức | `d_bom` | 06 |
|  | NVL thay thế | `d_subs` | 07 |
| **2 · PHÁT SINH HẰNG NGÀY** (#fcd34d) | Mua hàng & Bán hàng (2 tab) | `d_purchases` | 08, 09 |
|  | Xuất dùng chung | `d_issues` | 10 |
|  | Chi phí 622/627 | `d_costs` | 11 |
| **3 · KẾ HOẠCH & GIÁ THÀNH** (#86efac) | Đề xuất sản xuất (3 tab, có số đỏ = số ngày cần tạo lệnh) | `kehoach` | 12–14 |
|  | Lệnh sản xuất | `d_orders` | 15 |
|  | Cân đối NVL | `d_adjustments` | 16 |
|  | Giá thành (4 tab) | `giathanh` | 17–20 |
| **4 · BÁO CÁO** (#93c5fd) | Nhập – Xuất – Tồn | `nxt` | 21 |
|  | Tổng hợp bán hàng theo mặt hàng | `banhang` | 22 |
|  | Tổng hợp năm | `nam` | 23 |
|  | File tải dữ liệu kế toán (2 tab) | `xuatphieu` | 24, 25 |
| **HỆ THỐNG** (#cbd5e1) | Thiết lập & sao lưu (4 tab) | `thietlap` | 26–28, 33 |
|  | Hướng dẫn | `huongdan` | 29 |

- **Cuối menu:** khối **LƯU TRỮ** (trạng thái lưu: "✔ Đã lưu – Đã lưu trên tài khoản Claude (dùng được mọi máy)" / "Lưu trong trình duyệt máy này – nhớ Sao lưu định kỳ" / "⚠ Chưa kết nối kho dữ liệu…"). Kèm khối **TÍNH TOÁN** (lần tính gần nhất / "Dữ liệu đã thay đổi – chưa tính").
- **Đường dẫn cũ tự chuyển hướng:**
  - `thamso` → Cảnh báo, tab Ngưỡng.
  - `d_cal` → Thiết lập, tab Lịch nghỉ.
  - `d_pb` → Thiết lập, tab Phân bổ.
  - `d_sales` → tab Bán của Mua hàng & Bán hàng.

## 3. Mô hình dữ liệu (tài liệu lưu trong bộ sưu tập `gt`)

Mỗi bảng lưu dạng mảng các mảng (`rows`) theo **thứ tự trường cố định `F`**. Muốn thêm trường thì **thêm vào cuối** để không hỏng dữ liệu cũ.

| Khóa tài liệu | Nội dung | Thứ tự trường (`F`) |
|---|---|---|
| `settings` | Thiết lập chung (xem bảng dưới) | – |
| `items` | Danh mục hàng | `ma, ten, nhom, dvt, kho` |
| `opening` | Số dư đầu kỳ `{ky, rows:[[ma, sl, tt, kho]]}` | – |
| `bom` | Định mức | `loai, maTP, maNVL, slTP, slNVL, lanNgay, haoHut, maThayThe, tuNgay, denNgay, tyLe, ghiChu` |
| `subs` | NVL thay thế | `maTP, maNVL, maThayThe, tuNgay, denNgay, tyLe, ghiChu` |
| `caps` | Năng lực SX (dự phòng, chưa dùng) | `maTP, tuNgay, denNgay, lanNgay, meThang, ghiChu` |
| `cal` | Lịch nghỉ / tăng ca | `ngay, loai, ghiChu` |
| `p_YYYY-MM` | Mua hàng theo tháng **ngày nhập kho** | `ngayNhap, ngayMua, hoaDon, ncc, ma, sl, donGia, tt, kho, ghiChu` |
| `s_YYYY-MM` | Bán hàng theo tháng | `ngay, ma, sl, donGia, doanhSo, ghiChu, hoaDon, khach` |
| `i_YYYY-MM` | Xuất dùng chung | `maPhieu, ngay, maVT, sl, lyDo, loai` |
| `o_YYYY-MM` | Lệnh SX (`rows`) + Cân đối NVL (`adj`) | rows: `maLenh, ngayXuatNVL, ngaySX, maTP, loaiDM, slKH, dieuChinhTP, ghiChu, khoa, nguon, slDX` · adj: `ngaySX, maTP, maVT, dieuChinh, lyDo, nguon` |
| `k_YYYY-MM` | Kế hoạch SX cũ (tương thích) | `ngaySX, maTP, soMe, ghiChu` |
| `c_YYYY-MM` | Chi phí tháng `{c622, c6273, c6274, dien, nuoc, …}` | theo cột chi phí |

**`settings` gồm:**
- **Thông tin chung:** `company`, `startKy`, `workYear`, `locked[]` (kỳ đã khóa).
- **Phân bổ:** `alloc` `{cd1_622, cd1_627, rows:[{cd, ma, t622, t627}]}`.
- **Ngưỡng:**
  - `nguong[]` `{key, max, min, ghiChu}` và `nguongV2` (cờ chuyển đổi).
  - `giaNg` `{muaV, muaD, banV, banD}`.
- **Đề xuất:** `planPrm` (mục 6 tài liệu 02), `daDeXuat[]` (tháng đã chạy đề xuất).
- **Sản phẩm lỗi:** `spLoi[]` `{maSP, maLoi, tenLoi, tyLe, gia, tuKy, ghiChu}`, `spLoiV1` (cờ tạo mã lỗi lần đầu).
- **Chi phí:** `costCols[]` `{k, t, g:'622'|'627'}`.
- **File kế toán:** `ktMaDT`, `ktTenDT`, `ktTkNoXK` (mặc định 621), `ktTkCoNK` (mặc định 154).

**Nhóm hàng** (`NHOM`): `TP đóng gói, Thành phẩm, Bán thành phẩm, Sản phẩm lỗi, Bánh khô, Kem tươi, Bao bì, Nhiên liệu, Khác`.

**Ví dụ quy mô thật (Thiên Hồng 2026):** 52 tài liệu (≈ 212 KB): 24 mã hàng, 24 dòng định mức, 251 dòng mua, 457 dòng bán, 1.172 lệnh, 6 phiếu xuất chung, 30 ngày lịch.

---

## 4. Khung chung của mọi màn hình

### 4.1 Đầu trang
- **Dòng 1:**
  - Tiêu đề màn hình, chữ **xanh #1d4ed8**, kèm kỳ, ví dụ "Giá thành tháng 10/2026".
  - Nhãn "✎ Đang sửa – nhớ bấm Lưu" khi đang sửa một dòng.
  - Nhãn "⚠ Chưa tính lại" khi dữ liệu đổi sau lần tính.
- **Dòng 2 (thanh công cụ trắng):**
  - Các nút riêng của màn hình.
  - **🔒 Khóa kỳ**.
  - **▶ Tính giá thành** – chỉ ở nhóm 3 và Chi phí. Có dữ liệu mới thì đổi thành "▶ Tính giá thành (có dữ liệu mới)".
  - Bên phải: **Năm làm việc** (chọn được ở Tổng quan; màn khác chỉ hiện "Năm 2026") và **· Xem:** (Cả năm / Tháng 1…12 / Từ ngày – đến ngày).

### 4.2 Lưới nhập liệu (`GRID` + `vGrid`) – dùng cho mọi bảng nhập
- **Nút trên lưới:**
  - `+ Thêm dòng` – dòng mới **để trống hoàn toàn**.
  - `📋 Nhập Excel`, `⬇ Xuất Excel`.
  - `Hiện tất cả các kỳ` (bảng theo kỳ).
  - Ô **tìm kiếm**.
  - `✕ Xóa lọc / sắp xếp`.
- **Mỗi dòng:** nút chữ `Sửa` `Xóa`. Đang sửa thì đổi thành `Lưu` `Hủy`. Một số bảng có nút riêng: `✂ Tách` (Mua hàng), `+ NVL` (Định mức – chèn thêm NVL cho cùng TP ngay dưới).
- **Ô vàng** = nhập. **Ô xám** = phần mềm tự tính (cột `extra`), chèn đúng vị trí bằng `before` / `after`.
- **Tiêu đề cột bắt buộc có dấu \*.** Dòng thiếu tô đỏ. Câu nhắc dưới lưới: *"Cột có dấu \* là bắt buộc – nhập đủ các cột này là Lưu được, các cột khác để trống được. Dòng mới để trống sẵn; ngày gõ nhanh: 15 = ngày 15 tháng đang xem, 15/10 = 15/10 năm đang xem."*
- **Ô mã:** gõ thì gợi ý mã từ danh mục; mã không có trong danh mục thì báo.
- **Dòng tổng theo kỳ** (`sumCols` / `sumExtra`) cho Mua (Thành tiền), Bán (SL, Doanh số, Tổng lãi), Lệnh (SL lệnh), Cân đối (SL), Xuất chung (SL, Thành tiền).
- **Kỳ:** lọc theo cột ngày `kyf`; bảng "không theo kỳ" (`noKy`) là Danh mục, Định mức, NVL thay thế, Lịch.

### 4.3 Bảng kiểu Excel (`enhanceTables`) – áp cho **mọi bảng**
- **Tiêu đề:** nền xanh đậm, chữ trắng, **canh giữa** và **cố định khi cuộn dọc**.
  - Tiêu đề ngắn (≤ 22 ký tự) không xuống dòng. Khi người dùng kéo giãn cột thì cho xuống dòng.
- **Nút ▼ mỗi cột:**
  - Sắp xếp tăng / giảm.
  - Lọc theo giá trị (tick chọn).
  - **Lọc số**: `≥`, `≤`, `|x| ≥` – dùng cho cột Tỷ lệ chênh lệch.
  - Cột đang lọc tô cam; nhãn "Đang lọc x/y".
- **Kéo giãn cột** ở mép phải tiêu đề.
- **Thanh cuộn ngang phía trên** bảng.
- **Cố định cột:** tự cố định đến cột tên cuối cùng trong 7 cột đầu, tối đa 86% bề rộng. Mua hàng & Bán hàng **không cố định cột**.
- Dòng chẵn nền xám nhạt; dòng **Tổng cộng** nền xanh nhạt, chữ đậm.

### 4.4 Tìm kiếm (`bindSearch`, `matchQ`)
- Không phân biệt hoa / thường và **dấu tiếng Việt** (đ = d).
- Nhiều từ thì phải có đủ các từ.
- **Ngày** gõ dạng `05/10`, `5/10`, `05/10/2026` hoặc `2026-10-05` đều tìm được.
- Tìm trên cả cột nhập lẫn cột tự tính (tên hàng…).
- Chờ gõ xong **0,35 giây** mới lọc, giữ vị trí con trỏ, không đảo ngược chữ khi gõ tiếng Việt (an toàn với bộ gõ). Enter để lọc ngay.

### 4.5 Hộp thoại dùng chung
- **▶ Tính giá thành** (ảnh 30):
  - Chọn Tháng (hoặc "Cả năm – chỉ tính, không đề xuất").
  - Tick "Đề xuất lại từ đầu" (kèm câu giải thích).
  - Dòng trạng thái tháng: đã / chưa chạy đề xuất, thiếu ước tính điện + gas.
  - Nút `Hủy` `Tính`. Tính xong hiện hộp kết quả.
- **📋 Nhập Excel** (ảnh 31):
  - Vùng kéo-thả / chọn tệp (XLSX, XLS ≤ 20 MB).
  - Dòng liệt kê sheet và cột mong đợi.
  - Nút **Tải tệp mẫu**; ô **dán trực tiếp từ Excel (Ctrl+V)**.
  - Chế độ **Thay thế dữ liệu của các kỳ có trong tệp** / **Thêm vào dữ liệu hiện có**.
- **🔒 Khóa kỳ** (ảnh 32): bảng 12 tháng của năm làm việc (Kỳ, Dữ liệu, Trạng thái 🔓 Đang mở / 🔒 Đã khóa, nút Khóa / Mở).
- **Hỏi xác nhận** khi xóa, phục hồi, xóa toàn bộ, đề xuất lại từ đầu.
- **Màn hình chờ** khi tính: khóa thao tác, ghi bước đang chạy.

---

## 5. Từng màn hình

### 5.1 Tổng quan (ảnh 01)
- **Tiêu đề:** "Tổng quan điều hành tháng mm/yyyy" (hoặc "năm …"). Đây là màn duy nhất có ô **Năm làm việc** chọn được.
- **Thẻ số liệu:**
  1. **Doanh số bán** – "n dòng bán".
  2. **Tổng lãi gộp** – "Biên lợi nhuận x%".
  3. **Sản lượng thành phẩm** – "thùng · BTP n kg".
  4. **Giá trị SX thành phẩm (154)** – "621 … · 622 … · 627 … (mọi công đoạn)".
  5. **Giá trị tồn cuối kỳ** – "n mã âm kho".
  6. **Cảnh báo dữ liệu** – số cảnh báo; dòng phụ ưu tiên "n mã rủi ro tồn kho – xem Cảnh báo & kiểm tra", không có thì "Dữ liệu sạch".
- **Dòng liên kết:** "Chi tiết xem tại: Giá thành (giá thành & lãi theo sản phẩm) · Tổng hợp bán hàng theo mặt hàng · Cảnh báo & kiểm tra (rủi ro tồn kho)". Link Giá thành mở thẳng tab Theo sản phẩm.
- **Không** đặt bảng rủi ro tồn kho hay bảng giá thành theo sản phẩm ở Tổng quan, vì trùng báo cáo khác. Đây là yêu cầu đã chốt.
- **Chưa có dữ liệu:** hiện hướng dẫn nhập + nút **Nạp dữ liệu năm 2026** (nếu tệp có dữ liệu mẫu).

### 5.2 Cảnh báo & kiểm tra (ảnh 02, 03)
- **Nút:** `⬇ Xuất Excel toàn bộ`.
- **Tab Kết quả kiểm tra:** các mục theo thứ tự, mỗi mục có nhãn **Đạt** (xanh) / **Cần xử lý** (đỏ).
  1. **Chỉ tiêu đánh giá rủi ro theo tháng – năm YYYY.**
     - Cột: Chỉ tiêu, Chiều, Cảnh báo, Rủi ro cao, T1…T12. Ô vàng / đỏ.
     - Chú thích: "Ô vàng = vượt ngưỡng cảnh báo, ô đỏ = vượt ngưỡng rủi ro cao."
  2. **Rủi ro tồn kho cần xử lý – gồm tồn cuối kỳ âm (n mã, m mã âm kho).** Gộp từ 2 mục cũ, đặt ngay dưới bảng chỉ tiêu.
     - Cột: Mã hàng, Tên hàng, Nhóm hàng, Phân loại (viên màu), Trạng thái rủi ro, Tồn đầu SL, Nhập SL, Xuất SL, Tồn cuối kỳ, Cần lấy đủ 15 ngày, Số ngày còn dùng.
     - **Mã âm kho xếp lên đầu.** Gồm: mã âm kho, mã Rủi ro cao, mã "cần mua".
     - Link sang NXT và Hướng dẫn.
  3. **Dòng nhập liệu chưa đầy đủ thông tin bắt buộc** – liệt kê theo bảng (link tới bảng), "n dòng (tô đỏ trong bảng)".
  4. **Mã phát sinh nhưng chưa có trong danh mục** – mã và nơi phát sinh.
  5. **Định mức** – lệnh SX không có định mức / dòng định mức lỗi (SL = 0, thiếu mã NVL) / thành phẩm có bán nhưng chưa có định mức.
  6. **Mã lệnh SX bị trùng / điều chỉnh TP nhập sai dòng.**
  7. **NVL xuất dùng nhưng chưa có giá** (không tồn đầu, không mua; hoặc bán thành phẩm chưa có giá thành trong tháng).
  8. **Đơn giá mua / bán bất thường (n đỏ · m vàng).**
     - Cột: Mức, Loại (Mua / Bán), Ngày, Số HĐ, Mã, Tên hàng, Đơn giá, Chênh lệch giá, Tỷ lệ chênh lệch, Cảnh báo (câu giải thích), nút **Đi tới dòng**.
     - Dòng ngưỡng đang dùng.
  9. **Kiểm tra lệnh sản xuất (n lệnh chưa đủ dữ liệu)** – Mã lệnh, Ngày SX, Mã sản phẩm, Tên sản phẩm, SL thực hiện, Kiểm tra (viên đỏ), Cách xử lý, nút **Đi tới lệnh**.
  10. **Cảnh báo khác khi tính toán** – Loại, Mã, Nội dung (tối đa 500 dòng).
- **Tab Ngưỡng cảnh báo:**
  - **Bảng ngưỡng tồn** – Nhóm hàng / Mã, Rủi ro khi tồn trên (ngày), Cảnh báo khi tồn trên (ngày) – tự động = ½, Tồn tối thiểu (ngày), Ghi chú. Nút `+ Thêm dòng`, `Lưu ngưỡng`.
  - **Bảng "Ngưỡng chênh lệch giá mua / bán (%)"** – Loại, Cảnh báo vàng khi lệch từ (%), Cảnh báo đỏ khi lệch từ (%).
  - Câu giải thích cách tính số ngày còn dùng và giá so sánh.
- **Tệp Excel `CanhBao_KiemTra_<kỳ>.xlsx`:**
  - Sheet **TongHop**: Mục kiểm tra, Số dòng / mã, Kết quả, Sheet chi tiết, Kỳ.
  - Sheet **ChiTieu**: chỉ tiêu, ngưỡng, giá trị T1..Tn (tỷ lệ 4 số lẻ), Số tháng vượt cảnh báo, Số tháng rủi ro cao.
  - Sheet chi tiết **chỉ cho mục Cần xử lý**: RuiRoTonKho, NhapThieu, ThieuDanhMuc, DinhMuc, TrungLenh, ChuaCoGia, DonGiaBatThuong, LenhSX, CanhBaoKhac.
  - Mỗi sheet cố định dòng tiêu đề.

### 5.3 Danh mục hàng (ảnh 04)
- **Cột nhập:** Mã \*, Tên hàng \*, Nhóm hàng \* (chọn từ `NHOM`), ĐVT \*, Kho.
- **Cột tự tính:**
  - **Loại**: "Thành phẩm đóng gói (bán)" / "Tự sản xuất – cấp n" / "NVL / vật tư mua".
  - **Có định mức**: "Có" / "⚠ chưa có" – chỉ cho hàng tự sản xuất. Ý nghĩa: sản phẩm tự SX đã khai định mức chưa.
- Mã không trùng. Sắp theo thứ tự nhóm rồi mã. Không xóa / đổi mã đang dùng.

### 5.4 Số dư NXT đầu kỳ (ảnh 05)
- **Tiêu đề:** "Số dư NXT đầu kỳ (chỉ nhập một lần cho kỳ bắt đầu)". Ô chọn **Kỳ bắt đầu**.
- **Cột:** Mã hàng, Tên hàng, Nhóm hàng, ĐVT, Kho, Tồn đầu SL, Tồn đầu TT, Đơn giá tồn đầu kỳ (tự tính = TT ÷ SL).

### 5.5 Định mức (ảnh 06)
- **Cột nhập:** Loại ĐM \*, Mã TP \*, Mã NVL \*, SL TP/lần \*, SL NVL/lần \*, Lần/ngày, Hao hụt % (gõ `2%` hoặc `0.02`, hiển thị %), Hiệu lực từ, Hiệu lực đến, Ghi chú.
- **Cột tự tính:**
  - Tên TP (sau Mã TP); Tên NVL, Nhóm (sau Mã NVL).
  - **Số lượng/SP** = SL NVL/lần ÷ SL TP/lần.
  - **Trạng thái** (sau Hiệu lực đến): "Đang áp dụng" / "Hết hiệu lực từ dd/mm/yyyy" / "Áp dụng từ dd/mm/yyyy".
- **Nút dòng** `+ NVL` (chèn NVL mới cho cùng TP ngay tại chỗ). Có hộp **đổi NVL** (`swapBomDialog`).
- Đã **bỏ cột "Cách tính"**.

### 5.6 NVL thay thế (ảnh 07)
- **Cột nhập:** Mã TP (trống = mọi TP), Mã NVL gốc \*, Mã NVL thay thế \*, Hiệu lực từ \*, Hiệu lực đến, Tỷ lệ TT, Ghi chú.
- **Cột tự tính:**
  - Tên NVL gốc, Tên NVL thay thế.
  - **Cách áp dụng**: "Thay toàn bộ" / "Gốc x% + thay thế y%".
  - **Hiệu lực tại kỳ đang chọn**: "Đang áp dụng" / "Chưa đến" / "Đã hết" / "⚠ thiếu Từ ngày".

### 5.7 Mua hàng & Bán hàng (ảnh 08, 09) – một màn hình, 2 tab
Tab **⬇ Mua hàng / nhập kho** (màu xanh) và **⬆ Bán hàng / xuất kho** (màu cam). Tiêu đề "Nhập liệu định kỳ". **Không cố định cột.**

**Mua hàng**
- **Cột (đúng thứ tự):** Ngày nhập kho \*, Ngày hóa đơn, Số hóa đơn, Nhà cung cấp (rộng 220), Mã hàng \*, Tên hàng, ĐVT, Số lượng \*, Đơn giá, Thành tiền \*, Chênh lệch giá mua, Tỷ lệ chênh lệch, Mua hàng chưa HĐ, Kho.
- **Nút dòng `✂ Tách`:** tách hóa đơn (quy định 02 §10.12).
- **Đã bỏ:** cột Ghi chú khỏi lưới (vẫn lưu trong dữ liệu), cột "Kiểm tra mã NXT", cột "Cảnh báo giá".
- **Tô màu** ô Tỷ lệ chênh lệch vàng / đỏ.

**Bán hàng**
- **Cột:** Ngày hóa đơn \*, Số hóa đơn, Tên khách hàng (rộng 180), Mã hàng \*, Tên hàng, ĐVT, Số lượng bán \*, Đơn giá, Doanh số bán \*, Chênh lệch giá bán, Tỷ lệ chênh lệch, Giá vốn, Tỷ lệ lãi, Tổng lãi, Ghi chú, Trạng thái dữ liệu.
- **Trạng thái dữ liệu:** `ÂM KHO` (tồn TP âm tại ngày bán) và / hoặc `THIẾU SỐ HĐ`. Đã bỏ nhãn "BÁN LỖ" và "CHƯA CÓ TRONG NXT".
- **Nhập Excel** một lần cả 2 sheet `MuaHang` + `BanHang` (hoặc sheet `GiaoDich` có cột Loại MUA / BAN).

### 5.8 Xuất dùng chung (ảnh 10)
- **Cột:** Số chứng từ (tự sinh), Ngày xuất \*, Loại xuất \* (**Chi phí sản xuất (627)** / **Bán hàng (641)**), Mã VT \*, Tên VT, ĐVT, Số lượng \*, Lý do, Đơn giá (giá BQ NVL mua tháng), Thành tiền.
- **Dòng ghi chú tổng:** tổng 627 / tổng 641 của kỳ.
- Tên menu chốt là "**Xuất dùng chung**" (không dùng "Xuất vật tư").

### 5.9 Chi phí 622/627 (ảnh 11)
- **Tiêu đề:** "Chi phí 622 / 627 – năm YYYY". **Nút:** `📋 Nhập Excel`, `⬇ Xuất Excel`, `⚙ Cột chi phí`, ▶ Tính giá thành.
- **Bảng 12 tháng + dòng Cả năm.** Cột:
  - Tháng.
  - **621 / BTP (NVL mua)** = NVL mua xuất cho bán thành phẩm.
  - **621 / TP (bao bì)** = NVL mua xuất cho thành phẩm.
  - 622 Nhân công, 6273 Dụng cụ, 6274 Khấu hao, 6277 Điện, 6277 Nước (ô nhập).
  - 6277 Xuất dùng chung (627), Tổng 627.
  - **622 đ/kg SX**, **627 đ/kg SX** (kg = kg BGKT sản xuất).
  - **Tổng giá thành 154** = 621 + 622 + 627.
  - 621/154, 622/154, 627/154.
  - **641 Bán hàng** (xuất dùng chung loại 641).
  - **Chưa phân bổ (không SX)**.
- **Ghi chú dưới bảng:** giải thích kg SX, 154, 641, Chưa phân bổ, và chỗ đặt quy tắc phân bổ (Thiết lập → tab Phân bổ 622/627).
- Phần thiết lập phân bổ **không đặt ở đây**.
- **Tệp:** `ChiPhi_622_627_YYYY.xlsx` (sheet ChiPhi, đúng các cột trên).

### 5.10 Đề xuất sản xuất (ảnh 12–14)
- **Tab 1 · Đề xuất theo ngày:**
  - **Hộp "Thông số đề xuất"** (rời ô là lưu, có tác dụng ngay): Tỷ lệ năng lượng (đ/kg BGKT) (kèm gợi ý), Tồn TP tối đa (ngày bán), Tồn an toàn (ngày), Giảm tối đa khi tồn đủ (%), Số ngày tính BQ bán.
  - **Bảng 12 tháng:** Tháng, Ước tính điện + gas (đầu tháng) (ô nhập), Điện thực tế, Gas thực tế (xuất dùng chung 627), Đang dùng (Thực tế / Ước tính / thiếu gas / chưa có), Năng lượng (đ), đ/kg, Ngày làm việc, Công suất tháng (kg BGKT).
  - Khối **"Ngày cần chú ý"** và nút **Xem chi tiết theo ngày** (bảng theo ngày từng loại thùng: tồn đầu, đóng gói, bán, tồn cuối; BGKT, bánh khô, kem tươi theo mẻ; cảnh báo ngày).
- **Tab 2 · Tạo lệnh sản xuất** (số vàng = số ngày cần tạo): danh sách đề xuất với trạng thái `CHƯA CÓ LỆNH` / `LỆCH LỆNH` / `ĐÃ CÓ LỆNH` / `ĐÃ KHÓA`. Nút `⚙ Tạo / cập nhật Lệnh sản xuất từ đề xuất`, `📋 Sao chép khóa lệnh`.
- **Tab 3 · Đề xuất cân đối NVL (tồn âm):**
  - "1 · Phân tích tồn cuối âm (n mã)": nguyên nhân, cách xử lý.
  - "2 · Đề xuất cân đối NVL theo lệnh (n dòng · tổng)": ô vàng sửa số trước khi áp dụng, nút Áp dụng.

### 5.11 Lệnh sản xuất (ảnh 15)
- **Nút:** `+ Thêm dòng`, `📋 Nhập Excel`, `⬇ Xuất Excel`, `➜ Đề xuất sản xuất`, `⟲ Đề xuất lại từ tháng này`, `Hiện tất cả các kỳ`.
- **Cột:** Mã lệnh (tự sinh), Ngày sản xuất \*, Mã sản phẩm \*, Tên sản phẩm, Công đoạn, Số lượng lệnh, Điều chỉnh (+/- thùng), SL thực hiện, Số mẻ (BTP), Tình trạng, Giá thành/đv, Ghi chú, Nguồn.
- **Khi lưu:** Ngày xuất NVL = Ngày SX; Loại ĐM mặc định DM; mã lệnh tự sinh.

### 5.12 Cân đối NVL (ảnh 16)
- **Nút:** `⚙ Cân đối theo đề xuất (tồn âm)`, `➜ Xem phân tích tồn âm`. Có dòng trạng thái "✔ Đề xuất cân đối NVL mm/yyyy: không có dòng nào chưa áp dụng".
- **Cột:** Ngày sản xuất \*, Mã sản phẩm \*, Lệnh SX (tự dò; "⚠ không có lệnh"), Mã VT/HH \*, Tên VT, ĐVT, SL cân đối (+/-) \*, Lý do (rộng 280), Nguồn.

### 5.13 Giá thành (ảnh 17–20)
- **Bộ lọc công đoạn:** Mọi công đoạn / Bán thành phẩm (Gia thanh BTP) / Thành phẩm (Gia thanh TP). **Nút** `⬇ Xuất Excel`.
- **Tab Theo lệnh sản xuất:** Mã lệnh, Ngày SX, Mã sản phẩm, Tên thành phẩm, Công đoạn, SL lệnh, Điều chỉnh TP, SL thực hiện, Số mẻ, Số NVL, 621, 622, 627, 154, (khi có sản phẩm lỗi) SL lỗi, Thu hồi SP lỗi (giảm 154), Giá vốn/đv (đã trừ thu hồi), Giá bán BQ, Tỷ lệ lãi 1 sp, Kiểm tra. Bấm một lệnh thì mở chi tiết lệnh.
- **Tab Nhật ký xuất vật tư:** Mã lệnh, Ngày xuất NVL, Mã sản phẩm, Tên thành phẩm, Mã VT/HH, Tên vật tư, ĐVT, Định mức, Mẻ / SL, SL theo ĐM, Cân đối, Tổng số lượng, Đơn giá, Thành tiền (621), 622, 627, 154, NVL tồn cuối ngày.
- **Tab Theo sản phẩm:** Mã sản phẩm, Tên sản phẩm, Công đoạn, Lệnh, SL sản xuất, ĐVT, 621 NVL, 622, 627, Giá thành 154, Giá thành/đv, Đơn giá bình quân, SL bán, Giá bán BQ, Lãi gộp, Tỷ lệ lãi, Tồn cuối kỳ (dòng tổng).
- **Tab Chi tiết** (mỗi dòng = 1 NVL của 1 lệnh, **cùng 28 cột với sheet ChiTiet**): Lệnh SX, Ngày SX, Ngày xuất NVL, Công đoạn, Mã thành phẩm, Tên thành phẩm, ĐVT TP, SL lệnh, Điều chỉnh TP, SL thực hiện, Số mẻ, Mã NVL / VT, Tên NVL / VT, Nhóm, ĐVT, Loại, Định mức, Mẻ / SL, SL theo ĐM, Cân đối, Tổng SL xuất, Đơn giá, 621 Thành tiền, Tỷ trọng 621 trong lệnh, 622 phân bổ, 627 phân bổ, 154 Giá thành, Giá thành/đv lệnh. Cố định 6 cột đầu, có dòng tổng.
- **Đã bỏ khỏi tab Theo lệnh:** 621 lệnh, 622 lệnh, 627 lệnh, 154 lệnh, NVL tồn cuối ngày, Kiểm tra lệnh. Kiểm tra lệnh chuyển sang Cảnh báo.
- **Tệp `GiaThanh_<kỳ>.xlsx`** (6 sheet):
  1. **ChiTiet** – 28 cột như tab Chi tiết.
  2. **TheoLenh** – Mã lệnh, Ngày SX, Mã sản phẩm, Tên thành phẩm, Công đoạn, SL lệnh, Điều chỉnh TP, SL thực hiện, Số mẻ, 621 NVL, 622 Nhân công, 627 SX chung, 154 Giá thành, Giá vốn/đv. Cố định 4 cột.
  3. **Gia thanh BTP** và 4. **Gia thanh TP** – **đúng bố cục file Excel gốc** để đối chiếu từng ô (đã khớp 100% 10 tháng, trừ mã lệnh):
     - Dòng 2: tiêu đề "GIÁ THÀNH BÁN THÀNH PHẨM" / "GIÁ THÀNH THÀNH PHẨM".
     - Dòng 3: nhóm cột "THÔNG TIN LỆNH SẢN XUẤT | ĐỊNH MỨC & CHI PHÍ NGUYÊN VẬT LIỆU | PHÂN BỔ CHI PHÍ | GIÁ THÀNH & BIÊN LỢI NHUẬN".
     - Dòng 4 (36 cột BTP / 35 cột TP): Lệnh SX, Tháng SX, Ngày nhập kho TP, Mã thành phẩm, Tên thành phẩm, ĐVT thành phẩm, Loại dịnh mức, Tổng loại NVL, SL SX, SL SX - 1, Tỷ lệ hao hụt, SL hao hụt, Tháng xuất VT, Ngày xuất kho NVL, Mã VT/HH, Tên vật tư, ĐVT, ĐM NVL/mẻ hoặc kg (TP: Định mức), SL NVL cần (TP: SL), Cân đối, Tổng số lương, Đơn giá, Thành tiền, NVL tồn cuối ngày, 621, 622, 627, 154, Giá vốn, Giá bán, Chênh lệch, Tỷ lệ lãi 1 sp, Tỷ lệ chênh lệch sản phẩm, STT dòng, Dòng ĐM, (BTP thêm) 621 NVL mua.
     - Cố định 4 cột, 4 dòng.
  5. **TheoSanPham** – Mã, Tên, SL SX, 621 NVL, 622 Nhân công, 627 SX chung, 154 Giá thành, Giá thành/đv, Đơn giá bình quân, SL bán, Doanh số, Giá bán BQ, Lãi gộp, Tỷ lệ lãi.
  6. **PhanBo_622_627** – Công đoạn, Mã sản phẩm, Tên sản phẩm, Số lệnh, SL thực hiện, 621 NVL, Tỷ lệ công đoạn – 622, Tỷ lệ SP trong CĐ – 622, 622 phân bổ, Tỷ lệ công đoạn – 627, Tỷ lệ SP trong CĐ – 627, 627 phân bổ, 154 Giá thành, Giá thành/đv, Cách chia trong CĐ ("Tỷ lệ cố định (Thiết lập → Phân bổ 622/627)" / "Theo tỷ trọng 621 trong tháng"), dòng Tổng cộng.

### 5.14 Nhập – Xuất – Tồn (ảnh 21)
- **Tiêu đề:** "Tổng hợp nhập – xuất – tồn kho tháng …". Lọc **nhóm hàng**; **Nút** `⬇ Xuất Excel`.
- **Cột:** Kho, Mã, Mặt hàng, Nhóm, ĐVT, Giá vốn, Tồn đầu SL, Tồn đầu TT, Nhập SL, Nhập TT, Xuất SL, Xuất TT, Tồn cuối SL, Tồn cuối TT, Đơn giá BQ mua (NVL), NVL cần lấy đủ 15 ngày, BQ/ngày, Số ngày còn dùng, **Phân loại** (Rủi ro cao / Cảnh báo / OK – viết hoa chữ đầu, cỡ chữ chung), **Trạng thái rủi ro** (link "#goRR" sang mục giải thích trong Hướng dẫn).
- **Tệp:** `NXT_<kỳ>.xlsx` (sheet NXT, cột tương tự, cột cuối "Trạng thái").

### 5.15 Tổng hợp bán hàng theo mặt hàng (ảnh 22)
- Thay cho báo cáo "Bán hàng & lãi gộp" cũ (đã có sheet Bán hàng nên không cần).
- **Cột:** Mã, Mặt hàng, Nhóm, ĐVT, SL bán, Đơn giá bán BQ, Doanh số, Tỷ trọng doanh số, Giá vốn, Giá vốn hàng bán, Lãi gộp, Tỷ lệ lãi (dòng tổng).
- **Tệp:** `TongHopBanHang_<kỳ>.xlsx` (sheet TheoMatHang).

### 5.16 Tổng hợp năm (ảnh 23)
- **Tiêu đề:** "Hiệu quả năm YYYY".
- **Cột:** Tháng, Số lệnh, SL sản xuất (thùng TP đóng gói), Giá trị SX 154 (TP đóng gói), Doanh số bán, Tổng lãi gộp, Biên LN (= lãi ÷ doanh số), Tồn cuối kho (giá trị). Dòng Tổng cộng (Biên LN cả năm).
- **Tệp:** `TongHop_YYYY.xlsx` (sheet Nam).

### 5.17 File tải dữ liệu kế toán – mẫu ASP (ảnh 24, 25)
- **Tiêu đề** có kỳ; viên "Đối tượng: …", "TK Nợ xuất … · TK Có nhập …", số dòng XK / NK. Báo nếu chưa tính lại.
- **Tab Phiếu xuất kho NVL (XK NVL):** mỗi dòng NVL có Tổng SL > 0.
  - Cột: Loại xuất kho = "Xuất kho sản xuất"; Ngày hạch toán (\*) và Ngày chứng từ (\*) = ngày xuất NVL; **Số chứng từ (\*) = `XK` + Mã TP + số ngày Excel**; Mã đối tượng, Tên đối tượng (thiết lập); Lý do xuất = "Xuất VL - <tên TP>"; Mã hàng; Tên hàng; Mã kho (cột Kho danh mục, mặc định 152); TK Nợ (\*) = thiết lập (621); TK Có (\*) = kho NVL; ĐVT; Số lượng (4 số lẻ); Mã đối tượng THCP = Mã TP; Tên đối tượng THCP.
- **Tab Phiếu nhập kho TP (NK TP):** mỗi lệnh có SL thực hiện > 0.
  - Cột: Loại nhập kho = "Nhập kho thành phẩm sản xuất"; Ngày hạch toán, Ngày chứng từ = ngày SX; **Số chứng từ = `TP-` + Mã TP + số ngày Excel**; Mã / Tên đối tượng; Diễn giải = "Nhập kho TP sản xuất - <tên>"; Mã hàng; Tên hàng; Mã kho (mặc định 155); TK Nợ = kho TP; TK Có = thiết lập (154); ĐVT; Số lượng; Mã đối tượng THCP.
- **Tệp:** `KeToan_Phieu_kho_<kỳ>.xlsx` (2 sheet "XK NVL", "NK TP").
  - Mỗi sheet có **8 dòng tiêu đề đúng mẫu ASP**: "FILE MẪU PHIẾU XUẤT/NHẬP KHO ĐỂ NHẬP VÀO PHẦN MỀM ASP KẾ TOÁN", 5 dòng hướng dẫn, dòng "Chi tiết hàng tiền", dòng tên cột.
  - Ngày là ô kiểu Ngày.

### 5.18 Thiết lập & sao lưu (ảnh 26–28)
- **Tab Thiết lập & sao lưu:**
  - **Thông tin:** Tên công ty / đơn vị, Kỳ bắt đầu, File kế toán – Mã đối tượng, Tên đối tượng, TK Nợ phiếu xuất NVL, TK Có phiếu nhập TP. Dòng "Dữ liệu hiện có: …".
  - **Sao lưu & phục hồi:** `⬇ Sao lưu (.json)`, `⬆ Phục hồi từ file .json`, `⬇ Xuất toàn bộ dữ liệu ra Excel` (tệp `DuLieu_GiaThanh_<ngày>.xlsx` đúng mẫu nhập, nhập lại được).
  - **Khóa kỳ đã chốt:** các nút 🔓 / 🔒 theo tháng.
  - **Khóa sổ sang năm mới:** chỉ giải thích (tự động).
  - **Dữ liệu ban đầu:** Nạp dữ liệu năm 2026.
  - **Xóa dữ liệu:** Xóa toàn bộ dữ liệu.
- **Tab Sản phẩm lỗi (ảnh 33)** – bổ sung 04/11/2026:
  - Khung giải thích quy định VAS 02.
  - **Bảng "Quy tắc sản phẩm lỗi"** gồm: Sản phẩm chính (chọn), Tên, Mã sản phẩm lỗi (chọn mã nhóm Sản phẩm lỗi), Tên sản phẩm lỗi, Tỷ lệ lỗi (%), Giá bán ước tính (đ/ĐVT), Áp dụng từ kỳ (mm/yyyy), Ghi chú, nút Xóa.
  - Nút `+ Thêm quy tắc`, `Lưu quy tắc sản phẩm lỗi`.
  - Hộp "Cách phần mềm tính", kèm dòng số SL lỗi / giá trị thu hồi của kỳ đang xem.
  - Lần đầu mở, phần mềm tự tạo mã `BTP_BGK_LOI` "Bánh gấu khô lỗi (dẹp)" trong Danh mục.
- **Tab Lịch nghỉ / tăng ca:** Ngày \*, Thứ (tự tính), Loại \* (Nghỉ lễ / công ty · Nghỉ chờ việc · Tăng ca / làm Chủ nhật), Lý do / ghi chú.
- **Tab Phân bổ 622/627 – chỉ là thiết lập:**
  - **Bảng "1 · Tỷ lệ theo công đoạn":** CĐ1 (ô nhập 622, 627); CĐ2 tự động = 1 − CĐ1, hiển thị trực tiếp khi gõ.
  - **Bảng "2 · Tỷ lệ từng sản phẩm trong công đoạn":** CĐ1 các sản phẩm (ô nhập; tổng phải 100%; `+ Thêm sản phẩm CĐ1`); dòng CĐ2 chỉ ghi "phân bổ theo tỷ trọng 621 trong tháng".
  - Nút `Lưu quy tắc phân bổ`. Ghi chú: "Nhập dạng số thập phân: 0,8 = 80%".

### 5.19 Hướng dẫn (ảnh 29)
Các hộp, theo thứ tự:
1. **Trình tự làm việc hằng tháng** – 8 bước: lần đầu → đầu tháng → nhập liệu → ▶ Tính → sửa lệnh → cân đối NVL → tính lại → xem kết quả, khóa kỳ, sao lưu.
2. **Sơ đồ sản xuất & tính giá thành** – 3 cấp.
3. **Công thức áp dụng (khớp file Excel)**.
4. **Đề xuất sản xuất – theo công suất năng lượng**.
5. **Trạng thái rủi ro – ý nghĩa & cách xử lý** (id `#goRR`):
   - Bảng thứ tự ưu tiên trạng thái.
   - **Bảng chi tiết theo từng nhóm / mã sinh tự động từ thiết lập ngưỡng** (ghi rõ mốc, ví dụ "Tồn trên 6 tháng…").
   - Bảng 10 chỉ tiêu theo tháng, các dấu hiệu khác.
6. **Phát hiện sai – làm lại thế nào?** (7 tình huống).
7. **Thiết lập – ở đâu?**
8. **Quy ước màn hình**.

---

## 6. Nhập dữ liệu từ Excel (mẫu `Mau_Tai_Du_Lieu_GiaThanh.xlsx`)

**Quy tắc chung:**
- Dòng 1 là tiêu đề (tự nhận dạng tiêu đề nếu khớp ≥ 2 nhãn và không phải số).
- Dòng ví dụ bắt đầu "Dòng 2 là ví dụ…" tự bỏ qua.
- Ngày nhận ô kiểu Ngày, số seri Excel, `dd/mm/yyyy` hoặc `yyyy-mm-dd`. Kỳ `mm/yyyy`.
- Chế độ **Thay thế các kỳ có trong tệp** hoặc **Thêm**. **Bỏ qua tháng đã khóa.**
- **Chặn toàn bộ nếu có mã chưa có trong danh mục** (liệt kê mã + số dòng).
- Danh mục nhập theo kiểu **cập nhật**: mã đã có thì cập nhật tên / nhóm / ĐVT / kho.

| Sheet | Cột (đúng thứ tự) |
|---|---|
| HuongDan | 5 dòng hướng dẫn + danh sách sheet |
| DanhMuc | Mã · Tên hàng · Nhóm hàng · ĐVT · Kho |
| TonDau | Kỳ (mm/yyyy) · Mã hàng · Tồn đầu kỳ - Số lượng · Tồn đầu kỳ - Giá trị |
| DinhMuc | Loại ĐM · Mã TP · Mã NVL · SL TP/lần · SL NVL/lần · Lần/ngày · Hao hụt % (gõ 2% hoặc 0.02) · Hiệu lực từ (trống = từ đầu) · Hiệu lực đến (trống = vô thời hạn) · Ghi chú |
| NVLThayThe | Mã TP (trống = mọi TP) · Mã NVL gốc · Mã NVL thay thế · Từ ngày · Đến ngày (trống = vô thời hạn) · Tỷ lệ thay thế (0.3 = 30%, trống = 100%) · Ghi chú |
| MuaHang | Ngày nhập kho · Ngày hóa đơn · Số hóa đơn · Nhà cung cấp · Mã hàng · Số lượng · Đơn giá · Thành tiền · Kho · Ghi chú |
| BanHang | Ngày hóa đơn · Số hóa đơn · Tên khách hàng · Mã hàng · Số lượng bán · Đơn giá · Doanh số (trống = SL × đơn giá) · Ghi chú |
| GiaoDich (tệp xuất toàn bộ) | Loại (MUA/BAN) · Ngày · Hóa đơn · Nhà cung cấp / Khách hàng · Mã hàng · Số lượng · Đơn giá · Thành tiền / Doanh số · Ghi chú |
| LenhSX | Khóa kế hoạch (MÃ#yyyymmdd@SL~mẻ – nếu có thì bỏ trống các cột sau) · Ngày sản xuất · Mã sản phẩm · Số lượng · Điều chỉnh TP (+/- thùng, chỉ dòng thành phẩm) · Loại ĐM · Ghi chú |
| CanDoiNVL | Ngày sản xuất · Mã sản phẩm · Mã VT/HH · SL cân đối (+/-) · Lý do |
| XuatChung | Số chứng từ (trống = tự sinh) · Ngày xuất · Mã VT · Số lượng · Lý do · Loại xuất (627 / 641) |
| LichNghi | Ngày · Loại (Nghỉ lễ / công ty · Nghỉ chờ việc · Tăng ca / làm Chủ nhật) · Lý do / ghi chú |
| ChiPhi | Kỳ (mm/yyyy) · 622 Nhân công · 6273 Dụng cụ · 6274 Khấu hao · 6277 Điện · 6277 Nước (theo cột chi phí đang có) |

- **Tệp mẫu từng bảng** (nút Tải tệp mẫu): `Mau_<Sheet>.xlsx`, hoặc `Mau_MuaHang_BanHang.xlsx` cho Mua + Bán. Mỗi mẫu có 1 dòng ví dụ + dòng ghi chú.
- **Tệp xuất từng lưới:** `<bảng>_<kỳ>.xlsx`.

---

## 7. Danh sách tệp phần mềm tạo ra

| Tệp | Từ đâu | Sheet |
|---|---|---|
| `GiaThanh_<kỳ>.xlsx` | Giá thành | ChiTiet, TheoLenh, Gia thanh BTP, Gia thanh TP, TheoSanPham, PhanBo_622_627 |
| `NXT_<kỳ>.xlsx` | NXT | NXT |
| `TongHopBanHang_<kỳ>.xlsx` | Tổng hợp bán hàng | TheoMatHang |
| `TongHop_<năm>.xlsx` | Tổng hợp năm | Nam |
| `ChiPhi_622_627_<năm>.xlsx` | Chi phí | ChiPhi |
| `CanhBao_KiemTra_<kỳ>.xlsx` | Cảnh báo | TongHop, ChiTieu, + sheet chi tiết mục cần xử lý |
| `KeToan_Phieu_kho_<kỳ>.xlsx` (hoặc `KeToan_XK_NVL_…`, `KeToan_NK_TP_…`) | File kế toán | XK NVL, NK TP |
| `DuLieu_GiaThanh_<ngày>.xlsx` | Thiết lập | HuongDan, GiaoDich, DanhMuc, TonDau, DinhMuc, NVLThayThe, LenhSX, CanDoiNVL, XuatChung, LichNghi, ChiPhi |
| `Mau_Tai_Du_Lieu_GiaThanh.xlsx` | Nhập Excel | như trên, không dữ liệu |
| `<bảng>_<kỳ>.xlsx` | Mỗi lưới nhập | 1 sheet |
| `*.json` | Sao lưu | toàn bộ tài liệu |
