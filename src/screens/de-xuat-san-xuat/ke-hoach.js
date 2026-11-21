//# Màn hình Đề xuất sản xuất (thông số)
let khEdit=false;
function vKeHoach(m){
  // Đề xuất sản xuất: chỉ hiện các thông số để phần mềm chạy đề xuất. Kết quả đề xuất được đưa thẳng vào Lệnh sản xuất thực tế khi bấm ▶ Tính giá thành.
  const prm=proposalParams(); const ed=khEdit; const dis=ed?'':'disabled';
  const fld=(id,lbl,v,unit,step,help)=>`<div class="kh-f"><label for="${id}">${lbl}</label><div class="kh-i"><input type="number" class="ng" id="${id}" value="${v}" step="${step}" min="0" ${dis}><span class="mut">${unit}</span></div></div>`;
  m.innerHTML = head('Đề xuất sản xuất') + `<div class="box"><div class="bx-hd"><h3>Thông số để phần mềm đề xuất sản xuất</h3><span class="sp"></span>${ed?`<button class="btn s" id="khC">Hủy</button> <button class="btn s p" id="khS">${IC('save')}Lưu</button>`:`<button class="btn s" id="khE">${IC('edit')}Sửa</button>`}</div>
    <div class="kh-g">
      ${fld('pTonLau','Mốc NVLC tồn lâu',prm.tonLau,'ngày',1,'NVL chính có <i>Số ngày còn dùng</i> (tồn cuối ÷ BQ xuất/ngày) lớn hơn mốc này → phần tồn vượt mốc được đề xuất <b>tăng mẻ</b> thành phẩm để tiêu thụ. Tăng mốc = ít đề xuất tăng hơn.')}
      ${fld('pDuPhong','Dự phòng NVL chính',prm.duPhong,'ngày',1,'Khi tăng mẻ, các NVL khác của thành phẩm phải còn đủ dùng ít nhất số ngày này; thiếu thì giới hạn số mẻ tăng.')}
      ${fld('pBoQua','Bỏ qua NVL tỷ trọng ≤',prm.boQua,'(0,1 = 10%)',0.01,'NVL chiếm tỷ trọng giá trị thành phẩm nhỏ hơn hoặc bằng mức này (bao bì, gia vị…) không giới hạn số mẻ tăng.')}
    </div><div class="small mut" style="margin-top:10px">Ý nghĩa từng thông số và cách phần mềm đề xuất: xem <a href="#" data-go="huongdan">Hướng dẫn</a>.</div></div>`;
  bindKy();
  m.querySelectorAll('[data-go]').forEach(a=>a.onclick=e=>{ e.preventDefault(); if (a.dataset.go==='lich') { goView('thietlap'); render(); $('#main').dataset.stab='cal'; render(); return; } goView(a.dataset.go); render(); });
  const e1=$('#khE'); if (e1) e1.onclick=()=>{ khEdit=true; render(); };
  const c1=$('#khC'); if (c1) c1.onclick=()=>{ khEdit=false; render(); };
  const s1=$('#khS'); if (s1) s1.onclick=()=>{ const tl=num($('#pTonLau').value), dp=num($('#pDuPhong').value), bq=num($('#pBoQua').value);
    if (!(tl>0)) return toast('Mốc NVLC tồn lâu phải lớn hơn 0'); if (dp<0) return toast('Dự phòng không được âm'); if (bq<0 || bq>=1) return toast('Tỷ trọng bỏ qua nhập từ 0 đến dưới 1 (ví dụ 0,1 = 10%)');
    const chg = tl!==prm.tonLau || dp!==prm.duPhong || bq!==prm.boQua;
    state.settings.tonLau=tl; state.settings.duPhong=dp; state.settings.boQua=bq; khEdit=false; if (chg) changed(); render(); toast(chg?'Đã lưu – thông số áp dụng từ lần ▶ Tính giá thành tiếp theo':'Không có thay đổi'); };
}
