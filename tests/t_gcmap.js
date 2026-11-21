const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const pg=await (await b.newContext({viewport:{width:1500,height:900}})).newPage(); const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file:///home/claude/work/app/index.html'); await pg.waitForFunction(()=>window.__booted===true,null,{timeout:30000});
 // thêm 2 mã dịch vụ mới: thêu (gửi BTP in → nhận BTP thêu) và ép (chưa thiết lập mã nhận)
 await pg.evaluate(()=>{ state.items.push({_id:uid(), ma:'V_THEU', ten:'Dịch vụ thêu', nhom:'Dịch vụ gia công', dvt:'Cái', kho:'', heSo:''}, {_id:uid(), ma:'VAI_THEU', ten:'Vải đã thêu', nhom:'Bán thành phẩm', dvt:'m', kho:'152', heSo:''}, {_id:uid(), ma:'V_EP', ten:'Dịch vụ ép', nhom:'Dịch vụ gia công', dvt:'Cái', kho:'', heSo:''});
   state.purchases.push({_id:uid(), ngayNhap:'2026-06-15', ngayMua:'2026-06-15', hoaDon:'TH01', ncc:'Xưởng thêu A', ma:'V_THEU', sl:200, donGia:5000, tt:1000000, kho:'', ghiChu:''}, {_id:uid(), ngayNhap:'2026-06-20', ngayMua:'2026-06-20', hoaDon:'IN22', ncc:'Xưởng in B', ma:'V_IGC', sl:500, donGia:11000, tt:5500000, kho:'', ghiChu:''}); changed(); selKy='2026-06'; view='d_gc'; render(); });
 await pg.click('#gcMapBtn'); await pg.waitForTimeout(200);
 await pg.selectOption('select[data-gcm="V_THEU"][data-f="maGui"]','VAI_IN'); await pg.selectOption('select[data-gcm="V_THEU"][data-f="maNhan"]','VAI_THEU'); await pg.fill('input[data-gcm="V_THEU"][data-f="lt"]','2'); await pg.dispatchEvent('input[data-gcm="V_THEU"][data-f="lt"]','change'); await pg.fill('input[data-gcm="V_THEU"][data-f="hh"]','5'); await pg.dispatchEvent('input[data-gcm="V_THEU"][data-f="hh"]','change');
 await pg.screenshot({path:'/home/claude/work/shots/gcmap.png'}); await pg.click('#mclose');
 await pg.evaluate(()=>{ gcMap()['V_EP']={maGui:'VAI_IN', maNhan:'KHONG_CO'}; }); // mã nhận sai → dùng mặc định

 await pg.click('#gcAuto'); await pg.waitForTimeout(400);
 const r=await pg.evaluate(()=>({toast:document.body.innerText.match(/Đã tạo[^\n]*/)?.[0], gc:state.gc.map(g=>[g.soCT,g.maDV,g.hoaDon,g.ngayGui,g.ngayNhan,g.maGui,g.slGui,g.maNhan,g.slNhan]), map:state.settings.gcMap}));
 console.log(JSON.stringify(r,null,0));
 const c=await pg.evaluate(()=>{ const P=calc().periods['2026-06']; const x=P.nxt.find(z=>z.ma==='VAI_THEU'); return x?[x.nhapSL, Math.round(x.nhapTT)]:null; }); console.log('VAI_THEU nhập:', c);
 console.log('Ghi chú màn hình:', await pg.evaluate(()=>[...document.querySelectorAll('#main .bar')].slice(0,3).map(b=>b.innerText.replace(/\s+/g,' ')).join(' || ')));
 console.log('errs', errs); await b.close(); })();
