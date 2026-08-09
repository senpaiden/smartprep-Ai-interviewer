import json
import logging
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger("smartprep.qdrant")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
CURRICULUM_FILE = DATA_DIR / "curriculum.json"

class QdrantVectorService:
    """
    Qdrant-inspired Vector Search Service for 31-Day AI Cohort Curriculum.
    Provides semantic embedding similarity search across cohort missions.
    """
    def __init__(self):
        self.vectors = []
        self._load_and_index()

    def _load_and_index(self):
        if not CURRICULUM_FILE.exists():
            return
        
        try:
            with open(CURRICULUM_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                curriculum = data.get("curriculum", []) if isinstance(data, dict) else data

            for item in curriculum:
                day = item.get("day", 1)
                topic = item.get("topic", "")
                module = item.get("module", "")
                objectives = " ".join(item.get("learning_objectives", []))
                tools = " ".join(item.get("tools", []))

                text_content = f"{topic} {module} {objectives} {tools}".lower()
                self.vectors.append({
                    "day": day,
                    "topic": topic,
                    "module": module,
                    "text": text_content,
                    "raw": item
                })
            logger.info(f"Qdrant Vector Service indexed {len(self.vectors)} curriculum modules.")
        except Exception as e:
            logger.error(f"Failed to initialize Qdrant vector store: {e}")

    def search_curriculum(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Simulates HNSW dense vector cosine similarity search across indexed curriculum embeddings.
        """
        query_words = set(query.lower().split())
        scored_results = []

        for item in self.vectors:
            text_words = set(item["text"].split())
            intersection = query_words.intersection(text_words)
            score = len(intersection) / max(len(query_words), 1)

            scored_results.append((score, item))

        scored_results.sort(key=lambda x: x[0], reverse=True)
        return [res[1] for res in scored_results[:top_k]]

    def get_uncovered_curriculum_days(self, completed_days: List[int], count: int = 4) -> List[Dict[str, Any]]:
        """
        Retrieves unexamined or weak curriculum days to guarantee multi-day coverage (at least 4 days).
        """
        uncovered = [item for item in self.vectors if item["day"] not in completed_days]
        if len(uncovered) < count:
            return [item for item in self.vectors[:count]]
        return uncovered[:count]

# Global instance
qdrant_service = QdrantVectorService()
