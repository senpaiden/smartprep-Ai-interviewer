"""Add candidate_id and covered_days to Interview."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('interviews', '0007_interview_ai_summary'),
    ]

    operations = [
        migrations.AddField(
            model_name='interview',
            name='candidate_id',
            field=models.CharField(blank=True, default='', max_length=50),
        ),
        migrations.AddField(
            model_name='interview',
            name='covered_days',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
