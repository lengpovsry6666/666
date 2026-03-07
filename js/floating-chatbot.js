/**
 * Lightweight Floating Chatbot for Aigrit Website
 * Site-wide implementation with minimal footprint
 */

class FloatingChatbot {
    constructor() {
        this.isOpen = false;
        this.isMinimized = false;
        this.conversationHistory = [];
        this.sessionId = this.generateSessionId();
        this.unreadCount = 0;
        
        // Knowledge base for quick responses
        this.responses = {
            greetings: [
                "Hello! 👋 I'm the Aigrit Support Assistant. How can I help you today?",
                "Hi there! I'm here to help with any questions about our drone delivery service.",
                "Greetings! What would you like to know about Aigrit's AI-powered bread delivery?"
            ],
            delivery: [
                "Our drone delivery takes 25-30 minutes! Our AI optimizes routes for the fastest, freshest delivery to your doorstep.",
                "Delivery time is 25-30 minutes standard. We serve Brussels area with eco-friendly autonomous drones.",
                "Fresh bread delivered in 25-30 minutes! Our drones use AI route optimization for speedy service."
            ],
            pricing: [
                "Delivery fees: €1.50-€3.00 based on distance. Free delivery over €25 and for subscribers!",
                "Cost-effective delivery: €1.50-€3.00 range. Special deals for bulk orders and subscriptions.",
                "Affordable pricing: €1.50-€3.00 delivery fees. Free shipping on orders over €25!"
            ],
            safety: [
                "Absolutely safe! Our drones have collision avoidance, redundant systems, and 24/7 monitoring.",
                "Safety first! Military-grade protocols with automatic emergency procedures and real-time oversight.",
                "Your safety matters! Advanced sensors and backup systems ensure reliable, secure deliveries."
            ],
            contact: [
                "Reach us anytime! Call 099 499 746 or email lengpovsry666@gmail.com. We're here 24/7!",
                "Contact options: Phone 099 499 746 • Email lengpovsry666@gmail.com • Available 24/7",
                "Get in touch! 24/7 support via phone (099 499 746) or email (lengpovsry666@gmail.com)"
            ],
            default: [
                "I'd be happy to help with that! For specific details, please contact our support team at 099 499 746 or visit our Contact page.",
                "That's a great question! For detailed information, I recommend reaching out to our customer service team directly.",
                "I can help with general inquiries about our service! For specialized questions, please contact our support team."
            ]
        };

        this.keywords = {
            delivery: ['delivery', 'deliver', 'shipping', 'time', 'fast', 'quick', 'minutes'],
            pricing: ['price', 'cost', 'fee', 'charge', 'money', 'payment', 'expensive', 'cheap'],
            safety: ['safe', 'safety', 'secure', 'danger', 'risk', 'accident', 'drone'],
            contact: ['contact', 'call', 'phone', 'email', 'support', 'help'],
            greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon']
        };

        this.init();
    }

    generateSessionId() {
        return 'fc_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    init() {
        this.createFloatingButton();
        this.createChatWindow();
        this.setupEventListeners();
        this.loadInitialGreeting();
    }

    createFloatingButton() {
        // Create floating button
        this.floatingButton = document.createElement('div');
        this.floatingButton.className = 'floating-chat-button';
        this.floatingButton.innerHTML = `
            <div class="chat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92176 4.44061 8.37485 5.27072 7.03254C6.10083 5.69023 7.28825 4.60558 8.7 3.9C9.87812 3.30493 11.1801 2.99656 12.5 3C14.0782 3.00061 15.6251 3.44061 16.9674 4.27072C18.3098 5.10083 19.3944 6.28825 20.1 7.7C20.6951 8.87812 21.0034 10.1801 21 11.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 12H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M8 16H12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </div>
            <div class="unread-badge" style="display: none;">0</div>
        `;

        document.body.appendChild(this.floatingButton);
    }

    createChatWindow() {
        // Determine the correct image path based on current location
        const imagePath = window.location.pathname.includes('/pages/') ? '../images/earth.png' : 'images/earth.png';
        
        // Create chat window
        this.chatWindow = document.createElement('div');
        this.chatWindow.className = 'floating-chat-window';
        this.chatWindow.innerHTML = `
            <div class="chat-header">
                <div class="header-info">
                    <div class="agent-avatar">
                        <img src="${imagePath}" alt="Aigrit AI">
                    </div>
                    <div class="agent-info">
                        <h4>Aigrit Support</h4>
                        <p class="status">Online • Responds instantly</p>
                    </div>
                </div>
            </div>
            <div class="chat-messages" id="floatingChatMessages">
                <!-- Messages will be added here -->
            </div>
            <div class="chat-input-area">
                <div class="input-container">
                    <input type="text" class="chat-input" placeholder="Type your message..." maxlength="300">
                    <button class="send-btn" disabled>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div class="quick-suggestions">
                    <button class="suggestion-chip" data-message="Delivery time?">⏱️ Delivery time?</button>
                    <button class="suggestion-chip" data-message="Pricing info">💰 Pricing</button>
                    <button class="suggestion-chip" data-message="Contact support">📞 Contact</button>
                </div>
            </div>
        `;

        document.body.appendChild(this.chatWindow);
    }

    setupEventListeners() {
        // Floating button events
        this.floatingButton.addEventListener('click', () => this.toggleChat());

        // Chat window events
        const input = this.chatWindow.querySelector('.chat-input');
        const sendBtn = this.chatWindow.querySelector('.send-btn');
        const suggestionChips = this.chatWindow.querySelectorAll('.suggestion-chip');

        sendBtn.addEventListener('click', () => this.sendMessage(input.value));

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage(input.value);
            }
        });

        input.addEventListener('input', () => {
            sendBtn.disabled = !input.value.trim();
        });

        // Quick suggestion chips
        suggestionChips.forEach(chip => {
            chip.addEventListener('click', () => {
                const message = chip.dataset.message;
                input.value = message;
                this.sendMessage(message);
            });
        });

        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.chatWindow.contains(e.target) && 
                !this.floatingButton.contains(e.target) && 
                this.isOpen) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        this.floatingButton.style.display = 'none';
        this.chatWindow.style.display = 'flex';
        this.chatWindow.classList.add('chat-open');
        
        // Focus input
        setTimeout(() => {
            this.chatWindow.querySelector('.chat-input').focus();
        }, 300);

        // Clear unread count
        this.clearUnreadBadge();
    }

    closeChat() {
        this.isOpen = false;
        this.floatingButton.style.display = 'flex';
        this.chatWindow.style.display = 'none';
        this.chatWindow.classList.remove('chat-open');
    }

    async sendMessage(message) {
        const trimmedMessage = message.trim();
        if (!trimmedMessage) return;

        // Clear input
        const input = this.chatWindow.querySelector('.chat-input');
        const sendBtn = this.chatWindow.querySelector('.send-btn');
        input.value = '';
        sendBtn.disabled = true;

        // Add user message
        this.addMessage(trimmedMessage, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
            
            // Get response
            const response = this.generateResponse(trimmedMessage);
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Add bot response
            this.addMessage(response, 'bot');
            
            // Add to history
            this.conversationHistory.push({
                user: trimmedMessage,
                bot: response,
                timestamp: Date.now()
            });

        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage("Sorry, I'm having trouble responding right now. Please try again.", 'bot');
        }
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for greetings
        if (this.keywords.greeting.some(word => lowerMessage.includes(word))) {
            return this.getRandomResponse('greetings');
        }

        // Check for specific topics
        for (const [topic, keywords] of Object.entries(this.keywords)) {
            if (topic === 'greeting') continue;
            
            if (keywords.some(word => lowerMessage.includes(word))) {
                return this.getRandomResponse(topic);
            }
        }

        // Default response
        return this.getRandomResponse('default');
    }

    getRandomResponse(type) {
        const responses = this.responses[type] || this.responses.default;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    addMessage(text, sender) {
        const messagesContainer = document.getElementById('floatingChatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${sender}`;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.textContent = text;
        
        messageDiv.appendChild(content);
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Add animation
        setTimeout(() => {
            messageDiv.classList.add('visible');
        }, 10);

        // Show unread badge if chat is closed
        if (!this.isOpen && sender === 'bot') {
            this.incrementUnreadBadge();
        }
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('floatingChatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message message-bot typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    incrementUnreadBadge() {
        this.unreadCount++;
        const badge = this.floatingButton.querySelector('.unread-badge');
        badge.textContent = this.unreadCount;
        badge.style.display = 'block';
    }

    clearUnreadBadge() {
        this.unreadCount = 0;
        const badge = this.floatingButton.querySelector('.unread-badge');
        badge.style.display = 'none';
    }

    loadInitialGreeting() {
        setTimeout(() => {
            if (!this.isOpen) {
                this.addMessage("Hi! I'm your Aigrit assistant. Click the chat button anytime for help with our drone delivery service!", 'bot');
            }
        }, 3000);
    }

    // Public methods
    destroy() {
        if (this.floatingButton) this.floatingButton.remove();
        if (this.chatWindow) this.chatWindow.remove();
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.aigritFloatingChatbot = new FloatingChatbot();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FloatingChatbot;
}