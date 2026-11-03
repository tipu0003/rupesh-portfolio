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
    papers = catalogue["publications"]
    if not papers:
        raise ValueError("The catalogue must contain at least one publication.")
    page = (ROOT / "index.template.html").read_text(encoding="utf-8")
    # A text-only archive remains available to readers who disable JavaScript.
    rows = [f'<li>{paper_link(p)} · {html.escape(p.get("venue") or "")} ({p.get("year") or "n.d."})</li>' for p in papers]
    replacements = {
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
    for path in ("style.css", "publications-feature.css", "catalog.js", "data/publications.json", "robots.txt", "sitemap.xml"):
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
