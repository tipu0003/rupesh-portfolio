#!/usr/bin/env python3
"""Refresh public ORCID works without credentials; preserve the last good catalog."""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ORCID = '0000-0001-8476-8364'
OUTPUTS = [ROOT / 'public/data/publications.json', ROOT / 'src/data/publications-cache.json']


def request_json(url, attempts=3):
    for attempt in range(attempts):
        try:
            request = urllib.request.Request(url, headers={
                'Accept': 'application/json',
                'User-Agent': 'RupeshAcademicPortfolio/2.0 (https://tipu0003.github.io/rupesh-portfolio/)',
            })
            with urllib.request.urlopen(request, timeout=30) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError, ValueError):
            if attempt == attempts - 1:
                raise
            time.sleep(2 ** attempt)


def value(data):
    return (data or {}).get('value')


def normalize(work):
    title = value((work.get('title') or {}).get('title'))
    if not title or not title.strip():
        return None
    identifiers = (work.get('external-ids') or {}).get('external-id', [])
    doi = next((i.get('external-id-value', '') for i in identifiers
                if i.get('external-id-type') == 'doi' and i.get('external-id-relationship') == 'self'), '')
    doi = doi.replace('https://doi.org/', '').replace('http://dx.doi.org/', '').strip().lower()
    date = work.get('publication-date') or {}
    year = value(date.get('year'))
    month, day = value(date.get('month')) or '01', value(date.get('day')) or '01'
    authors = [value(c.get('credit-name')) for c in (work.get('contributors') or {}).get('contributor', [])]
    citation = work.get('citation') or {}
    return {
        'id': doi or f"orcid:{work['put-code']}",
        'title': title.strip(), 'authors': [a for a in authors if a],
        'year': int(year) if year and str(year).isdigit() else None,
        'publication_date': f'{year}-{str(month).zfill(2)}-{str(day).zfill(2)}' if year else '',
        'date_precision': 'day' if value(date.get('day')) else 'month' if value(date.get('month')) else 'year',
        'venue': value(work.get('journal-title')) or '', 'type': work.get('type') or 'Other',
        'doi': doi,
        'url': f'https://doi.org/{doi}' if doi else f"https://orcid.org/{ORCID}/work/{work['put-code']}",
        'source': 'ORCID', 'put_code': work['put-code'],
        'source_url': f"https://pub.orcid.org/v3.0/{ORCID}/work/{work['put-code']}",
        'source_bibtex': citation.get('citation-value', '') if citation.get('citation-type') == 'bibtex' else '',
    }


def refresh():
    summary = request_json(f'https://pub.orcid.org/v3.0/{ORCID}/works')
    if not isinstance(summary.get('group'), list) or not summary['group']:
        raise ValueError('ORCID returned no groups; keeping the saved catalog.')
    works = []
    for group in summary['group']:
        summaries = group.get('work-summary') or []
        if summaries:
            works.append(max(summaries, key=lambda item: int(item.get('display-index') or 0)))
    details = {}
    for start in range(0, len(works), 50):
        codes = ','.join(str(w['put-code']) for w in works[start:start + 50])
        try:
            bulk = request_json(f'https://pub.orcid.org/v3.0/{ORCID}/works/{codes}')
            for item in bulk.get('bulk', []):
                work = item.get('work')
                if work:
                    details[work['put-code']] = work
        except (urllib.error.URLError, TimeoutError, ValueError) as error:
            print(f'::warning::Detailed ORCID records unavailable: {error}; retaining summary metadata.')
    previous = {}
    if OUTPUTS[0].exists():
        previous = {p.get('id'): p for p in json.loads(OUTPUTS[0].read_text()).get('publications', [])}
    records, seen = [], set()
    for summary_work in works:
        record = normalize(details.get(summary_work['put-code'], summary_work))
        if not record or record['id'] in seen:
            continue
        # An incomplete detail response must not erase a previously saved author list.
        old = previous.get(record['id'], {})
        for field in ('authors', 'venue', 'source_bibtex'):
            if not record.get(field) and old.get(field):
                record[field] = old[field]
        seen.add(record['id'])
        records.append(record)
    if not records:
        raise ValueError('No valid works parsed; keeping the saved catalog.')
    # Reject unexpectedly large drops instead of publishing a partial response.
    if previous and len(records) < len(previous) * 0.75:
        raise ValueError('ORCID returned an unexpectedly incomplete catalog; review before replacing it.')
    records.sort(key=lambda p: (p['publication_date'], p['title']), reverse=True)
    payload = {'schema_version': 1, 'orcid': ORCID, 'updated_at': datetime.now(timezone.utc).isoformat(),
               'source': 'ORCID public API', 'publications': records}
    encoded = json.dumps(payload, ensure_ascii=False, indent=2) + '\n'
    for destination in OUTPUTS:
        destination.parent.mkdir(parents=True, exist_ok=True)
        temporary = destination.with_suffix('.tmp')
        temporary.write_text(encoded, encoding='utf-8')
        os.replace(temporary, destination)
    print(f'Refreshed {len(records)} ORCID records. Google Scholar metrics were not changed.')
    return payload


if __name__ == '__main__':
    try:
        refresh()
    except Exception as error:
        print(f'::warning::Publication refresh failed; saved records remain unchanged. {error}', file=sys.stderr)
        sys.exit(1)
