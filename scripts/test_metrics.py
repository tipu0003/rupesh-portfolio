"""Regression checks for identified metrics and safe unavailable-source handling."""
from copy import deepcopy
from datetime import datetime, timezone
import json
from pathlib import Path
import tempfile
import unittest
from urllib.error import HTTPError

from update_metrics import (DATA, PROFILE_URL, MetricsUnavailable, check_robots, parse_profile, robots_allows,
                            refresh, set_manual, validate_snapshot, write_json)


def page(name="Dr. Rupesh Kumar Tipu", all_label="All", values=None):
    values = values or [("i10-index", "31", "31"), ("Citations", "1,218", "1,211"), ("h-index", "23", "23")]
    rows = "".join(f'<tr><td><a>{label}</a></td><td>{total}</td><td>{recent}</td></tr>'
                   for label, total, recent in values)
    return f'''<html><body><div id="gsc_prf_in">{name}</div>
        <table id="gsc_rsb_st"><thead><tr><th></th><th>{all_label}</th><th>Since 2021</th></tr></thead>
        <tbody>{rows}</tbody></table></body></html>'''


class MetricsTests(unittest.TestCase):
    def setUp(self):
        self.data = json.loads(DATA.read_text(encoding="utf-8"))
        self.data["scholar"]["asOf"] = "2026-11-19"
        self.now = datetime(2026, 11, 19, 22, 30, tzinfo=timezone.utc)

    def test_rows_are_matched_by_label_and_columns_by_header(self):
        result = parse_profile(page(), PROFILE_URL)
        self.assertEqual(result["all"], {"citations": 1218, "hIndex": 23, "i10Index": 31})
        self.assertEqual(result["recent"]["citations"], 1211)
        self.assertEqual(result["recent"]["since"], 2021)
        # Reversed numeric columns must follow their headers, not fixed positions.
        reversed_html = page().replace("<th>All</th><th>Since 2021</th>", "<th>Since 2021</th><th>All</th>")
        reversed_html = reversed_html.replace("<td>1,218</td><td>1,211</td>", "<td>1,211</td><td>1,218</td>")
        self.assertEqual(parse_profile(reversed_html, PROFILE_URL), result)

    def test_wrong_identity_redirect_and_interactive_check_rejected(self):
        for html, url in (
            (page(name="Another Scientist"), PROFILE_URL),
            (page(), PROFILE_URL.replace("uZzLU8IAAAAJ", "wrong")),
            (page(), "https://scholar.google.com/sorry/"),
            (page() + '<div class="g-recaptcha"></div>', PROFILE_URL),
        ):
            with self.subTest(url=url, html=html[:50]), self.assertRaises(MetricsUnavailable):
                parse_profile(html, url)

    def test_automated_access_rules_are_respected(self):
        class Response:
            url = "https://scholar.google.com/robots.txt"
            def __init__(self, body): self.body = body
            def __enter__(self): return self
            def __exit__(self, *args): return False
            def read(self, limit): return self.body[:limit]
        # Scholar lists its broad Disallow before the more specific Allow.
        allowed = b"User-agent: *\nDisallow: /citations?\nAllow: /citations?user=\n"
        check_robots(lambda *args, **kwargs: Response(allowed))
        denied = b"User-agent: *\nDisallow: /citations\n"
        with self.assertRaises(MetricsUnavailable):
            check_robots(lambda *args, **kwargs: Response(denied))
        with self.assertRaises(MetricsUnavailable):
            check_robots(lambda *args, **kwargs: Response(b"<html>Access check</html>"))

    def test_actual_scholar_robots_order_and_wildcard_exclusions(self):
        rules = """User-agent: *
Disallow: /search
Disallow: /index.html
Disallow: /scholar
Disallow: /citations?
Allow: /citations?user=
Disallow: /citations?*cstart=
Disallow: /citations?user=*%40
Disallow: /citations?user=*@
Allow: /citations?view_op=list_classic_articles
Allow: /citations?view_op=mandates_leaderboard
Allow: /citations?view_op=metrics_intro
Allow: /citations?view_op=new_profile
Allow: /citations?view_op=sitemap
Allow: /citations?view_op=top_venues

User-agent: Twitterbot
Disallow:

User-agent: facebookexternalhit
Disallow:

User-agent: PetalBot
Disallow: /
"""
        self.assertTrue(robots_allows(rules, PROFILE_URL))
        for url in (PROFILE_URL + "&cstart=20", "https://scholar.google.com/citations?cstart=20",
                    "https://scholar.google.com/citations?user=name%40example.com",
                    "https://scholar.google.com/citations?user=name@example.com",
                    "https://scholar.google.com/citations?view_op=search_authors"):
            with self.subTest(url=url):
                self.assertFalse(robots_allows(rules, url))
        self.assertFalse(robots_allows(rules, PROFILE_URL, "PetalBot/1.0"))
        self.assertTrue(robots_allows(rules, PROFILE_URL, "Twitterbot/1.0"))

    def test_robots_end_anchor_equal_tie_and_combined_bot_groups(self):
        rules = "User-agent: *\nDisallow: /citations\nAllow: /citations?user=allowed$\n"
        self.assertTrue(robots_allows(rules, "https://scholar.google.com/citations?user=allowed"))
        self.assertFalse(robots_allows(rules, "https://scholar.google.com/citations?user=allowed&cstart=20"))
        tie = "User-agent: *\nDisallow: /citations\nAllow: /citations\n"
        self.assertTrue(robots_allows(tie))
        groups = """User-agent: *
Disallow: /
User-agent: AcademicPortfolio
Disallow: /citations
User-agent: AcademicPortfolio
Allow: /citations?user=
"""
        self.assertTrue(robots_allows(groups))
        self.assertFalse(robots_allows(groups, "https://scholar.google.com/citations?cstart=20"))

    def test_missing_malformed_duplicate_or_inconsistent_metrics_rejected(self):
        for html in (
            page(all_label="Since 2020"),
            page(values=[("Citations", "1218", "1211")]),
            page().replace("1,218", "1.2k"),
            page().replace("1,218", "0"),
            page().replace("1,211", "1,219"),
            page().replace("</tbody>", "<tr><td>h-index</td><td>23</td><td>23</td></tr></tbody>"),
        ):
            with self.subTest(html=html[:90]), self.assertRaises(MetricsUnavailable):
                parse_profile(html, PROFILE_URL)

    def test_blocked_refresh_keeps_verified_snapshot_and_last_success(self):
        self.data["scholar"]["lastSuccess"] = "2026-11-10T02:17:00Z"
        original = deepcopy(self.data)
        def blocked():
            raise HTTPError(PROFILE_URL, 429, "Too Many Requests", {}, None)
        result = refresh(self.data, fetcher=blocked, now=self.now)
        self.assertEqual(self.data, original, "Refresh must not mutate the original object")
        for key in ("all", "recent", "asOf", "source", "lastSuccess"):
            self.assertEqual(result["scholar"][key], original["scholar"][key])
        self.assertEqual(result["scholar"]["status"], "unavailable")
        self.assertEqual(result["scholar"]["lastAttempt"], "2026-11-19T22:30:00Z")
        self.assertIn("HTTP 429", result["scholar"]["error"])
        self.assertEqual(result["scopus"], original["scopus"])

    def test_success_updates_provenance_and_india_snapshot_date(self):
        result = refresh(self.data, fetcher=lambda: parse_profile(page(), PROFILE_URL), now=self.now)
        self.assertEqual(result["scholar"]["asOf"], "2026-11-20")
        self.assertEqual(result["scholar"]["source"], "Google Scholar public profile")
        self.assertEqual(result["scholar"]["lastSuccess"], "2026-11-19T22:30:00Z")
        self.assertEqual(result["scholar"]["status"], "ok")
        self.assertIsNone(result["scholar"]["error"])

    def test_manual_update_validates_values_date_and_clears_unverified_recent(self):
        result = set_manual(self.data, 1220, 23, 31, "2026-11-19")
        self.assertEqual(result["scholar"]["all"]["citations"], 1220)
        self.assertIsNone(result["scholar"]["recent"])
        self.assertEqual(result["scholar"]["source"], "Manual Google Scholar update")
        self.assertEqual(result["scopus"], self.data["scopus"])
        for values in ((-1, 23, 31, "2026-11-19"), (10, 23, 31, "2026-11-19"),
                       (1218, 23, 5, "2026-11-19"), (1218, 23, 31, "2099-01-01"),
                       (1218, 23, 31, "2026-11-18"),
                       (1218, 23, 31, "not-a-date")):
            with self.subTest(values=values), self.assertRaises(ValueError):
                set_manual(self.data, *values)

    def test_offline_validation_and_repeat_write_are_stable(self):
        validate_snapshot(self.data)
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "metrics.json"
            write_json(path, self.data)
            before = path.stat().st_mtime_ns
            write_json(path, self.data)
            self.assertEqual(path.stat().st_mtime_ns, before)
            self.assertEqual(json.loads(path.read_text()), self.data)


if __name__ == "__main__":
    unittest.main()
