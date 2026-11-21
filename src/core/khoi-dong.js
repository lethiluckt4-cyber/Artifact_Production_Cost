//# Khởi động
// ---------- Khởi động ----------
window.app = { state, calc, importDocs: d=>{ fromDocs(d); changed(); selKy=''; render(); }, importAOA, toDocs, render, setKy: k=>{ state.settings.workYear=k.slice(0,4); selKy=k; kyByView={}; kyDefault=k; renderedKy=k; calcCache=null; render();} };
(async function(){
  $('#main').innerHTML = '<div class="note">Đang tải dữ liệu…</div>';
  await store.init();
  // Nạp dữ liệu mới một lần (thay toàn bộ dữ liệu cũ, giữ thiết lập) – dữ liệu do Claude chuẩn bị từ các file Excel Misa
  try { const el=document.getElementById('pendingImport'); const PI=el && JSON.parse(el.textContent); let doneLocal=false; try { doneLocal = localStorage.getItem('gt_import_'+PI.id)==='1'; } catch(e){}
    if (PI && PI.docs && state.settings.importId!==PI.id && !doneLocal && new Date().toISOString().slice(0,10)<=PI.until) {
      const keep={...state.settings}; fromDocs(PI.docs); state.settings=Object.assign(state.settings, keep, PI.settings, {importId:PI.id, locked:[]});
      calcCache=null; calcDirty=true; selKy=''; kyByView={}; kyDefault=null; changed(); await store.flush(); try { localStorage.setItem('gt_import_'+PI.id,'1'); } catch(e){}
      setTimeout(()=>toast('Đã nạp dữ liệu mới từ các file Excel (thay dữ liệu cũ, không có số dư đầu kỳ) – vào Giá thành bấm ▶ Tính giá thành', 8000), 300);
    } } catch(e){ console.error('pendingImport', e); }
  try { const n0=(state.settings.dataFixes||[]).length; const ms=dataFixesOnce(); if (ms.length || (state.settings.dataFixes||[]).length!==n0) { calcCache=null; calcDirty=true; changed(); await store.flush(); if (ms.length) setTimeout(()=>toast('Đã bổ sung: '+ms.join(' · '), 9000), 900); } } catch(e){ console.error('dataFixes', e); }
  try { if (fixCodesOnce()) { calcCache=null; calcDirty=true; changed(); await store.flush(); setTimeout(()=>toast('Đã thay mã MUIHEO1 bằng PG_GREENINNO trong định mức', 5000), 400); } } catch(e){ console.error('fixCodes', e); }
  const ui = uiState.load(); let restored=false;
  if (ui) { restored = uiState.apply(ui); }
  try { render(); } catch(e){ console.error(e); view='tongquan'; selKy=''; kyByView={}; render(); }
  if (restored) uiState.restoreScroll();
})();
