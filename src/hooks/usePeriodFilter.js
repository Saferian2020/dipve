import { useState, useCallback } from 'react';
import {
  getStartOfCurrentWeek,
  getStartOfCurrentMonth,
  getEndOfToday,
} from '../utils/dateUtils';

function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function fromDateInputValue(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function usePeriodFilter() {
  const [fechaDesde, setFechaDesde] = useState(() => getStartOfCurrentWeek());
  const [fechaHasta, setFechaHasta] = useState(() => getEndOfToday());
  const [activePreset, setActivePreset] = useState('week'); // 'week' | 'month' | 'custom'

  const setWeek = useCallback(() => {
    setFechaDesde(getStartOfCurrentWeek());
    setFechaHasta(getEndOfToday());
    setActivePreset('week');
  }, []);

  const setMonth = useCallback(() => {
    setFechaDesde(getStartOfCurrentMonth());
    setFechaHasta(getEndOfToday());
    setActivePreset('month');
  }, []);

  const setCustomRange = useCallback((desdeStr, hastaStr) => {
    const desde = fromDateInputValue(desdeStr);
    const hasta = fromDateInputValue(hastaStr);
    if (desde) {
      setFechaDesde(desde);
    }
    if (hasta) {
      const h = new Date(hasta);
      h.setHours(23, 59, 59, 999);
      setFechaHasta(h);
    }
    setActivePreset('custom');
  }, []);

  return {
    fechaDesde,
    fechaHasta,
    activePreset,
    desdeInput: toDateInputValue(fechaDesde),
    hastaInput: toDateInputValue(fechaHasta),
    setWeek,
    setMonth,
    setCustomRange,
  };
}
