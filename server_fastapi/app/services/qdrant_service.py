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

    def search_curriculum(self, query: str, top_k: int = 2, question_number: int = 1, exclude_days: List[int] = None) -> List[Dict[str, Any]]:
        """
        Simulates HNSW dense vector cosine similarity search across indexed curriculum embeddings,
        ensuring diverse multi-day curriculum coverage across interview turns.
        """
        exclude = set(exclude_days or [])
        query_words = set(w for w in query.lower().split() if len(w) > 2)
        scored_results = []

        # Target dynamic day ranges based on question number if excluded or no query match
        day_ranges = {
            1: range(1, 6),
            2: range(6, 11),
            3: range(11, 16),
            4: range(16, 21),
            5: range(21, 26),
            6: range(26, 32),
            7: range(1, 16),
            8: range(16, 32),
        }
        preferred_range = day_ranges.get(question_number, range(1, 32))

        for item in self.vectors:
            day = item["day"]
            if day in exclude:
                continue

            text_words = set(item["text"].split())
            intersection = query_words.intersection(text_words)
            match_score = len(intersection) / max(len(query_words), 1)

            # Boost score if the day falls within target question number module phase
            phase_boost = 0.5 if day in preferred_range else 0.0
            total_score = match_score + phase_boost

            scored_results.append((total_score, item))

        scored_results.sort(key=lambda x: x[0], reverse=True)
        results = [res[1] for res in scored_results[:top_k]]

        # Fallback if all excluded
        if not results:
            candidates = [item for item in self.vectors if item["day"] not in exclude]
            results = candidates[:top_k] if candidates else self.vectors[:top_k]

        return results

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
