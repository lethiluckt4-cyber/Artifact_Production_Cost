// Ngưỡng tồn kho & tham số
function vThamSo(m){
  const L = nguongList().map(x=>({...x}));
  m.innerHTML = head(`Cảnh báo & kiểm tra dữ liệu`) + cbTabs('ng') + `<div id="ngWrap">
  <div class="tw" style="max-height:none"><table><thead><tr><th>Nhóm hàng / Mã</th><th class="n">Rủi ro khi tồn trên (ngày)</th><th class="n">Cảnh báo khi tồn trên (ngày) – tự động = ½</th><th class="n">Tồn tối thiểu (ngày)</th><th>Ghi chú</th><th style="width:44px"></th></tr></thead><tbody>${L.map((x,i)=>`<tr><td class="ed" contenteditable data-i="${i}" data-f="key">${esc(x.key)}</td><td class="ed n" contenteditable data-i="${i}" data-f="max">${num(x.max)||''}</td><td class="n mut">${num(x.max)?fmtQ(num(x.max)/2)+' ('+ngayLbl(num(x.max)/2)+')':''}</td><td class="ed n" contenteditable data-i="${i}" data-f="min">${num(x.min)||''}</td><td class="ed" contenteditable data-i="${i}" data-f="ghiChu">${esc(x.ghiChu||'')}</td><td class="act"><button class="btn s d" data-rm="${i}" title="Xóa dòng chỉ tiêu này">Xóa</button></td></tr>`).join('')}</tbody></table></div>
  <div class="bar edonly" style="margin-top:8px"><button class="btn" id="ngAdd">+ Thêm dòng</button></div>
  <div class="box" style="margin-top:12px"><h3>Ngưỡng chênh lệch giá mua / bán (%)</h3>

  <div class="tw" style="max-height:none"><table><thead><tr><th>Loại</th><th>Cảnh báo vàng khi lệch từ (%)</th><th>Cảnh báo đỏ khi lệch từ (%)</th></tr></thead><tbody>
  <tr><td>Giá mua</td><td class="ed n" contenteditable data-gn="muaV">${fmtN(giaNg().muaV*100,1)}</td><td class="ed n" contenteditable data-gn="muaD">${fmtN(giaNg().muaD*100,1)}</td></tr>
  <tr><td>Giá bán</td><td class="ed n" contenteditable data-gn="banV">${fmtN(giaNg().banV*100,1)}</td><td class="ed n" contenteditable data-gn="banD">${fmtN(giaNg().banD*100,1)}</td></tr>
  </tbody></table></div></div>
  <div class="box" style="margin-top:12px"><h3>Ngưỡng % công suất (Đề xuất sản xuất)</h3>
  <div class="tw" style="max-height:none"><table><thead><tr><th>Chỉ tiêu</th><th>Cảnh báo vàng khi dưới (%)</th><th>Cảnh báo đỏ khi vượt (%)</th></tr></thead><tbody>
  <tr><td>% công suất = Đề xuất + thực hiện ÷ SL bánh gấu kem tươi (ước tính) SX</td><td class="ed n" contenteditable data-cs="lo">${fmtN(csNg().lo*100,1)}</td><td class="ed n" contenteditable data-cs="hi">${fmtN(csNg().hi*100,1)}</td></tr>
  </tbody></table></div></div>
  </div><div class="bar edbar" id="egNg"><button class="btn p edonly edsave" id="ngSave">${icon('save')}<span>Lưu ngưỡng</span></button></div>`;
  editGate($('#ngWrap'), 'ng', $('#egNg'), ()=>({nguong:state.settings.nguong||null, giaNg:state.settings.giaNg||null, csNg:state.settings.csNg||null}), v=>{ ['nguong','giaNg','csNg'].forEach(k=>{ if (v[k]==null) delete state.settings[k]; else state.settings[k]=v[k]; }); calcCache=null; changed(); });
  bindKy(); bindCbTabs(m); m.querySelectorAll('[data-go]').forEach(a=>a.onclick=e=>{ e.preventDefault(); view=a.dataset.go; render(); });
  const read=()=>{ m.querySelectorAll('td[data-i]').forEach(td=>{ const x=L[+td.dataset.i]; const f=td.dataset.f; x[f] = (f==='max'||f==='min') ? num(td.textContent) : td.textContent.trim(); }); };
  $('#ngAdd').onclick=()=>{ read(); L.push({key:'',max:0,min:0,ghiChu:''}); state.settings.nguong=L; render(); };
  m.querySelectorAll('[data-rm]').forEach(b=>b.onclick=()=>{ read(); const k=L[+b.dataset.rm]; confirmBox(`Xóa dòng chỉ tiêu <b>${esc((k&&k.key)||'(trống)')}</b>?`, ()=>{ L.splice(+b.dataset.rm,1); state.settings.nguong=L; changed(); render(); }); });
  $('#ngSave').onclick=()=>{ read(); const gn={}; m.querySelectorAll('[data-gn]').forEach(td=>{ const v=pctIn(td.textContent); gn[td.dataset.gn]=v>0?v:GIANG0[td.dataset.gn]; }); if (gn.muaD<gn.muaV) gn.muaD=gn.muaV; if (gn.banD<gn.banV) gn.banD=gn.banV; state.settings.giaNg=gn; const cs={}; m.querySelectorAll('[data-cs]').forEach(td=>{ const v=pctIn(td.textContent); cs[td.dataset.cs]=v>0?v:CSNG0[td.dataset.cs]; }); if (cs.hi<cs.lo) cs.hi=cs.lo; state.settings.csNg=cs; state.settings.nguong=L.filter(x=>x.key); EDK.delete('ng'); calcCache=null; changed(); render(); toast('Đã lưu ngưỡng'); };
}
