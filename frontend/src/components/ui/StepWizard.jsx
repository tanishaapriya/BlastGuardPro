import { Check } from 'lucide-react';

export default function StepWizard({ steps, currentStep }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, i) => {
        const idx = i + 1;
        const done = idx < currentStep;
        const active = idx === currentStep;
        return (
          <div key={idx} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-3 relative z-10">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-black transition-all ${
                done    ? 'text-white' :
                active  ? 'text-white ring-4 ring-orange-500/20' :
                          'text-slate-500 border-2 border-slate-700'
              }`}
                style={{ background: done ? '#10B981' : active ? '#3B82F6' : '#1E293B' }}>
                {done ? <Check className="w-5 h-5" /> : idx}
              </div>
              <span className={`text-sm font-bold uppercase tracking-wider whitespace-nowrap ${active ? 'text-blue-400' : done ? 'text-emerald-400' : 'text-slate-500'}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-1.5 mx-4 mb-8 rounded-full" style={{ background: done ? '#10B981' : '#334155' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
