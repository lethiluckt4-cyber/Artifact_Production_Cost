// Kiểm thử các thao tác: tạo lệnh từ kế hoạch, điều chỉnh TP, nhập Excel (mảng), cân đối NVL, sao lưu/khôi phục
const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 const r = await pg.evaluate(([seed])=>{ const out={};
   app.importDocs(seed); calcCache=null; selKy='2026-10';
   // 1. Điều chỉnh TP: +10 rồi +200 thùng TP_BKG ngày 01/10
   const o = state.orders.find(o=>o.ngaySX==='2026-10-01' && o.maTP==='TP_BKG'); const sl0 = id=>calc().TH[id].slTH;
   const btp = ma => state.orders.find(o=>o.ngaySX==='2026-10-01' && o.maTP===ma)._id;
   const base = ['BTP_BGK','BTP_KT','BTP_BGKT'].map(m=>sl0(btp(m)));
   o.dieuChinhTP=10; calcCache=null; out.adj10 = ['BTP_BGK','BTP_KT','BTP_BGKT','TP'].map((m,i)=>m==='TP'?sl0(o._id):sl0(btp(m))-base[i]);
   o.dieuChinhTP=200; calcCache=null; out.adj200 = ['BTP_BGK','BTP_KT','BTP_BGKT'].map((m,i)=>sl0(btp(m))-base[i]);
   const nextBGK = state.orders.find(x=>x.ngaySX==='2026-10-02' && x.maTP==='BTP_BGK'); out.nextDay = sl0(nextBGK._id);
   o.dieuChinhTP=0; calcCache=null;
   // 2. Tạo lệnh từ kế hoạch tháng 10
   const before = state.orders.length; const pl=buildPlan('2026'); const res=applyPlanCore(pl, '2026-10', true); calcCache=null;
   const pl2=buildPlan('2026'); out.plan = {before, after:state.orders.length, res, st:pl2.list.filter(x=>x.d.startsWith('2026-10')).reduce((a,x)=>(a[x.st]=(a[x.st]||0)+1,a),{})};
   const p=P(); out.oct = {orders:p.orders.length, am:p.nxt.filter(x=>x.closeSL<-1e-9).map(x=>x.ma+' '+x.closeSL.toFixed(2)), tp154:Math.round(p.sum154)};
   // 3. Đề xuất cân đối NVL
   const a=buildAdjProposal(p); out.adj = {n:a.rows.length, rows:a.rows.slice(0,3).map(r=>[r.ngaySX,r.maTP,r.maVT,r.deXuat])};
   if (a.rows.length) { applyAdjCore(a); calcCache=null; const p2=P(); out.adjAfter = p2.nxt.filter(x=>x.closeSL<-1e-9 && !isProd(itemMap()[x.ma])).map(x=>x.ma+' '+x.closeSL.toFixed(3)); }
   // 4. Nhập Excel dạng mảng: khóa kế hoạch, cân đối, bán hàng, lịch
   const n0=state.orders.length; const k = importAOA('orders', [['Khóa kế hoạch','Ngày sản xuất','Mã sản phẩm','Số lượng kế hoạch','Điều chỉnh TP','Loại ĐM','Ghi chú'],['BTP_BGK#20261130@300.~3.','','','','','',''],['','2026-11-30','TP_BKG',45,5,'DM','tay']], 'add', true);
   out.importOrders = {k, added: state.orders.length-n0, last: state.orders.slice(-2).map(o=>[o.maLenh,o.ngaySX,o.maTP,o.slKH,o.dieuChinhTP,o.khoa])};
   out.importSales = importAOA('sales', [['Ngày hóa đơn','Số hóa đơn','Tên khách hàng','Mã hàng','Số lượng bán','Đơn giá','Doanh số','Ghi chú'],['30/11/2026','99','Khách thử','TP_BKG',2,400000,'','']], 'add', true);
   out.saleRow = state.sales.filter(s=>s.ngay==='2026-11-30').map(s=>[s.hoaDon,s.khach,s.sl,s.donGia,s.doanhSo]);
   out.importCal = importAOA('cal', [['Ngày','Loại','Ghi chú'],['2026-12-25','nghỉ chờ việc','thử']], 'add', true); out.calRow = state.cal.filter(c=>c.ngay==='2026-12-25').map(c=>[c.loai,c.ghiChu]);
   out.badCode = importAOA('adjustments', [['Ngày sản xuất','Mã sản phẩm','Mã VT/HH','SL cân đối','Lý do'],['2026-10-01','BTP_BGK','KHONG_CO',-1,'x']], 'add', true);
   // 5. Sao lưu / khôi phục
   calcCache=null; const c1=calc(); const s1 = Object.values(c1.periods).map(p=>Math.round(p.sum154)+'|'+Math.round(p.tonCuoi)).join(',');
   const docs = JSON.parse(JSON.stringify(toDocs())); fromDocs(docs); calcCache=null; const c2=calc(); const s2 = Object.values(c2.periods).map(p=>Math.round(p.sum154)+'|'+Math.round(p.tonCuoi)).join(',');
   out.roundtrip = s1===s2; out.docKeys = Object.keys(docs).length;
   return out; }, [seed]);
 console.log(JSON.stringify(r, null, 1));
 // giao diện: lưới Lệnh SX – sửa điều chỉnh ở dòng BTP bị chặn
 await pg.evaluate(()=>{ selKy='2026-10'; view='d_orders'; render(); }); await pg.waitForTimeout(200);
 await pg.screenshot({path:path.resolve(__dirname,'out','orders_after.png')});
 await pg.evaluate(()=>{ view='kehoach'; $('#main').dataset.ktab='lenh'; render(); }); await pg.waitForTimeout(200); await pg.screenshot({path:path.resolve(__dirname,'out','kehoach_lenh2.png')});
 await pg.evaluate(()=>{ view='giathanh'; render(); }); await pg.waitForTimeout(200); await pg.click('#main tbody tr[data-i="2"]'); await pg.waitForTimeout(300); await pg.screenshot({path:path.resolve(__dirname,'out','order_detail.png')});
 console.log('errs', errs);
 await b.close(); })();
