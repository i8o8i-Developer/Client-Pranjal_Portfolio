# Use Official Python Image
FROM python:3.11-slim

# Set Working Directory
WORKDIR /app

# Install System Dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy Requirements And Install Python Dependencies
COPY Requirements.txt .
RUN pip install --no-cache-dir -r Requirements.txt

# Copy Application Code
COPY . .

# Create Uploads Directory
RUN mkdir -p Uploads

# Expose Port
EXPOSE 8000

# Run The Application
CMD ["uvicorn", "App.Main:app", "--host", "0.0.0.0", "--port", "8000"]