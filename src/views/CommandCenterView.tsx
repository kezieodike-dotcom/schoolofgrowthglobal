import React, { useState } from 'react';
import { ViewType } from '../types';
import { 
  Terminal, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Bot, 
  User, 
  Cpu, 
  BarChart3, 
  FileText, 
  Zap, 
  HelpCircle, 
  Volume2, 
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

interface CommandCenterViewProps {
  onNavigate: (view: ViewType) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'scenario' | 'analyze' | 'audio'>('chat');
  
  // Chat State
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: 'Command Center Protocol Active v4.2. Executive Neural Sync established at 98%. Ready for high-stakes decision synthesis, scenario drills, or strategy review.'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Scenario Drill State
  const [scenarioTopic, setScenarioTopic] = useState('Geopolitical Trade Shock & Supply Chain');
  const [scenarioData, setScenarioData] = useState<any>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Strategy Critique State
  const [strategyText, setStrategyText] = useState('');
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Audio Coach State
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Handlers
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, context: 'Executive Command Center Workspace' })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'assistant', text: data.reply || 'Strategic guidance synthesized.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'assistant', text: 'Growth AI simulation active: Priority focus should remain on gross margin resilience and capital allocation hedges.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateScenario = async () => {
    setScenarioLoading(true);
    setScenarioData(null);
    setSelectedOption(null);

    try {
      const res = await fetch('/api/ai/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: scenarioTopic, difficulty: 'Executive Tier' })
      });
      const data = await res.json();
      setScenarioData(data.scenario);
    } catch (err) {
      setScenarioData({
        title: "Cross-Border Regulatory Divergence Dilemma",
        brief: "A new EU directive restricts cross-border data flows for your primary cloud platform, while APAC partners demand immediate hardware expansion.",
        options: [
          "Option 1: Deploy localized sovereign cloud instances in Frankfurt within 60 days.",
          "Option 2: Re-negotiate enterprise SLA agreements to offset compliance delays.",
          "Option 3: Pivot 40% of compute load to neutral APAC nodes."
        ],
        recommendation: "Option 1 ensures long-term EU regulatory immunity and protects 45% of recurring ARR."
      });
    } finally {
      setScenarioLoading(false);
    }
  };

  const handleAnalyzeStrategy = async () => {
    if (!strategyText.trim() || analysisLoading) return;
    setAnalysisLoading(true);
    setAnalysisData(null);

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategyText })
      });
      const data = await res.json();
      setAnalysisData(data.analysis);
    } catch (err) {
      setAnalysisData({
        strengths: ["Strong visionary expansion narrative", "Inclusion of digital leverage"],
        vulnerabilities: ["CapEx runway not calculated", "Lack of clear downside risk hedges"],
        strategicScore: 84,
        actionPlan: [
          "Incorporate 90-day milestone gates with automated KPI triggers.",
          "Stress test balance sheet against 15% currency fluctuation."
        ]
      });
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030a16] text-slate-100 font-sans">
      
      {/* High-Tech Command Header Bar */}
      <header className="bg-slate-950/90 border-b border-slate-800/80 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-serif text-white tracking-tight">GROWTH AI COMMAND CENTER</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE PROTOCOL v4.2
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Executive Tier Access • Neural Sync: 98%</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={() => onNavigate('student-dashboard')}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
          >
            Portal Dashboard
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors"
          >
            Exit Workspace
          </button>
        </div>
      </header>

      {/* Main Command Workspace */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Main Workspace Panel */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Workspace Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium font-mono">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === 'chat' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span>AI Executive Coach</span>
              </button>

              <button
                onClick={() => setActiveTab('scenario')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === 'scenario' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Scenario Drill</span>
              </button>

              <button
                onClick={() => setActiveTab('analyze')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === 'analyze' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Strategy Critique</span>
              </button>

              <button
                onClick={() => setActiveTab('audio')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                  activeTab === 'audio' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>Audio Briefings</span>
              </button>
            </div>

            {/* TAB 1: AI Executive Coach */}
            {activeTab === 'chat' && (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 h-[560px] flex flex-col justify-between shadow-2xl">
                
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 text-xs">
                  {messages.map((m, idx) => (
                    <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.sender === 'assistant' && (
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}
                      <div className={`max-w-[80%] p-4 rounded-2xl leading-relaxed whitespace-pre-line ${
                        m.sender === 'user' ? 'bg-amber-500 text-slate-950 font-semibold' : 'bg-slate-900 border border-slate-800 text-slate-200'
                      }`}>
                        {m.text}
                      </div>
                      {m.sender === 'user' && (
                        <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 text-slate-300">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex items-center gap-2 text-amber-400 text-xs italic">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Growth AI synthesizing C-Suite response...</span>
                    </div>
                  )}
                </div>

                {/* Strategic Chip Starters */}
                <div className="py-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[10px] font-mono">
                  <span className="text-slate-500">Prompts:</span>
                  <button onClick={() => setChatInput("How do I structure a board-ready M&A valuation memo?")} className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 whitespace-nowrap">
                    M&A Valuation
                  </button>
                  <button onClick={() => setChatInput("What are key risk indicators during sudden supply chain shocks?")} className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap">
                    Supply Chain Shocks
                  </button>
                  <button onClick={() => setChatInput("How can C-Suites measure AI return on investment?")} className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 whitespace-nowrap">
                    AI ROI Metrics
                  </button>
                </div>

                {/* Form Input */}
                <form onSubmit={handleSendChat} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask Growth AI Command Core..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                  <button type="submit" disabled={chatLoading} className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2">
                    <span>Send</span>
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            )}

            {/* TAB 2: Scenario Drill Generator */}
            {activeTab === 'scenario' && (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">AI EXECUTIVE DRILL ENGINE</span>
                  <h3 className="text-xl font-serif font-bold text-white">Interactive Decision Drill</h3>
                  <p className="text-xs text-slate-400">Generate high-stakes executive scenarios and test your decision-making against AI C-suite evaluations.</p>
                </div>

                <div className="flex gap-2">
                  <select
                    value={scenarioTopic}
                    onChange={(e) => setScenarioTopic(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option>Geopolitical Trade Shock & Supply Chain</option>
                    <option>Hostile Boardroom Conflict & Activist Investors</option>
                    <option>Enterprise AI Regulatory Breach & Data Crisis</option>
                    <option>Cross-Border M&A Liquidity Emergency</option>
                  </select>

                  <button
                    onClick={handleGenerateScenario}
                    disabled={scenarioLoading}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 whitespace-nowrap"
                  >
                    {scenarioLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    <span>Generate Drill</span>
                  </button>
                </div>

                {scenarioData && (
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 animate-fadeIn">
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-amber-400">{scenarioData.title}</span>
                      <p className="text-sm text-slate-200 leading-relaxed font-serif">{scenarioData.brief}</p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-mono text-slate-400 font-bold">SELECT YOUR STRATEGIC RESPONSE:</span>
                      {scenarioData.options.map((opt: string, i: number) => (
                        <button
                          key={i}
                          onClick={() => setSelectedOption(i)}
                          className={`w-full p-4 rounded-xl text-xs text-left border transition-all ${
                            selectedOption === i 
                              ? 'bg-amber-500/20 border-amber-500 text-white font-semibold' 
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {selectedOption !== null && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                        <div className="text-emerald-400 font-bold font-mono flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>AI C-Suite Evaluation Rationale:</span>
                        </div>
                        <p className="text-slate-300 leading-relaxed">{scenarioData.recommendation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Strategy Critique */}
            {activeTab === 'analyze' && (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">EXECUTIVE STRATEGY REVIEW</span>
                  <h3 className="text-xl font-serif font-bold text-white">Paste Your Growth Strategy</h3>
                  <p className="text-xs text-slate-400">Growth AI will audit your plan for vulnerabilities, financial risks, and execution gaps.</p>
                </div>

                <textarea
                  value={strategyText}
                  onChange={(e) => setStrategyText(e.target.value)}
                  rows={5}
                  placeholder="Paste strategy outline, OKRs, or expansion plan here..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-amber-500"
                />

                <button
                  onClick={handleAnalyzeStrategy}
                  disabled={analysisLoading || !strategyText.trim()}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  {analysisLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  <span>Run C-Suite Strategic Critique</span>
                </button>

                {analysisData && (
                  <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 animate-fadeIn text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <span className="font-bold text-white font-serif">Strategic Readiness Score</span>
                      <span className="text-lg font-bold font-mono text-amber-400">{analysisData.strategicScore} / 100</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-emerald-400 font-mono font-bold">STRENGTHS:</span>
                        <ul className="list-disc pl-4 text-slate-300 space-y-1">
                          {analysisData.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <span className="text-amber-400 font-mono font-bold">VULNERABILITIES:</span>
                        <ul className="list-disc pl-4 text-slate-300 space-y-1">
                          {analysisData.vulnerabilities.map((v: string, i: number) => <li key={i}>{v}</li>)}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 space-y-2">
                      <span className="text-amber-400 font-bold font-mono">RECOMMENDED ACTION PLAN:</span>
                      <ul className="space-y-1 text-slate-300">
                        {analysisData.actionPlan.map((act: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Audio Briefings */}
            {activeTab === 'audio' && (
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">AUDIO COACH BRIEFINGS</span>
                  <h3 className="text-xl font-serif font-bold text-white">Weekly Executive Briefing</h3>
                  <p className="text-xs text-slate-400">Listen to high-level strategic intelligence summaries generated specifically for C-suite listeners.</p>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-white text-sm">Geopolitical Risk & Capital Allocation (12 mins)</h4>
                    <p className="text-xs text-slate-400">Narrated by Growth AI Executive Voice • Updated Today</p>
                  </div>

                  <button
                    onClick={() => setAudioPlaying(!audioPlaying)}
                    className="p-4 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-lg shadow-amber-500/20"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>

                {audioPlaying && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 animate-pulse flex items-center justify-between">
                    <span>Playing Executive Briefing Audio Stream...</span>
                    <button onClick={() => setAudioPlaying(false)} className="text-white font-bold">Stop</button>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Intelligence Feed Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Strategic Focus Radar */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-4">
              <h4 className="text-sm font-bold text-white font-serif">Strategic Focus Index</h4>

              <div className="space-y-3 text-xs font-mono">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Operational Agility</span>
                    <span className="text-amber-400">72%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Risk Assessment</span>
                    <span className="text-emerald-400">88%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Geopolitical Insight</span>
                    <span className="text-indigo-400">64%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: '64%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Upcoming Milestone */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-3">
              <span className="text-[10px] font-mono text-amber-400 uppercase font-bold">UPCOMING MILESTONE</span>
              <h4 className="font-serif font-bold text-white text-sm">Executive Board Review</h4>
              <p className="text-xs text-slate-400">Scheduled for Nov 14th • Boardroom Defense Defense</p>
              <button
                onClick={() => onNavigate('student-dashboard')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                View Milestone Syllabus
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
