# Use Python 3.13 as the base image
FROM python:3.13-slim

# Set the working directory
WORKDIR /app

# Install system dependencies for Python packages
RUN apt-get update && apt-get install -y 
    build-essential 
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
# We copy from the Backend folder specifically
COPY Backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Backend and Authentication folders into the container
COPY Backend ./Backend
COPY Authentication ./Authentication

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/Backend

# Move to the Backend directory to run the application
WORKDIR /app/Backend

# Start the application on port 7860 (Hugging Face Requirement)
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
