#!/bin/bash

# Election Data Update Script
# This script updates the election data by running the web scraper

echo "🗳️  Starting Election Data Update..."

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python3 first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ requirements.txt not found. Please run this script from the project root directory."
    exit 1
fi

# Activate virtual environment and install dependencies if needed
echo "📦 Setting up virtual environment..."
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt --quiet

# Run the scraper
echo "🕷️  Running election scraper..."
python run_scraper.py

# Check if the scraper was successful
if [ $? -eq 0 ]; then
    echo "✅ Election data updated successfully!"
    echo "📊 You can now view the updated map at: electionstowatch/index.html"
else
    echo "❌ Election data update failed. Check the logs for details."
    exit 1
fi
