const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1500,height:800}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; calcCache=null; view='d_purchases'; render(); }); await pg.waitForTimeout(300);
 // pick a row with sl>=100: find id
 const R = await pg.evaluate(()=>{ const r=state.purchases.find(x=>x.ngayNhap.startsWith('2026-10')&&num(x.sl)>=1000&&x.hoaDon); return {id:r._id, hd:r.hoaDon, sl:r.sl, tt:r.tt, dg:r.donGia, ncc:r.ncc, ma:r.ma, nm:r.ngayMua}; });
 console.log('orig', R);
 await pg.click(`[data-split="${R.id}"]`); await pg.waitForTimeout(300);
 const rowOrder = await pg.evaluate((id)=>{ const trs=[...document.querySelectorAll('tbody tr')]; const i=trs.findIndex(tr=>tr.querySelector(`[data-split="${id}"]`)); return [i, trs[i+1].querySelector('td.ed')?.dataset.id!==undefined]; }, R.id);
 console.log('new row right below source', rowOrder);
 const nid = await pg.evaluate(()=>editRow);
 await pg.click(`td.ed[data-id="${nid}"][data-k="ngayNhap"]`); await pg.keyboard.type('15/10/2026');
 await pg.click(`td.ed[data-id="${nid}"][data-k="sl"]`); await pg.keyboard.type('400',{delay:30}); await pg.waitForTimeout(100);
 console.log('preview', await pg.evaluate(([id,nid])=>({tt:document.querySelector(`td.ed[data-id="${nid}"][data-k="tt"]`).textContent, rsl:document.querySelector(`td[data-id="${id}"][data-k="sl"]`).textContent, rcls:document.querySelector(`td[data-id="${id}"][data-k="sl"]`).className}),[R.id,nid]));
 await pg.click(`td.ed[data-id="${nid}"][data-k="sl"]`); await pg.keyboard.press('Control+A'); await pg.keyboard.type('99999'); await pg.waitForTimeout(100);
 console.log('too much', await pg.evaluate((id)=>document.querySelector(`td[data-id="${id}"][data-k="sl"]`).className, R.id));
 await pg.click('button[data-save]'); await pg.waitForTimeout(200); console.log('toast', await pg.evaluate(()=>[...document.querySelectorAll('.toast')].pop().textContent));
 await pg.click(`td.ed[data-id="${nid}"][data-k="sl"]`); await pg.keyboard.press('Control+A'); await pg.keyboard.type('400'); 
 // manual tt
 await pg.click(`td.ed[data-id="${nid}"][data-k="tt"]`); await pg.keyboard.press('Control+A'); await pg.keyboard.type('1000000'); await pg.waitForTimeout(100);
 console.log('dg after manual tt', await pg.evaluate(nid=>document.querySelector(`td.ed[data-id="${nid}"][data-k="donGia"]`).textContent, nid));
 await pg.click(`button[data-save="${nid}"]`); await pg.waitForTimeout(300);
 console.log('after save', await pg.evaluate(([id,nid])=>{ const a=state.purchases.find(x=>x._id===id), n=state.purchases.find(x=>x._id===nid); return {R:[a.sl,a.tt,a.donGia], N:[n.sl,n.tt,n.donGia,n.ngayNhap,n.hoaDon,n._new,n._splitOf], sumSL:a.sl+n.sl, sumTT:a.tt+n.tt}; },[R.id,nid]), 'expected sum', R.sl, R.tt);
 console.log('col vals', await pg.evaluate(([id,nid])=>{ const th=[...document.querySelectorAll('thead th')].map(x=>x.textContent.replace('▼','').trim()); const i=th.indexOf('Mua hàng chưa HĐ'); const f=id=>{ const tr=document.querySelector(`tr:has([data-edit="${id}"])`); return tr?tr.children[i].textContent:null; }; return [th[i], f(id), f(nid)]; },[R.id,nid]));
 await pg.screenshot({path:'/tmp/n_split.png'});
 // cancel path
 await pg.click(`[data-split="${R.id}"]`); await pg.waitForTimeout(200); await pg.click('button[data-cancel]'); await pg.waitForTimeout(200); console.log('after cancel R unchanged', await pg.evaluate(id=>state.purchases.find(x=>x._id===id).sl, R.id), errs);
 await b.close(); })();
