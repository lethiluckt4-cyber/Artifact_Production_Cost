//# Màn hình Chi phí 622 / 627
// ---- Chi phí nhập ----
function vCosts(m){
  const y=curYear(); const CC=costCols(); const c622=CC.filter(c=>c.g==='622'), c627=CC.filter(c=>c.g==='627'); const CAL=calc(); const per=ky=>CAL.periods[ky];
  const th = c => `<th class="n">${esc(c.t)}</th>`;
  const KYS=Array.from({length:12},(_,i)=>`${y}-${String(i+1).padStart(2,'0')}`); const pp=ky=>per(ky); const cst=ky=>state.costs[ky]||{};
  const inCell=(ky,f)=>`<td class="ed n" data-ky="${ky}" data-k="${f.k}"><input class="ci n" type="text" inputmode="decimal" data-ky="${ky}" data-k="${f.k}" value="${num(cst(ky)[f.k])?fmtNi(cst(ky)[f.k]):''}" style="width:100%;min-width:90px;text-align:right"></td>`;
  const sum627=ky=>costSum(cst(ky),'627')+(pp(ky)?pp(ky).c627chung:0);
  const nfmt=v=>v?fmtN(v):''; const pc=(a,b)=>b?fmtP(a/b):'–';
  const COLS=[
    {t:'621 NVL (lệnh SX)', mut:1, v:ky=>nfmt(pp(ky)?pp(ky).sum621:0), tot:()=>nfmt(sum(KYS,k=>pp(k)?pp(k).sum621:0))},
    ...c622.map(f=>({t:f.t, f, ed:1, tot:()=>nfmt(sum(KYS,k=>num(cst(k)[f.k])))})),
    ...(c622.length>1?[{t:'Tổng 622', mut:1, v:ky=>fmtN(costSum(cst(ky),'622')), tot:()=>fmtN(sum(KYS,k=>costSum(cst(k),'622')))}]:[]),
    ...c627.map(f=>({t:f.t, f, ed:1, tot:()=>nfmt(sum(KYS,k=>num(cst(k)[f.k])))})),
    {t:'627 từ xuất NVL dùng chung', mut:1, v:ky=>nfmt(pp(ky)?pp(ky).c627chung:0), tot:()=>nfmt(sum(KYS,k=>pp(k)?pp(k).c627chung:0))},
    {t:'Tổng 627', mut:1, v:ky=>fmtN(sum627(ky)), tot:()=>fmtN(sum(KYS,sum627))},
    {t:'622 đ/kg SX', mut:1, v:ky=>{ const q=pp(ky); return q&&q.rates.k622?fmtN(q.rates.k622):''; }, tot:()=>{ const sl=sum(KYS,k=>pp(k)?pp(k).slSX:0); return sl?nfmt(sum(KYS,k=>costSum(cst(k),'622'))/sl):''; }},
    {t:'627 đ/kg SX', mut:1, v:ky=>{ const q=pp(ky); return q&&q.rates.k627?fmtN(q.rates.k627):''; }, tot:()=>{ const sl=sum(KYS,k=>pp(k)?pp(k).slSX:0); return sl?nfmt(sum(KYS,sum627)/sl):''; }},
    {t:'Tổng giá thành 154', mut:1, v:ky=>pp(ky)?fmtN(pp(ky).sum154):'', tot:()=>fmtN(sum(KYS,k=>pp(k)?pp(k).sum154:0))},
    ...[['621 / 154','sum621'],['622 / 154','sum622'],['627 / 154','sum627']].map(([t0,fld])=>({t:t0, mut:1, v:ky=>{ const q=pp(ky); return q&&q.sum154?fmtP(q[fld]/q.sum154):'–'; }, tot:()=>{ const s154=sum(KYS,k=>pp(k)?pp(k).sum154:0); return s154?fmtP(sum(KYS,k=>pp(k)?pp(k)[fld]:0)/s154):'–'; }})),
    {t:'641 xuất NVL thử nghiệm', mut:1, v:ky=>nfmt(pp(ky)?pp(ky).c641:0), tot:()=>nfmt(sum(KYS,k=>pp(k)?pp(k).c641:0))},
    {t:'Chưa phân bổ (không SX)', mut:1, neg:1, v:ky=>{ const q=pp(ky); const s621=q?q.sum621:0; return (!s621 && (costSum(cst(ky),'622')+sum627(ky))) ? fmtN(costSum(cst(ky),'622')+sum627(ky)) : ''; }, tot:()=>nfmt(sum(KYS,k=>{ const q=pp(k); return (q&&q.sum621)?0:(costSum(cst(k),'622')+sum627(k)); }))},
  ];
  m.innerHTML = head(`Nhập chi phí 622 / 627 năm ${y}`, `<button class="btn" id="xlc">${IC('xlOut')}Xuất Excel</button><button class="btn" id="paste">${IC('xlIn')}Nhập Excel</button><button class="btn" id="cols">⚙ Cột chi phí</button>`) + `
  <div class="tw"><table><thead><tr><th>Tháng</th>${COLS.map(c=>`<th class="n${c.mut?' mut':''}">${esc(c.t)}</th>`).join('')}<th></th></tr></thead><tbody>${KYS.map(ky=>{ const lk=isLocked(ky); const ed=!lk && editRow===ky;
    return `<tr><td>${fmtKy(ky)}${lk?' 🔒':''}</td>${COLS.map(c=> c.ed ? (ed ? inCell(ky,c.f) : `<td class="n" data-row="${ky}">${num(cst(ky)[c.f.k])?fmtN(cst(ky)[c.f.k]):''}</td>`) : `<td class="n mut ${c.neg&&c.v(ky)?'neg':''}">${c.v(ky)}</td>`).join('')}<td class="act">${lk?'🔒': ed ? `<button class="btn s io p" data-save="${ky}" title="Lưu" aria-label="Lưu">${IC('save')}</button> <button class="btn s io d" data-cancel="${ky}" title="Xóa" aria-label="Xóa">${IC('trash')}</button>` : `<button class="btn s io" data-edit="${ky}" title="Sửa" aria-label="Sửa">${IC('edit')}</button>`}</td></tr>`; }).join('')}<tr class="tot"><td>Tổng năm ${y}</td>${COLS.map(c=>`<td class="n">${c.tot()}</td>`).join('')}<td></td></tr></tbody></table></div>`;
  bindKy(); $('#paste').onclick=()=>importDialog('costs');
  curSave = ()=>saveC(editRow);
  const saveC = ky => { const c=state.costs[ky]||(state.costs[ky]={}); m.querySelectorAll(`input.ci[data-ky="${ky}"]`).forEach(inp=>{ c[inp.dataset.k]=num(inp.value); }); editRow=null; changed(); render(); toast('Đã lưu'); };
  const startEdit = ky => guardEdit(()=>{ if (isLocked(ky)) return toast('Kỳ đã khóa'); editRow=ky; render(); const f=$(`input.ci[data-ky="${ky}"]`); if(f){ f.focus(); f.select(); } });
  m.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>startEdit(b.dataset.edit));
  m.querySelectorAll('td[data-row]').forEach(td=>td.ondblclick=()=>startEdit(td.dataset.row));
  m.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>saveC(b.dataset.save));
  m.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>{ const ky=b.dataset.cancel; editRow=null; if (!Object.values(state.costs[ky]||{}).some(v=>num(v))) return render(); confirmBox(`Xóa toàn bộ chi phí 622/627 đã nhập của tháng ${fmtKy(ky)}?`, ()=>{ delete state.costs[ky]; changed(); render(); toast('Đã xóa chi phí tháng '+fmtKy(ky)); }); });
  m.querySelectorAll('input.ci').forEach(inp=>{ inp.onkeydown=e=>{ if(e.key==='Enter'){e.preventDefault(); focusNext(inp);} else if(e.key==='Escape'){ editRow=null; render(); } else if(e.key==='Tab'){ } }; });
  $('#cols').onclick=()=>guardEdit(()=>costColsDialog());
  $('#xlc').onclick=()=>{ if (typeof XLSX==='undefined') return toast('Thư viện Excel chưa tải được'); const tb=m.querySelector('.tw table'); if(!tb) return;
    const ths=[...tb.querySelectorAll('thead th')]; const keep=ths.map((th,i)=>i).filter(i=>!ths[i].classList.contains('actth') && ths[i].textContent.replace('▼','').trim()!=='' );
    const trs=[...tb.querySelectorAll('tbody tr')]; const body=trs.map(tr=>keep.map(i=>(tr.children[i]?tr.children[i].textContent:'').trim()));
    const isPct=keep.map((_,j)=>body.some(r=>/%$/.test(r[j])) && body.every(r=>r[j]===''||r[j]==='–'||/%$/.test(r[j])));
    const head=keep.map((i,j)=>ths[i].textContent.replace('▼','').trim()+(isPct[j]?' (%)':''));
    const aoa=[head, ...body.map(r=>r.map((v,j)=>{ if (j===0 || v===''||v==='–') return j===0?v.replace(/\s*🔒/,''):''; const n=cellNum(v); return n==null?v:n; }))];
    const ws=XLSX.utils.aoa_to_sheet(aoa); ws['!cols']=head.map(h=>({wch:Math.max(12,Math.min(26,h.length+2))}));
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'ChiPhi622_627'); saveWb(wb, `ChiPhi_622_627_${y}.xlsx`); };
}
function costColsDialog(){
  const CC = costCols().map(c=>({...c}));
  const used = k => Object.values(state.costs).some(c=>num(c[k]));
  const draw = () => {
    modal(`<h3>⚙ Cột chi phí 622 / 627</h3><div class="small mut" style="margin-bottom:8px">Cột nhóm <b>622</b> cộng vào chi phí nhân công, nhóm <b>627</b> cộng vào chi phí sản xuất chung. Cột đã có số liệu không xóa được.</div>
    <div class="tw" style="max-height:320px"><table><thead><tr><th>Tên cột</th><th>Nhóm</th><th></th></tr></thead><tbody>${CC.map((c,i)=>`<tr><td><input type="text" data-i="${i}" data-f="t" value="${esc(c.t)}" style="width:220px"></td><td><select data-i="${i}" data-f="g"><option value="622" ${c.g==='622'?'selected':''}>622 Nhân công</option><option value="627" ${c.g==='627'?'selected':''}>627 SX chung</option></select></td><td>${used(c.k)?'<span class="mut small">có số liệu</span>':`<button class="btn s io d" data-rm="${i}" title="Xóa" aria-label="Xóa">${IC('trash')}</button>`}</td></tr>`).join('')}</tbody></table></div>
    <div class="bar" style="margin-top:10px"><input type="text" id="ccNew" placeholder="Tên cột mới, VD: Thuê kho" style="width:220px"><select id="ccG"><option value="627">627 SX chung</option><option value="622">622 Nhân công</option></select><button class="btn p" id="ccAdd">${IC('plus')}Thêm cột</button></div>
    <div style="text-align:right;margin-top:14px"><button class="btn" id="ccCancel">Hủy</button> <button class="btn p" id="ccOk">Lưu</button></div>`);
    const read = () => $('#modal').querySelectorAll('[data-i]').forEach(el=>{ CC[+el.dataset.i][el.dataset.f]=el.value.trim(); });
    $('#ccAdd').onclick=()=>{ const t=$('#ccNew').value.trim(); if(!t) return toast('Nhập tên cột'); read(); let n=CC.length+1, k; do { k='x'+n++; } while (CC.some(c=>c.k===k)); CC.push({k, t, g:$('#ccG').value}); draw(); };
    $('#modal').querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{ read(); CC.splice(+b.dataset.rm,1); draw(); });
    $('#ccCancel').onclick=closeModal;
    $('#ccOk').onclick=()=>{ read(); if (CC.some(c=>!c.t)) return toast('Tên cột không được trống'); if (!CC.length) return toast('Cần ít nhất một cột'); state.settings.costCols=CC; closeModal(); changed(); render(); toast('Đã lưu cột chi phí'); };
  };
  draw();
}
