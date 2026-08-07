from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import CodingChallenge, CodingSubmission
from .serializers import CodingChallengeSerializer, CodingSubmissionSerializer
from .judge0_service import run_test_cases

class CodingChallengeViewSet(viewsets.ReadOnlyModelViewSet):
    """Viewset for reading coding challenges."""
    queryset = CodingChallenge.objects.filter(is_active=True)
    serializer_class = CodingChallengeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        difficulty = self.request.query_params.get('difficulty')
        category = self.request.query_params.get('category')
        if difficulty:
            queryset = queryset.filter(difficulty=difficulty)
        if category:
            queryset = queryset.filter(category=category)
        return queryset

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit code for a challenge."""
        challenge = self.get_object()
        code = request.data.get('code')
        language = request.data.get('language')

        if not code or not language:
            return Response({'error': 'Code and language are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create pending submission
        submission = CodingSubmission.objects.create(
            user=request.user,
            challenge=challenge,
            code=code,
            language=language,
            status='running'
        )

        # Combine public and hidden test cases
        test_cases = challenge.public_test_cases + challenge.hidden_test_cases
        if not test_cases:
            # dummy test case if none
            test_cases = [{"input": "", "expected_output": ""}]

        # Execute tests using Judge0/local fallback
        results = run_test_cases(
            code=code,
            language=language,
            test_cases=test_cases,
            time_limit=challenge.time_limit_ms / 1000.0,
            memory_limit=challenge.memory_limit_kb
        )

        # Process results
        total_tests = len(test_cases)
        passed_tests = sum(1 for r in results if r['passed'])
        
        # Determine overall status
        if passed_tests == total_tests:
            final_status = 'accepted'
        else:
            # Find first failing status
            failed = next((r for r in results if not r['passed']), None)
            final_status = failed['status'] if failed and failed['status'] != 'accepted' else 'wrong_answer'

        # Update challenge stats
        challenge.total_submissions += 1
        if final_status == 'accepted':
            challenge.accepted_submissions += 1
        challenge.save(update_fields=['total_submissions', 'accepted_submissions'])

        # Update submission
        submission.status = final_status
        submission.test_results = results
        submission.total_tests = total_tests
        submission.passed_tests = passed_tests
        
        # Calculate max time/memory
        submission.execution_time_ms = max((r.get('time_ms', 0) for r in results), default=0)
        submission.memory_used_kb = max((r.get('memory_kb', 0) for r in results), default=0)
        
        submission.save()

        # TODO: Trigger background AI code review if accepted

        serializer = CodingSubmissionSerializer(submission)
        return Response(serializer.data)

class CodingSubmissionViewSet(viewsets.ReadOnlyModelViewSet):
    """Viewset for reading user submissions."""
    serializer_class = CodingSubmissionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CodingSubmission.objects.filter(user=self.request.user)
