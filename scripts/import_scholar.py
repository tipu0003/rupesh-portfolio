#!/usr/bin/env python3
"""Import an owner-exported Google Scholar CSV. No Google Scholar scraping."""
import csv
import json
import sys
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def import_csv(path):
    with Path(path).open(encoding='utf-8-sig', newline='') as source:
        reader = csv.DictReader(source)
        if not {'Title', 'Authors', 'Year'}.issubset(reader.fieldnames or []):
            raise ValueError('Expected a Google Scholar CSV with Title, Authors and Year columns.')
        records = []
        for row in reader:
            if not row['Title'].strip():
                continue
            venue = row.get('Publication', '')
            lower = venue.lower()
            kind = 'Conference paper' if any(s in lower for s in ('conference', 'proceedings')) else 'Book chapter' if 'chapter' in lower else 'Journal article'
            records.append({'title': row['Title'].strip(), 'authors': [a.strip() for a in row['Authors'].split(';') if a.strip()],
                            'year': int(row['Year']) if row['Year'].isdigit() else None,
                            'venue': venue, 'type': kind, 'volume': row.get('Volume', ''),
                            'issue': row.get('Number', ''), 'pages': row.get('Pages', ''),
                            'publisher': row.get('Publisher', ''), 'source': 'Scholar export',
                            'url': 'https://scholar.google.com/scholar?' + urllib.parse.urlencode({'q': '"' + row['Title'].strip() + '"'})})
    if not records:
        raise ValueError('The export contains no publications; existing records were kept.')
    destination = ROOT / 'src/data/scholar-export.json'
    destination.write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Imported {len(records)} Google Scholar CSV rows. Metrics must be updated from a dated profile snapshot.')
    return records


if __name__ == '__main__':
    import_csv(sys.argv[1])
