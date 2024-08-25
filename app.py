from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, emit
from openai import OpenAI
from config import OPENAI_API_KEY, LANGCHAIN_API_KEY
import uuid

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

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

if __name__ == '__main__':
    socketio.run(app, debug=True)