class ChatApp {
    constructor() {
        // Use a more reliable test WebSocket server
        this.socket = new WebSocket('wss://ws.postman-echo.com/raw');
        this.messageHistory = [];
        this.initElements();
        this.initEventListeners();
        this.initWebSocket();
        
        // Initialize with any saved history
        this.loadInitialHistory();
    }

    initElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.connectionStatus = document.getElementById('connectionStatus');
    }

    initEventListeners() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    initWebSocket() {
        this.socket.onopen = () => {
            this.connectionStatus.textContent = '(Connected)';
            this.connectionStatus.style.color = '#4CAF50';
            this.addInfoMessage('Connected to chat server');
        };

        this.socket.onclose = () => {
            this.connectionStatus.textContent = '(Disconnected)';
            this.connectionStatus.style.color = '#F44336';
            this.addInfoMessage('Disconnected from chat server');
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.messageHistory.push(message);
                this.saveMessageHistory();
                this.displayMessage(message);
            } catch (e) {
                // For servers that don't return JSON
                const message = {
                    type: 'message',
                    text: event.data,
                    sender: 'Server',
                    timestamp: new Date().toISOString()
                };
                this.messageHistory.push(message);
                this.saveMessageHistory();
                this.displayMessage(message);
            }
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.addInfoMessage('Connection error');
        };
    }

    loadInitialHistory() {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
            try {
                this.messageHistory = JSON.parse(savedHistory);
                this.messageHistory.forEach(msg => this.displayMessage(msg));
            } catch (e) {
                console.error('Error loading history:', e);
                localStorage.removeItem('chatHistory');
            }
        }
    }

    saveMessageHistory() {
        localStorage.setItem('chatHistory', JSON.stringify(this.messageHistory.slice(-100)));
    }

    sendMessage() {
        const text = this.messageInput.value.trim();
        if (text === '') return;
        
        const message = {
            type: 'message',
            text: text,
            sender: 'You',
            timestamp: new Date().toISOString()
        };
        
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
            // Display immediately for better UX
            this.displayMessage(message);
            this.messageHistory.push(message);
            this.saveMessageHistory();
        } else {
            this.addInfoMessage('Cannot send message - not connected to server');
            // Store offline messages
            message.type = 'offline-message';
            this.messageHistory.push(message);
            this.saveMessageHistory();
        }
        
        this.messageInput.value = '';
    }

    displayMessage(message) {
        const messageElement = document.createElement('div');
        
        if (message.type === 'info') {
            messageElement.className = 'message info-message';
            messageElement.textContent = message.text;
        } else if (message.type === 'offline-message') {
            messageElement.className = 'message offline-message';
            messageElement.innerHTML = `
                <div class="message-text">${message.text}</div>
                <span class="message-time">${this.formatTime(message.timestamp)} (offline)</span>
            `;
        } else {
            messageElement.className = `message ${message.sender === 'You' ? 'sent' : 'received'}`;
            messageElement.innerHTML = `
                <div class="message-sender">${message.sender}</div>
                <div class="message-text">${message.text}</div>
                <span class="message-time">${this.formatTime(message.timestamp)}</span>
            `;
        }
        
        this.chatMessages.appendChild(messageElement);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    addInfoMessage(text) {
        const message = {
            type: 'info',
            text: text,
            timestamp: new Date().toISOString()
        };
        this.displayMessage(message);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
});