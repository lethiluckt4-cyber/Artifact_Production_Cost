const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:860}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); changed(); state.settings.workYear='2026'; selKy='2026-10'; render(); });
 const base = await pg.evaluate(()=>(calcCache=null,P()).sum154);
 await pg.evaluate(()=>{ app.state.subs.push({_id:'s1', maTP:'', maNVL:'TRGA', maThayThe:'DUONG', tuNgay:'2026-10-10', denNgay:'2026-10-12', tyLe:0.3, ghiChu:'thử'}); app.state.subs.push({_id:'s2', maTP:'BO', maNVL:'DAU', maThayThe:'BOMI', tuNgay:'2026-10-20', denNgay:'', tyLe:'', ghiChu:''}); changed(); view='d_subs'; render(); });
 await pg.waitForTimeout(300); await pg.screenshot({path:'/tmp/man-hinh-21-nvl-thay-the.png'});
 const r = await pg.evaluate(()=>{ const p=(calcCache=null,P()); const o1=p.orders.find(o=>o.maTP==='BO' && o.ngaySX==='2026-10-10'); const o2=p.orders.find(o=>o.maTP==='BO' && o.ngaySX==='2026-10-21'); const o3=p.orders.find(o=>o.maTP==='BO' && o.ngaySX==='2026-10-01'); return {sum154:p.sum154, l1:o1.lines.filter(l=>['TRGA','DUONG'].includes(l.maVT)).map(l=>[l.maVT,l.dm,l.thayThe]), l2:o2.lines.filter(l=>['DAU','BOMI'].includes(l.maVT)).map(l=>[l.maVT,l.dm,l.thayThe]), l3:o3.lines.filter(l=>['DAU','BOMI','TRGA'].includes(l.maVT)).map(l=>[l.maVT,l.dm,!!l.thayThe])}; });
 console.log(base, JSON.stringify(r), errs); await b.close(); })();
