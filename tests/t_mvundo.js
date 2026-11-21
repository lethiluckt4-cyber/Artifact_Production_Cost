const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2500);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final.json','utf8')); delete docs._nap; docs.settings=JSON.parse(fs.readFileSync('settings_live.json','utf8')); docs.settings.daDeXuat=[]; docs.settings.dxSig={};
 await pg.evaluate(d=>{ fromDocs(d); state.cal=[]; changed(); calcCache=null; }, docs);
 const sig0=await pg.evaluate(()=>JSON.stringify(state.purchases.map(r=>[r.ngayNhap,r.ma,r.hoaDon,r.sl,r.tt,r.thueGTGT]).sort()));
 await pg.evaluate(()=>{ view='giathanh'; selKy='2026-01'; render(); runCalcFor({reset:true}); });
 await pg.waitForFunction(()=>{ const h=document.querySelector('#modal h3'); return h && h.textContent.includes('Đã tính xong'); },null,{timeout:120000});
 // áp dụng chuyển kho nhiều tháng
 const moved=await pg.evaluate(()=>{ closeModal(); let tot=0; for (let i=0;i<12;i++){ const ks=moveMonths(); if(!ks.length) break; const d=buildMoveProposal(ks[0]); if(!d.rows.length) break; const r=applyMoveCore(d.rows); tot+=r.mv+r.tach; calcCache=null; calc(); } changed(); return {tot, n:state.purchases.length, tach:state.purchases.filter(r=>r.tachTu).length}; });
 console.log('moved',moved);
 // lưu & nạp lại qua docs để chắc trường ngayGoc được lưu
 await pg.evaluate(()=>{ const d=toDocs(); fromDocs(JSON.parse(JSON.stringify(d))); calcCache=null; });
 await pg.evaluate(()=>{ selKy='2026'; view='d_adjustments'; document.querySelector('#main').dataset.adt='ct'; render(); });
 console.log('btns', await pg.$$eval('#main .toolbar button',x=>x.map(e=>e.textContent.trim()).filter(t=>t)));
 await pg.screenshot({path:'/home/claude/work/mvundo.png', clip:{x:236,y:0,width:1264,height:220}});
 await pg.click('#mvUndo'); await pg.waitForTimeout(300); await pg.click('#modal .btn.p, #modal #cbOK, #modal button:has-text("Đồng ý")').catch(async()=>{ console.log('confirm btns', await pg.$$eval('#modal button',x=>x.map(e=>e.id+':'+e.textContent))); });
 await pg.waitForTimeout(500);
 const sig1=await pg.evaluate(()=>JSON.stringify(state.purchases.map(r=>[r.ngayNhap,r.ma,r.hoaDon,r.sl,r.tt,r.thueGTGT]).sort()));
 console.log('khớp ban đầu:', sig0===sig1, 'còn ngayGoc', await pg.evaluate(()=>state.purchases.filter(r=>r.ngayGoc).length));
 console.log('btns after', await pg.$$eval('#main .toolbar button',x=>x.map(e=>e.textContent.trim()).filter(t=>t)).catch(()=>[]));
 console.log('errs',errs); await b.close(); })();
