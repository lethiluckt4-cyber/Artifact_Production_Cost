// ---------- Làm mới dữ liệu: tải lại bản mới nhất từ kho trên tài khoản ----------
async function refreshData(){
  if (store.readOnly) return store.reconnect();
  const b=$('#refreshData'); if (b) { b.disabled=true; }
  showBusy('Đang làm mới dữ liệu…', 'Lưu các thay đổi đang chờ rồi tải lại bản mới nhất');
  try {
    clearTimeout(store.timer); await store.flush(); for (let i=0; i<40 && store.saving; i++) await new Promise(r=>setTimeout(r,150));
    const before = Object.assign({}, store.lastSaved);
    const docs = await store.backend.loadAll(); store.apply(docs);
    if (store.kind==='cloud' && store.cache) Object.keys(docs).forEach(k=>store.cache.put(k, docs[k]).catch(()=>{}));
    const ks = new Set([...Object.keys(before), ...Object.keys(store.lastSaved)]); const diff = [...ks].some(k=>before[k]!==store.lastSaved[k]);
    calcCache=null; if (diff) calcDirty=true; editRow=null; gridSel.clear();
    hideBusy(); render(); toast('Đã lấy lại dữ liệu mới nhất và tính lại số liệu', 3000);
  } catch(e){ hideBusy(); render(); toast('Không làm mới được: '+(e&&e.message||e), 5000); }
}
const gridSel = new Set(); let gridSelEnt = '';
