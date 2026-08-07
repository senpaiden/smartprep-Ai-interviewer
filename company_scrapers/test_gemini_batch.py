import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv('server/.env')
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-3.5-flash')

def test():
    company = "Apple"
    focus = "Data Structures, Algorithms, Arrays, Strings, HashMaps, Trees, Graphs, Sorting, Searching, Recursion, Dynamic Programming. Include code implementations in Python, Java, or C++ where applicable."
    cat = "Coding"
    
    prompt = f"""You are a Senior Staff Engineer and Principal Technical Recruiter at {company}.
Generate exactly 55 unique, high-quality, genuine interview questions and detailed answers for candidates applying for engineering and tech roles at {company}.

This batch is focusing on: Coding & Algorithms.
Specific topics: {focus}.
The questions must range from Easy to Medium and Hard difficulty.
For technical/coding questions, write high-quality explanations, and include code snippets or markdown diagrams in the answers where appropriate.

You must return ONLY a JSON array of objects with this exact format:
[
  {{
    "q": "Question text?",
    "a": "Detailed answer explaining the solution, logic, or best practices...",
    "cat": "{cat}",
    "diff": "Medium"
  }}
]

Strictly return ONLY the JSON array. Do not include markdown code block wrappers (like ```json) or any introductory/concluding text. Ensure valid JSON syntax."""

    try:
        print("Sending request to Gemini 3.5 Flash...")
        res = model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.7
            }
        )
        print("Received response!")
        content = res.text.strip()
        data = json.loads(content)
        if isinstance(data, dict):
            for val in data.values():
                if isinstance(val, list):
                    data = val
                    break
        print(f"Success! Generated {len(data)} questions.")
        print("First question:", json.dumps(data[0], indent=2))
    except Exception as e:
        print("Error:", e)

if __name__ == '__main__':
    test()
