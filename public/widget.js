(function() {
  // Mendio Chat Widget v1.0
  'use strict';

  // Configuration
  const WIDGET_API_URL = 'https://myaiguy.com/api/bots/chat';
  const WIDGET_STYLES_URL = 'https://myaiguy.com/widget-styles.css';
  
  // Get bot ID from script tag
  const currentScript = document.currentScript || document.querySelector('script[data-bot-id]');
  const botId = currentScript ? currentScript.getAttribute('data-bot-id') : null;
  
  if (!botId) {
    console.error('Mendio Widget: No bot ID provided');
    return;
  }

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'mendio-widget-container';
  widgetContainer.innerHTML = `
    <div id="mendio-widget-button" class="mendio-widget-button">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
        <path d="M7 9H17V11H7V9ZM7 13H14V15H7V13Z" fill="white"/>
      </svg>
      <span class="mendio-unread-badge" style="display: none;">1</span>
    </div>
    <div id="mendio-widget-chat" class="mendio-widget-chat" style="display: none;">
      <div class="mendio-chat-header">
        <div class="mendio-chat-header-content">
          <div class="mendio-chat-title">Chat with us</div>
          <div class="mendio-chat-subtitle">We typically reply within minutes</div>
        </div>
        <button id="mendio-close-chat" class="mendio-close-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <div id="mendio-messages" class="mendio-messages">
        <div class="mendio-message mendio-bot-message">
          <div class="mendio-message-content">Hi! How can I help you today?</div>
        </div>
      </div>
      <form id="mendio-chat-form" class="mendio-chat-form">
        <input 
          type="text" 
          id="mendio-message-input" 
          class="mendio-message-input" 
          placeholder="Type your message..."
          autocomplete="off"
        />
        <button type="submit" class="mendio-send-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 10L18 2L10 18L8 11L2 10Z" fill="currentColor"/>
          </svg>
        </button>
      </form>
    </div>
  `;

  // Inject styles
  const styles = `
    #mendio-widget-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .mendio-widget-button {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      background: #000;
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.2s, box-shadow 0.2s;
      position: relative;
    }

    .mendio-widget-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .mendio-unread-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      font-size: 12px;
      font-weight: bold;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 20px;
      text-align: center;
    }

    .mendio-widget-chat {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 100px);
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: mendio-slide-up 0.3s ease-out;
    }

    @keyframes mendio-slide-up {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .mendio-chat-header {
      background: #000;
      color: white;
      padding: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mendio-chat-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .mendio-chat-subtitle {
      font-size: 14px;
      opacity: 0.8;
    }

    .mendio-close-button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .mendio-close-button:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .mendio-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .mendio-message {
      max-width: 70%;
      word-wrap: break-word;
    }

    .mendio-bot-message {
      align-self: flex-start;
    }

    .mendio-user-message {
      align-self: flex-end;
    }

    .mendio-message-content {
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 14px;
      line-height: 1.5;
    }

    .mendio-bot-message .mendio-message-content {
      background: #f3f4f6;
      color: #111827;
    }

    .mendio-user-message .mendio-message-content {
      background: #000;
      color: white;
    }

    .mendio-chat-form {
      padding: 20px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;
    }

    .mendio-message-input {
      flex: 1;
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }

    .mendio-message-input:focus {
      border-color: #000;
    }

    .mendio-send-button {
      background: #000;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: opacity 0.2s;
    }

    .mendio-send-button:hover {
      opacity: 0.8;
    }

    .mendio-send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .mendio-typing-indicator {
      display: flex;
      gap: 4px;
      padding: 12px 16px;
      background: #f3f4f6;
      border-radius: 12px;
      width: fit-content;
    }

    .mendio-typing-dot {
      width: 8px;
      height: 8px;
      background: #6b7280;
      border-radius: 50%;
      animation: mendio-typing 1.4s infinite;
    }

    .mendio-typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }

    .mendio-typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }

    @keyframes mendio-typing {
      0%, 60%, 100% {
        opacity: 0.3;
      }
      30% {
        opacity: 1;
      }
    }

    @media (max-width: 480px) {
      .mendio-widget-chat {
        width: 100vw;
        height: 100vh;
        max-height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
      
      #mendio-widget-container {
        bottom: 0;
        right: 0;
      }
      
      .mendio-widget-button {
        bottom: 20px;
        right: 20px;
        position: fixed;
      }
    }
  `;

  // Inject styles into page
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // State management
  let isOpen = false;
  let messages = [];
  let sessionId = null;

  // Load bot configuration
  async function loadBotConfig() {
    try {
      const response = await fetch(`https://myaiguy.com/api/bots/${botId}/config`);
      if (response.ok) {
        const config = await response.json();
        // Apply custom branding
        if (config.brand?.primaryColor) {
          document.documentElement.style.setProperty('--mendio-primary', config.brand.primaryColor);
        }
        // Update welcome message
        if (config.welcomeMessage) {
          document.querySelector('.mendio-bot-message .mendio-message-content').textContent = config.welcomeMessage;
        }
        // Update header title
        if (config.name) {
          document.querySelector('.mendio-chat-title').textContent = config.name;
        }
      }
    } catch (error) {
      console.error('Failed to load bot config:', error);
    }
  }

  // DOM elements
  const widgetButton = document.getElementById('mendio-widget-button');
  const widgetChat = document.getElementById('mendio-widget-chat');
  const closeButton = document.getElementById('mendio-close-chat');
  const chatForm = document.getElementById('mendio-chat-form');
  const messageInput = document.getElementById('mendio-message-input');
  const messagesContainer = document.getElementById('mendio-messages');

  // Event handlers
  widgetButton.addEventListener('click', () => {
    isOpen = true;
    widgetChat.style.display = 'flex';
    widgetButton.style.display = 'none';
    messageInput.focus();
    // Clear unread badge
    const badge = document.querySelector('.mendio-unread-badge');
    if (badge) badge.style.display = 'none';
  });

  closeButton.addEventListener('click', () => {
    isOpen = false;
    widgetChat.style.display = 'none';
    widgetButton.style.display = 'flex';
  });

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message to UI
    addMessage(message, 'user');
    messageInput.value = '';

    // Show typing indicator
    showTypingIndicator();

    try {
      // Send message to API
      const response = await fetch(WIDGET_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          botId,
          history: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          sessionId,
          locale: navigator.language
        })
      });

      hideTypingIndicator();

      if (response.ok) {
        const data = await response.json();
        if (data.sessionId && !sessionId) {
          sessionId = data.sessionId;
        }
        addMessage(data.reply, 'bot');
      } else {
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
      }
    } catch (error) {
      hideTypingIndicator();
      addMessage('Sorry, I couldn\'t connect to the server. Please try again.', 'bot');
    }
  });

  function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `mendio-message mendio-${role}-message`;
    messageDiv.innerHTML = `<div class="mendio-message-content">${escapeHtml(content)}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Save to history
    messages.push({ role: role === 'bot' ? 'assistant' : 'user', content });
    
    // Show unread badge if chat is closed and bot sent a message
    if (!isOpen && role === 'bot') {
      const badge = document.querySelector('.mendio-unread-badge');
      if (badge) {
        badge.style.display = 'block';
        badge.textContent = '1';
      }
    }
  }

  function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'mendio-message mendio-bot-message';
    indicator.id = 'mendio-typing-indicator';
    indicator.innerHTML = `
      <div class="mendio-typing-indicator">
        <div class="mendio-typing-dot"></div>
        <div class="mendio-typing-dot"></div>
        <div class="mendio-typing-dot"></div>
      </div>
    `;
    messagesContainer.appendChild(indicator);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function hideTypingIndicator() {
    const indicator = document.getElementById('mendio-typing-indicator');
    if (indicator) indicator.remove();
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Initialize
  document.body.appendChild(widgetContainer);
  loadBotConfig();

  // Store session in localStorage
  const storageKey = `mendio-session-${botId}`;
  const savedSession = localStorage.getItem(storageKey);
  if (savedSession) {
    try {
      const parsed = JSON.parse(savedSession);
      sessionId = parsed.sessionId;
      messages = parsed.messages || [];
    } catch (e) {
      // Invalid session data
    }
  }

  // Save session on unload
  window.addEventListener('beforeunload', () => {
    if (sessionId || messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify({
        sessionId,
        messages: messages.slice(-10) // Keep last 10 messages
      }));
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Shift + M to toggle chat
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
      if (isOpen) {
        closeButton.click();
      } else {
        widgetButton.click();
      }
    }
  });
})();