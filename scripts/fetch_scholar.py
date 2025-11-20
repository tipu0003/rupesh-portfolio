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

SERPAPI_KEY = os.environ.get("SERPAPI_KEY", "").strip()

def _base_payload():
    return {
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "scholar_id": SCHOLAR_ID,
        "profile": {},
        "metrics": {},
        "publications": [],
    }

def save_and_exit(payload):
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2))
    print(f"Wrote {OUT} with {len(payload.get('publications', []))} publications.")
    sys.exit(0)

# ---------------------------
# 1) SerpAPI (preferred)
# ---------------------------
def try_serpapi():
    if not SERPAPI_KEY:
        return None
    try:
        from serpapi import GoogleSearch
        # author profile + articles
        search = GoogleSearch({
            "engine": "google_scholar_author",
            "author_id": SCHOLAR_ID,
            "api_key": SERPAPI_KEY,
            "view_op": "list_works",
            "num": "100"  # first 100; enough for homepage + carousel
        })
        data = search.get_dict()
        profile = data.get("author", {}) or {}
        articles = data.get("articles", []) or []

        pubs = []
        for a in articles:
            bib = a.get("publication_info", {}) or {}
            year = a.get("year")
            try:
                year = int(year) if year is not None else None
            except Exception:
                year = None
            pubs.append({
                "title": a.get("title"),
                "year": year,
                "venue": (bib.get("summary") or "").split(" - ")[0] or None,
                "authors": a.get("authors", []),
                "citations": (a.get("cited_by", {}) or {}).get("value"),
                "scholar_url": a.get("link"),
                "cluster_id": a.get("cited_by", {}).get("link"),  # not a real cluster id; kept for debug
            })

        pubs.sort(key=lambda x: (x["year"] or 0, x["title"] or ""), reverse=True)

        payload = _base_payload()
        payload["profile"] = {
            "name": profile.get("name"),
            "affiliation": profile.get("affiliations"),
            "interests": profile.get("interests", []),
        }
        metrics = profile.get("cited_by", {}) or {}
        payload["metrics"] = {
            "citations": (metrics.get("table", [{}])[0].get("citations", {}) or {}).get("all"),
            "citations_5y": (metrics.get("table", [{}])[0].get("citations", {}) or {}).get("since_2019")
                             or (metrics.get("table", [{}])[0].get("citations", {}) or {}).get("since_2020"),
            "h_index": (metrics.get("table", [{}])[0].get("h_index", {}) or {}).get("all"),
            "h_index_5y": (metrics.get("table", [{}])[0].get("h_index", {}) or {}).get("since_2019")
                          or (metrics.get("table", [{}])[0].get("h_index", {}) or {}).get("since_2020"),
            "i10_index": (metrics.get("table", [{}])[0].get("i10_index", {}) or {}).get("all"),
            "i10_index_5y": (metrics.get("table", [{}])[0].get("i10_index", {}) or {}).get("since_2019")
                            or (metrics.get("table", [{}])[0].get("i10_index", {}) or {}).get("since_2020"),
        }
        payload["publications"] = pubs
        return payload
    except Exception as e:
        print(f"[serpapi] {e}", file=sys.stderr)
        return None

# ---------------------------
# 2) scholarly (fallback)
# ---------------------------
def try_scholarly():
    try:
        from scholarly import scholarly, ProxyGenerator
        # Using some free proxies helps inside CI
        try:
            pg = ProxyGenerator()
            if pg.FreeProxies():
                scholarly.use_proxy(pg)
        except Exception:
            pass

        a = scholarly.search_author_id(SCHOLAR_ID)
        a = scholarly.fill(a, sections=["basics", "indices", "counts", "publications"])

        pubs = []
        for p in a.get("publications", []):
            bib = p.get("bib", {}) or {}
            yr = bib.get("pub_year")
            year = int(yr) if (isinstance(yr, (int, str)) and str(yr).isdigit()) else None
            pubs.append({
                "title": bib.get("title"),
                "year": year,
                "venue": bib.get("venue"),
                "authors": (bib.get("author") or "").split(" and ") if bib.get("author") else [],
                "citations": p.get("num_citations"),
                "scholar_url": p.get("eprint_url") or p.get("pub_url"),
                "cluster_id": p.get("cites_id"),
            })
        pubs.sort(key=lambda x: (x["year"] or 0, x["title"] or ""), reverse=True)

        payload = _base_payload()
        payload["profile"] = {
            "name": a.get("name"),
            "affiliation": a.get("affiliation"),
            "interests": a.get("interests", []),
        }
        payload["metrics"] = {
            "citations": a.get("citedby"),
            "citations_5y": a.get("citedby5y"),
            "h_index": a.get("hindex"),
            "h_index_5y": a.get("hindex5y"),
            "i10_index": a.get("i10index"),
            "i10_index_5y": a.get("i10index5y"),
        }
        payload["publications"] = pubs
        return payload
    except Exception as e:
        print(f"[scholarly] {e}", file=sys.stderr)
        return None

# Try SerpAPI → scholarly with a couple of retries
for attempt in range(3):
    payload = try_serpapi() or try_scholarly()
    if payload:
        save_and_exit(payload)
    print(f"[attempt {attempt+1}/3] retrying in {6 + attempt*4}s...", file=sys.stderr)
    time.sleep(6 + attempt * 4)

print("Failed to fetch Scholar profile after retries.", file=sys.stderr)
sys.exit(2)
