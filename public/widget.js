(function(){
  try {
    var script = document.currentScript;
    var botId = script && script.getAttribute('data-bot-id');
    var position = (script && (script.getAttribute('data-position') || '').toLowerCase()) || 'bottom-right';
    var offsetX = parseInt(script && script.getAttribute('data-offset-x') || '20', 10);
    var offsetY = parseInt(script && script.getAttribute('data-offset-y') || '20', 10);
    if (!botId) return;

    // Fetch bot config to get brand settings
    var apiBase = (function(){
      try { return new URL(script.src).origin || ''; } catch(e) { return ''; }
    })();
    
    fetch(apiBase + '/api/bots/config?botId=' + botId)
      .then(function(res) { return res.json(); })
      .then(function(config) {
        initWidget(config.brand || {});
      })
      .catch(function() {
        // Fallback to default styling
        initWidget({});
      });

    function initWidget(brand) {
      var primaryColor = brand.primaryColor || '#111';
      var fontFamily = brand.fontFamily || 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
      var fontUrl = brand.fontUrl || null;
      var tone = brand.tone || 'professional';
      var logoUrl = brand.logoUrl || null;
      var logoPosition = brand.logoPosition || 'bottom-right';
      var logoOffset = brand.logoOffset || { x: 20, y: 20 };

      // Optional Google Font link
      if (fontUrl) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = fontUrl;
        document.head.appendChild(link);
      }

      // Contrast helpers
      function hexToRgb(hex){
        try{ hex = hex.replace('#',''); if(hex.length===3){hex=hex.split('').map(function(c){return c+c;}).join('');}
          var bigint=parseInt(hex,16); return { r:(bigint>>16)&255, g:(bigint>>8)&255, b:bigint&255 }; }catch(e){ return {r:17,g:17,b:17}; }
      }
      function relativeLuminance(r,g,b){ r/=255; g/=255; b/=255; r=r<=0.03928?r/12.92:Math.pow((r+0.055)/1.055,2.4); g=g<=0.03928?g/12.92:Math.pow((g+0.055)/1.055,2.4); b=b<=0.03928?b/12.92:Math.pow((b+0.055)/1.055,2.4); return 0.2126*r+0.7152*g+0.0722*b; }
      function contrastRatio(hex1,hex2){ var a=hexToRgb(hex1), b=hexToRgb(hex2); var L1=relativeLuminance(a.r,a.g,a.b), L2=relativeLuminance(b.r,b.g,b.b); var light=Math.max(L1,L2), dark=Math.min(L1,L2); return (light+0.05)/(dark+0.05); }
      function bestTextColor(bg){ return contrastRatio(bg,'#ffffff')>=4.5?'#ffffff':'#111111'; }

      // Build CSS with brand colors and fonts
      var css = [];
      var btnTextColor = bestTextColor(primaryColor);
      css.push('.mendio-bot-btn{position:fixed;background:' + primaryColor + ';color:' + btnTextColor + ';border-radius:9999px;padding:12px 16px;font-family:' + fontFamily + ';font-weight:700;box-shadow:0 10px 25px rgba(0,0,0,.2);cursor:pointer;z-index:2147483000;transition:all 0.3s}');
      css.push('.mendio-bot-btn:hover{transform:scale(1.05);box-shadow:0 15px 35px rgba(0,0,0,.3)}');
      css.push('.mendio-bot-panel{position:fixed;width:340px;max-width:calc(100vw - 32px);height:480px;background:#fff;border:2px solid ' + primaryColor + ';border-radius:16px;box-shadow:0 20px 40px rgba(0,0,0,.25);overflow:hidden;display:none;flex-direction:column;z-index:2147483001;font-family:' + fontFamily + '}');
      var headerTextColor = bestTextColor(primaryColor);
      css.push('.mendio-bot-header{padding:12px 16px;background:' + primaryColor + ';color:' + headerTextColor + ';font-weight:800;display:flex;align-items:center;justify-content:space-between}');
      css.push('.mendio-bot-body{padding:12px;height:100%;display:flex;flex-direction:column;gap:8px;background:#f6f6f6}');
      css.push('.mendio-bot-messages{flex:1;overflow:auto;display:flex;flex-direction:column;gap:6px}');
      css.push('.mendio-bot-bubble{max-width:80%;padding:10px 12px;border-radius:14px;font-size:14px;line-height:1.4}');
      var bubbleUserText = bestTextColor(primaryColor);
      css.push('.mendio-bot-bubble.user{background:' + primaryColor + ';color:' + bubbleUserText + ';align-self:flex-end}');
      css.push('.mendio-bot-bubble.ai{background:#fff;color:#111;align-self:flex-start;border:1px solid #e5e5e5}');
      css.push('.mendio-bot-input{display:flex;gap:8px}');
      css.push('.mendio-bot-input input{flex:1;border:1px solid #e5e5e5;border-radius:12px;padding:10px 12px;font-size:14px;font-family:' + fontFamily + '}');
      css.push('.mendio-bot-input button{background:' + primaryColor + ';color:#fff;border-radius:12px;padding:10px 12px;font-weight:700;font-family:' + fontFamily + ';cursor:pointer;transition:all 0.2s}');
      css.push('.mendio-bot-input button:hover{opacity:0.9}');

      var style = document.createElement('style');
      style.innerHTML = css.join('\n');
      document.head.appendChild(style);

      var btn = document.createElement('button');
      btn.className = 'mendio-bot-btn';
      var isPremium = brand.isPremium || false;
      btn.textContent = isPremium ? 'Chat with us' : 'Chat with us · by Mendio';

      var panel = document.createElement('div');
      panel.className = 'mendio-bot-panel';

      var header = document.createElement('div');
      header.className = 'mendio-bot-header';
      var headerTitle = isPremium ? 'Chat' : 'Chat · Mendio';
      header.innerHTML = '<span>' + headerTitle + '</span>' +
        '<div style="display:flex;gap:8px;align-items:center">' +
        '<button class="mendio-minimize" style="background:transparent;color:' + headerTextColor + ';font-weight:700;border:none;cursor:pointer;font-size:18px" title="Minimize">–</button>' +
        '<button class="mendio-close" style="background:transparent;color:' + headerTextColor + ';font-weight:700;border:none;cursor:pointer;font-size:20px" title="Close">×</button>' +
        '</div>';
      var closeBtn = header.querySelector('.mendio-close');
      var minimizeBtn = header.querySelector('.mendio-minimize');
      var minimized = false;
      closeBtn.addEventListener('click', function(){ panel.style.display='none'; minimized=false; panel.style.height=panelFullHeight; body.style.display='flex'; });
      minimizeBtn.addEventListener('click', function(){ minimized = !minimized; if(minimized){ panel.style.height='56px'; body.style.display='none'; } else { panel.style.height=panelFullHeight; body.style.display='flex'; } });

      var body = document.createElement('div');
      body.className = 'mendio-bot-body';
      var messages = document.createElement('div');
      messages.className = 'mendio-bot-messages';
      var inputRow = document.createElement('div');
      inputRow.className = 'mendio-bot-input';
      var input = document.createElement('input');
      input.placeholder = getPlaceholder(tone);
      var send = document.createElement('button');
      send.textContent = 'Send';
      inputRow.appendChild(input);
      inputRow.appendChild(send);
      body.appendChild(messages);
      body.appendChild(inputRow);

      panel.appendChild(header);
      panel.appendChild(body);

      btn.addEventListener('click', function(){
        panel.style.display = panel.style.display === 'none' || panel.style.display === '' ? 'flex' : 'none';
        if (panel.style.display === 'flex') {
          input.focus();
          if (messages.children.length === 0) {
            // First time opening - show welcome message
            setTimeout(function() {
              addBubble(getWelcomeMessage(tone), 'assistant');
            }, 300);
          }
        }
      });

      function getPlaceholder(tone) {
        if (tone === 'formal') return 'Type your message here...';
        if (tone === 'casual') return 'Type something here...';
        return 'Type a message...';
      }

      function getWelcomeMessage(tone) {
        if (tone === 'formal') return 'Good day! How can I assist you today?';
        if (tone === 'casual') return 'Hi there! How can I help?';
        return 'Hi! How can I help you today?';
      }

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
        
        // Show typing indicator
        var typing = document.createElement('div');
        typing.className = 'mendio-bot-bubble ai';
        typing.innerHTML = '<span style="opacity:0.5">...</span>';
        messages.appendChild(typing);
        
        try {
          var res = await fetch(apiBase + '/api/bots/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ botId: botId, history: history })
          });
          var data = await res.json();
          var reply = data.reply || '';
          
          // Remove typing indicator
          messages.removeChild(typing);
          
          addBubble(reply, 'assistant');
          history.push({ role: 'assistant', content: reply });
        } catch (e) {
          messages.removeChild(typing);
          addBubble('Technical error. Please try again.', 'assistant');
        }
      }
      
      send.addEventListener('click', sendMsg);
      input.addEventListener('keydown', function(e){ if (e.key === 'Enter') sendMsg(); });

      document.body.appendChild(btn);
      document.body.appendChild(panel);

      // Smart triggers (proactive engagement)
      var triggers = {
        timeOnPage: false,
        scrollDepth: false,
        exitIntent: false
      };

      // Time on page trigger (30 seconds)
      setTimeout(function() {
        if (!triggers.timeOnPage && messages.children.length === 0) {
          triggers.timeOnPage = true;
          var pageUrl = window.location.pathname;
          var contextMsg = 'Hi! I saw you are browsing. Can I help with anything?';
          
          if (pageUrl.includes('pric') || pageUrl.includes('price')) {
            contextMsg = 'Do you have any questions about our pricing?';
          } else if (pageUrl.includes('product') || pageUrl.includes('tjanst')) {
            contextMsg = 'Would you like to know more about our products?';
          } else if (pageUrl.includes('kontakt') || pageUrl.includes('contact')) {
            contextMsg = 'Need help getting in touch with us?';
          }
          
          panel.style.display = 'flex';
          setTimeout(function() { addBubble(contextMsg, 'assistant'); }, 300);
        }
      }, 30000);

      // Scroll depth trigger (90%)
      window.addEventListener('scroll', function() {
        if (!triggers.scrollDepth) {
          var scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
          if (scrollPercentage > 90) {
            triggers.scrollDepth = true;
            if (messages.children.length === 0) {
              panel.style.display = 'flex';
              setTimeout(function() { 
                addBubble('You have read most of the page — any questions?', 'assistant'); 
              }, 300);
            }
          }
        }
      });

      // Exit-intent trigger
      document.addEventListener('mouseleave', function(e) {
        if (!triggers.exitIntent && e.clientY < 10) {
          triggers.exitIntent = true;
          if (messages.children.length === 0) {
            panel.style.display = 'flex';
            setTimeout(function() { 
              addBubble('Wait! Can I help you find something before you go?', 'assistant'); 
            }, 300);
          }
        }
      });

      // Optional logo
      if (logoUrl) {
        var logo = document.createElement('img');
        logo.src = logoUrl;
        logo.alt = 'Logo';
        logo.style.position = 'fixed';
        logo.style.width = '36px';
        logo.style.height = '36px';
        logo.style.objectFit = 'contain';
        logo.style.zIndex = '2147482999';
        var x = (logoOffset && logoOffset.x) || 20;
        var y = (logoOffset && logoOffset.y) || 20;
        if (logoPosition === 'bottom-right') { logo.style.right = (20 + x) + 'px'; logo.style.bottom = (20 + y) + 'px'; }
        if (logoPosition === 'bottom-left')  { logo.style.left  = (20 + x) + 'px'; logo.style.bottom = (20 + y) + 'px'; }
        if (logoPosition === 'top-right')    { logo.style.right = (20 + x) + 'px'; logo.style.top    = (20 + y) + 'px'; }
        if (logoPosition === 'top-left')     { logo.style.left  = (20 + x) + 'px'; logo.style.top    = (20 + y) + 'px'; }
        document.body.appendChild(logo);
      }

      // Apply initial positions based on data-position and offsets
      var panelFullHeight = '480px';
      function applyPosition(){
        if (position === 'bottom-left') {
          btn.style.left = offsetX + 'px';
          btn.style.bottom = offsetY + 'px';
          panel.style.left = offsetX + 'px';
          panel.style.bottom = (offsetY + 60) + 'px';
          panel.style.right = '';
        } else if (position === 'top-right') {
          btn.style.right = offsetX + 'px';
          btn.style.top = offsetY + 'px';
          btn.style.bottom = '';
          panel.style.right = offsetX + 'px';
          panel.style.top = (offsetY + 60) + 'px';
          panel.style.bottom = '';
        } else if (position === 'top-left') {
          btn.style.left = offsetX + 'px';
          btn.style.top = offsetY + 'px';
          btn.style.bottom = '';
          panel.style.left = offsetX + 'px';
          panel.style.top = (offsetY + 60) + 'px';
          panel.style.bottom = '';
        } else { // bottom-right default
          btn.style.right = offsetX + 'px';
          btn.style.bottom = offsetY + 'px';
          panel.style.right = offsetX + 'px';
          panel.style.bottom = (offsetY + 60) + 'px';
          panel.style.left = '';
        }
      }
      applyPosition();
    }
  } catch(e) { 
    console.error('Mendio widget error:', e);
  }
})();