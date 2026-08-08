import os
import re
import json
import requests
import time
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

# Create outputs and temp directories
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output")
TEMP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_logos")
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(TEMP_DIR, exist_ok=True)

def clean_text(text):
    """
    Cleans up scraped text by:
    1. Removing citation brackets like [1], [a], [citation needed]
    2. Collapsing multiple spaces and newlines
    3. Stripping leading/trailing spaces
    """
    if not text:
        return ""
    # Remove references like [1], [a], [citation needed]
    text = re.sub(r'\[[^\]]*\]', '', text)
    # Replace multiple spaces/newlines with a single space
    text = re.sub(r'\s+', ' ', text)
    # Remove leading/trailing commas, semicolons, and spaces
    text = text.strip(" ;,.")
    return text.strip()

def download_logo(url):
    """
    Downloads the logo image from URL and returns local file path.
    """
    if not url:
        return None
    
    # Generate a safe filename
    parsed_url = urlparse(url)
    ext = os.path.splitext(parsed_url.path)[1][1:].lower()
    if ext not in ["jpg", "jpeg", "png", "gif", "svg", "webp"]:
        ext = "png"
    
    # Hash URL to prevent collision
    filename = f"logo_{abs(hash(url))}.{ext}"
    filepath = os.path.join(TEMP_DIR, filename)
    
    if os.path.exists(filepath):
        return filepath
        
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        res = requests.get(url, headers=headers, timeout=10)
        if res.status_code == 200:
            with open(filepath, "wb") as f:
                f.write(res.content)
            return filepath
    except Exception as e:
        print(f"Warning: Failed to download logo from {url}: {e}")
    return None

class NumberedCanvas(canvas.Canvas):
    """
    Canvas to dynamically compute and print page numbers, header, and footer.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor('#4A5568')) # Slate Grey
        
        # Header text
        self.drawString(40, 755, "VERIFIED CORPORATE PROFILE REPORT")
        self.setFont("Helvetica", 8)
        self.drawRightString(572, 755, "SOURCE: WIKIPEDIA API")
        
        # Header Line
        self.setStrokeColor(colors.HexColor('#CBD5E0')) # Light grey
        self.setLineWidth(0.75)
        self.line(40, 747, 572, 747)
        
        # Footer Line
        self.line(40, 50, 572, 50)
        
        # Footer text
        self.drawString(40, 38, f"Generated: {datetime.now().strftime('%B %d, %Y')} | Verified Genuine Data")
        self.drawRightString(572, 38, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def scrape_company_data(page_name):
    """
    Scrapes company summary and infobox from Wikipedia.
    """
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    
    # 1. Wikipedia Page Summary API
    summary_url = f"https://en.wikipedia.org/api/rest_v1/page/summary/{page_name}"
    summary_data = {}
    try:
        res = requests.get(summary_url, headers=headers, timeout=10)
        if res.status_code == 200:
            summary_data = res.json()
    except Exception as e:
        print(f"Error fetching API summary for {page_name}: {e}")

    # 2. Scrape HTML Infobox
    wiki_url = f"https://en.wikipedia.org/wiki/{page_name}"
    infobox_data = {}
    try:
        res = requests.get(wiki_url, headers=headers, timeout=10)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, 'html.parser')
            table = soup.find('table', {'class': 'infobox'})
            if table:
                rows = table.find_all('tr')
                for row in rows:
                    th = row.find('th')
                    td = row.find('td')
                    if th and td:
                        # Clean linebreaks inside cell
                        for br in td.find_all(["br", "hr"]):
                            br.replace_with(", ")
                        key = clean_text(th.get_text(separator=" "))
                        val = clean_text(td.get_text(separator=" "))
                        if key and val:
                            # Skip long values that might contain massive inline lists (to keep clean)
                            if len(val) < 400:
                                infobox_data[key] = val
    except Exception as e:
        print(f"Error parsing HTML infobox for {page_name}: {e}")

    # Build the final structured dict
    company_info = {
        "company_name": summary_data.get("title", page_name.replace("_", " ")),
        "description": summary_data.get("description", "No description available"),
        "summary": summary_data.get("extract", "No summary available"),
        "logo_url": summary_data.get("thumbnail", {}).get("source", ""),
        "wikipedia_url": wiki_url,
        "scraped_at": datetime.utcnow().isoformat() + "Z",
        "details": infobox_data
    }
    
    return company_info

def generate_pdf_report(company_info, output_pdf_path):
    """
    Generates a professional corporate PDF report from company data.
    """
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=60,
        bottomMargin=65
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CompanyTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#1A365D'), # Primary color
        spaceAfter=4
    )
    
    desc_style = ParagraphStyle(
        'CompanyDesc',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#319795'), # Secondary/Accent color
        spaceAfter=15
    )
    
    h2_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#1A365D'),
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor('#2D3748'),
        spaceAfter=12
    )
    
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=colors.white
    )
    
    table_key_style = ParagraphStyle(
        'TableKey',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#2D3748')
    )
    
    table_val_style = ParagraphStyle(
        'TableVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#4A5568')
    )
    
    story = []
    
    # Title & Subtitle
    story.append(Paragraph(company_info["company_name"], title_style))
    story.append(Paragraph(company_info["description"], desc_style))
    
    # Top Section: Logo & Quick Stats Table side-by-side
    logo_path = download_logo(company_info["logo_url"])
    logo_flowable = None
    
    if logo_path:
        try:
            # Let's scale the logo to max width 120 and height 120
            img = Image(logo_path)
            img_w, img_h = img.imageWidth, img.imageHeight
            aspect = img_w / img_h
            if img_w > img_h:
                w = min(120, img_w)
                h = w / aspect
            else:
                h = min(120, img_h)
                w = h * aspect
            img.drawWidth = w
            img.drawHeight = h
            logo_flowable = img
        except Exception as e:
            print(f"Could not render logo in PDF: {e}")
            
    # Key corporate highlights for the overview card
    details = company_info.get("details", {})
    hq = details.get("Headquarters", details.get("HQ", "N/A"))
    founded = details.get("Founded", "N/A")
    founders = details.get("Founders", details.get("Founder", "N/A"))
    website = details.get("Website", "N/A")
    industry = details.get("Industry", "N/A")
    
    overview_data = [
        [Paragraph("Industry", table_key_style), Paragraph(industry, table_val_style)],
        [Paragraph("Founded", table_key_style), Paragraph(founded, table_val_style)],
        [Paragraph("Founders", table_key_style), Paragraph(founders, table_val_style)],
        [Paragraph("Headquarters", table_key_style), Paragraph(hq, table_val_style)],
        [Paragraph("Website", table_key_style), Paragraph(website, table_val_style)],
    ]
    
    overview_table = Table(overview_data, colWidths=[100, 270])
    overview_table.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
    ]))
    
    # Combine Logo + Overview Table into a single row table
    if logo_flowable:
        top_table_data = [[logo_flowable, overview_table]]
        top_table = Table(top_table_data, colWidths=[150, 380])
    else:
        top_table_data = [[overview_table]]
        top_table = Table(top_table_data, colWidths=[530])
        
    top_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(top_table)
    story.append(Spacer(1, 10))
    
    # Section: Company Summary
    story.append(Paragraph("Executive Summary", h2_style))
    story.append(Paragraph(company_info["summary"], body_style))
    story.append(Spacer(1, 10))
    
    # Section: Detailed Scraped Infobox Information
    story.append(Paragraph("Detailed Corporate Information", h2_style))
    
    detailed_rows = [[
        Paragraph("Key Metric / Property", table_header_style), 
        Paragraph("Details", table_header_style)
    ]]
    
    # Filter out details already shown in top overview, or empty ones
    exclude_keys = {"Industry", "Founded", "Founders", "Founder", "Headquarters", "HQ", "Website"}
    
    row_idx = 1
    table_styles = [
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1A365D')),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
    ]
    
    for key, val in details.items():
        if key in exclude_keys or not val:
            continue
        # Format key and value
        key_p = Paragraph(key, table_key_style)
        val_p = Paragraph(val, table_val_style)
        detailed_rows.append([key_p, val_p])
        
        # Add zebra striping
        bg_color = colors.HexColor('#F7FAFC') if row_idx % 2 == 1 else colors.white
        table_styles.append(('BACKGROUND', (0, row_idx), (-1, row_idx), bg_color))
        row_idx += 1
        
    if len(detailed_rows) > 1:
        detailed_table = Table(detailed_rows, colWidths=[160, 370])
        detailed_table.setStyle(TableStyle(table_styles))
        # Keep table together if small, or let flow naturally
        story.append(detailed_table)
    else:
        story.append(Paragraph("No further details available.", body_style))
        
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF generated successfully: {output_pdf_path}")

def run_scraper(company_name, wikipedia_page, output_json, output_pdf):
    """
    Main orchestrator to scrape, save JSON, and generate PDF.
    """
    print(f"Starting pipeline for {company_name}...")
    
    # 1. Scrape
    data = scrape_company_data(wikipedia_page)
    # Ensure company name matches our preferred label
    data["company_name"] = company_name
    
    # Absolute paths
    abs_json = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), output_json))
    abs_pdf = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), output_pdf))
    
    # Ensure dirs exist
    os.makedirs(os.path.dirname(abs_json), exist_ok=True)
    os.makedirs(os.path.dirname(abs_pdf), exist_ok=True)
    
    # 2. Save JSON
    with open(abs_json, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"JSON saved successfully: {abs_json}")
    
    # 3. Generate PDF
    generate_pdf_report(data, abs_pdf)
    print(f"Finished pipeline for {company_name}!\n")
