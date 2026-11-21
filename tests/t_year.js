const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1400,height:900}})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const r0=await pg.evaluate(()=>{ const c=calc(); const am={}; c.list.forEach(k=>{ const L=c.periods[k].nxt.filter(x=>x.closeSL<-1e-9); if (L.length) am[k]=L.map(x=>x.ma+'('+x.nhom+')').slice(0,4); }); return {canDoi:planPrm().canDoi, cdV2:state.settings.cdV2, am}; }); console.log('Âm theo tháng (vải không âm):', JSON.stringify(r0));
 // thêm bán tháng 10, 11 → tính cả năm
 await pg.evaluate(()=>{ state.sales.push({_id:uid(), ngay:'2026-10-20', ma:'TP_QBN_1', sl:150, donGia:20000, doanhSo:3000000, hoaDon:'X1', khach:'K'},{_id:uid(), ngay:'2026-11-05', ma:'TP_BBN', sl:500, donGia:20000, doanhSo:1e7, hoaDon:'X2', khach:'K'}); changed(); selKy='2026'; view='giathanh'; lastView='giathanh'; render(); runCalcFor({}); });
 await pg.waitForTimeout(5000);
 console.log(await pg.evaluate(()=>document.querySelector('#modal').innerText.split('\n').filter(l=>/Đề xuất|tồn âm|Hàng tồn|Tính giá/.test(l)).join(' || ').slice(0,700)));
 console.log(await pg.evaluate(()=>JSON.stringify({dx:state.settings.daDeXuat.slice(-3), lenh1011:state.orders.filter(o=>/2026-1[01]/.test(o.ngaySX)).map(o=>o.maTP+' '+o.slKH)})));
 console.log('errs', errs); await b.close(); })();
