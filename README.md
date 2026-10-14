# Elections to Watch 2026

Interactive U.S. map of the November 3, 2026 general election: federal and state races per state, voter registration deadlines, and absentee ballot deadlines.

## Project structure

```
election_map/
├── data/
│   ├── races/              # One CSV per state (Yale Democracy Project sheets)
│   └── state_info.json     # Registration + absentee deadlines (vote.org), state links
├── docs/                   # The website (deployed to GitHub Pages)
│   ├── index.html
│   ├── script.js
│   ├── style.css
│   ├── races.json          # Generated — do not edit by hand
│   └── favicon / logo images
├── scripts/
│   └── build_from_csv.py   # data/ → docs/races.json
└── .github/workflows/pages.yml
```

## State CSV format

Files are named `Local Election - Yale Democracy Project - <State>.csv`, with columns:

| # | Column | Shown as |
|---|--------|----------|
| 1 | House Representative Races | Federal · House |
| 2 | Senate Races | Federal · Senate |
| 3 | Gubernational Races | State · Governor |
| 4 | State Court | State · Court |
| 5 | State Assembly | State · House |
| 6 | State Senate | State · Senate |

One race per row. Cells like "N/A", "No Race" or "No election in 2026" are treated as no race.

## Updating the data

1. Export the updated sheets into `data/races/` (or edit `data/state_info.json`).
2. Rebuild the site data (Python 3, no dependencies):
   ```
   python3 scripts/build_from_csv.py --check
   ```
   `--check` also lists suspicious columns (copies of another state's data, U.S. House counts that don't match the number of seats).
3. Preview locally:
   ```
   python3 -m http.server 8000 --directory docs
   ```
   then open http://localhost:8000.
4. Commit and push to `main` — GitHub Pages deploys the `docs/` folder.

*Please contact irene.zheng@yale.edu with any questions/suggestions!*
