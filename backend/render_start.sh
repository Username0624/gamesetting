#!/bin/bash
export PYTHONUNBUFFERED=true

# Install Python dependencies
pip install -r requirements.txt

# Start Flask
python app.py
