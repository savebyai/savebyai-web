#!/usr/bin/env python3
"""Normalize an Admitad programs XML export for SaveByAI.

Usage:
  python tools/admitad_program_scan.py /path/to/programms.xml

Outputs safe summaries only. It intentionally does not export product-feed URLs or tokens.
"""
from __future__ import annotations
import csv, json, re, sys
from pathlib import Path
import xml.etree.ElementTree as ET

src=Path(sys.argv[1] if len(sys.argv)>1 else 'programms.xml')
if not src.exists():
    raise SystemExit(f'File not found: {src}')
root=ET.parse(src).getroot()
rows=[]
for adv in root.findall('advcampaign'):
    def text(tag):
        node=adv.find(tag)
        return (node.text or '').strip() if node is not None else ''
    desc=text('description')
    low=desc.lower()
    actions=[]
    action_ranges=adv.find('action_ranges')
    if action_ranges is not None:
        for action in action_ranges.findall('action'):
            d={x.tag:(x.text or '').strip() for x in action}
            actions.append(d)
    rate_parts=[]
    for a in actions:
        label=a.get('name','')
        mn=a.get('min_percentage_rate',''); mx=a.get('max_percentage_rate','')
        fmn=a.get('min_fixed_rate',''); fmx=a.get('max_fixed_rate','')
        if mn or mx: rate=f"{mn or '?'}–{mx or '?'}%"
        elif fmn or fmx: rate=f"{fmn or '?'}–{fmx or '?'} {a.get('currency_code','')}".strip()
        else: rate=''
        rate_parts.append(f"{label}: {rate}" if label else rate)
    gotolink=text('gotolink')
    feed_info=adv.find('feeds_info')
    has_feed=bool(text('original_products') or text('original_products_csv') or (feed_info is not None and feed_info.find('feed') is not None))
    cashback_explicit=bool(re.search(r'cash\s*back|cashback',low))
    loyalty_explicit='loyalty' in low
    rows.append({
        'program_id':text('id'),
        'name':text('name'),
        'site_url':text('site_url'),
        'rates':' | '.join(rate_parts),
        'joined_link_available':bool(gotolink),
        'cashback_keyword':cashback_explicit,
        'loyalty_keyword':loyalty_explicit,
        'cashback_candidate':cashback_explicit or loyalty_explicit,
        'has_product_feed':has_feed,
        's2s_tracking':('s2s' in low or 'server-to-server' in low),
        'online_tracking':('tracking: online' in low or 'tracking type: online' in low),
    })

rows.sort(key=lambda r:(not r['cashback_candidate'], not r['joined_link_available'], r['name'].lower()))
out_json=src.with_name(src.stem+'_savebyai_scan.json')
out_csv=src.with_name(src.stem+'_savebyai_scan.csv')
out_json.write_text(json.dumps(rows,indent=2,ensure_ascii=False),encoding='utf-8')
with out_csv.open('w',newline='',encoding='utf-8') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0].keys()) if rows else [])
    if rows: w.writeheader(); w.writerows(rows)
print(f'Programs scanned: {len(rows)}')
print(f'Cashback/loyalty keyword candidates: {sum(r["cashback_candidate"] for r in rows)}')
print(f'Programs with product feeds: {sum(r["has_product_feed"] for r in rows)}')
print(f'Programs with joined affiliate link: {sum(r["joined_link_available"] for r in rows)}')
print(f'Wrote: {out_json}')
print(f'Wrote: {out_csv}')
