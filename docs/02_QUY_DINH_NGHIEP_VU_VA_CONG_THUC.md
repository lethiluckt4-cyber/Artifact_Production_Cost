# 02 – QUY ĐỊNH NGHIỆP VỤ & CÔNG THỨC TÍNH

> Tài liệu này ghi **mọi quy tắc tính toán và ràng buộc nghiệp vụ** của Phần mềm Giá thành (bản Công ty Thiên Hồng, 11/2026).
> Mọi công thức ở đây đã đối chiếu khớp file Excel gốc `Gia thanh - 26 TH.xlsx`: 10 tháng năm 2026, 1.172 lệnh sản xuất, 24 mã hàng, **0 chỉ tiêu lệch** (dung sai 0,5 đồng).
> Khi xây cho công ty khác: giữ nguyên các mục đánh dấu **[CHUNG]**. Các mục **[RIÊNG]** phải hỏi lại và viết lại theo công ty mới.

---

## 1. Khái niệm nền

### 1.1 Kỳ, năm làm việc, phạm vi xem  [CHUNG]
- **Kỳ** = tháng, ký hiệu `YYYY-MM`. Ngày lưu dạng `YYYY-MM-DD`, hiển thị `dd/mm/yyyy`. Tháng hiển thị `mm/yyyy`.
- **Năm làm việc** (`settings.workYear`): chọn ở Tổng quan. Bộ chọn "Xem" có 3 kiểu: một tháng (`YYYY-MM`), **cả năm** (`YYYY`), hoặc **Từ ngày – đến ngày** (`R:yyyy-mm-dd:yyyy-mm-dd`).
- **Kỳ bắt đầu** (`settings.startKy`): là kỳ có số dư đầu kỳ do người dùng nhập. Phần mềm tính **tuần tự** từ kỳ bắt đầu đến kỳ đang xem. **Tồn cuối tháng trước = tồn đầu tháng sau**, nên không có thao tác khóa sổ sang năm mới.
- **Mở sổ lại sau kiểm kê:** đổi Kỳ bắt đầu, rồi nhập lại Tồn đầu kỳ. Dữ liệu các kỳ trước vẫn còn nhưng không ảnh hưởng số dư nữa.

### 1.2 Nhóm hàng quyết định cách tính  [RIÊNG – danh sách nhóm]
Cột **Nhóm hàng** trong Danh mục quyết định mã được tính theo cách nào:

| Nhóm hàng | Loại | Cách tính |
|---|---|---|
| TP đóng gói | Thành phẩm bán ra (`isFinal`) | Nhập kho theo giá thành 154. Bán theo giá vốn bình quân. Có điều chỉnh +/- thùng. |
| Thành phẩm | Tự sản xuất (bánh gấu kem tươi BGKT – trước đóng gói) | Giá thành theo lệnh. Xuất cho công đoạn sau theo đơn giá bình quân 154 của tháng. |
| Bán thành phẩm | Tự sản xuất theo mẻ (bánh khô, kem tươi) | Như trên, tính theo mẻ. |
| Sản phẩm lỗi | Sản phẩm hỏng trong định mức thu hồi (bánh gấu khô dẹp) | Nhập kho theo giá bán ước tính, trừ khỏi giá thành sản phẩm chính (mục 3.6). Bán như thành phẩm. |
| Bánh khô, Kem tươi | NVL mua (dùng làm bánh khô / kem tươi) | Đơn giá = giá BQ NVL mua của tháng. |
| Bao bì, Nhiên liệu, Khác | Vật tư mua | Như NVL. |

- Nhóm tự sản xuất: `PROD_NHOM = ['TP đóng gói','Thành phẩm','Bán thành phẩm','Sản phẩm lỗi']`. Hàm `isMade` loại "Sản phẩm lỗi" khỏi danh sách lệnh, định mức, phân bổ. Các nhóm còn lại là NVL / vật tư mua.
- **Thứ tự hiển thị nhóm:** TP đóng gói → Thành phẩm → Bán thành phẩm → Sản phẩm lỗi → Bánh khô → Kem tươi → Bao bì → Nhiên liệu → Khác. Thứ tự này dùng trong NXT và Danh mục.

### 1.3 Cấp sản xuất (tự nhận dạng từ Định mức)  [CHUNG]
- NVL mua có **cấp 0**. Sản phẩm có cấp = **1 + cấp cao nhất của NVL trong định mức của nó** (tính cả NVL thay thế).
- Ví dụ Thiên Hồng: Bánh khô, Kem tươi = cấp 1. Bánh gấu kem tươi = cấp 2. Thành phẩm đóng gói = cấp 3.
- Vì phần mềm tự nhận cấp, đổi mã hoặc thêm sản phẩm cùng cấu trúc vẫn tính được, không cần sửa mã nguồn.
- **Công đoạn** hiển thị ở các báo cáo: `BT` (bán thành phẩm, gồm mọi cấp tự SX không phải TP đóng gói) và `TP` (thành phẩm đóng gói).

### 1.4 Mẻ sản xuất  [CHUNG]
- Định mức có **SL TP/lần > 1** thì sản phẩm đó sản xuất **theo mẻ**, cỡ mẻ = SL TP/lần. Thiên Hồng: bánh khô, kem tươi 100 kg/mẻ.
- Số mẻ = SL thực hiện ÷ cỡ mẻ.
- **Định mức cho 1 đơn vị** (cột "Số lượng/SP") = SL NVL/lần ÷ SL TP/lần.

### 1.5 Hiệu lực định mức & NVL thay thế  [CHUNG]
- Mỗi dòng định mức có **Hiệu lực từ / Hiệu lực đến**. Để trống nghĩa là từ đầu / vô thời hạn. Lệnh dùng các dòng có hiệu lực tại **ngày xuất NVL** của lệnh.
  - Đổi NVL vĩnh viễn: đặt Hiệu lực đến cho dòng cũ, rồi thêm dòng mới có Hiệu lực từ.
- **NVL thay thế** (`subs`): khi ngày SX nằm trong khoảng hiệu lực, NVL gốc được thay bằng NVL thay thế.
  - Có điều kiện Mã TP thì chỉ áp cho TP đó. Để trống Mã TP thì áp cho mọi TP. Quy tắc riêng theo TP được ưu tiên.
  - **Tỷ lệ TT:** để trống hoặc ≥ 100% là thay toàn bộ. Nếu < 1, NVL gốc dùng `ĐM × (1 − tỷ lệ)` và NVL thay thế dùng `ĐM × tỷ lệ`. Gõ số > 1 được hiểu là phần trăm (30 = 30%).
- **Loại ĐM:** mặc định `DM`. Lệnh có cột Loại ĐM để chọn bộ định mức khác.

---

## 2. Quy trình "▶ Tính giá thành" (chuỗi tự chạy 4 bước)  [CHUNG – bước 1 RIÊNG]

Người dùng bấm **▶ Tính giá thành**, chọn tháng (hoặc "Cả năm – chỉ tính, không đề xuất"), rồi bấm **Tính**. Màn hình chờ khóa thao tác trong lúc chạy.

1. **Bước 1 – Đề xuất sản xuất → Lệnh sản xuất.** Chỉ chạy khi chọn một tháng chưa khóa.
   - Tháng **chưa chạy đề xuất**: tạo lệnh từ đề xuất cho các ngày **sau mốc khóa**. Mốc khóa là ngày SX muộn nhất đã có lệnh; các ngày đó lấy theo Lệnh SX đã có. Sau đó đánh dấu tháng là "đã đề xuất" (`settings.daDeXuat`).
   - Tháng **đã chạy đề xuất**: giữ nguyên toàn bộ Lệnh SX (kể cả phần sửa tay) và chỉ tính lại.
   - Tick **"Đề xuất lại từ đầu"**: xóa **toàn bộ** Lệnh SX và Cân đối NVL từ tháng đó trở về sau, kể cả lệnh đề xuất, sửa tay, nhập tay, nhập Excel. Các tháng sau có phát sinh bán, lệnh hoặc cân đối cũng bị làm lại. Sau đó đề xuất lại từng tháng.
     - Nếu có tháng đã khóa trong dải này thì **không thực hiện** và báo phải mở khóa trước.
   - Chưa có ước tính điện + gas cho tháng: báo "chưa đề xuất được" và vẫn tính giá thành.
2. **Bước 2–3 – Tính giá thành & NXT** tuần tự từ kỳ bắt đầu đến kỳ chọn (mục 3, 4, 5).
3. **Bước 4 – Đề xuất cân đối NVL** khi có NVL tồn âm (mục 7). Kết quả chờ người dùng chọn áp dụng.
4. **Hộp kết quả:** số liệu kỳ; từng bước đã chạy; kiểm tra giá xuất kho / lệnh / tồn âm; "Bước tiếp theo"; nút **Áp dụng cân đối NVL & tính lại**.

**Quy định:**
- Phần mềm **không tự tính khi nhập liệu**. Chỉ tính khi bấm ▶. Sau khi sửa bất kỳ dữ liệu nào, nhãn **⚠ Chưa tính lại** hiện ở đầu trang, và nút ▶ đổi thành "▶ Tính giá thành (có dữ liệu mới)".
- Tháng đã khóa thì không đề xuất, chỉ tính lại.

---

## 3. Giá thành theo lệnh sản xuất  [CHUNG – trừ chỗ ghi RIÊNG]

### 3.1 Số lượng thực hiện (SL thực hiện – cột M sheet Lệnh SX)
- **Thành phẩm đóng gói:** `SL thực hiện = max(0, Số lượng lệnh + Điều chỉnh (+/- thùng))`.
- **Bán thành phẩm / Thành phẩm (cấp dưới):**
  `SL thực hiện = max(0, lũy kế SL lệnh đến ngày + phần điều chỉnh TP quy đổi − đã thực hiện trước đó)`
  - Phần điều chỉnh TP quy đổi = Σ (điều chỉnh thùng lũy kế của TP tiêu thụ × định mức/đơn vị), tính dây chuyền qua các cấp. Với sản phẩm theo mẻ thì **làm tròn xuống theo bội số mẻ** (`trunc(raw/bs)×bs`).
  - Thùng **sửa tay / thêm tay** so với đề xuất (Nguồn = Tay, PM+tay, Excel+tay) được tính như điều chỉnh TP. Nhờ vậy bán thành phẩm tự tính lại.
- Thứ tự xử lý lệnh: Ngày SX → cấp sản phẩm → mã lệnh.
- **Quy định nhập:** chỉ nhập +/- ở **dòng thành phẩm đóng gói**. Nhập ở dòng khác thì cột Tình trạng báo `CHỈ NHẬP +/- Ở DÒNG THÀNH PHẨM`, và mục Cảnh báo "Mã lệnh SX bị trùng / điều chỉnh TP nhập sai dòng" báo lỗi.

### 3.2 Số lượng NVL xuất cho lệnh
Với mỗi dòng định mức có hiệu lực (sau khi áp NVL thay thế):
- **Theo mẻ:** `SL theo ĐM = Số mẻ thực hiện × SL NVL/mẻ`.
- **Theo số lượng:** `SL theo ĐM = SL thực hiện × (1 + Hao hụt) × SL NVL/lần ÷ SL TP/lần`. **Làm tròn 1 chữ số thập phân**, trừ NVL thuộc nhóm "Thành phẩm" (bánh gấu kem tươi) thì không làm tròn.  [RIÊNG – quy tắc làm tròn]
- **Tổng SL xuất** = SL theo ĐM + **Cân đối NVL** của đúng (Ngày SX + Mã sản phẩm + Mã VT).
- Ngày xuất NVL = Ngày SX. Lệnh được tính vào kỳ của ngày xuất NVL.

### 3.3 Đơn giá NVL xuất
- **NVL / vật tư mua:** `Giá BQ NVL mua của tháng = (Tồn đầu tiền + Tiền mua trong tháng) ÷ (Tồn đầu SL + SL mua trong tháng)` (cột P sheet Tồn kho tháng). Không có mẫu số thì đơn giá = 0, và lệnh báo "Thiếu giá vốn NVL".
- **Bán thành phẩm / thành phẩm cấp dưới xuất cho cấp trên:** `Đơn giá = Tổng 154 của sản phẩm đó trong tháng ÷ Tổng SL thực hiện trong tháng`. Phần mềm tính lần lượt từng cấp để cấp sau dùng được đơn giá cấp trước. Chưa có thì báo "Chưa có giá thành <mã> trong tháng".

### 3.4 Chi phí
- **621** (lệnh) = Σ (Tổng SL xuất × Đơn giá) của các NVL trong lệnh.
- **622 tháng** = tổng các cột chi phí nhóm 622 (mặc định: 622 Nhân công).
- **627 tháng** = tổng các cột nhóm 627 + **Xuất dùng chung loại "Chi phí sản xuất (627)"** (gas…).
  - Cột nhóm 627 mặc định: 6273 Dụng cụ, 6274 Khấu hao, 6277 Điện, 6277 Nước.
  - Xuất dùng chung loại **"Bán hàng (641)"** chỉ trừ kho, **không vào giá thành**. Giá trị của nó hiện ở cột "641 Bán hàng".
  - Người dùng thêm / bớt cột chi phí bằng nút **⚙ Cột chi phí**, mỗi cột thuộc nhóm 622 hoặc 627.
- **Giá trị xuất dùng chung** = SL × Giá BQ NVL mua của tháng.

### 3.5 Phân bổ 622 / 627 (2 công đoạn)  [RIÊNG – tỷ lệ; cơ chế CHUNG]
Thiết lập ở **Thiết lập & sao lưu → tab Phân bổ 622/627**:
- **Công đoạn 1 (làm bánh)** nhận `622 × tỷ lệ CĐ1_622` (mặc định 0,8) và `627 × tỷ lệ CĐ1_627` (mặc định 1,0).
- **Công đoạn 2 (đóng gói)** tự động = phần còn lại (`1 − tỷ lệ CĐ1`). Màn hình hiện số này, không cho nhập.
- Trong CĐ1, chia cho từng sản phẩm theo **tỷ lệ cố định**. Tổng tỷ lệ các sản phẩm trong CĐ1 phải bằng 100%.
  - Thiên Hồng: 622 → Bánh khô 25%, Kem tươi 25%, BGKT 50%. 627 → 60%, 20%, 20%.
  - Trong từng sản phẩm, chia cho các lệnh theo **tỷ trọng 621 của lệnh**.
- Trong CĐ2, chia cho mọi lệnh không thuộc CĐ1 theo **tỷ trọng 621 trong tháng**. Màn hình thiết lập chỉ ghi chữ "phân bổ theo tỷ trọng 621 trong tháng", không nhập tỷ lệ.
- Phân bổ xuống từng dòng NVL: `622 dòng = 622 lệnh × 621 dòng ÷ 621 lệnh` (627 tương tự).
- **Chưa phân bổ:** công đoạn / sản phẩm trong quy tắc không có sản xuất trong tháng thì phần chi phí đó không có lệnh nhận.
  - Nếu phần này > 1 đồng thì phát sinh cảnh báo "Phân bổ 622/627".
  - Số tiền hiện ở cột "Chưa phân bổ (không SX)" và chỉ tiêu KPI "CP 622 + 627 chưa phân bổ".

### 3.6 Sản phẩm lỗi – hỏng trong định mức  [CHUNG – cơ chế; RIÊNG – tỷ lệ, giá]
Bổ sung ngày 04/11/2026. Trường hợp Thiên Hồng: bánh gấu khô sau khi nướng được lựa ra; bánh đủ độ phồng mới bơm kem. Bánh bị dẹp (hao hụt 5–10%) nhập kho và bán với giá rất thấp.
- **Căn cứ – VAS 02 (Hàng tồn kho):** sản phẩm phụ / sản phẩm hỏng thu hồi được tính theo **giá trị thuần có thể thực hiện được**, tức giá bán ước tính trừ chi phí bán ước tính. Giá trị này được **trừ khỏi chi phí** của sản phẩm chính.
  - Hạch toán: **Nợ 155 (sản phẩm lỗi) / Có 154**.
  - Hỏng **trong định mức**: phần thiệt hại còn lại tính vào giá thành sản phẩm đạt.
  - Hỏng **ngoài định mức** sẽ đưa vào 811. Vì phần mềm dùng tỷ lệ cố định nên không phát sinh phần này.
- **Thiết lập** (Thiết lập & sao lưu → tab **Sản phẩm lỗi**, lưu `settings.spLoi[]`). Mỗi quy tắc gồm:
  - Sản phẩm chính, Mã sản phẩm lỗi (nhóm "Sản phẩm lỗi").
  - **Tỷ lệ lỗi cố định**, **Giá bán ước tính (đ/ĐVT)**, **Áp dụng từ kỳ**, Ghi chú.
  - Một sản phẩm có thể có nhiều quy tắc theo kỳ; phần mềm dùng quy tắc có kỳ áp dụng gần nhất (≤ kỳ của lệnh).
  - Thiên Hồng: `BTP_BGK → BTP_BGK_LOI` "Bánh gấu khô lỗi (dẹp)", **7%**, **8.000 đ/kg**, từ **01/2026**.
- **Tính cho mỗi lệnh của sản phẩm chính:**
  - `SL lỗi = SL thực hiện × tỷ lệ` (4 số lẻ); `SL đạt = SL thực hiện − SL lỗi`.
  - `Thu hồi = SL lỗi × giá bán ước tính`.
  - Nhập kho sản phẩm chính: SL đạt, giá trị = `154 − thu hồi`. Nhập kho sản phẩm lỗi: SL lỗi, giá trị = thu hồi.
  - `Giá thành / đv` (mọi báo cáo) = (154 − thu hồi) ÷ SL đạt.
  - Đơn giá xuất cho công đoạn sau = Σ(154 − thu hồi) ÷ Σ SL đạt của tháng.
  - Cột 154 vẫn là tổng 621 + 622 + 627; phần thu hồi hiện ở cột riêng "Thu hồi SP lỗi (giảm 154)".
- **Nhóm hàng "Sản phẩm lỗi":**
  - Thuộc nhóm tự sản xuất, nhưng **không** có lệnh / định mức và không nằm trong danh sách phân bổ.
  - Số ngày còn dùng tính theo SL bán.
  - Ngưỡng tồn mặc định: rủi ro trên 30 ngày.
  - Cột "Loại" ở Danh mục ghi "Sản phẩm lỗi thu hồi (bán giá thấp)".
- **Đề xuất sản xuất tự bù hao hụt:** `SL cần sản xuất = SL cần dùng ÷ (1 − tỷ lệ lỗi)`, rồi làm tròn mẻ. Tồn theo dõi chỉ cộng phần đạt. Bảng chi tiết theo ngày có thêm cột "Bánh lỗi".
- **File kế toán (NK TP):** dòng sản phẩm chính ghi SL đạt, kèm thêm một dòng "Nhập kho sản phẩm lỗi thu hồi – …" cho mã lỗi (cùng số chứng từ).
- **Báo cáo có thêm cột:**
  - Giá thành (tab Theo lệnh, Theo sản phẩm; sheet TheoLenh, TheoSanPham): SL lỗi, Thu hồi SP lỗi (giảm 154); thêm SL đạt nhập kho / Giá thành nhập kho.
  - ChiTiet: SL lỗi (lệnh), Thu hồi SP lỗi (lệnh).
  - Chi phí 622/627: Thu hồi SP lỗi (giảm 154).
- **Bù hao hụt cho lệnh đã có** (khung "Lệnh sản xuất đã có trước khi tính hao hụt" trong tab Sản phẩm lỗi):
  - Tăng lệnh của sản phẩm chính trong kỳ áp dụng (bỏ qua tháng khóa) sao cho **SL đạt lũy kế = SL lệnh gốc lũy kế**: `lũy kế mới = làm tròn lên mẻ (lũy kế gốc ÷ (1 − tỷ lệ))`, mỗi lệnh nhận phần chênh.
  - SL gốc lưu ở trường `slGoc` (thêm cuối `F.orders`). Ghi chú lệnh thêm "Bù hao hụt SP lỗi 7% (SL gốc …)".
  - 3 nút: **🔍 Xem trước** (bảng theo tháng: số lệnh, lệnh thay đổi, SL hiện tại → sau khi bù, tăng thêm, mã tồn âm sau khi bù – tính thử, không lưu), **⚙ Bù hao hụt cho lệnh đã có** (hỏi xác nhận), **↩ Hoàn tác** (trả SL gốc).
  - Thiên Hồng 01–10/2026: 73/207 lệnh, 92.910 → 100.000 kg (+7.090 kg). Bánh khô hết âm, nhưng bột mì, trứng, dầu bơ âm từ tháng 3 vì chứng từ mua 2026 không đủ cho phần làm thêm.
- **Lưu ý khi áp dụng ngược các tháng đã có số liệu:** lệnh SX cũ không tính hao hụt, nên tồn sản phẩm chính bị âm dần và số liệu không còn khớp Excel gốc.
  - Ví dụ Thiên Hồng áp từ 01/2026: bánh gấu khô âm 534 kg tháng 1, lũy kế âm 6.453 kg đến tháng 10; bánh lỗi tồn 6.504 kg do chưa ghi bán.
  - Nếu tắt quy tắc (hoặc áp từ 11/2026) thì đối chiếu Excel vẫn 0 lệch.

### 3.7 Giá thành
- **154 = 621 + 622 + 627** (lệnh và từng dòng NVL).
- **Giá thành / đơn vị lệnh** = (154 − thu hồi sản phẩm lỗi) ÷ SL đạt. Không có sản phẩm lỗi thì bằng 154 ÷ SL thực hiện.
- Lệnh có ngày SX thuộc kỳ sau kỳ xuất NVL thì nhập kho ở kỳ sau, và có cảnh báo.

### 3.8 Tình trạng lệnh (cột "Kiểm tra" / "Tình trạng")
Lấy giá trị đầu tiên gặp phải: `Thiếu định mức` · `Thiếu mã NVL` · `Thiếu giá vốn NVL` · `Chưa có giá thành <mã> trong tháng` · `Đủ`.
- Ở lưới Lệnh SX còn có các nhãn: `CHỈ NHẬP +/- Ở DÒNG THÀNH PHẨM` · `THÊM TAY n THÙNG – BTP TỰ TÍNH LẠI` · `SỬA TAY ±n THÙNG – BTP TỰ TÍNH LẠI` · `SỬA TAY`.
- Lệnh không ở trạng thái "Đủ" được đưa vào **Cảnh báo & kiểm tra → Kiểm tra lệnh sản xuất**. Mỗi dòng có cột **Cách xử lý** và nút **Đi tới lệnh**.

### 3.9 Mã tự sinh
- Mã lệnh: `LSXyyyy-mm.dd-nn` (nn tăng dần theo ngày, không trùng). Tự sinh khi lưu.
- Số chứng từ Xuất dùng chung: `XCyyyy-mm.dd-nn`. Để trống khi nhập thì tự sinh.
- **Khóa kế hoạch** (nhập Excel Lệnh SX): `MÃ#yyyymmdd@SL~mẻ`. Nếu có khóa thì các cột Ngày / Mã / SL được tách từ khóa.

---

## 4. Nhập – Xuất – Tồn (NXT) & giá vốn  [CHUNG]

### 4.1 Nhập
- Mua hàng của tháng (theo **Ngày nhập kho**).
- Nhập kho sản phẩm tự sản xuất: SL đạt, giá trị = 154 − thu hồi sản phẩm lỗi. Không có sản phẩm lỗi thì là SL thực hiện và 154.
- Nhập kho sản phẩm lỗi: SL lỗi, giá trị = SL lỗi × giá bán ước tính.

### 4.2 Giá vốn bình quân tháng (cột M sheet Tồn kho tháng)
`Giá vốn BQ = (Tồn đầu tiền + Nhập tiền) ÷ (Tồn đầu SL + Nhập SL)`.

### 4.3 Xuất
- **Xuất sản xuất:** Tổng SL xuất của các dòng NVL.
- **Xuất dùng chung:** cả 627 và 641.
- **Xuất bán:** SL bán.
- **Xuất tiền** = Xuất SL × Giá vốn BQ.

### 4.4 Tồn cuối
- `Tồn cuối SL = Tồn đầu + Nhập − Xuất`.
- `Tồn cuối tiền = Tồn đầu tiền + Nhập tiền − Xuất tiền`. Nếu tồn cuối SL = 0 thì tồn cuối tiền = 0.

### 4.5 Bán hàng
- Giá bán = Doanh số ÷ SL.
- Giá vốn hàng bán theo **giá vốn BQ của tháng bán**.
- Lãi = SL × (Giá bán − Giá vốn). Tỷ lệ lãi = Lãi ÷ Doanh số.

### 4.6 Bình quân / ngày, số ngày còn dùng, cần lấy
- **Số ngày tính** = số ngày từ Thứ 2 đến Thứ 7 (NETWORKDAYS.INTL chỉ nghỉ Chủ nhật), tính từ đầu tháng đến **ngày phát sinh cuối** của mã đó.
- **Phát sinh tính BQ:**
  - Thành phẩm đóng gói: SL bán.
  - Sản phẩm tự SX: SL nhập sản xuất.
  - NVL / vật tư: xuất SX + xuất dùng chung.
- **BQ/ngày** = phát sinh ÷ số ngày.
- **Số ngày còn dùng** = Tồn cuối ÷ BQ/ngày.
- **NVL cần lấy đủ 15 ngày** = max(0, BQ × 15 − Tồn cuối). Chỉ tính cho NVL / vật tư.

### 4.7 Tồn theo ngày
Mỗi dòng xuất NVL và mỗi dòng bán có tồn tại thời điểm đó: `tồn đầu + Σ phát sinh có ngày ≤ ngày dòng đó`.
- Dòng bán có tồn theo ngày < 0 thì Trạng thái dữ liệu = `ÂM KHO`.
- Dòng xuất NVL có tồn theo ngày < 0 thì được đếm vào KPI "Số dòng xuất NVL làm âm kho tại ngày xuất".

---

## 5. Trạng thái rủi ro tồn kho (cột Phân loại + Trạng thái rủi ro)  [CHUNG – mốc RIÊNG]

**Quy định:** mỗi mã chỉ hiện **1 trạng thái**, là mức nặng nhất, xét theo thứ tự sau.

| # | Điều kiện | Trạng thái (đúng chữ) | Phân loại |
|---|---|---|---|
| 1 | Tồn cuối < 0 (mọi loại hàng) | `Âm kho - xử lý ngay` | Rủi ro cao |
| 2 | NVL / vật tư **không có trong** Định mức, NVL thay thế (gốc hoặc thay thế) và Xuất dùng chung | `Chưa xây dựng định mức` | Rủi ro cao |
| 3a | Tồn > 0, có mốc max, số ngày còn dùng > max (hoặc không có phát sinh) | Sản phẩm: `Tồn trên <max> - rủi ro tồn lâu (lưu ý hạn dùng)` · NVL: `Tồn sử dụng trên <max> - không mua thêm (NVL quá dư)` | Rủi ro cao |
| 3b | Số ngày còn dùng > max/2 | Sản phẩm: `Tồn trên <max/2> - ưu tiên bán / dùng trước` · NVL: `Tồn sử dụng trên <max/2> - SX thêm TP (hạn chế mua)` | Cảnh báo |
| 4 | Có mốc min, số ngày còn dùng < min; hoặc tồn = 0 mà có tiêu dùng | Sản phẩm: `Tồn thấp - cần sản xuất` · NVL: `Tồn thấp - cần mua` | Cảnh báo |
| – | Không có vấn đề | (trống) | OK |

- Nhãn Phân loại hiển thị **viết hoa chữ đầu**: "Rủi ro cao", "Cảnh báo", "OK". Dùng viên màu (đỏ / vàng / xanh), cỡ chữ bằng chữ chung.
- **Cách ghi mốc:** ghi rõ mốc thay vì "vượt 1/2 mốc". Hàm `ngayLbl`: 182–183 ngày → "6 tháng"; bội số 365 → "n năm"; bội số 30 → "n tháng"; còn lại → "n ngày".
- **Mốc theo nhóm / mã** (Cảnh báo & kiểm tra → tab Ngưỡng cảnh báo). Mốc cảnh báo **tự động = ½ mốc rủi ro**. Mã riêng ưu tiên hơn nhóm (khóa `MÃ (Ngày)` hoặc `MÃ`).

| Nhóm / Mã | Rủi ro cao khi tồn trên | Cảnh báo khi tồn trên | Tồn tối thiểu |
|---|---|---|---|
| TP đóng gói (Ngày) | 180 ngày (6 tháng) | 90 ngày (3 tháng) | – |
| Bán thành phẩm (bánh khô, kem) | 2 ngày | 1 ngày | – |
| Thành phẩm (BGKT) | 2 ngày | 1 ngày | – |
| NVL Bánh khô | 90 ngày (3 tháng) | 45 ngày | 5 ngày |
| NVL Kem tươi | 90 ngày (3 tháng) | 45 ngày | 5 ngày |
| Bao bì | 365 ngày (1 năm) | 182 ngày (6 tháng) | – |
| Nhiên liệu | 30 ngày (1 tháng) | 15 ngày | – |
| TRUNG_GA (Ngày) – riêng mã | 10 ngày | 5 ngày | 3 ngày |
| Sản phẩm lỗi | 30 ngày (1 tháng) | 15 ngày | – |

  Ánh xạ nhóm → khóa ngưỡng: `TP đóng gói → "TP đóng gói (Ngày)"`, `Bánh khô → "NVL Bánh khô"`, `Kem tươi → "NVL Kem tươi"`. Các nhóm khác dùng đúng tên nhóm.
- **Chuyển đổi một lần** (`settings.nguongV2`): dữ liệu cũ có mốc khác thì được cập nhật sang mốc trên một lần duy nhất.
  - **Bài học kỹ thuật:** dữ liệu tải từ kho đám mây là đối tượng **chỉ đọc** (frozen). Phải sao chép sâu (`JSON.parse(JSON.stringify(...))`) trước khi sửa. Nếu không sẽ gặp lỗi `Cannot assign to read only property`.
- **Bán dưới giá vốn không ghi vào NXT.** Lỗi này báo ở mục "Đơn giá mua / bán bất thường" và KPI theo tháng.

---

## 6. Đề xuất sản xuất theo công suất năng lượng  [RIÊNG – toàn bộ mục]

1. **Đầu tháng** nhập *ước tính điện + gas* (Đề xuất sản xuất → tab 1).
   - Khi đã nhập tiền điện thực tế ở Chi phí 622/627, phần mềm dùng **thực tế = điện + gas** (gas lấy từ Xuất dùng chung loại 627). Nếu thiếu gas thì đánh dấu "thiếu gas".
2. **Tỷ lệ năng lượng (đ/kg BGKT):** nhập tay, hoặc để trống thì dùng **gợi ý** = bình quân (điện + gas) ÷ kg BGKT của **3 tháng gần nhất** có đủ điện, gas và sản xuất.
3. **Công suất tháng (kg BGKT)** = năng lượng ÷ tỷ lệ đ/kg. Công suất mỗi ngày làm việc = công suất tháng ÷ số ngày làm việc.
   - **Ngày làm việc:** trừ Chủ nhật, ngày "Nghỉ lễ / công ty" và "Nghỉ chờ việc" trong Lịch nghỉ. Chủ nhật có "Tăng ca / làm Chủ nhật" vẫn được tính.
4. **Chia cho từng loại thùng mỗi ngày:**
   - Trước hết làm đủ bán trong ngày + **tồn an toàn** (mặc định 1 ngày bán).
   - Phần còn lại làm thêm cho loại có **ít ngày tồn nhất** (ngày tồn = tồn ÷ BQ bán của **30 ngày**), cho đến khi đạt **tồn tối đa** (mặc định 15 ngày bán).
5. **Mọi loại đã đủ tồn tối đa:** giảm sản lượng ngày đó tối đa **15%** (chỉnh được). Dưới mức này vẫn làm, ưu tiên loại ít ngày tồn nhất.
   - **Cần bán vượt công suất:** vẫn làm đủ bán và cảnh báo `VƯỢT CÔNG SUẤT x%`.
6. **Sau ngày bán cuối đã nhập:** số bán dùng bình quân bán (hiển thị in nghiêng). Đề xuất chỉ trong tháng đang tính.
7. **Quy đổi xuống bán thành phẩm:**
   - BGKT = số thùng × kg/thùng − tồn.
   - Bánh khô = 0,6 × BGKT − tồn; kem tươi = 0,4 × BGKT − tồn.
   - **Làm tròn lên mẻ 100 kg**; trước kỳ nghỉ thì làm đúng số cần.
8. **Cảnh báo theo ngày:** `CHỦ NHẬT` · `NGHỈ LỄ / CHỜ VIỆC` · `VƯỢT CÔNG SUẤT` · `GIẢM x% CÔNG SUẤT` · `CHƯA CÓ ƯỚC TÍNH ĐIỆN + GAS` · `BGKT CHƯA ĐÓNG GÓI QUÁ 1 NGÀY` · `BTP QUA KỲ NGHỈ` · `THIẾU …` · `THIẾU NVL`.
   - `THIẾU NVL`: NVL dùng trong ngày mà tồn đầu + mua đến ngày không đủ.
   - Trạng thái ngày: `CHƯA CÓ LỆNH` · `LỆCH LỆNH` · `ĐÃ CÓ LỆNH` · `ĐÃ KHÓA`.
9. **Tạo lệnh từ đề xuất (tab 2):** tạo lệnh mới (`nguon='PM'`, `slDX` = SL đề xuất) hoặc cập nhật lệnh lệch. Có nút **📋 Sao chép khóa lệnh**.
10. **Cuối tháng có điện + gas thực tế:** ▶ Tính giá thành với tick **Đề xuất lại từ đầu** để đề xuất lại theo số thực tế.
11. **Tham số** (lưu `settings.planPrm`):
    - `bqDays` = 30 (số ngày tính BQ bán)
    - `maxDays` = 15 (tồn TP tối đa, ngày bán)
    - `minDays` = 1 (tồn an toàn)
    - `giam` = 0,15 (giảm tối đa khi tồn đủ; tối đa 0,5)
    - `nlRate` (đ/kg; 0 = gợi ý)
    - `nlUoc` {kỳ: ước tính điện + gas}
    - `ss`, `minKg`, `hz`, `hsd`: tham số cũ, giữ để tương thích.

**Nguồn lệnh (cột Nguồn):** `PM` = Đề xuất PM · `PM+tay` = Đề xuất PM · đã sửa tay · `Tay` = Nhập tay · `Excel+tay` = Nhập Excel · đã sửa tay · (trống) = Nhập Excel / dữ liệu gốc.

---

## 7. Cân đối NVL (khi tồn âm)  [CHUNG]

- **Phân tích tồn âm:** với mỗi mã có tồn cuối < 0, phần mềm ghi nguyên nhân và cách xử lý.
  - Thành phẩm bán vượt tồn + SX → kiểm tra thiếu lệnh / sai mã bán.
  - Bán thành phẩm xuất nhiều hơn SX → kiểm tra SL thực hiện / số mẻ.
  - Không có dòng xuất SX → kiểm tra Xuất dùng chung / số dư đầu.
  - Không có tồn đầu và không mua → bổ sung chứng từ mua / NVL thay thế.
  - Xuất theo định mức lớn hơn lượng thực có → kiểm tra chứng từ mua; nếu đã đủ thì cân đối giảm.
- **Đề xuất (bảng DeXuatDieuChinhNVL):** chỉ áp cho NVL mua có dòng xuất SX.
  - Chạy tồn theo ngày: mua cộng trước, rồi trừ xuất dùng chung, bán, xuất SX.
  - Tại đúng lệnh làm tồn âm, **giảm tiêu hao** = min(SL dòng đó, phần âm, phần còn phải bù). Lý do ghi lũy kế.
- **Áp dụng:**
  - Nút **⚙ Cân đối theo đề xuất (tồn âm)** ở Cân đối NVL, hoặc **Áp dụng cân đối NVL & tính lại** trong hộp kết quả.
  - Ghi vào Cân đối NVL với `nguon='PM'`. Người dùng sửa số được trước khi áp dụng (để 0 = bỏ dòng).
- **Nhập tay:** Ngày SX + Mã sản phẩm + Mã VT + SL (+/-; số âm = giảm). Dòng cân đối không có lệnh tương ứng thì có cảnh báo.

---

## 8. Kiểm tra giá mua / bán bất thường  [CHUNG – ngưỡng RIÊNG]

### 8.1 Giá mua (theo từng dòng mua)
- **Giá so sánh** = giá BQ của **tháng gần nhất trước đó** có mua (tìm lùi tối đa 12 tháng). Nếu không có, dùng **giá giữa (trung vị) trong tháng** khi có từ 2 lần mua trở lên.
- **Chênh lệch giá mua** = Đơn giá dòng − Giá so sánh. Làm tròn đồng, có dấu +/−.
- **Tỷ lệ chênh lệch** = Đơn giá ÷ Giá so sánh − 1. Hiển thị dạng `+12,5%` hoặc `−8%`.
- **Mức:** |lệch| ≥ 30% → đỏ; ≥ 10% → vàng. Có số lượng mà không có đơn giá / thành tiền → đỏ "Chưa có đơn giá / thành tiền".

### 8.2 Giá bán
- **Giá so sánh** = **giá bán phổ biến nhất** của mã trong tháng (giá làm tròn đồng, xuất hiện ≥ 2 lần; bằng nhau thì lấy giá cao hơn). Không có giá lặp lại thì dùng giá giữa.
- **Mức:** |lệch| ≥ 20% → đỏ; ≥ 5% → vàng.
- **Bán dưới giá vốn** → luôn đỏ, kèm "lỗ x/ĐVT".
- Doanh số = 0 mà có số lượng → vàng "hàng tặng / khuyến mãi?".

### 8.3 Gợi ý gõ sai số 0
Tỷ lệ giá/giá so sánh ≥ 8 → "nghi gõ thừa số 0". Tỷ lệ ≤ 0,125 → "nghi gõ thiếu số 0".

### 8.4 Hiển thị
- Tô màu ô **Tỷ lệ chênh lệch** (vàng / đỏ) trong lưới Mua / Bán. Người dùng **tự lọc / sắp xếp cột này**; không có cột "Cảnh báo giá" riêng.
- Tổng hợp tất cả dòng vàng / đỏ ở **Cảnh báo & kiểm tra → Đơn giá mua / bán bất thường**, có nút **Đi tới dòng**.
- Ngưỡng `settings.giaNg = {muaV:0.10, muaD:0.30, banV:0.05, banD:0.20}`, sửa ở tab Ngưỡng cảnh báo.

---

## 9. Chỉ tiêu đánh giá rủi ro theo tháng (Cảnh báo & kiểm tra)  [RIÊNG – chỉ tiêu & ngưỡng]

Ô vàng = vượt ngưỡng cảnh báo; ô đỏ = vượt ngưỡng rủi ro cao. Bảng hiện từng tháng T1..T12 của năm làm việc.

| Chỉ tiêu | Vàng từ | Đỏ từ | Cách tính |
|---|---|---|---|
| Tỷ lệ SL nhập kho / SL bán (thùng) | 115% | 130% | SL SX thành phẩm ÷ SL bán thành phẩm |
| Số ngày tồn thành phẩm | 45 | 60 | Σ tồn cuối TP ÷ (Σ xuất TP ÷ số ngày tháng) |
| Chi phí năng lượng (điện + gas) / kg BGKT | 3.500 đ | 5.000 đ | (Điện + gas) ÷ kg BGKT SX |
| Tỷ lệ giá vốn / doanh thu | 90% | 100% | (Doanh số − Lãi) ÷ Doanh số |
| Số dòng bán dưới giá vốn | 1 | 5 | Đếm |
| Số dòng bán làm tồn thành phẩm âm (theo ngày) | 1 | 1 | Đếm |
| CP 622 + 627 chưa phân bổ (đ) | 1 | 1 | \|unalloc622\| + \|unalloc627\| |
| Số mã hàng âm kho cuối tháng | 1 | 1 | Đếm |
| Số dòng xuất NVL làm âm kho tại ngày xuất | 1 | 10 | Đếm |
| Tháng có sản xuất nhưng chưa nhập CP 622 | – | – | "Chưa nhập" / "–" |

---

## 10. Ràng buộc nhập liệu (quy định bắt buộc)  [CHUNG]

1. **Mã hàng là khóa chính.**
   - Mọi chứng từ (mua, bán, định mức, NVL thay thế, lệnh, cân đối, xuất dùng chung, tồn đầu) phải có mã trong Danh mục.
   - Nhập Excel có mã thiếu thì **chặn toàn bộ tệp** và liệt kê mã thiếu kèm số dòng.
   - Nhập tay thì phải chọn mã từ danh mục.
2. **Cột bắt buộc có dấu \*** trong tiêu đề. Nhập đủ các cột này mới **Lưu** được; dòng thiếu tô đỏ.
   - Danh mục: Mã, Tên, Nhóm, ĐVT.
   - Định mức: Loại ĐM, Mã TP, Mã NVL, SL TP/lần, SL NVL/lần.
   - NVL thay thế: Mã NVL gốc, Mã NVL thay thế, Hiệu lực từ.
   - Lịch: Ngày, Loại.
   - Mua: Ngày nhập kho, Mã hàng, Số lượng, Thành tiền.
   - Bán: Ngày hóa đơn, Mã hàng, Số lượng bán, Doanh số.
   - Lệnh SX: Ngày SX, Mã sản phẩm.
   - Cân đối: Ngày SX, Mã SP, Mã VT, SL.
   - Xuất dùng chung: Ngày, Loại xuất, Mã VT, Số lượng.
3. **Không cho xóa / đổi mã đang được dùng** ở Mua, Bán, Số dư đầu, Định mức, NVL thay thế, Lệnh SX, Xuất dùng chung, Cân đối NVL. Thông báo liệt kê nơi đang dùng.
4. **Kỳ đã khóa:** chỉ xem. Không sửa / xóa / nhập thêm chứng từ, lệnh, điều chỉnh; đề xuất không cập nhật vào kỳ đó; nhập Excel bỏ qua tháng đã khóa.
5. **Đang sửa một dòng mà chuyển màn hình / dòng khác:** hỏi có lưu hay không (`guardEdit`).
6. **Dòng mới để trống hoàn toàn** (không điền sẵn giá trị mặc định) để nhập cho nhanh.
7. **Ngày gõ nhanh:** `15` = ngày 15 của tháng đang xem; `15/10` = 15/10 của năm đang xem; `15/10/2026` hoặc `2026-10-15` đầy đủ.
8. **Số kiểu Việt Nam:**
   - `1.234.567` = một triệu…; `2,5` = 2,5 (dấu phẩy thập phân khi có 1–2 hoặc từ 4 chữ số sau dấu phẩy); `1,234` (3 chữ số) = 1234.
   - Phần trăm gõ `2%` hoặc `0.02`.
9. **Mua hàng – tính ngay khi gõ:** Thành tiền = SL × Đơn giá (làm tròn đồng). Sửa Thành tiền thì Đơn giá = Thành tiền ÷ SL.
10. **Ngày hóa đơn** (`ngayMua`) là ngày trên hóa đơn; **Ngày nhập kho** là ngày hàng về kho, quyết định kỳ tính.
11. **Mua hàng chưa HĐ** (cột tự tính):
    - Ngày nhập kho ≠ Ngày hóa đơn → `x`.
    - Hóa đơn bị **tách** (cùng Số HĐ + NCC có cả dòng cùng ngày và khác ngày): dòng cùng ngày hiện **số hóa đơn**, dòng tách hiện `x - <số HĐ>`.
12. **Tách hóa đơn mua** (nút ✂ Tách ở từng dòng) – trường hợp mua hàng trước, hóa đơn về sau, hàng về nhiều đợt:
    - Chèn ngay dưới dòng gốc một dòng mới **cùng hóa đơn**, giữ **Ngày hóa đơn cũ**. Người dùng nhập **Ngày nhập kho mới** và **Số lượng**.
    - Thành tiền tự nhảy, và **dòng gốc tự trừ ngay khi gõ** (tô xanh xem trước; tô đỏ nếu vượt số gốc).
    - Bấm Lưu thì dòng gốc giảm SL / thành tiền tương ứng (tổng hóa đơn không đổi). Ghi chú tự ghi "Tách từ dòng nhập kho dd/mm/yyyy".
13. **Xuất dùng chung có 2 loại** bắt buộc chọn:
    - **Chi phí sản xuất (627)**: vào 627 của tháng.
    - **Bán hàng (641)**: chỉ trừ kho.
    - Dữ liệu cũ không có loại được hiểu là 627.

---

## 11. Lưu trữ & an toàn dữ liệu  [CHUNG]

- **Kho đám mây** (artifact trên claude.ai): `claude.use('db')`, bộ sưu tập `gt`, mỗi "tài liệu" một khóa (xem 01 mục 3).
  - Ghi theo lô 1,2 giây sau lần sửa cuối, chỉ ghi tài liệu đã đổi. Tài liệu không còn thì xóa.
- **Khởi động an toàn:**
  - Chờ `window.claude` tối đa 3 giây (chỉ khi trang chạy trong khung artifact).
  - `claude.use('db')` tối đa 30 giây. Tải dữ liệu thử lại 3 lần, mỗi lần chờ tối đa 30 giây.
  - Dữ liệu tải về được **sao chép sâu** (tránh lỗi đối tượng chỉ đọc).
  - Mỗi lần tải / ghi thành công thì **sao một bản dự phòng** vào IndexedDB `giathanh_kh` trên máy.
- **Mất kết nối:** hiện khung đỏ "Chưa kết nối được kho dữ liệu… dữ liệu vẫn còn nguyên" và nút **↻ Thử kết nối lại**.
  - Hiển thị bản sao lần trước ở chế độ **chỉ xem**, không ghi gì (tránh ghi đè dữ liệu thật).
- **Bắt lỗi khởi động / hiển thị:** không bao giờ để trang trắng.
  - Lỗi khởi động → khung đỏ ghi nội dung lỗi, kèm câu "dữ liệu không bị ảnh hưởng".
  - Sau 60 giây chưa xong → báo đang kẹt ở bước nào.
  - Một màn hình lỗi → khung đỏ ghi số mã hàng, dòng mua, dòng bán, lệnh SX đang có, và nội dung lỗi.
- **Mở tệp HTML trực tiếp** (không qua Claude): dùng IndexedDB của trình duyệt máy đó; dữ liệu **tách biệt** với bản trên Claude.
- **Sao lưu:** `.json` toàn bộ (nhiều năm), Phục hồi từ `.json` (thay toàn bộ), Xuất toàn bộ ra Excel (đúng mẫu nhập), Xóa toàn bộ dữ liệu.
