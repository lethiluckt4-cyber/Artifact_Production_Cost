import json, openpyxl, collections, datetime, math
def build_schedule(S, items, DDH, cn_by_month, ns=40, tl=0.75, look=30, lot_bc=200, hol=None, ot=None):
    ot=ot or {}
    hol=hol or set()
    hs=lambda tp: float(items[tp][6] or 1)
    days=[]; d=datetime.date(2025,8,1)
    while d<=datetime.date(2025,12,31):
        if d.weekday()!=6 and d not in hol and cn_by_month.get(d.month,0)>0: days.append(d)
        d+=datetime.timedelta(days=1)
    sales=sorted([(s[1].date(), s[4], s[7], str(s[2])) for s in S])
    # nhu cầu: mỗi dòng bán là một nhu cầu; DDH riêng theo đơn
    dem=[{'d':x[0],'tp':x[1],'q':x[2],'hd':x[3],'left':x[2]} for x in sales]
    sold_tp=collections.Counter(); [sold_tp.update({x[1]:x[2]}) for x in sales]
    sx=[tp for tp in sold_tp if tp not in DDH]
    w={tp:sold_tp[tp]*hs(tp) for tp in sx}; W=sum(w.values()); w={k:v/W for k,v in w.items()}
    stock=collections.Counter()      # TP may tồn kho chưa gán cho đơn
    made_mt=collections.Counter()    # bộ chuẩn đã may tồn kho theo mã
    runs=[]   # (day, tp, qty, kind, ref)
    cur={'tp':None,'left':0}
    for day in days:
        cap=cn_by_month[day.month]*ns*tl+ot.get(day,0)
        # dùng tồn kho may sẵn cho nhu cầu SX trước
        for x in dem:
            if x['left']>0 and x['tp'] not in DDH and stock[x['tp']]>0:
                u=min(stock[x['tp']],x['left']); stock[x['tp']]-=u; x['left']-=u
        pend=[x for x in dem if x['left']>0 and (x['d']-day).days<=look]
        pend.sort(key=lambda x:(x['d'], 0 if x['tp'] in DDH else 1))
        for x in pend:
            if cap<=1e-9: break
            q=min(x['left'], math.floor(cap/hs(x['tp'])+1e-9))
            if q<=0: break
            x['left']-=q; cap-=q*hs(x['tp'])
            if x['left']==0: x['done']=day
            runs.append((day,x['tp'],q,'Theo đơn' if x['tp'] in DDH else 'Bù tồn bán',x['hd']))
        while cap>1e-6:
            if not cur['tp'] or cur['left']<=1e-9:
                tot=sum(made_mt.values())+lot_bc
                cur['tp']=max(sx, key=lambda t: w[t]*tot-made_mt[t]); cur['left']=lot_bc
            tp=cur['tp']; q=math.floor(min(cap,cur['left'])/hs(tp)+1e-9)
            if q<=0:
                if cur['left']<hs(tp): cur['left']=0; continue
                break
            made_mt[tp]+=q*hs(tp); stock[tp]+=q; cap-=q*hs(tp); cur['left']-=q*hs(tp)
            runs.append((day,tp,q,'May tồn kho',''))
    # gộp ngày liên tiếp cùng mã / loại / tham chiếu / tháng thành 1 lệnh
    lenh=[]
    for day,tp,q,k,ref in runs:
        L=lenh[-1] if lenh else None
        # tìm lệnh đang mở cùng khóa, ngày cuối là ngày làm việc liền trước
        cand=None
        for x in reversed(lenh[-40:]):
            if x['tp']==tp and x['kind']==k and x['ref']==ref and x['end'].month==day.month and days.index(x['end'])==days.index(day)-1:
                cand=x; break
        if cand: cand['q']+=q; cand['end']=day
        else: lenh.append({'start':day,'end':day,'tp':tp,'q':q,'kind':k,'ref':ref})
    # gộp lệnh may tồn kho quá nhỏ? giữ nguyên
    lenh.sort(key=lambda x:(x['start'],x['tp']))
    cnt=collections.Counter()
    for x in lenh:
        key=x['start'].strftime('%m.%d'); cnt[key]+=1; x['ma']=f"LSX2025-{key}-{cnt[key]:02d}"
    late=[x for x in dem if x['left']>0 or x.get('done',x['d'])>x['d']]
    return lenh, late, days

def auto_overtime(S, items, DDH, cn_by_month, hol, **kw):
    """Tăng ca những ngày trước hạn giao cho đến khi không còn dòng bán giao trễ."""
    ot={}
    for _ in range(200):
        lenh,late,days=build_schedule(S,items,DDH,cn_by_month,hol=hol,ot=ot,**kw)
        if not late: return lenh,late,days,ot
        x=min(late,key=lambda z:z['d'])
        hs=float(items[x['tp']][6] or 1)
        # thiếu tại ngày giao = phần còn phải may sau ngày giao của dòng này
        before=[d for d in days if d<=x['d'] and d.month==x['d'].month]
        add=10  # tăng dần 10 bộ chuẩn / ngày cho các ngày trước hạn
        for d in before: ot[d]=ot.get(d,0)+add
    raise RuntimeError('không cân được tăng ca')
