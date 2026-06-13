import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles, RefreshCw } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your SreePayanam Travel Assistant. 🌍 How can I help you today? Ask me about national/international packages, hotel bookings, or offline payment bank details!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Chatbot error');

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Feel free to contact our customer support directly!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Hello! I am your SreePayanam Travel Assistant. 🌍 How can I help you today? Ask me about national/international packages, hotel bookings, or offline payment bank details!'
      }
    ]);
  };

  const formatText = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line.replace(/\*\*(.*?)\*\*/g, '$1')}
        <br />
      </span>
    ));
  };

  return (
    <>
      {/* Floating Button */}
      <div style={{ position: 'fixed', bottom: 104, right: 28, zIndex: 998 }}>
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: 60,
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
            cursor: 'pointer'
          }}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </motion.button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed',
              bottom: 180,
              right: 28,
              width: '90vw',
              maxWidth: 380,
              height: '70vh',
              maxHeight: 520,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: 20,
              boxShadow: '0 20px 45px rgba(15, 23, 42, 0.15)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: 6, borderRadius: 10 }}>
                  <Sparkles size={18} color="white" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>SreePayanam Assistant</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.88, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                    AI Support Online
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button onClick={handleReset} title="Reset chat" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8, display: 'flex' }}>
                  <RefreshCw size={16} />
                </button>
                <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8, display: 'flex' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Message List */}
            <div ref={listRef} style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              background: '#f8fafc'
            }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: 8
                }}>
                  {m.role !== 'user' && (
                    <div style={{ background: 'var(--primary)', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Bot size={14} color="white" />
                    </div>
                  )}
                  <div style={{
                    maxWidth: '80%',
                    padding: '10px 14px',
                    fontSize: '0.88rem',
                    lineHeight: '1.45',
                    borderRadius: m.role === 'user' ? '14px 14px 0 14px' : '14px 14px 14px 0',
                    background: m.role === 'user' ? 'var(--primary)' : 'white',
                    color: m.role === 'user' ? 'white' : 'var(--text-main)',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.04)'
                  }}>
                    {formatText(m.content)}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{ background: 'var(--primary)', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Bot size={14} color="white" />
                  </div>
                  <div style={{ background: 'white', padding: '10px 14px', borderRadius: '14px 14px 14px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Typing...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} style={{
              padding: '12px 16px',
              background: 'white',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              gap: 8
            }}>
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{
                  flex: 1,
                  border: '1px solid #e2e8f0',
                  borderRadius: 24,
                  padding: '8px 16px',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
              <button type="submit" disabled={loading || !input.trim()} style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: (loading || !input.trim()) ? 0.5 : 1
              }}>
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
