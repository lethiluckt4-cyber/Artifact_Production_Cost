//# Trạng thái toàn cục: state, view, kỳ đang xem, ô tìm theo màn hình
// ---------- Trạng thái ----------
const state = {
  settings:{company:'KH Thảo Vy', startKy:''},
  items:[], bom:[], opening:{ky:'', rows:{}},
  purchases:[], orders:[], adjustments:[], issues:[], sales:[], costs:{}, plan:[], subs:[], caps:[], cal:[],
};
var dataVer = 0;
let view = 'tongquan', selKy = '', calcCache = null, showAllKy = false, search = '', editRow = null;
let searchBy = {}, searchCur = null; const searchKey = m => [view, view==='nxt'?nxtTab:'', view==='d_adjustments'?cdTab:'', view==='canhbao'?cbTab:'', ...['tab','stab','ptab','ktab','atab'].map(k=>(m&&m.dataset[k])||'')].join('|');

