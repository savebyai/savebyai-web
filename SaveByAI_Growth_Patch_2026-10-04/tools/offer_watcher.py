#!/usr/bin/env python3
"""SaveByAI Offer Watcher v1.

Checks known, already-approved offer claims against official merchant pages.
It never publishes changes. It writes a review report and exits non-zero when
an expected offer disappears or a source cannot be checked.
"""
from __future__ import annotations
import argparse, html, json, re, sys, urllib.request
from datetime import datetime, timezone
from pathlib import Path

UA='Mozilla/5.0 (compatible; SaveByAI-OfferWatcher/1.0; +https://savebyai.in/)'
KEYWORDS=re.compile(r'cashback|coupon|promo|offer|discount|shipping|rewards|buy\s+\d|₹|rs\.?\s*\d',re.I)

def fetch(url:str)->str:
    req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml'})
    with urllib.request.urlopen(req,timeout=25) as r:
        raw=r.read(2_500_000)
        charset=r.headers.get_content_charset() or 'utf-8'
    return raw.decode(charset,errors='replace')

def visible_text(raw:str)->str:
    raw=re.sub(r'(?is)<script[^>]*>.*?</script>',' ',raw)
    raw=re.sub(r'(?is)<style[^>]*>.*?</style>',' ',raw)
    raw=re.sub(r'(?s)<[^>]+>',' ',raw)
    raw=html.unescape(raw).replace('\xa0',' ')
    return re.sub(r'\s+',' ',raw).strip()

def norm(s:str)->str:
    s=html.unescape(s).replace('\xa0',' ')
    return re.sub(r'\s+',' ',s).strip().casefold()

def snippets(text:str,known_phrases:list[str],limit:int=8):
    # lightweight discovery: surface nearby saving-related text for human review
    chunks=re.split(r'(?<=[.!?])\s+|\s{2,}',text)
    known=' '.join(norm(x) for x in known_phrases)
    out=[]
    for c in chunks:
        c=c.strip()
        if len(c)<12 or len(c)>260 or not KEYWORDS.search(c):
            continue
        nc=norm(c)
        if any(norm(k) in nc for k in known_phrases if k):
            continue
        if nc in known: continue
        if c not in out: out.append(c)
        if len(out)>=limit: break
    return out

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument('--config',default='public/data/verified-offers.json')
    ap.add_argument('--report',default='offer-watch-report.json')
    args=ap.parse_args()
    cfg=json.loads(Path(args.config).read_text(encoding='utf-8'))
    cache={}; report={'checked_at':datetime.now(timezone.utc).isoformat(),'status':'ok','merchants':{}}
    alerts=0
    for slug,m in cfg['merchants'].items():
        mr={'name':m['name'],'status':'ok','offers':[],'new_offer_candidates':[]}
        known=[]
        urls=[]
        for o in m.get('offers',[]):
            known += o.get('watch_phrases',[])
            urls.append(o['source_url'])
            url=o['source_url']
            if url not in cache:
                try: cache[url]=('ok',visible_text(fetch(url)))
                except Exception as e: cache[url]=('error',str(e))
            state,payload=cache[url]
            row={'id':o['id'],'title':o['title'],'source_url':url,'status':'ok','matched_phrase':None}
            if state!='ok':
                row['status']='source_error'; row['error']=payload; mr['status']='attention'; alerts+=1
            else:
                nt=norm(payload)
                for phrase in o.get('watch_phrases',[]):
                    if norm(phrase) in nt:
                        row['matched_phrase']=phrase; break
                if not row['matched_phrase']:
                    row['status']='not_found'; mr['status']='attention'; alerts+=1
            mr['offers'].append(row)
        # surface possible new savings from the primary page for manual review
        primary=m.get('source_url')
        if primary:
            if primary not in cache:
                try: cache[primary]=('ok',visible_text(fetch(primary)))
                except Exception as e: cache[primary]=('error',str(e))
            if cache[primary][0]=='ok': mr['new_offer_candidates']=snippets(cache[primary][1],known)
        report['merchants'][slug]=mr
    if alerts: report['status']='attention'
    Path(args.report).write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf-8')
    print(json.dumps(report,indent=2,ensure_ascii=False))
    return 2 if alerts else 0

if __name__=='__main__':
    sys.exit(main())
