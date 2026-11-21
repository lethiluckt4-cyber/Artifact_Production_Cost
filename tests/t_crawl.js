const { chromium } = require('playwright'); const fs=require('fs');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1600,height:1000}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(()=>{ const D=Date; const fixed=new D('2026-11-19T09:00:00+07:00').getTime(); window.Date=class extends D{ constructor(...a){ if(a.length) super(...a); else super(fixed);} static now(){return fixed;} }; });
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(6500);
 const docs=JSON.parse(fs.readFileSync('/home/claude/work/audit/live.json','utf8'));
 const nav=await pg.evaluate((docs)=>{ fromDocs(docs); calcCache=null; closeModal(); selKy='2026'; return NAV; }, docs);
 const snap=()=>pg.evaluate(()=>{ const m=$('#main'); const clean=t=>t.replace(/[▼▲]/g,'').replace(/\s+/g,' ').trim();
   const top=m.querySelector('.top'); const btns=[...m.querySelectorAll('.toolbar .tbl-r button')].filter(x=>x.offsetParent || x.style.display!=='none').map(x=>({t:clean(x.textContent)||x.getAttribute('aria-label')||'', c:x.className, tip:x.title||'', hid:!x.offsetParent}));
   const tabs=[...m.querySelectorAll('.tabs')].map(t=>[...t.querySelectorAll('button')].map(x=>({t:clean(x.textContent),act:x.classList.contains('act')})));
   const tables=[...m.querySelectorAll('table')].filter(t=>t.offsetParent).map(t=>{ const rows=[...t.querySelectorAll('thead tr')]; return {hdr: rows.map(r=>[...r.children].map(c=>clean(c.textContent)+(c.colSpan>1?` [gộp ${c.colSpan}]`:''))), n:t.querySelectorAll('tbody tr').length, cap: (t.closest('.card')?.querySelector('h3')?.textContent||'').trim()}; });
   const sub=[...m.querySelectorAll('[data-hsh]')].map(x=>clean(x.textContent));
   const other=[...m.querySelectorAll('button')].filter(x=>x.offsetParent && !x.closest('.top') && !x.closest('.toolbar') && !x.closest('.tabs') && !x.closest('table')).map(x=>clean(x.textContent)).filter(Boolean);
   return {title: clean(top?.querySelector('h2')?.textContent||''), btns, tabs, tables, sub, other:[...new Set(other)].slice(0,30)}; });
 const out=[];
 for (const it of nav) { if (it.g) { out.push({g:it.g}); continue; }
   await pg.evaluate(v=>{ closeModal(); view=v; const m=$('#main'); Object.keys(m.dataset).forEach(k=>delete m.dataset[k]); render(); }, it.id); await pg.waitForTimeout(250);
   const s0=await snap(); const ent={id:it.id, t:it.t, main:s0, tabs:[]};
   const tabBtns = s0.tabs[0]||[];
   for (let i=0;i<tabBtns.length;i++) { await pg.evaluate(i=>{ closeModal(); const t=$('#main .tabs'); const bs=t?t.querySelectorAll('button'):[]; if (bs[i]) bs[i].click(); }, i); await pg.waitForTimeout(250);
     const s=await snap(); const te={tab:tabBtns[i].t, snap:s, sub:[]};
     const t2=(s.tabs[1]||[]); for (let j=0;j<t2.length;j++){ await pg.evaluate(j=>{ closeModal(); const t=$('#main').querySelectorAll('.tabs')[1]; const bs=t?t.querySelectorAll('button'):[]; if (bs[j]) bs[j].click(); }, j); await pg.waitForTimeout(250); te.sub.push({tab:t2[j].t, snap:await snap()}); }
     for (let j=0;j<s.sub.length;j++){ await pg.evaluate(j=>{ $('#main').querySelectorAll('[data-hsh]')[j].click(); }, j); await pg.waitForTimeout(200); te.sub.push({tab:s.sub[j], snap:await snap()}); }
     ent.tabs.push(te); }
   out.push(ent); }
 fs.writeFileSync('/home/claude/work/uispec/crawl.json', JSON.stringify(out,null,1)); console.log('views',out.length,'errs',errs.slice(0,5)); await b.close(); })();
