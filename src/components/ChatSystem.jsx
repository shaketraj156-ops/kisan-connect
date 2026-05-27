import React, { useState, useRef, useEffect } from 'react';
import { Send, User, MessageSquare, ArrowLeft, ShieldAlert, Award } from 'lucide-react';
import { sendMessage as sendApiMessage } from '../utils/apiClient';
import { io } from 'socket.io-client';

export default function ChatSystem({ activeChat, user, onUpdateChat, onClose }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const isFarmer = user.role === 'farmer';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeChat.messages]);

  // Setup Socket.io
  useEffect(() => {
    // Determine backend URL
    const backendUrl = 'https://kisan-connect-lzul.onrender.com';
      
    socketRef.current = io(backendUrl, {
      extraHeaders: {
        'Bypass-Tunnel-Reminder': 'true'
      }
    });

    socketRef.current.emit('join_chat', activeChat._id);

    socketRef.current.on('receive_message', (newMessage) => {
      // Create a dummy chat object to trigger parent update
      const updatedChat = { ...activeChat, messages: [...activeChat.messages, newMessage] };
      onUpdateChat(updatedChat);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [activeChat._id]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userRole = isFarmer ? 'farmer' : 'buyer';
    
    const userMsgText = inputText;
    setInputText('');
    
    const msgData = { sender: userRole, text: userMsgText, timestamp };

    try {
      // 1. Send the user's real message to backend
      let updatedChat = await sendApiMessage(activeChat._id, msgData);
      onUpdateChat(updatedChat);
      
      // Emit via socket for instant sync
      socketRef.current.emit('send_message', { chatId: activeChat._id, message: msgData });

    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const farmerSuggestions = [
    "Kya aap poora stock lenge?",
    "Price thoda theek kar lijiye.",
    "Transport aapka hoga ya mera?"
  ];

  const buyerSuggestions = [
    "Bhaiya price thoda kam karo.",
    "Quality check karne aa jau?",
    "Truck pool kar sakte hain?"
  ];

  const currentSuggestions = isFarmer ? farmerSuggestions : buyerSuggestions;

  return (
    <div style={styles.chatBoxContainer} className="glass-panel animate-fade">
      {/* Header */}
      <div style={styles.chatHeader}>
        <button onClick={onClose} style={styles.backBtn}>
          <ArrowLeft size={20} color="#fff" />
        </button>
        <div style={styles.avatar}>
          <User size={20} color="#fff" />
        </div>
        <div style={styles.headerInfo}>
          <h4 style={styles.chatTitle}>
            {isFarmer ? activeChat.buyerName : activeChat.farmerName}
          </h4>
          <span style={styles.chatSubtitle}>
            Bargaining & Clarifications for {activeChat.crop}
          </span>
        </div>
        <div style={styles.headerRight}>
          <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
            Mandi: ₹{activeChat.mandiPrice}/q
          </span>
        </div>
      </div>

      {/* Advisory Banner */}
      <div style={styles.advisoryBanner}>
        <ShieldAlert size={14} color="var(--accent)" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
          KisanConnect Advisory: Live market rates are around <strong>₹{activeChat.mandiPrice}/q</strong>. Stay close to market trends for a fair deal.
        </span>
      </div>

      {/* Message Screen */}
      <div style={styles.messageScreen}>
        {activeChat.messages.map((msg, index) => {
          const isUser = (isFarmer && msg.sender === 'farmer') || (!isFarmer && msg.sender === 'buyer');
          return (
            <div
              key={index}
              style={{
                ...styles.messageRow,
                justifyContent: isUser ? 'flex-end' : 'flex-start'
              }}
            >
              <div
                style={{
                  ...styles.bubble,
                  ...(isUser ? styles.userBubble : styles.partnerBubble)
                }}
              >
                <p style={styles.bubbleText}>{msg.text}</p>
                <span style={styles.bubbleTime}>{msg.timestamp}</span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Messages (Chips) */}
      <div style={{ display: 'flex', gap: '8px', padding: '0 1rem 0.5rem 1rem', overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none' }}>
        {currentSuggestions.map((suggestion, idx) => (
          <button 
            key={idx} 
            onClick={() => setInputText(suggestion)}
            style={{
              background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#06b6d4', padding: '6px 12px', borderRadius: '16px', fontSize: '0.75rem',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={styles.inputForm}>
        <input
          type="text"
          placeholder="Apna bargain price ya sawal yaha type karein..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={styles.chatInput}
        />
        <button type="submit" className="btn btn-primary" style={styles.sendBtn}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

const styles = {
  chatBoxContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '520px',
    width: '100%',
    maxWidth: '650px',
    margin: '0 auto',
    overflow: 'hidden',
    border: '1px solid rgba(16, 185, 129, 0.2)'
  },
  chatHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    gap: '0.75rem'
  },
  backBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'var(--bg-tertiary)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: '1px solid var(--border-color)'
  },
  headerInfo: {
    flex: 1,
    textAlign: 'left'
  },
  chatTitle: {
    fontFamily: 'var(--font-heading)',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#fff'
  },
  chatSubtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)'
  },
  headerRight: {
    display: 'flex'
  },
  advisoryBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    background: 'rgba(245, 158, 11, 0.05)',
    borderBottom: '1px solid rgba(245, 158, 11, 0.1)',
    textAlign: 'left'
  },
  messageScreen: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    background: 'rgba(10, 15, 13, 0.4)'
  },
  messageRow: {
    display: 'flex',
    width: '100%'
  },
  bubble: {
    maxWidth: '75%',
    padding: '0.75rem 1rem',
    borderRadius: '14px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    textAlign: 'left',
    boxShadow: 'var(--shadow-sm)'
  },
  userBubble: {
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    color: '#fff',
    borderTopRightRadius: '2px'
  },
  partnerBubble: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderTopLeftRadius: '2px'
  },
  bubbleText: {
    fontSize: '0.85rem',
    lineHeight: '1.4'
  },
  bubbleTime: {
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'flex-end'
  },
  inputForm: {
    display: 'flex',
    padding: '0.75rem 1rem',
    background: 'var(--bg-secondary)',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    gap: '0.75rem'
  },
  chatInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    background: 'rgba(10, 15, 13, 0.6)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none'
  },
  sendBtn: {
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
};
