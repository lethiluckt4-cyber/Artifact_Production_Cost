const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 const R=await pg.evaluate((docs)=>{ fromDocs(docs); calcCache=null; const o={}; for (const k of ['2026','2026-02','2026-03','2026-06','2026-11']) { selKy=k; const m=movedRows(); o[k]={n:m.length, hd:[...new Set(m.map(r=>r.hoaDon))].length, tach:m.filter(r=>r.tachTu).length, sl:m.map(r=>r.ma+' HĐ'+r.hoaDon+' '+r.ngayMua+'→'+r.ngayNhap+(r.tachTu?' (tách)':''))}; } return o; }, docs);
 console.log(JSON.stringify(R,null,1)); await b.close(); })();
