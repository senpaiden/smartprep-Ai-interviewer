"""Add role field to Interview."""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('interviews', '0005_knowledgebasedocument_documentchunk'),
    ]

    operations = [
        migrations.AddField(
            model_name='interview',
            name='role',
            field=models.CharField(blank=True, default='', max_length=100),
        ),
    ]
