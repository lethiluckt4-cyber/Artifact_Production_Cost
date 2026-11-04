# 05 – NHẬT KÝ YÊU CẦU ĐÃ CHỐT (QUY ĐỊNH TỪ NGƯỜI DÙNG)

> Đây là các quyết định người dùng đã đưa ra trong quá trình xây phần mềm cho Thiên Hồng, kể cả những lần **đổi ý**. Ghi lại **kết quả cuối cùng**.
> Khi dựng cho công ty khác, mặc định làm theo đúng các quy định này (trừ khi công ty mới yêu cầu khác), để không phải sửa lại từ đầu.

## A. Quy định chung về nhập liệu
1. **Ràng buộc mã:** mọi dòng mua / bán… phải có mã trong danh mục, nhập Excel hoặc nhập tay đều vậy. Đủ yếu tố bắt buộc mới cho lưu. Vì vậy NXT luôn áp dụng được → **bỏ cột "Kiểm tra mã NXT"**.
2. **Cột bắt buộc đánh dấu `*`.** Nhập đủ là lưu được, các cột khác để trống được.
3. **Thêm dòng mới: để trống hết**, không điền sẵn mặc định (tránh phải xóa rồi nhập lại).
4. **Ngày gõ nhanh:** `15` → ngày 15 tháng đang xem; `15/10` → 15/10 năm đang xem.
5. **Ô tìm kiếm:**
   - Sửa lỗi chữ bị đảo ngược khi gõ.
   - Tìm được **ngày** (05/10, 5/10, 05/10/2026) và **tên hàng**.
   - Không phân biệt dấu, nhiều từ.
6. **Số kiểu Việt Nam:** `2,5` là hai phẩy năm (không hiểu thành 25).

## B. Mua hàng & Bán hàng
1. **Ngày mua → đổi tên "Ngày hóa đơn".**
2. **Cột "Chuyển kho" → đổi tên "Mua hàng chưa HĐ".**
   - Ngày nhập kho ≠ Ngày hóa đơn thì đánh `x`.
   - Hóa đơn có tách: các dòng còn lại hiện **số hóa đơn**, dòng tách hiện `x - <số hóa đơn>`.
3. **Tách hóa đơn** (mua hàng trước, hóa đơn về sau, hoặc một hóa đơn về nhiều đợt):
   - Nút ✂ Tách chèn **dòng mới ngay dưới dòng gốc** (sửa trực tiếp trong bảng, không mở hộp thoại).
   - **Hóa đơn vẫn là ngày cũ**; chỉ chỉnh **ngày nhập kho mới**.
   - **Thành tiền tự nhảy**; **dòng gốc tự trừ** số tách ngay khi gõ.
4. **Bỏ cột Ghi chú** ở lưới Mua hàng.
5. **Giá so sánh → đổi tên "Chênh lệch giá mua" / "Chênh lệch giá bán"**, giá trị = giá dòng − giá so sánh. Kèm cột **Tỷ lệ chênh lệch**.
6. **Không làm cột "Cảnh báo giá"** (đã làm rồi bỏ). Người dùng **lọc trực tiếp cột Tỷ lệ chênh lệch** (có lọc số ≥ / ≤ / |x|). Tổng hợp dòng bất thường đặt ở **Cảnh báo & kiểm tra**.
7. **Tiêu thức cảnh báo giá:**
   - Mua so với giá BQ tháng trước (chưa có thì giá giữa trong tháng).
   - Bán so với giá bán phổ biến trong tháng.
   - Bán dưới giá vốn luôn đỏ.
   - Ngưỡng mua 10% / 30%, bán 5% / 20%.
8. **Không cố định cột** ở Mua hàng và Bán hàng (đã thử cố định sau cột tên hàng rồi bỏ).
9. **Bán hàng:** bỏ nhãn "BÁN LỖ" và "CHƯA CÓ TRONG NXT" ở Trạng thái dữ liệu. Chỉ còn `ÂM KHO`, `THIẾU SỐ HĐ`.

## C. Danh mục, Định mức, NVL thay thế
1. Cột **"Có định mức"** trong Danh mục = sản phẩm tự sản xuất đã khai định mức chưa (Có / ⚠ chưa có).
2. **Định mức đổi tên cột:** Loại ĐM, Mã TP, Tên TP, Mã NVL, Tên NVL, Nhóm, SL TP/lần, SL NVL/lần, Số lượng/SP, Lần/ngày, Hao hụt %, Hiệu lực từ, Hiệu lực đến, Trạng thái, Ghi chú. Các bảng có cột cùng tính chất cũng đổi theo.
3. **Bỏ cột "Cách tính"** trong Định mức.
4. NVL thay thế: ngày đổi tên thành **Hiệu lực từ / Hiệu lực đến**.
5. **Không cho xóa / đổi mã** đang được dùng ở chứng từ khác.

## D. Xuất dùng chung & Chi phí
1. Tên menu là **"Xuất dùng chung"** (đã thử "Xuất vật tư" rồi đổi lại).
2. **Hai loại xuất:**
   - **Chi phí sản xuất (627)**: vào giá thành.
   - **Bán hàng (641)**: không vào giá thành.
   - Cấu trúc cột: Số chứng từ, Ngày xuất, Loại xuất, Mã VT, Tên VT, ĐVT, Số lượng, Lý do, Đơn giá, Thành tiền.
3. Menu **"Chi phí 622/627"** (bỏ chữ "& phân bổ"). Có nút **Xuất Excel**.
4. **Bảng Chi phí** theo đúng thứ tự cột: Tháng, 621 / BTP (NVL mua), 621 / TP (bao bì), 622 Nhân công, 6273, 6274, 6277 Điện, 6277 Nước, 6277 Xuất dùng chung (627), Tổng 627, 622 đ/kg SX, 627 đ/kg SX, Tổng giá thành 154, 621/154, 622/154, 627/154, 641 Bán hàng, Chưa phân bổ (không SX).
5. **Phân bổ 622/627 chuyển vào Thiết lập** (tab nhỏ riêng như Lịch nghỉ), **chỉ là phần thiết lập**:
   - Công đoạn 2 không cần nhập, **tự = 1 − CĐ1** và hiển thị tổng tỷ lệ CĐ2.
   - Dòng CĐ2 trong bảng sản phẩm **chỉ ghi "phân bổ theo tỷ trọng 621 trong tháng"** (không hiện số).

## E. Lệnh sản xuất, Giá thành
1. **Giá thành – tab "Theo lệnh":** bỏ 621 lệnh, 622 lệnh, 627 lệnh, 154 lệnh, NVL tồn cuối ngày, Kiểm tra lệnh. **Kiểm tra lệnh đưa vào Cảnh báo.**
2. **Xuất Excel giá thành đầy đủ:**
   - Thông tin từ thành phẩm đến NVL và chi phí phân bổ (sheet ChiTiet 28 cột).
   - Sheet "Gia thanh BTP / TP" **giống hệt bố cục Excel gốc** để dễ kiểm tra.
3. **Tab "Chi tiết"** (đổi từ "Bảng như Excel") hiện đúng 28 cột như sheet ChiTiet, ngay trên phần mềm.

## F. Báo cáo
1. **Bỏ "Báo cáo bán hàng và lãi gộp"** (vì đã có sheet Bán hàng). **Thêm "Tổng hợp bán hàng theo mặt hàng".**
2. **Tổng hợp năm:** Tháng, Số lệnh, SL sản xuất, Giá trị SX 154, Doanh số bán, Tổng lãi gộp, Biên LN, Tồn cuối kho.
3. **NXT:**
   - Đổi tên cột theo dạng Giá vốn, Tồn đầu SL, Tồn đầu TT, Nhập SL… Tồn cuối SL, Tồn cuối TT.
   - Cột **Phân loại** viết hoa chữ đầu, cỡ chữ bằng chữ chung.
4. **Trạng thái rủi ro (NXT):**
   - Cách ghi gọn, mỗi mã 1 trạng thái.
   - "Chưa xây dựng định mức" = NVL chưa có trong Định mức, NVL thay thế và Xuất dùng chung.
   - **Bỏ "Bán dưới giá vốn"** khỏi NXT (đã có ở cảnh báo chung).
   - Mốc rủi ro theo nhóm: NVL trên 3 tháng; Bánh gấu kem tươi, kem, bánh gấu khô trên 2 ngày; TP đóng gói trên 6 tháng; Trứng gà trên 10 ngày; Bao bì trên 1 năm; Nhiên liệu trên 1 tháng. **Một nửa thời gian rủi ro là cảnh báo.**
   - **Ghi rõ mốc** (ví dụ "Tồn trên 3 tháng…") thay vì "vượt 1/2 mốc".
5. **Hướng dẫn:** liệt kê đầy đủ các trạng thái rủi ro, ý nghĩa và cách xử lý (bảng chi tiết từng nhóm / mã) để mọi người đọc hiểu.

## G. Tổng quan & Cảnh báo
1. **Tổng quan:** bỏ bảng "Rủi ro tồn kho cần xử lý" (chuyển sang Cảnh báo) và bảng "Giá thành & lãi theo sản phẩm" (trùng tab Theo sản phẩm của Giá thành).
2. **Cảnh báo & kiểm tra:**
   - "Rủi ro tồn kho cần xử lý" và "Tồn cuối kỳ âm" **gộp chung**, đặt **ngay dưới các chỉ tiêu đánh giá**.
   - Có nút **xuất toàn bộ ra Excel**.
3. **Ngưỡng cảnh báo** (ngưỡng tồn, ngưỡng giá) đưa vào **tab của Cảnh báo & kiểm tra**.

## H. Hệ thống & giao diện
1. **Lịch nghỉ / tăng ca** đưa vào phần Thiết lập (tab riêng).
2. Tên **"Thiết lập & sao lưu"** (đã thử "Thiết lập & lịch làm việc" rồi đổi lại).
3. **Tiêu đề bảng canh giữa tất cả**, đẹp. Khi co giãn cột thì chữ tiêu đề **được xuống dòng**.
4. **Tiêu đề mỗi màn hình chữ màu xanh** (không dùng màu đen).
5. **Dữ liệu không được mất / không trang trắng.** Đã gặp và sửa:
   - Kết nối kho chậm → chờ lâu hơn, thử lại, báo rõ.
   - Dữ liệu đám mây chỉ đọc → sao chép trước khi xử lý.
   - Mọi lỗi hiện khung đỏ, kèm câu "dữ liệu vẫn còn".

## I. Sản phẩm lỗi (bổ sung 04/11/2026)
1. **Bối cảnh:** bánh gấu khô sau khi làm được lựa bánh có độ phồng để bơm kem. Bánh bị dẹp (hao hụt khoảng 5–10%) nhập kho để bán với giá rất thấp.
2. **Cách tính:** đúng quy định kế toán (VAS 02). Bánh lỗi tính theo **giá bán ước tính**, trừ khỏi giá thành bánh khô đạt (Nợ 155 / Có 154).
3. **Ghi nhận số lượng:** theo **tỷ lệ cố định 7%**.
4. **Giá bán ước tính:** **8.000 đ/kg**.
5. **Thời điểm áp dụng:** đang để 01/2026, người dùng sẽ cân nhắc sau (có thể 11/2026). Phần mềm phải hỗ trợ cả hai: nếu áp ngược thì **tăng lại lệnh bánh khô cũ** (có xem trước và hoàn tác).
6. **Đề xuất sản xuất tự tăng bánh khô** để bù hao hụt.
7. **Mã riêng:** `BTP_BGK_LOI`, có tồn kho, bán ở Bán hàng.
