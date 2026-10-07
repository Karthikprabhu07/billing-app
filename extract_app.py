import os
import io

log_path = r"C:\Users\devil\.gemini\antigravity\brain\cd31a973-e9bf-475e-8b2e-74f981113d46\.system_generated\logs\overview.txt"
with open(log_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We look for the last occurrence of the App.jsx file in the user prompt
start_idx = content.rfind("import { useState, useEffect, useRef, useCallback } from \"react\";")
if start_idx != -1:
    code = content[start_idx:]
    code = code.split("</USER_REQUEST>")[0].strip()
    
    with open(r"c:\Users\devil\.gemini\antigravity\scratch\karthik-billing-app\src\App.jsx", "w", encoding='utf-8') as f:
        f.write(code)
    print("Successfully extracted App.jsx from logs")
else:
    print("Error: Could not find block in logs")
