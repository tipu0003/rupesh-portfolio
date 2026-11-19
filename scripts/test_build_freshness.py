"""Verify the public page keeps metric values, snapshots and source checks distinct."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import build_site


def metrics():
    return {
        "scholar": {
            "url": "https://scholar.google.com/citations?user=uZzLU8IAAAAJ&hl=en",
            "asOf": "2026-11-19", "source": "User-supplied Google Scholar screenshot",
            "all": {"citations": 1218, "hIndex": 23, "i10Index": 31},
            "lastAttempt": None, "status": "manual",
        },
        "scopus": {"documents": 76, "asOf": "2026-10-14"},
    }


class FreshnessBuildTests(unittest.TestCase):
    def test_values_render_from_metrics_and_keep_independent_dates(self):
        data = metrics()
        page = build_site.research_metrics(data)
        for value in ("1,218", "23", "31", "76"):
            self.assertIn(f"<strong>{value}</strong>", page)
        self.assertIn('<time datetime="2026-11-19">19 November 2026</time> snapshot', page)
        self.assertIn('CV · <time datetime="2026-10-14">14 Oct 2026</time>', page)
        data["scholar"]["all"]["citations"] = 1300
        self.assertIn("<strong>1,300</strong>", build_site.research_metrics(data))

    def test_failed_later_check_never_redates_verified_metrics(self):
        data = metrics()
        data["scholar"].update(status="unavailable", lastAttempt="2026-11-21T02:17:00Z")
        page = build_site.research_metrics(data)
        self.assertIn("Automatic check unavailable · showing saved snapshot", page)
        self.assertIn('datetime="2026-11-19">19 November 2026</time> snapshot', page)
        self.assertIn('Last automatic attempt: <time datetime="2026-11-21">21 Nov 2026</time>', page)
        self.assertNotIn('datetime="2026-11-21">21 November 2026</time> snapshot', page)
        data["scholar"]["status"] = "ok"
        self.assertIn("Google Scholar checked automatically", build_site.research_metrics(data))

    def test_source_checks_remain_distinct_from_changed_date(self):
        catalogue = {
            "publications": [{"title": "Example"}], "updated": "2026-11-03",
            "lastOrcidSync": "2026-11-19", "lastCrossrefSync": "2026-11-18",
            "lastAuthorSearchSync": "2026-11-17",
            "sourceStatus": {"Crossref": {"lastSuccess": "2026-11-18", "lastAttempt": "2026-11-19", "status": "unavailable"}},
        }
        page = build_site.catalogue_status(catalogue)
        self.assertIn('Catalogue changed <time datetime="2026-11-03">3 Nov 2026</time>', page)
        self.assertIn('ORCID: <time datetime="2026-11-19">19 Nov 2026</time>', page)
        self.assertIn('Crossref: <time datetime="2026-11-18">18 Nov 2026</time>; latest attempt unavailable', page)
        self.assertIn('Crossref author search: <time datetime="2026-11-17">17 Nov 2026</time>', page)

    def test_reject_invalid_metric_values_and_escape_source(self):
        for invalid in (True, -1, "1218", '<img src=x>'):
            data = metrics()
            data["scholar"]["all"]["citations"] = invalid
            with self.assertRaises(ValueError):
                build_site.research_metrics(data)
        data = metrics()
        data["scholar"]["source"] = "<script>unsafe</script>"
        self.assertIn("&lt;script&gt;unsafe&lt;/script&gt;", build_site.research_metrics(data))
        data["scholar"]["url"] = "javascript:alert(1)"
        with self.assertRaises(ValueError):
            build_site.research_metrics(data)

    def test_full_build_embeds_new_values_and_copies_metrics(self):
        source_root = build_site.ROOT
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "data").mkdir()
            (root / "assets").mkdir()
            (root / "sections").mkdir()
            (root / "index.template.html").write_text((source_root / "index.template.html").read_text())
            (root / "sections/profile.html").write_text("<section>Profile</section>")
            for name in ("style.css", "publications-feature.css", "catalog.js", "robots.txt", "sitemap.xml"):
                (root / name).write_text("")
            data = metrics()
            (root / "data/metrics.json").write_text(json.dumps(data))
            (root / "data/publications.json").write_text(json.dumps({"updated": "2026-11-19", "publications": [
                {"title": "Example paper", "url": "https://doi.org/10.1234/example", "doi": "10.1234/example", "year": 2026, "date": "2026-11-19"}
            ]}))
            with patch.object(build_site, "ROOT", root):
                build_site.build(root / "_site")
            built = (root / "_site/index.html").read_text()
            self.assertIn("<strong>1,218</strong>", built)
            self.assertNotIn("<!--METRICS-->", built)
            self.assertNotIn("<!--CATALOG_STATUS-->", built)
            self.assertEqual(json.loads((root / "_site/data/metrics.json").read_text()), data)


if __name__ == "__main__":
    unittest.main()
