(function() {
  'use strict';
  
  // Get bot ID from script tag
  const currentScript = document.currentScript || document.querySelector('script[data-bot-id]');
  const botId = currentScript?.getAttribute('data-bot-id');
  
  if (!botId) {
    console.error('Mendio Widget: Missing data-bot-id attribute');
    return;
  }

  const API_BASE = currentScript?.src?.includes('localhost') 
    ? 'http://localhost:3000' 
    : 'https://optero-production.up.railway.app';

  // Widget state
  let isOpen = false;
  let sessionId = null;
  let history = [];
  let botSettings = {
    name: 'AI Assistant',
    color: '#000000',
    welcomeMessage: 'Hi! How can I help you today?'
  };

  // Create widget container
  const container = document.createElement('div');
  container.id = 'mendio-widget-container';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    font-family: system-ui, -apple-system, sans-serif;
  `;
  document.body.appendChild(container);

  // Load bot settings
  async function loadBotSettings() {
    try {
      const res = await fetch(`${API_BASE}/api/bots/settings?botId=${botId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          botSettings = { ...botSettings, ...data.settings };
        }
      }
    } catch (e) {
      console.warn('Failed to load bot settings:', e);
    }
  }

  // Send message to bot
  async function sendMessage(content) {
    try {
      history.push({ role: 'user', content, timestamp: new Date() });
      renderMessages();

      const res = await fetch(`${API_BASE}/api/bots/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId,
          history,
          sessionId,
          locale: navigator.language || 'en',
          tone: botSettings.tone || 'Professional'
        })
      });

      const data = await res.json();
      const reply = data.reply || "I'm sorry, I couldn't process that.";
      
      if (data.sessionId && !sessionId) {
        sessionId = data.sessionId;
      }

      history.push({ role: 'assistant', content: reply, timestamp: new Date() });
      renderMessages();
    } catch (e) {
      console.error('Chat error:', e);
      history.push({ 
        role: 'assistant', 
        content: 'Sorry, something went wrong. Please try again.', 
        timestamp: new Date() 
      });
      renderMessages();
    }
  }

  // Render chat messages
  function renderMessages() {
    const messagesContainer = document.getElementById('mendio-messages');
    if (!messagesContainer) return;

    messagesContainer.innerHTML = history.map(msg => {
      const isUser = msg.role === 'user';
      return `
        <div style="display: flex; gap: 8px; margin-bottom: 12px; ${isUser ? 'justify-content: flex-end;' : ''}">
          ${!isUser ? `
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${botSettings.color}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                <circle cx="12" cy="5" r="2"></circle>
                <path d="M12 7v4"></path>
              </svg>
            </div>
          ` : ''}
          <div style="max-width: 70%; ${isUser ? 'order: 1;' : ''}">
            <div style="
              padding: 10px 14px;
              border-radius: 16px;
              ${isUser 
                ? `background: ${botSettings.color}; color: white;` 
                : 'background: #f3f4f6; color: #1f2937;'
              }
              font-size: 14px;
              line-height: 1.5;
            ">
              ${isUser ? escapeHtml(msg.content) : msg.content}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Toggle widget
  function toggleWidget() {
    isOpen = !isOpen;
    render();
    
    if (isOpen && history.length === 0) {
      // Add welcome message
      history.push({
        role: 'assistant',
        content: `<p>${botSettings.welcomeMessage || 'Hi! How can I help you today?'}</p>`,
        timestamp: new Date()
      });
      renderMessages();
    }
  }

  // Render widget
  function render() {
    if (isOpen) {
      container.innerHTML = `
        <div id="mendio-chat-window" style="
          width: 380px;
          height: 600px;
          max-height: 90vh;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        ">
          <!-- Header -->
          <div style="
            background: ${botSettings.color};
            color: white;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 36px; height: 36px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                  <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                  <circle cx="12" cy="5" r="2"></circle>
                  <path d="M12 7v4"></path>
                </svg>
              </div>
              <div>
                <div style="font-weight: 600; font-size: 15px;">${escapeHtml(botSettings.name)}</div>
                <div style="font-size: 12px; opacity: 0.9;">Online now</div>
              </div>
            </div>
            <button onclick="window.mendioWidget.toggle()" style="
              background: none;
              border: none;
              color: white;
              cursor: pointer;
              padding: 4px;
              display: flex;
              align-items: center;
              opacity: 0.8;
            ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Messages -->
          <div id="mendio-messages" style="
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background: #fafafa;
          "></div>

          <!-- Input -->
          <div style="
            border-top: 1px solid #e5e7eb;
            padding: 12px;
            background: white;
          ">
            <form id="mendio-form" style="display: flex; gap: 8px;">
              <input 
                id="mendio-input" 
                type="text" 
                placeholder="Type a message..."
                style="
                  flex: 1;
                  padding: 10px 14px;
                  border: 1px solid #d1d5db;
                  border-radius: 20px;
                  font-size: 14px;
                  outline: none;
                "
              />
              <button type="submit" style="
                background: ${botSettings.color};
                color: white;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
          </div>
        </div>
      `;

      // Attach form handler
      const form = document.getElementById('mendio-form');
      const input = document.getElementById('mendio-input');
      
      if (form && input) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const value = input.value.trim();
          if (value) {
            sendMessage(value);
            input.value = '';
          }
        });
        input.focus();
      }

      renderMessages();
    } else {
      container.innerHTML = `
        <button 
          onclick="window.mendioWidget.toggle()"
          style="
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: ${botSettings.color};
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s, box-shadow 0.2s;
          "
          onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 6px 16px rgba(0,0,0,0.2)';"
          onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.15)';"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </button>
      `;
    }
  }

  // Public API
  window.mendioWidget = {
    toggle: toggleWidget,
    open: () => { if (!isOpen) toggleWidget(); },
    close: () => { if (isOpen) toggleWidget(); },
    sendMessage: sendMessage
  };

  // Initialize
  (async () => {
    await loadBotSettings();
    render();
  })();
})();
