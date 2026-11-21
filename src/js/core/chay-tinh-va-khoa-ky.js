function openChungTu(ent, id, back){ const r=(state[ent]||[]).find(x=>x._id===id); if (!r) return toast('Không tìm thấy chứng từ'); closeModal(); gridOpen={ent, id}; editBack=back||null; const v0=view;
  // dựng màn hình nhập liệu chỉ để mở phiếu, rồi trả ngay màn hình đang xem về phía sau phiếu (không nhảy trang)
  view=ED_VIEW[ent]; render(); gridOpen=null; view=v0; render(); }
function edBackNow(){ const fb=editBack; editBack=null; if (fb) fb(); }
function discardEdit(){ ['items','bom','subs','caps','cal','purchases','orders','adjustments','issues','sales','plan'].forEach(e=>{ if (state[e]) state[e] = state[e].filter(r=>!r._new); }); editRow=null; }
let curSave = null;
function guardEdit(next){ if (!editRow) return next();
  modal(`<h3>⚠ Dòng đang sửa chưa được lưu</h3><div>Bạn có thể quên bấm <b>Lưu</b>. Chọn:</div><ul class="tight small mut"><li><b>Lưu rồi tiếp tục</b>: lưu dòng đang sửa (nếu đủ thông tin bắt buộc) rồi chuyển.</li><li><b>Bỏ thay đổi</b>: không lưu – dòng mới sẽ bị xóa, dòng cũ giữ số trước đó.</li><li><b>Ở lại</b>: quay lại để kiểm tra.</li></ul><div style="text-align:right;margin-top:12px"><button class="btn" id="gStay">Ở lại</button> <button class="btn d" id="gDrop">Bỏ thay đổi</button> <button class="btn p" id="gSave">Lưu rồi tiếp tục</button></div>`);
  $('#gStay').onclick=()=>{ closeModal(); };
  $('#gDrop').onclick=()=>{ closeModal(); discardEdit(); next(); };
  $('#gSave').onclick=()=>{ closeModal(); if (curSave) { try { curSave(); } catch(e){ console.error(e); } } if (editRow) { toast('Chưa lưu được – kiểm tra thông tin bắt buộc trên dòng đang sửa', 4000); return; } next(); };
}
window.addEventListener('beforeunload', e=>{ if (editRow) { e.preventDefault(); e.returnValue=''; } });
function changed(){ calcDirty = true; calcCache = null; /* báo cáo luôn tính lại theo số liệu mới nhất */ store.schedule(); const el=$('#calcstat'); if (el) el.innerHTML=calcStatHtml(); }
let busyEl=null;
function showBusy(msg, st){ if(!busyEl){ busyEl=document.createElement('div'); busyEl.className='busy'; document.body.appendChild(busyEl); } busyEl.innerHTML=`<div class="in"><div class="sp"></div><div><b>${esc(msg)}</b></div><div class="st">${esc(st||'')}</div></div>`; busyEl.onkeydown=e=>e.stopPropagation(); }
function hideBusy(){ if(busyEl){ busyEl.remove(); busyEl=null; } }
function runCalcStatus(){ if (!recalcPending) return; recalcPending=false; runCalc(); }
function runCalc(){
  if (editRow) return guardEdit(runCalc);
  const y0 = workYear(), m0 = selKy && !isRange(selKy) && selKy.length===7 ? selKy.slice(5,7) : 'ALL';
  modal(`<h3>▶ Tính giá thành</h3><div class="small mut">Chọn tháng cần tính. Phần mềm tự chạy: (1) <b>đề xuất sản xuất → đưa vào Lệnh sản xuất</b> (lần đầu của tháng), (2) tính giá thành tuần tự từ kỳ bắt đầu (${esc(fmtKy(state.settings.startKy)||'–')}) – bán thành phẩm → bánh gấu kem tươi → thành phẩm, (3) hoàn thiện NXT, (4) đề xuất cân đối NVL nếu tồn âm. Tháng đã chạy đề xuất thì lần sau <b>giữ nguyên Lệnh sản xuất</b> (kể cả phần bạn sửa tay), chỉ tính lại.</div>
  <div class="bar" style="margin-top:12px"><label>Tháng <select id="rcM"><option value="ALL" ${m0==='ALL'?'selected':''}>Cả năm (chỉ tính, không đề xuất)</option>${Array.from({length:12},(_,i)=>{const mm=String(i+1).padStart(2,'0');return `<option value="${mm}" ${mm===m0?'selected':''}>Tháng ${i+1}</option>`;}).join('')}</select></label><span class="pill">Năm làm việc: <b>${y0}</b> (đổi tại Tổng quan)</span></div>
  <div class="bar" style="margin-top:10px" id="rcResetWrap"><label><input type="checkbox" id="rcReset"> <b>Đề xuất lại từ đầu</b> – xóa <b>toàn bộ</b> Lệnh sản xuất và Cân đối NVL <b>từ tháng này trở về sau</b> (lệnh đề xuất, sửa tay, nhập tay, nhập Excel), rồi đề xuất lại tháng này và các tháng sau</label></div>
  <div class="small mut" id="rcState" style="margin-top:4px"></div>
  <div style="text-align:right;margin-top:12px"><button class="btn" id="mc">Hủy</button> <button class="btn p" id="rcGo">Tính</button></div>`);
  const upd = () => { const mm=$('#rcM').value; const k=`${y0}-${mm}`; const w=$('#rcResetWrap'); const st=$('#rcState'); const ri=mm==='ALL'?null:resetInfo(k); const lbl=$('#rcReset').parentElement; if (ri) lbl.title=`Sẽ xóa ${ri.ords} lệnh và ${ri.adj} dòng cân đối NVL`; if (mm==='ALL' || isLocked(k)) { w.style.display='none'; $('#rcReset').checked=false; st.textContent = mm==='ALL' ? '' : '🔒 Tháng đã khóa – chỉ tính lại, không đề xuất.'; } else { w.style.display=''; const en=energyOf(k); const rt=planRate(k); st.textContent = (isProposed(k) ? `Tháng ${+mm}/${y0} đã chạy đề xuất trước đó → lần này giữ nguyên Lệnh sản xuất (trừ khi tick Đề xuất lại từ đầu).` : `Tháng ${+mm}/${y0} chưa chạy đề xuất → phần mềm sẽ tạo lệnh sản xuất từ đề xuất cho các ngày chưa có lệnh.`) + (en.E && rt ? ` Năng lượng ${en.src.toLowerCase()} ${fmtN(en.E)} đ ÷ ${fmtN(rt)} đ/kg = công suất ${fmtN(en.E/rt)} kg.` : ' ⚠ Chưa có ước tính điện + gas (Đề xuất sản xuất, tab 1) – sẽ không đề xuất được.'); } };
  $('#rcM').onchange=upd; upd();
  $('#rcReset').onchange=()=>{ const mm=$('#rcM').value; if (mm==='ALL') return; const ri=resetInfo(`${y0}-${mm}`); const st=$('#rcState'); if ($('#rcReset').checked) st.innerHTML = ri.locked.length ? `<span style="color:var(--bad)">⚠ ${ri.locked.map(fmtKy).join(', ')} đã khóa – mở khóa trước khi đề xuất lại.</span>` : `<span style="color:var(--bad)">⚠ Sẽ xóa <b>${ri.ords}</b> lệnh sản xuất và <b>${ri.adj}</b> dòng cân đối NVL của <b>${ri.months.map(fmtKy).join(', ')}</b>, rồi đề xuất lại các tháng này – không hoàn tác được (nên Sao lưu trước).</span>`; else upd(); };
  $('#mc').onclick=()=>closeModal();
  $('#rcGo').onclick=()=>{ const mm=$('#rcM').value; const reset=$('#rcReset').checked && mm!=='ALL'; closeModal(); selKy = mm==='ALL' ? y0 : `${y0}-${mm}`; runCalcFor({reset}); };
}
// Hoàn tác một lần Tính giá thành: chụp Lệnh SX / Cân đối / Mua hàng trước khi tính (các bước nối tiếp trong bảng kết quả dùng chung ảnh chụp)
const undoShape = () => JSON.stringify({orders:state.orders, adjustments:state.adjustments, purchases:state.purchases, daDeXuat:state.settings.daDeXuat||[]});
function runCalcFor(opt){ opt=opt||{}; if (!opt.chain || !window.__calcUndo) window.__calcUndo = {at:new Date(), snap:undoShape()};
  const kys=periodList(); const target = selKy; const tEnd = isRange(target) ? rangeOf(target).to.slice(0,7) : (target.length===4 ? target+'-12' : target); const upto = kys.filter(k=>k<=tEnd);
  const month = (!isRange(target) && target.length===7) ? target : null;
  showBusy(`Đang tính giá thành ${fmtKy(target)}…`, 'Bước 1/4: đề xuất sản xuất…');
  setTimeout(()=>{ const t0=performance.now(); let c; const log={steps:[]};
    try {
      if (month && !isLocked(month)) {
        const today=todayISO(); { const fut=state.orders.filter(o=>o.nguon==='PM' && o.ngaySX>today && !isLocked(kyOf(o.ngaySX))); if (fut.length) { const ids=new Set(fut.map(o=>o._id)); state.orders=state.orders.filter(o=>!ids.has(o._id)); calcCache=null; log.steps.push({t:'Lệnh sản xuất chỉ đến hôm nay', s:`Đã bỏ ${fmtN(fut.length)} lệnh đề xuất có ngày SX sau ${fmtD(today)} – lệnh chỉ tạo đến ngày tính giá thành; các ngày sau sẽ được đề xuất ở lần tính tới.`}); } }
        let redo=[month];
        if (opt.reset && !(planRate(month)>0 && num(energyOf(month).E)>0)) { log.steps.push({t:'Đề xuất lại từ đầu', s:`Không thực hiện – ${fmtKy(month)} ${noCapWhy(month)}, nên đề xuất lại sẽ không tạo được lệnh nào. Đã giữ nguyên Lệnh sản xuất hiện có.`}); opt={...opt, reset:false}; }
        if (opt.reset) { const ri=resetInfo(month); if (ri.locked.length) { log.steps.push({t:'Đề xuất lại từ đầu', s:`Không thực hiện: ${ri.locked.map(fmtKy).join(', ')} đã khóa – mở khóa trước.`}); redo=null; }
          else { redo=ri.months; const r=resetProposal(month); log.steps.push({t:'Đề xuất lại từ đầu', s:`Đã xóa toàn bộ ${r.ords} lệnh sản xuất và ${r.adj} dòng cân đối NVL từ ${fmtKy(month)} trở về sau (${redo.map(fmtKy).join(', ')}).`}); } }
        calcCache=null; c=calc();
        if (opt.reset && redo) { let tot=0; const per=[]; [...new Set(redo.map(k=>k.slice(0,4)))].forEach(y=>{ calcCache=null; calc(); const pl=buildPlan(y); if (!pl.ok) { log.steps.push({t:'Đề xuất sản xuất', s:pl.msg}); return; } redo.filter(k=>k.startsWith(y)).forEach(k=>{ if (`${k}-01`>today) { per.push(`${fmtKy(k)}: chưa đến`); return; } if (!(pl.months[k]||{}).capKg) { per.push(`${fmtKy(k)}: ${noCapWhy(k, pl.months[k])}`); return; } const r=applyPlanCore(pl, k, false, true); markProposed(k); tot+=r.nNew; per.push(`${fmtKy(k)}: ${r.nNew}`); }); });
          log.applied={nNew:tot}; log.steps.push({t:'Đề xuất sản xuất → Lệnh sản xuất', s:`Đã tạo ${tot} lệnh mới từ đề xuất đến ${fmtD(today)} (${per.join(' · ')}).`}); }
        else if (!isProposed(month)) { const pl=buildPlan(month.slice(0,4));
          if (pl.ok && !(pl.months[month]||{}).capKg) { const nOld=state.orders.filter(o=>kyOf(o.ngaySX)===month).length; log.steps.push({t:'Đề xuất sản xuất', s: nOld ? `Tháng đã có ${fmtN(nOld)} lệnh sản xuất → giữ nguyên.` : `${fmtKy(month)} ${noCapWhy(month, pl.months[month])} → chưa đề xuất được.`, keep:!!nOld}); }
          else if (pl.ok) { const r=applyPlanCore(pl, month, false, true); markProposed(month); log.applied=r; log.steps.push({t:'Đề xuất sản xuất → Lệnh sản xuất', s: r.nNew ? `Đã tạo ${r.nNew} lệnh từ đề xuất cho các ngày sau mốc khóa đến ${fmtD(today)} (ngày SX muộn nhất đã có lệnh ở các tháng trước giữ nguyên).` : `Các ngày đến ${fmtD(today)} đã có lệnh – không tạo thêm.`}); }
          else log.steps.push({t:'Đề xuất sản xuất', s:pl.msg}); }
        else { let r={nNew:0}; try { calcCache=null; const pl=buildPlan(month.slice(0,4)); if (pl.ok && (pl.months[month]||{}).capKg) r=applyPlanCore(pl, month, false, true); } catch(e){ console.error(e); }
          if (r.nNew) { log.applied=r; log.steps.push({t:'Đề xuất sản xuất → Lệnh sản xuất', s:`Đã thêm ${r.nNew} lệnh cho các ngày mới đến ${fmtD(today)}; lệnh đã có (kể cả phần sửa tay) giữ nguyên.`}); }
          else log.steps.push({t:'Đề xuất sản xuất', s:`Tháng đã chạy đề xuất trước đó → giữ nguyên Lệnh sản xuất hiện có (kể cả phần sửa tay); các ngày đến ${fmtD(today)} đã có lệnh. Muốn đề xuất lại: tick "Đề xuất lại từ đầu".`, keep:true}); }
      } else if (month) log.steps.push({t:'Đề xuất sản xuất', s:'Tháng đã khóa – không đề xuất, chỉ tính lại.'});
      showBusy(`Đang tính giá thành ${fmtKy(target)}…`, `Bước 2–3/4: tính giá thành và NXT tuần tự ${upto.length} kỳ (tồn cuối tháng trước → tồn đầu tháng sau)…`);
      calcCache=null; c=calc(); log.steps.push({t:'Tính giá thành & NXT', s:`${c.list.length} kỳ · ${state.orders.length} lệnh (bán thành phẩm → bánh gấu kem tươi → thành phẩm đóng gói)`});
      if (month) { showBusy(`Đang tính giá thành ${fmtKy(target)}…`, 'Bước 4/4: kiểm tra tồn âm và lập đề xuất cân đối NVL…');
        try { const mv=buildMoveProposal(P()); log.mv=mv; log.steps.push({t:'Đề xuất chuyển ngày nhập kho (NVL âm cuối tháng)', s:mv.rows.length?`${mv.rows.length} phiếu mua tháng sau có thể chuyển ngày nhập kho về tháng này (${[...new Set(mv.rows.map(r=>r.ma))].join(', ')}) – làm trước cân đối NVL.`:'Không có phiếu mua nào cần chuyển ngày nhập kho.'}); } catch(e){ console.error(e); }
        try { const a=buildAdjProposal(P()); log.adj=a; log.steps.push({t:'Đề xuất cân đối NVL (tồn âm)', s:(log.mv&&log.mv.rows.length&&a.rows.length)?'Chờ – làm sau khi chuyển ngày nhập kho, phần còn âm mới cân đối.':a.rows.length?`${a.rows.length} dòng, tổng ${fmtQ(sum(a.rows,r=>r.deXuat))} – chờ bạn chọn áp dụng hay tự cân đối tay.`:'Không có NVL tồn âm cần cân đối.'}); } catch(e){ console.error(e); } }
      try { log.plan=planPending(month||target.slice(0,4)); } catch(e){}
    } finally { hideBusy(); }
    if (month && !isLocked(month) && !store.readOnly) store.schedule(); // lưu lệnh sản xuất vừa đề xuất / xóa khi Đề xuất lại (trước đây chỉ nằm trong bộ nhớ → làm mới dữ liệu là mất)
    const ms=Math.round(performance.now()-t0); calcDirty=false; lastCalc={at:new Date(), n:c.list.length, ms}; try { render(); } catch(e){ console.error(e); } showCalcResult(c, ms, log); }, 60);
}
function showCalcResult(c, ms, log){ log=log||{steps:[]};
  const p=P(); if(!p) { toast('Không có dữ liệu để tính'); return; }
  const noPrice = p.nxt.filter(x=>x.xuatSL>0 && !x.gv); const am = p.nxt.filter(x=>x.closeSL<-1e-9); const badOrd = p.orders.filter(o=>o.status!=='Đủ'); const dangDo = (()=>{ if (selKy.length!==7) return false; const t=new Date(); const td=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`; return `${selKy}-${String(daysInMonth(selKy)).padStart(2,'0')}` > td; })(); const noOrd = selKy.length===7 && !p.orders.length && p.sales.length>0;
  const mvN = (log.mv||{rows:[]}).rows.length; const dc = mvN ? 0 : (log.adj||{rows:[]}).rows.length; const np = log.plan||0; const un = Math.abs(p.unalloc622||0)+Math.abs(p.unalloc627||0);
  const ok = () => `<span class="pill ok">Đạt</span>`, bad = s => `<span class="pill bad">${s}</span>`;
  modal(`<h3>✔ Đã tính xong giá thành ${fmtKy(selKy)} <span class="small mut">(${c.list.length} kỳ, ${ms} ms)</span></h3>
  <div class="cards" style="margin:10px 0">
    <div class="card"><div class="l">Lệnh sản xuất</div><div class="v">${p.orders.length}</div><div class="s">TP ${fmtQ(p.slSX)} thùng · BTP ${fmtQ(p.slBTP||0)} kg</div></div>
    <div class="card"><div class="l">621 NVL</div><div class="v">${fmtN(p.sum621)}</div><div class="s">622 ${fmtN(p.sum622)} · 627 ${fmtN(p.sum627)}</div></div>
    <div class="card"><div class="l">Giá trị SX thành phẩm (154 TP)</div><div class="v">${fmtN(sum(p.orders.filter(o=>o.cd==='TP'),o=>o.c154))}</div><div class="s">154 BGKT ${fmtN(sum(p.orders.filter(o=>o.maTP==='BTP_BGKT'),o=>o.c154))}</div></div>
    <div class="card"><div class="l">Tồn cuối kỳ</div><div class="v">${fmtN(p.tonCuoi)}</div><div class="s">${am.length} mã âm</div></div>
  </div>
  <div class="box"><h3>Kiểm tra</h3>
    <div><b>Giá xuất kho:</b> ${noPrice.length ? bad(`${noPrice.length} mã có xuất kho nhưng không có giá vốn`) : ok()}</div>
    <div style="margin-top:6px"><b>Lệnh sản xuất:</b> ${noOrd ? bad('Chưa có lệnh sản xuất trong tháng') : badOrd.length ? bad(`${badOrd.length} lệnh chưa đủ dữ liệu`) : ok()}</div>
    <div style="margin-top:6px"><b>Phân bổ 622/627:</b> ${un>1 ? bad(`còn ${fmtN(un)} chưa phân bổ`) : ok()}</div>
    <div style="margin-top:6px"><b>Tồn kho:</b> ${am.length ? bad(`${am.length} mã tồn cuối âm`) : ok()} ${am.length?`<div class="small mut">${am.slice(0,12).map(x=>`${esc(x.ma)} ${fmtQ(x.closeSL)}`).join('; ')}</div>`:''}</div>
  </div>
  <div class="rsbar" style="display:flex;gap:6px;align-items:center;justify-content:flex-end;flex-wrap:wrap;margin-top:8px">${(()=>{ const ch=!!(window.__calcUndo && window.__calcUndo.snap!==undoShape()); return `<button class="btn" id="rsUndo" style="margin-right:auto" ${ch?'':'disabled'} title="${ch?'Bỏ các lệnh sản xuất vừa tạo / xóa, chuyển ngày nhập kho, cân đối NVL – trả về như trước khi bấm Tính giá thành':'Lần tính này không thay đổi Lệnh sản xuất, Cân đối NVL hay Mua hàng – dữ liệu vẫn như cũ'}">↶ Không lưu</button>`; })()}${(()=>{ if (selKy.length!==7 || isLocked(selKy)) return ''; const n=movedRows(k=>k===selKy).length; return n?`<button class="btn" id="rsUnmv" title="Trả các phiếu đã chuyển ngày nhập kho về như cũ rồi tính lại">↩ Bỏ chuyển kho (${n})</button> `:''; })()}${mvN && selKy.length===7 && !isLocked(selKy)?`<button class="btn ${dangDo?'':'p'}" id="rsMv" title="Chuyển ngày nhập kho rồi tính lại">📅 Chuyển ngày nhập kho</button> ${(log.adj||{rows:[]}).rows.length?'<button class="btn" id="rsSkip" title="Không chuyển ngày nhập kho – cân đối NVL cho toàn bộ phần âm">Bỏ qua – cân đối luôn</button> ':''}`:''}${dc && selKy.length===7 && !isLocked(selKy)?`<button class="btn ${dangDo?'':'p'}" id="rsAdj" title="Áp dụng cân đối NVL rồi tính lại">⚙ Cân đối theo đề xuất</button> `:''}<button class="btn ${noOrd?'p':''}" id="rsGoKH">Đề xuất sản xuất</button> <button class="btn" id="rsGoCD">Cân đối NVL</button> <button class="btn ${log.applied&&log.applied.nNew?'p':''}" id="rsGoLT">Lệnh sản xuất</button> <button class="btn ${(dc||mvN||noOrd)&&!dangDo?'':'p'}" id="mclose">Đóng</button></div>`);
  $('#mclose').onclick=()=>{ closeModal(); }; if ($('#rsUndo')) $('#rsUndo').onclick=()=>{ const u=window.__calcUndo; if (!u) return; confirmBox(`Trả <b>Lệnh sản xuất, Cân đối NVL, Mua hàng</b> về như trước khi bấm Tính giá thành (lúc ${u.at.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})})?<br><span class="small">Các lệnh vừa tạo / xóa, chuyển ngày nhập kho và dòng cân đối vừa áp dụng sẽ bị bỏ.</span>`, ()=>{ const d=JSON.parse(u.snap); state.orders=d.orders; state.adjustments=d.adjustments; state.purchases=d.purchases; state.settings.daDeXuat=d.daDeXuat; window.__calcUndo=null; changed(); closeModal(); render(); toast('Đã trả về như trước khi tính giá thành', 3500); }); }; if ($('#rsSkip')) $('#rsSkip').onclick=()=>{ closeModal(); const pm=pendingAdjMonths(); if (!pm.length) return toast('Không có đề xuất cân đối', 3000); adjDialog(pm, n=>{ toast(`Đã ghi ${n} dòng cân đối NVL – đang tính lại…`); runCalcFor({chain:true}); }); }; if ($('#rsUnmv')) $('#rsUnmv').onclick=()=>{ const ky=selKy; closeModal(); unmoveDialog(movedRows(k=>k===ky), n=>{ toast(`Đã bỏ chuyển kho ${n} phiếu mua – đang tính lại…`); runCalcFor({chain:true}); }); }; if ($('#rsMv')) $('#rsMv').onclick=()=>{ closeModal(); moveDialog(n=>{ toast(`Đã chuyển ngày nhập kho ${n} phiếu mua – đang tính lại…`); runCalcFor({chain:true}); }); }; if ($('#rsAdj')) $('#rsAdj').onclick=()=>{ closeModal(); const pm=pendingAdjMonths(); if (!pm.length) return toast('Không còn đề xuất cân đối', 3000); adjDialog(pm, n=>{ toast(`Đã ghi ${n} dòng cân đối NVL – đang tính lại…`); runCalcFor({chain:true}); }); }; $('#rsGoKH').onclick=()=>{ closeModal(); view='kehoach'; $('#main').dataset.ktab = 'kh'; render(); }; $('#rsGoLT').onclick=()=>{ closeModal(); view='d_orders'; render(); }; $('#rsGoCD').onclick=()=>{ closeModal(); view='d_adjustments'; render(); };
}
function calcStatHtml(){ return (calcDirty ? '<span style="color:#fcd34d">⚠ Dữ liệu đã thay đổi – chưa tính</span><br>' : '') + (lastCalc ? `Tính lần cuối ${lastCalc.at.toLocaleTimeString('vi-VN')} · ${lastCalc.n} kỳ · ${lastCalc.ms} ms` : 'Chưa tính'); }
function lockedList(){ return (state.settings.locked||[]).slice().sort(); }
function isLocked(ky){ if(!ky) return false; const L=state.settings.locked||[]; if (isRange(ky)) { const r=rangeOf(ky); let k=r.from.slice(0,7); const end=r.to.slice(0,7); let g=0; while (k<=end && g++<600) { if (L.includes(k)) return true; k=nextKy(k); } return false; } if (ky.length===4) { const ms=allKys().filter(k=>k.startsWith(ky)); return ms.length>0 && ms.every(k=>L.includes(k)); } return L.includes(ky); }
function lockedSel(){ return isLocked(selKy); }
function lockDialog(){
  const wy=workYear(); const has=new Set(allKys());
  const row = mm => { const k=`${wy}-${mm}`; const lk=isLocked(k); const d=has.has(k); return `<tr><td>Tháng ${+mm}/${wy}</td><td>${d?'có dữ liệu':'<span class="mut">chưa có dữ liệu</span>'}</td><td>${lk?'<span class="pill bad">🔒 Đã khóa</span>':'<span class="pill ok">🔓 Đang mở</span>'}</td><td class="act"><button class="btn s ${lk?'':'p'}" data-tg="${k}">${lk?'Mở khóa':'Khóa'}</button></td></tr>`; };
  modal(`<h3>🔒 Khóa / mở khóa kỳ – năm ${wy}</h3><div class="small mut">Kỳ đã khóa: chỉ xem, không sửa/xóa/nhập thêm chứng từ, lệnh, điều chỉnh; đề xuất SX không cập nhật vào kỳ đó. Mở khóa khi cần điều chỉnh lại. (Đổi năm tại Tổng quan.)</div>
  <div class="tw" style="margin-top:10px;max-height:60vh"><table><thead><tr><th>Kỳ</th><th>Dữ liệu</th><th>Trạng thái</th><th></th></tr></thead><tbody>${Array.from({length:12},(_,i)=>row(String(i+1).padStart(2,'0'))).join('')}</tbody></table></div>
  <div style="text-align:right;margin-top:10px"><button class="btn p" id="mclose">Đóng</button></div>`);
  $('#mclose').onclick=()=>{ closeModal(); render(); };
  document.querySelectorAll('#modal [data-tg]').forEach(b=>b.onclick=()=>{ const k=b.dataset.tg; const lk=isLocked(k); confirmBox(lk?`Mở khóa ${fmtKy(k)}? Dữ liệu kỳ này sẽ sửa được trở lại.`:`Khóa ${fmtKy(k)}?`, ()=>{ toggleLock(k); lockDialog(); toast(lk?`Đã mở khóa ${fmtKy(k)}`:`Đã khóa ${fmtKy(k)}`); }); });
}
function toggleLock(ky){ const L=new Set(state.settings.locked||[]); if (L.has(ky)) L.delete(ky); else L.add(ky); state.settings.locked=[...L]; changed(); }

