#!/usr/bin/env python3
"""Ghép src/ thành artifact/index.html (một tệp chạy được trên claude.ai).

Cách dùng (từ thư mục gốc repo):   python3 build.py
  --check   chỉ so sánh, báo khác nhau, không ghi tệp
Quy ước trong src/index.html:
  dòng  //@include <tệp>      → thay bằng nội dung tệp (JS)
  dòng  /*@include <tệp>*/    → thay bằng nội dung tệp (CSS)
  /*@include data/seed.json*/ nằm giữa dòng → thay bằng JSON (bỏ xuống dòng cuối)
"""
import os, re, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src'); OUT = os.path.join(ROOT, 'artifact', 'index.html')
def rd(rel): return open(os.path.join(SRC, rel), encoding='utf-8', newline='').read()
def body(rel):  # bỏ đúng 1 dấu xuống dòng cuối tệp
    t = rd(rel); return t[:-1] if t.endswith('\n') else t
def build():
    out = []
    for line in rd('index.html').split('\n'):
        m = re.fullmatch(r'\s*(?://@include (\S+)|/\*@include (\S+)\*/)\s*', line)
        if m:
            out.append(body(m.group(1) or m.group(2))); continue
        line = re.sub(r'/\*@include (\S+)\*/', lambda k: body(k.group(1)), line)
        out.append(line)
    return '\n'.join(out)
if __name__ == '__main__':
    html = build()
    if '--check' in sys.argv:
        cur = open(OUT, encoding='utf-8', newline='').read()
        print('GIỐNG HỆT artifact/index.html' if cur == html else 'KHÁC artifact/index.html – chạy python3 build.py để cập nhật'); sys.exit(0 if cur == html else 1)
    open(OUT, 'w', encoding='utf-8', newline='').write(html)
    print(f'Đã ghép {OUT} ({len(html.encode("utf-8")):,} byte)')
