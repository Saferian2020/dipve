import { useState, useEffect, useRef } from 'react';
import { SHEET_URLS } from '../constants/sheetConfig';
import { parseSheetCSV } from '../utils/sheetParser';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const cache = {
  data: null,
  timestamp: null,
};

export function useSheetData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    const now = Date.now();

    if (cache.data && cache.timestamp && now - cache.timestamp < CACHE_TTL_MS) {
      setData(cache.data);
      setLastUpdated(new Date(cache.timestamp));
      setLoading(false);
      return;
    }

    abortRef.current = new AbortController();

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(SHEET_URLS.respuestas, {
          signal: abortRef.current.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const csv = await res.text();
        const parsed = parseSheetCSV(csv);

        cache.data = parsed;
        cache.timestamp = Date.now();

        setData(parsed);
        setLastUpdated(new Date(cache.timestamp));
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('No se pudieron cargar los datos. Verificá tu conexión.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { data, loading, error, lastUpdated };
}
