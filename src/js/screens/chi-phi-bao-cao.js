// ---- Chi phí ----
function vChiPhi(m){
  const c=calc(); const y=workYear();
  const rows = Array.from({length:12},(_,i)=>{ const ky=`${y}-${String(i+1).padStart(2,'0')}`; const p=c.periods[ky]; const cost=state.costs[ky]||{}; const c627=costSum(cost,'627'); return {ky, p, cost, c621:p?p.sum621:0, c622:costSum(cost,'622'), c627, s154:p?p.sum154:0, slSX:p?p.slSX:0, ds:p?p.doanhSo:0, lai:p?p.lai:0}; });
  m.innerHTML = head(`Chi phí 622 / 627`) + '' +
  table([{t:'Tháng',f:x=>fmtKy(x.ky)},{t:'621 NVL trực tiếp',n:1,f:x=>x.c621,sum:1},...costCols().filter(c=>c.g==='622').map(c=>({t:c.t,n:1,f:x=>num(x.cost[c.k]),sum:1})),{t:'Tổng 622',n:1,f:x=>x.c622,sum:1},{t:'Tỷ lệ 622/NVL',n:1,f:x=>x.c621?x.c622/x.c621:0,fmt:fmtP},...costCols().filter(c=>c.g==='627').map(c=>({t:c.t,n:1,f:x=>num(x.cost[c.k]),sum:1})),{t:'Tổng 627',n:1,f:x=>x.c627,sum:1},{t:'Tỷ lệ 627/NVL',n:1,f:x=>x.c621?x.c627/x.c621:0,fmt:fmtP},{t:'Tổng giá thành 154',n:1,f:x=>x.s154,sum:1},{t:'Chênh lệch phân bổ',n:1,f:x=>x.s154-(x.c621+(x.c621?x.c622:0)+(x.c621?x.c627:0))},{t:'Chưa phân bổ (không có SX)',n:1,f:x=>x.c621?0:x.c622+x.c627}], rows, {total:true});
  bindKy();
}
