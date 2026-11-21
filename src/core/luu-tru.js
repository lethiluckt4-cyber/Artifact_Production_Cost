//# Lưu trữ: store, DB artifact (chia nhỏ tài liệu lớn) / IndexedDB, toDocs/fromDocs
// ---------- Lưu trữ (DB artifact → IndexedDB) ----------
const store = {
  backend:null, kind:'', lastSaved:{}, timer:null, saving:false, pending:false,
  async init(){
    if (window.claude && typeof claude.use==='function') {
      try { const db = await Promise.race([claude.use('db'), new Promise(r=>setTimeout(()=>r(null),10000))]); if (db) { this.backend = dbBackend(db); this.kind='cloud'; } } catch(e){}
    }
    if (!this.backend) { try { this.backend = await idbBackend(); this.kind='local'; } catch(e){ this.backend = memBackend(); this.kind='mem'; } }
    const docs = await this.backend.loadAll();
    fromDocs(docs);
    for (const k in docs) this.lastSaved[k] = JSON.stringify(docs[k]);
  },
  schedule(){ dataVer++; clearTimeout(this.timer); this.timer = setTimeout(()=>this.flush(), 1200); },
  async flush(){
    if (this.saving) { this.pending = true; return; }
    this.saving = true; this.err = false; updateSaveBadge('saving');
    try {
      const docs = toDocs();
      for (const k in docs) { const s = JSON.stringify(docs[k]); if (this.lastSaved[k] !== s) { await this.backend.put(k, docs[k]); this.lastSaved[k] = s; } }
      for (const k in this.lastSaved) if (!(k in docs)) { await this.backend.del(k); delete this.lastSaved[k]; }
      updateSaveBadge('ok');
    } catch(e){ console.error(e); this.err = true; updateSaveBadge('err', e && (e.message||e.code)); }
    this.saving = false; if (this.pending) { this.pending=false; this.flush(); }
  }
};
function dbBackend(db){
  const col = db.collection('gt');
  return {
    // tài liệu lớn (tháng có nhiều lệnh / cân đối) được chia thành nhiều phần k__c1, k__c2… để không vượt giới hạn dung lượng một tài liệu
    chunks:{},
    async loadAll(){ const snap = await col.get(); const raw={}; snap.docs.forEach(d=>{ if(d.exists) raw[d.id]=d.data(); }); const o={};
      for (const id in raw) { if (/__c\d+$/.test(id)) continue; const v=raw[id]; if (v && v.__chunks) { let s=''; let ok=true; for (let i=1;i<=v.__chunks;i++){ const c=raw[`${id}__c${i}`]; if (!c) { ok=false; break; } s+=c.part; } this.chunks[id]=v.__chunks; if (ok) { try { o[id]=JSON.parse(s); } catch(e){ console.error('chunk parse', id, e); } } } else o[id]=v; }
      return o; },
    async put(k,v){ const s=JSON.stringify(v); const LIM=100000; const old=this.chunks[k]||0;
      if (s.length<=LIM) { await col.doc(k).set(v); for (let i=1;i<=old;i++) await col.doc(`${k}__c${i}`).delete(); delete this.chunks[k]; return; }
      const n=Math.ceil(s.length/LIM); for (let i=1;i<=n;i++) await col.doc(`${k}__c${i}`).set({part:s.slice((i-1)*LIM, i*LIM)});
      await col.doc(k).set({__chunks:n}); for (let i=n+1;i<=old;i++) await col.doc(`${k}__c${i}`).delete(); this.chunks[k]=n; },
    async del(k){ await col.doc(k).delete(); const old=this.chunks[k]||0; for (let i=1;i<=old;i++) await col.doc(`${k}__c${i}`).delete(); delete this.chunks[k]; },
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

// Thành tiền / trị giá / doanh số / chi phí: luôn là số nguyên (đồng)
const MONEYK = new Set(['tt','doanhSo','tienThue',...COSTF]); const mRound = (f,v) => MONEYK.has(f) && v!=='' && v!=null && !isNaN(v) ? Math.round(Number(v)) : v;
function rowsToArr(rows, fields){ return rows.filter(r=>!r._new).map(r=>fields.map(f=>mRound(f, r[f] ?? ''))); }
function arrToRows(arr, fields){ return (arr||[]).map(a=>{ const o={_id:uid()}; fields.forEach((f,i)=>o[f]=mRound(f, a[i] ?? (NUMF.has(f)?0:''))); return o; }); }
function toDocs(){
  const d = {};
  d.settings = {...state.settings};
  d.items = {rows: rowsToArr(state.items, F.items)};
  d.groups = {rows: rowsToArr(state.groups.filter(r=>!r._new), F.groups)};
  d.bom = {rows: rowsToArr(state.bom, F.bom)};
  d.subs = {rows: rowsToArr(state.subs, F.subs)};
  d.caps = {rows: rowsToArr(state.caps, F.caps)};
  d.opening = {ky: state.opening.ky, rows: Object.entries(state.opening.rows).map(([ma,v])=>[ma, v.sl, v.tt, v.kho||''])};
  const byKy = (arr, f) => { const g={}; arr.forEach(r=>{ const k = kyOf(r[f]) || 'none'; (g[k]=g[k]||[]).push(r); }); return g; };
  const P = byKy(state.purchases,'ngayNhap'); for (const k in P) d['p_'+k] = {rows: rowsToArr(P[k], F.purchases)};
  const S = byKy(state.sales,'ngay'); for (const k in S) d['s_'+k] = {rows: rowsToArr(S[k], F.sales)};
  const I = byKy(state.issues,'ngay'); for (const k in I) d['i_'+k] = {rows: rowsToArr(I[k], F.issues)};
  const K = byKy(state.plan,'ngaySX'); for (const k in K) d['k_'+k] = {rows: rowsToArr(K[k], F.plan)};
  { const H={}; state.cal.forEach(r=>{ if (r._new) return; const y=(r.ngay||'').slice(0,4)||'none'; (H[y]=H[y]||[]).push(r); }); for (const y in H) d['h_'+y] = {rows: rowsToArr(H[y], F.cal)}; }
  const O = byKy(state.orders,'ngayXuatNVL');
  const orderKy = {}; state.orders.forEach(o=>orderKy[o.maLenh]=kyOf(o.ngayXuatNVL)||'none');
  const A = {}; state.adjustments.forEach(a=>{ const k = orderKy[a.maLenh] || 'none'; (A[k]=A[k]||[]).push(a); });
  const oks = new Set([...Object.keys(O), ...Object.keys(A)]);
  oks.forEach(k=>{ d['o_'+k] = {rows: rowsToArr(O[k]||[], F.orders), adj: rowsToArr(A[k]||[], F.adjustments)}; });
  for (const k in state.costs) { const c=state.costs[k]; if (Object.keys(c).some(f=>num(c[f]))) d['c_'+k] = {...c}; }
  return d;
}
function fromDocs(docs){
  state.settings = Object.assign({company:'KH Thảo Vy', startKy:''}, docs.settings||{});
  state.items = arrToRows(docs.items && docs.items.rows, F.items);
  state.groups = (docs.groups && docs.groups.rows && docs.groups.rows.length) ? arrToRows(docs.groups.rows, F.groups) : arrToRows(GROUPS0, F.groups);
  state.bom = arrToRows(docs.bom && docs.bom.rows, F.bom);
  state.subs = arrToRows(docs.subs && docs.subs.rows, F.subs);
  state.caps = arrToRows(docs.caps && docs.caps.rows, F.caps);
  state.opening = {ky: (docs.opening && docs.opening.ky) || '', rows:{}};
  ((docs.opening && docs.opening.rows)||[]).forEach(a=>state.opening.rows[a[0]]={sl:num(a[1]), tt:num(a[2]), kho:a[3]||''});
  state.purchases=[]; state.sales=[]; state.issues=[]; state.orders=[]; state.adjustments=[]; state.costs={}; state.plan=[]; state.cal=[];
  Object.keys(docs).sort().forEach(k=>{
    const v = docs[k];
    if (k.startsWith('p_')) state.purchases.push(...arrToRows(v.rows, F.purchases));
    else if (k.startsWith('s_')) state.sales.push(...arrToRows(v.rows, F.sales));
    else if (k.startsWith('i_')) state.issues.push(...arrToRows(v.rows, F.issues));
    else if (k.startsWith('k_')) state.plan.push(...arrToRows(v.rows, F.plan));
    else if (k.startsWith('h_')) state.cal.push(...arrToRows(v.rows, F.cal));
    else if (k.startsWith('o_')) { state.orders.push(...arrToRows(v.rows, F.orders)); state.adjustments.push(...arrToRows(v.adj, F.adjustments)); }
    else if (k.startsWith('c_')) { const c={}; Object.keys(v).forEach(f=>{ if (f!=='ky') c[f]=num(v[f]); }); state.costs[k.slice(2)] = c; }
  });
  if (!state.settings.startKy && state.opening.ky) state.settings.startKy = state.opening.ky;
  if (!state.settings.holSeed2026) { addHolidays(); state.settings.holSeed2026=true; try{ store.schedule(); }catch(e){} }
  calcCache = null;
  fillKhoDefaults();
}
