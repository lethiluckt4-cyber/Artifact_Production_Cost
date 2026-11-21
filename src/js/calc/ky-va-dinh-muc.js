// ---------- Tính toán ----------
function itemMap(){ const m={}; state.items.forEach(i=>m[i.ma]=i); return m; }
function allKys(){
  const s = new Set();
  const add = v => { const k=kyOf(v); if (k && /^\d{4}-\d{2}$/.test(k)) s.add(k); };
  state.purchases.forEach(r=>add(r.ngayNhap)); state.sales.forEach(r=>add(r.ngay)); state.plan.forEach(r=>add(r.ngaySX)); state.orders.forEach(r=>{add(r.ngayXuatNVL); add(r.ngaySX);}); state.issues.forEach(r=>add(r.ngay));
  Object.keys(state.costs).forEach(k=>add(k));
  if (state.settings.startKy) s.add(state.settings.startKy);
  return [...s].sort();
}
function periodList(){
  let ks = allKys();
  if (!ks.length) { const y=workYear(); if (isRange(selKy)) { const r=rangeOf(selKy); ks=[r.from.slice(0,7), r.to.slice(0,7)]; } else if (selKy && selKy.length===7) ks=[selKy]; else ks=[`${y}-01`,`${y}-12`]; if (state.settings.startKy && state.settings.startKy<ks[0]) ks.unshift(state.settings.startKy); }
  let start = state.settings.startKy || ks[0]; const selEnd = isRange(selKy) ? rangeOf(selKy).to.slice(0,7) : (selKy||''); const end = ks[ks.length-1] > selEnd ? ks[ks.length-1] : (selEnd || ks[ks.length-1]);
  const out=[]; let k=start; let guard=0; while (k <= end && guard++<600) { out.push(k); k=nextKy(k); }
  return out;
}
const isRange = k => typeof k==='string' && k.startsWith('R:');
const rangeOf = k => { const [,a,b]=k.split(':'); return {from:a, to:b}; };
function selHas(d){ if(!d) return false; if (isRange(selKy)) { const r=rangeOf(selKy); return d>=r.from && d<=r.to; } return selKy.length===4 ? d.startsWith(selKy) : d.startsWith(selKy); }
function selKyHas(ky){ if(!ky) return false; if (isRange(selKy)) { const r=rangeOf(selKy); return ky>=r.from.slice(0,7) && ky<=r.to.slice(0,7); } return selKy.length===4 ? ky.startsWith(selKy) : ky===selKy; }
function periodEnd(){ if (!selKy) return '9999-12-31'; if (isRange(selKy)) return rangeOf(selKy).to; return selKy.length===4 ? `${selKy}-12-31` : `${selKy}-${String(daysInMonth(selKy)).padStart(2,'0')}`; }
function bomFor(maTP, loai, date){ const d = date || periodEnd(); return state.bom.filter(b=>b.maTP===maTP && (b.loai||'DM')===(loai||'DM') && (!b.tuNgay || d>=b.tuNgay) && (!b.denNgay || d<=b.denNgay)); }
function expandBom(maTP, loai, ngaySX){
  // trả về các dòng NVL sau khi áp dụng thay thế (giống công thức Gia thanh)
  const lines=[]; const rows = bomFor(maTP, loai, ngaySX);
  rows.forEach(b=>{
    const cand = state.subs.filter(s=>s.maNVL===b.maNVL && s.maThayThe && s.tuNgay && ngaySX>=s.tuNgay && ngaySX<=(s.denNgay||'9999-12-31') && (!s.maTP || s.maTP===maTP));
    const rule = cand.find(s=>s.maTP===maTP) || cand[0] || null;
    const src = rule || b;
    let rr = num(src.tyLe); if (rr>1) rr = rr/100; if (!rr) rr = 1;
    const tu = src.tuNgay, den = src.denNgay || '9999-12-31';
    const act = src.maThayThe && tu && ngaySX >= tu && ngaySX <= den;
    b = Object.assign({}, b, {maThayThe: src.maThayThe, tyLe: src.tyLe});
    if (!act) lines.push({maVT:b.maNVL, dm:num(b.slNVL), haoHut:num(b.haoHut), bom:b});
    else if (rr>=1) lines.push({maVT:b.maThayThe, dm:num(b.slNVL), haoHut:num(b.haoHut), bom:b, thayThe:true});
    else { lines.push({maVT:b.maNVL, dm:num(b.slNVL)*(1-rr), haoHut:num(b.haoHut), bom:b}); lines.push({maVT:b.maThayThe, dm:num(b.slNVL)*rr, haoHut:num(b.haoHut), bom:b, thayThe:true}); }
  });
  return {lines, slTP: rows.length ? num(rows[0].slTP) : 0, lanNgay: rows.length ? num(rows[0].lanNgay) : 0};
}
