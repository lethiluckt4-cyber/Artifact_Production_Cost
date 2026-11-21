//# Màn hình Thiết lập & sao lưu
// ---- Thiết lập ----
function pbBasisOf(g){ return state.settings['pb'+g] || state.settings.pbBasis || 'kg'; }
function pbHtml(){
  const y=curYear(); const c=calc(); const kys=Array.from({length:12},(_,i)=>`${y}-${String(i+1).padStart(2,'0')}`);
  const opt=(g,v,l)=>`<option value="${v}" ${pbBasisOf(g)===v?'selected':''}>${l}</option>`;
  const rows=kys.map(k=>{ const p=c.periods[k]; const cost=state.costs[k]||{}; if (!p) return {k, p:null}; const c622=costSum(cost,'622'), c627=costSum(cost,'627')+(p.c627chung||0); return {k, p, c622, c627, sl:p.slSX, k622:p.slSX?c622/p.slSX:0, k627:p.slSX?c627/p.slSX:0, r622:p.sum621?c622/p.sum621:0, r627:p.sum621?c627/p.sum621:0}; }).filter(r=>r.p);
  const dis = pbEdit ? '' : 'disabled';
  return `<div class="box"><div class="bx-hd"><h3>Tiêu thức phân bổ chi phí nhân công (622) và sản xuất chung (627) vào lệnh sản xuất</h3><span class="sp"></span>${pbEdit?`<button class="btn s" id="pbC">Hủy</button><button class="btn s p" id="pbS">${IC('save')}Lưu</button>`:`<button class="btn s" id="pbE">${IC('edit')}Sửa</button>`}</div>
  <div class="grid2" style="max-width:760px"><div class="fld"><label>Chi phí nhân công 622 phân bổ theo</label><select id="pb622" ${dis}>${opt('622','kg','Sản lượng sản xuất (kg)')}${opt('622','nvl','Giá trị NVL (621)')}</select></div>
  <div class="fld"><label>Chi phí sản xuất chung 627 phân bổ theo</label><select id="pb627" ${dis}>${opt('627','kg','Sản lượng sản xuất (kg)')}${opt('627','nvl','Giá trị NVL (621)')}</select></div></div>
  <div class="small" style="line-height:1.7;margin:6px 0 10px"><b>Sản lượng (kg):</b> chi phí của lệnh = Tổng chi phí tháng × (SL sản xuất của lệnh ÷ Tổng SL sản xuất tháng). Mỗi kg thành phẩm gánh cùng một mức chi phí chế biến, phù hợp khi nhân công, điện, nước, khấu hao tốn theo thời gian chạy máy.<br>
  <b>Giá trị NVL (621):</b> chi phí của lệnh = Tổng chi phí tháng × (621 của lệnh ÷ Tổng 621 tháng) – cách trong file Excel gốc; sản phẩm dùng NVL đắt gánh nhiều chi phí chế biến hơn.<br>
  Chi phí 627 gồm phần nhập tay ở màn Chi phí 622/627 và giá trị xuất NVL dùng chung loại 627. Đổi tiêu thức xong bấm <b>▶ Tính giá thành</b> để áp dụng; tháng đã khóa không bị ảnh hưởng cho đến khi bạn mở khóa và tính lại.</div>
  <b class="small">Kết quả phân bổ năm ${y} (theo lần tính gần nhất)</b>
  ${rows.length?table([{t:'Tháng',f:x=>fmtKy(x.k)},{t:'Tổng 622',n:1,f:x=>x.c622,sum:1},{t:'Tổng 627',n:1,f:x=>x.c627,sum:1},{t:'SL sản xuất (kg)',n:1,d:2,f:x=>x.sl,sum:1},{t:'622 đ/kg SX',n:1,f:x=>x.k622},{t:'627 đ/kg SX',n:1,f:x=>x.k627},{t:'622 / 621',n:1,f:x=>x.r622,fmt:fmtP},{t:'627 / 621',n:1,f:x=>x.r627,fmt:fmtP}], rows, {total:true}):'<div class="mut small">Chưa có tháng nào được tính giá thành.</div>'}</div>`;
}
let pbEdit = false;
function pbBind(m){
  if ($('#pbE')) $('#pbE').onclick=()=>{ pbEdit=true; render(); };
  if ($('#pbC')) $('#pbC').onclick=()=>{ pbEdit=false; render(); };
  if ($('#pbS')) $('#pbS').onclick=()=>{ ['622','627'].forEach(g=>{ const el=$('#pb'+g); if (el) state.settings['pb'+g]=el.value; }); pbEdit=false; changed(); render(); toast('Đã lưu tiêu thức phân bổ – vào Giá thành bấm ▶ Tính giá thành để áp dụng', 4000); };
}
let tlEdit = {info:false, kt:false};
function vThietLap(m){
  const stab = m.dataset.stab||'tl';
  const stabs = `<div class="tabs"><button data-st="tl" class="${stab==='tl'?'act':''}">Thiết lập & sao lưu</button><button data-st="cal" class="${stab==='cal'?'act':''}">Lịch nghỉ / tăng ca</button><button data-st="pb" class="${stab==='pb'?'act':''}">Phân bổ 622 / 627</button></div>`;
  const bindStabs = () => m.querySelectorAll('.tabs button[data-st]').forEach(b=>b.onclick=()=>guardEdit(()=>{ m.dataset.stab=b.dataset.st; render(); }));
  if (stab==='cal') { m.innerHTML = head('Thiết lập & sao lưu') + stabs + '<div class="box"><h3>Lịch nghỉ sản xuất / nghỉ chờ việc / tăng ca</h3><div id="calhost"></div></div>'; bindKy(); bindStabs(); vCalEmbed($('#calhost')); return; }
  if (stab==='pb') { m.innerHTML = head('Thiết lập & sao lưu') + stabs + pbHtml(); bindKy(); bindStabs(); pbBind(m); return; }
  const ST=state.settings; const dI = tlEdit.info?'':'disabled', dK = tlEdit.kt?'':'disabled';
  const btns = key => tlEdit[key] ? `<button class="btn s" data-tlc="${key}">Hủy</button><button class="btn s p" data-tls="${key}">${IC('save')}Lưu</button>` : `<button class="btn s" data-tle="${key}">${IC('edit')}Sửa</button>`;
  m.innerHTML = head('Thiết lập & sao lưu') + stabs +
  `<div class="grid2">
  <div class="box"><div class="bx-hd"><h3>Thông tin chung</h3><span class="sp"></span>${btns('info')}</div><div class="fld"><label>Tên công ty / đơn vị</label><input type="text" id="company" value="${esc(ST.company||'')}" ${dI}></div><div class="fld"><label>Kỳ bắt đầu (kỳ có tồn đầu do bạn nhập)</label><input type="month" id="startKy2" value="${esc(ST.startKy||'')}" ${dI}></div></div>
  <div class="box"><div class="bx-hd"><h3>Sao lưu & phục hồi</h3></div><p class="small">Toàn bộ dữ liệu (nhiều năm) được xuất ra một file .json. Nên sao lưu cuối mỗi tháng. Phục hồi sẽ <b>thay toàn bộ</b> dữ liệu hiện tại.</p><div class="bar" style="flex-wrap:wrap"><button class="btn p" id="bk">⬇ Sao lưu (.json)</button><label class="btn">⬆ Phục hồi từ file sao lưu<input type="file" id="rs" accept=".json" style="display:none"></label><button class="btn" id="bkx">⬇ Xuất toàn bộ dữ liệu ra Excel</button>${hasSeed()?'':''}</div></div>
  <div class="box"><div class="bx-hd"><h3>File tải dữ liệu kế toán</h3><span class="sp"></span>${btns('kt')}</div><div class="grid2"><div class="fld"><label>Mã đối tượng</label><input type="text" id="ktMaDT" value="${esc(ST.ktMaDT||'NV_DMT')}" ${dK}></div><div class="fld"><label>Tên đối tượng</label><input type="text" id="ktTenDT" value="${esc(ST.ktTenDT||'Đặng Minh Thảo')}" ${dK}></div><div class="fld"><label>TK Nợ phiếu xuất NVL</label><input type="text" id="ktTkNoXK" value="${esc(ST.ktTkNoXK||'621')}" ${dK}></div><div class="fld"><label>TK Có phiếu nhập TP</label><input type="text" id="ktTkCoNK" value="${esc(ST.ktTkCoNK||'154')}" ${dK}></div></div></div>
  </div>`;
  bindKy(); bindStabs();
  m.querySelectorAll('[data-tle]').forEach(b=>b.onclick=()=>{ tlEdit[b.dataset.tle]=true; render(); });
  m.querySelectorAll('[data-tlc]').forEach(b=>b.onclick=()=>{ tlEdit[b.dataset.tlc]=false; render(); });
  m.querySelectorAll('[data-tls]').forEach(b=>b.onclick=()=>{ const key=b.dataset.tls;
    if (key==='info') { ST.company=$('#company').value.trim(); const sk=$('#startKy2').value; if (sk!==(ST.startKy||'')) { ST.startKy=sk; if (state.opening.ky!==sk) state.opening.ky=sk; } changed(); renderNav(); }
    else { ['ktMaDT','ktTenDT','ktTkNoXK','ktTkCoNK'].forEach(k=>{ ST[k]=$('#'+k).value.trim(); }); store.schedule(); }
    tlEdit[key]=false; render(); toast('Đã lưu'); });
  $('#bk').onclick=()=>saveFile(`SaoLuu_GiaThanh_${new Date().toISOString().slice(0,10)}.json`, new Blob([JSON.stringify(toDocs())], {type:'application/json'}));
  $('#bkx').onclick=()=>saveWb(buildTemplate(true), `DuLieu_GiaThanh_${new Date().toISOString().slice(0,10)}.xlsx`);
  $('#rs').onchange=async e=>{ const f=e.target.files[0]; if(!f) return; try { const docs=JSON.parse(await f.text()); confirmBox('Thay toàn bộ dữ liệu hiện tại bằng dữ liệu trong file sao lưu?', ()=>{ fromDocs(docs); changed(); selKy=''; render(); toast('Đã phục hồi dữ liệu'); }); } catch(err){ toast('File sao lưu không hợp lệ'); } };
  if ($('#seed2')) $('#seed2').onclick=()=>confirmBox('Thay toàn bộ dữ liệu hiện có bằng dữ liệu tháng 10/2026 từ file gốc?', ()=>{ fromDocs(JSON.parse($('#seed').textContent)); changed(); selKy=''; render(); });
}
