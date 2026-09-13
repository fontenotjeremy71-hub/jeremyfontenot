#!/usr/bin/env python3
"""Export browser audit records for review without publishing captured page content."""
import argparse
import csv
import json
import runpy
from collections import Counter
from pathlib import Path
from urllib.parse import unquote, urldefrag, urlparse

audit_functions = runpy.run_path(str(Path(__file__).with_name('live-browser-audit.py')))
semantic_error = audit_functions['semantic_error']
canonical_page_path = audit_functions['canonical_page_path']


def expected(label):
    value = label.lower()
    if value.startswith('unavailable source reference'):
        return 'Source-availability disclosure and integrity record; not recovered evidence'
    if 'case study' in value or value in {'view project', 'project details'}:
        return 'Project narrative'
    if 'evidence' in value:
        return 'Evidence content, evidence record, or evidence catalog'
    if 'proof' in value:
        return 'Recruiter-facing claim/proof summary'
    if 'resume' in value:
        return 'Professional resume'
    if 'contact' in value:
        return 'Contact page or method'
    if 'repository' in value or value in {'view source', 'inspect files', 'github'}:
        return 'Relevant GitHub source'
    return 'Content represented by the visible wording; rendered destination retained for review'


def write_csv(path, rows):
    with path.open('w', encoding='utf-8', newline='') as stream:
        writer = csv.DictWriter(stream, fieldnames=list(rows[0]) if rows else ['source'])
        writer.writeheader()
        writer.writerows(rows)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--baseline', required=True)
    parser.add_argument('--browser', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    baseline = json.loads(Path(args.baseline).read_text(encoding='utf-8'))
    current = json.loads(Path(args.browser).read_text(encoding='utf-8'))
    out = Path(args.output)
    out.mkdir(parents=True, exist_ok=True)
    write_csv(out / 'baseline-interactions.csv', [{k: v for k, v in item.items() if k != 'defaultStyle'} for item in baseline['links']])
    pages = {canonical_page_path(page['url']): page for page in current['pages']}
    inventory = [{'route': p['route'], 'status': p['status'], 'title': p['title'], 'heading': p['heading'], 'overflow': p['overflow'], 'visible_interactions': len(p['interactions'])} for p in current['pages']]
    write_csv(out / 'validated-page-inventory.csv', inventory)
    records = []
    for page in current['pages']:
        repeated = Counter(item['href'] for item in page['interactions'] if item['tag'] == 'a')
        for item in page['interactions']:
            target, fragment = urldefrag(item['href'])
            destination = pages.get(canonical_page_path(target))
            external = current['externalResults'].get(item['href'])
            status = destination['status'] if destination else external.get('status') if external else current['assetResults'].get(target)
            mismatch = semantic_error(item['label'], item['href'], destination['title'], destination['heading'], destination['sample']) if destination else None
            unavailable = item['label'].lower().startswith('unavailable source reference')
            records.append({
                'source': page['route'], 'visible_label': item['label'], 'element': item['tag'], 'destination': item['rawHref'],
                'expected_content': expected(item['label']), 'actual_url': destination['url'] if destination else external.get('finalUrl') if external else item['href'],
                'actual_title': destination['title'] if destination else external.get('title') if external else 'Asset/contact method or button; see behavior review',
                'actual_heading': destination['heading'] if destination else '', 'status': status,
                'fragment_exists': not fragment or bool(destination and unquote(fragment) in destination['ids']),
                'semantic_contract': mismatch or 'No automated mismatch; destination title/heading recorded for review',
                'repeated_destination_on_page': repeated[item['href']] > 1 if item['tag'] == 'a' else False,
                'circular_evidence': bool('evidence' in item['label'].lower() and destination == page and (not fragment or fragment == 'evidence')),
                'recruiter_use': 'Transparent source limitation, not proof' if unavailable else expected(item['label']),
                'hover_rule_found': item['hoverCovered'], 'keyboard_focus_visible': item['focusVisible'] and item['focusChanged'],
                'opening': item['target'] or 'same tab', 'context': item['context']
            })
    write_csv(out / 'validated-interactions.csv', records)
    summary = {'baseline_revision': baseline['baselineHead'], 'baseline_totals': baseline['totals'], 'browser_base': current['baseUrl'], 'browser_totals': current['totals'], 'finding_categories': dict(Counter(x['category'] for x in current['findings'])), 'evidence_wording_instances': sum('evidence' in r['visible_label'].lower() and not r['visible_label'].lower().startswith('unavailable') for r in records)}
    (out / 'audit-totals.json').write_text(json.dumps(summary, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
