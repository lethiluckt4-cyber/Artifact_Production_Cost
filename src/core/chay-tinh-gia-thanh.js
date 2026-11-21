//# Chạy tính giá thành (runCalc/runCalcFor), hộp kết quả, khóa kỳ
let lastCalc = null, recalcPending = false, calcDirty = false;
function discardEdit(){ ['items','bom','subs','caps','purchases','orders','adjustments','issues','sales','plan','cal'].forEach(e=>{ if (state[e]) state[e] = state[e].filter(r=>!r._new); }); editRow=null; }
let curSave = null;
function guardEdit(next){ if (!editRow) return next();
  modal(`<h3>⚠ Dòng đang sửa chưa được lưu</h3><div>Bạn có thể quên bấm <b>Lưu</b>. Chọn:</div><ul class="tight small mut"><li><b>Lưu rồi tiếp tục</b>: lưu dòng đang sửa (nếu đủ thông tin bắt buộc) rồi chuyển.</li><li><b>Bỏ thay đổi</b>: không lưu – dòng mới sẽ bị xóa, dòng cũ giữ số trước đó.</li><li><b>Ở lại</b>: quay lại để kiểm tra.</li></ul><div style="text-align:right;margin-top:12px"><button class="btn" id="gStay">Ở lại</button> <button class="btn d" id="gDrop">Bỏ thay đổi</button> <button class="btn p" id="gSave">Lưu rồi tiếp tục</button></div>`);
  $('#gStay').onclick=()=>{ closeModal(); };
  $('#gDrop').onclick=()=>{ closeModal(); discardEdit(); next(); };
  $('#gSave').onclick=()=>{ closeModal(); if (curSave) { try { curSave(); } catch(e){ console.error(e); } } if (editRow) { toast('Chưa lưu được – kiểm tra thông tin bắt buộc trên dòng đang sửa', 4000); return; } next(); };
}
window.addEventListener('beforeunload', e=>{ if (editRow || store.err || store.saving || store.pending) { e.preventDefault(); e.returnValue=''; } }); // còn dữ liệu chưa lưu được → hỏi trước khi tải lại / đóng
function changed(){ calcDirty = true; dataVer++; store.schedule(); const el=$('#calcstat'); if (el) el.innerHTML=calcStatHtml(); }
let busyEl=null;
function showBusy(msg, st){ if(!busyEl){ busyEl=document.createElement('div'); busyEl.className='busy'; document.body.appendChild(busyEl); } busyEl.innerHTML=`<div class="in"><div class="sp"></div><div><b>${esc(msg)}</b></div><div class="st">${esc(st||'')}</div></div>`; busyEl.onkeydown=e=>e.stopPropagation(); }
function hideBusy(){ if(busyEl){ busyEl.remove(); busyEl=null; } }
function runCalcStatus(){ if (!recalcPending) return; recalcPending=false; runCalc(); }
function runCalc(){
  if (editRow) return guardEdit(runCalc);
  const y0 = curYear(), m0 = selKy && !isRange(selKy) && selKy.length===7 ? selKy.slice(5,7) : 'ALL';
  modal(`<h3>▶ Tính giá thành</h3><div class="small mut">Chọn kỳ cần tính. Phần mềm chạy tuần tự từng tháng từ kỳ bắt đầu (${esc(fmtKy(state.settings.startKy)||'–')}) đến kỳ đã chọn, kiểm tra giá xuất kho, rồi hiển thị kết quả của kỳ đó.</div>
  <div class="bar" style="margin-top:12px"><label>Tháng <select id="rcM"><option value="ALL" ${m0==='ALL'?'selected':''}>Cả năm (từng tháng)</option>${Array.from({length:12},(_,i)=>{const mm=String(i+1).padStart(2,'0');return `<option value="${mm}" ${mm===m0?'selected':''}>Tháng ${i+1}</option>`;}).join('')}</select></label><span class="pill">Năm làm việc: <b>${y0}</b> (đổi tại Tổng quan)</span></div>
  <div class="bar" style="margin-top:10px"><label id="rcResetWrap"><input type="checkbox" id="rcReset"> <b>Đề xuất lại từ đầu</b> – từ tháng này trở về sau: xóa mẻ PM đã xếp, sửa tay mẻ, lệnh thêm (PM hoặc thêm tay) và toàn bộ Cân đối NVL (kể cả nhập tay), rồi chạy lại đề xuất</label></div>
  <div style="text-align:right;margin-top:12px"><button class="btn" id="mc">Hủy</button> <button class="btn p" id="rcGo">Tính</button></div>`);
  const updReset = () => { const mm=$('#rcM').value; const w=$('#rcResetWrap'); if (mm==='ALL' || isLocked(`${y0}-${mm}`)) { w.style.display='none'; $('#rcReset').checked=false; } else w.style.display=''; }; $('#rcM').onchange=updReset; updReset();
  $('#mc').onclick=()=>closeModal();
  $('#rcGo').onclick=()=>{ const mm=$('#rcM').value, yy=y0; const reset=$('#rcReset').checked && mm!=='ALL'; closeModal(); selKy = mm==='ALL' ? yy : `${yy}-${mm}`; if (reset) { const r=undoCore(selKy); toast(`Từ ${fmtKy(selKy)} trở về sau: về lệnh kế hoạch gốc (${r.ords} lệnh), xóa ${r.created} lệnh thêm, ${r.adj} dòng cân đối NVL – tính lần lượt các tháng sau`, 7000); changed(); } runCalcFor(); };
}
function runCalcFor(){
  const kys=periodList(); const target = selKy; const tEnd = isRange(target) ? rangeOf(target).to.slice(0,7) : (target.length===4 ? target+'-12' : target); const upto = kys.filter(k=>k<=tEnd);
  const month = (!isRange(target) && target.length===7) ? target : null;
  showBusy(`Đang tính giá thành ${fmtKy(target)}…`, `Bước 1/3: chạy tuần tự ${upto.length} kỳ từ ${upto[0]?fmtKy(upto[0]):''} đến ${upto.length?fmtKy(upto[upto.length-1]):''} (tồn cuối tháng trước → tồn đầu tháng sau). Vui lòng chờ, không thao tác.`);
  setTimeout(()=>{ const t0=performance.now(); let c; const log={steps:[]};
    try {
      calcCache=null; c=calc(); log.steps.push({t:'Tính giá thành theo lệnh sản xuất', s:`${c.list.length} kỳ`});
      if (month && !isLocked(month)) {
        if (proposalDirty()) { log.steps.push({t:'Đề xuất sản xuất', s:'Kỳ này đã áp dụng đề xuất / có sửa tay lệnh SX thực tế trước đó → giữ nguyên lệnh hiện có, không đề xuất lại (muốn đề xuất lại: tick Đề xuất lại từ đầu khi Tính giá thành).', keep:true}); }
        else { const p=P(); const d=buildProposal(p); const tang=sum(d.chotRows.filter(x=>x.dc>0),x=>x.dc), giam=-sum(d.chotRows.filter(x=>x.dc<0),x=>x.dc);
          if (tang>0||giam>0) { showBusy(`Đang tính giá thành ${fmtKy(target)}…`, 'Bước 2/3: áp dụng đề xuất tăng/giảm mẻ vào Lệnh sản xuất thực tế và tính lại…'); const r=applyProposalCore(d, nextPlanDate()); log.applied={tang,giam,...r}; calcCache=null; c=calc(); log.steps.push({t:'Đề xuất sản xuất → Lệnh SX thực tế', s:`Tăng ${fmtQ(tang)} mẻ / giảm ${fmtQ(giam)} mẻ: ${r.nNew} lệnh tạo mới hoặc tăng, ${r.nCut} lệnh giảm. Đã tính lại giá thành & NXT theo lệnh thực tế.`}); }
          else log.steps.push({t:'Đề xuất sản xuất', s:'Không có đề xuất tăng/giảm mẻ – giữ lệnh kế hoạch.'}); }
        showBusy(`Đang tính giá thành ${fmtKy(target)}…`, 'Bước 3/3: kiểm tra tồn âm và lập đề xuất điều chỉnh NVL…');
        try { const a=buildAdjProposal(P()); log.adj=a; log.steps.push({t:'Đề xuất điều chỉnh NVL (tồn âm)', s:a.rows.length?`${a.rows.length} dòng, tổng ${fmtQ(sum(a.rows,r=>r.deXuat))} – chờ bạn xem và áp dụng.`:'Không còn tồn âm cần điều chỉnh.'}); } catch(e){ console.error(e); }
      }
    } finally { hideBusy(); }
    const ms=Math.round(performance.now()-t0); calcDirty=false; lastCalc={at:new Date(), n:c.list.length, ms}; try { render(); } catch(e){ console.error(e); } showCalcResult(c, ms, log); }, 60);
}
function showCalcResult(c, ms, log){ log=log||{steps:[]};
  const p=P(); if(!p) { toast('Không có dữ liệu để tính'); return; }
  const items=itemMap();
  const noPrice = p.nxt.filter(x=>x.xuatSL>0 && !x.gv); const am = p.nxt.filter(x=>x.closeSL<0); const badOrd = p.orders.filter(o=>o.status!=='Đủ');
  let pp={tang:0,giam:0,dc:0,tr:0,mv:0}; try { if (selKy.length===7 && !isLocked(selKy)) { pp.tr=buildTransfer(selKy).rows.length; pp.mv=movedRows(d=>kyOf(d)===selKy).length; } } catch(e){} try { const d=buildProposal(p); pp.tang=sum(d.chotRows.filter(x=>x.dc>0),x=>x.dc); pp.giam=-sum(d.chotRows.filter(x=>x.dc<0),x=>x.dc); pp.dc=buildAdjProposal(p).rows.length; } catch(e){}
  const ok = s => `<span class="pill ok">Đạt</span>`, bad = s => `<span class="pill bad">${s}</span>`;
  modal(`<h3>✔ Đã tính xong giá thành ${fmtKy(selKy)} <span class="small mut">(${c.list.length} kỳ, ${ms} ms)</span></h3>
  <div class="cards" style="margin:10px 0">
    <div class="card"><div class="l">Lệnh sản xuất</div><div class="v">${p.orders.length}</div><div class="s">${fmtQ(p.slSX)} sản lượng</div></div>
    <div class="card"><div class="l">621 NVL</div><div class="v">${fmtN(p.sum621)}</div><div class="s">622 ${fmtN(p.sum622)} · 627 ${fmtN(p.sum627)}</div></div>
    <div class="card"><div class="l">Giá thành 154</div><div class="v">${fmtN(p.sum154)}</div><div class="s">Tỷ lệ 622 ${fmtP(p.rates.r622)} · 627 ${fmtP(p.rates.r627)}</div></div>
    <div class="card"><div class="l">Tồn cuối kỳ</div><div class="v">${fmtN(p.tonCuoi)}</div><div class="s">${am.length} mã âm</div></div>
  </div>
  <div class="box"><h3>Mã tồn cuối âm</h3>
    ${(()=>{ const own=x=>Math.max(0,x.openSL)+x.nhapSL-x.xuatSL<-1e-9 || x.nhom==='Thành phẩm'; const a1=am.filter(own), a2=am.filter(x=>!own(x)); const li=l=>`<div class="small mut" style="margin-top:4px">${l.map(x=>`${esc(x.ma)} ${fmtQ(x.closeSL)}`).join('; ')}</div>`;
      return !am.length ? `<div>${ok()}</div>` : (a1.length?`<div>${bad(`${a1.length} mã âm trong tháng`)} ${li(a1)}</div>`:'') + (a2.length?`<div style="margin-top:6px">${bad(`${a2.length} mã âm từ tháng trước`)} <span class="small mut">– chuyển kho / cân đối ở tháng trước</span> ${li(a2)}</div>`:''); })()}
  </div>
  <div style="text-align:right;margin-top:8px">${pp.mv?`<button class="btn" id="rsUn" title="Trả các phiếu đã chuyển ngày nhập kho về ngày nhập gốc">↩ Bỏ chuyển kho (${pp.mv})</button> `:''}${(pp.dc||pp.tr) && selKy.length===7 && !isLocked(selKy)?`<button class="btn ${pp.tr?'btn-pend':'btn-done'}" id="rsTr" ${pp.tr?'':'disabled'} title="Bước 1: lùi ngày nhập kho phiếu mua tháng sau về tháng đang âm">${pp.tr?'① 📅 Chuyển ngày nhập kho':'① ✓ Không còn phiếu chuyển kho'}</button> <button class="btn ${pp.dc?'btn-pend':'btn-done'}" id="rsAdj" ${pp.dc?'':'disabled'} title="Bước 2: giảm tiêu hao NVL ở các lệnh làm tồn âm (theo số hiện tại)">${pp.dc?'② ⚙ Cân đối NVL':'② ✓ Không còn NVL âm'}</button> `:''}<button class="btn" id="rsGoLT">Lệnh SX thực tế</button> <button class="btn ${pp.dc||pp.tr?'':'p'}" id="mclose">Đóng</button></div>`);
  $('#mclose').onclick=()=>{ closeModal(); }; if ($('#rsUn')) $('#rsUn').onclick=()=>{ closeModal(); const k=selKy; undoTransferDialog(d=>kyOf(d)===k, ()=>runCalcFor()); }; if ($('#rsTr')) $('#rsTr').onclick=()=>{ closeModal(); transferDialog(selKy, ()=>runCalcFor()); }; if ($('#rsAdj')) $('#rsAdj').onclick=()=>{ closeModal(); balanceDialog(selKy, ()=>runCalcFor()); }; $('#rsGoLT').onclick=()=>{ closeModal(); goView('lsxtt'); render(); };
}
function calcStatHtml(){ return (calcDirty ? '<span style="color:#fcd34d">⚠ Dữ liệu đã thay đổi – chưa tính</span><br>' : '') + (lastCalc ? `Tính lần cuối ${lastCalc.at.toLocaleTimeString('vi-VN')} · ${lastCalc.n} kỳ · ${lastCalc.ms} ms` : 'Chưa tính'); }
function lockedList(){ return (state.settings.locked||[]).slice().sort(); }
function isLocked(ky){ if(!ky) return false; const L=state.settings.locked||[]; if (isRange(ky)) { const r=rangeOf(ky); let k=r.from.slice(0,7); const end=r.to.slice(0,7); let g=0; while (k<=end && g++<600) { if (L.includes(k)) return true; k=nextKy(k); } return false; } if (ky.length===4) { const ms=allKys().filter(k=>k.startsWith(ky)); return ms.length>0 && ms.every(k=>L.includes(k)); } return L.includes(ky); }
function lockedSel(){ return isLocked(selKy); }
function lockDialog(){
  const wy=curYear(); const has=new Set(allKys());
  const row = mm => { const k=`${wy}-${mm}`; const lk=isLocked(k); const d=has.has(k); return `<tr><td>Tháng ${+mm}/${wy}</td><td>${d?'có dữ liệu':'<span class="mut">chưa có dữ liệu</span>'}</td><td>${lk?'<span class="pill bad">🔒 Đã khóa</span>':'<span class="pill ok">🔓 Đang mở</span>'}</td><td class="act"><button class="btn s ${lk?'':'p'}" data-tg="${k}">${lk?'Mở khóa':'Khóa'}</button></td></tr>`; };
  modal(`<h3>🔒 Khóa / mở khóa kỳ – năm ${wy}</h3><div class="small mut">Kỳ đã khóa: chỉ xem, không sửa/xóa/nhập thêm chứng từ, lệnh, điều chỉnh; đề xuất SX không cập nhật vào kỳ đó. Mở khóa khi cần điều chỉnh lại. (Đổi năm tại Tổng quan.)</div>
  <div class="tw" style="margin-top:10px;max-height:60vh"><table><thead><tr><th>Kỳ</th><th>Dữ liệu</th><th>Trạng thái</th><th></th></tr></thead><tbody>${Array.from({length:12},(_,i)=>row(String(i+1).padStart(2,'0'))).join('')}</tbody></table></div>
  <div style="text-align:right;margin-top:10px"><button class="btn p" id="mclose">Đóng</button></div>`);
  $('#mclose').onclick=()=>{ closeModal(); render(); };
  document.querySelectorAll('#modal [data-tg]').forEach(b=>b.onclick=()=>{ const k=b.dataset.tg; const lk=isLocked(k); confirmBox(lk?`Mở khóa ${fmtKy(k)}? Dữ liệu kỳ này sẽ sửa được trở lại.`:`Khóa ${fmtKy(k)}?`, ()=>{ toggleLock(k); lockDialog(); toast(lk?`Đã mở khóa ${fmtKy(k)}`:`Đã khóa ${fmtKy(k)}`); }); });
}
function toggleLock(ky){ const L=new Set(state.settings.locked||[]); if (L.has(ky)) L.delete(ky); else L.add(ky); state.settings.locked=[...L]; changed(); }

