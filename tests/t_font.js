const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}});
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6000);
 await pg.evaluate(()=>{ view='tongquan'; render(); }); await pg.waitForTimeout(500); await pg.screenshot({path:'/home/claude/work/shots/font1.png'});
 const fs=await pg.evaluate(()=>{ const g=s=>{ const e=document.querySelector(s); return e?getComputedStyle(e).fontSize+' '+getComputedStyle(e).fontFamily.slice(0,40):'-'; }; return {body:g('body'), h2:g('.top h2'), nav:g('nav button'), grp:g('nav .grp'), td:g('#main td'), th:g('#main th'), btn:g('.toolbar .btn'), h3:g('.box h3'), card:g('.card .v'), pill:g('.pill'), note:g('.small')}; });
 console.log(fs); await b.close(); })();
