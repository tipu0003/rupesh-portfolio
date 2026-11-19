#!/usr/bin/env python3
"""Build an offline publication catalogue. Add --refresh to query public APIs."""
import argparse
import csv
from datetime import date, timedelta
from html import unescape
import json
import os
from pathlib import Path
import re
import shutil
import sys
import tempfile
import time
import unicodedata
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode, urlparse
from urllib.request import Request, urlopen

DATA = Path(__file__).resolve().parents[1] / "data"
ORCID = "0000-0001-8476-8364"
CROSSREF_FIELDS = "DOI,title,type,author,container-title,published,published-online,published-print,volume,issue,page,article-number,publisher,ISBN,ISSN"
CITATION_FIELDS = ("volume", "issue", "pages", "articleNumber", "publisher", "isbn", "issn")
TYPES = {
    "journal-article": "Journal article",
    "proceedings-article": "Conference paper",
    "conference-paper": "Conference paper",
    "book-chapter": "Book chapter",
    "book": "Book",
    "monograph": "Book",
    "edited-book": "Book",
}


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path, data):
    encoded = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == encoded:
        return
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as tmp:
        tmp.write(encoded)
    os.chmod(tmp.name, 0o644)
    os.replace(tmp.name, path)


def clean(text):
    return " ".join(unescape(re.sub(r"<[^>]+>", "", str(text or ""))).split())


def title_key(title):
    return "".join(ch for ch in unicodedata.normalize("NFKD", title.casefold()) if ch.isalnum())


def doi_key(value):
    value = re.sub(r"^(?:https?://(?:dx\.)?doi\.org/|doi:\s*)", "", str(value or ""), flags=re.I)
    return value.strip().lower() if re.fullmatch(r"10\.\d{4,9}/[^\s]+", value.strip(), flags=re.I) else ""


def get_json(url):
    request = Request(url, headers={
        "Accept": "application/json",
        "User-Agent": "AcademicPortfolio/2.0",
    })
    for attempt in range(3):
        try:
            with urlopen(request, timeout=30) as response:
                return json.load(response)
        except (HTTPError, URLError, TimeoutError) as error:
            if isinstance(error, HTTPError) and error.code not in {408, 429, 500, 502, 503, 504}:
                raise
            if attempt == 2:
                raise
            delay = int(error.headers.get("Retry-After", "0")) if isinstance(error, HTTPError) and str(error.headers.get("Retry-After", "")).isdigit() else 0
            time.sleep(min(30, max(2 ** (attempt + 1), delay)))


def fetch_orcid(previous):
    base = f"https://pub.orcid.org/v3.0/{ORCID}"
    payload = get_json(f"{base}/works")
    if payload.get("path") != f"/{ORCID}/works":
        raise ValueError("ORCID returned an unexpected record")
    summaries = []
    for group in payload["group"]:
        options = [w for w in group.get("work-summary", [])
                   if w.get("type") in TYPES and w.get("visibility") == "public"
                   and w.get("path", "").startswith(f"/{ORCID}/work/")]
        if options:
            summaries.append(max(options, key=lambda w: int(w.get("display-index") or 0)))

    # Work summaries omit contributor names. Fetch details only for new/changed records.
    prior = {w["putCode"]: w for w in previous if w.get("putCode")}
    changed = [w for w in summaries if not prior.get(w["put-code"], {}).get("authorList")
               or prior[w["put-code"]].get("modified") != (w.get("last-modified-date") or {}).get("value")]
    details = {}
    for start in range(0, len(changed), 50):
        codes = ",".join(str(w["put-code"]) for w in changed[start:start + 50])
        try:
            bulk = get_json(f"{base}/works/{codes}")
            for entry in bulk.get("bulk", []):
                work = entry.get("work") or {}
                if work.get("put-code"):
                    details[work["put-code"]] = work
        except (OSError, ValueError, KeyError) as error:
            print(f"Warning: ORCID detail request failed. Keeping summary and saved author names. {error}",
                  file=sys.stderr)
    result = []
    for work in summaries:
        code = work["put-code"]
        detail, old = details.get(code, {}), prior.get(code, {})
        title = clean(work["title"]["title"]["value"])
        if not title:
            continue
        date_parts = work.get("publication-date") or {}
        year = (date_parts.get("year") or {}).get("value")
        month = (date_parts.get("month") or {}).get("value")
        day = (date_parts.get("day") or {}).get("value")
        when = str(year) if year else ""
        if when and month:
            when += f"-{int(month):02d}"
            if day:
                when += f"-{int(day):02d}"
        external_ids = (work.get("external-ids") or {}).get("external-id") or []
        doi = next((doi_key(e.get("external-id-value")) for e in external_ids
                    if e.get("external-id-type") == "doi" and e.get("external-id-relationship") == "self"), "")
        names = [clean((a.get("credit-name") or {}).get("value")) for a in
                 (detail.get("contributors") or {}).get("contributor", [])]
        citation = detail.get("citation") or {}
        bibtex = citation.get("citation-value", "") if citation.get("citation-type") == "bibtex" else ""
        result.append({
            "title": title, "year": int(year) if year else None,
            "venue": clean((work.get("journal-title") or {}).get("value")) or old.get("venue", ""),
            "authorList": list(filter(None, names)) or old.get("authorList", []),
            "sourceBibtex": bibtex or old.get("sourceBibtex", ""),
            "type": TYPES[work["type"]], "doi": doi, "date": when, "putCode": code,
            # Retry a missed detail call even when old contributor information remains available.
            "modified": ((work.get("last-modified-date") or {}).get("value") if detail else old.get("modified")),
            "url": f"https://orcid.org/{ORCID}/work/{code}",
        })
    return result


def matches_author(author, allow_name=False):
    """Reject conflicting identifiers; name discovery never accepts generic Kumar."""
    author_orcid = str(author.get("ORCID", "")).rstrip("/").split("/")[-1]
    if author_orcid:
        return author_orcid == ORCID
    if not allow_name:
        return False
    name = title_key(" ".join((author.get("given", ""), author.get("family", ""))))
    return name in {"rupeshkumartipu", "rupeshktipu", "rktipu", "rkumartipu"}


def crossref_row(work, known_dois=None, allow_name=False):
    if work.get("type") not in TYPES:
        return None
    authors = work.get("author") or []
    doi = doi_key(work.get("DOI"))
    if known_dois is not None:
        if doi not in known_dois:
            return None
    elif not any(matches_author(a, allow_name=allow_name) for a in authors):
        return None
    parts = (work.get("published-online") or work.get("published") or {}).get("date-parts", [[]])[0]
    title = clean((work.get("title") or [""])[0])
    if not title or not parts or not doi:
        return None
    names = [clean(" ".join(x for x in (a.get("given"), a.get("family")) if x) or a.get("name")) for a in authors]
    issue_parts = (work.get("published-print") or work.get("published") or {}).get("date-parts", [[]])[0]
    return {
        "title": title, "year": int(parts[0]), "venue": clean((work.get("container-title") or [""])[0]),
        "authorList": list(filter(None, names)), "type": TYPES[work["type"]], "doi": doi,
        "date": "-".join([str(parts[0])] + [f"{int(n):02d}" for n in parts[1:]]),
        "issueYear": int(issue_parts[0]) if issue_parts else int(parts[0]),
        "volume": clean(work.get("volume")), "issue": clean(work.get("issue")), "pages": clean(work.get("page")),
        "articleNumber": clean(work.get("article-number")), "publisher": clean(work.get("publisher")),
        "isbn": clean((work.get("ISBN") or [""])[0]), "issn": clean((work.get("ISSN") or [""])[0]),
    }


def fetch_crossref():
    items = []
    cursor = "*"
    while True:
        params = {"filter": f"orcid:{ORCID}", "rows": 100,
                  "select": CROSSREF_FIELDS, "cursor": cursor}
        payload = get_json("https://api.crossref.org/works?" + urlencode(params))
        if payload["status"] != "ok":
            raise ValueError("Crossref returned an incomplete response")
        msg = payload["message"]
        batch = msg["items"]
        items.extend(batch)
        if len(items) >= msg["total-results"]:
            break
        if not batch or not msg.get("next-cursor"):
            raise ValueError("Incomplete Crossref pagination")
        cursor = msg["next-cursor"]
    return [row for item in items if (row := crossref_row(item))]


def fetch_crossref_names():
    """Recent publisher deposits missing ORCID, with explicit author-name checks.

    Querying the uncommon family name keeps the result set small enough to page
    completely; the Crossref text search itself is never treated as identity proof.
    """
    cursor, seen, rows = "*", set(), []
    since = (date.today() - timedelta(days=730)).isoformat()
    while True:
        params = {"query.author": "Tipu", "filter": f"from-pub-date:{since}",
                  "rows": 1000, "select": CROSSREF_FIELDS, "cursor": cursor}
        payload = get_json("https://api.crossref.org/works?" + urlencode(params))
        if payload.get("status") != "ok":
            raise ValueError("Crossref name discovery returned an incomplete response")
        msg = payload["message"]
        batch = msg["items"]
        for item in batch:
            doi = doi_key(item.get("DOI"))
            if doi not in seen and (row := crossref_row(item, allow_name=True)):
                rows.append(row)
            seen.add(doi)
        if len(seen) >= msg["total-results"] or len(batch) < 1000:
            break
        next_cursor = msg.get("next-cursor")
        if not batch or not next_cursor or next_cursor == cursor or len(seen) > 20000:
            raise ValueError("Incomplete or unexpectedly broad Crossref name discovery")
        cursor = next_cursor
    return rows


def enrich_doi_metadata(cache, curated):
    # Filter on explicit DOIs in owner-supplied or public ORCID records. This adds
    # publication dates for stable matches even if a publisher omitted the author ORCID.
    known = {doi_key(w.get("doi")) for w in curated + cache.get("ORCID", {}).get("items", [])}
    known.discard("")
    previous = {w["doi"]: w for w in cache.get("DOI metadata", {}).get("items", []) if w["doi"] in known}
    # Already-dated records are cached; the author-indexed discovery query refreshes daily.
    known_with_dates = {w["doi"] for w in cache.get("Crossref", {}).get("items", []) if w.get("date")}
    expiry = (date.today() - timedelta(days=45)).isoformat()
    fresh = {doi for doi, row in previous.items() if (row.get("lookupDate") or "") > expiry}
    pending = sorted(known - fresh - known_with_dates)
    for start in range(0, len(pending), 20):
        batch = pending[start:start + 20]
        params = {"filter": ",".join(f"doi:{doi}" for doi in batch), "rows": len(batch),
                  "select": CROSSREF_FIELDS}
        try:
            payload = get_json("https://api.crossref.org/works?" + urlencode(params))
            if payload["status"] != "ok":
                raise ValueError("Crossref DOI lookup unavailable")
            for item in payload["message"]["items"]:
                row = crossref_row(item, known_dois=set(batch))
                if row:
                    row["lookupDate"] = date.today().isoformat()
                    previous[row["doi"]] = row
        except (OSError, ValueError, KeyError, TypeError) as error:
            print(f"Warning: DOI detail lookup failed. Keeping existing dates. {error}", file=sys.stderr)
    return sorted(previous.values(), key=lambda w: w["doi"])


def csv_works(path):
    with path.open(encoding="utf-8-sig", newline="") as input_file:
        reader = csv.DictReader(input_file)
        if not {"Title", "Authors", "Publication", "Year"} <= set(reader.fieldnames or []):
            raise ValueError(f"{path.name} needs Title, Authors, Publication and Year columns")
        for row in reader:
            if not (row["Title"] or "").strip():
                continue
            names = []
            for author in (row["Authors"] or "").split(";"):
                last, comma, first = author.strip().partition(",")
                if last:
                    names.append(f"{first.strip()} {last}" if comma else last)
            yield {
                "title": row["Title"].strip(), "year": int(row["Year"]) if (row["Year"] or "").isdigit() else None,
                "authorList": names, "venue": row["Publication"] or "", "type": "Other",
                "doi": doi_key(row.get("DOI")),
                "volume": clean(row.get("Volume")), "issue": clean(row.get("Number")),
                "pages": clean(row.get("Pages")), "publisher": clean(row.get("Publisher")),
            }


def bibtex_works(path):
    """Read owner-exported BibTeX, including repeated keys and nested braces.

    BibTeX is data only. This intentionally handles the literal export format,
    not executable TeX, includes, or a guessed title parsed with a flat regex.
    """
    text = path.read_text(encoding="utf-8-sig")
    pos = 0
    types = {"article": "Journal article", "inproceedings": "Conference paper",
             "conference": "Conference paper", "incollection": "Book chapter",
             "inbook": "Book chapter", "book": "Book"}
    while match := re.search(r"@(\w+)\s*\{", text[pos:]):
        start = pos + match.start()
        entry_type = match.group(1).lower()
        pos += match.end()
        comma = text.find(",", pos)
        if comma < 0:
            raise ValueError("Incomplete BibTeX entry")
        pos = comma + 1
        fields = {}
        while pos < len(text):
            while pos < len(text) and (text[pos].isspace() or text[pos] == ","):
                pos += 1
            if pos < len(text) and text[pos] == "}":
                pos += 1
                break
            field = re.match(r"([\w-]+)\s*=\s*", text[pos:])
            if not field:
                raise ValueError(f"Unsupported BibTeX field near character {pos}")
            key = field.group(1).lower()
            pos += field.end()
            if text[pos] == "{":
                pos += 1
                value_start, depth = pos, 1
                while pos < len(text) and depth:
                    if text[pos] == "\\":
                        pos += 2
                        continue
                    if text[pos] == "{":
                        depth += 1
                    elif text[pos] == "}":
                        depth -= 1
                    pos += 1
                if depth:
                    raise ValueError("Unclosed BibTeX value")
                value = text[value_start:pos - 1]
            elif text[pos] == '"':
                pos += 1
                value_start = pos
                while pos < len(text) and text[pos] != '"':
                    pos += 2 if text[pos] == "\\" else 1
                value, pos = text[value_start:pos], pos + 1
            else:
                value_start = pos
                while pos < len(text) and text[pos] not in ",}":
                    pos += 1
                value = text[value_start:pos].strip()
            fields[key] = clean(value.replace("{", "").replace("}", "").replace(r"\&", "&"))
        if entry_type not in types or not fields.get("title"):
            continue
        names = []
        for author in re.split(r"\s+and\s+", fields.get("author", "")):
            last, comma, first = author.strip().partition(",")
            if last:
                names.append(f"{first.strip()} {last}" if comma else last)
        year = int(fields["year"]) if fields.get("year", "").isdigit() else None
        yield {
            "title": fields["title"], "year": year, "authorList": names,
            "venue": fields.get("journal") or fields.get("booktitle", ""),
            "type": types[entry_type], "doi": doi_key(fields.get("doi") or fields.get("url")),
            "volume": fields.get("volume", ""), "issue": fields.get("number", ""),
            "pages": fields.get("pages", "").replace("--", "-"), "publisher": fields.get("publisher", ""),
            "isbn": fields.get("isbn", ""), "issn": fields.get("issn", ""),
            "sourceBibtex": text[start:pos],
        }


def publication_sort_key(row):
    # An online-first date determines recency even when the issue is dated next year.
    parts = (row.get("date") or str(row.get("year") or 0)).split("-")
    return tuple(int(part) for part in parts) + (0,) * (3 - len(parts))


def merge_records(sources, exclusions, aliases=None):
    # The CV owns display title, venue, bibliographic year and publication category.
    # Other records add DOI, article links and metadata the primary sources omitted.
    merged = []
    for source_name, rows in sources:
        for raw in rows:
            item = dict(raw)
            title = clean(item["title"])
            key = title_key(title)
            doi = doi_key(item.get("doi")) or (aliases or {}).get(key, "")
            if not key or doi in exclusions["dois"] or key in exclusions["titles"]:
                continue
            row = next((r for r in merged if doi and r["doi"] == doi), None)
            if row is None:
                row = next((r for r in merged if r["_key"] == key and (not doi or not r["doi"] or r["doi"] == doi)), None)
            names = item.get("authorList") or item.get("authors") or []
            if isinstance(names, str):
                names = [a.strip() for a in names.split(",") if a.strip()]
            incoming = {"title": title, "year": item.get("year"), "authorList": names,
                        "authors": ", ".join(names), "sourceBibtex": item.get("sourceBibtex") or "",
                        "venue": clean(item.get("venue")), "doi": doi, "type": item.get("type") or "Other",
                        "url": (item.get("url") or "") if urlparse(item.get("url") or "").scheme == "https" else "",
                        "date": item.get("date") or "", "issueYear": item.get("issueYear")}
            incoming.update({field: clean(item.get(field)) for field in CITATION_FIELDS})
            if row is None:
                row = dict(incoming, _key=key, sources=[])
                merged.append(row)
            else:
                for field, value in incoming.items():
                    if value and (not row[field] or (field == "type" and row[field] == "Other")):
                        row[field] = value
            if source_name not in row["sources"]:
                row["sources"].append(source_name)
    for row in merged:
        del row["_key"]
        if row["doi"]:
            row["url"] = "https://doi.org/" + quote(row["doi"], safe="/():._-")
        elif not row["url"]:
            row["url"] = "https://scholar.google.com/scholar?" + urlencode({"q": row["title"]})
    merged.sort(key=publication_sort_key, reverse=True)
    return merged


def run(refresh=False):
    cache_path = DATA / "remote-publications.json"
    cache = read_json(cache_path) if cache_path.exists() else {}
    today = date.today().isoformat()
    curated = read_json(DATA / "cv-publications.json") if (DATA / "cv-publications.json").exists() else []
    scholar = list(csv_works(DATA / "google-scholar.csv")) if (DATA / "google-scholar.csv").exists() else []
    orcid_export = list(bibtex_works(DATA / "orcid-export.bib")) if (DATA / "orcid-export.bib").exists() else []
    aliases = {title_key(k): doi_key(v) for k, v in
               (read_json(DATA / "publication-aliases.json") if (DATA / "publication-aliases.json").exists() else {}).items()}
    if refresh:
        successful = 0
        for name, fetch in (("ORCID", lambda: fetch_orcid(cache.get("ORCID", {}).get("items", []))),
                            ("Crossref", fetch_crossref), ("Crossref author search", fetch_crossref_names)):
            previous_source = cache.get(name, {})
            try:
                items = fetch()
                if not items or (name != "Crossref author search" and
                                 len(items) < 0.75 * len(previous_source.get("items", []))):
                    raise ValueError("no results or a substantial unexplained drop in record count")
                if name == "Crossref author search":
                    # A rolling discovery window must not delete earlier discoveries.
                    by_doi = {w["doi"]: w for w in previous_source.get("items", [])}
                    by_doi.update({w["doi"]: w for w in items})
                    items = list(by_doi.values())
                cache[name] = {"checked": today, "lastAttempt": today, "status": "ok", "items": items}
                successful += 1
                print(f"{name} returned {len(items)} matching source records.")
            except (OSError, ValueError, KeyError, IndexError, TypeError) as error:
                cache[name] = dict(previous_source, lastAttempt=today, status="unavailable",
                                   error=type(error).__name__)
                print(f"Warning: {name} refresh failed. Retaining its previous records. {error}", file=sys.stderr)
        if not successful:
            print("Warning: All public feeds failed. Keeping saved publications and reporting stale checks.", file=sys.stderr)
        else:
            imported = curated + scholar + orcid_export
            imported = [dict(w, doi=w.get("doi") or aliases.get(title_key(w["title"]), "")) for w in imported]
            cache["DOI metadata"] = {"items": enrich_doi_metadata(cache, imported)}
    sources = [
        ("CV", curated),
        ("Google Scholar export", scholar),
        ("Crossref", cache.get("Crossref", {}).get("items", [])),
        ("Crossref author search", cache.get("Crossref author search", {}).get("items", [])),
        ("Crossref", cache.get("DOI metadata", {}).get("items", [])),
        ("ORCID export", orcid_export),
        ("ORCID", cache.get("ORCID", {}).get("items", [])),
        ("Portfolio archive", read_json(DATA / "portfolio-archive.json") if (DATA / "portfolio-archive.json").exists() else []),
    ]
    exclusions = read_json(DATA / "exclusions.json") if (DATA / "exclusions.json").exists() else {"dois": [], "titles": []}
    exclusions = {"dois": {doi_key(x) for x in exclusions["dois"]}, "titles": {title_key(x) for x in exclusions["titles"]}}
    publications = merge_records(sources, exclusions, aliases)
    if not publications:
        raise ValueError("Catalogue empty, refusing to replace published data")
    output_path = DATA / "publications.json"
    previous = read_json(output_path) if output_path.exists() else {}
    updated = previous.get("updated") if previous.get("publications") == publications else today
    result = {"updated": updated or today, "lastCrossrefSync": cache.get("Crossref", {}).get("checked"),
              "lastOrcidSync": cache.get("ORCID", {}).get("checked"),
              "lastAuthorSearchSync": cache.get("Crossref author search", {}).get("checked"),
              "sourceStatus": {name: {"lastAttempt": cache.get(name, {}).get("lastAttempt"),
                                      "lastSuccess": cache.get(name, {}).get("checked"),
                                      "status": cache.get(name, {}).get("status", "not-checked"),
                                      "records": len(cache.get(name, {}).get("items", []))}
                               for name in ("ORCID", "Crossref", "Crossref author search")},
              "publications": publications}
    if refresh:
        write_json(cache_path, cache)
    write_json(output_path, result)
    print(f"Catalogue contains {len(publications)} distinct works.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--refresh", action="store_true", help="Update public ORCID and Crossref caches before building")
    parser.add_argument("--import-scholar", type=Path, help="Replace the saved Scholar CSV after validating the export")
    parser.add_argument("--import-orcid", type=Path, help="Replace the saved ORCID BibTeX after validating the export")
    args = parser.parse_args()
    for supplied, destination, reader in ((args.import_scholar, "google-scholar.csv", csv_works),
                                         (args.import_orcid, "orcid-export.bib", bibtex_works)):
        if supplied:
            if not list(reader(supplied)):
                raise SystemExit(f"{supplied.name} has no publication records")
            if supplied.resolve() != (DATA / destination).resolve():
                shutil.copyfile(supplied, DATA / destination)
    run(args.refresh)
