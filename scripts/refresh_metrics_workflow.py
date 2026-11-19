"""Read optional manual Actions inputs without interpolating them into shell code."""
import os
import subprocess
import sys
from pathlib import Path


def arguments(environ):
    names = ("SCHOLAR_CITATIONS", "SCHOLAR_H_INDEX", "SCHOLAR_I10_INDEX", "SCHOLAR_SNAPSHOT_DATE")
    values = [environ.get(name, "").strip() for name in names]
    if not any(values):
        return ["--refresh"]
    if not all(values):
        raise ValueError("Supply citations, h-index, i10-index and snapshot date together, or leave all four empty.")
    return ["--set", "--citations", values[0], "--h-index", values[1],
            "--i10-index", values[2], "--date", values[3]]


if __name__ == "__main__":
    try:
        args = arguments(os.environ)
    except ValueError as error:
        raise SystemExit(str(error))
    subprocess.run([sys.executable, str(Path(__file__).with_name("update_metrics.py")), *args], check=True)
