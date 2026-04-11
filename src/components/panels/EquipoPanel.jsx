import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { calcVendorComparison, calcWeeklyTrend } from '../../utils/kpiCalculator';

const VENDOR_COLORS = {
  Javier: '#5C1A1A',
  Karen: '#E07B54',
  Daniel: '#4A90D9',
};

const WINE = '#5C1A1A';

// Semaphore colors for conversion rate
function conversionColor(rate) {
  if (rate === null || rate === undefined) return 'text-gray-400';
  if (rate >= 15) return 'text-green-600';
  if (rate >= 8) return 'text-amber-500';
  return 'text-red-600';
}

function SectionTitle({ children }) {
  return (
    <h3 className="text-sm font-bold uppercase tracking-wide mb-3" style={{ color: WINE }}>
      {children}
    </h3>
  );
}

function VendorTable({ vendors, total }) {
  const maxVisitas = Math.max(...vendors.map((v) => v.visitas), 1);

  const rows = [...vendors, { ...total, isTotal: true }];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2 font-semibold text-gray-600">Vendedor</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Visitas</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Nuevos PDV</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Compraron</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Conversión</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Pedidos</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Ticket Prom.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const isTotal = row.isTotal;
            const vendorColor = VENDOR_COLORS[row.nombre];
            const barWidth = isTotal ? 0 : Math.round((row.visitas / maxVisitas) * 100);

            return (
              <tr
                key={row.nombre}
                className={
                  isTotal
                    ? 'bg-gray-100 border-t-2 border-gray-300 font-bold'
                    : idx % 2 === 0
                    ? 'bg-white'
                    : 'bg-red-50'
                }
              >
                {/* Vendedor */}
                <td className="px-3 py-2.5">
                  <span
                    className="font-semibold"
                    style={{ color: vendorColor || (isTotal ? WINE : undefined) }}
                  >
                    {row.nombre}
                  </span>
                </td>

                {/* Visitas + mini progress bar */}
                <td className="px-3 py-2.5">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-bold">{row.visitas}</span>
                    {!isTotal && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: vendorColor || WINE,
                          }}
                        />
                      </div>
                    )}
                  </div>
                </td>

                {/* Nuevos PDV */}
                <td className="px-3 py-2.5 text-center">{row.nuevosPDV}</td>

                {/* Compraron */}
                <td className="px-3 py-2.5 text-center">{row.compraron}</td>

                {/* Conversión — semafórico */}
                <td className={`px-3 py-2.5 text-center font-bold ${conversionColor(row.tasaConversion)}`}>
                  {row.tasaConversion !== null ? `${row.tasaConversion}%` : '—'}
                </td>

                {/* Pedidos */}
                <td className="px-3 py-2.5 text-center">{row.pedidos}</td>

                {/* Ticket promedio */}
                <td className="px-3 py-2.5 text-center text-gray-600">
                  {row.ticketPromedio !== null ? `${row.ticketPromedio} cj.` : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TrendChart({ trendData }) {
  // Build chart data: each entry has label + per-vendor visit count
  const chartData = trendData.map((week) => ({
    name: week.label,
    ...week.porVendedor,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
          formatter={(value, name) => [`${value} visitas`, name]}
        />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        {Object.entries(VENDOR_COLORS).map(([vendor, color]) => (
          <Line
            key={vendor}
            type="monotone"
            dataKey={vendor}
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 4, fill: color }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

function TipoPDVTable({ data, fechaDesde, fechaHasta }) {
  const { VISIT_TYPES, COMPRO_SI } = useMemo(
    () => ({
      VISIT_TYPES: { nuevoPDV: 'Nuevo PDV' },
      COMPRO_SI: 'Sí',
    }),
    []
  );

  const rows = useMemo(() => {
    const filtered = data.filter(
      (r) =>
        r.tipoVisita === VISIT_TYPES.nuevoPDV &&
        r.fecha >= fechaDesde &&
        r.fecha <= fechaHasta
    );
    const map = {};
    filtered.forEach((r) => {
      const tipo = r.tipoPDV || 'Sin datos';
      if (!map[tipo]) map[tipo] = { visitados: 0, compraron: 0 };
      map[tipo].visitados++;
      if (r.compro === COMPRO_SI) map[tipo].compraron++;
    });
    return Object.entries(map)
      .map(([tipo, { visitados, compraron }]) => ({
        tipo,
        visitados,
        compraron,
        tasa: visitados > 0 ? Math.round((compraron / visitados) * 100) : 0,
      }))
      .sort((a, b) => b.tasa - a.tasa);
  }, [data, fechaDesde, fechaHasta, VISIT_TYPES.nuevoPDV, COMPRO_SI]);

  if (rows.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-6">
        Sin datos de tipo de PDV en el período
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-3 py-2 font-semibold text-gray-600">Tipo PDV</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Visitados</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Compraron</th>
            <th className="text-center px-3 py-2 font-semibold text-gray-600">Tasa</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.tipo} className={idx % 2 === 0 ? 'bg-white' : 'bg-red-50'}>
              <td className="px-3 py-2">{row.tipo}</td>
              <td className="px-3 py-2 text-center">{row.visitados}</td>
              <td className="px-3 py-2 text-center">{row.compraron}</td>
              <td className={`px-3 py-2 text-center font-bold ${conversionColor(row.tasa)}`}>
                {row.tasa}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EquipoPanel({ data, fechaDesde, fechaHasta }) {
  const { vendors, total } = useMemo(
    () => calcVendorComparison(data, fechaDesde, fechaHasta),
    [data, fechaDesde, fechaHasta]
  );

  const trendData = useMemo(() => calcWeeklyTrend(data, 4), [data]);

  return (
    <div className="space-y-4">
      {/* Vendor comparison table */}
      <div className="bg-white rounded-lg shadow p-4">
        <SectionTitle>Comparativa de vendedores</SectionTitle>
        <VendorTable vendors={vendors} total={total} />
      </div>

      {/* Weekly trend line chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <SectionTitle>Actividad últimas 4 semanas</SectionTitle>
        <TrendChart trendData={trendData} />
      </div>

      {/* Conversion by PDV type */}
      <div className="bg-white rounded-lg shadow p-4">
        <SectionTitle>Conversión por tipo de PDV</SectionTitle>
        <TipoPDVTable data={data} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
      </div>
    </div>
  );
}
