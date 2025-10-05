# Use Python runtime as base image
FROM python:3.9-slim

# Install system dependencies for OpenDSS
RUN apt-get update && apt-get install -y \
    build-essential \
    gfortran \
    libgfortran5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Python requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js for the hybrid approach
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Copy package.json and install Node dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start the Node.js server (which will call Python)
CMD ["node", "server.js"]