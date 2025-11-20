#!/usr/bin/env python3
import json, os, sys, time
from datetime import datetime, timezone
from pathlib import Path

OUT = Path("public/data/scholar.json")
OUT.parent.mkdir(parents=True, exist_ok=True)

SCHOLAR_ID = os.environ.get("SCHOLAR_USER_ID", "").strip()
if not SCHOLAR_ID:
    print("SCHOLAR_USER_ID env var missing.", file=sys.stderr)
    sys.exit(1)

# Minimal, stable scrape: metrics + lightweight pub list
from scholarly import scholarly  # pip: scholarly

def _safe_int(x):
    try:
        return int(str(x))
    except Exception:
        return None

def fetch_author_profile(scholar_id: str) -> dict:
    # Some scholarly versions don't support "counts" → keep sections conservative
    a = scholarly.search_author_id(scholar_id)
    a = scholarly.fill(a, sections=["basics", "indices", "publications"])

    pubs = []
    for p in a.get("publications", []):
        bib = p.get("bib", {}) or {}
        pubs.append({
            "title": bib.get("title"),
            "year": _safe_int(bib.get("pub_year")),
            "venue": bib.get("venue"),
            "authors": (bib.get("author") or "").split(" and ") if bib.get("author") else [],
            "citations": _safe_int(p.get("num_citations")),
            "scholar_url": p.get("eprint_url") or p.get("pub_url"),
            "cluster_id": p.get("cites_id"),
        })

    pubs.sort(key=lambda x: (x["year"] or 0, x["title"] or ""), reverse=True)

    data = {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "scholar_id": scholar_id,
        "profile": {
            "name": a.get("name"),
            "affiliation": a.get("affiliation"),
            "interests": a.get("interests", []),
          },
        "metrics": {
            "citations": _safe_int(a.get("citedby")),
            "citations_5y": _safe_int(a.get("citedby5y")),
            "h_index": _safe_int(a.get("hindex")),
            "h_index_5y": _safe_int(a.get("hindex5y")),
            "i10_index": _safe_int(a.get("i10index")),
            "i10_index_5y": _safe_int(a.get("i10index5y")),
        },
        "publications": pubs,
    }
    return data

for attempt in range(3):
    try:
        payload = fetch_author_profile(SCHOLAR_ID)
        OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
        print(f"Wrote {OUT} with {len(payload.get('publications', []))} publications.")
        sys.exit(0)
    except Exception as e:
        print(f"[attempt {attempt+1}/3] Error: {e}", file=sys.stderr)
        time.sleep(8 + attempt * 4)

print("Failed to fetch Scholar profile after retries.", file=sys.stderr)
sys.exit(2)
