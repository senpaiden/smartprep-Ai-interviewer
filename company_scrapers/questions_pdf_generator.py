import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.pdfgen import canvas

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
            if self._pageNumber > 1: # Suppress headers/footers on the cover page
                self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor('#4A5568')) # Slate Grey
        
        # Header text
        self.drawString(40, 755, "INTERVIEW QUESTIONS & ANSWERS STUDY GUIDE")
        self.setFont("Helvetica", 8)
        self.drawRightString(572, 755, "CONFIDENTIAL & PROPRIETARY")
        
        # Header Line
        self.setStrokeColor(colors.HexColor('#CBD5E0')) # Light grey
        self.setLineWidth(0.75)
        self.line(40, 747, 572, 747)
        
        # Footer Line
        self.line(40, 50, 572, 50)
        
        # Footer text
        self.drawString(40, 38, f"Verified study resource | Compiled: {datetime.now().strftime('%B %d, %Y')}")
        self.drawRightString(572, 38, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def generate_questions_pdf(company_name, questions, output_pdf_path):
    """
    Generates a professional interview booklet (PDF) from questions list.
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
        'CoverTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=32,
        leading=38,
        textColor=colors.HexColor('#1A365D'),
        spaceAfter=15
    )
    
    subtitle_style = ParagraphStyle(
        'CoverSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=16,
        leading=22,
        textColor=colors.HexColor('#319795'),
        spaceAfter=30
    )
    
    metadata_style = ParagraphStyle(
        'CoverMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#718096')
    )
    
    section_title_style = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=colors.HexColor('#1A365D'),
        spaceBefore=20,
        spaceAfter=10,
        keepWithNext=True
    )
    
    question_style = ParagraphStyle(
        'QuestionText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#1A365D'),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True # Ensure the question stays with the answer
    )
    
    badge_style = ParagraphStyle(
        'BadgeText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#718096'),
        spaceAfter=6,
        keepWithNext=True
    )
    
    answer_style = ParagraphStyle(
        'AnswerText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor('#2D3748'),
        spaceAfter=12
    )
    
    story = []
    
    # ------------------ COVER PAGE ------------------
    story.append(Spacer(1, 150))
    story.append(Paragraph(f"{company_name} Prep Guide", title_style))
    story.append(Paragraph(f"Comprehensive Interview Q&A Repository", subtitle_style))
    
    # A colored separator bar
    story.append(HRFlowable(width="100%", thickness=4, color=colors.HexColor('#1A365D'), spaceBefore=10, spaceAfter=20))
    
    story.append(Spacer(1, 100))
    story.append(Paragraph(f"<b>Target Company:</b> {company_name}", metadata_style))
    story.append(Paragraph(f"<b>Volume:</b> {len(questions)} Handpicked Questions & Answers", metadata_style))
    story.append(Paragraph(f"<b>Difficulty Range:</b> Easy, Medium, Hard", metadata_style))
    story.append(Paragraph(f"<b>Generated:</b> {datetime.now().strftime('%B %d, %Y')}", metadata_style))
    story.append(Paragraph(f"<b>Format:</b> Technical, Coding, Behavioral, and HR Rounds", metadata_style))
    
    story.append(PageBreak())
    
    # ------------------ SECTIONS ------------------
    # Group questions by category
    categories = {}
    for q in questions:
        cat = q.get("cat", "General Technical")
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(q)
        
    question_counter = 1
    
    for cat_name, cat_qs in sorted(categories.items()):
        # Add Section Page Break or spacer
        story.append(Paragraph(cat_name, section_title_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#CBD5E0'), spaceBefore=2, spaceAfter=15))
        
        for q in cat_qs:
            q_text = q.get("q", "")
            a_text = q.get("a", "")
            diff = q.get("diff", "Medium")
            
            # Format answer with simple breaks
            a_text_formatted = a_text.replace("\n", "<br/>")
            
            # Create a single flowable block for the Q&A to try to keep it together if it fits
            qa_block = []
            qa_block.append(Paragraph(f"<b>Q{question_counter}. {q_text}</b>", question_style))
            qa_block.append(Paragraph(f"Difficulty: {diff} | Category: {cat_name}", badge_style))
            qa_block.append(Paragraph(f"<b>Answer:</b> {a_text_formatted}", answer_style))
            qa_block.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#E2E8F0'), spaceBefore=6, spaceAfter=12))
            
            story.append(KeepTogether(qa_block))
            question_counter += 1
            
    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Study Guide PDF compiled successfully at: {output_pdf_path}")
