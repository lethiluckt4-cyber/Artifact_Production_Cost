# 04 – HƯỚNG DẪN XÂY DỰNG LẠI CHO MỘT CÔNG TY KHÁC

Mục tiêu: dùng lại **toàn bộ khung** của phần mềm, gồm menu, lưới nhập, nhập / xuất Excel, bảng kiểu Excel, khóa kỳ, lưu trữ an toàn, sao lưu, cảnh báo, NXT và báo cáo. Chỉ **thay phần riêng của công ty**. Làm theo 7 bước dưới đây.

---

## Bước 0 – Thu thập thông tin của công ty mới (bảng câu hỏi)

| # | Câu hỏi | Ảnh hưởng tới |
|---|---|---|
| 1 | File Excel giá thành đang dùng (ít nhất 1–3 tháng đầy đủ, có số đã chốt) | Đối chiếu số, dữ liệu mẫu |
| 2 | Danh sách **nhóm hàng**. Nhóm nào là thành phẩm bán ra, nhóm nào tự sản xuất (bán thành phẩm), nhóm nào là NVL / bao bì / nhiên liệu | `NHOM`, `PROD_NHOM`, `isFinal`, ngưỡng tồn |
| 3 | Sản xuất mấy cấp? Có theo **mẻ** không, cỡ mẻ bao nhiêu? Có hao hụt không? | Định mức, `batchSize`, làm tròn |
| 4 | **Quy tắc làm tròn** số lượng NVL xuất (theo Excel gốc) | `calc()` mục 3.2 |
| 5 | **Giá vốn:** bình quân tháng (như hiện tại) hay cách khác | `calc()` mục 4.2 |
| 6 | **Chi phí ngoài NVL:** các khoản 622 / 627 / khác, có xuất dùng chung không (loại nào vào giá thành, loại nào không) | `COSTCOLS0`, `ISSUE_TYPES` |
| 7 | **Tiêu thức phân bổ** 622 / 627: theo công đoạn + tỷ lệ cố định, theo 621, theo sản lượng, theo giờ máy… | `allocate()`, tab Phân bổ |
| 8 | Có cần **đề xuất sản xuất** không? Theo tiêu chí gì (năng lượng, đơn hàng, tồn tối thiểu…)? | `buildPlan` (có thể bỏ) |
| 9 | Lịch làm việc: nghỉ Chủ nhật? làm Thứ 7? | `netDays`, `calSets` |
| 10 | **Ngưỡng tồn** theo nhóm / mã: rủi ro khi tồn trên bao nhiêu ngày, tồn tối thiểu | `NGUONG0` |
| 11 | **Chỉ tiêu đánh giá theo tháng** công ty quan tâm + ngưỡng vàng / đỏ | `KPI` trong `vCanhBao` |
| 12 | Ngưỡng chênh lệch giá mua / bán (mặc định 10/30%, 5/20%) | `GIANG0` |
| 13 | **Phần mềm kế toán** (ASP / MISA / Fast…): mẫu phiếu xuất / nhập kho, cột, quy tắc số chứng từ, TK Nợ / Có, mã kho | `XK_HDR`, `NK_HDR`, `buildXK/NK` |
| 14 | Tên công ty, kỳ bắt đầu, số dư đầu kỳ | Thiết lập |

---

## Bước 1 – Khởi tạo bản mới
1. Lấy tệp `app/PhanMem_GiaThanh_MAU_TRONG.html`. Bản này không có dữ liệu mẫu, tên công ty là `[TÊN CÔNG TY]`.
2. Tìm và thay `[TÊN CÔNG TY]` (3 chỗ: `<title>`, `state.settings.company`, `fromDocs`).
3. **Xuất bản thành artifact MỚI** (slug mới), rồi khai báo `db` với rule `{path:"", read:"view", write:"interact"}` và `downloads`.
   - Hai công ty sẽ có hai kho dữ liệu **tách biệt hoàn toàn**.
   - **Không** dùng chung artifact của Thiên Hồng.
4. (Tuỳ chọn) Tạo dữ liệu mẫu:
   - Viết script đọc Excel của công ty mới thành `seed.json`, theo mẫu `cong_cu/extract_th.py`.
   - Dán vào `<script type="application/json" id="seed">…</script>` để có nút "Nạp dữ liệu".
   - Sửa các câu "Nạp dữ liệu năm 2026", "Gia thanh - 26 TH" cho đúng.

## Bước 2 – Định nghĩa dữ liệu [A]
Chỉ sửa khi công ty mới có cột khác:
- `F`: thứ tự trường lưu trữ của từng bảng. Thêm trường thì **thêm vào cuối**.
- `GRID`:
  - `cols`: cột nhập (`k`, `t`, `n`=số, `d`=ngày, `sel`=danh sách, `pct`=phần trăm, `w`=rộng).
  - `extra`: cột tự tính, đặt vị trí bằng `before` / `after`.
  - `req`: bắt buộc. `codes`: phải có trong danh mục. `unique`: không trùng.
  - `sumCols` / `sumExtra`: dòng tổng. `kyf`: cột ngày lọc theo kỳ. `noKy`, `noFreeze`, `rowBtn`, `onEdit`.
- `TEMPLATE` + `SAMPLES` + `TPLNOTE`: mẫu nhập Excel (tên sheet, nhãn cột, dòng ví dụ, ghi chú).
- `NHOM`, `NHOM_ORDER`, `PROD_NHOM`, `isFinal` (nhóm thành phẩm bán ra).
- `COSTCOLS0` (cột chi phí mặc định, nhóm 622 / 627). `ISSUE_TYPES` (loại xuất dùng chung).
- `NAV`: thêm / bớt menu. Thêm hàm vẽ vào bảng `R` trong `render()`.

## Bước 3 – Tính giá thành [B] (`calc()`)
**Giữ bộ khung:**
- Chạy tuần tự `periodList()`. Mỗi kỳ tạo `P = {ky, open, nhap, xuat, close, giaVon, pBQ, unitCost, orders, lines, sales, issues, cost, cp, rates, sum621/622/627/154, slSX, slBTP, doanhSo, lai, nxt, tonCuoi, unalloc622/627, chung, chi641, daysData}`.
- Tồn cuối → tồn đầu kỳ sau.
- Các màn hình **chỉ đọc từ `P()`**. Giữ đúng tên trường thì mọi báo cáo dùng lại được không sửa.

**Chỗ thường phải viết lại:**
- Quy tắc làm tròn SL NVL (dòng `round(v,1)` trừ nhóm "Thành phẩm").
- Đơn giá NVL (`P.pBQ`) và giá vốn (`P.giaVon`).
- `allocate()`: tiêu thức phân bổ 622 / 627. Hiện là 2 công đoạn + tỷ lệ cố định + tỷ trọng 621.
- Trạng thái rủi ro trong `P.nxt` (giữ thứ tự ưu tiên, đổi chữ nếu cần).

**Kiểm tra bắt buộc:** viết lại `cong_cu/t_verify.js` cho công ty mới. Đối chiếu từng lệnh (621 / 622 / 627 / 154, SL thực hiện) và từng mã NXT với số đã lưu trong Excel gốc. Đạt khi **0 chỉ tiêu lệch** (dung sai 0,5 đồng).

## Bước 4 – Đề xuất sản xuất [C]
- **Không cần đề xuất:**
  - Trong `runCalcFor` bỏ khối "Bước 1".
  - Trong `NAV` bỏ `kehoach`; giữ Lệnh SX để nhập tay / nhập Excel.
  - Bỏ số đỏ ở menu (`pendingProposal`).
- **Đề xuất theo tiêu chí khác:**
  - Viết lại `buildPlan(year)`. Trả về `{ok, list:[{d, ma, sl, st, key}], months:{ky:{capKg…}}, stale, lockDate, lastSale}`.
  - Giữ `applyPlanCore`, `markProposed`, `resetProposal` (cơ chế "đã đề xuất thì giữ lệnh", "đề xuất lại từ đầu" dùng lại được).
- **Cân đối NVL** (`buildAdjProposal` / `applyAdjCore`) là phần **chung**, giữ nguyên.

## Bước 5 – Báo cáo [E] & file kế toán [F]
- **Báo cáo:** dùng hàm `table(cols, rows, {total, h, freeze})`, chỉ cần sửa danh sách cột.
- **KPI theo tháng:** sửa mảng `KPI` trong `vCanhBao`. Mỗi phần tử gồm `[tên, chiều, ngưỡng vàng, ngưỡng đỏ, hàm tính(P), hàm định dạng]`.
- **File kế toán:** sửa `XK_HDR`, `NK_HDR` (dòng tiêu đề theo mẫu của phần mềm kế toán mới), `buildXK` / `buildNK` (thứ tự cột, số chứng từ), mặc định `ktSettings()`. Đổi chữ "(mẫu ASP)".

## Bước 6 – Thay các chỗ đang ghi cứng theo Thiên Hồng
| Chỗ | Hàm / hằng | Nội dung đang ghi cứng | Sửa thành |
|---|---|---|---|
| Nhóm hàng | `NHOM`, `NHOM_ORDER`, `PROD_NHOM`, `isFinal` | Bánh khô, Kem tươi, TP đóng gói… | Nhóm công ty mới |
| Phân bổ mặc định | `ALLOC0` | BTP_BGK / BTP_KT / BTP_BGKT 25-25-50 %, 60-20-20 %; CĐ1 0,8 / 1 | Theo công ty mới |
| Ngưỡng tồn | `NGUONG0`, hàm chuyển đổi trong `nguongList` (map mốc mới, cờ `nguongV2`), `nguongFor` (ánh xạ nhóm → khóa) | 180/2/2/90/90/365/30/10 ngày, TRUNG_GA | Theo công ty mới; **xóa khối chuyển đổi** nếu không cần |
| Mẫu ví dụ Excel | `SAMPLES` | Mã BM_TH, BTP_BGK, GAS_45… | Mã công ty mới |
| Tên công ty | `state.settings`, `fromDocs`, `<title>` | Công ty Thiên Hồng | Tên mới |
| Kg sản xuất (đ/kg) | `costMonth`, `suggestRate`, KPI năng lượng, `showCalcResult` | `o.maTP==='BTP_BGKT'` | Mã sản phẩm làm mẫu số, hoặc thêm thiết lập |
| Quy tắc làm tròn | `calc()` | Làm tròn 1 số lẻ, trừ nhóm "Thành phẩm" | Theo Excel gốc |
| Cấu trúc đề xuất | `planStructure`, `vKeHoach` (`nm`, nhãn `TP_BKG_`), câu chữ "bánh gấu kem tươi", "0,6 / 0,4", "100 kg" | Bánh gấu | Theo công ty mới, hoặc bỏ đề xuất |
| Văn bản | `runCalc`, `runCalcFor`, `vHuongDan`, `vCosts` ghi chú, `vThamSo`, `vThietLap` ("Nạp dữ liệu năm 2026", "Gia thanh - 26 TH") | Thiên Hồng | Viết lại |
| Mẫu kế toán | `XK_HDR`, `NK_HDR`, `buildXK`, `buildNK`, `vXuatPhieu` | ASP, kho 152 / 155, TK 621 / 154 | Phần mềm kế toán mới |

> Mẹo: tìm nhanh trong mã các chuỗi `BTP_BGKT`, `BTP_BGK`, `BTP_KT`, `TP_BKG`, `TRUNG_GA`, `GAS_45`, `Thiên Hồng`, `Gia thanh - 26`, `ASP`, `2026`, `Bánh khô`, `Kem tươi`, `bánh gấu`.

## Bước 7 – Kiểm thử & bàn giao
**Kiểm thử tự động** (Playwright, thư mục `cong_cu/`; chạy `node <tệp>.js`):

| Tệp | Kiểm tra gì |
|---|---|
| `t_verify.js` | Đối chiếu số với Excel ("Số chỉ tiêu lệch: 0") |
| `t_views.js` | Mở mọi màn hình (trống và có dữ liệu), không có "ERR " |
| `t_center.js` | Mọi tiêu đề bảng canh giữa ("all centered") |
| `t_real.js`, `t_frozen.js` | Nạp dữ liệu giả lập kho đám mây (có cả dữ liệu **chỉ đọc**), mọi màn hình không lỗi |
| `t_conn.js`, `t_cache.js` | Kết nối chậm, lỗi, mất kết nối, bản sao chỉ xem |
| `t_req.js`, `t_blank.js`, `t_split.js`, `t_live.js`, `t_pw.js`, `t_numf.js`, `t_guard.js`, `t_pb.js`, `t_cb.js` (và `t_cbx.js`), `t_freeze.js`, `t_issue.js`… | Bắt buộc nhập, dòng trống, tách hóa đơn, tính khi gõ, cảnh báo giá, số kiểu VN, hỏi khi rời dòng, phân bổ, cảnh báo / xuất Excel cảnh báo, cố định cột, xuất dùng chung |

**Danh sách nghiệm thu:**
- [ ] Số liệu ≥ 1 tháng khớp Excel gốc: 154 từng lệnh, NXT từng mã, doanh số, lãi, tồn cuối.
- [ ] Mọi màn hình mở được khi **trống** và khi **có dữ liệu**; không có khung đỏ lỗi.
- [ ] Mẫu Excel từng bảng: tải về → nhập lại không lỗi (khứ hồi). Mã thiếu bị chặn.
- [ ] Khóa kỳ, đề xuất lại từ đầu, cân đối theo đề xuất, tách hóa đơn hoạt động.
- [ ] Sao lưu `.json` → Xóa toàn bộ → Phục hồi ra đúng dữ liệu.
- [ ] Mở trên claude.ai: góc trái hiện "Đã lưu trên tài khoản Claude". F5 vẫn còn dữ liệu.
- [ ] Ngắt mạng → hiện khung đỏ + chế độ chỉ xem, không ghi đè.
- [ ] Trang Hướng dẫn đã viết lại theo công ty mới (công thức, sơ đồ, ngưỡng tự sinh).
- [ ] Tệp kế toán nhập thử vào phần mềm kế toán thành công.

---

## Phụ lục – Câu lệnh mẫu để nhờ Claude dựng bản cho công ty mới
> "Dựng Phần mềm Giá thành cho Công ty **[TÊN]** từ gói `GoiMau_PhanMem_GiaThanh`. Giữ nguyên toàn bộ khung, giao diện và quy định trong các tài liệu 01–05.
> Thay phần riêng theo file Excel đính kèm **[tên file]**: nhóm hàng, định mức nhiều cấp, quy tắc làm tròn, cột chi phí 622 / 627, tiêu thức phân bổ, ngưỡng tồn, KPI, mẫu phiếu kế toán **[ASP / MISA…]**.
> Đối chiếu số với Excel đến khi 0 chỉ tiêu lệch. Xuất bản thành artifact mới, khai báo `db` và `downloads`. Viết lại trang Hướng dẫn."
