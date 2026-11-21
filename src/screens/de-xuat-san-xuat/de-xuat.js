//# Đề xuất sản xuất: tham số, buildProposal
// ---------- Kế hoạch & đề xuất sản xuất ----------
function capRule(maTP, date){ if(!date) return null; const c=state.caps.filter(x=>x.maTP===maTP && x.tuNgay && date>=x.tuNgay && date<=(x.denNgay||'9999-12-31')).sort((a,b)=>b.tuNgay.localeCompare(a.tuNgay)); return c[0]||null; }
function bomInfo(maTP, loai='DM', date){ const rows=bomFor(maTP, loai, date); const r=date?capRule(maTP,date):null; return {slTP: rows.length?num(rows[0].slTP):0, lanNgay: r? num(r.lanNgay) : (rows.length?num(rows[0].lanNgay):0), meThang: r? num(r.meThang):0, capSrc: r?'thời kỳ':'định mức', rows}; }
function ordersOn(ngay, maTP){ return state.orders.filter(o=>o.ngaySX===ngay && o.maTP===maTP); }
function planStatus(r){
  const os = ordersOn(r.ngaySX, r.maTP); const me = num(r.soMe);
  if (!os.length) return me>0 ? {code:'new', text:'Chưa có lệnh → tạo mới'} : {code:'none', text:'Không SX'};
  const cur = sum(os, o=>num(o.soMeKH)+num(o.dieuChinhMe));
  if (Math.abs(cur-me)<1e-9) return {code:'ok', text:`Đã khớp (${os.map(o=>o.maLenh).join(', ')})`};
  return {code:'upd', text:`Lệnh ${os[0].maLenh}: ${fmtQ(cur)} → ${fmtQ(me)} mẻ`};
}
function applyPlanRow(r){
  const os = ordersOn(r.ngaySX, r.maTP); const me=num(r.soMe);
  if (!os.length) { if (me>0) state.orders.push({_id:uid(), maLenh:genMaLenh(r.ngaySX), ngayXuatNVL:r.ngaySX, ngaySX:r.ngaySX, maTP:r.maTP, loaiDM:'DM', soMeKH:me, dieuChinhMe:0, ghiChu:'Từ kế hoạch SX'}); return; }
  const o=os[0]; o.dieuChinhMe = round(me - num(o.soMeKH), 6);
}
function proposalParams(){ const s=state.settings; return {tonLau: num(s.tonLau)||75, duPhong: num(s.duPhong)||5, boQua: s.boQua!=null && s.boQua!=='' ? num(s.boQua) : 0.1}; }
function buildProposal(p){
  const prm = proposalParams(); const items=itemMap(); const nx={}; p.nxt.forEach(x=>nx[x.ma]=x);
  const meTH = {}; p.orders.forEach(o=>meTH[o.maTP]=(meTH[o.maTP]||0)+o.soMe);
  const tps = state.items.filter(i=>i.nhom==='Thành phẩm').map(i=>i.ma).filter(ma=>bomFor(ma,'DM').length);
  // tỷ trọng giá trị từng NVL trong TP
  const share = {}; tps.forEach(tp=>{ const rows=bomFor(tp,'DM'); const tot=sum(rows,b=>num(b.slNVL)*(p.giaVon[b.maNVL]||0)); share[tp]={}; rows.forEach(b=>share[tp][b.maNVL]= tot? num(b.slNVL)*(p.giaVon[b.maNVL]||0)/tot : 0); });
  const tpDays = ma => { const x=nx[ma]; return x && x.bq>0 ? x.closeSL/x.bq : (x && x.closeSL>0 ? Infinity : 0); };
  const endDay = p.isRange ? rangeOf(p.ky).to : (p.isYear ? `${p.ky}-12-31` : `${p.ky}-${String(daysInMonth(p.ky)).padStart(2,'0')}`);
  // kỳ đang diễn ra: chỉ đề xuất / xếp mẻ đến hôm nay
  const capDay = (()=>{ const t=todayISO(); return t<endDay ? t : endDay; })();
  const lastDay0 = p.orders.length ? p.orders.map(o=>o.ngaySX).sort().pop() : endDay; const lastDay = lastDay0 < capDay ? lastDay0 : capDay;
  const remDays = Math.max(0, Math.round((new Date(endDay+'T00:00:00') - new Date(lastDay+'T00:00:00'))/86400000));
  const monthDays = (()=>{ const out=[]; if (p.isRange) { const r=rangeOf(p.ky); const d=new Date(r.from+'T00:00:00'); const end=new Date(r.to+'T00:00:00'); while (d<=end) { out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`); d.setDate(d.getDate()+1); } return out; } if (p.isYear) { for (let mth=1; mth<=12; mth++){ const k=`${p.ky}-${String(mth).padStart(2,'0')}`; for (let d=1; d<=daysInMonth(k); d++) out.push(`${k}-${String(d).padStart(2,'0')}`); } } else for (let d=1; d<=daysInMonth(p.ky); d++) out.push(`${p.ky}-${String(d).padStart(2,'0')}`); return out.filter(d=>d<=capDay); })();
  const dayLoad = {}; state.orders.forEach(o=>{ dayLoad[o.ngaySX+'|'+o.maTP]=(dayLoad[o.ngaySX+'|'+o.maTP]||0)+num(o.soMeKH)+num(o.dieuChinhMe); });
  const roomDays = tp => { const any = monthDays.some(d=>bomInfo(tp,'DM',d).lanNgay>0); if (!any) return null; return monthDays.filter(isWorkDay).map(d=>{ const ln=bomInfo(tp,'DM',d).lanNgay; return {d, room: ln ? Math.max(0, ln-(dayLoad[d+'|'+tp]||0)) : 0}; }).filter(x=>x.room>0); };
  const capLeft = tp => { const r=roomDays(tp); if (r===null) return Infinity; let cap=sum(r, x=>x.room); const mt = monthDays.map(d=>bomInfo(tp,'DM',d).meThang).find(v=>v>0); if (mt) { const sched = sum(monthDays, d=>dayLoad[d+'|'+tp]||0); cap=Math.min(cap, Math.max(0, mt-sched)); } return cap; };
  const reserved = {}; const resCap = {}; // NVL và năng lực đã giữ chỗ cho các đề xuất trước
  const ts0 = {}; tpSummary(p).forEach(x=>ts0[x.ma]=x);
  const laiKg = tp => { const s=ts0[tp]; return s && s.gb ? (s.gb - s.gv) : 0; };
  const limitByNVL = (tp, me, skipMa) => { // giới hạn mẻ tăng bởi NVL khác có tỷ trọng > boQua, rồi bởi năng lực còn lại trong kỳ
    let lim = me, by=''; const cap=Math.max(0, capLeft(tp)-(resCap[tp]||0)); if (cap<lim) { lim=cap; const bi=bomInfo(tp,'DM',monthDays[monthDays.length-1]); by=`năng lực còn trống trong tháng (${fmtQ(bi.lanNgay)} mẻ/ngày${bi.meThang?`, tối đa ${fmtQ(bi.meThang)} mẻ/tháng`:''} – theo ${bi.capSrc})`; }
    bomFor(tp,'DM').forEach(b=>{ if (b.maNVL===skipMa) return; const sh=share[tp][b.maNVL]||0; if (sh<=prm.boQua) return; const x=nx[b.maNVL]; const avail = x ? Math.max(0, x.closeSL - x.bq*prm.duPhong - (reserved[b.maNVL]||0)) : 0; const mx = num(b.slNVL)>0 ? Math.floor(avail/num(b.slNVL)) : me; if (mx<lim){ lim=mx; by=b.maNVL; } }); return {lim:Math.max(0,lim), by};
  };
  const reserve = (tp, me) => { bomFor(tp,'DM').forEach(b=>{ reserved[b.maNVL]=(reserved[b.maNVL]||0)+num(b.slNVL)*me; }); resCap[tp]=(resCap[tp]||0)+me; };
  const rankTPs = (list, nvlMa) => list.map(tp=>{ const q = nvlMa ? num((bomFor(tp,'DM').find(b=>b.maNVL===nvlMa)||{}).slNVL) : 0; return {tp, d:tpDays(tp), lai:laiKg(tp), q}; }).sort((a,b)=> (a.d-b.d) || (b.lai-a.lai) || (b.q-a.q));
  const rows=[];
  state.items.filter(i=>i.nhom==='NVLC').forEach(nvl=>{
    const x=nx[nvl.ma]; if(!x) return; const users = tps.filter(tp=>bomFor(tp,'DM').some(b=>b.maNVL===nvl.ma));
    if (!users.length) { if (x.closeSL!==0) rows.push({ma:nvl.ma, ten:nvl.ten, days:x.days, tp:'', tenTP:'', note:'NVLC không có thành phẩm phù hợp', st:'Chưa thể đề xuất', me:0}); return; }
    if (x.closeSL < 0) {
      const tp = users.sort((a,b)=>tpDays(b)-tpDays(a))[0]; const q=num(bomFor(tp,'DM').find(b=>b.maNVL===nvl.ma).slNVL); const can = q>0 ? Math.ceil(-x.closeSL/q) : 0; const slTPme=bomInfo(tp).slTP; const tonTP=(nx[tp]||{}).closeSL||0; const maxTP = slTPme>0 ? Math.max(0, Math.floor(tonTP/slTPme)) : 0; const me = Math.min(can, meTH[tp]||0, maxTP); const sau = x.closeSL + me*q;
      rows.push({ma:nvl.ma, ten:nvl.ten, days:x.days, tp, tenTP:(items[tp]||{}).ten, tpDays:tpDays(tp), bq:(nx[tp]||{}).bq||0, slTP:bomInfo(tp).slTP, q, meLT:-can, meTH:meTH[tp]||0, me:-me, note: me<can ? `Giảm ${me}/${can} mẻ (giới hạn: tồn TP ${fmtQ(tonTP)} = ${maxTP} mẻ, đã SX ${meTH[tp]||0} mẻ); vẫn thiếu ${fmtQ(-sau)} ${nvl.dvt}` : `Giảm ${me} mẻ đủ bù tồn âm`, st:'Giảm sản xuất'});
    } else if (x.days!=null && x.days > prm.tonLau) {
      let du = Math.max(0, x.closeSL - x.bq*prm.tonLau - (reserved[nvl.ma]||0)); const ranked = rankTPs(users, nvl.ma); let rank=0;
      ranked.forEach(r=>{ const tp=r.tp, q=r.q; if (!q || du<=0) return; rank++; const meLT = Math.floor(du/q); if (meLT<=0) return; const L = limitByNVL(tp, meLT, nvl.ma);
        const reason = `Ưu tiên ${rank}: tồn TP ${r.d===Infinity?'∞':fmtN(r.d,0)} ngày, lãi ${fmtN(r.lai)}/${items[tp]?items[tp].dvt:''}, dùng ${fmtQ(q)} ${nvl.dvt}/mẻ`;
        rows.push({ma:nvl.ma, ten:nvl.ten, days:x.days, tp, tenTP:(items[tp]||{}).ten, tpDays:r.d, bq:(nx[tp]||{}).bq||0, slTP:bomInfo(tp).slTP, q, meLT, meTH:meTH[tp]||0, me:L.lim, note: (L.lim<=0 ? (L.by.startsWith('năng lực') ? `Không tăng: hết ${L.by}` : `Không tăng: thiếu NVL chính ${L.by}`) : (L.lim<meLT ? `Chỉ tăng ${L.lim}/${meLT} mẻ; giới hạn bởi ${L.by}` : `Tăng ${L.lim} mẻ`)) + ' · ' + reason, st:'Tăng sản xuất'});
        if (L.lim>0) { reserve(tp, L.lim); du = Math.max(0, du - L.lim*q); } });
      if (rank===0) rows.push({ma:nvl.ma, ten:nvl.ten, days:x.days, tp:'', tenTP:'', note:'Không có thành phẩm dùng NVLC này', st:'Chưa thể đề xuất', me:0});
    }
  });
  // thành phẩm âm
  state.items.filter(i=>i.nhom==='Thành phẩm').forEach(tp=>{ const x=nx[tp.ma]; if(!x || x.closeSL>=0) return; const info=bomInfo(tp.ma); if(!info.slTP) return; const can=Math.ceil(-x.closeSL/info.slTP); const L=limitByNVL(tp.ma, can, null); if (L.lim>0) reserve(tp.ma, L.lim);
    rows.push({ma:'', ten:'(Thành phẩm âm kho)', days:null, tp:tp.ma, tenTP:tp.ten, tpDays:0, bq:x.bq, slTP:info.slTP, q:0, meLT:can, meTH:meTH[tp.ma]||0, me:L.lim, note: L.lim<can ? `Chỉ tăng ${L.lim}/${can} mẻ; giới hạn bởi ${L.by||'NVL'}` : `Tăng ${can} mẻ bù tồn âm ${fmtQ(-x.closeSL)}`, st:'Thành phẩm âm'}); });
  rows.forEach((r,i)=>r.stt=i+1);
  // chốt theo TP: giảm ưu tiên, tăng lấy mức thấp nhất giữa các NVLC liên quan
  const chot={}; rows.filter(r=>r.tp).forEach(r=>{ const c=chot[r.tp]||(chot[r.tp]={tp:r.tp, ten:r.tenTP, meTH:r.meTH, giam:0, tang:null}); if (r.me<0) c.giam=Math.min(c.giam, r.me); else if (r.st==='Tăng sản xuất'||r.st==='Thành phẩm âm') c.tang = (c.tang||0) + r.me; });
  const ts = {}; tpSummary(p).forEach(x=>ts[x.ma]=x);
  const chotRows = Object.values(chot).map(c=>{ const dc = c.giam<0 ? c.giam : (c.tang||0); const slTP=bomInfo(c.tp).slTP; const gt = ts[c.tp] ? ts[c.tp].gtdv : (p.giaVon[c.tp]||0); return {...c, dc, sau:c.meTH+dc, giaTri: dc*slTP*gt, slTP}; });
  // NVL cần bổ sung cho mẻ tăng
  const need=[]; chotRows.filter(c=>c.dc>0).forEach(c=>{ bomFor(c.tp,'DM').forEach(b=>{ const nc=num(b.slNVL)*c.dc; const ton=(nx[b.maNVL]||{}).closeSL||0; const thieu=Math.max(0, nc-ton); if (thieu>0) need.push({tp:c.tp, ma:b.maNVL, ten:(items[b.maNVL]||{}).ten||'', dvt:(items[b.maNVL]||{}).dvt||'', me:c.dc, nc, ton, thieu, gt: thieu*(p.giaVon[b.maNVL]||0)}); }); });
  return {rows, chotRows, need, prm, remDays, lastDay, roomDays, monthDays};
}
// Đề xuất điều chỉnh NVL khi tồn cuối âm (logic cột AM file Excel): giảm xuất tại các dòng làm tồn trong ngày âm

