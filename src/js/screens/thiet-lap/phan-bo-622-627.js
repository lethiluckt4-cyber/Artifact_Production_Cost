// ---- Thiết lập ----
// ---- Quy tắc phân bổ 622 / 627 (tab trong Thiết lập & sao lưu) – chỉ là thiết lập, không hiện số tiền theo tháng ----
function vAlloc(m){
  const A=allocCfg(); const items=itemMap(); const allocRows = A.rows.filter(r=>num(r.cd)===1); const cd1Set=new Set(allocRows.map(r=>r.ma));
  const cd2Names = state.items.filter(x=>isMade(x) && !cd1Set.has(x.ma)).map(x=>x.ma).join(', ') || 'thành phẩm đóng gói';
  m.innerHTML = head(`Quy tắc phân bổ 622 / 627`) + `
  <div class="note">Chi phí <b>nhân công (622)</b> và <b>sản xuất chung (627)</b> của tháng chia cho 2 công đoạn theo tỷ lệ dưới đây, rồi chia cho từng sản phẩm, trong mỗi sản phẩm chia cho các lệnh theo tỷ trọng 621. 627 gồm cả <b>Xuất dùng chung loại Chi phí sản xuất (627)</b> (gas…); loại Bán hàng (641) không tính vào. Sửa xong bấm <b>Lưu quy tắc phân bổ</b> rồi <b>▶ Tính giá thành</b>.</div>
  <div id="alWrap"><div class="box" style="margin-top:12px"><h3>1 · Tỷ lệ theo công đoạn</h3>
  <div class="tw" style="max-height:none"><table><thead><tr><th>Công đoạn</th><th>Gồm sản phẩm</th><th class="n">Tỷ lệ 622</th><th class="n">Tỷ lệ 627</th></tr></thead><tbody>
   <tr><td><b>Công đoạn 1</b> – làm bánh</td><td class="mut">${esc(allocRows.map(r=>r.ma).join(', '))}</td><td class="n"><input type="number" step="any" id="al622" value="${num(A.cd1_622)}" style="width:80px"></td><td class="n"><input type="number" step="any" id="al627" value="${num(A.cd1_627)}" style="width:80px"></td></tr>
   <tr><td><b>Công đoạn 2</b> – đóng gói thành phẩm <span class="small mut">(tự động = phần còn lại)</span></td><td class="mut">${esc(cd2Names)}</td><td class="n"><b id="cd2_622">${fmtQ(round(1-num(A.cd1_622),6))}</b></td><td class="n"><b id="cd2_627">${fmtQ(round(1-num(A.cd1_627),6))}</b></td></tr>
   <tr class="tot"><td>Tổng</td><td></td><td class="n">100%</td><td class="n">100%</td></tr>
  </tbody></table></div>
  <div class="small mut" style="margin-top:6px">Nhập dạng số thập phân: 0,8 = 80%. Công đoạn 2 tự bằng 1 − công đoạn 1.</div></div>
  <div class="box" style="margin-top:12px"><h3>2 · Tỷ lệ từng sản phẩm trong công đoạn</h3>
  <div class="tw" style="max-height:none"><table><thead><tr><th>Mã sản phẩm</th><th>Tên sản phẩm</th><th class="n">Tỷ lệ 622</th><th class="n">Tỷ lệ 627</th><th></th></tr></thead><tbody>
   <tr><td colspan="5" style="background:#eef4ff"><b>Công đoạn 1</b> – theo tỷ lệ cố định bạn nhập</td></tr>
   ${allocRows.map((r,i)=>`<tr><td><select data-ai="${i}" data-f="ma">${state.items.filter(x=>isMade(x)).map(x=>`<option ${x.ma===r.ma?'selected':''}>${esc(x.ma)}</option>`).join('')}</select></td><td class="mut">${esc((items[r.ma]||{}).ten||'')}</td><td class="n"><input type="number" step="any" data-ai="${i}" data-f="t622" value="${num(r.t622)}" style="width:80px"></td><td class="n"><input type="number" step="any" data-ai="${i}" data-f="t627" value="${num(r.t627)}" style="width:80px"></td><td class="act"><button class="btn s d edonly" data-arm="${i}">Xóa</button></td></tr>`).join('')}
   <tr class="tot"><td>Tổng công đoạn 1</td><td></td><td class="n">${fmtP(sum(allocRows,r=>num(r.t622)))}</td><td class="n">${fmtP(sum(allocRows,r=>num(r.t627)))}</td><td></td></tr>
   <tr><td colspan="5" style="background:#eef4ff"><b>Công đoạn 2</b> – ${esc(cd2Names)}: <b>phân bổ theo tỷ trọng 621 trong tháng</b> (tự động, không cần nhập)</td></tr>
  </tbody></table></div>
  <div class="bar edonly" style="margin-top:8px"><button class="btn" id="alAdd">+ Thêm sản phẩm CĐ1</button><span class="small mut">Tổng tỷ lệ sản phẩm trong công đoạn 1 phải = 100%.</span></div></div></div>
  <div class="bar edbar" id="egAl" style="margin-top:10px"><button class="btn p edonly edsave" id="alSave">${icon('save')}<span>Lưu quy tắc phân bổ</span></button></div>`;
  editGate($('#alWrap'), 'pb', $('#egAl'), ()=>state.settings.alloc||null, v=>{ if (v==null) delete state.settings.alloc; else state.settings.alloc=v; changed(); });
  bindKy();
  const upd=()=>{ const a=$('#cd2_622'), b=$('#cd2_627'); if(a) a.textContent=fmtQ(round(1-num($('#al622').value),6)); if(b) b.textContent=fmtQ(round(1-num($('#al627').value),6)); };
  $('#al622').oninput=upd; $('#al627').oninput=upd;
  const readAlloc = () => { const rows=allocRows.map(r=>({...r})); m.querySelectorAll('[data-ai]').forEach(el=>{ const r=rows[+el.dataset.ai]; r[el.dataset.f] = el.dataset.f==='ma' ? el.value : num(el.value); }); return {cd1_622:num($('#al622').value), cd1_627:num($('#al627').value), rows:rows.map(r=>({ma:r.ma, cd:1, t622:num(r.t622), t627:num(r.t627)}))}; };
  $('#alAdd').onclick=()=>{ const a=readAlloc(); const it=state.items.find(x=>isMade(x) && !isFinal(x) && !a.rows.some(r=>r.ma===x.ma)); a.rows.push({ma:it?it.ma:'', cd:1, t622:0, t627:0}); state.settings.alloc=a; render(); };
  m.querySelectorAll('[data-arm]').forEach(b=>b.onclick=()=>{ const a=readAlloc(); a.rows.splice(+b.dataset.arm,1); state.settings.alloc=a; changed(); render(); });
  $('#alSave').onclick=()=>{ const a=readAlloc(); if (a.cd1_622<0||a.cd1_622>1||a.cd1_627<0||a.cd1_627>1) return toast('Tỷ lệ công đoạn 1 phải từ 0 đến 1 (vd 0,8 = 80%)', 4500); const s1=sum(a.rows,r=>r.t622), s2=sum(a.rows,r=>r.t627); if (a.rows.length && (Math.abs(s1-1)>1e-6 || Math.abs(s2-1)>1e-6)) return toast(`Tổng tỷ lệ sản phẩm trong công đoạn 1 phải = 100% (622: ${fmtP(s1)}, 627: ${fmtP(s2)})`, 4500); if (new Set(a.rows.map(r=>r.ma)).size!==a.rows.length) return toast('Mã sản phẩm bị trùng'); state.settings.alloc=a; EDK.delete('pb'); changed(); render(); toast('Đã lưu quy tắc phân bổ'); };
}
