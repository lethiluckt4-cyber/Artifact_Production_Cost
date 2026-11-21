// Bù hao hụt cho lệnh đã có: tăng lệnh sản phẩm chính sao cho SL đạt (1 − tỷ lệ lỗi) lũy kế = SL lệnh gốc lũy kế, làm tròn mẻ.
// Lưu SL gốc vào trường slGoc để hoàn tác được. Bỏ qua tháng đã khóa.
function loiCompPlan(){ const out=[]; spLoiList().filter(r=>r.maSP && num(r.tyLe)>0).forEach(r=>{ const k=1-num(r.tyLe);
    const ords=state.orders.filter(o=>o.maTP===r.maSP && (!r.tuKy || kyOf(o.ngaySX)>=r.tuKy) && !isLocked(kyOf(o.ngaySX))).sort((a,b)=>(a.ngaySX+a.maLenh).localeCompare(b.ngaySX+b.maLenh));
    let cumO=0, cumN=0; ords.forEach(o=>{ const orig = o.slGoc!=='' && o.slGoc!=null ? num(o.slGoc) : num(o.slKH); const bs=batchSize(o.maTP, o.ngaySX)||0; cumO+=orig;
      const t = bs ? Math.ceil(round(cumO/k/bs,9))*bs : round(cumO/k,4); const x=Math.max(0, round(t-cumN,6)); cumN+=x; out.push({o, rule:r, orig, cur:num(o.slKH), nw:x}); }); });
  return out; }
function loiCompSimulate(plan){ const keep=plan.map(x=>[x.o, x.o.slKH]); let res;
  try { plan.forEach(x=>x.o.slKH=x.nw); calcCache=null; const c=calc(); res={}; c.list.forEach(ky=>{ const P=c.periods[ky]; res[ky]=P.nxt.filter(n=>n.closeSL<-1e-6).map(n=>({ma:n.ma, sl:n.closeSL})); }); }
  finally { keep.forEach(([o,v])=>o.slKH=v); calcCache=null; } return res; }
function loiCompApply(plan){ let n=0; plan.forEach(x=>{ if (x.nw!==x.cur) { if (x.o.slGoc==='' || x.o.slGoc==null) x.o.slGoc=x.orig; x.o.slKH=x.nw; const tag=`Bù hao hụt SP lỗi ${fmtP(num(x.rule.tyLe))} (SL gốc ${fmtQ(x.orig)})`; x.o.ghiChu = (x.o.ghiChu||'').replace(/\s*·?\s*Bù hao hụt SP lỗi[^·]*$/,'').trim(); x.o.ghiChu = (x.o.ghiChu? x.o.ghiChu+' · ':'')+tag; n++; } }); return n; }
function loiCompUndo(){ let n=0; state.orders.forEach(o=>{ if (o.slGoc!=='' && o.slGoc!=null && !isLocked(kyOf(o.ngaySX))) { o.slKH=num(o.slGoc); o.slGoc=''; o.ghiChu=(o.ghiChu||'').replace(/\s*·?\s*Bù hao hụt SP lỗi[^·]*$/,'').trim(); n++; } }); return n; }
function vLoi(m){
  const items=itemMap(); const L=spLoiList().map(r=>({...r})); const made=state.items.filter(x=>isMade(x)&&!isFinal(x)); const lois=state.items.filter(x=>isLoi(x));
  const p=P(); const tk=ktSettings();
  const kyIn = k => k ? `${k.slice(5,7)}/${k.slice(0,4)}` : '';
  m.innerHTML = head(`Sản phẩm lỗi (hỏng trong định mức)`) + `

  <div class="box"><h3>Quy tắc sản phẩm lỗi</h3>
  <div class="tw" style="max-height:none"><table><thead><tr><th>Sản phẩm chính</th><th>Tên</th><th>Mã sản phẩm lỗi</th><th>Tên sản phẩm lỗi</th><th class="n">Tỷ lệ lỗi (%)</th><th class="n">Giá bán ước tính (đ/ĐVT)</th><th>Áp dụng từ kỳ (mm/yyyy)</th><th>Ghi chú</th><th></th></tr></thead><tbody>
  ${L.length ? L.map((r,i)=>`<tr><td><select data-li="${i}" data-f="maSP">${made.map(x=>`<option ${x.ma===r.maSP?'selected':''}>${esc(x.ma)}</option>`).join('')}</select></td><td class="mut">${esc((items[r.maSP]||{}).ten||'')}</td>
    <td><select data-li="${i}" data-f="maLoi"><option value=""></option>${lois.map(x=>`<option ${x.ma===r.maLoi?'selected':''}>${esc(x.ma)}</option>`).join('')}</select></td><td class="mut">${esc((items[r.maLoi]||{}).ten|| (r.maLoi?'⚠ chưa có trong danh mục':'⚠ chọn mã (nhóm Sản phẩm lỗi)'))}</td>
    <td class="n"><input type="text" data-li="${i}" data-f="tyLe" value="${fmtQ(round(num(r.tyLe)*100,4))}" style="width:70px;text-align:right"></td>
    <td class="n"><input type="text" data-li="${i}" data-f="gia" value="${fmtN(num(r.gia))}" style="width:110px;text-align:right"></td>
    <td><input type="text" data-li="${i}" data-f="tuKy" value="${kyIn(r.tuKy)}" placeholder="01/2026" style="width:90px"></td>
    <td><input type="text" data-li="${i}" data-f="ghiChu" value="${esc(r.ghiChu||'')}" style="width:260px"></td><td class="act"><button class="btn s d edonly" data-lrm="${i}">Xóa</button></td></tr>`).join('') : '<tr><td colspan="9" class="mut">Chưa có quy tắc.</td></tr>'}
  </tbody></table></div>
  <div class="bar edonly" style="margin-top:8px"><button class="btn" id="loiAdd">+ Thêm quy tắc</button>
   <span class="small mut">Mã sản phẩm lỗi phải có trong Danh mục hàng, nhóm <b>Sản phẩm lỗi</b>. Tỷ lệ gõ 7 hoặc 7% = 7%.</span></div>
  <div class="bar edbar" id="egLoi" style="margin-top:8px"><button class="btn p edonly edsave" id="loiSave">${icon('save')}<span>Lưu quy tắc sản phẩm lỗi</span></button></div></div>
  <div class="box" id="loiCompBox"><h3>Lệnh sản xuất đã có trước khi tính hao hụt</h3>
   
   <div class="bar" style="margin-top:8px"><button class="btn" id="loiCompPrev">🔍 Xem trước thay đổi lệnh</button><button class="btn p" id="loiCompDo">⚙ Bù hao hụt cho lệnh đã có</button><button class="btn" id="loiCompUndo">↩ Hoàn tác (trả SL lệnh gốc)</button></div>
   <div id="loiCompOut"></div></div>`;
  bindKy();
  editGate($('#egLoi').closest('.box'), 'loi', $('#egLoi'), ()=>state.settings.spLoi||null, v=>{ if (v==null) delete state.settings.spLoi; else state.settings.spLoi=v; changed(); });
  const read = () => { const rows=L.map(r=>({...r})); m.querySelectorAll('[data-li]').forEach(el=>{ const r=rows[+el.dataset.li]; const f=el.dataset.f; let v=el.value.trim();
      if (f==='tyLe') { let x=num(v.replace('%','')); r.tyLe = x>=1 ? x/100 : x; } else if (f==='gia') r.gia=num(v); else if (f==='tuKy') r.tuKy = v ? toKy(v) : ''; else r[f]=v; }); return rows; };
  const compInfo=()=>{ const pl=loiCompPlan(); const ch=pl.filter(x=>x.nw!==x.cur); const done=state.orders.filter(o=>o.slGoc!==''&&o.slGoc!=null).length; void ch; void done; return pl; };
  compInfo();
  $('#loiCompPrev').onclick=()=>{ const pl=compInfo(); const ch=pl.filter(x=>x.nw!==x.cur); const sim=loiCompSimulate(pl); const by={};
    pl.forEach(x=>{ const k=kyOf(x.o.ngaySX); const y=by[k]||(by[k]={n:0,ch:0,cur:0,nw:0}); y.n++; if(x.nw!==x.cur) y.ch++; y.cur+=x.cur; y.nw+=x.nw; });
    const rows=Object.entries(by).sort().map(([k,y])=>({k, ...y, neg:(sim[k]||[]).map(n=>`${n.ma} ${fmtQ(n.sl)}`).join(', ')}));
    $('#loiCompOut').innerHTML = rows.length ? table([{t:'Tháng',f:x=>fmtKy(x.k)},{t:'Số lệnh',n:1,f:x=>x.n,sum:1},{t:'Lệnh thay đổi',n:1,f:x=>x.ch,sum:1},{t:'SL lệnh hiện tại',n:1,d:2,f:x=>x.cur,sum:1},{t:'SL lệnh sau khi bù',n:1,d:2,f:x=>x.nw,sum:1},{t:'Tăng thêm',n:1,d:2,f:x=>x.nw-x.cur,sum:1},{t:'Mã tồn âm sau khi bù (tồn cuối tháng)',f:x=>x.neg||'Không'}], rows, {total:true}) + `<div class="small mut" style="margin-top:4px">${ch.length} lệnh sẽ thay đổi. Đây chỉ là xem trước – chưa lưu.</div>` : '<div class="mut small">Không có lệnh nào trong kỳ áp dụng.</div>'; enhanceTables($('#loiCompOut')); };
  $('#loiCompDo').onclick=()=>{ const pl=loiCompPlan(); const ch=pl.filter(x=>x.nw!==x.cur); if (!ch.length) return toast('Không có lệnh nào cần điều chỉnh'); confirmBox(`Tăng <b>${ch.length}</b> lệnh sản phẩm chính để bù hao hụt sản phẩm lỗi (tổng ${fmtQ(sum(ch,x=>x.cur))} → ${fmtQ(sum(ch,x=>x.nw))}). SL gốc được lưu để hoàn tác. Nên <b>Sao lưu (.json)</b> trước. Tiếp tục?`, ()=>{ const n=loiCompApply(pl); changed(); render(); toast(`Đã điều chỉnh ${n} lệnh – bấm ▶ Tính giá thành để cập nhật`, 4500); }); };
  $('#loiCompUndo').onclick=()=>{ const n=state.orders.filter(o=>o.slGoc!==''&&o.slGoc!=null).length; if (!n) return toast('Chưa có lệnh nào được bù hao hụt'); confirmBox(`Trả <b>${n}</b> lệnh về SL lệnh gốc?`, ()=>{ const k=loiCompUndo(); changed(); render(); toast(`Đã hoàn tác ${k} lệnh`); }); };
  $('#loiAdd').onclick=()=>{ const rows=read(); rows.push({maSP:(made[0]||{}).ma||'', maLoi:'', tyLe:0, gia:0, tuKy:'', ghiChu:''}); state.settings.spLoi=rows; render(); };
  m.querySelectorAll('[data-lrm]').forEach(b=>b.onclick=()=>confirmBox('Xóa quy tắc sản phẩm lỗi này?', ()=>{ const rows=read(); rows.splice(+b.dataset.lrm,1); state.settings.spLoi=rows; changed(); render(); }));
  $('#loiSave').onclick=()=>{ const rows=read(); const im=itemMap();
    for (const r of rows) { if (!r.maSP || !r.maLoi) return toast('Chọn đủ Sản phẩm chính và Mã sản phẩm lỗi', 4000); if (!isLoi(im[r.maLoi])) return toast(`Mã ${r.maLoi} phải thuộc nhóm "Sản phẩm lỗi" trong Danh mục hàng`, 4500); if (!(r.tyLe>=0 && r.tyLe<1)) return toast('Tỷ lệ lỗi phải từ 0% đến dưới 100%', 4000); if (r.tyLe>0 && !(r.gia>=0)) return toast('Giá bán ước tính không hợp lệ'); }
    if (new Set(rows.map(r=>r.maSP+'|'+r.tuKy)).size!==rows.length) return toast('Trùng quy tắc cho cùng sản phẩm và kỳ', 4000);
    state.settings.spLoi=rows; EDK.delete('loi'); changed(); render(); toast('Đã lưu quy tắc sản phẩm lỗi', 3000); };
}
