# GÓI MẪU PHẦN MỀM GIÁ THÀNH – ĐÓNG GÓI TỪ BẢN CÔNG TY THIÊN HỒNG (03/11/2026)

Gói này chứa **toàn bộ nội dung, hình thức và quy định** của Phần mềm Giá thành đang chạy cho Công ty Thiên Hồng, để xây lại cho một công ty khác có quy trình tương tự (sản xuất nhiều cấp, giá vốn bình quân tháng, phân bổ 622/627, NXT, cảnh báo rủi ro, file kế toán).

## Đọc theo thứ tự

| # | Tài liệu | Nội dung |
|---|---|---|
| 1 | `tai_lieu/01_DAC_TA_CHUC_NANG_VA_MAN_HINH.md` | **Nội dung:** kiến trúc, mô hình dữ liệu, menu 19 màn hình, từng cột / nút / tab, tệp nhập – xuất Excel |
| 2 | `tai_lieu/02_QUY_DINH_NGHIEP_VU_VA_CONG_THUC.md` | **Quy định:** công thức giá thành, phân bổ, NXT, trạng thái rủi ro, đề xuất SX, cân đối NVL, cảnh báo giá, KPI, ràng buộc nhập liệu, an toàn dữ liệu |
| 3 | `tai_lieu/03_GIAO_DIEN_VA_QUY_UOC_HIEN_THI.md` | **Hình thức:** bố cục, màu, chữ, nút, bảng, định dạng số / ngày, giọng văn |
| 4 | `tai_lieu/04_HUONG_DAN_XAY_DUNG_CHO_CONG_TY_MOI.md` | Bảng câu hỏi cho công ty mới, 7 bước dựng lại, danh sách chỗ đang ghi cứng theo Thiên Hồng, kiểm thử, nghiệm thu, câu lệnh mẫu |
| 5 | `tai_lieu/05_NHAT_KY_YEU_CAU_DA_CHOT.md` | Các quyết định người dùng đã chốt (kết quả cuối cùng sau các lần đổi ý) |
| 6 | `tai_lieu/hinh_anh/` | 32 ảnh chụp mọi màn hình, tab và hộp thoại (danh sách ở `00_DANH_SACH_ANH.md`) |

## Tệp phần mềm
| Tệp | Dùng khi |
|---|---|
| `app/PhanMem_GiaThanh_MAU_TRONG.html` | **Bắt đầu cho công ty mới.** Không có dữ liệu mẫu, tên công ty `[TÊN CÔNG TY]`. Chạy được ngay, mọi màn hình mở được khi trống. |
| `app/PhanMem_GiaThanh_ThienHong_co_du_lieu.html` | Bản tham chiếu đầy đủ, có nút "Nạp dữ liệu năm 2026" (dữ liệu Thiên Hồng 01–10/2026) để xem phần mềm chạy thật. |
| `mau_excel/Mau_Tai_Du_Lieu_GiaThanh.xlsx` | Mẫu nhập dữ liệu ban đầu (11 sheet). |
| `cong_cu/` | Kiểm thử tự động (Playwright) và `extract_th.py` (đọc Excel gốc → `seed.json` + `expected.json`). Các tệp `t_*.js` đang trỏ tới `/home/claude/work/app/index.html`: đổi đường dẫn khi chạy chỗ khác. |

## Tóm tắt phần mềm trong 10 dòng
1. Một tệp HTML, chạy trên claude.ai (lưu trên tài khoản) hoặc mở trực tiếp (lưu trong trình duyệt).
2. Menu: Tổng quan · Cảnh báo & kiểm tra · 1 Dữ liệu nền · 2 Phát sinh hằng ngày · 3 Kế hoạch & giá thành · 4 Báo cáo · Hệ thống.
3. Nhập: danh mục, tồn đầu, định mức (có hiệu lực, hao hụt, mẻ), NVL thay thế, mua / bán, xuất dùng chung (627 / 641), chi phí 622 / 627, lệnh SX, cân đối NVL.
4. Bấm **▶ Tính giá thành** thì phần mềm tự đề xuất SX → lệnh, tính giá thành theo cấp, tính NXT, rồi đề xuất cân đối NVL.
5. Giá NVL = BQ mua tháng; giá bán thành phẩm = 154 BQ tháng; 154 = 621 + 622 + 627; phân bổ theo 2 công đoạn + tỷ lệ cố định + tỷ trọng 621.
6. NXT giá vốn bình quân tháng, tồn cuối tự chuyển sang tháng sau.
7. Trạng thái rủi ro tồn kho: 1 trạng thái / mã, theo mốc ngày của từng nhóm (cảnh báo = ½ mốc).
8. Cảnh báo & kiểm tra: 10 chỉ tiêu theo tháng + 9 nhóm kiểm tra, xuất Excel toàn bộ.
9. Xuất Excel mọi báo cáo; file phiếu kho cho phần mềm kế toán (mẫu ASP).
10. Khóa kỳ, sao lưu / phục hồi `.json`, chế độ chỉ xem khi mất kết nối, không bao giờ trang trắng.

## Đã kiểm chứng
- Đối chiếu với file `Gia thanh - 26 TH.xlsx`: 10 tháng, 1.172 lệnh, 24 mã → **0 chỉ tiêu lệch**.
- Chạy với đúng dữ liệu thật trên kho đám mây (52 tài liệu), kể cả dữ liệu chỉ đọc: mọi màn hình không lỗi.
- Bản mẫu trống: mọi màn hình mở được, không lỗi.
