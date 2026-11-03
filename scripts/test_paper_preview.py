"""Regression coverage for featured-paper identity, ordering and the text-only fallback."""
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import build_site
from paper_preview import matching_article, preview_path, recent_papers


def sample(title, doi, date):
    return {"title": title, "doi": doi, "date": date, "url": "https://doi.org/" + doi, "venue": "Journal"}


class PaperPreviewTests(unittest.TestCase):
    def test_sorting_and_duplicate_identifier(self):
        old = sample("First paper", "10.1000/A", "2025-12-12")
        new = sample("Latest paper", "10.1000/b", "2026-01")
        other = sample("Another paper", "10.1000/c", "2026-01-14")
        self.assertEqual(recent_papers([old, new, other, dict(old, doi="10.1000/a")]), [other, new, old])

    def test_reject_mismatched_journal_page(self):
        self.assertTrue(matching_article("Load–settlement curves", "10.1000/a", "Load-settlement curves", "https://doi.org/10.1000/A"))
        self.assertFalse(matching_article("A paper", "10.1000/a", "Access denied", "10.1000/a"))
        self.assertFalse(matching_article("A paper", "10.1000/a", "A paper", "10.1000/b"))

    def test_new_paper_never_inherits_previous_screenshot(self):
        old = sample("Old paper", "10.1000/a", "2025")
        new = sample("Latest paper", "10.1000/b", "2026")
        self.assertNotEqual(preview_path(old), preview_path(new))
        with tempfile.TemporaryDirectory() as directory, patch.object(build_site, "ROOT", Path(directory)):
            preview = Path(directory) / preview_path(old)
            preview.parent.mkdir(parents=True)
            preview.touch()
            self.assertIn("<img ", build_site.publication_highlights([old]))
            output = build_site.publication_highlights([old, new])
            self.assertNotIn("<img ", output)
            self.assertIn("Latest paper", output)
            self.assertNotIn(str(preview_path(old)), output)
