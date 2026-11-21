// ---------- Bảng kiểu Excel: lọc cột, sắp xếp, thanh cuộn trên, cột đầu cố định ----------
const tblState = {}; // key -> {filters:{col:Set|null, search}, sort:{col,dir}, on:boolean}
