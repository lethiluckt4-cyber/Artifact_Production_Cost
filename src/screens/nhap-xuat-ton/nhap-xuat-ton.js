//# Màn hình Nhập – Xuất – Tồn, thẻ kho
// ---- NXT ----
function nxtClass(x){ const s=x.status||''; if (/Âm kho|cần mua|quá dư|trên 1 năm/.test(s)) return 'Rủi ro cao'; if (s) return 'Cảnh báo'; return 'OK'; }
function nxtClassPill(c){ return `<span class="pill ${c==='Rủi ro cao'?'bad':c==='Cảnh báo'?'warn':'ok'}">${c}</span>`; }
let pickSel = {}, pickOpen = null;   // pickSel[key]: undefined = tất cả; [] = bỏ chọn hết
function pickFn(key){ const sel=pickSel[key]; return v => sel==null || sel.includes(v); }
function pickVals(key, opts){ const sel=pickSel[key]; return sel==null ? [] : sel.filter(v=>opts.includes(v)); }
function pickHtml(key, label, opts){ const all=pickSel[key]==null; const sel=all?opts.map(o=>o[0]):pickSel[key].filter(v=>opts.some(o=>o[0]===v)); const txt = (all||sel.length===opts.length) ? 'Tất cả' : (sel.length ? sel.join(', ') : 'Chưa chọn');
  return `<span class="khof"><button type="button" class="khobtn" data-pk="${key}">${label}: ${esc(txt)} <span class="car">▾</span></button><div class="khopop" data-pp="${key}" style="display:${pickOpen===key?'':'none'}"><div class="pk-act"><a href="#" data-pa="${key}">Chọn tất cả</a><a href="#" data-pn="${key}">Bỏ chọn</a></div>${opts.map(([v,t])=>`<label><input type="checkbox" data-pv="${key}" value="${esc(v)}" ${sel.includes(v)?'checked':''}> ${esc(t)}</label>`).join('')}<div class="pk-ft"><button type="button" class="btn s" data-pc="${key}">Đóng</button></div></div></span>`; }
function bindPick(m){
  m.querySelectorAll('[data-pk]').forEach(b=>{ const key=b.dataset.pk; const pp=m.querySelector(`[data-pp="${key}"]`); b.onclick=e=>{ e.stopPropagation(); const open=pp.style.display==='none'; m.querySelectorAll('[data-pp]').forEach(x=>x.style.display='none'); pp.style.display=open?'':'none'; pickOpen=open?key:null; }; pp.onclick=e=>e.stopPropagation(); });
  m.querySelectorAll('[data-pv]').forEach(cb=>cb.onchange=()=>{ const key=cb.dataset.pv; const allBoxes=[...m.querySelectorAll(`[data-pv="${key}"]`)]; const ck=allBoxes.filter(x=>x.checked).map(x=>x.value); pickSel[key] = ck.length===allBoxes.length ? undefined : ck; pickOpen=key; render(); });
  m.querySelectorAll('[data-pa]').forEach(a=>a.onclick=e=>{ e.preventDefault(); pickSel[a.dataset.pa]=undefined; pickOpen=a.dataset.pa; render(); });
  m.querySelectorAll('[data-pn]').forEach(a=>a.onclick=e=>{ e.preventDefault(); pickSel[a.dataset.pn]=[]; pickOpen=a.dataset.pn; render(); });
  m.querySelectorAll('[data-pc]').forEach(b=>b.onclick=e=>{ e.stopPropagation(); pickOpen=null; m.querySelectorAll('[data-pp]').forEach(x=>x.style.display='none'); });
}
document.addEventListener('click', ()=>{ if (!pickOpen) return; pickOpen=null; document.querySelectorAll('[data-pp]').forEach(x=>x.style.display='none'); });

let nxtTab = 'th';
const nonzeroNXT = x => [x.openSL,x.nhapSL,x.xuatSL,x.closeSL].some(v=>Math.abs(num(v))>1e-9);
function nxtMerged(){
  const pl=PL(); if(!pl) return null; const ps=P();
  return (!liveDiff() || !ps) ? pl : Object.assign({}, pl, { nxt: pl.nxt.map(x=>{ const s=(ps.nxt||[]).find(y=>y.ma===x.ma)||{}; return Object.assign({}, x, {gv:s.gv||0, openTT:s.openTT||0, nhapTT:s.nhapTT||0, xuatTT:s.xuatTT||0, closeTT:s.closeTT||0}); }) });
}
function selDates(){ if (isRange(selKy)) { const r=rangeOf(selKy); return {from:r.from, to:r.to}; } if (selKy.length===4) return {from:`${selKy}-01-01`, to:`${selKy}-12-31`}; return {from:`${selKy}-01`, to:`${selKy}-${String(daysInMonth(selKy)).padStart(2,'0')}`}; }
// Danh sách nghiệp vụ nhập / xuất theo mã (số lượng theo dữ liệu mới nhất, giá trị theo lần Tính giá thành)
function nxtTrans(maSet, rng){
  const cl=calcLive(), cs=calc(), diff=liveDiff(); const {from,to}=rng||selDates(); const kys=cl.list.filter(k=>k>=from.slice(0,7) && k<=to.slice(0,7));
  const open={}; const p0=cl.periods[kys[0]], s0=cs.periods[kys[0]]||{};
  if (p0) for (const ma in p0.open) if (!maSet || maSet.has(ma)) open[ma]={sl:num(p0.open[ma].sl), tt: diff ? num(((s0.open||{})[ma]||{}).tt) : num(p0.open[ma].tt)};
  const out=[];
  kys.forEach(k=>{ const pl=cl.periods[k]; if(!pl) return; const sn=cs.periods[k]||{}; const gv = (diff ? sn.giaVon : pl.giaVon) || {}; const sOrd={}; (sn.orders||[]).forEach(o=>sOrd[o.maLenh]=o);
    const add = t => { if (maSet && !maSet.has(t.ma)) return; out.push(Object.assign({ky:k, nSL:0, nGT:0, xSL:0, xGT:0}, t)); };
    state.purchases.filter(r=>kyOf(r.ngayNhap)===k).forEach(r=>add({d:r.ngayNhap, nv:'Mua hàng', ct:r.hoaDon||'Chưa có HĐ', ma:r.ma, nSL:num(r.sl), nGT:num(r.tt), src:['purchases',r._id]}));
    (pl.orders||[]).forEach(o=>add({d:o.ngaySX, nv:'Nhập kho SX', ct:o.maLenh, ma:o.maTP, nSL:num(o.slTH), nGT: diff ? num((sOrd[o.maLenh]||{}).c154) : num(o.c154), src:['orders', o.o&&o.o._id]}));
    (pl.lines||[]).forEach(l=>add({d:l.ngayXuatNVL, nv:'Xuất SX', ct:l.maLenh, ma:l.maVT, xSL:num(l.tong), xGT: diff ? num(l.tong)*num(gv[l.maVT]) : num(l.tt), src:['orders', (state.orders.find(o=>o.maLenh===l.maLenh)||{})._id]}));
    (pl.sales||[]).forEach(x=>add({d:x.ngay, nv:'Bán hàng', ct:'HĐ bán '+fmtD(x.ngay), ma:x.ma, xSL:num(x.sl), xGT:num(x.sl)*(diff ? num(gv[x.ma]) : num(x.gv)), src:['sales', x.r&&x.r._id]}));
    state.issues.filter(r=>kyOf(r.ngay)===k).forEach(r=>add({d:r.ngay, nv:(r.loai||'').includes('641')?'Xuất thử nghiệm (641)':'Xuất dùng chung (627)', ct:r.maPhieu, ma:r.maVT, xSL:num(r.sl), xGT:num(r.sl)*num(gv[r.maVT]), src:['issues', r._id]}));
  });
  const res=[]; out.forEach(t=>{ if (t.d<from) { const o=open[t.ma]||(open[t.ma]={sl:0,tt:0}); o.sl+=t.nSL-t.xSL; o.tt+=t.nGT-t.xGT; } else if (t.d<=to) res.push(t); });
  res.sort((a,b)=> a.ma<b.ma?-1:a.ma>b.ma?1 : a.d<b.d?-1:a.d>b.d?1 : (b.nSL-a.nSL) || String(a.ct).localeCompare(String(b.ct)));
  return {open, rows:res, kys};
}
const ctLink = t => t.src && t.src[1] ? `<a href="#" class="lnk" data-src="${t.src[0]}|${t.src[1]}">${esc(t.ct)}</a>` : esc(t.ct);
function bindSrc(root, back){ root.querySelectorAll('[data-src]').forEach(a=>a.onclick=e=>{ e.preventDefault(); e.stopPropagation(); const [ent,id]=a.dataset.src.split('|'); docView(ent, id, back); }); }
function theKho(ma, rng){
  rng = rng || selDates(); const it=itemMap()[ma]||{}; const T=nxtTrans(new Set([ma]), rng); const o=T.open[ma]||{sl:0,tt:0}; let sl=o.sl, tt=o.tt; const rows=[]; let tn=[0,0,0,0];
  rows.push({cls:'tot', d:'', nv:'Tồn đầu kỳ', ct:'', tSL:sl, tGT:tt});
  const multi=T.kys.length>1; let curK=null, km=[0,0,0,0];
  const flushK = ()=>{ if (multi && curK!==null) rows.push({cls:'sub', d:'', nv:`Cộng tháng ${fmtKy(curK)}`, ct:'', nSL:km[0], nGT:km[1], xSL:km[2], xGT:km[3], tSL:sl, tGT:tt}); km=[0,0,0,0]; };
  T.rows.forEach(t=>{ const k=t.d.slice(0,7); if (k!==curK) { flushK(); curK=k; } sl+=t.nSL-t.xSL; tt+=t.nGT-t.xGT; km=[km[0]+t.nSL,km[1]+t.nGT,km[2]+t.xSL,km[3]+t.xGT]; tn=[tn[0]+t.nSL,tn[1]+t.nGT,tn[2]+t.xSL,tn[3]+t.xGT]; rows.push(Object.assign({}, t, {dg: t.nSL?t.nGT/t.nSL:(t.xSL?t.xGT/t.xSL:0), tSL:sl, tGT:tt})); });
  flushK(); rows.push({cls:'tot', d:'', nv:'Cộng phát sinh · tồn cuối kỳ', ct:'', nSL:tn[0], nGT:tn[1], xSL:tn[2], xGT:tn[3], tSL:sl, tGT:tt});
  const q=v=>v?fmtQ(v):'', n=v=>v?fmtN(v):'';
  const html = `<div class="hd"><h3>Thẻ kho – ${esc(ma)} · ${esc(it.ten||'')} <span class="mut small">(${esc(it.dvt||'')} · Kho ${esc(it.kho||'')})</span></h3><button class="x" id="tkX" title="Đóng" aria-label="Đóng">${IC('x')}</button></div>
   ${(()=>{ const y=rng.from.slice(0,4); const ys=[...new Set([...calcLive().list.filter(k=>/^\d{4}/.test(k)).map(k=>k.slice(0,4)), y, String(curYear())])].sort();
     const mode = rng._r ? 'R' : (rng.from===`${y}-01-01` && rng.to===`${y}-12-31`) ? 'Y' : ((rng.from.slice(0,7)===rng.to.slice(0,7) && rng.from.endsWith('-01') && rng.to===kyEnd(rng.from.slice(0,7))) ? 'M'+rng.from.slice(5,7) : 'R');
     return `<div class="tk-bar"><label><span class="lbl-y">Năm</span> <select id="tkY" class="ysel">${ys.map(v=>`<option ${v===y?'selected':''}>${v}</option>`).join('')}</select></label><label>· Xem: <select id="tkP"><option value="Y" ${mode==='Y'?'selected':''}>Cả năm</option>${Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')).map(m=>`<option value="M${m}" ${mode==='M'+m?'selected':''}>Tháng ${+m}</option>`).join('')}<option value="R" ${mode==='R'?'selected':''}>Từ ngày – đến ngày</option></select></label>${mode==='R'?`<label>Từ ngày <input type="date" id="tkF" value="${rng.from}"></label><label>Đến ngày <input type="date" id="tkT" value="${rng.to}"></label>`:''}</div>`; })()}
   <div class="tw tk"><table><thead><tr><th>Ngày</th><th>Nghiệp vụ</th><th>Chứng từ / lệnh</th><th class="n">Nhập SL</th><th class="n">Nhập giá trị</th><th class="n">Xuất SL</th><th class="n">Xuất giá trị</th><th class="n">Đơn giá</th><th class="n">Tồn SL</th><th class="n">Tồn giá trị</th></tr></thead><tbody>
   ${rows.map(r=>`<tr class="${r.cls||''}"><td>${r.d?fmtD(r.d):''}</td><td>${esc(r.nv)}</td><td>${r.src?ctLink(r):esc(r.ct||'')}</td><td class="n">${q(r.nSL)}</td><td class="n">${n(r.nGT)}</td><td class="n">${q(r.xSL)}</td><td class="n">${n(r.xGT)}</td><td class="n">${n(r.dg)}</td><td class="n">${fmtQ(r.tSL||0)}</td><td class="n">${fmtN(r.tGT||0)}</td></tr>`).join('')}</tbody></table></div>
   <div class="ft"><button class="btn" id="tkXl">${IC('xlOut')}Xuất Excel thẻ kho</button><button class="btn p" id="tkC">Đóng</button></div>`;
  modal(html); const box=$('#modal .in'); box.classList.add('tcm','wide');
  $('#tkX').onclick=$('#tkC').onclick=()=>closeModal();
  bindSrc(box, ()=>theKho(ma, rng));
  const tkGo=(y, v)=>{ if (v==='Y') return theKho(ma, {from:`${y}-01-01`, to:`${y}-12-31`}); if (v[0]==='M') { const k=`${y}-${v.slice(1)}`; return theKho(ma, {from:`${k}-01`, to:kyEnd(k)}); } const f=rng.from.slice(0,4)===y ? rng.from : `${y}-01-01`, t=rng.to.slice(0,4)===y ? rng.to : `${y}-12-31`; theKho(ma, {from:f, to:t}); };
  $('#tkY').onchange=e=>tkGo(e.target.value, $('#tkP').value);
  $('#tkP').onchange=e=>{ if (e.target.value==='R') { const y=$('#tkY').value; const m=$('#tkP'); return theKho(ma, {from:rng.from, to:rng.to, _r:1}); } tkGo($('#tkY').value, e.target.value); };
  const dch=()=>{ const f=$('#tkF').value, t=$('#tkT').value; if (!f || !t) return; if (f>t) return toast('Từ ngày phải trước hoặc bằng Đến ngày'); theKho(ma, {from:f, to:t, _r:1}); };
  if ($('#tkF')) { $('#tkF').addEventListener('change', dch); $('#tkT').addEventListener('change', dch); }
  $('#tkXl').onclick=()=>exportSheet(`TheKho_${ma}_${rng.from}_${rng.to}.xlsx`, 'TheKho', rows.map(r=>({'Ngày':r.d||'', 'Nghiệp vụ':r.nv, 'Chứng từ / lệnh':r.ct||'', 'Nhập SL':r.nSL||0, 'Nhập giá trị':r.nGT||0, 'Xuất SL':r.xSL||0, 'Xuất giá trị':r.xGT||0, 'Đơn giá':r.dg||0, 'Tồn SL':r.tSL||0, 'Tồn giá trị':r.tGT||0})));
}
function docView(ent, id, back){
  const r=(state[ent]||[]).find(x=>x._id===id); if (!r) return toast('Không tìm thấy chứng từ (có thể đã bị xóa)');
  const T={purchases:'Mua hàng', sales:'Bán hàng', issues:'Xuất dùng chung', orders:'Lệnh sản xuất'};
  addForm(ent, null, {row:r, mode:'view', title:'Chứng từ – '+(T[ent]||ent), back});
}
function vNXT(m){
  const p=nxtMerged(); if(!p) return noData(m);
  const KL = khoList(), GL = groupCodes(); const fk=pickFn('nxtKho'), fg=pickFn('nxtNhom');
  const rows = p.nxt.filter(x=> nonzeroNXT(x) && fg(x.nhom) && fk(String(x.kho||'')) && matchSearch(search,[x.ma,x.ten,x.nhom,x.dvt,x.kho,x.status]));
  const tabs = `<div class="tabs"><button data-nt="th" class="${nxtTab==='th'?'act':''}">Tổng hợp nhập xuất tồn</button><button data-nt="ct" class="${nxtTab==='ct'?'act':''}">Chi tiết nhập xuất tồn</button></div>`;
  const bar = `<div class="bar"><input type="text" id="q" placeholder="Tìm mã / tên" value="${esc(search)}" style="width:220px">${pickHtml('nxtNhom','Nhóm',GL.map(g=>[g,g]))}${pickHtml('nxtKho','Kho',KL.map(k=>[k,'Kho '+k]))}</div>`;
  const fname = `${(pickSel.nxtNhom||[]).length&&pickSel.nxtNhom?'_nhom_'+pickSel.nxtNhom.join('-'):''}${pickSel.nxtKho?'_kho_'+pickSel.nxtKho.join('-'):''}`;
  if (nxtTab==='ct') {
    const items=itemMap(); const set=new Set(rows.map(x=>x.ma)); const T=nxtTrans(set); const bal={}; for (const ma in T.open) bal[ma]={sl:T.open[ma].sl, tt:T.open[ma].tt};
    const det=T.rows.map(t=>{ const b=bal[t.ma]||(bal[t.ma]={sl:0,tt:0}); b.sl+=t.nSL-t.xSL; b.tt+=t.nGT-t.xGT; const it=items[t.ma]||{}; return Object.assign({}, t, {kho:it.kho||'', ten:it.ten||'', dg: t.nSL?t.nGT/t.nSL:(t.xSL?t.xGT/t.xSL:0), tSL:b.sl, tGT:b.tt}); });
    const LIM=1500; const shown=det.slice(0,LIM);
    m.innerHTML = head('Nhập – Xuất – Tồn', `<button class="btn" id="xl">${IC('xlOut')}Xuất Excel</button>`) + tabs + liveNote() + bar +
    table([{t:'Kho',f:x=>x.kho},{t:'Mã',f:x=>x.ma},{t:'Mặt hàng',f:x=>x.ten},{t:'Ngày',f:x=>x.d,fmt:fmtD},{t:'Nghiệp vụ',f:x=>x.nv},{t:'Chứng từ / lệnh',raw:1,f:x=>ctLink(x)},
      {t:'Nhập SL',n:1,d:2,f:x=>x.nSL||'',sum:1},{t:'Nhập giá trị',n:1,f:x=>x.nGT||'',sum:1},{t:'Xuất SL',n:1,d:2,f:x=>x.xSL||'',sum:1},{t:'Xuất giá trị',n:1,f:x=>x.xGT||'',sum:1},{t:'Đơn giá',n:1,f:x=>x.dg},{t:'Tồn SL',n:1,d:2,f:x=>x.tSL},{t:'Tồn giá trị',n:1,f:x=>x.tGT}], shown, {total:true}) +
    (det.length>LIM ? `<div class="small mut" style="margin-top:6px">Màn hình hiện ${fmtN(LIM)} / ${fmtN(det.length)} dòng đầu – Xuất Excel có đủ.</div>` : '');
    bindKy(); bindSearch(); bindPick(m); bindSrc(m);
    m.querySelectorAll('[data-nt]').forEach(b=>b.onclick=()=>{ nxtTab=b.dataset.nt; render(); });
    $('#xl').onclick=()=>exportDomTable(m.querySelector('.tw table'), `NXT_ChiTiet_${selKy}${fname}.xlsx`, 'ChiTietNXT');
    return;
  }
  m.innerHTML = head('Nhập – Xuất – Tồn', `<button class="btn" id="xl">${IC('xlOut')}Xuất Excel</button>`) + tabs + liveNote() + bar +
  table([
    {t:'Kho',f:x=>x.kho},{t:'Mã',raw:1,f:x=>`<a href="#" class="lnk u" data-tk="${esc(x.ma)}">${esc(x.ma)}</a>`, sv:x=>x.ma},{t:'Mặt hàng',f:x=>x.ten},{t:'Nhóm',f:x=>x.nhom},{t:'ĐVT',f:x=>x.dvt},{t:'Giá vốn',n:1,f:x=>x.gv},
    {t:'Tồn đầu SL',n:1,d:2,f:x=>x.openSL},{t:'Tồn đầu TT',n:1,f:x=>x.openTT,sum:1},{t:'Nhập SL',n:1,d:2,f:x=>x.nhapSL},{t:'Nhập TT',n:1,f:x=>x.nhapTT,sum:1},{t:'Xuất SL',n:1,d:2,f:x=>x.xuatSL},{t:'Xuất TT',n:1,f:x=>x.xuatTT,sum:1},{t:'Tồn cuối SL',n:1,d:2,f:x=>x.closeSL},{t:'Tồn cuối TT',n:1,f:x=>x.closeTT,sum:1},
    {t:'BQ/ngày',n:1,d:2,f:x=>x.bq},{t:'Số ngày còn dùng',n:1,f:x=>x.days==null?'':x.days,fmt:v=>v===''?'':fmtN(v,0)},{t:'Phân loại',raw:1,f:x=>nxtClassPill(nxtClass(x))},{t:'Trạng thái rủi ro',f:x=>x.status}
  ], rows, {total:true});
  bindKy(); bindSearch(); bindPick(m);
  m.querySelectorAll('[data-nt]').forEach(b=>b.onclick=()=>{ nxtTab=b.dataset.nt; render(); });
  m.querySelectorAll('[data-tk]').forEach(a=>{ a.onclick=e=>{ e.preventDefault(); e.stopPropagation(); theKho(a.dataset.tk); }; const tr=a.closest('tr'); if (tr) { tr.classList.add('clk'); tr.onclick=e=>{ if (e.target.closest('button,input,a,.flt')) return; theKho(a.dataset.tk); }; } });
  $('#xl').onclick=()=>exportDomTable(m.querySelector('.tw table'), `NXT_${selKy}${fname}.xlsx`, 'NXT');
}
