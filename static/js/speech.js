// static/js/speech.js

let recognition;

function setupSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('user-input').value = transcript;
            sendMessage();
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
        };
    } else {
        console.log('Speech recognition not supported');
        document.getElementById('voice-input-btn').style.display = 'none';
    }
}

document.getElementById('voice-input-btn').addEventListener('click', function() {
    if (recognition) {
        recognition.start();
    }
});

setupSpeechRecognition();