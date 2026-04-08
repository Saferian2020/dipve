import { useMemo } from 'react';
import { calcEntregasStats } from '../../utils/kpiCalculator';

const WINE = '#5C1A1A';

function KPICard({ label, value, sub, highlight }) {
  return (
    <div
      className={`rounded-lg shadow p-4 flex flex-col items-center text-center min-w-0 ${
        highlight ? 'bg-white border-2' : 'bg-white'
      }`}
      style={highlight ? { borderColor: WINE } : {}}
    >
      <span className="text-xs text-gray-500 uppercase tracking-wide mb-1 leading-tight">
        {label}
      </span>
      <span className="text-3xl font-bold leading-none" style={{ color: WINE }}>
        {value}
      </span>
      {sub && <span className="text-xs text-gray-400 mt-1">{sub}</span>}
    </div>
  );
}

const ESTADO_CONFIG = {
  'Entrega Total': { color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
  'Entrega Parcial': { color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  'No Entregado': { color: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
};

function EstadoBadge({ label, count, total }) {
  const cfg = ESTADO_CONFIG[label] || { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${cfg.color}`}>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
        <span className="font-medium text-sm">{label}</span>
      </div>
      <div className="text-right">
        <span className="font-bold text-lg">{count}</span>
        <span className="text-xs ml-1 opacity-70">({pct}%)</span>
      </div>
    </div>
  );
}

const METODO_COLORS = [
  'bg-indigo-100 text-indigo-800',
  'bg-purple-100 text-purple-800',
  'bg-teal-100 text-teal-800',
  'bg-orange-100 text-orange-800',
];

export default function EntregasPanel({ data, fechaDesde, fechaHasta }) {
  const stats = useMemo(
    () => calcEntregasStats(data, fechaDesde, fechaHasta),
    [data, fechaDesde, fechaHasta]
  );

  const noData = stats.total === 0;

  return (
    <div className="w-full space-y-4">
      {/* Panel header */}
      <div className="rounded-lg px-4 py-3" style={{ backgroundColor: WINE }}>
        <h2 className="text-white font-bold text-lg tracking-wide">Entregas</h2>
      </div>

      {noData ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-400 text-sm">Sin entregas en el período seleccionado.</p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3">
            <KPICard label="Total entregas" value={stats.total} highlight />
            <KPICard
              label="Cobros realizados"
              value={stats.totalCobros}
              sub={stats.total > 0 ? `${Math.round((stats.totalCobros / stats.total) * 100)}% del total` : undefined}
            />
          </div>

          {/* Estado de entrega */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Estado de entrega</h3>
            <div className="space-y-2">
              <EstadoBadge label="Entrega Total" count={stats.entregaTotal} total={stats.total} />
              <EstadoBadge label="Entrega Parcial" count={stats.parcial} total={stats.total} />
              <EstadoBadge label="No Entregado" count={stats.noEntregado} total={stats.total} />
            </div>
          </div>

          {/* Cobros por método */}
          {stats.cobros.length > 0 ? (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Cobros por método de pago
              </h3>
              <div className="space-y-2">
                {stats.cobros.map(({ metodo, count }, i) => (
                  <div
                    key={metodo}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm ${METODO_COLORS[i % METODO_COLORS.length]}`}
                  >
                    <span className="font-medium">{metodo}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Cobros por método de pago
              </h3>
              <p className="text-sm text-gray-400">Sin cobros registrados en el período.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
