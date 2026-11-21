// ---------- Cảnh báo chênh lệch giá mua / bán ----------
const PW = {mua:{}, ban:{}};
const pctSigned = d => d==null ? '' : Math.abs(d)<0.0005 ? '0%' : (d>0?'+':'')+fmtP(d);
const pwCls = (r,t) => { const o=(PW[t]||{})[r._id]; return o&&o.lvl==='R'?'pwR':o&&o.lvl==='Y'?'pwY':''; };
const GIANG0 = {muaV:0.10, muaD:0.30, banV:0.05, banD:0.20};
const giaNg = () => Object.assign({}, GIANG0, state.settings.giaNg||{});
const CSNG0 = {hi:1, lo:0.7}; const csNg = () => Object.assign({}, CSNG0, state.settings.csNg||{}); // ngưỡng % công suất (Đề xuất sản xuất)
const median = a => { if(!a.length) return 0; const b=a.slice().sort((x,y)=>x-y); const i=Math.floor(b.length/2); return b.length%2?b[i]:(b[i-1]+b[i])/2; };
const prevKy = k => { const [y,m]=k.split('-').map(Number); return m===1?`${y-1}-12`:`${y}-${String(m-1).padStart(2,'0')}`; };
function zeroHint(ratio){ return ratio>=8 ? ' – nghi gõ thừa số 0' : (ratio>0 && ratio<=0.125 ? ' – nghi gõ thiếu số 0' : ''); }
function priceLvl(d, v, dd){ const a=Math.abs(d); return a>=dd ? 'R' : (a>=v ? 'Y' : ''); }
function diffMsg(d, label, base, ratio){ return `${d>0?'Cao':'Thấp'} hơn ${fmtP(Math.abs(d))} so với ${label} ${fmtN(base)}${zeroHint(ratio)}`; }
// Mua: so với giá mua bình quân tháng gần nhất trước đó (tối đa 12 tháng); chưa có thì so với giá giữa (trung vị) trong tháng khi có từ 2 lần mua
// Giá so sánh = bình quân gia quyền (tổng tiền ÷ tổng số lượng) của 3 tháng gần nhất CÓ phát sinh trước tháng đang xét (tìm lùi tối đa 12 tháng)
function avg3(byKy, k, f){ let kk=k, sl=0, v=0; const ms=[]; for (let i=0;i<12 && ms.length<3;i++){ kk=prevKy(kk); const x=byKy[kk]; if (x && x.sl>0 && x[f]>0) { sl+=x.sl; v+=x[f]; ms.push(kk); } }
  if (!sl) return null; const a=ms[ms.length-1], b=ms[0]; return {v:v/sl, label: ms.length===1 ? `giá BQ tháng ${fmtKy(b)}` : `giá BQ ${ms.length} tháng gần nhất (${fmtKy(a)} – ${fmtKy(b)})`}; }
function purchaseChecks(){ const ng=giaNg(); const by={}; const up=r=>num(r.donGia)||(num(r.sl)?num(r.tt)/num(r.sl):0);
  state.purchases.forEach(r=>{ if(!r.ma||!r.ngayNhap) return; const k=kyOf(r.ngayNhap); const a=(by[r.ma]=by[r.ma]||{}); const x=(a[k]=a[k]||{sl:0,tt:0,ps:[]}); x.sl+=num(r.sl); x.tt+=num(r.tt); const u=up(r); if(u>0) x.ps.push(u); });
  const res={}; state.purchases.forEach(r=>{ if(!r.ma||!r.ngayNhap) return; const k=kyOf(r.ngayNhap); const u=up(r); const o={base:0,label:'',d:null,lvl:'',msg:''};
    if (!u) { if (num(r.sl)) { o.lvl='R'; o.msg='Chưa có đơn giá / thành tiền'; o.short='Thiếu đơn giá'; } res[r._id]=o; return; }
    { const b3=avg3(by[r.ma]||{}, k, 'tt'); if (b3) { o.base=b3.v; o.label=b3.label; } }
    if (!o.base) { const ps=((by[r.ma]||{})[k]||{ps:[]}).ps; if (ps.length>=2) { o.base=median(ps); o.label='giá giữa trong tháng'; } }
    if (o.base) { o.d=u/o.base-1; o.lvl=priceLvl(o.d, ng.muaV, ng.muaD); if (o.lvl) { o.msg=diffMsg(o.d, o.label, o.base, u/o.base); o.short=o.d>0?'Giá mua cao':'Giá mua thấp'; } }
    res[r._id]=o; }); return res; }
// Bán: so với giá bán phổ biến nhất của mã trong tháng (không có giá lặp lại thì lấy giá giữa); bán dưới giá vốn luôn là đỏ
function salesChecks(c){ const ng=giaNg(); c=c||calc(); const by={}; const up=r=>num(r.sl)?num(r.doanhSo)/num(r.sl):0;
  // Giá chuẩn = giá bán bình quân 3 tháng gần nhất có bán trước tháng đang xét; chưa có thì lấy bình quân trong tháng
  state.sales.forEach(r=>{ if(!r.ma||!r.ngay) return; const k=kyOf(r.ngay); const a=(by[r.ma]=by[r.ma]||{}); const x=(a[k]=a[k]||{sl:0,ds:0}); if (num(r.sl)>0 && num(r.doanhSo)>0) { x.sl+=num(r.sl); x.ds+=num(r.doanhSo); } });
  const getBase=(ma,k)=>{ const b3=avg3(by[ma]||{}, k, 'ds'); if (b3) return b3; const x=(by[ma]||{})[k]; return x && x.sl ? {v:x.ds/x.sl, label:`giá bán BQ trong tháng ${fmtKy(k)}`} : null; };
  const res={}; state.sales.forEach(r=>{ if(!r.ma||!r.ngay) return; const k=kyOf(r.ngay); const P=c.periods[k]; const gv=P?(P.giaVon[r.ma]||0):0; const u=up(r); const o={base:0,label:'',d:null,lvl:'',msg:'',gv}; const msgs=[], shorts=[], notes=[];
    if (num(r.sl) && !num(r.doanhSo)) { o.lvl='Y'; msgs.push('Doanh số = 0 – hàng tặng / khuyến mãi?'); shorts.push('Doanh số = 0'); notes.push('Hàng tặng / khuyến mãi?'); }
    const b=getBase(r.ma,k); if (u && b) { o.base=b.v; o.label=b.label; o.d=u/b.v-1; const l=priceLvl(o.d, ng.banV, ng.banD); if (l) { o.lvl=l; const dm=diffMsg(o.d, b.label, b.v, u/b.v); msgs.push(dm); shorts.push(o.d>0?'Giá bán cao':'Giá bán thấp'); notes.push(dm); } }
    if (u && gv && u<gv) { o.lvl='R'; const dvt=(itemMap()[r.ma]||{}).dvt||'đv'; msgs.push(`Bán dưới giá vốn ${fmtN(gv)} – lỗ ${fmtN(gv-u)}/${dvt}`); shorts.push('Bán dưới giá vốn'); notes.push(`Giá vốn ${fmtN(gv)} – lỗ ${fmtN(gv-u)}/${dvt}`); }
    o.msg=msgs.join(' · '); o.short=shorts.join(' · '); o.note=notes.join(' · '); res[r._id]=o; }); return res; }
