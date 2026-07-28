import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Sparkles, Bot, User, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { askGrowthAI, describeError, type ChatMessage } from '../lib/growthAI';

export const GrowthAIFloatingWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Greetings Leader. I am Growth AI, your institutional intelligence advisor. Ask me any strategic, leadership, or expansion question.'
    }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    const history = messages;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const { reply, simulated } = await askGrowthAI({
        message: userMsg,
        context: 'Quick Floating Widget',
        history,
      });
      setMessages(prev => [...prev, { sender: 'assistant', text: reply, simulated }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { sender: 'assistant', text: describeError(err), failed: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-5 py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white border border-amber-500/40 shadow-2xl shadow-amber-500/20 transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
          </div>
          <div className="text-left">
            <div className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1">
              <span>GROWTH AI</span>
              <span className="text-[10px] px-1 bg-amber-500/20 rounded">ONLINE</span>
            </div>
            <div className="text-[11px] text-slate-300">Ask Strategy Advisor</div>
          </div>
        </button>
      ) : (
        <div className="w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
          
          {/* Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Growth AI Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">Executive Intelligence Core v4.2</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/command-center');
                }}
                className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                title="Expand to Full Command Center"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-950">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'assistant' && (
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 mt-1 ${
                    m.failed
                      ? 'bg-red-500/20 border-red-500/40 text-red-400'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  }`}>
                    {m.failed ? <AlertTriangle className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : m.failed
                        ? 'bg-red-950/40 border border-red-900/60 text-red-200 rounded-tl-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                  {m.simulated && (
                    <span className="block mt-2 text-[10px] font-mono uppercase tracking-wide text-amber-400/70">
                      Simulated · no API key set
                    </span>
                  )}
                </div>
                {m.sender === 'user' && (
                  <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-300 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>Growth AI processing executive response...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-900/60 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <button 
              onClick={() => { setInput('How do I structure a 5-year global expansion roadmap?'); }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 whitespace-nowrap"
            >
              Expansion Roadmap
            </button>
            <button 
              onClick={() => { setInput('What are key AI governance metrics for boards?'); }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
            >
              AI Governance
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Growth AI..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-lg transition-colors font-bold"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
};
