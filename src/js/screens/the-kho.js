// ---- Thẻ kho: chi tiết nhập – xuất – tồn của 1 mặt hàng trong kỳ đang chọn ----
function theKhoData(ma, ky){ ky = ky || selKy;
  const c=calc(); const kys = isRange(ky) ? (({from,to})=>c.list.filter(k=>k>=from.slice(0,7) && k<=to.slice(0,7)))(rangeOf(ky)) : ky.length===4 ? c.list.filter(k=>k.startsWith(ky)) : c.list.filter(k=>k===ky);
  if (!kys.length) return null; const items=itemMap(); const tenOf=k=>(items[k]||{}).ten||''; const rng=isRange(ky)?rangeOf(ky):null; let openSet=false;
  // lệnh SX nhập kho ở kỳ nào: kỳ của ngày SX, nhưng không sớm hơn kỳ xuất NVL
  const nhapSX={}, ordId={}; c.list.forEach(k=>c.periods[k].orders.forEach(o=>{ if (o.maLenh) ordId[o.maLenh]=o.o._id; const nk = (kyOf(o.ngaySX)||k) > k ? kyOf(o.ngaySX) : k; (nhapSX[nk]=nhapSX[nk]||[]).push(o); }));
  const out=[]; const P0=c.periods[kys[0]]; const o0=P0.open[ma]||{sl:0,tt:0}; let tSL=o0.sl, tTT=o0.tt;
  out.push({cls:'tot', nv:'Tồn đầu kỳ', d:'', tonSL:tSL, tonTT:tTT});
  const T={nSL:0,nTT:0,xSL:0,xTT:0}; const multi=kys.length>1;
  kys.forEach(k=>{ const P=c.periods[k]; const gv=P.giaVon[ma]||0; const ev=[];
    state.purchases.filter(r=>r.ma===ma && kyOf(r.ngayNhap)===k).forEach(r=>ev.push({d:r.ngayNhap, o:0, src:['purchases',r._id], nv:'Mua hàng', ct:r.hoaDon||'', kh:r.ncc||'', dg:r.ghiChu||'', nSL:num(r.sl), nTT:num(r.tt)}));
    (nhapSX[k]||[]).forEach(o=>{ if (o.maTP===ma && o.slDat) ev.push({d:o.ngaySX, o:1, src:['orders',o.o._id], nv:'Nhập kho sản xuất', ct:o.maLenh||'', kh:'', dg:`Nhập từ lệnh SX${o.slLoi>0?` (đã trừ ${fmtN(o.slLoi,2)} SP lỗi)`:''}`, nSL:o.slDat, nTT:o.gtNhap});
      if (o.maLoi===ma && o.slLoi>0) ev.push({d:o.ngaySX, o:1, src:['orders',o.o._id], nv:'Nhập sản phẩm lỗi', ct:o.maLenh||'', kh:'', dg:`Lỗi từ ${o.maTP} – ${tenOf(o.maTP)}`, nSL:o.slLoi, nTT:o.thuHoi}); });
    P.lines.forEach(l=>{ if (l.maVT===ma && l.tong) ev.push({d:l.ngayXuatNVL, o:2, src:ordId[l.maLenh]?['orders',ordId[l.maLenh]]:null, nv:'Xuất sản xuất', ct:l.maLenh||'', kh:'', dg:`Cho ${l.maTP} – ${tenOf(l.maTP)}${l.dc?` (cân đối ${fmtN(l.dc,2)})`:''}`, xSL:l.tong}); });
    P.issues.forEach(x=>{ if (x.ma===ma && x.sl) ev.push({d:x.r.ngay, o:3, src:['issues',x.r._id], nv:`Xuất dùng chung (${x.loai})`, ct:x.r.maPhieu||'', kh:'', dg:x.r.lyDo||'', xSL:x.sl}); });
    P.sales.forEach(x=>{ if (x.ma===ma && x.sl) ev.push({d:x.ngay, o:4, src:['sales',x.r._id], nv:'Bán hàng', ct:x.hoaDon||'', kh:x.khach||'', dg:x.r.ghiChu||'', xSL:x.sl}); });
    ev.sort((a,b)=>String(a.d).localeCompare(String(b.d)) || a.o-b.o || String(a.ct).localeCompare(String(b.ct)));
    const M={nSL:0,nTT:0,xSL:0,xTT:0};
    // xem theo khoảng ngày: phát sinh trước "từ ngày" cộng vào tồn đầu, sau "đến ngày" bỏ qua
    ev.forEach(e=>{ if (rng && String(e.d)<rng.from) { if (e.nSL!=null) { tSL+=e.nSL; tTT+=e.nTT; } else { tSL-=e.xSL; tTT-=e.xSL*gv; } tSL=round(tSL,9); } });
    if (!openSet) { out[0].tonSL=tSL; out[0].tonTT=tSL===0?0:tTT; openSet=true; }
    ev.filter(e=>!rng || (String(e.d)>=rng.from && String(e.d)<=rng.to)).forEach(e=>{ if (e.nSL!=null) { e.dgia = e.nSL ? e.nTT/e.nSL : 0; tSL+=e.nSL; tTT+=e.nTT; M.nSL+=e.nSL; M.nTT+=e.nTT; } else { e.xTT=e.xSL*gv; e.dgia=gv; tSL-=e.xSL; tTT-=e.xTT; M.xSL+=e.xSL; M.xTT+=e.xTT; } tSL=round(tSL,9); e.tonSL=tSL; e.tonTT=tSL===0?0:tTT; out.push(e); });
    if (!rng || `${k}-${String(daysInMonth(k)).padStart(2,'0')}` <= rng.to) { const cl=P.close[ma]||{sl:0,tt:0}; tSL=cl.sl; tTT=cl.tt; } // khớp đúng tồn cuối trên bảng NXT (tháng trọn)
    Object.keys(T).forEach(q=>T[q]+=M[q]);
    if (multi) out.push({cls:'sub', nv:`Cộng tháng ${fmtKy(k)}`, ...M, dgia:gv, dgLbl:'Giá vốn BQ', tonSL:tSL, tonTT:tTT});
  });
  out.push({cls:'tot', nv:'Cộng phát sinh · tồn cuối kỳ', ...T, tonSL:tSL, tonTT:tTT});
  return {rows:out, it:items[ma]||{ma, ten:''}};
}
const ctLink = r => r.src ? `<a href="#" class="malink" data-ed="${esc(r.src[0])}|${esc(r.src[1])}" title="Mở chứng từ để xem / sửa">${esc(r.ct||'(chưa có số)')}</a>` : esc(r.ct||'');
function bindCtLinks(root, back){ root.querySelectorAll('a[data-ed]').forEach(a=>a.onclick=e=>{ e.preventDefault(); e.stopPropagation(); const [ent,id]=a.dataset.ed.split('|'); openChungTu(ent, id, back); }); }
const tkJson = r=>({...(r.ma!=null?{'Kho':r.kho||'','Mã':r.ma,'Mặt hàng':r.ten||''}:{}), 'Ngày':r.cls?'':fmtD(r.d), 'Nghiệp vụ':r.nv, 'Chứng từ / lệnh':r.ct||'', 'Tên khách hàng':r.kh||'', 'Nhập SL':r.nSL??'', 'Nhập giá trị':r.nTT==null?'':round(r.nTT,0), 'Xuất SL':r.xSL??'', 'Xuất giá trị':r.xTT==null?'':round(r.xTT,0), 'Đơn giá':(r.cls&&r.cls!=='sub')||r.dgia==null?'':round(r.dgia,2), 'Tồn SL':r.tonSL??'', 'Tồn giá trị':r.tonTT==null?'':round(r.tonTT,0)});
function nxtChiTietRows(list){ const out=[]; list.forEach(x=>{ const D=theKhoData(x.ma); if (!D) return; const ev=D.rows.filter(r=>!r.cls); if (!ev.length && !x.openSL && !x.closeSL && !x.openTT && !x.closeTT) return;
  D.rows.forEach(r=>out.push({...r, kho:x.kho, ma:x.ma, ten:x.ten, nv: r.cls==='tot' && r.nv.startsWith('Cộng phát sinh') ? 'Cộng phát sinh · tồn cuối' : r.nv})); }); return out; }
function nxtChiTietHtml(list){
  const all=nxtChiTietRows(list); const MAX=1500; const rows=all.slice(0,MAX);
  const nf=(v,d)=>v==null||v===''?'':fmtN(v,d||0); const nc=(v,d)=>`<td class="n ${typeof v==='number'&&v<0?'neg':''}">${nf(v,d)}</td>`;
  const body=rows.map(r=>`<tr class="${r.cls?('ctsum '+(r.cls==='sub'?'ctsub':'cttot')):''}"><td>${esc(r.kho||'')}</td><td>${esc(r.ma)}</td><td>${esc(r.ten||'')}</td>${r.cls?`<td></td><td>${esc(r.nv)}</td><td></td><td></td>`:`<td>${esc(fmtD(r.d))}</td><td>${esc(r.nv)}</td><td>${ctLink(r)}</td><td>${esc(r.kh)}</td>`}${nc(r.nSL,2)}${nc(r.nTT)}${nc(r.xSL,2)}${nc(r.xTT)}${nc(r.cls?(r.cls==='sub'?r.dgia:null):r.dgia)}${nc(r.tonSL,2)}${nc(r.tonTT)}</tr>`).join('');
  return (all.length>MAX?`<div class="small mut" style="margin:4px 0">Đang hiện ${fmtN(MAX)} / ${fmtN(all.length)} dòng – chọn kho, nhóm hoặc tìm mã để xem gọn hơn; nút Xuất Excel vẫn xuất đủ.</div>`:'') +
  `<div class="tw"><table class="thekho" data-freeze="3"><thead><tr><th>Kho</th><th>Mã</th><th>Mặt hàng</th><th>Ngày</th><th>Nghiệp vụ</th><th>Chứng từ / lệnh</th><th>Tên khách hàng</th><th class="n">Nhập SL</th><th class="n">Nhập giá trị</th><th class="n">Xuất SL</th><th class="n">Xuất giá trị</th><th class="n">Đơn giá</th><th class="n">Tồn SL</th><th class="n">Tồn giá trị</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function theKho(ma, ky){ ky = ky || selKy;
  const D=theKhoData(ma, ky); if (!D) return toast('Kỳ này chưa có số liệu');
  // chọn nhanh thời gian ngay trong thẻ kho (không đổi kỳ của màn hình NXT)
  const y=workYear(), ms=calc().list.filter(k=>k.startsWith(y)); const lastD=k=>`${k}-${String(daysInMonth(k)).padStart(2,'0')}`;
  const rk=(a,b)=>`R:${a}-01:${lastD(b)}`; const cur=isRange(ky)?rangeOf(ky):null;
  const qs=[1,2,3,4].map(q=>[`${y}-${String(q*3-2).padStart(2,'0')}`,`${y}-${String(q*3).padStart(2,'0')}`]).filter(([a,b])=>ms.some(k=>k>=a&&k<=b));
  const isQ=qs.some(([a,b])=>rk(a,b)===ky); const isR=!!cur && !isQ; const opt=(v,t,sel)=>`<option value="${v}" ${sel?'selected':''}>${t}</option>`;
  const kySel=`<select id="tkKy" style="font-weight:400">${opt(y,'Cả năm '+y,ky===y)}${ms.map(k=>opt(k,'Tháng '+(+k.slice(5)),k===ky)).join('')}${qs.map(([a,b])=>opt(rk(a,b),'Quý '+['I','II','III','IV'][(+a.slice(5)-1)/3],rk(a,b)===ky)).join('')}${opt('RANGE','Từ ngày – đến ngày',isR)}</select>`;
  const dF=cur?cur.from:(ky.length===7?`${ky}-01`:`${ms[0]}-01`), dT=cur?cur.to:(ky.length===7?lastD(ky):lastD(ms[ms.length-1]));
  const rngUI=`<span id="tkRng" style="display:${isR?'inline-flex':'none'};gap:6px;align-items:center"><input type="date" id="tkF" value="${dF}" style="padding:4px"> → <input type="date" id="tkT" value="${dT}" style="padding:4px"><button class="btn s p" id="tkGo">Xem</button></span>`;
  const nf=(v,d)=>v==null||v===''?'':fmtN(v,d||0); const nc=(v,d)=>`<td class="n ${typeof v==='number'&&v<0?'neg':''}">${nf(v,d)}</td>`;
  const body=D.rows.map(r=>`<tr class="${r.cls||''}">${r.cls?`<td colspan="4" style="font-weight:600">${esc(r.nv)}</td>`:`<td>${esc(fmtD(r.d))}</td><td>${esc(r.nv)}</td><td>${ctLink(r)}</td><td>${esc(r.kh)}</td>`}${nc(r.nSL,2)}${nc(r.nTT)}${nc(r.xSL,2)}${nc(r.xTT)}${nc(r.cls?(r.cls==='sub'?r.dgia:null):r.dgia)}${nc(r.tonSL,2)}${nc(r.tonTT)}</tr>`).join('');
  modal(`<h3>Chi tiết nhập – xuất – tồn: ${esc(ma)} – ${esc(D.it.ten||'')}</h3>
  <div class="small" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:2px 0 8px"><span class="kylbl">Xem:</span>${kySel}${rngUI}</div>
  <div class="tw" style="max-height:62vh"><table class="thekho"><thead><tr><th>Ngày</th><th>Nghiệp vụ</th><th>Chứng từ / lệnh</th><th>Tên khách hàng</th><th class="n">Nhập SL</th><th class="n">Nhập giá trị</th><th class="n">Xuất SL</th><th class="n">Xuất giá trị</th><th class="n">Đơn giá</th><th class="n">Tồn SL</th><th class="n">Tồn giá trị</th></tr></thead><tbody>${body}</tbody></table></div>
  <div style="text-align:right;margin-top:12px"><button class="btn" id="tkXl">Xuất Excel thẻ kho</button> <button class="btn p" id="mc">Đóng</button></div>`);
  $('#modal .in').style.maxWidth='1340px'; bindCtLinks($('#modal'), ()=>{ view='nxt'; render(); theKho(ma, ky); });
  $('#tkKy').onchange=e=>{ if (e.target.value==='RANGE') { $('#tkRng').style.display='inline-flex'; return; } theKho(ma, e.target.value); };
  $('#tkGo').onclick=()=>{ let a=$('#tkF').value, b=$('#tkT').value; if (!a||!b) return toast('Chọn đủ từ ngày và đến ngày'); if (a>b) [a,b]=[b,a]; theKho(ma, `R:${a}:${b}`); };
  $('#mc').onclick=()=>{ closeModal(); render(); };
  $('#tkXl').onclick=()=>exportTable($('#modal .tw table'), `TheKho_${ma}_${String(ky).replace(/[:\/]/g,'-')}.xlsx`, 'The kho');
}
