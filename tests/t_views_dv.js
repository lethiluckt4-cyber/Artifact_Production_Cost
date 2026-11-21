// Mở mọi màn hình + mọi tab (trống / có dữ liệu / cả năm / khoảng ngày), chạy ▶ Tính, kịch bản có số công nhân, xuất Excel – không được có lỗi
const { chromium } = require('playwright'); const fs=require('fs');
const APP = process.argv[2] || '/home/claude/work/app/index.html'; const SHOT='/home/claude/work/shots'; fs.mkdirSync(SHOT,{recursive:true});
(async()=>{ const b=await chromium.launch(); const ctx=await b.newContext({viewport:{width:1500,height:950}, acceptDownloads:true}); const pg=await ctx.newPage(); const errs=[];
 pg.on('pageerror',e=>errs.push('pageerror: '+e.message)); pg.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|Failed to load resource/.test(m.text())) errs.push('console: '+m.text()); });
 await pg.goto('file://'+APP); await pg.waitForFunction(()=>window.__booted===true, null, {timeout:30000});
 const TABS = {canhbao:['cbt',['kq','ng']], thietlap:['tlt',['tl','cal','pb']], kehoach:['ktab',['kh','lenh','dc']], giathanh:['tab',['lenh','nvl','tp','th','xl']], xuatphieu:['ptab',['xk','nk','xg','ng']]};
 const run = async (tag, ky) => { const views = await pg.evaluate(()=>NAV.filter(x=>x.id).map(x=>x.id).concat(['d_sales'])); const bad=[]; let n=0;
   for (const v of views) { const tabs = TABS[v] ? TABS[v][1] : [null];
     for (const t of tabs) { n++; const r = await pg.evaluate(([v,t,k,ky])=>{ try { if (ky) selKy=ky; view=v; const m=document.querySelector('#main'); if (t) m.dataset[k]=t; m.dataset.khDetail='1'; render(); const txt=m.innerText; return {err: txt.includes('Màn hình này bị lỗi') ? txt.slice(0,300) : '', tables: m.querySelectorAll('table').length, h: (m.querySelector('h2')||{}).textContent||''}; } catch(e){ return {err:'EXC '+e.message}; } }, [v,t,t?TABS[v][0]:'',ky]);
       if (r.err) bad.push(`${v}${t?'/'+t:''}: ${r.err}`); } }
   console.log(`${tag}: ${n} màn hình/tab · lỗi ${bad.length}`); bad.forEach(x=>console.log('   ', x)); return bad.length; };
 let tot=0; await pg.evaluate(()=>{ fromDocs({settings:{company:state.settings.company}}); calcCache=null; selKy=''; });
 tot += await run('TRỐNG');
 await pg.evaluate(()=>{ view='tongquan'; render(); }); await pg.screenshot({path:SHOT+'/00_trong.png'});
 await pg.click('#seedbtn'); await pg.waitForTimeout(300);
 tot += await run('CÓ DỮ LIỆU – tháng 6', '2026-06');
 tot += await run('CÓ DỮ LIỆU – cả năm', '2026');
 tot += await run('CÓ DỮ LIỆU – khoảng ngày', 'R:2026-04-15:2026-05-20');
 // ▶ Tính giá thành tháng 9 qua giao diện
 await pg.evaluate(()=>{ selKy='2026-09'; view='giathanh'; render(); }); await pg.click('#recalc'); await pg.waitForTimeout(200); await pg.selectOption('#rcM','09'); await pg.click('#rcGo'); await pg.waitForTimeout(2500);
 console.log('Hộp kết quả T9:', (await pg.evaluate(()=>document.querySelector('#modal').innerText)).replace(/\n+/g,' | ').slice(0,700));
 await pg.screenshot({path:SHOT+'/01_ket_qua_tinh.png'}); await pg.evaluate(()=>closeModal());
 // Ảnh các màn hình chính
 const shots=[['tongquan','2026-06',null],['canhbao','2026-06',['cbt','kq']],['canhbao','2026-06',['cbt','ng']],['d_items','2026-06',null],['d_bom','2026-06',null],['d_purchases','2026-04',null],['d_sales','2026-06',null],['d_gc','2026-04',null],['d_costs','2026-06',null],['kehoach','2026-06',['ktab','kh']],['kehoach','2026-06',['ktab','lenh']],['d_orders','2026-06',null],['giathanh','2026-06',['tab','lenh']],['giathanh','2026-06',['tab','th']],['giathanh','2026-06',['tab','tp']],['nxt','2026-06',null],['nam','2026',null],['xuatphieu','2026-04',['ptab','xg']],['thietlap','2026-06',['tlt','pb']],['huongdan','2026-06',null]];
 let i=2; for (const [v,k,t] of shots) { await pg.evaluate(([v,k,t])=>{ selKy=k; view=v; const m=document.querySelector('#main'); if (t) m.dataset[t[0]]=t[1]; m.dataset.khDetail=''; render(); window.scrollTo(0,0); }, [v,k,t]); await pg.waitForTimeout(250); await pg.screenshot({path:`${SHOT}/${String(i++).padStart(2,'0')}_${v}${t?'_'+t[1]:''}.png`}); }
 // Xuất Excel ở mọi màn hình có nút
 const ex=[['nxt','#xl'],['giathanh','#xl'],['banhang','#xl'],['nam','#xl'],['d_costs','#xl'],['canhbao','#cbXl'],['xuatphieu','#exBoth'],['d_gc','#xl'],['d_orders','#xl']]; const files=[];
 for (const [v,btn] of ex) { await pg.evaluate(([v])=>{ selKy=v==='xuatphieu'?'2026-04':'2026-06'; view=v; const m=document.querySelector('#main'); m.dataset.cbt='kq'; render(); }, [v]); try { const [dl] = await Promise.all([pg.waitForEvent('download',{timeout:8000}), pg.click(btn)]); const pth=SHOT+'/'+dl.suggestedFilename(); await dl.saveAs(pth); files.push(dl.suggestedFilename()+' '+fs.statSync(pth).size+'B'); } catch(e){ errs.push('xuất '+v+': '+e.message.slice(0,100)); } }
 console.log('Tệp xuất:', files.join(' · '));
 // Kịch bản có số công nhân + lương: đề xuất lại từ tháng 1 → may tồn kho theo năng lực
 const sc = await pg.evaluate(()=>{ for (let mth=1;mth<=9;mth++){ const k=`2026-${String(mth).padStart(2,'0')}`; state.costs[k]=Object.assign(state.costs[k]||{}, {soCN:6, c622:42000000, dien:3000000}); } calcCache=null; const r=resetProposal('2026-01'); calcCache=null; calc(); const pl=buildPlan('2026'); const ms=[...new Set(pl.list.map(x=>x.kyDX))]; applyPlanCore(pl, ms); calcCache=null; const c=calc();
   const ords=Object.values(c.periods).flatMap(P=>P.orders); const by={}; ords.forEach(o=>by[o.loaiLenh]=(by[o.loaiLenh]||0)+1); const k=kpiList(); const P6=c.periods['2026-06'];
   return {xoa:r.ords, lenh:ords.length, theoLoai:by, mt: pl.months['2026-01'].R, nl:pl.months['2026-01'].nangLuc, p6:{c622:P6.sum622, un:P6.unalloc622, dd:P6.ddCK, nk:P6.c154NK, chk: Math.round(P6.ddDK+P6.sum154-P6.ddCK-P6.c154NK)}, kpi:k.map(x=>{ try { return x[4](P6,'2026-06'); } catch(e){ return 'ERR '+e.message; } }), am: Object.values(c.periods).flatMap(P=>P.nxt).filter(x=>x.closeSL<-1e-6).map(x=>x.ma)}; });
 console.log('Kịch bản 6 CN:', JSON.stringify(sc));
 tot += await run('KỊCH BẢN CÓ CÔNG NHÂN – tháng 3', '2026-03');
 await pg.evaluate(()=>{ selKy='2026-03'; view='kehoach'; const m=document.querySelector('#main'); m.dataset.ktab='kh'; m.dataset.khDetail='1'; render(); }); await pg.waitForTimeout(250); await pg.screenshot({path:SHOT+'/30_kehoach_co_CN.png', fullPage:true});
 await pg.evaluate(()=>{ selKy='2026-03'; view='canhbao'; const m=document.querySelector('#main'); m.dataset.cbt='kq'; render(); }); await pg.waitForTimeout(250); await pg.screenshot({path:SHOT+'/31_canhbao_co_CN.png'});
 // Sao lưu → xóa → phục hồi
 const rt = await pg.evaluate(()=>{ const d=JSON.stringify(toDocs()); const n0=state.orders.length; fromDocs({settings:{company:state.settings.company}}); const e=state.orders.length; fromDocs(JSON.parse(d)); calcCache=null; return {n0, e, n1:state.orders.length, same: JSON.stringify(toDocs())===d}; });
 console.log('Sao lưu / phục hồi:', JSON.stringify(rt));
 console.log(`TỔNG LỖI MÀN HÌNH: ${tot} · Lỗi trang: ${errs.length}`); errs.slice(0,15).forEach(e=>console.log('  ', e));
 await b.close(); })();
