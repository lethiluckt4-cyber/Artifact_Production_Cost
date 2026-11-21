// ---------- Ghi tệp Excel (tự ghi OOXML): phông Aptos Narrow cỡ 11, ngày dd/mm/yyyy, tháng mm/yyyy ----------
// Dùng như SheetJS: XW.book_new / aoa_to_sheet / json_to_sheet / sheet_add_aoa / book_append_sheet / write. Đọc tệp vẫn dùng SheetJS.
const XW = (()=>{
  const FONT='Aptos Narrow', SZ=11;
  const book_new = () => ({SheetNames:[], Sheets:{}, _xw:true});
  const aoa_to_sheet = aoa => ({_aoa:(aoa||[]).map(r=>(r||[]).slice()), _bold:new Set([0])});
  const json_to_sheet = json => { const keys=[]; (json||[]).forEach(o=>Object.keys(o).forEach(k=>{ if(!keys.includes(k)) keys.push(k); })); const ws=aoa_to_sheet([keys, ...(json||[]).map(o=>keys.map(k=>o[k]??''))]); ws['!cols']=keys.map(k=>({wch:Math.max(10,Math.min(40,String(k).length+2))})); return ws; };
  const sheet_add_aoa = (ws, aoa, opt) => { const o=(opt&&opt.origin)||{r:ws._aoa.length,c:0}; (aoa||[]).forEach((row,i)=>{ const r=o.r+i; while (ws._aoa.length<=r) ws._aoa.push([]); row.forEach((v,j)=>{ ws._aoa[r][o.c+j]=v; }); }); return ws; };
  const book_append_sheet = (wb, ws, name) => { let n=String(name||'Sheet').replace(/[\[\]:*?\/\\]/g,' ').slice(0,31)||'Sheet'; let k=n, i=2; while (wb.SheetNames.includes(k)) k=(n.slice(0,28)+'_'+(i++)); wb.SheetNames.push(k); wb.Sheets[k]=ws; return wb; };
  const xesc = s => String(s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'');
  const colName = c => { let s=''; c++; while (c>0) { const m=(c-1)%26; s=String.fromCharCode(65+m)+s; c=Math.floor((c-1)/26); } return s; };
  const serial = (y,m,d) => Math.round((Date.UTC(y,m-1,d) - Date.UTC(1899,11,30))/86400000);
  // kiểu ô: 0 thường, 1 ngày dd/mm/yyyy, 2 tháng mm/yyyy, 3 tiêu đề đậm, 4 ngày đậm (không dùng)
  // kiểu ô: 0 thường, 1 ngày dd/mm/yyyy, 2 tháng mm/yyyy, 3 tiêu đề đậm; +4 = có kẻ khung (vùng bảng)
  const cell = (v, ref, bold, brd) => {
    const S = k => { const x=k+(brd?4:0); return x?` s="${x}"`:''; };
    if (v==null || v==='') return brd ? `<c r="${ref}"${S(bold?3:0)}/>` : '';
    if (v && typeof v==='object' && v.pct) return isFinite(v.v) ? `<c r="${ref}" s="${12+(brd?1:0)}"><v>${v.v}</v></c>` : '';
    if (v instanceof Date && !isNaN(v)) return `<c r="${ref}"${S(1)}><v>${serial(v.getFullYear(), v.getMonth()+1, v.getDate())}</v></c>`;
    if (typeof v==='number') return isFinite(v) ? `<c r="${ref}" s="${8+(brd?1:0)+(bold?2:0)}"><v>${v}</v></c>` : (brd?`<c r="${ref}"${S(0)}/>`:'');
    if (typeof v==='boolean') return `<c r="${ref}" t="b"${S(0)}><v>${v?1:0}</v></c>`;
    const s=String(v); let m;
    if ((m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/))) return `<c r="${ref}"${S(1)}><v>${serial(+m[1],+m[2],+m[3])}</v></c>`;
    if ((m=s.match(/^(\d{4})-(\d{2})$/)) && +m[2]>=1 && +m[2]<=12) return `<c r="${ref}"${S(2)}><v>${serial(+m[1],+m[2],1)}</v></c>`;
    return `<c r="${ref}" t="inlineStr"${S(bold?3:0)}><is><t xml:space="preserve">${xesc(s)}</t></is></c>`;
  };
  // độ dài hiển thị của một ô (để tự đặt độ rộng cột)
  const dlen = v => { if (v==null || v==='') return 0; if (v && typeof v==='object' && v.pct) return 8; if (v instanceof Date) return 10; if (typeof v==='boolean') return 5;
    if (typeof v==='number') { if (!isFinite(v)) return 0; const t=String(+v.toPrecision(10)); const ip=t.split('.')[0].replace('-',''); return Math.min(16, t.length + Math.floor((ip.length-1)/3)); }
    const s=String(v); if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return 10; if (/^\d{4}-\d{2}$/.test(s)) return 7; return Math.max(...s.split('\n').map(x=>x.length)); };
  const sheetXml = ws => {
    const A=ws._aoa; const nz=r=>(r||[]).filter(v=>v!==''&&v!=null).length;
    // vùng bảng = từ dòng đầu đến dòng cuối có ≥ 2 ô dữ liệu (bỏ các dòng tiêu đề / ghi chú một ô)
    let r0=-1, r1=-1; A.forEach((r,i)=>{ if (nz(r)>=2) { if (r0<0) r0=i; r1=i; } });
    const maxC = r0<0 ? 0 : Math.max(...A.slice(r0, r1+1).map(r=>(r||[]).length));
    const W=[]; (r0<0 ? A : A.slice(r0, r1+1)).forEach(r=>(r||[]).forEach((v,j)=>{ W[j]=Math.max(W[j]||0, dlen(v)); }));
    const given=ws['!cols']||[]; const nCol=Math.max(W.length, given.length);
    const cols = Array.from({length:nCol},(_,i)=>{ const w = W[i] ? Math.min(60, Math.max(7, W[i]+2)) : (given[i]&&given[i].wch ? given[i].wch : 0); return w?`<col min="${i+1}" max="${i+1}" width="${w+1}" customWidth="1"/>`:''; }).join('');
    const rows = A.map((r,i)=>{ const b=ws._bold.has(i); const inT = r0>=0 && i>=r0 && i<=r1; const n = inT ? Math.max(maxC, (r||[]).length) : (r||[]).length;
      let cs=''; for (let j=0;j<n;j++) cs += cell((r||[])[j], colName(j)+(i+1), b, inT && j<maxC); return cs?`<row r="${i+1}">${cs}</row>`:''; }).join('');
    const fz=ws['!freeze']; const sv = fz ? `<sheetViews><sheetView workbookViewId="0"><pane${fz.x?` xSplit="${fz.x}"`:''}${fz.y?` ySplit="${fz.y}"`:''} topLeftCell="${colName(fz.x||0)}${(fz.y||0)+1}" activePane="${fz.x&&fz.y?'bottomRight':fz.x?'topRight':'bottomLeft'}" state="frozen"/></sheetView></sheetViews>` : '';
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${sv}<sheetFormatPr defaultRowHeight="15"/>${cols?`<cols>${cols}</cols>`:''}<sheetData>${rows}</sheetData></worksheet>`;
  };
  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="4"><numFmt numFmtId="164" formatCode="dd/mm/yyyy"/><numFmt numFmtId="165" formatCode="mm/yyyy"/><numFmt numFmtId="166" formatCode="General;[Red]\(General\)"/><numFmt numFmtId="167" formatCode="0.0%;[Red]\(0.0%\)"/></numFmts><fonts count="2"><font><sz val="${SZ}"/><name val="${FONT}"/><family val="2"/></font><font><b/><sz val="${SZ}"/><name val="${FONT}"/><family val="2"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDDEBF7"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color rgb="FFA6A6A6"/></left><right style="thin"><color rgb="FFA6A6A6"/></right><top style="thin"><color rgb="FFA6A6A6"/></top><bottom style="thin"><color rgb="FFA6A6A6"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="14"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="164" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/><xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/><xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment vertical="center"/></xf><xf numFmtId="166" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="166" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/><xf numFmtId="166" fontId="1" fillId="0" borderId="0" xfId="0" applyNumberFormat="1" applyFont="1"/><xf numFmtId="166" fontId="1" fillId="2" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1"><alignment vertical="center"/></xf><xf numFmtId="167" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/><xf numFmtId="167" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`;
  // ZIP (lưu không nén) + CRC32
  const CRC = (()=>{ const t=new Uint32Array(256); for (let n=0;n<256;n++){ let c=n; for (let k=0;k<8;k++) c = c&1 ? 0xEDB88320^(c>>>1) : c>>>1; t[n]=c>>>0; } return t; })();
  const crc32 = u => { let c=0xFFFFFFFF; for (let i=0;i<u.length;i++) c = CRC[(c^u[i])&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; };
  const zip = files => { const enc=new TextEncoder(); const parts=[], central=[]; let off=0;
    files.forEach(([name, text])=>{ const nm=enc.encode(name), data=enc.encode(text), crc=crc32(data);
      const h=new DataView(new ArrayBuffer(30)); h.setUint32(0,0x04034b50,true); h.setUint16(4,20,true); h.setUint16(6,0x0800,true); h.setUint16(8,0,true); h.setUint16(10,0,true); h.setUint16(12,0x21,true); h.setUint32(14,crc,true); h.setUint32(18,data.length,true); h.setUint32(22,data.length,true); h.setUint16(26,nm.length,true); h.setUint16(28,0,true);
      parts.push(new Uint8Array(h.buffer), nm, data);
      const c=new DataView(new ArrayBuffer(46)); c.setUint32(0,0x02014b50,true); c.setUint16(4,20,true); c.setUint16(6,20,true); c.setUint16(8,0x0800,true); c.setUint16(10,0,true); c.setUint16(12,0,true); c.setUint16(14,0x21,true); c.setUint32(16,crc,true); c.setUint32(20,data.length,true); c.setUint32(24,data.length,true); c.setUint16(28,nm.length,true); c.setUint32(42,off,true);
      central.push(new Uint8Array(c.buffer), nm); off += 30+nm.length+data.length; });
    const csz=central.reduce((s,a)=>s+a.length,0); const e=new DataView(new ArrayBuffer(22)); e.setUint32(0,0x06054b50,true); e.setUint16(8,files.length,true); e.setUint16(10,files.length,true); e.setUint32(12,csz,true); e.setUint32(16,off,true);
    const all=[...parts, ...central, new Uint8Array(e.buffer)]; const out=new Uint8Array(all.reduce((s,a)=>s+a.length,0)); let p=0; all.forEach(a=>{ out.set(a,p); p+=a.length; }); return out; };
  const write = wb => { const n=wb.SheetNames.length;
    const files=[['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${wb.SheetNames.map((_,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`],
      ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
      ['xl/workbook.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${wb.SheetNames.map((s,i)=>`<sheet name="${xesc(s)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`],
      ['xl/_rels/workbook.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${wb.SheetNames.map((_,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${n+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
      ['xl/styles.xml', STYLES], ...wb.SheetNames.map((s,i)=>[`xl/worksheets/sheet${i+1}.xml`, sheetXml(wb.Sheets[s])])];
    return zip(files); };
  return {book_new, aoa_to_sheet, json_to_sheet, sheet_add_aoa, book_append_sheet, write};
})();
