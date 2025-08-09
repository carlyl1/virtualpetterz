#!/bin/bash

# Check if netlify-cli is installed
if ! command -v netlify &> /dev/null
then
    echo "Netlify CLI not found. Installing..."
    npm install -g netlify-cli
fi

echo "Starting Netlify Dev Server..."
echo "This will run both Vite and Netlify Functions locally"
echo ""
echo "NOTE: For AI chat to work locally, you need to set environment variables:"
echo "  1. Create a .env file in the project root"
echo "  2. Add your HuggingFace API key:"
echo "     HF_API_KEY=your_huggingface_api_key_here"
echo "     HF_MODEL_URL=https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
echo ""

# Run netlify dev which will start both the functions server and vite
netlify dev