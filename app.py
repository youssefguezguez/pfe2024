from flask import Flask, render_template, request, jsonify, session, send_file
from flask_socketio import SocketIO, emit
from openai import OpenAI
from config import OPENAI_API_KEY, LANGCHAIN_API_KEY, ELEVENLABS_API_KEY
import uuid
import requests
import os
import threading
import time

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_generated_secret_key'
socketio = SocketIO(app)

client = OpenAI(api_key=OPENAI_API_KEY)

# In-memory storage for conversations
conversations = {}

# Hannibal Barca system message
system_message = """You are Hannibal Barca, the famous Carthaginian general. You are known for your strategic brilliance in the Second Punic War against Rome. Answer questions and engage in conversation as Hannibal, using your knowledge of the ancient world, your military campaigns, and your experiences. You need to talk in a brief and short text. You can talk in English, Arabic and French."""

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/video_call')
def video_call():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
    return render_template('video_call.html')

@app.route('/get_ai_response', methods=['POST'])
def get_ai_response():
    user_message = request.json['message']
    user_id = session.get('user_id')
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            temperature=1
        )
        ai_response = response.choices[0].message.content
        
        # Store the conversation
        if user_id not in conversations:
            conversations[user_id] = []
        conversations[user_id].append({"user": user_message, "ai": ai_response})
        
        return jsonify({"response": ai_response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_conversation_history')
def get_conversation_history():
    user_id = session.get('user_id')
    if user_id and user_id in conversations:
        return jsonify(conversations[user_id])
    return jsonify([])

@app.route('/generate_tts', methods=['POST'])
def generate_tts():
    ai_text = request.json['text']
    tts_endpoint = 'https://api.elevenlabs.io/v1/text-to-speech/VR6AewLTigWG4xSOukaG/stream'
    
    headers = {
         "Accept": "application/json",
         "xi-api-key": ELEVENLABS_API_KEY
    }
    
    data = {
        "text": ai_text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8,
            "style": 0.0,
            "use_speaker_boost": True
        }
}
    
    response = requests.post(tts_endpoint, json=data, headers=headers)
    
    if response.status_code == 200:
        audio_filename = f'{uuid.uuid4()}.mp3'
        audio_path = os.path.join('static', 'audio', audio_filename)
        
        with open(audio_path, 'wb') as f:
            f.write(response.content)

        # remove file after time
        threading.Timer(120, os.remove, args=[audio_path]).start()
            
        return jsonify({"audio_url": f'/static/audio/{audio_filename}'})
    else:
        print("thisssss issss error \n"+response.text)
        return jsonify({"error": response.text}), 500

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    # Create the static/audio directory if it doesn't exist
    if not os.path.exists('static/audio'):
        os.makedirs('static/audio')
    
    socketio.run(app, debug=True)