FROM python:3.9-slim

WORKDIR /app

# First copy requirements to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all other files from current directory
COPY . .

CMD ["uvicorn", "testinng_api:app", "--host", "0.0.0.0", "--port", "8000"]