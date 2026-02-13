# Use the official Python image from the Docker Hub
FROM python:3.10-slim

# Install system dependencies for psycopg2 and other packages
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
# Hugging Face Spaces uses /app by default
WORKDIR /app

# Copy the requirements file into the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code into the container
COPY . .

# Set environment variables
# Hugging Face Spaces runs on port 7860 by default
ENV PORT=7860
ENV HOST=0.0.0.0
# Ensure python can find modules in the current directory
ENV PYTHONPATH=/app

# Expose the port the app runs on
EXPOSE 7860

# Command to run the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]