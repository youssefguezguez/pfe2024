// static/js/chat.js

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (message === '') return;

    displayMessage('You', message);
    userInput.value = '';

    showLoadingIndicator();
    
    fetch('/get_ai_response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        hideLoadingIndicator();
        displayMessage('Hannibal Barca', data.response);
        try {
            speakResponse(data.response);
        } catch (error) {
            console.error('Error in text-to-speech:', error);
        }
        
        if (document.getElementById('history-container').style.display !== 'none') {
            const historyEntry = document.createElement('div');
            historyEntry.innerHTML = `
                <p><strong>You:</strong> ${message}</p>
                <p><strong>Hannibal Barca:</strong> ${data.response}</p>
                <hr>
            `;
            document.getElementById('history-container').prepend(historyEntry);
        }
    })
    .catch((error) => {
        hideLoadingIndicator();
        console.error('Error:', error);
        showErrorMessage('An error occurred. Please try again.');
    });
}

function displayMessage(sender, message) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('p');
    messageElement.textContent = `${sender}: ${message}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showLoadingIndicator() {
    document.getElementById('loading-indicator').style.display = 'block';
}

function hideLoadingIndicator() {
    document.getElementById('loading-indicator').style.display = 'none';
}

function showErrorMessage(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000); // Hide the error message after 5 seconds
}

function speakResponse(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    } else {
        console.log('Text-to-speech not supported in this browser');
    }
}

// Event listener for the send button
document.getElementById('send-btn').addEventListener('click', sendMessage);

// Event listener for Enter key in the input field
document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});
