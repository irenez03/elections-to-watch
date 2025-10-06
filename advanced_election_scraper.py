#!/usr/bin/env python3
"""
Advanced Election Data Scraper
Comprehensive scraper that gathers election data from multiple sources including:
- Ballotpedia
- State election websites
- Vote411
- FEC data
"""

import json
import time
import re
import requests
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AdvancedElectionScraper:
    def __init__(self, headless=True):
        """Initialize the advanced scraper."""
        self.setup_driver(headless)
        self.setup_data_sources()
        
    def setup_driver(self, headless=True):
        """Set up Chrome WebDriver with proper configuration."""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")
        
        try:
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            self.wait = WebDriverWait(self.driver, 15)
            logger.info("Chrome WebDriver initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Chrome WebDriver: {e}")
            raise

    def setup_data_sources(self):
        """Set up data sources and mappings."""
        # State information
        self.states = {
            "AL": {"name": "Alabama", "fec_id": "AL"},
            "AK": {"name": "Alaska", "fec_id": "AK"},
            "AZ": {"name": "Arizona", "fec_id": "AZ"},
            "AR": {"name": "Arkansas", "fec_id": "AR"},
            "CA": {"name": "California", "fec_id": "CA"},
            "CO": {"name": "Colorado", "fec_id": "CO"},
            "CT": {"name": "Connecticut", "fec_id": "CT"},
            "DE": {"name": "Delaware", "fec_id": "DE"},
            "FL": {"name": "Florida", "fec_id": "FL"},
            "GA": {"name": "Georgia", "fec_id": "GA"},
            "HI": {"name": "Hawaii", "fec_id": "HI"},
            "ID": {"name": "Idaho", "fec_id": "ID"},
            "IL": {"name": "Illinois", "fec_id": "IL"},
            "IN": {"name": "Indiana", "fec_id": "IN"},
            "IA": {"name": "Iowa", "fec_id": "IA"},
            "KS": {"name": "Kansas", "fec_id": "KS"},
            "KY": {"name": "Kentucky", "fec_id": "KY"},
            "LA": {"name": "Louisiana", "fec_id": "LA"},
            "ME": {"name": "Maine", "fec_id": "ME"},
            "MD": {"name": "Maryland", "fec_id": "MD"},
            "MA": {"name": "Massachusetts", "fec_id": "MA"},
            "MI": {"name": "Michigan", "fec_id": "MI"},
            "MN": {"name": "Minnesota", "fec_id": "MN"},
            "MS": {"name": "Mississippi", "fec_id": "MS"},
            "MO": {"name": "Missouri", "fec_id": "MO"},
            "MT": {"name": "Montana", "fec_id": "MT"},
            "NE": {"name": "Nebraska", "fec_id": "NE"},
            "NV": {"name": "Nevada", "fec_id": "NV"},
            "NH": {"name": "New Hampshire", "fec_id": "NH"},
            "NJ": {"name": "New Jersey", "fec_id": "NJ"},
            "NM": {"name": "New Mexico", "fec_id": "NM"},
            "NY": {"name": "New York", "fec_id": "NY"},
            "NC": {"name": "North Carolina", "fec_id": "NC"},
            "ND": {"name": "North Dakota", "fec_id": "ND"},
            "OH": {"name": "Ohio", "fec_id": "OH"},
            "OK": {"name": "Oklahoma", "fec_id": "OK"},
            "OR": {"name": "Oregon", "fec_id": "OR"},
            "PA": {"name": "Pennsylvania", "fec_id": "PA"},
            "RI": {"name": "Rhode Island", "fec_id": "RI"},
            "SC": {"name": "South Carolina", "fec_id": "SC"},
            "SD": {"name": "South Dakota", "fec_id": "SD"},
            "TN": {"name": "Tennessee", "fec_id": "TN"},
            "TX": {"name": "Texas", "fec_id": "TX"},
            "UT": {"name": "Utah", "fec_id": "UT"},
            "VT": {"name": "Vermont", "fec_id": "VT"},
            "VA": {"name": "Virginia", "fec_id": "VA"},
            "WA": {"name": "Washington", "fec_id": "WA"},
            "WV": {"name": "West Virginia", "fec_id": "WV"},
            "WI": {"name": "Wisconsin", "fec_id": "WI"},
            "WY": {"name": "Wyoming", "fec_id": "WY"}
        }

        # Registration websites
        self.registration_sites = {
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

    def scrape_ballotpedia_senate_races(self):
        """Scrape Senate race information from Ballotpedia."""
        logger.info("Scraping Ballotpedia Senate races...")
        
        try:
            self.driver.get("https://ballotpedia.org/United_States_Senate_elections,_2025")
            time.sleep(3)
            
            senate_races = {}
            
            # Look for state-specific Senate race information
            race_elements = self.driver.find_elements(By.XPATH, "//h3[contains(@id, '2024') or contains(text(), '2024')]")
            
            for element in race_elements[:10]:  # Limit for testing
                try:
                    state_text = element.text
                    if "2024" in state_text:
                        # Extract state name
                        state_name = state_text.replace(" 2024", "").strip()
                        state_code = self.get_state_code_by_name(state_name)
                        
                        if state_code:
                            logger.info(f"Processing Senate race for {state_name}")
                            
                            # Get candidate information from the following content
                            candidates = self.extract_senate_candidates(element)
                            
                            if candidates:
                                election = {
                                    "title": "U.S. Senate",
                                    "date": "November 5, 2024",
                                    "type": "General Election",
                                    "candidates": candidates,
                                    "stakes": f"Critical Senate race in {state_name} that could determine Senate control",
                                    "chamberImpact": "Senate",
                                    "competitive": True
                                }
                                
                                senate_races[state_code] = {
                                    "stateName": self.states[state_code]["name"],
                                    "registrationWebsite": self.registration_sites.get(state_code, ""),
                                    "registrationDeadline": self.calculate_registration_deadline(),
                                    "elections": [election]
                                }
                                
                except Exception as e:
                    logger.error(f"Error processing Senate race element: {e}")
                    continue
            
            return senate_races
            
        except Exception as e:
            logger.error(f"Error scraping Ballotpedia Senate races: {e}")
            return {}

    def extract_senate_candidates(self, element):
        """Extract candidate information from a Senate race element."""
        candidates = []
        
        try:
            # Look for candidate information in the following siblings
            next_elements = element.find_elements(By.XPATH, "./following-sibling::*")
            
            for next_elem in next_elements[:5]:
                text = next_elem.text
                
                # Look for candidate patterns
                candidate_patterns = [
                    r'([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?)\s*\(([RDIG])\)',
                    r'([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?)\s*-\s*([RDIG])',
                ]
                
                for pattern in candidate_patterns:
                    matches = re.findall(pattern, text)
                    for name, party in matches:
                        party_full = {
                            'R': 'Republican',
                            'D': 'Democratic',
                            'I': 'Independent',
                            'G': 'Green'
                        }.get(party, party)
                        
                        candidates.append({
                            "name": name.strip(),
                            "party": party_full,
                            "incumbent": "incumbent" in text.lower() or "re-election" in text.lower()
                        })
                
                if candidates:
                    break
                    
        except Exception as e:
            logger.error(f"Error extracting Senate candidates: {e}")
        
        return candidates

    def scrape_competitive_house_races(self):
        """Scrape competitive House race information."""
        logger.info("Scraping competitive House races...")
        
        try:
            self.driver.get("https://ballotpedia.org/United_States_House_of_Representatives_elections,_2025")
            time.sleep(3)
            
            house_races = {}
            
            # Look for competitive race indicators
            competitive_elements = self.driver.find_elements(By.XPATH, "//span[contains(@class, 'competitive') or contains(text(), 'Competitive')]")
            
            for element in competitive_elements[:5]:  # Limit for testing
                try:
                    # Find the parent race information
                    race_info = element.find_element(By.XPATH, "./ancestor::tr | ./ancestor::div[contains(@class, 'race')]")
                    
                    # Extract state and district information
                    text = race_info.text
                    
                    # Look for state and district patterns
                    state_match = re.search(r'([A-Z]{2})', text)
                    district_match = re.search(r'District (\d+)', text)
                    
                    if state_match and district_match:
                        state_code = state_match.group(1)
                        district = district_match.group(1)
                        
                        candidates = self.extract_house_candidates(race_info)
                        
                        if candidates:
                            election = {
                                "title": f"U.S. House - District {district}",
                                "date": "November 5, 2024",
                                "type": "General Election",
                                "candidates": candidates,
                                "stakes": f"Competitive House race in {self.states[state_code]['name']} District {district}",
                                "chamberImpact": "House",
                                "competitive": True
                            }
                            
                            if state_code not in house_races:
                                house_races[state_code] = {
                                    "stateName": self.states[state_code]["name"],
                                    "registrationWebsite": self.registration_sites.get(state_code, ""),
                                    "registrationDeadline": self.calculate_registration_deadline(),
                                    "elections": []
                                }
                            
                            house_races[state_code]["elections"].append(election)
                            
                except Exception as e:
                    logger.error(f"Error processing competitive House race: {e}")
                    continue
            
            return house_races
            
        except Exception as e:
            logger.error(f"Error scraping competitive House races: {e}")
            return {}

    def extract_house_candidates(self, element):
        """Extract candidate information from a House race element."""
        candidates = []
        
        try:
            text = element.text
            
            # Look for candidate patterns
            candidate_patterns = [
                r'([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?)\s*\(([RDIG])\)',
                r'([A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?)\s*-\s*([RDIG])',
            ]
            
            for pattern in candidate_patterns:
                matches = re.findall(pattern, text)
                for name, party in matches:
                    party_full = {
                        'R': 'Republican',
                        'D': 'Democratic',
                        'I': 'Independent',
                        'G': 'Green'
                    }.get(party, party)
                    
                    candidates.append({
                        "name": name.strip(),
                        "party": party_full,
                        "incumbent": "incumbent" in text.lower() or "re-election" in text.lower()
                    })
                    
        except Exception as e:
            logger.error(f"Error extracting House candidates: {e}")
        
        return candidates

    def get_state_code_by_name(self, state_name):
        """Get state code by state name."""
        for code, info in self.states.items():
            if info["name"].lower() == state_name.lower():
                return code
        return None

    def calculate_registration_deadline(self):
        """Calculate registration deadline (typically 30 days before election)."""
        election_date = datetime(2025, 11, 4)
        deadline = election_date - timedelta(days=30)
        return deadline.strftime("%B %d, %Y")

    def merge_election_data(self, *data_sources):
        """Merge election data from multiple sources."""
        merged_data = {}
        
        for data_source in data_sources:
            for state_code, state_data in data_source.items():
                if state_code not in merged_data:
                    merged_data[state_code] = state_data
                else:
                    # Merge elections
                    existing_elections = merged_data[state_code]["elections"]
                    new_elections = state_data["elections"]
                    
                    # Add new elections that don't already exist
                    for new_election in new_elections:
                        if not any(existing["title"] == new_election["title"] for existing in existing_elections):
                            existing_elections.append(new_election)
        
        return merged_data

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
            
            logger.info(f"Updated elections.json with data for {len(new_data)} states")
            
        except Exception as e:
            logger.error(f"Error updating elections.json: {e}")

    def run_comprehensive_scraper(self):
        """Run the comprehensive scraping process."""
        logger.info("Starting comprehensive election data scraping...")
        
        try:
            # Scrape from multiple sources
            senate_data = self.scrape_ballotpedia_senate_races()
            house_data = self.scrape_competitive_house_races()
            
            # Merge all data
            all_data = self.merge_election_data(senate_data, house_data)
            
            # Update the JSON file
            if all_data:
                self.update_elections_json(all_data)
                logger.info(f"Successfully scraped data for {len(all_data)} states")
            else:
                logger.warning("No data was scraped")
            
        except Exception as e:
            logger.error(f"Error during comprehensive scraping: {e}")
        
        finally:
            self.driver.quit()
            logger.info("Scraping completed")

def main():
    """Main function to run the advanced scraper."""
    scraper = AdvancedElectionScraper(headless=True)
    scraper.run_comprehensive_scraper()

if __name__ == "__main__":
    main()
