#!/bin/bash
# Start the FastAPI backend
cd "$(dirname "$0")/../backend"
echo "🚀 Starting Smart ID Card Detection Backend..."
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""
pip install -r requirements.txt -q 2>/dev/null
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
