// Kiểm tra nhanh sau mỗi lần sửa mã nguồn:
//   1) src/ ghép lại đúng bằng artifact/index.html (đã chạy node tools/build.js chưa)
//   2) Mở cả bản phát triển (src/dev.html) và bản ghép (artifact/index.html), nạp dữ liệu mẫu,
//      bấm qua TẤT CẢ màn hình trên menu và mọi tab con → báo lỗi JavaScript / màn hình trống.
//
// Chạy:  cd tools && npm install && npx playwright install chromium   (lần đầu)
//        node ../tests/kiem_tra_man_hinh.js
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require(require.resolve('playwright', { paths: [path.join(__dirname, '../tools')] }));
const ROOT = path.resolve(__dirname, '..');

(async () => {
  let ok = true;
  try { execFileSync('node', [path.join(ROOT, 'tools/build.js'), '--check'], { stdio: 'inherit' }); }
  catch (e) { ok = false; }

  const b = await chromium.launch();
  for (const f of ['src/dev.html', 'artifact/index.html']) {
    const pg = await b.newPage({ viewport: { width: 1400, height: 800 } });
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('file://' + path.join(ROOT, f));
    await pg.waitForTimeout(1000);
    await pg.evaluate(() => {
      fromDocs(JSON.parse(document.querySelector('#seed').textContent));
      state.settings.workYear = '2026'; selKy = '2026-10'; kyDefault = '2026-10'; kyByView = {}; calcCache = null;
    });
    const views = await pg.evaluate(() => NAV.filter(x => x.id).map(x => [x.id, x.t]));
    const bad = [];
    for (const [id, t] of views) {
      const n0 = errs.length;
      await pg.evaluate(v => { view = v; render(); }, id);
      await pg.waitForTimeout(150);
      const len = await pg.evaluate(() => document.querySelector('#main').innerText.trim().length);
      if (len < 20 || errs.length > n0) bad.push(`${t}${len < 20 ? ' (trống)' : ''}`);
      // bấm qua các tab con của màn hình
      const tabs = await pg.$$eval('#main .tabs button, #main .subtabs button', bs => bs.length);
      for (let i = 0; i < tabs; i++) {
        const k = errs.length;
        const bt = (await pg.$$('#main .tabs button, #main .subtabs button'))[i];
        if (!bt) continue;
        const name = (await bt.innerText()).trim();
        await bt.click().catch(() => {});
        await pg.waitForTimeout(120);
        if (errs.length > k) bad.push(`${t} › ${name}`);
      }
    }
    console.log(`${f.padEnd(22)} ${views.length} màn hình  lỗi JS: ${errs.length}  ${bad.length ? 'CÓ VẤN ĐỀ: ' + bad.join('; ') : 'OK'}`);
    if (errs.length) console.log('   ', [...new Set(errs)].slice(0, 5).join('\n    '));
    if (errs.length || bad.length) ok = false;
    await pg.close();
  }
  await b.close();
  console.log(ok ? 'KẾT QUẢ: ĐẠT' : 'KẾT QUẢ: CHƯA ĐẠT');
  process.exit(ok ? 0 : 1);
})();
