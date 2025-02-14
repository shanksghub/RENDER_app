from flask import Flask, request, jsonify
import requests
import boto3
import os
import feedparser

app = Flask(__name__)

# AWS SNS Setup (Replace with your region)
sns = boto3.client("sns", region_name="ap-south-1")

# ReliefWeb RSS Feed
RELIEFWEB_RSS_URL = "https://feeds.reliefweb.int/rss/disasters"

# Mistral API (Replace with actual endpoint & API Key)
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_API_KEY = os.getenv(v7FUsj9Tzxj46C5sm8XLVgMFGcpx4q2X)

# Fetch latest disasters from ReliefWeb RSS Feed
@app.route("/disasters", methods=["GET"])
def get_disasters():
    feed = feedparser.parse(RELIEFWEB_RSS_URL)
    
    disasters = []
    for entry in feed.entries:
        disasters.append({
            "id": entry.id,
            "title": entry.title,
            "description": entry.summary,
            "published": entry.published,
            "link": entry.link
        })
    
    return jsonify(disasters)

# Process disaster info with Mistral AI
@app.route("/analyze", methods=["POST"])
def analyze_disaster():
    data = request.json
    text = data.get("text", "")
    
    mistral_payload = {
        "model": "mistral-medium",
        "messages": [
            {"role": "system", "content": "Extract disaster details including type, location, severity, and a relevant excerpt."},
            {"role": "user", "content": text}
        ]
    }
    
    headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}", "Content-Type": "application/json"}
    
    mistral_response = requests.post(MISTRAL_API_URL, json=mistral_payload, headers=headers)
    structured_data = mistral_response.json().get("choices", [{}])[0].get("message", {}).get("content", {})
    
    return jsonify(structured_data)

# Send alert after approval
@app.route("/send-alert", methods=["POST"])
def send_alert():
    data = request.json
    message = data.get("message", "Disaster alert!")
    phone_numbers = data.get("selected_users", [])  # List of phone numbers
    
    for phone in phone_numbers:
        sns.publish(PhoneNumber=phone, Message=message)
    
    return jsonify({"status": "Success", "message": "Alerts sent"})

if __name__ == "__main__":
    app.run(debug=True)
