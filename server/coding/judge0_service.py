"""Judge0 API integration for secure code execution."""

import json
import time
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

# Judge0 language IDs
LANGUAGE_IDS = {
    'python': 71,       # Python 3
    'javascript': 63,   # Node.js
    'java': 62,         # Java (OpenJDK 13)
    'cpp': 54,          # C++ (GCC 9)
}

# Judge0 base URL — using public free API
JUDGE0_BASE_URL = getattr(settings, 'JUDGE0_BASE_URL', 'https://judge0-ce.p.rapidapi.com')
JUDGE0_API_KEY = getattr(settings, 'JUDGE0_API_KEY', '')


def _get_headers():
    """Get headers for Judge0 API requests."""
    headers = {
        'Content-Type': 'application/json',
    }
    if JUDGE0_API_KEY:
        headers['X-RapidAPI-Key'] = JUDGE0_API_KEY
        headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com'
    return headers


def execute_code(code, language, stdin='', time_limit=2, memory_limit=262144):
    """
    Execute code using Judge0 API.

    Returns:
        dict with keys: stdout, stderr, compile_output, status, time_ms, memory_kb
    """
    language_id = LANGUAGE_IDS.get(language)
    if not language_id:
        return {
            'stdout': '',
            'stderr': f'Unsupported language: {language}',
            'compile_output': '',
            'status': 'compilation_error',
            'time_ms': 0,
            'memory_kb': 0,
        }

    # Submit code
    payload = {
        'source_code': code,
        'language_id': language_id,
        'stdin': stdin,
        'cpu_time_limit': time_limit,
        'memory_limit': memory_limit,
    }

    try:
        # Try submitting
        submit_url = f'{JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true'
        response = requests.post(
            submit_url,
            json=payload,
            headers=_get_headers(),
            timeout=30,
        )
        response.raise_for_status()
        result = response.json()

        return _parse_result(result)

    except requests.exceptions.RequestException as e:
        logger.error(f'Judge0 API error: {e}')
        # Fallback: simulate execution locally for Python/JS
        return _local_execute(code, language, stdin)


def _parse_result(result):
    """Parse Judge0 API response."""
    status_id = result.get('status', {}).get('id', 0)

    # Map Judge0 status IDs
    status_map = {
        1: 'pending',    # In Queue
        2: 'running',    # Processing
        3: 'accepted',   # Accepted
        4: 'wrong_answer',  # Wrong Answer
        5: 'time_limit',    # TLE
        6: 'compilation_error',
        7: 'runtime_error',   # Runtime Error (SIGSEGV)
        8: 'runtime_error',   # Runtime Error (SIGXFSZ)
        9: 'runtime_error',   # Runtime Error (SIGFPE)
        10: 'runtime_error',  # Runtime Error (SIGABRT)
        11: 'runtime_error',  # Runtime Error (NZEC)
        12: 'runtime_error',  # Runtime Error (Other)
        13: 'compilation_error',  # Internal Error
        14: 'runtime_error',     # Exec Format Error
    }

    return {
        'stdout': (result.get('stdout') or '').strip(),
        'stderr': (result.get('stderr') or '').strip(),
        'compile_output': (result.get('compile_output') or '').strip(),
        'status': status_map.get(status_id, 'runtime_error'),
        'time_ms': int(float(result.get('time', 0)) * 1000) if result.get('time') else 0,
        'memory_kb': result.get('memory', 0) or 0,
    }


def _local_execute(code, language, stdin=''):
    """Fallback local execution for when Judge0 is unavailable (dev only)."""
    import subprocess
    import tempfile
    import os

    try:
        if language == 'python':
            f = tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False)
            f.write(code)
            f.close()
            try:
                result = subprocess.run(
                    ['python', f.name],
                    input=stdin,
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                return {
                    'stdout': result.stdout.strip(),
                    'stderr': result.stderr.strip(),
                    'compile_output': '',
                    'status': 'accepted' if result.returncode == 0 else 'runtime_error',
                    'time_ms': 0,
                    'memory_kb': 0,
                }
            finally:
                if os.path.exists(f.name):
                    os.unlink(f.name)

        elif language == 'javascript':
            f = tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False)
            f.write(code)
            f.close()
            try:
                result = subprocess.run(
                    ['node', f.name],
                    input=stdin,
                    capture_output=True,
                    text=True,
                    timeout=5,
                )
                return {
                    'stdout': result.stdout.strip(),
                    'stderr': result.stderr.strip(),
                    'compile_output': '',
                    'status': 'accepted' if result.returncode == 0 else 'runtime_error',
                    'time_ms': 0,
                    'memory_kb': 0,
                }
            finally:
                if os.path.exists(f.name):
                    os.unlink(f.name)

        return {
            'stdout': '',
            'stderr': f'Local execution not supported for {language}. Please configure Judge0 API.',
            'compile_output': '',
            'status': 'runtime_error',
            'time_ms': 0,
            'memory_kb': 0,
        }

    except subprocess.TimeoutExpired:
        return {
            'stdout': '',
            'stderr': 'Execution timed out',
            'compile_output': '',
            'status': 'time_limit',
            'time_ms': 5000,
            'memory_kb': 0,
        }
    except Exception as e:
        return {
            'stdout': '',
            'stderr': str(e),
            'compile_output': '',
            'status': 'runtime_error',
            'time_ms': 0,
            'memory_kb': 0,
        }


def run_test_cases(code, language, test_cases, time_limit=2, memory_limit=262144):
    """
    Run code against multiple test cases.

    Returns:
        list of dicts with keys: test_case, passed, output, expected, time_ms, error
    """
    results = []
    for i, tc in enumerate(test_cases):
        stdin = tc.get('input', '')
        expected = tc.get('expected_output', '').strip()

        result = execute_code(code, language, stdin, time_limit, memory_limit)

        actual_output = result['stdout'].strip()
        passed = actual_output == expected and result['status'] in ('accepted', 'pending')

        results.append({
            'test_case': i + 1,
            'passed': passed,
            'output': actual_output,
            'expected': expected,
            'time_ms': result['time_ms'],
            'memory_kb': result['memory_kb'],
            'error': result['stderr'] or result['compile_output'] or '',
            'status': result['status'] if not passed and result['status'] == 'accepted' else result['status'],
        })

        # If compilation error, skip remaining tests
        if result['status'] in ('compilation_error',):
            for j in range(i + 1, len(test_cases)):
                results.append({
                    'test_case': j + 1,
                    'passed': False,
                    'output': '',
                    'expected': test_cases[j].get('expected_output', ''),
                    'time_ms': 0,
                    'memory_kb': 0,
                    'error': 'Skipped due to compilation error',
                    'status': 'compilation_error',
                })
            break

    return results
