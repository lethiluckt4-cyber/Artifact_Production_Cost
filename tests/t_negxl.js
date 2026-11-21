const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 const arr=await pg.evaluate(()=>{ const wb=XW.book_new(); XW.book_append_sheet(wb, XW.json_to_sheet([{a:-1234,b:-1.5,c:20,d:'x'}]), 'S'); const o=XW.write(wb); return Array.from(o instanceof Uint8Array?o:new Uint8Array(o)); });
 fs.writeFileSync('/home/claude/work/negtest.xlsx', Buffer.from(arr)); await b.close(); })();
