const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(1000);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); app.state.purchases.push({_id:'t1', ngayNhap:'2026-11-03', ngayMua:'2026-11-03', hoaDon:'1', ncc:'X', ma:'TRGA', sl:1000, donGia:2500, tt:2500000, kho:'152', ghiChu:''}); app.state.orders.push({_id:'t2', maLenh:'LSX2026-11.03-01', ngayXuatNVL:'2026-11-03', ngaySX:'2026-11-03', maTP:'BO', loaiDM:'DM', soMeKH:10, dieuChinhMe:0, ghiChu:''}); changed(); selKy=''; render(); }); await pg.waitForTimeout(600);
 console.log(await pg.evaluate(()=>{ const p=P(); return [selKy, p.sum154, p.orders.length, p.nxt.find(x=>x.ma==='TRGA')]; }));
 await pg.screenshot({path:'/tmp/nam-tongquan.png'});
 for (const v of ['nxt','giathanh','banhang','d_orders','canhbao','chiphi','nam']) { await pg.evaluate(v=>document.querySelector(`[data-v=${v}]`).click(), v); await pg.waitForTimeout(400); }
 await pg.evaluate(()=>document.querySelector('[data-v=giathanh]').click()); await pg.waitForTimeout(300); await pg.click('tbody tr[data-i="0"]'); await pg.waitForTimeout(300);
 await pg.evaluate(()=>{ $('#selM').value='10'; $('#selM').onchange(); }); await pg.waitForTimeout(300);
 console.log(await pg.evaluate(()=>[selKy, P().sum154]), errs);
 await b.close(); })();
