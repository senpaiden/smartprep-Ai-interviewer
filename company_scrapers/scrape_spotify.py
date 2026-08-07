import os
import sys

# Ensure current directory is in Python path for importing scraper_engine
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from scraper_engine import run_scraper

def run():
    company_name = "Spotify"
    wikipedia_page = "Spotify"
    output_json = "output/spotify.json"
    output_pdf = "output/spotify.pdf"
    
    run_scraper(
        company_name=company_name,
        wikipedia_page=wikipedia_page,
        output_json=output_json,
        output_pdf=output_pdf
    )

if __name__ == '__main__':
    run()
