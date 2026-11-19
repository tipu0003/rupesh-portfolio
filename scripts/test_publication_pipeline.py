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

    def test_network_failure_keeps_records_and_reports_failed_attempt(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            cache = root / "remote-publications.json"
            output = root / "publications.json"
            work = {"title": "Saved work", "year": 2025, "doi": "10.1234/saved"}
            cache.write_text(json.dumps({"Crossref": {"checked": "2026-01-01", "items": [work]}}))
            output.write_text('{"updated":"2026-01-01","publications":[]}')
            with patch.object(p, "DATA", root), patch.object(p, "get_json", side_effect=URLError("offline")):
                p.run(refresh=True)
            saved = json.loads(cache.read_text())
            result = json.loads(output.read_text())
            self.assertEqual(saved["Crossref"]["items"], [work])
            self.assertEqual(saved["Crossref"]["checked"], "2026-01-01")
            self.assertEqual(result["sourceStatus"]["Crossref"]["status"], "unavailable")
            self.assertEqual(result["sourceStatus"]["Crossref"]["lastAttempt"], p.date.today().isoformat())
            self.assertEqual(result["publications"][0]["doi"], "10.1234/saved")

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
                    patch.object(p, "fetch_crossref_names", return_value=[works[0]]), \
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

    def test_name_discovery_requires_specific_identity_and_rejects_conflicting_orcid(self):
        for given, family in [("Rupesh Kumar", "Tipu"), ("R. K.", "Tipu"), ("Rupesh K", "Tipu"), ("R", "Kumar Tipu")]:
            self.assertTrue(p.matches_author({"given": given, "family": family}, allow_name=True))
        for given, family in [("Tipu", "Kumar"), ("Rupesh", "Kumar"), ("Rashid K", "Tipu"), ("R", "Tipu")]:
            self.assertFalse(p.matches_author({"given": given, "family": family}, allow_name=True))
        self.assertFalse(p.matches_author({"given": "Rupesh Kumar", "family": "Tipu",
                                          "ORCID": "https://orcid.org/0000-0000-0000-0000"}, allow_name=True))
        self.assertFalse(p.matches_author({"given": "Rupesh Kumar", "family": "Tipu"}))

    def test_name_discovery_pages_and_excludes_reviews(self):
        def work(i, kind="journal-article"):
            return {"DOI": f"10.1234/{i}", "title": [f"Title {i}"], "type": kind,
                    "author": [{"given": "Rupesh Kumar", "family": "Tipu"}],
                    "published-online": {"date-parts": [[2026, 11, 14]]}}
        responses = [
            {"status": "ok", "message": {"total-results": 1001, "next-cursor": "page-two",
                                           "items": [work(i) for i in range(1000)]}},
            {"status": "ok", "message": {"total-results": 1001, "items": [work(1000, "peer-review")]}}
        ]
        with patch.object(p, "get_json", side_effect=responses) as get:
            rows = p.fetch_crossref_names()
        self.assertEqual(len(rows), 1000)
        self.assertIn("cursor=page-two", get.call_args_list[1].args[0])
        self.assertNotIn("mailto", get.call_args_list[0].args[0])

    def test_bibtex_nested_values_and_duplicate_citation_keys(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "works.bib"
            path.write_text("@article{same,title={Newton{'}s {BPNN} model},author={Tipu, Rupesh Kumar and A, B},year={2026}}\n,"
                            "@incollection{same,title={A chapter},booktitle={A book},year=2025,doi={10.1234/a}}")
            rows = list(p.bibtex_works(path))
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]["title"], "Newton's BPNN model")
        self.assertEqual(rows[0]["authorList"], ["Rupesh Kumar Tipu", "B A"])
        self.assertEqual(rows[1]["type"], "Book chapter")
        self.assertEqual(rows[1]["venue"], "A book")

    def test_reviewed_aliases_merge_malformed_exports_only(self):
        known = {"title": "Measured SPT–σ′ study", "year": 2026, "doi": "10.1234/a"}
        malformed = {"title": "Measured SPT-[Formula: see text] study", "year": 2026}
        distinct = {"title": "Measured SPT study with added variables", "year": 2026}
        aliases = {p.title_key(malformed["title"]): known["doi"]}
        rows = p.merge_records([("CV", [known]), ("Google Scholar export", [malformed, distinct])],
                               {"dois": set(), "titles": set()}, aliases)
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]["title"], known["title"])
        self.assertEqual(rows[0]["sources"], ["CV", "Google Scholar export"])

    def test_online_date_orders_a_next_year_issue_correctly(self):
        works = [{"title": "Earlier online, next-year issue", "year": 2027, "date": "2026-11-11"},
                 {"title": "Latest online", "year": 2026, "date": "2026-11-14"}]
        rows = p.merge_records([("Crossref", works)], {"dois": set(), "titles": set()})
        self.assertEqual(rows[0]["title"], "Latest online")
        self.assertEqual(rows[1]["year"], 2027)

    def test_crossref_keeps_online_date_separate_from_issue_year(self):
        work = {"DOI": "10.1234/a", "title": ["New work"], "type": "journal-article",
                "author": [{"given": "Rupesh Kumar", "family": "Tipu"}],
                "published-online": {"date-parts": [[2026, 11, 11]]},
                "published-print": {"date-parts": [[2027, 1, 2]]}}
        row = p.crossref_row(work, allow_name=True)
        self.assertEqual(row["date"], "2026-11-11")
        self.assertEqual(row["issueYear"], 2027)
