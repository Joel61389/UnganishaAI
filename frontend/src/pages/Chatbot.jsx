import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Send, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Chatbot() {
  const { refreshProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const chatEndRef = useRef(null);

  const suggestionChips = [
    "I'm a founder building a fintech in Nairobi, looking for a React developer.",
    "I'm an AI engineer with Python/FastAPI skills seeking startup gigs.",
    "I'm a product manager looking for co-founders to build a climate-tech app.",
    "I'm a UI/UX designer looking to join early-stage projects."
  ];

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/chat/history');
      setMessages(response.data);
      // Determine if onboarding is already completed
      const containsCompletionMsg = response.data.some(
        m => m.sender === 'assistant' && m.message.includes('successfully analyzed')
      );
      if (containsCompletionMsg) {
        setOnboardingDone(true);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || sending) return;

    setInput('');
    setSending(true);

    // Optimistically add user message
    const tempUserMsg = {
      id: Date.now().toString(),
      sender: 'user',
      message: text,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    
    // Trigger typing indicator
    setTyping(true);

    try {
      const response = await axios.post('/chat/message', { message: text });
      
      // Update history
      setMessages(prev => [
        ...prev.filter(m => m.id !== tempUserMsg.id), // remove temp
        response.data.user_message,
        response.data.assistant_message
      ]);

      if (response.data.profile_extracted) {
        setOnboardingDone(true);
        // Refresh Auth Context user info (like role updates)
        await refreshProfile();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Fallback response on failure
      const errorMsg = {
        id: Date.now().toString(),
        sender: 'assistant',
        message: "Sorry, I had trouble connecting. Let me try again in a bit. Please check your network.",
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setTyping(false);
      setSending(false);
    }
  };

  const handleChipClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto animate-fade-in">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            AI Onboarding Assistant
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Let's discover your expertise and map your startup matches.</p>
        </div>
        {onboardingDone && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Profile Complete
          </span>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed border ${
                msg.sender === 'user'
                  ? 'bg-brand-600/20 text-brand-100 border-brand-500/30 rounded-tr-none'
                  : 'bg-slate-900/40 text-slate-200 border-slate-800/40 rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.message}</div>
              <span className="block text-[10px] text-slate-500 mt-1.5 text-right">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex justify-start">
            <div className="bg-slate-900/40 text-slate-400 border border-slate-800/40 rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips */}
      {!onboardingDone && messages.length > 0 && messages[messages.length - 1].sender === 'assistant' && !typing && (
        <div className="pb-4">
          <p className="text-xs text-slate-500 mb-2 font-medium">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip)}
                className="text-xs text-slate-400 hover:text-white bg-slate-900/30 hover:bg-brand-500/10 border border-slate-800 hover:border-brand-500/20 rounded-lg px-3 py-1.5 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Completion Splash Banner */}
      {onboardingDone && (
        <div className="p-5 mb-4 rounded-2xl glass-panel-glow border-brand-500/30 flex items-center justify-between animate-fade-in">
          <div>
            <h4 className="text-white font-bold flex items-center gap-1.5">
              🚀 Setup Complete!
            </h4>
            <p className="text-slate-400 text-xs mt-1">Your AI profile has been generated. Head to matches to see developers/founders matched to you.</p>
          </div>
          <Link
            to="/matches"
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
          >
            View My Matches
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Input container — always available for follow-up questions */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-3 pt-3 border-t border-slate-800 bg-slate-950/60 backdrop-blur-md"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={onboardingDone ? "Ask a follow-up question..." : "Type your response..."}
          className="flex-1 px-4 py-3 bg-slate-900/40 border border-slate-800 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/30 placeholder-slate-500 text-white"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="p-3 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 rounded-xl shadow-lg shadow-brand-600/10 hover:shadow-brand-500/20 transition-all text-white disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
