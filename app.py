from flask import Flask, request, jsonify
import requests
import os
import feedparser

app = Flask(__name__)

# ReliefWeb RSS Feed URL
RELIEFWEB_RSS_URL = "https://feeds.reliefweb.int/rss/disasters"

# Mistral API (Replace with actual API Key)
MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
MISTRAL_API_KEY = os.getenv(v7FUsj9Tzxj46C5sm8XLVgMFGcpx4q2X)

# REST API for sending alerts (Replace with actual URL)
USER_API_URL = "https://your-api.com/send-alert"

# Fetch latest disasters from ReliefWeb
@app.route("/disasters", methods=["GET"])
def get_disasters():
    feed = feedparser.parse(RELIEFWEB_RSS_URL)
    disasters = [
        {
            "id": entry.id,
            "title": entry.title,
            "description": entry.summary,
            "published": entry.published,
            "link": entry.link,
        }
        for entry in feed.entries
    ]
    return jsonify(disasters)

@app.route("/users", methods=["GET"])
def get_users():
    users = [
        {"id": "user123", "name": "Alice Johnson"},
        {"id": "user456", "name": "Bob Smith"},
        {"id": "user789", "name": "Charlie Lee"},
    ]
    return jsonify(users)


# Analyze disaster with Mistral AI
@app.route("/analyze", methods=["POST"])
def analyze_disaster():
    data = request.json
    text = data.get("text", "")

    mistral_payload = {
        "model": "mistral-medium",
        "messages": [
            {
                "role": "system",
                "content": "Extract disaster details including type, location, severity, and provide a relevant excerpt.",
            },
            {"role": "user", "content": text},
        ],
    }

    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json",
    }

    mistral_response = requests.post(MISTRAL_API_URL, json=mistral_payload, headers=headers)
    response_json = mistral_response.json()

    # Extract structured data + excerpt from Mistral response
    structured_data = response_json.get("choices", [{}])[0].get("message", {}).get("content", {})

    return jsonify(structured_data)

# Send alert to REST API for specific user_ids
@app.route("/send-alert", methods=["POST"])
def send_alert():
    data = request.json
    selected_user_ids = data.get("selected_user_ids", [])
    message = data.get("message", "Disaster Alert!")

    payload = {
        "user_ids": selected_user_ids,
        "alert_message": message
    }

    response = requests.post(USER_API_URL, json=payload)

    if response.status_code == 200:
        return jsonify({"status": "Success", "message": "Alerts sent!"}), 200
    else:
        return jsonify({"status": "Failed", "message": "Error sending alerts"}), 500

if __name__ == "__main__":
    app.run(debug=True)


    
