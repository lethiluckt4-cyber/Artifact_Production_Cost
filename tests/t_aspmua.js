const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950},acceptDownloads:true}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(()=>{ const D=Date; const fixed=new D('2026-11-18T09:00:00+07:00').getTime(); window.Date=class extends D{ constructor(...a){ if(a.length) super(...a); else super(fixed);} static now(){return fixed;} }; });
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(1500);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 const R=await pg.evaluate((docs)=>{ fromDocs(docs); calcCache=null; closeModal(); selKy='2026'; state.settings.workYear='2026'; view='xuatphieu'; $('#main').dataset.ptab='mh'; render(); const b=buildMuaNVK(); return {inv:b.inv, mua:b.mua.length, nvk:b.nvk.length, totMua:b.totMua&&[b.totMua[22],b.totMua[24]], totNvk:b.totNvk&&[b.totNvk[8],b.totNvk[12]], dc:b.totDc, lech:b.lech, tabs:[...document.querySelectorAll('.tabs button')].map(x=>x.textContent), btn:[...document.querySelectorAll('#exBoth,#exMua')].map(x=>x.textContent), trs:document.querySelectorAll('#main tbody tr').length}; }, docs);
 console.log(JSON.stringify(R,null,0));
 for (const t of ['nv','ds','dc']) { await pg.click(`.tabs button[data-t="${t}"]`); await pg.waitForTimeout(300); console.log(t, await pg.$$eval('#main tbody tr',x=>x.length)); }
 await pg.screenshot({path:'/home/claude/work/tests/aspmua_dc.png'});
 const [dl]=await Promise.all([pg.waitForEvent('download'), pg.click('#exMua')]); await dl.saveAs('/home/claude/work/tests/aspmua.xlsx'); console.log('file', dl.suggestedFilename());
 // kỳ tháng 03
 const R2=await pg.evaluate(()=>{ selKy='2026-03'; render(); const b=buildMuaNVK(); return [b.inv,b.mua.length,b.nvk.length]; }); console.log('T03',R2);
 console.log('errs',errs); await b.close(); })();
