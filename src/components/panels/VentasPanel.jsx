import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { calcVentasStats } from '../../utils/kpiCalculator';

const WINE = '#5C1A1A';
const ORANGE = '#E07B54';
const RED_DARK = '#7f1d1d';

function SectionTitle({ children }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: WINE }}>
      {children}
    </h3>
  );
}

// --- Conversion Funnel ---
function FunnelBlock({ label, count, pct, color, isFirst }) {
  // Width goes from 100% down — proportional to pct but minimum 20% for readability
  const widthPct = isFirst ? 100 : Math.max(pct, 10);

  return (
    <div className="flex flex-col items-center gap-1 mb-1">
      <div className="w-full flex justify-center">
        <div
          className="rounded flex items-center justify-center py-3 transition-all"
          style={{
            width: `${widthPct}%`,
            backgroundColor: color,
            minWidth: 80,
          }}
        >
          <span className="text-white font-bold text-sm">
            {count} ({pct}%)
          </span>
        </div>
      </div>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
}

function ConversionFunnel({ embudo }) {
  const { visitados, interesados, compraron } = embudo;

  const pctInteresados =
    visitados > 0 ? Math.round((interesados / visitados) * 100) : 0;
  const pctCompraron =
    visitados > 0 ? Math.round((compraron / visitados) * 100) : 0;

  if (visitados === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">
        Sin visitas a nuevos PDV en el período
      </p>
    );
  }

  return (
    <div className="py-2">
      <FunnelBlock
        label="Visitados"
        count={visitados}
        pct={100}
        color="#9ca3af"
        isFirst={true}
      />
      <FunnelBlock
        label="Interesados (Reconfirmar)"
        count={interesados}
        pct={pctInteresados}
        color={ORANGE}
        isFirst={false}
      />
      <FunnelBlock
        label="Compraron"
        count={compraron}
        pct={pctCompraron}
        color={WINE}
        isFirst={false}
      />
    </div>
  );
}

// --- Rejection Reasons Bar Chart ---
const CustomYAxisTick = ({ x, y, payload }) => {
  const text = payload.value;
  const maxChars = 22;
  const display = text.length > maxChars ? text.slice(0, maxChars) + '…' : text;
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="#374151" fontSize={11}>
      {display}
    </text>
  );
};

function RejectionChart({ razonesRechazo }) {
  if (razonesRechazo.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">
        Sin razones de rechazo registradas en el período
      </p>
    );
  }

  // Show in ascending order so longest bar is at top in horizontal chart
  const chartData = [...razonesRechazo].reverse();

  const height = Math.max(chartData.length * 36 + 40, 120);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 20, left: 110, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="razon"
          width={110}
          tick={<CustomYAxisTick />}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value, _name, props) => [
            `${value} PDV`,
            props.payload.razon,
          ]}
        />
        <Bar dataKey="cantidad" radius={[0, 4, 4, 0]}>
          {chartData.map((entry) => (
            <Cell
              key={entry.razon}
              fill={
                entry.razon.toLowerCase().includes('reconfirmar') ? ORANGE : RED_DARK
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Product Ranking Table ---
function ProductRanking({ rankingProductos }) {
  if (rankingProductos.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">
        Sin pedidos en el período
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2 font-semibold text-gray-600">Producto</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Cajas pedidas</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Zona predominante</th>
          </tr>
        </thead>
        <tbody>
          {rankingProductos.map((row, idx) => (
            <tr key={row.producto} className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
              <td className="px-3 py-2 font-medium">{row.producto}</td>
              <td className="px-3 py-2 text-center font-bold" style={{ color: WINE }}>
                {row.cajas}
              </td>
              <td className="px-3 py-2 text-center text-gray-500">{row.zona}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Ticket Promedio KPI ---
function TicketKPI({ ticketPromedio }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="text-center">
        <div className="text-3xl font-black" style={{ color: WINE }}>
          {ticketPromedio !== null ? `${ticketPromedio}` : '—'}
        </div>
        <div className="text-xs text-gray-400 font-medium mt-0.5">
          {ticketPromedio !== null ? 'cajas promedio por pedido' : 'sin pedidos en el período'}
        </div>
      </div>
    </div>
  );
}

export default function VentasPanel({ data, fechaDesde, fechaHasta }) {
  const stats = useMemo(
    () => calcVentasStats(data, fechaDesde, fechaHasta),
    [data, fechaDesde, fechaHasta]
  );

  return (
    <div className="space-y-4">
      {/* Conversion funnel */}
      <div className="bg-white rounded-lg shadow p-4">
        <SectionTitle>Embudo de conversión</SectionTitle>
        <ConversionFunnel embudo={stats.embudo} />
      </div>

      {/* Rejection reasons */}
      <div className="bg-white rounded-lg shadow p-4">
        <SectionTitle>Razones de rechazo</SectionTitle>
        <p className="text-xs text-gray-400 mb-3">
          Naranja = oportunidad (Reconfirmar) · Rojo = rechazo final
        </p>
        <RejectionChart razonesRechazo={stats.razonesRechazo} />
      </div>

      {/* Product ranking + ticket promedio side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white rounded-lg shadow p-4">
          <SectionTitle>Ranking de productos</SectionTitle>
          <ProductRanking rankingProductos={stats.rankingProductos} />
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-center">
          <SectionTitle>Ticket promedio</SectionTitle>
          <TicketKPI ticketPromedio={stats.ticketPromedio} />
        </div>
      </div>
    </div>
  );
}
