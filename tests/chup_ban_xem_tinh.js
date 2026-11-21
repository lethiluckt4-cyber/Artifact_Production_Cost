// Chụp bản xem tĩnh (HTML) của từng màn hình → screens-preview/
// Cách dùng (trong thư mục tests):  node chup_ban_xem_tinh.js ../data/SaoLuu_GiaThanh_<ngày>.json [kỳ, mặc định 2026-10]
// Mỗi tệp là HTML thuần (đủ CSS, bỏ toàn bộ JavaScript) – mở bằng trình duyệt để xem bố cục, cột, nút của màn hình đó.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const APP = 'file://' + path.resolve(__dirname, '../artifact/index.html');
const OUT = path.resolve(__dirname, '../screens-preview');
const DATA = process.argv[2]; const KY = process.argv[3] || '2026-10';
if (!DATA) { console.error('Thiếu đường dẫn tệp sao lưu .json'); process.exit(1); }

// [tệp, màn hình (view), thiết lập tab (dataset của #main), kỳ xem, tên hiển thị trong mục lục]
const KY_Y = KY.slice(0, 4);
const SCREENS = [
  ['01_tong-quan', 'tongquan', {}, KY, 'Tổng quan'],
  ['02a_canh-bao_ket-qua', 'canhbao', { cbt: 'kq' }, KY, 'Cảnh báo & kiểm tra – Kết quả'],
  ['02b_canh-bao_kiem-tra-du-lieu', 'canhbao', { cbt: 'kt' }, KY, 'Cảnh báo & kiểm tra – Kiểm tra dữ liệu'],
  ['02c_canh-bao_nguong-tham-so', 'canhbao', { cbt: 'ng' }, KY, 'Cảnh báo & kiểm tra – Ngưỡng & tham số'],
  ['03a_danh-muc-hang', 'd_items', {}, KY, 'Danh mục hàng – Danh mục VTHH'],
  ['03b_nhom-hang', 'd_nhom', {}, KY, 'Danh mục hàng – Nhóm hàng'],
  ['04_so-du-dau-ky', 'd_opening', {}, KY, 'Số dư NXT đầu kỳ'],
  ['05_dinh-muc', 'd_bom', {}, KY, 'Định mức'],
  ['06_nvl-thay-the', 'd_subs', {}, KY, 'NVL thay thế'],
  ['07a_mua-hang', 'd_purchases', {}, KY, 'Mua hàng & Bán hàng – Mua hàng'],
  ['07b_ban-hang', 'd_sales', {}, KY, 'Mua hàng & Bán hàng – Bán hàng'],
  ['08_xuat-dung-chung', 'd_issues', {}, KY, 'Xuất dùng chung'],
  ['09_chi-phi-622-627', 'd_costs', {}, KY_Y, 'Chi phí 622/627'],
  ['10_luong-xu-ly', 'luong', {}, KY, 'Luồng xử lý'],
  ['11_de-xuat-san-xuat', 'kehoach', {}, KY, 'Đề xuất sản xuất'],
  ['12_lenh-san-xuat', 'd_orders', {}, KY, 'Lệnh sản xuất'],
  ['13a_can-doi-nvl_chi-tiet', 'd_adjustments', { cdt: 'ct' }, KY, 'Cân đối NVL – Chi tiết theo lệnh'],
  ['13b_can-doi-nvl_tong-hop', 'd_adjustments', { cdt: 'th' }, KY, 'Cân đối NVL – Tổng hợp CĐ theo mặt hàng'],
  ['14a_nxt_tong-hop', 'nxt', { nxtTab: 'th' }, KY, 'Nhập – Xuất – Tồn – Tổng hợp'],
  ['14b_nxt_chi-tiet', 'nxt', { nxtTab: 'ct' }, KY, 'Nhập – Xuất – Tồn – Chi tiết'],
  ['15a_gia-thanh_theo-lenh', 'giathanh', { tab: 'lenh' }, KY, 'Giá thành – Theo lệnh'],
  ['15b_gia-thanh_chi-tiet-nvl', 'giathanh', { tab: 'nvl' }, KY, 'Giá thành – Chi tiết NVL'],
  ['15c_gia-thanh_thanh-pham', 'giathanh', { tab: 'tp' }, KY, 'Giá thành – Thành phẩm'],
  ['15d_gia-thanh_mau-excel', 'giathanh', { tab: 'xl' }, KY, 'Giá thành – Bố cục Excel'],
  ['16_tong-hop-ban-hang', 'banhang', {}, KY, 'Tổng hợp bán hàng theo mặt hàng'],
  ['17_tong-hop-nam', 'nam', {}, KY_Y, 'Tổng hợp năm'],
  ['18a_file-ke-toan_xuat-kho-nvl', 'xuatphieu', { ptab: 'xk' }, KY, 'File tải dữ liệu kế toán – XK NVL'],
  ['18b_file-ke-toan_nhap-kho-tp', 'xuatphieu', { ptab: 'nk' }, KY, 'File tải dữ liệu kế toán – NK TP'],
  ['18c_file-ke-toan_hd-chuyen-ngay_mua-hang', 'xuatphieu', { ptab: 'hd', hdt: 'mua' }, KY_Y, 'HĐ chuyển ngày nhập kho – Mua hàng trong nước'],
  ['18d_file-ke-toan_hd-chuyen-ngay_nvk', 'xuatphieu', { ptab: 'hd', hdt: 'nvk' }, KY_Y, 'HĐ chuyển ngày nhập kho – Nghiệp vụ khác'],
  ['18e_file-ke-toan_hd-chuyen-ngay_ds', 'xuatphieu', { ptab: 'hd', hdt: 'ds' }, KY_Y, 'HĐ chuyển ngày nhập kho – DS HĐ chuyển ngày'],
  ['18f_file-ke-toan_hd-chuyen-ngay_doi-chieu', 'xuatphieu', { ptab: 'hd', hdt: 'dc' }, KY_Y, 'HĐ chuyển ngày nhập kho – Đối chiếu HĐ'],
  ['19a_thiet-lap_sao-luu', 'thietlap', { tlt: 'tl' }, KY, 'Thiết lập & sao lưu'],
  ['19b_thiet-lap_lich-nghi', 'thietlap', { tlt: 'cal' }, KY, 'Thiết lập – Lịch nghỉ SX'],
  ['19c_thiet-lap_phan-bo-622-627', 'thietlap', { tlt: 'pb' }, KY, 'Thiết lập – Phân bổ 622/627'],
  ['19d_thiet-lap_san-pham-loi', 'thietlap', { tlt: 'loi' }, KY, 'Thiết lập – Sản phẩm lỗi'],
  ['20_huong-dan', 'huongdan', {}, KY, 'Hướng dẫn'],
];
const fmtKy = k => k.length === 4 ? 'năm ' + k : k.slice(5, 7) + '/' + k.slice(0, 4);

(async () => {
  const docs = JSON.parse(fs.readFileSync(path.resolve(DATA), 'utf8'));
  fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { window.XLSX = { utils: {} }; });   // thư viện Excel từ CDN không cần cho bản xem
  await pg.goto(APP); await pg.waitForTimeout(1200);
  await pg.evaluate(d => app.importDocs(d.docs || d), docs);
  const list = [];
  for (const [file, v, ds, ky, title] of SCREENS) {
    const html = await pg.evaluate(([v, ds, ky]) => {
      closeModal(); const m = $('#main');
      Object.keys(m.dataset).forEach(k => delete m.dataset[k]); Object.assign(m.dataset, ds);
      view = v; kyByMenu[menuOf(v)] = ky; selKy = ky; render();
      const doc = document.documentElement.cloneNode(true);
      doc.querySelectorAll('script, #bootErr, .toast').forEach(x => x.remove());
      doc.querySelectorAll('[onclick]').forEach(x => x.removeAttribute('onclick'));
      return '<!DOCTYPE html>\n' + doc.outerHTML;
    }, [v, ds, ky]);
    const note = `<!-- Bản xem tĩnh: ${title} · kỳ ${fmtKy(ky)} · chụp từ artifact/index.html (không có JavaScript, nút bấm không chạy). Mã nguồn màn hình: xem src/README.md -->\n`;
    fs.writeFileSync(path.join(OUT, file + '.html'), note + html.replace('<!DOCTYPE html>\n', '<!DOCTYPE html>\n'));
    list.push([file, title, ky]);
  }
  const idx = `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Bản xem tĩnh các màn hình – Phần mềm Giá thành</title>
<style>body{font:14px/1.6 system-ui,sans-serif;margin:24px;color:#0f172a}h1{font-size:20px;margin:0 0 4px}p{color:#475569;margin:0 0 14px}
table{border-collapse:collapse}td,th{border:1px solid #e2e8f0;padding:4px 10px;text-align:left}th{background:#f1f5f9}a{color:#0f766e}</style></head><body>
<h1>Bản xem tĩnh các màn hình</h1><p>Mỗi tệp là HTML thuần chụp từ phần mềm (dữ liệu thật, kỳ ${fmtKy(KY)}). Bấm để mở – chỉ xem bố cục, không chạy được nút.</p>
<table><tr><th>#</th><th>Màn hình / tab</th><th>Kỳ</th><th>Tệp</th></tr>
${list.map(([f, t, k], i) => `<tr><td>${i + 1}</td><td><a href="${f}.html">${t}</a></td><td>${fmtKy(k)}</td><td><code>${f}.html</code></td></tr>`).join('\n')}
</table></body></html>`;
  fs.writeFileSync(path.join(OUT, 'index.html'), idx);
  console.log('Đã chụp', list.length, 'màn hình →', OUT); console.log('Lỗi trang:', errs.length ? errs.slice(0, 5) : 'không');
  await b.close();
})();
