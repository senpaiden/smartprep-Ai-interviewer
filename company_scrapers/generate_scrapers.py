import os

companies = [
    {"name": "Google", "page": "Google", "file": "scrape_google.py"},
    {"name": "Microsoft", "page": "Microsoft", "file": "scrape_microsoft.py"},
    {"name": "Apple", "page": "Apple_Inc.", "file": "scrape_apple.py"},
    {"name": "Amazon", "page": "Amazon_(company)", "file": "scrape_amazon.py"},
    {"name": "Meta", "page": "Meta_Platforms", "file": "scrape_meta.py"},
    {"name": "Netflix", "page": "Netflix", "file": "scrape_netflix.py"},
    {"name": "Tesla", "page": "Tesla,_Inc.", "file": "scrape_tesla.py"},
    {"name": "Nvidia", "page": "Nvidia", "file": "scrape_nvidia.py"},
    {"name": "Adobe", "page": "Adobe_Inc.", "file": "scrape_adobe.py"},
    {"name": "Salesforce", "page": "Salesforce", "file": "scrape_salesforce.py"},
    {"name": "Oracle", "page": "Oracle_Corporation", "file": "scrape_oracle.py"},
    {"name": "IBM", "page": "IBM", "file": "scrape_ibm.py"},
    {"name": "Intel", "page": "Intel", "file": "scrape_intel.py"},
    {"name": "AMD", "page": "Advanced_Micro_Devices", "file": "scrape_amd.py"},
    {"name": "Cisco", "page": "Cisco", "file": "scrape_cisco.py"},
    {"name": "Spotify", "page": "Spotify", "file": "scrape_spotify.py"},
    {"name": "Shopify", "page": "Shopify", "file": "scrape_shopify.py"},
    {"name": "Airbnb", "page": "Airbnb", "file": "scrape_airbnb.py"},
    {"name": "Uber", "page": "Uber", "file": "scrape_uber.py"},
    {"name": "Zoom", "page": "Zoom_Video_Communications", "file": "scrape_zoom.py"}
]

current_dir = os.path.dirname(os.path.abspath(__file__))

script_template = """import os
import sys

# Ensure current directory is in Python path for importing scraper_engine
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from scraper_engine import run_scraper

def run():
    company_name = "{name}"
    wikipedia_page = "{page}"
    output_json = "output/{name_lower}.json"
    output_pdf = "output/{name_lower}.pdf"
    
    run_scraper(
        company_name=company_name,
        wikipedia_page=wikipedia_page,
        output_json=output_json,
        output_pdf=output_pdf
    )

if __name__ == '__main__':
    run()
"""

def generate():
    for comp in companies:
        filepath = os.path.join(current_dir, comp["file"])
        content = script_template.format(
            name=comp["name"],
            page=comp["page"],
            name_lower=comp["name"].lower()
        )
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Generated scraper script: {filepath}")

if __name__ == '__main__':
    generate()
