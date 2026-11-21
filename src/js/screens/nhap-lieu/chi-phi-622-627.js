// ---- Chi phí nhập ----
// Chỉ tiêu chi phí theo tháng cho trang Chi phí 622/627
function costMonth(ky, CAL){ const c=state.costs[ky]||{}; const pp=(CAL||calc()).periods[ky];
  const nvl = cd => pp ? sum(pp.orders.filter(o=>cd==='TP'?o.cd==='TP':o.cd!=='TP'), o=>sum(o.lines.filter(l=>!l.prod), l=>l.tt)) : 0;
  const kg = pp ? sum(pp.orders.filter(o=>o.maTP==='BTP_BGKT'), o=>o.slTH) : 0; const gas = pp?num(pp.cp.gas):0;
  const n621bt=nvl('BT'), n621tp=nvl('TP'), t622=costSum(c,'622'), t627=costSum(c,'627')+gas; const t621=n621bt+n621tp; const t154=t621+t622+t627;
  return {ky, n621bt, n621tp, t621, t622, t627, gas, kg, d622:kg?t622/kg:0, d627:kg?t627/kg:0, t154, r621:t154?t621/t154:0, r622:t154?t622/t154:0, r627:t154?t627/t154:0, c641:pp?num(pp.chi641):0, un:pp?Math.abs(pp.unalloc622)+Math.abs(pp.unalloc627):0, thu:pp?sum(pp.orders,o=>o.thuHoi||0):0}; }
function costTotals(MR){ const T={}; ['n621bt','n621tp','t621','t622','t627','gas','kg','t154','c641','un','thu'].forEach(k=>T[k]=sum(MR,x=>x[k])); T.d622=T.kg?T.t622/T.kg:0; T.d627=T.kg?T.t627/T.kg:0; T.r621=T.t154?T.t621/T.t154:0; T.r622=T.t154?T.t622/T.t154:0; T.r627=T.t154?T.t627/T.t154:0; return T; }
function vCosts(m){
  const y=workYear(); const CC=costCols(); const c622=CC.filter(c=>c.g==='622'), c627=CC.filter(c=>c.g==='627'); const CAL=calc(); const per=ky=>CAL.periods[ky];
  const th = c => `<th class="n">${esc(c.t)}</th>`; const MR = Array.from({length:12},(_,i)=>costMonth(`${y}-${String(i+1).padStart(2,'0')}`, CAL));   m.innerHTML = head(`Chi phí 622 / 627`, `<button class="btn" id="xl">⬇ Xuất Excel</button><button class="btn" id="paste">📋 Nhập Excel</button><button class="btn" id="cols">⚙ Cột chi phí</button>`) + `
  <div class="tw"><table><thead><tr><th>Tháng</th><th class="n mut">621 / BTP (NVL mua)</th><th class="n mut">621 / TP (bao bì)</th>${c622.map(th).join('')}${c622.length>1?'<th class="n">Tổng 622</th>':''}${c627.map(th).join('')}<th class="n mut">6277 Xuất dùng chung (627)</th><th class="n">Tổng 627</th><th class="n mut">622 đ/kg SX</th><th class="n mut">627 đ/kg SX</th><th class="n mut">Tổng giá thành 154</th><th class="n mut">Thu hồi SP lỗi (giảm 154)</th><th class="n mut">621/154</th><th class="n mut">622/154</th><th class="n mut">627/154</th><th class="n mut">641 Bán hàng</th><th class="n mut">Chưa phân bổ (không SX)</th><th></th></tr></thead><tbody>${MR.map(x=>{ const ky=x.ky; const c=state.costs[ky]||{}; const lk=isLocked(ky); const ed=!lk && editRow===ky;
    const cell = f => ed ? `<td class="ed n" data-ky="${ky}" data-k="${f.k}"><input class="ci n" type="text" inputmode="decimal" data-ky="${ky}" data-k="${f.k}" value="${num(c[f.k])?fmtN(c[f.k]):''}" style="width:100%;min-width:90px;text-align:right"></td>` : `<td class="n" data-row="${ky}">${num(c[f.k])?fmtN(c[f.k]):''}</td>`;
    const N=v=>v?fmtN(v):'', Pc=v=>v?fmtP(v):'';
    return `<tr><td>${fmtKy(ky)}${lk?' 🔒':''}</td><td class="n mut">${N(x.n621bt)}</td><td class="n mut">${N(x.n621tp)}</td>${c622.map(cell).join('')}${c622.length>1?`<td class="n mut">${N(x.t622)}</td>`:''}${c627.map(cell).join('')}<td class="n mut">${N(x.gas)}</td><td class="n mut">${N(x.t627)}</td><td class="n mut">${N(x.d622)}</td><td class="n mut">${N(x.d627)}</td><td class="n mut">${N(x.t154)}</td><td class="n mut">${N(x.thu)}</td><td class="n mut">${Pc(x.r621)}</td><td class="n mut">${Pc(x.r622)}</td><td class="n mut">${Pc(x.r627)}</td><td class="n mut">${N(x.c641)}</td><td class="n mut ${x.un>1?'neg':''}">${x.un>1?fmtN(x.un):''}</td><td class="act">${lk?'🔒':ed?`<button class="btn s p" data-save="${ky}">Lưu</button> <button class="btn s" data-cancel="1">Hủy</button>`:`<button class="btn s" data-edit="${ky}">Sửa</button>`}</td></tr>`; }).join('')}
    ${(()=>{ const T=costTotals(MR); const N=v=>v?fmtN(v):'', Pc=v=>v?fmtP(v):''; return `<tr class="tot"><td>Cả năm</td><td class="n">${N(T.n621bt)}</td><td class="n">${N(T.n621tp)}</td>${c622.map(f=>`<td class="n">${N(sum(MR,x=>num((state.costs[x.ky]||{})[f.k])))}</td>`).join('')}${c622.length>1?`<td class="n">${N(T.t622)}</td>`:''}${c627.map(f=>`<td class="n">${N(sum(MR,x=>num((state.costs[x.ky]||{})[f.k])))}</td>`).join('')}<td class="n">${N(T.gas)}</td><td class="n">${N(T.t627)}</td><td class="n">${N(T.d622)}</td><td class="n">${N(T.d627)}</td><td class="n">${N(T.t154)}</td><td class="n">${N(T.thu)}</td><td class="n">${Pc(T.r621)}</td><td class="n">${Pc(T.r622)}</td><td class="n">${Pc(T.r627)}</td><td class="n">${N(T.c641)}</td><td class="n">${T.un>1?fmtN(T.un):''}</td><td></td></tr>`; })()}</tbody></table></div>
  `;
  bindKy(); $('#paste').onclick=()=>importDialog('costs');
  $('#xl').onclick=()=>{ const R0=v=>round(v||0,0), R4=v=>round(v||0,4); const mk=(x,lab,cv)=>{ const o={'Tháng':lab}; o['621 / BTP (NVL mua)']=R0(x.n621bt); o['621 / TP (bao bì)']=R0(x.n621tp); c622.forEach(f=>o[f.t]=R0(cv(f))); if (c622.length>1) o['Tổng 622']=R0(x.t622); c627.forEach(f=>o[f.t]=R0(cv(f)));
      Object.assign(o, {'6277 Xuất dùng chung (627)':R0(x.gas), 'Tổng 627':R0(x.t627), '622 đ/kg SX':R0(x.d622), '627 đ/kg SX':R0(x.d627), 'Tổng giá thành 154':R0(x.t154), 'Thu hồi SP lỗi (giảm 154)':R0(x.thu||0), '621/154':R4(x.r621), '622/154':R4(x.r622), '627/154':R4(x.r627), '641 Bán hàng':R0(x.c641), 'Chưa phân bổ (không SX)':R0(x.un>1?x.un:0)}); return o; };
    const rows = MR.map(x=>mk(x, x.ky, f=>num((state.costs[x.ky]||{})[f.k]))); const T=costTotals(MR); rows.push(mk(T, 'Cả năm', f=>sum(MR,x=>num((state.costs[x.ky]||{})[f.k]))));
    exportSheet(`ChiPhi_622_627_${y}.xlsx`, 'ChiPhi', rows); };
  curSave = ()=>saveC(editRow);
  const saveC = ky => { const c=state.costs[ky]||(state.costs[ky]={}); m.querySelectorAll(`input.ci[data-ky="${ky}"]`).forEach(inp=>{ c[inp.dataset.k]=num(inp.value); }); editRow=null; changed(); render(); toast('Đã lưu'); };
  const startEdit = ky => guardEdit(()=>{ if (isLocked(ky)) return toast('Kỳ đã khóa'); editRow=ky; render(); const f=$(`input.ci[data-ky="${ky}"]`); if(f){ f.focus(); f.select(); } });
  m.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>startEdit(b.dataset.edit));
  m.querySelectorAll('td[data-row]').forEach(td=>td.ondblclick=()=>startEdit(td.dataset.row));
  m.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>saveC(b.dataset.save));
  m.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>{ editRow=null; render(); });
  m.querySelectorAll('input.ci').forEach(inp=>{ inp.onkeydown=e=>{ if(e.key==='Enter'){e.preventDefault(); saveC(inp.dataset.ky);} else if(e.key==='Escape'){ editRow=null; render(); } }; });
  $('#cols').onclick=()=>guardEdit(()=>costColsDialog());
  const gp=$('#goPB'); if (gp) gp.onclick=e=>{ e.preventDefault(); guardEdit(()=>{ view='thietlap'; m.dataset.tlt='pb'; render(); }); };
}
function costColsDialog(){
  const CC = costCols().map(c=>({...c}));
  const used = k => Object.values(state.costs).some(c=>num(c[k]));
  const draw = () => {
    modal(`<h3>⚙ Cột chi phí 622 / 627</h3><div class="small mut" style="margin-bottom:8px">Cột nhóm <b>622</b> cộng vào chi phí nhân công, nhóm <b>627</b> cộng vào chi phí sản xuất chung. Cột đã có số liệu không xóa được.</div>
    <div class="tw" style="max-height:320px"><table><thead><tr><th>Tên cột</th><th>Nhóm</th><th></th></tr></thead><tbody>${CC.map((c,i)=>`<tr><td><input type="text" data-i="${i}" data-f="t" value="${esc(c.t)}" style="width:220px"></td><td><select data-i="${i}" data-f="g"><option value="622" ${c.g==='622'?'selected':''}>622 Nhân công</option><option value="627" ${c.g==='627'?'selected':''}>627 SX chung</option></select></td><td>${used(c.k)?'<span class="mut small">có số liệu</span>':`<button class="btn s d" data-rm="${i}">Xóa</button>`}</td></tr>`).join('')}</tbody></table></div>
    <div class="bar" style="margin-top:10px"><input type="text" id="ccNew" placeholder="Tên cột mới, VD: Thuê kho" style="width:220px"><select id="ccG"><option value="627">627 SX chung</option><option value="622">622 Nhân công</option></select><button class="btn" id="ccAdd">+ Thêm cột</button></div>
    <div style="text-align:right;margin-top:14px"><button class="btn" id="ccCancel">Hủy</button> <button class="btn p" id="ccOk">Lưu</button></div>`);
    const read = () => $('#modal').querySelectorAll('[data-i]').forEach(el=>{ CC[+el.dataset.i][el.dataset.f]=el.value.trim(); });
    $('#ccAdd').onclick=()=>{ const t=$('#ccNew').value.trim(); if(!t) return toast('Nhập tên cột'); read(); let n=CC.length+1, k; do { k='x'+n++; } while (CC.some(c=>c.k===k)); CC.push({k, t, g:$('#ccG').value}); draw(); };
    $('#modal').querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{ read(); CC.splice(+b.dataset.rm,1); draw(); });
    $('#ccCancel').onclick=closeModal;
    $('#ccOk').onclick=()=>{ read(); if (CC.some(c=>!c.t)) return toast('Tên cột không được trống'); if (!CC.length) return toast('Cần ít nhất một cột'); state.settings.costCols=CC; closeModal(); changed(); render(); toast('Đã lưu cột chi phí'); };
  };
  draw();
}
