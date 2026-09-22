import React, { useState, useEffect } from 'react';
import { useLmsSubmission } from '../../lib/useLms';
import { Plus, Trash2 } from 'lucide-react';

interface Strength {
  name: string;
  evidence: string;
}
interface DevelopmentGap {
  area: string;
  currentSituation: string;
  evidence: string;
  consequence: string;
  desiredState: string;
  developmentAction: string;
}
interface PlanRow {
  goal: string;
  action: string;
  frequency: string;
  measurement: string;
  deadline: string;
  evidence: string;
}
interface ProjectState {
  partA: { identity: string };
  partB: { strengths: Strength[] };
  partC: { gaps: DevelopmentGap[] };
  partD: { values: string };
  partE: { helpingBeliefs: string; limitingBeliefs: string };
  partF: { behaviours: string };
  partG: { current: string; develop: string; income: string; career: string; service: string };
  partH: { plans: PlanRow[] };
}

const defaultStrength = (): Strength => ({ name: '', evidence: '' });
const defaultGap = (): DevelopmentGap => ({
  area: '', currentSituation: '', evidence: '', consequence: '', desiredState: '', developmentAction: '',
});
const defaultPlan = (): PlanRow => ({
  goal: '', action: '', frequency: '', measurement: '', deadline: '', evidence: '',
});

const defaultProject: ProjectState = {
  partA: { identity: '' },
  partB: { strengths: [defaultStrength(), defaultStrength(), defaultStrength(), defaultStrength(), defaultStrength()] },
  partC: { gaps: [defaultGap(), defaultGap(), defaultGap(), defaultGap(), defaultGap()] },
  partD: { values: '' },
  partE: { helpingBeliefs: '', limitingBeliefs: '' },
  partF: { behaviours: '' },
  partG: { current: '', develop: '', income: '', career: '', service: '' },
  partH: { plans: [defaultPlan(), defaultPlan(), defaultPlan()] },
};

const SectionHeader: React.FC<{ label: string; subtitle?: string }> = ({ label, subtitle }) => (
  <div className="bg-slate-800 text-white px-5 py-3 -mx-6 mt-6 mb-4 first:mt-0">
    <h4 className="font-bold text-amber-400">{label}</h4>
    {subtitle && <p className="text-slate-300 text-sm">{subtitle}</p>}
  </div>
);

export const PersonalGrowthProject: React.FC<{ courseId: string }> = ({ courseId }) => {
  const { data, save, saving, savedAt } = useLmsSubmission(courseId, 'student-project');
  const [project, setProject] = useState<ProjectState>(defaultProject);

  useEffect(() => {
    if (data) setProject(data);
  }, [data]);

  const update = (patch: Partial<ProjectState>) => {
    const next = { ...project, ...patch };
    setProject(next);
    save(next);
  };

  const setPartA = (val: string) => update({ partA: { identity: val } });
  const setPartD = (val: string) => update({ partD: { values: val } });
  const setPartF = (val: string) => update({ partF: { behaviours: val } });
  const setPartE = (field: 'helpingBeliefs' | 'limitingBeliefs', val: string) =>
    update({ partE: { ...project.partE, [field]: val } });
  const setPartG = (field: keyof ProjectState['partG'], val: string) =>
    update({ partG: { ...project.partG, [field]: val } });

  // Part B helpers
  const updateStrength = (i: number, field: keyof Strength, val: string) => {
    const strengths = [...project.partB.strengths];
    strengths[i] = { ...strengths[i], [field]: val };
    update({ partB: { strengths } });
  };

  // Part C helpers
  const updateGap = (i: number, field: keyof DevelopmentGap, val: string) => {
    const gaps = [...project.partC.gaps];
    gaps[i] = { ...gaps[i], [field]: val };
    update({ partC: { gaps } });
  };

  // Part H helpers
  const updatePlan = (i: number, field: keyof PlanRow, val: string) => {
    const plans = [...project.partH.plans];
    plans[i] = { ...plans[i], [field]: val };
    update({ partH: { plans } });
  };

  const TA = ({ label, value, onChange, rows = 3 }: any) => (
    <div className="mb-3">
      <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
        placeholder="Your response..."
      />
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden my-6">
      <div className="bg-slate-900 px-6 py-5">
        <div className="inline-block bg-amber-400 text-slate-900 text-xs font-bold px-3 py-1 rounded-full mb-2">MAJOR MODULE PROJECT</div>
        <h3 className="text-white font-bold text-xl">Personal Growth Profile</h3>
        <p className="text-slate-300 text-sm mt-1">Every learner must submit a Personal Growth Profile. Your progress saves automatically.</p>
      </div>

      <div className="p-6">
        <SectionHeader label="Part A — Personal Identity" subtitle="Write a description of who you are, your current stage of life/career, your responsibilities, aspirations, and current challenges." />
        <TA label="Personal Identity Description:" value={project.partA.identity} onChange={setPartA} rows={8} />

        <SectionHeader label="Part B — Strengths" subtitle='Identify at least five strengths. For each, provide evidence. Do not simply write "I am a leader." Write: "I have demonstrated leadership by…"' />
        {project.partB.strengths.map((s, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-amber-600">Strength {i + 1}</span>
            </div>
            <TA label="Strength:" value={s.name} onChange={(v: string) => updateStrength(i, 'name', v)} rows={2} />
            <TA label="Evidence (I have demonstrated this by…):" value={s.evidence} onChange={(v: string) => updateStrength(i, 'evidence', v)} rows={3} />
          </div>
        ))}

        <SectionHeader label="Part C — Development Gaps" subtitle="Identify five areas requiring improvement. For each, answer the structured questions." />
        {project.partC.gaps.map((g, i) => (
          <div key={i} className="border border-slate-200 rounded-xl p-4 mb-3">
            <span className="text-sm font-bold text-amber-600 block mb-3">Gap {i + 1}</span>
            <TA label="Area requiring improvement:" value={g.area} onChange={(v: string) => updateGap(i, 'area', v)} rows={2} />
            <TA label="Current situation:" value={g.currentSituation} onChange={(v: string) => updateGap(i, 'currentSituation', v)} rows={2} />
            <TA label="Evidence:" value={g.evidence} onChange={(v: string) => updateGap(i, 'evidence', v)} rows={2} />
            <TA label="Consequence:" value={g.consequence} onChange={(v: string) => updateGap(i, 'consequence', v)} rows={2} />
            <TA label="Desired state:" value={g.desiredState} onChange={(v: string) => updateGap(i, 'desiredState', v)} rows={2} />
            <TA label="Development action:" value={g.developmentAction} onChange={(v: string) => updateGap(i, 'developmentAction', v)} rows={2} />
          </div>
        ))}

        <SectionHeader label="Part D — Values" />
        <TA label="Identify your top five values and explain how they influence your decisions:" value={project.partD.values} onChange={setPartD} rows={6} />

        <SectionHeader label="Part E — Beliefs" />
        <TA label="Three beliefs that are helping you:" value={project.partE.helpingBeliefs} onChange={(v: string) => setPartE('helpingBeliefs', v)} rows={4} />
        <TA label="Three beliefs that may be limiting you:" value={project.partE.limitingBeliefs} onChange={(v: string) => setPartE('limitingBeliefs', v)} rows={4} />

        <SectionHeader label="Part F — Behaviour" />
        <TA label="Identify three behavioural patterns you want to change:" value={project.partF.behaviours} onChange={setPartF} rows={5} />

        <SectionHeader label="Part G — Capability" />
        <TA label="Current skills:" value={project.partG.current} onChange={(v: string) => setPartG('current', v)} />
        <TA label="Skills to develop:" value={project.partG.develop} onChange={(v: string) => setPartG('develop', v)} />
        <TA label="Skills that could produce income:" value={project.partG.income} onChange={(v: string) => setPartG('income', v)} />
        <TA label="Skills that could improve your career:" value={project.partG.career} onChange={(v: string) => setPartG('career', v)} />
        <TA label="Skills that could help you serve others:" value={project.partG.service} onChange={(v: string) => setPartG('service', v)} />

        <SectionHeader label="Part H — 90-Day Development Plan" subtitle="Choose your three highest-priority development areas. For each, complete: Goal → Action → Frequency → Measurement → Deadline → Evidence" />
        {project.partH.plans.map((p, i) => (
          <div key={i} className="border border-amber-200 bg-amber-50 rounded-xl p-4 mb-4">
            <span className="text-sm font-bold text-amber-700 block mb-3">Development Area {i + 1}</span>
            <TA label="Goal:" value={p.goal} onChange={(v: string) => updatePlan(i, 'goal', v)} rows={2} />
            <TA label="Action:" value={p.action} onChange={(v: string) => updatePlan(i, 'action', v)} rows={2} />
            <TA label="Frequency:" value={p.frequency} onChange={(v: string) => updatePlan(i, 'frequency', v)} rows={1} />
            <TA label="Measurement:" value={p.measurement} onChange={(v: string) => updatePlan(i, 'measurement', v)} rows={2} />
            <TA label="Deadline:" value={p.deadline} onChange={(v: string) => updatePlan(i, 'deadline', v)} rows={1} />
            <TA label="Evidence:" value={p.evidence} onChange={(v: string) => updatePlan(i, 'evidence', v)} rows={2} />
          </div>
        ))}

        <div className="text-right text-xs text-slate-400 mt-4">
          {saving ? 'Saving…' : savedAt ? `Last saved ${savedAt.toLocaleTimeString()}` : 'Progress saves automatically'}
        </div>
      </div>
    </div>
  );
};
