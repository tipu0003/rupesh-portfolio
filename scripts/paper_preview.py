"""Select recent papers and optionally capture the newest public journal landing page."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import unicodedata
from urllib.parse import quote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PREVIEW_DIR = Path("assets/paper-previews")


def normalized_title(title):
    return "".join(char for char in unicodedata.normalize("NFKD", title).casefold() if char.isalnum())


def canonical_doi(paper):
    doi = str(paper.get("doi") or "").strip().casefold()
    return doi if re.fullmatch(r"10\.\d{4,9}/[^\s<>]+", doi) else ""


def recent_papers(papers, limit=6):
    """Use actual publication dates where known; incomplete dates keep their precision."""
    ordered = sorted(papers, key=lambda p: (p.get("date") or str(p.get("year") or ""), p["title"]), reverse=True)
    selected, identifiers = [], set()
    for paper in ordered:
        key = canonical_doi(paper) or normalized_title(paper["title"])
        if key and key not in identifiers:
            selected.append(paper)
            identifiers.add(key)
        if len(selected) == limit:
            break
    return selected


def preview_path(paper):
    doi = canonical_doi(paper)
    if not doi:
        return None
    return PREVIEW_DIR / (hashlib.sha256(doi.encode()).hexdigest() + ".png")


def matching_article(expected_title, expected_doi, heading_text, metadata_doi):
    if not heading_text or normalized_title(expected_title) != normalized_title(heading_text):
        return False
    stripped = re.sub(r"^(?:https?://(?:dx\.)?doi\.org/|doi:\s*)", "", metadata_doi.strip(), flags=re.I)
    return not stripped or stripped.casefold() == expected_doi


def capture(paper, output):
    # Import only in the optional CI step. Normal local builds require no browser or extra packages.
    from playwright.sync_api import sync_playwright

    doi = canonical_doi(paper)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(channel="chrome")
        context = browser.new_context(viewport={"width": 1280, "height": 720}, accept_downloads=False)
        page = context.new_page()
        page.set_default_timeout(10000)
        response = page.goto("https://doi.org/" + quote(doi, safe="/"), wait_until="domcontentloaded", timeout=30000)
        target = urlsplit(page.url)
        if not response or not response.ok or target.scheme != "https" or target.hostname in {"doi.org", "dx.doi.org"}:
            raise ValueError("The DOI did not open a public article landing page.")
        page.locator("h1").first.wait_for(state="visible")
        publisher_doi = page.locator('meta[name="citation_doi" i]').first
        metadata = (publisher_doi.get_attribute("content") or "") if publisher_doi.count() else ""
        heading = None
        for node in page.locator("h1").all():
            if node.is_visible() and matching_article(paper["title"], doi, node.inner_text(), metadata):
                heading = node
                break
        if heading is None:
            raise ValueError("The publisher page did not display the title of this DOI.")

        # Place the article title near the top and reject an obscuring modal or access wall.
        box = heading.bounding_box()
        if not box or box["height"] > 580:
            raise ValueError("A readable article heading was unavailable.")
        if box["y"] + box["height"] > 550:
            heading.evaluate("(el) => window.scrollBy(0, el.getBoundingClientRect().top - 95)")
        unobstructed = heading.evaluate("""el => {
            const r = el.getBoundingClientRect();
            const seen = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return seen && (el === seen || el.contains(seen));
        }""")
        if not unobstructed:
            raise ValueError("The publisher page obscured its article heading.")
        image = page.screenshot(type="png", animations="disabled", timeout=10000)
        browser.close()

    output.parent.mkdir(parents=True, exist_ok=True)
    temporary = output.with_suffix(".tmp")
    temporary.write_bytes(image)
    temporary.replace(output)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--needed", action="store_true", help="Print true when the newest DOI needs a preview.")
    args = parser.parse_args()
    records = recent_papers(json.loads((ROOT / "data/publications.json").read_text())["publications"], 1)
    relative = preview_path(records[0]) if records else None
    needed = bool(relative and not (ROOT / relative).is_file())
    if args.needed:
        print("true" if needed else "false")
        return
    if needed:
        capture(records[0], ROOT / relative)
        print("Captured the verified journal page for DOI", canonical_doi(records[0]))


if __name__ == "__main__":
    main()
