// ---------- Biểu tượng nút (nét mảnh, cùng một bộ) ----------
const IC_P = {
  plus:'<path d="M12 5v14M5 12h14"/>',
  scan:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/><path d="m8 11 2 2 4-4"/>',
  xout:'<path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M13 3l6 6v3"/><path d="M13 3v6h6"/><path d="M14 17h7m-3-3 3 3-3 3"/>',
  xin:'<path d="M5 9V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2"/><path d="M14 3v5h5"/><path d="M2 13h9m-3-3 3 3-3 3"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  sliders:'<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  edit:'<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>',
  save:'<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
  trash:'<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  cut:'<circle cx="6" cy="6" r="3"/><path d="M8.12 8.12 12 12"/><path d="M20 4 8.12 15.88"/><circle cx="6" cy="18" r="3"/><path d="M14.8 14.8 20 20"/>',
  copy:'<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/>',
  up:'<path d="m18 15-6-6-6 6"/>', down:'<path d="m6 9 6 6 6-6"/>',
  undo:'<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  box:'<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
  folder:'<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  tin:'<path d="M12 3v12m-5-5 5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  chart:'<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/>',
  tout:'<path d="M12 15V3m-5 5 5-5 5 5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>'
};
const icon = k => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC_P[k]||''}</svg>`;
// Gắn biểu tượng cho mọi nút theo nhãn – một quy ước cho toàn phần mềm
function decorBtn(b){
  if (!b || b.dataset.ic || b.querySelector('svg')) return;
  const t=(b.textContent||'').replace(/\s+/g,' ').trim(); if (!t) return;
  let ic=null, lab=t;
  if (/^\+\s*Thêm/.test(t)) { ic='plus'; lab=t.replace(/^\+\s*/,''); }
  else if (/^(⬇\s*)?Xuất Excel/.test(t)) { ic='xout'; lab=t.replace(/^⬇\s*/,''); }
  else if (/^(📋\s*)?(Nhập Excel|Nhập từ Excel)/.test(t)) { ic='xin'; lab=t.replace(/^📋\s*/,''); }
  else if (/^↻/.test(t) || t==='Làm mới dữ liệu') { ic='refresh'; lab=t.replace(/^↻\s*/,''); }
  else if (t==='Thiết lập bảng') ic='sliders';
  else if (/^✂/.test(t)) { ic='cut'; lab=t.replace(/^✂\s*/,''); }
  else if (t==='Sửa') ic='edit';
  else if (t==='Nhân bản') ic='copy';
  else if (t==='Lưu' || /^Lưu /.test(t)) ic='save';
  else if (t==='Xóa' || (/^Xóa /.test(t) && b.classList.contains('d'))) ic='trash';
  else if ((t==='Hủy' && b.closest('td')) || (t==='Bỏ chọn' && b.closest('#selBar'))) ic='x';
  if (!ic) return;
  // Chỉ 3 nút giữ chữ: Thêm, Xuất Excel, Nhập Excel – còn lại trong bảng / thanh công cụ là biểu tượng (rê chuột hiện tên)
  const only = ['refresh','sliders'].includes(ic) || ((!!b.closest('td') || !!b.closest('#selBar')) && ['edit','copy','trash','save','x','cut'].includes(ic));
  if (ic==='trash') b.classList.add('idel');
  if (ic==='plus') b.classList.add('p'); // mọi nút Thêm: xanh dương
  if (!b.title) b.title = lab; b.setAttribute('aria-label', lab);
  b.innerHTML = icon(ic) + (only ? '' : `<span>${esc(lab)}</span>`); b.dataset.ic = ic; if (only) b.classList.add('io');
}
