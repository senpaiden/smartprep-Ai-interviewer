import os
import sys
import json
import time
import traceback
import google.generativeai as genai
from dotenv import load_dotenv

# Ensure current directory is in Python path for importing questions_pdf_generator
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from questions_pdf_generator import generate_questions_pdf

load_dotenv('server/.env')
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
gemini_model = genai.GenerativeModel('gemini-3.5-flash')

companies = [
    "Google", "Microsoft", "Apple", "Amazon", "Meta",
    "Netflix", "Tesla", "Nvidia", "Adobe", "Salesforce",
    "Oracle", "IBM", "Intel", "AMD", "Cisco",
    "Spotify", "Shopify", "Airbnb", "Uber", "Zoom"
]

# Output directories
QUESTIONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "output", "questions")
os.makedirs(QUESTIONS_DIR, exist_ok=True)

# Topics for the 8 batches (26 Q&As each to guarantee 200+ total)
BATCHES_CONFIG = [
    {
        "name": "Coding & Algorithms (Part 1)",
        "focus": "Data Structures, Arrays, Strings, HashMaps, Two Pointers, Sliding Window. Include code implementations in Python, Java, or C++.",
        "cat": "Coding"
    },
    {
        "name": "Coding & Algorithms (Part 2)",
        "focus": "Trees, Graphs, BFS/DFS, Recursion, Backtracking, Dynamic Programming, Greedy Algorithms. Include code implementations.",
        "cat": "Coding"
    },
    {
        "name": "System Design & Scalability",
        "focus": "Distributed Systems, Microservices, Caching, Load Balancers, API Design, Rate Limiters, DNS, CDN.",
        "cat": "System Design"
    },
    {
        "name": "Databases & Data Storage",
        "focus": "SQL vs NoSQL, Replication, Partitioning, Sharding, ACID properties, Transactions, Indexing, Consistent Hashing.",
        "cat": "System Design"
    },
    {
        "name": "Behavioral Questions (STAR Method)",
        "focus": "Situational scenarios, describing past projects, handling conflicts, leadership, failures, and alignment with corporate culture.",
        "cat": "Behavioral"
    },
    {
        "name": "HR & Cultural Alignment",
        "focus": "Career goals, work ethic, salary negotiation, motivation, and why you want to work at this specific company.",
        "cat": "Behavioral"
    },
    {
        "name": "CS Fundamentals & OOP",
        "focus": "Object-Oriented Design, Operating Systems (Processes, Threads, Concurrency, Mutex, Semaphores, Memory Management).",
        "cat": "CS Fundamentals"
    },
    {
        "name": "Web Technologies & Security",
        "focus": "HTTP/HTTPS protocols, TCP/IP, Web sockets, CORS, security (OAuth, JWT, XSS, CSRF), API design guidelines.",
        "cat": "CS Fundamentals & Web Tech"
    }
]

def generate_batch(company, batch_idx, batch_config, retries=3):
    name = batch_config["name"]
    focus = batch_config["focus"]
    cat = batch_config["cat"]
    
    prompt = f"""You are a Senior Staff Engineer and Principal Technical Recruiter at {company}.
Generate exactly 26 unique, high-quality, genuine interview questions and detailed answers for candidates applying for engineering and tech roles at {company}.

This batch is focusing on: {name}.
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

    backoff = 2
    for attempt in range(1, retries + 1):
        try:
            print(f"  -> Batch {batch_idx}/8: Requesting '{name}' (Attempt {attempt})...")
            res = gemini_model.generate_content(
                prompt,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.7
                }
            )
            content = res.text.strip()
            
            # Parse JSON
            data = json.loads(content)
            if isinstance(data, dict):
                # Check if it was wrapped in a root object
                for val in data.values():
                    if isinstance(val, list):
                        data = val
                        break
            
            if isinstance(data, list) and len(data) > 0:
                print(f"  -> Success: Generated {len(data)} questions for '{name}'.")
                return data
            else:
                raise ValueError("Response is not a non-empty list.")
                
        except Exception as e:
            print(f"  -> Attempt {attempt} failed: {e}")
            if attempt == retries:
                print(f"  -> Batch '{name}' permanently failed.")
                return []
            if "429" in str(e) or "quota" in str(e).lower() or "limit" in str(e).lower():
                print("  -> Rate limit (429) detected! Sleeping 65 seconds to reset quota window...")
                time.sleep(65)
            else:
                print(f"  -> Sleeping {backoff}s before retry...")
                time.sleep(backoff)
                backoff *= 2
            
    return []

def process_company(company):
    json_path = os.path.join(QUESTIONS_DIR, f"{company.lower()}_questions.json")
    pdf_path = os.path.join(QUESTIONS_DIR, f"{company.lower()}_questions.pdf")
    
    # Checkpoint
    if os.path.exists(json_path) and os.path.exists(pdf_path):
        print(f"Checkpoint active: {company} already has Q&As generated. Skipping.")
        return True
        
    print(f"\n==================================================")
    print(f"Generating 200+ Interview Q&As for {company}")
    print(f"==================================================")
    
    all_questions = []
    
    for idx, config in enumerate(BATCHES_CONFIG, 1):
        batch_qs = generate_batch(company, idx, config)
        all_questions.extend(batch_qs)
        # Sleep to avoid rate limiting
        time.sleep(2.0)
        
    if len(all_questions) < 150:
        print(f"Warning: Only generated {len(all_questions)} questions for {company}. Attempting one final recovery call...")
        # Recovery call
        recovery_config = {
            "name": "General Engineering Technical & HR",
            "focus": "Core software engineering practices, system design, coding, and behavioral interview questions.",
            "cat": "General Technical & HR"
        }
        recovery_qs = generate_batch(company, 5, recovery_config)
        all_questions.extend(recovery_qs)
        
    print(f"Total questions collected for {company}: {len(all_questions)}")
    
    if len(all_questions) == 0:
        print(f"Error: Failed to generate any questions for {company}.")
        return False
        
    # Save JSON
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, indent=4, ensure_ascii=False)
    print(f"JSON Saved: {json_path}")
    
    # Generate PDF
    try:
        generate_questions_pdf(company, all_questions, pdf_path)
    except Exception as e:
        print(f"Failed to generate PDF for {company}: {e}")
        traceback.print_exc()
        return False
        
    return True

def main():
    start_time = time.time()
    success_count = 0
    
    print(f"Starting Interview Questions generation for {len(companies)} companies...")
    
    for comp in companies:
        success = process_company(comp)
        if success:
            success_count += 1
        # Extra spacing sleep
        time.sleep(3.0)
        
    duration = time.time() - start_time
    print(f"\n==================================================")
    print(f"Execution Summary:")
    print(f"Total Companies Processed: {len(companies)}")
    print(f"Successfully Completed: {success_count}/{len(companies)}")
    print(f"Total Time: {duration:.2f} seconds")
    print(f"==================================================")

if __name__ == '__main__':
    main()
