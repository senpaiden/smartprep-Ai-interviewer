"""Add ai_summary field to Interview."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('interviews', '0006_interview_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='interview',
            name='ai_summary',
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
