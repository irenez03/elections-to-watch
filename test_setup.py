#!/usr/bin/env python3
"""
Test script to verify the election map setup is working correctly.
"""

import json
import os
import sys
from pathlib import Path

def test_file_structure():
    """Test that all required files exist."""
    print("🔍 Testing file structure...")
    
    required_files = [
        "electionstowatch/index.html",
        "electionstowatch/script.js", 
        "electionstowatch/style.css",
        "electionstowatch/elections.json",
        "requirements.txt",
        "update_elections.sh"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing files: {missing_files}")
        return False
    else:
        print("✅ All required files present")
        return True

def test_json_structure():
    """Test that the elections.json file has the correct structure."""
    print("🔍 Testing JSON structure...")
    
    try:
        with open("electionstowatch/elections.json", "r") as f:
            data = json.load(f)
        
        # Check top-level structure
        required_top_level = ["lastUpdated", "contactEmail", "electionData"]
        for key in required_top_level:
            if key not in data:
                print(f"❌ Missing top-level key: {key}")
                return False
        
        # Check state data structure
        for state_code, state_data in data["electionData"].items():
            required_state_keys = ["stateName", "registrationWebsite", "registrationDeadline", "elections"]
            for key in required_state_keys:
                if key not in state_data:
                    print(f"❌ Missing state key '{key}' in {state_code}")
                    return False
            
            # Check election structure
            for election in state_data["elections"]:
                required_election_keys = ["title", "date", "type", "candidates", "stakes", "chamberImpact", "competitive"]
                for key in required_election_keys:
                    if key not in election:
                        print(f"❌ Missing election key '{key}' in {state_code}")
                        return False
                
                # Check candidate structure
                for candidate in election["candidates"]:
                    required_candidate_keys = ["name", "party", "incumbent"]
                    for key in required_candidate_keys:
                        if key not in candidate:
                            print(f"❌ Missing candidate key '{key}' in {state_code}")
                            return False
        
        print("✅ JSON structure is valid")
        return True
        
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON: {e}")
        return False
    except Exception as e:
        print(f"❌ Error reading JSON: {e}")
        return False

def test_dependencies():
    """Test that Python dependencies can be imported."""
    print("🔍 Testing Python dependencies...")
    
    try:
        import selenium
        import requests
        import bs4
        from webdriver_manager.chrome import ChromeDriverManager
        print("✅ All Python dependencies available")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("💡 Run: pip3 install -r requirements.txt")
        return False

def test_web_files():
    """Test that web files are accessible and have content."""
    print("🔍 Testing web files...")
    
    web_files = [
        "electionstowatch/index.html",
        "electionstowatch/script.js",
        "electionstowatch/style.css"
    ]
    
    for file_path in web_files:
        try:
            with open(file_path, "r") as f:
                content = f.read()
                if len(content.strip()) == 0:
                    print(f"❌ Empty file: {file_path}")
                    return False
        except Exception as e:
            print(f"❌ Error reading {file_path}: {e}")
            return False
    
    print("✅ Web files are accessible and have content")
    return True

def main():
    """Run all tests."""
    print("🧪 Running Election Map Setup Tests\n")
    
    tests = [
        test_file_structure,
        test_json_structure,
        test_dependencies,
        test_web_files
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
        print()  # Add spacing between tests
    
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your election map is ready to use.")
        print("\n📋 Next steps:")
        print("1. Open electionstowatch/index.html in your web browser")
        print("2. Run ./update_elections.sh to update election data")
        print("3. Hover over states to see election information")
        return True
    else:
        print("❌ Some tests failed. Please fix the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
