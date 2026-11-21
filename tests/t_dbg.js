const { chromium } = require('playwright'); const fs=require('fs');
const seed = JSON.parse(fs.readFileSync('/home/claude/work/data/seed.json','utf8')); const exp=JSON.parse(fs.readFileSync('/home/claude/work/data/expected.json','utf8'));
const want = process.argv.slice(2);
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage(); await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true);
 const out=await pg.evaluate(([seed,want])=>{ fromDocs(JSON.parse(JSON.stringify(seed))); state.settings.workYear='2026'; calcCache=null; resetProposal('2026-01'); calcCache=null; calc(); const pl=buildPlan('2026'); applyPlanCore(pl,[...new Set(pl.list.map(x=>x.kyDX))]); calcCache=null; const c=calc();
   const o=Object.values(c.periods).flatMap(P=>P.orders).filter(o=>want.includes(o.maLenh)); return o.map(o=>({m:o.maLenh, lines:o.lines.map(l=>[l.maVT,l.slDM,l.tonTruoc,l.tong,l.dg,l.tt,l.thieuTT])})); },[seed,want]);
 out.forEach(o=>{ console.log(o.m); const el=exp.lines.filter(l=>l.maLenh===o.m); o.lines.forEach((l,i)=>{ const e=el[i]; console.log('  PM', JSON.stringify(l)); console.log('  XL', JSON.stringify([e.vt,e.slDM,e.ton+e.tong,e.tong,e.dg,e.tt,e.thieu])); }); });
 await b.close(); })();
