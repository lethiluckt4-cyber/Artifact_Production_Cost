//# Giữ nguyên màn hình / tab / kỳ / vị trí cuộn khi tải lại
// ---------- Giữ nguyên vị trí đang xem (màn hình, tab, kỳ, ô tìm, vị trí cuộn) khi tải lại trang / khi phần mềm được cập nhật ----------
const UI_KEY = 'gt_ui_v1';
const uiState = {
  restoring: null, timer: null,
  store(){ try { return window.localStorage; } catch(e){ return null; } },
  snapshot(){ const m=$('#main'); const tw=m && m.querySelector('.tw'); const se=document.scrollingElement||document.documentElement;
    const ds={}; if (m) ['tab','stab','ptab','ktab','atab'].forEach(k=>{ if (m.dataset[k]) ds[k]=m.dataset[k]; });
    return { v:1, view, selKy, kyByView, kyDefault, search, searchBy:{...searchBy, [searchCur]:search}, searchCur, ds, nxtTab, cbTab, cdTab, scroll:{ win:se?se.scrollTop:0, main:m?m.scrollTop:0, twT:tw?tw.scrollTop:0, twL:tw?tw.scrollLeft:0 }, at:Date.now() }; },
  save(){ const st=this.store(); if (!st || this.restoring) return; try { st.setItem(UI_KEY, JSON.stringify(this.snapshot())); } catch(e){} },
  later(){ clearTimeout(this.timer); this.timer=setTimeout(()=>this.save(), 250); },
  load(){ const st=this.store(); if (!st) return null; try { const o=JSON.parse(st.getItem(UI_KEY)||'null'); return o && o.v===1 ? o : null; } catch(e){ return null; } },
  apply(o){ if (!o) return false; const ok=k=>typeof k==='string' && /^(\d{4}(-\d{2})?|R:\d{4}-\d{2}-\d{2}:\d{4}-\d{2}-\d{2}|.+)$/.test(k);
    try { if (o.view && typeof o.view==='string') view=o.view; if (ok(o.selKy)) selKy=o.selKy; if (o.kyByView && typeof o.kyByView==='object') kyByView=o.kyByView; if (o.kyDefault!==undefined) kyDefault=o.kyDefault; if (typeof o.search==='string') search=o.search; if (o.searchBy && typeof o.searchBy==='object') searchBy=o.searchBy; if (typeof o.searchCur==='string') searchCur=o.searchCur;
      if (o.nxtTab) nxtTab=o.nxtTab; if (o.cbTab) cbTab=o.cbTab; if (o.cdTab) cdTab=o.cdTab; const m=$('#main'); if (m && o.ds) Object.entries(o.ds).forEach(([k,v])=>m.dataset[k]=v); this.restoring=o.scroll||null; return true; } catch(e){ return false; } },
  restoreScroll(){ const sc=this.restoring; if (!sc) return; const go=()=>{ const m=$('#main'); const tw=m && m.querySelector('.tw'); const se=document.scrollingElement||document.documentElement;
      if (se) se.scrollTop=sc.win||0; if (m) m.scrollTop=sc.main||0; if (tw) { tw.scrollTop=sc.twT||0; tw.scrollLeft=sc.twL||0; } };
    requestAnimationFrame(()=>{ go(); setTimeout(()=>{ go(); this.restoring=null; this.save(); }, 120); }); }
};
window.addEventListener('scroll', ()=>uiState.later(), {capture:true, passive:true});
window.addEventListener('pagehide', ()=>uiState.save()); document.addEventListener('visibilitychange', ()=>{ if (document.visibilityState==='hidden') uiState.save(); });
