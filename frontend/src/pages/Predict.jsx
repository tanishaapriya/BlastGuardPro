import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Zap, CheckCircle, AlertTriangle, Info, RotateCcw, Save, Share2, FileDown, Trash2, Clock
} from 'lucide-react';
import StepWizard from '../components/ui/StepWizard';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Gauge from '../components/ui/Gauge';
import { RiskBadge } from '../components/ui/Badge';
import BlastHoleVisualizer from '../components/visualizer/BlastHoleVisualizer';
import SlopeCrossSectionVisualizer from '../components/visualizer/SlopeCrossSectionVisualizer';
import { usePrediction } from '../hooks/usePrediction';
import { step1Schema, step2Schema, step3Schema, step4Schema } from '../utils/validators';
import { BLAST_TYPES, ROCK_TYPES, GROUNDWATER, SOIL_TYPES, VEGETATION, DETONATION_TYPES, RISK_COLORS } from '../utils/constants';
import { fmtDateTime } from '../utils/formatters';
import Modal from '../components/ui/Modal';

const STEPS = ['Site Info', 'Blast Params', 'Geology', 'Environment', 'Review'];
const SCHEMAS = [step1Schema, step2Schema, step3Schema, step4Schema, null];

const DEFAULTS = {
  site_name: 'Rajasthan Quarry A', site_location: 'Rajasthan, India', latitude: 26.9124, longitude: 75.7873,
  blast_date: new Date().toISOString().split('T')[0], blast_type: 'Surface Blast', engineer: '',
  max_charge_delay: 25, total_charge: 45, hole_depth: 8, hole_diameter: 115,
  stemming_length: 1.8, number_of_rows: 3, specific_charge: 0.45, delay_interval: 25,
  detonation_type: 'Electronic', burden: 2.5, spacing: 3.0,
  rock_type: 'Granite', rmr: 60, rqd: 70, joint_spacing: 300, joint_orientation: 45,
  slope_angle: 55, slope_height: 15, groundwater: 'Dry',
  distance_to_structure: 200, distance_to_slope_crest: 50,
  vibration_limit: 25, air_blast_limit: 115, soil_type: 'Hard Rock', vegetation: 'Sparse',
};

const Field = ({ label, error, children, unit }) => (
  <div>
    <label className="block text-lg font-extrabold text-slate-300 mb-4">
      {label}{unit && <span className="text-slate-500 ml-2 text-sm">({unit})</span>}
    </label>
    {children}
    {error && <p className="text-red-400 text-sm mt-2">{error.message}</p>}
  </div>
);

const Input = ({ className = '', ...props }) => (
  <input {...props} className={`w-full px-5 py-3.5 rounded-xl bg-slate-800 border border-slate-600 text-white text-base placeholder-slate-500 focus:outline-none focus:border-blue-500/70 transition-colors ${className}`} />
);

const Select = ({ options, className = '', ...props }) => (
  <select {...props} className={`w-full px-5 py-3.5 rounded-xl bg-slate-800 border border-slate-600 text-white text-base focus:outline-none focus:border-blue-500/70 transition-colors ${className}`}>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

const SliderInput = ({ label, unit, min, max, step = 0.1, name, register, watch, setValue }) => {
  const val = watch(name);
  const pct = max > min ? ((val - min) / (max - min)) * 100 : 0;
  return (
    <Field label={label} unit={unit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#3D5470' }}>{min}</span>
          <input
            type="number"
            min={min} max={max} step={step}
            {...register(name, { valueAsNumber: true })}
            style={{
              width: 90, padding: '10px 12px', borderRadius: 10,
              background: 'rgba(13,24,41,0.9)', border: '1px solid #243550',
              color: '#E2EAF4', fontSize: 16, fontWeight: 800, textAlign: 'center',
              outline: 'none', fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => e.target.style.borderColor = '#3B82F6'}
            onBlur={e => e.target.style.borderColor = '#243550'}
          />
          <span style={{ fontSize: 11, color: '#3D5470' }}>{max}</span>
        </div>
        <div style={{ position: 'relative', height: 6, borderRadius: 99, background: '#1A2942' }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: '100%',
            width: `${pct}%`, borderRadius: 99,
            background: 'linear-gradient(90deg, #3B82F6, #60A5FA)',
            transition: 'width 0.1s',
          }} />
          <input
            type="range" min={min} max={max} step={step}
            value={val ?? min}
            onChange={e => setValue(name, parseFloat(e.target.value))}
            style={{
              position: 'absolute', inset: 0, width: '100%', opacity: 0,
              cursor: 'pointer', height: '100%', margin: 0,
            }}
          />
        </div>
      </div>
    </Field>
  );
};

export default function Predict() {
  const [step, setStep] = useState(1);
  const [allData, setAllData] = useState(DEFAULTS);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showClearModal, setShowClearModal] = useState(false);
  const { result, predictions, predict, clearHistory } = usePrediction();
  const [currentResult, setCurrentResult] = useState(null);

  const schema = SCHEMAS[step - 1];
  const { register, handleSubmit, watch, setValue, formState: { errors }, getValues, trigger } = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: DEFAULTS,
    mode: 'onChange',
  });

  const watchedVals = watch();

  const goNext = async () => {
    if (schema) {
      const valid = await trigger();
      if (!valid) return;
    }
    const vals = getValues();
    setAllData((p) => ({ ...p, ...vals }));
    setStep((s) => Math.min(5, s + 1));
  };

  const goPrev = () => setStep((s) => Math.max(1, s - 1));

  const runPred = async () => {
    setLoadingPredict(true);
    setProgress(0);
    const msgs = ['Analyzing blast parameters...', 'Processing geological data...', 'Running ML model...', 'Generating recommendations...'];
    let i = 0;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(92, p + Math.random() * 18 + 5));
      i++;
    }, 450);
    const merged = { ...allData, ...getValues() };
    const out = await predict(merged, { site_name: merged.site_name, blast_type: merged.blast_type });
    clearInterval(interval);
    setProgress(100);
    await new Promise((r) => setTimeout(r, 300));
    setCurrentResult(out);
    setLoadingPredict(false);
    if (out) toast.success(`Prediction complete — ${out.risk_level} Risk`);
    else toast.error('Prediction failed');
  };

  const resetForm = () => {
    setStep(1);
    setCurrentResult(null);
    setAllData(DEFAULTS);
    setProgress(0);
  };

  const inputParams = { ...allData, ...watchedVals };

  return (
    <div className="max-w-[1500px] mx-auto space-y-10">
      {/* Step progress */}
      <Card>
        <CardBody className="py-10 px-12">
          <StepWizard steps={STEPS} currentStep={step} />
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr,1fr] gap-24 items-start">
        {/* Form panel */}
        <div className="space-y-4">
          <Card style={{ minHeight: 420 }}>
            <CardHeader title={`Step ${step}: ${STEPS[step-1]}`} />
            <CardBody>
              <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}>

                  {/* STEP 1 */}
                  {step === 1 && (
                    <div className="grid grid-cols-2 gap-14">
                      <Field label="Site Name *" error={errors.site_name} className="col-span-2">
                        <Input {...register('site_name')} placeholder="Rajasthan Quarry A" />
                      </Field>
                      <Field label="Site Location" error={errors.site_location}>
                        <Input {...register('site_location')} placeholder="State, Country" />
                      </Field>
                      <Field label="Blast Type *" error={errors.blast_type}>
                        <Select {...register('blast_type')} options={BLAST_TYPES} />
                      </Field>
                      <Field label="Latitude" error={errors.latitude}>
                        <Input {...register('latitude', { valueAsNumber: true })} type="number" step="0.0001" placeholder="26.9124" />
                      </Field>
                      <Field label="Longitude" error={errors.longitude}>
                        <Input {...register('longitude', { valueAsNumber: true })} type="number" step="0.0001" placeholder="75.7873" />
                      </Field>
                      <Field label="Date of Blast" error={errors.blast_date}>
                        <Input {...register('blast_date')} type="date" />
                      </Field>
                      <Field label="Responsible Engineer" error={errors.engineer}>
                        <Input {...register('engineer')} placeholder="Name" />
                      </Field>
                    </div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <div className="grid grid-cols-1 gap-14">
                      <SliderInput label="Max Charge/Delay" unit="kg" name="max_charge_delay" min={1} max={200} register={register} watch={watch} setValue={setValue} />
                      <Field label="Total Explosive Mass" unit="kg" error={errors.total_charge}>
                        <Input {...register('total_charge', { valueAsNumber: true })} type="number" step="0.1" />
                      </Field>
                      <SliderInput label="Hole Depth" unit="m" name="hole_depth" min={3} max={20} register={register} watch={watch} setValue={setValue} />
                      <SliderInput label="Hole Diameter" unit="mm" name="hole_diameter" min={50} max={300} step={5} register={register} watch={watch} setValue={setValue} />
                      <SliderInput label="Burden" unit="m" name="burden" min={1} max={5} register={register} watch={watch} setValue={setValue} />
                      <SliderInput label="Spacing" unit="m" name="spacing" min={1} max={6} register={register} watch={watch} setValue={setValue} />
                      <SliderInput label="Stemming Length" unit="m" name="stemming_length" min={0.5} max={5} register={register} watch={watch} setValue={setValue} />
                      <Field label="Number of Rows" error={errors.number_of_rows}>
                        <Input {...register('number_of_rows', { valueAsNumber: true })} type="number" min={1} max={20} />
                      </Field>
                      <SliderInput label="Specific Charge" unit="kg/m³" name="specific_charge" min={0.1} max={1.5} step={0.05} register={register} watch={watch} setValue={setValue} />
                      <Field label="Detonation Type" error={errors.detonation_type}>
                        <Select {...register('detonation_type')} options={DETONATION_TYPES} />
                      </Field>
                    </div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <div className="grid grid-cols-2 gap-14">
                      <Field label="Rock Type" error={errors.rock_type}>
                        <Select {...register('rock_type')} options={ROCK_TYPES} />
                      </Field>
                      <Field label="Groundwater Condition" error={errors.groundwater}>
                        <Select {...register('groundwater')} options={GROUNDWATER} />
                      </Field>
                      <SliderInput label="Rock Mass Rating (RMR)" unit="0-100" name="rmr" min={0} max={100} step={1} register={register} watch={watch} setValue={setValue} />
                      <SliderInput label="Rock Quality (RQD)" unit="0-100" name="rqd" min={0} max={100} step={1} register={register} watch={watch} setValue={setValue} />
                      <SliderInput label="Slope Angle" unit="°" name="slope_angle" min={5} max={90} step={1} register={register} watch={watch} setValue={setValue} />
                      <SliderInput label="Slope Height" unit="m" name="slope_height" min={1} max={80} step={0.5} register={register} watch={watch} setValue={setValue} />
                      <SliderInput label="Joint Orientation" unit="°" name="joint_orientation" min={0} max={90} step={1} register={register} watch={watch} setValue={setValue} />
                      <Field label="Joint Spacing" unit="mm" error={errors.joint_spacing}>
                        <Input {...register('joint_spacing', { valueAsNumber: true })} type="number" min={10} max={1000} />
                      </Field>
                    </div>
                  )}

                  {/* STEP 4 */}
                  {step === 4 && (
                    <div className="grid grid-cols-2 gap-14">
                      <Field label="Distance to Structure" unit="m" error={errors.distance_to_structure}>
                        <Input {...register('distance_to_structure', { valueAsNumber: true })} type="number" min={1} />
                      </Field>
                      <Field label="Distance to Slope Crest" unit="m" error={errors.distance_to_slope_crest}>
                        <Input {...register('distance_to_slope_crest', { valueAsNumber: true })} type="number" min={1} />
                      </Field>
                      <Field label="Vibration Limit" unit="mm/s" error={errors.vibration_limit}>
                        <Input {...register('vibration_limit', { valueAsNumber: true })} type="number" step="0.1" />
                      </Field>
                      <Field label="Air Blast Limit" unit="dB" error={errors.air_blast_limit}>
                        <Input {...register('air_blast_limit', { valueAsNumber: true })} type="number" step="0.1" />
                      </Field>
                      <Field label="Soil Type" error={errors.soil_type}>
                        <Select {...register('soil_type')} options={SOIL_TYPES} />
                      </Field>
                      <Field label="Vegetation Cover" error={errors.vegetation}>
                        <Select {...register('vegetation')} options={VEGETATION} />
                      </Field>
                    </div>
                  )}

                  {/* STEP 5 — Review */}
                  {step === 5 && (
                    <div className="space-y-4">
                      {!currentResult && !loadingPredict && (
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            ['Site', allData.site_name], ['Blast Type', allData.blast_type],
                            ['Burden', `${allData.burden} m`], ['Spacing', `${allData.spacing} m`],
                            ['Hole Depth', `${allData.hole_depth} m`], ['Hole Dia.', `${allData.hole_diameter} mm`],
                            ['Stemming', `${allData.stemming_length} m`], ['Max Charge', `${allData.max_charge_delay} kg`],
                            ['Slope Angle', `${allData.slope_angle}°`], ['Slope Height', `${allData.slope_height} m`],
                            ['RMR', allData.rmr], ['Rock Type', allData.rock_type],
                            ['Groundwater', allData.groundwater], ['Rows', allData.number_of_rows],
                          ].map(([l, v]) => (
                            <div key={l} className="flex justify-between py-2 border-b border-slate-800 text-sm">
                              <span className="text-slate-400">{l}</span>
                              <span className="text-white font-medium">{v}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Loading */}
                      {loadingPredict && (
                        <div className="text-center py-8 space-y-4">
                          <div className="relative w-16 h-16 mx-auto">
                            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
                            <div className="absolute inset-0 rounded-full border-4 border-t-orange-500 animate-spin" />
                            <Zap className="absolute inset-0 m-auto w-6 h-6 text-blue-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-300">Analyzing blast parameters...</p>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #3B82F6, #EF4444)' }} />
                          </div>
                          <p className="text-xs text-slate-500">{Math.round(progress)}% complete</p>
                        </div>
                      )}

                      {/* Results */}
                      {currentResult && !loadingPredict && (
                        <ResultsPanel result={currentResult} inputParams={allData} predictions={predictions}
                          onClear={() => setShowClearModal(true)} onNew={resetForm} onClearHistory={clearHistory} />
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </CardBody>
          </Card>
        </div>

        {/* Visualizer panel */}
        <div className="space-y-4">
          {step === 3 ? (
            <SlopeCrossSectionVisualizer
              inputParams={inputParams}
              modelOutput={currentResult}
              isLoading={loadingPredict}
            />
          ) : (
            <div className="h-full" style={{ minHeight: 500 }}>
              <BlastHoleVisualizer
                inputParams={step >= 2 ? inputParams : null}
                modelOutput={currentResult}
                isLoading={loadingPredict}
              />
            </div>
          )}
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-14 mt-14 border-t border-slate-800 flex items-center justify-between">
        <Button variant="outline" size="lg" onClick={goPrev} disabled={step === 1} className="px-12 py-4 text-lg">
          ← Back
        </Button>
        <div className="flex gap-4">
          {step < 5 ? (
            <Button size="lg" onClick={goNext} className="px-12 py-4 text-lg">
              Next →
            </Button>
          ) : !currentResult ? (
            <Button size="lg" loading={loadingPredict} onClick={runPred} icon={Zap} className="px-14 py-5 text-xl font-black shadow-lg shadow-blue-500/20">
              Run Prediction
            </Button>
          ) : (
            <Button variant="secondary" size="lg" onClick={resetForm} icon={RotateCcw} className="px-12 py-4 text-lg">
              New Prediction
            </Button>
          )}
        </div>
      </div>

      <Modal open={showClearModal} onClose={() => setShowClearModal(false)} title="Clear History"
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowClearModal(false)}>Cancel</Button>
            <Button variant="danger" onClick={() => { clearHistory(); setShowClearModal(false); toast.success('History cleared'); }}>
              Clear All
            </Button>
          </div>
        }>
        <p className="text-slate-300">Are you sure you want to clear all prediction history? This cannot be undone.</p>
      </Modal>
    </div>
  );
}

function ResultsPanel({ result, inputParams, predictions, onClear, onNew, onClearHistory }) {
  const riskColor = RISK_COLORS[result.risk_level] || RISK_COLORS.Low;
  const recIcons = { 0: AlertTriangle, 1: Info, 2: CheckCircle };

  const inputGrid = [
    ['Burden', inputParams.burden], ['Spacing', inputParams.spacing],
    ['Hole Depth', inputParams.hole_depth], ['Hole Diameter', inputParams.hole_diameter],
    ['Stemming Length', inputParams.stemming_length], ['Total Charge', inputParams.total_charge],
    ['Max Charge Delay', inputParams.max_charge_delay], ['Specific Charge', inputParams.specific_charge],
    ['Slope Height', inputParams.slope_height], ['Slope Angle', `${inputParams.slope_angle}°`],
    ['Number Of Rows', inputParams.number_of_rows], ['RMR', inputParams.rmr],
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Top row: gauge + stats */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col h-full rounded-xl border" style={{ background: '#0F172A', borderColor: '#1E2D45' }}>
          <Gauge value={result.bisf_score} max={100} label="BISF Score" size={140} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            ['Risk Level', <RiskBadge level={result.risk_level} pulse />],
            ['Failure Prob.', `${(result.probability * 100).toFixed(1)}%`],
            ['Confidence', `${(result.confidence * 100).toFixed(1)}%`],
            ['Failure Mode', result.failure_mode],
          ].map(([l, v]) => (
            <div key={l} className="p-2.5 rounded-lg flex flex-col gap-1" style={{ background: '#0F172A' }}>
              <span className="text-xs text-slate-400">{l}</span>
              <span className="text-sm font-semibold text-white">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input params + history */}
      <div className="grid grid-cols-2 gap-3">
        {/* Input Parameters card */}
        <div className="rounded-xl p-3 border border-slate-700/50" style={{ background: '#0F172A' }}>
          <p className="text-xs font-semibold text-white mb-0.5">Input Parameters Used</p>
          <p className="text-[10px] text-slate-500 mb-2">Blast configuration for this prediction</p>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {inputGrid.map(([l, v]) => (
              <div key={l} className="flex justify-between gap-1">
                <span className="text-[10px] text-slate-400 truncate">{l}</span>
                <span className="text-[10px] font-bold text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prediction history card */}
        <div className="rounded-xl p-3 border border-slate-700/50 flex flex-col" style={{ background: '#0F172A' }}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-white">Prediction History</p>
            <button onClick={onClear} className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
              <Trash2 className="w-2.5 h-2.5" />Clear
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mb-2">Last {Math.min(predictions?.length || 0, 8)} runs</p>
          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-28">
            {(predictions || []).slice(0, 8).map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-[10px]">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse-dot flex-shrink-0"
                  style={{ background: RISK_COLORS[p.outputs.risk_level]?.border || '#64748B' }} />
                <span className="text-slate-400 truncate flex-1">{fmtDateTime(p.timestamp)}</span>
                <span className="font-semibold" style={{ color: RISK_COLORS[p.outputs.risk_level]?.text }}>
                  {p.outputs.risk_level}
                </span>
              </div>
            ))}
            {(!predictions || predictions.length === 0) && (
              <p className="text-[10px] text-slate-600">No history yet</p>
            )}
          </div>
        </div>
      </div>

      {/* PPV / air / fragmentation */}
      <div className="grid grid-cols-3 gap-3">
        {[
          ['PPV Estimate', `${result.ppv} mm/s`, result.ppv > 25 ? 'Over limit!' : 'Within limit', result.ppv > 25 ? '#EF4444' : '#10B981'],
          ['Air Overpressure', `${result.air_overpressure} dB`, result.air_overpressure > 115 ? 'Over limit!' : 'Safe', result.air_overpressure > 115 ? '#EF4444' : '#10B981'],
          ['Fragmentation', result.fragmentation_index.toFixed(3), 'Index (0–1)', '#3B82F6'],
        ].map(([l, v, sub, c]) => (
          <div key={l} className="p-3 rounded-xl border border-slate-700/50" style={{ background: '#0F172A' }}>
            <p className="text-xs text-slate-400 mb-1">{l}</p>
            <p className="text-base font-bold text-white">{v}</p>
            <p className="text-[10px] mt-0.5" style={{ color: c }}>{sub}</p>
            {l === 'Fragmentation' && (
              <div className="w-full bg-slate-800 rounded-full h-1 mt-2 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${result.fragmentation_index * 100}%`, background: '#3B82F6' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="rounded-xl p-4 border border-slate-700/50" style={{ background: '#0F172A' }}>
        <p className="text-sm font-semibold text-white mb-3">Recommendations</p>
        <ul className="space-y-2">
          {result.recommendations.map((r, i) => {
            const Icon = recIcons[i % 3];
            return (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: i === 0 ? '#3B82F6' : i === 1 ? '#3B82F6' : '#10B981' }} />
                {r}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" icon={Save} onClick={() => toast.success('Prediction saved!')}>Save</Button>
        <Button size="sm" variant="outline" icon={FileDown} onClick={() => toast.info('PDF export coming soon')}>Export PDF</Button>
        <Button size="sm" variant="ghost" icon={RotateCcw} onClick={onNew}>New Prediction</Button>
        <Button size="sm" variant="ghost" icon={Share2} onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success('Link copied!'); }}>Share</Button>
      </div>
    </div>
  );
}
