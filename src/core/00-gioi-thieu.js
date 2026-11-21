//# Lời mở đầu + sơ đồ mã nguồn gốc
/* =========================================================
   PHẦN MỀM GIÁ THÀNH – nhiều năm, chuyển số dư đầu kỳ
   ========================================================= */
'use strict';

/* =====================================================================
   SƠ ĐỒ MÃ NGUỒN (để tùy biến cho công ty khác)
   PHẦN DÙNG CHUNG (giữ nguyên):
     Tiện ích · Lưu trữ (store/toDocs/fromDocs) · Giao diện (NAV, head, render)
     Lưới nhập liệu (GRID/vGrid) · Nhập Excel (importDialog/importAOA/TEMPLATE)
     Bảng kiểu Excel (enhanceTables) · Khóa kỳ · Thiết lập · Hướng dẫn
   PHẦN RIÊNG THEO CÔNG TY (sửa ở đây):
     [A] Định nghĩa dữ liệu: F (thứ tự cột), GRID (cột, công thức phụ), TEMPLATE/SAMPLES (mẫu Excel), NAV (menu)
     [B] Tính toán: calc() – giá vốn, trải định mức, 621/622/627/154, NXT, chuyển kỳ
     [C] Đề xuất: buildProposal / buildAdjProposal / applyProposalCore / proposalParams
     [D] Chuỗi tự chạy: runCalcFor / showCalcResult
     [E] Báo cáo: vTongQuan, vNXT, vGiaThanh, vNam, vCanhBao
     [F] Xuất kế toán: XK_HDR/NK_HDR, buildXK/buildNK, ktSettings
     [G] Dữ liệu mẫu: <script id="seed"> (để {} nếu không có)
   ===================================================================== */
