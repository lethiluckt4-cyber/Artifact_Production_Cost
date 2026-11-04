const { chromium } = require('playwright');
const views=[['01_tongquan','tongquan'],['02_canhbao','canhbao'],['03_danhmuc','d_items'],['04_sodu_dauky','d_opening'],['05_dinhmuc','d_bom'],['06_nvl_thaythe','d_subs'],['07_muahang','d_purchases'],['08_lenhsx_kehoach','d_orders'],['09_xuat_dungchung','d_issues'],['10_chiphi_622_627','d_costs'],['11_dexuat_sx','kehoach'],['12_lenhsx_thucte','lsxtt'],['13_dieuchinh_nvl','d_adjustments'],['14_giathanh','giathanh'],['15_nxt','nxt'],['16_baocao_banhang','banhang'],['17_tonghop_nam','nam'],['18_file_misa','xuatphieu'],['19_thietlap','thietlap'],['20_huongdan','huongdan']];
(async()=>{ const b=await chromium.launch(); const pg=await b.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errs=[]; pg.on('pageerror',e=>errs.push(e.message));
 await pg.goto('file://'+require('path').resolve(__dirname,'../artifact/index.html')); await pg.waitForTimeout(800);
 await pg.evaluate(()=>{ fromDocs(JSON.parse(document.querySelector('#seed').textContent)); state.settings.workYear='2026'; selKy='2026-10'; });
 for (const [f,v] of views){ await pg.evaluate(v=>{ view=v; render(); },v); await pg.waitForTimeout(500); await pg.screenshot({path:'/tmp/shots/'+f+'.png'}); }
 console.log('errors',errs.length, errs.slice(0,3)); await b.close(); })();
