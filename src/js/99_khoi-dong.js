// ---------- Khởi động ----------
window.app = { state, calc, importDocs: d=>{ fromDocs(d); changed(); selKy=''; render(); }, importAOA, toDocs, render, setKy: k=>{ state.settings.workYear=k.slice(0,4); selKy=k; calcCache=null; render();} };
(async function(){
  $('#main').innerHTML = '<div class="note">Đang tải dữ liệu…</div>';
  try { await store.init(); }
  catch(e){ console.error(e); window.__bootBox && window.__bootBox('<b>⚠ Không tải được dữ liệu.</b> Dữ liệu trên tài khoản không bị ảnh hưởng. Hãy tải lại trang (F5).<br><small>'+esc(e&&e.message||e)+'</small>'); return; }
  if (state._migrated) { delete state._migrated; if (!store.readOnly) store.schedule(); }
  window.__bootStep = 'hiển thị';
  const ui = restoreUI();
  try { render(); window.__booted = true; restoreScroll(ui); }
  catch(e){ console.error(e); window.__booted = true; const m=$('#main'); m.innerHTML = `<div class="note" style="background:#fef2f2;border:1px solid #fca5a5;color:#991b1b"><b>⚠ Màn hình này bị lỗi khi hiển thị</b> (dữ liệu vẫn còn: ${state.items.length} mã hàng, ${state.purchases.length} dòng mua, ${state.orders.length} lệnh SX). Hãy chọn màn hình khác ở menu bên trái và chụp màn hình lỗi gửi lại.<br><small>${esc(e&&e.message||e)}</small></div>`; try{ renderNav(); }catch(_){}} 
})();
