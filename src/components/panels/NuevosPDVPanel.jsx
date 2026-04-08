import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { calcNuevosPDVStats } from '../../utils/kpiCalculator';

const WINE = '#5C1A1A';

function KPICard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center text-center min-w-0">
      <span className="text-xs text-gray-500 uppercase tracking-wide mb-1 leading-tight">{label}</span>
      <span className="text-3xl font-bold leading-none" style={{ color: color || WINE }}>
        {value}
      </span>
      {sub && <span className="text-xs text-gray-400 mt-1">{sub}</span>}
    </div>
  );
}

function ConversionBadge({ value }) {
  if (value === null) return <span className="text-gray-400">—</span>;
  const color =
    value >= 50 ? 'text-green-600' : value >= 25 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`font-semibold ${color}`}>{value}%</span>;
}

const BAR_COLORS = ['#7f1d1d', '#991b1b', '#b91c1c', '#dc2626', '#ef4444', '#f87171'];

export default function NuevosPDVPanel({ data, fechaDesde, fechaHasta }) {
  const stats = useMemo(
    () => calcNuevosPDVStats(data, fechaDesde, fechaHasta),
    [data, fechaDesde, fechaHasta]
  );

  const conversionColor =
    stats.tasaConversion === null
      ? '#9ca3af'
      : stats.tasaConversion >= 50
      ? '#16a34a'
      : stats.tasaConversion >= 25
      ? '#ca8a04'
      : '#dc2626';

  return (
    <div className="w-full space-y-4">
      {/* Panel header */}
      <div
        className="rounded-lg px-4 py-3"
        style={{ backgroundColor: WINE }}
      >
        <h2 className="text-white font-bold text-lg tracking-wide">Nuevos PDV</h2>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard
          label="Total visitados"
          value={stats.total}
        />
        <KPICard
          label="Compraron"
          value={stats.compraron}
          sub={stats.noCompraron > 0 ? `${stats.noCompraron} no compraron` : undefined}
          color="#16a34a"
        />
        <KPICard
          label="Tasa de conversión"
          value={stats.tasaConversion !== null ? `${stats.tasaConversion}%` : '—'}
          color={conversionColor}
        />
      </div>

      {/* Bar chart: razones de no compra */}
      {stats.razonesNoCompra.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Razones de no compra</h3>
          <ResponsiveContainer width="100%" height={Math.max(120, stats.razonesNoCompra.length * 40)}>
            <BarChart
              data={stats.razonesNoCompra}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="razon"
                width={160}
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => [value, 'PDV']}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {stats.razonesNoCompra.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Razones de no compra</h3>
          <p className="text-sm text-gray-400">Sin datos para el período seleccionado.</p>
        </div>
      )}

      {/* Conversion table by vendor */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Conversión por vendedor</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b border-gray-100">
              <th className="px-4 py-2 text-left font-semibold">Vendedor</th>
              <th className="px-4 py-2 text-center font-semibold">Visitados</th>
              <th className="px-4 py-2 text-center font-semibold">Compraron</th>
              <th className="px-4 py-2 text-center font-semibold">Conversión</th>
            </tr>
          </thead>
          <tbody>
            {stats.porVendedor.map((row, idx) => (
              <tr
                key={row.vendedor}
                className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50'}
              >
                <td className="px-4 py-2 font-medium text-gray-800">{row.vendedor}</td>
                <td className="px-4 py-2 text-center text-gray-700">{row.total}</td>
                <td className="px-4 py-2 text-center text-gray-700">{row.compraron}</td>
                <td className="px-4 py-2 text-center">
                  <ConversionBadge value={row.tasaConversion} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Distribución por tipo de PDV */}
      {stats.porTipoPDV.length > 0 && !(stats.porTipoPDV.length === 1 && stats.porTipoPDV[0].tipo === 'Sin datos') && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Distribución por tipo de PDV</h3>
          <div className="flex flex-wrap gap-2">
            {stats.porTipoPDV.map((item, i) => (
              <span
                key={item.tipo}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-medium"
                style={{ backgroundColor: BAR_COLORS[i % BAR_COLORS.length] }}
              >
                {item.tipo} ({item.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
