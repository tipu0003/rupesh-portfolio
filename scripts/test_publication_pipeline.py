import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from urllib.error import URLError

import update_publications as p


class CatalogueTests(unittest.TestCase):
    def test_merge_preserves_curation_and_splits_conflicting_dois(self):
        cv = {"title": "ABC: Test", "year": 2025, "authors": ["One Author"], "type": "Conference paper"}
        crossref = {"title": "ABC – test", "year": 2024, "doi": "HTTPS://DOI.ORG/10.1234/E", "type": "Book chapter"}
        other = dict(crossref, doi="10.1234/F")
        rows = p.merge_records([("CV", [cv]), ("Crossref", [crossref, other])], {"dois": set(), "titles": set()})
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]["year"], 2025)
        self.assertEqual(rows[0]["type"], "Conference paper")
        self.assertEqual(rows[0]["doi"], "10.1234/e")
        self.assertEqual(rows[0]["authorList"], ["One Author"])
        self.assertEqual(rows[0]["sources"], ["CV", "Crossref"])

    def test_crossref_ignores_wrong_person_and_peer_reviews(self):
        paper = {"type": "journal-article", "title": ["Example"], "published": {"date-parts": [[2025]]},
                 "DOI": "10.1234/e", "author": [{"family": "Tipu", "ORCID": "https://orcid.org/0000-0000-0000-0000"}]}
        self.assertIsNone(p.crossref_row(paper))
        paper["author"][0]["ORCID"] = "https://orcid.org/" + p.ORCID
        self.assertEqual(p.crossref_row(paper)["year"], 2025)
        paper["type"] = "peer-review"
        self.assertIsNone(p.crossref_row(paper))

    def test_network_failure_keeps_saved_files_byte_for_byte(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            cache = root / "remote-publications.json"
            output = root / "publications.json"
            cache.write_text('{"Crossref": {"items":[]}}')
            output.write_text('{"updated":"2026-01-01","publications":[]}')
            original = [cache.read_bytes(), output.read_bytes()]
            with patch.object(p, "DATA", root), patch.object(p, "get_json", side_effect=URLError("offline")):
                with self.assertRaises(SystemExit):
                    p.run(refresh=True)
            self.assertEqual([cache.read_bytes(), output.read_bytes()], original)

    def test_partial_source_response_keeps_its_previous_date(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            works = [{"title": f"Study {i}", "year": 2025, "doi": f"10.1234/{i}", "type": "Journal article"}
                     for i in range(4)]
            (root / "remote-publications.json").write_text(json.dumps({"ORCID": {
                "checked": "2025-01-01", "items": works
            }}))
            (root / "cv-publications.json").write_text(json.dumps(works))
            (root / "portfolio-archive.json").write_text("[]")
            (root / "exclusions.json").write_text('{"dois":[],"titles":[]}')
            (root / "google-scholar.csv").write_text("Title,Authors,Publication,Year\n")
            with patch.object(p, "DATA", root), patch.object(p, "fetch_orcid", return_value=works[:1]), \
                    patch.object(p, "fetch_crossref", return_value=[works[0]]), \
                    patch.object(p, "enrich_doi_metadata", return_value=[]):
                p.run(refresh=True)
            result = json.loads((root / "publications.json").read_text())
            self.assertEqual(result["lastOrcidSync"], "2025-01-01")
            self.assertEqual(result["lastCrossrefSync"], p.date.today().isoformat())
            self.assertEqual(len(result["publications"]), 4)
            self.assertTrue(all("ORCID" in row["sources"] for row in result["publications"]))

    def test_dedupes_two_orcid_groups_with_and_without_doi(self):
        items = [{"title": "Book chapter A", "year": 2023, "doi": "10.1234/a"},
                 {"title": "Book chapter A", "year": 2024, "doi": ""}]
        rows = p.merge_records([("ORCID", items)], {"dois": set(), "titles": set()})
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["url"], "https://doi.org/10.1234/a")
