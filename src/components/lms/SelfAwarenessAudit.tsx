import React, { useState, useEffect } from 'react';
import { useLmsSubmission } from '../../lib/useLms';

interface AuditState {
  whoIAm: { strengths: string; gaps: string };
  whatIValue: { values: string };
  whatIBelieve: { helpingBeliefs: string; limitingBeliefs: string };
  howIBehave: {
    pressure: string;
    failure: string;
    criticism: string;
    success: string;
    fear: string;
  };
  myCapabilities: {
    current: string;
    develop: string;
    economic: string;
    social: string;
  };
  myFuture: {
    personToBecome: string;
    capabilitiesToDevelop: string;
    habitsToBuild: string;
    behavioursToStop: string;
    relationshipsToStrengthen: string;
  };
}

const defaultAudit: AuditState = {
  whoIAm: { strengths: '', gaps: '' },
  whatIValue: { values: '' },
  whatIBelieve: { helpingBeliefs: '', limitingBeliefs: '' },
  howIBehave: { pressure: '', failure: '', criticism: '', success: '', fear: '' },
  myCapabilities: { current: '', develop: '', economic: '', social: '' },
  myFuture: {
    personToBecome: '',
    capabilitiesToDevelop: '',
    habitsToBuild: '',
    behavioursToStop: '',
    relationshipsToStrengthen: '',
  },
};

const TextField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}> = ({ label, value, onChange, rows = 3 }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-slate-700 mb-1">{label}</label>
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
      placeholder="Your honest answer..."
    />
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border-t border-slate-100 pt-6 mt-6 first:border-t-0 first:pt-0 first:mt-0">
    <h4 className="text-slate-900 font-bold text-base uppercase tracking-wide mb-4">{title}</h4>
    {children}
  </div>
);

export const SelfAwarenessAudit: React.FC<{ courseId: string }> = ({ courseId }) => {
  const { data, save, saving, savedAt } = useLmsSubmission(courseId, 'self-awareness-audit');
  const [audit, setAudit] = useState<AuditState>(defaultAudit);

  useEffect(() => {
    if (data) setAudit(data);
  }, [data]);

  const update = <K extends keyof AuditState>(section: K, field: keyof AuditState[K], value: string) => {
    const updated = {
      ...audit,
      [section]: { ...audit[section], [field]: value },
    };
    setAudit(updated);
    save(updated);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden my-6">
      <div className="bg-slate-900 px-6 py-4">
        <h3 className="text-amber-400 font-bold text-lg">1.15 The Self-Awareness Audit</h3>
        <p className="text-slate-300 text-sm mt-1">Complete the following honestly. Your progress saves automatically.</p>
      </div>

      <div className="p-6">
        <Section title="Who I Am">
          <TextField
            label="My strongest qualities:"
            value={audit.whoIAm.strengths}
            onChange={v => update('whoIAm', 'strengths', v)}
          />
          <TextField
            label="My major development areas:"
            value={audit.whoIAm.gaps}
            onChange={v => update('whoIAm', 'gaps', v)}
          />
        </Section>

        <Section title="What I Value">
          <TextField
            label="My five major values:"
            value={audit.whatIValue.values}
            onChange={v => update('whatIValue', 'values', v)}
          />
        </Section>

        <Section title="What I Believe">
          <TextField
            label="Three beliefs that help me:"
            value={audit.whatIBelieve.helpingBeliefs}
            onChange={v => update('whatIBelieve', 'helpingBeliefs', v)}
          />
          <TextField
            label="Three beliefs I need to examine:"
            value={audit.whatIBelieve.limitingBeliefs}
            onChange={v => update('whatIBelieve', 'limitingBeliefs', v)}
          />
        </Section>

        <Section title="How I Behave">
          <TextField label="When I am under pressure, I usually:" value={audit.howIBehave.pressure} onChange={v => update('howIBehave', 'pressure', v)} />
          <TextField label="When I fail, I usually:" value={audit.howIBehave.failure} onChange={v => update('howIBehave', 'failure', v)} />
          <TextField label="When I receive criticism, I usually:" value={audit.howIBehave.criticism} onChange={v => update('howIBehave', 'criticism', v)} />
          <TextField label="When I succeed, I usually:" value={audit.howIBehave.success} onChange={v => update('howIBehave', 'success', v)} />
          <TextField label="When I am afraid, I usually:" value={audit.howIBehave.fear} onChange={v => update('howIBehave', 'fear', v)} />
        </Section>

        <Section title="My Capabilities">
          <TextField label="Skills I already possess:" value={audit.myCapabilities.current} onChange={v => update('myCapabilities', 'current', v)} />
          <TextField label="Skills I need to develop:" value={audit.myCapabilities.develop} onChange={v => update('myCapabilities', 'develop', v)} />
          <TextField label="Skills that could create economic value:" value={audit.myCapabilities.economic} onChange={v => update('myCapabilities', 'economic', v)} />
          <TextField label="Skills that could create social value:" value={audit.myCapabilities.social} onChange={v => update('myCapabilities', 'social', v)} />
        </Section>

        <Section title="My Future">
          <TextField label="The person I want to become is:" value={audit.myFuture.personToBecome} onChange={v => update('myFuture', 'personToBecome', v)} rows={4} />
          <TextField label="The capabilities I need to develop are:" value={audit.myFuture.capabilitiesToDevelop} onChange={v => update('myFuture', 'capabilitiesToDevelop', v)} />
          <TextField label="The habits I need to build are:" value={audit.myFuture.habitsToBuild} onChange={v => update('myFuture', 'habitsToBuild', v)} />
          <TextField label="The behaviours I need to stop are:" value={audit.myFuture.behavioursToStop} onChange={v => update('myFuture', 'behavioursToStop', v)} />
          <TextField label="The relationships I need to strengthen are:" value={audit.myFuture.relationshipsToStrengthen} onChange={v => update('myFuture', 'relationshipsToStrengthen', v)} />
        </Section>

        <div className="text-right text-xs text-slate-400 mt-4">
          {saving ? 'Saving…' : savedAt ? `Last saved ${savedAt.toLocaleTimeString()}` : 'Progress saves automatically'}
        </div>
      </div>
    </div>
  );
};
