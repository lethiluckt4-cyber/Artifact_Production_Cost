// ---------- Giữ nguyên chỗ đang làm (menu, tab, kỳ xem, ô tìm, vị trí cuộn) khi tải lại / cập nhật phần mềm ----------
const UI_KEY='gt_ui_v1'; const UI_DS=['cbt','cd','ktab','nhom','ptab','tab','tlt','khDetail','khoSel','nxtTab','hdt','cdt'];
function saveUI(){ try { const m=$('#main'); if (!m) return; const ds={}; UI_DS.forEach(k=>{ if (m.dataset[k]!=null) ds[k]=m.dataset[k]; }); const tw=m.querySelector('.tw');
  localStorage.setItem(UI_KEY, JSON.stringify({view, selKy, kyByMenu, ds, search, sb:searchBy, wy:String(state.settings.workYear||''), sy:window.scrollY||0, my:m.scrollTop||0, tx:tw?tw.scrollTop:0, tl:tw?tw.scrollLeft:0})); } catch(e){} }
function restoreUI(){ let u=null; try { u=JSON.parse(localStorage.getItem(UI_KEY)||'null'); } catch(e){} if (!u || !u.view) return null;
  view=u.view; const m=$('#main'); Object.entries(u.ds||{}).forEach(([k,v])=>{ m.dataset[k]=v; }); search=u.search||''; Object.assign(searchBy, u.sb||{});
  if (u.wy && u.wy===String(workYear())) { Object.assign(kyByMenu, u.kyByMenu||{}); if (u.selKy) kyByMenu[menuOf(view)]=u.selKy; }
  return u; }
function restoreScroll(u){ if (!u) return; const go=()=>{ try { window.scrollTo(0, u.sy||0); const m=$('#main'); if (m) m.scrollTop=u.my||0; const tw=m&&m.querySelector('.tw'); if (tw) { tw.scrollTop=u.tx||0; tw.scrollLeft=u.tl||0; } } catch(e){} }; go(); setTimeout(go, 80); setTimeout(go, 300); }
let uiSaveT=null; document.addEventListener('scroll', ()=>{ clearTimeout(uiSaveT); uiSaveT=setTimeout(saveUI, 300); }, true);
window.addEventListener('beforeunload', saveUI); document.addEventListener('visibilitychange', ()=>{ if (document.visibilityState==='hidden') saveUI(); });

