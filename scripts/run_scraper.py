#!/usr/bin/env python3
"""
Election Scraper Automation Script
Runs the election scraper and handles scheduling and error reporting.
"""

import os
import sys
import json
import logging
import subprocess
from datetime import datetime
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from advanced_election_scraper import AdvancedElectionScraper

def setup_logging():
    """Set up logging configuration."""
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    log_file = log_dir / f"scraper_{datetime.now().strftime('%Y%m%d')}.log"
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    return logging.getLogger(__name__)

def check_dependencies():
    """Check if all required dependencies are installed."""
    logger = logging.getLogger(__name__)
    
    try:
        import selenium
        import requests
        import bs4
        from webdriver_manager.chrome import ChromeDriverManager
        logger.info("All dependencies are installed")
        return True
    except ImportError as e:
        logger.error(f"Missing dependency: {e}")
        logger.info("Please install dependencies with: pip install -r requirements.txt")
        return False

def backup_existing_data():
    """Create a backup of the existing elections.json file."""
    logger = logging.getLogger(__name__)
    
    elections_file = Path("electionstowatch/elections.json")
    if elections_file.exists():
        backup_dir = Path("backups")
        backup_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_file = backup_dir / f"elections_backup_{timestamp}.json"
        
        try:
            import shutil
            shutil.copy2(elections_file, backup_file)
            logger.info(f"Created backup: {backup_file}")
            return True
        except Exception as e:
            logger.error(f"Failed to create backup: {e}")
            return False
    
    return True

def validate_scraped_data(data):
    """Validate the scraped data structure."""
    logger = logging.getLogger(__name__)
    
    required_fields = ["stateName", "registrationWebsite", "registrationDeadline", "elections"]
    election_fields = ["title", "date", "type", "candidates", "stakes", "chamberImpact", "competitive"]
    candidate_fields = ["name", "party", "incumbent"]
    
    for state_code, state_data in data.items():
        # Check state-level fields
        for field in required_fields:
            if field not in state_data:
                logger.warning(f"Missing field '{field}' in state {state_code}")
                return False
        
        # Check election fields
        for election in state_data["elections"]:
            for field in election_fields:
                if field not in election:
                    logger.warning(f"Missing field '{field}' in election for state {state_code}")
                    return False
            
            # Check candidate fields
            for candidate in election["candidates"]:
                for field in candidate_fields:
                    if field not in candidate:
                        logger.warning(f"Missing field '{field}' in candidate for state {state_code}")
                        return False
    
    logger.info("Data validation passed")
    return True

def run_scraper():
    """Run the election scraper."""
    logger = setup_logging()
    logger.info("Starting election scraper automation")
    
    # Check dependencies
    if not check_dependencies():
        return False
    
    # Create backup
    if not backup_existing_data():
        logger.warning("Failed to create backup, continuing anyway")
    
    try:
        # Initialize and run scraper
        scraper = AdvancedElectionScraper(headless=True)
        scraper.run_comprehensive_scraper()
        
        # Validate the updated data
        with open('electionstowatch/elections.json', 'r') as f:
            updated_data = json.load(f)
        
        if validate_scraped_data(updated_data.get('electionData', {})):
            logger.info("Scraper completed successfully")
            return True
        else:
            logger.error("Scraped data validation failed")
            return False
            
    except Exception as e:
        logger.error(f"Scraper failed with error: {e}")
        return False

def main():
    """Main function."""
    success = run_scraper()
    
    if success:
        print("✅ Election scraper completed successfully")
        sys.exit(0)
    else:
        print("❌ Election scraper failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
