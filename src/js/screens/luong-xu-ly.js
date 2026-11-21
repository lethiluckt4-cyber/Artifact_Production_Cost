// ---- Luồng xử lý: sơ đồ dữ liệu đi qua các khâu + kiểm tra đủ điều kiện tính giá thành ----
function luongChecks(){
  const c=calc(); const p=P(); const items=itemMap(); const R=[];
  const add=(id,khau,go,st,kq,ghi)=>R.push({id,khau,go,st,kq,ghi:ghi||''});
  const kys=c.list.filter(k=>selKyHas(k));
  const inc = e => { const g=GRID[e]; if (!g || !g.req) return 0; return state[e].filter(r=>!r._new && (g.noKy || !g.kyf || selHas(r[g.kyf])) && g.req.some(k=>{ const cc=g.cols.find(x=>x.k===k); return cc && cc.n ? !num(r[k]) : !r[k]; })).length; };
  // 1 Danh mục
  const missing=new Set(); const chk=ma=>{ if (ma && !items[ma]) missing.add(ma); };
  state.purchases.forEach(r=>chk(r.ma)); state.sales.forEach(r=>chk(r.ma)); state.bom.forEach(b=>{chk(b.maTP);chk(b.maNVL);}); state.orders.forEach(o=>chk(o.maTP)); state.issues.forEach(i=>chk(i.maVT));
  { const n=inc('items'); const e=[]; if (!state.items.length) e.push('Chưa có mã hàng'); if (n) e.push(`${n} mã thiếu thông tin bắt buộc`); if (missing.size) e.push(`${missing.size} mã phát sinh chưa có trong danh mục`);
    add('items','Danh mục hàng','d_items', e.length?'bad':'ok', e.length?e.join(' · '):`${fmtN(state.items.length)} mã – đủ thông tin`); }
  // 2 Số dư đầu kỳ
  { const rows=Object.values(state.opening.rows||{}); const sk=state.settings.startKy||state.opening.ky; const noKho=rows.filter(r=>!r.kho).length;
    if (!sk) add('opening','Số dư NXT đầu kỳ','d_opening','bad','Chưa đặt Kỳ bắt đầu');
    else if (noKho) add('opening','Số dư NXT đầu kỳ','d_opening','bad',`${noKho} mã thiếu kho`);
    else add('opening','Số dư NXT đầu kỳ','d_opening', rows.length?'ok':'warn', rows.length?`Kỳ bắt đầu ${kyMY(sk)} · ${fmtN(rows.length)} mã có tồn đầu`:`Kỳ bắt đầu ${kyMY(sk)} · chưa có tồn đầu (tính như tồn = 0)`); }
  // 3 Định mức
  { const noBom=[...new Set(state.orders.filter(o=>selHas(o.ngaySX)).map(o=>o.maTP+'|'+(o.loaiDM||'DM')))].filter(k=>{ const [tp,l]=k.split('|'); return !bomFor(tp,l).length; });
    const badBom=state.bom.filter(b=>!b.maNVL || !num(b.slNVL) || !num(b.slTP)).length;
    const soldNoBom=[...new Set(state.sales.filter(x=>selHas(x.ngay)).map(x=>x.ma))].filter(ma=>isFinal(items[ma]) && !state.bom.some(b=>b.maTP===ma));
    const e=[]; if (noBom.length) e.push(`${noBom.length} sản phẩm có lệnh nhưng chưa có định mức`); if (badBom) e.push(`${badBom} dòng định mức lỗi`);
    add('bom','Định mức','d_bom', e.length?'bad':(soldNoBom.length?'warn':'ok'), e.length?e.join(' · '):(soldNoBom.length?`${soldNoBom.length} thành phẩm có bán nhưng chưa có định mức: ${soldNoBom.join(', ')}`:`${fmtN(new Set(state.bom.map(b=>b.maTP)).size)} sản phẩm có định mức`)); }
  // 4 NVL thay thế (không bắt buộc)
  add('subs','NVL thay thế','d_subs','opt', state.subs&&state.subs.length?`${state.subs.length} quy tắc thay thế`:'Không có – không bắt buộc');
  // 5 Mua hàng
  { const L=state.purchases.filter(r=>selHas(r.ngayNhap)); const pc=purchaseChecks(); const noGia=L.filter(r=>(pc[r._id]||{}).short==='Thiếu đơn giá').length; const n=inc('purchases');
    const e=[]; if (n) e.push(`${n} dòng thiếu thông tin bắt buộc`); if (noGia) e.push(`${noGia} dòng chưa có đơn giá`);
    add('purchases','Mua hàng','d_purchases', e.length?'bad':(L.length?'ok':'warn'), e.length?e.join(' · '):(L.length?`${fmtN(L.length)} dòng mua trong kỳ`:'Chưa có mua hàng trong kỳ')); }
  // 6 Bán hàng
  { const L=state.sales.filter(r=>selHas(r.ngay)); const n=inc('sales');
    add('sales','Bán hàng','d_sales', n?'bad':(L.length?'ok':'warn'), n?`${n} dòng thiếu thông tin bắt buộc`:(L.length?`${fmtN(L.length)} dòng bán trong kỳ`:'Chưa có bán hàng trong kỳ')); }
  // 7 Xuất dùng chung
  { const L=state.issues.filter(r=>selHas(r.ngay)); const n=inc('issues'); add('issues','Xuất dùng chung','d_issues', n?'bad':'opt', n?`${n} dòng thiếu thông tin bắt buộc`:(L.length?`${fmtN(L.length)} phiếu trong kỳ`:'Không có – không bắt buộc')); }
  // 8 Chi phí 622/627
  { const t622=[], t627=[], cho=[]; kys.forEach(k=>{ const P2=c.periods[k]; if (!P2.orders.length) return; const m622=!costSum(P2.cost,'622'), m627=!costSum(P2.cost,'627'); if (!(m622||m627)) return; if (kyDangDo(k)) { cho.push(kyMY(k)); return; } if (m622) t622.push(kyMY(k)); if (m627) t627.push(kyMY(k)); });
    const e=[]; if (t622.length) e.push(`Chưa nhập 622 tháng ${t622.join(', ')}`); if (t627.length) e.push(`Chưa nhập 627 tháng ${t627.join(', ')}`);
    add('costs','Chi phí 622/627','d_costs', e.length?'bad':(cho.length?'warn':'ok'), e.length?e.join(' · '):(cho.length?`Tháng ${cho.join(', ')} chưa kết thúc – cuối tháng nhập 622/627 rồi Tính lại`:'Đã nhập đủ cho các tháng có sản xuất')); }
  // 9 Đề xuất sản xuất
  { const pp=pendingProposal(); add('plan','Đề xuất sản xuất','kehoach', pp.plan?'warn':'ok', pp.plan?`${selKy.length===7?'Tháng '+kyMY(selKy):'Kỳ đang xem'} chưa chạy đề xuất sản xuất – vào Giá thành bấm ▶ Tính giá thành`:'Đã chạy đề xuất / không cần'); }
  // 10 Lệnh sản xuất
  { const L=state.orders.filter(o=>selHas(o.ngaySX)); const dup=Object.values(state.orders.reduce((a,o)=>{a[o.maLenh]=(a[o.maLenh]||0)+1;return a;},{})).filter(v=>v>1).length; const adjTP=state.orders.filter(o=>num(o.dieuChinhTP) && !isFinal(items[o.maTP])).length;
    const soldFinal=state.sales.some(x=>selHas(x.ngay) && isFinal(items[x.ma])); const e=[]; if (dup) e.push(`${dup} mã lệnh bị trùng`); if (adjTP) e.push(`${adjTP} lệnh nhập +/- sai dòng`); if (!L.length && soldFinal) e.push('Có bán thành phẩm nhưng chưa có lệnh sản xuất');
    add('orders','Lệnh sản xuất','d_orders', e.length?'bad':(L.length?'ok':'opt'), e.length?e.join(' · '):(L.length?`${fmtN(L.length)} lệnh trong kỳ`:'Không có lệnh trong kỳ')); }
  // 11 Cân đối NVL
  { const mvm = pendingMoveMonths(); const mvn = mvm.reduce((a,x)=>a+x.n,0); const pm = pendingAdjMonths(); const pend = pm.reduce((a,x)=>a+x.n,0); const amNVL = p && !kyDangDo(kys[kys.length-1]) ? p.nxt.filter(x=>x.closeSL<-1e-9 && !isMade(items[x.ma]||{})).length : 0; const amDangDo = kys.length && kyDangDo(kys[kys.length-1]) && p && p.nxt.some(x=>x.closeSL<-1e-9 && !isMade(items[x.ma]||{})); const done = state.adjustments.filter(a=>selHas(a.ngaySX)).length;
    add('adj','Cân đối NVL','d_adjustments', (mvn||pend||amNVL)?'warn':'ok', mvn ? `Còn ${mvn} phiếu mua có thể chuyển ngày nhập kho ở ${mvm.length} tháng (${mvm.map(x=>'T'+(+x.k.slice(5))).join(', ')}) – vào Cân đối NVL bấm 📅 Chuyển ngày nhập kho trước, rồi mới cân đối phần còn thiếu` : pend ? `Còn đề xuất cân đối chưa áp dụng ở ${pm.length} tháng (${pm.map(x=>'T'+(+x.k.slice(5))).join(', ')}) – vào Cân đối NVL bấm ⚙ Cân đối theo đề xuất` : amNVL ? `Đã áp dụng hết đề xuất, nhưng còn ${amNVL} mã NVL âm kho không cân đối được – kiểm tra chứng từ mua / số dư đầu kỳ` : amDangDo ? `Tháng ${kyMY(kys[kys.length-1])} chưa kết thúc – NVL âm do chưa nhập đủ mua hàng, cuối tháng mới chuyển ngày nhập kho / cân đối` : `Đã áp dụng – không còn NVL âm kho${done?` (${fmtN(done)} dòng cân đối trong kỳ)`:''}`); }
  // 12 Tính giá thành
  { const badOrd = p ? p.orders.filter(o=>o.status!=='Đủ').length : 0; const noPrice = p ? new Set(p.lines.filter(l=>l.tong>0 && !l.dg).map(l=>l.maVT)).size : 0; const un = p ? Math.round(Math.abs(p.unalloc622||0)+Math.abs(p.unalloc627||0)) : 0;
    const e=[]; if (badOrd) e.push(`${fmtN(badOrd)} lệnh chưa đủ điều kiện tính`); if (noPrice) e.push(`${noPrice} NVL chưa có giá`);
    add('calc','Tính giá thành (621 + 622 + 627 = 154)','giathanh', e.length?'bad':(un?'warn':'ok'), e.length?e.join(' · '):(un?`${fmtN(un)} đ chi phí 622/627 chưa phân bổ (tháng không sản xuất)`:'Mọi lệnh đủ định mức và giá NVL')); }
  const nBad=R.filter(x=>x.st==='bad').length, nWarn=R.filter(x=>x.st==='warn').length;
  // 13 Kết quả
  add('out','Kết quả & báo cáo','nxt', nBad?'bad':'ok', nBad?'Chờ xử lý các khâu chưa đạt ở trên':'Giá thành, NXT, giá vốn và báo cáo đã sẵn sàng');
  return {R, nBad, nWarn};
}
function vLuong(m){
  const {R, nBad, nWarn}=luongChecks(); const by=Object.fromEntries(R.map(x=>[x.id,x]));
  const ST={ok:['✓','#15803d','#dcfce7','Đạt'], warn:['!','#b45309','#fef3c7','Cần xem'], bad:['✕','#b91c1c','#fee2e2','Chưa đạt'], opt:['–','#64748b','#f1f5f9','Không bắt buộc']};
  const INP=new Set(['items','opening','bom','subs','purchases','sales','issues','costs']);
  const node=(id,t,go)=>{ const x=by[id]; return `<div class="fnode ${INP.has(id)?'k-in':'k-pm'} st-${x.st}" data-lid="${id}" data-lgo="${go||x.go}" data-lt="${esc(t||x.khau)}" title="${esc(ST[x.st][3])}">${esc(t||x.khau)}</div>`; };
  const tier=(h,ids,kind)=>`<div class="ftier"><div class="fth">${h}</div><div class="frow">${ids.map(i=>Array.isArray(i)?node(i[0],i[1]):node(i)).join('')}</div></div>`;
  const down=()=>`<div class="fdown"><span>↓</span></div>`;
  const outN=[['nxt','Nhập – Xuất – Tồn'],['giathanh','Giá thành'],['banhang','Tổng hợp bán hàng'],['xuatphieu','File tải dữ liệu kế toán']].map(([v,t])=>node('out',t,v)).join('');
  const banner = nBad ? `<div class="fban bad">✕ Chưa đủ điều kiện tính giá thành – còn <b>${nBad}</b> khâu chưa đạt${nWarn?`, ${nWarn} khâu cần xem`:''}</div>` : nWarn ? `<div class="fban warn">! Đủ điều kiện tính giá thành – có <b>${nWarn}</b> khâu nên xem lại</div>` : `<div class="fban ok">✓ Đủ điều kiện tính giá thành – tất cả các khâu đã đạt</div>`;
  m.innerHTML = head('Luồng xử lý') +
  `<div class="box"><h3>Sơ đồ luồng dữ liệu</h3><div class="flowv">
    ${tier('1 · Dữ liệu nền – nhập một lần',['items','opening','bom','subs'])}
    ${down('mã · tồn đầu · định mức')}
    ${tier('2 · Phát sinh hằng ngày',['purchases','sales','issues','costs'])}
    ${down('giá mua bình quân · SL bán · chi phí')}
    ${tier('3 · Kế hoạch & sản xuất – theo tháng',['plan','orders','adj'])}
    ${down('lệnh × định mức = SL NVL xuất')}
    ${tier('4 · Tính giá thành',[['calc','Giá thành lệnh: 621 + 622 + 627 = 154']])}
    ${down('giá nhập kho · giá vốn bán')}
    <div class="ftier"><div class="fth">5 · Kết quả – báo cáo</div><div class="frow">${outN}</div></div>
    <div class="flg"><span><i class="lsw k-in"></i>Người dùng nhập</span><span><i class="lsw k-pm"></i>Phần mềm tự tính / lập</span><span style="color:#b91c1c;font-weight:600">Chữ đỏ: chưa đạt</span><span style="color:#b45309;font-weight:600">Chữ cam: cần xem</span></div>
  </div></div>`;

  bindKy();
  m.querySelectorAll('.flowv [data-lid]').forEach(b=>b.onclick=()=>{ const x=by[b.dataset.lid]; const st=ST[x.st]; const go=b.dataset.lgo; const nm=(NAV.find(n=>n.id===go)||{}).t||b.dataset.lt;
    modal(`<div class="tsh"><h3>${esc(b.dataset.lt)}</h3><button class="tsx" id="lgX" title="Đóng" aria-label="Đóng">${icon('x')}</button></div>
      <div class="pill" style="background:${st[2]};color:${st[1]};font-weight:600;margin:4px 0 10px;display:inline-block">${st[0]} ${st[3]}</div>
      <div style="line-height:1.6">${esc(x.kq)}</div>
      <div class="tsf"><span class="sp"></span><button class="btn" id="lgC">Đóng</button><button class="btn p" id="lgGo">Đi tới ${esc(nm)}</button></div>`);
    $('#modal .in').classList.add('tsm'); $('#lgX').onclick=closeModal; $('#lgC').onclick=closeModal;
    $('#lgGo').onclick=()=>{ closeModal(); guardEdit(()=>{ view=go; render(); }); }; });
}
