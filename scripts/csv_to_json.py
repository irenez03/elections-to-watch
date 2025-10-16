#!/usr/bin/env python3
"""
Convert CSV election data to JSON format for the election map.
Reads from the Elections and Logistics CSV files and generates elections.json
"""

import csv
import json
from datetime import datetime
from pathlib import Path

# State code mapping
STATE_CODES = {
    "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
    "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "District of Columbia": "DC",
    "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL",
    "Indiana": "IN", "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA",
    "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN",
    "Mississippi": "MS", "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
    "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
    "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR",
    "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC", "South Dakota": "SD",
    "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT", "Virginia": "VA",
    "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
}

def parse_elections_csv(csv_path):
    """Parse the Elections CSV and extract election data by state."""
    elections_by_state = {}
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            state_name = row.get('State', '').strip()
            if not state_name or state_name.startswith('**'):
                continue
                
            state_code = STATE_CODES.get(state_name)
            if not state_code:
                print(f"Warning: Unknown state '{state_name}'")
                continue
            
            elections = []
            
            # Check Gubernatorial
            if row.get('Gubernatorial?', '').strip().upper() == 'YES':
                elections.append({
                    "title": "Governor",
                    "date": "November 4, 2025",
                    "type": "General Election",
                    "candidates": [],
                    "stakes": "Open seat gubernatorial race.",
                    "chamberImpact": "State",
                    "competitive": True
                })
            
            # Check House of Representatives
            house_info = row.get('House of Reps?', '').strip()
            if house_info and house_info not in ['', 'N/A']:
                elections.append({
                    "title": f"U.S. House - {house_info}",
                    "date": "November 4, 2025" if "(12/02)" not in house_info else "December 2, 2025",
                    "type": "General Election" if "(12/02)" not in house_info else "Special Election",
                    "candidates": [],
                    "stakes": house_info.replace("(12/02)", "").strip(),
                    "chamberImpact": "House",
                    "competitive": True
                })
            
            # Check Referendums
            referendum_info = row.get('Statewide Referendums?', '').strip()
            if referendum_info and referendum_info not in ['', 'N/A']:
                elections.append({
                    "title": referendum_info,
                    "date": "November 4, 2025",
                    "type": "Referendum",
                    "candidates": [],
                    "stakes": "Statewide ballot measures.",
                    "chamberImpact": "State",
                    "competitive": False
                })
            
            # Check Other Relevant elections
            other_info = row.get('Other Relevant?', '').strip()
            if other_info and other_info not in ['', 'N/A']:
                # Parse multiple elections separated by commas or semicolons
                other_elections = [e.strip() for e in other_info.replace(';', ',').split(',')]
                
                for election_title in other_elections:
                    if not election_title:
                        continue
                    
                    # Determine type and chamber impact
                    title_lower = election_title.lower()
                    
                    if "mayoral" in title_lower or "mayor" in title_lower:
                        election_type = "General Election"
                        chamber = "Local"
                        competitive = True
                    elif "city council" in title_lower:
                        election_type = "General Election"
                        chamber = "Local"
                        competitive = True
                    elif "state senate" in title_lower or "state house" in title_lower or "state rep" in title_lower:
                        election_type = "General Election"
                        chamber = "State"
                        competitive = True
                    elif "ballot measure" in title_lower:
                        election_type = "Referendum"
                        chamber = "State"
                        competitive = False
                    else:
                        election_type = "General Election"
                        chamber = "Local"
                        competitive = True
                    
                    # Extract date if present
                    date = "November 4, 2025"
                    if "(11/15)" in election_title:
                        date = "November 15, 2025"
                    elif "(12/09)" in election_title:
                        date = "December 9, 2025"
                    
                    election_title = election_title.replace("(11/15)", "").replace("(12/09)", "").strip()
                    
                    elections.append({
                        "title": election_title,
                        "date": date,
                        "type": election_type,
                        "candidates": [],
                        "stakes": election_title,
                        "chamberImpact": chamber,
                        "competitive": competitive
                    })
            
            if elections:
                elections_by_state[state_code] = {
                    "stateName": state_name,
                    "elections": elections
                }
    
    return elections_by_state

def parse_logistics_csv(csv_path):
    """Parse the Logistics CSV and extract registration info."""
    logistics_by_state = {}
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        for row in reader:
            state_name = row.get('State', '').strip()
            if not state_name or state_name.startswith('**'):
                continue
            
            # Handle special cases
            if state_name.upper().startswith("DC"):
                state_code = "DC"
            else:
                # Clean state name (remove asterisks, etc.) and convert to title case
                clean_name = state_name.replace("*", "").strip()
                # Handle special formatting
                if "\n" in clean_name:
                    clean_name = clean_name.split("\n")[0].strip()
                # Convert to title case for matching
                clean_name = clean_name.title()
                state_code = STATE_CODES.get(clean_name)
            
            if not state_code:
                print(f"Warning: Unknown state in logistics '{state_name}'")
                continue
            
            registration_website = row.get('Online registration? (REQUIRES STATE ID)', '').strip()
            if not registration_website or not registration_website.startswith('http'):
                registration_website = row.get('Check registration?', '').strip()
            
            deadline = row.get('Registration Deadline', '').strip()
            
            logistics_by_state[state_code] = {
                "registrationWebsite": registration_website if registration_website.startswith('http') else "",
                "registrationDeadline": deadline if deadline else "November 4, 2025"
            }
    
    return logistics_by_state

def merge_data(elections_data, logistics_data):
    """Merge elections and logistics data."""
    merged = {}
    
    for state_code, election_info in elections_data.items():
        logistics = logistics_data.get(state_code, {})
        
        merged[state_code] = {
            "stateName": election_info["stateName"],
            "registrationWebsite": logistics.get("registrationWebsite", ""),
            "registrationDeadline": logistics.get("registrationDeadline", "November 4, 2025"),
            "elections": election_info["elections"]
        }
    
    return merged

def main():
    """Main function to convert CSV to JSON."""
    # Paths
    base_dir = Path(__file__).parent.parent
    elections_csv = base_dir / "data" / "2025 Off-Year Elections - Elections.csv"
    logistics_csv = base_dir / "data" / "2025 Off-Year Elections - Logistics.csv"
    output_json = base_dir / "docs" / "elections.json"
    web_json = base_dir / "web" / "elections.json"
    
    print(f"Reading election data from: {elections_csv}")
    print(f"Reading logistics data from: {logistics_csv}")
    
    # Parse CSV files
    elections_data = parse_elections_csv(elections_csv)
    logistics_data = parse_logistics_csv(logistics_csv)
    
    print(f"Found election data for {len(elections_data)} states")
    print(f"Found logistics data for {len(logistics_data)} states")
    
    # Merge data
    merged_data = merge_data(elections_data, logistics_data)
    
    # Create final JSON structure
    final_json = {
        "lastUpdated": datetime.now().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "electionData": merged_data
    }
    
    # Write to both locations
    for output_file in [output_json, web_json]:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(final_json, f, indent=2, ensure_ascii=False)
        print(f"✅ Written to: {output_file}")
    
    # Print summary
    print(f"\n📊 Summary:")
    print(f"   States with elections: {len(merged_data)}")
    total_elections = sum(len(state['elections']) for state in merged_data.values())
    print(f"   Total elections: {total_elections}")
    print(f"\n   States included:")
    for state_code in sorted(merged_data.keys()):
        state_name = merged_data[state_code]['stateName']
        num_elections = len(merged_data[state_code]['elections'])
        print(f"      {state_code}: {state_name} ({num_elections} election(s))")

if __name__ == "__main__":
    main()

