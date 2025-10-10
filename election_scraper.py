#!/usr/bin/env python3
"""
Election Data Web Scraper
Automatically scrapes election information from various sources and updates the elections.json file.
"""

import json
import time
import re
import csv
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import requests
from bs4 import BeautifulSoup

class ElectionScraper:
    def __init__(self, headless=True, logistics_csv="2025 Off-Year Elections - Logistics.csv"):
        """Initialize the scraper with Chrome WebDriver."""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        
        # Load state election websites from CSV
        self.state_election_sites = {}
        self.state_registration_sites = {}
        self.registration_deadlines = {}
        self.load_logistics_data(logistics_csv)
        
        # State names mapping
        self.state_names = {
            "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
            "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia",
            "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois",
            "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana",
            "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota",
            "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
            "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
            "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon",
            "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota",
            "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia",
            "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
        }
    
    def load_logistics_data(self, logistics_csv):
        """Load state election websites and logistics data from CSV."""
        try:
            with open(logistics_csv, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    state_name = row.get('State', '').strip()
                    
                    # Skip empty rows
                    if not state_name or state_name.startswith('**'):
                        continue
                    
                    # Handle special cases like "DC (District of Columbia)"
                    if state_name == "DC (District of Columbia)":
                        state_code = "DC"
                    else:
                        # Convert state name to code
                        state_code = self.get_state_code(state_name)
                    
                    if state_code:
                        # Store elections website
                        elections_site = row.get('Elections website?', '').strip()
                        if elections_site and elections_site.startswith('http'):
                            self.state_election_sites[state_code] = elections_site
                        
                        # Store registration check website
                        registration_site = row.get('Check registration?', '').strip()
                        if registration_site and registration_site.startswith('http'):
                            self.state_registration_sites[state_code] = registration_site
                        
                        # Store registration deadline
                        deadline = row.get('Registration Deadline', '').strip()
                        if deadline:
                            self.registration_deadlines[state_code] = deadline
            
            print(f"Loaded logistics data for {len(self.state_election_sites)} states")
            print(f"Sample election sites: {list(self.state_election_sites.items())[:3]}")
            
        except Exception as e:
            print(f"Error loading logistics data from CSV: {e}")
            print(f"Using empty dictionaries - scraper may not work properly")

    def scrape_ballotpedia_elections(self):
        """Scrape election data from Ballotpedia."""
        print("Scraping Ballotpedia for 2024 elections...")
        
        # Navigate to Ballotpedia's 2024 elections page
        self.driver.get("https://ballotpedia.org/2024_elections")
        
        elections_data = {}
        
        try:
            # Wait for the page to load
            self.wait.until(EC.presence_of_element_located((By.CLASS_NAME, "mw-content-ltr")))
            
            # Look for state-specific election information
            state_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, '/2024_elections') and contains(text(), 'elections')]")
            
            for link in state_links[:5]:  # Limit to first 5 for testing
                try:
                    state_text = link.text
                    if "elections" in state_text.lower():
                        state_name = state_text.replace(" elections", "").replace(" Elections", "")
                        state_code = self.get_state_code(state_name)
                        
                        if state_code:
                            print(f"Processing {state_name} ({state_code})...")
                            link.click()
                            time.sleep(2)
                            
                            # Extract election data from the state page
                            state_elections = self.extract_state_elections(state_code)
                            if state_elections:
                                elections_data[state_code] = state_elections
                            
                            # Go back to main page
                            self.driver.back()
                            time.sleep(1)
                            
                except Exception as e:
                    print(f"Error processing state link: {e}")
                    continue
                    
        except TimeoutException:
            print("Timeout waiting for Ballotpedia page to load")
        
        return elections_data

    def extract_state_elections(self, state_code):
        """Extract election information from a state's Ballotpedia page."""
        try:
            elections = []
            
            # Look for election sections
            election_sections = self.driver.find_elements(By.XPATH, "//h2[contains(text(), 'Elections') or contains(text(), 'Races')]")
            
            for section in election_sections:
                try:
                    # Get the section title
                    title = section.text
                    
                    # Look for candidate information in the following content
                    next_elements = section.find_elements(By.XPATH, "./following-sibling::*")
                    
                    candidates = []
                    date = "November 5, 2024"  # Default to general election date
                    
                    for element in next_elements[:10]:  # Limit search to next 10 elements
                        if element.tag_name in ['h2', 'h3']:
                            break  # Stop at next section
                            
                        text = element.text.lower()
                        if any(keyword in text for keyword in ['candidate', 'running', 'incumbent']):
                            # Extract candidate names and parties
                            candidate_info = self.extract_candidate_info(element.text)
                            candidates.extend(candidate_info)
                    
                    if candidates:
                        election = {
                            "title": title,
                            "date": date,
                            "type": "General Election",
                            "candidates": candidates,
                            "stakes": f"Key race in {self.state_names.get(state_code, state_code)}",
                            "chamberImpact": self.determine_chamber_impact(title),
                            "competitive": True
                        }
                        elections.append(election)
                        
                except Exception as e:
                    print(f"Error extracting election from section: {e}")
                    continue
            
            if elections:
                return {
                    "stateName": self.state_names.get(state_code, state_code),
                    "registrationWebsite": self.state_registration_sites.get(state_code, ""),
                    "registrationDeadline": self.calculate_registration_deadline(state_code),
                    "elections": elections
                }
                
        except Exception as e:
            print(f"Error extracting state elections for {state_code}: {e}")
        
        return None

    def extract_candidate_info(self, text):
        """Extract candidate information from text."""
        candidates = []
        
        # Look for patterns like "John Doe (R)" or "Jane Smith (D)"
        pattern = r'([A-Z][a-z]+ [A-Z][a-z]+)\s*\(([RDIG])\)'
        matches = re.findall(pattern, text)
        
        for name, party in matches:
            party_full = {
                'R': 'Republican',
                'D': 'Democratic', 
                'I': 'Independent',
                'G': 'Green'
            }.get(party, party)
            
            candidates.append({
                "name": name,
                "party": party_full,
                "incumbent": "incumbent" in text.lower()
            })
        
        return candidates

    def determine_chamber_impact(self, title):
        """Determine which chamber this election affects."""
        title_lower = title.lower()
        if "senate" in title_lower:
            return "Senate"
        elif "house" in title_lower or "representative" in title_lower:
            return "House"
        elif any(office in title_lower for office in ["governor", "attorney general", "secretary", "treasurer"]):
            return "State"
        else:
            return "Local"

    def calculate_registration_deadline(self, state_code=None):
        """Get registration deadline from CSV data or calculate default."""
        if state_code and state_code in self.registration_deadlines:
            return self.registration_deadlines[state_code]
        
        # Default calculation if not in CSV
        election_date = datetime(2025, 11, 4)  # November 4, 2025 (general election)
        deadline = election_date - timedelta(days=30)
        return deadline.strftime("%B %d, %Y")

    def get_state_code(self, state_name):
        """Convert state name to state code."""
        for code, name in self.state_names.items():
            if name.lower() == state_name.lower():
                return code
        return None

    def scrape_state_election_sites(self):
        """Scrape election data directly from state election websites."""
        print("Scraping state election websites from CSV...")
        
        elections_data = {}
        
        for state_code, url in self.state_election_sites.items():
            try:
                state_name = self.state_names.get(state_code, state_code)
                print(f"Scraping {state_name} ({state_code}) from {url}...")
                
                self.driver.get(url)
                time.sleep(2)  # Wait for page to load
                
                # Try to extract election information
                # This is a generic approach that may need customization per state
                page_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
                
                # Look for election-related keywords
                has_election_info = any(keyword in page_text for keyword in [
                    "election", "ballot", "vote", "polling", "candidate"
                ])
                
                if has_election_info:
                    state_data = {
                        "stateName": state_name,
                        "registrationWebsite": self.state_registration_sites.get(state_code, ""),
                        "registrationDeadline": self.calculate_registration_deadline(state_code),
                        "electionWebsite": url,
                        "elections": []
                    }
                    elections_data[state_code] = state_data
                    print(f"✓ Found election information for {state_name}")
                else:
                    print(f"✗ No election information found for {state_name}")
                    
            except Exception as e:
                print(f"Error scraping {state_code}: {e}")
                continue
        
        return elections_data
    
    def scrape_vote411(self):
        """Scrape additional election data from Vote411.org."""
        print("Scraping Vote411 for additional election information...")
        
        try:
            self.driver.get("https://www.vote411.org/")
            
            # Look for state-specific information
            # This would need to be customized based on Vote411's current structure
            
        except Exception as e:
            print(f"Error scraping Vote411: {e}")

    def update_elections_json(self, new_data):
        """Update the elections.json file with new data."""
        try:
            # Load existing data
            with open('electionstowatch/elections.json', 'r') as f:
                existing_data = json.load(f)
            
            # Update with new data
            for state_code, state_data in new_data.items():
                existing_data['electionData'][state_code] = state_data
            
            # Update timestamp
            existing_data['lastUpdated'] = datetime.now().isoformat() + 'Z'
            
            # Save updated data
            with open('electionstowatch/elections.json', 'w') as f:
                json.dump(existing_data, f, indent=2)
            
            print(f"Updated elections.json with data for {len(new_data)} states")
            
        except Exception as e:
            print(f"Error updating elections.json: {e}")

    def run_scraper(self, scrape_sources=['state_sites', 'ballotpedia']):
        """Run the complete scraping process.
        
        Args:
            scrape_sources: List of sources to scrape from. Options: 'state_sites', 'ballotpedia'
        """
        print("Starting election data scraping...")
        print(f"Sources to scrape: {', '.join(scrape_sources)}")
        
        all_data = {}
        
        try:
            # Scrape from state websites listed in CSV
            if 'state_sites' in scrape_sources:
                state_data = self.scrape_state_election_sites()
                all_data.update(state_data)
            
            # Scrape from Ballotpedia
            if 'ballotpedia' in scrape_sources:
                ballotpedia_data = self.scrape_ballotpedia_elections()
                # Merge with existing data
                for state_code, data in ballotpedia_data.items():
                    if state_code in all_data:
                        # Merge elections
                        all_data[state_code]['elections'].extend(data.get('elections', []))
                    else:
                        all_data[state_code] = data
            
            # Update the JSON file
            if all_data:
                self.update_elections_json(all_data)
            else:
                print("No data scraped from any source")
            
            print("Scraping completed successfully!")
            
        except Exception as e:
            print(f"Error during scraping: {e}")
        
        finally:
            self.driver.quit()

def main():
    """Main function to run the scraper."""
    import sys
    
    # Parse command line arguments
    sources = ['state_sites']  # Default to state sites from CSV
    
    if len(sys.argv) > 1:
        if '--all' in sys.argv:
            sources = ['state_sites', 'ballotpedia']
        elif '--ballotpedia' in sys.argv:
            sources = ['ballotpedia']
        elif '--help' in sys.argv:
            print("Usage: python election_scraper.py [options]")
            print("Options:")
            print("  (no options)     Scrape from state election websites in CSV (default)")
            print("  --all            Scrape from both state sites and Ballotpedia")
            print("  --ballotpedia    Scrape only from Ballotpedia")
            print("  --help           Show this help message")
            return
    
    print(f"Scraping from: {', '.join(sources)}")
    scraper = ElectionScraper(headless=True)
    scraper.run_scraper(scrape_sources=sources)

if __name__ == "__main__":
    main()
