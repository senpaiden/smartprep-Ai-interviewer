import os
import json
from pathlib import Path
from django.core.management.base import BaseCommand
from interviews.models import Company, CompanyInterviewSet

class Command(BaseCommand):
    help = 'Imports scraped company data and interview questions into the database.'

    def handle(self, *args, **options):
        # Base paths
        base_dir = Path(__file__).resolve().parent.parent.parent.parent.parent
        output_dir = base_dir / 'company_scrapers' / 'output'
        questions_dir = output_dir / 'questions'

        if not output_dir.exists():
            self.stdout.write(self.style.ERROR(f"Output directory not found: {output_dir}"))
            return

        company_count = 0
        set_count = 0

        # 1. Iterate through company json files
        for filename in os.listdir(output_dir):
            if not filename.endswith('.json'):
                continue

            company_filepath = output_dir / filename
            company_slug = filename.replace('.json', '')
            
            with open(company_filepath, 'r', encoding='utf-8') as f:
                try:
                    data = json.load(f)
                except json.JSONDecodeError:
                    self.stdout.write(self.style.ERROR(f"Could not parse JSON for {filename}"))
                    continue

            name = data.get('company_name', company_slug.capitalize())
            summary = data.get('summary', '')
            logo_url = data.get('logo_url', '')
            details = data.get('details', {})
            industry = details.get('Industry', '')
            
            # Create or update company
            company, created = Company.objects.update_or_create(
                name=name,
                defaults={
                    'description': summary,
                    'logo_url': logo_url,
                    'industry': industry,
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f"Created Company: {name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Updated Company: {name}"))
            
            company_count += 1

            # 2. Look for corresponding questions file
            questions_filename = f"{company_slug}_questions.json"
            questions_filepath = questions_dir / questions_filename

            if questions_filepath.exists():
                with open(questions_filepath, 'r', encoding='utf-8') as f:
                    try:
                        questions_data = json.load(f)
                    except json.JSONDecodeError:
                        self.stdout.write(self.style.ERROR(f"Could not parse JSON for {questions_filename}"))
                        continue

                # Group questions by category
                categories = {}
                for q in questions_data:
                    cat = q.get('cat', 'General')
                    if cat not in categories:
                        categories[cat] = []
                    categories[cat].append(q)

                # Create Interview Sets
                for cat, q_list in categories.items():
                    title = f"{name} {cat} Round"
                    
                    # Update or create interview set
                    interview_set, s_created = CompanyInterviewSet.objects.update_or_create(
                        company=company,
                        title=title,
                        defaults={
                            'round_type': cat,
                            'difficulty': 'mixed',
                            'questions': q_list
                        }
                    )
                    
                    if s_created:
                        self.stdout.write(self.style.SUCCESS(f"  -> Created Interview Set: {title} ({len(q_list)} qs)"))
                    else:
                        self.stdout.write(self.style.WARNING(f"  -> Updated Interview Set: {title} ({len(q_list)} qs)"))
                    
                    set_count += 1

        self.stdout.write(self.style.SUCCESS(f"\nSuccessfully processed {company_count} companies and created {set_count} interview sets."))
