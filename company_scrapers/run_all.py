import os
import sys
import glob
import subprocess
import time

def run_all():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    scripts = glob.glob(os.path.join(current_dir, "scrape_*.py"))
    
    # Sort them to run in a predictable alphabetical order
    scripts = sorted(scripts)
    
    print(f"Found {len(scripts)} scraper scripts to run.")
    
    success_count = 0
    failure_count = 0
    
    start_time = time.time()
    
    for idx, script in enumerate(scripts, 1):
        script_name = os.path.basename(script)
        print(f"\n==================================================")
        print(f"[{idx}/{len(scripts)}] Running {script_name}")
        print(f"==================================================")
        
        try:
            # Execute as a separate process to keep environments clean and isolated
            result = subprocess.run(
                [sys.executable, script_name],
                cwd=current_dir,
                capture_output=True,
                text=True,
                check=True,
                timeout=300
            )
            print(result.stdout)
            success_count += 1
        except subprocess.CalledProcessError as e:
            print(f"FAILED running {script_name}:")
            print(e.stdout)
            print(e.stderr)
            failure_count += 1
            
        # Small sleep between requests to be respectful to Wikipedia API and servers
        time.sleep(0.5)
        
    duration = time.time() - start_time
    print(f"\n==================================================")
    print(f"Execution Summary:")
    print(f"Total Scrapers Run: {len(scripts)}")
    print(f"Successful: {success_count}")
    print(f"Failed: {failure_count}")
    print(f"Total Time Taken: {duration:.2f} seconds")
    print(f"==================================================")

if __name__ == '__main__':
    run_all()
