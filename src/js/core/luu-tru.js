// ---------- Lưu trữ (DB artifact → IndexedDB) ----------
const store = {
  backend:null, kind:'', lastSaved:{}, timer:null, saving:false, pending:false,
  async init(){
    const sleep = ms => new Promise(r=>setTimeout(r,ms));
    const within = (pr, ms) => Promise.race([pr, new Promise((_,j)=>setTimeout(()=>j(new Error('Hết thời gian chờ')),ms))]);
    const say = t => { const m=$('#main'); if (m) m.innerHTML = `<div class="note">${t}</div>`; };
    this.backend = null; this.readOnly = false; this.cache = null; this.lastErr = '';
    window.__bootStep = 'mở bộ nhớ trình duyệt';
    try { this.cache = await within(idbBackend(), 4000); } catch(e){ this.cache = null; }
    window.__bootStep = 'chờ kết nối Claude';
    const framed = (()=>{ try { return window.self!==window.top; } catch(e){ return true; } })();
    if (framed) for (let i=0; i<12 && !(window.claude && typeof window.claude.use==='function'); i++) await sleep(250);
    this.inClaude = !!(window.claude && typeof window.claude.use==='function');
    if (this.inClaude) {
      say('Đang kết nối kho dữ liệu trên tài khoản Claude…');
      let db = null;
      window.__bootStep = 'kết nối kho dữ liệu (claude.use db)';
      try { db = await within(window.claude.use('db'), 30000); } catch(e){ this.lastErr = e.message||String(e); }
      if (db) {
        const be = dbBackend(db);
        for (let i=1; i<=3; i++) {
          try { window.__bootStep = 'tải dữ liệu lần '+i; say(`Đang tải dữ liệu… ${i>1?`(thử lại lần ${i}/3)`:''}`); const docs = await within(be.loadAll(), 30000);
            this.backend = be; this.kind = 'cloud'; this.apply(docs);
            if (this.cache) { Object.keys(docs).forEach(k=>this.cache.put(k, docs[k]).catch(()=>{})); }
            return;
          } catch(e){ this.lastErr = e.message||String(e); await sleep(2000*i); }
        }
      } else if (!this.lastErr) this.lastErr = 'Trình duyệt chưa kết nối được kho dữ liệu (có thể chưa đăng nhập Claude hoặc mạng chậm)';
      // Không kết nối được đám mây: hiện bản sao gần nhất trên máy, CHỈ XEM – không ghi để tránh lệch dữ liệu
      this.kind = 'offline'; this.readOnly = true; this.backend = memBackend();
      let docs = {}; try { if (this.cache) docs = await this.cache.loadAll(); } catch(e){}
      this.apply(docs); return;
    }
    if (this.cache) { this.backend = this.cache; this.kind='local'; } else { this.backend = memBackend(); this.kind='mem'; }
    this.apply(await this.backend.loadAll());
  },
  apply(docs){ fromDocs(docs); this.lastSaved = {}; for (const k in docs) this.lastSaved[k] = JSON.stringify(docs[k]); },
  async reconnect(){ await this.init(); calcCache=null; selKy=''; render(); },
  schedule(){ clearTimeout(this.timer); this.timer = setTimeout(()=>this.flush(), 1200); },
  async flush(){
    if (this.readOnly) { updateSaveBadge('err', 'chưa kết nối kho dữ liệu – thay đổi chưa được lưu'); return; }
    if (this.saving) { this.pending = true; return; }
    this.saving = true; updateSaveBadge('saving');
    try {
      const docs = toDocs();
      for (const k in docs) { const s = JSON.stringify(docs[k]); if (this.lastSaved[k] !== s) { await this.backend.put(k, docs[k]); this.lastSaved[k] = s; if (this.kind==='cloud' && this.cache) this.cache.put(k, docs[k]).catch(()=>{}); } }
      for (const k in this.lastSaved) if (!(k in docs)) { await this.backend.del(k); delete this.lastSaved[k]; if (this.kind==='cloud' && this.cache) this.cache.del(k).catch(()=>{}); }
      updateSaveBadge('ok');
    } catch(e){ console.error(e); updateSaveBadge('err', e && (e.message||e.code)); }
    this.saving = false; if (this.pending) { this.pending=false; this.flush(); }
  }
};
function dbBackend(db){
  const col = db.collection('gt');
  return {
    async loadAll(){ const snap = await col.get(); const o={}; snap.docs.forEach(d=>{ if(d.exists) o[d.id]=JSON.parse(JSON.stringify(d.data())); }); return o; },
    async put(k,v){ await col.doc(k).set(v); },
    async del(k){ await col.doc(k).delete(); },
  };
}
function idbBackend(){
  return new Promise((res, rej)=>{
    const req = indexedDB.open('giathanh_kh', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('docs');
    req.onerror = () => rej(req.error);
    req.onsuccess = () => {
      const idb = req.result;
      const tx = (mode, fn) => new Promise((r, j)=>{ const t=idb.transaction('docs', mode); const s=t.store||t.objectStore('docs'); const q=fn(s); t.oncomplete=()=>r(q && q.result); t.onerror=()=>j(t.error); });
      res({
        async loadAll(){ const o={}; await new Promise((r,j)=>{ const t=idb.transaction('docs'); const c=t.objectStore('docs').openCursor(); c.onsuccess=()=>{ const cur=c.result; if(cur){ o[cur.key]=cur.value; cur.continue(); } }; t.oncomplete=r; t.onerror=()=>j(t.error); }); return o; },
        put(k,v){ return tx('readwrite', s=>s.put(v,k)); },
        del(k){ return tx('readwrite', s=>s.delete(k)); },
      });
    };
  });
}
function memBackend(){ const m={}; return { async loadAll(){return {...m};}, async put(k,v){m[k]=v;}, async del(k){delete m[k];} }; }

function rowsToArr(rows, fields){ return rows.filter(r=>!r._new).map(r=>fields.map(f=>r[f] ?? '')); }
function arrToRows(arr, fields){ return (arr||[]).map(a=>{ const o={_id:uid()}; fields.forEach((f,i)=>o[f]=a[i] ?? (NUMF.has(f)?0:'')); return o; }); }
function toDocs(){
  const d = {};
  d.settings = {...state.settings};
  d.items = {rows: rowsToArr(state.items, F.items)};
  d.bom = {rows: rowsToArr(state.bom, F.bom)};
  d.subs = {rows: rowsToArr(state.subs, F.subs)};
  d.caps = {rows: rowsToArr(state.caps, F.caps)};
  d.cal = {rows: rowsToArr(state.cal, F.cal)};
  d.opening = {ky: state.opening.ky, rows: Object.entries(state.opening.rows).map(([ma,v])=>[ma, v.sl, v.tt, v.kho||''])};
  const byKy = (arr, f) => { const g={}; arr.forEach(r=>{ const k = kyOf(r[f]) || 'none'; (g[k]=g[k]||[]).push(r); }); return g; };
  const P = byKy(state.purchases,'ngayNhap'); for (const k in P) d['p_'+k] = {rows: rowsToArr(P[k], F.purchases)};
  const S = byKy(state.sales,'ngay'); for (const k in S) d['s_'+k] = {rows: rowsToArr(S[k], F.sales)};
  const I = byKy(state.issues,'ngay'); for (const k in I) d['i_'+k] = {rows: rowsToArr(I[k], F.issues)};
  const K = byKy(state.plan,'ngaySX'); for (const k in K) d['k_'+k] = {rows: rowsToArr(K[k], F.plan)};
  const O = byKy(state.orders,'ngaySX');
  const A = byKy(state.adjustments,'ngaySX');
  const oks = new Set([...Object.keys(O), ...Object.keys(A)]);
  oks.forEach(k=>{ d['o_'+k] = {rows: rowsToArr(O[k]||[], F.orders), adj: rowsToArr(A[k]||[], F.adjustments)}; });
  for (const k in state.costs) { const c=state.costs[k]; if (Object.keys(c).some(f=>num(c[f]))) d['c_'+k] = {...c}; }
  return d;
}
function fromDocs(docs){
  state.settings = Object.assign({company:'Công ty Thiên Hồng', startKy:''}, docs.settings||{});
  state.items = arrToRows(docs.items && docs.items.rows, F.items);
  state.bom = arrToRows(docs.bom && docs.bom.rows, F.bom);
  state.subs = arrToRows(docs.subs && docs.subs.rows, F.subs);
  state.caps = arrToRows(docs.caps && docs.caps.rows, F.caps);
  state.cal = arrToRows(docs.cal && docs.cal.rows, F.cal);
  state.opening = {ky: (docs.opening && docs.opening.ky) || '', rows:{}};
  ((docs.opening && docs.opening.rows)||[]).forEach(a=>state.opening.rows[a[0]]={sl:num(a[1]), tt:num(a[2]), kho:a[3]||''});
  state.purchases=[]; state.sales=[]; state.issues=[]; state.orders=[]; state.adjustments=[]; state.costs={}; state.plan=[];
  Object.keys(docs).sort().forEach(k=>{
    const v = docs[k];
    if (k.startsWith('p_')) state.purchases.push(...arrToRows(v.rows, F.purchases));
    else if (k.startsWith('s_')) state.sales.push(...arrToRows(v.rows, F.sales));
    else if (k.startsWith('i_')) state.issues.push(...arrToRows(v.rows, F.issues).map(r=>{ r.loai = issueType(r.loai); return r; }));
    else if (k.startsWith('k_')) state.plan.push(...arrToRows(v.rows, F.plan));
    else if (k.startsWith('o_')) { state.orders.push(...arrToRows(v.rows, F.orders)); state.adjustments.push(...arrToRows(v.adj, F.adjustments)); }
    else if (k.startsWith('c_')) { const c={}; Object.keys(v).forEach(f=>{ if (f!=='ky') c[f]=num(v[f]); }); state.costs[k.slice(2)] = c; }
  });
  if (!state.settings.startKy && state.opening.ky) state.settings.startKy = state.opening.ky;
  applyNhom();
  // 15/11/2026: cột Kho bắt buộc ở Mua / Bán / Xuất dùng chung / Số dư đầu kỳ – dòng cũ để trống thì lấy kho của mã hàng trong danh mục
  if (!state.settings.khoV1) { const im={}; state.items.forEach(i=>im[i.ma]=i); const f=(r,k)=>{ if (!r.kho) { const it=im[r[k]]; if (it && it.kho) r.kho=it.kho; } };
    state.purchases.forEach(r=>f(r,'ma')); state.sales.forEach(r=>f(r,'ma')); state.issues.forEach(r=>f(r,'maVT')); Object.entries(state.opening.rows).forEach(([ma,o])=>{ if (!o.kho && im[ma] && im[ma].kho) o.kho=im[ma].kho; });
    if (state.items.length) { state.settings.khoV1=1; state._migrated=true; } }
  // 15/11/2026: "Mua hàng chưa HĐ" chuyển thành ô tự nhập – giữ lại nhãn phần mềm đã suy ra trước đây cho các dòng cũ
  if (!state.settings.chuaHDV1 && state.purchases.length) { const hdG={}; state.purchases.forEach(x=>{ if(!x.hoaDon) return; const k=x.hoaDon+'|'+(x.ncc||''); const o=hdG[k]||(hdG[k]={diff:false,same:false}); if (x.ngayNhap && x.ngayMua && x.ngayNhap!==x.ngayMua) o.diff=true; else o.same=true; });
    state.purchases.forEach(r=>{ if (r.chuaHD) return; const df=r.ngayNhap && r.ngayMua && r.ngayNhap!==r.ngayMua; const gg=r.hoaDon&&hdG[r.hoaDon+'|'+(r.ncc||'')]; r.chuaHD = (gg && gg.diff && gg.same) ? (df?`x - ${r.hoaDon}`:r.hoaDon) : (df?'x':''); });
    state.settings.chuaHDV1 = 1; state._migrated = true; }
  if (!state.settings.chuaHDV2 && state.purchases.length) { const gs=new Set(); state.purchases.forEach(r=>{ if (r.hoaDon && /Chuyển nhập kho|Tách /.test(r.ghiChu||'')) gs.add(r.hoaDon+'\u0001'+(r.ncc||'')); }); gs.forEach(k=>{ const [h,n]=k.split('\u0001'); syncChuaHD(h,n); }); state.settings.chuaHDV2 = 1; if (gs.size) state._migrated = true; }
  // 04/11/2026: bánh gấu khô lỗi – tạo mã sản phẩm lỗi nếu sản phẩm chính đã có trong danh mục
  if (!state.settings.spLoiV1) { const im={}; state.items.forEach(i=>im[i.ma]=i); let mig=false;
    spLoiList().forEach(r=>{ if (im[r.maSP] && r.maLoi && !im[r.maLoi]) { const sp=im[r.maSP]; state.items.push({_id:uid(), ma:r.maLoi, ten:r.tenLoi||((sp.ten||r.maSP)+' lỗi'), nhom:'Sản phẩm lỗi', dvt:sp.dvt||'Kg', kho:sp.kho||'155'}); mig=true; } });
    if (state.items.length) { if (!Array.isArray(state.settings.spLoi)) state.settings.spLoi = JSON.parse(JSON.stringify(SPLOI0)); state.settings.spLoiV1 = 1; state._migrated = mig || true; } }
  calcCache = null;
}
let lastCalc = null, recalcPending = false, calcDirty = false;
let gridOpen = null, editBack = null; // mở phiếu chứng từ để sửa từ báo cáo (vd Nhập – Xuất – Tồn) rồi quay lại
const ED_VIEW = {purchases:'d_purchases', sales:'d_sales', issues:'d_issues', orders:'d_orders'};
