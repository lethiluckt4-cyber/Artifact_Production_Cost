#!/usr/bin/env node
// Ghép mã nguồn trong src/ thành tệp HTML duy nhất để xuất bản artifact.
//
//   node tools/build.js           → artifact/index.html          (có dữ liệu mẫu src/data/seed.json)
//                                   artifact/index_mau_trong.html (không dữ liệu, tên [TÊN CÔNG TY])
//                                   src/dev.html                  (bản phát triển: nạp từng tệp css/js riêng)
//   node tools/build.js --check   → chỉ ghép thử và so với artifact/index.html hiện có (báo khác / giống)
//
// Thứ tự ghép lấy từ src/manifest.json. Dòng đầu mỗi tệp bắt đầu bằng "//# " (js) hoặc "/*# " (css)
// là dòng giới thiệu tệp, được bỏ khi ghép.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, 'artifact');
const COMPANY = 'KH Thảo Vy';

const read = p => fs.readFileSync(path.join(SRC, p), 'utf8');
const body = (p) => {
  let t = read(p);
  if (t.startsWith('//# ') || t.startsWith('/*# ')) t = t.slice(t.indexOf('\n') + 1);
  return t.replace(/\n$/, '');
};

const manifest = JSON.parse(read('manifest.json'));
const shell = read('khung-trang.html');
const seed = read('data/seed.json').trim();
const css = manifest.css.map(body).join('\n');
const js = manifest.js.map(body).join('\n');

function bundle(seedJson) {
  return shell
    .replace('<!-- @seed -->', () => `<script type="application/json" id="seed">${seedJson}</script>`)
    .replace('<!-- @css -->', () => css)
    .replace('<!-- @js -->', () => js);
}

const full = bundle(seed);

if (process.argv.includes('--check')) {
  const cur = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8');
  console.log(cur === full ? 'GIỐNG: src/ ghép ra đúng bằng artifact/index.html' : 'KHÁC: artifact/index.html chưa khớp với src/ – chạy node tools/build.js');
  process.exit(cur === full ? 0 : 1);
}

fs.writeFileSync(path.join(OUT, 'index.html'), full);
fs.writeFileSync(path.join(OUT, 'index_mau_trong.html'), bundle('{}').split(COMPANY).join('[TÊN CÔNG TY]'));

// Bản phát triển: mở thẳng src/dev.html bằng trình duyệt, sửa tệp nào chỉ cần tải lại trang (F5), không cần ghép.
const dev = shell
  .replace('<!-- @seed -->', () => `<script type="application/json" id="seed">${seed}</script>`)
  .replace(/<style>\n<!-- @css -->\n<\/style>/, () => manifest.css.map(c => `<link rel="stylesheet" href="${c}">`).join('\n'))
  .replace(/<script>\n<!-- @js -->\n<\/script>/, () => manifest.js.map(j => `<script src="${j}"></script>`).join('\n'))
  .replace('<title>', '<title>[DEV] ');
fs.writeFileSync(path.join(SRC, 'dev.html'), dev);

const kb = n => (n / 1024).toFixed(0) + ' KB';
console.log(`Đã ghép ${manifest.css.length} tệp CSS + ${manifest.js.length} tệp JS`);
console.log(`  artifact/index.html           ${kb(Buffer.byteLength(full))}`);
console.log(`  artifact/index_mau_trong.html ${kb(fs.statSync(path.join(OUT, 'index_mau_trong.html')).size)}`);
console.log('  src/dev.html                  (bản phát triển)');
