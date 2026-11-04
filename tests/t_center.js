const { chromium } = require('playwright'); const path=require('path'); const APP='file://'+path.resolve(__dirname,'../artifact/index.html'); const DATA=p=>path.resolve(__dirname,'../data',p); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto(APP); await pg.waitForTimeout(800);
 const seed=JSON.parse(fs.readFileSync(DATA('demo_2026_seed.json'),'utf8'));
 await pg.evaluate(([s])=>{ app.importDocs(s); calcCache=null; calcDirty=false; selKy='2026-10'; },[seed]);
 const ids=await pg.evaluate(()=>NAV.filter(x=>x.id).map(x=>x.id));
 const out=[];
 const check=async(label)=>{ const r=await pg.evaluate(()=>[...document.querySelectorAll('#main th, .modal th')].filter(th=>th.offsetParent).map(th=>{ const cs=getComputedStyle(th); const r=th.getBoundingClientRect(); const rg=document.createRange(); const nodes=[...th.childNodes].filter(n=>!(n.nodeType===1&&(n.classList.contains('xfb')||n.classList.contains('xrs')))); if(!nodes.length) return null; rg.setStartBefore(nodes[0]); rg.setEndAfter(nodes[nodes.length-1]); const rs=[...rg.getClientRects()].filter(x=>x.width>0); if(!rs.length) return null; const L=Math.min(...rs.map(x=>x.left)), R=Math.max(...rs.map(x=>x.right)); const pl=parseFloat(cs.paddingLeft), pr=parseFloat(cs.paddingRight); const cx=(r.left+pl + r.right-pr)/2; const off=Math.round((L+R)/2-cx); return {t:th.innerText.replace(/\s+/g,' ').replace('▼','').trim().slice(0,30), ta:cs.textAlign, off, pl, pr}; }).filter(x=>x && (x.ta!=='center' || Math.abs(x.off)>3 || x.pl!==x.pr)));
   if (r.length) out.push(label+': '+r.map(x=>`[${x.t}] ${x.ta} off=${x.off} pad=${x.pl}/${x.pr}`).join('; ')); };
 for (const id of ids) { await pg.evaluate(id=>{ view=id; render(); },id); await pg.waitForTimeout(250);
   await check(id);
   const tabs=await pg.$$('#main .tabs button'); for (let i=1;i<tabs.length;i++){ const t=(await pg.$$('#main .tabs button'))[i]; if(!t) continue; await t.click(); await pg.waitForTimeout(250); await check(id+'#tab'+i); } }
 console.log(out.join('\n')||'all centered'); console.log('errs',errs); await b.close(); })();
