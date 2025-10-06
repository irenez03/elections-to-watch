#!/usr/bin/env python3
"""
Election Data Web Scraper
Automatically scrapes election information from various sources and updates the elections.json file.
"""

import json
import time
import re
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
    def __init__(self, headless=True):
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
        
        # State registration websites mapping
        self.state_registration_sites = {
            "AL": "https://www.alabamavotes.gov/voter-registration",
            "AK": "https://voterregistration.alaska.gov/",
            "AZ": "https://servicearizona.com/voterRegistration",
            "AR": "https://www.sos.arkansas.gov/elections/voter-information/voter-registration",
            "CA": "https://registertovote.ca.gov/",
            "CO": "https://www.sos.state.co.us/pubs/elections/vote/VoterHome.html",
            "CT": "https://voterregistration.ct.gov/",
            "DE": "https://ivote.de.gov/VoterView",
            "FL": "https://registertovote.fl.gov/",
            "GA": "https://registertovote.sos.ga.gov/",
            "HI": "https://olvr.hawaii.gov/",
            "ID": "https://voteidaho.gov/",
            "IL": "https://ova.elections.il.gov/",
            "IN": "https://indianavoters.in.gov/",
            "IA": "https://mymvd.iowadot.gov/Account/Login",
            "KS": "https://www.kdor.ks.gov/Apps/VoterReg/Default.aspx",
            "KY": "https://vrsws.sos.ky.gov/ovrweb/",
            "LA": "https://voterportal.sos.la.gov/",
            "ME": "https://www1.maine.gov/online/ovr/",
            "MD": "https://voterservices.elections.maryland.gov/OnlineVoterRegistration/",
            "MA": "https://www.sec.state.ma.us/ovr/",
            "MI": "https://mvic.sos.state.mi.us/",
            "MN": "https://mnvotes.sos.state.mn.us/VoterRegistration/VoterRegistrationMain",
            "MS": "https://www.sos.ms.gov/elections-voting/voter-registration-information",
            "MO": "https://s1.sos.mo.gov/elections/voterregistration/",
            "MT": "https://app.mt.gov/voterinfo/",
            "NE": "https://www.nebraska.gov/apps-sos-voter-registration/",
            "NV": "https://www.nvsos.gov/sos/elections/voters/registering-to-vote",
            "NH": "https://app.sos.nh.gov/Public/PartyInfo.aspx",
            "NJ": "https://voter.svrs.nj.gov/register",
            "NM": "https://portal.sos.state.nm.us/OVR/WebPages/InstructionsStep1.aspx",
            "NY": "https://dmv.ny.gov/more-info/electronic-voter-registration-application",
            "NC": "https://www.ncsbe.gov/registering/how-register",
            "ND": "https://vip.sos.nd.gov/PortalListDetails.aspx?ptlhPKID=74&ptlPKID=7",
            "OH": "https://olvr.ohiosos.gov/",
            "OK": "https://okvoterportal.okelections.us/",
            "OR": "https://sos.oregon.gov/voting/Pages/registration.aspx",
            "PA": "https://www.pavoterservices.pa.gov/Pages/VoterRegistrationApplication.aspx",
            "RI": "https://vote.sos.ri.gov/",
            "SC": "https://info.scvotes.sc.gov/eng/voterinquiry/VoterInformationRequest.aspx",
            "SD": "https://sdsos.gov/elections-voting/voting/register-to-vote.aspx",
            "TN": "https://ovr.govote.tn.gov/",
            "TX": "https://www.votetexas.gov/register-to-vote/",
            "UT": "https://secure.utah.gov/voterreg/",
            "VT": "https://olvr.vermont.gov/",
            "VA": "https://www.elections.virginia.gov/citizen-portal/",
            "WA": "https://voter.votewa.gov/",
            "WV": "https://ovr.sos.wv.gov/Register/Landing",
            "WI": "https://myvote.wi.gov/",
            "WY": "https://sos.wyo.gov/Elections/State/RegisteringToVote.aspx"
        }
        
        # State names mapping
        self.state_names = {
            "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California",
            "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "FL": "Florida", "GA": "Georgia",
            "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa",
            "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
            "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri",
            "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey",
            "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
            "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
            "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
            "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
        }

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
                    "registrationDeadline": self.calculate_registration_deadline(),
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

    def calculate_registration_deadline(self):
        """Calculate registration deadline (typically 30 days before election)."""
        election_date = datetime(2024, 11, 5)  # November 5, 2024
        deadline = election_date - timedelta(days=30)
        return deadline.strftime("%B %d, %Y")

    def get_state_code(self, state_name):
        """Convert state name to state code."""
        for code, name in self.state_names.items():
            if name.lower() == state_name.lower():
                return code
        return None

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

    def run_scraper(self):
        """Run the complete scraping process."""
        print("Starting election data scraping...")
        
        try:
            # Scrape from multiple sources
            ballotpedia_data = self.scrape_ballotpedia_elections()
            
            # Update the JSON file
            if ballotpedia_data:
                self.update_elections_json(ballotpedia_data)
            
            print("Scraping completed successfully!")
            
        except Exception as e:
            print(f"Error during scraping: {e}")
        
        finally:
            self.driver.quit()

def main():
    """Main function to run the scraper."""
    scraper = ElectionScraper(headless=True)
    scraper.run_scraper()

if __name__ == "__main__":
    main()
