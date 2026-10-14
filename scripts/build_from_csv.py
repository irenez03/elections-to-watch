#!/usr/bin/env python3
"""
Build docs/races.json for the election map from the data/ folder.

Inputs:
  data/races/Local Election - Yale Democracy Project - <State>.csv
      Columns: 1 U.S. House | 2 U.S. Senate | 3 Governor | 4 State Court
               5 State House/Assembly | 6 State Senate
  data/state_info.json      Registration + absentee deadlines (from vote.org) and
                            registration / election-info links per state

Usage:
  python3 scripts/build_from_csv.py            # writes docs/races.json
  python3 scripts/build_from_csv.py --check    # also prints suspected data problems
"""

import csv
import json
import re
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "data"
RACES_DIR = DATA_DIR / "races"
OUT_FILE = ROOT / "docs" / "races.json"
CSV_PREFIX = "Local Election - Yale Democracy Project - "

STATE_CODES = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
    "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
    "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
    "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
    "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH",
    "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
    "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA",
    "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD", "Tennessee": "TN",
    "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA", "Washington": "WA",
    "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY",
}

# U.S. House seats per state (2020 apportionment) — used only by --check
HOUSE_SEATS = {
    "AL": 7, "AK": 1, "AZ": 9, "AR": 4, "CA": 52, "CO": 8, "CT": 5, "DE": 1, "FL": 28, "GA": 14,
    "HI": 2, "ID": 2, "IL": 17, "IN": 9, "IA": 4, "KS": 4, "KY": 6, "LA": 6, "ME": 2, "MD": 8,
    "MA": 9, "MI": 13, "MN": 8, "MS": 4, "MO": 8, "MT": 2, "NE": 3, "NV": 4, "NH": 2, "NJ": 12,
    "NM": 3, "NY": 26, "NC": 14, "ND": 1, "OH": 15, "OK": 5, "OR": 6, "PA": 17, "RI": 2, "SC": 7,
    "SD": 1, "TN": 9, "TX": 38, "UT": 4, "VT": 1, "VA": 11, "WA": 10, "WV": 2, "WI": 8, "WY": 1,
}

# CSV column index -> (group, race key)
COLUMNS = [
    ("federal", "house"),
    ("federal", "senate"),
    ("state", "governor"),
    ("state", "court"),
    ("state", "house"),
    ("state", "senate"),
]

# Cells that mean "no race this year" rather than an actual race
PLACEHOLDER_PATTERNS = [
    r"^(n/?a|none|no races?|no elections?|no governor)\b",
    r"no election in 2026",
    r"no election or retention",
    r"no statewide voter election",
    r"no regular",
    r"governor.s election in 2026",
    r"unicameral",
    r"vary by county",
]
PLACEHOLDER_RE = re.compile("|".join(PLACEHOLDER_PATTERNS), re.IGNORECASE)

# Known copy/paste typos in the source sheets (leading character dropped, stray bracket)
TEXT_FIXES = [
    (re.compile(r"^labama\b"), "Alabama"),
    (re.compile(r"^ebraska\b"), "Nebraska"),
    (re.compile(r"^\]"), ""),
]

TITLE_SPLIT_RE = re.compile(r"\n| — | - |: ")


def clean(text):
    text = text.replace("​", "").strip()
    for pattern, repl in TEXT_FIXES:
        text = pattern.sub(repl, text)
    return text.strip()


def is_placeholder(text):
    return bool(PLACEHOLDER_RE.search(text))


def to_race(text):
    """Split a cell into a short title and the candidate details."""
    m = TITLE_SPLIT_RE.search(text)
    if not m or m.start() > 90:
        return {"title": "", "detail": text}
    title = text[:m.start()].strip()
    detail = text[m.end():].strip()
    # "Alaska — U.S. Senate: A vs B" -> title "U.S. Senate", detail "A vs B"
    m2 = re.match(r"^([^:|]{3,60}):\s+(.*)$", detail, re.S)
    if m2 and re.search(r"senate|governor|house|court|district", m2.group(1), re.I):
        title, detail = m2.group(1).strip(), m2.group(2).strip()
    detail = re.sub(r"\s*(\n|\|)\s*", " · ", detail)
    return {"title": title, "detail": detail}


def read_state_csv(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        rows = list(csv.reader(f))
    header, body = rows[0], rows[1:]
    columns = [[] for _ in range(6)]
    if len(header) == 5:
        # Alaska: State House and State Senate share one "State Legislature" column
        for row in body:
            row = row + [""] * (5 - len(row))
            for i in range(4):
                columns[i].append(row[i])
            leg = row[4]
            (columns[5] if leg.strip().lower().startswith("state senate") else columns[4]).append(leg)
    else:
        for row in body:
            row = row + [""] * (6 - len(row))
            for i in range(6):
                columns[i].append(row[i])
    return [[clean(c) for c in col if c.strip()] for col in columns]


def build():
    info = json.loads((DATA_DIR / "state_info.json").read_text())

    states, raw = {}, {}
    for path in sorted(RACES_DIR.glob(CSV_PREFIX + "*.csv")):
        name = path.stem[len(CSV_PREFIX):].strip()
        abbr = STATE_CODES.get(name)
        if not abbr:
            print(f"  ! Skipping {path.name}: unknown state name '{name}'")
            continue
        columns = read_state_csv(path)
        raw[abbr] = columns

        races = {"federal": {"senate": [], "house": []},
                 "state": {"governor": [], "court": [], "house": [], "senate": []}}
        for (group, key), cells in zip(COLUMNS, columns):
            races[group][key] = [to_race(c) for c in cells if not is_placeholder(c)]

        counts = {f"{g}_{k}": len(v) for g, d in races.items() for k, v in d.items()}
        # Governor column sometimes lists one row per ticket or other statewide offices;
        # it is still one gubernatorial race.
        counts["state_governor"] = min(counts["state_governor"], 1)

        state_info = info.get(abbr, {})
        states[abbr] = {
            "name": name,
            "races": races,
            "counts": counts,
            "registration": state_info.get("reg"),
            "absentee": state_info.get("absentee"),
            "registrationWebsite": state_info.get("registrationWebsite"),
            "electionInfoUrl": state_info.get("electionInfoUrl"),
        }

    out = {"generated": datetime.now().isoformat(timespec="seconds"),
           "generalElection": "2026-11-03",
           "states": states}
    OUT_FILE.write_text(json.dumps(out, indent=1, ensure_ascii=False))

    totals = {}
    for s in states.values():
        for k, v in s["counts"].items():
            totals[k] = totals.get(k, 0) + v
    print(f"Wrote {OUT_FILE.relative_to(ROOT)}: {len(states)} states, {sum(totals.values())} races")
    for k, v in totals.items():
        print(f"  {k:16} {v}")
    return states, raw


def check(states, raw):
    """Print columns that look wrong: copies of other columns/states, odd House counts."""
    print("\nSuspected data problems:")
    labels = ["U.S. House", "U.S. Senate", "Governor", "Court", "State House", "State Senate"]
    seen = {}
    for abbr, cols in raw.items():
        for i, cells in enumerate(cols):
            if not cells or all(is_placeholder(c) for c in cells):
                continue
            seen.setdefault(tuple(cells), []).append(f"{abbr} {labels[i]}")
    for where in seen.values():
        if len(where) > 1:
            print(f"  - identical content in: {', '.join(where)}")
    for abbr, s in sorted(states.items()):
        n = s["counts"]["federal_house"]
        if n != HOUSE_SEATS[abbr]:
            print(f"  - {abbr} U.S. House: {n} races in CSV, state has {HOUSE_SEATS[abbr]} seats")


if __name__ == "__main__":
    states, raw = build()
    if "--check" in sys.argv:
        check(states, raw)
