//# Áp dụng / hoàn tác đề xuất, Đề xuất lại từ đầu
function applyProposalCore(d, ngay){ let nNew=0, nCut=0;
      d.chotRows.forEach(c=>{ if (!c.dc) return; const ln=bomInfo(c.tp).lanNgay||c.dc;
        if (c.dc>0) { let left=c.dc; const upto=d.monthDays.filter(x=>x<=d.lastDay && isWorkDay(x)); const days=upto.length?upto:d.monthDays.filter(isWorkDay); if (!days.length) return; const order=days.slice().reverse();
          const put=(ds, me)=>{ const ex=ordersOn(ds,c.tp); if (ex.length) { ex[0].dieuChinhMe=round(num(ex[0].dieuChinhMe)+me,6); ex[0].dcPM=round(num(ex[0].dcPM)+me,6); } else state.orders.push({_id:uid(), maLenh:genMaLenh(ds), ngayXuatNVL:ds, ngaySX:ds, maTP:c.tp, loaiDM:'DM', soMeKH:0, dieuChinhMe:me, dcPM:me, ghiChu:'Đề xuất SX'}); left=round(left-me,6); nNew++; };
          order.forEach(ds=>{ if (left<=0) return; const cur=sum(ordersOn(ds,c.tp),o=>num(o.soMeKH)+num(o.dieuChinhMe)); const lnD=bomInfo(c.tp,'DM',ds).lanNgay; const room=lnD ? Math.max(0, lnD-cur) : left; const me=Math.min(left, room); if (me>0) put(ds, me); });
          if (left>0) put(days[days.length-1], left); }
        else { let left=-c.dc; const os=state.orders.filter(o=>o.maTP===c.tp && selHas(o.ngaySX) && o.ngaySX<=d.lastDay).sort((a,b)=>b.ngaySX.localeCompare(a.ngaySX)); os.forEach(o=>{ if(left<=0) return; const cur=num(o.soMeKH)+num(o.dieuChinhMe); const cut=Math.min(cur,left); if(cut>0){ o.dieuChinhMe=round(num(o.dieuChinhMe)-cut,6); o.dcPM=round(num(o.dcPM)-cut,6); left-=cut; nCut++; } }); } });
       return {nNew,nCut}; }
function applyAdjCore(d){ d.rows.forEach(r=>state.adjustments.push({_id:uid(), ngaySX:(state.orders.find(o=>o.maLenh===r.maLenh)||{}).ngaySX||'', maTP:r.maTP||(state.orders.find(o=>o.maLenh===r.maLenh)||{}).maTP||'', maLenh:r.maLenh, maVT:r.maVT, dieuChinh:r.deXuat, lyDo:'Đề xuất PM – xử lý tồn âm'})); return d.rows.length; }
function undoProposal(){
  const inKy = o => selHas(o.ngayXuatNVL);
  const ords = state.orders.filter(inKy); const adjusted = ords.filter(o=>num(o.dieuChinhMe)); const created = ords.filter(o=>!num(o.soMeKH));
  const codes = new Set(ords.map(o=>o.maLenh)); const adj = state.adjustments.filter(a=>codes.has(a.maLenh));
  if (!adjusted.length && !created.length && !adj.length) return toast('Kỳ này chưa có điều chỉnh nào để hoàn tác');
  confirmBox(`Đưa kỳ ${fmtKy(selKy)} về trạng thái <b>lệnh kế hoạch gốc</b>?<br><span class="small mut">• Xóa toàn bộ Điều chỉnh mẻ trên ${adjusted.length} lệnh (kể cả phần sửa tay)<br>• Xóa ${created.length} lệnh không có mẻ kế hoạch (tạo từ đề xuất hoặc thêm tay ở Lệnh SX thực tế)<br>• Xóa ${adj.length} dòng Cân đối NVL của kỳ (kể cả nhập tay)<br>Sau đó chạy lại Đề xuất SX → Cập nhật lệnh → Đề xuất điều chỉnh NVL trên dữ liệu mới.</span>`, ()=>{
    undoCore(); changed(); render(); toast('Đã hoàn tác – kỳ trở về lệnh kế hoạch gốc');
  });
}
// fromK (YYYY-MM): xóa từ tháng đó trở về sau (các tháng chưa khóa); không truyền: chỉ kỳ đang xem
function undoCore(fromK){ const inKy = fromK ? (o => { const k=kyOf(o.ngayXuatNVL||''); return k>=fromK && !isLocked(k); }) : (o => selHas(o.ngayXuatNVL)); const ords = state.orders.filter(inKy); const codes = new Set(ords.map(o=>o.maLenh)); const created = new Set(ords.filter(o=>!num(o.soMeKH)).map(o=>o._id)); ords.forEach(o=>{ o.dieuChinhMe=0; o.dcPM=0; }); state.orders = state.orders.filter(o=>!created.has(o._id)); const om=new Set(state.orders.map(o=>o.maLenh)); const nA=state.adjustments.length; state.adjustments = state.adjustments.filter(a=>!codes.has(a.maLenh) && !(fromK && !om.has(a.maLenh) && kyOf(a.ngaySX||'')>=fromK && !isLocked(kyOf(a.ngaySX||'')))); return {ords:ords.length, created:created.size, adj:nA-state.adjustments.length}; }
function proposalDirty(){ const inKy = o => selHas(o.ngayXuatNVL); const ords=state.orders.filter(inKy); return ords.some(o=>num(o.dieuChinhMe)||!num(o.soMeKH)); }
function nextPlanDate(){ const ds=[...state.orders.map(o=>o.ngaySX), ...state.plan.map(r=>r.ngaySX)].filter(Boolean).sort(); const last = ds.length?ds[ds.length-1]:new Date().toISOString().slice(0,10); const d=new Date(last+'T00:00:00'); d.setDate(d.getDate()+1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

