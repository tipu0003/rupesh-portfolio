"""Build the static portfolio and its offline-readable publication index."""
import argparse
from datetime import datetime
import html
import json
from pathlib import Path
import shutil
from urllib.parse import urlsplit
from paper_preview import preview_path, recent_papers


ROOT = Path(__file__).resolve().parents[1]


def date_label(value, long=False):
    """Render source dates, never the build date, as semantic HTML."""
    raw = str(value or "")[:10]
    try:
        parsed = datetime.strptime(raw, "%Y-%m-%d")
    except ValueError:
        return "not yet available"
    label = parsed.strftime("%d %B %Y" if long else "%d %b %Y").lstrip("0")
    return f'<time datetime="{raw}">{label}</time>'


def secure_link(value):
    value = str(value or "")
    parsed = urlsplit(value)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("Profile links must be public HTTPS URLs.")
    return html.escape(value, quote=True)


def metric_number(value):
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ValueError("Research metric values must be nonnegative integers.")
    return f"{value:,}"


def research_metrics(data):
    """Keep verified values and their date distinct from a later failed check."""
    scholar, scopus = data["scholar"], data["scopus"]
    measures = "".join(
        f'<div class="measure"><strong>{metric_number(scholar["all"][key])}</strong>'
        f'<span>{label}</span></div>'
        for key, label in (("citations", "Citations"), ("hIndex", "h-index"), ("i10Index", "i10-index"))
    )
    status = scholar.get("status")
    if status == "ok":
        summary = "Google Scholar checked automatically"
        detail = "These all-time figures come from the public Google Scholar profile."
    elif status == "unavailable":
        summary = "Automatic check unavailable · showing saved snapshot"
        detail = "Google Scholar could not be verified during the latest check. The last verified figures and their original date remain visible."
    else:
        summary = "Google Scholar snapshot · automatic checks enabled"
        detail = "These all-time figures come from the saved Google Scholar snapshot. Automatic checks can update them when the public profile is accessible."
    attempt = ""
    if scholar.get("lastAttempt"):
        attempt = f' Last automatic attempt: {date_label(scholar["lastAttempt"])}.'
    return f'''<div class="impact-caption"><small class="eyebrow">Research impact</small>
        <a href="{secure_link(scholar['url'])}">Google Scholar <span aria-hidden="true">↗</span></a>
        <span>{date_label(scholar['asOf'], long=True)} snapshot</span></div>
        {measures}
        <div class="measure secondary-metric"><strong>{metric_number(scopus['documents'])}</strong>
        <span>Scopus documents</span><small>CV · {date_label(scopus['asOf'])}</small></div>
        <details class="metrics-status"><summary>{summary}</summary>
        <p>{detail}{attempt} Source: {html.escape(str(scholar.get('source') or 'Google Scholar'))}.
        Scopus uses its separately dated CV snapshot. Publication counts do not determine citation metrics.</p></details>'''


def catalogue_status(data):
    """A content change and a successful source check mean different things."""
    checks = []
    for label, field in (("ORCID", "lastOrcidSync"), ("Crossref", "lastCrossrefSync"),
                         ("Crossref author search", "lastAuthorSearchSync")):
        status = data.get("sourceStatus", {}).get(label, {})
        checked = date_label(status.get("lastSuccess") or data.get(field))
        failure = ""
        if status.get("status") == "unavailable":
            failure = f'; latest attempt unavailable ({date_label(status.get("lastAttempt"))}), using saved records'
        checks.append(f'<span>{label}: {checked}{failure}</span>')
    changed = date_label(data.get("updated"))
    return f'''<div class="archive-meta archive-source-summary">
        <span><b data-catalog-count>{len(data['publications'])}</b> publications · Catalogue changed {changed}</span>
        <a href="https://orcid.org/0000-0001-8476-8364">ORCID record <span aria-hidden="true">↗</span></a></div>
        <details class="catalogue-status"><summary>Automatic publication checks</summary>
        <p>Last successful checks: {' · '.join(checks)}. A successful check may find no new papers.
        Records come from public indexes and the supplied exports; indexing delays can affect when a paper appears.</p></details>'''

def paper_link(paper):
    title = html.escape(paper["title"])
    url = paper.get("url", "")
    if urlsplit(url).scheme != "https":
        return title
    return f'<a href="{html.escape(url, quote=True)}">{title}</a>'


def publication_date(paper):
    raw = paper.get("date") or str(paper.get("year") or "")
    for input_format, display_format in (("%Y-%m-%d", "%d %b %Y"), ("%Y-%m", "%b %Y"), ("%Y", "%Y")):
        try:
            display = datetime.strptime(raw, input_format).strftime(display_format).lstrip("0")
            return f'<time datetime="{html.escape(raw)}">{display}</time>'
        except ValueError:
            continue
    return ""


def publication_highlights(papers):
    latest, *recent = recent_papers(papers)
    screenshot = preview_path(latest)
    image_html = ""
    if screenshot and (ROOT / screenshot).is_file():
        image_html = f'''<figure class="paper-preview"><a href="{html.escape(latest['url'], quote=True)}"
            aria-label="Open the publisher page for {html.escape(latest['title'], quote=True)}">
            <img src="./{screenshot.as_posix()}" loading="lazy" decoding="async"
            alt="Journal landing page for the featured paper"></a>
            <figcaption>Journal page preview <span aria-hidden="true">↗</span></figcaption></figure>'''

    items = []
    for paper in recent:
        items.append(f'''<li class="recent-paper"><div class="paper-meta">{publication_date(paper)}
            <span>{html.escape(paper.get("venue") or "")}</span></div>
            <h4>{paper_link(paper)}</h4></li>''')
    return f'''<article class="featured-paper{' has-preview' if image_html else ''}">
        <div class="paper-copy"><h2 class="eyebrow"><span class="rule"></span> Latest publication</h2>
        <div class="paper-meta">{publication_date(latest)}<span>{html.escape(latest.get("venue") or "")}</span></div>
        <h3>{paper_link(latest)}</h3><p class="paper-byline">{html.escape(latest.get("authors") or "")}</p></div>
        {image_html}</article><div class="recent-heading"><h3>Recent publications</h3>
        <a href="#publications">Full archive <span aria-hidden="true">↓</span></a></div>
        <ol class="recent-papers">{"".join(items)}</ol>'''


def build(out):
    out.mkdir(exist_ok=True)
    catalogue = json.loads((ROOT / "data/publications.json").read_text(encoding="utf-8"))
    metrics = json.loads((ROOT / "data/metrics.json").read_text(encoding="utf-8"))
    papers = catalogue["publications"]
    if not papers:
        raise ValueError("The catalogue must contain at least one publication.")
    page = (ROOT / "index.template.html").read_text(encoding="utf-8")
    # A text-only archive remains available to readers who disable JavaScript.
    rows = [f'<li>{paper_link(p)} · {html.escape(p.get("venue") or "")} ({p.get("year") or "n.d."})</li>' for p in papers]
    replacements = {
        "<!--METRICS-->": research_metrics(metrics),
        "<!--CATALOG_STATUS-->": catalogue_status(catalogue),
        "<!--LATEST-->": publication_highlights(papers),
        "<!--PROFILE-->": (ROOT / "sections/profile.html").read_text(encoding="utf-8"),
        "<!--NOSCRIPT-->": "<p>Publication list</p><ol>" + "".join(rows) + "</ol>",
        "<!--CATALOG-->": json.dumps(catalogue, ensure_ascii=False, separators=(",", ":")).replace("<", r"\u003c"),
    }
    for marker, content in replacements.items():
        if page.count(marker) != 1:
            raise ValueError(f"Missing or duplicated template marker {marker}")
        page = page.replace(marker, content)
    (out / "index.html").write_text(page, encoding="utf-8")
    (out / "data").mkdir(exist_ok=True)
    for path in ("style.css", "publications-feature.css", "catalog.js", "data/publications.json", "data/metrics.json", "robots.txt", "sitemap.xml"):
        shutil.copy2(ROOT / path, out / path)
    shutil.copytree(ROOT / "assets", out / "assets", dirs_exist_ok=True)
    if (ROOT / "ml").is_dir():
        shutil.copytree(ROOT / "ml", out / "ml", dirs_exist_ok=True)
    (out / ".nojekyll").touch()
    print(f"Built {len(papers)} publications in {out}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", choices=["_site", "build"], default="_site")
    build(ROOT / parser.parse_args().output)
