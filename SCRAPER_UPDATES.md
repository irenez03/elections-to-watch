# Scraper Updates - CSV Integration

## Summary

The election scrapers have been updated to read state election websites and logistics information directly from the **`2025 Off-Year Elections - Logistics.csv`** file instead of using hardcoded URLs.

## What Changed

### 1. **election_scraper.py**
- Added CSV import
- Added `load_logistics_data()` method to read from CSV
- Updated to load:
  - State election websites from "Elections website?" column
  - Registration check websites from "Check registration?" column  
  - Registration deadlines from "Registration Deadline" column
- Updated `calculate_registration_deadline()` to use CSV data
- Added command-line options to choose scraping sources
- Added DC (District of Columbia) to state mappings

### 2. **advanced_election_scraper.py**
- Added CSV import
- Added `load_logistics_data()` method
- Updated to load same data from CSV
- Updated `calculate_registration_deadline()` to use CSV data
- Registration sites from CSV will override hardcoded ones
- Added DC (District of Columbia) to state mappings

### 3. **test_csv_loading.py** (New File)
- Test script to verify CSV data is being loaded correctly
- Shows all loaded state websites and statistics

## CSV Data Loaded

From the **`2025 Off-Year Elections - Logistics.csv`** file:
- ✅ **51 states** with election websites
- ✅ **49 states** with registration check websites
- ✅ **50 states** with registration deadlines

## How to Use

### Basic Usage (State Sites Only)
By default, the scraper will now scrape from state election websites listed in the CSV:

```bash
python3 election_scraper.py
```

### Scrape from Ballotpedia Only
```bash
python3 election_scraper.py --ballotpedia
```

### Scrape from Both Sources
```bash
python3 election_scraper.py --all
```

### Help
```bash
python3 election_scraper.py --help
```

## Test the CSV Loading

To verify the CSV data is being loaded correctly:

```bash
python3 test_csv_loading.py
```

This will show:
- CSV headers
- Sample state data
- Total counts
- All states with election websites

## Benefits

1. **Easy Updates**: Simply update the CSV file to change websites - no code changes needed
2. **Accurate Deadlines**: Registration deadlines are now state-specific from the CSV
3. **Comprehensive**: Uses official state election websites from your research
4. **Flexible**: Can still use Ballotpedia or combine sources

## Technical Details

### State Name Handling
The scraper handles special cases:
- **DC (District of Columbia)** - properly mapped to "DC" code
- **State names with asterisks** (like "ALASKA*") - asterisks are stripped
- **Empty rows** - skipped automatically

### CSV Column Mapping
- `State` → State name
- `Elections website?` → Main election information website
- `Check registration?` → Voter registration check website  
- `Registration Deadline` → Deadline date

### Data Priority
- If a URL is in the CSV, it will be used
- If not in CSV, falls back to hardcoded defaults (for registration sites)
- Deadlines from CSV are preferred; calculated default used as fallback

## Files Modified

1. ✅ `election_scraper.py` - Main scraper
2. ✅ `advanced_election_scraper.py` - Advanced scraper
3. ✅ `test_csv_loading.py` - New test file (created)

## Next Steps

You can now:
1. Run the scraper with state websites: `python3 election_scraper.py`
2. Update any URLs in the CSV file as needed
3. Test changes with: `python3 test_csv_loading.py`

The scraper will automatically use the latest information from the CSV file!

