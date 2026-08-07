import json
from django.core.management.base import BaseCommand
from coding.models import CodingChallenge

class Command(BaseCommand):
    help = 'Seed dummy coding challenges for testing'

    def handle(self, *args, **kwargs):
        challenges = [
            {
                'title': 'Two Sum',
                'description': 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
                'difficulty': 'easy',
                'frequency': 'practice',
                'category': 'arrays',
                'tags': ['array', 'hash-table'],
                'starter_code': {
                    'python': 'def twoSum(nums, target):\n    # Write your code here\n    pass',
                    'javascript': 'function twoSum(nums, target) {\n    // Write your code here\n}'
                },
                'public_test_cases': [
                    {'input': '[2,7,11,15]\n9', 'expected_output': '[0, 1]'},
                    {'input': '[3,2,4]\n6', 'expected_output': '[1, 2]'}
                ],
                'hidden_test_cases': [
                    {'input': '[3,3]\n6', 'expected_output': '[0, 1]'}
                ],
                'hints': ['Try using a hash map to store the elements and their indices.']
            },
            {
                'title': 'Valid Palindrome',
                'description': 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
                'difficulty': 'easy',
                'frequency': 'daily',
                'category': 'strings',
                'tags': ['string', 'two-pointers'],
                'starter_code': {
                    'python': 'def isPalindrome(s):\n    # Write your code here\n    pass',
                    'javascript': 'function isPalindrome(s) {\n    // Write your code here\n}'
                },
                'public_test_cases': [
                    {'input': '"A man, a plan, a canal: Panama"', 'expected_output': 'true'},
                    {'input': '"race a car"', 'expected_output': 'false'}
                ],
                'hidden_test_cases': [
                    {'input': '" "', 'expected_output': 'true'}
                ]
            }
        ]

        created_count = 0
        for data in challenges:
            obj, created = CodingChallenge.objects.get_or_create(
                title=data['title'],
                defaults=data
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {created_count} coding challenges.'))
