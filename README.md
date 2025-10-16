# Interactive Election Map - 2025

An interactive U.S. election map that displays comprehensive election information for each state, including candidates, registration deadlines, and what's at stake in each race for the 2025 elections.

## Project Structure

```
election_map/
├── electionstowatch/          # Main web application
│   ├── index.html            # Main HTML file
│   ├── script.js             # JavaScript for map interactivity
│   ├── style.css             # Styling
│   └── elections.json        # Election data (auto-updated)
├── election_scraper.py       # Basic web scraper
├── advanced_election_scraper.py  # Comprehensive scraper
├── run_scraper.py            # Automation script
├── update_elections.sh       # Easy update script
├── requirements.txt          # Python dependencies
└── README.md                # This file
```

### Data Sources

- **Ballotpedia**: Primary source for election information
- **State Websites**: Registration and deadline information
- **FEC Data**: Candidate and race information (future enhancement)

### Browser Compatibility

- **Chrome**: Recommended for web scraping
- **All modern browsers**: For viewing the map

*Please contact irene.zheng@yale.edu with any questions/suggestions!*
