import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from interviews.models import Company, CompanyInterviewSet

companies_data = [
    {'name': 'Google', 'industry': 'Technology', 'logo_url': 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg'},
    {'name': 'Meta', 'industry': 'Social Media', 'logo_url': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg'},
    {'name': 'Amazon', 'industry': 'E-commerce & Cloud', 'logo_url': 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg'},
    {'name': 'Apple', 'industry': 'Consumer Electronics', 'logo_url': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'},
    {'name': 'Microsoft', 'industry': 'Technology', 'logo_url': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'},
    {'name': 'Netflix', 'industry': 'Entertainment', 'logo_url': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg'},
]

for data in companies_data:
    company, _ = Company.objects.get_or_create(name=data['name'], defaults={'industry': data['industry'], 'logo_url': data['logo_url']})
    
    # Create some mock interview sets
    CompanyInterviewSet.objects.get_or_create(
        company=company,
        title=f"{company.name} Software Engineer - Technical Round",
        round_type="Technical",
        defaults={
            'difficulty': 'hard',
            'questions': [
                "How would you design a distributed cache system?",
                "Explain how consistent hashing works.",
                "What is the CAP theorem and how does it apply to modern databases?"
            ]
        }
    )
    CompanyInterviewSet.objects.get_or_create(
        company=company,
        title=f"{company.name} Core Values - Behavioral Round",
        round_type="Behavioral",
        defaults={
            'difficulty': 'medium',
            'questions': [
                "Tell me about a time you had a conflict with a team member and how you resolved it.",
                "Describe a project that failed and what you learned from it."
            ]
        }
    )

print("Successfully seeded companies and interview sets!")
