#!/usr/bin/env python3
"""
Test script to verify CSV data is being loaded correctly
"""

import csv

def test_csv_loading():
    """Test loading logistics data from CSV."""
    print("Testing CSV data loading...")
    print("=" * 80)
    
    logistics_csv = "2025 Off-Year Elections - Logistics.csv"
    
    state_election_sites = {}
    state_registration_sites = {}
    registration_deadlines = {}
    
    try:
        with open(logistics_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            
            # Print CSV headers
            print("\nCSV Headers:")
            print(reader.fieldnames)
            print()
            
            row_count = 0
            for row in reader:
                state_name = row.get('State', '').strip()
                
                # Skip empty rows
                if not state_name or state_name.startswith('**'):
                    continue
                
                row_count += 1
                
                # Get URLs
                elections_site = row.get('Elections website?', '').strip()
                registration_site = row.get('Check registration?', '').strip()
                deadline = row.get('Registration Deadline', '').strip()
                
                # Store data
                if elections_site and elections_site.startswith('http'):
                    state_election_sites[state_name] = elections_site
                if registration_site and registration_site.startswith('http'):
                    state_registration_sites[state_name] = registration_site
                if deadline:
                    registration_deadlines[state_name] = deadline
                
                # Print first few for verification
                if row_count <= 5:
                    print(f"\nState: {state_name}")
                    print(f"  Elections Website: {elections_site[:60]}..." if len(elections_site) > 60 else f"  Elections Website: {elections_site}")
                    print(f"  Registration Website: {registration_site[:60]}..." if len(registration_site) > 60 else f"  Registration Website: {registration_site}")
                    print(f"  Registration Deadline: {deadline}")
        
        print("\n" + "=" * 80)
        print(f"\nTotal states processed: {row_count}")
        print(f"States with election websites: {len(state_election_sites)}")
        print(f"States with registration websites: {len(state_registration_sites)}")
        print(f"States with deadlines: {len(registration_deadlines)}")
        
        # Show all states with election websites
        print("\n" + "=" * 80)
        print("\nAll states with election websites:")
        for i, (state, url) in enumerate(state_election_sites.items(), 1):
            print(f"{i}. {state}: {url}")
        
        print("\n✓ CSV loading test completed successfully!")
        
    except Exception as e:
        print(f"\n✗ Error loading CSV: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_csv_loading()

