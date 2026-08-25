import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ViewType } from '../types';
import { STUDENT_DATA, COURSES, MENTORS } from '../data/mockData';
import { askGrowthAI, describeError, type ChatMessage } from '../lib/growthAI';
import { useVoiceInput } from '../lib/useVoiceInput';
import { useChatAutoScroll } from '../lib/useChatAutoScroll';
import { VoiceInputButton } from '../components/VoiceInputButton';
import { useEnrollment } from '../lib/useEnrollment';
import { useMentorPairing } from '../lib/useMentorPairing';
import { deriveExperience, aiQuota, type StudentFeature } from '../lib/studentExperience';
import { PLANS, formatNaira, type CourseLevel, type PackageId, type Entitlement } from '../lib/pricing';
import { MentorConversation } from '../components/MentorConversation';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Calendar,
  CheckCircle2,
  Send,
  TrendingUp,
  Play,
  Bot,
  Lock,
  Flame,
  Video,
  MapPin,
  ChevronRight,
  Users,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  AlertTriangle,
  ClipboardCheck,
  Trophy,
  MessageSquare,
} from 'lucide-react';

/**
 * The student portal.
 *
 * Foundation and Elite students are not on the same programme, so they do
 * not get the same dashboard with pieces greyed out - the navigation itself
 * changes. Foundation has no live schedule to show and no mentor to meet; Elite
 * has a capstone and a mentor pairing that Foundation has never seen.
 *
 * What each package means is decided in src/lib/studentExperience.ts, derived
 * from the pricing catalogue. This file renders that description and holds no
 * package rules of its own, so changing what Executive Cycle includes changes this
 * screen without touching it.
 *
 * The learning content itself (tracks, sessions, certificates) is still mock
 * data - there is no LMS behind this yet. What is real is the entitlement:
 * which package you hold, when it lapses, and what it opens.
 */

interface StudentDashboardViewProps {
  onNavigate: (view: ViewType) => void;
}

type Tab =
  | 'overview'
  | 'courses'
  | 'schedule'
  | 'mentor'
  | 'messages'
  | 'certificates'
  | 'ai-coach';

const SESSION_STYLE: Record<string, string> = {
  'Live Class': 'text-sky-700 bg-sky-50 border-sky-200',
  'Mentor Session': 'text-violet-700 bg-violet-50 border-violet-200',
  Assessment: 'text-rose-700 bg-rose-50 border-rose-200',
  Workshop: 'text-emerald-700 bg-emerald-50 border-emerald-200',
};

const isTab = (value: string | null): value is Tab =>
  value === 'overview' ||
  value === 'courses' ||
  value === 'schedule' ||
  value === 'mentor' ||
  value === 'messages' ||
  value === 'certificates' ||
  value === 'ai-coach';

// -- Small pieces ---------------------------------------------------------

const ProgressBar: React.FC<{ value: number; className?: string }> = ({
  value,
  className = '',
}) => (
  <div
    className={`w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200 ${className}`}
  >
    <div
      className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500"
      style={{ width: `${Math.min(100, value)}%` }}
    />
  </div>
);

const StatTile: React.FC<{
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}> = ({ label, value, hint, icon }) => (
  <div className="bg-white border border-slate-200 rounded-lg p-4 sm:p-5 shadow-sm space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className="text-amber-600">{icon}</span>
    </div>
    <div className="text-2xl font-bold text-slate-900">{value}</div>
    {hint && <div className="text-[11px] text-slate-500">{hint}</div>}
  </div>
);

/**
 * Shown in place of a tab's content when the package does not include it.
 *
 * Names the specific package that opens the feature and what it costs, rather
 * than a generic "upgrade to continue" - a locked door is more tolerable when
 * it tells you which key fits.
 */
const UpgradePanel: React.FC<{
  title: string;
  body: string;
  feature: StudentFeature;
}> = ({ title, body, feature }) => {
  const plan = feature.unlockedBy ? PLANS[feature.unlockedBy] : null;

  return (
    <div className="bg-white border border-amber-300 rounded-lg p-8 sm:p-10 text-center space-y-5 shadow-sm">
      <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
        <Lock className="w-7 h-7 text-amber-600" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">{body}</p>
        {feature.note && (
          <p className="text-[11px] text-slate-400 font-mono pt-1">{feature.note}</p>
        )}
      </div>
      {plan && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-1">
          <Link
            to={`/checkout/${plan.code}`}
            className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            Upgrade to {plan.name} - {formatNaira(plan.amountKobo)}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/pricing"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            Compare packages
          </Link>
        </div>
      )}
    </div>
  );
};

// -- Not enrolled ---------------------------------------------------------

const LockedPortal: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
    <div className="w-full max-w-lg text-center space-y-6">
      <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center mx-auto">
        <Lock className="w-8 h-8 text-amber-600" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          Your portal opens with a package
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          The student portal holds your courses, schedule, certificates and AI coach.
          Choose a package and it opens immediately - no application queue.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {(['mini', 'medium', 'maxi'] as PackageId[]).map((code) => (
          <Link
            key={code}
            to={`/checkout/${code}`}
            className="p-4 rounded-lg bg-white border border-slate-200 hover:border-amber-400 shadow-sm transition-all space-y-1"
          >
            <span className="block text-sm font-bold text-slate-900">
              {PLANS[code].name}
            </span>
            <span className="block text-[11px] font-mono text-amber-600">
              {formatNaira(PLANS[code].amountKobo)}
            </span>
          </Link>
        ))}
      </div>

      <Link
        to="/pricing"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
      >
        Compare what each includes <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  </div>
);

// -- Portal ---------------------------------------------------------------

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  onNavigate,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const enrollment = useEnrollment();
  const experience = useMemo(
    () => deriveExperience(enrollment.entitlements),
    [enrollment.entitlements]
  );
  const pairing = useMentorPairing(enrollment.mentorSlots);

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const requested = searchParams.get('tab');
    return isTab(requested) ? requested : 'overview';
  });
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [questionsAsked, setQuestionsAsked] = useState(0);
  const voice = useVoiceInput({ value: chatInput, onValueChange: setChatInput });
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: `Hello ${STUDENT_DATA.name.split(' ')[0]}. Your Strategic Learning Path is ${STUDENT_DATA.completionPercentage}% complete and you are ${STUDENT_DATA.daysAhead} days ahead of schedule. How can I assist today?`,
    },
  ]);
  const { containerRef, lastMessageRef } = useChatAutoScroll(messages, chatLoading);
  const requestedMentorId = searchParams.get('mentor');

  const earned = STUDENT_DATA.certificates.filter((c) => c.status === 'Earned');
  const quota = aiQuota(experience.packageId);
  const quotaSpent = Math.min(questionsAsked, quota);

  // Live sessions a Foundation student cannot attend are filtered out rather than
  // listed as locked: a schedule of things you cannot go to is not a schedule.
  const sessions = useMemo(
    () =>
      STUDENT_DATA.upcoming.filter((session) => {
        if (session.type === 'Mentor Session')
          return experience.mentorship.state === 'included';
        if (session.type === 'Assessment')
          return experience.assessments.state === 'included';
        if (session.type === 'Live Class' || session.type === 'Workshop')
          return experience.liveCohorts.state === 'included';
        return true;
      }),
    [experience]
  );

  const tabs = useMemo(() => {
    const base: { id: Tab; label: string; icon: React.ReactNode; locked?: boolean }[] = [
      { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'courses', label: 'My Courses', icon: <BookOpen className="w-4 h-4" /> },
      {
        id: 'schedule',
        label: experience.liveCohorts.state === 'included' ? 'Live Schedule' : 'Schedule',
        icon: <Calendar className="w-4 h-4" />,
        locked: experience.liveCohorts.state === 'locked',
      },
      {
        id: 'mentor',
        label: 'My Mentor',
        icon: <Users className="w-4 h-4" />,
        locked: experience.mentorship.state === 'locked',
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: <MessageSquare className="w-4 h-4" />,
        locked: experience.mentorship.state === 'locked',
      },
      { id: 'certificates', label: 'Certificates', icon: <Award className="w-4 h-4" /> },
      { id: 'ai-coach', label: 'Growth AI Coach', icon: <Bot className="w-4 h-4" /> },
    ];
    return base;
  }, [experience]);

  useEffect(() => {
    const next = searchParams.get('tab');
    if (isTab(next)) setActiveTab(next);
  }, [searchParams]);

  const openTab = (tab: Tab) => {
    setActiveTab(tab);
    const next = new URLSearchParams(searchParams);
    next.set('tab', tab);
    if (tab !== 'messages') next.delete('mentor');
    setSearchParams(next, { replace: true });
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;
    if (quotaSpent >= quota) return;

    if (voice.listening) voice.stop();

    const userText = chatInput.trim();
    const history = messages;
    setChatInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);
    setQuestionsAsked((n) => n + 1);

    try {
      const { reply, simulated } = await askGrowthAI({
        message: userText,
        context: `Student Portal for ${STUDENT_DATA.name}, on the ${experience.packageName} package`,
        history,
      });
      setMessages((prev) => [...prev, { sender: 'assistant', text: reply, simulated }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: describeError(err), failed: true },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (!experience.packageId) return <LockedPortal />;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row">
      {/* -- Sidebar ----------------------------------------------------- */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 md:p-6 flex md:flex-col md:justify-between shrink-0 md:min-h-screen md:sticky md:top-0">
        <div className="w-full space-y-6">
          <div className="hidden md:flex items-center gap-3 pb-6 border-b border-slate-200">
            <img
              src={STUDENT_DATA.avatar}
              alt={STUDENT_DATA.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-300"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate">
                {STUDENT_DATA.name}
              </h4>
              <p className="text-[11px] text-amber-600 font-mono">
                {experience.packageName} package
              </p>
              <p className="text-[10px] text-slate-500 truncate">{STUDENT_DATA.company}</p>
            </div>
          </div>

          <nav className="flex md:flex-col gap-1 text-xs font-medium overflow-x-auto p-3 md:p-0 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => openTab(tab.id)}
                className={`flex items-center gap-2 md:gap-3 px-3 py-2.5 md:p-3 rounded-xl transition-colors whitespace-nowrap shrink-0 md:w-full ${
                  activeTab === tab.id
                    ? 'bg-amber-50 text-amber-700 font-bold border border-amber-300'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <span className={tab.locked ? 'text-slate-300' : 'text-amber-600'}>
                  {tab.icon}
                </span>
                <span className={tab.locked ? 'text-slate-400' : undefined}>
                  {tab.label}
                </span>
                {tab.locked && <Lock className="w-3 h-3 text-slate-300 md:ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Access window, and the upgrade if there is one above this package. */}
        <div className="hidden md:block pt-6 border-t border-slate-200 space-y-3">
          {experience.daysRemaining !== null && (
            <div
              className={`p-3 rounded-xl border text-[11px] space-y-1 ${
                experience.expiringSoon
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <p className="font-mono font-bold">
                {experience.daysRemaining} days left
              </p>
              <p className="leading-relaxed">
                {experience.expiringSoon
                  ? 'Your access is ending soon. Renew to keep your progress open.'
                  : 'of your access window.'}
              </p>
            </div>
          )}

          {experience.upgradeTo && (
            <Link
              to={`/checkout/${experience.upgradeTo}`}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl text-xs text-white font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Upgrade to {PLANS[experience.upgradeTo].name}
            </Link>
          )}
        </div>
      </aside>

      {/* -- Workspace --------------------------------------------------- */}
      <main className="flex-1 p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 min-w-0">
        <header className="bg-gradient-to-r from-white via-slate-50 to-slate-50 border border-slate-200 rounded-lg p-5 sm:p-8 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img
                src={STUDENT_DATA.avatar}
                alt={STUDENT_DATA.name}
                className="w-11 h-11 rounded-full object-cover border-2 border-amber-300 md:hidden"
              />
              <div>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-amber-600 font-bold">
                  {experience.packageName} Student Portal
                </span>
                <h1 className="text-xl sm:text-3xl font-bold text-slate-900 mt-0.5">
                  Hello, {STUDENT_DATA.name.split(' ')[0]}.
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold">
                {STUDENT_DATA.daysAhead} Days Ahead
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-300 font-bold">
                {experience.packageName}
              </span>
            </div>
          </div>

          {experience.expiringSoon && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-px" />
              <p className="text-[11px] text-amber-900 leading-relaxed">
                Your {experience.packageName} access ends in{' '}
                <strong>{experience.daysRemaining} days</strong>. Renew to keep your
                courses and certificates open.
              </p>
            </div>
          )}

          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] sm:text-xs font-mono text-slate-500">
              <span>Overall programme progress</span>
              <span>{STUDENT_DATA.completionPercentage}% / 100%</span>
            </div>
            <ProgressBar value={STUDENT_DATA.completionPercentage} className="h-3" />
          </div>
        </header>

        {activeTab === 'overview' && (
          <OverviewTab
            experience={experience}
            earnedCount={earned.length}
            sessions={sessions}
            onOpenTab={openTab}
            onNavigate={onNavigate}
          />
        )}

        {activeTab === 'courses' && (
          <CoursesTab canAccess={enrollment.canAccessLevel} onNavigate={onNavigate} />
        )}

        {activeTab === 'schedule' &&
          (experience.liveCohorts.state === 'included' ? (
            <ScheduleTab sessions={sessions} experience={experience} />
          ) : (
            <UpgradePanel
              title="Live classes are not on Growth Foundation Cohort"
              body="Growth Foundation Cohort is a self-paced programme - your modules have no fixed times, so there is no live schedule to keep. Executive Cycle adds live cohort classes, Q&A and graded assessment dates."
              feature={experience.liveCohorts}
            />
          ))}

        {activeTab === 'mentor' &&
          (experience.mentorship.state === 'included' ? (
            <MentorTab
              pairedIds={pairing.mentorIds}
              slots={enrollment.mentorSlots}
              entitlements={enrollment.entitlements}
            />
          ) : (
            <UpgradePanel
              title="You have no mentor yet"
              body="Mentor access pairs you with an operator in your field for 1-on-1 sessions and messaging between them. It comes bundled with Elite, or you can subscribe to it on its own."
              feature={experience.mentorship}
            />
          ))}

        {activeTab === 'messages' &&
          (experience.mentorship.state === 'included' ? (
            <MessagesTab
              pairedIds={pairing.mentorIds}
              slots={enrollment.mentorSlots}
              entitlements={enrollment.entitlements}
              preferredMentorId={requestedMentorId}
            />
          ) : (
            <UpgradePanel
              title="Mentor messaging is not active yet"
              body="Messaging opens once you have mentor access and have paired with at least one mentor. Elite includes it, or you can subscribe to mentorship on its own."
              feature={experience.mentorship}
            />
          ))}

        {activeTab === 'certificates' && (
          <CertificatesTab experience={experience} earnedCount={earned.length} />
        )}

        {activeTab === 'ai-coach' && (
          <AiCoachTab
            experience={experience}
            messages={messages}
            chatInput={chatInput}
            chatLoading={chatLoading}
            quota={quota}
            quotaSpent={quotaSpent}
            voice={voice}
            containerRef={containerRef}
            lastMessageRef={lastMessageRef}
            onChange={setChatInput}
            onSend={handleSendChat}
          />
        )}
      </main>
    </div>
  );
};

// -- Overview -------------------------------------------------------------

const OverviewTab: React.FC<{
  experience: ReturnType<typeof deriveExperience>;
  earnedCount: number;
  sessions: typeof STUDENT_DATA.upcoming;
  onOpenTab: (tab: Tab) => void;
  onNavigate: (view: ViewType) => void;
}> = ({ experience, earnedCount, sessions, onOpenTab, onNavigate }) => {
  /** What this package includes, stated plainly rather than left to discovery. */
  const capabilities: { label: string; feature: StudentFeature; icon: React.ReactNode }[] =
    [
      { label: 'Live cohort classes', feature: experience.liveCohorts, icon: <Video className="w-4 h-4" /> },
      { label: 'Graded assessments', feature: experience.assessments, icon: <ClipboardCheck className="w-4 h-4" /> },
      { label: 'In-person intensives', feature: experience.inPersonIntensives, icon: <MapPin className="w-4 h-4" /> },
      { label: 'Capstone project', feature: experience.capstone, icon: <Trophy className="w-4 h-4" /> },
      { label: 'Mentor access', feature: experience.mentorship, icon: <Users className="w-4 h-4" /> },
      { label: 'Growth AI coach', feature: experience.aiCoach, icon: <Sparkles className="w-4 h-4" /> },
    ];

  return (
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
          value={String(earnedCount)}
          hint={experience.certification.label}
          icon={<Award className="w-4 h-4" />}
        />
        <StatTile
          label="Study hours"
          value={String(STUDENT_DATA.studyHours)}
          hint="Logged to date"
          icon={<Flame className="w-4 h-4" />}
        />
      </div>

      {/* What the package includes */}
      <section className="bg-white border border-slate-200 rounded-lg p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Your {experience.packageName} programme
          </h3>
          <Link
            to="/pricing"
            className="text-[11px] font-bold text-amber-600 hover:text-amber-700 whitespace-nowrap"
          >
            Compare packages
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {capabilities.map(({ label, feature, icon }) => {
            const on = feature.state === 'included';
            return (
              <div
                key={label}
                className={`flex items-start gap-2.5 p-3 rounded-xl border ${
                  on
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className={on ? 'text-emerald-600' : 'text-slate-300'}>
                  {on ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-medium ${
                      on ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {label}
                  </p>
                  {feature.note && (
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                      {feature.note}
                    </p>
                  )}
                  {!on && feature.unlockedBy && !feature.note && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {PLANS[feature.unlockedBy].name} unlocks this
                    </p>
                  )}
                </div>
                <span className="ml-auto text-slate-300 shrink-0">{icon}</span>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Active Tracks
            </h3>
            <button
              onClick={() => onOpenTab('courses')}
              className="text-xs text-amber-600 font-bold hover:text-amber-700 flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {STUDENT_DATA.activeTracks.map((track) => (
            <div
              key={track.id}
              className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 font-bold">
                    {track.schoolName}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {track.title}
                  </h4>
                </div>
                <span className="text-sm font-mono text-amber-600 font-bold shrink-0">
                  {track.progressPercentage}%
                </span>
              </div>

              <ProgressBar value={track.progressPercentage} />

              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <img
                  src={track.instructorAvatar}
                  alt=""
                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                />
                <span>{track.instructorName}</span>
                <span className="text-slate-300">•</span>
                <span>
                  {track.modulesCompleted} of {track.moduleCount} modules
                </span>
              </div>

              <button
                onClick={() => onNavigate('course-detail')}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                Resume module
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            {experience.liveCohorts.state === 'included' ? 'Coming up' : 'Your deadlines'}
          </h3>

          {sessions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-lg p-6 text-center space-y-2 shadow-sm">
              <Calendar className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 leading-relaxed">
                Nothing scheduled. Growth Foundation Cohort is self-paced, so you set your own rhythm.
              </p>
            </div>
          ) : (
            sessions.slice(0, 4).map((session) => (
              <div
                key={session.id}
                className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      SESSION_STYLE[session.type]
                    }`}
                  >
                    {session.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {session.date}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {session.title}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {session.time} · {session.host}
                </p>
              </div>
            ))
          )}

          {experience.upgradeTo && (
            <div className="p-5 rounded-lg bg-slate-900 text-white space-y-2">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-amber-400" />
                Move up to {PLANS[experience.upgradeTo].name}
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {experience.upgradeTo === 'medium'
                  ? 'Unlock all five schools, live cohort classes and verified certification.'
                  : 'Add Senior Directorate programmes, in-person intensives and a year of mentor access.'}
              </p>
              <Link
                to={`/checkout/${experience.upgradeTo}`}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 pt-1 transition-colors"
              >
                {formatNaira(PLANS[experience.upgradeTo].amountKobo)}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// -- My Courses -----------------------------------------------------------

const CoursesTab: React.FC<{
  canAccess: (level: CourseLevel) => boolean;
  onNavigate: (view: ViewType) => void;
}> = ({ canAccess, onNavigate }) => {
  const open = COURSES.filter((c) => canAccess(c.level as CourseLevel));
  const locked = COURSES.filter((c) => !canAccess(c.level as CourseLevel));

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Open to you
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            {open.length} courses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {open.map((course) => (
            <button
              key={course.id}
              onClick={() => onNavigate('course-detail')}
              className="text-left bg-white border border-slate-200 hover:border-amber-300 rounded-lg overflow-hidden shadow-sm transition-all group"
            >
              <div className="h-24 overflow-hidden relative">
                <img
                  src={course.heroImage}
                  alt=""
                  className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
              </div>
              <div className="p-4 space-y-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  {course.level}
                </span>
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {course.title}
                </h4>
                <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1">
                  Start <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {locked.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900">
            Available on a higher package
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {locked.map((course) => (
              <div
                key={course.id}
                className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                    {course.level}
                  </span>
                  <Lock className="w-3.5 h-3.5 text-slate-300" />
                </div>
                <h4 className="text-sm font-bold text-slate-400 leading-snug">
                  {course.title}
                </h4>
                <Link
                  to="/pricing"
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  Unlock <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// -- Schedule -------------------------------------------------------------

const ScheduleTab: React.FC<{
  sessions: typeof STUDENT_DATA.upcoming;
  experience: ReturnType<typeof deriveExperience>;
}> = ({ sessions, experience }) => (
  <div className="space-y-4">
    <h3 className="text-lg sm:text-xl font-bold text-slate-900">
      Your live schedule
    </h3>

    {sessions.length === 0 ? (
      <div className="bg-white border border-slate-200 rounded-lg p-10 text-center space-y-2 shadow-sm">
        <Calendar className="w-7 h-7 text-slate-300 mx-auto" />
        <p className="text-sm text-slate-500">Nothing scheduled yet.</p>
      </div>
    ) : (
      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="space-y-1.5 min-w-0">
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  SESSION_STYLE[session.type]
                }`}
              >
                {session.type}
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {session.title}
              </h4>
              <p className="text-[11px] text-slate-500 flex items-center gap-2">
                <span>{session.host}</span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1">
                  {session.mode === 'Virtual' ? (
                    <Video className="w-3 h-3" />
                  ) : (
                    <MapPin className="w-3 h-3" />
                  )}
                  {session.mode}
                </span>
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs font-mono font-bold text-slate-900">{session.date}</p>
              <p className="text-[11px] font-mono text-slate-400">{session.time}</p>
            </div>
          </div>
        ))}
      </div>
    )}

    {experience.inPersonIntensives.state === 'locked' && (
      <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-slate-500 leading-relaxed">
          In-person executive intensives are part of the Elite package.{' '}
          <Link to="/checkout/maxi" className="text-amber-600 font-bold hover:underline">
            See what Elite adds
          </Link>
          .
        </p>
      </div>
    )}
  </div>
);

// -- Mentor ---------------------------------------------------------------

const MessagesTab: React.FC<{
  pairedIds: string[];
  slots: number;
  entitlements: Entitlement[];
  preferredMentorId: string | null;
}> = ({ pairedIds, slots, entitlements, preferredMentorId }) => {
  const paired = MENTORS.filter((m) => pairedIds.includes(m.id));
  const [selectedId, setSelectedId] = useState<string | null>(
    preferredMentorId && pairedIds.includes(preferredMentorId)
      ? preferredMentorId
      : paired[0]?.id ?? null
  );

  useEffect(() => {
    if (preferredMentorId && pairedIds.includes(preferredMentorId)) {
      setSelectedId(preferredMentorId);
      return;
    }
    if (!selectedId || !pairedIds.includes(selectedId)) {
      setSelectedId(paired[0]?.id ?? null);
    }
  }, [pairedIds, paired, preferredMentorId, selectedId]);

  const selected = paired.find((m) => m.id === selectedId) ?? null;
  const credential =
    entitlements.find(
      (e) => new Date(e.mentorshipExpiresAt).getTime() > Date.now() && e.email
    ) ?? null;

  if (paired.length === 0) {
    return (
      <div className="bg-white border border-amber-300 rounded-lg p-8 sm:p-10 text-center space-y-4 shadow-sm">
        <MessageSquare className="w-9 h-9 text-amber-600 mx-auto" />
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-slate-900">
            Choose a mentor to start messaging
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Your messaging inbox appears as soon as you pair with a mentor from the
            marketplace.
          </p>
        </div>
        <Link
          to="/mentors"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
        >
          Browse mentors <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 font-bold">
            Student to mentor chat
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Messages
          </h3>
          <p className="text-sm text-slate-500 max-w-2xl leading-relaxed mt-1">
            Keep decisions, feedback and follow-ups with each mentor in one place.
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {pairedIds.length} of {slots} mentor slots active
        </span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4 items-start">
        <aside className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900">My mentors</p>
            <MessageSquare className="w-4 h-4 text-amber-600" />
          </div>
          <div className="divide-y divide-slate-100">
            {paired.map((mentor) => (
              <button
                key={mentor.id}
                onClick={() => setSelectedId(mentor.id)}
                className={`w-full p-4 text-left flex items-center gap-3 transition-all active:scale-[0.99] ${
                  selectedId === mentor.id ? 'bg-amber-50' : 'hover:bg-slate-50'
                }`}
              >
                <img
                  src={mentor.avatar}
                  alt=""
                  className="w-11 h-11 rounded-xl object-cover border border-amber-200"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {mentor.name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">{mentor.role}</p>
                  <p className="text-[10px] font-mono text-amber-600 mt-1">
                    Replies within a working day
                  </p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          {selected && credential ? (
            <div className="space-y-3">
              <div className="bg-slate-900 text-white rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={selected.avatar}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover border border-amber-400"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">
                      {selected.name}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{selected.role}</p>
                  </div>
                </div>
                <Link
                  to="/mentors"
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book a session
                </Link>
              </div>
              <MentorConversation
                mentor={selected}
                entitlement={credential}
                studentName={STUDENT_DATA.name}
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-3 shadow-sm">
              <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
              <h4 className="text-base font-bold text-slate-900">
                Messaging needs your payment email
              </h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                We could not find the entitlement that opened mentor access in this
                browser. Re-open the portal from the device you paid on, or contact
                support and we will link your access.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

const MentorTab: React.FC<{
  pairedIds: string[];
  slots: number;
  entitlements: Entitlement[];
}> = ({ pairedIds, slots, entitlements }) => {
  const paired = MENTORS.filter((m) => pairedIds.includes(m.id));
  const [openThread, setOpenThread] = useState<string | null>(null);

  // Messaging is opened with the email and reference from a real payment, so
  // it needs the entitlement that granted mentor access.
  const credential =
    entitlements.find(
      (e) => new Date(e.mentorshipExpiresAt).getTime() > Date.now() && e.email
    ) ?? null;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
          Your mentors
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          {pairedIds.length} of {slots} slots used
        </span>
      </div>

      {paired.length === 0 ? (
        <div className="bg-white border border-amber-300 rounded-lg p-8 text-center space-y-4 shadow-sm">
          <Users className="w-8 h-8 text-amber-600 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-900">
              You have not chosen a mentor yet
            </h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your package includes mentor access. Browse the directory and pair with
              someone who has already built what you are building.
            </p>
          </div>
          <Link
            to="/mentors"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Choose your mentor <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paired.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <img
                  src={mentor.avatar}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover border-2 border-amber-300"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900">
                    {mentor.name}
                  </h4>
                  <p className="text-[11px] text-amber-600">{mentor.role}</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{mentor.bio}</p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                <p className="text-slate-500">Next session</p>
                <p className="text-amber-700 font-medium">
                  {STUDENT_DATA.mentor.nextSession}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/mentors"
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book
                </Link>
                <button
                  onClick={() =>
                    setOpenThread(openThread === mentor.id ? null : mentor.id)
                  }
                  className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {openThread === mentor.id ? 'Close' : 'Message'}
                </button>
              </div>

              {openThread === mentor.id &&
                (credential ? (
                  <MentorConversation
                    mentor={mentor}
                    entitlement={credential}
                    studentName={STUDENT_DATA.name}
                  />
                ) : (
                  <p className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3 leading-relaxed">
                    Messaging opens with the email you paid with. We could not find a
                    payment record in this browser - sign in from the device you
                    enrolled on, or contact us and we will link it up.
                  </p>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// -- Certificates ---------------------------------------------------------

const CertificatesTab: React.FC<{
  experience: ReturnType<typeof deriveExperience>;
  earnedCount: number;
}> = ({ experience, earnedCount }) => (
  <div className="space-y-5">
    <div className="p-5 rounded-lg bg-white border border-amber-300 shadow-sm space-y-1">
      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
        <Award className="w-4 h-4 text-amber-600" />
        {experience.certification.label}
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed">
        {experience.certification.note} You have earned {earnedCount} so far.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {STUDENT_DATA.certificates.map((cert) => (
        <div
          key={cert.id}
          className={`rounded-lg p-5 space-y-3 border shadow-sm ${
            cert.status === 'Earned'
              ? 'bg-white border-emerald-200'
              : cert.status === 'Locked'
                ? 'bg-slate-50 border-slate-200'
                : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <h4
              className={`text-sm font-bold leading-snug ${
                cert.status === 'Locked' ? 'text-slate-400' : 'text-slate-900'
              }`}
            >
              {cert.title}
            </h4>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border whitespace-nowrap ${
                cert.status === 'Earned'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : cert.status === 'Locked'
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {cert.status}
            </span>
          </div>

          {cert.status === 'In Progress' && cert.progressPercentage !== undefined && (
            <>
              <ProgressBar value={cert.progressPercentage} />
              <p className="text-[11px] text-slate-500 font-mono">
                {cert.progressPercentage}% · target {cert.target}
              </p>
            </>
          )}

          {cert.status === 'Earned' && (
            <p className="text-[11px] text-slate-500 font-mono">
              Issued {cert.issued} · {cert.credentialId}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
);

// -- Growth AI ------------------------------------------------------------

const AiCoachTab: React.FC<{
  experience: ReturnType<typeof deriveExperience>;
  messages: ChatMessage[];
  chatInput: string;
  chatLoading: boolean;
  quota: number;
  quotaSpent: number;
  voice: ReturnType<typeof useVoiceInput>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  lastMessageRef: React.RefObject<HTMLDivElement | null>;
  onChange: (value: string) => void;
  onSend: (e: React.FormEvent) => void;
}> = ({
  experience,
  messages,
  chatInput,
  chatLoading,
  quota,
  quotaSpent,
  voice,
  containerRef,
  lastMessageRef,
  onChange,
  onSend,
}) => {
  const capped = Number.isFinite(quota);
  const exhausted = capped && quotaSpent >= quota;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
          Growth AI Coach
        </h3>

        {/* Growth Foundation Cohort is metered, so the allowance is shown rather than discovered
            when a question is refused. */}
        {capped ? (
          <div className="flex items-center gap-2.5">
            <div className="w-24 h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  exhausted ? 'bg-rose-500' : 'bg-amber-500'
                }`}
                style={{ width: `${(quotaSpent / quota) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {quotaSpent}/{quota} this month
            </span>
          </div>
        ) : (
          <span className="text-[11px] font-mono text-emerald-600">
            Unlimited on {experience.packageName}
          </span>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[520px]">
        <div ref={containerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              ref={index === messages.length - 1 ? lastMessageRef : undefined}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                  message.sender === 'user'
                    ? 'bg-amber-500 text-slate-950 font-medium'
                    : message.failed
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}

          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {exhausted ? (
          <div className="p-5 border-t border-slate-200 bg-amber-50 text-center space-y-2">
            <p className="text-xs text-amber-900 leading-relaxed">
              You have used all {quota} Growth AI questions on Growth Foundation Cohort this month.
            </p>
            <Link
              to="/checkout/medium"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
            >
              Go unlimited with Executive Cycle <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSend}
            className="p-4 border-t border-slate-200 flex items-center gap-2"
          >
            <input
              value={chatInput}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Ask about your programme, a module, or a decision you're facing..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 transition-colors"
            />
            {/* Hidden rather than disabled where the browser has no speech
                API - a permanently dead button is worse than no button. */}
            {voice.supported && (
              <VoiceInputButton
                listening={voice.listening}
                onToggle={voice.toggle}
                disabled={chatLoading}
                theme="light"
              />
            )}
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="p-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 transition-colors"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
