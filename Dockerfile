# Use official lightweight Python image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 8080

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY backend/requirements.txt /app/backend-requirements.txt
COPY agents/requirements.txt /app/agents-requirements.txt

# Install python dependencies
RUN pip install --no-cache-dir -r /app/backend-requirements.txt
RUN pip install --no-cache-dir -r /app/agents-requirements.txt
RUN pip install --no-cache-dir gunicorn psycopg2-binary uvicorn

# Copy backend and agents code
COPY backend /app/backend
COPY agents /app/agents

# SQLite database is already in backend/khidmat.db, so it will be copied inside /app/backend/khidmat.db

# Set active working directory to /app/backend
WORKDIR /app/backend

# Expose port (Cloud Run automatically injects PORT env variable)
EXPOSE 8080

# Command to run on container start using Gunicorn with Uvicorn workers
CMD exec gunicorn --bind :$PORT --workers 1 --worker-class uvicorn.workers.UvicornWorker --threads 8 main:app
