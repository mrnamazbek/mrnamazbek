FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run pipeline first, then start the API server.
CMD ["sh", "-c", "python pipeline.py && uvicorn api:app --host 0.0.0.0 --port 8000"]
