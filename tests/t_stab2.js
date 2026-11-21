const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2500);
 const qv=async()=>pg.evaluate(()=>{ const q=document.querySelector('#q'); return q?q.value:'(no q)'; });
 for (const [v,attr] of [['d_items','dmt'],['canhbao','cbt'],['thietlap','tlt'],['nxt','tab'],['kehoach','tab']]) {
   await pg.locator(`[data-v="${v}"]`).first().click(); await pg.waitForTimeout(500);
   const tabs=await pg.$$eval(`#main [data-${attr}]`,x=>x.map(e=>e.getAttribute('data-'+e.getAttributeNames().find(a=>a.startsWith('data-')).slice(5))));
   const t=await pg.$$eval(`#main [data-${attr}]`,(x,a)=>x.map(e=>e.dataset[a]),attr);
   if (t.length<2 || (await qv())==='(no q)') { console.log(v,'tabs',t.length,'q',await qv()); continue; }
   await pg.fill('#q','ABC'); await pg.press('#q','Enter'); await pg.waitForTimeout(400);
   await pg.locator(`#main [data-${attr}="${t[1]}"]`).first().click(); await pg.waitForTimeout(400); const a=await qv();
   await pg.locator(`#main [data-${attr}="${t[0]}"]`).first().click(); await pg.waitForTimeout(400); const c=await qv();
   console.log(v,t.slice(0,3),'tab2:',a,'tab1 lại:',c);
 }
 console.log('errs',errs); await b.close(); })();
