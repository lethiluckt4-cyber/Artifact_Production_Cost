const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='nxt'; selKy='2026-06'; render(); });
 await pg.click('[data-nt="ct"]'); await pg.waitForTimeout(400);
 const r=await pg.evaluate(()=>{ const trs=[...document.querySelectorAll('#main tbody tr[data-i]')]; const tot=document.querySelector('#main tr.tot'); return {n:trs.length, h2:document.querySelector('.top h2').textContent, tot:tot?[...tot.children].map(t=>t.textContent).filter(Boolean).join(' | '):''}; });
 console.log(JSON.stringify(r));
 // so khớp: tổng nhập/xuất chi tiết = tổng hợp
 const sumTH = await pg.evaluate(()=>{ const p=P(); return [p.nxt.reduce((s,x)=>s+x.nhapTT,0), p.nxt.reduce((s,x)=>s+x.xuatTT,0)]; }); console.log('Tổng hợp Nhập TT / Xuất TT:', sumTH.map(v=>Math.round(v).toLocaleString('vi-VN')).join(' / '));
 // tồn cuối từng mã khớp
 console.log('Tồn cuối khớp:', await pg.evaluate(()=>{ const p=P(); let bad=0; p.nxt.forEach(x=>{ const ev=nxtEvents(x.ma); let sl=x.openSL; ev.forEach(e=>sl+=e.io*e.sl); if (Math.abs(sl-x.closeSL)>1e-6) bad++; }); return bad===0 ? 'tất cả' : bad+' mã lệch'; }));
 await pg.screenshot({path:'/home/claude/work/shots/nt1.png', clip:{x:236,y:0,width:1204,height:520}});
 await pg.click('[data-nt="th"]'); await pg.waitForTimeout(200); console.log('Về tổng hợp:', await pg.evaluate(()=>document.querySelector('.top h2').textContent));
 console.log('errs', errs); await b.close(); })();
