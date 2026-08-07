import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

print("Starting script...", flush=True)
load_dotenv('server/.env')
print("Loaded .env", flush=True)
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
print("Configured Gemini API", flush=True)
model = genai.GenerativeModel('gemini-3.5-flash')
print("Model initialized", flush=True)

def test():
    try:
        print("Sending request to Gemini 3.5 Flash...", flush=True)
        res = model.generate_content(
            "Generate a list of 5 software engineer interview questions for Apple in JSON format: [{\"q\": \"...\", \"a\": \"...\"}]",
            generation_config={
                "response_mime_type": "application/json"
            }
        )
        print("Received response!", flush=True)
        print(res.text.strip(), flush=True)
    except Exception as e:
        print("Error during API call:", e, flush=True)

if __name__ == '__main__':
    test()
