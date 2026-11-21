const { chromium } = require('playwright'); const fs=require('fs'); const {execFileSync}=require('child_process');
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({acceptDownloads:true}); const pg=await ctx.newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://../app/PhanMem_GiaThanh_DuongVan.html'); await pg.waitForFunction(()=>window.__booted===true); await pg.click('#seedbtn'); await pg.waitForTimeout(300);
 const before = await pg.evaluate(()=>({items:state.items.length, bom:state.bom.length, purchases:state.purchases.length, sales:state.sales.length, orders:state.orders.length, gc:state.gc.length, cal:state.cal.length, opening:Object.keys(state.opening.rows).length}));
 await pg.evaluate(()=>{ view='thietlap'; render(); }); const [dl]=await Promise.all([pg.waitForEvent('download'), pg.click('#bkx')]); const f='/home/claude/work/shots/DuLieu_full.xlsx'; await dl.saveAs(f);
 const aoa = JSON.parse(execFileSync('python3',['-I','-c',`
import openpyxl,json,sys,datetime
wb=openpyxl.load_workbook(sys.argv[1],data_only=True); o={}
for ws in wb.worksheets:
  o[ws.title]=[[ (c.strftime('%Y-%m-%d') if isinstance(c,(datetime.datetime,datetime.date)) else ('' if c is None else c)) for c in r] for r in ws.iter_rows(values_only=True)]
print(json.dumps(o,ensure_ascii=False))`, f]).toString());
 const after = await pg.evaluate((aoa)=>{ fromDocs({settings:{company:state.settings.company, startKy:'2026-01'}}); importAOA('items', aoa.DanhMuc, 'replace', true); const log={}; ['TonDau','DinhMuc','NVLThayThe','GiaCong','LenhSX','CanDoiNVL','XuatChung','LichNghi','ChiPhi'].forEach(s=>{ if (aoa[s] && aoa[s].length>1) log[s]=importAOA(TEMPLATE[s].ent, aoa[s], 'replace', true); }); const g=splitGiaoDich(aoa.GiaoDich); log.mua=importAOA('purchases', g.purchases||[], 'replace', true); log.ban=importAOA('sales', g.sales||[], 'replace', true);
   return {log, items:state.items.length, bom:state.bom.length, purchases:state.purchases.length, sales:state.sales.length, orders:state.orders.length, gc:state.gc.length, cal:state.cal.length, opening:Object.keys(state.opening.rows).length, sheets:Object.keys(aoa)}; }, aoa);
 console.log('Trước:', JSON.stringify(before)); console.log('Sau khứ hồi:', JSON.stringify(after)); console.log('errs', errs); await b.close(); })();
