//# Biểu tượng SVG cho nút
// ---------- Biểu tượng nút (SVG nét mảnh, màu theo chữ) ----------
const IC_PATH = {
  plus:'<path d="M12 5v14M5 12h14"/>',
  xlOut:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><path d="M14 3l5 5v3"/><path d="M14 3v5h5"/><path d="M11 16h10m-3-3 3 3-3 3"/>',
  xlIn:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"/><path d="M14 3l5 5v3"/><path d="M14 3v5h5"/><path d="M21 16H11m3-3-3 3 3 3"/>',
  refresh:'<path d="M20 11a8 8 0 0 0-14.9-3M4 5v4h4"/><path d="M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4"/>',
  sliders:'<path d="M4 6h8m4 0h4M4 12h2m4 0h10M4 18h10m4 0h2"/><circle cx="14" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="16" cy="18" r="2"/>',
  edit:'<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  save:'<path d="M5 3h11l4 4v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M7 3v5h8V3M7 21v-7h10v7"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
  up:'<path d="M6 15l6-6 6 6"/>', down:'<path d="M6 9l6 6 6-6"/>', undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>', x:'<path d="M6 6l12 12M18 6 6 18"/>'
};
function IC(n){ return `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${IC_PATH[n]||''}</svg>`; }
function tbExtra(){ return `<button class="btn io js-rf" title="Cập nhật dữ liệu – lấy lại dữ liệu mới nhất và tính lại số liệu" aria-label="Làm mới dữ liệu">${IC('refresh')}</button><button class="btn io js-tbset" title="Thiết lập bảng – ẩn / hiện và đổi thứ tự cột" aria-label="Thiết lập bảng">${IC('sliders')}</button>`; }

