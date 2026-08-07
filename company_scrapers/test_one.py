import os
import sys
# Make sure company_scrapers is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from scraper_engine import run_scraper

if __name__ == '__main__':
    run_scraper(
        company_name="Google",
        wikipedia_page="Google",
        output_json="output/google.json",
        output_pdf="output/google.pdf"
    )
    print("Test run completed!")
