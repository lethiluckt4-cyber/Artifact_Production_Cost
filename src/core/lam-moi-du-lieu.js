//# Nút làm mới: lưu phần chờ, đọc lại, vẽ lại
// ---------- Làm mới dữ liệu: lưu phần đang chờ, đọc lại từ nơi lưu, vẽ lại ----------
let refreshing = false;
async function refreshData(){
  if (editRow) return guardEdit(refreshData);
  if (refreshing) return; refreshing = true;
  const bs=[...document.querySelectorAll('.js-rf')]; bs.forEach(b=>{ b.disabled=true; b.classList.add('spin'); });
  try {
    clearTimeout(store.timer);
    while (store.saving) await new Promise(r=>setTimeout(r,80));
    await store.flush();
    while (store.saving) await new Promise(r=>setTimeout(r,80));
    if (store.err) { toast('Chưa lưu được thay đổi hiện có nên chưa làm mới (tránh mất dữ liệu) – thử lại sau', 5000); return; }
    const docs = await store.backend.loadAll();
    fromDocs(docs);
    store.lastSaved = {}; for (const k in docs) store.lastSaved[k] = JSON.stringify(docs[k]);
    calcCache = null; calcLiveCache = null; dataVer++; closeFilter();
    render();
    toast('✓ Đã lấy lại dữ liệu mới nhất và tính lại số liệu', 3500);
  } catch(e){ console.error(e); toast('Không làm mới được: '+(e&&e.message||e), 5000); }
  finally { refreshing=false; document.querySelectorAll('.js-rf').forEach(b=>{ b.disabled=false; b.classList.remove('spin'); }); }
}

