"""Build the static portfolio and its offline-readable publication index."""
import argparse
import html
import json
from pathlib import Path
import shutil
from urllib.parse import urlsplit


ROOT = Path(__file__).resolve().parents[1]



def paper_link(paper):
    title = html.escape(paper["title"])
    url = paper.get("url", "")
    if urlsplit(url).scheme != "https":
        return title
    return f'<a href="{html.escape(url, quote=True)}">{title}</a>'


def build(out):
    out.mkdir(exist_ok=True)
    catalogue = json.loads((ROOT / "data/publications.json").read_text(encoding="utf-8"))
    papers = catalogue["publications"]
    if not papers:
        raise ValueError("The catalogue must contain at least one publication.")
    page = (ROOT / "index.template.html").read_text(encoding="utf-8")
    latest = max(papers, key=lambda p: (p.get("date") or str(p.get("year") or ""), p["title"]))
    # A text-only archive remains available to readers who disable JavaScript.
    rows = [f'<li>{paper_link(p)} · {html.escape(p.get("venue") or "")} ({p.get("year") or "n.d."})</li>' for p in papers]
    replacements = {
        "<!--LATEST-->": paper_link(latest) + '<span class="latest-arrow" aria-hidden="true">↗</span>',
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
    for path in ("style.css", "catalog.js", "data/publications.json", "robots.txt", "sitemap.xml"):
        shutil.copy2(ROOT / path, out / path)
    shutil.copytree(ROOT / "assets", out / "assets", dirs_exist_ok=True)
    (out / ".nojekyll").touch()
    print(f"Built {len(papers)} publications in {out}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", choices=["_site", "build"], default="_site")
    build(ROOT / parser.parse_args().output)
