#!/usr/bin/env python3
"""Validate saved metrics, or attempt one public Google Scholar profile refresh.

Scholar has no supported public metrics API. A blocked or changed page preserves
the last verified snapshot and its date; it never supplies zeroes as a fallback.
"""
import argparse
from copy import deepcopy
from datetime import date, datetime, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import tempfile
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlsplit
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo


DATA = Path(__file__).resolve().parents[1] / "data" / "metrics.json"
PROFILE_ID = "uZzLU8IAAAAJ"
PROFILE_URL = f"https://scholar.google.com/citations?user={PROFILE_ID}&hl=en"
USER_AGENT = "AcademicPortfolio/2.0"
KEYS = {"citations": "citations", "h-index": "hIndex", "i10-index": "i10Index"}


class MetricsUnavailable(ValueError):
    """The response is not a complete, identified Scholar metrics page."""


class Element:
    def __init__(self, tag, attrs=()):
        self.tag, self.attrs, self.parts = tag, dict(attrs), []

    def text(self):
        return " ".join(" ".join(p.text() if isinstance(p, Element) else p
                                 for p in self.parts).split())

    def find_all(self, tag=None, id=None):
        found = []
        if (tag is None or self.tag == tag) and (id is None or self.attrs.get("id") == id):
            found.append(self)
        for child in self.parts:
            if isinstance(child, Element):
                found.extend(child.find_all(tag, id))
        return found


class ProfileParser(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Element("document")
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Element(tag, attrs)
        self.stack[-1].parts.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].parts.append(Element(tag, attrs))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                self.stack = self.stack[:i]
                break

    def handle_data(self, value):
        self.stack[-1].parts.append(value)


def validate_values(values):
    for key in KEYS.values():
        value = values.get(key)
        if type(value) is not int or not 0 <= value <= 1_000_000_000:
            raise ValueError(f"Invalid Scholar value for {key}.")
    citations, h_index, i10_index = (values[k] for k in KEYS.values())
    if h_index * h_index > citations or i10_index * 10 > citations:
        raise ValueError("Scholar indices are inconsistent with the citation total.")
    if (h_index >= 10 and i10_index < h_index) or (i10_index >= 10 and h_index < 10):
        raise ValueError("Scholar h-index and i10-index are inconsistent.")


def validate_snapshot(data):
    if data.get("version") != 1:
        raise ValueError("Unsupported metrics format.")
    scholar = data["scholar"]
    if scholar.get("profileId") != PROFILE_ID:
        raise ValueError("Metrics belong to another Scholar profile.")
    date.fromisoformat(scholar["asOf"])
    validate_values(scholar["all"])
    recent = scholar.get("recent")
    if recent is not None:
        validate_values(recent)
        if type(recent.get("since")) is not int or not 1900 <= recent["since"] <= 2100:
            raise ValueError("Invalid recent citation period.")
        if any(recent[k] > scholar["all"][k] for k in KEYS.values()):
            raise ValueError("Recent metrics exceed the all-time metrics.")


def parse_profile(page, response_url):
    url = urlsplit(response_url)
    if (url.scheme != "https" or url.hostname != "scholar.google.com"
            or url.path != "/citations"
            or parse_qs(url.query).get("user") != [PROFILE_ID]):
        raise MetricsUnavailable("Scholar returned a different page or profile.")
    if re.search(r"unusual traffic|g-recaptcha|recaptcha/api|not a robot", page, re.I):
        raise MetricsUnavailable("Google Scholar requires an interactive access check.")
    parser = ProfileParser()
    parser.feed(page)
    names = parser.root.find_all(id="gsc_prf_in")
    name = names[0].text() if len(names) == 1 else ""
    normalized = re.sub(r"[^a-z]+", " ", name.lower()).strip()
    if normalized not in {"dr rupesh kumar tipu", "rupesh kumar tipu"}:
        raise MetricsUnavailable("Could not verify the Scholar profile name.")
    tables = parser.root.find_all("table", "gsc_rsb_st")
    if len(tables) != 1:
        raise MetricsUnavailable("The Scholar metrics table was not available.")
    rows = tables[0].find_all("tr")
    header = next((row.find_all("th") for row in rows if row.find_all("th")), [])
    columns = [cell.text().casefold() for cell in header]
    if columns.count("all") != 1:
        raise MetricsUnavailable("Could not identify the all-time Scholar column.")
    all_column = columns.index("all")
    recent_columns = [(i, int(match.group(1))) for i, text in enumerate(columns)
                      if (match := re.fullmatch(r"since (\d{4})", text))]
    if len(recent_columns) != 1:
        raise MetricsUnavailable("Could not identify the recent Scholar column.")
    recent_column, since = recent_columns[0]
    all_values, recent_values = {}, {"since": since}
    for row in rows:
        cells = row.find_all("td")
        if not cells:
            continue
        label = cells[0].text().casefold()
        key = KEYS.get(label)
        if key is None:
            continue
        if key in all_values or len(cells) != len(columns):
            raise MetricsUnavailable("The Scholar metrics rows are incomplete or duplicated.")
        for column, values in ((all_column, all_values), (recent_column, recent_values)):
            raw = cells[column].text()
            if not re.fullmatch(r"(?:0|[1-9]\d*|[1-9]\d{0,2}(?:,\d{3})+)", raw):
                raise MetricsUnavailable("Scholar returned a missing or invalid metric.")
            values[key] = int(raw.replace(",", ""))
    try:
        validate_values(all_values)
        validate_values(recent_values)
        if any(recent_values[k] > all_values[k] for k in KEYS.values()):
            raise ValueError("Recent values exceed all-time values.")
    except ValueError as error:
        raise MetricsUnavailable(str(error)) from error
    return {"name": name, "all": all_values, "recent": recent_values}


def normalized_robots_path(path):
    """Normalize unreserved escapes and UTF-8 while preserving reserved escapes."""
    unreserved = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~"
    def normalize_escape(match):
        character = chr(int(match.group(1), 16))
        return character if character in unreserved else "%" + match.group(1).upper()
    path = re.sub(r"%([0-9a-fA-F]{2})", normalize_escape, path)
    return "".join(character if ord(character) < 128
                   else "".join(f"%{octet:02X}" for octet in character.encode("utf-8"))
                   for character in path)


def robots_allows(rules, target_url=PROFILE_URL, user_agent=USER_AGENT):
    """Apply the longest matching robots path, with Allow winning an equal tie.

    The stdlib parser uses the first matching line and cannot handle Scholar's
    wildcard exclusions. This evaluator combines matching user-agent groups and
    supports the RFC 9309 wildcard and end-of-path operators. Unreadable rules
    or an unknown applicable policy fail closed instead of authorizing a fetch.
    """
    groups, agents, paths = [], [], []
    saw_rule = False
    for raw in rules.splitlines():
        line = raw.split("#", 1)[0].strip().lstrip("\ufeff")
        if not line or ":" not in line:
            continue
        directive, value = (part.strip() for part in line.split(":", 1))
        directive = directive.casefold()
        if directive == "user-agent":
            if saw_rule:
                groups.append((agents, paths))
                agents, paths, saw_rule = [], [], False
            if not value or not re.fullmatch(r"[A-Za-z0-9_*.-]+", value):
                raise MetricsUnavailable("Could not verify Scholar's automated access rules.")
            agents.append(value.casefold())
        elif directive in {"allow", "disallow"}:
            if not agents:
                raise MetricsUnavailable("Could not verify Scholar's automated access rules.")
            saw_rule = True
            paths.append((directive == "allow", value))
    if agents:
        groups.append((agents, paths))
    product = user_agent.split("/", 1)[0].casefold()
    applicable = [paths for agents, paths in groups if product in agents]
    if not applicable:
        applicable = [paths for agents, paths in groups if "*" in agents]
    if not applicable:
        raise MetricsUnavailable("Could not verify Scholar's automated access rules.")
    url = urlsplit(target_url)
    target = normalized_robots_path((url.path or "/") + ("?" + url.query if url.query else ""))
    matches = []
    for group in applicable:
        for allowed, path in group:
            if not path:
                continue  # An empty Disallow does not block anything.
            if not path.startswith("/") or len(path) > 4096 or path.count("*") > 32:
                raise MetricsUnavailable("Could not verify Scholar's automated access rules.")
            path = normalized_robots_path(path)
            anchored = path.endswith("$")
            body = path[:-1] if anchored else path
            expression = "^" + ".*".join(re.escape(part) for part in body.split("*"))
            if anchored:
                expression += "$"
            if re.search(expression, target):
                # '*' and the end marker are operators, not literal path bytes.
                specificity = len(body.replace("*", "").encode("utf-8"))
                matches.append((specificity, allowed))
    return max(matches)[1] if matches else True


def check_robots(fetcher=urlopen):
    """Only request the profile when the service permits this URL for this bot."""
    robots_url = "https://scholar.google.com/robots.txt"
    request = Request(robots_url, headers={"User-Agent": USER_AGENT})
    with fetcher(request, timeout=15) as response:
        if response.url != robots_url:
            raise MetricsUnavailable("Could not verify Scholar's automated access rules.")
        content = response.read(250_001)
        if len(content) > 250_000:
            raise MetricsUnavailable("Could not verify Scholar's automated access rules.")
        rules = content.decode("utf-8", errors="replace")
    if not robots_allows(rules):
        raise MetricsUnavailable("Scholar's access rules do not permit this profile request.")


def fetch_profile():
    check_robots()
    request = Request(PROFILE_URL, headers={
        "Accept": "text/html", "Accept-Language": "en",
        "User-Agent": USER_AGENT,
    })
    # One normal request, without proxy rotation, CAPTCHA workarounds or retries.
    with urlopen(request, timeout=25) as response:
        content = response.read(1_000_001)
        if len(content) > 1_000_000:
            raise MetricsUnavailable("Scholar returned an unexpectedly large page.")
        return parse_profile(content.decode("utf-8", errors="replace"), response.url)


def refresh(data, fetcher=fetch_profile, now=None):
    validate_snapshot(data)
    now = now or datetime.now(timezone.utc)
    result = deepcopy(data)
    scholar = result["scholar"]
    stamp = now.astimezone(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    scholar["lastAttempt"] = stamp
    try:
        observed = fetcher()
        candidate = deepcopy(result)
        candidate["scholar"].update(observed)
        candidate["scholar"].update({
            "asOf": now.astimezone(ZoneInfo("Asia/Kolkata")).date().isoformat(),
            "source": "Google Scholar public profile",
            "lastSuccess": stamp, "status": "ok", "error": None,
        })
        validate_snapshot(candidate)
        return candidate
    except (HTTPError, URLError, TimeoutError, OSError, ValueError) as error:
        if isinstance(error, HTTPError):
            detail = f"Google Scholar returned HTTP {error.code}."
        elif isinstance(error, MetricsUnavailable):
            detail = str(error)
        elif isinstance(error, (TimeoutError, URLError, OSError)):
            detail = "The public Scholar profile could not be reached."
        else:
            detail = "The public Scholar response did not contain valid metrics."
        scholar.update({"status": "unavailable", "error": detail})
        return result


def set_manual(data, citations, h_index, i10_index, snapshot_date):
    parsed_date = date.fromisoformat(snapshot_date)
    if parsed_date > datetime.now(ZoneInfo("Asia/Kolkata")).date():
        raise ValueError("The snapshot date cannot be in the future.")
    if parsed_date < date.fromisoformat(data["scholar"]["asOf"]):
        raise ValueError("The snapshot date cannot be older than the saved verified snapshot.")
    result = deepcopy(data)
    result["scholar"].update({
        "all": {"citations": citations, "hIndex": h_index, "i10Index": i10_index},
        # A three-number update does not verify the recent-period values.
        "recent": None, "asOf": parsed_date.isoformat(),
        "source": "Manual Google Scholar update", "status": "manual", "error": None,
    })
    validate_snapshot(result)
    return result


def write_json(path, data):
    encoded = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == encoded:
        return
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as out:
        out.write(encoded)
        temporary = Path(out.name)
    temporary.chmod(0o644)
    temporary.replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--refresh", action="store_true")
    mode.add_argument("--set", action="store_true", help="Save a manually verified Scholar snapshot")
    parser.add_argument("--citations", type=int)
    parser.add_argument("--h-index", type=int)
    parser.add_argument("--i10-index", type=int)
    parser.add_argument("--date", help="Date of the manually verified snapshot, YYYY-MM-DD")
    args = parser.parse_args()
    values = (args.citations, args.h_index, args.i10_index, args.date)
    if args.set and any(value is None for value in values):
        parser.error("--set requires --citations, --h-index, --i10-index and --date")
    if not args.set and any(value is not None for value in values):
        parser.error("Manual values require --set")
    try:
        data = json.loads(DATA.read_text(encoding="utf-8"))
        validate_snapshot(data)
        if args.set:
            data = set_manual(data, *values)
        elif args.refresh:
            data = refresh(data)
        write_json(DATA, data)
    except (ValueError, KeyError) as error:
        parser.error(str(error))
    scholar = data["scholar"]
    if args.refresh and scholar["status"] == "unavailable":
        print(f"::warning::{scholar['error']} Retaining the verified {scholar['asOf']} snapshot.")
    else:
        print(f"Scholar metrics: {scholar['all']} · verified {scholar['asOf']} · {scholar['status']}")


if __name__ == "__main__":
    main()
