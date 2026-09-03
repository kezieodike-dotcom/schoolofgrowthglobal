import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Sparkles, Bot, User, ArrowUpRight, AlertTriangle, ArrowLeft } from 'lucide-react';
import { askGrowthAI, describeError, type ChatMessage } from '../lib/growthAI';
import { useVoiceInput } from '../lib/useVoiceInput';
import { useChatAutoScroll } from '../lib/useChatAutoScroll';
import { VoiceInputButton } from './VoiceInputButton';

export const GrowthAIFloatingWidget: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Greetings Leader. I am Growth AI, your institutional intelligence advisor. Describe a business, career, leadership, personal or organizational challenge and I will diagnose the growth area, expert mix and next intervention.'
    }
  ]);

  const voice = useVoiceInput({ value: input, onValueChange: setInput });

  const { containerRef, lastMessageRef } = useChatAutoScroll(messages, loading);

  const openGrowthAI = () => {
    if (!window.history.state?.growthAI) {
      window.history.pushState({ growthAI: true }, '', window.location.href);
    }
    setIsOpen(true);
  };

  const closeGrowthAI = () => {
    if (voice.listening) voice.stop();

    if (window.history.state?.growthAI) {
      window.history.back();
      return;
    }

    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePopState = () => {
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeGrowthAI();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, voice.listening]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    // Sending closes the dictation session; leaving it open would append the
    // next sentence to an input the user has already cleared.
    if (voice.listening) voice.stop();

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
    <div
      className={
        isOpen
          ? 'fixed inset-0 z-[120] font-sans'
          : 'fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 font-sans'
      }
    >
      {!isOpen ? (
        <button
          aria-label="Open Growth AI strategy advisor"
          onClick={openGrowthAI}
          className="group relative flex h-12 w-12 sm:h-auto sm:w-auto items-center justify-center sm:gap-3 sm:px-5 sm:py-3.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white border border-amber-500/40 shadow-xl sm:shadow-2xl sm:shadow-amber-500/20 transition-all duration-300"
        >
          <div className="relative">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold font-mono text-amber-400 flex items-center gap-1">
              <span>GROWTH AI</span>
              <span className="text-[10px] px-1 bg-amber-500/20 rounded">ONLINE</span>
            </div>
            <div className="text-[11px] text-slate-300">Ask Strategy Advisor</div>
          </div>
        </button>
      ) : (
        <div className="h-[100dvh] w-full rounded-none bg-slate-950 border-0 shadow-none flex flex-col overflow-hidden text-slate-200">
          
          {/* Header */}
          <div className="bg-slate-900 border-b border-slate-800">
            <div className="max-w-5xl mx-auto w-full p-3 sm:p-4 sm:px-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950">
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="truncate">Growth AI Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </h4>
                <p className="text-[10px] text-slate-400 font-mono truncate">Executive Intelligence Core v4.2</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={closeGrowthAI}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-amber-400 hover:text-amber-300 transition-colors"
                aria-label="Back to main site"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to site</span>
              </button>
              <button
                onClick={() => {
                  if (voice.listening) voice.stop();
                  if (window.history.state?.growthAI) {
                    window.history.replaceState(null, '', window.location.href);
                  }
                  setIsOpen(false);
                  navigate('/command-center');
                }}
                className="p-1.5 text-slate-400 hover:text-amber-400 transition-colors"
                title="Expand to Full Command Center"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={closeGrowthAI}
                className="p-1.5 text-slate-400 hover:text-white transition-colors"
                aria-label="Close Growth AI chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            </div>
          </div>

          {/* Messages list */}
          <div ref={containerRef} className="flex-1 p-4 sm:px-6 overflow-y-auto space-y-3 text-xs bg-slate-950 max-w-5xl mx-auto w-full">
            {messages.map((m, idx) => (
              <div
                key={idx}
                ref={idx === messages.length - 1 ? lastMessageRef : undefined}
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
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Growth AI processing executive response...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 sm:px-6 py-2 bg-slate-900/60 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <div className="max-w-5xl mx-auto w-full flex items-center gap-1.5 overflow-x-auto">
            <button 
              onClick={() => { setInput('How do I structure a 5-year global expansion roadmap?'); }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 whitespace-nowrap"
            >
              Expansion Roadmap
            </button>
            <button
              onClick={() => {
                setInput("My company has 80 employees, productivity is falling, managers aren't performing and staff turnover is increasing.");
              }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 whitespace-nowrap"
            >
              Diagnose Problem
            </button>
            <button 
              onClick={() => { setInput('What are key AI governance metrics for boards?'); }}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
            >
              AI Governance
            </button>
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-slate-900 border-t border-slate-800">
            {voice.error && (
              <div className="max-w-5xl mx-auto w-full px-3 sm:px-6 pt-2 text-[10px] text-red-300 flex items-start gap-1.5">
                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{voice.error}</span>
                <button
                  type="button"
                  onClick={voice.dismissError}
                  className="text-red-400/70 hover:text-red-300 font-bold"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            <form onSubmit={handleSend} className="max-w-5xl mx-auto w-full p-3 sm:px-6 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={voice.listening ? 'Listening…' : 'Ask Growth AI...'}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
              {voice.supported && (
                <VoiceInputButton
                  listening={voice.listening}
                  onToggle={voice.toggle}
                  disabled={loading}
                  className="p-2"
                />
              )}
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-lg transition-colors font-bold"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};
