const { chromium } = require('playwright');
const APP='/home/claude/work/app/index.html';
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1500,height:950}, acceptDownloads:true})).newPage(); const errs=[];
 pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+APP); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 await pg.evaluate(()=>{ if(!state.items.length){ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); calcCache=null; } });
 // Tổng quan mặc định cả năm
 const tq = await pg.evaluate(()=>{ const r=[]; selKy='2026-06'; view='nxt'; render(); view='tongquan'; render(); r.push(selKy); document.querySelector('#selM').value='03'; document.querySelector('#selM').onchange(); r.push(selKy); view='nxt'; render(); r.push(selKy); view='tongquan'; render(); r.push(selKy); return r; });
 console.log('Tổng quan:', tq.join(' → '));
 for (const ky of ['2026-06','2026','R:2026-04-15:2026-05-20','2026-01']) {
   const r = await pg.evaluate(ky=>{ selKy=ky; view='nxt'; render(); const p=P(); let ok=0, bad=[]; p.nxt.forEach(x=>{ nxtDetail(x); const t=document.querySelector('#modal').innerText; if (t.includes('khớp dòng NXT')) ok++; else bad.push(x.ma+': '+(t.match(/Thẻ kho lệch[^\n]*/)||[''])[0]); closeModal(); }); return {n:p.nxt.length, ok, bad:bad.slice(0,8), nbad:bad.length}; }, ky);
   console.log(ky, JSON.stringify(r)); }
 // Bấm thật vào dòng
 await pg.evaluate(()=>{ selKy='2026-06'; view='nxt'; render(); });
 const rows = await pg.$$('#main tbody tr[data-i]'); await rows[3].click(); await pg.waitForTimeout(200);
 console.log('Modal:', (await pg.evaluate(()=>document.querySelector('#modal').innerText)).replace(/\n+/g,' | ').slice(0,600));
 await pg.screenshot({path:'/home/claude/work/shots/nxt_detail1.png'});
 const [dl]=await Promise.all([pg.waitForEvent('download'), pg.click('#ndXl')]); console.log('Excel:', dl.suggestedFilename());
 await pg.click('#mclose');
 await pg.evaluate(()=>{ search='VAI_IN'; view='nxt'; selKy='2026-04'; render(); }); const r2=await pg.$$('#main tbody tr[data-i]'); if (r2.length){ await r2[0].click(); await pg.waitForTimeout(200); await pg.screenshot({path:'/home/claude/work/shots/nxt_detail2.png'}); }
 await pg.evaluate(()=>{ closeModal(); search=''; selKy='2026'; view='tongquan'; render(); }); await pg.screenshot({path:'/home/claude/work/shots/tongquan_canam.png'});
 console.log('Lỗi trang:', errs.length, errs.slice(0,3)); await b.close(); })();
