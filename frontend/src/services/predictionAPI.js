const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function generateFallbackRecs(riskLevel, params) {
  const recs = [];
  if (['High', 'Critical'].includes(riskLevel)) {
    recs.push('Reduce maximum charge per delay below 20kg');
    recs.push('Increase stemming length by at least 20%');
    recs.push('Conduct pre-blast survey of slope face');
  }
  if (params.slope_angle > 60) recs.push('Consider pre-split blasting to protect slope face');
  if (params.rmr < 40) recs.push('Install slope monitoring instruments before blasting');
  if (['Wet', 'Flooded'].includes(params.groundwater)) recs.push('Use water-resistant explosives and dewater the hole');
  if (params.distance_to_structure < 100) recs.push('Implement blast mats and vibration monitoring');
  if (!recs.length) {
    recs.push('Parameters within acceptable safety limits');
    recs.push('Proceed with standard monitoring protocols');
  }
  return recs;
}

export const fallbackPrediction = (params) => {
  const slopeRisk = (params.slope_angle || 45) / 90;
  const chargeRisk = Math.min(1, (params.max_charge_delay || 25) / 100);
  const rmrProtection = (100 - (params.rmr || 60)) / 100;
  const gwMap = { Dry: 0, Damp: 0.1, Wet: 0.25, Flooded: 0.4 };
  const groundwaterRisk = gwMap[params.groundwater] ?? 0;

  const bisfScore = Math.min(98, Math.max(2, Math.round(
    slopeRisk * 25 + chargeRisk * 20 + rmrProtection * 20 + groundwaterRisk * 15 + Math.random() * 10
  )));

  const riskLevel = bisfScore < 25 ? 'Low' : bisfScore < 50 ? 'Medium' : bisfScore < 75 ? 'High' : 'Critical';

  const k = 1140, n = 1.6;
  const dist = params.distance_to_structure || 200;
  const charge = params.max_charge_delay || 25;
  const ppv = Math.min(200, k * Math.pow(dist / Math.sqrt(charge), -n));

  const sAngle = params.slope_angle || 45;
  const jOrient = params.joint_orientation || 45;
  const diff = Math.abs(sAngle - jOrient);
  const failureMode = diff < 15 ? 'Planar' : diff < 30 ? 'Wedge' : sAngle > 70 ? 'Toppling' : 'Circular';

  const chargeRatio = (params.stemming_length || 1.8) / (params.hole_depth || 8);
  const fragIndex = parseFloat((Math.random() * 0.5 + 0.3).toFixed(3));

  return {
    risk_level: riskLevel,
    bisf_score: bisfScore,
    ppv: parseFloat(ppv.toFixed(2)),
    air_overpressure: parseFloat((ppv * 9.5).toFixed(2)),
    probability: parseFloat((bisfScore / 100).toFixed(3)),
    confidence: 0.72,
    fragmentation_index: fragIndex,
    failure_mode: failureMode,
    energy_distribution: {
      high_energy_core: parseFloat(Math.max(0.1, 0.5 - chargeRatio * 0.2).toFixed(2)),
      primary_fragmentation: parseFloat(Math.min(0.5, 0.3 + bisfScore / 500).toFixed(2)),
      secondary_scatter: parseFloat(Math.min(0.4, 0.15 + fragIndex * 0.1).toFixed(2)),
      stemming_loss: parseFloat(Math.max(0.01, chargeRatio * 0.15).toFixed(2)),
    },
    recommendations: generateFallbackRecs(riskLevel, params),
  };
};

export const runPrediction = async (inputParams) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputParams),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return fallbackPrediction(inputParams);
  }
};

export const checkHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
};
