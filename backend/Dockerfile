# Use an official lightweight Python runtime
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Copy all files to the container
COPY . .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose the expected port
EXPOSE 5000  

# Run the Flask app
CMD ["python", "server.py"]