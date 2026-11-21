const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1440,height:900}}); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000}); await pg.waitForTimeout(3000);
 // không còn chuỗi ${IC lộ ra ở bất kỳ màn hình nào
 const lo = await pg.evaluate(()=>{ const bad=[]; const vs=['d_items','d_bom','d_purchases','d_sales','d_orders','d_adjustments','d_issues','d_gc','d_opening','d_costs','nxt','giathanh','canhbao','tongquan','banhang','xuatphieu']; for (const v of vs){ view=v; render(); if ((document.querySelector('#main').innerHTML+document.querySelector('nav').innerHTML).includes('${IC')) bad.push(v); } return bad; });
 console.log('Lộ ${IC:', lo);
 await pg.evaluate(()=>{ view='d_purchases'; selKy='2026-03'; render(); }); await pg.waitForTimeout(300);
 await pg.screenshot({path:'/home/claude/work/shots/ic1.png', clip:{x:0,y:0,width:1440,height:520}});
 // Thiết lập bảng: ẩn 2 cột không bắt buộc
 await pg.click('#tblCfg'); await pg.waitForTimeout(200); await pg.screenshot({path:'/home/claude/work/shots/ic2.png'});
 const before = await pg.evaluate(()=>[...document.querySelectorAll('[data-tc]')].filter(x=>!x.disabled).slice(0,2).map(x=>{ x.checked=false; return x.parentElement.textContent.trim(); }));
 await pg.selectOption('#tcFz','3'); await pg.click('#tcOk'); await pg.waitForTimeout(300);
 const ths = await pg.evaluate(()=>[...document.querySelectorAll('#main .tw > table thead th')].map(t=>t.textContent.trim()));
 const fz = await pg.evaluate(()=>document.querySelector('#main .tw > table').querySelectorAll('thead th.fz').length);
 console.log('Ẩn:', before, '→ còn trong bảng?', before.map(t=>ths.some(h=>h.startsWith(t))), 'cố định', fz, 'cột');
 // Sửa / Lưu dòng
 await pg.click('[data-edit]'); await pg.waitForTimeout(200); await pg.screenshot({path:'/home/claude/work/shots/ic3.png', clip:{x:0,y:0,width:1440,height:420}});
 await pg.click('[data-save]'); await pg.waitForTimeout(300); console.log('Sau Lưu editRow =', await pg.evaluate(()=>editRow));
 // Làm mới
 await pg.waitForTimeout(3500); const cc0=await pg.evaluate(()=>{ window.__rc=0; const o=window.render; return !!document.querySelector('#refresh').onclick; }); await pg.click('#refresh'); await pg.waitForTimeout(800); console.log('Nút làm mới có gắn:', cc0, 'calcCache sau:', await pg.evaluate(()=>calcCache!==null));
 // Khôi phục mặc định
 await pg.click('#tblCfg'); await pg.click('#tcReset'); await pg.waitForTimeout(300); console.log('Số cột sau khôi phục:', await pg.evaluate(()=>document.querySelectorAll('#main .tw > table thead th').length), 'trước khi ẩn:', ths.length+2);
 await pg.evaluate(()=>{ view='tongquan'; render(); }); await pg.waitForTimeout(400); await pg.screenshot({path:'/home/claude/work/shots/ic4.png'});
 console.log('errs', errs); await b.close(); })();
