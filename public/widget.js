(function(){
  try {
    var script = document.currentScript;
    var botId = script && script.getAttribute('data-bot-id');
    if (!botId) return;

    var style = document.createElement('style');
    style.innerHTML = "\n.mendio-bot-btn{position:fixed;bottom:20px;right:20px;background:#111;color:#fff;border-radius:9999px;padding:12px 16px;font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;font-weight:700;box-shadow:0 10px 25px rgba(0,0,0,.2);cursor:pointer;z-index:2147483000}\\n.mendio-bot-panel{position:fixed;bottom:80px;right:20px;width:340px;max-width:calc(100vw - 32px);height:480px;background:#fff;border:2px solid #111;border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,.25);overflow:hidden;display:none;flex-direction:column;z-index:2147483001}\\n.mendio-bot-header{padding:12px 16px;background:#111;color:#fff;font-weight:800;display:flex;align-items:center;justify-content:space-between}\\n.mendio-bot-body{padding:12px;height:100%;display:flex;flex-direction:column;gap:8px;background:#f6f6f6}\\n.mendio-bot-messages{flex:1;overflow:auto;display:flex;flex-direction:column;gap:6px}\\n.mendio-bot-bubble{max-width:80%;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.4}\\n.mendio-bot-bubble.user{background:#111;color:#fff;align-self:flex-end}\\n.mendio-bot-bubble.ai{background:#fff;color:#111;align-self:flex-start;border:1px solid #e5e5e5}\\n.mendio-bot-input{display:flex;gap:8px}\\n.mendio-bot-input input{flex:1;border:1px solid #e5e5e5;border-radius:12px;padding:10px 12px;font-size:14px}\\n.mendio-bot-input button{background:#111;color:#fff;border-radius:12px;padding:10px 12px;font-weight:700}\n";
    document.head.appendChild(style);

    var btn = document.createElement('button');
    btn.className = 'mendio-bot-btn';
    btn.textContent = 'Chatta med AI · by Mendio (Free)';

    var panel = document.createElement('div');
    panel.className = 'mendio-bot-panel';

    var header = document.createElement('div');
    header.className = 'mendio-bot-header';
    header.innerHTML = '<span>MENDIO BOT · Free</span><button style="background:transparent;color:#fff;font-weight:700">×</button>';
    var closeBtn = header.querySelector('button');
    closeBtn.addEventListener('click', function(){ panel.style.display='none'; });

    var body = document.createElement('div');
    body.className = 'mendio-bot-body';
    var messages = document.createElement('div');
    messages.className = 'mendio-bot-messages';
    var inputRow = document.createElement('div');
    inputRow.className = 'mendio-bot-input';
    var input = document.createElement('input');
    input.placeholder = 'Skriv ett meddelande...';
    var send = document.createElement('button');
    send.textContent = 'Skicka';
    inputRow.appendChild(input);
    inputRow.appendChild(send);
    body.appendChild(messages);
    body.appendChild(inputRow);

    panel.appendChild(header);
    panel.appendChild(body);

    btn.addEventListener('click', function(){
      panel.style.display = panel.style.display === 'none' || panel.style.display === '' ? 'flex' : 'none';
      input.focus();
    });

    function addBubble(text, role){
      var b = document.createElement('div');
      b.className = 'mendio-bot-bubble ' + (role === 'user' ? 'user' : 'ai');
      b.textContent = text;
      messages.appendChild(b);
      messages.scrollTop = messages.scrollHeight;
    }

    var history = [];
    async function sendMsg(){
      var text = input.value.trim();
      if (!text) return;
      input.value = '';
      addBubble(text, 'user');
      history.push({ role: 'user', content: text });
      try {
        var apiBase = (function(){
          try { return new URL(script.src).origin || ''; } catch(e) { return ''; }
        })();
        var res = await fetch(apiBase + '/api/bots/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ botId: botId, history: history })
        });
        var data = await res.json();
        var reply = data.reply || '';
        addBubble(reply, 'assistant');
        history.push({ role: 'assistant', content: reply });
      } catch (e) {
        addBubble('Tekniskt fel. Försök igen.', 'assistant');
      }
    }
    send.addEventListener('click', sendMsg);
    input.addEventListener('keydown', function(e){ if (e.key === 'Enter') sendMsg(); });

    document.body.appendChild(btn);
    document.body.appendChild(panel);
  } catch(e) { /* no-op */ }
})();


