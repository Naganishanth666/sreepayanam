import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I am the Sreepayanam AI Travel Assistant. Tell me what kind of trip you are looking for, and I will find the perfect package for you!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage.content })
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to get response');

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}. Please try again later or contact our support team.` }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render markdown-like bold text simply (for the MVP)
  const formatMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
        <br/>
      </span>
    ));
  };

  return (
    <div className="page-container container" style={styles.container}>
      <motion.div 
        className="glass-card" 
        style={styles.chatBox}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div style={styles.header}>
          <Sparkles size={28} color="white" />
          <div>
            <h1 style={{ fontSize: '1.5rem', color: 'white', margin: 0 }}>AI Travel Planner</h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', margin: 0 }}>Powered by OpenAI</p>
          </div>
        </div>

        <div style={styles.messageList}>
          {messages.map((msg, index) => (
            <motion.div 
              key={index} 
              style={{
                ...styles.messageWrapper,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {msg.role === 'assistant' && (
                <div style={styles.botAvatar}>
                  <Bot size={20} color="white" />
                </div>
              )}
              
              <div style={{
                ...styles.messageBubble,
                backgroundColor: msg.role === 'user' ? 'var(--primary)' : '#f1f5f9',
                color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                borderRadius: msg.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
              }}>
                {formatMessage(msg.content)}
              </div>

              {msg.role === 'user' && (
                <div style={styles.userAvatar}>
                  <User size={20} color="white" />
                </div>
              )}
            </motion.div>
          ))}
          {loading && (
            <div style={{...styles.messageWrapper, justifyContent: 'flex-start'}}>
              <div style={styles.botAvatar}><Bot size={20} color="white" /></div>
              <div style={{...styles.messageBubble, backgroundColor: '#f1f5f9'}}>
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  Thinking...
                </motion.div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} style={styles.inputArea}>
          <input 
            type="text" 
            className="input-field" 
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I want a 5-day honeymoon package in the mountains..."
          />
          <button type="submit" className="btn btn-primary" style={styles.sendBtn} disabled={loading || !input.trim()}>
            <Send size={20} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    paddingTop: '100px'
  },
  chatBox: {
    width: '100%',
    maxWidth: '800px',
    height: '70vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    backgroundColor: '#fafafa',
  },
  messageWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '12px',
    maxWidth: '80%',
  },
  botAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'var(--dark)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  messageBubble: {
    padding: '12px 16px',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  inputArea: {
    display: 'flex',
    padding: '20px',
    backgroundColor: 'white',
    borderTop: '1px solid var(--glass-border)',
    gap: '12px',
  },
  input: {
    flex: 1,
    borderRadius: '24px',
    padding: '12px 20px',
  },
  sendBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
};

export default AiAssistant;
