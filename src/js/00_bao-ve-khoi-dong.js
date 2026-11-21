/* Bảo vệ khởi động: nếu có lỗi hoặc treo, hiện thông báo rõ ràng thay vì trang trắng */
(function(){
  function box(html){ var m=document.getElementById('main'); var d=document.getElementById('bootErr');
    if(!d){ d=document.createElement('div'); d.id='bootErr'; d.style.cssText='margin:16px;padding:14px 16px;border:1px solid #fca5a5;background:#fef2f2;color:#991b1b;border-radius:10px;font:14px/1.5 system-ui,sans-serif'; (m||document.body).prepend(d); }
    d.innerHTML=html; }
  window.__bootBox = box;
  window.addEventListener('error', function(e){ if(window.__booted) return; box('<b>⚠ Phần mềm gặp lỗi khi khởi động.</b> Dữ liệu trên tài khoản <b>không bị ảnh hưởng</b>. Hãy chụp màn hình khung này gửi lại để sửa.<br><small>'+String(e.message||e.error||'').replace(/</g,'&lt;')+(e.lineno?' (dòng '+e.lineno+')':'')+'</small>'); });
  window.addEventListener('unhandledrejection', function(e){ if(window.__booted) return; var r=e.reason; box('<b>⚠ Phần mềm gặp lỗi khi tải dữ liệu.</b> Dữ liệu trên tài khoản <b>không bị ảnh hưởng</b>. Hãy chụp màn hình khung này gửi lại để sửa.<br><small>'+String(r&&(r.message||r)||'').replace(/</g,'&lt;')+'</small>'); });
  setTimeout(function(){ if(!window.__booted) box('<b>⏳ Phần mềm chưa tải xong sau 60 giây.</b> Dữ liệu trên tài khoản vẫn còn. Hãy kiểm tra mạng / đăng nhập Claude rồi tải lại trang (F5).<br><small>Bước đang chờ: '+(window.__bootStep||'khởi động')+'</small>'); }, 60000);
})();
