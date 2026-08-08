from django.test import TestCase
from unittest.mock import patch, MagicMock
from .services import evaluate_answer, generate_interview_question


class EvaluateAnswerTest(TestCase):
    @patch('ai_service.services.get_nvidia_client')
    def test_evaluate_answer_returns_differentiated_scores(self, mock_client):
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = (
            '{"technical_accuracy": 8, "confidence": 7, "communication": 6, '
            '"english_fluency": 9, "grammar": 8, "vocabulary": 7, "fluency": 6, '
            '"relevance": 9, "completeness": 7, "problem_solving": 8, '
            '"overall_score": 7.5, "reason": "Good answer", '
            '"strengths": ["Clear explanation"], "recommendations": ["Add examples"]}'
        )
        mock_client.return_value.chat.completions.create.return_value = mock_response

        result = evaluate_answer(
            "What is Python?", "Python is a programming language", "technical", "medium"
        )
        self.assertIn('technical_accuracy', result)
        self.assertIn('score', result)
        self.assertGreater(result['score'], 0)

    @patch('ai_service.services.get_nvidia_client')
    def test_evaluate_answer_error_returns_zeros(self, mock_client):
        mock_client.return_value.chat.completions.create.side_effect = Exception("API Error")
        result = evaluate_answer("Q", "A", "technical", "medium")
        self.assertEqual(result['score'], 0)
        self.assertEqual(result['technical_accuracy'], 0)
