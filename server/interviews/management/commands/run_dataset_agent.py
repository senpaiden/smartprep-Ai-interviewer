import os
from pathlib import Path
from django.core.management.base import BaseCommand
from interviews.models import Company, KnowledgeBaseDocument, DocumentChunk
import PyPDF2

class Command(BaseCommand):
    help = 'Dataset Agent: Processes PDFs, chunks them, generates embeddings and saves to database.'

    def handle(self, *args, **options):
        # We need sentence_transformers. We import it here so that the command doesn't crash 
        # on startup if the package is missing, though it should be installed.
        try:
            from sentence_transformers import SentenceTransformer
        except ImportError:
            self.stdout.write(self.style.ERROR("sentence-transformers not installed. Please install it first."))
            return

        self.stdout.write("Loading SentenceTransformer model 'all-MiniLM-L6-v2' (this might take a moment if not downloaded)...")
        model = SentenceTransformer('all-MiniLM-L6-v2')

        base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
        output_dir = base_dir / 'company_scrapers' / 'output'
        
        if not output_dir.exists():
            self.stdout.write(self.style.ERROR(f"Directory not found: {output_dir}"))
            return

        self.process_directory(output_dir, model)
        
        questions_dir = output_dir / 'questions'
        if questions_dir.exists():
            self.process_directory(questions_dir, model)

        self.stdout.write(self.style.SUCCESS("\nDataset Agent finished processing all PDFs!"))

    def process_directory(self, directory, model):
        for filename in os.listdir(directory):
            if not filename.endswith('.pdf'):
                continue
            
            # The filename usually starts with the company name (e.g. apple.pdf or apple_questions.pdf)
            company_slug = filename.split('_')[0].replace('.pdf', '')
            
            # Try to find the company
            company = Company.objects.filter(name__iexact=company_slug).first()
            if not company:
                self.stdout.write(self.style.WARNING(f"Company not found for slug '{company_slug}'. Skipping {filename}."))
                continue

            filepath = directory / filename
            self.stdout.write(f"Processing {filename} for {company.name}...")

            # Extract text
            text = self.extract_text_from_pdf(filepath)
            if not text.strip():
                self.stdout.write(self.style.WARNING(f"  -> No text extracted from {filename}."))
                continue

            # Create KnowledgeBaseDocument
            kb_doc, created = KnowledgeBaseDocument.objects.get_or_create(
                company=company,
                filename=filename,
                defaults={'file_path': str(filepath)}
            )

            # If not created, we might want to delete old chunks and re-embed, or skip. Let's delete old chunks.
            if not created:
                kb_doc.chunks.all().delete()
                self.stdout.write("  -> Cleared old chunks.")

            # Chunk the text
            chunks = self.chunk_text(text, chunk_size=500, overlap=50)
            self.stdout.write(f"  -> Created {len(chunks)} chunks. Generating embeddings...")

            # Generate embeddings
            if chunks:
                embeddings = model.encode(chunks)
                
                # Save to database
                for i, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
                    DocumentChunk.objects.create(
                        document=kb_doc,
                        text=chunk_text,
                        embedding=embedding.tolist(),
                        chunk_index=i
                    )
            
            self.stdout.write(self.style.SUCCESS(f"  -> Saved {len(chunks)} chunks for {filename}."))

    def extract_text_from_pdf(self, filepath):
        text = ""
        try:
            with open(filepath, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error reading {filepath}: {str(e)}"))
        return text

    def chunk_text(self, text, chunk_size=500, overlap=50):
        words = text.split()
        chunks = []
        i = 0
        while i < len(words):
            chunk = " ".join(words[i:i + chunk_size])
            chunks.append(chunk)
            i += chunk_size - overlap
        return chunks
