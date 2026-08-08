import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', 'server', '.env'))
client = Groq(api_key=os.getenv('GROQ_API_KEY'))

def test_batch():
    company = "Google"
    focus = "Coding & Algorithms (Data Structures, Arrays, Trees, Graphs, Dynamic Programming)"
    
    prompt = f"""You are a Senior Technical Recruiter at {company}.
Generate exactly 50 high-quality, genuine interview questions and answers for candidates applying for Software Engineering roles at {company}.

The questions should focus on: {focus}.
The questions must range from easy to hard difficulty.
Include code snippets in the answers where appropriate (use markdown syntax within the answer text).

You must return ONLY a JSON array of objects with this exact format:
[
  {{
    "q": "Question text?",
    "a": "Detailed answer explaining the solution, logic, or code...",
    "cat": "Coding",
    "diff": "Medium"
  }}
]

Strictly return ONLY the JSON array. Do not include markdown code block wrappers (like ```json) or any introductory/concluding text."""

    try:
        print("Sending request to Groq...")
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs only raw JSON arrays."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_completion_tokens=6000,
            response_format={"type": "json_object"}
        )
        content = res.choices[0].message.content.strip()
        
        # Try parsing JSON
        data = json.loads(content)
        # If it's a dict with a root key, extract it
        if isinstance(data, dict):
            # Sometimes LLMs wrap the array in a dict even when asked for an array
            for val in data.values():
                if isinstance(val, list):
                    data = val
                    break
        
        print(f"Successfully generated {len(data)} questions!")
        print("First question:")
        print(json.dumps(data[0], indent=2))
        
    except Exception as e:
        print("Error during generation:", e)

if __name__ == '__main__':
    test_batch()
