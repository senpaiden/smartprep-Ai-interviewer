import json
import os
from django.core.management.base import BaseCommand
from django.conf import settings
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct

class Command(BaseCommand):
    help = 'Ingest curriculum and candidate data into Qdrant vector database.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Initializing Qdrant client...")
        
        # Connect to Qdrant. Uses memory by default unless URL is provided in settings.
        url = getattr(settings, 'QDRANT_URL', None)
        api_key = getattr(settings, 'QDRANT_API_KEY', None)
        
        if url:
            self.stdout.write(f"Connecting to Qdrant at {url}")
            client = QdrantClient(url=url, api_key=api_key)
        else:
            self.stdout.write("Connecting to local persistent Qdrant (./qdrant_data)")
            client = QdrantClient(path=os.path.join(settings.BASE_DIR, 'qdrant_data'))

        # Set up fastembed (which uses BAAI/bge-small-en-v1.5 by default)
        client.set_model("BAAI/bge-small-en-v1.5")
        
        collection_name = "ai_cohort_curriculum"
        
        if client.collection_exists(collection_name):
            client.delete_collection(collection_name)
            
        # fastembed model uses 384 dimensions
        client.create_collection(
            collection_name=collection_name,
            vectors_config=client.get_fastembed_vector_params()
        )

        self.stdout.write("Reading curriculum data...")
        curriculum_path = os.path.join(settings.BASE_DIR, 'hackathon_data', 'curriculum.json')
        with open(curriculum_path, 'r') as f:
            curriculum = json.load(f)

        docs = []
        metadata = []
        
        # Chunk curriculum by day
        for day in curriculum.get('days', []):
            day_text = f"Day {day.get('day', '')}: {day.get('title', '')}\n"
            day_text += f"Tools: {', '.join(day.get('tools', []))}\n"
            day_text += f"Objectives: {', '.join(day.get('objectives', []))}"
            
            docs.append(day_text)
            metadata.append({
                "type": "curriculum_day",
                "day": day['day'],
                "title": day['title']
            })

        self.stdout.write(f"Embedding {len(docs)} curriculum days into Qdrant...")
        
        client.add(
            collection_name=collection_name,
            documents=docs,
            metadata=metadata
        )

        self.stdout.write(self.style.SUCCESS("Successfully ingested data into Qdrant!"))
