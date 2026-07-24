import React, { useState } from 'react';
import { ViewType } from '../types';
import { COURSES, FEATURED_COURSE, FACULTY_MEMBERS } from '../data/mockData';
import {
  Crown,
  ArrowRight,
  Award,
  CheckCircle2,
  Users,
  Calendar,
  Clock,
  Sparkles,
  FileText,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Download,
  BookOpen,
  Filter
} from 'lucide-react';

interface LeadershipSchoolViewProps {
  onNavigate: (view: ViewType) => void;
}

export const LeadershipSchoolView: React.FC<LeadershipSchoolViewProps> = ({ onNavigate }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Executive' | 'Emerging Leaders'>('all');
  const [roadmapStage, setRoadmapStage] = useState<number>(1);
  const [certModalOpen, setCertModalOpen] = useState(false);

  const filteredCourses = COURSES.filter(course => {
    if (selectedFilter === 'all') return true;
    return course.level === selectedFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      {/* Hero Header Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-mono text-amber-600">
                <Crown className="w-4 h-4" />
                <span>School of Leadership & Governance</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-tight">
                Raising <br />
                <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
                  Transformational Leaders
                </span>
              </h1>

              <p className="text-slate-600 text-base leading-relaxed max-w-xl">
                Empowering high-potential managers, senior directors, and C-suite executives with adaptive decision-making frameworks, crisis resilience, and strategic foresight required to govern global institutions.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('course-detail')}
                  className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition-all"
                >
                  <span>View Flagship Executive Program</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCertModalOpen(true)}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-sm flex items-center gap-2 transition-all"
                >
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>View Accreditation Certificate</span>
                </button>
              </div>
            </div>

            {/* Right Hero Badge Card */}
            <div className="lg:col-span-5">
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl relative overflow-hidden space-y-6">
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-50 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-amber-600" />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-serif">Global Leadership Standard</h4>
                      <p className="text-[11px] text-slate-500 font-mono">2024 Accredited Framework</p>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-amber-100 text-amber-700 font-mono font-bold">
                    VERIFIED
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Total Certified Leaders</span>
                    <span className="font-mono text-slate-900 font-bold">15,000+ Alumni</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Career Advancement Rate</span>
                    <span className="font-mono text-emerald-600 font-bold">94% Within 1 Year</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Partner Enterprises</span>
                    <span className="font-mono text-slate-900 font-bold">50+ Global Corporations</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="w-full bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Includes 1-on-1 Growth AI Strategy Coach throughout all tracks.</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Excellence Tracks & Course Listings */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-amber-600">
                Curriculum Catalog
              </span>
              <h2 className="text-3xl font-serif font-bold text-slate-900">
                Excellence Tracks
              </h2>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-medium">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedFilter === 'all'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All Programs
              </button>
              <button
                onClick={() => setSelectedFilter('Executive')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedFilter === 'Executive'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Executive Tier
              </button>
              <button
                onClick={() => setSelectedFilter('Emerging Leaders')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedFilter === 'Emerging Leaders'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Emerging Leaders
              </button>
            </div>
          </div>

          {/* Large Highlighted Flagship Course Card (The Global Growth Masters) */}
          <div className="mb-10 bg-gradient-to-r from-white via-white to-slate-50 border border-amber-300 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl pointer-events-none"></div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-300 text-xs font-mono font-bold">
                    FLAGSHIP EXECUTIVE TRACK
                  </span>
                  <span className="text-xs text-slate-500 font-mono">12 Weeks • Live Boardroom</span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
                  Executive Strategy & Global Growth
                </h3>

                <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {FEATURED_COURSE.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>1-on-1 C-Suite Mentorship</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>AI Performance Analytics</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span>Global Alumni Syndicate</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center space-y-4 border-t lg:border-t-0 lg:border-l border-slate-200 pt-6 lg:pt-0 lg:pl-8">
                <div className="text-left lg:text-right">
                  <span className="text-xs text-slate-500 font-mono block">Tuition Status</span>
                  <span className="text-lg font-bold font-serif text-amber-600">{FEATURED_COURSE.price}</span>
                </div>

                <button
                  onClick={() => onNavigate('course-detail')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Apply for Admission</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between hover:border-slate-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
                      {course.level}
                    </span>
                    <span className="text-xs text-amber-600 font-mono">{course.duration}</span>
                  </div>

                  <h4 className="text-lg font-serif font-bold text-slate-900 group-hover:text-amber-700 transition-colors mb-2">
                    {course.title}
                  </h4>

                  <p className="text-xs text-slate-500 line-clamp-3 mb-4">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={course.instructorAvatar} alt={course.instructorName} className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-slate-600 font-medium">{course.instructorName}</span>
                  </div>

                  <button
                    onClick={() => onNavigate('course-detail')}
                    className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* The Leadership Roadmap Timeline */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-600">
              Institutional Progression
            </span>
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              The Leadership Career Roadmap
            </h2>
            <p className="text-sm text-slate-500">
              Select your current executive milestone to preview your progression trajectory across our institutional curriculum.
            </p>
          </div>

          {/* Interactive Stage Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">

            <div
              onClick={() => setRoadmapStage(1)}
              className={`cursor-pointer p-6 rounded-2xl border transition-all ${
                roadmapStage === 1
                  ? 'bg-amber-50 border-amber-500 text-slate-900 shadow-xl'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-mono text-amber-600 mb-1">STAGE 01</div>
              <h4 className="text-base font-bold font-serif mb-2 text-slate-900">Emerging Management</h4>
              <p className="text-xs leading-relaxed">
                Transitioning from operational execution to team governance and strategic alignment.
              </p>
            </div>

            <div
              onClick={() => setRoadmapStage(2)}
              className={`cursor-pointer p-6 rounded-2xl border transition-all ${
                roadmapStage === 2
                  ? 'bg-amber-50 border-amber-500 text-slate-900 shadow-xl'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-mono text-amber-600 mb-1">STAGE 02</div>
              <h4 className="text-base font-bold font-serif mb-2 text-slate-900">Strategic Director</h4>
              <p className="text-xs leading-relaxed">
                Managing multi-unit P&Ls, cross-border growth, and enterprise tech adoption.
              </p>
            </div>

            <div
              onClick={() => setRoadmapStage(3)}
              className={`cursor-pointer p-6 rounded-2xl border transition-all ${
                roadmapStage === 3
                  ? 'bg-amber-50 border-amber-500 text-slate-900 shadow-xl'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-mono text-amber-600 mb-1">STAGE 03</div>
              <h4 className="text-base font-bold font-serif mb-2 text-slate-900">Transformational Executive</h4>
              <p className="text-xs leading-relaxed">
                C-Suite governance, board representation, capital allocation, and global M&A.
              </p>
            </div>

          </div>

          {/* Roadmap Detail Preview */}
          <div className="mt-8 p-8 rounded-2xl bg-slate-50 border border-slate-200 max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-emerald-600 font-bold">RECOMMENDED PATHWAY FOR STAGE 0{roadmapStage}:</span>
              <h4 className="text-lg font-serif font-bold text-slate-900">
                {roadmapStage === 1 && "Adaptive Team Governance & Strategic Foundations"}
                {roadmapStage === 2 && "Executive Strategy & Global Growth Track"}
                {roadmapStage === 3 && "The Global Growth Masters C-Suite Fellowship"}
              </h4>
              <p className="text-xs text-slate-500">
                Includes Growth AI progress tracking, 1-on-1 mentor reviews, and board-ready capstones.
              </p>
            </div>

            <button
              onClick={() => onNavigate('course-detail')}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs whitespace-nowrap"
            >
              Start Pathway
            </button>
          </div>

        </div>
      </section>

      {/* Executive Faculty Showcase */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-amber-600">
              Academic Leadership
            </span>
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Executive Faculty
            </h2>
            <p className="text-sm text-slate-500">
              Taught by former McKinsey directors, Harvard fellows, and global venture partners.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FACULTY_MEMBERS.map((faculty) => (
              <div key={faculty.id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
                <img src={faculty.avatar} alt={faculty.name} className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-amber-200" />
                <div className="text-center space-y-1">
                  <h4 className="font-serif font-bold text-slate-900 text-base">{faculty.name}</h4>
                  <p className="text-xs text-amber-600 font-medium">{faculty.role}</p>
                  <p className="text-[11px] text-slate-500">{faculty.institution}</p>
                </div>
                <div className="pt-3 border-t border-slate-200 space-y-1 text-[10px] text-slate-500">
                  {faculty.credentials.map((cred, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3 h-3 text-amber-600 flex-shrink-0" />
                      <span>{cred}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Accreditation Certificate Modal */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-8 text-slate-900 space-y-6 relative shadow-2xl">
            <button onClick={() => setCertModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900">✕</button>

            <div className="text-center space-y-2">
              <Crown className="w-10 h-10 text-amber-600 mx-auto" />
              <h3 className="text-xl font-serif font-bold text-slate-900">The "Global Growth" Professional Certificate</h3>
              <p className="text-xs text-slate-500">Issued by School of Growth Global & The International Governance Board</p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border-2 border-amber-300 text-center space-y-4 font-serif">
              <div className="text-xs font-mono tracking-widest text-amber-600 uppercase">OFFICIAL CERTIFICATE OF MASTERY</div>
              <p className="text-sm text-slate-600">This certifies that</p>
              <div className="text-2xl font-bold text-slate-900 underline decoration-amber-500/50">Chidi Okeke</div>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                has successfully completed the Executive Strategy & Global Growth Mastery curriculum and demonstrated board-ready governance capabilities.
              </p>
              <div className="pt-4 flex justify-between items-end text-[10px] font-mono text-slate-500">
                <div>ID: SGG-2024-EX-9821</div>
                <div>VERIFIED ON CHAIN</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { alert("Certificate downloaded to device."); setCertModalOpen(false); }}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
