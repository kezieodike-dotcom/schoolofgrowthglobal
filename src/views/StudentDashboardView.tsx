import React, { useState } from 'react';
import { ViewType } from '../types';
import { STUDENT_DATA } from '../data/mockData';
import { askGrowthAI, describeError, type ChatMessage } from '../lib/growthAI';
import { useVoiceInput } from '../lib/useVoiceInput';
import { useChatAutoScroll } from '../lib/useChatAutoScroll';
import { VoiceInputButton } from '../components/VoiceInputButton';
import {
  AlertTriangle,
  LayoutDashboard,
  BookOpen,
  Terminal,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  TrendingUp,
  Play,
  Bot,
  Lock,
  Flame,
  Download,
  Video,
  MapPin,
  ChevronRight,
} from 'lucide-react';

interface StudentDashboardViewProps {
  onNavigate: (view: ViewType) => void;
}

type Tab = 'overview' | 'courses' | 'schedule' | 'certificates' | 'ai-coach';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'courses', label: 'My Courses', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'schedule', label: 'Schedule', icon: <Calendar className="w-4 h-4" /> },
  { id: 'certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
  { id: 'ai-coach', label: 'Growth AI Coach', icon: <Bot className="w-4 h-4" /> },
];

const SESSION_STYLE: Record<string, string> = {
  'Live Class': 'text-sky-700 bg-sky-50 border-sky-200',
  'Mentor Session': 'text-violet-700 bg-violet-50 border-violet-200',
  Assessment: 'text-rose-700 bg-rose-50 border-rose-200',
  Workshop: 'text-emerald-700 bg-emerald-50 border-emerald-200',
};

/** Small labelled figure used across the top of the overview tab. */
const StatTile: React.FC<{
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}> = ({ label, value, hint, icon }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className="text-amber-600">{icon}</span>
    </div>
    <div className="text-2xl font-serif font-bold text-slate-900">{value}</div>
    {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
  </div>
);

const ProgressBar: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => (
  <div className={`w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 ${className}`}>
    <div
      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
      style={{ width: `${value}%` }}
    />
  </div>
);

const TrackCard: React.FC<{
  track: (typeof STUDENT_DATA)['activeTracks'][number];
  onResume: () => void;
}> = ({ track, onResume }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 font-bold">
          {track.schoolName}
        </span>
        <h4 className="text-base font-serif font-bold text-slate-900 leading-snug">{track.title}</h4>
      </div>
      <span className="text-sm font-mono text-amber-600 font-bold shrink-0">
        {track.progressPercentage}%
      </span>
    </div>

    <ProgressBar value={track.progressPercentage} />

    <div className="flex items-center gap-2 text-[11px] text-slate-500">
      <img
        src={track.instructorAvatar}
        alt={track.instructorName}
        className="w-6 h-6 rounded-full object-cover border border-slate-200"
      />
      <span>{track.instructorName}</span>
      <span className="text-slate-300">•</span>
      <span>{track.modulesCompleted} of {track.moduleCount} modules</span>
    </div>

    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
      <div className="text-slate-500">Next up</div>
      <div className="text-amber-700 font-medium">{track.nextModule}</div>
      <div className="text-[10px] text-slate-500 font-mono">Due {track.dueDate}</div>
    </div>

    <button
      onClick={onResume}
      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
    >
      <Play className="w-3.5 h-3.5 fill-slate-950" />
      <span>Resume Module</span>
    </button>
  </div>
);

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const voice = useVoiceInput({ value: chatInput, onValueChange: setChatInput });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Hello ${STUDENT_DATA.name.split(' ')[0]}. Your Strategic Learning Path is ${STUDENT_DATA.completionPercentage}% complete and you are ${STUDENT_DATA.daysAhead} days ahead of schedule. How can I assist with your Module 4 Boardroom Defense today?`,
    },
  ]);
  const { containerRef, lastMessageRef } = useChatAutoScroll(messages, chatLoading);

  const earned = STUDENT_DATA.certificates.filter((c) => c.status === 'Earned');

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

      {/* Sidebar. Collapses to a horizontally scrolling tab strip on mobile so
          the nav never eats half the screen before any content is visible. */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 md:p-6 flex md:flex-col md:justify-between shrink-0 md:min-h-screen md:sticky md:top-0">
        <div className="w-full space-y-6">

          {/* Profile summary — hidden on mobile, where the header carries it */}
          <div className="hidden md:flex items-center gap-3 pb-6 border-b border-slate-200">
            <img
              src={STUDENT_DATA.avatar}
              alt={STUDENT_DATA.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-300"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 font-serif truncate">{STUDENT_DATA.name}</h4>
              <p className="text-[11px] text-amber-600 font-mono">{STUDENT_DATA.tier}</p>
              <p className="text-[10px] text-slate-500 truncate">{STUDENT_DATA.company}</p>
            </div>
          </div>

          <nav className="flex md:flex-col gap-1 text-xs font-medium overflow-x-auto p-3 md:p-0 scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2.5 md:p-3 rounded-xl transition-colors whitespace-nowrap shrink-0 md:w-full ${
                  activeTab === tab.id
                    ? 'bg-amber-50 text-amber-700 font-bold border border-amber-300'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span className="text-amber-600">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}

            <button
              onClick={() => onNavigate('command-center')}
              className="flex items-center gap-2 md:gap-3 md:justify-between px-3 py-2.5 md:p-3 rounded-xl text-amber-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 md:w-full border border-transparent"
            >
              <span className="flex items-center gap-2 md:gap-3">
                <Terminal className="w-4 h-4 text-amber-600" />
                <span>Growth AI Command</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-600 font-mono">
                LIVE
              </span>
            </button>
          </nav>
        </div>

        <div className="hidden md:block pt-6 border-t border-slate-200">
          <button
            onClick={() => onNavigate('course-detail')}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium flex items-center justify-center gap-2"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Explore Catalog</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 min-w-0">

        {/* Welcome header — shown on every tab so identity and status persist */}
        <div className="bg-gradient-to-r from-white via-slate-50 to-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={STUDENT_DATA.avatar}
                alt={STUDENT_DATA.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-300 md:hidden"
              />
              <div>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-amber-600 font-bold">
                  Executive Student Portal
                </span>
                <h1 className="text-xl sm:text-3xl font-serif font-bold text-slate-900 mt-0.5">
                  Hello, {STUDENT_DATA.name.split(' ')[0]}.
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold">
                {STUDENT_DATA.daysAhead} Days Ahead
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-300 font-bold">
                {STUDENT_DATA.tier}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] sm:text-xs font-mono text-slate-500">
              <span>Overall programme progress</span>
              <span>{STUDENT_DATA.completionPercentage}% / 100%</span>
            </div>
            <ProgressBar value={STUDENT_DATA.completionPercentage} className="h-3" />
          </div>
        </div>

        {/* ── Overview ─────────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6 sm:space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatTile
                label="Path complete"
                value={`${STUDENT_DATA.completionPercentage}%`}
                hint={`${STUDENT_DATA.daysAhead} days ahead of plan`}
                icon={<TrendingUp className="w-4 h-4" />}
              />
              <StatTile
                label="Modules done"
                value={String(STUDENT_DATA.completedCourses)}
                hint="This quarter"
                icon={<CheckCircle2 className="w-4 h-4" />}
              />
              <StatTile
                label="Certificates"
                value={String(STUDENT_DATA.totalCertificates)}
                hint={`${STUDENT_DATA.certificates.length - earned.length} in progress`}
                icon={<Award className="w-4 h-4" />}
              />
              <StatTile
                label="Study hours"
                value={String(STUDENT_DATA.studyHours)}
                hint="Logged to date"
                icon={<Flame className="w-4 h-4" />}
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">Active Tracks</h3>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="text-xs text-amber-600 font-bold hover:text-amber-700 flex items-center gap-1"
                  >
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {STUDENT_DATA.activeTracks.map((track) => (
                    <TrackCard key={track.id} track={track} onResume={() => onNavigate('course-detail')} />
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {/* Mentor */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <h3 className="text-sm font-serif font-bold text-slate-900">Your Mentor</h3>
                  <div className="flex items-center gap-3">
                    <img
                      src={STUDENT_DATA.mentor.avatar}
                      alt={STUDENT_DATA.mentor.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-200"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">{STUDENT_DATA.mentor.name}</p>
                      <p className="text-[11px] text-slate-500 leading-snug">{STUDENT_DATA.mentor.role}</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                    <div className="text-slate-500">Next session</div>
                    <div className="text-amber-700 font-medium font-mono">{STUDENT_DATA.mentor.nextSession}</div>
                  </div>
                </div>

                {/* Next few sessions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-serif font-bold text-slate-900">Coming Up</h3>
                    <button
                      onClick={() => setActiveTab('schedule')}
                      className="text-[11px] text-amber-600 font-bold hover:text-amber-700"
                    >
                      Full schedule
                    </button>
                  </div>
                  <ul className="space-y-2.5">
                    {STUDENT_DATA.upcoming.slice(0, 3).map((s) => (
                      <li key={s.id} className="flex gap-3 text-xs">
                        <div className="w-1 rounded-full bg-amber-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-slate-900 font-medium leading-snug">{s.title}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{s.date} · {s.time}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── My Courses ───────────────────────────────────────────────── */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">My Courses</h3>
              <span className="text-xs text-slate-500 font-mono">
                {STUDENT_DATA.activeTracks.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {STUDENT_DATA.activeTracks.map((track) => (
                <TrackCard key={track.id} track={track} onResume={() => onNavigate('course-detail')} />
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-white to-slate-50 border border-amber-300 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-base font-serif font-bold text-slate-900">Ready for your next track?</h4>
                <p className="text-xs text-slate-500">
                  Browse the full catalogue across all schools and add a programme to your path.
                </p>
              </div>
              <button
                onClick={() => onNavigate('course-detail')}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap"
              >
                Explore Catalog
              </button>
            </div>
          </div>
        )}

        {/* ── Schedule ─────────────────────────────────────────────────── */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">Upcoming Schedule</h3>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-200 shadow-sm overflow-hidden">
              {STUDENT_DATA.upcoming.map((s) => (
                <div key={s.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                  <div className="sm:w-32 shrink-0">
                    <div className="text-sm font-bold text-slate-900 font-mono">{s.date}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{s.time}</div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${
                          SESSION_STYLE[s.type] ?? 'text-slate-600 bg-slate-50 border-slate-200'
                        }`}
                      >
                        {s.type}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        {s.mode === 'Virtual'
                          ? <Video className="w-3 h-3" />
                          : <MapPin className="w-3 h-3" />}
                        {s.mode}
                      </span>
                    </div>
                    <p className="text-sm text-slate-900 font-medium leading-snug">{s.title}</p>
                    <p className="text-[11px] text-slate-500">with {s.host}</p>
                  </div>

                  <button className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0">
                    Add to calendar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Certificates ─────────────────────────────────────────────── */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900">Certificates & Badges</h3>
              <span className="text-xs text-slate-500 font-mono">{earned.length} earned</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {STUDENT_DATA.certificates.map((cert) => {
                const locked = cert.status === 'Locked';
                return (
                  <div
                    key={cert.id}
                    className={`rounded-2xl p-5 space-y-3 shadow-sm border ${
                      cert.status === 'Earned'
                        ? 'bg-white border-emerald-300'
                        : cert.status === 'In Progress'
                          ? 'bg-white border-amber-300'
                          : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-mono uppercase tracking-widest font-bold ${
                          cert.status === 'Earned'
                            ? 'text-emerald-600'
                            : cert.status === 'In Progress'
                              ? 'text-amber-600'
                              : 'text-slate-400'
                        }`}
                      >
                        {cert.status}
                      </span>
                      {cert.status === 'Earned' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      {cert.status === 'In Progress' && <Clock className="w-4 h-4 text-amber-600" />}
                      {locked && <Lock className="w-4 h-4 text-slate-400" />}
                    </div>

                    <h4 className={`font-serif font-bold leading-snug ${locked ? 'text-slate-500' : 'text-slate-900'}`}>
                      {cert.title}
                    </h4>

                    {cert.status === 'Earned' && (
                      <>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Issued {cert.issued} · {cert.credentialId}
                        </p>
                        <button className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2">
                          <Download className="w-3.5 h-3.5 text-amber-600" />
                          Download certificate
                        </button>
                      </>
                    )}

                    {cert.status === 'In Progress' && (
                      <>
                        <ProgressBar value={cert.progressPercentage ?? 0} />
                        <p className="text-[11px] text-slate-500 font-mono">
                          {cert.progressPercentage}% · target {cert.target}
                        </p>
                      </>
                    )}

                    {locked && (
                      <p className="text-[11px] text-slate-500">
                        Unlocks after your current track · target {cert.target}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Growth AI Coach ──────────────────────────────────────────── */}
        {activeTab === 'ai-coach' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-bold text-base text-slate-900">Growth AI Coach</h3>
              </div>
              <span className="hidden sm:inline text-[10px] font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                REAL-TIME INSIGHT ENGINE
              </span>
            </div>

            <div
              ref={containerRef}
              className="h-[45vh] min-h-[260px] overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl text-xs"
            >
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
              <div className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-start gap-2">
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
                className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
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
              <button
                type="submit"
                disabled={chatLoading}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-xs rounded-xl shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
};
