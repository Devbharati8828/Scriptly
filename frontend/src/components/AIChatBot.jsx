import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, X, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AIChatBot() {
  const { authHeaders, isAuthenticated } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      text: "Hi! I'm **Scriptly AI** 🤖\n\nI can help you with your medications, refill status, dose history, and more. Ask me anything!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isAuthenticated) return null;

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get response');
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'ai', text: data.reply }]);
      if (!isOpen) setHasUnread(true);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'ai', text: "Sorry, I'm having trouble right now. Please try again in a moment." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'Show my medications',
    'What needs a refill?',
    'My dose history',
    'How many pills left?',
  ];

  const handleQuickQuestion = (q) => {
    setInput(q);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      return (
        <p key={i} className={i > 0 ? 'mt-1' : ''}>
          {parts.map((part, j) =>
            part.startsWith('**') && part.endsWith('**') ? (
              <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setIsOpen(true); setHasUnread(false); }}
            className="fixed bottom-6 right-6 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-xl shadow-purple-500/30 flex items-center justify-center cursor-pointer hover:shadow-2xl hover:shadow-purple-500/40 transition-shadow"
          >
            <MessageCircle className="w-6 h-6" />
            {hasUnread && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed bottom-6 right-6 z-[9999] w-[380px] h-[520px] rounded-2xl overflow-hidden shadow-2xl shadow-slate-900/20 border border-slate-200/60 flex flex-col bg-white"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
                  Scriptly AI
                  <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-violet-200 text-[11px]">Online • Health Assistant</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gradient-to-b from-slate-50 to-white">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'ai'
                          ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600'
                      }`}
                    >
                      {msg.role === 'ai' ? (
                        <Bot className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <User className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed ${
                        msg.role === 'ai'
                          ? 'bg-white text-slate-700 rounded-bl-sm border border-slate-100 shadow-sm'
                          : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-sm shadow-sm'
                      }`}
                    >
                      {renderText(msg.text)}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-end gap-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white border border-slate-100 px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 1 && (
              <div className="px-3 py-2 bg-slate-50/80 border-t border-slate-100 flex gap-1.5 flex-wrap shrink-0">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-[11px] bg-white border border-slate-200 text-slate-600 rounded-full px-2.5 py-1 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-colors cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={sendMessage} className="px-3 py-2.5 bg-white border-t border-slate-100 flex gap-2 shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your medications..."
                disabled={isLoading}
                className="flex-1 text-sm px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-300 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
