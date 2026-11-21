//# Màn hình Tổng hợp năm
// ---- Năm ----
function vNam(m){
  const c=calc(); const y=curYear();
  const rows = Array.from({length:12},(_,i)=>{ const ky=`${y}-${String(i+1).padStart(2,'0')}`; const p=c.periods[ky]; return {ky, slSX:p?p.slSX:0, s154:p?p.sum154:0, ds:p?p.doanhSo:0, lai:p?p.lai:0, ton:p?p.tonCuoi:0, lenh:p?p.orders.length:0, has:!!p}; });
  m.innerHTML = head(`Hiệu quả năm ${y}`, `<button class="btn" id="xl">${IC('xlOut')}Xuất Excel</button>`) + '' +
  table([{t:'Tháng',f:x=>fmtKy(x.ky)},{t:'Số lệnh',n:1,f:x=>x.lenh,sum:1},{t:'SL sản xuất',n:1,d:2,f:x=>x.slSX,sum:1},{t:'Giá trị SX 154',n:1,f:x=>x.s154,sum:1},{t:'Doanh số bán',n:1,f:x=>x.ds,sum:1},{t:'Tổng lãi gộp',n:1,f:x=>x.lai,sum:1},{t:'Biên LN',n:1,f:x=>x.ds?x.lai/x.ds:0,fmt:fmtP},{t:'Tồn cuối kho',n:1,f:x=>x.ton}], rows, {total:true});
  bindKy(); $('#xl').onclick=()=>exportDomTable(m.querySelector('.tw table'), `TongHop_${y}.xlsx`, 'Nam');
}

