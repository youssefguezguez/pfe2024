// static/js/history.js

function toggleHistory() {
    const historyContainer = document.getElementById('history-container');
    if (historyContainer.style.display === 'none') {
        fetchAndDisplayHistory();
    } else {
        historyContainer.style.display = 'none';
    }
}

function fetchAndDisplayHistory() {
    fetch('/get_conversation_history')
        .then(response => response.json())
        .then(history => {
            displayHistory(history);
        })
        .catch(error => {
            console.error('Error fetching history:', error);
            showErrorMessage('Failed to fetch conversation history');
        });
}

function displayHistory(history) {
    const historyContainer = document.getElementById('history-container');
    historyContainer.innerHTML = '';
    historyContainer.style.display = 'block';

    if (history.length === 0) {
        historyContainer.textContent = 'No conversation history.';
        return;
    }

    history.forEach((entry, index) => {
        const entryElement = document.createElement('div');
        entryElement.innerHTML = `
            <p><strong>You:</strong> ${entry.user}</p>
            <p><strong>Hannibal Barca:</strong> ${entry.ai}</p>
            <hr>
        `;
        historyContainer.appendChild(entryElement);
    });
}