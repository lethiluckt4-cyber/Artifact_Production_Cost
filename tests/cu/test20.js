const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); changed(); state.settings.workYear='2026'; selKy='2026-10'; view='d_bom'; render(); }); await pg.waitForTimeout(300);
 const base = await pg.evaluate(()=>(calcCache=null,P()).sum154);
 // swap BO DAU -> BOMI from 2026-10-15
 await pg.evaluate(()=>{ const r=app.state.bom.find(b=>b.maTP==='BO'&&b.maNVL==='DAU'); swapBomDialog(r._id); }); await pg.waitForTimeout(200);
 await pg.selectOption('#swNVL','BOMI'); await pg.fill('#swNgay','2026-10-15'); await pg.click('#swOk'); await pg.waitForTimeout(400);
 const r = await pg.evaluate(()=>{ const p=(calcCache=null,P()); const o1=p.orders.find(o=>o.maTP==='BO'&&o.ngaySX==='2026-10-10'), o2=p.orders.find(o=>o.maTP==='BO'&&o.ngaySX==='2026-10-16'); return {rows:app.state.bom.filter(b=>b.maTP==='BO'&&['DAU','BOMI'].includes(b.maNVL)).map(b=>[b.maNVL,b.tuNgay,b.denNgay]), l1:o1.lines.map(l=>l.maVT).filter(v=>['DAU','BOMI'].includes(v)), l2:o2.lines.map(l=>l.maVT).filter(v=>['DAU','BOMI'].includes(v)), n1:o1.lines.length, n2:o2.lines.length, st:[o1.status,o2.status], sum154:p.sum154}; });
 console.log(base, JSON.stringify(r));
 await pg.screenshot({path:'/tmp/man-hinh-40-doi-nvl.png'}); console.log(errs); await b.close(); })();
