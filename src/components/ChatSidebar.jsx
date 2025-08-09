import React, { useState, useEffect, useRef } from 'react';
import LoadingSpinner, { ChatLoadingIndicator } from './LoadingSpinner';
import ErrorBoundary, { ChatErrorFallback } from './ErrorBoundary';

export default function ChatSidebar({ 
  onSend, 
  isCollapsed, 
  onToggle,
  petName = 'Your Pet' 
}) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const send = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMsg = { from: 'user', text: inputText, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    const current = inputText;
    setInputText('');
    setIsLoading(true);
    
    onSend(current, (response) => {
      setIsLoading(false);
      setMessages((prev) => [...prev, { 
        from: 'pet', 
        text: response, 
        timestamp: Date.now() 
      }]);
    });
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  return (
    <div className={`chat-sidebar ${isCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* Chat Toggle Button */}
      <button 
        className="chat-toggle"
        onClick={onToggle}
        title={isCollapsed ? 'Open Chat' : 'Close Chat'}
      >
        {isCollapsed ? '💬' : '✕'}
      </button>

      {/* Chat Content */}
      <div className="chat-content">
        <div className="chat-header">
          <h3>💭 Chat with {petName}</h3>
        </div>

        <ErrorBoundary fallback={ChatErrorFallback}>
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="welcome-message">
                <p>👋 Say hello to your pet!</p>
                <p className="chat-hint">Try asking about their mood, feeding them, or just chatting!</p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.from}`}>
                <div className={`message-bubble ${msg.from}`}>
                  {msg.text}
                </div>
                <div className="message-time">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chat-message pet">
                <div className="message-bubble pet">
                  <ChatLoadingIndicator />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`Chat with ${petName}...`}
              disabled={isLoading}
              rows={2}
              className="chat-input"
            />
            <button 
              onClick={send} 
              disabled={isLoading || !inputText.trim()}
              className="chat-send-btn"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </ErrorBoundary>
      </div>

      <style>{`
        .chat-sidebar {
          position: fixed;
          top: 50%;
          right: 0;
          transform: translateY(-50%);
          width: 350px;
          height: 500px;
          background: rgba(0, 0, 0, 0.95);
          border: 2px solid rgba(0, 255, 153, 0.5);
          border-radius: 12px 0 0 12px;
          z-index: 1000;
          transition: transform 0.3s ease, opacity 0.3s ease;
          backdrop-filter: blur(10px);
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
        }

        .chat-sidebar.collapsed {
          transform: translateY(-50%) translateX(calc(100% - 50px));
        }

        .chat-sidebar.expanded {
          transform: translateY(-50%) translateX(0);
        }

        .chat-toggle {
          position: absolute;
          left: -40px;
          top: 50%;
          transform: translateY(-50%);
          width: 40px;
          height: 60px;
          background: rgba(0, 255, 153, 0.9);
          border: none;
          border-radius: 8px 0 0 8px;
          color: #000;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .chat-toggle:hover {
          background: rgba(0, 255, 153, 1);
          transform: translateY(-50%) translateX(-2px);
        }

        .chat-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 0;
        }

        .chat-header {
          background: rgba(0, 255, 153, 0.1);
          border-bottom: 1px solid rgba(0, 255, 153, 0.3);
          padding: 12px 16px;
          border-radius: 10px 0 0 0;
        }

        .chat-header h3 {
          margin: 0;
          color: #00ff99;
          font-size: 14px;
          font-weight: bold;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: rgba(0, 255, 153, 0.5);
          border-radius: 3px;
        }

        .welcome-message {
          text-align: center;
          color: #888;
          font-style: italic;
          padding: 20px;
        }

        .welcome-message p {
          margin: 8px 0;
        }

        .chat-hint {
          font-size: 12px;
          opacity: 0.7;
        }

        .chat-message {
          display: flex;
          flex-direction: column;
          margin: 4px 0;
        }

        .chat-message.user {
          align-items: flex-end;
        }

        .chat-message.pet {
          align-items: flex-start;
        }

        .message-bubble {
          max-width: 85%;
          padding: 8px 12px;
          border-radius: 16px;
          word-wrap: break-word;
          font-size: 14px;
          line-height: 1.4;
        }

        .message-bubble.user {
          background: linear-gradient(135deg, #00ff99, #00cc77);
          color: #000;
          border-bottom-right-radius: 4px;
        }

        .message-bubble.pet {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-bottom-left-radius: 4px;
        }

        .message-time {
          font-size: 10px;
          color: #666;
          margin: 2px 8px;
          opacity: 0.7;
        }

        .chat-input-area {
          border-top: 1px solid rgba(0, 255, 153, 0.3);
          padding: 12px;
          display: flex;
          gap: 8px;
          align-items: flex-end;
        }

        .chat-input {
          flex: 1;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 8px 12px;
          color: #fff;
          font-size: 14px;
          resize: none;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .chat-input:focus {
          outline: none;
          border-color: rgba(0, 255, 153, 0.5);
          background: rgba(255, 255, 255, 0.15);
        }

        .chat-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .chat-input::placeholder {
          color: #888;
        }

        .chat-send-btn {
          background: rgba(0, 255, 153, 0.8);
          border: none;
          border-radius: 8px;
          width: 36px;
          height: 36px;
          color: #000;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-send-btn:hover:not(:disabled) {
          background: rgba(0, 255, 153, 1);
          transform: scale(1.05);
        }

        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .chat-sidebar {
            width: 300px;
            height: 400px;
          }
          
          .chat-sidebar.collapsed {
            transform: translateY(-50%) translateX(calc(100% - 45px));
          }
          
          .chat-toggle {
            left: -35px;
            width: 35px;
            height: 50px;
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}