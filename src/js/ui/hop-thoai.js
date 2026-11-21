function modal(html){ $('#modal').innerHTML = `<div class="modal"><div class="in">${html}</div></div>`; try { enhanceTables($('#modal')); } catch(e){} $('#modal .modal').onclick=e=>{ if(e.target.classList.contains('modal')) { closeModal(); render(); } }; }
function closeModal(){ $('#modal').innerHTML=''; }
