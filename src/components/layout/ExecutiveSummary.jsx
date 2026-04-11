import { useMemo } from 'react';
import { calcExecutiveSummary, calcWeeklyTrend } from '../../utils/kpiCalculator';
import DeltaBadge from '../ui/DeltaBadge';

const WINE = '#5C1A1A';

function KPICard({ label, children }) {
  return (
    <div className="flex-1 min-w-[120px] px-4 py-2.5 text-center">
      <div className="flex items-center justify-center min-h-[2.5rem]">{children}</div>
      <div className="text-xs text-gray-400 font-medium mt-0.5 whitespace-nowrap">{label}</div>
    </div>
  );
}

export default function ExecutiveSummary({ data, fechaDesde, fechaHasta }) {
  const stats = useMemo(
    () => calcExecutiveSummary(data, fechaDesde, fechaHasta),
    [data, fechaDesde, fechaHasta]
  );

  // Use calcWeeklyTrend to compare current calendar week vs previous calendar week
  const weekDelta = useMemo(() => {
    const weeks = calcWeeklyTrend(data, 2);
    if (weeks.length < 2) return null;
    const prev = weeks[0].visitas;
    const curr = weeks[1].visitas;
    if (prev === 0 && curr === 0) return null;
    return curr - prev;
  }, [data]);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-2 py-1">
        <div className="flex overflow-x-auto divide-x divide-gray-100">
          <KPICard label="Visitas">
            <span className="text-2xl font-black" style={{ color: WINE }}>
              {stats.visitas}
            </span>
          </KPICard>

          <KPICard label="Conversión">
            <span className="text-2xl font-black" style={{ color: WINE }}>
              {stats.conversion !== null ? `${stats.conversion}%` : '—'}
            </span>
          </KPICard>

          <KPICard label="Pedidos">
            <span className="text-2xl font-black" style={{ color: WINE }}>
              {stats.pedidos}
            </span>
          </KPICard>

          <KPICard label="vs sem. anterior">
            <DeltaBadge delta={weekDelta} />
          </KPICard>
        </div>
      </div>
    </div>
  );
}
