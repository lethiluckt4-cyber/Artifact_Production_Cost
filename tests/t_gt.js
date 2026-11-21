const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:500}}); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(5000);
 await pg.evaluate(()=>{ document.querySelectorAll('.toast').forEach(t=>t.remove()); view='giathanh'; selKy='2026-06'; render(); }); await pg.waitForTimeout(300); await pg.screenshot({path:'/home/claude/work/shots/gt.png', clip:{x:236,y:0,width:1264,height:260}});
 await pg.evaluate(()=>{ applyAdjCore(buildAdjProposal(P())); calcCache=null; view='d_adjustments'; render(); }); await pg.waitForTimeout(300);
 console.log(await pg.evaluate(()=>{ const ths=[...document.querySelectorAll('#main table thead th')].map(t=>t.textContent.trim()); const i=ths.findIndex(t=>t.startsWith('Trị giá')); return [...document.querySelectorAll('#main table tbody tr')].slice(0,4).map(r=>r.children[i]?.textContent.trim()).join(' | '); }));
 await b.close(); })();
