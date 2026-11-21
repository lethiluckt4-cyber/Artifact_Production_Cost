# 06 – PHẦN MỀM GIÁ THÀNH CÔNG TY DƯƠNG VÂN: THAY ĐỔI SO VỚI BẢN MẪU (03/11/2026)

Dựng từ gói mẫu `GoiMau_PhanMem_GiaThanh` (bản Thiên Hồng). **Giữ nguyên toàn bộ khung**: menu, lưới nhập, nhập / xuất Excel, bảng kiểu Excel, khóa kỳ, lưu trữ an toàn, sao lưu, ▶ Tính giá thành 4 bước, NXT, cảnh báo giá, file kế toán ASP. Phần riêng thay theo file `GT 12 - 26 DV đang làm.xlsx` (may đồ bơi).

## 1. Đối chiếu số với Excel
- Phần mềm tự đề xuất lệnh từ tháng 1 → **265/265 lệnh trùng khớp** (mã lệnh, ngày xuất NVL, ngày nhập kho, mã, SL), 1.789 dòng xuất NVL, NXT 105 mã × 12 tháng, Tổng hợp 154, lô gia công in.
- **21.732 chỉ tiêu so sánh – 0 chỉ tiêu lệch** (dung sai 0,5 đồng).
- Riêng THUN tháng 6: Excel còn tồn "rác" 1,1×10⁻¹² m nên tính ra đơn giá ảo 1.126,4 đ để định giá phần NVL thiếu (30 dòng). Đây là sai số dấu phẩy động của Excel, không ảnh hưởng 621 / 154 / NXT.
- Chạy lại: `node cong_cu/t_verify_dv.js` (cần Playwright).

## 2. Nhóm hàng & danh mục
- Nhóm: Thành phẩm · Bán thành phẩm (vải in gia công) · Vải · Phụ liệu · Nhãn mác – bao bì · Hàng hóa · Dịch vụ gia công · Khác.
- Thành phẩm thêm cột: **Dòng SP** (DDH = may theo đơn / SX = may sẵn để bán), **Hệ số quy đổi bộ chuẩn** (quần 0,5; bộ 1), Lô SX nhập tay, Tồn an toàn, Tỷ trọng may tồn kho nhập tay. Cột tự tính: Lô SX áp dụng, Tỷ trọng áp dụng, SL bán trong năm.

## 3. Lệnh sản xuất & giá thành
- Mỗi lệnh có **Ngày xuất NVL (bắt đầu may)** và **Ngày nhập kho TP**. Chi phí 621/622/627 theo tháng xuất NVL; nhập kho theo tháng nhập kho → **dở dang 154** (DDĐK + CP − DDCK = giá thành nhập kho; tab "Tổng hợp 154 theo tháng").
- SL theo định mức = ROUND(SL × (1 + hao hụt) × định mức, 2).
- **Cân đối NVL tự động** (bật/tắt): không xuất vượt tồn NVL tại ngày xuất; phần thiếu thống kê ở Cảnh báo.
- Loại lệnh: 1-DDH · 2-SX (bù tồn) · 3-MT (may tồn kho theo năng lực) · 4-Tay. Mã lệnh `LSXyyyy-mm.dd-nn` theo ngày xuất NVL.

## 4. Gia công ngoài (màn hình mới, nhóm 2)
- Mỗi lô: gửi vải thô → nhận vải in. Giá trị nhận = vải gửi (giá BQ tháng gửi) + dịch vụ gia công (giá BQ tháng nhận).
- Tự lập lô từ HĐ mua mã nhóm "Dịch vụ gia công" (ngày gửi lùi 3 ngày làm việc). Hàng đã gửi chưa nhận = đang gia công.
- File kế toán thêm 2 sheet: XK GC, NK GC (TK gia công mặc định 154).

## 5. ĐỀ XUẤT SẢN XUẤT THEO TIÊU CHÍ CÔNG NHÂN (thay tiêu chí năng lượng của mẫu)
- **Năng lực tháng** (bộ chuẩn) = số CN trực tiếp × ngày làm việc × 40 bộ chuẩn/người/ngày × hiệu suất.
- DDH: mỗi dòng bán = 1 lệnh = SL bán − tồn; nhập kho trước ngày giao 1 ngày làm việc; may 10–15 ngày theo quy mô đơn (1.000 bộ chuẩn = 15 ngày).
- SX: tồn sau bán < tồn an toàn → lệnh = SL bán + nhu cầu 7 ngày tới + tồn an toàn − tồn, làm tròn lên theo **lô cắt** (≈ 1 tháng bán, 20–100 SP, chuẩn "mỗi lần cắt 100 bộ"); may 3 ngày.
- MT: may tồn kho = max(0; tỷ lệ huy động 80% × năng lực − bán quy đổi DDH − phần SX còn phải bù) → chia cho hàng may sẵn theo tỷ trọng bán, rải các ngày làm việc. Mục đích: sản lượng khớp tiền lương, tháng thấp điểm vẫn có sản lượng.
- Tab 1: thông số, bảng 12 tháng (số CN nhập ngay tại đây), ngày cần chú ý, **tải SX theo ngày so với năng lực CN** (VƯỢT NĂNG LỰC x%).

## 6. Phân bổ 622 / 627 theo công đoạn Cắt – May – Đóng gói
- Mặc định 622: 15% / 75% / 10%; 627: 20% / 60% / 20%. Tiêu thức mỗi công đoạn: SL quy đổi (mặc định, như Excel) / Số sản phẩm / 621. Đề xuất: Đóng gói dùng "Số sản phẩm".

## 7. Chỉ tiêu cảnh báo theo tháng (theo sheet Canh bao, ngưỡng sửa được)
- A. Tồn kho TP: SL nhập kho / SL bán (150% / 300%), tồn TP âm khi bán, tồn cuối hàng DDH (1 / 200 SP), số ngày tồn hàng may sẵn (90 / 180).
- B. Nhân công: hệ số sử dụng năng lực thấp (≤ 60% / 40%) và vượt (≥ 100% / 120%), CP nhân công / bộ chuẩn thấp (≤ 5.000 / 3.000) và cao (≥ 20.000 / 30.000), CP 622+627 chưa phân bổ.
- C. NVL & gia công: tỷ lệ NVL thiếu (2% / 10%), vải in thiếu (1 / 500 m), số tháng tồn NVL (6 / 12), dòng mua lệch giá.
- D. Giá thành: GV/DT thấp (≤ 60% / 45%) và cao (≥ 95% / 100%), bán dưới giá vốn, bán lệch giá, tỷ trọng 622 (≤ 10% / 5%), dở dang / CP (50% / 100%), số mã giá thành lệch BQ năm > ±20%.
- E. Kiểm tra dữ liệu + mục mới: NVL thiếu phải cân đối, gia công cần kiểm tra, bán nghi trùng, TP chưa phân loại Dòng SP.
- Ngưỡng tồn kho: hàng may sẵn 180 ngày, hàng theo đơn 10 ngày, vải / phụ liệu / nhãn 360 ngày, vải in 180 ngày.

## 8. Việc cần làm tiếp
- Nhập **số công nhân trực tiếp** và **chi phí 622 / 627** từng tháng (file Excel đang trống) → tick "Đề xuất lại từ đầu" khi Tính để có may tồn kho theo năng lực và giá thành đủ 3 khoản mục.
- Kiểm tra lại các điểm file Excel đã nêu: QB881_6XL-7XL chưa có định mức; HĐ 00000049 có 2 dòng VR_TN2025 trùng; nhiều NVL có HĐ mua sau mùa bán (tháng 1–6 bị cân đối).
