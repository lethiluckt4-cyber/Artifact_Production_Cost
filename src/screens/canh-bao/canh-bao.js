//# Màn hình Cảnh báo & kiểm tra
// ---- Cảnh báo ----
let cbTab='cb', ngEdit=false, ngDraft=null;
let gridSel=new Set(), gridSelEnt='';
// Đơn giá mua / bán bất thường: Cảnh báo (ngắn) + Ghi chú (chi tiết)
function priceIssues(p){
  const it=itemMap(); const out=[]; const dv=u=>u?'/'+u:'';
  state.purchases.filter(r=>!r._new && r.ma && selHas(r.ngayNhap) && num(r.sl)>0 && !num(r.tt) && !num(r.donGia)).forEach(r=>out.push({ngay:r.ngayNhap, nv:'Mua hàng', ct:r.hoaDon||'', dt:r.ncc||'', ma:r.ma, ten:(it[r.ma]||{}).ten||'', gia:0, cb:'Thiếu đơn giá', note:`Có số lượng ${fmtQ(num(r.sl))} nhưng chưa có đơn giá / thành tiền`, muc:'cao'}));
  [['mua','Mua hàng','Giá mua'],['ban','Bán hàng','Giá bán']].forEach(([k,nv,lb])=>{ const cf=devCfg(k);
    priceDevRows(k, selHas).forEach(x=>{ const lech=x.tl; const a=Math.abs(x.tl); if (a<cf.cb) return;
      out.push({ngay:x.ngay, nv, ct:x.ct||'', dt:x.doiTac||'', ma:x.ma, ten:x.ten, gia:x.gia, cb:`${lb} ${x.gia>x.bq?'cao':'thấp'}`, note:`${x.gia>x.bq?'Cao':'Thấp'} hơn ${fmtP(Math.abs(lech))} so với giá BQ kỳ ${fmtN(x.bq)}${dv((it[x.ma]||{}).dvt)}`, muc:a>=cf.cao?'cao':'cb'}); }); });
  state.sales.filter(r=>!r._new && r.ma && selHas(r.ngay) && num(r.sl)>0 && !num(r.doanhSo)).forEach(r=>out.push({ngay:r.ngay, nv:'Bán hàng', ct:'', dt:'', ma:r.ma, ten:(it[r.ma]||{}).ten||'', gia:0, cb:'Doanh số = 0', note:`Bán ${fmtQ(num(r.sl))} ${(it[r.ma]||{}).dvt||''} nhưng doanh số bằng 0`, muc:'cao'}));
  (p?p.sales:[]).filter(x=>x.gv>0 && x.gb>0 && x.gb<x.gv).forEach(x=>out.push({ngay:x.ngay, nv:'Bán hàng', ct:'', dt:'', ma:x.ma, ten:(it[x.ma]||{}).ten||'', gia:x.gb, cb:'Bán dưới giá vốn', note:`Giá vốn ${fmtN(x.gv)} – lỗ ${fmtN(x.gv-x.gb)}${dv((it[x.ma]||{}).dvt)}`, muc:'cao'}));
  return out.sort((a,b)=>(a.ngay||'').localeCompare(b.ngay||'')||a.ma.localeCompare(b.ma));
}
function cbChecks(c, p){
  const items=itemMap(); const missing = {};
  const chk=(ma,src)=>{ if(ma && !items[ma]) (missing[ma]=missing[ma]||new Set()).add(src); };
  state.purchases.forEach(r=>chk(r.ma,'Mua hàng')); state.sales.forEach(r=>chk(r.ma,'Bán hàng')); state.bom.forEach(b=>{chk(b.maTP,'Định mức (TP)');chk(b.maNVL,'Định mức (NVL)');chk(b.maThayThe,'Định mức (thay thế)');}); state.orders.forEach(o=>chk(o.maTP,'Lệnh SX')); state.adjustments.forEach(a=>chk(a.maVT,'Điều chỉnh')); state.issues.forEach(i=>chk(i.maVT,'Xuất chung'));
  const incomplete = Object.entries(GRID).filter(([e,g])=>g.req && state[e]).map(([e,g])=>{ const n=state[e].filter(r=>!r._new && (g.noKy || !g.kyf || selHas(r[g.kyf])) && g.req.some(k=>{ const c=g.cols.find(c=>c.k===k); return c && c.n ? !num(r[k]) : !r[k]; })).length; return n ? {e, t:(NAV.find(x=>x.id==='d_'+e)||{}).t || g.t, n} : null; }).filter(Boolean);
  const noBom = state.orders.map(o=>o.maTP+'|'+(o.loaiDM||'DM')).filter((v,i,a)=>a.indexOf(v)===i).filter(k=>{const [tp,l]=k.split('|'); return !bomFor(tp,l).length;});
  const bomBad = state.bom.filter(b=>!b._new).map(b=>{ const e=[]; if (!(num(b.slTP)>0)) e.push('SL TP/lần ≤ 0'); if (!(num(b.slNVL)>0)) e.push('SL NVL/lần ≤ 0'); if (b.maTP && b.maTP===b.maNVL) e.push('NVL trùng mã TP'); if (b.maNVL && items[b.maNVL] && items[b.maNVL].nhom==='Thành phẩm') e.push('NVL là thành phẩm'); if (b.tuNgay && b.denNgay && b.denNgay<b.tuNgay) e.push('Hiệu lực đến trước hiệu lực từ'); return e.length?{b, e:e.join(', ')}:null; }).filter(Boolean);
  const bomTP = new Set(state.bom.map(b=>b.maTP)); const soldNoBom = [...new Set(state.sales.filter(r=>r.ma && selHas(r.ngay) && (items[r.ma]||{}).nhom==='Thành phẩm' && !bomTP.has(r.ma)).map(r=>r.ma))];
  const dupLenh = Object.entries(state.orders.reduce((a,o)=>{ if (o.maLenh) a[o.maLenh]=(a[o.maLenh]||0)+1; return a;},{})).filter(([k,v])=>v>1);
  const om={}; state.orders.forEach(o=>om[o.maLenh]=o);
  const adjBad = state.adjustments.filter(a=>!a._new).map(a=>{ const o=om[a.maLenh]; if (!o) return {a, e:'Lệnh không tồn tại'}; if (a.maVT && (items[a.maVT]||{}).nhom==='Thành phẩm') return {a, e:`${a.maVT} là thành phẩm – điều chỉnh chỉ dùng cho NVL`}; if (a.maVT && !bomFor(o.maTP,o.loaiDM||'DM').some(b=>b.maNVL===a.maVT||b.maThayThe===a.maVT) && !state.subs.some(x=>x.maThayThe===a.maVT)) return {a, e:`${a.maVT} không có trong định mức của ${o.maTP}`}; return null; }).filter(Boolean);
  const noPrice = p ? p.lines.filter(l=>l.tong>0 && !l.dg).map(l=>l.maVT).filter((v,i,a)=>a.indexOf(v)===i) : [];
  const pIss = priceIssues(p);
  const ordW = c.warnings.filter(w=>w.loai==='Lệnh SX');
  const other = c.warnings.filter(w=>!['Lệnh SX','Cân đối NVL','Mua hàng','Bán hàng'].includes(w.loai));
  return {items, missing, incomplete, noBom, bomBad, soldNoBom, dupLenh, adjBad, noPrice, pIss, ordW, other};
}
function stockRisk(p){
  if (!p) return [];
  const pr = p.nxt.filter(x=>x.closeSL<0 || (x.status && (x.status.includes('Âm kho')||x.status.includes('quá dư')||x.status.includes('tồn lâu')||x.status.includes('Chưa xây dựng')||x.status.includes('cần mua')||x.status.includes('Tồn TP thấp'))));
  return pr.sort((a,b)=>((a.closeSL<0?0:1)-(b.closeSL<0?0:1)) || ((a.days==null?1e9:a.days)-(b.days==null?1e9:b.days)));
}
function vCanhBao(m){
  const c=calcLive(); const p=PL(); const K=cbChecks(c,p); const items=K.items;
  const prio = stockRisk(p); const am = prio.filter(x=>x.closeSL<0);
  const tabs = `<div class="tabs">${[['cb','Cảnh báo số liệu'],['kt','Kiểm tra số liệu'],['ng','Ngưỡng cảnh báo']].map(([k,t])=>`<button data-cbt="${k}" class="${cbTab===k?'act':''}">${t}</button>`).join('')}</div>`;
  let body='';
  if (cbTab==='cb') {
    body = riskTable() + `<div class="box"><h3>Rủi ro tồn kho cần xử lý – gồm tồn cuối kỳ âm</h3>${prio.length ? table([
      {t:'Mã',f:x=>x.ma},{t:'Mặt hàng',f:x=>x.ten},{t:'Nhóm',f:x=>x.nhom},{t:'Trạng thái',f:x=>x.status||(x.closeSL<0?'Âm kho':'')},{t:'Tồn đầu',n:1,d:2,f:x=>x.openSL},{t:'Nhập',n:1,d:2,f:x=>x.nhapSL},{t:'Xuất',n:1,d:2,f:x=>x.xuatSL},{t:'Tồn cuối',n:1,d:2,f:x=>x.closeSL},{t:'Cần lấy 5 ngày',n:1,d:2,f:x=>x.canLay5},{t:'Số ngày còn dùng',n:1,d:0,f:x=>x.days==null?'':x.days,fmt:v=>v===''?'':fmtN(v,0)},{t:'BQ/ngày',n:1,d:2,f:x=>x.bq}
    ], prio, {h:'50vh'}) + (am.length?`<div class="bar" style="margin-top:8px"><span class="small mut">${am.length} mã tồn cuối âm: giảm xuất NVL qua Cân đối NVL hoặc bổ sung mua hàng.</span><button class="btn p" id="goDc">➜ Xem phân tích & đề xuất điều chỉnh NVL</button></div>`:'') : '<div class="mut">Không có mã cần xử lý.</div>'}</div>`;
  } else if (cbTab==='kt') {
    const sec=(t,n,html)=> n ? `<div class="box"><h3>${t} <span class="pill bad">Cần xử lý</span></h3>${html}</div>` : '';
    const ul=a=>`<ul class="tight">${a.join('')}</ul>`;
    const pc=[{t:'Ngày',f:x=>fmtD(x.ngay)},{t:'Nghiệp vụ',f:x=>x.nv},{t:'Hóa đơn',f:x=>x.ct},{t:'Nhà cung cấp',f:x=>x.dt},{t:'Mã hàng',f:x=>x.ma},{t:'Tên hàng',f:x=>x.ten},{t:'Đơn giá',n:1,f:x=>x.gia||''},{t:'Cảnh báo',raw:1,f:x=>`<span class="pill ${x.muc==='cao'?'bad':'warn'}">${esc(x.cb)}</span>`},{t:'Ghi chú',f:x=>x.note}];
    const nBom = K.noBom.length+K.bomBad.length+K.soldNoBom.length, nDup=K.dupLenh.length+K.adjBad.length;
    body =
      sec('Dòng nhập liệu chưa đầy đủ thông tin bắt buộc', K.incomplete.length, ul(K.incomplete.map(x=>`<li><a href="#" data-go="d_${x.e}"><b>${esc(x.t)}</b></a>: ${x.n} dòng (tô đỏ trong bảng)</li>`))) +
      sec('Mã phát sinh nhưng chưa có trong danh mục', Object.keys(K.missing).length, ul(Object.entries(K.missing).map(([k,v])=>`<li><b>${esc(k)}</b> – ${[...v].join(', ')}</li>`))+'<div class="small mut">Thêm mã tại Danh mục hàng (mã, tên, nhóm, ĐVT, kho).</div>') +
      sec('Định mức: lệnh không có định mức, dòng định mức lỗi, thành phẩm có bán nhưng chưa có định mức', nBom,
        (K.noBom.length?`<b class="small">Lệnh SX chưa có định mức (Mã TP / Loại ĐM)</b>${ul(K.noBom.map(k=>`<li>${esc(k.replace('|',' / '))}</li>`))}`:'') +
        (K.bomBad.length?`<b class="small">Dòng định mức lỗi</b>${ul(K.bomBad.map(x=>`<li>${esc(x.b.maTP)} / ${esc(x.b.loai||'')} – ${esc(x.b.maNVL||'(trống)')}: ${esc(x.e)}</li>`))}`:'') +
        (K.soldNoBom.length?`<b class="small">Thành phẩm có bán nhưng chưa có định mức</b>${ul(K.soldNoBom.map(k=>`<li>${esc(k)} – ${esc((items[k]||{}).ten||'')}</li>`))}`:'') + '<div class="small mut">Sửa tại Định mức.</div>') +
      sec('Mã lệnh SX bị trùng, điều chỉnh NVL nhập sai dòng', nDup,
        (K.dupLenh.length?`<b class="small">Mã lệnh bị trùng</b>${ul(K.dupLenh.map(([k,v])=>`<li>${esc(k)} – ${v} dòng</li>`))}`:'') +
        (K.adjBad.length?`<b class="small">Cân đối NVL nhập sai dòng</b>${ul(K.adjBad.map(x=>`<li>${esc(x.a.maLenh)} – ${esc(x.a.maVT||'')}: ${esc(x.e)}</li>`))}`:'')) +
      sec('NVL xuất dùng nhưng chưa có giá', K.noPrice.length, ul(K.noPrice.map(k=>`<li>${esc(k)} – ${esc((items[k]||{}).ten||'')}</li>`))+'<div class="small mut">Bổ sung tồn đầu kỳ hoặc chứng từ mua hàng để có đơn giá.</div>') +
      sec('Đơn giá mua / bán bất thường', K.pIss.length, table(pc, K.pIss, {h:'45vh'})) +
      sec('Kiểm tra lệnh sản xuất', K.ordW.length, table([{t:'Mã lệnh',f:x=>x.ma},{t:'Nội dung',f:x=>x.nd}], K.ordW.slice(0,500), {h:'40vh'})) +
      sec('Cảnh báo khác khi tính toán', K.other.length, table([{t:'Loại',f:x=>x.loai},{t:'Mã',f:x=>x.ma},{t:'Nội dung',f:x=>x.nd}], K.other.slice(0,500), {h:'40vh'}));
    if (!body) body = `<div class="box" style="text-align:center;padding:28px"><span class="pill ok" style="font-size:var(--fs);padding:6px 14px">✓ Không có sai sót – Đạt</span></div>`;
  } else {
    const ed=ngEdit; const D=ngDraft||{risk:state.settings.risk||{}, hide:riskHidden(), dev:{mua:devCfg('mua'), ban:devCfg('ban')}};
    const rows=RISK0.filter(r=>!D.hide.includes(r.k)).map(r=>{ const o=(D.risk||{})[r.k]||{}; return {...r, cb:o.cb!=null?num(o.cb):r.cb, cao:o.cao!=null?num(o.cao):r.cao}; });
    const iv=(r,f)=> r.fmt==='flag' ? '<span class="mut">–</span>' : `<input class="ci n ng" type="text" data-rk="${r.k}" data-rf="${f}" value="${r.fmt==='p'?fmtNi(r[f]*100,0):fmtNi(r[f],r.fmt==='n1'?1:0)}" ${ed?'':'disabled'}>${r.fmt==='p'?' %':''}`;
    const hidden=RISK0.filter(r=>D.hide.includes(r.k));
    body = `<div class="box"><div class="bx-hd"><h3>Ngưỡng chỉ tiêu đánh giá rủi ro</h3><span class="sp"></span><span style="display:flex;gap:6px;align-items:center">${ed?`${hidden.length?`<select id="ngAddSel" class="ci" style="max-width:320px"><option value="">– chọn chỉ tiêu –</option>${hidden.map(r=>`<option value="${r.k}">${esc(r.t)}</option>`).join('')}</select> `:''}<button class="btn s p" id="ngAdd" ${hidden.length?'':'disabled title="Tất cả chỉ tiêu đã có trong bảng"'}>${IC('plus')}Thêm dòng</button> <button class="btn s" id="ngC">Hủy</button> <button class="btn s p" id="ngS">${IC('save')}Lưu ngưỡng</button>`:`<button class="btn s" id="ngE">${IC('edit')}Sửa</button>`}</span></div>
      <div class="tw"><table><thead><tr><th style="min-width:340px">Chỉ tiêu</th><th>Chiều</th><th class="n">Cảnh báo</th><th class="n">Rủi ro cao</th><th></th></tr></thead><tbody>
      ${rows.map(r=>`<tr><td style="white-space:normal">${esc(r.t)}</td><td style="text-align:center">${r.dir||''}</td><td class="n">${iv(r,'cb')}</td><td class="n">${iv(r,'cao')}</td><td class="act"><button class="btn s io d" data-ngdel="${r.k}" title="Xóa chỉ tiêu" aria-label="Xóa">${IC('trash')}</button></td></tr>`).join('') || '<tr><td colspan="5" class="mut">Chưa có chỉ tiêu nào – bấm Sửa → Thêm dòng.</td></tr>'}
      </tbody></table></div></div>
      <div class="box"><h3>Ngưỡng đơn giá mua / bán bất thường</h3>
      <div class="tw"><table><thead><tr><th style="min-width:200px">Loại</th><th class="n">Cảnh báo khi lệch ≥</th><th class="n">Rủi ro cao khi lệch ≥</th></tr></thead><tbody>
      ${[['mua','Giá mua'],['ban','Giá bán']].map(([k,t])=>`<tr><td>${t}</td><td class="n"><input class="ci n ng" type="text" data-dk="${k}" data-df="cb" value="${fmtNi(D.dev[k].cb*100,0)}" ${ed?'':'disabled'}> %</td><td class="n"><input class="ci n ng" type="text" data-dk="${k}" data-df="cao" value="${fmtNi(D.dev[k].cao*100,0)}" ${ed?'':'disabled'}> %</td></tr>`).join('')}
      </tbody></table></div></div>`;
  }
  m.innerHTML = head('Cảnh báo & kiểm tra dữ liệu', `<button class="btn" id="xlcb">${IC('xlOut')}Xuất Excel</button>`) + tabs + emptyNote() + body;
  bindKy(); bindSeed();
  m.querySelectorAll('[data-cbt]').forEach(b=>b.onclick=()=>{ if (ngEdit && b.dataset.cbt!=='ng') return toast('Đang sửa ngưỡng – bấm Lưu ngưỡng hoặc Hủy trước'); cbTab=b.dataset.cbt; render(); });
  { const b=$('#goDc'); if(b) b.onclick=()=>{ goView('d_adjustments'); render(); }; }
  m.querySelectorAll('[data-go]').forEach(a=>a.onclick=e=>{ e.preventDefault(); goView(a.dataset.go); render(); });
  // --- Ngưỡng
  const capture=()=>{ if (!ngDraft) return; m.querySelectorAll('input[data-rk]').forEach(inp=>{ const r=RISK0.find(x=>x.k===inp.dataset.rk); let v=num(String(inp.value).replace('%','')); if (r.fmt==='p') v=v/100; ngDraft.risk[r.k]=ngDraft.risk[r.k]||{}; ngDraft.risk[r.k][inp.dataset.rf]=v; }); m.querySelectorAll('input[data-dk]').forEach(inp=>{ ngDraft.dev[inp.dataset.dk][inp.dataset.df]=num(String(inp.value).replace('%',''))/100; }); };
  const e1=$('#ngE'); if (e1) e1.onclick=()=>{ ngEdit=true; ngDraft={risk:JSON.parse(JSON.stringify(state.settings.risk||{})), hide:[...riskHidden()], dev:{mua:{...devCfg('mua')}, ban:{...devCfg('ban')}}}; render(); };
  const c1=$('#ngC'); if (c1) c1.onclick=()=>{ ngEdit=false; ngDraft=null; render(); toast('Đã hủy – giữ ngưỡng cũ'); };
  const a1=$('#ngAdd'); if (a1) a1.onclick=()=>{ const sel=$('#ngAddSel'); const k=sel&&sel.value; if (!k) return toast('Chọn chỉ tiêu cần thêm'); capture(); ngDraft.hide=ngDraft.hide.filter(x=>x!==k); render(); };
  const s1=$('#ngS'); if (s1) s1.onclick=()=>{ capture(); for (const k of ['mua','ban']) { const d=ngDraft.dev[k]; if (d.cb>d.cao) return toast(`Ngưỡng ${k==='mua'?'giá mua':'giá bán'}: Cảnh báo phải nhỏ hơn hoặc bằng Rủi ro cao`); }
    state.settings.risk=ngDraft.risk; state.settings.riskHide=ngDraft.hide; state.settings.dev=ngDraft.dev; ngEdit=false; ngDraft=null; store.schedule(); render(); toast('Đã lưu ngưỡng'); };
  m.querySelectorAll('[data-ngdel]').forEach(b=>b.onclick=()=>{ const k=b.dataset.ngdel; const r=RISK0.find(x=>x.k===k); confirmBox(`Xóa chỉ tiêu <b>${esc(r.t)}</b> khỏi bảng đánh giá rủi ro?<div class="small mut" style="margin-top:6px">Có thể thêm lại bằng Sửa → Thêm dòng.</div>`, ()=>{ if (ngDraft) { capture(); ngDraft.hide=[...new Set([...ngDraft.hide,k])]; } state.settings.riskHide=[...new Set([...riskHidden(),k])]; store.schedule(); render(); toast('Đã xóa chỉ tiêu'); }); });
  // --- Xuất Excel toàn bộ
  $('#xlcb').onclick=()=>{ if (typeof XLSX==='undefined') return toast('Thư viện Excel chưa tải được');
    const wb=XLSX.utils.book_new(); const add=(name,aoa,w)=>{ const ws=XLSX.utils.aoa_to_sheet(aoa); ws['!cols']=(aoa[0]||[]).map((h,i)=>({wch:(w&&w[i])||Math.max(12,Math.min(40,String(h).length+3))})); XLSX.utils.book_append_sheet(wb, ws, name); };
    const y=curYear(); const kys=Array.from({length:12},(_,i)=>`${y}-${String(i+1).padStart(2,'0')}`); const hasK=new Set(allKys());
    { const hdr=['Chỉ tiêu','Chiều','Cảnh báo','Rủi ro cao',...kys.map((k,i)=>'T'+(i+1))]; const rows=riskCfg().map(r=>{ const pct=r.fmt==='p'; const sc=v=>v==null||v===''?'':(pct?round(v*100,4):v); const cells=kys.map(k=>{ const pp=c.periods[k]; if (!pp || !(hasK.has(k) || pp.orders.length || pp.sales.length)) return ''; let v=null; try{ v=r.f(pp); }catch(e){} return r.fmt==='flag' ? (v?'Thiếu':'') : (v==null?'':sc(v)); }); return [r.t+(pct?' (%)':''), r.dir, r.fmt==='flag'?'':sc(r.cb), r.fmt==='flag'?'':sc(r.cao), ...cells]; }); add('ChiTieuRuiRo',[hdr,...rows],[60,8,12,12]); }
    add('RuiRoTonKho',[['Mã','Mặt hàng','Nhóm','Trạng thái','Tồn đầu','Nhập','Xuất','Tồn cuối','Cần lấy 5 ngày','Số ngày còn dùng','BQ/ngày'],...prio.map(x=>[x.ma,x.ten,x.nhom,x.status||(x.closeSL<0?'Âm kho':''),round(x.openSL,4),round(x.nhapSL,4),round(x.xuatSL,4),round(x.closeSL,4),round(x.canLay5,4),x.days==null?'':round(x.days,0),round(x.bq,4)])],[14,36,10,50]);
    { const chk=[['Dòng nhập liệu chưa đầy đủ thông tin bắt buộc',K.incomplete.length,K.incomplete.map(x=>`${x.t}: ${x.n} dòng`).join('; ')],['Mã phát sinh nhưng chưa có trong danh mục',Object.keys(K.missing).length,Object.entries(K.missing).map(([k,v])=>`${k} (${[...v].join(', ')})`).join('; ')],['Định mức: lệnh không có định mức, dòng định mức lỗi, TP có bán chưa có định mức',K.noBom.length+K.bomBad.length+K.soldNoBom.length,[...K.noBom.map(k=>'Lệnh chưa có ĐM: '+k.replace('|',' / ')),...K.bomBad.map(x=>`ĐM lỗi ${x.b.maTP}–${x.b.maNVL}: ${x.e}`),...K.soldNoBom.map(k=>'TP có bán chưa có ĐM: '+k)].join('; ')],['Mã lệnh SX bị trùng, điều chỉnh NVL nhập sai dòng',K.dupLenh.length+K.adjBad.length,[...K.dupLenh.map(([k,v])=>`${k} (${v} dòng)`),...K.adjBad.map(x=>`${x.a.maLenh}–${x.a.maVT}: ${x.e}`)].join('; ')],['NVL xuất dùng nhưng chưa có giá',K.noPrice.length,K.noPrice.map(k=>`${k} – ${(items[k]||{}).ten||''}`).join('; ')],['Đơn giá mua / bán bất thường',K.pIss.length,`${K.pIss.length} dòng – xem sheet DonGiaBatThuong`],['Kiểm tra lệnh sản xuất',K.ordW.length,K.ordW.map(x=>x.nd).join('; ')],['Cảnh báo khác khi tính toán',K.other.length,`${K.other.length} cảnh báo – xem sheet CanhBaoKhac`]];
      add('KiemTraSoLieu',[['Mục kiểm tra','Kết quả','Số mục','Chi tiết'],...chk.map(r=>[r[0],r[1]?'Cần xử lý':'Đạt',r[1],r[2]])],[60,14,10,100]); }
    add('DonGiaBatThuong',[['Ngày','Nghiệp vụ','Hóa đơn','Nhà cung cấp','Mã hàng','Tên hàng','Đơn giá','Cảnh báo','Ghi chú'],...K.pIss.map(x=>[x.ngay,x.nv,x.ct,x.dt,x.ma,x.ten,round(x.gia,2),x.cb,x.note])],[12,12,14,28,14,32,14,20,60]);
    add('CanhBaoKhac',[['Loại','Mã','Nội dung'],...K.other.map(x=>[x.loai,x.ma,x.nd])],[16,18,100]);
    saveWb(wb, `CanhBao_KiemTra_${selKy}.xlsx`); };
}
