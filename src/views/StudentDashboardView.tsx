import React, { useState } from 'react';
import { ViewType } from '../types';
import { STUDENT_DATA } from '../data/mockData';
import { askGrowthAI, describeError, type ChatMessage } from '../lib/growthAI';
import { useVoiceInput } from '../lib/useVoiceInput';
import { useChatAutoScroll } from '../lib/useChatAutoScroll';
import { VoiceInputButton } from '../components/VoiceInputButton';
import {
  AlertTriangle,
  Crown,
  LayoutDashboard,
  BookOpen,
  Terminal,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Send,
  ArrowUpRight,
  TrendingUp,
  Play,
  ShieldCheck,
  User,
  Bot,
  Settings,
  HelpCircle,
  FileText
} from 'lucide-react';

interface StudentDashboardViewProps {
  onNavigate: (view: ViewType) => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'ai-coach' | 'milestones'>('overview');
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const voice = useVoiceInput({ value: chatInput, onValueChange: setChatInput });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Hello Alex. Your Strategic Learning Path is 45% complete and you are 12 days ahead of schedule. How can I assist with your Module 4 Boardroom Defense today?'
    }
  ]);
  const { containerRef, lastMessageRef } = useChatAutoScroll(messages, chatLoading);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    // Close the dictation session so the next sentence does not land in an
    // input the user has already cleared.
    if (voice.listening) voice.stop();

    const userText = chatInput.trim();
    const history = messages;
    setChatInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const { reply, simulated } = await askGrowthAI({
        message: userText,
        context: `Student Portal Dashboard for ${STUDENT_DATA.name}, ${STUDENT_DATA.title}`,
        history,
      });
      setMessages(prev => [...prev, { sender: 'assistant', text: reply, simulated }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'assistant', text: describeError(err), failed: true }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">

      {/* Dashboard Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">

          {/* User Profile Summary */}
          <div className="flex items-center gap-3 pb-6 border-b border-slate-200">
            <img
              src={STUDENT_DATA.avatar}
              alt={STUDENT_DATA.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-300"
            />
            <div>
              <h4 className="text-sm font-bold text-slate-900 font-serif">{STUDENT_DATA.name}</h4>
              <p className="text-[11px] text-amber-600 font-mono">{STUDENT_DATA.tier}</p>
              <p className="text-[10px] text-slate-500">{STUDENT_DATA.company}</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                activeTab === 'overview' ? 'bg-amber-50 text-amber-700 font-bold border border-amber-300' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-amber-600" />
              <span>Portal Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                activeTab === 'courses' ? 'bg-amber-50 text-amber-700 font-bold border border-amber-300' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Active Tracks</span>
            </button>

            <button
              onClick={() => onNavigate('command-center')}
              className="w-full flex items-center justify-between p-3 rounded-xl text-amber-700 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-amber-600" />
                <span>Growth AI Command</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 font-mono">
                LIVE
              </span>
            </button>

            <button
              onClick={() => setActiveTab('milestones')}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                activeTab === 'milestones' ? 'bg-amber-50 text-amber-700 font-bold border border-amber-300' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Certificates & Badges</span>
            </button>
          </nav>

        </div>

        {/* Bottom Quick Action */}
        <div className="pt-6 border-t border-slate-200">
          <button
            onClick={() => onNavigate('course-detail')}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium flex items-center justify-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Explore Catalog</span>
          </button>
        </div>
      </aside>

      {/* Main Portal Workspace */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">

        {/* Welcome Header & Progress Status */}
        <div className="bg-gradient-to-r from-white via-slate-50 to-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-600 font-bold">
                EXECUTIVE STUDENT PORTAL
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-1">
                Hello, {STUDENT_DATA.name}.
              </h1>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold">
                12 Days Ahead
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-300 font-bold">
                Level 4 Executive
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your Strategic Learning Path is <span className="text-amber-600 font-bold">{STUDENT_DATA.completionPercentage}% Complete</span>. You have completed {STUDENT_DATA.completedCourses} modules this quarter.
          </p>

          {/* Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-mono text-slate-500">
              <span>Overall Program Progress</span>
              <span>45% / 100%</span>
            </div>
            <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full w-[45%]"></div>
            </div>
          </div>
        </div>

        {/* Active Excellence Tracks Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-serif font-bold text-slate-900">Active Excellence Tracks</h3>
            <span className="text-xs text-slate-500 font-mono">2 Active Enrolled</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {STUDENT_DATA.activeTracks.map((track) => (
              <div key={track.id} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <h4 className="text-base font-serif font-bold text-slate-900">{track.title}</h4>
                  <span className="text-xs font-mono text-amber-600 font-bold">{track.progressPercentage}%</span>
                </div>

                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-200">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${track.progressPercentage}%` }}></div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="text-slate-500">Next Action:</div>
                  <div className="text-amber-700 font-medium">{track.nextModule}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Target Completion: {track.dueDate}</div>
                </div>

                <button
                  onClick={() => onNavigate('course-detail')}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Play className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Resume Module</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Career Progression Roadmap Timeline */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <h3 className="text-lg font-serif font-bold text-slate-900">Career Progression Milestones</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-emerald-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-emerald-600 font-bold">MILESTONE 1</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <h5 className="font-bold text-slate-900">Strategic Foresight Certified</h5>
              <p className="text-[11px] text-slate-500">Completed Q2 2024</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-amber-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-amber-600 font-bold">MILESTONE 2</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <h5 className="font-bold text-slate-900">C-Suite Boardroom Defense</h5>
              <p className="text-[11px] text-slate-500">In Progress (68%)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 opacity-60">
              <div className="flex items-center justify-between">
                <span className="font-mono text-slate-500">MILESTONE 3</span>
                <Award className="w-4 h-4 text-slate-500" />
              </div>
              <h5 className="font-bold text-slate-900">Global Growth Fellow</h5>
              <p className="text-[11px] text-slate-500">Target Q1 2025</p>
            </div>
          </div>
        </div>

        {/* Embedded Growth AI Coach Chat Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-amber-600" />
              <h3 className="font-serif font-bold text-base text-slate-900">Ask Growth AI Coach</h3>
            </div>
            <span className="text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              REAL-TIME INSIGHT ENGINE
            </span>
          </div>

          <div ref={containerRef} className="h-48 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                ref={idx === messages.length - 1 ? lastMessageRef : undefined}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.failed && (
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-3 text-red-500" />
                )}
                <div className={`max-w-[85%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium'
                    : m.failed
                      ? 'bg-red-50 border border-red-200 text-red-700'
                      : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                }`}>
                  {m.text}
                  {m.simulated && (
                    <span className="block mt-2 text-[10px] font-mono uppercase tracking-wide text-amber-600">
                      Simulated · no API key set
                    </span>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && <div className="text-amber-600 text-xs animate-pulse">Growth AI generating strategic feedback...</div>}
          </div>

          {voice.error && (
            <div className="mb-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="flex-1">{voice.error}</span>
              <button
                type="button"
                onClick={voice.dismissError}
                className="text-red-400 hover:text-red-600 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSendChat} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={
                voice.listening
                  ? 'Listening…'
                  : 'Ask about Module 4 Boardroom Defense or scenario strategy...'
              }
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
            />
            {voice.supported && (
              <VoiceInputButton
                listening={voice.listening}
                onToggle={voice.toggle}
                disabled={chatLoading}
                theme="light"
                className="px-3 rounded-xl"
              />
            )}
            <button type="submit" disabled={chatLoading} className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </main>

    </div>
  );
};
