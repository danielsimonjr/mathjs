import subprocess
import re
from collections import defaultdict

# Get all TypeScript errors
result = subprocess.run(['npx', 'tsc', '--noEmit'], 
                       capture_output=True, text=True, timeout=120)

errors_by_file = defaultdict(lambda: defaultdict(int))
total_by_file = defaultdict(int)

# Parse errors: filename(line,col): error TSXXXX: message
for line in result.stderr.split('\n'):
    match = re.match(r'^([^(]+)\(\d+,\d+\): error (TS\d+):', line)
    if match:
        filename = match.group(1)
        error_code = match.group(2)
        errors_by_file[filename][error_code] += 1
        total_by_file[filename] += 1

# Sort by total error count
sorted_files = sorted(total_by_file.items(), key=lambda x: x[1], reverse=True)

print("TOP 30 FILES WITH MOST ERRORS:")
print("=" * 100)
print(f"{'File':<60} {'Total':<8} Error Breakdown")
print("=" * 100)

for filename, total in sorted_files[:30]:
    breakdown = ', '.join([f"{code}:{count}" for code, count in 
                          sorted(errors_by_file[filename].items(), 
                                key=lambda x: x[1], reverse=True)[:5]])
    print(f"{filename:<60} {total:<8} {breakdown}")
