"""Write an Actions summary that distinguishes saved values from live checks."""
import json
import os
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read(name):
    path = ROOT / "data" / name
    return json.loads(path.read_text()) if path.exists() else {}


def report():
    catalogue, metrics = read("publications.json"), read("metrics.json")
    rows = ["## Research data refresh", "",
            f"Catalogue: **{len(catalogue.get('publications', []))} distinct works**. "
            f"Content last changed: {catalogue.get('updated', 'unavailable')}.", "",
            "| Publication source | Status | Last successful check | Saved records |",
            "| --- | --- | --- | --- |"]
    for source, status in catalogue.get("sourceStatus", {}).items():
        rows.append(f"| {source} | {status.get('status', 'unknown')} | "
                    f"{status.get('lastSuccess') or 'never'} | {status.get('records', 0)} |")
        if status.get("status") == "unavailable":
            print(f"::warning::{source} unavailable. Saved publication records were retained.")
    scholar = metrics.get("scholar", {})
    values = scholar.get("all", {})
    rows += ["", f"Scholar: **{values.get('citations', '—')} citations**, "
             f"**h-index {values.get('hIndex', '—')}**, **i10-index {values.get('i10Index', '—')}**.",
             f"Verified snapshot: {scholar.get('asOf', 'unavailable')} "
             f"({scholar.get('source', 'unavailable')}).",
             f"Automatic status: {scholar.get('status', 'unknown')}. "
             f"Last attempt: {scholar.get('lastAttempt') or 'none'}."]
    if scholar.get("status") == "unavailable":
        rows += ["", "Google Scholar was unavailable; retained the last verified figures and their original date.",
                 "A newer verified snapshot can be entered using the four optional Run workflow inputs."]
        print("::warning::Scholar unavailable. The displayed figures are the last verified snapshot, not a live refresh.")
    if os.environ.get("CACHE_SAVE_OUTCOME") == "failure":
        rows += ["", "**Saving the refreshed cache to main failed.** Review the Save refreshed data step. "
                 "The available build can still be deployed."]
        print("::warning::Could not save refreshed data to main. Review branch permissions and the save step.")
    text = "\n".join(rows) + "\n"
    if path := os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(path, "a", encoding="utf-8") as output:
            output.write(text)
    print(text)


if __name__ == "__main__":
    report()
