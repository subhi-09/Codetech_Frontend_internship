function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function saveMessageHistory(history) {
    localStorage.setItem('chatHistory', JSON.stringify(history.slice(-100)));
}

function loadMessageHistory() {
    const savedHistory = localStorage.getItem('chatHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
}

export { formatTime, saveMessageHistory, loadMessageHistory };