

Step 1: run chromaDB server in docket
docker -> containers run karo

Powershell -> docker run -p 8000:8000 ghcr.io/chroma-core/chroma:latest

Step 2: run ollama mistral

ollama run mistral

Step 3: node app.js , then node chat.js