// ---------- Trạng thái ----------
const state = {
  settings:{company:'Công ty Thiên Hồng', startKy:''},
  items:[], bom:[], opening:{ky:'', rows:{}},
  purchases:[], orders:[], adjustments:[], issues:[], sales:[], costs:{}, plan:[], subs:[], caps:[], cal:[],
};
let view = 'tongquan', selKy = '', calcCache = null, showAllKy = false, search = '', editRow = null;

