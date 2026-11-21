//# Màn hình Luồng xử lý
// ---------- Luồng xử lý: sơ đồ các bước, ô chưa đạt / cần xem bấm vào xem chi tiết ----------
function flowStatus(){
  // Luồng xử lý: chỉ kiểm soát QUY TRÌNH (đã nhập đủ / đã làm bước chưa). Rủi ro số liệu (giá bất thường, tồn âm, bán dưới giá vốn…) xem ở Cảnh báo & kiểm tra.
  const c=calcLive(); const p=PL(); const K=cbChecks(c,p); const it=K.items;
  const kys=Object.keys(c.periods||{}).filter(k=>selHas(k+'-01')||selHas(k+'-28')).sort();
  const inc=e=>{ const x=K.incomplete.find(i=>i.e===e); return x?x.n:0; };
  const missFrom=src=>Object.entries(K.missing).filter(([k,v])=>[...v].some(x=>x.startsWith(src))).map(([k])=>k);
  const S={}; const set=(id,l)=>S[id]={lv:l.length?'bad':'ok', msg:l.length?`${l.length} việc chưa xong`:'Đạt', list:l};
  // 1 · Dữ liệu nền
  { const l=[]; if (!state.items.length) l.push('Chưa có mã hàng nào trong danh mục'); if (inc('items')) l.push(`${inc('items')} mã chưa đủ Tên / Nhóm / ĐVT / Kho`); Object.keys(K.missing).forEach(k=>l.push(`Mã ${k} đang dùng (${[...K.missing[k]].join(', ')}) nhưng chưa có trong danh mục`)); set('d_items', l); }
  { const rows=(state.opening&&state.opening.rows)||{}; const l=Object.keys(rows).filter(k=>!it[k]).map(k=>`Mã ${k} có tồn đầu nhưng chưa có trong danh mục`); set('d_opening', l); }
  { const l=[...K.noBom.map(k=>`Lệnh SX chưa có định mức: ${k.replace('|',' / ')}`), ...state.bom.filter(b=>!b._new && (!b.maTP||!b.maNVL||!(num(b.slTP)>0)||!(num(b.slNVL)>0))).map(b=>`Dòng định mức chưa đủ thông tin: ${b.maTP||'(trống)'} – ${b.maNVL||'(trống)'}`)]; set('d_bom', l); }
  { const l=[]; if (inc('subs')) l.push(`${inc('subs')} dòng chưa đủ thông tin bắt buộc`); set('d_subs', l); }
  // 2 · Phát sinh
  { const l=[]; if (inc('purchases')) l.push(`${inc('purchases')} dòng mua chưa đủ thông tin bắt buộc`); missFrom('Mua hàng').forEach(k=>l.push(`Mã ${k} chưa có trong danh mục`)); set('d_purchases', l); }
  { const l=[]; if (inc('sales')) l.push(`${inc('sales')} dòng bán chưa đủ thông tin bắt buộc`); missFrom('Bán hàng').forEach(k=>l.push(`Mã ${k} chưa có trong danh mục`)); set('d_sales', l); }
  { const l=[]; if (inc('orders')) l.push(`${inc('orders')} lệnh chưa đủ thông tin bắt buộc`); K.dupLenh.forEach(([k,v])=>l.push(`Mã lệnh ${k} bị trùng (${v} dòng)`)); missFrom('Lệnh SX').forEach(k=>l.push(`Mã TP ${k} chưa có trong danh mục`)); set('d_orders', l); }
  { const l=[]; if (inc('issues')) l.push(`${inc('issues')} dòng chưa đủ thông tin bắt buộc`); missFrom('Xuất chung').forEach(k=>l.push(`Mã ${k} chưa có trong danh mục`)); set('d_issues', l); }
  { const l=[]; kys.forEach(k=>{ const pp=c.periods[k]; if (!pp || !(pp.slSX>0)) return; const miss=['622','627'].filter(t=>!costSum(pp.cost,t)); if (miss.length) l.push(`${fmtKy(k)}: có sản xuất nhưng chưa nhập chi phí ${miss.join(', ')}`); }); set('d_costs', l); }
  // 3 · Đề xuất & sản xuất
  set('kehoach', []); set('lsxtt', []);
  { const l=K.adjBad.map(x=>`${x.a.maLenh} – ${x.a.maVT||''}: ${x.e}`); const st=cdStatus();
    [...new Set(st.t.rows.map(r=>r.k))].forEach(k=>l.push(`${fmtKy(k)}: chưa chuyển ngày nhập kho cho NVL âm cuối tháng (📅)`));
    [...new Set(st.b.rows.map(r=>r.k))].forEach(k=>l.push(`${fmtKy(k)}: chưa cân đối NVL âm cuối tháng (⚙)`)); set('d_adjustments', l); }
  // 4 · Giá thành
  { const l=[]; if (!calcCache) l.push('Chưa tính giá thành – vào Giá thành bấm ▶ Tính giá thành'); else if (liveDiff()||calcDirty) l.push('Có dữ liệu mới sau lần tính gần nhất – vào Giá thành bấm ▶ Tính giá thành'); set('giathanh', l); }
  // 5 · Báo cáo
  set('nxt', []); set('banhang', []); set('nam', []);
  { const l=[]; if (!calcCache || liveDiff() || calcDirty) l.push('Giá thành chưa tính lại – tính lại trước khi tải file lên Misa'); const kt=ktSettings(); if (!kt.maDT||!kt.tkNoXK||!kt.tkCoNK) l.push('Thiếu Mã đối tượng / tài khoản ở Thiết lập → File tải dữ liệu kế toán'); set('xuatphieu', l); }
  return S;
}
function vLuong(m){
  const S=flowStatus();
  const box=(id,t,user,wide)=>{ const st=S[id]||{lv:'ok',msg:''}; return `<button class="fl-b ${user?'u':'a'} ${st.lv} ${wide?'wide':''}" data-fl="${id}" title="${esc(st.msg||'')}${st.lv==='ok'?' – bấm để mở màn hình':' – bấm để xem chi tiết'}"><span class="fl-t">${esc(t)}</span>${st.lv!=='ok'?`<span class="fl-n">${Math.max(1,st.list.length)}</span>`:''}</button>`; };
  const grp=(n,t,boxes,cols)=>`<div class="fl-g"><div class="fl-h">${n} · ${t}</div><div class="fl-row" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${boxes}</div></div>`;
  const arr='<div class="fl-a">↓</div>';
  const cnt={bad:0,warn:0}; Object.values(S).forEach(x=>{ if (cnt[x.lv]!=null) cnt[x.lv]++; });
  m.innerHTML = head('Luồng xử lý') + emptyNote() + `<div class="box fl"><div class="fl-top"><h3>Sơ đồ luồng dữ liệu</h3>${cnt.bad?`<span class="pill bad">${cnt.bad} bước chưa xong</span>`:''}${cnt.warn?`<span class="pill warn">${cnt.warn} ô cần xem</span>`:''}${!cnt.bad&&!cnt.warn?'<span class="pill ok">✓ Đã làm đủ các bước</span>':''}</div>
   ${grp(1,'Dữ liệu nền – nhập một lần', box('d_items','Danh mục hàng',1)+box('d_opening','Số dư NXT đầu kỳ',1)+box('d_bom','Định mức',1)+box('d_subs','NVL thay thế',1), 4)}${arr}
   ${grp(2,'Phát sinh hằng ngày', box('d_purchases','Mua hàng',1)+box('d_sales','Bán hàng',1)+box('d_orders','Lệnh SX (kế hoạch)',1)+box('d_issues','Xuất dùng chung',1)+box('d_costs','Chi phí 622 / 627',1), 5)}${arr}
   ${grp(3,'Đề xuất & sản xuất – theo tháng', box('kehoach','Đề xuất sản xuất')+box('lsxtt','Lệnh sản xuất thực tế')+box('d_adjustments','Cân đối NVL'), 3)}${arr}
   ${grp(4,'Tính giá thành – bấm ▶ Tính giá thành ở màn hình Giá thành', `<div></div>${box('giathanh','Giá thành lệnh: 621 + 622 + 627 = 154',0,1)}<div></div>`, 3)}${arr}
   ${grp(5,'Kết quả – báo cáo', box('nxt','Nhập – Xuất – Tồn')+box('banhang','Báo cáo bán hàng')+box('nam','Tổng hợp năm')+box('xuatphieu','File tải dữ liệu kế toán'), 4)}
   <div class="fl-lg"><span><i class="u"></i>Người dùng nhập</span><span><i class="a"></i>Phần mềm tự tính / lập</span><span class="fl-bad">Chữ đỏ: bước chưa làm xong</span><span class="mut">Bấm vào ô để xem chi tiết / mở màn hình</span></div></div>`;
  bindKy();
  m.querySelectorAll('[data-fl]').forEach(b=>b.onclick=()=>{ const id=b.dataset.fl; const st=S[id]; const name=b.querySelector('.fl-t').textContent;
    if (st.lv==='ok') { goView(id); render(); return; }
    const lim=300; modal(`<h3>${esc(name)} – <span class="${st.lv==='bad'?'fl-bad':'fl-warn'}">${st.lv==='bad'?'Chưa đạt':'Cần xem'}</span></h3>
      <div class="small mut" style="margin-bottom:8px">${esc(st.msg)} · Kỳ: ${esc(fmtKy(selKy))}</div>
      <div class="fl-list"><ol>${st.list.slice(0,lim).map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${st.list.length>lim?`<div class="small mut">… và ${st.list.length-lim} mục khác</div>`:''}</div>
      <div style="text-align:right;margin-top:12px"><button class="btn" id="flC">Đóng</button> <button class="btn p" id="flGo">➜ Mở màn hình ${esc(name.split(':')[0])}</button></div>`);
    $('#flC').onclick=()=>closeModal(); $('#flGo').onclick=()=>{ closeModal(); goView(id); render(); }; });
}
