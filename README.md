# Artifact_Production_Cost – Phần mềm Giá thành Công ty Thiên Hồng

Bộ **artifact hoàn chỉnh** của Phần mềm Giá thành (bản chạy trên claude.ai), kèm **đầy đủ dữ liệu**: dữ liệu demo năm 2026 và ảnh chụp dữ liệu thật ngày 04/11/2026. Mục đích là dùng làm mẫu (mockup) để dựng hệ thống.

- Phần mềm gồm một tệp HTML duy nhất (HTML + CSS + JavaScript thuần), không cần máy chủ.
- Logic giá thành đối chiếu khớp file Excel gốc `Gia thanh - 26 TH.xlsx`: 10 tháng 2026, 1.172 lệnh, 24 mã, **0 chỉ tiêu lệch**. Kết quả này đo khi tắt quy tắc sản phẩm lỗi; xem mục *Lưu ý* bên dưới.

## Cấu trúc

```
artifact/
  index.html                  Phần mềm đầy đủ, có nhúng dữ liệu demo 2026 (nút "Nạp dữ liệu năm 2026")
  index_mau_trong.html        Bản mẫu trống cho công ty khác: không dữ liệu, tên [TÊN CÔNG TY], chưa khai sản phẩm lỗi
  artifact_manifest.json      Khai báo artifact: capabilities db + downloads, bộ sưu tập dữ liệu "gt"
data/
  SaoLuu_GiaThanh_2026-11-04.json   Toàn bộ dữ liệu hiện tại (52 tài liệu), đúng định dạng file sao lưu của phần mềm
  db_gt/*.json                       Cùng dữ liệu đó, tách theo từng tài liệu của kho "gt" (tên tệp = id tài liệu)
  demo_2026_seed.json                Dữ liệu demo nhúng sẵn trong index.html (chuyển từ Excel gốc)
  DuLieu_GiaThanh_2026-11-04.xlsx    Toàn bộ dữ liệu hiện tại dạng Excel, đúng mẫu nhập (nhập lại được)
  Mau_Tai_Du_Lieu_GiaThanh.xlsx      Mẫu nhập dữ liệu trống (11 sheet)
  doi_chieu_excel_2026_expected.json Số liệu lấy từ Excel gốc để kiểm tra đối chiếu
  bao_cao_mau_2026-10/               Các báo cáo phần mềm xuất cho tháng 10/2026: Giá thành, NXT, Cảnh báo,
                                     File kế toán ASP, Tổng hợp bán hàng, Tổng hợp năm, Chi phí 622/627
docs/
  00_README_GOI_MAU.md               Mục lục gói mẫu
  01_DAC_TA_CHUC_NANG_VA_MAN_HINH.md Nội dung: kiến trúc, dữ liệu, 19 màn hình, từng cột / nút, tệp nhập – xuất
  02_QUY_DINH_NGHIEP_VU_VA_CONG_THUC.md  Quy định: công thức giá thành, phân bổ, NXT, rủi ro, đề xuất SX, sản phẩm lỗi…
  03_GIAO_DIEN_VA_QUY_UOC_HIEN_THI.md    Hình thức: màu, chữ, bảng, định dạng
  04_HUONG_DAN_XAY_DUNG_CHO_CONG_TY_MOI.md  Bảng câu hỏi, 7 bước dựng lại, chỗ đang ghi cứng, nghiệm thu
  05_NHAT_KY_YEU_CAU_DA_CHOT.md      Các quyết định người dùng đã chốt
  hinh_anh/                          33 ảnh chụp mọi màn hình, tab, hộp thoại
tests/                               Kiểm thử tự động Playwright + extract_th.py (đọc Excel gốc → seed/expected)
```

## Dữ liệu có trong bộ này
| | Số lượng |
|---|---|
| Danh mục hàng | 25 mã (gồm mã mới `BTP_BGK_LOI` – Bánh gấu khô lỗi) |
| Định mức | 24 dòng |
| Mua hàng | 251 dòng (01–10/2026, có 1 dòng tách hóa đơn 00000255) |
| Bán hàng | 457 dòng |
| Lệnh sản xuất | 1.172 lệnh |
| Xuất dùng chung | 6 phiếu (loại 627) |
| Chi phí 622/627 | 9 tháng |
| Lịch nghỉ | 30 ngày |
| Số dư đầu kỳ | 01/2026, 22 mã |
| Thiết lập | Phân bổ 622/627, ngưỡng rủi ro, tham số đề xuất, quy tắc sản phẩm lỗi (7%, 8.000 đ/kg, từ 01/2026) |

## Cách chạy
1. **Xem ngay trên máy:** mở `artifact/index.html` bằng Chrome / Edge. Vào **Tổng quan**, bấm **Nạp dữ liệu năm 2026** để có dữ liệu demo. Chế độ này lưu dữ liệu trong trình duyệt của máy đó.
2. **Nạp đúng dữ liệu hiện tại:** vào **Thiết lập & sao lưu → ⬆ Phục hồi từ file .json**, chọn `data/SaoLuu_GiaThanh_2026-11-04.json`.
3. **Dựng thành artifact trên claude.ai:**
   - Xuất bản `artifact/index.html`, khai báo capabilities theo `artifact_manifest.json`.
   - Mở artifact, rồi phục hồi từ file `.json` như bước 2. Cách khác: ghi từng tệp `data/db_gt/<id>.json` vào bộ sưu tập `gt` với id = tên tệp.
4. **Dựng cho công ty khác:** bắt đầu từ `artifact/index_mau_trong.html` và đọc `docs/04_HUONG_DAN_XAY_DUNG_CHO_CONG_TY_MOI.md`.

## Chạy kiểm thử
```
cd tests
npm install            # cài Playwright
npx playwright install chromium
node t_verify_noloi.js # đối chiếu Excel → "Số chỉ tiêu lệch: 0"
node t_views.js        # mở mọi màn hình, không lỗi
node t_comp.js         # sản phẩm lỗi: xem trước / bù hao hụt / hoàn tác
```
Một số kiểm thử (`t_conn.js`, `t_cache.js`) cần máy chủ cục bộ: `cd artifact && python3 -m http.server 8765`.

## Lưu ý
- **Quy tắc sản phẩm lỗi đang áp dụng từ 01/2026 và chưa bù lệnh.** Vì vậy tồn bánh gấu khô các tháng 1–10 hiện âm, và số liệu không còn khớp Excel gốc.
  - Cách xử lý ở **Thiết lập & sao lưu → tab Sản phẩm lỗi**: đổi kỳ áp dụng, hoặc dùng nút **Bù hao hụt cho lệnh đã có** (có xem trước và hoàn tác).
  - Chi tiết xem `docs/02_...` mục 3.6.
- Dữ liệu là số liệu kinh doanh thật của Công ty Thiên Hồng (nhà cung cấp, khách hàng, giá mua / bán). Repo đang để **công khai**: nên chuyển sang riêng tư nếu không muốn người ngoài xem.
