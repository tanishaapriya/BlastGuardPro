import { useState, useCallback } from 'react';
import { runPrediction } from '../services/predictionAPI';
import { useLocalStorage } from './useLocalStorage';
import { LS_PREDICTIONS_KEY } from '../utils/constants';

export function usePrediction() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useLocalStorage(LS_PREDICTIONS_KEY, []);

  const predict = useCallback(async (inputs, siteInfo = {}) => {
    setLoading(true);
    setError(null);
    try {
      const output = await runPrediction(inputs);
      setResult(output);
      const record = {
        id: `pred_${Date.now()}`,
        timestamp: new Date().toISOString(),
        site: siteInfo.site_name || 'Unknown Site',
        siteId: siteInfo.siteId || null,
        blast_type: siteInfo.blast_type || 'Surface Blast',
        inputs,
        outputs: output,
      };
      setPredictions((prev) => [record, ...(prev || []).slice(0, 99)]);
      return output;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setPredictions]);

  const clearHistory = useCallback(() => setPredictions([]), [setPredictions]);

  return { result, loading, error, predictions, predict, clearHistory };
}
