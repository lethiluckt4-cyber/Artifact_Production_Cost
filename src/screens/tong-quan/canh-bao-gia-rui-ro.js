//# Ngưỡng lệch giá & rủi ro (dùng ở Tổng quan / Cảnh báo)
// ---- Tổng quan ----
function devCfg(kind){ const d=(state.settings.dev||{})[kind]||{}; return { cb: d.cb!=null ? num(d.cb) : (num(state.settings.devCb)>0 ? num(state.settings.devCb) : 0.10), cao: d.cao!=null ? num(d.cao) : (num(state.settings.devCao)>0 ? num(state.settings.devCao) : 0.20) }; }
function devCb(kind){ return devCfg(kind||'mua').cb; }
function devCao(kind){ return devCfg(kind||'mua').cao; }
function priceDevRows(kind, inK){
  const out=[]; const items=itemMap();
  if (kind==='mua') { const src=state.purchases.filter(r=>!r._new && r.ma && num(r.donGia)>0 && inK(r.ngayNhap)); const acc={}; src.forEach(r=>(acc[r.ma]=acc[r.ma]||[]).push(num(r.donGia)));
    src.forEach(r=>{ const a=acc[r.ma]; if (a.length<2) return; const bq=sum(a)/a.length, gia=num(r.donGia); out.push({ngay:r.ngayNhap, ct:r.hoaDon, doiTac:r.ncc, ma:r.ma, ten:(items[r.ma]||{}).ten||'', gia, bq, cl:gia-bq, tl:bq?(gia-bq)/bq:0}); }); }
  else { const src=state.sales.filter(r=>!r._new && r.ma && num(r.sl)>0 && num(r.doanhSo)>0 && inK(r.ngay)); const acc={}; src.forEach(r=>(acc[r.ma]=acc[r.ma]||[]).push(num(r.doanhSo)/num(r.sl)));
    src.forEach(r=>{ const a=acc[r.ma]; if (a.length<2) return; const bq=sum(a)/a.length, gia=num(r.doanhSo)/num(r.sl); out.push({ngay:r.ngay, ct:'', doiTac:'', ma:r.ma, ten:(items[r.ma]||{}).ten||'', gia, bq, cl:gia-bq, tl:bq?(gia-bq)/bq:0}); }); }
  return out;
}
const RISK0 = [
  {k:'giamua', t:'Số dòng mua có đơn giá lệch bất thường so với bình quân tháng', dir:'≥', cb:1, cao:5, fmt:'n0', f:p=>priceDevRows('mua', d=>kyOf(d)===p.ky).filter(x=>Math.abs(x.tl)>=devCb('mua')).length},
  {k:'giaban', t:'Số dòng bán có đơn giá lệch bất thường so với bình quân tháng', dir:'≥', cb:1, cao:5, fmt:'n0', f:p=>priceDevRows('ban', d=>kyOf(d)===p.ky).filter(x=>Math.abs(x.tl)>=devCb('ban')).length},
  {k:'sxban', t:'Tỷ lệ SL sản xuất / SL bán (thành phẩm)', dir:'≥', cb:1.15, cao:1.30, fmt:'p', f:p=>{ const ban=sum(p.sales,s=>num(s.sl)); return ban?p.slSX/ban:null; }},
  {k:'tonTP', t:'Số ngày tồn thành phẩm (tồn cuối ÷ bán BQ ngày)', dir:'≥', cb:45, cao:60, fmt:'n1', f:p=>{ const tp=p.nxt.filter(x=>x.nhom==='Thành phẩm'); const ton=sum(tp,x=>Math.max(0,x.closeSL)), bq=sum(tp,x=>x.bq||0); return bq?ton/bq:(ton>0?999:null); }},
  {k:'cp627', t:'Chi phí 622 + 627 / đơn vị sản xuất (đ)', dir:'≥', cb:3500, cao:5000, fmt:'n0', f:p=>p.slSX?(p.sum622+p.sum627)/p.slSX:null},
  {k:'gvdt', t:'Tỷ lệ giá vốn / doanh thu', dir:'≥', cb:0.90, cao:1.00, fmt:'p', f:p=>p.doanhSo?(p.doanhSo-p.lai)/p.doanhSo:null},
  {k:'banlo', t:'Số dòng bán dưới giá vốn', dir:'≥', cb:1, cao:5, fmt:'n0', f:p=>p.sales.filter(s=>s.gv>0 && s.gb<s.gv).length},
  {k:'tpam', t:'Số mã thành phẩm âm kho cuối tháng', dir:'≥', cb:1, cao:1, fmt:'n0', f:p=>p.nxt.filter(x=>x.nhom==='Thành phẩm' && x.closeSL<0).length},
  {k:'cpchua', t:'CP 622 + 627 chưa phân bổ vào giá thành (đ)', dir:'≥', cb:1, cao:1, fmt:'n0', f:p=>p.sum621?0:(costSum(p.cost,'622')+costSum(p.cost,'627')+(p.c627chung||0))},
  {k:'maam', t:'Số mã hàng âm kho cuối tháng', dir:'≥', cb:1, cao:1, fmt:'n0', f:p=>p.nxt.filter(x=>x.closeSL<0).length},
  {k:'nvlam', t:'Số mã NVL âm kho cuối tháng', dir:'≥', cb:1, cao:10, fmt:'n0', f:p=>p.nxt.filter(x=>x.nhom!=='Thành phẩm' && x.closeSL<0).length},
  {k:'thieu622', t:'Tháng có sản xuất nhưng chưa nhập CP nhân công 622', dir:'', fmt:'flag', f:p=>p.slSX>0 && !costSum(p.cost,'622')},
];
function riskHidden(){ return state.settings.riskHide||[]; }
function riskCfg(all){ const s=state.settings.risk||{}; const hide=all?[]:riskHidden(); return RISK0.filter(r=>!hide.includes(r.k)).map(r=>({...r, cb: s[r.k]&&s[r.k].cb!=null?num(s[r.k].cb):r.cb, cao: s[r.k]&&s[r.k].cao!=null?num(s[r.k].cao):r.cao})); }
function riskTable(){
  const y=curYear(); const c=calcLive(); const kys=Array.from({length:12},(_,i)=>`${y}-${String(i+1).padStart(2,'0')}`); const has=new Set(allKys());
  const fv=(r,v)=> v==null?'–': r.fmt==='flag' ? (v?'Thiếu':'') : r.fmt==='p'?fmtP(v): r.fmt==='n1'?fmtN(v,1):fmtN(v,0);
  const lvl=(r,v)=>{ if (v==null||r.fmt==='flag') return v===true?'cao':''; if (r.cao!=null && v>=r.cao) return 'cao'; if (r.cb!=null && v>=r.cb) return 'cb'; return ''; };
  const rows=riskCfg().map(r=>{ const cells=kys.map(k=>{ const p=c.periods[k]; const active = has.has(k) || (p && (p.orders.length||p.sales.length)); if (!p || !active) return {v:null}; let v=null; try { v=r.f(p); } catch(e){} return {v}; }); return {r, cells}; });
  const inp=(r,f)=> r.fmt==='flag' ? '' : (r.fmt==='p'?fmtN(r[f]*100,0)+'%':fmtN(r[f],0));
  return `<div class="box"><h3>Chỉ tiêu đánh giá rủi ro theo tháng – năm ${y} <span class="small mut" style="font-weight:400">(vàng nhạt = cảnh báo · đỏ = rủi ro cao · đổi ngưỡng ở tab Ngưỡng cảnh báo)</span></h3>
  <div class="tw"><table class="risk"><thead><tr><th style="min-width:260px">Chỉ tiêu</th><th>Chiều</th><th class="n">Cảnh báo</th><th class="n">Rủi ro cao</th>${kys.map((k,i)=>`<th class="n">T${i+1}</th>`).join('')}</tr></thead><tbody>
  ${rows.map(({r,cells})=>`<tr><td style="white-space:normal">${esc(r.t)}</td><td style="text-align:center">${r.dir}</td><td class="n">${inp(r,'cb')}</td><td class="n">${inp(r,'cao')}</td>${cells.map(({v})=>{ const L=lvl(r,v); return `<td class="n" style="${L==='cao'?'background:#fecaca;color:#991b1b;font-weight:600':L==='cb'?'background:#fef3c7;color:#92400e':''}">${fv(r,v)}</td>`; }).join('')}</tr>`).join('')}
  </tbody></table></div></div>`;
}
function bindRisk(m){ return; m.querySelectorAll('input[data-rk]').forEach(inp=>{ inp.onchange=()=>{ const r=RISK0.find(x=>x.k===inp.dataset.rk); let v=num(String(inp.value).replace('%','')); if (r.fmt==='p') v=v/100; state.settings.risk=state.settings.risk||{}; state.settings.risk[r.k]=state.settings.risk[r.k]||{}; state.settings.risk[r.k][inp.dataset.rf]=v; store.schedule(); render(); toast('Đã lưu ngưỡng'); }; }); }

