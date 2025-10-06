# 🗳️ Interactive Election Map - 2025

An interactive U.S. election map that displays comprehensive election information for each state, including candidates, registration deadlines, and what's at stake in each race for the 2025 elections.

## ✨ Features

- **Interactive Map**: Hover over states to see election summaries
- **Detailed Information**: Click states for comprehensive election details
- **Registration Info**: Direct links to state voter registration websites
- **Deadline Tracking**: Registration and election deadlines
- **Candidate Details**: Names, parties, and incumbent status
- **Stakes Analysis**: What's at stake in each race (Senate, House, State control)
- **Automated Updates**: Web scraping to keep data current

## 🚀 Quick Start

1. **View the Map**: Open `electionstowatch/index.html` in your web browser
2. **Update Data**: Run `./update_elections.sh` to scrape fresh election data

## 📁 Project Structure

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

## 🛠️ Setup

### Prerequisites

- Python 3.7+
- Chrome browser (for web scraping)
- Internet connection

### Installation

1. **Clone or download** this repository
2. **Install Python dependencies**:
   ```bash
   pip3 install -r requirements.txt
   ```
3. **Make the update script executable**:
   ```bash
   chmod +x update_elections.sh
   ```

## 🔄 Updating Election Data

### Automatic Update (Recommended)
```bash
./update_elections.sh
```

### Manual Update
```bash
python3 run_scraper.py
```

### What Gets Updated

The scraper automatically gathers:
- **Senate races** from Ballotpedia
- **Competitive House races** from election databases
- **Registration deadlines** (calculated as 30 days before election)
- **State registration websites** (pre-configured)
- **Candidate information** including party affiliation and incumbent status

## 📊 Data Structure

The `elections.json` file contains:

```json
{
  "lastUpdated": "2025-01-27T00:00:00Z",
  "electionData": {
    "AZ": {
      "stateName": "Arizona",
      "registrationWebsite": "https://servicearizona.com/voterRegistration",
      "registrationDeadline": "October 7, 2024",
      "elections": [
        {
          "title": "U.S. Senate",
          "date": "November 5, 2024",
          "type": "General Election",
          "candidates": [
            {
              "name": "Kari Lake",
              "party": "Republican",
              "incumbent": false
            }
          ],
          "stakes": "Open seat race for U.S. Senate...",
          "chamberImpact": "Senate",
          "competitive": true
        }
      ]
    }
  }
}
```

## 🎨 Customization

### Adding New States

1. **Edit** `electionstowatch/elections.json`
2. **Add state data** following the existing structure
3. **Include registration website** from the scraper's mapping

### Modifying the Map

- **Colors**: Edit `style.css` for state highlighting colors
- **Tooltip content**: Modify the `mouseover` function in `script.js`
- **Modal content**: Update the `openModal` function in `script.js`

### Adding Data Sources

1. **Extend** `AdvancedElectionScraper` class
2. **Add new scraping methods** for additional sources
3. **Update** the `run_comprehensive_scraper` method

## 🔧 Technical Details

### Web Scraping

- **Selenium WebDriver**: Automates browser interactions
- **BeautifulSoup**: Parses HTML content
- **Chrome Headless**: Runs scraping without visible browser
- **Error Handling**: Robust error handling and logging

### Data Sources

- **Ballotpedia**: Primary source for election information
- **State Websites**: Registration and deadline information
- **FEC Data**: Candidate and race information (future enhancement)

### Browser Compatibility

- **Chrome**: Recommended for web scraping
- **All modern browsers**: For viewing the map

## 📅 Scheduling Updates

### Cron Job (Linux/Mac)
```bash
# Update every day at 6 AM
0 6 * * * cd /path/to/election_map && ./update_elections.sh
```

### Windows Task Scheduler
1. Create a new task
2. Set trigger to daily
3. Set action to run `update_elections.sh`

## 🐛 Troubleshooting

### Common Issues

1. **ChromeDriver errors**: The script automatically downloads ChromeDriver
2. **Permission denied**: Run `chmod +x update_elections.sh`
3. **Python not found**: Install Python 3.7+ and ensure it's in PATH
4. **Dependencies missing**: Run `pip3 install -r requirements.txt`

### Logs

Check the `logs/` directory for detailed error information:
```bash
tail -f logs/scraper_$(date +%Y%m%d).log
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📝 License

This project is open source. See the LICENSE file for details.

## 📞 Support

For issues or questions:
- **Email**: sandrewxu@gmail.com
- **Create an issue** in the repository

## 🔮 Future Enhancements

- [ ] Real-time polling data integration
- [ ] Historical election data
- [ ] Mobile app version
- [ ] Social media integration
- [ ] Advanced analytics and predictions
- [ ] Multi-language support
- [ ] Accessibility improvements

---

**Last Updated**: January 27, 2025
**Version**: 2.1.0 - Updated for 2025 Elections
