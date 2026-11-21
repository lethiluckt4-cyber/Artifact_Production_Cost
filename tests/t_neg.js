const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:950}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(2500);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/import/nap_final.json','utf8')); delete docs._nap; docs.settings=JSON.parse(fs.readFileSync('settings_live.json','utf8'));
 await pg.evaluate(d=>{ fromDocs(d); state.cal=[]; changed(); calcCache=null; closeModal(); }, docs);
 const views=['nxt','giathanh','banhang','nam','canhbao','d_adjustments','tongquan','kehoach','d_costs','d_purchases'];
 for (const v of views) { await pg.evaluate(v=>{ view=v; selKy='2026'; render(); }, v); await pg.waitForTimeout(400);
   const r=await pg.evaluate(()=>{ const tw=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let left=0; while(tw.nextNode()) if (tw.currentNode.nodeValue.includes('⁠')) left++; const neg=[...document.querySelectorAll('.negv')]; const minusTxt=[...document.querySelectorAll('#main td')].filter(td=>/^-\d/.test(td.textContent.trim())).length; return {left, neg:neg.length, sample:neg.slice(0,3).map(e=>e.textContent+':'+getComputedStyle(e).color), minusTxt}; });
   console.log(v, JSON.stringify(r)); if (v==='nxt'||v==='canhbao') { await pg.evaluate(()=>{ const e=document.querySelector('#main .negv'); if(e) e.scrollIntoView({block:'center',inline:'center'}); }); await pg.waitForTimeout(200); await pg.screenshot({path:'/home/claude/work/neg_'+v+'.png'}); } }
 console.log('num', await pg.evaluate(()=>[num('(1.234)'), num('⁠(1.234,5)'), num('-12'), num('(12,5%)'), fmtN(-1234), fmtQ(-0.0001), fmtN(-0.2)]));
 console.log('errs',errs); await b.close(); })();
